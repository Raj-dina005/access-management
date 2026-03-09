import { useState, useEffect } from 'react';
import api from '../utils/api';
import { Users, UserCheck, LogIn, Building2, Activity, Clock, RefreshCw } from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, color, sub }) => (
  <div className="card hover:border-primary-500/30 transition-all duration-300 hover:shadow-glow group">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
        <p className={`text-4xl font-bold mt-2 ${color}`}>{value ?? '—'}</p>
        {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
      </div>
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center bg-current/10 ${color}`}>
        <Icon size={20} />
      </div>
    </div>
  </div>
);

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [recentLogs, setRecentLogs] = useState([]);
  const [insideNow, setInsideNow] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [statsRes, logsRes, insideRes] = await Promise.all([
        api.get('/logs/stats'),
        api.get('/logs'),
        api.get('/logs/inside'),
      ]);
      setStats(statsRes.data);
      setRecentLogs(logsRes.data.slice(0, 8));
      setInsideNow(insideRes.data.slice(0, 6));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (ts) => new Date(ts).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
  });

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Real-time overview of access activity</p>
        </div>
        <button
          onClick={fetchAll}
          className="btn-secondary flex items-center gap-2"
        >
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard icon={UserCheck}  label="Total Employees"   value={stats?.total_employees}  color="text-primary-400"  sub="Active staff" />
        <StatCard icon={Users}      label="Active Visitors"   value={stats?.active_visitors}   color="text-emerald-400"  sub="Valid passes" />
        <StatCard icon={LogIn}      label="Today's Entries"   value={stats?.today_entries}     color="text-amber-400"    sub="Since midnight" />
        <StatCard icon={Building2}  label="Currently Inside"  value={stats?.currently_inside}  color="text-blue-400"     sub="On premises" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent activity */}
        <div className="xl:col-span-2 card">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Activity size={17} className="text-primary-400" />
              <h2 className="font-semibold text-white">Recent Activity</h2>
            </div>
            <span className="text-xs text-slate-500">Last 8 events</span>
          </div>

          {recentLogs.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-8">No activity logged yet.</p>
          ) : (
            <div className="space-y-2">
              {recentLogs.map(log => (
                <div key={log.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-surface-hover transition-colors">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0
                    ${log.action === 'entry' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                    {log.action === 'entry' ? '↓' : '↑'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-200 truncate">{log.person_name}</p>
                    <p className="text-xs text-slate-500">{log.location} · {log.person_type}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className={log.action === 'entry' ? 'badge-green' : 'badge-red'}>
                      {log.action}
                    </span>
                    <p className="text-xs text-slate-500 mt-1">{formatTime(log.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Currently inside */}
        <div className="card">
          <div className="flex items-center gap-2 mb-5">
            <Clock size={17} className="text-emerald-400" />
            <h2 className="font-semibold text-white">Currently Inside</h2>
          </div>

          {insideNow.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-8">No one inside.</p>
          ) : (
            <div className="space-y-3">
              {insideNow.map(person => (
                <div key={person.person_id} className="flex items-center gap-3 p-3 rounded-xl bg-surface-DEFAULT">
                  <div className="w-8 h-8 rounded-full bg-primary-600/20 border border-primary-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-primary-400">
                      {person.person_name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-200 truncate">{person.person_name}</p>
                    <p className="text-xs text-slate-500 capitalize">{person.person_type}</p>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
