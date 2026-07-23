const API_BASE = window.location.origin;
const TOKEN_KEY = 'mail_tracker_token';
const USER_KEY = 'mail_tracker_user';

const authSection = document.getElementById('auth-section');
const dashboardSection = document.getElementById('dashboard-section');
const authError = document.getElementById('auth-error');
const userGreeting = document.getElementById('user-greeting');
const emailTableBody = document.getElementById('email-table-body');
const sendMessage = document.getElementById('send-message');

const getToken = () => localStorage.getItem(TOKEN_KEY);
const setSession = (token, user) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};
const clearSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};
const getUser = () => {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
};

const api = async (path, options = {}) => {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }

  return data;
};

const showAuth = () => {
  authSection.classList.remove('hidden');
  dashboardSection.classList.add('hidden');
};

const showDashboard = () => {
  authSection.classList.add('hidden');
  dashboardSection.classList.remove('hidden');
  const user = getUser();
  userGreeting.textContent = user ? `Signed in as ${user.email}` : '';
  loadEmails();
};

const formatDate = (value) => {
  if (!value) return '—';
  return new Date(value).toLocaleString();
};

const statusBadge = (status, openStatus) => {
  if (status === 'failed') return '<span class="badge failed">Failed</span>';
  if (openStatus === 'opened') return '<span class="badge opened">Opened</span>';
  return '<span class="badge not-opened">Not Opened</span>';
};

const loadEmails = async () => {
  try {
    const { data } = await api('/email');
    if (!data.length) {
      emailTableBody.innerHTML = '<tr><td colspan="6" class="empty">No emails yet.</td></tr>';
      return;
    }

    emailTableBody.innerHTML = data
      .map(
        (email) => `
      <tr>
        <td>${escapeHtml(email.recipient)}</td>
        <td>${escapeHtml(email.subject)}</td>
        <td>${formatDate(email.sentTime)}</td>
        <td>${statusBadge(email.status, email.openStatus)}</td>
        <td>${email.openCount}</td>
        <td>${formatDate(email.lastOpenTime)}</td>
      </tr>`
      )
      .join('');
  } catch (error) {
    emailTableBody.innerHTML = `<tr><td colspan="6" class="empty">${escapeHtml(error.message)}</td></tr>`;
  }
};

const escapeHtml = (str) => {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
};

document.querySelectorAll('.tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach((t) => t.classList.remove('active'));
    tab.classList.add('active');
    const isLogin = tab.dataset.tab === 'login';
    document.getElementById('login-form').classList.toggle('hidden', !isLogin);
    document.getElementById('register-form').classList.toggle('hidden', isLogin);
    authError.classList.add('hidden');
  });
});

document.getElementById('login-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  authError.classList.add('hidden');

  const formData = new FormData(event.target);
  try {
    const { data } = await api('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: formData.get('email'),
        password: formData.get('password'),
      }),
    });
    setSession(data.token, data.user);
    showDashboard();
  } catch (error) {
    authError.textContent = error.message;
    authError.classList.remove('hidden');
  }
});

document.getElementById('register-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  authError.classList.add('hidden');

  const formData = new FormData(event.target);
  try {
    const { data } = await api('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: formData.get('name'),
        email: formData.get('email'),
        password: formData.get('password'),
      }),
    });
    setSession(data.token, data.user);
    showDashboard();
  } catch (error) {
    authError.textContent = error.message;
    authError.classList.remove('hidden');
  }
});

document.getElementById('send-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  sendMessage.classList.add('hidden');

  const formData = new FormData(event.target);
  try {
    await api('/email/send', {
      method: 'POST',
      body: JSON.stringify({
        recipient: formData.get('recipient'),
        subject: formData.get('subject'),
        body: formData.get('body'),
      }),
    });
    sendMessage.textContent = 'Email sent successfully with tracking pixel.';
    sendMessage.className = 'message success';
    sendMessage.classList.remove('hidden');
    event.target.reset();
    loadEmails();
  } catch (error) {
    sendMessage.textContent = error.message;
    sendMessage.className = 'message error';
    sendMessage.classList.remove('hidden');
  }
});

document.getElementById('connect-gmail-btn').addEventListener('click', async () => {
  try {
    const { data } = await api('/google/connect');
    window.location.href = data.authUrl;
  } catch (error) {
    alert(error.message);
  }
});

document.getElementById('refresh-btn').addEventListener('click', loadEmails);
document.getElementById('logout-btn').addEventListener('click', () => {
  clearSession();
  showAuth();
});

const params = new URLSearchParams(window.location.search);
if (params.get('gmail') === 'connected') {
  window.history.replaceState({}, '', '/dashboard');
}

if (getToken()) {
  showDashboard();
} else {
  showAuth();
}

setInterval(() => {
  if (getToken()) loadEmails();
}, 15000);
