import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Map, ArrowLeft, Sun, Moon, Eye, EyeOff, Mail, Lock, Loader2, X } from 'lucide-react';

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

  // Terms and Privacy State
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!agreeToTerms) {
      return setError('You must agree to the Terms and Conditions and Data Privacy Policy.');
    }

    setIsLoading(true);

    try {
      await login(email, password);
      // Note: App.tsx automatically routes the user based on @surveysync.com domain!
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
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-80"
          style={{
            backgroundImage:
              'linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(14, 116, 144, 0.55)), radial-gradient(circle at 35% 30%, rgba(255, 255, 255, 0.18), transparent 28%), repeating-linear-gradient(115deg, rgba(255,255,255,0.12) 0 1px, transparent 1px 34px)',
          }}
        />
        <div className="absolute inset-0 bg-slate-950/60" />
        
        {/* Unified Dynamic Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full mix-blend-screen filter blur-[100px] animate-pulse transition-colors duration-700 bg-blue-500/30" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full mix-blend-screen filter blur-[100px] animate-pulse delay-1000 transition-colors duration-700 bg-cyan-500/20" />
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
        <div className="flex flex-col items-center text-center mb-8">
          <div className="size-14 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center shadow-inner mb-4 transition-colors">
             <Map className="size-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">SurveySync</h1>
          <p className="text-white/60 text-sm">
            Sign in to access your portal
          </p>
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
                placeholder="name@example.com"
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

          {/* Terms and Privacy Checkbox */}
          <div className="flex items-start gap-3 mt-6 mb-2">
            <div className="flex items-center h-5 mt-0.5">
              <input
                id="terms"
                type="checkbox"
                required
                checked={agreeToTerms}
                onChange={(e) => setAgreeToTerms(e.target.checked)}
                className="size-4 rounded bg-black/20 border-white/20 text-blue-500 focus:ring-blue-500/50 cursor-pointer accent-blue-500"
                disabled={isLoading}
              />
            </div>
            <label htmlFor="terms" className="text-sm text-white/70 leading-snug">
              I agree to SurveySync's{' '}
              <button type="button" onClick={() => setShowTermsModal(true)} className="text-white hover:text-blue-300 font-medium underline transition-colors">Terms and Conditions</button>
              {' '}and acknowledge the{' '}
              <button type="button" onClick={() => setShowPrivacyModal(true)} className="text-white hover:text-blue-300 font-medium underline transition-colors">Data Privacy Policy</button>.
            </label>
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
            disabled={isLoading || !agreeToTerms}
            className="w-full flex justify-center items-center gap-2 px-6 py-3.5 mt-2 bg-white text-slate-900 rounded-xl hover:bg-white/90 transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(255,255,255,0.2)]"
          >
            {isLoading ? (
              <>
                <Loader2 className="size-5 animate-spin" />
                Authenticating...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Registration Link */}
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
      </div>

      {/* TERMS AND CONDITIONS MODAL */}
      {showTermsModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[80vh] text-slate-900 dark:text-white">
            <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
              <h2 className="text-xl font-bold">Terms and Conditions</h2>
              <button onClick={() => setShowTermsModal(false)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors"><X className="size-5" /></button>
            </div>
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-sm text-slate-600 dark:text-slate-300">
              <p>Welcome to SurveySync. By using our platform, you agree to the following terms:</p>
              <h4 className="font-bold text-slate-900 dark:text-white text-base mt-6">1. Service Description</h4>
              <p>SurveySync provides a platform to request, track, and manage geodetic surveying services. Timelines provided are estimates and may vary based on field conditions, weather, and government processing.</p>
              <h4 className="font-bold text-slate-900 dark:text-white text-base mt-6">2. Payment Terms</h4>
              <p>All requested surveys require either a full payment or a minimum 50% downpayment prior to field execution. Payments processed via third-party gateways (e.g., GCash, PayMongo) are subject to their respective terms and service fees.</p>
              <h4 className="font-bold text-slate-900 dark:text-white text-base mt-6">3. Client Responsibilities</h4>
              <p>You agree to provide accurate and complete property documents. SurveySync and its affiliated geodetic engineers are not liable for legal disputes arising from forged, expired, or inaccurate documents submitted by the client.</p>
              <h4 className="font-bold text-slate-900 dark:text-white text-base mt-6">4. Cancellations</h4>
              <p>Cancellations made after field deployment or document processing has begun may be subject to mobilization fees, which will be deducted from the initial deposit.</p>
            </div>
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-end bg-slate-50 dark:bg-slate-900/50">
              <button onClick={() => setShowTermsModal(false)} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors shadow-sm">I Understand</button>
            </div>
          </div>
        </div>
      )}

      {/* DATA PRIVACY MODAL */}
      {showPrivacyModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[80vh] text-slate-900 dark:text-white">
            <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
              <h2 className="text-xl font-bold">Data Privacy Policy</h2>
              <button onClick={() => setShowPrivacyModal(false)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors"><X className="size-5" /></button>
            </div>
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-sm text-slate-600 dark:text-slate-300">
              <p>In compliance with the <strong>Data Privacy Act of 2012 (Republic Act No. 10173)</strong>, SurveySync is committed to protecting your personal information.</p>
              <h4 className="font-bold text-slate-900 dark:text-white text-base mt-6">Information Collection</h4>
              <p>We collect personal information including your name, email address, contact number, and property details (Lot/Block numbers, exact addresses, and uploaded titles/documents) necessary for geodetic surveying procedures.</p>
              <h4 className="font-bold text-slate-900 dark:text-white text-base mt-6">Use of Information</h4>
              <p>Your data is strictly used to:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Process and schedule your survey requests.</li>
                <li>Communicate field updates and payment verifications.</li>
                <li>Generate official survey returns for government submission (e.g., DENR, LRA).</li>
              </ul>
              <h4 className="font-bold text-slate-900 dark:text-white text-base mt-6">Data Protection and Storage</h4>
              <p>All sensitive documents and personal data are encrypted and securely stored on our cloud infrastructure. We do not sell or share your data with unauthorized third parties. Only the assigned geodetic engineer and authorized administrative staff have access to your property documents.</p>
              <h4 className="font-bold text-slate-900 dark:text-white text-base mt-6">Your Rights</h4>
              <p>You have the right to access, correct, or request the deletion of your personal data from our system, subject to legal retention requirements for geodetic surveying records in the Philippines.</p>
            </div>
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-end bg-slate-50 dark:bg-slate-900/50">
              <button onClick={() => setShowPrivacyModal(false)} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors shadow-sm">I Understand</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}