import { supabase } from '@/lib/supabase';
import type {
  Product, Category, Brand, Warehouse, Inventory, StockMovement,
  Customer, Supplier, PurchaseOrder, SalesOrder, VinRequest, Notification,
  ActivityLog, VehicleMake, VehicleModel, VehicleGeneration, Engine,
  FuelType, Transmission, Compatibility,
} from '@/types/database';

const PAGE_SIZE = 25;

export async function getDashboardStats() {
  const [products, lowStock, outOfStock, customers, suppliers, vinPending, orders] = await Promise.all([
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase.from('inventory').select('product_id, quantity, reserved', { count: 'exact' }).lt('quantity', 5),
    supabase.from('inventory').select('product_id', { count: 'exact', head: true }).eq('quantity', 0),
    supabase.from('customers').select('*', { count: 'exact', head: true }),
    supabase.from('suppliers').select('*', { count: 'exact', head: true }),
    supabase.from('vin_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('sales_orders').select('*', { count: 'exact', head: true }).neq('status', 'cancelled'),
  ]);

  const { data: inventoryValue } = await supabase
    .from('inventory')
    .select('quantity, product:products(purchase_price)');

  const totalInventoryValue = (inventoryValue || []).reduce((sum: number, row: any) => {
    return sum + (row.quantity * (row.product?.purchase_price || 0));
  }, 0);

  return {
    productCount: products.count || 0,
    lowStockCount: lowStock.count || 0,
    outOfStockCount: outOfStock.count || 0,
    customerCount: customers.count || 0,
    supplierCount: suppliers.count || 0,
    vinPendingCount: vinPending.count || 0,
    orderCount: orders.count || 0,
    inventoryValue: totalInventoryValue,
  };
}

export async function getRecentActivity(limit = 10) {
  const { data, error } = await supabase
    .from('activity_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data as ActivityLog[];
}

export async function getNotifications() {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20);
  if (error) throw error;
  return data as Notification[];
}

export async function markNotificationRead(id: string) {
  const { error } = await supabase.from('notifications').update({ read: true }).eq('id', id);
  if (error) throw error;
}

export async function searchProducts(query: string, page = 0) {
  const from = page * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  let q = supabase
    .from('products')
    .select('*, category:categories(*), subcategory:subcategories(*), brand:brands(*)', { count: 'exact' })
    .range(from, to)
    .order('name');

  if (query.trim()) {
    q = q.or(`name.ilike.%${query}%,oem.ilike.%${query}%,barcode.ilike.%${query}%,reference.ilike.%${query}%,sku.ilike.%${query}%`);
  }
  const { data, error, count } = await q;
  if (error) throw error;
  return { data: data as any[], count: count || 0 };
}

export async function getProduct(id: string) {
  const { data, error } = await supabase
    .from('products')
    .select('*, category:categories(*), subcategory:subcategories(*), brand:brands(*)')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data as any;
}

export async function getProductInventory(productId: string) {
  const { data, error } = await supabase
    .from('inventory')
    .select('*, warehouse:warehouses(*)')
    .eq('product_id', productId);
  if (error) throw error;
  return data as any[];
}

export async function getProductCompatibility(productId: string) {
  const { data, error } = await supabase
    .from('compatibility')
    .select('*, make:vehicle_makes(name), model:vehicle_models(name), generation:vehicle_generations(name), engine:engines(name)')
    .eq('product_id', productId);
  if (error) throw error;
  return data as any[];
}

export async function getCategories() {
  const { data, error } = await supabase.from('categories').select('*').order('name');
  if (error) throw error;
  return data as Category[];
}

export async function getBrands() {
  const { data, error } = await supabase.from('brands').select('*').order('name');
  if (error) throw error;
  return data as Brand[];
}

export async function getWarehouses() {
  const { data, error } = await supabase.from('warehouses').select('*').order('name');
  if (error) throw error;
  return data as Warehouse[];
}

export async function getInventory(page = 0) {
  const from = page * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  const { data, error } = await supabase
    .from('inventory')
    .select('*, product:products(id,name,oem,sku,image_url,selling_price), warehouse:warehouses(*)', { count: 'exact' })
    .range(from, to)
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return { data: data as any[], count: 0 };
}

export async function getStockMovements(productId?: string, page = 0) {
  const from = page * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  let q = supabase
    .from('stock_movements')
    .select('*, product:products(id,name,oem), warehouse:warehouses(name)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);
  if (productId) q = q.eq('product_id', productId);
  const { data, error } = await q;
  if (error) throw error;
  return data as any[];
}

export async function recordStockMovement(input: {
  product_id: string;
  warehouse_id: string;
  movement_type: string;
  quantity: number;
  reference?: string;
  notes?: string;
}) {
  const { data: inv } = await supabase
    .from('inventory')
    .select('id, quantity')
    .eq('product_id', input.product_id)
    .eq('warehouse_id', input.warehouse_id)
    .maybeSingle();

  const delta = input.movement_type === 'out' || input.movement_type === 'reservation' || input.movement_type === 'damage'
    ? -Math.abs(input.quantity)
    : Math.abs(input.quantity);

  if (inv) {
    const newQty = Math.max(0, (inv.quantity || 0) + delta);
    const { error } = await supabase
      .from('inventory')
      .update({ quantity: newQty })
      .eq('id', inv.id);
    if (error) throw error;
  } else if (delta > 0) {
    const { error } = await supabase
      .from('inventory')
      .insert({ product_id: input.product_id, warehouse_id: input.warehouse_id, quantity: delta });
    if (error) throw error;
  }

  const { error: mvError } = await supabase.from('stock_movements').insert({
    product_id: input.product_id,
    warehouse_id: input.warehouse_id,
    movement_type: input.movement_type,
    quantity: Math.abs(input.quantity),
    reference: input.reference || null,
    notes: input.notes || null,
  });
  if (mvError) throw mvError;

  await supabase.from('activity_logs').insert({
    action: 'stock_movement',
    entity: 'inventory',
    entity_id: input.product_id,
    detail: `${input.movement_type} ${input.quantity} units`,
  });
}

export async function getCustomers(page = 0) {
  const from = page * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  const { data, error } = await supabase
    .from('customers')
    .select('*', { count: 'exact' })
    .order('name')
    .range(from, to);
  if (error) throw error;
  return { data: data as Customer[], count: 0 };
}

export async function getSuppliers(page = 0) {
  const from = page * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  const { data, error } = await supabase
    .from('suppliers')
    .select('*', { count: 'exact' })
    .order('name')
    .range(from, to);
  if (error) throw error;
  return { data: data as Supplier[], count: 0 };
}

export async function getPurchaseOrders(page = 0) {
  const from = page * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  const { data, error } = await supabase
    .from('purchase_orders')
    .select('*, supplier:suppliers(name), warehouse:warehouses(name)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);
  if (error) throw error;
  return { data: data as any[], count: 0 };
}

export async function getSalesOrders(page = 0) {
  const from = page * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  const { data, error } = await supabase
    .from('sales_orders')
    .select('*, customer:customers(name)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);
  if (error) throw error;
  return { data: data as any[], count: 0 };
}

export async function getVinRequests(page = 0) {
  const from = page * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  const { data, error } = await supabase
    .from('vin_requests')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);
  if (error) throw error;
  return { data: data as VinRequest[], count: 0 };
}

export async function createVinRequest(input: Partial<VinRequest>) {
  const { data, error } = await supabase.from('vin_requests').insert(input).select().single();
  if (error) throw error;
  await supabase.from('notifications').insert({
    type: 'vin_request',
    title: 'New VIN Request',
    body: `VIN: ${input.vin || 'N/A'}`,
    link: '/vin-requests',
  });
  return data as VinRequest;
}

export async function updateVinRequest(id: string, updates: Partial<VinRequest>) {
  const { data, error } = await supabase.from('vin_requests').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data as VinRequest;
}

export async function getVehicleMakes() {
  const { data, error } = await supabase.from('vehicle_makes').select('*').order('name');
  if (error) throw error;
  return data as VehicleMake[];
}

export async function getVehicleModels(makeId?: string) {
  let q = supabase.from('vehicle_models').select('*').order('name');
  if (makeId) q = q.eq('make_id', makeId);
  const { data, error } = await q;
  if (error) throw error;
  return data as VehicleModel[];
}

export async function getVehicleGenerations(modelId?: string) {
  let q = supabase.from('vehicle_generations').select('*').order('name');
  if (modelId) q = q.eq('model_id', modelId);
  const { data, error } = await q;
  if (error) throw error;
  return data as VehicleGeneration[];
}

export async function getEngines(generationId?: string) {
  let q = supabase.from('engines').select('*, fuel_type:fuel_types(name), transmission:transmissions(name)').order('name');
  if (generationId) q = q.eq('generation_id', generationId);
  const { data, error } = await q;
  if (error) throw error;
  return data as any[];
}

export async function getFuelTypes() {
  const { data, error } = await supabase.from('fuel_types').select('*').order('name');
  if (error) throw error;
  return data as FuelType[];
}

export async function getTransmissions() {
  const { data, error } = await supabase.from('transmissions').select('*').order('name');
  if (error) throw error;
  return data as Transmission[];
}

export async function getSalesChartData() {
  const { data, error } = await supabase
    .from('sales_orders')
    .select('total, order_date, status')
    .gte('order_date', new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10))
    .order('order_date');
  if (error) throw error;
  return data as any[];
}

export async function getInventoryByCategory() {
  const { data, error } = await supabase
    .from('inventory')
    .select('quantity, product:products(category:categories(name))');
  if (error) throw error;
  const byCat: Record<string, number> = {};
  for (const row of data || []) {
    const catName = (row as any).product?.category?.name || 'Uncategorized';
    byCat[catName] = (byCat[catName] || 0) + (row as any).quantity;
  }
  return Object.entries(byCat).map(([name, value]) => ({ name, value }));
}

export async function logActivity(action: string, entity: string, detail: string) {
  await supabase.from('activity_logs').insert({ action, entity, detail });
}
