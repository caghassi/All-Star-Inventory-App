-- Migration 003: Add drawer_number column to products
-- Apply this in the Supabase SQL Editor before using the drawer feature.
-- This migration is idempotent and safe to run multiple times.

ALTER TABLE products ADD COLUMN IF NOT EXISTS drawer_number INTEGER;

-- Ensure drawer_number is between 1 and 20 (or null for no drawer assigned)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'products_drawer_number_check'
  ) THEN
    ALTER TABLE products
      ADD CONSTRAINT products_drawer_number_check
      CHECK (drawer_number IS NULL OR (drawer_number BETWEEN 1 AND 20));
  END IF;
END $$;

-- Index for fast drawer lookups
CREATE INDEX IF NOT EXISTS idx_products_drawer_number ON products(drawer_number);
