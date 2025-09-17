import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_KEY!;
if (!SUPABASE_URL || !SUPABASE_KEY) throw new Error("Defina SUPABASE_URL e SUPABASE_KEY no .env");

export const supabase_db = createClient(SUPABASE_URL, SUPABASE_KEY);