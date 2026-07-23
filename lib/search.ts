import { supabase } from '@/lib/supabase';

export type SearchResult = {
  products: any[];
  categories: any[];
  brands: any[];
  vehicleModels: any[];
  total: number;
};

export type SearchFilters = {
  query?: string;
  categoryId?: string | null;
  subcategoryId?: string | null;
  brandId?: string | null;
  vehicleMakeId?: string | null;
  vehicleModelId?: string | null;
  vehicleGenerationId?: string | null;
  engineId?: string | null;
  fuelTypeId?: string | null;
  transmissionId?: string | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  inStockOnly?: boolean;
  sortBy?: 'name' | 'price_asc' | 'price_desc' | 'newest';
};

const PAGE_SIZE = 24;

function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function buildSearchTerms(query: string): string[] {
  const normalized = normalize(query);
  const terms = normalized.split(/\s+/).filter((t) => t.length >= 2);
  return terms;
}

export async function smartSearchProducts(
  filters: SearchFilters,
  page: number = 0
): Promise<{ data: any[]; count: number }> {
  const from = page * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from('products')
    .select(
      '*, category:categories(*), subcategory:subcategories(*), brand:brands(*)',
      { count: 'exact' }
    )
    .range(from, to);

  const q = filters.query?.trim();
  if (q) {
    const terms = buildSearchTerms(q);
    if (terms.length > 0) {
      const orParts = terms.flatMap((term) => [
        `name.ilike.%${term}%`,
        `oem.ilike.%${term}%`,
        `reference.ilike.%${term}%`,
        `barcode.ilike.%${term}%`,
        `sku.ilike.%${term}%`,
        `description.ilike.%${term}%`,
      ]);
      query = query.or(orParts.join(','));
    }
  }

  if (filters.categoryId) query = query.eq('category_id', filters.categoryId);
  if (filters.subcategoryId) query = query.eq('subcategory_id', filters.subcategoryId);
  if (filters.brandId) query = query.eq('brand_id', filters.brandId);
  if (filters.minPrice != null) query = query.gte('selling_price', filters.minPrice);
  if (filters.maxPrice != null) query = query.lte('selling_price', filters.maxPrice);
  if (filters.inStockOnly) query = query.eq('status', 'active');

  switch (filters.sortBy) {
    case 'price_asc':
      query = query.order('selling_price', { ascending: true });
      break;
    case 'price_desc':
      query = query.order('selling_price', { ascending: false });
      break;
    case 'newest':
      query = query.order('created_at', { ascending: false });
      break;
    default:
      query = query.order('name');
  }

  const { data, error, count } = await query;
  if (error) {
    console.error('Search error:', error);
    return { data: [], count: 0 };
  }

  let results = data || [];

  if (filters.vehicleMakeId || filters.vehicleModelId || filters.vehicleGenerationId || filters.engineId) {
    let compatQuery = supabase.from('compatibility').select('product_id');
    if (filters.vehicleMakeId) compatQuery = compatQuery.eq('vehicle_make_id', filters.vehicleMakeId);
    if (filters.vehicleModelId) compatQuery = compatQuery.eq('vehicle_model_id', filters.vehicleModelId);
    if (filters.vehicleGenerationId) compatQuery = compatQuery.eq('vehicle_generation_id', filters.vehicleGenerationId);
    if (filters.engineId) compatQuery = compatQuery.eq('engine_id', filters.engineId);

    const { data: compatData } = await compatQuery;
    if (compatData && compatData.length > 0) {
      const productIds = [...new Set(compatData.map((c) => c.product_id))];
      results = results.filter((p) => productIds.includes(p.id));
    } else {
      results = [];
    }
  }

  return { data: results, count: count || 0 };
}

export async function instantSearch(query: string): Promise<SearchResult> {
  const normalized = normalize(query);
  if (normalized.length < 2) {
    return { products: [], categories: [], brands: [], vehicleModels: [], total: 0 };
  }

  const terms = normalized.split(/\s+/).filter((t) => t.length >= 2);
  const orParts = terms.flatMap((term) => [
    `name.ilike.%${term}%`,
    `oem.ilike.%${term}%`,
    `reference.ilike.%${term}%`,
    `barcode.ilike.%${term}%`,
    `sku.ilike.%${term}%`,
  ]);

  const [productsRes, categoriesRes, brandsRes, modelsRes] = await Promise.all([
    supabase
      .from('products')
      .select('id,name,oem,sku,barcode,image_url,selling_price,reference')
      .or(orParts.join(','))
      .limit(8),
    supabase
      .from('categories')
      .select('id,name,slug')
      .or(`name.ilike.%${normalized}%`)
      .limit(5),
    supabase
      .from('brands')
      .select('id,name')
      .or(`name.ilike.%${normalized}%`)
      .limit(5),
    supabase
      .from('vehicle_models')
      .select('id,name,make:vehicle_makes(name)')
      .or(`name.ilike.%${normalized}%`)
      .limit(5),
  ]);

  return {
    products: productsRes.data || [],
    categories: categoriesRes.data || [],
    brands: brandsRes.data || [],
    vehicleModels: modelsRes.data || [],
    total: (productsRes.data || []).length,
  };
}

export function highlightMatch(text: string, query: string): string {
  if (!query.trim()) return text;
  const normalized = normalize(query);
  const terms = normalized.split(/\s+/).filter((t) => t.length >= 2);
  let result = text;
  for (const term of terms) {
    const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    result = result.replace(regex, '<mark>$1</mark>');
  }
  return result;
}

const RECENT_SEARCHES_KEY = 'recent_searches';
const MAX_RECENT = 10;

export function getRecentSearches(): string[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function addRecentSearch(query: string): void {
  if (typeof localStorage === 'undefined') return;
  const trimmed = query.trim();
  if (!trimmed) return;
  try {
    const existing = getRecentSearches();
    const filtered = existing.filter((s) => s.toLowerCase() !== trimmed.toLowerCase());
    filtered.unshift(trimmed);
    const updated = filtered.slice(0, MAX_RECENT);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }
}

export function clearRecentSearches(): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  } catch {
    // ignore
  }
}

export { PAGE_SIZE };
