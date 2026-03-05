import { useState, useEffect } from 'react';

const WPM = 155;

const toWords  = (m, s) => Math.round(((m * 60) + s) * WPM / 60);
const toTime   = (words) => {
  const totalSec = Math.round((words / WPM) * 60);
  return { minutes: Math.floor(totalSec / 60), seconds: totalSec % 60 };
};
const fmtTime  = (m, s) => s > 0 ? `${m}m ${String(s).padStart(2,'0')}s` : `${m}m`;

export default function VideoLengthInput({ minutes = 2, seconds = 0, onChange, label = 'Video Length' }) {
  const wordTarget  = toWords(minutes, seconds);
  const totalSecs   = minutes * 60 + seconds;

  // Bidirectional word editor state
  const [wordEdit,    setWordEdit]    = useState(false);
  const [wordDraft,   setWordDraft]   = useState('');

  useEffect(() => {
    if (!wordEdit) setWordDraft(String(wordTarget));
  }, [wordTarget, wordEdit]);

  const clamp = (val, min, max) => Math.max(min, Math.min(max, parseInt(val) || 0));

  const handleMinutes = (val) => {
    onChange({ minutes: clamp(val, 0, 60), seconds });
  };
  const handleSeconds = (val) => {
    let s = clamp(val, 0, 59);
    onChange({ minutes, seconds: s });
  };

  const commitWords = () => {
    const words = parseInt(wordDraft);
    if (words > 0) {
      const t = toTime(words);
      onChange(t);
    }
    setWordEdit(false);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">{label}</label>
        <span className="text-[10px] text-slate-600">@ {WPM} wpm</span>
      </div>

      {/* Minutes + Seconds inputs */}
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <div className="relative">
            <input
              type="number"
              min={0} max={60}
              value={minutes}
              onChange={e => handleMinutes(e.target.value)}
              className="w-full bg-black/20 border border-white/[0.08] rounded-xl px-3 py-2 text-sm text-center font-semibold text-slate-200 focus:outline-none focus:border-violet-500/50 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-600 pointer-events-none">min</span>
          </div>
        </div>

        <span className="text-slate-700 text-sm font-bold shrink-0">:</span>

        <div className="flex-1">
          <div className="relative">
            <input
              type="number"
              min={0} max={59}
              value={String(seconds).padStart(2, '0')}
              onChange={e => handleSeconds(e.target.value)}
              className="w-full bg-black/20 border border-white/[0.08] rounded-xl px-3 py-2 text-sm text-center font-semibold text-slate-200 focus:outline-none focus:border-violet-500/50 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-600 pointer-events-none">sec</span>
          </div>
        </div>
      </div>

      {/* Live feedback row */}
      {totalSecs > 0 && (
        <div className="flex items-center justify-between px-1">
          <span className="text-[10px] text-slate-600">{fmtTime(minutes, seconds)}</span>

          {/* Editable word target — click to edit, blur to back-calculate */}
          {wordEdit ? (
            <div className="flex items-center gap-1">
              <input
                type="number"
                min={1}
                value={wordDraft}
                onChange={e => setWordDraft(e.target.value)}
                onBlur={commitWords}
                onKeyDown={e => { if (e.key === 'Enter') commitWords(); if (e.key === 'Escape') setWordEdit(false); }}
                autoFocus
                className="w-16 bg-black/30 border border-violet-500/40 rounded-lg px-2 py-0.5 text-[11px] text-violet-300 text-center focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <span className="text-[10px] text-slate-600">words</span>
            </div>
          ) : (
            <button
              onClick={() => { setWordDraft(String(wordTarget)); setWordEdit(true); }}
              className="flex items-center gap-1 group"
              title="Click to set by word count"
            >
              <span className="text-[11px] font-semibold text-violet-400 tabular-nums">
                ≈ {wordTarget.toLocaleString()}
              </span>
              <span className="text-[10px] text-slate-600">words</span>
              <svg className="w-2.5 h-2.5 text-slate-700 group-hover:text-slate-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
          )}
        </div>
      )}

      {totalSecs === 0 && (
        <p className="text-[10px] text-slate-700 px-1">Enter minutes and/or seconds above</p>
      )}
    </div>
  );
}
