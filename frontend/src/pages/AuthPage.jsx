import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Lock, Mail, User, Eye, EyeOff, FileText, Clock, XCircle, ArrowRight, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { loginAdmin, registerAdmin } from '../api';
import LuminaButton from '../components/LuminaButton';

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
          toast.success(res.admin.role === 'super_admin' ? 'SUPER ADMIN LOGIN' : 'LOGIN SUCCESSFUL');
          navigate(res.admin.role === 'super_admin' ? '/superadmin' : '/');
        }
      } else {
        await registerAdmin(form);
        setRegistered(true);
        toast.success('REQUEST SUBMITTED! AWAITING APPROVAL');
      }
    } catch (err) {
      if (err.status === 'pending') setErrorStatus('pending');
      else if (err.status === 'rejected') setErrorStatus('rejected');
      else {
        toast.error(err.message || 'AUTHENTICATION FAILED');
      }
    } finally {
      setLoading(false);
    }
  };

  if (registered) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }}
          className="lumina-card max-width-[500px] w-full text-center p-12"
        >
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⏳</div>
          <h1 style={{ fontWeight: 900, fontSize: '2rem', marginBottom: '1rem', textTransform: 'uppercase' }}>Awaiting Approval</h1>
          <p style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '2rem', opacity: 0.8 }}>
            Your request has been sent to the Super Admin. Please check back later.
          </p>
          <LuminaButton
            onClick={() => { setRegistered(false); setIsLogin(true); }}
            fullWidth
          >
            Back to Login
          </LuminaButton>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4 font-['Montserrat',sans-serif]">
      {/* Container */}
      <motion.div 
        layout
        className="auth-container"
        style={{
          flexDirection: isLogin ? 'row' : 'row-reverse'
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {/* Half A: The Form */}
        <div className="auth-form-panel">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
            <div className="p-2 bg-blue-600 rounded-lg text-white">
              <Zap size={20} fill="white" />
            </div>
            <span style={{ fontWeight: 800, fontSize: '1.25rem', tracking: '-0.025em' }}>AttendQR</span>
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

              <motion.form 
                onSubmit={handleSubmit} 
                style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}
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
                <AnimatePresence mode="popLayout">
                  {!isLogin && (
                    <motion.div 
                      key="name"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}
                    >
                      <label style={{ fontWeight: 900, fontSize: '0.7rem', textTransform: 'uppercase' }}>Full Name</label>
                      <div style={{ position: 'relative' }}>
                        <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                          type="text" name="username" placeholder="NAME SURNAME" required
                          value={form.username} onChange={handleChange}
                          className="lumina-input"
                          style={{ paddingLeft: '2.8rem' }}
                        />
                      </div>
                    </motion.div>
                  )}

                  <motion.div 
                    key="email"
                    variants={{
                      hidden: { opacity: 0, y: 5 },
                      show: { opacity: 1, y: 0 }
                    }}
                    style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}
                  >
                    <label style={{ fontWeight: 900, fontSize: '0.7rem', textTransform: 'uppercase' }}>Email Address</label>
                    <div style={{ position: 'relative' }}>
                      <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                      <input
                        type="email" name="email" placeholder="EMAIL@EXAMPLE.COM" required
                        value={form.email} onChange={handleChange}
                        className="lumina-input"
                        style={{ paddingLeft: '2.8rem' }}
                      />
                    </div>
                  </motion.div>

                  <motion.div 
                    key="password"
                    variants={{
                      hidden: { opacity: 0, y: 5 },
                      show: { opacity: 1, y: 0 }
                    }}
                    style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}
                  >
                    <label style={{ fontWeight: 900, fontSize: '0.7rem', textTransform: 'uppercase' }}>Password</label>
                    <div style={{ position: 'relative' }}>
                      <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                      <input
                        type={showPass ? 'text' : 'password'} name="password" placeholder="••••••••" required
                        value={form.password} onChange={handleChange}
                          className="lumina-input"
                          style={{ paddingLeft: '2.8rem', paddingRight: '3rem' }}
                        />
                      <button
                        type="button" onClick={() => setShowPass(!showPass)}
                        style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer' }}
                      >
                        {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </motion.div>

                  {!isLogin && (
                    <motion.div 
                      key="purpose"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', overflow: 'hidden' }}
                    >
                      <label style={{ fontWeight: 900, fontSize: '0.7rem', textTransform: 'uppercase' }}>Purpose of Joining</label>
                      <div style={{ position: 'relative' }}>
                        <FileText size={18} style={{ position: 'absolute', left: '12px', top: '14px' }} />
                        <textarea
                          name="purpose" placeholder="GIVE A BRIEF REASON FOR ACCESS..." required
                          value={form.purpose} onChange={handleChange} rows={3}
                          className="lumina-input"
                          style={{ paddingLeft: '2.8rem', resize: 'none' }}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {errorStatus === 'pending' && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{ background: '#EFF6FF', color: 'var(--action-blue)', border: '1px solid #DBEAFE', padding: '0.8rem', borderRadius: 'var(--radius-md)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}
                  >
                    <Clock size={16} /> ACCOUNT PENDING APPROVAL
                  </motion.div>
                )}
                {errorStatus === 'rejected' && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{ background: '#FEF2F2', color: '#EF4444', border: '1px solid #FEE2E2', padding: '0.8rem', borderRadius: 'var(--radius-md)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}
                  >
                    <XCircle size={16} /> REQUEST REJECTED BY SUPER ADMIN
                  </motion.div>
                )}

                <motion.div
                  variants={{
                    hidden: { opacity: 0, y: 10 },
                    show: { opacity: 1, y: 0 }
                  }}
                >
                  <LuminaButton
                    type="submit"
                    disabled={loading}
                    fullWidth
                    className="mt-4"
                  >
                    {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Submit Request'}
                  </LuminaButton>
                </motion.div>
              </motion.form>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Half B: Accent Panel */}
        <div 
          className="auth-accent-panel"
          style={{
            background: 'linear-gradient(135deg, var(--action-blue) 0%, #1E40AF 100%)',
            color: '#fff'
          }}
        >
          <Sparkles size={48} className="mb-4" fill="#000" />
          <h1 className="auth-accent-h1" style={{ fontWeight: 900, fontSize: '2.5rem', lineHeight: 1, textTransform: 'uppercase', marginBottom: '1.5rem' }}>
            {isLogin ? "Hello, Friend!" : "Join the Squad"}
          </h1>
          <p className="auth-accent-p" style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '2.5rem', lineHeight: 1.4 }}>
            {isLogin 
              ? "New here? Sign up and start managing your events with style."
              : "Already part of us? Sign in to continue your journey."
            }
          </p>
          <LuminaButton
            variant="secondary"
            onClick={() => setIsLogin(!isLogin)}
            className="!bg-white/10 !border-white/20 !text-white hover:!bg-white/20"
          >
            {isLogin ? 'Go to Register' : 'Go to Login'}
          </LuminaButton>
        </div>
      </motion.div>
    </div>
  );
}
