import { useState, useRef } from 'react';
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

const PLATFORMS = ['youtube', 'tiktok', 'instagram', 'podcast', 'linkedin'];
const WPM = 155;
const STYLES = [
  { id: 'storytelling',  label: 'Storytelling',  icon: '📖' },
  { id: 'dramatic',      label: 'Dramatic',       icon: '🎭' },
  { id: 'cinematic',     label: 'Cinematic',      icon: '🎬' },
  { id: 'educational',   label: 'Educational',    icon: '📚' },
  { id: 'documentary',   label: 'Documentary',    icon: '🎥' },
  { id: 'motivational',  label: 'Motivational',   icon: '🔥' },
  { id: 'short-form',    label: 'Short-form',     icon: '⚡' },
];

function TopicForm() {
  const { state, generateFromTopic } = useApp();
  const [topic,    setTopic]    = useState('');
  const [ideas,    setIdeas]    = useState('');
  const [platform, setPlatform] = useState('youtube');
  const [vidMins,  setVidMins]  = useState(2);
  const [vidSecs,  setVidSecs]  = useState(0);
  const [style,    setStyle]    = useState('storytelling');

  const wordTarget  = Math.round(((vidMins * 60) + vidSecs) * WPM / 60);
  const canGenerate = topic.trim().length > 0 && !state.loading.generatingFromTopic;

  const handleGenerate = () => {
    if (!canGenerate) return;
    generateFromTopic({ topic, ideas, platform, wordTarget, style });
  };

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-2xl mx-auto space-y-5">

        {/* Topic */}
        <div>
          <label className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold block mb-1.5">
            Topic <span className="text-violet-400">*</span>
          </label>
          <input
            type="text"
            value={topic}
            onChange={e => setTopic(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleGenerate()}
            placeholder="e.g. How to build a morning routine that actually sticks"
            className="w-full bg-black/20 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-violet-500/50 focus:bg-black/30 transition-all"
            autoFocus
          />
        </div>

        {/* Ideas / Notes */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">
              Key Ideas &amp; Notes
              <span className="ml-2 text-slate-700 normal-case tracking-normal font-normal">optional</span>
            </label>
            <span className="text-[10px] text-slate-700">{ideas.length}/2000</span>
          </div>
          <textarea
            value={ideas}
            onChange={e => setIdeas(e.target.value.slice(0, 2000))}
            rows={5}
            placeholder={"Add bullet points, angles, hooks, or key messages you want covered:\n• Start with a relatable struggle\n• The 3 non-negotiable habits\n• Why most people quit in week 2\n• Actionable step-by-step breakdown"}
            className="w-full bg-black/20 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-600 resize-none focus:outline-none focus:border-violet-500/50 focus:bg-black/30 transition-all leading-relaxed"
          />
        </div>

        {/* Style */}
        <div>
          <label className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold block mb-2">Style</label>
          <div className="flex flex-wrap gap-2">
            {STYLES.map(s => (
              <button
                key={s.id}
                onClick={() => setStyle(s.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-150 border ${
                  style === s.id
                    ? 'bg-violet-500/20 border-violet-500/60 text-violet-300'
                    : 'border-white/[0.08] text-slate-400 hover:border-violet-500/30 hover:text-slate-200 hover:bg-white/[0.04]'
                }`}
              >
                {s.icon} {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Length + Platform row */}
        <div className="flex gap-4 flex-wrap">
          <div className="flex-1 min-w-[180px]">
            <VideoLengthInput
              minutes={vidMins}
              seconds={vidSecs}
              onChange={({ minutes, seconds }) => { setVidMins(minutes); setVidSecs(seconds); }}
            />
          </div>

          <div className="flex-1 min-w-[140px]">
            <label className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold block mb-2">Platform</label>
            <select
              value={platform}
              onChange={e => setPlatform(e.target.value)}
              className="w-full bg-black/20 border border-white/[0.08] rounded-xl px-3 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-violet-500/50 transition-all capitalize"
            >
              {PLATFORMS.map(p => (
                <option key={p} value={p} className="bg-slate-900 capitalize">{p}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Generate button */}
        <div className="flex justify-end pt-2">
          <button
            onClick={handleGenerate}
            disabled={!canGenerate}
            className="btn-brand px-6"
          >
            {state.loading.generatingFromTopic ? (
              <><Spinner /> Generating…</>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Generate Script
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}

export default function TranscriptModule() {
  const { state, dispatch, cleanTranscript, removeTimestamps, importYoutube } = useApp();
  const [activeTab,        setActiveTab]        = useState('transcript');
  const [youtubeUrl,       setYoutubeUrl]       = useState('');
  const [showYoutubeInput, setShowYoutubeInput] = useState(false);
  const fileInputRef = useRef(null);

  const displayText = state.cleanedTranscript || state.rawTranscript;

  const handleTextChange = (e) => {
    dispatch({ type: 'SET_RAW_TRANSCRIPT', payload: e.target.value });
    dispatch({ type: 'SET_CLEANED_TRANSCRIPT', payload: '' });
  };

  const handleCleanedChange = (e) => {
    dispatch({ type: 'SET_CLEANED_TRANSCRIPT', payload: e.target.value });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      dispatch({ type: 'SET_RAW_TRANSCRIPT', payload: ev.target.result });
      dispatch({ type: 'SET_CLEANED_TRANSCRIPT', payload: '' });
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleYoutubeImport = async () => {
    if (!youtubeUrl.trim()) return;
    await importYoutube(youtubeUrl.trim());
    setYoutubeUrl('');
    setShowYoutubeInput(false);
  };

  const wordCount = displayText.trim() ? displayText.trim().split(/\s+/).length : 0;
  const charCount = displayText.length;

  return (
    <div className="flex flex-col h-full">

      {/* ── Tab switcher ── */}
      <div className="flex items-center gap-1 px-6 py-3 border-b border-white/[0.06]">
        <button
          onClick={() => setActiveTab('transcript')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-150 ${
            activeTab === 'transcript'
              ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40'
              : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.04] border border-transparent'
          }`}
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Transcript
        </button>
        <button
          onClick={() => setActiveTab('topic')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-150 ${
            activeTab === 'topic'
              ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40'
              : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.04] border border-transparent'
          }`}
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          Topic &amp; Ideas
        </button>
      </div>

      {/* ── Transcript tab ── */}
      {activeTab === 'transcript' && (
        <>
          {/* Transcript toolbar */}
          <div className="flex items-center gap-2 px-6 py-3 border-b border-white/[0.06]">
            <button onClick={() => fileInputRef.current?.click()} className="btn-secondary text-xs">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Upload .txt
            </button>
            <input ref={fileInputRef} type="file" accept=".txt" className="hidden" onChange={handleFileUpload} />

            <button onClick={() => setShowYoutubeInput(v => !v)} className="btn-secondary text-xs">
              <svg className="w-3.5 h-3.5 text-red-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
              YouTube Import
            </button>

            <div className="ml-auto flex items-center gap-3">
              {state.cleanedTranscript && (
                <span className="badge badge-green text-[10px]">✓ Cleaned</span>
              )}
              {wordCount > 0 && (
                <span className="text-xs text-slate-600">{wordCount.toLocaleString()} words · {charCount.toLocaleString()} chars</span>
              )}
            </div>
          </div>

          {/* YouTube URL bar */}
          {showYoutubeInput && (
            <div className="flex items-center gap-3 px-6 py-3 border-b border-amber-500/15 bg-amber-500/5 animate-fade-up">
              <svg className="w-4 h-4 text-red-400 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
              <input
                type="text"
                placeholder="Paste YouTube URL…"
                value={youtubeUrl}
                onChange={e => setYoutubeUrl(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleYoutubeImport()}
                className="flex-1 bg-transparent text-sm text-slate-300 placeholder-slate-600 border-0 focus:outline-none"
                autoFocus
              />
              <button onClick={handleYoutubeImport} disabled={state.loading.importingYoutube || !youtubeUrl.trim()} className="btn-brand text-xs py-2">
                {state.loading.importingYoutube ? <Spinner /> : 'Import'}
              </button>
              <button onClick={() => setShowYoutubeInput(false)} className="text-slate-600 hover:text-slate-400 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          {/* Main textarea */}
          <div className="flex-1 flex flex-col p-6 gap-4 min-h-0">
            <div className="flex-1 glass-card p-5 flex flex-col min-h-0">
              <textarea
                className="flex-1 w-full bg-transparent border-0 text-sm text-slate-200 placeholder-slate-700 resize-none focus:outline-none leading-relaxed font-mono"
                placeholder={"Paste your transcript here…\n\nYou can paste raw YouTube transcripts, interview recordings, podcast transcripts — anything spoken-word.\n\nThen use the tools below to clean and generate your script."}
                value={displayText}
                onChange={state.cleanedTranscript ? handleCleanedChange : handleTextChange}
                spellCheck={false}
              />
            </div>

            {/* Action row */}
            <div className="flex items-center gap-3 flex-wrap">
              <button onClick={removeTimestamps} disabled={!displayText.trim()} className="btn-secondary text-xs">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Remove Timestamps
              </button>

              <button onClick={cleanTranscript} disabled={!displayText.trim() || state.loading.cleaning} className="btn-secondary text-xs">
                {state.loading.cleaning ? <Spinner /> : (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                  </svg>
                )}
                {state.loading.cleaning ? 'Cleaning…' : 'AI Clean'}
              </button>

              {displayText.trim() && (
                <button
                  onClick={() => { dispatch({ type: 'SET_RAW_TRANSCRIPT', payload: '' }); dispatch({ type: 'SET_CLEANED_TRANSCRIPT', payload: '' }); }}
                  className="btn-ghost text-slate-600 text-xs"
                >
                  Clear
                </button>
              )}

              <div className="ml-auto">
                <button
                  onClick={() => dispatch({ type: 'SET_MODULE', payload: 'rewrite' })}
                  disabled={!displayText.trim()}
                  className="btn-brand"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Generate Script
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── Topic & Ideas tab ── */}
      {activeTab === 'topic' && <TopicForm />}
    </div>
  );
}
