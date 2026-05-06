import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  original_price?: number;
  discount_percentage?: number;
  image_url?: string;
  specs: string;
  tag: string;
  inventory: number;
  created_at: string;
  updated_at: string;
}
