<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '../api/axios';
import BaseModal from '../components/BaseModal.vue';

const route = useRoute();
const router = useRouter();
const isEdit = computed(() => route.params.id !== 'new');
const loading = ref(false);
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
  course_code: '',
  course_name: '',
  professor: '',
  major: ''
});

const majors = ['CS', 'ECIC', 'FTDA', 'STAT'];

onMounted(async () => {
  if (isEdit.value) {
    loading.value = true;
    try {
      const res = await api.get(`/api/courses/${route.params.id}`);
      const data = res.data;
      formData.value = {
        course_code: data.course_code,
        course_name: data.course_name,
        professor: data.professor || '',
        major: data.major || ''
      };
    } catch (e) {
      errorMsg.value = '加载课程信息失败';
    } finally {
      loading.value = false;
    }
  }
});

const handleSubmit = async () => {
  loading.value = true;
  errorMsg.value = '';
  try {
    if (isEdit.value) {
      await api.post(`/api/courses/update/${route.params.id}`, formData.value);
      showMessage('成功', '修改成功', 'success');
    } else {
      await api.post('/api/courses', formData.value);
      showMessage('成功', '创建成功', 'success');
    }
    // Delay navigation to let user see the message
    setTimeout(() => {
      router.push('/');
    }, 1500);
  } catch (e) {
    errorMsg.value = e.message || '操作失败';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <div class="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6 md:p-8">
      <h1 class="text-2xl font-bold text-gray-800 mb-6">
        {{ isEdit ? '编辑课程' : '新增课程' }}
      </h1>

      <div v-if="loading && isEdit" class="text-center py-8">加载中...</div>

      <form v-else @submit.prevent="handleSubmit" class="space-y-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">课程编号</label>
          <input 
            v-model="formData.course_code" 
            type="text" 
            required
            placeholder="例如: CS101"
            class="w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            :disabled="isEdit"
          />
          <p v-if="isEdit" class="text-xs text-gray-500 mt-1">课程编号不可修改</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">课程名称</label>
          <input 
            v-model="formData.course_name" 
            type="text" 
            required
            placeholder="例如: Intro to CS"
            class="w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">教授姓名 (选填)</label>
          <input 
            v-model="formData.professor" 
            type="text" 
            class="w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">所属专业</label>
          <div class="relative">
            <select 
              v-model="formData.major"
              class="appearance-none w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md p-2 pr-10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none text-gray-900 dark:text-white transition-colors"
            >
              <option value="">请选择专业</option>
              <option v-for="m in majors" :key="m" :value="m">{{ m }}</option>
            </select>
            <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 dark:text-gray-400">
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>

        <div v-if="errorMsg" class="text-red-500 text-sm">{{ errorMsg }}</div>

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
            {{ loading ? '提交中...' : '提交' }}
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
