import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function Icon({ path }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px] shrink-0">
      <path d={path} />
    </svg>
  );
}

const ICONS = {
  dashboard: 'M3 13h4v8H3v-8Zm7-9h4v17h-4V4Zm7 5h4v12h-4V9Z',
  kardex: 'M9 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm0 5h6M9 12h6M9 16h4',
  productos: 'M21 8 12 3 3 8m18 0-9 5m9-5v9l-9 5M3 8l9 5m-9-5v9l9 5m0-9v9',
  catalogos: 'M4 5h6v6H4V5Zm10 0h6v6h-6V5ZM4 15h6v6H4v-6Zm10 0h6v6h-6v-6Z',
  reportes: 'M4 19V5m5 14V9m5 10V3m5 16v-6',
  usuarios: 'M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2M10 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm9 10v-2a4 4 0 0 0-3-3.87M15 3.13a4 4 0 0 1 0 7.75',
};

const navItems = [
  { to: '/dashboard',  label: 'Dashboard',  icon: 'dashboard', roles: ['Admin', 'Gerente', 'Almacenista'] },
  { to: '/kardex',     label: 'Kardex',     icon: 'kardex',    roles: ['Admin', 'Gerente', 'Almacenista'] },
  { to: '/productos',  label: 'Productos',  icon: 'productos', roles: ['Admin', 'Gerente', 'Almacenista'] },
  { to: '/catalogos',  label: 'Catálogos',  icon: 'catalogos', roles: ['Admin', 'Gerente', 'Almacenista'] },
  { to: '/reportes',   label: 'Reportes',   icon: 'reportes',  roles: ['Admin', 'Gerente'] },
  { to: '/usuarios',   label: 'Usuarios',   icon: 'usuarios',  roles: ['Admin'] },
];

export default function Sidebar() {
  const { hasRole } = useAuth();

  return (
    <aside className="w-56 bg-surface border-r border-line min-h-screen flex flex-col">
      <div className="h-14 flex items-center px-5 border-b border-line">
        <span className="text-ink-900 font-bold text-sm tracking-wide">Inventario</span>
      </div>
      <nav className="flex-1 py-3 px-2 space-y-0.5">
        {navItems
          .filter((item) => hasRole(...item.roles))
          .map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-[3px] text-sm font-medium border-l-2 transition-colors
                ${isActive
                  ? 'border-accent-500 bg-canvas text-ink-900'
                  : 'border-transparent text-ink-400 hover:bg-canvas hover:text-ink-900'
                }`
              }
            >
              <Icon path={ICONS[item.icon]} />
              {item.label}
            </NavLink>
          ))}
      </nav>
    </aside>
  );
}
