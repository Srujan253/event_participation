import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Loader, QrCode, LogIn, LogOut } from 'lucide-react';
import BrutalButton from '../components/BrutalButton';
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
          background: 'var(--bg-primary)',
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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="brutal-card"
          style={{ maxWidth: '400px', width: '100%', textAlign: 'center' }}
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
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="brutal-card"
          style={{ maxWidth: '420px', width: '100%', textAlign: 'center' }}
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
            style={{
              background: '#000',
              color: '#fff',
              padding: '0.5rem',
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}
          >
            {eventInfo?.eventName}
          </div>

          {!result.success && (
            <div style={{ marginTop: '1rem' }}>
              <BrutalButton onClick={() => setResult(null)} variant="black" fullWidth>
                Try Again
              </BrutalButton>
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  // Main form
  return (
    <div
      className="bg-grid"
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: isCheckIn ? 'var(--bg-primary)' : '#f5f0ff',
        padding: '1.5rem',
      }}
    >
      {/* Decorative corner */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: '120px',
          height: '120px',
          background: isCheckIn ? 'var(--brand-yellow)' : 'var(--brand-purple)',
          border: 'var(--brutal-border)',
          zIndex: 0,
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '420px' }}
      >
        {/* Header badge */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: isCheckIn ? '#000' : 'var(--brand-purple)',
              color: isCheckIn ? 'var(--brand-yellow)' : '#fff',
              padding: '0.6rem 1.2rem',
              border: 'var(--brutal-border)',
              boxShadow: 'var(--brutal-shadow)',
            }}
          >
            {isCheckIn ? <LogIn size={18} /> : <LogOut size={18} />}
            <span style={{ fontWeight: 900, fontSize: '1rem', letterSpacing: '2px' }}>
              {isCheckIn ? 'CHECK-IN' : 'CHECK-OUT'}
            </span>
          </div>
        </div>

        <div className="brutal-card" style={{ background: '#fff' }}>
          {/* Event Info */}
          <div
            style={{
              background: isCheckIn ? 'var(--brand-yellow)' : 'var(--brand-purple)',
              color: isCheckIn ? '#000' : '#fff',
              padding: '1rem',
              border: 'var(--brutal-border)',
              marginBottom: '1.5rem',
              marginTop: '-0.5rem',
              marginLeft: '-0.5rem',
              marginRight: '-0.5rem',
            }}
          >
            <p style={{ margin: 0, fontSize: '0.7rem', fontWeight: 900, letterSpacing: '2px', opacity: 0.7 }}>
              {eventInfo?.eventDate}
            </p>
            <h2 style={{ margin: '0.25rem 0 0', fontSize: '1.3rem', color: isCheckIn ? '#000' : '#fff' }}>
              {eventInfo?.eventName}
            </h2>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.75rem',
                  fontWeight: 900,
                  letterSpacing: '1px',
                  marginBottom: '0.4rem',
                  textTransform: 'uppercase',
                }}
              >
                YOUR FULL NAME
              </label>
              <input
                className="brutal-input"
                type="text"
                placeholder="Enter your name exactly as registered"
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

            <BrutalButton
              type="submit"
              variant={isCheckIn ? 'yellow' : 'purple'}
              disabled={submitting || !name.trim()}
              fullWidth
            >
              {submitting ? (
                'Submitting...'
              ) : isCheckIn ? (
                <><LogIn size={16} /> Mark My Check-In</>
              ) : (
                <><LogOut size={16} /> Mark My Check-Out</>
              )}
            </BrutalButton>
          </form>
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
