import { useState } from "react";
import { Navigation } from "./components/Navigation";
import { Homepage } from "./components/Homepage";
import { ServiceListings } from "./components/ServiceListings";
import { ProviderDetail } from "./components/ProviderDetail";
import { About } from "./components/About";
import { ForProviders } from "./components/ForProviders";
import { PortalSelection } from "./components/PortalSelection";
import { AuthScreen } from "./components/AuthScreen";
import { CustomerPortal } from "./components/CustomerPortal";
import { ProviderPortal } from "./components/ProviderPortal";
import { AdminDashboard } from "./components/AdminDashboard";
import { FloatingElements } from "./components/FloatingElements";
import { Toaster } from "./components/ui/sonner";

type UserType = 'customer' | 'provider' | 'admin' | null;
type AppState = 'public' | 'portal-selection' | 'auth' | 'authenticated';

export default function App() {
  const [appState, setAppState] = useState<AppState>("public");
  const [currentPage, setCurrentPage] = useState("home");
  const [selectedUserType, setSelectedUserType] = useState<UserType>(null);
  const [userData, setUserData] = useState<any>(null);

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

  const handleAuthenticated = (user: any) => {
    setUserData(user);
    setAppState("authenticated");
  };

  const handleLogout = () => {
    setUserData(null);
    setSelectedUserType(null);
    setAppState("public");
    setCurrentPage("home");
  };

  const renderPublicPages = () => {
    const pageProps = { onPageChange: handlePageChange };
    
    switch (currentPage) {
      case "home":
        return <Homepage {...pageProps} />;
      case "services":
        return <ServiceListings {...pageProps} />;
      case "provider-detail":
        return <ProviderDetail {...pageProps} />;
      case "about":
        return <About {...pageProps} />;
      case "providers":
        return <ForProviders {...pageProps} />;
      default:
        return <Homepage {...pageProps} />;
    }
  };

  const renderAuthenticatedPortal = () => {
    switch (userData?.userType) {
      case "customer":
        return <CustomerPortal userData={userData} onLogout={handleLogout} />;
      case "provider":
        return <ProviderPortal userData={userData} onLogout={handleLogout} />;
      case "admin":
        return <AdminDashboard userData={userData} onLogout={handleLogout} />;
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
              {renderPublicPages()}
            </div>
          </div>
        );

      case "portal-selection":
        return <PortalSelection onSelectPortal={handlePortalSelection} />;

      case "auth":
        return (
          <AuthScreen
            userType={selectedUserType!}
            onBack={handleBackToPortalSelection}
            onAuthenticated={handleAuthenticated}
          />
        );

      case "authenticated":
        return renderAuthenticatedPortal();

      default:
        return (
          <div className="min-h-screen bg-background relative">
            <FloatingElements />
            <Navigation currentPage={currentPage} onPageChange={handlePageChange} />
            <div className="relative z-10">
              {renderPublicPages()}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="app-container">
      {renderCurrentView()}
      <Toaster position="top-right" richColors />
    </div>
  );
}