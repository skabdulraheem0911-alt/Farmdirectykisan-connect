import React, { useState, useRef, useEffect } from 'react';
import { User, ProduceListing, Language, ChatMessage } from '../types';
import { chatTranslations, getTranslatedCropName, getTranslatedVillageName } from '../data/translations';
import { generateChatResponse } from '../services/chatResponses';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  Phone,
  Send,
  Tag,
  Mic,
  MicOff,
  Check,
  CheckCheck,
  ShieldCheck,
  Sparkles,
  MapPin,
  X,
  CreditCard,
} from 'lucide-react';

interface ChatScreenProps {
  language: Language;
  user: User;
  partner: User | null;
  listing: ProduceListing;
  onBack: () => void;
  onNavigate: (screen: string, listing: ProduceListing) => void;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({
  language,
  user,
  partner,
  listing,
  onBack,
  onNavigate,
}) => {
  const t = chatTranslations[language] || chatTranslations.en;
  const partnerName = partner?.name || listing.farmerName;
  const partnerType = user.type === 'farmer' ? 'buyer' : 'farmer';

  const getInitialGreeting = () => {
    const crop = getTranslatedCropName(listing.cropName, language);
    const village = getTranslatedVillageName(listing.farmerVillage, language);
    switch (language) {
      case 'te':
        return `నమస్కారం! నేను ${village} నుండి ${partnerName}. నా తాజా ${crop} పంట గురించి ఆరా తీసినందుకు ధన్యవాదాలు!`;
      case 'hi':
        return `नमस्ते! मैं ${village} से ${partnerName} हूँ। मेरी ताजी ${crop} फसल के बारे में पूछताछ करने के लिए धन्यवाद!`;
      case 'ta':
        return `வணக்கம்! நான் ${village}-லிருந்து ${partnerName}. எனது புதிய ${crop} அறுவடை பற்றி விசாரித்ததற்கு நன்றி!`;
      case 'kn':
        return `ನಮಸ್ಕಾರ! ನಾನು ${village}-ಯಿಂದ ${partnerName}. ನನ್ನ ತಾಜಾ ${crop} ಬೆಳೆಯ ಬಗ್ಗೆ ವಿಚಾರಿಸಿದ್ದಕ್ಕಾಗಿ ಧನ್ಯವಾದಗಳು!`;
      case 'ml':
        return `നമസ്കാരം! ഞാൻ ${village}-ൽ നിന്നുള്ള ${partnerName} ആണ്. എൻ്റെ ഫ്രഷ് ${crop} വിളവെടുപ്പിനെക്കുറിച്ച് അന്വേഷിച്ചതിൽ സന്തോഷം.`;
      default:
        return `Namaskaram! I am ${partnerName} from ${village}. Thank you for your interest in my fresh ${crop} harvest!`;
    }
  };

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      senderId: partner?.id || 'partner',
      message: getInitialGreeting(),
      timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      type: 'text',
    },
  ]);

  const [inputText, setInputText] = useState('');
  const [offerPrice, setOfferPrice] = useState('');
  const [showOfferBox, setShowOfferBox] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const getSmartSuggestions = () => {
    const discountedPrice = Math.max(10, listing.pricePerKg - 2);
    switch (language) {
      case 'te':
        return [
          'బల్క్ కొనుగోలుకు ధర తగ్గించగలరా?',
          'ఆర్డర్‌ను ఎప్పుడు డెలివరీ చేయగలరు?',
          'ఇది పూర్తిగా సేంద్రీయంగా పండించినదా?',
          `కిలోకు ₹${discountedPrice} ఇస్తారా?`,
        ];
      case 'hi':
        return [
          'क्या थोक खरीद पर दाम कम होगा?',
          'आप कब तक माल डिलीवर कर सकते हैं?',
          'क्या यह 100% जैविक रूप से उगाई गई है?',
          `क्या आप ₹${discountedPrice}/किलो कर सकते हैं?`,
        ];
      case 'ta':
        return [
          'மொத்தமாக வாங்கினால் விலை குறையுமா?',
          'எப்போது டெலிவரி செய்ய முடியும்?',
          'இது முற்றிலும் இயற்கையாக விளைவிக்கப்பட்டதா?',
          `கிலோவிற்கு ₹${discountedPrice} தரலாமா?`,
        ];
      case 'kn':
        return [
          'ಬಲ್ಕ್ ಖರೀದಿಗೆ ದರ ಕಡಿಮೆ ಮಾಡುತ್ತೀರಾ?',
          'ಯಾವಾಗ ಡೆಲಿವರಿ ಮಾಡಲು ಸಾಧ್ಯ?',
          'ಇದು ಸಂಪೂರ್ಣ ಸಾವಯವ ಬೆಳೆಯೇ?',
          `ಕೆಜಿಗೆ ₹${discountedPrice} ನೀಡಬಹುದೇ?`,
        ];
      case 'ml':
        return [
          'വില കുറയ്ക്കാൻ സാധിക്കുമോ?',
          'എത്ര പെട്ടെന്ന് ഡെലിവറി ചെയ്യാൻ കഴിയും?',
          'പൂർണ്ണമായും ജൈവരീതിയിലാണോ കൃഷി ചെയ്തത്?',
          `കിലോയ്ക്ക് ₹${discountedPrice} നൽകാമോ?`,
        ];
      default:
        return [
          'Is the price negotiable for bulk?',
          'When can you dispatch the order?',
          'Are these 100% naturally grown?',
          `Can you do ₹${discountedPrice}/kg?`,
        ];
    }
  };

  const smartSuggestions = getSmartSuggestions();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      senderId: user.id,
      message: text,
      timestamp: new Date().toISOString(),
      type: 'text',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    // Simulate realistic AI reply
    setTimeout(() => {
      setIsTyping(false);
      const replyText = generateChatResponse(
        text,
        language,
        partnerType,
        listing,
        partnerName,
        [...messages, userMsg]
      );

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        senderId: partner?.id || 'partner',
        message: replyText,
        timestamp: new Date().toISOString(),
        type: 'text',
      };
      setMessages((prev) => [...prev, botMsg]);
    }, 1000 + Math.random() * 800);
  };

  const handleMakeOffer = () => {
    const priceNum = parseFloat(offerPrice);
    if (!priceNum || priceNum <= 0) return;

    const offerMsg: ChatMessage = {
      id: Date.now().toString(),
      senderId: user.id,
      message: `${t.offerMade || 'Offer Made'}: ₹${priceNum}/${t.kg || 'kg'}`,
      timestamp: new Date().toISOString(),
      type: 'offer',
      offerAmount: priceNum,
    };

    setMessages((prev) => [...prev, offerMsg]);
    setShowOfferBox(false);
    setOfferPrice('');
    setIsTyping(true);

    // Partner accepts or counters
    setTimeout(() => {
      setIsTyping(false);
      const isAccepted = priceNum >= listing.pricePerKg * 0.9;
      const response = isAccepted
        ? language === 'ml'
          ? `ശരി! കിലോയ്ക്ക് ₹${priceNum} ഓഫർ ഞാൻ സ്വീകരിക്കുന്നു. നമുക്ക് എസ്ക്രോ വഴി ഓർഡർ പൂർത്തിയാക്കാം.`
          : `Agreed! I accept your offer of ₹${priceNum}/kg. Let's proceed with secure escrow payment.`
        : language === 'ml'
          ? `ക്ഷമിക്കണം, ₹${priceNum} വളരെ കുറവാണ്. ₹${Math.max(priceNum + 2, listing.pricePerKg - 1)} സാധിക്കുമോ?`
          : `I cannot do ₹${priceNum}/kg due to harvest costs, but can we settle at ₹${Math.max(priceNum + 2, listing.pricePerKg - 1)}/kg?`;

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          senderId: partner?.id || 'partner',
          message: response,
          timestamp: new Date().toISOString(),
          type: 'text',
        },
      ]);
    }, 1500);
  };

  const formatTime = (ts: string) => {
    try {
      const d = new Date(ts);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div className="max-w-3xl mx-auto h-[calc(100vh-68px)] flex flex-col bg-white sm:rounded-3xl sm:border border-gray-200 sm:shadow-lg sm:my-3 overflow-hidden">
      {/* Top Chat Header */}
      <div className="bg-gradient-to-r from-green-700 to-emerald-600 text-white p-3.5 sm:p-4 flex items-center justify-between shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="w-10 h-10 rounded-full bg-white/20 border border-white/30 flex items-center justify-center font-bold text-sm text-white shadow-inner">
            {partnerName.slice(0, 2).toUpperCase()}
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm sm:text-base leading-tight">
                {partnerName}
              </span>
              <ShieldCheck className="w-4 h-4 text-green-300" />
            </div>
            <div className="flex items-center gap-2 text-[11px] text-green-100">
              <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse"></span>
              <span>{isTyping ? (t.typing || 'typing...') : (t.online || 'Online')}</span>
              <span>·</span>
              <span className="flex items-center gap-0.5">
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>{language === 'ml' ? 'സ്മാർട്ട് പ്രതികരണം' : 'Smart Assistant'}</span>
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {partner?.phone && (
            <a
              href={`tel:${partner.phone}`}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              title="Call"
            >
              <Phone className="w-4 h-4" />
            </a>
          )}
          <button
            onClick={() => onNavigate('payment-escrow', listing)}
            className="px-3 py-1.5 rounded-xl bg-white text-green-800 text-xs font-bold hover:bg-green-50 shadow-sm cursor-pointer transition-transform hover:scale-102 flex items-center gap-1"
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>{language === 'ml' ? 'വാങ്ങുക' : 'Buy Now'}</span>
          </button>
        </div>
      </div>

      {/* Produce Summary Strip */}
      <div className="bg-emerald-50/90 border-b border-emerald-100 px-4 py-2 flex items-center justify-between text-xs text-gray-700 shrink-0">
        <div className="flex items-center gap-2">
          <span className="font-bold text-green-900">{getTranslatedCropName(listing.cropName, language)}</span>
          <span className="text-gray-400">·</span>
          <span className="flex items-center gap-0.5 text-gray-600">
            <MapPin className="w-3 h-3" />
            {getTranslatedVillageName(listing.farmerVillage, language)}
          </span>
          <span className="text-gray-400">·</span>
          <span className="text-gray-600">{listing.quantity} kg</span>
        </div>

        <div className="flex items-center gap-2 font-bold text-green-800">
          <span>₹{listing.pricePerKg}/kg</span>
          {listing.negotiable && (
            <span className="bg-green-600 text-white text-[10px] px-2 py-0.5 rounded-full font-semibold">
              {t.negotiable || 'Negotiable'}
            </span>
          )}
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50/50">
        {messages.map((msg) => {
          const isMe = msg.senderId === user.id;

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[70%] p-3.5 rounded-2xl text-sm leading-relaxed shadow-xs ${
                  isMe
                    ? 'bg-green-600 text-white rounded-br-xs'
                    : msg.type === 'offer'
                    ? 'bg-amber-50 border border-amber-200 text-amber-950 rounded-bl-xs'
                    : 'bg-white border border-gray-200 text-gray-900 rounded-bl-xs'
                }`}
              >
                {msg.type === 'offer' && (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 mb-1 border-b border-amber-200 pb-1">
                    <Tag className="w-3.5 h-3.5" />
                    <span>{t.makeOffer || 'Custom Price Proposal'}</span>
                  </div>
                )}
                <div>{msg.message}</div>
              </div>

              <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-1 px-1">
                <span>{formatTime(msg.timestamp)}</span>
                {isMe && <CheckCheck className="w-3.5 h-3.5 text-green-600" />}
              </div>
            </div>
          );
        })}

        {/* Animated Typing Indicator */}
        {isTyping && (
          <div className="flex items-center gap-1.5 bg-white border border-gray-200 p-3 rounded-2xl rounded-bl-xs w-20 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-bounce"></span>
            <span className="w-2 h-2 rounded-full bg-green-500 animate-bounce [animation-delay:0.2s]"></span>
            <span className="w-2 h-2 rounded-full bg-green-500 animate-bounce [animation-delay:0.4s]"></span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Smart Contextual Suggestion Pills */}
      <div className="p-2 bg-white border-t border-gray-100 flex items-center gap-1.5 overflow-x-auto text-xs shrink-0">
        <Sparkles className="w-3.5 h-3.5 text-green-600 shrink-0 ml-1" />
        {smartSuggestions.map((sug, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(sug)}
            className="px-2.5 py-1 rounded-full bg-gray-100 hover:bg-green-50 hover:text-green-700 text-gray-600 text-xs font-medium whitespace-nowrap cursor-pointer transition-colors border border-gray-200/60"
          >
            {sug}
          </button>
        ))}
      </div>

      {/* Make Offer Popup */}
      <AnimatePresence>
        {showOfferBox && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="p-3 bg-amber-50/90 border-t border-amber-200 flex items-center gap-3 shrink-0"
          >
            <div className="flex-1 flex items-center gap-2">
              <span className="text-xs font-bold text-amber-900 whitespace-nowrap">
                {t.yourOffer || 'Your Price Offer'}:
              </span>
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
                  ₹
                </span>
                <input
                  type="number"
                  placeholder={`Current ₹${listing.pricePerKg}`}
                  value={offerPrice}
                  onChange={(e) => setOfferPrice(e.target.value)}
                  className="w-full h-9 pl-7 pr-8 rounded-lg border border-amber-300 bg-white text-xs font-bold outline-none focus:ring-1 focus:ring-amber-500 text-gray-900"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-400">
                  /kg
                </span>
              </div>
            </div>

            <button
              onClick={handleMakeOffer}
              disabled={!offerPrice}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors shadow-xs"
            >
              {t.send || 'Submit Offer'}
            </button>
            <button
              onClick={() => setShowOfferBox(false)}
              className="p-1.5 text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Message Input Bar */}
      <div className="p-3 bg-white border-t border-gray-200 flex items-center gap-2 shrink-0">
        {listing.negotiable && (
          <button
            onClick={() => setShowOfferBox(!showOfferBox)}
            title={t.makeOffer || 'Make Price Offer'}
            className="p-2.5 rounded-xl border border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 transition-colors cursor-pointer"
          >
            <Tag className="w-4 h-4" />
          </button>
        )}

        <div className="relative flex-1">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={t.typeMessage || 'Type your message or ask a question...'}
            className="w-full h-11 pl-4 pr-10 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100 text-sm outline-none transition-all text-gray-900"
          />

          <button
            type="button"
            onClick={() => {
              setIsRecording(!isRecording);
              if (!isRecording) {
                setTimeout(() => {
                  setInputText(language === 'ml' ? 'വിലയിൽ ചെറിയ ഇളവ് നൽകാൻ സാധിക്കുമോ?' : 'Can you give a small discount on 200kg?');
                  setIsRecording(false);
                }, 1500);
              }
            }}
            title="Voice Note"
            className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-colors cursor-pointer ${
              isRecording ? 'text-red-500 animate-pulse' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>
        </div>

        <button
          onClick={() => handleSend()}
          disabled={!inputText.trim()}
          className="w-11 h-11 rounded-xl bg-green-600 hover:bg-green-700 disabled:opacity-40 text-white flex items-center justify-center cursor-pointer shadow-md shadow-green-600/20 transition-all shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
