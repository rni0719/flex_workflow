import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ワークフロー関連のAPI
export const getWorkflows = () => api.get('/api/workflows');
export const getWorkflow = (id) => api.get(`/api/workflows/${id}`);
export const createWorkflow = (data) => api.post('/api/workflows', data);
export const updateWorkflow = (id, data) => api.put(`/api/workflows/${id}`, data);
export const deleteWorkflow = (id) => api.delete(`/api/workflows/${id}`);
export const getWorkflowTasks = (id) => api.get(`/api/workflows/${id}/tasks`);

// タスク関連のAPI
export const createTask = (data) => api.post('/api/tasks', data);
export const getTask = (id) => api.get(`/api/tasks/${id}`);
export const updateTask = (id, data) => api.put(`/api/tasks/${id}`, data);
export const deleteTask = (id) => api.delete(`/api/tasks/${id}`);

export default api;
