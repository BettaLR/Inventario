import api from './api';

export const obtenerInventarioValorizado = () => api.get('/reportes/inventario-valorizado').then((r) => r.data);
export const obtenerRotacion = (dias) => api.get('/reportes/rotacion', { params: { dias } }).then((r) => r.data);
export const obtenerMermas = () => api.get('/reportes/mermas').then((r) => r.data);
export const obtenerAlertasStock = () => api.get('/reportes/alertas-stock').then((r) => r.data);

const descargarArchivo = async (url, nombreArchivo) => {
  const response = await api.get(url, { responseType: 'blob' });
  const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = blobUrl;
  link.setAttribute('download', nombreArchivo);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(blobUrl);
};

export const descargarInventarioPdf = () =>
  descargarArchivo('/reportes/inventario-valorizado/pdf', 'inventario-valorizado.pdf');

export const descargarInventarioExcel = () =>
  descargarArchivo('/reportes/inventario-valorizado/excel', 'inventario-valorizado.xlsx');
