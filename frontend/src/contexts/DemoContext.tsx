import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import type { ShishaSession } from '../types/api';
import { generateDemoSessions } from '../utils/demoData';

interface DemoContextType {
  isDemoMode: boolean;
  setDemoMode: (value: boolean) => void;
  demoSessions: ShishaSession[];
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

export const DemoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [demoSessions, setDemoSessions] = useState<ShishaSession[]>([]);
  const location = useLocation();

  useEffect(() => {
    // Check if we're in demo mode from URL
    const path = location.pathname;
    if (path === '/demo' || path.startsWith('/demo/')) {
      setIsDemoMode(true);
      setDemoSessions(generateDemoSessions());
    } else {
      setIsDemoMode(false);
      setDemoSessions([]);
    }
  }, [location]);

  const setDemoMode = (value: boolean) => {
    setIsDemoMode(value);
    if (value) {
      setDemoSessions(generateDemoSessions());
    } else {
      setDemoSessions([]);
    }
  };

  return (
    <DemoContext.Provider value={{ isDemoMode, setDemoMode, demoSessions }}>
      {children}
    </DemoContext.Provider>
  );
};

export const useDemo = () => {
  const context = useContext(DemoContext);
  if (context === undefined) {
    throw new Error('useDemo must be used within a DemoProvider');
  }
  return context;
};