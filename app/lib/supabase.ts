import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

export interface Product {
  id?: string;
  name: string;
  category_id?: string;
  category?: string;
  price_original?: number;
  discount_percent?: number;
  price?: number;
  specs?: string;
  tag?: string;
  inventory?: number;
  image_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Category {
  id: string;
  name: string;
  created_at?: string;
}
