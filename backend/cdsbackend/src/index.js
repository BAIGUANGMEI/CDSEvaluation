// src/index.js
import { Router } from './router';
import { 
  register, login, 
  getCourses, createCourse, getCourseDetail, updateCourse, deleteCourse,
  createEvaluation, getCourseEvaluations, getUserEvaluations, updateEvaluation, deleteEvaluation, getEvaluationDetail,
  getStatistics
} from './handlers';

const router = new Router();

// Auth
router.post("/api/auth/register", register);
router.post("/api/auth/login", login);

// Courses
router.get("/api/courses", getCourses);
router.post("/api/courses", createCourse);
router.get("/api/courses/(\\d+)", getCourseDetail);
router.post("/api/courses/update/(\\d+)", updateCourse);
router.post("/api/courses/delete/(\\d+)", deleteCourse);

// Evaluations
router.post("/api/evaluations", createEvaluation);
router.get("/api/courses/(\\d+)/evaluations", getCourseEvaluations);
router.get("/api/user/evaluations", getUserEvaluations);
router.get("/api/evaluations/(\\d+)", getEvaluationDetail);
router.post("/api/evaluations/update/(\\d+)", updateEvaluation);
router.post("/api/evaluations/delete/(\\d+)", deleteEvaluation);

// Statistics
router.get("/api/statistics", getStatistics);

export default {
  async fetch(request, env, ctx) {
    return router.handle(request, env, ctx);
  },
};
