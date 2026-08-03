import { useAuth } from '../../context/AuthContext';
import { useLocation } from 'react-router-dom';

const PATH_NAMES = {
  '/dashboard': 'Panel Administrativo',
  '/productos': 'Gestión de Productos',
  '/kardex': 'Gestión de Inventarios (Kardex)',
  '/catalogos': 'Gestión de Catálogos',
  '/reportes': 'Reportes de Inventario',
  '/usuarios': 'Gestión de Usuarios',
};

export default function Navbar({ onToggleSidebar }) {
  const { usuario } = useAuth();
  const location = useLocation();

  const title = PATH_NAMES[location.pathname] || 'Panel Administrativo';

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 shrink-0 z-30">
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

        <h1 className="text-sm sm:text-base font-bold text-slate-800 tracking-tight font-heading">
          {title}
        </h1>
      </div>

      {/* Right Header Navigation & Actions */}
      {usuario && (
        <div className="flex items-center gap-2 text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
          <span className="font-semibold text-slate-700">{usuario.nombre}</span>
          <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
            {usuario.rol}
          </span>
        </div>
      )}
    </header>
  );
}
