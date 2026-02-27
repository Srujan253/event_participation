import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, CheckCircle, LogOut, Trophy, RefreshCw, Download, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import LuminaButton from '../components/LuminaButton';
import Navbar from '../components/Navbar';
import { getEventStats, getAttendanceRecords, exportAttendanceCSV } from '../api';

export default function EventStatsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsData, recordsData] = await Promise.all([
        getEventStats(id),
        getAttendanceRecords(id),
      ]);
      setStats(statsData);
      setRecords(Array.isArray(recordsData) ? recordsData : []);
      toast.success('DATA SYNCHRONIZED');
    } catch {
      toast.error('SYNC FAILED');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleExport = async () => {
    setExportLoading(true);
    try {
      await exportAttendanceCSV(id, stats?.event?.eventName);
      toast.success('CSV Download Complete!');
    } catch {
      toast.error('Download Failed. Try again.');
    } finally {
      setExportLoading(false);
    }
  };

  const formatTime = (dt) => {
    if (!dt) return '—';
    return new Date(dt).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: 'var(--bg-surface)' }}>
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Synchronizing Intelligence...</p>
      </div>
    );
  }

  const event = stats?.event;
  const completionRate = stats?.totalParticipants
    ? Math.round((stats.complete / stats.totalParticipants) * 100)
    : 0;

  const statCards = [
    { label: 'Total Registration', value: stats?.totalParticipants, color: '#2563EB', icon: <Users size={20} /> },
    { label: 'Active Check-In', value: stats?.checkedIn, color: '#F59E0B', icon: <CheckCircle size={20} /> },
    { label: 'Successful Departure', value: stats?.checkedOut, color: '#8B5CF6', icon: <LogOut size={20} /> },
    { label: 'Complete Cycle', value: stats?.complete, color: '#10B981', icon: <Trophy size={20} /> },
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-surface)', fontFamily: "'Inter', sans-serif" }}>
      <Navbar />
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        {/* Header Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <LuminaButton onClick={() => navigate('/')} variant="ghost" className="!pl-0 !text-gray-500">
            <ArrowLeft size={18} className="mr-2" /> Return to Terminal
          </LuminaButton>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <LuminaButton onClick={fetchData} variant="secondary">
              <RefreshCw size={14} className="mr-2" /> Sync Data
            </LuminaButton>
            <LuminaButton
              onClick={handleExport}
              disabled={exportLoading || records.length === 0}
              variant="primary"
            >
              <Download size={14} className="mr-2" />
              {exportLoading ? 'Exporting...' : 'Export CSV'}
            </LuminaButton>
          </div>
        </div>

        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
          {/* Main Stats Header */}
          <div className="lumina-card !p-6 md:!p-10 mb-8 overflow-hidden relative">
            <div className="relative z-10">
              <div className="flex items-center gap-2 text-blue-600 font-extrabold text-[10px] tracking-[0.2em] uppercase mb-4">
                <div className="w-4 h-[2px] bg-blue-600" />
                INSIGHTS ENGINE
              </div>
              <h1 className="text-4xl font-extrabold text-gray-900 tracking-tighter mb-2">{event?.eventName}</h1>
              {event?.description && (
                <p className="text-gray-600 text-sm mb-4 max-w-2xl leading-relaxed whitespace-pre-wrap">
                  {event.description}
                </p>
              )}
              <div className="flex items-center gap-4 text-gray-500 font-bold text-sm">
                <div className="flex items-center gap-1.5"><Calendar size={14} /> {event?.eventDate}</div>
                <div className="w-1 h-1 bg-gray-300 rounded-full" />
                <div className="flex items-center gap-1.5"><Users size={14} /> Admin Controlled</div>
              </div>
            </div>
            <div className="absolute top-[-40px] right-[-40px] w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-40" />
          </div>

          {/* Stat Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statCards.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="lumina-card flex flex-col gap-3 group hover:shadow-xl transition-shadow duration-300"
                style={{ borderLeft: `4px solid ${s.color}` }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-1 group-hover:scale-110 transition-transform duration-300" style={{ backgroundColor: `${s.color}15` }}>
                  {/* Re-cloning icon to apply color */}
                  {Object.assign({}, s.icon, { props: { ...s.icon.props, color: s.color } })}
                </div>
                <div className="text-4xl font-extrabold text-gray-900 leading-none tracking-tight">{s.value ?? 0}</div>
                <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-gray-400">
                  {s.label}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Completion Progress */}
          <div className="lumina-card mb-8">
            <div className="flex justify-between items-end mb-4">
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">Ecosystem Saturation</h4>
                <div className="text-sm font-bold text-gray-900">Full Participant Lifecycle Completion</div>
              </div>
              <div className="text-3xl font-black text-blue-600 leading-none">{completionRate}%</div>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden border border-gray-50">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${completionRate}%` }}
                transition={{ duration: 1, ease: 'circOut' }}
                className="h-full bg-blue-600 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.3)]"
              />
            </div>
          </div>

          {/* Attendance Table */}
          <div className="lumina-card !p-0 overflow-hidden shadow-xl border border-gray-100">
            <div className="p-6 border-b border-gray-50 bg-gray-50/30 flex items-center justify-between">
              <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Participant Registry</h2>
              <div className="text-[10px] font-bold text-gray-400">{records.length} Total Records</div>
            </div>

            {records.length === 0 ? (
              <div className="p-16 text-center">
                <Users size={32} className="text-gray-200 mx-auto mb-4" />
                <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Registry is currently empty</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
                  <thead>
                    <tr className="bg-white">
                      {['#', 'Participant', 'Check-In', 'Check-Out', 'Lifecycle'].map((h) => (
                        <th
                          key={h}
                          className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-left border-b border-gray-100"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <motion.tbody 
                    className="divide-y divide-gray-50"
                    variants={{
                      hidden: { opacity: 0 },
                      show: {
                        opacity: 1,
                        transition: {
                          staggerChildren: 0.03
                        }
                      }
                    }}
                    initial="hidden"
                    animate="show"
                  >
                    {records.map((r, i) => (
                      <motion.tr 
                        key={r._id} 
                        variants={{
                          hidden: { opacity: 0, x: -10 },
                          show: { opacity: 1, x: 0 }
                        }}
                        className="hover:bg-blue-50/30 transition-colors duration-200"
                      >
                        <td className="px-6 py-4 text-[11px] font-bold text-gray-400">{(i + 1).toString().padStart(2, '0')}</td>
                        <td className="px-6 py-4">
                          <div className="font-extrabold text-sm text-gray-900 tracking-tight">{r.participantName}</div>
                        </td>
                        <td className="px-6 py-4 text-[11px] font-bold text-gray-500 font-mono">
                          {r.checkInStart ? formatTime(r.checkInStartTime) : '—'}
                        </td>
                        <td className="px-6 py-4 text-[11px] font-bold text-gray-500 font-mono">
                          {r.checkInEnd ? formatTime(r.checkInEndTime) : '—'}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                              r.isComplete
                                ? 'bg-green-50 text-green-600 border-green-100'
                                : r.checkInStart
                                ? 'bg-amber-50 text-amber-600 border-amber-100'
                                : 'bg-gray-50 text-gray-400 border-gray-100'
                            }`}
                          >
                            {r.isComplete ? 'Complete' : r.checkInStart ? 'Active' : 'Absent'}
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </motion.tbody>
                </table>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
