import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import LuminaButton from '../components/LuminaButton';
import { LogIn, LogOut, Loader, XCircle, CheckCircle } from 'lucide-react';
import { verifyToken, submitCheckin } from '../api';

export default function CheckInPage() {
  const { token } = useParams();
  const [eventInfo, setEventInfo] = useState(null);
  const [verifying, setVerifying] = useState(true);
  const [invalid, setInvalid] = useState(false);
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null); // { success, message }

  useEffect(() => {
    verifyToken(token)
      .then((data) => {
        if (data.valid) {
          setEventInfo(data);
        } else {
          setInvalid(true);
        }
      })
      .catch(() => setInvalid(true))
      .finally(() => setVerifying(false));
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      const res = await submitCheckin({ token, participantName: name.trim() });
      if (res.action) {
        setResult({ success: true, message: res.message, action: res.action });
      } else {
        setResult({ success: false, message: res.message || 'Something went wrong.' });
      }
    } catch {
      setResult({ success: false, message: 'Network error. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  const isCheckIn = eventInfo?.tokenType === 'CHECK_IN';

  // Loading state
  if (verifying) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-surface)',
        }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
        >
          <Loader size={40} />
        </motion.div>
      </div>
    );
  }

  // Invalid token
  if (invalid) {
    return (
      <div
        className="bg-grid"
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-primary)',
          padding: '1.5rem',
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="lumina-card"
          style={{ maxWidth: '400px', width: '100%', textAlign: 'center', padding: '3rem 2rem' }}
        >
          <XCircle size={48} color="var(--accent-red)" style={{ margin: '0 auto 1rem' }} />
          <h1 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>INVALID QR</h1>
          <p style={{ fontWeight: 600, opacity: 0.7 }}>
            This QR code is invalid or expired. Please scan a valid event QR code.
          </p>
        </motion.div>
      </div>
    );
  }

  // Result screen
  if (result) {
    return (
      <div
        className="bg-grid"
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: result.success ? 'var(--brand-yellow)' : '#fff',
          padding: '1.5rem',
        }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="lumina-card shadow-xl"
          style={{ maxWidth: '420px', width: '100%', textAlign: 'center', padding: '3rem 2rem' }}
        >
          {result.success ? (
            <CheckCircle size={56} color="#000" style={{ margin: '0 auto 1rem' }} />
          ) : (
            <XCircle size={56} color="var(--accent-red)" style={{ margin: '0 auto 1rem' }} />
          )}

          <h1
            style={{
              fontSize: '1.8rem',
              marginBottom: '0.75rem',
              color: result.success ? '#000' : 'var(--accent-red)',
            }}
          >
            {result.success ? (result.action === 'CHECKED_IN' ? 'CHECKED IN!' : 'CHECKED OUT!') : 'OOPS!'}
          </h1>

          <p style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
            {result.message}
          </p>

          <div
            className="rounded-xl overflow-hidden mb-6"
            style={{
              background: 'var(--action-blue)',
              color: '#fff',
              padding: '0.75rem',
              fontSize: '0.8rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}
          >
            {eventInfo?.eventName}
          </div>

          {!result.success && (
            <div style={{ marginTop: '1rem' }}>
              <LuminaButton onClick={() => setResult(null)} variant="secondary" fullWidth>
                Try Again
              </LuminaButton>
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  // Main form
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-surface)',
        padding: '1.5rem',
      }}
    >
      {/* Refined gradient background element */}
      <div
        className="fixed top-[-100px] right-[-100px] w-[300px] h-[300px] blur-[120px] rounded-full opacity-20 pointer-events-none"
        style={{
          background: isCheckIn ? 'var(--action-blue)' : '#8B5CF6',
          zIndex: 0,
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '420px' }}
      >
        {/* Header badge */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            className="inline-flex items-center gap-2 bg-white px-5 py-2.5 rounded-full shadow-sm border border-gray-100"
          >
            <div className={`p-1.5 rounded-full ${isCheckIn ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
              {isCheckIn ? <LogIn size={16} /> : <LogOut size={16} />}
            </div>
            <span className="font-bold text-xs tracking-widest text-gray-800">
              {isCheckIn ? 'SESSION CHECK-IN' : 'SESSION CHECK-OUT'}
            </span>
          </div>
        </div>

        <div className="lumina-card !p-0 overflow-hidden shadow-2xl">
          {/* Event Info */}
          <div
            className="p-8 border-b border-gray-100"
            style={{
              background: isCheckIn 
                ? 'linear-gradient(135deg, rgba(37, 99, 235, 0.05) 0%, rgba(37, 99, 235, 0.02) 100%)' 
                : 'linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, rgba(139, 92, 246, 0.02) 100%)',
            }}
          >
            <p className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase mb-2">
              {eventInfo?.eventDate}
            </p>
            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight leading-tight">
              {eventInfo?.eventName}
            </h2>
          </div>

          <div className="p-8">
            <form onSubmit={handleSubmit} className="flex flex-col gap-8">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 block">
                YOUR FULL NAME
              </label>
              <input
                className="lumina-input"
                type="text"
                placeholder="How should we address you?"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
              />
            </div>

            <p style={{ fontSize: '0.75rem', fontWeight: 600, opacity: 0.55, margin: 0 }}>
              {isCheckIn
                ? '✅ Your attendance will be marked when you submit.'
                : '✅ Your departure will be recorded when you submit.'}
            </p>

            <LuminaButton
              type="submit"
              variant="primary"
              disabled={submitting || !name.trim()}
              fullWidth
              className={isCheckIn ? '' : '!bg-purple-600 !shadow-purple-100 hover:!bg-purple-700'}
            >
              {submitting ? (
                'Syncing...'
              ) : isCheckIn ? (
                <><LogIn size={18} /> Confirm Attendance</>
              ) : (
                <><LogOut size={18} /> Confirm Departure</>
              )}
            </LuminaButton>
          </form>
          </div>
        </div>

        <p
          style={{
            textAlign: 'center',
            fontSize: '0.7rem',
            fontWeight: 600,
            opacity: 0.4,
            marginTop: '1rem',
            textTransform: 'uppercase',
            letterSpacing: '1px',
          }}
        >
          Powered by AttendQR
        </p>
      </motion.div>
    </div>
  );
}
