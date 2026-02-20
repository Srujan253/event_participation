import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Lock, Mail, User, Eye, EyeOff } from 'lucide-react';
import BrutalButton from '../components/BrutalButton';
import { loginAdmin, registerAdmin } from '../api';

export default function AuthPage() {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res =
        mode === 'login'
          ? await loginAdmin({ email: form.email, password: form.password })
          : await registerAdmin({ username: form.username, email: form.email, password: form.password });

      if (res.token) {
        localStorage.setItem('attendqr_token', res.token);
        localStorage.setItem('attendqr_admin', JSON.stringify(res.admin));
        navigate('/');
      } else {
        setError(res.message || 'Something went wrong.');
      }
    } catch {
      setError('Network error. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="bg-grid min-h-screen flex items-center justify-center p-4"
      style={{ background: 'var(--bg-primary)' }}
    >
      {/* Decorative blobs */}
      <div
        style={{
          position: 'fixed',
          top: '-80px',
          right: '-80px',
          width: '300px',
          height: '300px',
          background: 'var(--brand-yellow)',
          border: 'var(--brutal-border)',
          zIndex: 0,
          transform: 'rotate(15deg)',
        }}
      />
      <div
        style={{
          position: 'fixed',
          bottom: '-60px',
          left: '-60px',
          width: '200px',
          height: '200px',
          background: 'var(--brand-purple)',
          border: 'var(--brutal-border)',
          zIndex: 0,
          transform: 'rotate(-10deg)',
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
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: '#000',
              color: 'var(--brand-yellow)',
              padding: '0.6rem 1.2rem',
              border: 'var(--brutal-border)',
              boxShadow: 'var(--brutal-shadow)',
              marginBottom: '1rem',
            }}
          >
            <Zap size={20} fill="var(--brand-yellow)" />
            <span style={{ fontWeight: 900, fontSize: '1.1rem', letterSpacing: '2px' }}>
              ATTENDQR
            </span>
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
                onClick={() => { setMode(m); setError(''); }}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: mode === m ? '#000' : 'transparent',
                  color: mode === m ? 'var(--brand-yellow)' : '#000',
                  border: 'none',
                  borderRight: m === 'login' ? 'var(--brutal-border)' : 'none',
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 900,
                  fontSize: '0.8rem',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  cursor: 'pointer',
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
                  <User
                    size={16}
                    style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}
                  />
                  <input
                    className="brutal-input"
                    type="text"
                    name="username"
                    placeholder="USERNAME"
                    value={form.username}
                    onChange={handleChange}
                    required
                    style={{ paddingLeft: '2.2rem' }}
                  />
                </div>
              )}

              <div style={{ position: 'relative' }}>
                <Mail
                  size={16}
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}
                />
                <input
                  className="brutal-input"
                  type="email"
                  name="email"
                  placeholder="EMAIL ADDRESS"
                  value={form.email}
                  onChange={handleChange}
                  required
                  style={{ paddingLeft: '2.2rem' }}
                />
              </div>

              <div style={{ position: 'relative' }}>
                <Lock
                  size={16}
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}
                />
                <input
                  className="brutal-input"
                  type={showPass ? 'text' : 'password'}
                  name="password"
                  placeholder="PASSWORD"
                  value={form.password}
                  onChange={handleChange}
                  required
                  style={{ paddingLeft: '2.2rem', paddingRight: '2.8rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    opacity: 0.5,
                  }}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {error && (
                <div
                  style={{
                    background: 'var(--accent-red)',
                    color: '#fff',
                    padding: '0.6rem 1rem',
                    border: 'var(--brutal-border)',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                  }}
                >
                  ⚠ {error}
                </div>
              )}

              <BrutalButton type="submit" variant="yellow" disabled={loading} fullWidth>
                {loading ? 'Loading...' : mode === 'login' ? '→ Login' : '+ Create Account'}
              </BrutalButton>
            </motion.form>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
