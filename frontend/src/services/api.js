import axios from 'axios';

const API = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api' });

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  profile: () => API.get('/auth/profile'),
};

export const assessmentAPI = {
  getAll: () => API.get('/assessments'),
  create: (data) => API.post('/assessments', data),
  update: (id, data) => API.put(`/assessments/${id}`, data),
  delete: (id) => API.delete(`/assessments/${id}`),
};

export const revenueAPI = {
  getAll: () => API.get('/revenue'),
  create: (data) => API.post('/revenue', data),
};

export const churnAPI = {
  getAll: () => API.get('/churn'),
  create: (data) => API.post('/churn', data),
};

export const leadsAPI = {
  getAll: () => API.get('/leads'),
  create: (data) => API.post('/leads', data),
};

export const usersAPI = {
  getAll: () => API.get('/users'),
  update: (id, data) => API.put(`/users/${id}`, data),
  delete: (id) => API.delete(`/users/${id}`),
};

export default API;
