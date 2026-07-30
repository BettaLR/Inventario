import { useQuery } from '@tanstack/react-query';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, Legend,
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { obtenerStats } from '../services/dashboardService';
import Spinner from '../components/ui/Spinner';

export default function DashboardPage() {
  const { usuario } = useAuth();
  const { data, isLoading } = useQuery({ queryKey: ['dashboard-stats'], queryFn: obtenerStats });

  return (
    <div>
      <div className="mb-6 pb-4 border-b border-line flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-ink-900 tracking-tight mb-1.5">Panel de Control Ejecutivo</h2>
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-full bg-accent-500 text-white text-xs font-bold flex items-center justify-center">
              {usuario?.nombre?.[0]?.toUpperCase()}
            </span>
            <p className="text-ink-600 text-sm">Bienvenido, {usuario?.nombre}</p>
          </div>
        </div>
        <p className="text-ink-400 text-xs">
          {new Date().toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })}, {new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>

      {isLoading ? (
        <Spinner />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-4">
            <StatCard titulo="Total productos" valor={data.totalProductos} />
            <StatCard titulo="Movimientos hoy" valor={data.movimientosHoy} />
            <StatCard titulo="Alertas de stock" valor={data.alertasStock} accent />
            <StatCard titulo="Valor de inventario" valor={`$${data.valorInventario.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="panel p-5">
              <h3 className="font-semibold text-ink-900 text-xs uppercase tracking-wide mb-4">Movimientos — últimos 7 días</h3>
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={data.movimientosPorDia}>
                  <defs>
                    <linearGradient id="entradas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2E7D32" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#2E7D32" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="salidas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#D9531E" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#D9531E" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E1E3E7" />
                  <XAxis
                    dataKey="fecha"
                    tickFormatter={(f) => new Date(f).toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit' })}
                    fontSize={11}
                    stroke="#868D99"
                  />
                  <YAxis fontSize={11} stroke="#868D99" allowDecimals={false} />
                  <Tooltip labelFormatter={(f) => new Date(f).toLocaleDateString('es-MX')} />
                  <Legend />
                  <Area type="monotone" dataKey="entradas" name="Entradas" stroke="#2E7D32" fill="url(#entradas)" strokeWidth={2} />
                  <Area type="monotone" dataKey="salidas" name="Salidas" stroke="#D9531E" fill="url(#salidas)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="panel p-5">
              <h3 className="font-semibold text-ink-900 text-xs uppercase tracking-wide mb-4">Productos por categoría</h3>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={data.productosPorCategoria} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E1E3E7" horizontal={false} />
                  <XAxis type="number" fontSize={11} stroke="#868D99" allowDecimals={false} />
                  <YAxis type="category" dataKey="nombre" fontSize={11} stroke="#868D99" width={90} />
                  <Tooltip />
                  <Bar dataKey="total" name="Productos" fill="#1B1F26" radius={[0, 2, 2, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ titulo, valor, accent }) {
  return (
    <div className="metric-card">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-400 mb-2">{titulo}</p>
      <p className={`text-3xl font-bold tracking-tight ${accent ? 'text-accent-600' : 'text-ink-900'}`}>{valor}</p>
    </div>
  );
}
