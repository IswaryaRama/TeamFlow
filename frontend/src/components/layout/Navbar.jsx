import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { RoleBadge } from '../common/Badge';
import {
  Layers,
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Users,
  LogOut,
} from 'lucide-react';

import TeamFlowLogo from '../common/TeamFlowLogo';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Projects', path: '/projects', icon: FolderKanban },
    { name: 'Tasks', path: '/tasks', icon: CheckSquare },
    ...(isAdmin ? [{ name: 'Team Members', path: '/team', icon: Users }] : []),
  ];

  return (
    <header className="border-b border-purple-100 bg-white/80 backdrop-blur-xl sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-8">
            <Link to="/dashboard" className="flex items-center space-x-3 group">
              <TeamFlowLogo className="w-9 h-9" />
              <span className="text-xl font-bold tracking-tight text-slate-900 font-sans">
                TeamFlow
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  location.pathname === item.path ||
                  (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition ${
                      isActive
                        ? 'bg-purple-50 text-purple-700 border border-purple-200/80 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-purple-50/50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* User Profile & Logout */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3 pl-3 border-l border-purple-100">
              <div className="w-9 h-9 rounded-xl bg-purple-100 border border-purple-200 flex items-center justify-center font-bold text-sm text-purple-800 shadow-xs">
                {user?.full_name?.charAt(0) || 'U'}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <span>{user?.full_name}</span>
                  <RoleBadge role={user?.role} />
                </div>
                <div className="text-[11px] text-slate-500 truncate max-w-[150px]">
                  {user?.email}
                </div>
              </div>
            </div>

            <button
              onClick={logout}
              title="Sign Out"
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 border border-slate-200 text-slate-600 text-xs font-semibold transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="md:hidden flex space-x-1 py-2 border-t border-purple-100 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              location.pathname === item.path ||
              (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
                  isActive
                    ? 'bg-purple-50 text-purple-700 border border-purple-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}
