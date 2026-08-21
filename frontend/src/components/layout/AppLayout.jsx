import React from 'react';
import Navbar from './Navbar';

export default function AppLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col transition-colors duration-300">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full animate-fadeIn">
        {children}
      </main>
      <footer className="border-t border-purple-100/60 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
          <span>© {new Date().getFullYear()} TeamFlow. All rights reserved.</span>
          <span>Built for high-velocity productive teams.</span>
        </div>
      </footer>
    </div>
  );
}
