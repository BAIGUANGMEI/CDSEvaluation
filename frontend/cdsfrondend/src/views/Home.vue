<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '../api/axios';
import { useAuthStore } from '../stores/auth';
import { useThemeStore } from '../stores/theme';
import locales from '../locales';
import BaseModal from '../components/BaseModal.vue';

const courses = ref([]);
const loading = ref(false);
const authStore = useAuthStore();
const themeStore = useThemeStore();
const selectedMajor = ref('');
const router = useRouter();

const t = computed(() => locales[themeStore.language].home);
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

// 获取课程列表
const fetchCourses = async () => {
  loading.value = true;
  try {
    const params = {};
    if (selectedMajor.value) {
      params.major = selectedMajor.value;
    }
    const res = await api.get('/api/courses', { params });
    courses.value = res.data;
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
};

const handleDelete = (id) => {
  showConfirm(tCommon.value.confirm, t.value.confirm_delete, async () => {
    try {
      await api.post(`/api/courses/delete/${id}`);
      showMessage(tCommon.value.success, tCommon.value.success, 'success');
      fetchCourses();
    } catch (e) {
      showMessage(tCommon.value.error, e.message || 'Error', 'error');
    }
  }, 'error');
};

// 简单的专业筛选
const majors = ['CS', 'ECIC', 'FTDA', 'STAT'];

onMounted(() => {
  fetchCourses();
});
</script>

<template>
  <div class="container mx-auto px-4 py-8 relative z-10">
    <div class="mb-10 flex flex-col md:flex-row items-center justify-between gap-4">
      <h1 class="text-3xl md:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300">
        {{ t.title }}
      </h1>
      
      <div class="flex items-center space-x-4 w-full md:w-auto">
        <div class="relative group">
          <select 
            v-model="selectedMajor" 
            @change="fetchCourses"
            class="appearance-none w-full bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 pr-10 text-sm font-medium text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all hover:bg-white dark:hover:bg-gray-800 shadow-sm"
          >
            <option value="">{{ t.filter_major }}</option>
            <option v-for="m in majors" :key="m" :value="m">{{ m }}</option>
          </select>
          <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 dark:text-gray-400">
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
          </div>
        </div>
        
        <router-link 
          v-if="authStore.isAdmin()" 
          to="/admin/course/new"
          class="flex items-center gap-2 rounded-xl bg-blue-600/90 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-500/30 hover:bg-blue-600 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all active:translate-y-0 whitespace-nowrap"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
          {{ t.add_course }}
        </router-link>
      </div>
    </div>

    <div v-if="loading" class="flex justify-center py-20">
      <div class="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
    </div>

    <div v-else class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      <div 
        v-for="course in courses" 
        :key="course.id" 
        class="group relative overflow-hidden rounded-2xl bg-white/40 dark:bg-gray-800/40 backdrop-blur-md border border-white/20 dark:border-gray-700/30 p-6 shadow-xl shadow-gray-200/50 dark:shadow-none hover:bg-white/60 dark:hover:bg-gray-800/60 hover:-translate-y-1 transition-all duration-300"
      >
        <div class="absolute top-0 right-0 p-4 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
            <div v-if="authStore.isAdmin()" class="flex space-x-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur rounded-lg p-1 shadow-sm border border-gray-100 dark:border-gray-700">
               <button 
                 @click.prevent="router.push(`/admin/course/${course.id}`)"
                 class="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors"
                 :title="t.edit"
               >
                 <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
               </button>
               <button 
                 @click.prevent="handleDelete(course.id)"
                 class="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
                 :title="t.delete"
               >
                 <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
               </button>
            </div>
        </div>

        <div class="mb-4">
          <span class="inline-block rounded-lg bg-blue-100/80 dark:bg-blue-900/30 px-2.5 py-1 text-xs font-bold text-blue-700 dark:text-blue-300 mb-3 tracking-wide uppercase">
            {{ course.major || 'General' }}
          </span>
          <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{{ course.course_code }}</h3>
          <p class="text-base font-medium text-gray-700 dark:text-gray-300 line-clamp-1">{{ course.course_name }}</p>
        </div>
        
        <div class="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-6">
          <svg class="w-4 h-4 mr-1.5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
          {{ t.professor }}: {{ course.professor || 'N/A' }}
        </div>
        
        <router-link 
          :to="`/course/${course.id}`"
          class="block w-full rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-600 px-4 py-2.5 text-center text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-200 dark:hover:border-blue-800 transition-all"
        >
          {{ t.view_evaluation }}
        </router-link>
      </div>
    </div>
    
    <div v-if="!loading && courses.length === 0" class="flex flex-col items-center justify-center py-20 text-gray-400 dark:text-gray-500">
      <svg class="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
      <p class="text-lg">{{ t.no_courses }}</p>
    </div>
  </div>
  
  <BaseModal
    v-model="showModal"
    :title="modalConfig.title"
    :type="modalConfig.type"
    @confirm="modalConfig.onConfirm"
  >
    {{ modalConfig.content }}
  </BaseModal>
</template>
