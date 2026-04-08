import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LocationProvider } from './context/LocationContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import CustomerDashboard from './pages/CustomerDashboard';
import CustomerJobs from './pages/CustomerJobs';
import CustomerProfile from './pages/CustomerProfile';
import ProviderDashboard from './pages/ProviderDashboard';
import ProviderProfile from './pages/ProviderProfile';
import AdminDashboard from './pages/AdminDashboard';
import Help from './pages/Help';
import TicketChat from './pages/TicketChat';
import SupportLogin from './pages/SupportLogin';
import SupportDashboard from './pages/SupportDashboard';
import AIChatbot from './components/AIChatbot';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" />;
  return children;
};

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to={user.role === 'admin' ? '/admin' : user.role === 'provider' ? '/provider/dashboard' : '/customer/dashboard'} /> : <Landing />} />
      <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />

      {/* Customer Routes */}
      <Route path="/customer/dashboard" element={<ProtectedRoute allowedRoles={['customer']}><CustomerDashboard /></ProtectedRoute>} />
      <Route path="/customer/jobs" element={<ProtectedRoute allowedRoles={['customer']}><CustomerJobs /></ProtectedRoute>} />
      <Route path="/customer/profile" element={<ProtectedRoute allowedRoles={['customer']}><CustomerProfile /></ProtectedRoute>} />

      {/* Provider Routes */}
      <Route path="/provider/dashboard" element={<ProtectedRoute allowedRoles={['provider']}><ProviderDashboard /></ProtectedRoute>} />
      <Route path="/provider/profile" element={<ProtectedRoute allowedRoles={['provider']}><ProviderProfile /></ProtectedRoute>} />

      {/* Admin Routes */}
      <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />

      {/* Shared Help & Ticket Routes (Must be logged in to chat, but help can be viewed publically ideally, though protected here to match design) */}
      <Route path="/help" element={<Help />} />
      <Route path="/help/ticket/:id" element={<ProtectedRoute allowedRoles={['customer', 'provider']}><TicketChat /></ProtectedRoute>} />

      {/* Support Agent Routes */}
      <Route path="/support" element={user && user.role === 'support' ? <Navigate to="/support/dashboard" /> : <SupportLogin />} />
      <Route path="/support/dashboard" element={<ProtectedRoute allowedRoles={['support']}><SupportDashboard /></ProtectedRoute>} />
      <Route path="/support/ticket/:id" element={<ProtectedRoute allowedRoles={['support']}><TicketChat /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <LocationProvider>
        <Router>
          <ScrollToTop />
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Navbar />
            <main style={{ flex: 1 }}>
              <AppRoutes />
            </main>
            <Footer />
            <AIChatbot />
          </div>
        </Router>
      </LocationProvider>
    </AuthProvider>
  );
}

export default App;
