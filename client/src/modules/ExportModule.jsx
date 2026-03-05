import { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { scenesToJSON, scenesToCSV, downloadText, printStoryboard } from '../utils/export.js';

function ExportCard({ icon, title, desc, action, disabled, accentColor = 'violet' }) {
  const [feedback, setFeedback] = useState('');

  const colorMap = {
    violet: 'hover:border-violet-500/35 hover:shadow-glow-sm',
    blue:   'hover:border-blue-500/35 hover:shadow-glow-blue',
    cyan:   'hover:border-cyan-500/35',
    green:  'hover:border-emerald-500/35',
  };

  const handleClick = async () => {
    if (disabled) return;
    if (action.type === 'copy') {
      await navigator.clipboard.writeText(action.content());
      setFeedback('Copied!');
      setTimeout(() => setFeedback(''), 2000);
    } else {
      action.run();
      setFeedback('Done!');
      setTimeout(() => setFeedback(''), 2000);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`glass-card w-full text-left p-5 flex items-start gap-4 transition-all duration-200 ${
        disabled ? 'opacity-30 cursor-not-allowed' : `${colorMap[accentColor]} hover:bg-white/[0.05] active:scale-[0.99]`
      }`}
    >
      <div className="text-2xl shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white">{feedback || title}</p>
        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{desc}</p>
      </div>
      {!disabled && (
        <div className="shrink-0 mt-0.5 text-slate-600">
          {feedback ? (
            <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : action.type === 'copy' ? (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          )}
        </div>
      )}
    </button>
  );
}

export default function ExportModule() {
  const { state } = useApp();
  const hasScript = !!state.rewrittenScript.trim();
  const hasScenes = state.scenes.length > 0;

  const allPromptsText = state.scenes.map(s =>
    `Scene ${s.number}\nText: ${s.text}\nImage: ${s.imagePrompt}\nB-roll: ${s.brollPrompt}\nSound: ${s.soundPrompt}\nEnvironment: ${s.environment}\nCamera: ${s.cameraAngle}`
  ).join('\n\n─────────────────\n\n');

  const exports = [
    {
      icon: '📝', title: 'Copy Script', accentColor: 'violet',
      desc: 'Copy the full rewritten script to clipboard',
      disabled: !hasScript,
      action: { type: 'copy', content: () => state.rewrittenScript },
    },
    {
      icon: '🎬', title: 'Copy All Prompts', accentColor: 'blue',
      desc: 'All scene prompts as formatted plain text',
      disabled: !hasScenes,
      action: { type: 'copy', content: () => allPromptsText },
    },
    {
      icon: '📦', title: 'Export JSON', accentColor: 'cyan',
      desc: 'Full structured scene data as a JSON file',
      disabled: !hasScenes,
      action: { type: 'download', run: () => downloadText(scenesToJSON(state.scenes), 'storyboard.json', 'application/json') },
    },
    {
      icon: '📊', title: 'Export CSV', accentColor: 'green',
      desc: 'Scene prompts in spreadsheet-friendly CSV format',
      disabled: !hasScenes,
      action: { type: 'download', run: () => downloadText(scenesToCSV(state.scenes), 'storyboard.csv', 'text/csv') },
    },
    {
      icon: '🖨️', title: 'Print / Save PDF', accentColor: 'violet',
      desc: 'Use browser print to export as a formatted PDF',
      disabled: !hasScenes,
      action: { type: 'download', run: printStoryboard },
    },
  ];

  return (
    <div className="p-6 max-w-2xl mx-auto animate-fade-up">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white">Export</h2>
        <p className="text-sm text-slate-500 mt-1">Download or copy your script and storyboard prompts.</p>
      </div>

      {!hasScript && !hasScenes && (
        <div className="glass-card border-amber-500/20 bg-amber-500/[0.05] p-5 flex items-center gap-4 mb-6">
          <span className="text-2xl">⚡</span>
          <div>
            <p className="text-sm font-semibold text-amber-300">Nothing ready to export</p>
            <p className="text-xs text-amber-400/70 mt-0.5">Complete the Transcript → Rewrite → Storyboard workflow first.</p>
          </div>
        </div>
      )}

      <div className="space-y-3 mb-8">
        {exports.map((item, i) => <ExportCard key={i} {...item} />)}
      </div>

      {hasScenes && (
        <div className="glass-card p-5">
          <p className="label mb-4">Project Summary</p>
          <div className="grid grid-cols-2 gap-y-2 text-xs">
            {[
              ['Total scenes',   state.scenes.length],
              ['Total duration', `~${state.scenes.reduce((a, s) => a + (s.duration || 6), 0)}s`],
              ['Script words',   state.rewrittenScript.trim().split(/\s+/).filter(Boolean).length],
              ['Style',          state.rewriteStyle],
              ['Platform',       state.rewriteControls.platform],
              ['Scene length',   `${state.sceneDuration}s avg`],
            ].map(([label, val]) => (
              <div key={label} className="flex justify-between py-2 border-b border-white/[0.04]">
                <span className="text-slate-500">{label}</span>
                <span className="text-white font-medium capitalize">{val}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="hidden print:block">
        <h1 className="text-2xl font-bold mb-6">Storyboard — Script Repurpose Studio</h1>
        {state.scenes.map(s => (
          <div key={s.id} className="mb-8 pb-8 border-b">
            <h2 className="text-lg font-bold mb-2">Scene {s.number}</h2>
            <p className="mb-3 leading-relaxed">{s.text}</p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><strong>Image:</strong> {s.imagePrompt}</div>
              <div><strong>B-roll:</strong> {s.brollPrompt}</div>
              <div><strong>Sound:</strong> {s.soundPrompt}</div>
              <div><strong>Environment:</strong> {s.environment}</div>
              <div><strong>Camera:</strong> {s.cameraAngle}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
