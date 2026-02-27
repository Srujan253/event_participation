import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Calendar, Edit2, Trash2, User, QrCode, BarChart2, Plus } from 'lucide-react';
import { getEvents, createEvent, deleteEvent, updateEvent } from '../api';
import Navbar from '../components/Navbar';
import LuminaButton from '../components/LuminaButton';

export default function Dashboard() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('list'); // 'list', 'create'
  
  // Create / Edit Form State
  const [form, setForm] = useState({ eventName: '', eventDate: '' });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      if (editingId) {
        // Update Event
        const res = await updateEvent(editingId, form);
        if (res.event) {
          setEvents(events.map(ev => ev._id === editingId ? { ...res.event, stats: ev.stats } : ev));
          setForm({ eventName: '', eventDate: '' });
          setEditingId(null);
          setActiveTab('list');
        } else {
          setError(res.message || 'Failed to update event.');
        }
      } else {
        // Create Event
        const res = await createEvent(form);
        if (res.event) {
          // New event stats are 0
          const newEvent = { ...res.event, stats: { total: 0, complete: 0, incomplete: 0 } };
          setEvents([newEvent, ...events]);
          setForm({ eventName: '', eventDate: '' });
          setActiveTab('list');
        } else {
          setError(res.message || 'Failed to create event.');
        }
      }
    } catch {
      setError('Network error.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (event) => {
    setEditingId(event._id);
    setForm({ eventName: event.eventName, eventDate: event.eventDate });
    setActiveTab('create');
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
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-surface)', fontFamily: "'Inter', sans-serif" }}>
      <Navbar />

      {/* Main Content Area */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        
        {/* Navigation Tabs */}
        <div className="flex bg-white rounded-xl p-1.5 shadow-sm border border-gray-200 mb-8 max-w-fit">
          <button
            onClick={() => { setActiveTab('list'); setEditingId(null); setForm({ eventName: '', eventDate: '' }); }}
            className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'list' 
                ? 'bg-blue-600 text-white shadow-md shadow-blue-200' 
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            Event List
          </button>
          <button
            onClick={() => { setActiveTab('create'); setEditingId(null); setForm({ eventName: '', eventDate: '' }); }}
            className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'create' 
                ? 'bg-blue-600 text-white shadow-md shadow-blue-200' 
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            {editingId ? 'Edit Event' : 'Create Event'}
          </button>
        </div>

        {/* Tab Content */}
        <div style={{ padding: '2rem 1rem' }}>
          
          {/* EVENT LIST TAB */}
          {activeTab === 'list' && (
            <>
              {loading ? (
                <div style={{ textAlign: 'center', padding: '6rem 0' }}>
                  <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-gray-500 font-medium">Loading amazing events...</p>
                </div>
              ) : events.length === 0 ? (
                <div className="lumina-card text-center py-16 flex flex-col items-center">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                    <Calendar size={32} className="text-gray-300" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No Events Yet</h3>
                  <p className="text-gray-500 max-w-xs mb-8">Ready to start? Create your first event to generate QR codes and track participation.</p>
                  <LuminaButton onClick={() => setActiveTab('create')}>
                    <Plus size={18} /> Create First Event
                  </LuminaButton>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
                  {events.map((event) => (
                    <div
                      key={event._id}
                      className="lumina-card flex flex-col justify-between"
                    >
                      <div>
                        {/* Event Name */}
                        <h3 
                          className="text-lg font-bold text-gray-900 hover:text-blue-600 transition-colors cursor-pointer mb-2"
                          onClick={() => navigate(`/event/${event._id}/qr`)}
                        >
                          {event.eventName}
                        </h3>
                        
                        <div className="flex items-center gap-2 text-gray-500 text-sm mb-6">
                          <Calendar size={14} />
                          {event.eventDate}
                        </div>
                        
                        {/* Stats Row */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '0.75rem', marginBottom: '1rem', textAlign: 'center' }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '1.25rem', fontWeight: 600, color: '#333' }}>{event.stats?.complete || 0}</div>
                            <div style={{ fontSize: '0.75rem', color: '#888', textTransform: 'lowercase' }}>completion</div>
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '1.25rem', fontWeight: 600, color: '#333' }}>{event.stats?.incomplete || 0}</div>
                            <div style={{ fontSize: '0.75rem', color: '#888', textTransform: 'lowercase' }}>incomplete</div>
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '1.25rem', fontWeight: 600, color: '#333' }}>{event.stats?.total || 0}</div>
                            <div style={{ fontSize: '0.75rem', color: '#888', textTransform: 'lowercase' }}>Total</div>
                          </div>
                        </div>
                      </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                          <LuminaButton 
                            onClick={() => navigate(`/event/${event._id}/qr`)}
                            variant="primary"
                            className="!py-2"
                          >
                            <QrCode size={14} /> QR Codes
                          </LuminaButton>
                          <LuminaButton 
                            onClick={() => navigate(`/event/${event._id}/stats`)}
                            variant="secondary"
                            className="!py-2"
                          >
                            <BarChart2 size={14} /> Stats
                          </LuminaButton>
                          <LuminaButton 
                            onClick={() => handleEdit(event)}
                            variant="secondary"
                            className="!py-2 !text-blue-600 !border-blue-100 !bg-blue-50/50 hover:!bg-blue-50"
                          >
                            <Edit2 size={14} /> Edit
                          </LuminaButton>
                          <LuminaButton 
                            onClick={() => handleDelete(event._id)}
                            variant="ghost"
                            className="!py-2 !text-red-500 hover:!bg-red-50"
                          >
                            <Trash2 size={14} /> Delete
                          </LuminaButton>
                        </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* CREATE / EDIT EVENT TAB */}
          {activeTab === 'create' && (
            <div className="lumina-card max-w-[600px] mx-auto p-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">
                {editingId ? 'Edit Event Details' : 'Design New Event'}
              </h2>
              
              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-gray-700">Event Name</label>
                  <input
                    type="text"
                    value={form.eventName}
                    onChange={(e) => setForm({ ...form, eventName: e.target.value })}
                    required
                    className="lumina-input"
                    placeholder="Enter a descriptive event name"
                  />
                </div>
                
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-gray-700">Event Date</label>
                  <input
                    type="date"
                    value={form.eventDate}
                    onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
                    required
                    className="lumina-input"
                  />
                </div>

                {error && (
                  <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-semibold border border-red-100">
                    {error}
                  </div>
                )}

                <div className="flex gap-4 mt-4">
                  <LuminaButton 
                    type="submit" 
                    disabled={submitting}
                    fullWidth
                  >
                    {submitting ? 'Syncing...' : (editingId ? 'Update Event' : 'Launch Event')}
                  </LuminaButton>
                  {editingId && (
                    <LuminaButton 
                      variant="secondary"
                      onClick={() => { setActiveTab('list'); setEditingId(null); setForm({ eventName: '', eventDate: '' }); }}
                    >
                      Cancel
                    </LuminaButton>
                  )}
                </div>
              </form>
            </div>
          )}
          
        </div>
      </main>
    </div>
  );
}
