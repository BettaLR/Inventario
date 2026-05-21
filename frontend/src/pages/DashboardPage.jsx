import { useAuth } from '../context/AuthContext';

export default function DashboardPage() {
  const { usuario } = useAuth();

  return (
    <div>
      <h2 className="text-xl font-bold text-slate-800 mb-1">
        Bienvenido, {usuario?.nombre}
      </h2>
      <p className="text-slate-500 text-sm mb-6">
        Panel de control del sistema de inventarios
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard titulo="Total Productos" valor="—" icon="📦" color="blue" />
        <StatCard titulo="Movimientos Hoy" valor="—" icon="🔄" color="green" />
        <StatCard titulo="Alertas Stock" valor="—" icon="⚠️" color="yellow" />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <p className="text-slate-400 text-sm text-center py-8">
          Sprint 3 — Dashboard con gráficos y alertas en tiempo real
        </p>
      </div>
    </div>
  );
}

function StatCard({ titulo, valor, icon, color }) {
  const colors = {
    blue:   'bg-blue-50 text-blue-700 border-blue-100',
    green:  'bg-green-50 text-green-700 border-green-100',
    yellow: 'bg-yellow-50 text-yellow-700 border-yellow-100',
  };

  return (
    <div className={`rounded-xl border p-5 ${colors[color]}`}>
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <p className="text-xs font-medium opacity-70">{titulo}</p>
          <p className="text-2xl font-bold">{valor}</p>
        </div>
      </div>
    </div>
  );
}
