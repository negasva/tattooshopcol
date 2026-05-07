import { createClient } from '@supabase/supabase-js';

let supabase: ReturnType<typeof createClient> | null = null;

export function getSupabase() {
  if (!supabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
      throw new Error('Supabase credentials not configured');
    }

    supabase = createClient(url, key);
  }
  return supabase;
}

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
