import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Lock, Mail, User, Eye, EyeOff, FileText, Clock, XCircle, ArrowRight, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { loginAdmin, registerAdmin } from '../api';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ username: '', email: '', password: '', purpose: '' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [errorStatus, setErrorStatus] = useState(null); // 'pending' | 'rejected'
  const [registered, setRegistered] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrorStatus(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorStatus(null);

    try {
      if (isLogin) {
        const res = await loginAdmin({ email: form.email, password: form.password });
        if (res.token) {
          localStorage.setItem('attendqr_token', res.token);
          localStorage.setItem('attendqr_admin', JSON.stringify(res.admin));
          toast.success(res.admin.role === 'super_admin' ? 'SUPER ADMIN LOGIN' : 'LOGIN SUCCESSFUL', {
            style: { border: '3px solid #000', borderRadius: '0', fontWeight: 900, textTransform: 'uppercase' }
          });
          navigate(res.admin.role === 'super_admin' ? '/superadmin' : '/');
        }
      } else {
        await registerAdmin(form);
        setRegistered(true);
        toast.success('REQUEST SUBMITTED! AWAITING APPROVAL', {
          style: { border: '3px solid #000', borderRadius: '0', fontWeight: 900, textTransform: 'uppercase' }
        });
      }
    } catch (err) {
      if (err.status === 'pending') setErrorStatus('pending');
      else if (err.status === 'rejected') setErrorStatus('rejected');
      else {
        toast.error(err.message || 'AUTHENTICATION FAILED', {
          style: { border: '3px solid #000', borderRadius: '0', fontWeight: 900, textTransform: 'uppercase' }
        });
      }
    } finally {
      setLoading(false);
    }
  };

  if (registered) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7D61D] p-4">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }}
          style={{
            background: '#fff', border: '3px solid #000', boxShadow: '12px 12px 0px #000',
            padding: '3rem', maxWidth: '500px', width: '100%', textAlign: 'center'
          }}
        >
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⏳</div>
          <h1 style={{ fontWeight: 900, fontSize: '2rem', marginBottom: '1rem', textTransform: 'uppercase' }}>Awaiting Approval</h1>
          <p style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '2rem', opacity: 0.8 }}>
            Your request has been sent to the Super Admin. Please check back later.
          </p>
          <motion.button
            whileTap={{ x: 2, y: 2, boxShadow: '0px 0px 0px #000' }}
            onClick={() => { setRegistered(false); setIsLogin(true); }}
            style={{
              background: '#000', color: '#fff', border: '2px solid #000',
              boxShadow: '4px 4px 0px #000', padding: '1rem 2rem', fontWeight: 900,
              textTransform: 'uppercase', letterSpacing: '2px', cursor: 'pointer'
            }}
          >
            Back to Login
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4 font-['Montserrat',sans-serif]">
      {/* Container */}
      <div 
        style={{
          display: 'flex', width: '100%', maxWidth: '900px', background: '#fff',
          border: '3px solid #000', boxShadow: '12px 12px 0px #000',
          flexDirection: isLogin ? 'row' : 'row-reverse',
          transition: 'flex-direction 0.5s ease'
        }}
      >
        {/* Half A: The Form */}
        <div style={{ flex: 1, padding: '3rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
            <Zap size={24} fill="#000" />
            <span style={{ fontWeight: 900, fontSize: '1.2rem', letterSpacing: '2px' }}>ATTENDQR</span>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={isLogin ? 'login' : 'register'}
              initial={{ x: isLogin ? -20 : 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: isLogin ? 20 : -20, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h2 style={{ fontWeight: 900, fontSize: '2rem', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                {isLogin ? 'Welcome Back' : 'Create Admin'}
              </h2>
              <p style={{ fontWeight: 700, opacity: 0.5, marginBottom: '2rem', textTransform: 'uppercase', fontSize: '0.8rem' }}>
                {isLogin ? 'Sign in to manage your events' : 'Submit a request to join as an event admin'}
              </p>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                {!isLogin && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label style={{ fontWeight: 900, fontSize: '0.7rem', textTransform: 'uppercase' }}>Full Name</label>
                    <div style={{ position: 'relative' }}>
                      <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                      <input
                        type="text" name="username" placeholder="NAME SURNAME" required
                        value={form.username} onChange={handleChange}
                        style={{
                          width: '100%', padding: '0.8rem 1rem 0.8rem 2.8rem', border: '2px solid #000',
                          borderRadius: '0', fontWeight: 700, outline: 'none', background: '#fff'
                        }}
                        onFocus={(e) => e.target.style.boxShadow = '4px 4px 0px #000'}
                        onBlur={(e) => e.target.style.boxShadow = 'none'}
                      />
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontWeight: 900, fontSize: '0.7rem', textTransform: 'uppercase' }}>Email Address</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="email" name="email" placeholder="EMAIL@EXAMPLE.COM" required
                      value={form.email} onChange={handleChange}
                      style={{
                        width: '100%', padding: '0.8rem 1rem 0.8rem 2.8rem', border: '2px solid #000',
                        borderRadius: '0', fontWeight: 700, outline: 'none', background: '#fff'
                      }}
                      onFocus={(e) => e.target.style.boxShadow = '4px 4px 0px #000'}
                      onBlur={(e) => e.target.style.boxShadow = 'none'}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontWeight: 900, fontSize: '0.7rem', textTransform: 'uppercase' }}>Password</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type={showPass ? 'text' : 'password'} name="password" placeholder="••••••••" required
                      value={form.password} onChange={handleChange}
                      style={{
                        width: '100%', padding: '0.8rem 3rem 0.8rem 2.8rem', border: '2px solid #000',
                        borderRadius: '0', fontWeight: 700, outline: 'none', background: '#fff'
                      }}
                      onFocus={(e) => e.target.style.boxShadow = '4px 4px 0px #000'}
                      onBlur={(e) => e.target.style.boxShadow = 'none'}
                    />
                    <button
                      type="button" onClick={() => setShowPass(!showPass)}
                      style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {!isLogin && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label style={{ fontWeight: 900, fontSize: '0.7rem', textTransform: 'uppercase' }}>Purpose of Joining</label>
                    <div style={{ position: 'relative' }}>
                      <FileText size={18} style={{ position: 'absolute', left: '12px', top: '14px' }} />
                      <textarea
                        name="purpose" placeholder="GIVE A BRIEF REASON FOR ACCESS..." required
                        value={form.purpose} onChange={handleChange} rows={3}
                        style={{
                          width: '100%', padding: '0.8rem 1rem 0.8rem 2.8rem', border: '2px solid #000',
                          borderRadius: '0', fontWeight: 700, outline: 'none', background: '#fff',
                          resize: 'none'
                        }}
                        onFocus={(e) => e.target.style.boxShadow = '4px 4px 0px #000'}
                        onBlur={(e) => e.target.style.boxShadow = 'none'}
                      />
                    </div>
                  </div>
                )}

                {errorStatus === 'pending' && (
                  <div style={{ background: '#F7D61D', border: '2px solid #000', padding: '0.8rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem' }}>
                    <Clock size={16} /> ACCOUNT PENDING APPROVAL
                  </div>
                )}
                {errorStatus === 'rejected' && (
                  <div style={{ background: '#ff4444', color: '#fff', border: '2px solid #000', padding: '0.8rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem' }}>
                    <XCircle size={16} /> REQUEST REJECTED BY SUPER ADMIN
                  </div>
                )}

                <motion.button
                  whileTap={{ x: 2, y: 2, boxShadow: '0px 0px 0px #000' }}
                  type="submit" disabled={loading}
                  style={{
                    marginTop: '1rem', background: '#000', color: '#fff', border: '2px solid #000',
                    boxShadow: '4px 4px 0px #000', padding: '1rem', fontWeight: 900,
                    textTransform: 'uppercase', letterSpacing: '2px', cursor: 'pointer'
                  }}
                >
                  {loading ? 'Processing...' : isLogin ? 'Sign In →' : 'Submit Request +'}
                </motion.button>
              </form>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Half B: Accent Panel */}
        <div 
          style={{
            flex: 0.8, background: '#B642FF', borderLeft: isLogin ? '3px solid #000' : 'none',
            borderRight: isLogin ? 'none' : '3px solid #000', display: 'flex',
            flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: '3rem', textAlign: 'center', color: '#000'
          }}
        >
          <Sparkles size={48} fill="#000" style={{ marginBottom: '1.5rem' }} />
          <h1 style={{ fontWeight: 900, fontSize: '2.5rem', lineHeight: 1, textTransform: 'uppercase', marginBottom: '1.5rem' }}>
            {isLogin ? "Hello, Friend!" : "Join the Squad"}
          </h1>
          <p style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '2.5rem', lineHeight: 1.4 }}>
            {isLogin 
              ? "New here? Sign up and start managing your events with style."
              : "Already part of us? Sign in to continue your journey."
            }
          </p>
          <motion.button
            whileTap={{ x: 2, y: 2, boxShadow: '0px 0px 0px #000' }}
            onClick={() => setIsLogin(!isLogin)}
            style={{
              background: 'transparent', color: '#000', border: '2px solid #000',
              boxShadow: '4px 4px 0px #000', padding: '0.8rem 2rem', fontWeight: 900,
              textTransform: 'uppercase', letterSpacing: '1px', cursor: 'pointer'
            }}
          >
            {isLogin ? 'Go to Register' : 'Go to Login'}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
