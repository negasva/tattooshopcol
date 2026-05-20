-- Migration: Component groups table
-- Run in Supabase SQL Editor (Dashboard → SQL Editor)

CREATE TABLE IF NOT EXISTS component_groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR NOT NULL,
  components JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_component_groups_name ON component_groups(name);
