import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import QRDisplayPage from './pages/QRDisplayPage';
import CheckInPage from './pages/CheckInPage';
import EventStatsPage from './pages/EventStatsPage';
import SuperAdminDashboard from './pages/SuperAdminDashboard';

// Get stored admin info
const getAdmin = () => {
  try { return JSON.parse(localStorage.getItem('attendqr_admin')); } catch { return null; }
};

// Regular admin route guard
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('attendqr_token');
  const admin = getAdmin();
  if (!token) return <Navigate to="/auth" replace />;
  if (admin?.role === 'super_admin') return <Navigate to="/superadmin" replace />;
  return children;
};

// Super admin route guard
const SuperAdminRoute = ({ children }) => {
  const token = localStorage.getItem('attendqr_token');
  const admin = getAdmin();
  if (!token) return <Navigate to="/auth" replace />;
  if (admin?.role !== 'super_admin') return <Navigate to="/" replace />;
  return children;
};

// Lumina Modern Glassmorphism Toaster config
const toastStyle = {
  border: '1px solid rgba(255, 255, 255, 0.3)',
  borderRadius: '9999px', // Pill shape instead of rectangle
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
  background: 'rgba(255, 255, 255, 0.75)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  color: 'var(--text-main)',
  fontWeight: '700',
  fontSize: '0.9rem',
  fontFamily: "'Inter', sans-serif",
  padding: '12px 24px',
};

function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-center" // Centered as requested
        toastOptions={{
          duration: 3500,
          style: toastStyle,
          success: { 
            iconTheme: { primary: 'var(--action-blue)', secondary: '#fff' },
            style: { ...toastStyle }
          },
          error: { 
            iconTheme: { primary: '#EF4444', secondary: '#fff' },
            style: { ...toastStyle }
          },
        }}
      />
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/scan/:token" element={<CheckInPage />} />
        <Route
          path="/superadmin"
          element={
            <SuperAdminRoute>
              <SuperAdminDashboard />
            </SuperAdminRoute>
          }
        />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/event/:id/qr"
          element={
            <PrivateRoute>
              <QRDisplayPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/event/:id/stats"
          element={
            <PrivateRoute>
              <EventStatsPage />
            </PrivateRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
