import { useQuery } from '@tanstack/react-query';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { obtenerStats } from '../services/dashboardService';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useQuery({ queryKey: ['dashboard-stats'], queryFn: obtenerStats });

  return (
    <div className="space-y-6 select-none">
      {isLoading ? (
        <Spinner />
      ) : isError || !data ? (
        <EmptyState title="No se pudo cargar el dashboard" subtitle="Verifica que el servidor esté disponible e intenta de nuevo." />
      ) : (
        <>
          {/* 4 Solid Action Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Orange Card */}
            <div className="bg-amber-500 rounded-sm text-white shadow-sm overflow-hidden flex flex-col justify-between">
              <div className="p-4 flex justify-between items-start">
                <div>
                  <h3 className="text-4xl font-extrabold tracking-tight">{data.totalProductos}</h3>
                  <p className="text-xs font-semibold mt-1 text-amber-100">Entradas en el Inventario</p>
                </div>
                <div className="text-amber-200/80">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                  </svg>
                </div>
              </div>
              <button
                onClick={() => navigate('/productos')}
                className="bg-amber-600/80 hover:bg-amber-700/90 text-amber-50 text-xs py-1.5 px-4 font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Ir a Entradas</span>
                <span className="w-3.5 h-3.5 rounded-full bg-white/20 inline-flex items-center justify-center text-[10px]">&gt;</span>
              </button>
            </div>

            {/* Red Card */}
            <div className="bg-rose-500 rounded-sm text-white shadow-sm overflow-hidden flex flex-col justify-between">
              <div className="p-4 flex justify-between items-start">
                <div>
                  <h3 className="text-4xl font-extrabold tracking-tight">{data.movimientosHoy}</h3>
                  <p className="text-xs font-semibold mt-1 text-rose-100">Salidas del Inventario</p>
                </div>
                <div className="text-rose-200/80">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
              </div>
              <button
                onClick={() => navigate('/kardex')}
                className="bg-rose-600/80 hover:bg-rose-700/90 text-rose-50 text-xs py-1.5 px-4 font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Ir a Salidas</span>
                <span className="w-3.5 h-3.5 rounded-full bg-white/20 inline-flex items-center justify-center text-[10px]">&gt;</span>
              </button>
            </div>

            {/* Cyan Card */}
            <div className="bg-cyan-500 rounded-sm text-white shadow-sm overflow-hidden flex flex-col justify-between">
              <div className="p-4 flex justify-between items-start">
                <div>
                  <h3 className="text-4xl font-extrabold tracking-tight">{data.alertasStock}</h3>
                  <p className="text-xs font-semibold mt-1 text-cyan-100">Alertas de Stock</p>
                </div>
                <div className="text-cyan-200/80">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              <button
                onClick={() => navigate('/reportes')}
                className="bg-cyan-600/80 hover:bg-cyan-700/90 text-cyan-50 text-xs py-1.5 px-4 font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Ir a Alertas</span>
                <span className="w-3.5 h-3.5 rounded-full bg-white/20 inline-flex items-center justify-center text-[10px]">&gt;</span>
              </button>
            </div>

            {/* Green Card */}
            <div className="bg-emerald-500 rounded-sm text-white shadow-sm overflow-hidden flex flex-col justify-between">
              <div className="p-4 flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-extrabold tracking-tight mt-1">
                    ${data.valorInventario.toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </h3>
                  <p className="text-xs font-semibold mt-2 text-emerald-100">Valor de Inventario</p>
                </div>
                <div className="text-emerald-200/80">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <button
                onClick={() => navigate('/reportes')}
                className="bg-emerald-600/80 hover:bg-emerald-700/90 text-emerald-50 text-xs py-1.5 px-4 font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Ir a Reportes</span>
                <span className="w-3.5 h-3.5 rounded-full bg-white/20 inline-flex items-center justify-center text-[10px]">&gt;</span>
              </button>
            </div>
          </div>

          {/* 2x2 Grid of Admin Control Panels */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Panel 1: Top Left */}
            <div className="bg-white border border-slate-200 rounded-sm shadow-xs overflow-hidden">
              <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                  <span>Producto más Vendido (Entradas / Stock)</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400 text-xs font-mono">
                  <span>-</span>
                  <span>x</span>
                </div>
              </div>
              <div className="p-4">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={data.productosPorCategoria}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis dataKey="nombre" fontSize={11} stroke="#64748B" />
                    <YAxis fontSize={11} stroke="#64748B" />
                    <Tooltip />
                    <Bar dataKey="total" name="Unidades" fill="#10B981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Panel 2: Top Right */}
            <div className="bg-white border border-slate-200 rounded-sm shadow-xs overflow-hidden">
              <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                  <span>Distribución de Productos por Categoria</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400 text-xs font-mono">
                  <span>-</span>
                  <span>x</span>
                </div>
              </div>
              <div className="p-4">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={data.productosPorCategoria}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis dataKey="nombre" fontSize={11} stroke="#64748B" />
                    <YAxis fontSize={11} stroke="#64748B" />
                    <Tooltip />
                    <Bar dataKey="total" name="SKUs" fill="#B91C1C" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Panel 3: Bottom Left */}
            <div className="bg-white border border-slate-200 rounded-sm shadow-xs overflow-hidden">
              <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                  <span>Movimientos Realizados - Últimos 7 Días</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400 text-xs font-mono">
                  <span>-</span>
                  <span>x</span>
                </div>
              </div>
              <div className="p-4">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={data.movimientosPorDia}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis
                      dataKey="fecha"
                      tickFormatter={(f) => new Date(f).toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit' })}
                      fontSize={11}
                      stroke="#64748B"
                    />
                    <YAxis fontSize={11} stroke="#64748B" allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="entradas" name="Entradas Realizadas" fill="#0D9488" />
                    <Bar dataKey="salidas" name="Salidas Realizadas" fill="#CA8A04" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Panel 4: Bottom Right */}
            <div className="bg-white border border-slate-200 rounded-sm shadow-xs overflow-hidden">
              <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                  <span>Movimientos Registrados Vrs Stock Disponible</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400 text-xs font-mono">
                  <span>-</span>
                  <span>x</span>
                </div>
              </div>
              <div className="p-4">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={data.movimientosPorDia}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis
                      dataKey="fecha"
                      tickFormatter={(f) => new Date(f).toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit' })}
                      fontSize={11}
                      stroke="#64748B"
                    />
                    <YAxis fontSize={11} stroke="#64748B" allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="entradas" name="Entradas Registradas" fill="#A16207" />
                    <Bar dataKey="salidas" name="Entradas Procesadas" fill="#15803D" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
