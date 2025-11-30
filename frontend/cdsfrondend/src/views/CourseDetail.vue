<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '../api/axios';
import { useAuthStore } from '../stores/auth';
import { useThemeStore } from '../stores/theme';
import locales from '../locales';
import BaseModal from '../components/BaseModal.vue';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const themeStore = useThemeStore();
const course = ref(null);
const evaluations = ref([]);
const loading = ref(true);
const showForm = ref(false);
const sortBy = ref('newest');

const t = computed(() => locales[themeStore.language].course);
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

// Form Data
const formData = ref({
  overall_rating: 5,
  teaching_difficulty: 5,
  assignment_difficulty: 5,
  exam_difficulty: 5,
  has_tests: false,
  has_final_exam: false,
  attendance_checked: false,
  comment: ''
});

const fetchDetail = async () => {
  loading.value = true;
  try {
    const courseId = route.params.id;
    const [courseRes, evalRes] = await Promise.all([
      api.get(`/api/courses/${courseId}`),
      api.get(`/api/courses/${courseId}/evaluations`)
    ]);
    course.value = courseRes.data;
    evaluations.value = evalRes.data;
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
};

const submitEvaluation = async () => {
  try {
    await api.post('/api/evaluations', {
      course_id: parseInt(route.params.id),
      ...formData.value,
    });
    showMessage(tCommon.value.success, t.value.submit + ' ' + tCommon.value.success, 'success');
    showForm.value = false;
    fetchDetail();
  } catch (e) {
    showMessage(tCommon.value.error, e.message || 'Error', 'error');
  }
};

const handleDeleteEvaluation = (id) => {
  showConfirm(tCommon.value.confirm, tCommon.value.confirm + '?', async () => {
    try {
      await api.post(`/api/evaluations/delete/${id}`);
      showMessage(tCommon.value.success, tCommon.value.success, 'success');
      fetchDetail();
    } catch (e) {
      showMessage(tCommon.value.error, e.message || 'Error', 'error');
    }
  }, 'error');
};

// Stats
const stats = computed(() => {
  if (!evaluations.value.length) return null;
  const total = evaluations.value.length;
  const sumRating = evaluations.value.reduce((acc, cur) => acc + cur.overall_rating, 0);
  const sumTeaching = evaluations.value.reduce((acc, cur) => acc + cur.teaching_difficulty, 0);
  const sumAssignment = evaluations.value.reduce((acc, cur) => acc + cur.assignment_difficulty, 0);
  const sumExam = evaluations.value.reduce((acc, cur) => acc + cur.exam_difficulty, 0);
  
  return {
    avgRating: (sumRating / total).toFixed(1),
    avgTeaching: (sumTeaching / total).toFixed(1),
    avgAssignment: (sumAssignment / total).toFixed(1),
    avgExam: (sumExam / total).toFixed(1),
    total
  };
});

// Sorted Evaluations
const sortedEvaluations = computed(() => {
  const list = [...evaluations.value];
  switch (sortBy.value) {
    case 'newest':
      return list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    case 'oldest':
      return list.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    case 'rating_desc':
      return list.sort((a, b) => b.overall_rating - a.overall_rating);
    case 'rating_asc':
      return list.sort((a, b) => a.overall_rating - b.overall_rating);
    default:
      return list;
  }
});

onMounted(() => {
  fetchDetail();
});
</script>

<template>
  <div class="container mx-auto px-4 py-8 relative z-10" v-if="!loading && course">
    <!-- Course Header -->
    <div class="mb-8 rounded-3xl bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl border border-white/20 dark:border-gray-700/30 p-8 shadow-2xl shadow-blue-500/5 dark:shadow-none">
      <div class="flex flex-col md:flex-row justify-between items-start gap-6">
        <div>
          <div class="flex items-center gap-3 mb-3">
             <button 
               @click="router.back()" 
               class="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-500 dark:text-gray-400"
               :title="tCommon.back"
             >
               <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
             </button>
             <span class="inline-flex items-center justify-center rounded-lg bg-blue-100/80 dark:bg-blue-900/30 px-3 py-1 text-sm font-bold text-blue-700 dark:text-blue-300 tracking-wide uppercase">
                {{ course.major }}
             </span>
             <span class="text-sm text-gray-500 dark:text-gray-400 font-medium tracking-wide">CODE: {{ course.course_code }}</span>
          </div>
          <h1 class="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-2 tracking-tight">
            {{ course.course_name }}
          </h1>
          <p class="text-lg text-gray-600 dark:text-gray-300 font-medium flex items-center">
            <span class="opacity-70 mr-2">{{ t.professor }}:</span>
            {{ course.professor || 'N/A' }}
          </p>
        </div>
        <button 
          v-if="authStore.token"
          @click="showForm = !showForm"
          class="w-full md:w-auto shrink-0 rounded-xl bg-blue-600 px-6 py-3 text-white font-semibold shadow-lg shadow-blue-500/30 hover:bg-blue-700 hover:-translate-y-0.5 transition-all active:translate-y-0"
        >
          {{ showForm ? t.cancel_review : t.write_review }}
        </button>
      </div>

      <!-- Stats Summary -->
      <div v-if="stats" class="mt-10 grid grid-cols-2 md:grid-cols-4 gap-6 border-t border-gray-200/50 dark:border-gray-700/50 pt-8">
        <div class="text-center p-4 rounded-2xl bg-white/30 dark:bg-gray-800/30 border border-white/20 dark:border-gray-700/30 backdrop-blur-sm">
          <div class="text-3xl font-black bg-gradient-to-br from-blue-600 to-indigo-600 bg-clip-text text-transparent">{{ stats.avgRating }}</div>
          <div class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-1">{{ t.avg_rating }}</div>
        </div>
        <div class="text-center p-4 rounded-2xl bg-white/30 dark:bg-gray-800/30 border border-white/20 dark:border-gray-700/30 backdrop-blur-sm">
          <div class="text-2xl font-bold text-gray-700 dark:text-gray-200">{{ stats.avgTeaching }}</div>
          <div class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-1">{{ t.teaching_diff }}</div>
        </div>
        <div class="text-center p-4 rounded-2xl bg-white/30 dark:bg-gray-800/30 border border-white/20 dark:border-gray-700/30 backdrop-blur-sm">
          <div class="text-2xl font-bold text-gray-700 dark:text-gray-200">{{ stats.avgAssignment }}</div>
          <div class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-1">{{ t.assignment_diff }}</div>
        </div>
        <div class="text-center p-4 rounded-2xl bg-white/30 dark:bg-gray-800/30 border border-white/20 dark:border-gray-700/30 backdrop-blur-sm">
          <div class="text-2xl font-bold text-gray-700 dark:text-gray-200">{{ stats.avgExam }}</div>
          <div class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-1">{{ t.exam_diff }}</div>
        </div>
      </div>
    </div>

    <!-- Evaluation Form -->
    <transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="transform -translate-y-4 opacity-0"
      enter-to-class="transform translate-y-0 opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="transform translate-y-0 opacity-100"
      leave-to-class="transform -translate-y-4 opacity-0"
    >
    <div v-if="showForm" class="mb-10 rounded-3xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/30 p-8 shadow-xl dark:shadow-none">
      <h3 class="text-xl font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-2">
        <span class="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-lg">✏️</span> {{ t.new_review }}
      </h3>
      <form @submit.prevent="submitEvaluation" class="space-y-8">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <!-- Ratings -->
          <div class="space-y-6">
             <div v-for="(label, key) in {overall_rating: t.avg_rating, teaching_difficulty: t.teaching_diff, assignment_difficulty: t.assignment_diff, exam_difficulty: t.exam_diff}" :key="key">
                <div class="flex justify-between mb-2">
                   <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">{{ label }}</label>
                   <span class="text-sm font-bold text-blue-600 dark:text-blue-400">{{ formData[key] }}</span>
                </div>
                <input type="range" min="1" max="10" v-model.number="formData[key]" class="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600" />
             </div>
          </div>
          
          <div class="space-y-6">
             <!-- Booleans -->
             <div class="flex flex-col gap-4">
               <label class="flex items-center p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                 <input type="checkbox" v-model="formData.has_tests" class="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600" />
                 <span class="ml-3 font-medium text-gray-700 dark:text-gray-200">{{ t.has_tests }}</span>
               </label>
               <label class="flex items-center p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                 <input type="checkbox" v-model="formData.has_final_exam" class="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600" />
                 <span class="ml-3 font-medium text-gray-700 dark:text-gray-200">{{ t.has_final }}</span>
               </label>
               <label class="flex items-center p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                 <input type="checkbox" v-model="formData.attendance_checked" class="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600" />
                 <span class="ml-3 font-medium text-gray-700 dark:text-gray-200">{{ t.attendance }}</span>
               </label>
             </div>
          </div>
        </div>

        <!-- Comment -->
        <div>
          <textarea 
            v-model="formData.comment" 
            rows="4" 
            class="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
            :placeholder="t.review_placeholder"
          ></textarea>
        </div>

        <button type="submit" class="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 transform hover:-translate-y-0.5 transition-all active:translate-y-0">
          {{ t.submit }}
        </button>
      </form>
    </div>
    </transition>

    <!-- Evaluation List Header -->
    <div class="flex flex-col md:flex-row justify-between items-center mb-8">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4 md:mb-0 flex items-center gap-3">
        {{ t.reviews }} <span class="px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-sm font-bold text-gray-600 dark:text-gray-400">{{ evaluations.length }}</span>
      </h2>
      
      <div class="flex items-center gap-2 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
        <span class="text-sm text-gray-500 dark:text-gray-400">{{ t.sort }}:</span>
        <select v-model="sortBy" class="bg-transparent border-none text-sm font-medium text-gray-700 dark:text-gray-200 focus:ring-0 cursor-pointer p-0 pr-8">
          <option value="newest">{{ t.sort_newest }}</option>
          <option value="oldest">{{ t.sort_oldest }}</option>
          <option value="rating_desc">{{ t.sort_high }}</option>
          <option value="rating_asc">{{ t.sort_low }}</option>
        </select>
      </div>
    </div>

    <!-- Evaluation List -->
    <div class="space-y-6">
      <div 
        v-for="evaluation in sortedEvaluations" 
        :key="evaluation.id" 
        class="rounded-2xl bg-white/60 dark:bg-gray-800/40 backdrop-blur-md border border-white/20 dark:border-gray-700/30 p-6 md:p-8 shadow-sm hover:shadow-md transition-all"
      >
        <div class="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
          <div class="flex items-center space-x-4">
            <div class="h-12 w-12 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-lg shadow-inner shrink-0">
              {{ evaluation.username.charAt(0).toUpperCase() }}
            </div>
            <div>
              <div class="font-bold text-gray-900 dark:text-white text-lg">{{ evaluation.username }}</div>
              <div class="text-xs font-medium text-gray-500 dark:text-gray-400">{{ new Date(evaluation.created_at).toLocaleDateString() }}</div>
            </div>
          </div>
          
          <div class="flex flex-col items-start sm:items-end w-full sm:w-auto">
            <div class="flex items-center justify-between sm:justify-end w-full space-x-3">
              <div class="flex items-baseline space-x-1 px-3 py-1 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                  <span class="text-2xl font-black" :class="evaluation.overall_rating >= 8 ? 'text-green-500' : evaluation.overall_rating >= 6 ? 'text-yellow-500' : 'text-red-500'">
                    {{ evaluation.overall_rating }}
                  </span>
                  <span class="text-gray-400 text-xs font-bold">/ 10</span>
              </div>
              <div v-if="authStore.isAdmin() || (authStore.user && authStore.user.id === evaluation.user_id)" class="flex space-x-1">
                  <button 
                    @click="router.push(`/evaluation/edit/${evaluation.id}`)"
                    class="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    :title="t.edit"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                  </button>
                  <button 
                    @click="handleDeleteEvaluation(evaluation.id)"
                    class="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    :title="t.delete"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                  </button>
              </div>
            </div>
          </div>
        </div>

        <div class="mb-6 flex flex-wrap gap-3">
            <div class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700/50 text-xs font-medium text-gray-700 dark:text-gray-300">
              <span class="text-gray-400 uppercase tracking-wider text-[10px]">{{ t.teaching_diff }}</span>
              <span class="font-bold">{{ evaluation.teaching_difficulty }}</span>
            </div>
            <div class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700/50 text-xs font-medium text-gray-700 dark:text-gray-300">
              <span class="text-gray-400 uppercase tracking-wider text-[10px]">{{ t.assignment_diff }}</span>
              <span class="font-bold">{{ evaluation.assignment_difficulty }}</span>
            </div>
            <div class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700/50 text-xs font-medium text-gray-700 dark:text-gray-300">
              <span class="text-gray-400 uppercase tracking-wider text-[10px]">{{ t.exam_diff }}</span>
              <span class="font-bold">{{ evaluation.exam_difficulty }}</span>
            </div>
            
            <span v-if="evaluation.has_tests" class="px-3 py-1.5 rounded-lg bg-green-100/50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs font-bold border border-green-100 dark:border-green-900/30">{{ t.has_tests }}</span>
            <span v-else class="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700/30 text-gray-500 dark:text-gray-400 text-xs font-medium border border-gray-100 dark:border-gray-700">{{ t.no_tests }}</span>
            
            <span v-if="evaluation.has_final_exam" class="px-3 py-1.5 rounded-lg bg-green-100/50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs font-bold border border-green-100 dark:border-green-900/30">{{ t.has_final }}</span>
            <span v-else class="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700/30 text-gray-500 dark:text-gray-400 text-xs font-medium border border-gray-100 dark:border-gray-700">{{ t.no_final }}</span>
            
            <span v-if="evaluation.attendance_checked" class="px-3 py-1.5 rounded-lg bg-orange-100/50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 text-xs font-bold border border-orange-100 dark:border-orange-900/30">{{ t.attendance }}</span>
            <span v-else class="px-3 py-1.5 rounded-lg bg-green-100/50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs font-bold border border-green-100 dark:border-green-900/30">{{ t.no_attendance }}</span>
        </div>

        <div class="bg-gray-50 dark:bg-gray-900/30 p-5 rounded-xl border border-gray-100 dark:border-gray-700/50">
          <p class="text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed text-sm md:text-base">
            {{ evaluation.comment || t.no_reviews }}
          </p>
        </div>
      </div>
      
      <div v-if="evaluations.length === 0" class="text-center py-16 bg-white/40 dark:bg-gray-800/40 backdrop-blur rounded-3xl border border-white/20 dark:border-gray-700/30">
        <div class="text-6xl mb-4 opacity-50 grayscale">📝</div>
        <p class="text-gray-500 dark:text-gray-400 text-lg font-medium">{{ t.no_reviews }}</p>
        <button 
          v-if="authStore.token"
          @click="showForm = true"
          class="mt-6 text-blue-600 dark:text-blue-400 font-bold hover:underline"
        >
          {{ t.write_review }}
        </button>
      </div>
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
