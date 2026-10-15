/**
 * Backend Client Adapter Initialization
 * Supports live Supabase cloud instance or falls back to local isolated engine.
 */

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isLiveSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl.startsWith('https://') &&
  supabaseAnonKey.length > 20
);

export const getBackendMode = (): 'supabase' | 'local_adapter' => {
  return isLiveSupabaseConfigured ? 'supabase' : 'local_adapter';
};

export const backendConfigInfo = {
  mode: getBackendMode(),
  supabaseUrl: isLiveSupabaseConfigured ? supabaseUrl : 'Local Database Engine (Isolated)',
  isCloudConnected: isLiveSupabaseConfigured,
  adminEmails: (import.meta.env.VITE_ADMIN_EMAILS || 'admin@gymscan.ai').split(',').map((e: string) => e.trim().toLowerCase())
};
