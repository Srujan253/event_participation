import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { ArrowLeft, Download, LogIn, LogOut, CheckCircle2, Copy } from 'lucide-react';
import LuminaButton from '../components/LuminaButton';
import toast from 'react-hot-toast';
import { getEvent } from '../api';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

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
      toast.success(`${tokenType} QR DOWNLOADED`);
    };
    img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
  };

  const copyToClipboard = (url, label) => {
    navigator.clipboard.writeText(url);
    toast.success(`${label} Link Copied!`);
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
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-2">
          <ArrowLeft size={40} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Access Revoked</h2>
          <p className="text-gray-500 font-medium">This event is no longer reachable or was deleted.</p>
        </div>
        <LuminaButton onClick={() => navigate('/')} variant="secondary">Back to Dashboard</LuminaButton>
      </div>
    );
  }

  const checkInUrl = `${baseUrl}/scan/${event.startQrToken}`;
  const checkOutUrl = `${baseUrl}/scan/${event.endQrToken}`;

  return (
    <div className="min-h-screen bg-gray-50/50" style={{ padding: '2rem 1.5rem' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {/* Back button */}
        <div className="mb-8">
          <LuminaButton onClick={() => navigate('/')} variant="ghost" className="!pl-0 !text-gray-500 hover:!text-gray-900">
            <ArrowLeft size={18} className="mr-2" /> Back to Terminal
          </LuminaButton>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {/* Main Content Header */}
          <motion.div variants={itemVariants} className="lumina-card !p-6 md:!p-10 mb-8 overflow-hidden relative">
            <div className="relative z-10">
              <div className="flex items-center gap-2 text-blue-600 font-black text-[10px] tracking-[0.2em] uppercase mb-4">
                <div className="w-4 h-[2px] bg-blue-600" />
                ASSET GENERATION
              </div>
              <h1 className="text-4xl font-extrabold text-gray-900 tracking-tighter mb-2">{event.eventName}</h1>
              {event?.description && (
                <p className="text-gray-600 text-sm mb-4 max-w-2xl leading-relaxed whitespace-pre-wrap">
                  {event.description}
                </p>
              )}
              <p className="text-gray-500 font-bold flex items-center gap-2">
                <CheckCircle2 size={16} className="text-green-500" /> Event scheduled for {event.eventDate}
              </p>
            </div>
            
            <div className="absolute top-[-50px] right-[-50px] w-48 h-48 bg-blue-50 rounded-full blur-3xl opacity-50" />
          </motion.div>

          <motion.div variants={itemVariants} className="bg-white/60 backdrop-blur-sm border border-blue-100 rounded-2xl p-6 mb-10 flex items-start gap-4 shadow-sm shadow-blue-50/50">
            <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
              <QRCodeSVG value="icon" size={24} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900 mb-1 uppercase tracking-tight">Participant Portal Access</h4>
              <p className="text-sm text-gray-500 font-medium leading-relaxed">
                Download and print these unique assets. Participants only need to scan to mark their participation status instantly.
              </p>
            </div>
          </motion.div>

          {/* QR Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Check-In QR */}
            <motion.div variants={itemVariants} className="lumina-card group hover:shadow-2xl transition-all duration-500 !p-6 md:!p-8 flex flex-col items-center">
              <div className="w-full flex items-center justify-between mb-8">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="p-2 md:p-2.5 bg-blue-50 rounded-xl text-blue-600 border border-blue-100/50">
                    <LogIn size={20} className="md:w-[22px] md:h-[22px]" />
                  </div>
                  <h2 className="text-lg md:text-xl font-black text-gray-900 uppercase tracking-tighter">Check-In</h2>
                </div>
                <div className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded tracking-widest uppercase break-keep text-center ml-2">GATE 01</div>
              </div>

              <div className="relative mb-8 p-6 bg-gray-50 rounded-3xl border border-gray-100 group-hover:bg-white transition-colors duration-500">
                <QRCodeSVG
                  id="qr-checkin"
                  value={checkInUrl}
                  size={240}
                  level="H"
                  includeMargin={false}
                  className="relative z-10"
                />
              </div>

              <div 
                className="w-full bg-gray-50 rounded-xl p-4 mb-8 border border-gray-100 cursor-pointer hover:bg-white hover:border-gray-200 transition-colors group/link"
                onClick={() => copyToClipboard(checkInUrl, 'Check-In')}
              >
                <div className="flex justify-between items-center mb-1">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Direct Access Link</div>
                  <Copy size={12} className="text-gray-400 group-hover/link:text-blue-500 transition-colors" />
                </div>
                <p className="text-[11px] font-bold text-gray-600 break-all family-mono opacity-80 group-hover/link:text-blue-600 transition-colors">
                  {checkInUrl}
                </p>
              </div>

              <LuminaButton variant="primary" fullWidth onClick={() => downloadQR('checkin', event.startQrToken)}>
                <Download size={16} /> DOWNLOAD ASSET
              </LuminaButton>
            </motion.div>

            {/* Check-Out QR */}
            <motion.div variants={itemVariants} className="lumina-card group hover:shadow-2xl transition-all duration-500 !p-6 md:!p-8 flex flex-col items-center">
              <div className="w-full flex items-center justify-between mb-8">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="p-2 md:p-2.5 bg-purple-50 rounded-xl text-purple-600 border border-purple-100/50">
                    <LogOut size={20} className="md:w-[22px] md:h-[22px]" />
                  </div>
                  <h2 className="text-lg md:text-xl font-black text-gray-900 uppercase tracking-tighter">Check-Out</h2>
                </div>
                <div className="text-[10px] font-black text-purple-600 bg-purple-50 px-2 py-1 rounded tracking-widest uppercase break-keep text-center ml-2">GATE 02</div>
              </div>

              <div className="relative mb-8 p-6 bg-gray-50 rounded-3xl border border-gray-100 group-hover:bg-white transition-colors duration-500">
                <QRCodeSVG
                  id="qr-checkout"
                  value={checkOutUrl}
                  size={240}
                  level="H"
                  includeMargin={false}
                  className="relative z-10"
                />
              </div>

              <div 
                className="w-full bg-gray-50 rounded-xl p-4 mb-8 border border-gray-100 cursor-pointer hover:bg-white hover:border-gray-200 transition-colors group/link"
                onClick={() => copyToClipboard(checkOutUrl, 'Check-Out')}
              >
                <div className="flex justify-between items-center mb-1">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Direct Access Link</div>
                  <Copy size={12} className="text-gray-400 group-hover/link:text-purple-500 transition-colors" />
                </div>
                <p className="text-[11px] font-bold text-gray-600 break-all family-mono opacity-80 group-hover/link:text-purple-600 transition-colors">
                  {checkOutUrl}
                </p>
              </div>

              <LuminaButton 
                variant="primary" 
                fullWidth 
                onClick={() => downloadQR('checkout', event.endQrToken)}
                className="!bg-purple-600 !shadow-purple-100 hover:!bg-purple-700"
              >
                <Download size={16} /> DOWNLOAD ASSET
              </LuminaButton>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
