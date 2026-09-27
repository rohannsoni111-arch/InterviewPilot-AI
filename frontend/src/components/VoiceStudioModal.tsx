import React, { useState, useEffect } from 'react';
import { IVoiceProfile, IVoiceStudioSettings } from '@interviewpilot/shared';
import { api } from '../api/client';
import { Volume2, Mic, X, Play, Check, Sparkles, Sliders } from 'lucide-react';

interface VoiceStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: IVoiceStudioSettings;
  onSaveSettings: (settings: IVoiceStudioSettings) => void;
  onTestVoice?: (voiceId: string) => void;
}

export const VoiceStudioModal: React.FC<VoiceStudioModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
}) => {
  const [voices, setVoices] = useState<IVoiceProfile[]>([
    {
      id: 'sarah-rigorous',
      name: 'Sarah Blake',
      gender: 'female',
      accent: 'US English',
      style: 'Rigorous & Analytical',
      avatar: '👩‍💻',
      description: 'Principal Software Engineer focusing on algorithmic efficiency, correctness, and edge-case testing.',
    },
    {
      id: 'alex-architect',
      name: 'Alex Rivera',
      gender: 'male',
      accent: 'US English',
      style: 'Strategic & Systems-Oriented',
      avatar: '👨‍💻',
      description: 'Staff Distributed Systems Architect focusing on scalability, trade-offs, and fault-tolerance.',
    },
    {
      id: 'elena-supportive',
      name: 'Elena Rostova',
      gender: 'female',
      accent: 'UK English',
      style: 'Encouraging & Insightful',
      avatar: '👩‍🔬',
      description: 'VP of Engineering providing collaborative guidance, probing foundational principles and problem-solving velocity.',
    },
    {
      id: 'marcus-director',
      name: 'Marcus Vance',
      gender: 'male',
      accent: 'US English',
      style: 'Pragmatic & Delivery-Focused',
      avatar: '🧑‍💼',
      description: 'Engineering Director assessing behavioral alignment, technical leadership, and production pragmatism.',
    },
  ]);

  const [currentSettings, setCurrentSettings] = useState<IVoiceStudioSettings>(settings);
  const [isPlayingSample, setIsPlayingSample] = useState<string | null>(null);

  useEffect(() => {
    setCurrentSettings(settings);
  }, [settings]);

  useEffect(() => {
    if (isOpen) {
      if (api.getVoiceProfiles) {
        api.getVoiceProfiles()
          .then((res) => {
            if (res?.data && Array.isArray(res.data)) {
              setVoices(res.data);
            }
          })
          .catch(() => {
            // Keep default fallback voices
          });
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestAudioSample = (voiceId: string) => {
    setIsPlayingSample(voiceId);

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const testLine = 'Hello! I will be conducting your technical assessment today.';
      const utterance = new SpeechSynthesisUtterance(testLine);
      utterance.rate = currentSettings.speechRate || 1.0;

      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        const english = voices.filter((v) => v.lang.startsWith('en'));
        const pool = english.length > 0 ? english : voices;

        if (voiceId === 'sarah-rigorous') {
          const female = pool.find((v) => /female|jenny|samantha|zira|victoria|karen|aria/i.test(v.name));
          if (female) utterance.voice = female;
          utterance.pitch = 1.05;
        } else if (voiceId === 'alex-architect') {
          const male = pool.find((v) => /male|guy|david|alex|daniel|george/i.test(v.name));
          if (male) utterance.voice = male;
          utterance.pitch = 0.95;
        } else if (voiceId === 'elena-supportive') {
          const uk = pool.find((v) => /gb|uk|sonia|fiona|stephanie|libby/i.test(v.lang) || /sonia|fiona|libby/i.test(v.name));
          if (uk) utterance.voice = uk;
          utterance.pitch = 1.02;
        } else if (voiceId === 'marcus-director') {
          const director = pool.find((v) => /mark|george|guy|male|richard/i.test(v.name));
          if (director) utterance.voice = director;
          utterance.pitch = 0.9;
        } else {
          utterance.voice = pool[0];
        }
      }

      utterance.onend = () => setIsPlayingSample(null);
      utterance.onerror = () => setIsPlayingSample(null);
      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => setIsPlayingSample(null), 1200);
    }
  };

  const handleSave = () => {
    onSaveSettings(currentSettings);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">AI Examiner Voice Studio</h2>
              <p className="text-xs text-slate-400">Configure vocal personas, audio cadence, and interactive turn-taking</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Persona Selection */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-3">
              Select AI Examiner Persona
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {voices.map((voice) => {
                const isSelected = currentSettings.voiceId === voice.id;
                return (
                  <div
                    key={voice.id}
                    onClick={() => setCurrentSettings({ ...currentSettings, voiceId: voice.id })}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-indigo-950/40 border-indigo-500/60 ring-1 ring-indigo-500/30'
                        : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl">{voice.avatar}</span>
                        <div>
                          <h4 className="text-sm font-bold text-slate-200">{voice.name}</h4>
                          <span className="text-[10px] text-indigo-400 font-medium px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20">
                            {voice.style}
                          </span>
                        </div>
                      </div>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center text-white">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mb-3 line-clamp-2">{voice.description}</p>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs">
                      <span className="text-slate-500">{voice.accent}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTestAudioSample(voice.id);
                        }}
                        disabled={isPlayingSample === voice.id}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1 text-[11px] font-medium transition-colors"
                      >
                        <Play className="w-3 h-3 text-indigo-400" />
                        {isPlayingSample === voice.id ? 'Sampling...' : 'Sample'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Audio Cadence & Speech Rate */}
          <div className="p-4 bg-slate-950/40 border border-slate-800 rounded-2xl space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5 text-indigo-400" />
              Speech Synthesis Controls
            </h3>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1.5">
                  <span>Speaking Rate</span>
                  <span className="text-indigo-400 font-mono font-bold">{currentSettings.speechRate}x</span>
                </div>
                <input
                  type="range"
                  min="0.75"
                  max="1.5"
                  step="0.05"
                  value={currentSettings.speechRate}
                  onChange={(e) =>
                    setCurrentSettings({ ...currentSettings, speechRate: parseFloat(e.target.value) })
                  }
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>

              <div className="flex flex-col gap-2.5 pt-2">
                <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
                  <div className="flex items-center gap-2 text-xs">
                    <Volume2 className="w-4 h-4 text-indigo-400" />
                    <div>
                      <span className="font-semibold text-slate-200 block">Auto-Play Examiner Speech</span>
                      <span className="text-[11px] text-slate-500">Automatically stream AI questions aloud upon arrival</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={currentSettings.autoPlayTTS}
                    onChange={(e) =>
                      setCurrentSettings({ ...currentSettings, autoPlayTTS: e.target.checked })
                    }
                    className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-indigo-500/20"
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
                  <div className="flex items-center gap-2 text-xs">
                    <Mic className="w-4 h-4 text-emerald-400" />
                    <div>
                      <span className="font-semibold text-slate-200 block">Real-Time Interim Transcription</span>
                      <span className="text-[11px] text-slate-500">Stream candidate speech tokens live into answer draft</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={currentSettings.interimTranscription}
                    onChange={(e) =>
                      setCurrentSettings({ ...currentSettings, interimTranscription: e.target.checked })
                    }
                    className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-indigo-500/20"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/80 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all shadow-lg shadow-indigo-600/20"
          >
            Apply Voice Settings
          </button>
        </div>
      </div>
    </div>
  );
};
