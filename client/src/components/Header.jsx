import { useApp } from '../context/AppContext.jsx';

const MODULE_META = {
  dashboard:  { label: 'Dashboard',         sub: 'Overview & quick start' },
  transcript: { label: 'Transcript',        sub: 'Import & clean your content' },
  rewrite:    { label: 'Content Generator', sub: 'AI-powered script rewriting' },
  storyboard: { label: 'Storyboard',        sub: 'Visual scene planning' },
  history:    { label: 'History',           sub: 'Past projects' },
  export:     { label: 'Export',            sub: 'Download & share your work' },
  settings:   { label: 'Settings',         sub: 'API keys & preferences' },
};

export default function Header() {
  const { state, dispatch } = useApp();
  const meta = MODULE_META[state.activeModule] || MODULE_META.dashboard;

  return (
    <header className="h-14 shrink-0 flex items-center justify-between px-6 border-b border-white/[0.06]"
      style={{ background: 'rgba(7,7,15,0.85)', backdropFilter: 'blur(12px)' }}>

      {/* Breadcrumb */}
      <div className="flex items-center gap-3">
        <div>
          <h2 className="text-sm font-semibold text-white leading-none">{meta.label}</h2>
          <p className="text-xs text-slate-600 mt-0.5 leading-none">{meta.sub}</p>
        </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        {/* New project */}
        <button
          onClick={() => {
            if (window.confirm('Start a new project? All current work will be cleared.')) {
              dispatch({ type: 'NEW_PROJECT' });
            }
          }}
          className="btn-ghost text-slate-500 hover:text-slate-300"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Project
        </button>

        {/* Settings shortcut */}
        <button
          onClick={() => dispatch({ type: 'SET_MODULE', payload: 'settings' })}
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
            state.activeModule === 'settings'
              ? 'bg-violet-500/20 text-violet-400'
              : 'text-slate-600 hover:text-slate-300 hover:bg-white/[0.06]'
          }`}
          title="Settings"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
              d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>

        {/* Avatar placeholder */}
        <div className="w-8 h-8 rounded-lg bg-gradient-brand flex items-center justify-center text-white text-xs font-bold shadow-glow-sm">
          AI
        </div>
      </div>
    </header>
  );
}
