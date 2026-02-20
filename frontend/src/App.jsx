import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import QRDisplayPage from './pages/QRDisplayPage';
import CheckInPage from './pages/CheckInPage';
import EventStatsPage from './pages/EventStatsPage';

// Simple private route guard
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('attendqr_token');
  return token ? children : <Navigate to="/auth" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/scan/:token" element={<CheckInPage />} />
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
