import api from './api';

export const obtenerStats = () => api.get('/dashboard/stats').then((r) => r.data);
