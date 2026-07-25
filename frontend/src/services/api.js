const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = {
  async fetchWithCredentials(endpoint, options = {}) {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // Crucial for sessions
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw { status: response.status, data: errorData };
    }

    return response.json();
  },

  post(endpoint, body) {
    return this.fetchWithCredentials(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  get(endpoint) {
    return this.fetchWithCredentials(endpoint, {
      method: 'GET',
    });
  },
  
  patch(endpoint, body) {
    return this.fetchWithCredentials(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }
};

export default api;
