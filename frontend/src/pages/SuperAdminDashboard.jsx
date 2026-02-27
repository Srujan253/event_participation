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
import LuminaButton from '../components/LuminaButton';
import Magnetic from '../components/Magnetic';

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
      className="lumina-card flex flex-col gap-3"
      style={{ borderLeft: `4px solid ${accent}` }}
    >
      <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-1" style={{ backgroundColor: `${accent}20` }}>
        <Icon size={20} color={accent} />
      </div>
      <div className="text-4xl font-extrabold text-gray-900 leading-none tracking-tight">{value ?? '—'}</div>
      <div className="text-xs font-bold uppercase tracking-wider text-gray-500">
        {label}
      </div>
    </motion.div>
  );
}

// ─── Button Replacement done via LuminaButton ───

// ─── Input Helper ─────────────────────────────────────────────────────────────
function LuminaInput({ label, name, type = 'text', value, onChange, required, extra }) {
  const [show, setShow] = useState(false);
  const isPass = type === 'password';
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{label}</label>
      <div className="relative">
        <input
          type={isPass && show ? 'text' : type}
          name={name} value={value} onChange={onChange} required={required}
          className="lumina-input !py-2 !px-3 !text-sm"
          style={{ paddingRight: isPass ? '2.5rem' : '0.75rem' }}
          {...extra}
        />
        {isPass && (
          <button type="button" onClick={() => setShow(s => !s)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
            {show ? <EyeOff size={14} /> : <Eye size={14} />}
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
    <div className="flex min-h-screen bg-gray-50 font-['Inter',sans-serif] text-gray-900">

      {/* ── Sidebar ── */}
      <aside className="w-64 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col sticky top-0 h-screen">
        {/* Brand */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-2 text-blue-600">
            <Shield size={22} strokeWidth={2.5} />
            <span className="font-extrabold text-sm tracking-widest">SUPER ADMIN</span>
          </div>
          <div className="mt-2 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
            {adminInfo?.username || 'Admin'}
          </div>
        </div>

        {/* Nav */}
        <motion.nav 
          className="flex-1 py-4 px-3 overflow-y-auto"
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: {
                staggerChildren: 0.05
              }
            }
          }}
          initial="hidden"
          animate="show"
        >
          {NAV.map(({ id, label, icon: Icon }) => (
            <motion.button
              key={id}
              variants={{
                hidden: { opacity: 0, x: -10 },
                show: { opacity: 1, x: 0 }
              }}
              onClick={() => setActiveTab(id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all mb-1 ${
                activeTab === id 
                  ? 'bg-blue-50 text-blue-600 shadow-sm shadow-blue-100' 
                  : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Icon size={16} strokeWidth={activeTab === id ? 2.5 : 2} />
              {label}
              {id === 'requests' && requests.length > 0 && (
                <span className="ml-auto bg-red-100 text-red-600 rounded-full text-[10px] px-2 py-0.5 border border-red-200">
                  {requests.length}
                </span>
              )}
            </motion.button>
          ))}
        </motion.nav>

        {/* Logout */}
        <div className="p-6 border-t border-gray-100 flex justify-center">
          <div className="w-full relative">
            <Magnetic>
              <motion.button
                whileHover={{ scale: 1.03, backgroundColor: '#fef2f2', y: -2 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-red-600 font-bold text-sm tracking-wider transition-colors border border-transparent hover:border-red-100 cursor-pointer"
                style={{
                  boxShadow: '0 4px 6px -1px rgba(239, 68, 68, 0.05)',
                }}
              >
                <LogOut size={16} strokeWidth={2.5} /> LOGOUT
              </motion.button>
            </Magnetic>
          </div>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main style={{ flex: 1, overflowY: 'auto', padding: '2.5rem' }}>
        <AnimatePresence mode="wait">

          {/* ══ STATS TAB ══ */}
          {activeTab === 'stats' && (
            <motion.div key="stats" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2 uppercase">Platform Performance</h1>
              <p className="text-sm font-bold text-gray-400 mb-8 tracking-wide">ECOSYSTEM ANALYTICS & HUB OVERVIEW</p>
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
                variants={{
                  hidden: { opacity: 0 },
                  show: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.1
                    }
                  }
                }}
                initial="hidden"
                animate="show"
              >
                <StatCard label="Active Admins"    value={stats?.totalAdmins}     icon={Users}        accent="#2563EB" />
                <StatCard label="Total Events"     value={stats?.totalEvents}     icon={CalendarDays} accent="#10B981" />
                <StatCard label="Pending Requests" value={stats?.pendingRequests} icon={Hourglass}    accent="#F43F5E" />
              </motion.div>
              <div className="mt-8">
                <LuminaButton onClick={() => { fetchStats(); toast.success('SYNCED DATA'); }} variant="secondary">
                  <RefreshCw size={14} className="mr-2" /> Sync Data
                </LuminaButton>
              </div>
            </motion.div>
          )}

          {/* ══ PENDING REQUESTS TAB ══ */}
          {activeTab === 'requests' && (
            <motion.div key="requests" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Access Gate</h1>
                  <p className="text-sm font-bold text-gray-400 mt-1 uppercase tracking-wide">
                    {requests.length} admin application{requests.length !== 1 ? 's' : ''} pending
                  </p>
                </div>
                <LuminaButton onClick={() => { fetchRequests(); fetchStats(); toast.success('GATE SYNCED'); }} variant="secondary">
                  <RefreshCw size={14} className="mr-2" /> Sync Gate
                </LuminaButton>
              </div>

              {requests.length === 0 ? (
                <div className="lumina-card text-center py-20 flex flex-col items-center">
                  <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle size={32} className="text-green-500" />
                  </div>
                  <h3 className="text-xl font-extrabold text-gray-900 mb-2 uppercase tracking-tight">Access Log Clear</h3>
                  <p className="text-gray-500 max-w-xs font-medium">All applications have been processed. Great work!</p>
                </div>
              ) : (
                <motion.div 
                  className="grid grid-cols-1 xl:grid-cols-2 gap-6"
                  variants={{
                    hidden: { opacity: 0 },
                    show: {
                      opacity: 1,
                      transition: {
                        staggerChildren: 0.1
                      }
                    }
                  }}
                  initial="hidden"
                  animate="show"
                >
                  {requests.map((req) => (
                    <motion.div
                      key={req._id}
                      variants={{
                        hidden: { opacity: 0, y: 20 },
                        show: { opacity: 1, y: 0 }
                      }}
                      className="lumina-card overflow-hidden !p-0"
                    >
                      <div className="p-6">
                        <div className="flex items-center gap-4 mb-6">
                          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center font-black text-blue-600 text-lg border border-blue-100">
                            {req.username[0].toUpperCase()}
                          </div>
                          <div>
                            <div className="font-extrabold text-gray-900 uppercase tracking-tight">{req.username}</div>
                            <div className="text-xs font-bold text-gray-500">{req.email}</div>
                          </div>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 mb-6">
                          <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Statement of Purpose</div>
                          <div className="text-sm font-semibold text-gray-700 leading-relaxed">{req.purpose || '—'}</div>
                        </div>
                        <div className="flex bg-white gap-2 mt-auto pt-6 border-t border-gray-100">
                  <LuminaButton
                    variant="primary"
                    fullWidth
                    onClick={() => handleRequest(req._id, 'approved')}
                    disabled={loadingAction === req._id + 'approved'}
                  >
                    <CheckCircle size={14} className="mr-1" /> Approve
                  </LuminaButton>
                  <LuminaButton
                    variant="danger"
                    fullWidth
                    onClick={() => handleRequest(req._id, 'rejected')}
                    disabled={loadingAction === req._id + 'rejected'}
                  >
                    <XCircle size={14} className="mr-1" /> Reject
                  </LuminaButton>
                </div>
                      </div>
                      <div className="bg-gray-50/50 px-6 py-3 border-t border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        Submitted: {new Date(req.createdAt).toLocaleDateString()}
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
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
                <div style={{ border: '3px solid #E2E8F0', boxShadow: '5px 5px 0 #F1F5F9', padding: '3rem', textAlign: 'center', background: '#fff', maxWidth: '400px' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🚫</div>
                  <div style={{ fontWeight: 900, textTransform: 'uppercase', color: '#64748B' }}>No approved admins yet</div>
                </div>
              ) : (
                <div style={{ background: '#fff', border: '3px solid #E2E8F0', boxShadow: '6px 6px 0 #F1F5F9', overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#EEF2FF', color: '#4338CA' }}>
                        {['Username', 'Email', 'Events Created', 'Joined', 'Actions'].map((h) => (
                          <th key={h} style={{ padding: '0.9rem 1rem', textAlign: 'left', fontSize: '0.72rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1.5px', whiteSpace: 'nowrap' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <motion.tbody
                      variants={{
                        hidden: { opacity: 0 },
                        show: {
                          opacity: 1,
                          transition: {
                            staggerChildren: 0.05
                          }
                        }
                      }}
                      initial="hidden"
                      animate="show"
                    >
                      {admins.map((admin, i) => (
                        <motion.tr 
                          key={admin._id} 
                          variants={{
                            hidden: { opacity: 0, x: -10 },
                            show: { opacity: 1, x: 0 }
                          }}
                          style={{ borderBottom: '2px solid #F1F5F9', background: i % 2 === 0 ? '#fff' : '#F8FAFC' }}
                        >
                          <td style={{ padding: '0.85rem 1rem', fontWeight: 900, textTransform: 'uppercase', fontSize: '0.85rem', color: '#1E293B' }}>{admin.username}</td>
                          <td style={{ padding: '0.85rem 1rem', fontSize: '0.82rem', fontWeight: 600, color: '#475569' }}>{admin.email}</td>
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <span style={{ background: '#EEF2FF', border: '2px solid #E0E7FF', padding: '2px 10px', fontWeight: 900, fontSize: '0.85rem', color: '#4338CA' }}>{admin.totalEventsCreated}</span>
                          </td>
                          <td style={{ padding: '0.85rem 1rem', fontSize: '0.75rem', fontWeight: 700, color: '#94A3B8' }}>{new Date(admin.createdAt).toLocaleDateString()}</td>
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <LuminaButton variant="danger" onClick={() => handleDelete(admin._id, admin.username)} disabled={loadingAction === 'del' + admin._id}>
                              <Trash2 size={12} className="mr-1.5" /> Delete Admin
                            </LuminaButton>
                          </td>
                        </motion.tr>
                      ))}
                    </motion.tbody>
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
                <div style={{ background: '#fff', border: '3px solid #E2E8F0', boxShadow: '6px 6px 0 #F1F5F9' }}>
                  {/* Form Header */}
                  <div style={{ background: '#EEF2FF', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#4338CA' }}>
                    <UserPlus size={16} strokeWidth={3} />
                    <span style={{ fontWeight: 900, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                      Create Super Admin
                    </span>
                  </div>
                  <form onSubmit={handleCreateSuperAdmin} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <LuminaInput
                      label="Username" name="username" value={saForm.username} required
                      onChange={e => setSaForm(f => ({ ...f, username: e.target.value }))}
                    />
                    <LuminaInput
                      label="Email" name="email" type="email" value={saForm.email} required
                      onChange={e => setSaForm(f => ({ ...f, email: e.target.value }))}
                    />
                    <LuminaInput
                      label="Password" name="password" type="password" value={saForm.password} required
                      onChange={e => setSaForm(f => ({ ...f, password: e.target.value }))}
                    />
                    <LuminaButton
                      type="submit"
                      variant="primary"
                      fullWidth
                      disabled={saLoading}
                    >
                      <UserPlus size={16} className="mr-2" />
                      {saLoading ? 'Provisioning...' : 'Provision Super Admin'}
                    </LuminaButton>
                  </form>
                </div>

                {/* ── Super Admins List ── */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <span style={{ fontWeight: 900, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                      {superAdmins.length} super admin{superAdmins.length !== 1 ? 's' : ''}
                    </span>
                    <LuminaButton onClick={() => { fetchSuperAdmins(); toast.success('List refreshed'); }} variant="secondary">
                      <RefreshCw size={12} className="mr-2" /> Sync Records
                    </LuminaButton>
                  </div>

                  {superAdmins.length === 0 ? (
                    <div style={{ border: '3px solid #E2E8F0', padding: '2rem', textAlign: 'center', background: '#fff', boxShadow: '4px 4px 0 #F1F5F9' }}>
                      <div style={{ fontWeight: 900, textTransform: 'uppercase', color: '#94A3B8' }}>No super admins found</div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {superAdmins.map((sa, i) => (
                        <motion.div
                          key={sa._id}
                          initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                          style={{
                            background: '#fff', border: '2px solid #E2E8F0', boxShadow: '4px 4px 0 #F1F5F9',
                            padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem',
                          }}
                        >
                          {/* Avatar */}
                          <div style={{
                            width: '40px', height: '40px', flexShrink: 0,
                            background: '#F1F5F9', color: '#6366F1',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 900, fontSize: '1.1rem', border: '2px solid #E2E8F0',
                          }}>
                            {sa.username[0].toUpperCase()}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 900, textTransform: 'uppercase', fontSize: '0.88rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#1E293B' }}>
                              {sa.username}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {sa.email}
                            </div>
                          </div>
                          <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <span style={{ background: '#EEF2FF', border: '2px solid #E0E7FF', padding: '2px 8px', fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase', whiteSpace: 'nowrap', color: '#4338CA' }}>
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
