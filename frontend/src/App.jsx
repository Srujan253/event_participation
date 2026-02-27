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

// Lumina Modern Toaster config
const toastStyle = {
  border: '1px solid var(--gray-200)',
  borderRadius: 'var(--radius-md)',
  boxShadow: 'var(--lumina-shadow)',
  background: '#FFFFFF',
  color: 'var(--text-main)',
  fontWeight: '600',
  fontSize: '0.9rem',
  fontFamily: "'Inter', sans-serif",
};

function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: toastStyle,
          success: { 
            iconTheme: { primary: 'var(--action-blue)', secondary: '#fff' },
            style: { ...toastStyle, borderLeft: '4px solid var(--action-blue)' }
          },
          error: { 
            iconTheme: { primary: '#EF4444', secondary: '#fff' },
            style: { ...toastStyle, borderLeft: '4px solid #EF4444' }
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
