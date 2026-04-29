const API_BASE = '/api';

async function request(path: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string> || {}),
  };

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }

  return res.json();
}

export const api = {
  // Auth
  login: (username: string, password: string) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }),

  register: (username: string, password: string) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify({ username, password }) }),

  getMe: () => request('/auth/me'),

  // Terms
  searchTerms: (q: string, limit = 10) =>
    request(`/terms/search?q=${encodeURIComponent(q)}&limit=${limit}`),

  getLatestTerms: (limit = 20) => request(`/terms/latest?limit=${limit}`),

  filterTerms: (params: { category?: string; tag?: string; limit?: number }) => {
    const qs = new URLSearchParams();
    if (params.category) qs.set('category', params.category);
    if (params.tag) qs.set('tag', params.tag);
    if (params.limit) qs.set('limit', String(params.limit));
    return request(`/terms/filter?${qs.toString()}`);
  },

  getCategories: () => request('/terms/categories'),

  getTags: () => request('/terms/tags'),

  getRecentSearches: () => request('/terms/recent-searches'),

  getTerm: (id: number) => request(`/terms/${id}`),

  createTerm: (data: { question: string; answer: string; category?: string; tags?: string[] }) =>
    request('/terms', { method: 'POST', body: JSON.stringify(data) }),

  updateTerm: (id: number, data: { question: string; answer: string; category?: string; tags?: string[] }) =>
    request(`/terms/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  deleteTerm: (id: number) =>
    request(`/terms/${id}`, { method: 'DELETE' }),

  // Users (admin)
  getUsers: () => request('/users'),

  updateUserRole: (id: number, role: string) =>
    request(`/users/${id}/role`, { method: 'PATCH', body: JSON.stringify({ role }) }),

  deleteUser: (id: number) =>
    request(`/users/${id}`, { method: 'DELETE' }),
};
