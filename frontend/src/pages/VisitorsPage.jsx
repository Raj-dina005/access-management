import { useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { UserPlus, Search, Trash2, X, Ticket } from 'lucide-react';

const emptyForm = {
  name: '', phone: '', email: '', purpose: '',
  host_employee_id: '', valid_from: '', valid_until: ''
};

const statusBadge = { active: 'badge-green', expired: 'badge-red', used: 'badge-yellow' };

export default function VisitorsPage() {
  const [visitors, setVisitors] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const { canManage, isAdmin } = useAuth();

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [v, e] = await Promise.all([api.get('/visitors'), api.get('/employees')]);
      setVisitors(v.data);
      setEmployees(e.data);
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.post('/visitors', form);
      toast.success(`Pass created: ${res.data.visitor.pass_code}`);
      fetchAll();
      setShowModal(false);
      setForm(emptyForm);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this visitor?')) return;
    try {
      await api.delete(`/visitors/${id}`);
      toast.success('Visitor deleted.');
      fetchAll();
    } catch { toast.error('Failed to delete'); }
  };

  const filtered = visitors.filter(v =>
    v.name.toLowerCase().includes(search.toLowerCase()) ||
    v.pass_code?.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (d) => d ? new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

  // Default datetime values for the form
  const nowLocal = () => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  };
  const laterLocal = () => {
    const d = new Date(Date.now() + 8 * 3600000);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  };

  const openModal = () => {
    setForm({ ...emptyForm, valid_from: nowLocal(), valid_until: laterLocal() });
    setShowModal(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Visitors</h1>
          <p className="page-subtitle">{visitors.length} visitor passes</p>
        </div>
        {canManage() && (
          <button onClick={openModal} className="btn-primary flex items-center gap-2">
            <UserPlus size={16} /> New Visitor Pass
          </button>
        )}
      </div>

      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
        <input className="input pl-10" placeholder="Search visitors or pass code..." value={search} onChange={e => setSearch(e.target.value)} />
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
                  <th className="table-th">Visitor</th>
                  <th className="table-th">Pass Code</th>
                  <th className="table-th">Purpose</th>
                  <th className="table-th">Host</th>
                  <th className="table-th">Valid Until</th>
                  <th className="table-th">Status</th>
                  {canManage() && <th className="table-th">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-12 text-slate-500 text-sm">No visitors found.</td></tr>
                ) : filtered.map(v => (
                  <tr key={v.id} className="table-row">
                    <td className="table-td">
                      <div>
                        <p className="font-medium text-white">{v.name}</p>
                        <p className="text-xs text-slate-500">{v.phone || v.email || '—'}</p>
                      </div>
                    </td>
                    <td className="table-td">
                      <span className="font-mono text-xs bg-surface-DEFAULT px-2.5 py-1 rounded-lg text-primary-400 border border-primary-500/20 flex items-center gap-1.5 w-fit">
                        <Ticket size={11} /> {v.pass_code}
                      </span>
                    </td>
                    <td className="table-td">{v.purpose || '—'}</td>
                    <td className="table-td">{v.host_name || '—'}</td>
                    <td className="table-td text-xs">{formatDate(v.valid_until)}</td>
                    <td className="table-td">
                      <span className={statusBadge[v.status] || 'badge-yellow'}>{v.status}</span>
                    </td>
                    {canManage() && (
                      <td className="table-td">
                        {isAdmin() && (
                          <button onClick={() => handleDelete(v.id)} className="p-2 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors">
                            <Trash2 size={14} />
                          </button>
                        )}
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
              <h2 className="font-semibold text-white">Create Visitor Pass</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="label">Visitor Name *</label>
                  <input className="input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
                </div>
                <div>
                  <label className="label">Phone</label>
                  <input className="input" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
                </div>
                <div>
                  <label className="label">Email</label>
                  <input className="input" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                </div>
                <div className="col-span-2">
                  <label className="label">Purpose of Visit</label>
                  <input className="input" value={form.purpose} onChange={e => setForm({...form, purpose: e.target.value})} />
                </div>
                <div className="col-span-2">
                  <label className="label">Host Employee</label>
                  <select className="input" value={form.host_employee_id} onChange={e => setForm({...form, host_employee_id: e.target.value})}>
                    <option value="">Select employee...</option>
                    {employees.map(e => <option key={e.id} value={e.id}>{e.name} ({e.employee_code})</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Valid From *</label>
                  <input className="input" type="datetime-local" value={form.valid_from} onChange={e => setForm({...form, valid_from: e.target.value})} required />
                </div>
                <div>
                  <label className="label">Valid Until *</label>
                  <input className="input" type="datetime-local" value={form.valid_until} onChange={e => setForm({...form, valid_until: e.target.value})} required />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1">
                  {saving ? 'Creating...' : 'Generate Pass'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
