import React, { useEffect, useState } from 'react';
import { Volume2, VolumeX, Sliders, Mic } from 'lucide-react';
import { IAudioSettings } from '@interviewpilot/shared';

interface AudioVisualizerProps {
  isListening: boolean;
  isSpeaking: boolean;
  audioSettings: IAudioSettings;
  onSettingsChange: (settings: IAudioSettings) => void;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  isListening,
  isSpeaking,
  audioSettings,
  onSettingsChange
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [waveformHeights, setWaveformHeights] = useState<number[]>([4, 8, 14, 20, 12, 6, 16, 24, 18, 10, 6, 4]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isListening || isSpeaking) {
      interval = setInterval(() => {
        setWaveformHeights((prev) =>
          prev.map(() => Math.floor(Math.random() * 26) + 4)
        );
      }, 100);
    } else {
      setWaveformHeights([4, 6, 8, 10, 8, 6, 4, 6, 8, 10, 6, 4]);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isListening, isSpeaking]);

  return (
    <div className="bg-slate-900/90 backdrop-blur border border-slate-800 rounded-xl p-3 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isListening ? (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <Mic className="w-3 h-3" /> Listening...
            </span>
          ) : isSpeaking ? (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              <Volume2 className="w-3 h-3" /> AI Speaking...
            </span>
          ) : (
            <span className="text-xs text-slate-400 flex items-center gap-1.5">
              <Volume2 className="w-3 h-3 text-slate-500" /> Voice Assistant Ready
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onSettingsChange({ ...audioSettings, ttsEnabled: !audioSettings.ttsEnabled })}
            className={`p-1.5 rounded-lg text-xs transition-colors ${
              audioSettings.ttsEnabled
                ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title={audioSettings.ttsEnabled ? 'Disable Voice Playback' : 'Enable Voice Playback'}
          >
            {audioSettings.ttsEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-1.5 rounded-lg text-xs transition-colors ${
              showSettings
                ? 'bg-slate-700 text-slate-100'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="Audio & Voice Configuration"
          >
            <Sliders className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Animated Audio Waveform */}
      <div className="h-7 flex items-center justify-center gap-1 bg-slate-950/60 rounded-lg px-3 overflow-hidden">
        {waveformHeights.map((h, i) => (
          <div
            key={i}
            className={`w-1 rounded-full transition-all duration-100 ${
              isListening
                ? 'bg-gradient-to-t from-rose-500 to-pink-400'
                : isSpeaking
                ? 'bg-gradient-to-t from-indigo-500 to-cyan-400'
                : 'bg-slate-700/60'
            }`}
            style={{ height: `${h}px` }}
          />
        ))}
      </div>

      {/* Audio Settings Dropdown */}
      {showSettings && (
        <div className="pt-2 border-t border-slate-800/80 text-xs space-y-2.5 animate-fadeIn">
          <div>
            <div className="flex justify-between text-slate-300 mb-1">
              <span>Speech Rate</span>
              <span className="text-slate-400">{audioSettings.speechRate}x</span>
            </div>
            <input
              type="range"
              min="0.75"
              max="1.5"
              step="0.05"
              value={audioSettings.speechRate}
              onChange={(e) =>
                onSettingsChange({ ...audioSettings, speechRate: parseFloat(e.target.value) })
              }
              className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>

          <div>
            <div className="flex justify-between text-slate-300 mb-1">
              <span>Speech Pitch</span>
              <span className="text-slate-400">{audioSettings.speechPitch}</span>
            </div>
            <input
              type="range"
              min="0.8"
              max="1.3"
              step="0.05"
              value={audioSettings.speechPitch}
              onChange={(e) =>
                onSettingsChange({ ...audioSettings, speechPitch: parseFloat(e.target.value) })
              }
              className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={audioSettings.autoReadResponse}
              onChange={(e) =>
                onSettingsChange({ ...audioSettings, autoReadResponse: e.target.checked })
              }
              className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-indigo-500/20"
            />
            <span className="text-slate-300">Auto-read interviewer responses aloud</span>
          </label>
        </div>
      )}
    </div>
  );
};
