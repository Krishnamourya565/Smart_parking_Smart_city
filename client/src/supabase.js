import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ubgivwmkclvzqnrkyapr.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_AwukzzZx8wzU0HKsSBGYwQ_Qh4yBHVJ';

export const supabase = createClient(supabaseUrl, supabaseKey);
