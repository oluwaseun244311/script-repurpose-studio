import { useApp } from '../context/AppContext.jsx';
import VideoLengthInput from '../components/VideoLengthInput.jsx';

function Spinner() {
  return (
    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

const STYLES = [
  { id: 'storytelling', label: 'Storytelling',   emoji: '📖' },
  { id: 'dramatic',     label: 'Dramatic',        emoji: '🎭' },
  { id: 'cinematic',    label: 'Cinematic',       emoji: '🎬' },
  { id: 'educational',  label: 'Educational',     emoji: '📚' },
  { id: 'documentary',  label: 'Documentary',     emoji: '🎥' },
  { id: 'motivational', label: 'Motivational',    emoji: '🚀' },
  { id: 'short-form',   label: 'Short-form Reel', emoji: '⚡' },
];

function SelectRow({ label, value, options, onChange }) {
  return (
    <div>
      <label className="label block mb-1.5">{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)} className="dark-select w-full">
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

export default function RewriteModule() {
  const { state, dispatch, rewriteScript, generateScenes } = useApp();
  const hasTranscript = !!(state.cleanedTranscript || state.rawTranscript).trim();
  const hasScript = !!state.rewrittenScript.trim();
  const wordCount = hasScript ? state.rewrittenScript.trim().split(/\s+/).length : 0;
  const setControl = key => val => dispatch({ type: 'SET_REWRITE_CONTROLS', payload: { [key]: val } });

  return (
    <div className="flex h-full">
      {/* Left panel */}
      <div className="w-64 shrink-0 border-r border-white/[0.06] flex flex-col overflow-y-auto"
        style={{ background: 'rgba(0,0,0,0.2)' }}>
        <div className="px-5 py-5 border-b border-white/[0.06]">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Style</p>
        </div>

        {/* Style presets */}
        <div className="px-3 py-3 space-y-0.5">
          {STYLES.map(s => (
            <button
              key={s.id}
              onClick={() => dispatch({ type: 'SET_REWRITE_STYLE', payload: s.id })}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 text-left ${
                state.rewriteStyle === s.id
                  ? 'bg-gradient-brand-soft border border-violet-500/20 text-white font-semibold'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.04]'
              }`}
            >
              <span className="text-base">{s.emoji}</span>
              {s.label}
              {state.rewriteStyle === s.id && (
                <svg className="w-3.5 h-3.5 ml-auto text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          ))}
        </div>

        <div className="px-5 py-4 space-y-4 border-t border-white/[0.06] mt-2">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Controls</p>

          <VideoLengthInput
            minutes={state.rewriteControls.videoMinutes}
            seconds={state.rewriteControls.videoSeconds}
            onChange={({ minutes, seconds }) => {
              dispatch({ type: 'SET_REWRITE_CONTROLS', payload: { videoMinutes: minutes, videoSeconds: seconds } });
            }}
          />
          <SelectRow
            label="Energy"
            value={state.rewriteControls.energy}
            onChange={setControl('energy')}
            options={[
              { value: 'low',    label: 'Low — Calm' },
              { value: 'medium', label: 'Medium — Balanced' },
              { value: 'high',   label: 'High — Dynamic' },
            ]}
          />
          <SelectRow
            label="Hook Strength"
            value={state.rewriteControls.hookStrength}
            onChange={setControl('hookStrength')}
            options={[
              { value: 'low',    label: 'Soft opening' },
              { value: 'medium', label: 'Solid hook' },
              { value: 'high',   label: 'Power hook' },
            ]}
          />
          <SelectRow
            label="Platform"
            value={state.rewriteControls.platform}
            onChange={setControl('platform')}
            options={[
              { value: 'youtube',   label: 'YouTube' },
              { value: 'tiktok',    label: 'TikTok' },
              { value: 'instagram', label: 'Instagram' },
              { value: 'podcast',   label: 'Podcast' },
              { value: 'linkedin',  label: 'LinkedIn' },
            ]}
          />
        </div>

        {/* Rewrite btn */}
        <div className="px-4 py-4 mt-auto border-t border-white/[0.06]">
          <button
            onClick={rewriteScript}
            disabled={!hasTranscript || state.loading.rewriting}
            className="btn-brand w-full justify-center"
          >
            {state.loading.rewriting ? <><Spinner />Rewriting…</> : <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Rewrite Script
            </>}
          </button>
          {!hasTranscript && <p className="text-xs text-slate-600 mt-2 text-center">Add a transcript first</p>}
        </div>
      </div>

      {/* Right — output */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-white/[0.06] shrink-0">
          <div className="flex items-center gap-3">
            {hasScript && <span className="badge badge-purple">{wordCount} words</span>}
            {state.loading.rewriting && <span className="text-xs text-slate-500 animate-pulse">Generating…</span>}
          </div>
          {hasScript && (
            <button onClick={() => navigator.clipboard.writeText(state.rewrittenScript)} className="btn-ghost">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy
            </button>
          )}
        </div>

        {/* Output */}
        <div className="flex-1 overflow-y-auto p-6">
          {state.loading.rewriting ? (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-brand-soft border border-violet-500/20 flex items-center justify-center animate-pulse-glow">
                <svg className="w-5 h-5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
              </div>
              <p className="text-sm text-slate-400">Rewriting in <span className="text-violet-400 font-medium capitalize">{state.rewriteStyle}</span> style…</p>
            </div>
          ) : hasScript ? (
            <div className="max-w-2xl mx-auto animate-fade-up">
              <textarea
                className="w-full min-h-96 bg-transparent border-0 text-sm text-slate-200 leading-relaxed resize-none focus:outline-none"
                value={state.rewrittenScript}
                onChange={e => dispatch({ type: 'SET_REWRITTEN_SCRIPT', payload: e.target.value })}
                spellCheck={false}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <div className="w-14 h-14 rounded-2xl bg-gradient-brand-soft border border-violet-500/20 flex items-center justify-center text-2xl">✨</div>
              <div>
                <p className="text-sm font-semibold text-white">Ready to rewrite</p>
                <p className="text-xs text-slate-600 mt-1 max-w-xs">Choose a style and click Rewrite Script to transform your transcript into polished content.</p>
              </div>
            </div>
          )}
        </div>

        {/* Generate scenes footer */}
        {hasScript && (
          <div className="shrink-0 px-6 py-4 border-t border-white/[0.06]" style={{ background: 'rgba(0,0,0,0.2)' }}>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <label className="label text-[10px]">Scene Duration</label>
                  <span className="text-xs text-violet-400 font-medium">{state.sceneDuration}s</span>
                </div>
                <input type="range" min={4} max={12} step={2}
                  value={state.sceneDuration}
                  onChange={e => dispatch({ type: 'SET_SCENE_DURATION', payload: Number(e.target.value) })}
                  className="w-full accent-violet-500" />
              </div>
              <button onClick={generateScenes} disabled={state.loading.generatingScenes} className="btn-brand shrink-0">
                {state.loading.generatingScenes ? (
                  <><Spinner />Generating…</>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                    Generate Scenes
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
