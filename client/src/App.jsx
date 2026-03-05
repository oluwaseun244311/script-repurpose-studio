import { AppProvider, useApp } from './context/AppContext.jsx';
import Sidebar from './components/Sidebar.jsx';
import Header from './components/Header.jsx';
import DashboardModule from './modules/DashboardModule.jsx';
import TranscriptModule from './modules/TranscriptModule.jsx';
import RewriteModule from './modules/RewriteModule.jsx';
import StoryboardModule from './modules/StoryboardModule.jsx';
import ExportModule from './modules/ExportModule.jsx';
import HistoryModule from './modules/HistoryModule.jsx';
import SettingsModule from './modules/SettingsModule.jsx';

function Toast() {
  const { state, dispatch } = useApp();
  if (!state.error) return null;
  return (
    <div className="fixed top-5 right-5 z-50 max-w-sm animate-fade-up">
      <div className="glass-card border-red-500/30 bg-red-500/10 p-4 flex items-start gap-3 shadow-card">
        <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center shrink-0">
          <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-red-300">Something went wrong</p>
          <p className="text-xs text-red-400/80 mt-0.5 leading-relaxed">{state.error}</p>
        </div>
        <button onClick={() => dispatch({ type: 'CLEAR_ERROR' })} className="text-red-500 hover:text-red-300 shrink-0 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function ActiveModule() {
  const { state } = useApp();
  switch (state.activeModule) {
    case 'dashboard':  return <DashboardModule />;
    case 'transcript': return <TranscriptModule />;
    case 'rewrite':    return <RewriteModule />;
    case 'storyboard': return <StoryboardModule />;
    case 'history':    return <HistoryModule />;
    case 'export':     return <ExportModule />;
    case 'settings':   return <SettingsModule />;
    default:           return <DashboardModule />;
  }
}

function AppShell() {
  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#07070f' }}>
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto">
          <ActiveModule />
        </main>
      </div>
      <Toast />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
