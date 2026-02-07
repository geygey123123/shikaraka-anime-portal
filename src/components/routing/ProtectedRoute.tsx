import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useIsAdmin, useIsModerator } from '../../hooks/useAdmin';
import { LoadingScreen } from '../ui/LoadingScreen';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
  requireModerator?: boolean;
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = false,
  requireAdmin = false,
  requireModerator = false,
  redirectTo = '/',
}) => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, isLoading: adminLoading } = useIsAdmin();
  const isModerator = useIsModerator();

  console.log('🔒 ProtectedRoute:', { authLoading, adminLoading, isAdmin, isModerator, user: user?.email });

  // Wait for auth
  if (authLoading) {
    return <LoadingScreen />;
  }

  // Check auth
  if (requireAuth && !user) {
    return <Navigate to={redirectTo} replace />;
  }

  // Wait for admin check ONLY if we need it
  if (requireAdmin && adminLoading) {
    return <LoadingScreen />;
  }

  // Simple check: if isAdmin is true, LET THEM IN
  if (requireAdmin && !isAdmin) {
    console.log('❌ Admin required but isAdmin =', isAdmin);
    return <Navigate to={redirectTo} replace />;
  }

  // Moderator check
  if (requireModerator && !isAdmin && !isModerator) {
    return <Navigate to={redirectTo} replace />;
  }

  console.log('✅ Access granted');
  return <>{children}</>;
};
