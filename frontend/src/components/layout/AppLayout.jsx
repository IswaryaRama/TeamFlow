import React from 'react';
import Navbar from './Navbar';

export default function AppLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col transition-colors duration-300">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full animate-fadeIn">
        {children}
      </main>
      <footer className="border-t border-white/5 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <span>TeamFlow &bull; Enterprise Project & Task Management</span>
          <span>FastAPI &bull; PostgreSQL &bull; React &bull; Tailwind CSS &bull; JWT RBAC</span>
        </div>
      </footer>
    </div>
  );
}
