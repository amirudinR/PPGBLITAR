import React from 'react';
import { Navigate } from 'react-router-dom';
import { User } from '@/types/admin';

interface ProtectedRouteProps {
  currentUser: User | null;
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ currentUser, children }) => {
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;