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
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-4 font-['Montserrat',sans-serif]">
        <motion.div 
          initial={{ y: 20, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="relative max-w-md w-full p-10 rounded-3xl backdrop-blur-[20px] bg-white/60 border border-white/40 text-center text-slate-800 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.05),_0_10px_20px_-5px_rgba(0,0,0,0.02)]"
        >
          <div className="text-6xl mb-6">⏳</div>
          <h1 className="font-bold text-2xl mb-4 text-slate-800 tracking-tight">Awaiting Approval</h1>
          <p className="font-medium text-slate-500 mb-8">
            Your request has been sent to the Super Admin. Please check back later.
          </p>
          <motion.button
            whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(148, 163, 184, 0.4)' }}
            whileTap={{ scale: 0.98 }}
            onClick={() => { setRegistered(false); setIsLogin(true); }}
            className="w-full py-4 rounded-xl font-bold text-slate-700 bg-gradient-to-tr from-slate-100 to-white border border-slate-200/60 shadow-sm transition-all duration-300 cursor-pointer"
          >
            Back to Login
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-4 font-['Montserrat',sans-serif] overflow-hidden relative">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-slate-100 blur-[80px] opacity-70" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-white blur-[80px] opacity-80" />
      </div>

      <motion.div 
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 250, damping: 25, mass: 0.5 }}
        className="relative z-10 w-full max-w-[420px] backdrop-blur-[20px] bg-white/70 border border-slate-200/50 rounded-[2rem] p-8 sm:p-10 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.05),_0_10px_20px_-5px_rgba(0,0,0,0.02)]"
      >
        <div className="flex flex-col items-center mb-8">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.1, stiffness: 200, damping: 20 }}
            className="w-12 h-12 bg-gradient-to-tr from-slate-200 to-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 mb-4 text-slate-700"
          >
            <Zap size={24} className="fill-slate-700" />
          </motion.div>
          <h2 className="font-extrabold text-2xl text-slate-800 tracking-tight">
            {isLogin ? 'Welcome Back' : 'Create Admin'}
          </h2>
          <p className="text-sm font-medium text-slate-500 mt-2 text-center">
            {isLogin ? "Enter your details to access your dashboard." : "Submit a request to join as an event admin."}
          </p>
        </div>

        <motion.form 
          onSubmit={handleSubmit} 
          className="flex flex-col gap-5"
          variants={{
            hidden: { opacity: 0 },
            show: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.2 } }
          }}
          initial="hidden"
          animate="show"
        >
          <AnimatePresence mode="popLayout">
            {!isLogin && (
              <motion.div 
                key="name"
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10 }}
                className="flex flex-col gap-1 overflow-hidden"
              >
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Full Name</label>
                <div className="relative group">
                  <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-700 transition-colors" />
                  <input
                    type="text" name="username" placeholder="Jane Doe" required
                    value={form.username} onChange={handleChange}
                    className="w-full bg-transparent border border-slate-200/80 rounded-xl py-3 pl-11 pr-4 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-300 focus:ring-4 focus:ring-slate-100 transition-all duration-300"
                  />
                </div>
              </motion.div>
            )}

            <motion.div 
              key="email"
              variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
              className="flex flex-col gap-1"
            >
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Email</label>
              <div className="relative group">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-700 transition-colors" />
                <input
                  type="email" name="email" placeholder="jane@example.com" required
                  value={form.email} onChange={handleChange}
                  className="w-full bg-transparent border border-slate-200/80 rounded-xl py-3 pl-11 pr-4 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-300 focus:ring-4 focus:ring-slate-100 transition-all duration-300"
                />
              </div>
            </motion.div>

            <motion.div 
              key="password"
              variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
              className="flex flex-col gap-1"
            >
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Password</label>
              <div className="relative group">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-700 transition-colors" />
                <input
                  type={showPass ? 'text' : 'password'} name="password" placeholder="••••••••" required
                  value={form.password} onChange={handleChange}
                  className="w-full bg-transparent border border-slate-200/80 rounded-xl py-3 pl-11 pr-11 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-300 focus:ring-4 focus:ring-slate-100 transition-all duration-300"
                />
                <button
                  type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </motion.div>

            {!isLogin && (
              <motion.div 
                key="purpose"
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10 }}
                className="flex flex-col gap-1 overflow-hidden"
              >
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Purpose of Joining</label>
                <div className="relative group">
                  <FileText size={18} className="absolute left-4 top-4 text-slate-400 group-focus-within:text-slate-700 transition-colors" />
                  <textarea
                    name="purpose" placeholder="Brief reason for access..." required
                    value={form.purpose} onChange={handleChange} rows={2}
                    className="w-full bg-transparent border border-slate-200/80 rounded-xl py-3 pl-11 pr-4 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-300 focus:ring-4 focus:ring-slate-100 transition-all duration-300 resize-none"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {errorStatus === 'pending' && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-slate-100 text-slate-700 border border-slate-200/60 p-3 rounded-xl font-semibold flex items-center justify-center gap-2 text-xs"
              >
                <Clock size={16} /> ACCOUNT PENDING APPROVAL
              </motion.div>
            )}
            {errorStatus === 'rejected' && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-red-50 text-red-600 border border-red-100 p-3 rounded-xl font-semibold flex items-center justify-center gap-2 text-xs"
              >
                <XCircle size={16} /> REQUEST REJECTED BY SUPER ADMIN
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
            className="mt-2"
          >
            <motion.button
              whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(148, 163, 184, 0.3)' }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="group relative overflow-hidden w-full py-3.5 rounded-xl font-bold text-slate-700 bg-gradient-to-tr from-slate-100 to-white border border-slate-200/60 shadow-sm transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <AnimatePresence>
                {loading && (
                  <motion.div
                    className="absolute inset-0 bg-slate-300/40"
                    initial={{ scaleX: 0, opacity: 1 }}
                    animate={{ scaleX: 1, opacity: 0 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "easeOut" }}
                    style={{ originX: 0.5 }}
                  />
                )}
              </AnimatePresence>
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? 'Processing...' : (
                  <>
                    {isLogin ? 'Sign In' : 'Submit Request'}
                    <ArrowRight size={18} className="text-slate-400 group-hover:translate-x-1 group-hover:text-slate-600 transition-all duration-300" />
                  </>
                )}
              </span>
            </motion.button>
          </motion.div>

          <motion.div 
            variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }}
            className="text-center mt-2"
          >
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setErrorStatus(null);
                setForm({ username: '', email: '', password: '', purpose: '' });
              }}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            >
              {isLogin ? "Don't have an account? Request access" : "Already an admin? Sign in instead"}
            </button>
          </motion.div>
        </motion.form>
      </motion.div>
    </div>
  );
}
