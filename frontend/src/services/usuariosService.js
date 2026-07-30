import api from './api';

export const listarUsuarios = () => api.get('/usuarios').then((r) => r.data);
export const listarRoles = () => api.get('/usuarios/roles').then((r) => r.data);
export const actualizarEstadoUsuario = (id, activo) =>
  api.patch(`/usuarios/${id}/estado`, { activo }).then((r) => r.data);
