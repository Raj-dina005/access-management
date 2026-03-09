import { useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { UserPlus, Trash2, ToggleLeft, ToggleRight, X, Shield } from 'lucide-react';

const emptyForm = { name: '', email: '', password: '', role: 'security_staff' };

const roleLabel = { super_admin: 'Super Admin', security_staff: 'Security Staff', employee: 'Employee' };
const roleBadge = { super_admin: 'badge-blue', security_staff: 'badge-yellow', employee: 'badge-green' };

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users');
      setUsers(res.data);
    } catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/users', form);
      toast.success('User created!');
      fetchUsers();
      setShowModal(false);
      setForm(emptyForm);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create user');
    } finally { setSaving(false); }
  };

  const handleToggle = async (id) => {
    try {
      const res = await api.put(`/users/${id}/toggle`);
      toast.success(`User ${res.data.user.is_active ? 'activated' : 'deactivated'}`);
      fetchUsers();
    } catch { toast.error('Failed to update status'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this user? This cannot be undone.')) return;
    try {
      await api.delete(`/users/${id}`);
      toast.success('User deleted.');
      fetchUsers();
    } catch { toast.error('Failed to delete'); }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">Manage system login accounts & roles</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <UserPlus size={16} /> Add User
        </button>
      </div>

      {/* Role info cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { role: 'super_admin', label: 'Super Admin', desc: 'Full system access, manage users', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
          { role: 'security_staff', label: 'Security Staff', desc: 'Log access, manage visitors & employees', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
          { role: 'employee', label: 'Employee', desc: 'View only access to own data', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
        ].map(({ role, label, desc, color, bg }) => (
          <div key={role} className={`p-4 rounded-xl border ${bg}`}>
            <div className="flex items-center gap-2 mb-1">
              <Shield size={14} className={color} />
              <p className={`text-sm font-semibold ${color}`}>{label}</p>
            </div>
            <p className="text-xs text-slate-500">{desc}</p>
            <p className="text-lg font-bold text-white mt-2">{users.filter(u => u.role === role).length}</p>
          </div>
        ))}
      </div>

      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-7 h-7 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-surface-DEFAULT border-b border-surface-border">
                <tr>
                  <th className="table-th">Name</th>
                  <th className="table-th">Email</th>
                  <th className="table-th">Role</th>
                  <th className="table-th">Status</th>
                  <th className="table-th">Created</th>
                  <th className="table-th">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-12 text-slate-500 text-sm">No users found.</td></tr>
                ) : users.map(user => (
                  <tr key={user.id} className="table-row">
                    <td className="table-td">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-600/20 border border-primary-500/20 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-primary-400">{user.name.charAt(0).toUpperCase()}</span>
                        </div>
                        <span className="font-medium text-white">{user.name}</span>
                      </div>
                    </td>
                    <td className="table-td text-slate-400">{user.email}</td>
                    <td className="table-td">
                      <span className={roleBadge[user.role]}>{roleLabel[user.role]}</span>
                    </td>
                    <td className="table-td">
                      <span className={user.is_active ? 'badge-green' : 'badge-red'}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="table-td text-slate-400 text-xs">{formatDate(user.created_at)}</td>
                    <td className="table-td">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggle(user.id)}
                          className={`p-2 rounded-lg transition-colors ${user.is_active ? 'hover:bg-amber-500/20 text-slate-400 hover:text-amber-400' : 'hover:bg-emerald-500/20 text-slate-400 hover:text-emerald-400'}`}
                          title={user.is_active ? 'Deactivate' : 'Activate'}
                        >
                          {user.is_active ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                        </button>
                        <button onClick={() => handleDelete(user.id)} className="p-2 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-surface-card border border-surface-border rounded-2xl w-full max-w-md shadow-glow-lg animate-fade-in">
            <div className="flex items-center justify-between p-6 border-b border-surface-border">
              <h2 className="font-semibold text-white">Create New User</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="label">Full Name *</label>
                <input className="input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
              </div>
              <div>
                <label className="label">Email *</label>
                <input className="input" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
              </div>
              <div>
                <label className="label">Password *</label>
                <input className="input" type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required minLength={6} />
              </div>
              <div>
                <label className="label">Role *</label>
                <select className="input" value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
                  <option value="security_staff">Security Staff</option>
                  <option value="employee">Employee</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1">
                  {saving ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
