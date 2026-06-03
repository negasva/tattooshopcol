-- Fix: disable RLS on monthly tables so the admin panel (anon key) can read/write
-- Run this in Supabase Dashboard → SQL Editor

ALTER TABLE monthly_performance DISABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_sales DISABLE ROW LEVEL SECURITY;

-- Also ensure component_groups table (created recently) has no RLS issues
ALTER TABLE component_groups DISABLE ROW LEVEL SECURITY;
