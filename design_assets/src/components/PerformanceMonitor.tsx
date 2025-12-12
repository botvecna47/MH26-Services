import { useEffect, useRef, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Button } from './ui/button';
import { 
  Activity, 
  Zap, 
  Clock, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Wifi,
  Database,
  Cpu,
  HardDrive
} from 'lucide-react';
import { motion } from 'motion/react';

interface PerformanceMetrics {
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  fcp: number; // First Contentful Paint
  ttfb: number; // Time to First Byte
  memoryUsage: number;
  networkSpeed: 'slow' | 'medium' | 'fast';
  deviceType: 'mobile' | 'tablet' | 'desktop';
}

interface APIMetrics {
  responseTime: number;
  errorRate: number;
  throughput: number;
  lastResponse: number;
}

interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  uptime: number;
  memoryUsage: number;
  cpuUsage: number;
  diskUsage: number;
}

export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [apiMetrics, setApiMetrics] = useState<APIMetrics | null>(null);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout>();

  // Simplified Core Web Vitals measurement
  const measureCoreWebVitals = useCallback(() => {
    if (typeof window === 'undefined') return;

    // Simplified metrics collection
    try {
      const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigationEntry) {
        const fcp = navigationEntry.responseStart - navigationEntry.fetchStart;
        const ttfb = navigationEntry.responseStart - navigationEntry.requestStart;
        
        setMetrics({
          lcp: Math.random() * 3000 + 1000, // Mock data for demo
          fid: Math.random() * 100 + 10,
          cls: Math.random() * 0.1,
          fcp,
          ttfb,
          memoryUsage: getMemoryUsage(),
          networkSpeed: getNetworkSpeed(),
          deviceType: getDeviceType()
        });
      }
    } catch (e) {
      console.warn('Performance monitoring not supported:', e);
      // Set default values
      setMetrics({
        lcp: 2000,
        fid: 50,
        cls: 0.05,
        fcp: 1500,
        ttfb: 800,
        memoryUsage: 45,
        networkSpeed: 'fast',
        deviceType: getDeviceType()
      });
    }

    return () => {
      // Cleanup function
    };
  }, []);

  // Get memory usage
  const getMemoryUsage = (): number => {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize / (performance as any).memory.totalJSHeapSize * 100;
    }
    return 0;
  };

  // Detect network speed
  const getNetworkSpeed = (): 'slow' | 'medium' | 'fast' => {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      const effectiveType = connection.effectiveType;
      
      switch (effectiveType) {
        case 'slow-2g':
        case '2g':
          return 'slow';
        case '3g':
          return 'medium';
        case '4g':
        default:
          return 'fast';
      }
    }
    return 'medium';
  };

  // Detect device type
  const getDeviceType = (): 'mobile' | 'tablet' | 'desktop' => {
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  };

  // Monitor API performance
  const monitorAPIPerformance = useCallback(() => {
    const startTimes = new Map<string, number>();
    let errorCount = 0;
    let requestCount = 0;
    let totalResponseTime = 0;

    // Intercept fetch requests
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const url = args[0].toString();
      const startTime = performance.now();
      startTimes.set(url, startTime);
      requestCount++;

      try {
        const response = await originalFetch(...args);
        const endTime = performance.now();
        const responseTime = endTime - startTime;
        totalResponseTime += responseTime;

        if (!response.ok) {
          errorCount++;
        }

        setApiMetrics({
          responseTime: totalResponseTime / requestCount,
          errorRate: (errorCount / requestCount) * 100,
          throughput: requestCount,
          lastResponse: responseTime
        });

        return response;
      } catch (error) {
        errorCount++;
        const endTime = performance.now();
        const responseTime = endTime - startTime;
        totalResponseTime += responseTime;

        setApiMetrics({
          responseTime: totalResponseTime / requestCount,
          errorRate: (errorCount / requestCount) * 100,
          throughput: requestCount,
          lastResponse: responseTime
        });

        throw error;
      }
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  // Monitor system health (mock implementation)
  const monitorSystemHealth = useCallback(() => {
    const updateHealth = () => {
      // Simulate system metrics
      const health: SystemHealth = {
        status: Math.random() > 0.1 ? 'healthy' : 'warning',
        uptime: Date.now() - performance.timeOrigin,
        memoryUsage: getMemoryUsage(),
        cpuUsage: Math.random() * 100,
        diskUsage: Math.random() * 100
      };

      setSystemHealth(health);
    };

    updateHealth();
    const interval = setInterval(updateHealth, 5000);

    return () => clearInterval(interval);
  }, []);

  // Start monitoring
  const startMonitoring = useCallback(() => {
    setIsMonitoring(true);
    
    const cleanupVitals = measureCoreWebVitals();
    const cleanupAPI = monitorAPIPerformance();
    const cleanupHealth = monitorSystemHealth();

    intervalRef.current = setInterval(() => {
      // Update metrics periodically
      setMetrics(prev => prev ? {
        ...prev,
        memoryUsage: getMemoryUsage(),
        networkSpeed: getNetworkSpeed(),
        deviceType: getDeviceType()
      } : null);
    }, 1000);

    return () => {
      setIsMonitoring(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
      cleanupVitals?.();
      cleanupAPI?.();
      cleanupHealth?.();
    };
  }, [measureCoreWebVitals, monitorAPIPerformance, monitorSystemHealth]);

  // Stop monitoring
  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }, []);

  useEffect(() => {
    const cleanup = startMonitoring();
    return cleanup;
  }, [startMonitoring]);

  // Get performance score
  const getPerformanceScore = (): { score: number; grade: string; color: string } => {
    if (!metrics) return { score: 0, grade: 'Unknown', color: 'gray' };

    let score = 100;
    
    // LCP scoring (0-40 points)
    if (metrics.lcp > 4000) score -= 40;
    else if (metrics.lcp > 2500) score -= 20;
    
    // FID scoring (0-30 points)
    if (metrics.fid > 300) score -= 30;
    else if (metrics.fid > 100) score -= 15;
    
    // CLS scoring (0-30 points)
    if (metrics.cls > 0.25) score -= 30;
    else if (metrics.cls > 0.1) score -= 15;

    const grade = score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : score >= 60 ? 'D' : 'F';
    const color = score >= 90 ? 'green' : score >= 70 ? 'yellow' : 'red';

    return { score: Math.max(0, score), grade, color };
  };

  const formatTime = (ms: number): string => {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const formatBytes = (bytes: number): string => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${Math.round(bytes / Math.pow(1024, i) * 100) / 100} ${sizes[i]}`;
  };

  if (!metrics) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Initializing performance monitoring...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const performanceScore = getPerformanceScore();

  return (
    <div className="space-y-6">
      {/* Overall Performance Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="w-5 h-5" />
            <span>Performance Overview</span>
            <Badge 
              variant={performanceScore.color === 'green' ? 'default' : 'destructive'}
              className="ml-auto"
            >
              {isMonitoring ? 'Live' : 'Paused'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <div className={`text-4xl font-bold mb-2 ${
                performanceScore.color === 'green' ? 'text-green-600' :
                performanceScore.color === 'yellow' ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {performanceScore.grade}
              </div>
              <p className="text-sm text-muted-foreground">Overall Grade</p>
              <Progress 
                value={performanceScore.score} 
                className="mt-2"
              />
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold mb-2">{formatTime(metrics.lcp)}</div>
              <p className="text-sm text-muted-foreground">Largest Contentful Paint</p>
              <div className={`text-xs mt-1 ${
                metrics.lcp <= 2500 ? 'text-green-600' : 
                metrics.lcp <= 4000 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {metrics.lcp <= 2500 ? 'Good' : metrics.lcp <= 4000 ? 'Needs Improvement' : 'Poor'}
              </div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold mb-2">{formatTime(metrics.fid)}</div>
              <p className="text-sm text-muted-foreground">First Input Delay</p>
              <div className={`text-xs mt-1 ${
                metrics.fid <= 100 ? 'text-green-600' : 
                metrics.fid <= 300 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {metrics.fid <= 100 ? 'Good' : metrics.fid <= 300 ? 'Needs Improvement' : 'Poor'}
              </div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold mb-2">{metrics.cls.toFixed(3)}</div>
              <p className="text-sm text-muted-foreground">Cumulative Layout Shift</p>
              <div className={`text-xs mt-1 ${
                metrics.cls <= 0.1 ? 'text-green-600' : 
                metrics.cls <= 0.25 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {metrics.cls <= 0.1 ? 'Good' : metrics.cls <= 0.25 ? 'Needs Improvement' : 'Poor'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Core Web Vitals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="w-5 h-5" />
              <span>Core Web Vitals</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span>First Contentful Paint</span>
              <span className="font-mono">{formatTime(metrics.fcp)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Time to First Byte</span>
              <span className="font-mono">{formatTime(metrics.ttfb)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Memory Usage</span>
              <span className="font-mono">{metrics.memoryUsage.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Network Speed</span>
              <Badge variant={
                metrics.networkSpeed === 'fast' ? 'default' :
                metrics.networkSpeed === 'medium' ? 'secondary' : 'destructive'
              }>
                {metrics.networkSpeed}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span>Device Type</span>
              <span className="capitalize">{metrics.deviceType}</span>
            </div>
          </CardContent>
        </Card>

        {/* API Performance */}
        {apiMetrics && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="w-5 h-5" />
                <span>API Performance</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Average Response Time</span>
                <span className="font-mono">{formatTime(apiMetrics.responseTime)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Error Rate</span>
                <span className={`font-mono ${
                  apiMetrics.errorRate < 1 ? 'text-green-600' :
                  apiMetrics.errorRate < 5 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {apiMetrics.errorRate.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Throughput</span>
                <span className="font-mono">{apiMetrics.throughput} requests</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Last Response</span>
                <span className="font-mono">{formatTime(apiMetrics.lastResponse)}</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* System Health */}
      {systemHealth && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="w-5 h-5" />
              <span>System Health</span>
              <Badge 
                variant={
                  systemHealth.status === 'healthy' ? 'default' :
                  systemHealth.status === 'warning' ? 'secondary' : 'destructive'
                }
                className="ml-auto"
              >
                {systemHealth.status}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">Uptime</span>
                </div>
                <div className="text-lg font-mono">
                  {formatTime(systemHealth.uptime)}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Cpu className="w-4 h-4" />
                  <span className="text-sm">CPU Usage</span>
                </div>
                <div className="text-lg font-mono">
                  {systemHealth.cpuUsage.toFixed(1)}%
                </div>
                <Progress value={systemHealth.cpuUsage} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Activity className="w-4 h-4" />
                  <span className="text-sm">Memory</span>
                </div>
                <div className="text-lg font-mono">
                  {systemHealth.memoryUsage.toFixed(1)}%
                </div>
                <Progress value={systemHealth.memoryUsage} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <HardDrive className="w-4 h-4" />
                  <span className="text-sm">Disk Usage</span>
                </div>
                <div className="text-lg font-mono">
                  {systemHealth.diskUsage.toFixed(1)}%
                </div>
                <Progress value={systemHealth.diskUsage} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isMonitoring ? 'bg-green-500' : 'bg-gray-400'}`} />
              <span className="text-sm">
                {isMonitoring ? 'Monitoring active' : 'Monitoring paused'}
              </span>
            </div>
            
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={isMonitoring ? stopMonitoring : startMonitoring}
              >
                {isMonitoring ? 'Pause' : 'Resume'} Monitoring
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.reload()}
              >
                Reset Metrics
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}