import React, { createContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import type { ShishaSession } from '../types/api';
import { generateDemoSessions } from '../utils/demoData';

interface DemoContextType {
  isDemoMode: boolean;
  setDemoMode: (value: boolean) => void;
  demoSessions: ShishaSession[];
}

export const DemoContext = createContext<DemoContextType | undefined>(undefined);

const EMPTY_SESSIONS: ShishaSession[] = [];

export const DemoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [demoSessions, setDemoSessions] = useState<ShishaSession[]>(EMPTY_SESSIONS);
  const location = useLocation();

  useEffect(() => {
    // Check if we're in demo mode from URL
    const path = location.pathname;
    if (path === '/demo' || path.startsWith('/demo/')) {
      setIsDemoMode(true);
      setDemoSessions(generateDemoSessions());
    } else {
      setIsDemoMode(false);
      setDemoSessions(EMPTY_SESSIONS);
    }
  }, [location.pathname]);

  const setDemoMode = (value: boolean) => {
    setIsDemoMode(value);
    if (value) {
      setDemoSessions(generateDemoSessions());
    } else {
      setDemoSessions(EMPTY_SESSIONS);
    }
  };

  return (
    <DemoContext.Provider value={{ isDemoMode, setDemoMode, demoSessions }}>
      {children}
    </DemoContext.Provider>
  );
};

