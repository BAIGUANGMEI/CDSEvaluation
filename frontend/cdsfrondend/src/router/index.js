import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import Home from '../views/Home.vue';
import Login from '../views/Login.vue';
import CourseDetail from '../views/CourseDetail.vue';
import Profile from '../views/Profile.vue';
import CourseForm from '../views/CourseForm.vue';
import EvaluationEdit from '../views/EvaluationEdit.vue';
import Statistics from '../views/Statistics.vue';

const routes = [
  { path: '/', component: Home },
  { path: '/login', component: Login },
  { path: '/statistics', component: Statistics },
  { path: '/course/:id', component: CourseDetail },
  { 
    path: '/profile', 
    component: Profile,
    meta: { requiresAuth: true }
  },
  // Admin: Create/Edit Course
  { 
    path: '/admin/course/:id', 
    component: CourseForm,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  // Edit Evaluation (Admin or Owner)
  {
    path: '/evaluation/edit/:id',
    component: EvaluationEdit,
    meta: { requiresAuth: true }
  },
  {
    path: '/course/:id',
    component: CourseDetail,
    meta: { requiresAuth: true }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  
  if (to.meta.requiresAuth && !authStore.token) {
    next('/login');
    return;
  }
  
  if (to.meta.requiresAdmin && !authStore.isAdmin()) {
    alert('无权访问');
    next('/');
    return;
  }
  
  next();
});

export default router;
