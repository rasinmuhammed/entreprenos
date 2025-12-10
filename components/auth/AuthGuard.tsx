
import React from 'react';
import { useAppStore } from '../../store/appStore';
import { LoginPage } from './LoginPage';
import { Loader2 } from 'lucide-react';

export const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { auth } = useAppStore();

  if (auth.isLoading) {
    return (
      <div className="min-h-screen bg-nebula-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
           <Loader2 className="w-8 h-8 text-tech-cyan animate-spin" />
           <div className="text-xs font-mono text-white/40 uppercase tracking-widest animate-pulse">Authenticating...</div>
        </div>
      </div>
    );
  }

  if (!auth.isAuthenticated) {
    return <LoginPage />;
  }

  return <>{children}</>;
};
