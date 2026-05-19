import React, { useEffect } from 'react';
import { useNavigation } from './context/NavigationContext.jsx';
import { useAuth } from './context/AuthContext.jsx';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';

function AuthGateLoading() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
      <div
        className="w-10 h-10 rounded-full border-2 border-primary/25 border-t-primary animate-spin"
        aria-hidden
      />
      <p className="font-mono text-sm text-primary/70 tracking-widest uppercase">
        Initializing
      </p>
    </div>
  );
}

function App() {
  const { path, navigate } = useNavigation();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (user && path === '/login') {
      navigate('/');
      return;
    }

    if (!user && path !== '/login') {
      navigate('/login');
    }
  }, [loading, user, path, navigate]);

  if (loading) {
    return <AuthGateLoading />;
  }

  if (!user) {
    if (path !== '/login') {
      return <AuthGateLoading />;
    }
    return <AuthPage />;
  }

  if (path === '/login') {
    return <AuthGateLoading />;
  }

  return <HomePage />;
}

export default App;
