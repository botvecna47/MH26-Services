import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import UnifiedNavigation from './components/UnifiedNavigation';
import MobileBottomNav from './components/MobileBottomNav';
import Footer from './components/Footer';
import HomePage from './components/HomePage';
import ServicesPage from './components/ServicesPage';
import ProviderDetailPage from './components/ProviderDetailPage';

import DashboardPage from './components/DashboardPage';
import MessagingPage from './components/MessagingPage';
import InvoicesPage from './components/InvoicesPage';
import AdminPanel from './components/AdminPanel';
import AuthPage from './components/AuthPage';
import ResetPasswordPage from './components/ResetPasswordPage';
import VerifyEmailPage from './components/VerifyEmailPage';
import ProviderServicesPage from './components/ProviderServicesPage';
import ProviderProfilePage from './components/ProviderProfilePage';
import { UserProvider } from './context/UserContext';
import { NotificationProvider } from './context/NotificationContext';
import { Toaster } from './components/ui/sonner';
import ScrollToTop from './components/ScrollToTop';
import ProviderOnboardingPage from './components/ProviderOnboardingPage';
import NotificationsPage from './components/NotificationsPage';

import { SocketProvider } from './context/SocketContext';

import { ErrorBoundary } from './components/ErrorBoundary';
import UserSocketSync from './components/UserSocketSync';

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
                <ScrollToTop />
                <UnifiedNavigation />
                <main className="pb-20 md:pb-0">
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/auth" element={<AuthPage />} />
                    <Route path="/reset-password" element={<ResetPasswordPage />} />
                    <Route path="/verify-email" element={<VerifyEmailPage />} />
                    <Route path="/provider-onboarding" element={<ProviderOnboardingPage />} />
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

                    {/* Catch-all route for 404s */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
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
import BannedPage from './components/BannedPage';

function ProtectedRoute({ children, requireAdmin }: { children: JSX.Element, requireAdmin?: boolean }) {
  const { user, isAdmin, isLoading } = useUser();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // If user is banned, force them to Banned Page
  // We check this via a custom property or role if needed, but backend sends isBanned.
  // We need to ensure User type has isBanned. If not in type, specific check:
  if ((user as any).isBanned) {
      return <Navigate to="/banned" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}