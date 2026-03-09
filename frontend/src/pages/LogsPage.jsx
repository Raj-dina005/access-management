import { useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { Plus, Search, X, LogIn, LogOut, Download } from 'lucide-react';

const exportToCSV = (logs) => {
  const headers = ['Person Name', 'Type', 'Action', 'Location', 'Date & Time'];
  const rows = logs.map(l => [
    l.person_name,
    l.person_type,
    l.action,
    l.location,
    new Date(l.created_at).toLocaleString('en-IN')
  ]);
  const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `access-logs-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  toast.success('Logs exported as CSV!');
};

const emptyForm = { person_type: 'employee', person_id: '', person_name: '', action: 'entry', location: 'Main Gate' };

export default function LogsPage() {
  const [logs, setLogs] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [filters, setFilters] = useState({ search: '', action: '', person_type: '', date: '' });
  const { canManage } = useAuth();

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.action) params.action = filters.action;
      if (filters.person_type) params.person_type = filters.person_type;
      if (filters.search) params.search = filters.search;
      if (filters.date) params.date = filters.date;
      const [l, e, v] = await Promise.all([
        api.get('/logs', { params }),
        api.get('/employees'),
        api.get('/visitors'),
      ]);
      setLogs(l.data);
      setEmployees(e.data);
      setVisitors(v.data);
    } catch { toast.error('Failed to load logs'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, [filters.action, filters.person_type, filters.date]);

  const personOptions = form.person_type === 'employee' ? employees : visitors;

  const handlePersonSelect = (e) => {
    const id = e.target.value;
    const person = personOptions.find(p => p.id === id);
    setForm({ ...form, person_id: id, person_name: person?.name || '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/logs', form);
      toast.success('Access logged!');
      fetchAll();
      setShowModal(false);
      setForm(emptyForm);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to log');
    } finally { setSaving(false); }
  };

  const formatTime = (ts) => new Date(ts).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  const filteredLogs = filters.search
    ? logs.filter(l => l.person_name.toLowerCase().includes(filters.search.toLowerCase()))
    : logs;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Access Logs</h1>
          <p className="page-subtitle">{logs.length} records</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => exportToCSV(filteredLogs)}
            className="btn-secondary flex items-center gap-2"
            disabled={filteredLogs.length === 0}
          >
            <Download size={15} /> Export CSV
          </button>
          {canManage() && (
            <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
              <Plus size={16} /> Log Entry / Exit
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative">
          <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            className="input pl-10 w-56"
            placeholder="Search by name..."
            value={filters.search}
            onChange={e => setFilters({ ...filters, search: e.target.value })}
          />
        </div>
        <input
          type="date"
          className="input w-44"
          value={filters.date}
          onChange={e => setFilters({ ...filters, date: e.target.value })}
        />
        <select className="input w-40" value={filters.action} onChange={e => setFilters({ ...filters, action: e.target.value })}>
          <option value="">All Actions</option>
          <option value="entry">Entry</option>
          <option value="exit">Exit</option>
        </select>
        <select className="input w-44" value={filters.person_type} onChange={e => setFilters({ ...filters, person_type: e.target.value })}>
          <option value="">All Types</option>
          <option value="employee">Employee</option>
          <option value="visitor">Visitor</option>
        </select>
        {(filters.action || filters.person_type || filters.search || filters.date) && (
          <button onClick={() => setFilters({ search: '', action: '', person_type: '', date: '' })} className="btn-secondary flex items-center gap-1.5 text-sm">
            <X size={14} /> Clear
          </button>
        )}
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
                  <th className="table-th">Action</th>
                  <th className="table-th">Person</th>
                  <th className="table-th">Type</th>
                  <th className="table-th">Location</th>
                  <th className="table-th">Date & Time</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-12 text-slate-500 text-sm">No logs found.</td></tr>
                ) : filteredLogs.map(log => (
                  <tr key={log.id} className="table-row">
                    <td className="table-td">
                      <div className={`flex items-center gap-2 font-medium ${log.action === 'entry' ? 'text-emerald-400' : 'text-red-400'}`}>
                        {log.action === 'entry' ? <LogIn size={15} /> : <LogOut size={15} />}
                        <span className="capitalize">{log.action}</span>
                      </div>
                    </td>
                    <td className="table-td font-medium text-white">{log.person_name}</td>
                    <td className="table-td">
                      <span className={log.person_type === 'employee' ? 'badge-blue' : 'badge-yellow'}>
                        {log.person_type}
                      </span>
                    </td>
                    <td className="table-td text-slate-400">{log.location}</td>
                    <td className="table-td text-slate-400 text-xs font-mono">{formatTime(log.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Log Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-surface-card border border-surface-border rounded-2xl w-full max-w-md shadow-glow-lg animate-fade-in">
            <div className="flex items-center justify-between p-6 border-b border-surface-border">
              <h2 className="font-semibold text-white">Log Entry / Exit</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="label">Person Type</label>
                <div className="flex gap-3">
                  {['employee', 'visitor'].map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setForm({ ...form, person_type: t, person_id: '', person_name: '' })}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-medium capitalize transition-all ${
                        form.person_type === t
                          ? 'bg-primary-600 text-white shadow-glow'
                          : 'bg-surface-DEFAULT text-slate-400 border border-surface-border hover:border-primary-500/30'
                      }`}
                    >{t}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="label">Select {form.person_type}</label>
                <select className="input" value={form.person_id} onChange={handlePersonSelect} required>
                  <option value="">Choose...</option>
                  {personOptions.map(p => (
                    <option key={p.id} value={p.id}>{p.name} {form.person_type === 'employee' ? `(${p.employee_code})` : `(${p.pass_code})`}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Action</label>
                <div className="flex gap-3">
                  {['entry', 'exit'].map(a => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => setForm({ ...form, action: a })}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-medium capitalize transition-all ${
                        form.action === a
                          ? a === 'entry' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
                          : 'bg-surface-DEFAULT text-slate-400 border border-surface-border'
                      }`}
                    >{a}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="label">Location</label>
                <input className="input" value={form.location} onChange={e => setForm({...form, location: e.target.value})} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1">
                  {saving ? 'Logging...' : 'Log Access'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
