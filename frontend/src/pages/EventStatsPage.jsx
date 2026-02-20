import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, CheckCircle, LogOut, Trophy, RefreshCw } from 'lucide-react';
import BrutalButton from '../components/BrutalButton';
import { getEventStats, getAttendanceRecords } from '../api';

export default function EventStatsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsData, recordsData] = await Promise.all([
        getEventStats(id),
        getAttendanceRecords(id),
      ]);
      setStats(statsData);
      setRecords(Array.isArray(recordsData) ? recordsData : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <p style={{ fontWeight: 900, fontSize: '1.5rem' }}>LOADING...</p>
      </div>
    );
  }

  const event = stats?.event;
  const completionRate = stats?.totalParticipants
    ? Math.round((stats.complete / stats.totalParticipants) * 100)
    : 0;

  const statCards = [
    { label: 'Total', value: stats?.totalParticipants, color: '#000', textColor: '#fff', icon: <Users size={20} color="#fff" /> },
    { label: 'Checked In', value: stats?.checkedIn, color: 'var(--brand-yellow)', textColor: '#000', icon: <CheckCircle size={20} /> },
    { label: 'Checked Out', value: stats?.checkedOut, color: 'var(--brand-purple)', textColor: '#fff', icon: <LogOut size={20} color="#fff" /> },
    { label: 'Complete', value: stats?.complete, color: '#00C853', textColor: '#000', icon: <Trophy size={20} /> },
  ];

  return (
    <div className="bg-grid min-h-screen" style={{ background: 'var(--bg-primary)', padding: '1.5rem' }}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>
        {/* Back */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <BrutalButton onClick={() => navigate('/')} variant="white">
            <ArrowLeft size={14} /> Back
          </BrutalButton>
          <BrutalButton onClick={fetchData} variant="black">
            <RefreshCw size={14} /> Refresh
          </BrutalButton>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Event Header */}
          <div className="brutal-card" style={{ background: '#000', color: '#fff', marginBottom: '1.5rem' }}>
            <div
              style={{
                background: 'var(--brand-yellow)',
                color: '#000',
                padding: '0.2rem 0.6rem',
                display: 'inline-block',
                fontSize: '0.65rem',
                fontWeight: 900,
                letterSpacing: '1.5px',
                marginBottom: '0.5rem',
                border: '2px solid #fff',
              }}
            >
              ATTENDANCE STATS
            </div>
            <h1 style={{ margin: '0 0 0.25rem', fontSize: '2rem', color: '#fff' }}>{event?.eventName}</h1>
            <p style={{ margin: 0, opacity: 0.6, fontWeight: 700, fontSize: '0.9rem' }}>{event?.eventDate}</p>
          </div>

          {/* Stat Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '1rem',
              marginBottom: '1.5rem',
            }}
          >
            {statCards.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                style={{
                  background: s.color,
                  color: s.textColor,
                  border: 'var(--brutal-border)',
                  boxShadow: 'var(--brutal-shadow)',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: 0.8, fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px' }}>
                  {s.icon} {s.label}
                </div>
                <div style={{ fontSize: '2.5rem', fontWeight: 900, lineHeight: 1 }}>{s.value ?? 0}</div>
              </motion.div>
            ))}
          </div>

          {/* Completion Bar */}
          <div className="brutal-card" style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ fontWeight: 900, fontSize: '0.85rem', letterSpacing: '1px', textTransform: 'uppercase' }}>
                Full Completion Rate
              </span>
              <span style={{ fontWeight: 900, fontSize: '1.5rem' }}>{completionRate}%</span>
            </div>
            <div style={{ height: '20px', border: 'var(--brutal-border)', background: '#f0f0f0', position: 'relative' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${completionRate}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                style={{ height: '100%', background: 'var(--brand-purple)', position: 'absolute', left: 0, top: 0 }}
              />
            </div>
          </div>

          {/* Attendance Table */}
          <div className="brutal-card">
            <h2 style={{ margin: '0 0 1rem', fontSize: '1.2rem' }}>PARTICIPANT RECORDS</h2>

            {records.length === 0 ? (
              <p style={{ opacity: 0.5, fontWeight: 600 }}>No participants have checked in yet.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr>
                      {['#', 'Name', 'Check-In Time', 'Check-Out Time', 'Status'].map((h) => (
                        <th
                          key={h}
                          style={{
                            border: 'var(--brutal-border)',
                            padding: '0.6rem 0.8rem',
                            background: '#000',
                            color: 'var(--brand-yellow)',
                            fontWeight: 900,
                            textAlign: 'left',
                            fontSize: '0.7rem',
                            letterSpacing: '1px',
                            textTransform: 'uppercase',
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((r, i) => (
                      <tr
                        key={r._id}
                        style={{ background: i % 2 === 0 ? '#fff' : 'var(--bg-primary)' }}
                      >
                        <td style={{ border: 'var(--brutal-border)', padding: '0.6rem 0.8rem', fontWeight: 700 }}>{i + 1}</td>
                        <td style={{ border: 'var(--brutal-border)', padding: '0.6rem 0.8rem', fontWeight: 700 }}>{r.participantName}</td>
                        <td style={{ border: 'var(--brutal-border)', padding: '0.6rem 0.8rem', fontFamily: 'monospace', fontWeight: 600 }}>
                          {r.checkInStart ? formatTime(r.checkInStartTime) : '—'}
                        </td>
                        <td style={{ border: 'var(--brutal-border)', padding: '0.6rem 0.8rem', fontFamily: 'monospace', fontWeight: 600 }}>
                          {r.checkInEnd ? formatTime(r.checkInEndTime) : '—'}
                        </td>
                        <td style={{ border: 'var(--brutal-border)', padding: '0.6rem 0.8rem' }}>
                          <span
                            className="badge"
                            style={{
                              background: r.isComplete
                                ? '#00C853'
                                : r.checkInStart
                                ? 'var(--brand-yellow)'
                                : '#eee',
                              color: '#000',
                              fontSize: '0.65rem',
                            }}
                          >
                            {r.isComplete ? '✓ Complete' : r.checkInStart ? '→ In' : '○ Absent'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
