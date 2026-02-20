import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, LogOut, QrCode, BarChart2, Trash2, Calendar, Zap, X } from 'lucide-react';
import BrutalButton from '../components/BrutalButton';
import { getEvents, createEvent, deleteEvent } from '../api';

export default function Dashboard() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ eventName: '', eventDate: '' });
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();

  const admin = JSON.parse(localStorage.getItem('attendqr_admin') || '{}');

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const data = await getEvents();
      setEvents(Array.isArray(data) ? data : []);
    } catch {
      setError('Failed to load events.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('attendqr_token');
    localStorage.removeItem('attendqr_admin');
    navigate('/auth');
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError('');
    try {
      const res = await createEvent(form);
      if (res.event) {
        setEvents([res.event, ...events]);
        setShowModal(false);
        setForm({ eventName: '', eventDate: '' });
      } else {
        setError(res.message || 'Failed to create event.');
      }
    } catch {
      setError('Network error.');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this event and all its attendance records?')) return;
    try {
      await deleteEvent(id);
      setEvents(events.filter((e) => e._id !== id));
    } catch {
      alert('Failed to delete event.');
    }
  };

  return (
    <div className="bg-grid min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* Header */}
      <header
        style={{
          borderBottom: 'var(--brutal-border)',
          background: '#000',
          padding: '1rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Zap size={22} color="var(--brand-yellow)" fill="var(--brand-yellow)" />
          <span style={{ color: 'var(--brand-yellow)', fontWeight: 900, fontSize: '1.1rem', letterSpacing: '2px' }}>
            ATTENDQR
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ color: '#fff', fontSize: '0.8rem', fontWeight: 700, opacity: 0.7 }}>
            {admin.username || 'Admin'}
          </span>
          <BrutalButton variant="red" onClick={handleLogout}>
            <LogOut size={14} /> Logout
          </BrutalButton>
        </div>
      </header>

      <main style={{ maxWidth: '960px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        {/* Page Title */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '2.5rem', margin: 0 }}>MY EVENTS</h1>
            <p style={{ margin: '0.25rem 0 0', fontWeight: 600, opacity: 0.6, fontSize: '0.9rem' }}>
              {events.length} event{events.length !== 1 ? 's' : ''} total
            </p>
          </div>
          <BrutalButton variant="purple" onClick={() => setShowModal(true)}>
            <Plus size={16} /> New Event
          </BrutalButton>
        </div>

        {/* Event Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', opacity: 0.5, fontWeight: 900, fontSize: '1.2rem' }}>
            LOADING...
          </div>
        ) : events.length === 0 ? (
          <div className="brutal-card" style={{ textAlign: 'center', padding: '4rem', background: 'var(--brand-yellow)' }}>
            <QrCode size={48} style={{ margin: '0 auto 1rem' }} />
            <h2 style={{ margin: '0 0 0.5rem' }}>NO EVENTS YET</h2>
            <p style={{ fontWeight: 600, opacity: 0.7 }}>Create your first event to get started</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1.25rem', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
            <AnimatePresence>
              {events.map((event, i) => (
                <motion.div
                  key={event._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: i * 0.06 }}
                  className="brutal-card"
                  style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
                >
                  <div>
                    <div
                      style={{
                        background: 'var(--brand-purple)',
                        color: '#fff',
                        padding: '0.25rem 0.6rem',
                        display: 'inline-block',
                        fontSize: '0.65rem',
                        fontWeight: 900,
                        letterSpacing: '1.5px',
                        marginBottom: '0.5rem',
                        border: '2px solid #000',
                      }}
                    >
                      EVENT
                    </div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', lineHeight: 1.2 }}>{event.eventName}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.4rem', opacity: 0.6 }}>
                      <Calendar size={13} />
                      <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>{event.eventDate}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <BrutalButton variant="yellow" onClick={() => navigate(`/event/${event._id}/qr`)}>
                      <QrCode size={14} /> QR Codes
                    </BrutalButton>
                    <BrutalButton variant="black" onClick={() => navigate(`/event/${event._id}/stats`)}>
                      <BarChart2 size={14} /> Stats
                    </BrutalButton>
                    <BrutalButton variant="red" onClick={() => handleDelete(event._id)}>
                      <Trash2 size={14} />
                    </BrutalButton>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* Create Event Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 100,
              padding: '1rem',
            }}
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.8, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="brutal-card"
              style={{ width: '100%', maxWidth: '440px', background: '#fff' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ margin: 0, fontSize: '1.5rem' }}>NEW EVENT</h2>
                <button
                  onClick={() => setShowModal(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 900, marginBottom: '0.4rem', letterSpacing: '1px' }}>
                    EVENT NAME
                  </label>
                  <input
                    className="brutal-input"
                    type="text"
                    placeholder="e.g. Annual Tech Summit"
                    value={form.eventName}
                    onChange={(e) => setForm({ ...form, eventName: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 900, marginBottom: '0.4rem', letterSpacing: '1px' }}>
                    EVENT DATE
                  </label>
                  <input
                    className="brutal-input"
                    type="date"
                    value={form.eventDate}
                    onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
                    required
                  />
                </div>

                {error && (
                  <div style={{ background: 'var(--accent-red)', color: '#fff', padding: '0.6rem', border: 'var(--brutal-border)', fontSize: '0.8rem', fontWeight: 700 }}>
                    ⚠ {error}
                  </div>
                )}

                <BrutalButton type="submit" variant="purple" disabled={creating} fullWidth>
                  {creating ? 'Creating...' : '+ Create Event & Generate QR'}
                </BrutalButton>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
