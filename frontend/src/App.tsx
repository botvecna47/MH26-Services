import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { lazy, Suspense } from 'react';
import UnifiedNavigation from './components/UnifiedNavigation';
import MobileBottomNav from './components/MobileBottomNav';
import Footer from './components/Footer';
import { UserProvider } from './context/UserContext';
import { NotificationProvider } from './context/NotificationContext';
import { Toaster } from './components/ui/sonner';
import ScrollToTop from './components/ScrollToTop';
import { SocketProvider } from './context/SocketContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import UserSocketSync from './components/UserSocketSync';
import CustomCursor from './components/CustomCursor';

// Lazy loaded components
const HomePage = lazy(() => import('./components/HomePage'));
const ServicesPage = lazy(() => import('./components/ServicesPage'));
const ProviderDetailPage = lazy(() => import('./components/ProviderDetailPage'));
const DashboardPage = lazy(() => import('./components/DashboardPage'));
const MessagingPage = lazy(() => import('./components/MessagingPage'));
const InvoicesPage = lazy(() => import('./components/InvoicesPage'));
const AdminPanel = lazy(() => import('./components/AdminPanel'));
const AuthPage = lazy(() => import('./components/AuthPage'));
const ResetPasswordPage = lazy(() => import('./components/ResetPasswordPage'));
const VerifyEmailPage = lazy(() => import('./components/VerifyEmailPage'));
const ProviderServicesPage = lazy(() => import('./components/ProviderServicesPage'));
const ProviderProfilePage = lazy(() => import('./components/ProviderProfilePage'));
const ProviderOnboardingPage = lazy(() => import('./components/ProviderOnboardingPage'));
const NotificationsPage = lazy(() => import('./components/NotificationsPage'));
const BannedPage = lazy(() => import('./components/BannedPage'));
const ProviderSuspendedPage = lazy(() => import('./components/ProviderSuspendedPage'));
const ProviderPendingPage = lazy(() => import('./components/ProviderPendingPage'));
const PrivacyPolicyPage = lazy(() => import('./components/PrivacyPolicyPage'));
const TermsPage = lazy(() => import('./components/TermsPage'));
const CookiePolicyPage = lazy(() => import('./components/CookiePolicyPage'));

const PageLoader = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="animate-pulse text-lg text-primary font-medium">Loading...</div>
  </div>
);

const queryClient = new QueryClient();

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <UserProvider>
          <SocketProvider>
            <UserSocketSync />
            <NotificationProvider>
              <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <div className="min-h-screen glass-gradient-bg">
                <CustomCursor />
                <ScrollToTop />
                <BannedUserRedirect />
                <SuspendedProviderRedirect />
                <PendingProviderRedirect />
                <UnifiedNavigation />
                <main className="pb-20 md:pb-0">
                  <Suspense fallback={<PageLoader />}>
                    <Routes>
                      <Route path="/" element={<HomePage />} />
                      <Route path="/auth" element={<AuthPage />} />
                      <Route path="/reset-password" element={<ResetPasswordPage />} />
                      <Route path="/verify-email" element={<VerifyEmailPage />} />
                      <Route path="/provider-onboarding" element={<ProviderOnboardingPage />} />
                      <Route path="/provider-pending" element={<ProviderPendingPage />} />
                      <Route path="/services" element={<ServicesPage />} />
                      <Route path="/provider/services" element={<ProviderServicesPage />} />
                      <Route path="/provider/profile" element={<ProviderProfilePage />} />
                      <Route path="/provider/:id" element={<ProviderDetailPage />} />

                      {/* Protected Routes */}
                      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                      <Route path="/messages" element={<ProtectedRoute><MessagingPage /></ProtectedRoute>} />
                      <Route path="/invoices" element={<ProtectedRoute><InvoicesPage /></ProtectedRoute>} />
                      <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminPanel /></ProtectedRoute>} />
                      <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
                      
                       {/* Banned User Route */}
                      <Route path="/banned" element={<BannedPage />} />
                      
                      {/* Suspended Provider Route */}
                      <Route path="/provider-suspended" element={<ProviderSuspendedPage />} />

                      {/* Policy Pages */}
                      <Route path="/privacy" element={<PrivacyPolicyPage />} />
                      <Route path="/terms" element={<TermsPage />} />
                      <Route path="/cookies" element={<CookiePolicyPage />} />

                      {/* Catch-all route for 404s */}
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </Suspense>
                </main>
                <Footer />
                <MobileBottomNav />
                <Toaster />
              </div>
            </Router>
            </NotificationProvider>
          </SocketProvider>
        </UserProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

// Protected Route Component
import { useUser } from './context/UserContext';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Global component to redirect banned users from any page
function BannedUserRedirect() {
  const { isBanned, isAuthenticated } = useUser();
  const location = useLocation();

  useEffect(() => {
    // If user is banned and not already on banned page, redirect
    if (isAuthenticated && isBanned && location.pathname !== '/banned') {
      window.location.href = '/banned';
    }
  }, [isBanned, isAuthenticated, location.pathname]);

  return null;
}

// Global component to redirect suspended providers to appeal page
function SuspendedProviderRedirect() {
  const { isProviderSuspended, isAuthenticated } = useUser();
  const location = useLocation();

  useEffect(() => {
    // Allowed paths for suspended providers (they can still browse)
    const allowedPaths = [
      '/provider-suspended',
      '/auth',
      '/',
      '/services',
      '/privacy',
      '/terms',
      '/cookies',
    ];
    
    const isAllowed = allowedPaths.some(path => location.pathname === path) || 
                      location.pathname.startsWith('/provider/'); // Allow viewing other providers

    // If provider is suspended and trying to access protected routes, redirect
    if (isAuthenticated && isProviderSuspended && !isAllowed) {
      window.location.href = '/provider-suspended';
    }
  }, [isProviderSuspended, isAuthenticated, location.pathname]);

  return null;
}

// Global component to redirect PENDING/REJECTED providers to pending page
function PendingProviderRedirect() {
  const { user, isAuthenticated } = useUser();
  const location = useLocation();

  useEffect(() => {
    // Check if user is a provider with PENDING or REJECTED status
    const isPendingOrRejected = user?.role === 'PROVIDER' && 
      user?.providerStatus && 
      (user.providerStatus === 'PENDING' || user.providerStatus === 'REJECTED');
    
    if (!isPendingOrRejected || !isAuthenticated) return;

    // Allowed paths for PENDING/REJECTED providers
    const allowedPaths = [
      '/provider-pending',
      '/provider-onboarding', // Allow resubmission for REJECTED
      '/auth',
      '/',
      '/services',
      '/privacy',
      '/terms',
      '/cookies',
    ];
    
    const isAllowed = allowedPaths.some(path => location.pathname === path) || 
                      location.pathname.startsWith('/provider/'); // Allow viewing other providers

    // If provider is pending/rejected and trying to access protected routes, redirect
    if (!isAllowed) {
      window.location.href = '/provider-pending';
    }
  }, [user, isAuthenticated, location.pathname]);

  return null;
}

function ProtectedRoute({ children, requireAdmin }: { children: JSX.Element, requireAdmin?: boolean }) {
  const { user, isAdmin, isLoading, isBanned, isProviderSuspended } = useUser();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // If user is banned, force them to Banned Page
  if (isBanned) {
    return <Navigate to="/banned" replace />;
  }

  // If provider is suspended, force them to Suspended Provider Page
  if (isProviderSuspended) {
    return <Navigate to="/provider-suspended" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

// Export redirect components for use in App
export { BannedUserRedirect, SuspendedProviderRedirect, PendingProviderRedirect };