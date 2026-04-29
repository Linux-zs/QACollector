import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import { useAuth } from './context/AuthContext';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import TermDetailPage from './pages/TermDetailPage';
import CreateTermPage from './pages/CreateTermPage';
import EditTermPage from './pages/EditTermPage';
import AdminPage from './pages/AdminPage';

function ProtectedRoute({ children, roles }: { children: React.ReactNode; roles?: string[] }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />;
  return <>{children}</>;
}

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/term/:id" element={<TermDetailPage />} />
        <Route path="/create" element={
          <ProtectedRoute roles={['admin', 'contributor']}>
            <CreateTermPage />
          </ProtectedRoute>
        } />
        <Route path="/edit/:id" element={
          <ProtectedRoute>
            <EditTermPage />
          </ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute roles={['admin']}>
            <AdminPage />
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}
