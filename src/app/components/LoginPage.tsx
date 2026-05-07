import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Map, ArrowLeft, Sun, Moon, Eye, EyeOff, Mail, Lock, Loader2, ShieldCheck, User } from 'lucide-react';

interface LoginPageProps {
  onBackClick: () => void;
  onRegisterClick: () => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
}

export default function LoginPage({ onBackClick, onRegisterClick, darkMode, toggleDarkMode }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // --- NEW: Toggle State for Client vs Admin ---
  const [loginType, setLoginType] = useState<'client' | 'admin'>('client');
  
  const { login } = useAuth();
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      // Note: App.tsx will still securely verify their role in the database 
      // to ensure a client can't sneak in by clicking the admin tab!
    } catch (err: any) {
      console.error(err);
      if (
        err.code === 'auth/invalid-credential' || 
        err.code === 'auth/user-not-found' || 
        err.code === 'auth/wrong-password'
      ) {
        setError('Invalid email or password.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Please try again later.');
      } else {
        setError('Failed to sign in. Please check your connection.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden font-sans">
      
      {/* IMMERSIVE BACKGROUND */}
      <div className="absolute inset-0 z-0 bg-slate-950">
        <img 
          src="/assets/bataan-property-survey.jpg" 
          alt="Bataan Survey Background" 
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-slate-950/60" />
        
        {/* Dynamic Orbs based on login type */}
        <div className={`absolute top-1/4 left-1/4 w-96 h-96 rounded-full mix-blend-screen filter blur-[100px] animate-pulse transition-colors duration-700 ${loginType === 'admin' ? 'bg-rose-500/30' : 'bg-blue-500/30'}`} />
        <div className={`absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full mix-blend-screen filter blur-[100px] animate-pulse delay-1000 transition-colors duration-700 ${loginType === 'admin' ? 'bg-orange-500/20' : 'bg-cyan-500/20'}`} />
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

      {/* FROSTED GLASS LOGIN CARD */}
      <div className="relative z-10 w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] text-white transition-all duration-300">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="size-14 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center shadow-inner mb-4 transition-colors">
            {loginType === 'admin' ? (
               <ShieldCheck className="size-7 text-rose-400" />
            ) : (
               <Map className="size-7 text-white" />
            )}
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">SurveySync</h1>
          <p className="text-white/60 text-sm">
            {loginType === 'admin' ? 'Secure Administrator Access' : 'Sign in to manage your survey projects.'}
          </p>
        </div>

        {/* --- THE ROLE TOGGLE --- */}
        <div className="flex p-1 mb-8 bg-black/30 rounded-xl border border-white/10 backdrop-blur-md">
          <button
            type="button"
            onClick={() => setLoginType('client')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
              loginType === 'client' ? 'bg-white text-slate-900 shadow-sm' : 'text-white/60 hover:text-white'
            }`}
          >
            <User className="size-4" /> Client
          </button>
          <button
            type="button"
            onClick={() => setLoginType('admin')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
              loginType === 'admin' ? 'bg-white text-slate-900 shadow-sm' : 'text-white/60 hover:text-white'
            }`}
          >
            <ShieldCheck className="size-4" /> Admin
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium mb-1.5 text-white/90">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-white/50">
                <Mail className="size-5" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all disabled:opacity-50"
                placeholder={loginType === 'admin' ? "admin@surveysync.com" : "name@company.com"}
                required
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium mb-1.5 text-white/90">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-white/50">
                <Lock className="size-5" />
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

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between text-sm pt-1">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input 
                type="checkbox" 
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="size-4 bg-black/20 border-white/20 rounded accent-white focus:ring-white/30 cursor-pointer"
                disabled={isLoading}
              />
              <span className="text-white/70 group-hover:text-white transition-colors">Remember me</span>
            </label>
            <button type="button" className="text-white hover:text-blue-300 transition-colors font-medium hover:underline">
              Forgot password?
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-100 px-4 py-3 rounded-xl text-sm flex items-center gap-2 backdrop-blur-md">
              <span>{error}</span>
            </div>
          )}

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center items-center gap-2 px-6 py-3.5 mt-2 bg-white text-slate-900 rounded-xl hover:bg-white/90 transition-all font-bold disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(255,255,255,0.2)]"
          >
            {isLoading ? (
              <>
                <Loader2 className="size-5 animate-spin" />
                Authenticating...
              </>
            ) : (
              loginType === 'admin' ? 'Access Admin Portal' : 'Sign In as Client'
            )}
          </button>
        </form>

        {/* Registration Link (Hidden for Admins) */}
        {loginType === 'client' && (
          <div className="mt-8 text-center text-sm text-white/60 pt-6 border-t border-white/10">
            Don't have an account?{' '}
            <button 
              onClick={onRegisterClick} 
              className="text-white hover:text-blue-300 font-semibold hover:underline transition-colors" 
              disabled={isLoading}
            >
              Register here
            </button>
          </div>
        )}
      </div>
    </div>
  );
}