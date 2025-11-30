import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://cdsbackend.meizhihan111.workers.dev', 
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器：添加 Token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 响应拦截器：统一处理错误
api.interceptors.response.use(
  (response) => {
    const res = response.data;
    // 如果后端返回的状态码不是 2xx，视为业务错误（根据你的实际情况调整）
    // 这里假设只要 HTTP 状态码是 200 就是成功，业务错误码由 code 字段判断
    if (res.code && res.code !== 200 && res.code !== 201) {
      // 可以结合 UI 库弹出提示
      console.error(res.msg || 'Error');
      return Promise.reject(new Error(res.msg || 'Error'));
    }
    return res;
  },
  (error) => {
    console.error(error);
    if (error.response && error.response.status === 401) {
      // 未登录或 Token 过期，跳转登录
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
