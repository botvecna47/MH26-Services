import { useState, useCallback, useRef, useEffect } from 'react';
import { toast } from 'sonner@2.0.3';

export interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  success: boolean;
}

export interface UseApiOptions {
  showErrorToast?: boolean;
  showSuccessToast?: boolean;
  successMessage?: string;
  retryAttempts?: number;
  retryDelay?: number;
  timeout?: number;
}

export function useApi<T = any>(
  apiFunction: (...args: any[]) => Promise<{ success: boolean; data?: T; error?: string; message?: string }>,
  options: UseApiOptions = {}
) {
  const {
    showErrorToast = true,
    showSuccessToast = false,
    successMessage,
    retryAttempts = 0,
    retryDelay = 1000,
    timeout = 30000
  } = options;

  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
    success: false
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const retryCountRef = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const execute = useCallback(async (...args: any[]) => {
    // Cancel any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setState(prev => ({
      ...prev,
      loading: true,
      error: null,
      success: false
    }));

    const executeRequest = async (attempt: number = 0): Promise<void> => {
      try {
        abortControllerRef.current = new AbortController();
        
        // Set timeout
        timeoutRef.current = setTimeout(() => {
          if (abortControllerRef.current) {
            abortControllerRef.current.abort();
          }
        }, timeout);

        const response = await apiFunction(...args);

        // Clear timeout on success
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }

        if (response.success) {
          setState({
            data: response.data || null,
            loading: false,
            error: null,
            success: true
          });

          if (showSuccessToast) {
            toast.success(successMessage || response.message || 'Operation completed successfully');
          }

          retryCountRef.current = 0;
        } else {
          throw new Error(response.error || 'Operation failed');
        }
      } catch (error: any) {
        // Clear timeout on error
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }

        // Check if request was aborted
        if (error.name === 'AbortError') {
          return;
        }

        const errorMessage = error.message || 'An unexpected error occurred';

        // Retry logic
        if (attempt < retryAttempts) {
          retryCountRef.current = attempt + 1;
          
          toast.info(`Request failed, retrying... (${attempt + 1}/${retryAttempts})`);
          
          setTimeout(() => {
            executeRequest(attempt + 1);
          }, retryDelay * Math.pow(2, attempt)); // Exponential backoff
          
          return;
        }

        setState({
          data: null,
          loading: false,
          error: errorMessage,
          success: false
        });

        if (showErrorToast) {
          toast.error(errorMessage);
        }

        retryCountRef.current = 0;
      }
    };

    return executeRequest();
  }, [apiFunction, showErrorToast, showSuccessToast, successMessage, retryAttempts, retryDelay, timeout]);

  const reset = useCallback(() => {
    // Cancel any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Clear timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    setState({
      data: null,
      loading: false,
      error: null,
      success: false
    });

    retryCountRef.current = 0;
  }, []);

  const retry = useCallback(() => {
    if (retryCountRef.current < retryAttempts) {
      execute();
    }
  }, [execute, retryAttempts]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    ...state,
    execute,
    reset,
    retry,
    isRetrying: retryCountRef.current > 0,
    retryCount: retryCountRef.current
  };
}

// Hook for handling form submissions with validation
export function useFormApi<T = any>(
  apiFunction: (...args: any[]) => Promise<{ success: boolean; data?: T; error?: string; errors?: Record<string, string[]> }>,
  options: UseApiOptions & {
    onSuccess?: (data: T) => void;
    onError?: (error: string, errors?: Record<string, string[]>) => void;
  } = {}
) {
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  
  const {
    onSuccess,
    onError,
    ...apiOptions
  } = options;

  const api = useApi(apiFunction, apiOptions);

  const submit = useCallback(async (...args: any[]) => {
    // Clear previous field errors
    setFieldErrors({});

    try {
      await api.execute(...args);
      
      if (api.success && api.data && onSuccess) {
        onSuccess(api.data);
      }
    } catch (error: any) {
      // Handle validation errors
      if (error.errors) {
        setFieldErrors(error.errors);
      }
      
      if (onError) {
        onError(error.message || 'Submission failed', error.errors);
      }
    }
  }, [api, onSuccess, onError]);

  const getFieldError = useCallback((fieldName: string): string | undefined => {
    const errors = fieldErrors[fieldName];
    return errors && errors.length > 0 ? errors[0] : undefined;
  }, [fieldErrors]);

  const clearFieldError = useCallback((fieldName: string) => {
    setFieldErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  }, []);

  return {
    ...api,
    submit,
    fieldErrors,
    getFieldError,
    clearFieldError,
    hasFieldErrors: Object.keys(fieldErrors).length > 0
  };
}

// Hook for data fetching with caching
export function useApiData<T = any>(
  apiFunction: () => Promise<{ success: boolean; data?: T; error?: string }>,
  options: {
    immediate?: boolean;
    cacheKey?: string;
    cacheTimeout?: number;
    refreshInterval?: number;
  } & UseApiOptions = {}
) {
  const {
    immediate = true,
    cacheKey,
    cacheTimeout = 5 * 60 * 1000, // 5 minutes
    refreshInterval,
    ...apiOptions
  } = options;

  const api = useApi(apiFunction, apiOptions);
  const cacheRef = useRef<{ data: T; timestamp: number } | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchData = useCallback(async (forceRefresh = false) => {
    // Check cache if not forcing refresh
    if (!forceRefresh && cacheKey && cacheRef.current) {
      const { data, timestamp } = cacheRef.current;
      const isExpired = Date.now() - timestamp > cacheTimeout;
      
      if (!isExpired) {
        // Return cached data
        return { data };
      }
    }

    // Fetch fresh data
    await api.execute();
    
    // Cache the data
    if (api.success && api.data && cacheKey) {
      cacheRef.current = {
        data: api.data,
        timestamp: Date.now()
      };
    }
  }, [api, cacheKey, cacheTimeout]);

  // Auto-refresh setup
  useEffect(() => {
    if (refreshInterval && refreshInterval > 0) {
      intervalRef.current = setInterval(() => {
        fetchData(true);
      }, refreshInterval);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [fetchData, refreshInterval]);

  // Initial fetch
  useEffect(() => {
    if (immediate) {
      fetchData();
    }
  }, [immediate, fetchData]);

  const refresh = useCallback(() => fetchData(true), [fetchData]);

  const clearCache = useCallback(() => {
    if (cacheKey) {
      cacheRef.current = null;
    }
  }, [cacheKey]);

  return {
    ...api,
    refresh,
    clearCache,
    isCached: cacheKey ? !!cacheRef.current : false
  };
}

// Hook for infinite scroll/pagination
export function useInfiniteApi<T = any>(
  apiFunction: (page: number, ...args: any[]) => Promise<{
    success: boolean;
    data?: { data: T[]; hasMore: boolean; total?: number };
    error?: string;
  }>,
  options: UseApiOptions & {
    pageSize?: number;
    initialPage?: number;
  } = {}
) {
  const { pageSize = 10, initialPage = 1, ...apiOptions } = options;
  
  const [allData, setAllData] = useState<T[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [total, setTotal] = useState<number | undefined>(undefined);

  const api = useApi(apiFunction, apiOptions);

  const loadMore = useCallback(async (...args: any[]) => {
    if (api.loading || !hasMore) return;

    await api.execute(currentPage, ...args);

    if (api.success && api.data) {
      setAllData(prev => [...prev, ...api.data!.data]);
      setHasMore(api.data.hasMore);
      setTotal(api.data.total);
      setCurrentPage(prev => prev + 1);
    }
  }, [api, currentPage, hasMore]);

  const reset = useCallback(() => {
    setAllData([]);
    setHasMore(true);
    setCurrentPage(initialPage);
    setTotal(undefined);
    api.reset();
  }, [api, initialPage]);

  const refresh = useCallback(async (...args: any[]) => {
    setAllData([]);
    setHasMore(true);
    setCurrentPage(initialPage);
    setTotal(undefined);
    
    await api.execute(initialPage, ...args);

    if (api.success && api.data) {
      setAllData(api.data.data);
      setHasMore(api.data.hasMore);
      setTotal(api.data.total);
      setCurrentPage(initialPage + 1);
    }
  }, [api, initialPage]);

  return {
    data: allData,
    loading: api.loading,
    error: api.error,
    success: api.success,
    hasMore,
    total,
    currentPage: currentPage - 1, // Return 0-indexed page
    loadMore,
    reset,
    refresh
  };
}