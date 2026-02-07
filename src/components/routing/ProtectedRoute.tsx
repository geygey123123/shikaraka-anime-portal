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

  // CRITICAL FIX: Wait for authentication to complete first
  if (authLoading) {
    return <LoadingScreen />;
  }

  // Check authentication requirement
  if (requireAuth && !user) {
    return <Navigate to={redirectTo} replace />;
  }

  // CRITICAL FIX: Wait for admin/moderator status to load before any checks
  // This prevents the "flashing redirect" race condition
  if ((requireAdmin || requireModerator) && adminLoading) {
    return <LoadingScreen />;
  }

  // Check admin requirement - only after loading is complete
  if (requireAdmin && !isAdmin) {
    return <Navigate to={redirectTo} replace />;
  }

  // Check moderator requirement - only after loading is complete
  // (admin also counts as moderator)
  if (requireModerator && !isAdmin && !isModerator) {
    return <Navigate to={redirectTo} replace />;
  }

  // All checks passed, render children
  return <>{children}</>;
};
