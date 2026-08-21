import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import TeamFlowLogo from '../components/common/TeamFlowLogo';
import { Github, Sparkles, ArrowRight, Rocket } from 'lucide-react';

const features = [
  {
    icon: '⚡',
    title: 'Real-Time Dashboard',
    desc: 'Live stats on tasks, deadlines, and team velocity — all in one beautiful view.',
    color: 'from-violet-500 to-purple-600',
  },
  {
    icon: '🎯',
    title: 'Interactive Task Boards',
    desc: 'Organize and prioritize tasks seamlessly across Todo, In Progress, Review, and Done states.',
    color: 'from-fuchsia-500 to-pink-600',
  },
  {
    icon: '🔐',
    title: 'Role-Based Access',
    desc: 'Admin, Project Manager, and Team Member roles with granular permission control.',
    color: 'from-indigo-500 to-violet-600',
  },
  {
    icon: '📊',
    title: 'Deadline Tracking',
    desc: 'Full deadline history, overdue alerts, and priority escalation built-in.',
    color: 'from-purple-500 to-indigo-600',
  },
  {
    icon: '💬',
    title: 'Task Comments',
    desc: 'In-context threaded discussions on every task. Keep conversations where work happens.',
    color: 'from-pink-500 to-fuchsia-600',
  },
  {
    icon: '🚀',
    title: 'Instant Setup',
    desc: 'Zero configuration required. Jump in, organize your workflows, and start collaborating in seconds.',
    color: 'from-violet-600 to-purple-700',
  },
];



function FloatingOrb({ className }) {
  return <div className={`absolute rounded-full blur-3xl opacity-20 animate-pulse ${className}`} />;
}

export default function LandingPage() {
  const [scrollY, setScrollY] = useState(0);
  const heroRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0414] text-white overflow-x-hidden">

      {/* ═══════════════ NAVBAR ═══════════════ */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4"
        style={{ background: scrollY > 40 ? 'rgba(10,4,20,0.85)' : 'transparent', backdropFilter: scrollY > 40 ? 'blur(20px)' : 'none', transition: 'all 0.3s ease', borderBottom: scrollY > 40 ? '1px solid rgba(167,139,250,0.15)' : 'none' }}>
        <div className="flex items-center gap-3">
          <TeamFlowLogo className="w-10 h-10" />
          <span className="text-xl font-bold bg-gradient-to-r from-violet-200 via-purple-200 to-cyan-200 bg-clip-text text-transparent">TeamFlow</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm text-violet-300 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-white/5">
            Sign In
          </Link>
          <Link to="/register" className="text-sm px-5 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-500 hover:to-purple-600 font-semibold shadow-lg shadow-violet-500/25 transition-all hover:shadow-violet-500/40 hover:scale-105">
            Get Started →
          </Link>
        </div>
      </nav>

      {/* ═══════════════ HERO ═══════════════ */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-24 pb-20">
        {/* Background orbs */}
        <FloatingOrb className="w-[600px] h-[600px] bg-violet-600 top-[-100px] left-[-200px]" />
        <FloatingOrb className="w-[500px] h-[500px] bg-purple-700 bottom-0 right-[-150px]" />
        <FloatingOrb className="w-[300px] h-[300px] bg-fuchsia-600 top-[40%] left-[30%]" />

        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(167,139,250,1) 1px, transparent 1px), linear-gradient(90deg, rgba(167,139,250,1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

        <div className="relative z-10 max-w-5xl mx-auto">
          {/* Headline */}
          <h1 className="text-6xl md:text-8xl font-black leading-tight mb-6">
            <span className="bg-gradient-to-r from-white via-violet-200 to-purple-300 bg-clip-text text-transparent">
              Team Projects.
            </span>
            <br />
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-purple-400 bg-clip-text text-transparent">
              Zero Chaos.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-300/90 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
            Turn ambitious team goals into <span className="text-violet-300 font-medium">completed milestones</span>.
            Manage tasks, prevent bottlenecks, and <span className="text-cyan-300 font-medium">hit every deadline</span> with confidence.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/login"
              className="group px-8 py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-500 hover:to-purple-600 font-bold text-lg shadow-2xl shadow-violet-500/30 transition-all hover:shadow-violet-500/50 hover:scale-105 flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-violet-200" />
              <span>Try Live Demo</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a href="https://github.com/IswaryaRama/TeamFlow" target="_blank" rel="noreferrer"
              className="group px-8 py-4 rounded-2xl border border-violet-500/30 hover:border-violet-400/60 bg-white/5 hover:bg-white/10 font-bold text-lg backdrop-blur-sm transition-all hover:scale-105 flex items-center gap-3 text-slate-200 hover:text-white">
              <Github className="w-5 h-5 text-violet-300 group-hover:text-white transition-colors" />
              <span>GitHub Repo</span>
            </a>
          </div>
        </div>
      </section>

      {/* ═══════════════ FEATURES ═══════════════ */}
      <section className="relative px-6 py-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-white to-violet-300 bg-clip-text text-transparent">
              Everything You Need
            </h2>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">A complete team collaboration platform packed with enterprise-grade features.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={i} className="group p-6 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-violet-500/40 hover:bg-white/[0.06] transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-violet-500/10 cursor-default">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center text-2xl mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                  {f.icon}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ HOW IT WORKS (USER-CENTRIC WORKFLOW) ═══════════════ */}
      <section className="px-6 py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-950/20 via-transparent to-transparent pointer-events-none" />
        <div className="relative max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-violet-400 bg-violet-500/10 px-4 py-1.5 rounded-full border border-violet-500/20">
              Simple & Powerful
            </span>
            <h2 className="text-4xl md:text-5xl font-black mt-4 mb-4 bg-gradient-to-r from-white via-violet-200 to-purple-300 bg-clip-text text-transparent">
              How TeamFlow Works
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Everything you need to turn chaotic project planning into structured, predictable execution.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="relative p-8 rounded-3xl bg-white/[0.03] border border-white/10 hover:border-violet-500/40 hover:bg-white/[0.05] transition-all duration-300 group">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center text-xl font-black text-white mb-6 shadow-lg shadow-violet-600/30 group-hover:scale-110 transition-transform">
                01
              </div>
              <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                Create & Assign
                <span className="text-sm">📁</span>
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                Set up dedicated project spaces, invite your team members, and assign role-based permissions in seconds.
              </p>
              <div className="text-xs font-semibold text-violet-300/80 bg-violet-950/40 px-3 py-2 rounded-xl border border-violet-500/20">
                ✨ Role-based access & member management
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative p-8 rounded-3xl bg-white/[0.03] border border-white/10 hover:border-fuchsia-500/40 hover:bg-white/[0.05] transition-all duration-300 group">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-fuchsia-600 to-pink-600 flex items-center justify-center text-xl font-black text-white mb-6 shadow-lg shadow-fuchsia-600/30 group-hover:scale-110 transition-transform">
                02
              </div>
              <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                Track & Collaborate
                <span className="text-sm">💬</span>
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                Organize tasks by status, discuss blockers with team comments, and adjust priorities in real time.
              </p>
              <div className="text-xs font-semibold text-fuchsia-300/80 bg-fuchsia-950/40 px-3 py-2 rounded-xl border border-fuchsia-500/20">
                🎯 Real-time task progress & team discussions
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative p-8 rounded-3xl bg-white/[0.03] border border-white/10 hover:border-indigo-500/40 hover:bg-white/[0.05] transition-all duration-300 group">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 flex items-center justify-center text-xl font-black text-white mb-6 shadow-lg shadow-indigo-600/30 group-hover:scale-110 transition-transform">
                03
              </div>
              <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                Deliver On Time
                <span className="text-sm">🚀</span>
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                Monitor live deadlines with automated deadline histories and visual status counters so milestones are never missed.
              </p>
              <div className="text-xs font-semibold text-indigo-300/80 bg-indigo-950/40 px-3 py-2 rounded-xl border border-indigo-500/20">
                📊 Audit trails & deadline change history
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ CALL TO ACTION ═══════════════ */}
      <section className="px-6 py-24">
        <div className="max-w-4xl mx-auto">
          <div className="relative p-10 md:p-14 rounded-3xl bg-gradient-to-b from-violet-950/40 via-purple-950/20 to-transparent border border-violet-500/20 text-center overflow-hidden">
            <FloatingOrb className="w-[300px] h-[300px] bg-violet-600 top-[-50px] left-[50%] -translate-x-1/2" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-black mb-4 bg-gradient-to-r from-white via-violet-200 to-purple-200 bg-clip-text text-transparent">
                Ready to Streamline Your Workflow?
              </h2>
              <p className="text-slate-400 text-base md:text-lg max-w-xl mx-auto mb-8">
                Join teams organizing tasks, tracking milestones, and delivering projects on time.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link to="/login"
                  className="px-8 py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-500 hover:to-purple-600 font-bold text-lg shadow-2xl shadow-violet-500/30 transition-all hover:shadow-violet-500/50 hover:scale-105 flex items-center gap-2.5">
                  <Sparkles className="w-5 h-5 text-violet-200" />
                  <span>Launch Application</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link to="/register"
                  className="px-8 py-4 rounded-2xl border border-violet-500/30 hover:border-violet-400/60 bg-white/5 hover:bg-white/10 font-bold text-lg backdrop-blur-sm transition-all hover:scale-105 flex items-center gap-2">
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ FOOTER ═══════════════ */}
      <footer className="border-t border-white/10 px-6 py-10">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <TeamFlowLogo className="w-8 h-8" />
            <span className="font-bold text-violet-300">TeamFlow</span>
          </div>
          <p className="text-slate-500 text-sm">© {new Date().getFullYear()} TeamFlow. Built for productive teams.</p>
          <a href="https://github.com/IswaryaRama/TeamFlow" target="_blank" rel="noreferrer"
            className="text-sm text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-2">
            <Github className="w-4 h-4" />
            <span>GitHub Repository</span>
          </a>
        </div>
      </footer>
    </div>
  );
}
