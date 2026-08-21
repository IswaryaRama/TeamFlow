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
        'Invalid credentials. Please check your username and password.'
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

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 font-sans">
                Email or Username
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="h-5 w-5" />
                </div>
                <input
                  type="text"
                  name="email_or_username"
                  required
                  value={formData.email_or_username}
                  onChange={handleChange}
                  className="block w-full pl-11 pr-4 py-3 bg-white border border-purple-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition text-sm shadow-xs"
                  placeholder="admin@teamflow.com or username"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 font-sans">
                Password
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pl-11 pr-11 py-3 bg-white border border-purple-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition text-sm shadow-xs"
                  placeholder="••••••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-3 px-4 rounded-xl shadow-md text-sm font-bold text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition duration-150 ease-in-out cursor-pointer disabled:opacity-70 group"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition duration-150" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Access Section */}
          <div className="mt-8 pt-6 border-t border-purple-100">
            <div className="text-center mb-3">
              <span className="text-[11px] font-bold text-slate-600 tracking-wider uppercase">
                Quick 1-Click Demo Sign-In
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-3">
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
                  <span>John</span>
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
                  <span>Sarah</span>
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
                  <span>Michael</span>
                </div>
                <div className="text-[10px] text-slate-500 truncate">michael@teamflow.com</div>
              </button>
            </div>
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
