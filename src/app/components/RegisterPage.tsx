import { useState } from 'react';
import { ArrowLeft, Map, Moon, Sun, Eye, EyeOff, Loader2, User, Mail, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { isMissingFirestoreDatabase } from '../../lib/firebaseErrors';

interface RegisterPageProps {
  onBackClick: () => void;
  onLoginClick: () => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
}

export default function RegisterPage({ onBackClick, onLoginClick, darkMode, toggleDarkMode }: RegisterPageProps) {
  // Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // UI State
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { signup } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      return setError('Passwords do not match.');
    }
    if (password.length < 6) {
      return setError('Password must be at least 6 characters.');
    }

    setIsLoading(true);

    try {
      const userCredential = await signup(email, password);
      const user = userCredential.user;

      try {
        await setDoc(doc(db, 'users', user.uid), {
          firstName,
          lastName,
          email,
          role: 'client',
          createdAt: new Date().toISOString()
        });
      } catch (profileError) {
        if (!isMissingFirestoreDatabase(profileError)) {
          throw profileError;
        }
      }

    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please log in.');
      } else {
        setError('Failed to create account. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden font-sans">
      
      {/* 1. IMMERSIVE BACKGROUND */}
      <div className="absolute inset-0 z-0 bg-slate-950">
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-80"
          style={{
            backgroundImage:
              'linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(14, 116, 144, 0.55)), radial-gradient(circle at 35% 30%, rgba(255, 255, 255, 0.18), transparent 28%), repeating-linear-gradient(115deg, rgba(255,255,255,0.12) 0 1px, transparent 1px 34px)',
          }}
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-slate-950/60" />
        
        {/* Abstract glowing orbs */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-purple-500/30 rounded-full mix-blend-screen filter blur-[100px] animate-pulse" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full mix-blend-screen filter blur-[100px] animate-pulse delay-1000" />
      </div>

      {/* Top Controls */}
      <div className="absolute top-6 right-6 z-20 flex items-center gap-4 text-white">
        <button 
          onClick={onBackClick}
          className="flex items-center gap-1.5 text-sm text-white/70 hover:text-white transition-colors group disabled:opacity-50"
          disabled={isLoading}
        >
          <ArrowLeft className="size-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Home</span>
        </button>
        <button onClick={toggleDarkMode} className="p-2 rounded-full hover:bg-white/10 transition-colors">
          {darkMode ? <Sun className="size-5" /> : <Moon className="size-5" />}
        </button>
      </div>

      {/* 2. FROSTED GLASS REGISTER CARD */}
      {/* Note: Using max-w-lg here instead of max-w-md to comfortably fit the side-by-side name fields */}
      <div className="relative z-10 w-full max-w-lg bg-white/10 backdrop-blur-xl border border-white/20 p-8 sm:p-10 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] text-white mt-12 mb-12">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="size-14 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center shadow-inner mb-4">
            <Map className="size-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Create Account</h1>
          <p className="text-white/60 text-sm">Join SurveySync as a client.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Name Fields (Side by Side) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5 text-white/90">First Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-white/50">
                  <User className="size-4" />
                </div>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all disabled:opacity-50"
                  placeholder="Juan"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-white/90">Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all disabled:opacity-50"
                placeholder="Dela Cruz"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-sm font-medium mb-1.5 text-white/90">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-white/50">
                <Mail className="size-4" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all disabled:opacity-50"
                placeholder="juan@example.com"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium mb-1.5 text-white/90">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-white/50">
                <Lock className="size-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all disabled:opacity-50"
                placeholder="••••••••"
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors p-1"
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium mb-1.5 text-white/90">Confirm Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-white/50">
                <Lock className="size-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all disabled:opacity-50"
                placeholder="••••••••"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-100 px-4 py-3 rounded-xl text-sm flex items-center gap-2 backdrop-blur-md">
              <span>{error}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center items-center gap-2 px-6 py-3.5 mt-6 bg-white text-slate-900 rounded-xl hover:bg-white/90 transition-all font-bold disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(255,255,255,0.2)]"
          >
            {isLoading ? (
              <>
                <Loader2 className="size-5 animate-spin" />
                Creating Account...
              </>
            ) : (
              'Register Account'
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="mt-8 text-center text-sm text-white/60 pt-6 border-t border-white/10">
          Already have an account?{' '}
          <button 
            onClick={onLoginClick} 
            className="text-white hover:text-blue-300 font-semibold hover:underline transition-colors" 
            disabled={isLoading}
          >
            Sign in here
          </button>
        </div>
      </div>
    </div>
  );
}
