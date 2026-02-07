import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { ErrorBoundary } from './components/ui/ErrorBoundary'
import { LoadingScreen } from './components/ui/LoadingScreen'
import { AuthModalProvider, useAuthModal } from './contexts/AuthModalContext'
import { ToastProvider } from './contexts/ToastContext'
import { AuthModal } from './components/auth/AuthModal'
import { ProtectedRoute } from './components/routing/ProtectedRoute'

// Lazy load pages for code splitting
const Home = lazy(() => import('./pages/Home').then(module => ({ default: module.Home })))
const AnimeDetail = lazy(() => import('./pages/AnimeDetail').then(module => ({ default: module.AnimeDetail })))
const Favorites = lazy(() => import('./pages/Favorites').then(module => ({ default: module.Favorites })))
const Profile = lazy(() => import('./pages/Profile').then(module => ({ default: module.Profile })))
const AdminPanel = lazy(() => import('./pages/AdminPanel').then(module => ({ default: module.AdminPanel })))
const ModerationPanel = lazy(() => import('./pages/ModerationPanel').then(module => ({ default: module.ModerationPanel })))
const NotFound = lazy(() => import('./pages/NotFound').then(module => ({ default: module.NotFound })))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes - данные считаются свежими
      gcTime: 10 * 60 * 1000, // 10 minutes - время хранения в кэше (ранее cacheTime)
      retry: (failureCount, error) => {
        // Don't retry on 404 errors
        if (error instanceof Error && error.message.includes('не найдено')) {
          return false;
        }
        // Retry up to 2 times for network errors
        return failureCount < 2;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false, // Не перезапрашивать при фокусе окна
    },
    mutations: {
      retry: 1, // Повторить мутации один раз при ошибке
    },
  },
})

function AppContent() {
  const { isAuthModalOpen, authModalMode, closeAuthModal } = useAuthModal();

  return (
    <>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/anime/:id" element={<AnimeDetail />} />
          <Route 
            path="/favorites" 
            element={
              <ProtectedRoute requireAuth>
                <Favorites />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute requireAuth>
                <Profile />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute requireAdmin>
                <AdminPanel />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/moderation" 
            element={
              <ProtectedRoute requireModerator>
                <ModerationPanel />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      
      {/* Global AuthModal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
        initialMode={authModalMode}
      />
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <AuthModalProvider>
            <BrowserRouter
              future={{
                v7_startTransition: true,
                v7_relativeSplatPath: true,
              }}
            >
              <AppContent />
            </BrowserRouter>
          </AuthModalProvider>
        </ToastProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}

export default App
