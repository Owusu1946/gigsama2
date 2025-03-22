'use client';

import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

// Define user type
interface User {
  id: string;
  name: string;
  email: string;
}

// Define auth context type
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

// Create auth context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  error: null,
  login: async () => {},
  signup: async () => {},
  logout: async () => {},
  refreshUser: async () => {}
});

// Custom hook to use auth context
export const useAuth = () => useContext(AuthContext);

// Utility function to clear cookies from the client side
function clearAllCookies() {
  try {
    // Get all cookies and clear them
    const cookies = document.cookie.split(';');
    
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i];
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
      
      // Skip clearing certain non-auth cookies if needed
      if (['theme', 'language', 'preferences'].includes(name)) {
        continue;
      }
      
      // Set cookie expiration to a past date to clear it
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`;
      console.log(`[AuthContext] Cleared client-side cookie: ${name}`);
    }
  } catch (e) {
    console.warn('[AuthContext] Error clearing cookies:', e);
  }
}

// Auth provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Function to load user data
  const loadUser = async () => {
    try {
      setIsLoading(true);
      console.log('[AuthContext] Fetching current user...');
      
      const response = await fetch('/api/auth/user', {
        // Add cache: 'no-store' to prevent caching of the user request
        cache: 'no-store',
        credentials: 'include' // Ensure cookies are sent with the request
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('[AuthContext] User data loaded:', data.user);
        setUser(data.user);
      } else {
        console.log('[AuthContext] No authenticated user found');
        // User is not authenticated
        setUser(null);
      }
    } catch (error) {
      console.error('[AuthContext] Error loading user:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh user method to manually trigger a reload of user data
  const refreshUser = async () => {
    // If we're already loading, don't trigger another refresh
    if (isLoading) {
      console.log('[AuthContext] Skipping refresh, already loading');
      return;
    }
    
    try {
      setIsLoading(true);
      console.log('[AuthContext] Manual refresh of user data');
      
      const response = await fetch('/api/auth/user', {
        cache: 'no-store',
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('[AuthContext] User data refreshed:', data.user);
        setUser(data.user);
      } else {
        // If we get a 401, the user is not authenticated
        if (response.status === 401) {
          console.log('[AuthContext] User not authenticated during refresh');
          setUser(null);
        }
      }
    } catch (error) {
      console.error('[AuthContext] Error refreshing user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch current user on initial load
  useEffect(() => {
    let isMounted = true;
    
    async function initLoadUser() {
      try {
        setIsLoading(true);
        console.log('[AuthContext] Initial fetch of current user...');
        
        const response = await fetch('/api/auth/user', {
          cache: 'no-store',
          credentials: 'include'
        });
        
        if (!isMounted) return;
        
        if (response.ok) {
          const data = await response.json();
          console.log('[AuthContext] Initial user data loaded:', data.user);
          setUser(data.user);
        } else {
          console.log('[AuthContext] No authenticated user found initially');
          setUser(null);
        }
      } catch (error) {
        if (!isMounted) return;
        console.error('[AuthContext] Error loading user initially:', error);
        setUser(null);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }
    
    initLoadUser();
    
    return () => {
      isMounted = false;
    };
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }
      
      setUser(data.user);
      router.push('/');
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Signup function
  const signup = async (name: string, email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, password })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Signup failed');
      }
      
      setUser(data.user);
      router.push('/');
    } catch (error: any) {
      console.error('Signup error:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('[AuthContext] Starting logout process');
      
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include' // Ensure cookies are sent
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Logout failed');
      }
      
      // Clear client-side state
      setUser(null);
      
      // Clear cookies on the client side as a backup
      clearAllCookies();
      
      // Clear any local storage items related to authentication
      try {
        // Remove any auth-related items from localStorage
        ['auth', 'user', 'token', 'refresh-token'].forEach(key => {
          if (localStorage.getItem(key)) {
            console.log(`[AuthContext] Removing ${key} from localStorage`);
            localStorage.removeItem(key);
          }
        });
      } catch (e) {
        console.warn('[AuthContext] Could not access localStorage:', e);
      }
      
      console.log('[AuthContext] Logout successful, redirecting to login page');
      router.push('/login');
    } catch (error: any) {
      console.error('[AuthContext] Logout error:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Provide auth context
  return (
    <AuthContext.Provider value={{ user, isLoading, error, login, signup, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
} 