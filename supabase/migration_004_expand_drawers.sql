-- Migration 004: Expand drawer_number to allow up to 21 (adds Plaques drawer)
-- Apply this in the Supabase SQL Editor.
-- Idempotent — safe to run multiple times.

-- Drop the old constraint and replace with the updated range
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_drawer_number_check;
ALTER TABLE products
  ADD CONSTRAINT products_drawer_number_check
  CHECK (drawer_number IS NULL OR (drawer_number BETWEEN 1 AND 21));
