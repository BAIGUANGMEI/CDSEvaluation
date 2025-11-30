<script setup>
import { watch } from 'vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  title: {
    type: String,
    default: '提示'
  },
  confirmText: {
    type: String,
    default: '确定'
  },
  cancelText: {
    type: String,
    default: '取消'
  },
  showCancel: {
    type: Boolean,
    default: true
  },
  type: {
    type: String,
    default: 'info', // info, success, warning, error
    validator: (value) => ['info', 'success', 'warning', 'error'].includes(value)
  }
});

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel']);

const close = () => {
  emit('update:modelValue', false);
  emit('cancel');
};

const confirm = () => {
  emit('confirm');
};

// Prevent background scrolling when modal is open
watch(() => props.modelValue, (val) => {
  if (val) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
});
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-black/60 backdrop-blur-sm p-4 md:p-0" @click.self="close">
        <div class="relative w-full max-w-md transform rounded-3xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-white/20 dark:border-gray-700/30 shadow-2xl transition-all dark:text-white">
          
          <!-- Header -->
          <div class="flex items-center justify-between border-b border-gray-200/50 dark:border-gray-700/50 px-6 py-5">
            <h3 class="text-lg font-bold flex items-center gap-3">
              <span v-if="type === 'success'" class="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-lg">✓</span>
              <span v-else-if="type === 'warning'" class="flex items-center justify-center w-8 h-8 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 text-lg">!</span>
              <span v-else-if="type === 'error'" class="flex items-center justify-center w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-lg">✕</span>
              <span v-else class="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-lg">i</span>
              {{ title }}
            </h3>
            <button @click="close" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors bg-gray-100 dark:bg-gray-700/50 p-1.5 rounded-full">
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Body -->
          <div class="px-8 py-8 text-gray-600 dark:text-gray-300 leading-relaxed text-base">
            <slot></slot>
          </div>

          <!-- Footer -->
          <div class="flex items-center justify-end gap-3 px-6 py-5 bg-gray-50/50 dark:bg-gray-900/30 rounded-b-3xl border-t border-gray-200/50 dark:border-gray-700/50">
            <button 
              v-if="showCancel"
              @click="close"
              class="rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-5 py-2.5 text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500/50 transition-all"
            >
              {{ cancelText }}
            </button>
            <button 
              @click="confirm"
              class="rounded-xl px-6 py-2.5 text-sm font-bold text-white shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-all transform active:scale-95"
              :class="{
                'bg-blue-600 hover:bg-blue-700 shadow-blue-500/30': type === 'info',
                'bg-green-600 hover:bg-green-700 shadow-green-500/30': type === 'success',
                'bg-yellow-600 hover:bg-yellow-700 shadow-yellow-500/30': type === 'warning',
                'bg-red-600 hover:bg-red-700 shadow-red-500/30': type === 'error',
              }"
            >
              {{ confirmText }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .transform,
.modal-leave-active .transform {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-enter-from .transform,
.modal-leave-to .transform {
  opacity: 0;
  transform: scale(0.9) translateY(20px);
}
</style>
