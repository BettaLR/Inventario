import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/dashboard',  label: 'Dashboard',  icon: '📊', roles: ['Admin', 'Gerente', 'Almacenista'] },
  { to: '/kardex',     label: 'Kardex',     icon: '📋', roles: ['Admin', 'Gerente', 'Almacenista'] },
  { to: '/productos',  label: 'Productos',  icon: '📦', roles: ['Admin', 'Gerente', 'Almacenista'] },
  { to: '/reportes',   label: 'Reportes',   icon: '📄', roles: ['Admin', 'Gerente'] },
  { to: '/usuarios',   label: 'Usuarios',   icon: '👥', roles: ['Admin'] },
];

export default function Sidebar() {
  const { hasRole } = useAuth();

  return (
    <aside className="w-56 bg-slate-800 min-h-screen flex flex-col">
      <div className="p-4 border-b border-slate-700">
        <span className="text-white font-semibold text-sm">📦 Inventario</span>
      </div>
      <nav className="flex-1 p-2 space-y-1">
        {navItems
          .filter((item) => hasRole(...item.roles))
          .map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition
                ${isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }`
              }
            >
              <span>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
      </nav>
    </aside>
  );
}
