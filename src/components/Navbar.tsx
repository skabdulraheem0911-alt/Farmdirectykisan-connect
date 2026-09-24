import React, { useState, useRef, useEffect } from 'react';
import { User, Language } from '../types';
import { Sprout, Globe, LogOut, ShieldCheck, ChevronDown, Check, Mic, Volume2, VolumeX } from 'lucide-react';
import { getTranslatedUserName, getTranslatedVillageName, SUPPORTED_LANGUAGES } from '../data/translations';
import { buttonNarrator } from '../services/voiceAssistantService';

interface NavbarProps {
  user: User | null;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onLogout: () => void;
  onNavigateHome?: () => void;
  onOpenVoiceAssistant?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  language,
  onLanguageChange,
  onLogout,
  onNavigateHome,
  onOpenVoiceAssistant,
}) => {
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isNarratorOn, setIsNarratorOn] = useState(buttonNarrator.isEnabled);
  const langMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return buttonNarrator.subscribe(() => {
      setIsNarratorOn(buttonNarrator.isEnabled);
    });
  }, []);

  const currentLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(e.target as Node)) {
        setIsLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getSubTitle = () => {
    switch (language) {
      case 'te':
        return 'రైతు ప్రత్యక్ష మార్కెట్';
      case 'hi':
        return 'सीधा कृषि बाज़ार';
      case 'ta':
        return 'நேரடி சந்தை';
      case 'kn':
        return 'ನೇರ ಕೃಷಿ ಮಾರುಕಟ್ಟೆ';
      case 'ml':
        return 'നേരിട്ടുള്ള വിപണി';
      default:
        return 'Direct Farm Market';
    }
  };

  const getRoleText = () => {
    if (user?.type === 'farmer') {
      switch (language) {
        case 'te':
          return 'రైతు';
        case 'hi':
          return 'किसान';
        case 'ta':
          return 'விவசாயி';
        case 'kn':
          return 'ರೈತ';
        case 'ml':
          return 'കർഷകൻ';
        default:
          return 'Farmer';
      }
    } else {
      switch (language) {
        case 'te':
          return 'కొనుగోలుదారు';
        case 'hi':
          return 'खरीदार';
        case 'ta':
          return 'வாங்குபவர்';
        case 'kn':
          return 'ಖರೀದಿದಾರ';
        case 'ml':
          return 'വാങ്ങുന്നയാൾ';
        default:
          return 'Buyer';
      }
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-green-100 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Zone 1: Wordmark / Brand title */}
        <button
          onClick={onNavigateHome}
          data-telugu-announce="హోమ్ స్క్రీన్‌కు వెళ్తున్నారు."
          className="flex items-center gap-2 group cursor-pointer text-left"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-green-600 to-emerald-500 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
            <Sprout className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xl font-bold tracking-tight text-gray-900 leading-none">
              Farm<span className="text-green-600">Direct</span>
            </div>
            <div className="text-[11px] font-medium text-gray-400 leading-tight">
              {getSubTitle()}
            </div>
          </div>
        </button>

        {/* Zone 2 & 3: Actions, Language Switcher, Voice Guide, User Badge */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Prominent Telugu Voice Assistant Button */}
          {onOpenVoiceAssistant && (
            <button
              onClick={onOpenVoiceAssistant}
              data-telugu-announce="రైతు మిత్ర వాయిస్ అసిస్టెంట్ తెరవబడింది."
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white text-xs font-bold shadow-xs hover:shadow-md transition-all active:scale-95 cursor-pointer"
              title="తెలుగు వాయిస్ అసిస్టెంట్ (మాట్లాడండి / వినండి)"
            >
              <Mic className="w-3.5 h-3.5 animate-pulse text-amber-300" />
              <span className="hidden sm:inline">రైతు మిత్ర AI</span>
              <span className="sm:hidden">వాయిస్ AI</span>
              <Volume2 className="w-3 h-3 opacity-80" />
            </button>
          )}

          {/* Quick Audio Narration Toggle (Pronounce Clicked Buttons) */}
          <button
            onClick={() => buttonNarrator.toggle()}
            data-skip-narrator="true"
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              isNarratorOn
                ? 'bg-amber-50 border-amber-300 text-amber-900 shadow-2xs hover:bg-amber-100'
                : 'bg-gray-100 border-gray-200 text-gray-400 hover:bg-gray-200'
            }`}
            title={isNarratorOn ? 'బటన్ వాయిస్ మార్గదర్శి ఆన్‌లో ఉంది (క్లిక్ చేసి మ్యూట్ చేయవచ్చు)' : 'బటన్ వాయిస్ మార్గదర్శిని ఆన్ చేయండి'}
          >
            {isNarratorOn ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                <span className="hidden md:inline text-[11px]">బటన్ వాయిస్ ఆన్</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-gray-500" />
                <span className="hidden md:inline text-[11px]">వాయిస్ ఆఫ్</span>
              </>
            )}
          </button>

          {/* Multi-Language Dropdown */}
          <div className="relative" ref={langMenuRef}>
            <button
              onClick={() => setIsLangOpen(!isLangOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 hover:border-green-400 bg-gray-50 hover:bg-white text-xs font-semibold text-gray-800 transition-all cursor-pointer shadow-2xs"
            >
              <Globe className="w-3.5 h-3.5 text-green-600" />
              <span>{currentLangObj.nativeName}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isLangOpen ? 'rotate-180' : ''}`} />
            </button>

            {isLangOpen && (
              <div className="absolute right-0 mt-1.5 w-44 bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100 mb-1">
                  Choose Language
                </div>
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      onLanguageChange(lang.code);
                      setIsLangOpen(false);
                    }}
                    data-telugu-announce={`${lang.nativeName} భాష ఎంచుకున్నారు.`}
                    className={`w-full px-3 py-2 text-xs flex items-center justify-between text-left hover:bg-green-50 transition-colors cursor-pointer ${
                      language === lang.code ? 'font-bold text-green-700 bg-green-50/60' : 'text-gray-700'
                    }`}
                  >
                    <span>{lang.nativeName} ({lang.label})</span>
                    {language === lang.code && <Check className="w-3.5 h-3.5 text-green-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* User profile lockup */}
          {user && (
            <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
              <div className="w-8 h-8 rounded-full bg-green-100 border border-green-200 flex items-center justify-center text-green-700 text-xs font-bold">
                {user.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-semibold text-gray-800 leading-tight flex items-center gap-1">
                  <span>{getTranslatedUserName(user.name, language)}</span>
                  <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
                </div>
                <div className="text-[10px] text-gray-500 capitalize">
                  {getRoleText()} · {getTranslatedVillageName(user.village, language)}
                </div>
              </div>

              <button
                onClick={onLogout}
                data-telugu-announce="ఖాతా నుండి లాగౌట్ బటన్ నొక్కారు."
                title="Logout"
                className="p-1.5 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors ml-1 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
