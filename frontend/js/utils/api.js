// Shared helpers for the static Supabase-powered frontend.
function getSupabaseClient() {
  if (!window.alurSupabaseClient) {
    throw new Error('Alur Baksho is not connected to Supabase yet. Configure frontend/js/config.js or the GitHub Pages repository variables.');
  }
  return window.alurSupabaseClient;
}

async function loadProfileForAuthUser(authUser) {
  const { data, error } = await getSupabaseClient()
    .from('profiles')
    .select('id, username, avatar_url, created_at')
    .eq('id', authUser.id)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error('Your profile is still being created. Please sign out and sign in again in a moment.');

  const profile = {
    user_id: data.id,
    username: data.username,
    email: authUser.email || '',
    user_image_url: data.avatar_url || '',
    created_at: data.created_at
  };
  window.currentUser = profile;
  return profile;
}

function getStoredUser() {
  return window.currentUser || null;
}

function showMessage(element, message) {
  if (!element) return;
  element.textContent = message;
  element.hidden = false;
}

function hideMessage(element) {
  if (!element) return;
  element.textContent = '';
  element.hidden = true;
}
