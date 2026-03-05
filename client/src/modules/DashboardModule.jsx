import { useApp } from '../context/AppContext.jsx';

function StatCard({ label, value, icon, color }) {
  return (
    <div className="glass-card p-5 flex items-center gap-4 hover:border-white/[0.12] transition-all duration-200">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-xs text-slate-500 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

function ActionCard({ icon, title, desc, badge, onClick }) {
  return (
    <button
      onClick={onClick}
      className="glass-card p-5 text-left w-full group hover:border-violet-500/25 hover:bg-white/[0.05] transition-all duration-200 hover:shadow-card-hover"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-brand-soft border border-violet-500/20 flex items-center justify-center text-lg group-hover:shadow-glow-sm transition-all">
          {icon}
        </div>
        {badge && <span className="badge badge-purple text-[10px]">{badge}</span>}
      </div>
      <p className="text-sm font-semibold text-white mb-1">{title}</p>
      <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
      <div className="mt-3 flex items-center gap-1 text-xs text-violet-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
        Open <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
      </div>
    </button>
  );
}

export default function DashboardModule() {
  const { state, dispatch } = useApp();
  const hasApiKey = !!localStorage.getItem('srs_api_key');

  const wordCount = state.rewrittenScript.trim().split(/\s+/).filter(Boolean).length;

  const stats = [
    { label: 'Scenes Generated', value: state.scenes.length, icon: '🎬', color: 'bg-violet-500/15 text-violet-400' },
    { label: 'Script Words',     value: wordCount,           icon: '✍️', color: 'bg-blue-500/15 text-blue-400' },
    { label: 'Export Ready',     value: state.scenes.length > 0 ? 'Yes' : 'No', icon: '📦', color: 'bg-cyan-500/15 text-cyan-400' },
    { label: 'API Status',       value: hasApiKey ? 'Active' : 'Missing', icon: hasApiKey ? '🟢' : '🔴', color: hasApiKey ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400' },
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto animate-fade-up">

      {/* Hero */}
      <div className="relative rounded-2xl overflow-hidden mb-8 p-8"
        style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.15) 0%, rgba(37,99,235,0.12) 50%, rgba(6,182,212,0.08) 100%)', border: '1px solid rgba(124,58,237,0.2)' }}>
        {/* Glow orbs */}
        <div className="absolute top-0 left-1/4 w-48 h-48 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/15 border border-violet-500/25 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse-glow" />
            <span className="text-xs font-medium text-violet-300">AI-Powered Script Studio</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Turn transcripts into{' '}
            <span className="gradient-text">cinematic stories.</span>
          </h1>
          <p className="text-slate-400 max-w-xl text-sm leading-relaxed">
            Paste any raw transcript and transform it into polished scripts, structured scenes, and ready-to-use production prompts — all in seconds.
          </p>
          <div className="flex items-center gap-3 mt-6">
            <button onClick={() => dispatch({ type: 'SET_MODULE', payload: 'transcript' })} className="btn-brand">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Start Now
            </button>
            {!hasApiKey && (
              <button onClick={() => dispatch({ type: 'SET_MODULE', payload: 'settings' })} className="btn-secondary text-xs">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                Add API Key First
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map(s => <StatCard key={s.label} {...s} />)}
      </div>

      {/* Workflow */}
      <div className="mb-8">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">Your Workflow</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: '📝', title: 'Transcript', desc: 'Paste, upload or import raw transcript from YouTube', badge: null, module: 'transcript' },
            { icon: '✨', title: 'AI Rewrite', desc: 'Choose style and let Claude transform your content', badge: 'AI', module: 'rewrite' },
            { icon: '🎬', title: 'Storyboard', desc: 'Auto-split into scenes with full production prompts', badge: 'Auto', module: 'storyboard' },
            { icon: '📦', title: 'Export', desc: 'Download JSON, CSV or print a PDF storyboard', badge: null, module: 'export' },
          ].map((item, i) => (
            <div key={i} className="relative">
              {i < 3 && (
                <div className="hidden lg:block absolute top-8 -right-2 z-10 text-slate-700">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              )}
              <ActionCard {...item} onClick={() => dispatch({ type: 'SET_MODULE', payload: item.module })} />
            </div>
          ))}
        </div>
      </div>

      {/* API key warning */}
      {!hasApiKey && (
        <div className="glass-card border-amber-500/25 bg-amber-500/5 p-4 flex items-center gap-4">
          <div className="w-9 h-9 rounded-xl bg-amber-500/15 flex items-center justify-center text-lg shrink-0">⚠️</div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-300">API key required</p>
            <p className="text-xs text-amber-400/70 mt-0.5">AI features need a Claude API key. Add yours in Settings to start generating.</p>
          </div>
          <button onClick={() => dispatch({ type: 'SET_MODULE', payload: 'settings' })} className="btn-secondary text-xs shrink-0">
            Go to Settings
          </button>
        </div>
      )}
    </div>
  );
}
