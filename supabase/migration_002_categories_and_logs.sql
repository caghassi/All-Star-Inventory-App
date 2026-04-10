-- Add category column to products
ALTER TABLE products ADD COLUMN category TEXT DEFAULT 'Uncategorized';

-- Create inventory_log table for tracking stock changes
CREATE TABLE inventory_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  change_amount INTEGER NOT NULL,
  previous_qty INTEGER NOT NULL,
  new_qty INTEGER NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_inventory_log_product_id ON inventory_log(product_id);
CREATE INDEX idx_inventory_log_created_at ON inventory_log(created_at);
