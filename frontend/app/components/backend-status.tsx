import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export function BackendStatus() {
  const [status, setStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  useEffect(() => {
    const checkBackendHealth = async () => {
      try {
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://100.75.27.125:8080/api/v1';
        const healthUrl = apiBaseUrl.replace('/api/v1', '/health');
        const response = await fetch(healthUrl);
        if (response.ok) {
          setStatus('online');
        } else {
          setStatus('offline');
        }
      } catch {
        setStatus('offline');
      }
    };

    checkBackendHealth();
    const interval = setInterval(checkBackendHealth, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  if (status === 'checking') {
    return (
      <div className="flex items-center space-x-2 text-sm text-gray-500">
        <AlertCircle className="h-4 w-4" />
        <span>Checking backend...</span>
      </div>
    );
  }

  if (status === 'offline') {
    return (
      <div className="flex items-center space-x-2 text-sm text-red-600">
        <XCircle className="h-4 w-4" />
        <span>Backend offline</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2 text-sm text-green-600">
      <CheckCircle className="h-4 w-4" />
      <span>Backend online</span>
    </div>
  );
}