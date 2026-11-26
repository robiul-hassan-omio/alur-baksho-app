// Supabase JavaScript is loaded from the pinned CDN version in each HTML page.
// Never place a Supabase service_role/secret key in this browser application.
(function initializeAlurBakshoSupabase() {
  const config = window.ALUR_BAKSHO_CONFIG || {};
  const hasPlaceholder = (value) => !value || /YOUR_|PLACEHOLDER/i.test(value);

  if (!window.supabase || typeof window.supabase.createClient !== 'function') {
    console.error('Supabase JavaScript could not be loaded. Check your internet connection.');
    return;
  }

  if (hasPlaceholder(config.supabaseUrl) || hasPlaceholder(config.supabasePublishableKey)) {
    console.warn('Alur Baksho needs a Supabase URL and publishable key before cloud features can run.');
    return;
  }

  window.alurSupabaseClient = window.supabase.createClient(
    config.supabaseUrl,
    config.supabasePublishableKey,
    {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    }
  );
})();
