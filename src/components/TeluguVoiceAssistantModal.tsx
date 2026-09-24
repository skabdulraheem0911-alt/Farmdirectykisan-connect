import React, { useState, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Play,
  RotateCcw,
  Sparkles,
  HelpCircle,
  X,
  CheckCircle2,
  ChevronRight,
  Sprout,
  Scale,
  IndianRupee,
  MapPin,
  Search,
  MessageCircle,
  ShieldCheck,
  Truck,
  ArrowRight,
  Info,
  Radio,
} from 'lucide-react';
import {
  speechManager,
  startTeluguSpeechRecognition,
  parseTeluguVoiceToProduce,
  askTeluguAIAssistant,
  FARMER_ADD_PRODUCE_STEPS,
  BUYER_GUIDE_STEPS,
  VoiceGuideStep,
  ParsedVoiceListing,
} from '../services/voiceAssistantService';
import { Language, User } from '../types';

interface TeluguVoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: User | null;
  language?: Language;
  onNavigate?: (screen: string, data?: any) => void;
  onAutofillProduce?: (details: {
    cropName?: string;
    quantity?: number;
    pricePerKg?: number;
    location?: string;
  }) => void;
  initialMode?: 'farmer' | 'buyer' | 'qa';
}

export const TeluguVoiceAssistantModal: React.FC<TeluguVoiceAssistantModalProps> = ({
  isOpen,
  onClose,
  user,
  language = 'te',
  onNavigate,
  onAutofillProduce,
  initialMode = 'farmer',
}) => {
  const [activeTab, setActiveTab] = useState<'farmer' | 'buyer' | 'qa'>(
    user?.type === 'buyer' ? 'buyer' : initialMode
  );
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceInputText, setVoiceInputText] = useState('');
  const [aiReplyText, setAiReplyText] = useState('');
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [parsedListing, setParsedListing] = useState<ParsedVoiceListing | null>(null);
  const [speechSpeed, setSpeechSpeed] = useState<number>(0.92);

  // Active step list based on tab
  const steps: VoiceGuideStep[] =
    activeTab === 'farmer' ? FARMER_ADD_PRODUCE_STEPS : BUYER_GUIDE_STEPS;
  const currentStep = steps[currentStepIndex] || steps[0];

  useEffect(() => {
    const unsubscribe = speechManager.subscribe((speaking) => {
      setIsSpeaking(speaking);
    });
    return () => {
      unsubscribe();
      speechManager.stop();
    };
  }, []);

  // When step changes, optionally auto-speak
  const handlePlayCurrentStep = (stepObj?: VoiceGuideStep) => {
    const target = stepObj || currentStep;
    speechManager.speakTelugu(target.teluguText, undefined, speechSpeed);
  };

  const handleStopSpeaking = () => {
    speechManager.stop();
  };

  // Start Voice Recognition
  const handleStartListening = () => {
    speechManager.stop();
    setSpeechError(null);
    setIsListening(true);
    setVoiceInputText('');

    const recognizer = startTeluguSpeechRecognition(
      async (transcript) => {
        setIsListening(false);
        setVoiceInputText(transcript);

        // If in farmer mode, attempt to parse produce info
        if (activeTab === 'farmer') {
          const parsed = parseTeluguVoiceToProduce(transcript);
          setParsedListing(parsed);

          if (parsed.cropName || parsed.quantity || parsed.pricePerKg) {
            const confirmMsg = `మీరు చెప్పిన వివరాలు నమోదు చేసాను: ${
              parsed.cropName ? 'పంట: ' + parsed.cropName : ''
            } ${parsed.quantity ? ', ' + parsed.quantity + ' కిలోలు' : ''} ${
              parsed.pricePerKg ? ', కిలో ధర ' + parsed.pricePerKg + ' రూపాయలు' : ''
            }. సరిచూసుకొని నిర్ధారించండి.`;
            setAiReplyText(confirmMsg);
            speechManager.speakTelugu(confirmMsg, undefined, speechSpeed);
            return;
          }
        }

        // Ask AI Assistant for response
        try {
          const reply = await askTeluguAIAssistant(
            transcript,
            activeTab === 'farmer' ? 'add_produce' : 'buy_produce',
            user?.type || 'farmer'
          );
          setAiReplyText(reply);
          speechManager.speakTelugu(reply, undefined, speechSpeed);
        } catch (err) {
          console.warn('AI assist error:', err);
        }
      },
      (err) => {
        setIsListening(false);
        setSpeechError(err);
      },
      () => {
        setIsListening(false);
      }
    );

    if (!recognizer) {
      setIsListening(false);
    }
  };

  const handleApplyProduceToForm = () => {
    if (parsedListing && onAutofillProduce) {
      onAutofillProduce({
        cropName: parsedListing.cropName,
        quantity: parsedListing.quantity,
        pricePerKg: parsedListing.pricePerKg,
        location: parsedListing.location,
      });
      if (onNavigate) {
        onNavigate('add-produce');
      }
      onClose();
    } else if (onNavigate) {
      onNavigate('add-produce');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-xl rounded-t-3xl sm:rounded-3xl shadow-2xl border border-emerald-100 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Assistant Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-green-700 to-teal-800 text-white p-4 sm:p-5 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
                  <Sparkles className="w-6 h-6 text-amber-300 animate-pulse" />
                </div>
                {isSpeaking && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75" />
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-400 border border-white" />
                  </span>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-black tracking-tight text-white">
                    రైతు మిత్ర (Raithu Mithra)
                  </h2>
                  <span className="bg-amber-400 text-amber-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                    తెలుగు AI వాయిస్
                  </span>
                </div>
                <p className="text-xs text-emerald-100/90 font-medium">
                  చదవడం, రాయడం రాకపోయినా సులభంగా పంటలు అమ్మండి & కొనండి
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                speechManager.stop();
                onClose();
              }}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Audio Wave / Speaking State Indicator */}
          {isSpeaking && (
            <div className="mt-3 bg-emerald-950/40 rounded-xl px-3 py-1.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-amber-300 animate-bounce" />
                <span className="text-emerald-100 font-semibold text-xs">
                  తెలుగులో మాట్లాడుతోంది... (వినండి)
                </span>
              </div>
              <button
                onClick={handleStopSpeaking}
                className="text-[11px] bg-white/20 hover:bg-white/30 text-white font-bold px-2 py-0.5 rounded-md cursor-pointer"
              >
                ఆపండి (Stop)
              </button>
            </div>
          )}
        </div>

        {/* Tab Navigation (Large Touch-Friendly Buttons) */}
        <div className="grid grid-cols-3 bg-slate-100 p-1.5 border-b border-gray-200 text-xs">
          <button
            onClick={() => {
              speechManager.stop();
              setActiveTab('farmer');
              setCurrentStepIndex(0);
            }}
            className={`py-2 px-1 rounded-xl font-bold flex flex-col sm:flex-row items-center justify-center gap-1 transition-all cursor-pointer ${
              activeTab === 'farmer'
                ? 'bg-white text-emerald-800 shadow-sm border border-emerald-200'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Sprout className="w-4 h-4 text-emerald-600" />
            <span>పంట అమ్మడం (Farmer)</span>
          </button>

          <button
            onClick={() => {
              speechManager.stop();
              setActiveTab('buyer');
              setCurrentStepIndex(0);
            }}
            className={`py-2 px-1 rounded-xl font-bold flex flex-col sm:flex-row items-center justify-center gap-1 transition-all cursor-pointer ${
              activeTab === 'buyer'
                ? 'bg-white text-emerald-800 shadow-sm border border-emerald-200'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Search className="w-4 h-4 text-emerald-600" />
            <span>పంట కొనడం (Buyer)</span>
          </button>

          <button
            onClick={() => {
              speechManager.stop();
              setActiveTab('qa');
            }}
            className={`py-2 px-1 rounded-xl font-bold flex flex-col sm:flex-row items-center justify-center gap-1 transition-all cursor-pointer ${
              activeTab === 'qa'
                ? 'bg-white text-emerald-800 shadow-sm border border-emerald-200'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Mic className="w-4 h-4 text-emerald-600" />
            <span>మాట్లాడండి (Voice Q&A)</span>
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {activeTab !== 'qa' ? (
            /* Step-by-Step Guided Mode (Farmer or Buyer) */
            <div className="space-y-4">
              {/* Audio Playback Controls Bar */}
              <div className="bg-emerald-50 rounded-2xl p-3 border border-emerald-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePlayCurrentStep()}
                    className="w-10 h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center shadow-md transition-all active:scale-95 cursor-pointer"
                    title="వినండి (Listen)"
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                  <div>
                    <div className="text-xs font-black text-emerald-950">
                      ఈ అడుగు సూచన వినండి
                    </div>
                    <div className="text-[11px] text-emerald-700 font-medium">
                      నొక్కితే తెలుగు గొంతుతో స్పష్టంగా చదువుతుంది
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-[11px]">
                  <span className="text-gray-500 font-semibold">వేగం:</span>
                  <button
                    onClick={() => setSpeechSpeed(speechSpeed === 0.8 ? 0.95 : 0.8)}
                    className="px-2 py-1 rounded-lg bg-white border border-emerald-300 font-bold text-emerald-800 cursor-pointer text-[10px]"
                  >
                    {speechSpeed === 0.8 ? 'నెమ్మదిగా (0.8x)' : 'సాధారణ (1.0x)'}
                  </button>
                </div>
              </div>

              {/* Step Navigation Dots / Indicators */}
              <div className="flex items-center justify-between gap-1 px-1">
                {steps.map((st, idx) => (
                  <button
                    key={st.step}
                    onClick={() => {
                      setCurrentStepIndex(idx);
                      handlePlayCurrentStep(steps[idx]);
                    }}
                    className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-1 cursor-pointer ${
                      currentStepIndex === idx
                        ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm scale-102'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <span>అడుగు {st.step}</span>
                  </button>
                ))}
              </div>

              {/* Active Step Card */}
              <div className="bg-white rounded-3xl border-2 border-emerald-500/80 shadow-md p-5 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-lg shadow-inner">
                      {currentStep.step}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                        {currentStep.title}
                      </div>
                      <h3 className="text-base sm:text-lg font-black text-gray-900 leading-snug">
                        {currentStep.teluguTitle}
                      </h3>
                    </div>
                  </div>

                  <button
                    onClick={() => handlePlayCurrentStep()}
                    className="px-3 py-1.5 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>మళ్ళీ వినండి</span>
                  </button>
                </div>

                {/* Spoken Telugu Content Box (Large font for non-fluent readers) */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-gray-800 font-medium text-sm sm:text-base leading-relaxed">
                  "{currentStep.teluguText}"
                </div>

                {/* Specific Visual Assistance for Step 1 (Farmer Crop Selection) */}
                {activeTab === 'farmer' && currentStep.step === 1 && (
                  <div className="space-y-2 pt-1">
                    <div className="text-xs font-bold text-gray-600">
                      బొమ్మను తాకండి (లేదా మైక్ నొక్కి పంట పేరు చెప్పండి):
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { name: 'టమోటా', en: 'Tomato', icon: '🍅' },
                        { name: 'మిర్చి', en: 'Chili', icon: '🌶️' },
                        { name: 'ఉల్లిపాయ', en: 'Onion', icon: '🧅' },
                        { name: 'వరి', en: 'Rice', icon: '🌾' },
                        { name: 'మొక్కజొన్న', en: 'Corn', icon: '🌽' },
                        { name: 'క్యాబేజీ', en: 'Cabbage', icon: '🥬' },
                        { name: 'క్యారెట్', en: 'Carrot', icon: '🥕' },
                        { name: 'బీన్స్', en: 'Beans', icon: '🫘' },
                      ].map((c) => (
                        <button
                          key={c.en}
                          onClick={() => {
                            speechManager.speakTelugu(
                              `${c.name} ఎంచుకున్నారు. ఇప్పుడు మీ దగ్గర ఎన్ని కిలోలు ఉన్నాయో చెప్పండి.`,
                              undefined,
                              speechSpeed
                            );
                            setParsedListing((prev) => ({
                              ...prev,
                              cropName: c.en,
                              summary: `పంట: ${c.name}`,
                            }));
                            setCurrentStepIndex(1);
                          }}
                          className="bg-white hover:bg-emerald-50 border border-gray-200 hover:border-emerald-400 p-2 rounded-2xl text-center flex flex-col items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-xs"
                        >
                          <span className="text-2xl">{c.icon}</span>
                          <span className="text-xs font-bold text-gray-900 mt-1">
                            {c.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step navigation & actions */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <button
                    disabled={currentStepIndex === 0}
                    onClick={() => {
                      const prevIdx = Math.max(0, currentStepIndex - 1);
                      setCurrentStepIndex(prevIdx);
                      handlePlayCurrentStep(steps[prevIdx]);
                    }}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 disabled:opacity-30 cursor-pointer"
                  >
                    మునుపటి అడుగు
                  </button>

                  {currentStepIndex < steps.length - 1 ? (
                    <button
                      onClick={() => {
                        const nextIdx = currentStepIndex + 1;
                        setCurrentStepIndex(nextIdx);
                        handlePlayCurrentStep(steps[nextIdx]);
                      }}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                    >
                      <span>తదుపరి అడుగు</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={handleApplyProduceToForm}
                      className="px-4 py-2 rounded-xl bg-green-700 hover:bg-green-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>
                        {activeTab === 'farmer' ? 'పంట నమోదుకు వెళ్ళండి' : 'మార్కెట్‌కు వెళ్ళండి'}
                      </span>
                    </button>
                  )}
                </div>
              </div>

              {/* Direct Voice Fill Banner for Non-Literate Farmers */}
              {activeTab === 'farmer' && (
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-3xl p-4 border border-amber-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold">
                        <Mic className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-amber-950">
                          రైతు వాయిస్ నమోదు (Voice Autofill)
                        </h4>
                        <p className="text-[11px] text-amber-800">
                          రాయడం రాకపోయినా ఫరవాలేదు! మైక్ నొక్కి మాట్లాడండి
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={handleStartListening}
                      disabled={isListening}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm transition-all cursor-pointer ${
                        isListening
                          ? 'bg-red-500 text-white animate-pulse'
                          : 'bg-amber-500 hover:bg-amber-600 text-white'
                      }`}
                    >
                      <Mic className="w-3.5 h-3.5" />
                      <span>{isListening ? 'వింటోంది...' : 'నొక్కి చెప్పండి'}</span>
                    </button>
                  </div>

                  <div className="text-[11px] text-amber-900 bg-white/80 p-2.5 rounded-xl border border-amber-200/80">
                    💡 <strong>ఉదాహరణకు ఇలా చెప్పండి:</strong> "నా దగ్గర 500 కిలోల టమోటా ఉంది, కిలో 25 రూపాయలు, గుంటూరు"
                  </div>

                  {parsedListing && (
                    <div className="bg-white rounded-2xl p-3 border border-emerald-300 space-y-2">
                      <div className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>మీ గొంతు గుర్తించబడింది:</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="bg-emerald-50 p-2 rounded-xl border border-emerald-100">
                          <span className="text-[10px] text-gray-500 block">పంట</span>
                          <span className="font-extrabold text-emerald-900">
                            {parsedListing.cropName || 'గుర్తించలేదు'}
                          </span>
                        </div>
                        <div className="bg-emerald-50 p-2 rounded-xl border border-emerald-100">
                          <span className="text-[10px] text-gray-500 block">పరిమాణం</span>
                          <span className="font-extrabold text-emerald-900">
                            {parsedListing.quantity ? `${parsedListing.quantity} kg` : 'గుర్తించలేదు'}
                          </span>
                        </div>
                        <div className="bg-emerald-50 p-2 rounded-xl border border-emerald-100">
                          <span className="text-[10px] text-gray-500 block">ధర / kg</span>
                          <span className="font-extrabold text-emerald-900">
                            {parsedListing.pricePerKg ? `₹${parsedListing.pricePerKg}` : 'గుర్తించలేదు'}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={handleApplyProduceToForm}
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                      >
                        <span>ఈ వివరాలతో పంట నమోదు ఫారమ్‌కు వెళ్ళండి</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* Direct Voice Q&A Mode */
            <div className="space-y-4">
              <div className="bg-slate-50 rounded-3xl p-5 border border-slate-200 text-center space-y-4">
                <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center bg-gradient-to-tr from-emerald-500 to-green-600 text-white shadow-lg relative">
                  {isListening && (
                    <span className="absolute inset-0 rounded-full border-4 border-emerald-300 animate-ping" />
                  )}
                  <button
                    onClick={isListening ? () => setIsListening(false) : handleStartListening}
                    className="w-full h-full rounded-full flex items-center justify-center cursor-pointer transition-transform active:scale-90"
                    title="Click to Speak"
                  >
                    {isListening ? (
                      <MicOff className="w-8 h-8 text-white animate-pulse" />
                    ) : (
                      <Mic className="w-8 h-8 text-white" />
                    )}
                  </button>
                </div>

                <div>
                  <h3 className="font-black text-gray-900 text-base">
                    {isListening ? 'మీ గొంతును వింటున్నాను... మాట్లాడండి' : 'మైక్ నొక్కి తెలుగులో మాట్లాడండి'}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    పంటలు, ధరలు, ఎస్క్రో భద్రత, లేదా ఏవైనా సందేహాలు అడగండి
                  </p>
                </div>

                {isListening && (
                  <div className="flex items-center justify-center gap-1">
                    <span className="w-1.5 h-6 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-9 bg-emerald-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-12 bg-emerald-700 rounded-full animate-bounce" />
                    <span className="w-1.5 h-9 bg-emerald-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-6 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  </div>
                )}
              </div>

              {speechError && (
                <div className="p-3 bg-red-50 text-red-700 text-xs rounded-2xl border border-red-200">
                  {speechError}
                </div>
              )}

              {/* User Voice Input Display */}
              {voiceInputText && (
                <div className="bg-emerald-50 rounded-2xl p-3 border border-emerald-200 space-y-1">
                  <div className="text-[11px] font-bold text-emerald-800">మీరు మాట్లాడినది:</div>
                  <div className="text-sm font-semibold text-gray-900">"{voiceInputText}"</div>
                </div>
              )}

              {/* AI Assistant Answer */}
              {aiReplyText && (
                <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      రైతు మిత్ర సమాధానం:
                    </span>
                    <button
                      onClick={() => speechManager.speakTelugu(aiReplyText, undefined, speechSpeed)}
                      className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200 cursor-pointer"
                    >
                      <Volume2 className="w-3 h-3" />
                      <span>మళ్ళీ వినండి</span>
                    </button>
                  </div>
                  <div className="text-sm text-gray-800 font-medium leading-relaxed">
                    {aiReplyText}
                  </div>
                </div>
              )}

              {/* Preset Quick Questions for Easy 1-Tap Speaking */}
              <div className="space-y-2 pt-2">
                <div className="text-xs font-bold text-gray-600">
                  లేదా క్రింది ప్రశ్నలపై నొక్కండి (ఆటోమేటిక్‌గా సమాధానం వస్తుంది):
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {[
                    { q: 'టమోటా మార్కెట్ ధర ఎంత?', hint: 'ధరల సమాచారం' },
                    { q: 'నా డబ్బు ఎలా సురక్షితం (ఎస్క్రో)?', hint: 'భద్రత మార్గదర్శి' },
                    { q: 'పంటను అమ్మడం ఎలా?', hint: 'రైతు మార్గదర్శి' },
                    { q: 'రైతుతో బేరం మాట్లాడటం ఎలా?', hint: 'కొనుగోలుదారు మార్గదర్శి' },
                  ].map((item) => (
                    <button
                      key={item.q}
                      onClick={async () => {
                        setVoiceInputText(item.q);
                        const ans = await askTeluguAIAssistant(item.q, 'general', user?.type || 'farmer');
                        setAiReplyText(ans);
                        speechManager.speakTelugu(ans, undefined, speechSpeed);
                      }}
                      className="p-2.5 rounded-xl bg-white hover:bg-emerald-50 border border-gray-200 text-left font-semibold text-gray-800 transition-colors flex items-center justify-between cursor-pointer"
                    >
                      <span>{item.q}</span>
                      <span className="text-[10px] text-emerald-700 bg-emerald-100/60 px-1.5 py-0.5 rounded-md">
                        {item.hint}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer info note */}
        <div className="bg-slate-50 px-5 py-3 border-t border-gray-200 flex items-center justify-between text-[11px] text-gray-500">
          <div className="flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
            <span>ఆంధ్రప్రదేశ్ & తెలంగాణ గ్రామీణ రైతులకు ప్రత్యక్ష స్వరం</span>
          </div>
          <button
            onClick={() => {
              speechManager.stop();
              onClose();
            }}
            className="text-xs font-bold text-gray-700 hover:text-gray-900 cursor-pointer"
          >
            మూసివేయి (Close)
          </button>
        </div>
      </div>
    </div>
  );
};
