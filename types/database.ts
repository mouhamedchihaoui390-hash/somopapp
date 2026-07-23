export type UUID = string;

export type Category = {
  id: UUID;
  name: string;
  slug: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
};

export type Subcategory = {
  id: UUID;
  category_id: UUID;
  name: string;
  slug: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
};

export type Brand = {
  id: UUID;
  name: string;
  description: string | null;
  logo_url: string | null;
  created_at: string;
  updated_at: string;
};

export type VehicleMake = {
  id: UUID;
  name: string;
  created_at: string;
  updated_at: string;
};

export type VehicleModel = {
  id: UUID;
  make_id: UUID;
  name: string;
  created_at: string;
  updated_at: string;
};

export type VehicleGeneration = {
  id: UUID;
  model_id: UUID;
  name: string;
  year_start: number | null;
  year_end: number | null;
  created_at: string;
  updated_at: string;
};

export type FuelType = {
  id: UUID;
  name: string;
  created_at: string;
  updated_at: string;
};

export type Transmission = {
  id: UUID;
  name: string;
  created_at: string;
  updated_at: string;
};

export type Engine = {
  id: UUID;
  generation_id: UUID;
  name: string;
  fuel_type_id: UUID | null;
  transmission_id: UUID | null;
  displacement: string | null;
  power_kw: number | null;
  power_hp: number | null;
  year_start: number | null;
  year_end: number | null;
  created_at: string;
  updated_at: string;
};

export type Warehouse = {
  id: UUID;
  name: string;
  code: string | null;
  address: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
};

export type Product = {
  id: UUID;
  name: string;
  description: string | null;
  category_id: UUID | null;
  subcategory_id: UUID | null;
  brand_id: UUID | null;
  sku: string | null;
  oem: string | null;
  reference: string | null;
  barcode: string | null;
  image_url: string | null;
  weight: number | null;
  length: number | null;
  width: number | null;
  height: number | null;
  purchase_price: number;
  selling_price: number;
  tax_rate: number;
  min_stock: number;
  max_stock: number;
  status: string;
  tags: string[] | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type ProductImage = {
  id: UUID;
  product_id: UUID;
  url: string;
  alt: string | null;
  position: number;
  created_at: string;
};

export type Compatibility = {
  id: UUID;
  product_id: UUID;
  engine_id: UUID | null;
  vehicle_make_id: UUID | null;
  vehicle_model_id: UUID | null;
  vehicle_generation_id: UUID | null;
  year_start: number | null;
  year_end: number | null;
  notes: string | null;
  created_at: string;
};

export type Inventory = {
  id: UUID;
  product_id: UUID;
  warehouse_id: UUID;
  quantity: number;
  reserved: number;
  incoming: number;
  damaged: number;
  shelf: string | null;
  location: string | null;
  created_at: string;
  updated_at: string;
};

export type StockMovement = {
  id: UUID;
  product_id: UUID;
  warehouse_id: UUID;
  movement_type: string;
  quantity: number;
  reference: string | null;
  notes: string | null;
  created_at: string;
};

export type Customer = {
  id: UUID;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  tax_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type CustomerVehicle = {
  id: UUID;
  customer_id: UUID;
  plate: string | null;
  vin: string | null;
  make: string | null;
  model: string | null;
  generation: string | null;
  year: number | null;
  engine: string | null;
  created_at: string;
  updated_at: string;
};

export type Supplier = {
  id: UUID;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  tax_id: string | null;
  contact_person: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type PurchaseOrder = {
  id: UUID;
  supplier_id: UUID;
  warehouse_id: UUID | null;
  order_number: string;
  status: string;
  total: number;
  order_date: string;
  expected_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type PurchaseItem = {
  id: UUID;
  order_id: UUID;
  product_id: UUID | null;
  quantity: number;
  unit_cost: number;
  created_at: string;
};

export type SalesOrder = {
  id: UUID;
  customer_id: UUID;
  order_number: string;
  status: string;
  total: number;
  order_date: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type SalesItem = {
  id: UUID;
  order_id: UUID;
  product_id: UUID | null;
  quantity: number;
  unit_price: number;
  created_at: string;
};

export type VinRequest = {
  id: UUID;
  customer_id: UUID | null;
  vin: string | null;
  customer_name: string | null;
  customer_email: string | null;
  vehicle_info: string | null;
  requested_products: string | null;
  comments: string | null;
  status: string;
  created_at: string;
  updated_at: string;
};

export type Notification = {
  id: UUID;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  read: boolean;
  created_at: string;
};

export type ActivityLog = {
  id: UUID;
  action: string;
  entity: string | null;
  entity_id: UUID | null;
  detail: string | null;
  created_at: string;
};

export type Setting = {
  key: string;
  value: string | null;
  updated_at: string;
};

export type ProductWithRelations = Product & {
  category?: Category | null;
  subcategory?: Subcategory | null;
  brand?: Brand | null;
  inventory?: Inventory[];
};

export type InventoryWithRelations = Inventory & {
  product?: Product;
  warehouse?: Warehouse;
};

export type StockMovementWithRelations = StockMovement & {
  product?: Product;
  warehouse?: Warehouse;
};
