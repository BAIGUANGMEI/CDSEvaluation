<script setup>
import { useAuthStore } from './stores/auth';
import { useThemeStore } from './stores/theme';
import locales from './locales';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const themeStore = useThemeStore();
const router = useRouter();
const mobileMenuOpen = ref(false);

const t = computed(() => locales[themeStore.language].nav);

const toggleLang = () => {
  themeStore.setLanguage(themeStore.language === 'zh' ? 'en' : 'zh');
};

// Close mobile menu when route changes
router.afterEach(() => {
  mobileMenuOpen.value = false;
});
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans transition-colors duration-300">
    <!-- Navbar with Glassmorphism -->
    <nav class="sticky top-0 z-40 border-b border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-900/70 backdrop-blur-md transition-colors duration-300">
      <div class="container mx-auto px-4 h-16 flex items-center justify-between">
        <router-link to="/" class="text-xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent hover:opacity-80 transition-opacity">
          CDS Evaluation
        </router-link>
        
        <!-- Desktop Menu -->
        <div class="hidden md:flex items-center space-x-6">
          <router-link to="/" class="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            {{ t.home }}
          </router-link>
          
          <router-link to="/statistics" class="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            {{ t.statistics }}
          </router-link>
          
          <template v-if="authStore.token">
             <router-link to="/profile" class="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
               {{ t.profile }}
             </router-link>
             <span class="h-4 w-px bg-gray-300 dark:bg-gray-700"></span>
             <span class="text-sm font-semibold text-gray-800 dark:text-gray-200">{{ authStore.user?.username }}</span>
          </template>
          <template v-else>
             <router-link to="/login" class="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
               {{ t.login }}
             </router-link>
          </template>

          <!-- Theme & Lang Toggle -->
          <div class="flex items-center space-x-3 pl-4 border-l border-gray-200 dark:border-gray-700">
            <button @click="toggleLang" class="text-xs font-medium px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
              {{ themeStore.language === 'zh' ? 'EN' : '中' }}
            </button>
            <button @click="themeStore.toggleTheme" class="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <span v-if="themeStore.isDark">🌙</span>
              <span v-else>☀️</span>
            </button>
          </div>
        </div>

        <!-- Mobile Menu Button -->
        <button @click="mobileMenuOpen = !mobileMenuOpen" class="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none">
          <svg v-if="!mobileMenuOpen" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
          <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>

      <!-- Mobile Menu Dropdown -->
      <transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 -translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-2"
      >
        <div v-if="mobileMenuOpen" class="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl">
          <div class="container mx-auto px-4 py-4 space-y-4">
            <router-link to="/" class="block text-base font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400">
              {{ t.home }}
            </router-link>
            
            <router-link to="/statistics" class="block text-base font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400">
              {{ t.statistics }}
            </router-link>
            
            <template v-if="authStore.token">
               <router-link to="/profile" class="block text-base font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400">
                 {{ t.profile }}
               </router-link>
               <div class="px-2 py-1 text-sm text-gray-500 dark:text-gray-400">
                 Logged in as <span class="font-bold text-gray-900 dark:text-white">{{ authStore.user?.username }}</span>
               </div>
            </template>
            <template v-else>
               <router-link to="/login" class="block text-base font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400">
                 {{ t.login }}
               </router-link>
            </template>

            <div class="pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <span class="text-sm text-gray-500 dark:text-gray-400">Settings</span>
              <div class="flex items-center space-x-4">
                <button @click="toggleLang" class="text-sm font-medium px-3 py-1.5 rounded-md bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700">
                  {{ themeStore.language === 'zh' ? 'English' : '中文' }}
                </button>
                <button @click="themeStore.toggleTheme" class="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700">
                  <span v-if="themeStore.isDark">🌙</span>
                  <span v-else>☀️</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </nav>

    <!-- Main Content -->
    <main class="relative">
      <div class="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div class="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-400/10 blur-[100px] dark:bg-blue-500/10"></div>
        <div class="absolute top-[10%] -right-[10%] w-[40%] h-[40%] rounded-full bg-indigo-400/10 blur-[100px] dark:bg-indigo-500/10"></div>
      </div>
      <router-view></router-view>
    </main>
  </div>
</template>
