import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Add timeout for production
  timeout: 30000,
});

// Request interceptor for auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// File upload helper with proper URL handling
export const uploadFile = async (file: File, category: string, uploadedBy?: string) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('category', category);
  if (uploadedBy) {
    formData.append('uploadedBy', uploadedBy);
  }
  
  const response = await api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};

// Get file URL for display
export const getFileUrl = (relativePath: string) => {
  const baseUrl = process.env.NEXT_PUBLIC_FILE_URL || 'https://api.shreyask.tech/uploads';
  return `${baseUrl}/${relativePath}`;
};

// Attendance API
export const attendanceApi = {
  create: (data: any) => api.post('/api/attendance', data),
  getEmployeeAttendance: (employeeId: string, year: number, month: number) =>
    api.get(`/api/attendance/employee/${employeeId}?year=${year}&month=${month}`),
  getSiteAttendance: (siteId: string, startDate: string, endDate: string) =>
    api.get(`/api/attendance/site/${siteId}?startDate=${startDate}&endDate=${endDate}`),
  bulkCreate: (data: any) => api.post('/api/attendance/bulk', data),
  delete: (attendanceId: string) => api.delete(`/api/attendance/${attendanceId}`),
};

// Excel API
export const excelApi = {
  upload: (file: File, uploadType?: string, uploadedBy?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    if (uploadType) formData.append('uploadType', uploadType);
    if (uploadedBy) formData.append('uploadedBy', uploadedBy);
    return api.post('/api/excel/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  preview: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/api/excel/preview', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// Payroll API
export const payrollApi = {
  calculate: (data: any) => api.post('/api/payroll/calculate', data),
  recalculateMonth: (data: any) => api.post('/api/payroll/recalculate-month', data),
  getEmployeePayroll: (employeeId: string, year: number, month: number) =>
    api.get(`/api/payroll/employee/${employeeId}?year=${year}&month=${month}`),
  getMonthPayroll: (year: number, month: number) =>
    api.get(`/api/payroll/month?year=${year}&month=${month}`),
};

// Employee API
export const employeeApi = {
  getAll: () => api.get('/api/employees'),
  getOne: (id: string) => api.get(`/api/employees/${id}`),
  create: (formData: FormData) => 
    api.post('/api/employees', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  update: (id: string, formData: FormData) =>
    api.put(`/api/employees/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  uploadDocuments: (id: string, formData: FormData) =>
    api.post(`/api/employees/${id}/documents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  delete: (id: string) => api.delete(`/api/employees/${id}`),
};

// Trade Category API
export const tradeCategoryApi = {
  getAll: () => api.get('/api/trade-categories'),
  getOne: (id: string) => api.get(`/api/trade-categories/${id}`),
  create: (data: any) => api.post('/api/trade-categories', data),
  update: (id: string, data: any) => api.put(`/api/trade-categories/${id}`, data),
  delete: (id: string) => api.delete(`/api/trade-categories/${id}`),
};

// Site API
export const siteApi = {
  getAll: (clientId?: string) =>
    api.get(`/api/sites${clientId ? `?clientId=${clientId}` : ''}`),
  getOne: (id: string) => api.get(`/api/sites/${id}`),
  create: (data: any) => api.post('/api/sites', data),
  update: (id: string, data: any) => api.put(`/api/sites/${id}`, data),
  delete: (id: string) => api.delete(`/api/sites/${id}`),
};

// Month Lock API
export const monthLockApi = {
  getAll: () => api.get('/api/month-locks'),
  getOne: (year: number, month: number) =>
    api.get(`/api/month-locks/${year}/${month}`),
  lock: (data: any) => api.post('/api/month-locks/lock', data),
  unlock: (data: any) => api.post('/api/month-locks/unlock', data),
};

// Client API
export const clientApi = {
  getAll: () => api.get('/api/clients'),
  getOne: (id: string) => api.get(`/api/clients/${id}`),
  create: (data: any) => api.post('/api/clients', data),
  update: (id: string, data: any) => api.put(`/api/clients/${id}`, data),
  delete: (id: string) => api.delete(`/api/clients/${id}`),
};

