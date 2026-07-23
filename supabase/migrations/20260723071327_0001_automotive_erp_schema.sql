/*
# Automotive ERP — Core Schema

## Overview
Normalized PostgreSQL schema for an automotive spare-parts ERP:
taxonomy, vehicle hierarchy, products, inventory, partners, orders, VIN
requests, stock movements, notifications, activity logs, settings.

SINGLE-TENANT app (no sign-in). All policies `TO anon, authenticated`
with `USING (true)` — data is intentionally shared.

## New Tables
categories, subcategories, brands, vehicle_makes, vehicle_models,
vehicle_generations, engines, fuel_types, transmissions, warehouses,
products, product_images, compatibility, inventory, stock_movements,
customers, customer_vehicles, suppliers, purchase_orders, purchase_items,
sales_orders, sales_items, vin_requests, notifications, activity_logs,
settings.

## Security
RLS on every table; shared-data policies (anon+authenticated).
stock_movements is insert+select only (ledger).
*/

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

-- Taxonomy
CREATE TABLE IF NOT EXISTS public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL, slug text UNIQUE, description text,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.subcategories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  name text NOT NULL, slug text, description text,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_subcat_category_name ON public.subcategories(category_id, name);
CREATE TABLE IF NOT EXISTS public.brands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE, description text, logo_url text,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);

-- Vehicle hierarchy
CREATE TABLE IF NOT EXISTS public.vehicle_makes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.vehicle_models (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  make_id uuid NOT NULL REFERENCES public.vehicle_makes(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_model_make_name ON public.vehicle_models(make_id, name);
CREATE TABLE IF NOT EXISTS public.vehicle_generations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id uuid NOT NULL REFERENCES public.vehicle_models(id) ON DELETE CASCADE,
  name text NOT NULL, year_start int, year_end int,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_gen_model_name ON public.vehicle_generations(model_id, name);
CREATE TABLE IF NOT EXISTS public.fuel_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.transmissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.engines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  generation_id uuid NOT NULL REFERENCES public.vehicle_generations(id) ON DELETE CASCADE,
  name text NOT NULL,
  fuel_type_id uuid REFERENCES public.fuel_types(id) ON DELETE SET NULL,
  transmission_id uuid REFERENCES public.transmissions(id) ON DELETE SET NULL,
  displacement text, power_kw int, power_hp int, year_start int, year_end int,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_engine_gen_name ON public.engines(generation_id, name);

-- Warehouses
CREATE TABLE IF NOT EXISTS public.warehouses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL, code text UNIQUE, address text, phone text,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);

-- Products
CREATE TABLE IF NOT EXISTS public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL, description text,
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  subcategory_id uuid REFERENCES public.subcategories(id) ON DELETE SET NULL,
  brand_id uuid REFERENCES public.brands(id) ON DELETE SET NULL,
  sku text, oem text, reference text, barcode text, image_url text,
  weight numeric(10,2), length numeric(10,2), width numeric(10,2), height numeric(10,2),
  purchase_price numeric(12,2) DEFAULT 0, selling_price numeric(12,2) DEFAULT 0,
  tax_rate numeric(5,2) DEFAULT 0, min_stock int DEFAULT 0, max_stock int DEFAULT 0,
  status text DEFAULT 'active', tags text[], notes text, search_vector tsvector,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_products_oem ON public.products(oem) WHERE oem IS NOT NULL AND oem <> '';
CREATE UNIQUE INDEX IF NOT EXISTS uq_products_barcode ON public.products(barcode) WHERE barcode IS NOT NULL AND barcode <> '';
CREATE UNIQUE INDEX IF NOT EXISTS uq_products_sku ON public.products(sku) WHERE sku IS NOT NULL AND sku <> '';
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_brand ON public.products(brand_id);
CREATE INDEX IF NOT EXISTS idx_products_name_trgm ON public.products USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_products_search ON public.products USING gin (search_vector);

CREATE OR REPLACE FUNCTION public.products_search_vector()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('simple', coalesce(NEW.name, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(NEW.oem, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(NEW.reference, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(NEW.barcode, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(NEW.sku, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(NEW.description, '')), 'C');
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_products_search ON public.products;
CREATE TRIGGER trg_products_search
BEFORE INSERT OR UPDATE ON public.products
FOR EACH ROW EXECUTE FUNCTION public.products_search_vector();

CREATE TABLE IF NOT EXISTS public.product_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  url text NOT NULL, alt text, position int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_product_images_product ON public.product_images(product_id);

-- Compatibility
CREATE TABLE IF NOT EXISTS public.compatibility (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  engine_id uuid REFERENCES public.engines(id) ON DELETE CASCADE,
  vehicle_make_id uuid REFERENCES public.vehicle_makes(id) ON DELETE CASCADE,
  vehicle_model_id uuid REFERENCES public.vehicle_models(id) ON DELETE CASCADE,
  vehicle_generation_id uuid REFERENCES public.vehicle_generations(id) ON DELETE CASCADE,
  year_start int, year_end int, notes text,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_compat_product ON public.compatibility(product_id);
CREATE INDEX IF NOT EXISTS idx_compat_engine ON public.compatibility(engine_id);
CREATE INDEX IF NOT EXISTS idx_compat_model ON public.compatibility(vehicle_model_id);

-- Inventory + movements
CREATE TABLE IF NOT EXISTS public.inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  warehouse_id uuid NOT NULL REFERENCES public.warehouses(id) ON DELETE CASCADE,
  quantity int NOT NULL DEFAULT 0, reserved int NOT NULL DEFAULT 0,
  incoming int NOT NULL DEFAULT 0, damaged int NOT NULL DEFAULT 0,
  shelf text, location text,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_inventory_product_warehouse ON public.inventory(product_id, warehouse_id);

CREATE TABLE IF NOT EXISTS public.stock_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  warehouse_id uuid NOT NULL REFERENCES public.warehouses(id) ON DELETE CASCADE,
  movement_type text NOT NULL, quantity int NOT NULL,
  reference text, notes text,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_movements_product ON public.stock_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_movements_created ON public.stock_movements(created_at DESC);

-- Partners
CREATE TABLE IF NOT EXISTS public.customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL, email text, phone text, address text, city text, country text,
  tax_id text, notes text,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_customers_name ON public.customers(name);
CREATE TABLE IF NOT EXISTS public.customer_vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  plate text, vin text, make text, model text, generation text, year int, engine text,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_cust_vehicles_customer ON public.customer_vehicles(customer_id);
CREATE TABLE IF NOT EXISTS public.suppliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL, email text, phone text, address text, city text, country text,
  tax_id text, contact_person text, notes text,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_suppliers_name ON public.suppliers(name);

-- Orders
CREATE TABLE IF NOT EXISTS public.purchase_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id uuid NOT NULL REFERENCES public.suppliers(id) ON DELETE CASCADE,
  warehouse_id uuid REFERENCES public.warehouses(id) ON DELETE SET NULL,
  order_number text UNIQUE, status text DEFAULT 'draft', total numeric(14,2) DEFAULT 0,
  order_date date DEFAULT current_date, expected_date date, notes text,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.purchase_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  quantity int NOT NULL DEFAULT 1, unit_cost numeric(12,2) DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_purchase_items_order ON public.purchase_items(order_id);
CREATE TABLE IF NOT EXISTS public.sales_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  order_number text UNIQUE, status text DEFAULT 'draft', total numeric(14,2) DEFAULT 0,
  order_date date DEFAULT current_date, notes text,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.sales_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.sales_orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  quantity int NOT NULL DEFAULT 1, unit_price numeric(12,2) DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_sales_items_order ON public.sales_items(order_id);

-- VIN requests
CREATE TABLE IF NOT EXISTS public.vin_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES public.customers(id) ON DELETE SET NULL,
  vin text, customer_name text, customer_email text, vehicle_info text,
  requested_products text, comments text, status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_vin_status ON public.vin_requests(status);

-- Notifications + activity logs + settings
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL, title text NOT NULL, body text, link text, read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read, created_at DESC);
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action text NOT NULL, entity text, entity_id uuid, detail text,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_activity_created ON public.activity_logs(created_at DESC);
CREATE TABLE IF NOT EXISTS public.settings (
  key text PRIMARY KEY, value text, updated_at timestamptz DEFAULT now()
);

-- updated_at triggers
DO $$
DECLARE t text;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'categories','subcategories','brands','vehicle_makes','vehicle_models',
    'vehicle_generations','fuel_types','transmissions','engines','warehouses',
    'products','inventory','customers','customer_vehicles','suppliers',
    'purchase_orders','sales_orders','vin_requests'
  ]) LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS trg_%s_updated ON public.%I; CREATE TRIGGER trg_%s_updated BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();',
      t, t, t, t);
  END LOOP;
END $$;

-- RLS + policies (shared single-tenant)
DO $$
DECLARE t text;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'categories','subcategories','brands','vehicle_makes','vehicle_models',
    'vehicle_generations','fuel_types','transmissions','engines','warehouses',
    'products','product_images','compatibility','inventory','stock_movements',
    'customers','customer_vehicles','suppliers','purchase_orders','purchase_items',
    'sales_orders','sales_items','vin_requests','notifications','activity_logs','settings'
  ]) LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', t);
    EXECUTE format('DROP POLICY IF EXISTS "anon_select_%s" ON public.%I;', t, t);
    EXECUTE format('CREATE POLICY "anon_select_%s" ON public.%I FOR SELECT TO anon, authenticated USING (true);', t, t);
    EXECUTE format('DROP POLICY IF EXISTS "anon_insert_%s" ON public.%I;', t, t);
    EXECUTE format('CREATE POLICY "anon_insert_%s" ON public.%I FOR INSERT TO anon, authenticated WITH CHECK (true);', t, t);
    EXECUTE format('DROP POLICY IF EXISTS "anon_update_%s" ON public.%I;', t, t);
    EXECUTE format('CREATE POLICY "anon_update_%s" ON public.%I FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);', t, t);
    EXECUTE format('DROP POLICY IF EXISTS "anon_delete_%s" ON public.%I;', t, t);
    EXECUTE format('CREATE POLICY "anon_delete_%s" ON public.%I FOR DELETE TO anon, authenticated USING (true);', t, t);
  END LOOP;
END $$;

-- stock_movements: insert+select only (ledger integrity)
DROP POLICY IF EXISTS "anon_update_stock_movements" ON public.stock_movements;
DROP POLICY IF EXISTS "anon_delete_stock_movements" ON public.stock_movements;

-- Seed reference data
INSERT INTO public.fuel_types (name) VALUES ('Diesel'),('Petrol'),('Electric'),('Hybrid'),('LPG') ON CONFLICT (name) DO NOTHING;
INSERT INTO public.transmissions (name) VALUES ('Manual'),('Automatic'),('Semi-Automatic'),('CVT') ON CONFLICT (name) DO NOTHING;
INSERT INTO public.warehouses (name, code, address) VALUES ('Main Warehouse','WH01','Central Depot'),('Secondary Warehouse','WH02','North Depot') ON CONFLICT (code) DO NOTHING;
INSERT INTO public.settings (key, value) VALUES ('company_name','AutoParts ERP'),('currency','USD'),('low_stock_threshold','5') ON CONFLICT (key) DO NOTHING;
