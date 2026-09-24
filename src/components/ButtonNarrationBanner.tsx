import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Sparkles, RefreshCw } from 'lucide-react';
import { buttonNarrator, ButtonNarrationEvent, speechManager } from '../services/voiceAssistantService';

export const ButtonNarrationBanner: React.FC = () => {
  const [currentEvent, setCurrentEvent] = useState<ButtonNarrationEvent | null>(null);
  const [isEnabled, setIsEnabled] = useState<boolean>(buttonNarrator.isEnabled);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Initialize global listener across the whole window/document
    buttonNarrator.initGlobalListener();

    const unsubscribe = buttonNarrator.subscribe((event) => {
      setIsEnabled(buttonNarrator.isEnabled);
      if (event) {
        setCurrentEvent(event);
        setVisible(true);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Auto hide banner after 3.8s
  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => {
      setVisible(false);
    }, 3800);
    return () => clearTimeout(timer);
  }, [visible, currentEvent]);

  if (!visible && !isEnabled) {
    return null;
  }

  return (
    <aside
      aria-label="Telugu Voice Narration"
      className="fixed top-20 sm:top-20 inset-x-0 mx-auto z-50 max-w-lg px-4 pointer-events-none transition-all duration-300 transform"
    >
      <div
        className={`pointer-events-auto rounded-2xl p-3 sm:p-3.5 shadow-2xl border backdrop-blur-md transition-all duration-300 flex items-center justify-between gap-3 ${
          visible
            ? 'opacity-100 translate-y-0 scale-100 bg-emerald-950/95 text-white border-emerald-400/50 shadow-emerald-900/40'
            : 'opacity-0 -translate-y-4 scale-95 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-amber-400 text-amber-950 flex items-center justify-center shrink-0 shadow-md">
            <Volume2 className="w-4 h-4 animate-bounce" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black tracking-wider uppercase bg-emerald-800 text-amber-300 px-1.5 py-0.5 rounded">
                వాయిస్ మార్గదర్శి
              </span>
              <span className="text-[10px] text-emerald-300 font-medium">బటన్ ప్రెస్స్</span>
            </div>
            <p className="text-xs sm:text-sm font-extrabold text-white truncate drop-shadow-xs">
              {currentEvent?.spokenText || 'బటన్ నొక్కబడింది'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {/* Re-listen button */}
          {currentEvent?.spokenText && (
            <button
              type="button"
              data-skip-narrator="true"
              onClick={() => {
                if (currentEvent?.spokenText) {
                  speechManager.speakTelugu(currentEvent.spokenText);
                }
              }}
              title="మళ్లీ వినండి (Re-play)"
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-amber-300 hover:text-white transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Toggle Narrator Mute */}
          <button
            type="button"
            data-skip-narrator="true"
            onClick={() => {
              buttonNarrator.toggle();
            }}
            title={isEnabled ? 'వాయిస్ ఆఫ్ చేయండి' : 'వాయిస్ ఆన్ చేయండి'}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-emerald-200 hover:text-white transition-colors cursor-pointer"
          >
            {isEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> : <VolumeX className="w-3.5 h-3.5 text-red-400" />}
          </button>
        </div>
      </div>
    </aside>
  );
};
