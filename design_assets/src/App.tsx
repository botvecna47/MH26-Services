import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import { UserProvider } from './context/UserContext';
import { NotificationProvider } from './context/NotificationContext';
import { Toaster } from './components/ui/sonner';

export default function App() {
  return (
    <UserProvider>
      <NotificationProvider>
        <Router>
          <div className="min-h-screen glass-gradient-bg">
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
    </UserProvider>
  );
}