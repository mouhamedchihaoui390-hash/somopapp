/**
 * Standalone catalogue importer — bypasses the /import browser page entirely.
 * Run locally with Node, talks directly to Supabase.
 *
 * Usage:
 *   node scripts/import-catalogue.js "public/uploads/catalogues/catalogue_taxonomie_pro_cleaned_ba59a416.xlsx"
 *
 * Requires: npm install (already done if you've run the project before)
 * Reads Supabase URL/key from .env in the project root.
 */

const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const { createClient } = require('@supabase/supabase-js');

const startTime = Date.now();
const logLines = [];
function log(msg) {
  console.log(msg);
  logLines.push(msg);
}

// ---- Load .env manually (no dotenv dependency needed) ----
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env');
  const content = fs.readFileSync(envPath, 'utf8');
  const env = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    env[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim();
  }
  return env;
}

const env = loadEnv();
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const DEFAULT_FILE = 'public/uploads/catalogues/catalogue_taxonomie_pro_cleaned_ba59a416.xlsx';
const filePath = process.argv[2] || DEFAULT_FILE;
if (!fs.existsSync(filePath)) {
  console.error(`File not found: ${filePath}`);
  console.error('Usage: node scripts/import-catalogue.js [path-to-xlsx]');
  process.exit(1);
}

function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function clean(v) {
  const s = String(v ?? '').trim();
  return s === '' ? null : s;
}

function num(v) {
  if (v === '' || v == null) return null;
  const n = typeof v === 'number' ? v : parseFloat(String(v).replace(/[^\d.-]/g, ''));
  return isNaN(n) ? null : n;
}

async function upsertByName(table, names, extra = {}) {
  const unique = [...new Set(names.filter(Boolean))];
  if (unique.length === 0) return new Map();
  const rows = unique.map((name) => ({ name, ...extra }));
  const { error } = await supabase.from(table).upsert(rows, { onConflict: 'name', ignoreDuplicates: true });
  if (error) console.error(`upsert ${table} error:`, error.message);
  const { data, error: selErr } = await supabase.from(table).select('id, name').in('name', unique);
  if (selErr) console.error(`select ${table} error:`, selErr.message);
  const map = new Map();
  for (const row of data || []) map.set(row.name, row.id);
  return map;
}

async function main() {
  console.log('Reading', filePath);
  const wb = XLSX.readFile(filePath);
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
  console.log(`Found ${rows.length} rows`);

  // ---- 1. Warehouse (use first existing, or create one) ----
  let { data: warehouses } = await supabase.from('warehouses').select('id, name').limit(1);
  let warehouseId;
  if (warehouses && warehouses.length) {
    warehouseId = warehouses[0].id;
  } else {
    const { data: newWh, error } = await supabase
      .from('warehouses')
      .insert({ name: 'Main Warehouse', code: 'WH01' })
      .select('id')
      .single();
    if (error) throw error;
    warehouseId = newWh.id;
  }
  console.log('Using warehouse', warehouseId);

  // ---- 2. Categories ----
  const categoryNames = rows.map((r) => clean(r['Catégorie'])).filter(Boolean);
  const categoryMap = await upsertByName('categories', categoryNames);
  console.log(`Categories ready: ${categoryMap.size}`);

  // ---- 3. Subcategories (need category_id + name, unique per category) ----
  const subcatPairs = new Map(); // key: `${category}|||${subcat}` -> {category, subcat}
  for (const r of rows) {
    const cat = clean(r['Catégorie']);
    const sub = clean(r['Sous-catégorie']);
    if (cat && sub) subcatPairs.set(`${cat}|||${sub}`, { cat, sub });
  }
  const subcatRows = [...subcatPairs.values()]
    .map(({ cat, sub }) => {
      const category_id = categoryMap.get(cat);
      if (!category_id) return null;
      return { category_id, name: sub };
    })
    .filter(Boolean);
  const subcategoryMap = new Map(); // key: `${category_id}|||${name}` -> id
  for (const batch of chunk(subcatRows, 500)) {
    const { error } = await supabase.from('subcategories').upsert(batch, { onConflict: 'category_id,name', ignoreDuplicates: true });
    if (error) console.error('upsert subcategories error:', error.message);
  }
  {
    const catIds = [...new Set(subcatRows.map((r) => r.category_id))];
    if (catIds.length) {
      const { data } = await supabase.from('subcategories').select('id, name, category_id').in('category_id', catIds);
      for (const row of data || []) subcategoryMap.set(`${row.category_id}|||${row.name}`, row.id);
    }
  }
  console.log(`Subcategories ready: ${subcategoryMap.size}`);

  // ---- 4. Brands ----
  const brandNames = rows.map((r) => clean(r['Marque du produit'])).filter(Boolean);
  const brandMap = await upsertByName('brands', brandNames);
  console.log(`Brands ready: ${brandMap.size}`);

  // ---- 5. Vehicle makes (split comma-separated lists like "Audi, Volkswagen") ----
  const allMakes = new Set();
  for (const r of rows) {
    const raw = clean(r['Marque constructeur']);
    if (!raw) continue;
    raw.split(',').map((s) => s.trim()).filter(Boolean).forEach((m) => allMakes.add(m));
  }
  const makeMap = await upsertByName('vehicle_makes', [...allMakes]);
  console.log(`Vehicle makes ready: ${makeMap.size}`);

  // ---- 6. Vehicle models (per make + model name, unique per make) ----
  const modelPairs = new Map(); // key: `${make}|||${model}` -> {make, model}
  for (const r of rows) {
    const rawMakes = clean(r['Marque constructeur']);
    const model = clean(r['Modèle(s)']);
    if (!rawMakes || !model) continue;
    for (const make of rawMakes.split(',').map((s) => s.trim()).filter(Boolean)) {
      modelPairs.set(`${make}|||${model}`, { make, model });
    }
  }
  const modelRows = [...modelPairs.values()]
    .map(({ make, model }) => {
      const make_id = makeMap.get(make);
      if (!make_id) return null;
      return { make_id, name: model };
    })
    .filter(Boolean);
  const modelMap = new Map(); // key: `${make_id}|||${name}` -> id
  for (const batch of chunk(modelRows, 500)) {
    const { error } = await supabase.from('vehicle_models').upsert(batch, { onConflict: 'make_id,name', ignoreDuplicates: true });
    if (error) console.error('upsert vehicle_models error:', error.message);
  }
  {
    const makeIds = [...new Set(modelRows.map((r) => r.make_id))];
    if (makeIds.length) {
      const { data } = await supabase.from('vehicle_models').select('id, name, make_id').in('make_id', makeIds);
      for (const row of data || []) modelMap.set(`${row.make_id}|||${row.name}`, row.id);
    }
  }
  console.log(`Vehicle models ready: ${modelMap.size}`);

  // ---- 7. Products (upsert on sku so the script is safe to re-run) ----
  const productRows = rows.map((r) => {
    const cat = clean(r['Catégorie']);
    const sub = clean(r['Sous-catégorie']);
    const brand = clean(r['Marque du produit']);
    const category_id = cat ? categoryMap.get(cat) || null : null;
    const subcategory_id = cat && sub ? subcategoryMap.get(`${category_id}|||${sub}`) || null : null;
    const brand_id = brand ? brandMap.get(brand) || null : null;
    const sku = clean(r['Code']);
    return {
      name: clean(r['Désignation']) || 'Produit sans nom',
      description: clean(r['Description']),
      category_id,
      subcategory_id,
      brand_id,
      sku,
      reference: sku,
      image_url: clean(r['image url']),
      selling_price: num(r['Prix TTC (TND)']) || 0,
      status: 'active',
      _stock: num(r['Stock']) || 0, // not a real column, used below for inventory
      _makes: clean(r['Marque constructeur']),
      _model: clean(r['Modèle(s)']),
    };
  });

  // Dedupe by sku: the source lists the same physical part once per compatible
  // vehicle, so multiple rows can share a sku with identical price/stock/description.
  // Keep the first occurrence's data for the product+inventory row itself; all
  // rows (deduped or not) are still used later for compatibility links.
  const uniqueProductsBySku = new Map();
  for (const p of productRows) {
    if (!p.sku) continue; // skip rows with no code entirely (can't upsert safely)
    if (!uniqueProductsBySku.has(p.sku)) uniqueProductsBySku.set(p.sku, p);
  }
  const dedupedProducts = [...uniqueProductsBySku.values()];
  log(`Deduped ${productRows.length} rows -> ${dedupedProducts.length} unique SKUs`);
  const skippedNoCode = productRows.filter((p) => !p.sku).length;

  // Find out which SKUs already exist, so we can report created vs updated
  const allSkus = dedupedProducts.map((p) => p.sku);
  const existingSkuSet = new Set();
  for (const batch of chunk(allSkus, 500)) {
    const { data } = await supabase.from('products').select('sku').in('sku', batch);
    for (const row of data || []) existingSkuSet.add(row.sku);
  }
  let createdCount = 0;
  let updatedCount = 0;
  let errorCount = 0;

  const productIdBySku = new Map();
  let inserted = 0;
  for (const batch of chunk(dedupedProducts, 300)) {
    const cleanBatch = batch.map(({ _stock, _makes, _model, ...rest }) => rest);
    const { data, error } = await supabase
      .from('products')
      .upsert(cleanBatch, { onConflict: 'sku', ignoreDuplicates: false })
      .select('id, sku');
    if (error) {
      log(`product batch error: ${error.message}`);
      errorCount += batch.length;
      continue;
    }
    for (const row of data || []) {
      if (row.sku) productIdBySku.set(row.sku, row.id);
      if (existingSkuSet.has(row.sku)) updatedCount++;
      else createdCount++;
    }
    inserted += batch.length;
    log(`Products processed: ${inserted}/${dedupedProducts.length}`);
  }

  // ---- 8. Inventory (one row per unique product in the default warehouse) ----
  const inventoryRows = [];
  for (const p of dedupedProducts) {
    const productId = p.sku ? productIdBySku.get(p.sku) : null;
    if (!productId) continue;
    inventoryRows.push({ product_id: productId, warehouse_id: warehouseId, quantity: p._stock || 0 });
  }
  let invDone = 0;
  for (const batch of chunk(inventoryRows, 500)) {
    const { error } = await supabase.from('inventory').upsert(batch, { onConflict: 'product_id,warehouse_id', ignoreDuplicates: false });
    if (error) log(`inventory batch error: ${error.message}`);
    invDone += batch.length;
    log(`Inventory processed: ${invDone}/${inventoryRows.length}`);
  }

  // ---- 9. Compatibility (product <-> vehicle make/model) ----
  const compatRows = [];
  for (const p of productRows) {
    const productId = p.sku ? productIdBySku.get(p.sku) : null;
    if (!productId || !p._makes || !p._model) continue;
    for (const make of p._makes.split(',').map((s) => s.trim()).filter(Boolean)) {
      const make_id = makeMap.get(make);
      if (!make_id) continue;
      const vehicle_model_id = modelMap.get(`${make_id}|||${p._model}`) || null;
      compatRows.push({ product_id: productId, vehicle_make_id: make_id, vehicle_model_id });
    }
  }
  let compatDone = 0;
  for (const batch of chunk(compatRows, 500)) {
    const { error } = await supabase.from('compatibility').insert(batch);
    if (error) log(`compatibility batch error: ${error.message}`);
    compatDone += batch.length;
    log(`Compatibility processed: ${compatDone}/${compatRows.length}`);
  }

  const durationSec = ((Date.now() - startTime) / 1000).toFixed(1);
  log('\n--- Import summary ---');
  log(`Created: ${createdCount}`);
  log(`Updated: ${updatedCount}`);
  log(`Skipped (no code/SKU): ${skippedNoCode}`);
  log(`Errors: ${errorCount}`);
  log(`Inventory rows: ${inventoryRows.length}`);
  log(`Compatibility links: ${compatRows.length}`);
  log(`Duration: ${durationSec}s`);

  const logsDir = path.join(__dirname, '..', 'logs');
  if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir);
  const logPath = path.join(logsDir, 'import-log.txt');
  const header = `Import run: ${new Date().toISOString()}\nFile: ${filePath}\n\n`;
  fs.writeFileSync(logPath, header + logLines.join('\n') + '\n');
  console.log(`\nFull log written to logs/import-log.txt`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  try {
    const logsDir = path.join(__dirname, '..', 'logs');
    if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir);
    fs.writeFileSync(path.join(logsDir, 'import-log.txt'), logLines.join('\n') + `\n\nFATAL ERROR: ${err.stack || err}\n`);
  } catch (_) {}
  process.exit(1);
});
