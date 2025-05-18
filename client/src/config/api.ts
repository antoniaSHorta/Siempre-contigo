export const API_URL = 'http://localhost:3000/api';

export const endpoints = {
  auth: {
    login: `${API_URL}/users/login`,
    register: `${API_URL}/users/register`,
    me: `${API_URL}/users/me`,
    logout: `${API_URL}/users/logout`,
  },
  users: {
    list: `${API_URL}/users`,
    create: `${API_URL}/users`,
    update: (id: number) => `${API_URL}/users/${id}`,
    delete: (id: number) => `${API_URL}/users/${id}`,
  },
}; 