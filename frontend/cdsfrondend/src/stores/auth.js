import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useAuthStore = defineStore('auth', () => {
  const user = ref(JSON.parse(localStorage.getItem('user') || 'null'));
  const token = ref(localStorage.getItem('token') || '');

  function login(userData, authToken) {
    user.value = userData;
    token.value = authToken;
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', authToken);
  }

  function logout() {
    user.value = null;
    token.value = '';
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  }

  function isAdmin() {
    return user.value?.role === 'admin';
  }

  return { user, token, login, logout, isAdmin };
});
