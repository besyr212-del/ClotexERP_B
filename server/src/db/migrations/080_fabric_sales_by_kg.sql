-- TASK 003: distinguish "fabric roll sold by kg" from "yarn sold by kg" on a
-- sales-invoice line. Additive only — existing rows default to NULL for
-- non-kg lines and 'YARN' for any existing kg line (preserving their current,
-- already-working behavior exactly as-is).
ALTER TABLE sales_invoice_lines
  ADD COLUMN IF NOT EXISTS commodity_type text CHECK (commodity_type IN ('FABRIC', 'YARN'));

UPDATE sales_invoice_lines SET commodity_type = 'YARN' WHERE unit = 'kg' AND commodity_type IS NULL;
