import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { ArrowLeft, Download, LogIn, LogOut } from 'lucide-react';
import BrutalButton from '../components/BrutalButton';
import { getEvent } from '../api';

export default function QRDisplayPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  const baseUrl = window.location.origin;

  useEffect(() => {
    getEvent(id)
      .then((data) => {
        if (data._id) setEvent(data);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const downloadQR = (tokenType, token) => {
    const svgEl = document.getElementById(`qr-${tokenType}`);
    if (!svgEl) return;
    const svgData = new XMLSerializer().serializeToString(svgEl);
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 400, 400);
      ctx.drawImage(img, 0, 0, 400, 400);
      const a = document.createElement('a');
      a.download = `${event.eventName}-${tokenType}-qr.png`;
      a.href = canvas.toDataURL('image/png');
      a.click();
    };
    img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <p style={{ fontWeight: 900, fontSize: '1.5rem' }}>LOADING...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: '1rem' }}>
        <p style={{ fontWeight: 900, fontSize: '1.2rem' }}>EVENT NOT FOUND</p>
        <BrutalButton onClick={() => navigate('/')}><ArrowLeft size={14} /> Back</BrutalButton>
      </div>
    );
  }

  const checkInUrl = `${baseUrl}/scan/${event.startQrToken}`;
  const checkOutUrl = `${baseUrl}/scan/${event.endQrToken}`;

  return (
    <div className="bg-grid min-h-screen" style={{ background: 'var(--bg-primary)', padding: '1.5rem' }}>
      <div style={{ maxWidth: '860px', margin: '0 auto' }}>
        {/* Back button */}
        <div style={{ marginBottom: '1.5rem' }}>
          <BrutalButton onClick={() => navigate('/')} variant="white">
            <ArrowLeft size={14} /> Back to Dashboard
          </BrutalButton>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Event Header */}
          <div className="brutal-card" style={{ background: '#000', color: '#fff', marginBottom: '1.5rem' }}>
            <div
              style={{
                background: 'var(--brand-yellow)',
                color: '#000',
                padding: '0.25rem 0.6rem',
                display: 'inline-block',
                fontSize: '0.65rem',
                fontWeight: 900,
                letterSpacing: '1.5px',
                marginBottom: '0.5rem',
                border: '2px solid #fff',
              }}
            >
              QR CODES
            </div>
            <h1 style={{ margin: '0 0 0.25rem', fontSize: '2rem', color: '#fff' }}>{event.eventName}</h1>
            <p style={{ margin: 0, opacity: 0.6, fontWeight: 700, fontSize: '0.9rem' }}>{event.eventDate}</p>
          </div>

          <p style={{ fontWeight: 700, fontSize: '0.85rem', opacity: 0.65, marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            📱 Share these QR codes with participants. Check-In first, then Check-Out at the end.
          </p>

          {/* QR Cards Grid */}
          <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
            {/* Check-In QR */}
            <div className="brutal-card" style={{ background: 'var(--brand-yellow)', textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <LogIn size={20} />
                <h2 style={{ margin: 0, fontSize: '1.3rem' }}>CHECK-IN QR</h2>
              </div>

              <div
                style={{
                  display: 'inline-block',
                  background: '#fff',
                  padding: '1rem',
                  border: 'var(--brutal-border)',
                  boxShadow: 'var(--brutal-shadow)',
                  marginBottom: '1rem',
                }}
              >
                <QRCodeSVG
                  id="qr-checkin"
                  value={checkInUrl}
                  size={200}
                  level="H"
                  includeMargin={false}
                />
              </div>

              <p style={{ fontSize: '0.7rem', fontWeight: 700, wordBreak: 'break-all', opacity: 0.7, marginBottom: '1rem', fontFamily: 'monospace' }}>
                {checkInUrl}
              </p>

              <BrutalButton variant="black" fullWidth onClick={() => downloadQR('checkin', event.startQrToken)}>
                <Download size={14} /> Download PNG
              </BrutalButton>
            </div>

            {/* Check-Out QR */}
            <div className="brutal-card" style={{ background: 'var(--brand-purple)', textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#fff' }}>
                <LogOut size={20} color="#fff" />
                <h2 style={{ margin: 0, fontSize: '1.3rem', color: '#fff' }}>CHECK-OUT QR</h2>
              </div>

              <div
                style={{
                  display: 'inline-block',
                  background: '#fff',
                  padding: '1rem',
                  border: '3px solid #fff',
                  boxShadow: '5px 5px 0px 0px rgba(255,255,255,0.5)',
                  marginBottom: '1rem',
                }}
              >
                <QRCodeSVG
                  id="qr-checkout"
                  value={checkOutUrl}
                  size={200}
                  level="H"
                  includeMargin={false}
                />
              </div>

              <p style={{ fontSize: '0.7rem', fontWeight: 700, wordBreak: 'break-all', color: 'rgba(255,255,255,0.7)', marginBottom: '1rem', fontFamily: 'monospace' }}>
                {checkOutUrl}
              </p>

              <BrutalButton variant="yellow" fullWidth onClick={() => downloadQR('checkout', event.endQrToken)}>
                <Download size={14} /> Download PNG
              </BrutalButton>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
