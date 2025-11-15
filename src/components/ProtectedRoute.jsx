import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const ProtectedRoute = () => {
  const { authenticated } = useAuth();
  const location = useLocation();

  // Only protect routes that are actually protected
  // Don't redirect if we're already on a public route
  if (location.pathname === '/' || location.pathname === '/login' || location.pathname === '/gateway/ecr') {
    return <Outlet />;
  }

  if (!authenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
};

export default ProtectedRoute;

