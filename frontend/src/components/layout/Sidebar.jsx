import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  LayoutDashboard, Users, UserCheck, ClipboardList,
  Shield, LogOut, ChevronRight
} from 'lucide-react';

const navItems = [
  { path: '/dashboard', label: 'Dashboard',  icon: LayoutDashboard, roles: null },
  { path: '/employees', label: 'Employees',  icon: UserCheck,        roles: null },
  { path: '/visitors',  label: 'Visitors',   icon: Users,            roles: null },
  { path: '/logs',      label: 'Access Logs',icon: ClipboardList,    roles: null },
  { path: '/users',     label: 'User Mgmt',  icon: Shield,           roles: ['super_admin'] },
];

export default function Sidebar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const roleLabel = {
    super_admin: 'Super Admin',
    security_staff: 'Security Staff',
    employee: 'Employee',
  };

  const roleColor = {
    super_admin: 'badge-blue',
    security_staff: 'badge-yellow',
    employee: 'badge-green',
  };

  return (
    <aside className="w-64 min-h-screen bg-surface-card border-r border-surface-border flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-surface-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center shadow-glow">
            <Shield size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight">AccessGuard</h1>
            <p className="text-xs text-slate-500">Access Management</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ path, label, icon: Icon, roles }) => {
          if (roles && !roles.includes(user?.role)) return null;
          return (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group
                ${isActive
                  ? 'bg-primary-600/20 text-primary-400 border border-primary-500/30'
                  : 'text-slate-400 hover:bg-surface-hover hover:text-slate-200'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={17} className={isActive ? 'text-primary-400' : 'text-slate-500 group-hover:text-slate-300'} />
                  <span>{label}</span>
                  {isActive && <ChevronRight size={14} className="ml-auto text-primary-400" />}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User info */}
      <div className="p-4 border-t border-surface-border">
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-surface-DEFAULT mb-3">
          <div className="w-8 h-8 rounded-full bg-primary-600/30 border border-primary-500/30 flex items-center justify-center">
            <span className="text-xs font-bold text-primary-400">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-200 truncate">{user?.name}</p>
            <span className={`text-xs ${roleColor[user?.role]}`}>
              {roleLabel[user?.role]}
            </span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200"
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
