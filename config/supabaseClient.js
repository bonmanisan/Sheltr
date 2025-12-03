// config/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

// replace with your actual values (do NOT commit secret keys to public repos)
const SUPABASE_URL = 'https://efhcbycrsgktptkdclpm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVmaGNieWNyc2drdHB0a2RjbHBtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1ODU0NjMsImV4cCI6MjA4MDE2MTQ2M30.Y1gSPwlnaY8j0WSfXxD8cKwYkURuJ0qDjFPrBPdLolQ';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
