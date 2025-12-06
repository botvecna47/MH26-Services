import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Suspense, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import { useSocket } from './hooks/useSocket';
import UnifiedNavigation from './components/UnifiedNavigation';
import MobileBottomNav from './components/MobileBottomNav';
import Footer from './components/Footer';
import HomePage from './components/HomePage';
import ServicesPage from './components/ServicesPage';
import ProviderDetailPage from './components/ProviderDetailPage';
import ProviderOnboardingComplete from './components/ProviderOnboardingComplete';
import DashboardPage from './components/DashboardPage';
import BookingDetailsPage from './components/BookingDetailsPage';
import AdminPanel from './components/AdminPanel';
import AuthPage from './components/AuthPage';
import Settings from './pages/Settings';
import { AuthProvider } from './hooks/useAuth';
import { UserProvider } from './context/UserContext';
import { NotificationProvider } from './context/NotificationContext';
import { Toaster } from './components/ui/sonner';
import { PageTransition } from './components/ui/PageTransition';

// Simple loading fallback
const LoadingFallback = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
);

const AppContent = () => {
  const location = useLocation();
  const socket = useSocket();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket) return;

    const handleBookingUpdate = (data: any) => {
      console.log('Booking update received:', data);
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['booking', data.id] });
      // Also refresh notifications as status changes often trigger them
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    };

    const handleNewNotification = () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    };

    socket.on('bookingUpdate', handleBookingUpdate);
    socket.on('notification', handleNewNotification);

    return () => {
      socket.off('bookingUpdate', handleBookingUpdate);
      socket.off('notification', handleNewNotification);
    };
  }, [socket, queryClient]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={<LoadingFallback />}>
        <UnifiedNavigation />
        <main className="pb-20 md:pb-0">
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<PageTransition><HomePage /></PageTransition>} />
              <Route path="/auth" element={<PageTransition><AuthPage /></PageTransition>} />
              <Route path="/services" element={<PageTransition><ServicesPage /></PageTransition>} />
              <Route path="/provider/:id" element={<PageTransition><ProviderDetailPage /></PageTransition>} />
              <Route path="/provider-onboarding" element={<PageTransition><ProviderOnboardingComplete /></PageTransition>} />
              <Route path="/dashboard" element={<PageTransition><DashboardPage /></PageTransition>} />
              <Route path="/bookings/:id" element={<PageTransition><BookingDetailsPage /></PageTransition>} />
              <Route path="/admin" element={<PageTransition><AdminPanel /></PageTransition>} />
              <Route path="/settings" element={<PageTransition><Settings /></PageTransition>} />
              {/* Catch-all route for 404s */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AnimatePresence>
        </main>
        <Footer />
        <MobileBottomNav />
        <Toaster />
      </Suspense>
    </div>
  );
};

export default function App() {
  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <AuthProvider>
        <UserProvider>
          <NotificationProvider>
            <AppContent />
          </NotificationProvider>
        </UserProvider>
      </AuthProvider>
    </Router>
  );
}
