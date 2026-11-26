// Page protection is based on the session managed by Supabase Auth.
async function protectPage() {
  try {
    const client = getSupabaseClient();
    const { data, error } = await client.auth.getUser();
    if (error || !data.user) {
      window.location.replace('index.html');
      return false;
    }

    const user = await loadProfileForAuthUser(data.user);
    const usernameElement = document.getElementById('composer-username');
    const railUsernameElement = document.getElementById('rail-username');
    const railEmailElement = document.getElementById('rail-email');
    const welcomeHeading = document.getElementById('welcome-heading');

    if (usernameElement) usernameElement.textContent = user.username;
    if (railUsernameElement) railUsernameElement.textContent = user.username;
    if (railEmailElement) railEmailElement.textContent = user.email;
    if (welcomeHeading) {
      const firstName = escapeHTML(user.username.split(' ')[0]);
      welcomeHeading.innerHTML = `Hello, ${firstName}.<br><em>Your corner.</em>`;
    }

    setAvatar('topbar-avatar', user);
    setAvatar('composer-avatar', user);
    setAvatar('rail-avatar', user);

    const todayLabel = document.getElementById('today-label');
    if (todayLabel) {
      todayLabel.textContent = new Intl.DateTimeFormat('en', {
        weekday: 'short', month: 'short', day: 'numeric'
      }).format(new Date()).toUpperCase();
    }
    return true;
  } catch (error) {
    console.error('Could not verify the Alur Baksho session:', error);
    window.location.replace('index.html');
    return false;
  }
}

function setAvatar(elementId, user) {
  const element = document.getElementById(elementId);
  if (!element) return;

  if (user.user_image_url) {
    const image = document.createElement('img');
    image.src = user.user_image_url;
    image.alt = `${user.username}'s profile`;
    image.referrerPolicy = 'no-referrer';
    image.onerror = () => {
      element.textContent = getInitials(user.username);
      element.classList.remove('has-image');
    };
    element.replaceChildren(image);
    element.classList.add('has-image');
  } else {
    element.textContent = getInitials(user.username);
  }
}

function getInitials(name) {
  return String(name || 'A').trim().split(/\s+/).slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase()).join('') || 'A';
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]);
}

async function handleLogout() {
  try {
    await getSupabaseClient().auth.signOut();
  } catch (error) {
    console.error('Supabase sign-out returned an error:', error);
  } finally {
    window.currentUser = null;
    window.location.replace('index.html');
  }
}
