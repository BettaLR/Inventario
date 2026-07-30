import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const PATH_NAMES = {
  '/dashboard': 'Panel Administrativo',
  '/productos': 'Gestión de Productos',
  '/kardex': 'Gestión de Inventarios (Kardex)',
  '/catalogos': 'Gestión de Catálogos',
  '/reportes': 'Reportes de Inventario',
  '/usuarios': 'Gestión de Usuarios',
};

export default function Navbar({ onToggleSidebar }) {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const title = PATH_NAMES[location.pathname] || 'Panel Administrativo';

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 flex items-center justify-between px-4 sm:px-6 shrink-0 shadow-2xs z-30">
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger Menu Toggle Button */}
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Abrir menú"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="flex items-baseline gap-2">
          <h1 className="text-sm sm:text-base font-bold text-slate-800 tracking-tight font-heading">
            {title}
          </h1>
          <span className="text-xs text-slate-400 font-normal hidden md:inline">
            • Control panel Administrativo
          </span>
        </div>
      </div>

      {/* Right Header Navigation & Actions */}
      <div className="flex items-center gap-3 sm:gap-4 text-xs">
        <div className="hidden sm:flex items-center gap-1.5 text-slate-500 font-medium bg-slate-100 px-3 py-1.5 rounded-md border border-slate-200">
          <span>🏠 Home</span>
          <span>&gt;</span>
          <span className="text-slate-800 font-bold">{title}</span>
        </div>

        {usuario && (
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
              <span className="font-semibold text-slate-700">{usuario.nombre}</span>
              <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                {usuario.rol}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold px-3 py-1.5 rounded-md border border-rose-200 transition-colors cursor-pointer"
            >
              Salir
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
