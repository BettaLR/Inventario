import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  obtenerInventarioValorizado, obtenerRotacion, obtenerMermas, obtenerAlertasStock,
  descargarInventarioPdf, descargarInventarioExcel,
} from '../services/reportesService';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';

const TABS = [
  { key: 'valorizado', label: 'Inventario valorizado' },
  { key: 'rotacion', label: 'Rotación de productos' },
  { key: 'mermas', label: 'Mermas' },
  { key: 'alertas', label: 'Alertas de stock' },
];

// Helper para exportar cualquier arreglo de objetos a CSV/Excel compatible
function exportarCSV(items, nombreArchivo) {
  if (!items || !items.length) {
    toast.error('No hay datos disponibles para exportar');
    return;
  }
  const headers = Object.keys(items[0]);
  const rows = items.map((row) =>
    headers.map((h) => `"${String(row[h] ?? '').replace(/"/g, '""')}"`).join(',')
  );
  const csvContent = [headers.join(','), ...rows].join('\n');
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${nombreArchivo}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function ReportesPage() {
  const [tab, setTab] = useState('valorizado');
  const [exportando, setExportando] = useState('');

  // Queries para tener datos de exportación listos en cada pestaña
  const queryValorizado = useQuery({ queryKey: ['reporte-valorizado'], queryFn: obtenerInventarioValorizado });
  const queryRotacion = useQuery({ queryKey: ['reporte-rotacion', 30], queryFn: () => obtenerRotacion(30) });
  const queryMermas = useQuery({ queryKey: ['reporte-mermas'], queryFn: obtenerMermas });
  const queryAlertas = useQuery({ queryKey: ['reporte-alertas'], queryFn: obtenerAlertasStock });

  const exportar = async (tipo) => {
    setExportando(tipo);
    try {
      if (tab === 'valorizado') {
        if (tipo === 'pdf') await descargarInventarioPdf();
        else await descargarInventarioExcel();
      } else if (tab === 'rotacion') {
        exportarCSV(queryRotacion.data?.items || [], `reporte-rotacion-${new Date().toISOString().slice(0, 10)}`);
      } else if (tab === 'mermas') {
        exportarCSV(queryMermas.data || [], `reporte-mermas-${new Date().toISOString().slice(0, 10)}`);
      } else if (tab === 'alertas') {
        exportarCSV(queryAlertas.data || [], `reporte-alertas-stock-${new Date().toISOString().slice(0, 10)}`);
      }
      toast.success(`Reporte ${tipo.toUpperCase()} descargado exitosamente`);
    } catch {
      toast.error('No se pudo generar el archivo de reporte');
    } finally {
      setExportando('');
    }
  };

  return (
    <div className="space-y-6 pb-8 font-sans w-full">
      {/* 1. Cabecera Principal y Botones de Exportación Superiores */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight font-heading">Reportes de Inventario</h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            Inventario valorizado, rotación, mermas y alertas de stock en tiempo real
          </p>
        </div>

        {/* Botones de Exportación en Esquina Superior Derecha */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => exportar('pdf')}
            disabled={!!exportando}
            className="px-4 py-2 bg-white border border-slate-200/80 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-xs sm:text-sm shadow-2xs flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
          >
            <svg className="w-4 h-4 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <span>{exportando === 'pdf' ? 'Generando...' : 'Exportar PDF'}</span>
          </button>

          <button
            onClick={() => exportar('excel')}
            disabled={!!exportando}
            className="px-4 py-2 bg-white border border-slate-200/80 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-xs sm:text-sm shadow-2xs flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
          >
            <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
            <span>{exportando === 'excel' ? 'Generando...' : 'Exportar Excel'}</span>
          </button>
        </div>
      </div>

      {/* 2. Pestañas de Navegación (Report Tabs Estilo Cápsula) */}
      <div className="border-b border-slate-200/80 flex items-center gap-6 overflow-x-auto no-scrollbar pt-1">
        {TABS.map((t) => {
          const esActivo = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`pb-3 font-semibold text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer ${esActivo
                ? 'text-orange-600 font-bold border-b-2 border-orange-600 -mb-[1px]'
                : 'text-slate-500 hover:text-slate-800'
                }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Renderizado de la Pestaña Activa */}
      {tab === 'valorizado' && <InventarioValorizadoTab data={queryValorizado.data} isLoading={queryValorizado.isLoading} />}
      {tab === 'rotacion' && <RotacionTab data={queryRotacion.data} isLoading={queryRotacion.isLoading} />}
      {tab === 'mermas' && <MermasTab data={queryMermas.data} isLoading={queryMermas.isLoading} />}
      {tab === 'alertas' && <AlertasTab data={queryAlertas.data} isLoading={queryAlertas.isLoading} />}
    </div>
  );
}

// ----------------------------------------------------------------------
// TAB 1: INVENTARIO VALORIZADO CON TARJETA KPI EJECUTIVA
// ----------------------------------------------------------------------
function InventarioValorizadoTab({ data, isLoading }) {
  return (
    <div className="space-y-6">
      {/* Tarjeta Métrica KPI Ejecutiva */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs max-w-sm">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            VALOR TOTAL DEL INVENTARIO
          </p>
        </div>

        <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-heading">
          ${(data?.total || 0).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>

        <p className="text-xs text-slate-400 font-medium mt-1 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
          <span>{data?.items?.length || 0} productos valorizados activos en catálogo</span>
        </p>
      </div>

      {/* Tabla de Reporte en Tarjeta Blanca Estructurada */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex justify-center"><Spinner /></div>
        ) : !data?.items?.length ? (
          <EmptyState title="Sin datos de inventario valorizado" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4 w-[15%]">Código (SKU)</th>
                  <th className="py-3.5 px-4 w-[35%]">Producto</th>
                  <th className="py-3.5 px-4 w-[18%]">Categoría</th>
                  <th className="py-3.5 px-4 w-[10%] text-right">Stock</th>
                  <th className="py-3.5 px-4 w-[11%] text-right">Precio</th>
                  <th className="py-3.5 px-4 w-[11%] text-right">Valor Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {data.items.map((r) => (
                  <tr key={r.codigo} className="hover:bg-slate-50/80 transition-colors duration-150 group">
                    <td className="py-3.5 px-4 align-middle font-mono text-slate-400 text-xs whitespace-nowrap">
                      {r.codigo}
                    </td>

                    <td className="py-3.5 px-4 align-middle">
                      <p className="font-semibold text-slate-900 text-xs sm:text-sm group-hover:text-orange-600 transition-colors">
                        {r.nombre}
                      </p>
                    </td>

                    <td className="py-3.5 px-4 align-middle whitespace-nowrap">
                      {r.categoria ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200/70">
                          {r.categoria}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 align-middle text-right font-semibold text-slate-800 whitespace-nowrap">
                      {r.stock_total} pzs
                    </td>

                    <td className="py-3.5 px-4 align-middle text-right font-semibold text-slate-800 whitespace-nowrap">
                      ${Number(r.precio_unitario).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </td>

                    <td className="py-3.5 px-4 align-middle text-right font-bold text-slate-900 text-xs sm:text-sm whitespace-nowrap">
                      ${Number(r.valor_total).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// TAB 2: ROTACIÓN DE PRODUCTOS
// ----------------------------------------------------------------------
function RotacionTab({ data, isLoading }) {
  const totalSalidas = (data?.items || []).reduce((acc, r) => acc + Number(r.unidades_salida || 0), 0);

  return (
    <div className="space-y-6">
      {/* Tarjeta KPI Rotación */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs max-w-sm">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            TOTAL UNIDADES SALIDA (30 DÍAS)
          </p>
        </div>

        <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-heading">
          {totalSalidas.toLocaleString('es-MX')} <span className="text-sm font-semibold text-slate-500">pzs</span>
        </p>

        <p className="text-xs text-slate-400 font-medium mt-1">
          Movimientos de despacho y rotación en catálogo
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex justify-center"><Spinner /></div>
        ) : !data?.items?.length ? (
          <EmptyState title="Sin movimientos en el periodo seleccionado" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Producto</th>
                  <th className="py-3.5 px-4 text-right">Unidades Salida</th>
                  <th className="py-3.5 px-4 text-right">Unidades Entrada</th>
                  <th className="py-3.5 px-4 text-right">Total Movimientos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {data.items.map((r) => (
                  <tr key={r.codigo} className="hover:bg-slate-50/80 transition-colors duration-150 group">
                    <td className="py-3.5 px-4 align-middle">
                      <p className="font-semibold text-slate-900 text-xs sm:text-sm group-hover:text-orange-600 transition-colors">
                        {r.nombre}
                      </p>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">{r.codigo}</p>
                    </td>
                    <td className="py-3.5 px-4 align-middle text-right font-bold text-rose-600 whitespace-nowrap">
                      -{r.unidades_salida}
                    </td>
                    <td className="py-3.5 px-4 align-middle text-right font-bold text-emerald-600 whitespace-nowrap">
                      +{r.unidades_entrada}
                    </td>
                    <td className="py-3.5 px-4 align-middle text-right font-bold text-slate-900 whitespace-nowrap">
                      {r.total_movimientos}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// TAB 3: MERMAS DE INVENTARIO
// ----------------------------------------------------------------------
function MermasTab({ data, isLoading }) {
  const totalPerdidas = (data || []).reduce((acc, m) => acc + Number(m.unidades_perdidas || 0), 0);

  return (
    <div className="space-y-6">
      {/* Tarjeta KPI Mermas */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs max-w-sm">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            TOTAL UNIDADES PERDIDAS
          </p>
        </div>

        <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-heading">
          {totalPerdidas.toLocaleString('es-MX')} <span className="text-sm font-semibold text-slate-500">pzs</span>
        </p>

        <p className="text-xs text-slate-400 font-medium mt-1">
          Ajustes negativos y pérdidas registradas
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex justify-center"><Spinner /></div>
        ) : !data?.length ? (
          <EmptyState title="Sin mermas registradas" subtitle="Los ajustes que reducen stock aparecerán registrados aquí." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Fecha</th>
                  <th className="py-3.5 px-4">Producto</th>
                  <th className="py-3.5 px-4">Almacén</th>
                  <th className="py-3.5 px-4 text-right">Unidades Perdidas</th>
                  <th className="py-3.5 px-4">Motivo</th>
                  <th className="py-3.5 px-4 text-right">Usuario</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {data.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/80 transition-colors duration-150 group">
                    <td className="py-3.5 px-4 align-middle text-slate-500 font-medium text-xs whitespace-nowrap">
                      {new Date(m.created_at).toLocaleDateString('es-MX')}
                    </td>
                    <td className="py-3.5 px-4 align-middle">
                      <p className="font-semibold text-slate-900 text-xs sm:text-sm group-hover:text-orange-600 transition-colors">
                        {m.nombre}
                      </p>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">{m.codigo}</p>
                    </td>
                    <td className="py-3.5 px-4 align-middle text-slate-600 font-medium text-xs whitespace-nowrap">
                      {m.almacen}
                    </td>
                    <td className="py-3.5 px-4 align-middle text-right font-bold text-rose-600 whitespace-nowrap">
                      -{m.unidades_perdidas}
                    </td>
                    <td className="py-3.5 px-4 align-middle text-slate-600 text-xs font-medium">
                      {m.motivo || '—'}
                    </td>
                    <td className="py-3.5 px-4 align-middle text-right text-slate-800 font-semibold text-xs whitespace-nowrap">
                      {m.usuario_nombre || 'Sistema'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// TAB 4: ALERTAS DE STOCK CRÍTICO
// ----------------------------------------------------------------------
function AlertasTab({ data, isLoading }) {
  const countCritico = (data || []).length;

  return (
    <div className="space-y-6">
      {/* Tarjeta KPI Alertas */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs max-w-sm">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            PRODUCTOS EN STOCK CRÍTICO
          </p>
        </div>

        <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-heading">
          {countCritico} <span className="text-sm font-semibold text-slate-500">productos</span>
        </p>

        <p className="text-xs text-slate-400 font-medium mt-1">
          Artículos en o por debajo del límite mínimo
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex justify-center"><Spinner /></div>
        ) : !data?.length ? (
          <EmptyState title="Todo el stock se encuentra en niveles saludables" subtitle="No hay productos por debajo del stock mínimo." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Producto</th>
                  <th className="py-3.5 px-4">Categoría</th>
                  <th className="py-3.5 px-4 text-right">Stock Actual</th>
                  <th className="py-3.5 px-4 text-right">Stock Mínimo</th>
                  <th className="py-3.5 px-4 text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {data.map((p) => {
                  const agotado = p.stock_total === 0;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors duration-150 group">
                      <td className="py-3.5 px-4 align-middle font-semibold text-slate-900 text-xs sm:text-sm">
                        {p.nombre}
                      </td>
                      <td className="py-3.5 px-4 align-middle whitespace-nowrap">
                        {p.categoria ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200/70">
                            {p.categoria}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className={`py-3.5 px-4 align-middle text-right font-bold ${agotado ? 'text-rose-600' : 'text-amber-700'}`}>
                        {p.stock_total} pzs
                      </td>
                      <td className="py-3.5 px-4 align-middle text-right text-slate-400 font-medium whitespace-nowrap">
                        (Mín. {p.stock_minimo})
                      </td>
                      <td className="py-3.5 px-4 align-middle text-center whitespace-nowrap">
                        <div className="inline-flex items-center justify-center gap-1.5 px-2.5 py-0.5">
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${agotado ? 'bg-rose-500' : 'bg-amber-500'}`} />
                          <span className={`text-xs font-medium ${agotado ? 'text-rose-700 font-bold' : 'text-amber-700'}`}>
                            {agotado ? 'Agotado' : 'Bajo Stock'}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
