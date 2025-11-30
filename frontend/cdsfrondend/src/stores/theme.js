import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useThemeStore = defineStore('theme', () => {
  const isDark = ref(localStorage.getItem('theme') === 'dark');
  const language = ref(localStorage.getItem('lang') || 'zh');

  const toggleTheme = () => {
    isDark.value = !isDark.value;
    localStorage.setItem('theme', isDark.value ? 'dark' : 'light');
    updateHtmlClass();
  };

  const setLanguage = (lang) => {
    language.value = lang;
    localStorage.setItem('lang', lang);
  };

  const updateHtmlClass = () => {
    if (isDark.value) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Initialize
  updateHtmlClass();

  return { isDark, language, toggleTheme, setLanguage };
});
