import { useRef, useState, useCallback } from 'react';
import { useApp } from '../context/AppContext.jsx';
import SceneCard from '../components/SceneCard.jsx';
import CustomPromptSettings from '../components/CustomPromptSettings.jsx';

function Spinner() {
  return (
    <svg className="animate-spin w-6 h-6 text-violet-400" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

const COPY_CATEGORIES = [
  {
    id: 'image',
    label: 'Image',
    icon: '🖼',
    build: (scenes) =>
      scenes.map(s => `Scene ${String(s.number).padStart(2,'0')} — Image Prompt\n${s.imagePrompt || '—'}`).join('\n\n'),
  },
  {
    id: 'hero',
    label: 'Hero / B-roll',
    icon: '🎬',
    build: (scenes) =>
      scenes.map(s => `Scene ${String(s.number).padStart(2,'0')} — Hero / B-roll\n${s.brollPrompt || '—'}`).join('\n\n'),
  },
  {
    id: 'camera',
    label: 'Camera',
    icon: '📹',
    build: (scenes) =>
      scenes.map(s => `Scene ${String(s.number).padStart(2,'0')} — Camera Angle\n${s.cameraAngle || '—'}`).join('\n\n'),
  },
  {
    id: 'sound',
    label: 'Sound',
    icon: '🔊',
    build: (scenes) =>
      scenes.map(s => `Scene ${String(s.number).padStart(2,'0')} — Sound\n${s.soundPrompt || '—'}`).join('\n\n'),
  },
  {
    id: 'all',
    label: 'All Prompts',
    icon: '📋',
    build: (scenes) =>
      scenes.map(s =>
        `═══ Scene ${String(s.number).padStart(2,'0')} ═══\n` +
        `🖼  Image:   ${s.imagePrompt || '—'}\n` +
        `🎬  Hero:    ${s.brollPrompt || '—'}\n` +
        `📹  Camera:  ${s.cameraAngle || '—'}\n` +
        `🔊  Sound:   ${s.soundPrompt || '—'}\n` +
        `🌅  Env:     ${s.environment || '—'}`
      ).join('\n\n'),
  },
];

function CopyToast({ message }) {
  if (!message) return null;
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-fade-up">
      <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-semibold text-white"
        style={{ background: 'rgba(109,40,217,0.9)', backdropFilter: 'blur(12px)', border: '1px solid rgba(139,92,246,0.4)' }}>
        <svg className="w-3.5 h-3.5 text-violet-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
        </svg>
        {message}
      </div>
    </div>
  );
}

export default function StoryboardModule() {
  const { state, dispatch, generateScenes } = useApp();
  const dragSrc = useRef(null);
  const [showSettings, setShowSettings] = useState(false);
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  const showToast = useCallback((msg) => {
    clearTimeout(toastTimer.current);
    setToast(msg);
    toastTimer.current = setTimeout(() => setToast(null), 2000);
  }, []);

  const copyCategory = useCallback((cat) => {
    const text = cat.build(state.scenes);
    navigator.clipboard.writeText(text).then(() => showToast(`${cat.icon} ${cat.label} copied!`));
  }, [state.scenes, showToast]);

  const onDragStart = (e, id) => { dragSrc.current = id; e.dataTransfer.effectAllowed = 'move'; };
  const onDragOver  = (e, id) => {
    e.preventDefault();
    if (dragSrc.current === id) return;
    const si = state.scenes.findIndex(s => s.id === dragSrc.current);
    const di = state.scenes.findIndex(s => s.id === id);
    if (si === -1 || di === -1) return;
    const next = [...state.scenes];
    const [m] = next.splice(si, 1);
    next.splice(di, 0, m);
    dispatch({ type: 'REORDER_SCENES', payload: next });
  };
  const onDragEnd = () => { dragSrc.current = null; };

  const hasScenes = state.scenes.length > 0;
  const hasPromptSettings = !!(state.customPrompt || state.stylePreset);

  return (
    <div className="flex flex-col h-full">
      {/* ── Top bar ── */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-white/[0.06] shrink-0">
        <div className="flex items-center gap-3">
          {hasScenes && <span className="badge badge-purple">{state.scenes.length} scenes</span>}
          {/* Prompt Settings toggle */}
          <button
            onClick={() => setShowSettings(v => !v)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-150 border ${
              showSettings || hasPromptSettings
                ? 'bg-violet-500/20 border-violet-500/50 text-violet-300'
                : 'border-white/[0.08] text-slate-400 hover:border-violet-500/30 hover:text-slate-200'
            }`}
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            Prompt Settings
            {hasPromptSettings && <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />}
          </button>
        </div>

        {hasScenes && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigator.clipboard.writeText(state.scenes.map(s => s.text).join('\n\n')).then(() => showToast('Script copied!'))}
              className="btn-ghost text-xs"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy Script
            </button>
            <button
              onClick={() => dispatch({ type: 'SET_MODULE', payload: 'export' })}
              className="btn-secondary text-xs"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export
            </button>
          </div>
        )}
      </div>

      {/* ── Copy-by-category toolbar (only when scenes exist) ── */}
      {hasScenes && (
        <div className="flex items-center gap-2 px-6 py-2 border-b border-white/[0.04] shrink-0 overflow-x-auto"
          style={{ background: 'rgba(0,0,0,0.12)' }}>
          <span className="text-[10px] uppercase tracking-widest text-slate-600 font-semibold shrink-0 mr-1">Copy</span>
          {COPY_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => copyCategory(cat)}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium transition-all duration-150 border ${
                cat.id === 'all'
                  ? 'border-violet-500/40 text-violet-300 hover:bg-violet-500/20 bg-violet-500/10'
                  : 'border-white/[0.08] text-slate-400 hover:border-white/20 hover:text-slate-200 hover:bg-white/[0.04]'
              }`}
            >
              <span className="text-[10px]">{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>
      )}

      {/* ── Custom Prompt Settings panel ── */}
      {showSettings && <CustomPromptSettings />}

      {/* ── Body ── */}
      {state.loading.generatingScenes ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-5">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-brand-soft border border-violet-500/25 flex items-center justify-center">
              <Spinner />
            </div>
            <div className="absolute inset-0 rounded-2xl bg-violet-500/10 blur-xl" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-white">Generating scenes…</p>
            <p className="text-xs text-slate-500 mt-1">Building your storyboard with AI prompts</p>
          </div>
          <div className="flex gap-1.5">
            {[0,1,2].map(i => (
              <div key={i} className="w-2 h-2 rounded-full bg-violet-500 animate-pulse-glow"
                style={{ animationDelay: `${i * 0.3}s` }} />
            ))}
          </div>
        </div>
      ) : !hasScenes ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-5 text-center px-6 animate-fade-up">
          <div className="w-16 h-16 rounded-2xl bg-gradient-brand-soft border border-violet-500/20 flex items-center justify-center text-3xl">🎬</div>
          <div>
            <p className="text-base font-semibold text-white">No scenes yet</p>
            <p className="text-sm text-slate-500 mt-1 max-w-xs leading-relaxed">
              Write a script in Content Generator, then click "Generate Scenes" to auto-split into a full storyboard.
            </p>
          </div>
          {state.rewrittenScript ? (
            <button onClick={generateScenes} className="btn-brand">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Generate Scenes Now
            </button>
          ) : (
            <button onClick={() => dispatch({ type: 'SET_MODULE', payload: 'transcript' })} className="btn-secondary">
              Start from Transcript
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-1 min-h-0">
          {/* Scene list */}
          <div className="w-48 shrink-0 border-r border-white/[0.06] overflow-y-auto py-2"
            style={{ background: 'rgba(0,0,0,0.15)' }}>
            {state.scenes.map(scene => (
              <button
                key={scene.id}
                onClick={() => dispatch({ type: 'SELECT_SCENE', payload: scene.id })}
                className={`w-full text-left px-4 py-3 transition-all duration-150 border-l-2 ${
                  state.selectedSceneId === scene.id
                    ? 'border-violet-500 bg-violet-500/10 text-white'
                    : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-white/[0.03]'
                }`}
              >
                <p className="text-xs font-bold">Scene {String(scene.number).padStart(2, '0')}</p>
                <p className="text-[10px] mt-0.5 leading-relaxed opacity-60 line-clamp-2">{scene.text?.slice(0, 50) || '—'}</p>
              </button>
            ))}
          </div>

          {/* Cards grid */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-2xl mx-auto space-y-4">
              {state.scenes.map(scene => (
                <div
                  key={scene.id}
                  draggable
                  onDragStart={e => onDragStart(e, scene.id)}
                  onDragOver={e => onDragOver(e, scene.id)}
                  onDragEnd={onDragEnd}
                  className="cursor-grab active:cursor-grabbing animate-fade-up"
                >
                  <SceneCard
                    scene={scene}
                    isSelected={state.selectedSceneId === scene.id}
                    onSelect={() => dispatch({ type: 'SELECT_SCENE', payload: scene.id })}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Bottom strip ── */}
      {hasScenes && (
        <div className="shrink-0 border-t border-white/[0.06] px-4 py-3 overflow-x-auto"
          style={{ background: 'rgba(0,0,0,0.25)' }}>
          <div className="flex gap-2">
            {state.scenes.map(scene => (
              <button
                key={scene.id}
                onClick={() => dispatch({ type: 'SELECT_SCENE', payload: scene.id })}
                className={`shrink-0 w-16 h-10 rounded-xl flex items-center justify-center text-xs font-bold transition-all duration-150 border ${
                  state.selectedSceneId === scene.id
                    ? 'bg-gradient-brand border-transparent text-white shadow-glow-sm'
                    : 'border-white/[0.07] text-slate-600 hover:border-violet-500/30 hover:text-slate-300'
                }`}
              >
                {scene.number}
              </button>
            ))}
          </div>
        </div>
      )}

      <CopyToast message={toast} />
    </div>
  );
}
