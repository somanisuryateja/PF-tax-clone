import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const ProtectedRoute = () => {
  const { authenticated } = useAuth();
  const location = useLocation();

  console.log('🟡 [PROTECTED ROUTE] Checking authentication...');
  console.log('🟡 [PROTECTED ROUTE] Authenticated:', authenticated);
  console.log('🟡 [PROTECTED ROUTE] Current location:', location.pathname);
  console.log('🟡 [PROTECTED ROUTE] localStorage token:', localStorage.getItem('pf-token') ? 'EXISTS' : 'EMPTY');

  // Only protect routes that are actually protected
  // Don't redirect if we're already on a public route
  if (location.pathname === '/' || location.pathname === '/login' || location.pathname === '/gateway/ecr') {
    console.log('🟡 [PROTECTED ROUTE] This is a public route - allowing access');
    return <Outlet />;
  }

  if (!authenticated) {
    console.log('🟡 [PROTECTED ROUTE] Not authenticated - redirecting to /login');
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  console.log('🟡 [PROTECTED ROUTE] Authenticated - rendering protected content');
  return <Outlet />;
};

export default ProtectedRoute;

