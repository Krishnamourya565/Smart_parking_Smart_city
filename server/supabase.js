const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

let supabase = null;

if (supabaseUrl && supabaseKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false }
    });
    console.log('[Supabase] Initialized client with', supabaseUrl);
  } catch (err) {
    console.error('[Supabase] Initialization failed:', err.message);
  }
} else {
  console.warn('[Supabase] Warning: SUPABASE_URL or SUPABASE_KEY missing in environment variables.');
}

module.exports = { supabase };
