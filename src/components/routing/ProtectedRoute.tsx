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

/**
 * ProtectedRoute - Route guard component
 * Protects routes based on authentication and authorization requirements
 * 
 * @param requireAuth - Requires user to be authenticated
 * @param requireAdmin - Requires user to be an admin
 * @param requireModerator - Requires user to be a moderator or admin
 * @param redirectTo - Path to redirect to if access is denied (default: '/')
 */
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

  // DEBUG LOGGING
  console.log('ProtectedRoute Debug:', {
    requireAdmin,
    requireModerator,
    authLoading,
    adminLoading,
    isAdmin,
    isModerator,
    user: user?.email,
  });

  // Wait for authentication to complete first
  if (authLoading) {
    console.log('ProtectedRoute: Waiting for auth...');
    return <LoadingScreen />;
  }

  // Check authentication requirement
  if (requireAuth && !user) {
    console.log('ProtectedRoute: No user, redirecting to', redirectTo);
    return <Navigate to={redirectTo} replace />;
  }

  // Wait for admin/moderator status to load before any checks
  if ((requireAdmin || requireModerator) && adminLoading) {
    console.log('ProtectedRoute: Waiting for admin status...');
    return <LoadingScreen />;
  }

  // Check admin requirement - SIMPLE: if isAdmin is true, LET THEM IN
  if (requireAdmin) {
    console.log('ProtectedRoute: Admin check - isAdmin:', isAdmin);
    if (!isAdmin) {
      console.log('ProtectedRoute: Not admin, redirecting to', redirectTo);
      return <Navigate to={redirectTo} replace />;
    }
    console.log('ProtectedRoute: Admin access GRANTED');
  }

  // Check moderator requirement (admin also counts as moderator)
  if (requireModerator) {
    console.log('ProtectedRoute: Moderator check - isAdmin:', isAdmin, 'isModerator:', isModerator);
    if (!isAdmin && !isModerator) {
      console.log('ProtectedRoute: Not moderator, redirecting to', redirectTo);
      return <Navigate to={redirectTo} replace />;
    }
    console.log('ProtectedRoute: Moderator access GRANTED');
  }

  // All checks passed, render children
  console.log('ProtectedRoute: All checks passed, rendering children');
  return <>{children}</>;
};
