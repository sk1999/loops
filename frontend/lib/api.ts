import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;

// Attendance API
export const attendanceApi = {
  create: (data: any) => api.post('/attendance', data),
  getEmployeeAttendance: (employeeId: string, year: number, month: number) =>
    api.get(`/attendance/employee/${employeeId}?year=${year}&month=${month}`),
  getSiteAttendance: (siteId: string, startDate: string, endDate: string) =>
    api.get(`/attendance/site/${siteId}?startDate=${startDate}&endDate=${endDate}`),
  bulkCreate: (data: any) => api.post('/attendance/bulk', data),
  delete: (attendanceId: string) => api.delete(`/attendance/${attendanceId}`),
};

// Excel API
export const excelApi = {
  upload: (file: File, uploadType?: string, uploadedBy?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    if (uploadType) formData.append('uploadType', uploadType);
    if (uploadedBy) formData.append('uploadedBy', uploadedBy);
    return api.post('/excel/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  preview: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/excel/preview', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// Payroll API
export const payrollApi = {
  calculate: (data: any) => api.post('/payroll/calculate', data),
  recalculateMonth: (data: any) => api.post('/payroll/recalculate-month', data),
  getEmployeePayroll: (employeeId: string, year: number, month: number) =>
    api.get(`/payroll/employee/${employeeId}?year=${year}&month=${month}`),
  getMonthPayroll: (year: number, month: number) =>
    api.get(`/payroll/month?year=${year}&month=${month}`),
};

// Employee API
export const employeeApi = {
  getAll: () => api.get('/employees'),
  getOne: (id: string) => api.get(`/employees/${id}`),
  create: (formData: FormData) => 
    api.post('/employees', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  update: (id: string, formData: FormData) =>
    api.put(`/employees/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  uploadDocuments: (id: string, formData: FormData) =>
    api.post(`/employees/${id}/documents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  delete: (id: string) => api.delete(`/employees/${id}`),
};

// Trade Category API
export const tradeCategoryApi = {
  getAll: () => api.get('/trade-categories'),
  getOne: (id: string) => api.get(`/trade-categories/${id}`),
  create: (data: any) => api.post('/trade-categories', data),
  update: (id: string, data: any) => api.put(`/trade-categories/${id}`, data),
  delete: (id: string) => api.delete(`/trade-categories/${id}`),
};

// Site API
export const siteApi = {
  getAll: (clientId?: string) =>
    api.get(`/sites${clientId ? `?clientId=${clientId}` : ''}`),
  getOne: (id: string) => api.get(`/sites/${id}`),
  create: (data: any) => api.post('/sites', data),
  update: (id: string, data: any) => api.put(`/sites/${id}`, data),
  delete: (id: string) => api.delete(`/sites/${id}`),
};

// Month Lock API
export const monthLockApi = {
  getAll: () => api.get('/month-locks'),
  getOne: (year: number, month: number) =>
    api.get(`/month-locks/${year}/${month}`),
  lock: (data: any) => api.post('/month-locks/lock', data),
  unlock: (data: any) => api.post('/month-locks/unlock', data),
};

// Client API
export const clientApi = {
  getAll: () => api.get('/clients'),
  getOne: (id: string) => api.get(`/clients/${id}`),
  create: (data: any) => api.post('/clients', data),
  update: (id: string, data: any) => api.put(`/clients/${id}`, data),
  delete: (id: string) => api.delete(`/clients/${id}`),
};

