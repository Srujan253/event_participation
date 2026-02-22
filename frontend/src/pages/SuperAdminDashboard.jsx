import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, Clock, LogOut, CheckCircle, XCircle,
  Trash2, RefreshCw, Shield, CalendarDays, Hourglass, UserPlus, Eye, EyeOff,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getSuperAdminStats,
  getSuperAdminRequests,
  updateAdminRequest,
  getSuperAdminAdmins,
  deleteSuperAdminAdmin,
  createSuperAdmin,
  listSuperAdmins,
} from '../api';

// ─── Sidebar Nav Items ────────────────────────────────────────────────────────
const NAV = [
  { id: 'stats',       label: 'Platform Stats',   icon: LayoutDashboard },
  { id: 'requests',    label: 'Pending Requests',  icon: Clock },
  { id: 'admins',      label: 'Active Admins',     icon: Users },
  { id: 'superadmins', label: 'Super Admins',      icon: Shield },
];

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, accent }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: accent, border: '3px solid #000', boxShadow: '6px 6px 0 #000',
        padding: '2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem',
      }}
    >
      <Icon size={28} strokeWidth={3} />
      <div style={{ fontSize: '3.5rem', fontWeight: 900, lineHeight: 1 }}>{value ?? '—'}</div>
      <div style={{ fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '2px', opacity: 0.75 }}>
        {label}
      </div>
    </motion.div>
  );
}

// ─── Brutal Button Helper ─────────────────────────────────────────────────────
function Btn({ children, onClick, bg = '#000', color = '#FFE500', disabled, type = 'button' }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        background: disabled ? '#ccc' : bg, color: disabled ? '#666' : color,
        border: '2px solid #000', boxShadow: disabled ? 'none' : '3px 3px 0 #000',
        padding: '0.45rem 0.9rem', fontFamily: "'Montserrat', sans-serif",
        fontWeight: 900, fontSize: '0.72rem', textTransform: 'uppercase',
        letterSpacing: '1px', cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'transform 0.1s, box-shadow 0.1s', whiteSpace: 'nowrap',
      }}
      onMouseEnter={e => { if (!disabled) { e.currentTarget.style.transform = 'translate(-2px,-2px)'; e.currentTarget.style.boxShadow = '5px 5px 0 #000'; } }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = disabled ? 'none' : '3px 3px 0 #000'; }}
    >
      {children}
    </button>
  );
}

// ─── Input Helper ─────────────────────────────────────────────────────────────
function BrutalInput({ label, name, type = 'text', value, onChange, required, extra }) {
  const [show, setShow] = useState(false);
  const isPass = type === 'password';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
      <label style={{ fontSize: '0.68rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.6 }}>{label}</label>
      <div style={{ position: 'relative' }}>
        <input
          type={isPass && show ? 'text' : type}
          name={name} value={value} onChange={onChange} required={required}
          style={{
            width: '100%', padding: '0.6rem 0.8rem', border: '2px solid #000',
            borderRadius: 0, fontFamily: "'Montserrat', sans-serif", fontWeight: 700,
            fontSize: '0.85rem', boxSizing: 'border-box', outline: 'none',
            paddingRight: isPass ? '2.5rem' : '0.8rem',
          }}
          {...extra}
        />
        {isPass && (
          <button type="button" onClick={() => setShow(s => !s)}
            style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', opacity: 0.5, padding: 0 }}>
            {show ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function SuperAdminDashboard() {
  const [activeTab, setActiveTab] = useState('stats');
  const [stats, setStats]         = useState(null);
  const [requests, setRequests]   = useState([]);
  const [admins, setAdmins]       = useState([]);
  const [superAdmins, setSuperAdmins] = useState([]);
  const [loadingAction, setLoadingAction] = useState(null);

  // Create super admin form state
  const [saForm, setSaForm] = useState({ username: '', email: '', password: '' });
  const [saLoading, setSaLoading] = useState(false);

  const navigate = useNavigate();

  const adminInfo = (() => {
    try { return JSON.parse(localStorage.getItem('attendqr_admin')); } catch { return {}; }
  })();

  const fetchStats        = useCallback(async () => { try { setStats(await getSuperAdminStats()); }        catch { toast.error('Failed to load stats'); } }, []);
  const fetchRequests     = useCallback(async () => { try { setRequests(await getSuperAdminRequests()); }  catch { toast.error('Failed to load requests'); } }, []);
  const fetchAdmins       = useCallback(async () => { try { setAdmins(await getSuperAdminAdmins()); }      catch { toast.error('Failed to load admins'); } }, []);
  const fetchSuperAdmins  = useCallback(async () => { try { setSuperAdmins(await listSuperAdmins()); }     catch { toast.error('Failed to load super admins'); } }, []);

  useEffect(() => {
    fetchStats(); fetchRequests(); fetchAdmins(); fetchSuperAdmins();
  }, [fetchStats, fetchRequests, fetchAdmins, fetchSuperAdmins]);

  const handleRequest = async (id, status) => {
    setLoadingAction(id + status);
    try {
      await updateAdminRequest(id, status);
      toast.success(`Admin ${status.toUpperCase()}!`);
      await Promise.all([fetchRequests(), fetchAdmins(), fetchStats()]);
    } catch { toast.error('Action failed'); }
    finally { setLoadingAction(null); }
  };

  const handleDelete = async (id, username) => {
    if (!window.confirm(`DELETE admin "${username}" and ALL their events? This cannot be undone.`)) return;
    setLoadingAction('del' + id);
    try {
      const res = await deleteSuperAdminAdmin(id);
      toast.success(`ADMIN DELETED · ${res.eventsDeleted} events removed`);
      await Promise.all([fetchAdmins(), fetchStats()]);
    } catch { toast.error('Delete failed'); }
    finally { setLoadingAction(null); }
  };

  const handleCreateSuperAdmin = async (e) => {
    e.preventDefault();
    if (!saForm.username || !saForm.email || !saForm.password) {
      toast.error('All fields are required');
      return;
    }
    setSaLoading(true);
    try {
      const res = await createSuperAdmin(saForm);
      if (res.admin) {
        toast.success(`Super admin "${saForm.username}" created!`);
        setSaForm({ username: '', email: '', password: '' });
        fetchSuperAdmins();
      } else {
        toast.error(res.message || 'Failed to create super admin');
      }
    } catch { toast.error('Failed to create super admin'); }
    finally { setSaLoading(false); }
  };

  const handleLogout = () => { localStorage.clear(); navigate('/auth'); };

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)', fontFamily: "'Montserrat', sans-serif" }}>

      {/* ── Sidebar ── */}
      <aside style={{
        width: '260px', flexShrink: 0, background: '#000', color: '#fff',
        display: 'flex', flexDirection: 'column',
        borderRight: '3px solid #FFE500', position: 'sticky', top: 0, height: '100vh',
      }}>
        {/* Brand */}
        <div style={{ padding: '1.5rem', borderBottom: '2px solid #333' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#FFE500' }}>
            <Shield size={22} strokeWidth={3} />
            <span style={{ fontWeight: 900, fontSize: '1rem', letterSpacing: '2px' }}>SUPER ADMIN</span>
          </div>
          <div style={{ marginTop: '0.4rem', fontSize: '0.73rem', opacity: 0.5, fontWeight: 700, textTransform: 'uppercase' }}>
            {adminInfo?.username || 'Admin'}
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '1rem 0' }}>
          {NAV.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: '0.8rem',
                padding: '0.85rem 1.5rem',
                background: activeTab === id ? '#FFE500' : 'transparent',
                color: activeTab === id ? '#000' : '#aaa',
                border: 'none', borderLeft: activeTab === id ? '4px solid #FFE500' : '4px solid transparent',
                cursor: 'pointer', fontFamily: "'Montserrat', sans-serif",
                fontWeight: 900, fontSize: '0.78rem', textTransform: 'uppercase',
                letterSpacing: '1px', textAlign: 'left', transition: 'all 0.15s',
              }}
            >
              <Icon size={16} strokeWidth={activeTab === id ? 3 : 2} />
              {label}
              {id === 'requests' && requests.length > 0 && (
                <span style={{
                  marginLeft: 'auto', background: '#ff2222', color: '#fff',
                  borderRadius: '0', fontSize: '0.65rem', fontWeight: 900,
                  padding: '1px 6px', border: '1.5px solid #fff',
                }}>
                  {requests.length}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div style={{ padding: '1rem 1.5rem', borderTop: '2px solid #333' }}>
          <button
            onClick={handleLogout}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: '0.6rem',
              background: 'transparent', color: '#ff4444', border: '2px solid #ff4444',
              padding: '0.7rem 1rem', cursor: 'pointer',
              fontFamily: "'Montserrat', sans-serif", fontWeight: 900, fontSize: '0.78rem', textTransform: 'uppercase',
            }}
          >
            <LogOut size={15} /> Logout
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main style={{ flex: 1, overflowY: 'auto', padding: '2.5rem' }}>
        <AnimatePresence mode="wait">

          {/* ══ STATS TAB ══ */}
          {activeTab === 'stats' && (
            <motion.div key="stats" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <h1 style={{ fontWeight: 900, fontSize: '1.8rem', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Platform Stats</h1>
              <p style={{ opacity: 0.5, fontWeight: 700, fontSize: '0.85rem', marginBottom: '2rem' }}>High-level overview of the platform.</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
                <StatCard label="Active Admins"    value={stats?.totalAdmins}     icon={Users}        accent="#FFE500" />
                <StatCard label="Total Events"     value={stats?.totalEvents}     icon={CalendarDays} accent="#B8F5B0" />
                <StatCard label="Pending Requests" value={stats?.pendingRequests} icon={Hourglass}    accent="#FFB3B3" />
              </div>
              <div style={{ marginTop: '2rem' }}>
                <Btn onClick={() => { fetchStats(); toast.success('Stats refreshed'); }} bg="#000">
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><RefreshCw size={12} /> Refresh</span>
                </Btn>
              </div>
            </motion.div>
          )}

          {/* ══ PENDING REQUESTS TAB ══ */}
          {activeTab === 'requests' && (
            <motion.div key="requests" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.3rem' }}>
                <h1 style={{ fontWeight: 900, fontSize: '1.8rem', textTransform: 'uppercase', margin: 0 }}>Pending Requests</h1>
                <Btn onClick={() => { fetchRequests(); fetchStats(); toast.success('Requests refreshed'); }} bg="#000">
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><RefreshCw size={12} /> Refresh</span>
                </Btn>
              </div>
              <p style={{ opacity: 0.5, fontWeight: 700, fontSize: '0.85rem', marginBottom: '2rem' }}>
                {requests.length} request{requests.length !== 1 ? 's' : ''} awaiting approval.
              </p>
              {requests.length === 0 ? (
                <div style={{ border: '3px solid #000', boxShadow: '5px 5px 0 #000', padding: '3rem', textAlign: 'center', background: '#fff', maxWidth: '400px' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>✅</div>
                  <div style={{ fontWeight: 900, textTransform: 'uppercase' }}>All clear — no pending requests</div>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                  {requests.map((req) => (
                    <motion.div
                      key={req._id}
                      initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                      style={{ background: '#fff', border: '3px solid #000', boxShadow: '5px 5px 0 #000', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <div style={{ width: '36px', height: '36px', background: '#FFE500', border: '2px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1rem' }}>
                          {req.username[0].toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 900, textTransform: 'uppercase', fontSize: '0.9rem' }}>{req.username}</div>
                          <div style={{ fontSize: '0.75rem', opacity: 0.6, fontWeight: 700 }}>{req.email}</div>
                        </div>
                      </div>
                      <div style={{ background: '#f5f5f5', border: '2px solid #000', padding: '0.6rem 0.8rem' }}>
                        <div style={{ fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase', opacity: 0.5, marginBottom: '0.2rem' }}>Purpose</div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 700, lineHeight: 1.4 }}>{req.purpose || '—'}</div>
                      </div>
                      <div style={{ fontSize: '0.7rem', opacity: 0.5, fontWeight: 700 }}>Applied: {new Date(req.createdAt).toLocaleDateString()}</div>
                      <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.25rem' }}>
                        <Btn bg="#22c55e" color="#fff" onClick={() => handleRequest(req._id, 'approved')} disabled={loadingAction === req._id + 'approved'}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><CheckCircle size={13} /> Approve</span>
                        </Btn>
                        <Btn bg="#ef4444" color="#fff" onClick={() => handleRequest(req._id, 'rejected')} disabled={loadingAction === req._id + 'rejected'}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><XCircle size={13} /> Reject</span>
                        </Btn>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ══ ACTIVE ADMINS TAB ══ */}
          {activeTab === 'admins' && (
            <motion.div key="admins" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <h1 style={{ fontWeight: 900, fontSize: '1.8rem', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Active Admins</h1>
              <p style={{ opacity: 0.5, fontWeight: 700, fontSize: '0.85rem', marginBottom: '2rem' }}>
                {admins.length} approved admin{admins.length !== 1 ? 's' : ''} on the platform.
              </p>
              {admins.length === 0 ? (
                <div style={{ border: '3px solid #000', boxShadow: '5px 5px 0 #000', padding: '3rem', textAlign: 'center', background: '#fff', maxWidth: '400px' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🚫</div>
                  <div style={{ fontWeight: 900, textTransform: 'uppercase' }}>No approved admins yet</div>
                </div>
              ) : (
                <div style={{ background: '#fff', border: '3px solid #000', boxShadow: '6px 6px 0 #000', overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#000', color: '#FFE500' }}>
                        {['Username', 'Email', 'Events Created', 'Joined', 'Actions'].map((h) => (
                          <th key={h} style={{ padding: '0.9rem 1rem', textAlign: 'left', fontSize: '0.72rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1.5px', whiteSpace: 'nowrap' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {admins.map((admin, i) => (
                        <tr key={admin._id} style={{ borderBottom: '2px solid #000', background: i % 2 === 0 ? '#fff' : '#FAFAF5' }}>
                          <td style={{ padding: '0.85rem 1rem', fontWeight: 900, textTransform: 'uppercase', fontSize: '0.85rem' }}>{admin.username}</td>
                          <td style={{ padding: '0.85rem 1rem', fontSize: '0.82rem', fontWeight: 600, opacity: 0.7 }}>{admin.email}</td>
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <span style={{ background: '#FFE500', border: '2px solid #000', padding: '2px 10px', fontWeight: 900, fontSize: '0.85rem' }}>{admin.totalEventsCreated}</span>
                          </td>
                          <td style={{ padding: '0.85rem 1rem', fontSize: '0.75rem', fontWeight: 700, opacity: 0.5 }}>{new Date(admin.createdAt).toLocaleDateString()}</td>
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <Btn bg="#ef4444" color="#fff" onClick={() => handleDelete(admin._id, admin.username)} disabled={loadingAction === 'del' + admin._id}>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Trash2 size={12} /> Delete Admin</span>
                            </Btn>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          )}

          {/* ══ SUPER ADMINS TAB ══ */}
          {activeTab === 'superadmins' && (
            <motion.div key="superadmins" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <h1 style={{ fontWeight: 900, fontSize: '1.8rem', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Super Admins</h1>
              <p style={{ opacity: 0.5, fontWeight: 700, fontSize: '0.85rem', marginBottom: '2rem' }}>
                Manage platform-level super admin accounts.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px,400px) 1fr', gap: '2rem', alignItems: 'start' }}>

                {/* ── Create Form ── */}
                <div style={{ background: '#fff', border: '3px solid #000', boxShadow: '6px 6px 0 #000' }}>
                  {/* Form Header */}
                  <div style={{ background: '#000', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#FFE500' }}>
                    <UserPlus size={16} strokeWidth={3} />
                    <span style={{ fontWeight: 900, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                      Create Super Admin
                    </span>
                  </div>
                  <form onSubmit={handleCreateSuperAdmin} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <BrutalInput
                      label="Username" name="username" value={saForm.username} required
                      onChange={e => setSaForm(f => ({ ...f, username: e.target.value }))}
                    />
                    <BrutalInput
                      label="Email" name="email" type="email" value={saForm.email} required
                      onChange={e => setSaForm(f => ({ ...f, email: e.target.value }))}
                    />
                    <BrutalInput
                      label="Password" name="password" type="password" value={saForm.password} required
                      onChange={e => setSaForm(f => ({ ...f, password: e.target.value }))}
                    />
                    <Btn type="submit" bg="#000" disabled={saLoading}>
                      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                        <UserPlus size={13} /> {saLoading ? 'Creating...' : 'Create Super Admin'}
                      </span>
                    </Btn>
                  </form>
                </div>

                {/* ── Super Admins List ── */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <span style={{ fontWeight: 900, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                      {superAdmins.length} super admin{superAdmins.length !== 1 ? 's' : ''}
                    </span>
                    <Btn onClick={() => { fetchSuperAdmins(); toast.success('List refreshed'); }} bg="#000">
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><RefreshCw size={12} /> Refresh</span>
                    </Btn>
                  </div>

                  {superAdmins.length === 0 ? (
                    <div style={{ border: '3px solid #000', padding: '2rem', textAlign: 'center', background: '#fff', boxShadow: '4px 4px 0 #000' }}>
                      <div style={{ fontWeight: 900, textTransform: 'uppercase', opacity: 0.5 }}>No super admins found</div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {superAdmins.map((sa, i) => (
                        <motion.div
                          key={sa._id}
                          initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                          style={{
                            background: '#fff', border: '2px solid #000', boxShadow: '4px 4px 0 #000',
                            padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem',
                          }}
                        >
                          {/* Avatar */}
                          <div style={{
                            width: '40px', height: '40px', flexShrink: 0,
                            background: '#000', color: '#FFE500',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 900, fontSize: '1.1rem', border: '2px solid #000',
                          }}>
                            {sa.username[0].toUpperCase()}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 900, textTransform: 'uppercase', fontSize: '0.88rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {sa.username}
                            </div>
                            <div style={{ fontSize: '0.75rem', opacity: 0.6, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {sa.email}
                            </div>
                          </div>
                          <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <span style={{ background: '#FFE500', border: '2px solid #000', padding: '2px 8px', fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                              Super Admin
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  );
}
