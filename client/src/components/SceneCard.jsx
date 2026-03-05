import { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';

function Spinner() {
  return (
    <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

const FIELDS = [
  { key: 'imagePrompt', label: 'Image Prompt',  emoji: '🖼',  rows: 2 },
  { key: 'brollPrompt', label: 'B-roll',         emoji: '🎥',  rows: 1 },
  { key: 'soundPrompt', label: 'Sound',          emoji: '🔊',  rows: 1 },
  { key: 'environment', label: 'Environment',   emoji: '🌅',  rows: 1 },
  { key: 'cameraAngle', label: 'Camera',         emoji: '📷',  rows: 1 },
];

export default function SceneCard({ scene, isSelected, onSelect }) {
  const { state, dispatch, regenerateScene } = useApp();
  const [expanded, setExpanded] = useState(true);
  const isRegen = state.loading.regeneratingSceneId === scene.id;

  const update = (key, val) =>
    dispatch({ type: 'UPDATE_SCENE', payload: { id: scene.id, data: { [key]: val } } });

  return (
    <div
      onClick={onSelect}
      className={`rounded-2xl border transition-all duration-200 cursor-pointer overflow-hidden ${
        isSelected
          ? 'border-violet-500/40 shadow-glow-sm'
          : 'border-white/[0.07] hover:border-white/[0.12]'
      }`}
      style={{
        background: isSelected
          ? 'linear-gradient(145deg, rgba(124,58,237,0.08) 0%, rgba(255,255,255,0.03) 100%)'
          : 'rgba(255,255,255,0.03)'
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.06]">
        <span className={`text-xs font-bold tabular-nums w-8 ${isSelected ? 'text-violet-400' : 'text-slate-600'}`}>
          {String(scene.number).padStart(2, '0')}
        </span>
        <span className="text-xs text-slate-600">{scene.duration}s</span>

        <div className="flex items-center gap-1 ml-auto">
          <button
            onClick={e => { e.stopPropagation(); regenerateScene(scene.id); }}
            disabled={isRegen}
            title="Regenerate prompts"
            className="btn-ghost text-slate-600 hover:text-violet-400 px-2 py-1"
          >
            {isRegen ? <Spinner /> : (
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            )}
          </button>
          <button
            onClick={e => { e.stopPropagation(); dispatch({ type: 'DUPLICATE_SCENE', payload: scene.id }); }}
            title="Duplicate" className="btn-ghost text-slate-600 hover:text-slate-300 px-2 py-1"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
          <button
            onClick={e => { e.stopPropagation(); dispatch({ type: 'DELETE_SCENE', payload: scene.id }); }}
            title="Delete" className="btn-ghost text-slate-600 hover:text-red-400 px-2 py-1"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
          <button
            onClick={e => { e.stopPropagation(); setExpanded(v => !v); }}
            className="btn-ghost text-slate-600 px-2 py-1"
          >
            <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Scene text */}
      <div className="px-4 pt-3 pb-2">
        <p className="label mb-1.5 text-[10px]">Text</p>
        <textarea
          className="w-full bg-transparent border-0 text-sm text-slate-200 resize-none focus:outline-none leading-relaxed placeholder-slate-700"
          value={scene.text}
          rows={3}
          onChange={e => update('text', e.target.value)}
          onClick={e => e.stopPropagation()}
          placeholder="Scene text…"
        />
      </div>

      {/* Prompt fields */}
      {expanded && (
        <div className="px-4 pb-4 space-y-2.5 border-t border-white/[0.05] pt-3">
          {FIELDS.map(({ key, label, emoji, rows }) => (
            <div key={key}>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-xs">{emoji}</span>
                <p className="label text-[10px]">{label}</p>
              </div>
              <textarea
                className="w-full text-xs text-slate-400 bg-white/[0.04] border border-white/[0.06] rounded-lg px-3 py-2 resize-none focus:outline-none focus:border-violet-500/30 focus:text-slate-300 transition-all placeholder-slate-700 leading-relaxed"
                value={scene[key] || ''}
                rows={rows}
                onChange={e => update(key, e.target.value)}
                onClick={e => e.stopPropagation()}
                placeholder={`${label.toLowerCase()}…`}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
