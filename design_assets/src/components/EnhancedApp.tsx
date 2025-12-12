// Enhanced App component with improved error handling, performance, and UX
import { useState, useEffect, Suspense, lazy } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { motion, AnimatePresence } from "motion/react";
import { Loader2, Wifi, WifiOff, RefreshCw } from "lucide-react";
import { Navigation } from "./Navigation";
import { FloatingElements } from "./FloatingElements";
import { Toaster } from "./ui/sonner";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { authService, useAuth } from "../services/auth";
import { wsService, useWebSocket } from "../services/websocket";
import { toast } from 'sonner@2.0.3';

// Lazy load components for better performance
const Homepage = lazy(() => import("./Homepage").then(m => ({ default: m.Homepage })));
const ServiceListings = lazy(() => import("./ServiceListings").then(m => ({ default: m.ServiceListings })));
const ProviderDetail = lazy(() => import("./ProviderDetail").then(m => ({ default: m.ProviderDetail })));
const About = lazy(() => import("./About").then(m => ({ default: m.About })));
const ForProviders = lazy(() => import("./ForProviders").then(m => ({ default: m.ForProviders })));
const PortalSelection = lazy(() => import("./PortalSelection").then(m => ({ default: m.PortalSelection })));
const AuthScreen = lazy(() => import("./AuthScreen").then(m => ({ default: m.AuthScreen })));
const CustomerPortal = lazy(() => import("./CustomerPortal").then(m => ({ default: m.CustomerPortal })));
const ProviderPortal = lazy(() => import("./ProviderPortal").then(m => ({ default: m.ProviderPortal })));
const AdminDashboard = lazy(() => import("./AdminDashboard").then(m => ({ default: m.AdminDashboard })));

type UserType = 'customer' | 'provider' | 'admin' | null;
type AppState = 'public' | 'portal-selection' | 'auth' | 'authenticated';

interface AppError {
  message: string;
  stack?: string;
  timestamp: Date;
}

// Loading component
function LoadingSpinner({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-4"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className="w-12 h-12 text-primary mx-auto" />
        </motion.div>
        <p className="text-muted-foreground">{message}</p>
      </motion.div>
    </div>
  );
}

// Error fallback component
function ErrorFallback({ error, resetErrorBoundary }: { error: AppError; resetErrorBoundary: () => void }) {
  useEffect(() => {
    // Log error to monitoring service
    console.error('Application Error:', error);
    
    // You can send to error monitoring service like Sentry
    // Sentry.captureException(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <Card className="shadow-lg">
          <CardContent className="p-6 text-center space-y-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <RefreshCw className="w-8 h-8 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">Something went wrong</h2>
              <p className="text-muted-foreground mt-2">
                We're sorry for the inconvenience. Please try refreshing the page.
              </p>
            </div>
            <div className="space-y-2">
              <Button onClick={resetErrorBoundary} className="w-full">
                Try Again
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.location.href = '/'}
                className="w-full"
              >
                Go to Homepage
              </Button>
            </div>
            {process.env.NODE_ENV === 'development' && (
              <details className="text-left">
                <summary className="cursor-pointer text-sm text-muted-foreground">
                  Error Details (Development)
                </summary>
                <pre className="text-xs bg-muted p-2 rounded mt-2 overflow-auto">
                  {error.message}
                  {error.stack && `\n\n${error.stack}`}
                </pre>
              </details>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

// Network status component
function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showStatus, setShowStatus] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowStatus(true);
      toast.success('Connection restored');
      setTimeout(() => setShowStatus(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowStatus(true);
      toast.error('Connection lost. Working offline.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Show status initially if offline
    if (!navigator.onLine) {
      setShowStatus(true);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showStatus) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2 rounded-lg shadow-lg ${
          isOnline 
            ? 'bg-green-500 text-white' 
            : 'bg-red-500 text-white'
        }`}
      >
        <div className="flex items-center space-x-2">
          {isOnline ? (
            <Wifi className="w-4 h-4" />
          ) : (
            <WifiOff className="w-4 h-4" />
          )}
          <span className="text-sm font-medium">
            {isOnline ? 'Back online' : 'No internet connection'}
          </span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// Performance monitoring
function usePerformanceMonitoring() {
  useEffect(() => {
    // Monitor page load performance
    if ('performance' in window) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        const loadTime = navigation.loadEventEnd - navigation.loadEventStart;
        const domContentLoaded = navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart;
        
        console.log('Page Load Performance:', {
          loadTime: `${loadTime}ms`,
          domContentLoaded: `${domContentLoaded}ms`,
          totalLoadTime: `${navigation.loadEventEnd - navigation.fetchStart}ms`
        });

        // Alert if load time is too high
        if (loadTime > 3000) {
          console.warn('Slow page load detected:', loadTime + 'ms');
        }
      }
    }

    // Monitor memory usage (if available)
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      console.log('Memory Usage:', {
        used: `${Math.round(memory.usedJSHeapSize / 1048576)}MB`,
        allocated: `${Math.round(memory.totalJSHeapSize / 1048576)}MB`,
        limit: `${Math.round(memory.jsHeapSizeLimit / 1048576)}MB`
      });
    }
  }, []);
}

export default function EnhancedApp() {
  const [appState, setAppState] = useState<AppState>("public");
  const [currentPage, setCurrentPage] = useState("home");
  const [selectedUserType, setSelectedUserType] = useState<UserType>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  
  const { user, isAuthenticated, isLoading } = useAuth();
  const ws = useWebSocket();

  // Performance monitoring
  usePerformanceMonitoring();

  // Initialize the app
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize auth service
        await authService.init();
        
        // Start auto-refresh for tokens
        authService.startAutoRefresh();
        
        // Request notification permission
        if ('Notification' in window && Notification.permission === 'default') {
          await Notification.requestPermission();
        }
        
        // Initialize service worker for PWA
        if ('serviceWorker' in navigator) {
          try {
            await navigator.serviceWorker.register('/sw.js');
            console.log('Service Worker registered');
          } catch (error) {
            console.log('Service Worker registration failed:', error);
          }
        }
        
      } catch (error) {
        console.error('App initialization error:', error);
        toast.error('Failed to initialize app. Please refresh the page.');
      } finally {
        setIsInitializing(false);
      }
    };

    initializeApp();
  }, []);

  // Handle authentication state changes
  useEffect(() => {
    if (isAuthenticated && user) {
      setAppState("authenticated");
      setSelectedUserType(user.userType);
    } else if (!isLoading && !isInitializing) {
      // Only reset to public if we're done loading and not authenticated
      if (appState === "authenticated") {
        setAppState("public");
        setSelectedUserType(null);
        setCurrentPage("home");
      }
    }
  }, [isAuthenticated, user, isLoading, isInitializing, appState]);

  // Preload critical resources
  useEffect(() => {
    const preloadImages = [
      '/logo.png',
      '/hero-bg.jpg',
      // Add other critical images
    ];

    preloadImages.forEach(src => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  const handlePageChange = (page: string) => {
    if (page === "admin" || page === "provider-login") {
      setAppState("portal-selection");
    } else {
      setCurrentPage(page);
    }
  };

  const handlePortalSelection = (userType: UserType) => {
    setSelectedUserType(userType);
    setAppState("auth");
  };

  const handleBackToPortalSelection = () => {
    setSelectedUserType(null);
    setAppState("portal-selection");
  };

  const handleBackToPublic = () => {
    setAppState("public");
    setSelectedUserType(null);
    setCurrentPage("home");
  };

  const handleAuthenticated = (userData: any) => {
    // The auth service will handle this automatically
    // This callback is mainly for backward compatibility
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      ws.disconnect();
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Error during logout');
    }
  };

  // Show loading screen during initialization
  if (isInitializing || isLoading) {
    return <LoadingSpinner message="Initializing MH26 Services..." />;
  }

  const renderPublicPages = () => {
    switch (currentPage) {
      case "home":
        return <Homepage onPageChange={handlePageChange} />;
      case "services":
        return <ServiceListings onPageChange={handlePageChange} />;
      case "provider-detail":
        return <ProviderDetail onPageChange={handlePageChange} />;
      case "about":
        return <About onPageChange={handlePageChange} />;
      case "providers":
        return <ForProviders onPageChange={handlePageChange} />;
      default:
        return <Homepage onPageChange={handlePageChange} />;
    }
  };

  const renderAuthenticatedPortal = () => {
    if (!user) return <LoadingSpinner />;

    switch (user.userType) {
      case "customer":
        return <CustomerPortal userData={user} onLogout={handleLogout} />;
      case "provider":
        return <ProviderPortal userData={user} onLogout={handleLogout} />;
      case "admin":
        return <AdminDashboard userData={user} onLogout={handleLogout} />;
      default:
        return <Homepage onPageChange={handlePageChange} />;
    }
  };

  const renderCurrentView = () => {
    switch (appState) {
      case "public":
        return (
          <div className="min-h-screen bg-background relative">
            <FloatingElements />
            <Navigation currentPage={currentPage} onPageChange={handlePageChange} />
            <div className="relative z-10">
              <Suspense fallback={<LoadingSpinner />}>
                {renderPublicPages()}
              </Suspense>
            </div>
          </div>
        );

      case "portal-selection":
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <PortalSelection onSelectPortal={handlePortalSelection} onBack={handleBackToPublic} />
          </Suspense>
        );

      case "auth":
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <AuthScreen
              userType={selectedUserType!}
              onBack={handleBackToPortalSelection}
              onAuthenticated={handleAuthenticated}
            />
          </Suspense>
        );

      case "authenticated":
        return (
          <Suspense fallback={<LoadingSpinner />}>
            {renderAuthenticatedPortal()}
          </Suspense>
        );

      default:
        return (
          <div className="min-h-screen bg-background relative">
            <FloatingElements />
            <Navigation currentPage={currentPage} onPageChange={handlePageChange} />
            <div className="relative z-10">
              <Suspense fallback={<LoadingSpinner />}>
                {renderPublicPages()}
              </Suspense>
            </div>
          </div>
        );
    }
  };

  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, errorInfo) => {
        console.error('Error Boundary caught an error:', error, errorInfo);
      }}
      onReset={() => {
        // Reset any state that might be causing the error
        setAppState("public");
        setCurrentPage("home");
        setSelectedUserType(null);
      }}
    >
      <div className="app-container">
        <NetworkStatus />
        
        <AnimatePresence mode="wait">
          <motion.div
            key={appState}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {renderCurrentView()}
          </motion.div>
        </AnimatePresence>

        <Toaster 
          position="top-right" 
          richColors
          closeButton
          expand={true}
          toastOptions={{
            duration: 4000,
            style: {
              background: 'hsl(var(--background))',
              color: 'hsl(var(--foreground))',
              border: '1px solid hsl(var(--border))',
            },
          }}
        />
      </div>
    </ErrorBoundary>
  );
}