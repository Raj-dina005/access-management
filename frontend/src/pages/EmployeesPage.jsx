import { useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { UserPlus, Search, Edit2, Trash2, X, Download } from 'lucide-react';

const exportToCSV = (employees) => {
  const headers = ['Name', 'Employee Code', 'Department', 'Designation', 'Phone', 'Email', 'Status'];
  const rows = employees.map(e => [
    e.name, e.employee_code, e.department || '', e.designation || '',
    e.phone || '', e.email || '', e.is_active ? 'Active' : 'Inactive'
  ]);
  const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `employees-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  toast.success('Employees exported as CSV!');
};

const emptyForm = { name: '', email: '', department: '', designation: '', phone: '', employee_code: '' };

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const { canManage, isAdmin } = useAuth();

  useEffect(() => { fetchEmployees(); }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await api.get('/employees');
      setEmployees(res.data);
    } catch { toast.error('Failed to load employees'); }
    finally { setLoading(false); }
  };

  const openAdd = () => { setForm(emptyForm); setEditId(null); setShowModal(true); };
  const openEdit = (emp) => { setForm(emp); setEditId(emp.id); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setForm(emptyForm); setEditId(null); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editId) {
        await api.put(`/employees/${editId}`, form);
        toast.success('Employee updated!');
      } else {
        await api.post('/employees', form);
        toast.success('Employee registered!');
      }
      fetchEmployees();
      closeModal();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this employee?')) return;
    try {
      await api.delete(`/employees/${id}`);
      toast.success('Employee deleted.');
      fetchEmployees();
    } catch { toast.error('Failed to delete'); }
  };

  const filtered = employees.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.employee_code?.toLowerCase().includes(search.toLowerCase()) ||
    e.department?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Employees</h1>
          <p className="page-subtitle">{employees.length} registered employees</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => exportToCSV(filtered)}
            className="btn-secondary flex items-center gap-2"
            disabled={filtered.length === 0}
          >
            <Download size={15} /> Export CSV
          </button>
          {canManage() && (
            <button onClick={openAdd} className="btn-primary flex items-center gap-2">
              <UserPlus size={16} /> Add Employee
            </button>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          className="input pl-10"
          placeholder="Search employees..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
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
                  <th className="table-th">Code</th>
                  <th className="table-th">Department</th>
                  <th className="table-th">Designation</th>
                  <th className="table-th">Phone</th>
                  <th className="table-th">Status</th>
                  {canManage() && <th className="table-th">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-12 text-slate-500 text-sm">No employees found.</td></tr>
                ) : filtered.map(emp => (
                  <tr key={emp.id} className="table-row">
                    <td className="table-td font-medium text-white">{emp.name}</td>
                    <td className="table-td font-mono text-primary-400 text-xs">{emp.employee_code}</td>
                    <td className="table-td">{emp.department || '—'}</td>
                    <td className="table-td">{emp.designation || '—'}</td>
                    <td className="table-td">{emp.phone || '—'}</td>
                    <td className="table-td">
                      <span className={emp.is_active ? 'badge-green' : 'badge-red'}>
                        {emp.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    {canManage() && (
                      <td className="table-td">
                        <div className="flex items-center gap-2">
                          <button onClick={() => openEdit(emp)} className="p-2 rounded-lg hover:bg-primary-600/20 text-slate-400 hover:text-primary-400 transition-colors">
                            <Edit2 size={14} />
                          </button>
                          {isAdmin() && (
                            <button onClick={() => handleDelete(emp.id)} className="p-2 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors">
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-surface-card border border-surface-border rounded-2xl w-full max-w-lg shadow-glow-lg animate-fade-in">
            <div className="flex items-center justify-between p-6 border-b border-surface-border">
              <h2 className="font-semibold text-white">{editId ? 'Edit Employee' : 'Register Employee'}</h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-white transition-colors"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Full Name *</label>
                  <input className="input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
                </div>
                <div>
                  <label className="label">Employee Code *</label>
                  <input className="input" value={form.employee_code} onChange={e => setForm({...form, employee_code: e.target.value})} required disabled={!!editId} />
                </div>
                <div>
                  <label className="label">Email</label>
                  <input className="input" type="email" value={form.email || ''} onChange={e => setForm({...form, email: e.target.value})} />
                </div>
                <div>
                  <label className="label">Phone</label>
                  <input className="input" value={form.phone || ''} onChange={e => setForm({...form, phone: e.target.value})} />
                </div>
                <div>
                  <label className="label">Department</label>
                  <input className="input" value={form.department || ''} onChange={e => setForm({...form, department: e.target.value})} />
                </div>
                <div>
                  <label className="label">Designation</label>
                  <input className="input" value={form.designation || ''} onChange={e => setForm({...form, designation: e.target.value})} />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeModal} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1">
                  {saving ? 'Saving...' : editId ? 'Update' : 'Register'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
