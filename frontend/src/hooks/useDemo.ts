import { useContext } from 'react';
import { DemoContext } from '../contexts/DemoContext';

export const useDemo = () => {
  const context = useContext(DemoContext);
  if (context === undefined) {
    throw new Error('useDemo must be used within a DemoProvider');
  }
  return context;
};