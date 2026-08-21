import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import TeamFlowLogo from '../components/common/TeamFlowLogo';
import { 
  Lock, 
  User, 
  ArrowRight, 
  ShieldCheck, 
  Users, 
  AlertCircle, 
  Sparkles,
  Database,
  Eye,
  EyeOff
} from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    email_or_username: '',
    password: '',
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [seedLoading, setSeedLoading] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email_or_username.trim() || !formData.password) {
      setError('Please enter your email/username and password');
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      await login(formData);
      navigate('/dashboard');
    } catch (err) {
      setError(
        err.response?.data?.detail || 
        'Invalid credentials. Please check your username/password or click "Seed Demo Accounts" below.'
      );
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = (userIdentifier, pass) => {
    setFormData({
      email_or_username: userIdentifier,
      password: pass,
    });
    if (error) setError(null);
  };

  const handleSeedDatabase = async () => {
    setSeedLoading(true);
    setSeedSuccess(false);
    setError(null);
    try {
      await authService.seedDemo();
      setSeedSuccess(true);
      setTimeout(() => setSeedSuccess(false), 5000);
    } catch (err) {
      setError('Could not seed database. Please ensure backend server is running.');
    } finally {
      setSeedLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF5FF] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
        <div className="mb-4 flex justify-center">
          <TeamFlowLogo className="w-16 h-16" />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
          Sign in to TeamFlow
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Welcome back! Sign in to access your projects and tasks.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="glass-card py-8 px-6 rounded-2xl sm:px-10">
          
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start space-x-3 text-rose-800 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {seedSuccess && (
            <div className="mb-6 p-4 rounded-xl bg-purple-50 border border-purple-200 flex items-start space-x-3 text-purple-800 text-sm">
              <Sparkles className="w-5 h-5 flex-shrink-0 mt-0.5 text-purple-600" />
              <span>Demo accounts seeded successfully! Click one of the demo buttons below to test.</span>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
                Email or Username
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  name="email_or_username"
                  value={formData.email_or_username}
                  onChange={handleChange}
                  placeholder="admin@teamflow.com or username"
                  className="block w-full pl-11 pr-4 py-3 bg-white/90 border border-purple-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white text-sm transition"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
                Password
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="block w-full pl-11 pr-11 py-3 bg-white/90 border border-purple-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white text-sm transition font-medium"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-purple-600 transition cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold shadow-md shadow-purple-500/20 transition cursor-pointer disabled:opacity-50 text-sm mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* 1-Click Demo Login Helpers */}
          <div className="mt-8 pt-6 border-t border-purple-100 space-y-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 text-center">
              Quick 1-Click Demo Sign-in
            </div>
            
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => fillDemoAccount('admin@teamflow.com', 'AdminPass123!')}
                className="p-2.5 rounded-xl bg-white hover:bg-purple-50 border border-purple-200 hover:border-purple-300 text-left transition cursor-pointer group shadow-xs"
              >
                <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-800 group-hover:text-purple-800">
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                  <span>Admin</span>
                </div>
                <div className="text-[10px] text-slate-500 truncate">admin@teamflow.com</div>
              </button>

              <button
                type="button"
                onClick={() => fillDemoAccount('member@teamflow.com', 'MemberPass123!')}
                className="p-2.5 rounded-xl bg-white hover:bg-purple-50 border border-purple-200 hover:border-purple-300 text-left transition cursor-pointer group shadow-xs"
              >
                <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-800 group-hover:text-purple-800">
                  <Users className="w-3.5 h-3.5 text-purple-600" />
                  <span>John (Dev)</span>
                </div>
                <div className="text-[10px] text-slate-500 truncate">member@teamflow.com</div>
              </button>

              <button
                type="button"
                onClick={() => fillDemoAccount('sarah@teamflow.com', 'MemberPass123!')}
                className="p-2.5 rounded-xl bg-white hover:bg-purple-50 border border-purple-200 hover:border-purple-300 text-left transition cursor-pointer group shadow-xs"
              >
                <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-800 group-hover:text-purple-800">
                  <Users className="w-3.5 h-3.5 text-purple-600" />
                  <span>Sarah (QA)</span>
                </div>
                <div className="text-[10px] text-slate-500 truncate">sarah@teamflow.com</div>
              </button>

              <button
                type="button"
                onClick={() => fillDemoAccount('michael@teamflow.com', 'MemberPass123!')}
                className="p-2.5 rounded-xl bg-white hover:bg-purple-50 border border-purple-200 hover:border-purple-300 text-left transition cursor-pointer group shadow-xs"
              >
                <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-800 group-hover:text-purple-800">
                  <Users className="w-3.5 h-3.5 text-purple-600" />
                  <span>Michael (DS)</span>
                </div>
                <div className="text-[10px] text-slate-500 truncate">michael@teamflow.com</div>
              </button>
            </div>

            <button
              type="button"
              onClick={handleSeedDatabase}
              disabled={seedLoading}
              className="w-full flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl bg-white/60 hover:bg-purple-50 border border-dashed border-purple-300 text-slate-600 text-xs font-medium transition cursor-pointer disabled:opacity-50"
            >
              <Database className="w-3.5 h-3.5 text-slate-500" />
              <span>{seedLoading ? 'Seeding Demo Data...' : 'Seed / Re-seed Demo Database'}</span>
            </button>
          </div>

          <div className="mt-6 text-center text-xs text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-purple-700 hover:text-purple-800 underline transition">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
