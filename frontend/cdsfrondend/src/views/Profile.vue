<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useThemeStore } from '../stores/theme';
import { useRouter } from 'vue-router';
import api from '../api/axios';
import locales from '../locales';
import { computed } from 'vue';
import BaseModal from '../components/BaseModal.vue';

const authStore = useAuthStore();
const themeStore = useThemeStore();
const router = useRouter();
const evaluations = ref([]);
const loading = ref(true);

const t = computed(() => locales[themeStore.language].profile);
const tCommon = computed(() => locales[themeStore.language].common);
const tNav = computed(() => locales[themeStore.language].nav);

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

const showConfirm = (title, content, onConfirm, type = 'warning') => {
  modalConfig.value = {
    title,
    content,
    type,
    onConfirm: () => {
      onConfirm();
      showModal.value = false;
    }
  };
  showModal.value = true;
};

const fetchEvaluations = async () => {
  loading.value = true;
  try {
    const res = await api.get('/api/user/evaluations');
    evaluations.value = res.data;
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  if (!authStore.token) {
    router.push('/login');
    return;
  }
  await fetchEvaluations();
});

const handleDelete = (id) => {
  showConfirm(tCommon.value.confirm, '确定要删除这条评价吗？', async () => {
    try {
      await api.post(`/api/evaluations/delete/${id}`);
      showMessage(tCommon.value.success, tCommon.value.success, 'success');
      fetchEvaluations();
    } catch (e) {
      showMessage(tCommon.value.error, e.message || 'Error', 'error');
    }
  }, 'error');
};

const logout = () => {
  authStore.logout();
  router.push('/login');
};
</script>

<template>
  <div class="container mx-auto px-4 py-8 relative z-10">
    <div class="mb-10 flex flex-col md:flex-row justify-between items-center gap-6 rounded-3xl bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl border border-white/20 dark:border-gray-700/30 p-8 shadow-2xl shadow-blue-500/5 dark:shadow-none">
      <div class="flex items-center gap-4">
        <div class="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-blue-500/30">
          {{ authStore.user?.username.charAt(0).toUpperCase() }}
        </div>
        <div>
          <h1 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{{ t.title }}</h1>
          <p class="text-gray-600 dark:text-gray-400 font-medium">{{ t.welcome }}, <span class="text-blue-600 dark:text-blue-400">{{ authStore.user?.username }}</span></p>
        </div>
      </div>
      <button @click="logout" class="group flex items-center gap-2 rounded-xl border border-red-200 dark:border-red-900/50 bg-white/50 dark:bg-gray-900/50 px-6 py-3 text-red-600 dark:text-red-400 font-semibold hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 transition-all">
        <svg class="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
        {{ tNav.logout }}
      </button>
    </div>

    <h2 class="text-xl font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-2 pl-2">
      <span class="w-1 h-6 bg-blue-600 rounded-full"></span>
      {{ t.my_reviews }}
    </h2>
    
    <div v-if="loading" class="flex justify-center py-20">
      <div class="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
    </div>
    
    <div v-else class="space-y-6">
      <div 
        v-for="evaluation in evaluations" 
        :key="evaluation.id" 
        class="group rounded-2xl bg-white/60 dark:bg-gray-800/40 backdrop-blur-md border border-white/20 dark:border-gray-700/30 p-6 md:p-8 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
      >
        <div class="flex flex-col md:flex-row justify-between gap-4 mb-4">
          <div>
            <router-link 
              :to="`/course/${evaluation.course_id}`"
              class="text-xl font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-2"
            >
              <span class="text-blue-600 dark:text-blue-400">{{ evaluation.course_code }}</span>
              <span class="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600"></span>
              <span>{{ evaluation.course_name }}</span>
            </router-link>
            <div class="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              {{ new Date(evaluation.created_at).toLocaleDateString() }}
            </div>
          </div>
          
          <div class="flex flex-col items-start sm:items-end gap-2">
            <div class="flex items-center gap-3 bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-xl">
               <span class="text-xs font-bold text-blue-600 dark:text-blue-300 uppercase tracking-wide">{{ t.my_rating }}</span>
               <span class="text-2xl font-black text-blue-600 dark:text-blue-400">{{ evaluation.overall_rating }}</span>
            </div>
            <div class="flex space-x-1 w-full sm:w-auto justify-end">
              <button 
                @click="router.push(`/evaluation/edit/${evaluation.id}`)"
                class="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                title="编辑"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
              </button>
              <button 
                @click="handleDelete(evaluation.id)"
                class="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                title="删除"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
              </button>
            </div>
          </div>
        </div>
        
        <div class="bg-gray-50/80 dark:bg-gray-900/30 p-5 rounded-xl border border-gray-100 dark:border-gray-700/50">
          <p class="text-gray-700 dark:text-gray-300 leading-relaxed">{{ evaluation.comment || '...' }}</p>
        </div>
      </div>

      <div v-if="evaluations.length === 0" class="text-center py-20 bg-white/40 dark:bg-gray-800/40 backdrop-blur rounded-3xl border border-white/20 dark:border-gray-700/30">
        <div class="text-6xl mb-4 opacity-50 grayscale">📭</div>
        <p class="text-gray-500 dark:text-gray-400 text-lg font-medium">{{ t.no_reviews }}</p>
        <router-link to="/" class="mt-6 inline-block px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 hover:bg-blue-700 hover:-translate-y-0.5 transition-all">
          {{ tNav.home }}
        </router-link>
      </div>
    </div>
  </div>
  
  <BaseModal
    v-model="showModal"
    :title="modalConfig.title"
    :type="modalConfig.type"
    :showCancel="modalConfig.type === 'warning'"
    @confirm="modalConfig.onConfirm"
  >
    {{ modalConfig.content }}
  </BaseModal>
</template>
