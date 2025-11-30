<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useThemeStore } from '../stores/theme';
import locales from '../locales';
import api from '../api/axios';
import BaseModal from '../components/BaseModal.vue';
import { computed } from 'vue';

const isLogin = ref(true);
const username = ref('');
const password = ref('');
const router = useRouter();
const authStore = useAuthStore();
const themeStore = useThemeStore();
const errorMsg = ref('');

const t = computed(() => locales[themeStore.language].login);
const tCommon = computed(() => locales[themeStore.language].common);

// Modal State
const showModal = ref(false);
const modalConfig = ref({
  title: '',
  content: '',
  type: 'info',
  onConfirm: () => {}
});

const showMessage = (title, content, type = 'info') => {
  modalConfig.value = {
    title,
    content,
    type,
    onConfirm: () => {
      showModal.value = false;
    }
  };
  showModal.value = true;
};

const handleSubmit = async () => {
  errorMsg.value = '';
  try {
    if (isLogin.value) {
      // Login
      const res = await api.post('/api/auth/login', {
        username: username.value,
        password: password.value
      });
      authStore.login(res.data.user, res.data.token);
      router.push('/');
    } else {
      // Register
      await api.post('/api/auth/register', {
        username: username.value,
        password: password.value,
        role: 'user' // 默认注册普通用户
      });
      // 注册成功后自动登录或提示去登录
      isLogin.value = true;
      showMessage(tCommon.value.success, t.value.success_register, 'success');
    }
  } catch (e) {
    errorMsg.value = e.message || tCommon.value.error;
  }
};
</script>

<template>
  <div class="flex min-h-screen items-center justify-center p-4 relative z-10">
    <div class="w-full max-w-md rounded-3xl bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl border border-white/20 dark:border-gray-700/30 p-8 md:p-10 shadow-2xl shadow-blue-500/10 dark:shadow-none transition-all overflow-hidden relative">
      
      <transition name="fade-slide" mode="out-in">
        <div :key="isLogin ? 'login' : 'register'" class="w-full">
          <div class="mb-8 text-center">
            <h2 class="text-2xl font-black bg-gradient-to-br from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {{ isLogin ? t.title_login : t.title_register }}
            </h2>
          </div>
          
          <form @submit.prevent="handleSubmit" class="space-y-6">
            <div>
              <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 ml-1">{{ t.username }}</label>
              <input 
                v-model="username" 
                type="text" 
                required
                class="w-full bg-white/60 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
              />
            </div>
            
            <div>
              <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 ml-1">{{ t.password }}</label>
              <input 
                v-model="password" 
                type="password" 
                required
                class="w-full bg-white/60 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
              />
            </div>

            <div v-if="errorMsg" class="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-sm text-red-500 dark:text-red-400 text-center border border-red-100 dark:border-red-900/30">
              {{ errorMsg }}
            </div>

            <button 
              type="submit" 
              class="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-4 py-3.5 text-white font-bold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
            >
              {{ isLogin ? t.submit_login : t.submit_register }}
            </button>
          </form>

          <div class="mt-8 text-center text-sm">
            <span class="text-gray-500 dark:text-gray-400">
              {{ isLogin ? t.no_account : t.has_account }}
            </span>
            <button 
              @click="isLogin = !isLogin" 
              class="ml-1 font-bold text-blue-600 dark:text-blue-400 hover:underline transition-colors"
            >
              {{ isLogin ? t.to_register : t.to_login }}
            </button>
          </div>
        </div>
      </transition>
    </div>
  </div>
  <BaseModal
    v-model="showModal"
    :title="modalConfig.title"
    :type="modalConfig.type"
    :showCancel="false"
    @confirm="modalConfig.onConfirm"
  >
    {{ modalConfig.content }}
  </BaseModal>
</template>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}
</style>
