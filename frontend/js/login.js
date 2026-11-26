// Supabase Auth signs users in with their email address and password.
document.addEventListener('DOMContentLoaded', async () => {
  const loginForm = document.getElementById('login-form');
  const errorMessage = document.getElementById('login-error');
  const successMessage = document.getElementById('login-success');
  const submitButton = document.getElementById('login-submit');

  try {
    const { data } = await getSupabaseClient().auth.getSession();
    if (data.session) {
      window.location.replace('feed.html');
      return;
    }
  } catch (error) {
    showMessage(errorMessage, error.message);
    return;
  }

  loginForm.addEventListener('submit', handleLogin);

  async function handleLogin(event) {
    event.preventDefault();
    hideMessage(errorMessage);
    hideMessage(successMessage);

    const email = document.getElementById('login-identifier').value.trim().toLowerCase();
    const password = document.getElementById('login-password').value;
    if (!email || !password) {
      showMessage(errorMessage, 'Please enter your email address and password.');
      return;
    }

    submitButton.disabled = true;
    submitButton.querySelector('span').textContent = 'Opening your space…';

    try {
      const { data, error } = await getSupabaseClient().auth.signInWithPassword({ email, password });
      if (error) throw error;
      await loadProfileForAuthUser(data.user);
      showMessage(successMessage, 'You are in. Welcome back.');
      window.location.replace('feed.html');
    } catch (error) {
      showMessage(errorMessage, error.message || 'Something went wrong while signing in.');
    } finally {
      submitButton.disabled = false;
      submitButton.querySelector('span').textContent = 'Enter your space';
    }
  }
});
