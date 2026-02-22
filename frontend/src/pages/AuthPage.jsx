import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Lock, Mail, User, Eye, EyeOff, FileText, Clock, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import BrutalButton from '../components/BrutalButton';
import { loginAdmin, registerAdmin } from '../api';

export default function AuthPage() {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({ username: '', email: '', password: '', purpose: '' });
  const [error, setError] = useState('');
  const [errorStatus, setErrorStatus] = useState(null); // 'pending' | 'rejected'
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [registered, setRegistered] = useState(false); // show pending message after register
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
    setErrorStatus(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setErrorStatus(null);

    try {
      if (mode === 'login') {
        const res = await loginAdmin({ email: form.email, password: form.password });
        if (res.token) {
          localStorage.setItem('attendqr_token', res.token);
          localStorage.setItem('attendqr_admin', JSON.stringify(res.admin));
          toast.success(res.admin.role === 'super_admin' ? 'SUPER ADMIN LOGIN' : 'LOGIN SUCCESSFUL');
          if (res.admin.role === 'super_admin') {
            navigate('/superadmin');
          } else {
            navigate('/');
          }
        }
      } else {
        // Register
        await registerAdmin({
          username: form.username,
          email: form.email,
          password: form.password,
          purpose: form.purpose,
        });
        setRegistered(true);
        toast.success('Request submitted! Awaiting approval.');
      }
    } catch (err) {
      if (err.status === 'pending') setErrorStatus('pending');
      else if (err.status === 'rejected') setErrorStatus('rejected');
      else setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  // ─── Pending Approval screen ──────────────
  if (registered) {
    return (
      <div
        className="bg-grid min-h-screen flex items-center justify-center p-4"
        style={{ background: 'var(--bg-primary)' }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ width: '100%', maxWidth: '420px' }}
        >
          <div className="brutal-card" style={{ background: '#fff', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
            <h2 style={{ fontWeight: 900, fontSize: '1.4rem', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
              Request Submitted!
            </h2>
            <p style={{ fontWeight: 600, opacity: 0.7, marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              Your account is pending approval by the Super Admin. You will be able to log in once approved.
            </p>
            <BrutalButton variant="yellow" fullWidth onClick={() => { setRegistered(false); setMode('login'); }}>
              → Back to Login
            </BrutalButton>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      className="bg-grid min-h-screen flex items-center justify-center p-4"
      style={{ background: 'var(--bg-primary)' }}
    >
      {/* Decorative blobs */}
      <div
        style={{
          position: 'fixed', top: '-80px', right: '-80px', width: '300px', height: '300px',
          background: 'var(--brand-yellow)', border: 'var(--brutal-border)', zIndex: 0, transform: 'rotate(15deg)',
        }}
      />
      <div
        style={{
          position: 'fixed', bottom: '-60px', left: '-60px', width: '200px', height: '200px',
          background: 'var(--brand-purple)', border: 'var(--brutal-border)', zIndex: 0, transform: 'rotate(-10deg)',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '420px' }}
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              background: '#000', color: 'var(--brand-yellow)', padding: '0.6rem 1.2rem',
              border: 'var(--brutal-border)', boxShadow: 'var(--brutal-shadow)', marginBottom: '1rem',
            }}
          >
            <Zap size={20} fill="var(--brand-yellow)" />
            <span style={{ fontWeight: 900, fontSize: '1.1rem', letterSpacing: '2px' }}>ATTENDQR</span>
          </div>
          <p style={{ fontWeight: 700, fontSize: '0.85rem', opacity: 0.6, textTransform: 'uppercase' }}>
            Admin Portal
          </p>
        </div>

        {/* Card */}
        <div className="brutal-card" style={{ background: '#fff' }}>
          {/* Tabs */}
          <div style={{ display: 'flex', marginBottom: '1.5rem', border: 'var(--brutal-border)' }}>
            {['login', 'register'].map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); setErrorStatus(null); }}
                style={{
                  flex: 1, padding: '0.75rem',
                  background: mode === m ? '#000' : 'transparent',
                  color: mode === m ? 'var(--brand-yellow)' : '#000',
                  border: 'none', borderRight: m === 'login' ? 'var(--brutal-border)' : 'none',
                  fontFamily: "'Montserrat', sans-serif", fontWeight: 900, fontSize: '0.8rem',
                  textTransform: 'uppercase', letterSpacing: '1px', cursor: 'pointer',
                }}
              >
                {m === 'login' ? '→ Login' : '+ Register'}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.form
              key={mode}
              initial={{ opacity: 0, x: mode === 'login' ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: mode === 'login' ? 20 : -20 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleSubmit}
              style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
            >
              {mode === 'register' && (
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                  <input
                    className="brutal-input" type="text" name="username"
                    placeholder="USERNAME" value={form.username}
                    onChange={handleChange} required style={{ paddingLeft: '2.2rem' }}
                  />
                </div>
              )}

              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                <input
                  className="brutal-input" type="email" name="email"
                  placeholder="EMAIL ADDRESS" value={form.email}
                  onChange={handleChange} required style={{ paddingLeft: '2.2rem' }}
                />
              </div>

              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                <input
                  className="brutal-input" type={showPass ? 'text' : 'password'}
                  name="password" placeholder="PASSWORD" value={form.password}
                  onChange={handleChange} required style={{ paddingLeft: '2.2rem', paddingRight: '2.8rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, opacity: 0.5 }}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Purpose textarea — register only */}
              {mode === 'register' && (
                <div style={{ position: 'relative' }}>
                  <FileText size={16} style={{ position: 'absolute', left: '12px', top: '14px', opacity: 0.5 }} />
                  <textarea
                    className="brutal-input"
                    name="purpose"
                    placeholder="PURPOSE OF JOINING (e.g. managing college events)"
                    value={form.purpose}
                    onChange={handleChange}
                    required
                    rows={3}
                    style={{ paddingLeft: '2.2rem', resize: 'vertical', lineHeight: 1.5 }}
                  />
                </div>
              )}

              {/* Status-specific error banners */}
              {errorStatus === 'pending' && (
                <div style={{ background: '#FFA500', color: '#000', padding: '0.75rem 1rem', border: 'var(--brutal-border)', fontSize: '0.8rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Clock size={16} /> YOUR ACCOUNT IS PENDING APPROVAL
                </div>
              )}
              {errorStatus === 'rejected' && (
                <div style={{ background: 'var(--accent-red)', color: '#fff', padding: '0.75rem 1rem', border: 'var(--brutal-border)', fontSize: '0.8rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <XCircle size={16} /> ACCOUNT REJECTED — CONTACT SUPER ADMIN
                </div>
              )}
              {error && (
                <div style={{ background: 'var(--accent-red)', color: '#fff', padding: '0.6rem 1rem', border: 'var(--brutal-border)', fontSize: '0.8rem', fontWeight: 700 }}>
                  ⚠ {error}
                </div>
              )}

              <BrutalButton type="submit" variant="yellow" disabled={loading} fullWidth>
                {loading ? 'Loading...' : mode === 'login' ? '→ Login' : '+ Submit Request'}
              </BrutalButton>
            </motion.form>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
