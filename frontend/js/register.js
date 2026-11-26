// Supabase Auth handles password hashing and account sessions.
document.addEventListener('DOMContentLoaded', () => {
  const registerForm = document.getElementById('register-form');
  const errorMessage = document.getElementById('register-error');
  const successMessage = document.getElementById('register-success');
  const submitButton = document.getElementById('register-submit');

  registerForm.addEventListener('submit', handleRegister);

  async function handleRegister(event) {
    event.preventDefault();
    hideMessage(errorMessage);
    hideMessage(successMessage);

    const username = document.getElementById('register-username').value.trim();
    const email = document.getElementById('register-email').value.trim().toLowerCase();
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;
    const userImageUrl = document.getElementById('register-image').value.trim();

    if (username.length < 3) return showMessage(errorMessage, 'Your name needs at least 3 characters.');
    if (password.length < 8) return showMessage(errorMessage, 'Choose a password with at least 8 characters.');
    if (password !== confirmPassword) return showMessage(errorMessage, 'Those passwords do not match yet.');

    submitButton.disabled = true;
    submitButton.querySelector('span').textContent = 'Creating your space…';

    try {
      const redirectTo = new URL('feed.html', window.location.href).href;
      const { data, error } = await getSupabaseClient().auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectTo,
          data: { username, user_image_url: userImageUrl || null }
        }
      });
      if (error) throw error;

      if (data.session && data.user) {
        await loadProfileForAuthUser(data.user);
        showMessage(successMessage, 'Your account is ready. Welcome in.');
        window.location.replace('feed.html');
      } else {
        showMessage(successMessage, 'Your account request is saved. Check your email to confirm the address, then sign in.');
        registerForm.reset();
      }
    } catch (error) {
      showMessage(errorMessage, error.message || 'Something went wrong while creating your account.');
    } finally {
      submitButton.disabled = false;
      submitButton.querySelector('span').textContent = 'Create my space';
    }
  }
});
