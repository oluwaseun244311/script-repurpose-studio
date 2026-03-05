import { useState, useCallback, useEffect } from 'react';
import { useApp } from '../context/AppContext.jsx';

function Spinner() {
  return (
    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

function SectionCard({ title, desc, children }) {
  return (
    <div className="glass-card p-6">
      <div className="mb-5 pb-4 border-b border-white/[0.06]">
        <h3 className="section-title">{title}</h3>
        {desc && <p className="text-xs text-slate-500 mt-1">{desc}</p>}
      </div>
      {children}
    </div>
  );
}

function ApiKeySection() {
  const [key, setKey] = useState(localStorage.getItem('srs_api_key') || '');
  const [saved, setSaved] = useState(!!localStorage.getItem('srs_api_key'));
  const [visible, setVisible] = useState(false);
  const [editing, setEditing] = useState(!localStorage.getItem('srs_api_key'));
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleSave = () => {
    if (!key.trim()) return;
    localStorage.setItem('srs_api_key', key.trim());
    setSaved(true);
    setEditing(false);
    setTestResult(null);
    window.dispatchEvent(new Event('storage'));
  };

  const handleDelete = () => {
    if (!window.confirm('Remove your API key? You will need to re-enter it to use AI features.')) return;
    localStorage.removeItem('srs_api_key');
    setKey('');
    setSaved(false);
    setEditing(true);
    setTestResult(null);
    window.dispatchEvent(new Event('storage'));
  };

  const handleCopy = async () => {
    if (!key) return;
    await navigator.clipboard.writeText(key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTest = useCallback(async () => {
    const testKey = key.trim() || localStorage.getItem('srs_api_key') || '';
    if (!testKey) return;
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': testKey },
      });
      const data = await res.json();
      setTestResult({ ok: res.ok && data.success, msg: data.message });
    } catch {
      setTestResult({ ok: false, msg: 'Could not reach the server. Is it running?' });
    } finally {
      setTesting(false);
    }
  }, [key]);

  const maskedKey = key ? key.slice(0, 8) + '•'.repeat(Math.max(0, key.length - 12)) + key.slice(-4) : '';

  return (
    <SectionCard
      title="Claude API Key"
      desc="Your key is stored locally in the browser and never sent to any third party except Anthropic's API."
    >
      <div className="space-y-4">

        {/* Status badge */}
        {saved && !editing && (
          <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-glow" />
              <span className="text-sm text-emerald-300 font-medium">API key saved</span>
              <span className="text-xs text-emerald-500 font-mono">{maskedKey}</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => { setEditing(true); setVisible(false); }} className="btn-ghost text-slate-400">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </button>
              <button onClick={handleDelete} className="btn-ghost text-red-400 hover:text-red-300 hover:bg-red-500/10">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Remove
              </button>
            </div>
          </div>
        )}

        {/* Input */}
        {editing && (
          <div className="space-y-3">
            <label className="label block">Anthropic API Key</label>
            <div className="relative">
              <input
                type={visible ? 'text' : 'password'}
                value={key}
                onChange={e => { setKey(e.target.value); setTestResult(null); }}
                placeholder="sk-ant-api03-..."
                className="dark-input pr-20 font-mono text-xs"
                autoComplete="off"
                spellCheck={false}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {/* Show/hide */}
                <button onClick={() => setVisible(v => !v)} className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-300 hover:bg-white/[0.07] transition-all">
                  {visible ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
                {/* Copy */}
                <button onClick={handleCopy} disabled={!key} className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-300 hover:bg-white/[0.07] transition-all disabled:opacity-30">
                  {copied ? (
                    <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <p className="text-xs text-slate-600">Get your key at <span className="text-violet-400">console.anthropic.com</span></p>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-3 flex-wrap">
          {editing && (
            <button
              onClick={handleSave}
              disabled={!key.trim()}
              className="btn-brand"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Save Key
            </button>
          )}
          <button
            onClick={handleTest}
            disabled={!key.trim() || testing}
            className="btn-secondary"
          >
            {testing ? (
              <><Spinner /> Testing…</>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Test Connection
              </>
            )}
          </button>
          {saved && !editing && (
            <button onClick={() => { setVisible(true); setEditing(true); }} className="btn-ghost text-slate-400">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Reveal & Copy
            </button>
          )}
        </div>

        {/* Test result */}
        {testResult && (
          <div className={`flex items-start gap-3 p-3 rounded-xl border animate-fade-up ${
            testResult.ok
              ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300'
              : 'bg-red-500/10 border-red-500/25 text-red-300'
          }`}>
            <div className="shrink-0 mt-0.5">
              {testResult.ok ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
              )}
            </div>
            <p className="text-sm">{testResult.msg}</p>
          </div>
        )}
      </div>
    </SectionCard>
  );
}

function PreferencesSection() {
  const { state, dispatch } = useApp();
  return (
    <SectionCard title="Preferences" desc="Default settings applied to new projects.">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="label block mb-2">Default Rewrite Style</label>
          <select
            value={state.rewriteStyle}
            onChange={e => dispatch({ type: 'SET_REWRITE_STYLE', payload: e.target.value })}
            className="dark-select w-full"
          >
            {['storytelling','dramatic','cinematic','educational','documentary','motivational','short-form'].map(s => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label block mb-2">Default Scene Duration ({state.sceneDuration}s)</label>
          <div className="flex items-center gap-3">
            <input
              type="range" min={4} max={12} step={2}
              value={state.sceneDuration}
              onChange={e => dispatch({ type: 'SET_SCENE_DURATION', payload: Number(e.target.value) })}
              className="flex-1 accent-violet-500"
            />
            <span className="text-xs text-violet-400 font-medium tabular-nums w-8">{state.sceneDuration}s</span>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}

function AppearanceSection() {
  return (
    <SectionCard title="Appearance" desc="Theme and visual settings.">
      <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-brand-soft border border-violet-500/20 flex items-center justify-center text-lg">🌙</div>
          <div>
            <p className="text-sm font-medium text-white">Dark Mode</p>
            <p className="text-xs text-slate-500">Default and only theme</p>
          </div>
        </div>
        <div className="w-10 h-6 rounded-full bg-gradient-brand flex items-center px-1 cursor-default shadow-glow-sm">
          <div className="w-4 h-4 bg-white rounded-full ml-auto" />
        </div>
      </div>
    </SectionCard>
  );
}

const STYLE_DEFS = [
  { id: 'storytelling', label: 'Storytelling',   icon: '📖', hint: 'Narrative voice, emotional arc, personal connection' },
  { id: 'dramatic',     label: 'Dramatic',        icon: '🎭', hint: 'Tension, emotional peaks, high-stakes language' },
  { id: 'cinematic',    label: 'Cinematic',       icon: '🎬', hint: 'Visual scene-setting, director\'s lens, filmic pacing' },
  { id: 'educational',  label: 'Educational',     icon: '📚', hint: 'Clear explanations, structured flow, informative' },
  { id: 'documentary',  label: 'Documentary',     icon: '🎥', hint: 'Authoritative narration, factual, objective tone' },
  { id: 'motivational', label: 'Motivational',    icon: '🚀', hint: 'High energy, inspiring, drives action' },
  { id: 'short-form',   label: 'Short-form Reel', icon: '⚡', hint: 'Punchy, fast-paced, hooks in first 3 seconds' },
];

function StylePromptsSection() {
  const { state, dispatch } = useApp();
  const [activeStyle, setActiveStyle] = useState('storytelling');

  const current    = state.stylePrompts[activeStyle] || '';
  const hasCustom  = !!current.trim();
  const def        = STYLE_DEFS.find(s => s.id === activeStyle);
  const customCount = Object.values(state.stylePrompts).filter(v => v?.trim()).length;

  const handleChange = (val) => {
    dispatch({ type: 'SET_STYLE_PROMPT', payload: { style: activeStyle, prompt: val } });
  };

  return (
    <SectionCard
      title="Style Custom Prompts"
      desc="Override the default AI instructions for each writing style. When a custom prompt is saved, the AI uses it instead of built-in defaults."
    >
      {customCount > 0 && (
        <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-xl bg-violet-500/10 border border-violet-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
          <span className="text-xs text-violet-300 font-medium">{customCount} of 7 styles have custom prompts</span>
        </div>
      )}

      {/* Style tabs */}
      <div className="flex flex-wrap gap-1.5 mb-5">
        {STYLE_DEFS.map(s => {
          const hasPrompt = !!(state.stylePrompts[s.id]?.trim());
          return (
            <button
              key={s.id}
              onClick={() => setActiveStyle(s.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-150 border ${
                activeStyle === s.id
                  ? 'bg-violet-500/20 border-violet-500/60 text-violet-300'
                  : 'border-white/[0.08] text-slate-400 hover:border-violet-500/30 hover:text-slate-200 hover:bg-white/[0.03]'
              }`}
            >
              {s.icon} {s.label}
              {hasPrompt && <span className="w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0" />}
            </button>
          );
        })}
      </div>

      {/* Active style editor */}
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-white">{def?.icon} {def?.label}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                hasCustom
                  ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                  : 'bg-white/[0.05] text-slate-500 border border-white/[0.08]'
              }`}>
                {hasCustom ? 'Custom active' : 'Using default'}
              </span>
            </div>
            <p className="text-[11px] text-slate-600 mt-0.5">{def?.hint}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className={`text-[10px] tabular-nums ${current.length > 4500 ? 'text-amber-400' : 'text-slate-600'}`}>
              {current.length.toLocaleString()} / 5,000+
            </span>
            {hasCustom && (
              <button
                onClick={() => handleChange('')}
                className="text-[10px] text-slate-500 hover:text-red-400 transition-colors px-2 py-1 rounded-lg hover:bg-red-500/10"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        <textarea
          value={current}
          onChange={e => handleChange(e.target.value)}
          rows={8}
          placeholder={`Write detailed instructions for the "${def?.label}" style…\n\nExamples of what to include:\n• Tone and voice characteristics\n• Sentence structure preferences\n• Opening hook formula\n• Pacing and rhythm rules\n• Vocabulary level and word choices\n• What to always do / never do\n• Target audience assumptions\n• Example phrases or sentence starters`}
          className="w-full bg-black/20 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-700 resize-y focus:outline-none focus:border-violet-500/50 focus:bg-black/30 transition-all leading-relaxed min-h-[180px]"
        />

        {hasCustom && (
          <div className="flex items-center gap-2 text-[11px] text-emerald-500">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            Auto-saved — AI will use this prompt when "{def?.label}" style is selected
          </div>
        )}
      </div>
    </SectionCard>
  );
}

function AboutSection() {
  return (
    <SectionCard title="About">
      <div className="space-y-3 text-sm">
        <div className="flex justify-between items-center py-2 border-b border-white/[0.05]">
          <span className="text-slate-500">App</span>
          <span className="text-white font-medium">Script Repurpose Studio</span>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-white/[0.05]">
          <span className="text-slate-500">Version</span>
          <span className="text-slate-300 font-mono">1.0.0</span>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-white/[0.05]">
          <span className="text-slate-500">AI Model</span>
          <span className="text-violet-400 font-medium">Claude Opus 4.6</span>
        </div>
        <div className="flex justify-between items-center py-2">
          <span className="text-slate-500">Storage</span>
          <span className="text-slate-300">Local (browser only)</span>
        </div>
      </div>
    </SectionCard>
  );
}

export default function SettingsModule() {
  return (
    <div className="p-6 max-w-2xl mx-auto animate-fade-up space-y-5">
      <div className="mb-2">
        <h2 className="text-xl font-bold text-white">Settings</h2>
        <p className="text-sm text-slate-500 mt-1">Manage your API keys and application preferences.</p>
      </div>

      <ApiKeySection />
      <PreferencesSection />
      <StylePromptsSection />
      <AppearanceSection />
      <AboutSection />
    </div>
  );
}
