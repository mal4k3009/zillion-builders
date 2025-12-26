import React, { useState, useEffect } from 'react';
import { LogIn, Eye, EyeOff, Building2, Shield } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export function LoginPage() {
  const { signInWithUsername } = useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Force dark mode on login page
  useEffect(() => {
    document.documentElement.classList.add('dark');
    document.body.style.backgroundColor = '#1a1a1a';
    
    return () => {
      document.body.style.backgroundColor = '';
    };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    console.log('🔐 Login attempt for username:', username);

    try {
      const success = await signInWithUsername(username, password);
      
      if (success) {
        console.log('✅ Login completed successfully');
      } else {
        console.log('❌ Login failed: Invalid credentials');
        setError('Invalid username or password');
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      setError('Authentication failed. Please try again.');
    }
    
    setLoading(false);
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative"
      style={{
        backgroundColor: '#1a1a1a',
        backgroundImage: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%)',
        minHeight: '100vh',
        width: '100%'
      }}
    >
      {/* Background Pattern */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(200, 150, 95, 0.05) 1px, transparent 0)',
          backgroundSize: '40px 40px',
          opacity: 0.5
        }}
      />

      <div className="w-full max-w-md relative z-10">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div 
            className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4"
            style={{
              background: 'linear-gradient(135deg, #C8965F 0%, #D4A574 100%)',
              boxShadow: '0 10px 40px rgba(200, 150, 95, 0.4)'
            }}
          >
            <Building2 className="w-10 h-10" style={{ color: '#ffffff' }} />
          </div>
          <h1 className="text-4xl font-bold mb-2" style={{ color: '#ffffff' }}>
            Sentiment AI
          </h1>
          <p className="text-lg font-medium" style={{ color: '#D4A574' }}>
            Real Estate
          </p>
        </div>

        {/* Login Card */}
        <div 
          className="rounded-2xl p-8"
          style={{
            backgroundColor: 'rgba(45, 45, 45, 0.8)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(200, 150, 95, 0.3)',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.6)'
          }}
        >
          <div className="flex items-center justify-center gap-2 mb-6">
            <Shield className="w-5 h-5" style={{ color: '#C8965F' }} />
            <h2 className="text-xl font-semibold" style={{ color: '#ffffff' }}>
              Enterprise Login
            </h2>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div 
                className="rounded-lg px-4 py-3 text-sm"
                style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.2)',
                  border: '1px solid rgba(239, 68, 68, 0.5)',
                  color: '#ffffff'
                }}
              >
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#D4A574' }}>
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 transition-all"
                style={{
                  backgroundColor: 'rgba(26, 26, 26, 0.8)',
                  border: '1px solid rgba(200, 150, 95, 0.4)',
                  color: '#ffffff',
                  caretColor: '#C8965F'
                }}
                placeholder="Enter your username"
                required
                autoComplete="username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#D4A574' }}>
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 rounded-lg focus:outline-none focus:ring-2 transition-all"
                  style={{
                    backgroundColor: 'rgba(26, 26, 26, 0.8)',
                    border: '1px solid rgba(200, 150, 95, 0.4)',
                    color: '#ffffff',
                    caretColor: '#C8965F'
                  }}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 transition-colors hover:opacity-80"
                  style={{ color: '#D4A574' }}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: loading ? '#9a7047' : 'linear-gradient(135deg, #C8965F 0%, #D4A574 100%)',
                boxShadow: loading ? 'none' : '0 4px 20px rgba(200, 150, 95, 0.5)',
                color: '#ffffff'
              }}
            >
              {loading ? (
                <div 
                  className="w-5 h-5 rounded-full animate-spin"
                  style={{
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    borderTopColor: '#ffffff'
                  }}
                />
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Sign In
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs" style={{ color: '#999999' }}>
              Enterprise Task Management System
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm" style={{ color: '#666666' }}>
            © 2025 Sentiment AI Real Estate. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}