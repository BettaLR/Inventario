import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-14 bg-surface border-b border-line flex items-center justify-between px-6">
      <h1 className="text-ink-900 font-semibold text-sm tracking-tight">Sistema de Control de Inventarios</h1>

      <div className="flex items-center gap-3 text-sm">
        {usuario && (
          <>
            <span className="text-xs font-semibold uppercase tracking-wide text-accent-600">
              {usuario.rol}
            </span>
            <span className="text-ink-900 font-medium">{usuario.nombre}</span>
            <span className="text-line">|</span>
            <button
              onClick={handleLogout}
              className="text-ink-600 hover:text-accent-600 transition-colors"
            >
              Salir
            </button>
          </>
        )}
      </div>
    </header>
  );
}
