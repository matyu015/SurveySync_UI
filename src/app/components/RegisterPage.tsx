import { useState } from 'react';
import { ArrowLeft, Map, Moon, Sun, Eye, EyeOff, Loader2, User, Mail, Lock, X } from 'lucide-react';
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

  // Terms and Privacy State
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  
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
    if (!agreeToTerms) {
      return setError('You must agree to the Terms and Conditions.');
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
          createdAt: new Date().toISOString(),
          agreedToTermsAt: new Date().toISOString()
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
              />
            </div>
            <label htmlFor="terms" className="text-sm text-white/70 leading-snug">
              By creating an account, I agree to SurveySync's{' '}
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

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !agreeToTerms}
            className="w-full flex justify-center items-center gap-2 px-6 py-3.5 mt-6 bg-white text-slate-900 rounded-xl hover:bg-white/90 transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(255,255,255,0.2)]"
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