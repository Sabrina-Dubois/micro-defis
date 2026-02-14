import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // ✅ Persiste la session dans localStorage
    persistSession: true,

    // ✅ Stockage local
    storage: window.localStorage,

    // ✅ Auto-refresh du token
    autoRefreshToken: true,

    // ✅ Détecte les changements de session
    detectSessionInUrl: true,
  },
});
