import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function Icon({ name }) {
  const icons = {
    dashboard: (
      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    productos: (
      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
      </svg>
    ),
    kardex: (
      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m-12 5h12m-12 5h12M4 7h.01M4 12h.01M4 17h.01" />
      </svg>
    ),
    reportes: (
      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    usuarios: (
      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    catalogos: (
      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
    escanear: (
      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7V5a1 1 0 011-1h2M4 17v2a1 1 0 001 1h2m10-16h2a1 1 0 011 1v2m-3 14h2a1 1 0 001-1v-2M7 8h1v8H7V8zm3 0h1v8h-1V8zm3 0h2v8h-2V8zm4 0h1v8h-1V8z" />
      </svg>
    ),
  };
  return icons[name] || null;
}

const navItems = [
  { to: '/dashboard',  label: 'Administración',         icon: 'dashboard' },
  { to: '/productos',  label: 'Productos',             icon: 'productos' },
  { to: '/kardex',     label: 'Inventarios / Kardex',   icon: 'kardex' },
  { to: '/catalogos',  label: 'Catálogos',             icon: 'catalogos' },
  { to: '/reportes',   label: 'Reportes',              icon: 'reportes' },
  { to: '/usuarios',   label: 'Usuarios',              icon: 'usuarios' },
  { to: '/escanear',   label: 'Escanear QR/Código',    icon: 'escanear' },
];

export default function Sidebar({ onCloseMobile }) {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="w-52 sm:w-56 bg-[#22272E] h-full flex flex-col shrink-0 text-slate-300 select-none border-r border-[#1C2128]">
      {/* Top User Profile Header */}
      <div className="p-3.5 border-b border-[#2C333D] flex items-center justify-between bg-[#1C2128]">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-full bg-slate-700 text-white font-bold text-xs flex items-center justify-center border border-slate-500 shadow-sm shrink-0">
            {usuario?.nombre?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="overflow-hidden min-w-0">
            <span className="text-white font-bold text-xs truncate block">
              {usuario?.nombre || 'Usuario'}
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
              <span className="text-[10px] text-emerald-400 font-medium">Online</span>
            </div>
          </div>
        </div>

        {/* Mobile Close Button */}
        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1 text-slate-400 hover:text-white rounded-md transition-colors"
          >
            ✕
          </button>
        )}
      </div>

      {/* Navigation List */}
      <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto text-xs">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onCloseMobile}
            className={({ isActive }) =>
              `flex items-center justify-between px-3 py-2 rounded-lg font-medium transition-colors ${
                isActive
                  ? 'bg-[#1C2128] text-white font-bold border-l-4 border-amber-500 pl-2.5'
                  : 'text-slate-300 hover:bg-[#2C333D] hover:text-white'
              }`
            }
          >
            <div className="flex items-center gap-2.5 min-w-0 truncate">
              <Icon name={item.icon} />
              <span className="truncate">{item.label}</span>
            </div>
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-2 pt-1 pb-2 border-t border-[#2C333D]">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium text-xs text-slate-300 hover:bg-rose-500/10 hover:text-rose-400 transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>Cerrar Sesión</span>
        </button>
      </div>

      {/* Sidebar Footer */}
      <div className="p-3 bg-[#1C2128] border-t border-[#2C333D] text-[10px] text-slate-500 flex justify-between items-center">
        <span>WMS System</span>
        <span className="text-amber-500 font-mono">v2.4</span>
      </div>
    </aside>
  );
}
