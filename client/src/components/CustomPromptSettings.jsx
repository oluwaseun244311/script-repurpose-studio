import { useApp } from '../context/AppContext.jsx';

const STYLE_PRESETS = [
  { id: 'anime',    label: 'Anime',     icon: '✨', modifier: 'anime style, cel shading, vibrant colors, manga-inspired artwork' },
  { id: 'realism',  label: 'Realism',   icon: '📷', modifier: 'photorealistic, highly detailed, cinematic photography, 8K resolution, professional lighting' },
  { id: 'cartoon',  label: 'Cartoon',   icon: '🎨', modifier: 'cartoon style, bold outlines, flat colors, playful illustration' },
  { id: '3d',       label: '3D Render', icon: '🎯', modifier: '3D rendering, CGI, Pixar-style, volumetric lighting, ray tracing, high-poly models' },
  { id: 'faceless', label: 'Faceless',  icon: '👤', modifier: 'faceless humanoid character, silhouette figure, abstract human form, no visible facial features' },
];

export { STYLE_PRESETS };

export default function CustomPromptSettings() {
  const { state, dispatch } = useApp();
  const { customPrompt, stylePreset } = state;

  const handlePromptChange = (e) => {
    dispatch({ type: 'SET_CUSTOM_PROMPT', payload: e.target.value });
  };

  const togglePreset = (id) => {
    dispatch({ type: 'SET_STYLE_PRESET', payload: stylePreset === id ? null : id });
  };

  const activeModifier = STYLE_PRESETS.find(p => p.id === stylePreset)?.modifier || '';
  const preview = [customPrompt.trim(), activeModifier].filter(Boolean).join(' • ');

  return (
    <div className="border-b border-white/[0.06] px-6 py-4 space-y-4"
      style={{ background: 'rgba(109,40,217,0.04)' }}>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-white">Custom Prompt Settings</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Master instruction applied to every generated prompt</p>
        </div>
        {(customPrompt || stylePreset) && (
          <button
            onClick={() => {
              dispatch({ type: 'SET_CUSTOM_PROMPT', payload: '' });
              dispatch({ type: 'SET_STYLE_PRESET', payload: null });
            }}
            className="text-[10px] text-slate-500 hover:text-red-400 transition-colors px-2 py-1 rounded-lg hover:bg-red-500/10"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Style Presets */}
      <div>
        <p className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold mb-2">Style Preset</p>
        <div className="flex flex-wrap gap-2">
          {STYLE_PRESETS.map(preset => (
            <button
              key={preset.id}
              onClick={() => togglePreset(preset.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-150 border ${
                stylePreset === preset.id
                  ? 'bg-violet-500/20 border-violet-500/60 text-violet-300 shadow-glow-sm'
                  : 'border-white/[0.08] text-slate-400 hover:border-violet-500/30 hover:text-slate-200 hover:bg-white/[0.04]'
              }`}
            >
              <span>{preset.icon}</span>
              {preset.label}
              {stylePreset === preset.id && (
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Prompt Textarea */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">World Context</p>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] tabular-nums ${customPrompt.length > 4500 ? 'text-amber-400' : 'text-slate-600'}`}>
              {customPrompt.length}/5000
            </span>
            {customPrompt && (
              <button
                onClick={() => dispatch({ type: 'SET_CUSTOM_PROMPT', payload: '' })}
                className="text-[10px] text-slate-500 hover:text-red-400 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>
        <textarea
          value={customPrompt}
          onChange={handlePromptChange}
          maxLength={5000}
          rows={3}
          placeholder="Describe your world, characters, rules, and constraints… e.g. 'Futuristic city, neon-lit streets, protagonist is a young woman with short silver hair wearing a black trench coat'"
          className="w-full bg-black/20 border border-white/[0.08] rounded-xl px-3 py-2.5 text-xs text-slate-200 placeholder-slate-600 resize-none focus:outline-none focus:border-violet-500/50 focus:bg-black/30 transition-all leading-relaxed"
        />
      </div>

      {/* Active Preview */}
      {preview && (
        <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 px-3 py-2">
          <p className="text-[10px] uppercase tracking-widest text-violet-400 font-semibold mb-1">Active base prompt</p>
          <p className="text-[10px] text-slate-400 leading-relaxed line-clamp-2">{preview}</p>
        </div>
      )}
    </div>
  );
}
