import { useApp } from '../context/AppContext.jsx';

export default function HistoryModule() {
  const { dispatch } = useApp();
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-6 animate-fade-up">
      <div className="w-16 h-16 rounded-2xl bg-gradient-brand-soft border border-violet-500/20 flex items-center justify-center text-3xl mb-5">
        🕐
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">No history yet</h3>
      <p className="text-sm text-slate-500 max-w-xs leading-relaxed mb-6">
        Your past projects will appear here. Start by creating your first script from a transcript.
      </p>
      <button onClick={() => dispatch({ type: 'SET_MODULE', payload: 'transcript' })} className="btn-brand">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Start a New Project
      </button>
      <p className="text-xs text-slate-600 mt-4">Project history coming soon</p>
    </div>
  );
}
