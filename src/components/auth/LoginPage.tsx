import React, { useState } from 'react';
import { LogIn, Eye, EyeOff } from 'lucide-react';
import { useApp } from '../../context/AppContext';
// import { requestNotificationPermission } from '../../firebase/messaging'; // DISABLED - n8n will handle notifications

export function LoginPage() {
  const { signInWithEmail } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    console.log('🔐 Login attempt for email:', email);

    try {
      const success = await signInWithEmail(email, password);
      
      if (success) {
        console.log('✅ Login completed successfully');
        // The AppContext will handle the user state update via Firebase Auth
      } else {
        console.log('❌ Login failed: Invalid credentials');
        setError('Invalid credentials or account is inactive');
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      setError('Authentication failed. Please try again.');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-deep-charcoal via-soft-black to-deep-charcoal flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/10 backdrop-blur-lg rounded-xl sm:rounded-2xl shadow-2xl p-6 sm:p-8 border border-white/20">
          <div className="text-center mb-6 sm:mb-8">
            <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-4 p-2">
              <img 
                src="/Zillion Group Logo-1.png" 
                alt="Zillion Group Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-pure-white mb-2">Zillion Group Teams</h1>
            <p className="text-sm sm:text-base text-accent-gold">Enterprise Task Management System</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 sm:space-y-6">
            {error && (
              <div className="bg-red-500/20 border border-red-500/30 text-red-100 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-xs sm:text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-accent-gold text-xs sm:text-sm font-medium mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base bg-white/10 border border-white/20 rounded-lg text-white placeholder-accent-gold/70 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent transition-all"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label className="block text-accent-gold text-xs sm:text-sm font-medium mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base bg-white/10 border border-white/20 rounded-lg text-white placeholder-accent-gold/70 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent transition-all pr-10 sm:pr-12"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-accent-gold hover:text-pure-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-gold hover:bg-accent-gold disabled:bg-brand-gold/50 text-pure-white font-semibold py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              {loading ? (
                <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-pure-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-4 h-4 sm:w-5 sm:h-5" />
                  Sign In
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}