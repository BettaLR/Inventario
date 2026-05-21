import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ROLE_COLORS = {
  Admin: 'bg-red-100 text-red-700',
  Gerente: 'bg-yellow-100 text-yellow-700',
  Almacenista: 'bg-green-100 text-green-700',
};

export default function Navbar() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6">
      <h1 className="text-slate-700 font-medium text-sm">Sistema de Control de Inventarios</h1>

      <div className="flex items-center gap-3">
        {usuario && (
          <>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium ${ROLE_COLORS[usuario.rol] || 'bg-slate-100 text-slate-600'}`}
            >
              {usuario.rol}
            </span>
            <span className="text-sm text-slate-700">{usuario.nombre}</span>
            <button
              onClick={handleLogout}
              className="text-xs text-slate-500 hover:text-red-600 transition"
            >
              Cerrar sesión
            </button>
          </>
        )}
      </div>
    </header>
  );
}
