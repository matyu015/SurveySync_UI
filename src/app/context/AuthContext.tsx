import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User 
} from 'firebase/auth';
import { auth } from '../../lib/firebase';

// Define the shape of our context so TypeScript knows exactly what functions and data are available
interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<any>;
  signup: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  loading: boolean;
}

// Create the context
const AuthContext = createContext<AuthContextType>({} as AuthContextType);

// Custom hook to use the auth context easily in any component
export function useAuth() {
  return useContext(AuthContext);
}

// The provider component that wraps your app
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Firebase Authentication Methods
  function login(email: string, password: string) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  function signup(email: string, password: string) {
    return createUserWithEmailAndPassword(auth, email, password);
  }

  function logout() {
    return signOut(auth);
  }

  // Listen for changes to the user's auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false); // Stop loading once Firebase tells us the user's status
    });

    // Cleanup subscription on unmount
    return unsubscribe;
  }, []);

  // The value object containing everything we want to make accessible to the rest of the app
  const value = {
    currentUser,
    login,
    signup,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {/* Only render the children (the rest of your app) once we know the auth status */}
      {!loading && children}
    </AuthContext.Provider>
  );
}