import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LocationProvider } from './context/LocationContext';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import CustomerDashboard from './pages/CustomerDashboard';
import CustomerJobs from './pages/CustomerJobs';
import CustomerProfile from './pages/CustomerProfile';
import ProviderDashboard from './pages/ProviderDashboard';
import ProviderProfile from './pages/ProviderProfile';
import AdminDashboard from './pages/AdminDashboard';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" />;
  return children;
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

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <LocationProvider>
        <Router>
          <Navbar />
          <AppRoutes />
        </Router>
      </LocationProvider>
    </AuthProvider>
  );
}

export default App;
