import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const DoctorProtectedRoute = ({ children }) => {
  const { isAuthenticated, accountType } = useAuth();
  const location = useLocation();

  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (accountType !== 'doctor') {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default DoctorProtectedRoute;
