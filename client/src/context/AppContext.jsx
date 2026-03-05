import { createContext, useContext, useReducer, useCallback } from 'react';

const AppContext = createContext(null);

const initialState = {
  activeModule: 'dashboard',

  // Transcript
  rawTranscript: '',
  cleanedTranscript: '',

  // Rewrite
  rewriteStyle: 'storytelling',
  rewriteControls: {
    videoMinutes: 2,
    videoSeconds: 0,
    energy: 'medium',
    hookStrength: 'medium',
    platform: 'youtube',
  },
  rewrittenScript: '',

  // Storyboard
  scenes: [],
  selectedSceneId: null,
  sceneDuration: 6,

  // Prompt settings (persisted to localStorage)
  customPrompt: localStorage.getItem('srs_custom_prompt') || '',
  stylePreset: localStorage.getItem('srs_style_preset') || null,
  stylePrompts: JSON.parse(localStorage.getItem('srs_style_prompts') || '{}'),

  // Loading
  loading: {
    cleaning: false,
    rewriting: false,
    generatingScenes: false,
    regeneratingSceneId: null,
    importingYoutube: false,
    generatingFromTopic: false,
  },

  // Error
  error: null,
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_MODULE':
      return { ...state, activeModule: action.payload, error: null };

    case 'SET_RAW_TRANSCRIPT':
      return { ...state, rawTranscript: action.payload };

    case 'SET_CLEANED_TRANSCRIPT':
      return { ...state, cleanedTranscript: action.payload };

    case 'SET_REWRITE_STYLE':
      return { ...state, rewriteStyle: action.payload };

    case 'SET_REWRITE_CONTROLS':
      return { ...state, rewriteControls: { ...state.rewriteControls, ...action.payload } };

    case 'SET_REWRITTEN_SCRIPT':
      return { ...state, rewrittenScript: action.payload };

    case 'SET_SCENES':
      return {
        ...state,
        scenes: action.payload,
        selectedSceneId: action.payload[0]?.id ?? null,
      };

    case 'SELECT_SCENE':
      return { ...state, selectedSceneId: action.payload };

    case 'UPDATE_SCENE':
      return {
        ...state,
        scenes: state.scenes.map(s => s.id === action.payload.id ? { ...s, ...action.payload.data } : s),
      };

    case 'DELETE_SCENE':
      return {
        ...state,
        scenes: state.scenes.filter(s => s.id !== action.payload).map((s, i) => ({ ...s, number: i + 1 })),
        selectedSceneId: state.selectedSceneId === action.payload
          ? (state.scenes.find(s => s.id !== action.payload)?.id ?? null)
          : state.selectedSceneId,
      };

    case 'DUPLICATE_SCENE': {
      const idx = state.scenes.findIndex(s => s.id === action.payload);
      if (idx === -1) return state;
      const orig = state.scenes[idx];
      const dupe = { ...orig, id: `scene_${Date.now()}` };
      const next = [...state.scenes.slice(0, idx + 1), dupe, ...state.scenes.slice(idx + 1)]
        .map((s, i) => ({ ...s, number: i + 1 }));
      return { ...state, scenes: next, selectedSceneId: dupe.id };
    }

    case 'REORDER_SCENES': {
      const renumbered = action.payload.map((s, i) => ({ ...s, number: i + 1 }));
      return { ...state, scenes: renumbered };
    }

    case 'SET_SCENE_DURATION':
      return { ...state, sceneDuration: action.payload };

    case 'SET_CUSTOM_PROMPT':
      localStorage.setItem('srs_custom_prompt', action.payload);
      return { ...state, customPrompt: action.payload };

    case 'SET_STYLE_PRESET':
      if (action.payload) localStorage.setItem('srs_style_preset', action.payload);
      else localStorage.removeItem('srs_style_preset');
      return { ...state, stylePreset: action.payload };

    case 'SET_STYLE_PROMPT': {
      const updated = { ...state.stylePrompts, [action.payload.style]: action.payload.prompt };
      localStorage.setItem('srs_style_prompts', JSON.stringify(updated));
      return { ...state, stylePrompts: updated };
    }

    case 'SET_LOADING':
      return { ...state, loading: { ...state.loading, ...action.payload } };

    case 'SET_ERROR':
      return { ...state, error: action.payload };

    case 'CLEAR_ERROR':
      return { ...state, error: null };

    case 'NEW_PROJECT':
      return { ...initialState };

    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const api = useCallback(async (endpoint, body) => {
    const apiKey = localStorage.getItem('srs_api_key') || '';
    const res = await fetch(`/api/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey && { 'x-api-key': apiKey }),
      },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
  }, []);

  const cleanTranscript = useCallback(async () => {
    const text = state.cleanedTranscript || state.rawTranscript;
    if (!text.trim()) return;
    dispatch({ type: 'SET_LOADING', payload: { cleaning: true } });
    dispatch({ type: 'CLEAR_ERROR' });
    try {
      const data = await api('clean-transcript', { transcript: text });
      dispatch({ type: 'SET_CLEANED_TRANSCRIPT', payload: data.cleaned });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { cleaning: false } });
    }
  }, [state.cleanedTranscript, state.rawTranscript, api]);

  const removeTimestamps = useCallback(() => {
    const text = state.cleanedTranscript || state.rawTranscript;
    const cleaned = text
      .replace(/\[?\d{1,2}:\d{2}(:\d{2})?\]?\s*/g, '')
      .replace(/\(\d{1,2}:\d{2}(:\d{2})?\)\s*/g, '')
      .replace(/^\s*[\d]+\s*$/gm, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
    dispatch({ type: 'SET_CLEANED_TRANSCRIPT', payload: cleaned });
  }, [state.cleanedTranscript, state.rawTranscript]);

  const importYoutube = useCallback(async (url) => {
    dispatch({ type: 'SET_LOADING', payload: { importingYoutube: true } });
    dispatch({ type: 'CLEAR_ERROR' });
    try {
      const data = await api('import-youtube', { url });
      dispatch({ type: 'SET_RAW_TRANSCRIPT', payload: data.transcript });
      dispatch({ type: 'SET_CLEANED_TRANSCRIPT', payload: data.transcript });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { importingYoutube: false } });
    }
  }, [api]);

  const rewriteScript = useCallback(async () => {
    const text = state.cleanedTranscript || state.rawTranscript;
    if (!text.trim()) return;
    dispatch({ type: 'SET_LOADING', payload: { rewriting: true } });
    dispatch({ type: 'CLEAR_ERROR' });
    try {
      const data = await api('rewrite-script', {
        transcript: text,
        style: state.rewriteStyle,
        controls: state.rewriteControls,
        stylePrompt: state.stylePrompts[state.rewriteStyle] || '',
      });
      dispatch({ type: 'SET_REWRITTEN_SCRIPT', payload: data.script });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { rewriting: false } });
    }
  }, [state.cleanedTranscript, state.rawTranscript, state.rewriteStyle, state.rewriteControls, api]);

  const generateScenes = useCallback(async () => {
    const script = state.rewrittenScript;
    if (!script.trim()) return;
    dispatch({ type: 'SET_LOADING', payload: { generatingScenes: true } });
    dispatch({ type: 'CLEAR_ERROR' });
    try {
      const data = await api('generate-scenes', {
        script,
        sceneDuration: state.sceneDuration,
        customPrompt: state.customPrompt,
        stylePreset: state.stylePreset,
      });
      const scenes = data.scenes.map((s, i) => ({
        ...s,
        id: `scene_${Date.now()}_${i}`,
        number: i + 1,
        duration: state.sceneDuration,
      }));
      dispatch({ type: 'SET_SCENES', payload: scenes });
      dispatch({ type: 'SET_MODULE', payload: 'storyboard' });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { generatingScenes: false } });
    }
  }, [state.rewrittenScript, state.sceneDuration, api]);

  const regenerateScene = useCallback(async (sceneId) => {
    const scene = state.scenes.find(s => s.id === sceneId);
    if (!scene) return;
    dispatch({ type: 'SET_LOADING', payload: { regeneratingSceneId: sceneId } });
    dispatch({ type: 'CLEAR_ERROR' });
    try {
      const data = await api('regenerate-scene', {
        sceneText: scene.text,
        sceneNumber: scene.number,
        customPrompt: state.customPrompt,
        stylePreset: state.stylePreset,
      });
      dispatch({ type: 'UPDATE_SCENE', payload: { id: sceneId, data } });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { regeneratingSceneId: null } });
    }
  }, [state.scenes, api]);

  const generateFromTopic = useCallback(async ({ topic, ideas, platform, wordTarget, style }) => {
    dispatch({ type: 'SET_LOADING', payload: { generatingFromTopic: true } });
    dispatch({ type: 'CLEAR_ERROR' });
    try {
      const data = await api('generate-from-topic', {
        topic, ideas, platform, wordTarget, style,
        stylePrompt: state.stylePrompts[style] || '',
      });
      dispatch({ type: 'SET_REWRITTEN_SCRIPT', payload: data.script });
      dispatch({ type: 'SET_MODULE', payload: 'rewrite' });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { generatingFromTopic: false } });
    }
  }, [api, state.stylePrompts]);

  return (
    <AppContext.Provider value={{ state, dispatch, cleanTranscript, removeTimestamps, importYoutube, rewriteScript, generateScenes, regenerateScene, generateFromTopic }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
