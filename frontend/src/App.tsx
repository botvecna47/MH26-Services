import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense } from 'react';
import UnifiedNavigation from './components/UnifiedNavigation';
import MobileBottomNav from './components/MobileBottomNav';
import Footer from './components/Footer';
import HomePage from './components/HomePage';
import ServicesPage from './components/ServicesPage';
import ProviderDetailPage from './components/ProviderDetailPage';
import ProviderOnboardingComplete from './components/ProviderOnboardingComplete';
import DashboardPage from './components/DashboardPage';
import MessagingPage from './components/MessagingPage';
import InvoicesPage from './components/InvoicesPage';
import AdminPanel from './components/AdminPanel';
import AuthPage from './components/AuthPage';
import DemoForms from './components/DemoForms';
import Settings from './pages/Settings';
import { AuthProvider } from './hooks/useAuth';
import { UserProvider } from './context/UserContext';
import { NotificationProvider } from './context/NotificationContext';
import { Toaster } from './components/ui/sonner';

// Simple loading fallback
const LoadingFallback = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
);

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
            <div className="min-h-screen bg-gray-50">
              <Suspense fallback={<LoadingFallback />}>
                <UnifiedNavigation />
                <main className="pb-20 md:pb-0">
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/auth" element={<AuthPage />} />
                    <Route path="/services" element={<ServicesPage />} />
                    <Route path="/provider/:id" element={<ProviderDetailPage />} />
                    <Route path="/provider-onboarding" element={<ProviderOnboardingComplete />} />
                    <Route path="/dashboard" element={<DashboardPage />} />
                        <Route path="/messages" element={<MessagingPage />} />
                        <Route path="/invoices" element={<InvoicesPage />} />
                        <Route path="/admin" element={<AdminPanel />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="/demo-forms" element={<DemoForms />} />
                        {/* Catch-all route for 404s */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </main>
                <Footer />
                <MobileBottomNav />
                <Toaster />
              </Suspense>
            </div>
          </NotificationProvider>
        </UserProvider>
      </AuthProvider>
    </Router>
  );
}
