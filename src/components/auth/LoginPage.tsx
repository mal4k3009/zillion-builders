import React, { useState } from 'react';
import { LogIn, Eye, EyeOff, Shield } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export function LoginPage() {
  const { state, dispatch } = useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const user = state.users.find(u => 
      u.username === username && u.password === password && u.status === 'active'
    );

    if (user) {
      const updatedUser = { ...user, lastLogin: new Date().toISOString() };
      dispatch({ type: 'UPDATE_USER', payload: updatedUser });
      dispatch({ type: 'SET_CURRENT_USER', payload: updatedUser });
    } else {
      setError('Invalid credentials or account is inactive');
    }
    
    setLoading(false);
  };

  const quickLogin = (userType: string) => {
    const credentials: Record<string, { username: string; password: string }> = {
      master: { username: 'masteradmin', password: 'admin123' },
      sales: { username: 'sales_admin', password: 'sales123' },
      pr: { username: 'pr_admin', password: 'pr123' },
      marketing: { username: 'marketing_admin', password: 'marketing123' },
      operations: { username: 'ops_admin', password: 'ops123' }
    };

    const creds = credentials[userType];
    setUsername(creds.username);
    setPassword(creds.password);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">TaskFlow Pro</h1>
            <p className="text-blue-100">Enterprise Task Management System</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-red-500/20 border border-red-500/30 text-red-100 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-blue-100 text-sm font-medium mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Enter your username"
                required
              />
            </div>

            <div>
              <label className="block text-blue-100 text-sm font-medium mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-12"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-200 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Sign In
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/20">
            <p className="text-blue-100 text-sm text-center mb-4">Quick Login (Demo)</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => quickLogin('master')}
                className="px-3 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-100 text-xs rounded-lg transition-colors"
              >
                Master Admin
              </button>
              <button
                onClick={() => quickLogin('sales')}
                className="px-3 py-2 bg-green-600/20 hover:bg-green-600/30 text-green-100 text-xs rounded-lg transition-colors"
              >
                Sales Admin
              </button>
              <button
                onClick={() => quickLogin('pr')}
                className="px-3 py-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-100 text-xs rounded-lg transition-colors"
              >
                PR Admin
              </button>
              <button
                onClick={() => quickLogin('marketing')}
                className="px-3 py-2 bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-100 text-xs rounded-lg transition-colors"
              >
                Marketing Admin
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}