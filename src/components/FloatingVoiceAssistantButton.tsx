import React from 'react';
import { Mic, Volume2, Sparkles } from 'lucide-react';
import { Language } from '../types';

interface FloatingVoiceAssistantButtonProps {
  onClick: () => void;
  language?: Language;
  userType?: 'farmer' | 'buyer';
}

export const FloatingVoiceAssistantButton: React.FC<FloatingVoiceAssistantButtonProps> = ({
  onClick,
  language = 'te',
  userType = 'farmer',
}) => {
  return (
    <div className="fixed bottom-6 right-5 z-40 flex flex-col items-end group">
      {/* Tooltip hint above the button */}
      <div className="mb-2 hidden sm:flex items-center gap-1.5 bg-emerald-950/90 text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-lg border border-emerald-400/40 backdrop-blur-md animate-bounce">
        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
        <span>
          {language === 'te'
            ? 'చదవడం రాదా? ఇక్కడ నొక్కి మాట్లాడండి / వినండి'
            : 'Telugu Voice Assistant: Tap to speak & listen'}
        </span>
      </div>

      <button
        onClick={onClick}
        className="relative flex items-center gap-2.5 bg-gradient-to-r from-emerald-600 via-green-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white px-4 py-3 rounded-full shadow-xl hover:shadow-2xl border-2 border-emerald-200/60 transition-all duration-300 transform active:scale-95 cursor-pointer"
        aria-label="Telugu Voice Assistant"
      >
        {/* Glow ripple effect */}
        <span className="absolute -inset-1 rounded-full bg-emerald-400 opacity-30 group-hover:opacity-60 blur-sm transition-opacity" />

        <div className="relative flex items-center justify-center w-7 h-7 rounded-full bg-white/20">
          <Mic className="w-4 h-4 text-white animate-pulse" />
        </div>

        <div className="relative text-left leading-tight pr-1">
          <div className="text-xs font-black tracking-tight flex items-center gap-1">
            <span>రైతు మిత్ర AI</span>
            <Volume2 className="w-3 h-3 text-amber-300" />
          </div>
          <div className="text-[10px] text-emerald-100 font-semibold">
            {language === 'te' ? 'వాయిస్ సహాయం' : 'Telugu Voice Guide'}
          </div>
        </div>
      </button>
    </div>
  );
};
