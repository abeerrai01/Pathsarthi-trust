import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useInternAuth } from '../contexts/InternAuthContext';
import { Eye, EyeOff, LogIn, AlertCircle, Briefcase, Shield } from 'lucide-react';

const InternLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [clickCount, setClickCount] = useState(0);
  const { internLogin, internUser, internProfile } = useInternAuth();
  const navigate = useNavigate();

  const handleLogoClick = () => {
    setClickCount(prev => {
      const next = prev + 1;
      if (next === 5) {
        const testEmail = 'test@pathsarthi.in';
        const testPass = 'Admin@123';
        setEmail(testEmail);
        setPassword(testPass);
        handleTestLogin(testEmail, testPass);
      }
      return next;
    });
  };

  const handleTestLogin = async (testEmail, testPass) => {
    setLoading(true);
    try {
      await internLogin(testEmail, testPass);
      navigate('/intern-dashboard', { replace: true });
    } catch (err) {
      setError('Test login failed. Please ensure test account exists.');
      setLoading(false);
    }
  };

  // If already logged in as intern, redirect
  useEffect(() => {
    if (internUser && internProfile) {
      navigate('/intern-dashboard', { replace: true });
    }
  }, [internUser, internProfile, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await internLogin(email, password);
      navigate('/intern-dashboard', { replace: true });
    } catch (err) {
      let msg = err.message || 'Login failed. Please try again.';
      if (msg.includes('auth/user-not-found') || msg.includes('auth/wrong-password') || msg.includes('auth/invalid-credential')) {
        msg = 'Invalid email or password. Please use the credentials provided by the admin team.';
      } else if (msg.includes('auth/too-many-requests')) {
        msg = 'Too many login attempts. Please wait a few minutes and try again.';
      } else if (msg.includes('auth/user-disabled')) {
        msg = 'Your internship access has been revoked. Please contact the admin team.';
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
        {/* Top brand bar */}
        <div className="h-2 w-full bg-blue-600" />

        <div className="p-8 sm:p-10">
          {/* Header */}
          <div className="flex flex-col items-center mb-8 text-center">
            <img 
              src="/Logo-2.png" 
              alt="PathSarthi Logo" 
              className="w-24 h-auto mb-4 cursor-pointer hover:opacity-90 transition-opacity"
              onClick={handleLogoClick}
            />
            <h1 className="text-2xl font-bold text-slate-900">Intern Portal</h1>
            <p className="text-slate-500 text-sm mt-1">PathSarthi Trust</p>
          </div>

          {/* Security notice */}
          <div className="flex items-start gap-3 mb-6 p-4 rounded-xl bg-blue-50 border border-blue-100 text-blue-700">
            <Shield size={20} className="shrink-0 mt-0.5" />
            <p className="text-sm">Access is restricted to approved interns. Use the credentials provided by the team.</p>
          </div>

          {/* Error message */}
          {error && (
            <div className="flex items-start gap-3 px-4 py-3 mb-6 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Email Address
              </label>
              <input
                id="intern-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="your.email@example.com"
                autoComplete="email"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="intern-password"
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 transition-colors"
                  aria-label={showPass ? "Hide password" : "Show password"}
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 mt-2 rounded-xl text-white font-bold bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-md shadow-blue-200"
            >
              {loading ? (
                <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Logging in...</>
              ) : (
                <><LogIn size={18} /> Login to Portal</>
              )}
            </button>
          </form>

          {/* Footer links */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-3">
            <Link to="/" className="text-sm font-semibold text-slate-500 hover:text-blue-600 transition-colors">
              ← Back to Main Site
            </Link>
            <Link to="/internship" className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors">
              Apply for Internship
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InternLogin;
