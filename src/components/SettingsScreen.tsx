import React from 'react';
import { Home, Volume2, VolumeX, Vibrate, VibrateOff } from 'lucide-react';

interface SettingsScreenProps {
  audioEnabled: boolean;
  hapticsEnabled: boolean;
  onToggleAudio: () => void;
  onToggleHaptics: () => void;
  onHome: () => void;
}

export default function SettingsScreen({
  audioEnabled,
  hapticsEnabled,
  onToggleAudio,
  onToggleHaptics,
  onHome
}: SettingsScreenProps) {
  return (
    <div className="absolute inset-0 bg-slate-900 z-[100] flex flex-col p-4">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={onHome}
          className="w-12 h-12 bg-white/10 hover:bg-white/20 rounded-2xl flex items-center justify-center transition-colors"
        >
          <Home className="w-6 h-6 text-white" />
        </button>
        <h1 className="text-3xl font-black text-white tracking-wide">SETTINGS</h1>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col gap-4">
        {/* Audio Toggle */}
        <button
          onClick={onToggleAudio}
          className={`flex items-center justify-between p-6 rounded-3xl border-4 transition-all ${
            audioEnabled 
              ? 'bg-blue-500/20 border-blue-500' 
              : 'bg-slate-800 border-slate-700'
          }`}
        >
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
              audioEnabled ? 'bg-blue-500' : 'bg-slate-700'
            }`}>
              {audioEnabled ? (
                <Volume2 className="w-6 h-6 text-white" />
              ) : (
                <VolumeX className="w-6 h-6 text-white/50" />
              )}
            </div>
            <div className="text-left">
              <div className="text-white font-bold text-lg">Sound & Music</div>
              <div className="text-white/60 text-sm font-medium">
                {audioEnabled ? 'Enabled' : 'Muted'}
              </div>
            </div>
          </div>
          
          {/* Toggle Switch UI */}
          <div className={`w-14 h-8 rounded-full p-1 transition-colors ${
            audioEnabled ? 'bg-blue-500' : 'bg-slate-700'
          }`}>
            <div className={`w-6 h-6 rounded-full bg-white transition-transform ${
              audioEnabled ? 'translate-x-6' : 'translate-x-0'
            }`} />
          </div>
        </button>

        {/* Haptics Toggle */}
        <button
          onClick={onToggleHaptics}
          className={`flex items-center justify-between p-6 rounded-3xl border-4 transition-all ${
            hapticsEnabled 
              ? 'bg-purple-500/20 border-purple-500' 
              : 'bg-slate-800 border-slate-700'
          }`}
        >
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
              hapticsEnabled ? 'bg-purple-500' : 'bg-slate-700'
            }`}>
              {hapticsEnabled ? (
                <Vibrate className="w-6 h-6 text-white" />
              ) : (
                <VibrateOff className="w-6 h-6 text-white/50" />
              )}
            </div>
            <div className="text-left">
              <div className="text-white font-bold text-lg">Vibration</div>
              <div className="text-white/60 text-sm font-medium">
                {hapticsEnabled ? 'Enabled' : 'Disabled'}
              </div>
            </div>
          </div>
          
          {/* Toggle Switch UI */}
          <div className={`w-14 h-8 rounded-full p-1 transition-colors ${
            hapticsEnabled ? 'bg-purple-500' : 'bg-slate-700'
          }`}>
            <div className={`w-6 h-6 rounded-full bg-white transition-transform ${
              hapticsEnabled ? 'translate-x-6' : 'translate-x-0'
            }`} />
          </div>
        </button>
      </div>
    </div>
  );
}
