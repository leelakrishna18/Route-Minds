import React from 'react';
import { Mic, Sparkles } from 'lucide-react';

interface FloatingVoiceButtonProps {
  onClick: () => void;
}

export const FloatingVoiceButton: React.FC<FloatingVoiceButtonProps> = ({ onClick }) => {
  return (
    <aside
      aria-label="APSRTC Voice Assistant"
      className="fixed bottom-5 right-5 z-[9990] flex items-center group cursor-pointer"
      onClick={onClick}
    >
      <div className="hidden sm:flex items-center space-x-1.5 mr-2.5 bg-slate-900/90 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg backdrop-blur-sm border border-slate-700/60 transform transition duration-200 group-hover:scale-105">
        <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
        <span>Ask Voice Assistant</span>
      </div>

      <button
        type="button"
        aria-label="Open APSRTC AI Voice Assistant"
        className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-purple-700 via-indigo-600 to-apsrtc-primary text-white flex items-center justify-center shadow-xl hover:shadow-2xl transition duration-300 transform group-hover:scale-110 active:scale-95 border-2 border-white/60 relative focus:outline-none focus:ring-4 focus:ring-purple-300"
      >
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white"></span>
        <Mic className="w-6 h-6 animate-pulse" />
      </button>
    </aside>
  );
};
