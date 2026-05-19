import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

const NavigationContext = createContext(null);

function readPathname() {
  const { pathname } = window.location;
  if (pathname === '/login' || pathname.startsWith('/login/')) return '/login';
  return pathname || '/';
}

export function NavigationProvider({ children }) {
  const [path, setPath] = useState(readPathname);

  useEffect(() => {
    const sync = () => setPath(readPathname());
    window.addEventListener('popstate', sync);
    return () => window.removeEventListener('popstate', sync);
  }, []);

  const navigate = useCallback((to) => {
    const next = to.split('?')[0] || '/';
    if (next !== window.location.pathname) {
      window.history.pushState(null, '', to);
    }
    setPath(readPathname());
  }, []);

  const value = useMemo(() => ({ path, navigate }), [path, navigate]);

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const ctx = useContext(NavigationContext);
  if (!ctx) {
    throw new Error('useNavigation must be used within NavigationProvider');
  }
  return ctx;
}

/**
 * Same idea as react-router-dom Link: client-side navigation without full reload.
 */
export function AppLink({ to, children, onClick, ...rest }) {
  const { navigate } = useNavigation();
  return (
    <a
      href={to}
      onClick={(e) => {
        e.preventDefault();
        onClick?.(e);
        navigate(to);
      }}
      {...rest}
    >
      {children}
    </a>
  );
}
