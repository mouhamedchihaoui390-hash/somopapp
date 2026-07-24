/*
# Fix Import/Upsert Constraints

## Overview
Two bugs blocked scripts/import-catalogue.js (and any future bulk upsert)
from running against this schema:

1. `categories.name` had no unique/exclusion constraint, but the import
   script does `upsert(rows, { onConflict: 'name' })` on it — Postgres
   rejects an ON CONFLICT target that doesn't match a real constraint.
2. `products.sku` / `.oem` / `.barcode` were PARTIAL unique indexes
   (`WHERE col IS NOT NULL AND col <> ''`). Postgres only accepts a
   partial index as an ON CONFLICT arbiter if the exact same WHERE
   clause is restated in the ON CONFLICT clause — a plain
   `upsert(rows, { onConflict: 'sku' })` (as used by both the import
   script and the Supabase JS client in general) does not do this and
   fails with "no unique or exclusion constraint matching the ON
   CONFLICT specification".

## Fix
Replace the partial indexes with plain unique indexes. Postgres unique
indexes already treat NULLs as distinct from one another, so multiple
products with sku/oem/barcode = NULL remain allowed — only empty
string ('') collisions are now caught too, which the app never
generates (empty strings are normalized to NULL before insert).

Add a real unique constraint on categories.name so upsert-by-name works
the same way it already does for brands and vehicle_makes.
*/

-- categories: add missing unique constraint on name
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'uq_categories_name'
  ) THEN
    ALTER TABLE public.categories ADD CONSTRAINT uq_categories_name UNIQUE (name);
  END IF;
END $$;

-- products: convert partial unique indexes to plain ones so ON CONFLICT works
DROP INDEX IF EXISTS public.uq_products_sku;
CREATE UNIQUE INDEX IF NOT EXISTS uq_products_sku ON public.products(sku);

DROP INDEX IF EXISTS public.uq_products_oem;
CREATE UNIQUE INDEX IF NOT EXISTS uq_products_oem ON public.products(oem);

DROP INDEX IF EXISTS public.uq_products_barcode;
CREATE UNIQUE INDEX IF NOT EXISTS uq_products_barcode ON public.products(barcode);
