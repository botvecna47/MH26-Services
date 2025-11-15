import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App.tsx";
import { ErrorBoundary } from "./components/ErrorBoundary";
import "./index.css";

// Create a client for React Query with error handling
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnMount: false, // Don't refetch on mount if data is fresh
      refetchOnReconnect: false, // Don't refetch on reconnect
      retry: (failureCount, error: any) => {
        // Don't retry on 429 (Too Many Requests) errors
        if (error?.response?.status === 429) {
          return false;
        }
        // Only retry once for other errors
        return failureCount < 1;
      },
      staleTime: 5 * 60 * 1000, // 5 minutes default
      retryDelay: (attemptIndex, error: any) => {
        // If 429 error, wait longer before retry
        if (error?.response?.status === 429) {
          return 30000; // Wait 30 seconds for rate limit
        }
        return Math.min(5000 * (attemptIndex + 1), 30000); // Exponential backoff, max 30s
      },
      onError: (error: any) => {
        // Silently handle query errors to prevent blank pages
        if (error?.response?.status === 429) {
          console.warn('Rate limited, will retry later');
        } else {
          console.error('Query error:', error);
        }
      },
    },
    mutations: {
      retry: 0, // Don't retry mutations
      onError: (error: any) => {
        // Silently handle mutation errors
        if (error?.response?.status === 429) {
          console.warn('Rate limited on mutation');
        } else {
          console.error('Mutation error:', error);
        }
      },
    },
  },
});

// Wrap everything in ErrorBoundary to prevent blank pages
const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

// Render with error handling
try {
  createRoot(rootElement).render(
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </ErrorBoundary>
  );
} catch (error) {
  // If rendering fails, show a basic error message
  rootElement.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 20px; text-align: center; font-family: system-ui;">
      <div>
        <h1 style="font-size: 24px; margin-bottom: 16px;">Application Error</h1>
        <p style="color: #666; margin-bottom: 24px;">Something went wrong while loading the application.</p>
        <button onclick="window.location.reload()" style="padding: 12px 24px; background: #ff6b35; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 16px;">
          Reload Page
        </button>
        ${process.env.NODE_ENV === 'development' ? `<pre style="margin-top: 24px; padding: 16px; background: #f5f5f5; border-radius: 4px; text-align: left; overflow: auto;">${error}</pre>` : ''}
      </div>
    </div>
  `;
  console.error('Failed to render app:', error);
}
