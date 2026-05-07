import { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { fallbackRoleForEmail, isMissingFirestoreDatabase } from '../lib/firebaseErrors';
import { Loader2 } from 'lucide-react';

// Page Components (Ensure these paths match your folder structure)
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import ClientDashboard from './components/ClientDashboard';
import AdminDashboard from './components/AdminDashboard'; 

export default function App() {
  const { currentUser, loading: authLoading } = useAuth();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [roleLoading, setRoleLoading] = useState(true);
  
  // Navigation State
  const [currentView, setCurrentView] = useState<'landing' | 'login' | 'register'>('landing');
  const [darkMode, setDarkMode] = useState(false);

  // Dark Mode Toggle Logic
  const toggleDarkMode = () => setDarkMode(!darkMode);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // ROLE FETCHING LOGIC
  useEffect(() => {
    async function fetchUserRole() {
      // If no user is logged in, reset states
      if (!currentUser) {
        setUserRole(null);
        setRoleLoading(false);
        return;
      }

      setRoleLoading(true);
      try {
        // We look inside the 'users' collection for a document matching the UID
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserRole(data.role || fallbackRoleForEmail(currentUser.email)); // Sets 'admin' or 'client'
        } else {
          // If the UID doesn't exist in Firestore, we default to client
          setUserRole(fallbackRoleForEmail(currentUser.email));
        }
      } catch (error) {
        if (!isMissingFirestoreDatabase(error)) {
          console.error("Error fetching user role:", error);
        }
        setUserRole(fallbackRoleForEmail(currentUser.email)); // Default on error to prevent app crash
      } finally {
        setRoleLoading(false);
      }
    }

    fetchUserRole();
  }, [currentUser]);

  // 1. AUTH LOADING STATE (Firebase checking if a session exists)
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  // 2. UNAUTHENTICATED ROUTING (Not logged in)
  if (!currentUser) {
    if (currentView === 'login') {
      return (
        <LoginPage 
          onBackClick={() => setCurrentView('landing')}
          onRegisterClick={() => setCurrentView('register')} 
          darkMode={darkMode} 
          toggleDarkMode={toggleDarkMode} 
        />
      );
    }
    if (currentView === 'register') {
      return (
        <RegisterPage 
          onBackClick={() => setCurrentView('landing')}
          onLoginClick={() => setCurrentView('login')}
          darkMode={darkMode} 
          toggleDarkMode={toggleDarkMode} 
        />
      );
    }
    // Default to Landing Page
    return (
      <LandingPage 
        onLoginClick={() => setCurrentView('login')}
        onRegisterClick={() => setCurrentView('register')}
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
      />
    );
  }

  // 3. ROLE LOADING STATE (Logged in, but checking database role)
  if (roleLoading) {
    return (
       <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background text-foreground">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse font-medium">Verifying access permissions...</p>
      </div>
    );
  }

  // 4. AUTHENTICATED ROUTING (Logged in and role verified)
  if (userRole === 'admin') {
    return (
      <AdminDashboard 
        onLogout={() => setCurrentView('landing')} 
        darkMode={darkMode} 
        toggleDarkMode={toggleDarkMode} 
      />
    );
  }

  // Fallback to Client Dashboard
  return (
    <ClientDashboard 
      onLogout={() => setCurrentView('landing')} 
      darkMode={darkMode} 
      toggleDarkMode={toggleDarkMode} 
    />
  );
}
