<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '../api/axios';
import BaseModal from '../components/BaseModal.vue';

const route = useRoute();
const router = useRouter();
const loading = ref(true);
const errorMsg = ref('');

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

const evaluationId = route.params.id;

onMounted(async () => {
  try {
    const res = await api.get(`/api/evaluations/${evaluationId}`);
    const evaluation = res.data;
    
    if (evaluation) {
      formData.value = {
        overall_rating: evaluation.overall_rating,
        teaching_difficulty: evaluation.teaching_difficulty,
        assignment_difficulty: evaluation.assignment_difficulty,
        exam_difficulty: evaluation.exam_difficulty,
        has_tests: !!evaluation.has_tests,
        has_final_exam: !!evaluation.has_final_exam,
        attendance_checked: !!evaluation.attendance_checked,
        comment: evaluation.comment || ''
      };
    }
  } catch (e) {
    errorMsg.value = '加载评价失败';
  } finally {
    loading.value = false;
  }
});

const handleSubmit = async () => {
  loading.value = true;
  try {
    await api.post(`/api/evaluations/update/${evaluationId}`, formData.value);
    showMessage('成功', '修改成功', 'success');
    setTimeout(() => {
      router.back();
    }, 1500);
  } catch (e) {
    errorMsg.value = e.message || '修改失败';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <div class="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6 md:p-8">
      <h1 class="text-2xl font-bold text-gray-800 mb-6">修改评价</h1>

      <div v-if="loading" class="text-center py-8">加载中...</div>
      
      <div v-else-if="errorMsg" class="text-center text-red-500 py-8">{{ errorMsg }}</div>

      <form v-else @submit.prevent="handleSubmit" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700">总体评分 (1-10)</label>
            <input type="number" min="1" max="10" v-model="formData.overall_rating" class="w-full border border-gray-300 rounded-md p-2" />
          </div>
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700">授课难度 (1-10)</label>
            <input type="number" min="1" max="10" v-model="formData.teaching_difficulty" class="w-full border border-gray-300 rounded-md p-2" />
          </div>
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700">作业难度 (1-10)</label>
            <input type="number" min="1" max="10" v-model="formData.assignment_difficulty" class="w-full border border-gray-300 rounded-md p-2" />
          </div>
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700">考试难度 (1-10)</label>
            <input type="number" min="1" max="10" v-model="formData.exam_difficulty" class="w-full border border-gray-300 rounded-md p-2" />
          </div>
        </div>

        <div class="flex space-x-6 py-2">
          <label class="flex items-center">
            <input type="checkbox" v-model="formData.has_tests" class="mr-2" />
            有课内测试
          </label>
          <label class="flex items-center">
            <input type="checkbox" v-model="formData.has_final_exam" class="mr-2" />
            有期末考试
          </label>
          <label class="flex items-center">
            <input type="checkbox" v-model="formData.attendance_checked" class="mr-2" />
            考勤
          </label>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">评价内容</label>
          <textarea 
            v-model="formData.comment" 
            rows="4" 
            class="w-full border border-gray-300 rounded-md p-2"
          ></textarea>
        </div>

        <div class="flex justify-end space-x-4">
          <button 
            type="button" 
            @click="router.back()"
            class="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
          >
            取消
          </button>
          <button 
            type="submit" 
            :disabled="loading"
            class="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            保存修改
          </button>
        </div>
      </form>
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
