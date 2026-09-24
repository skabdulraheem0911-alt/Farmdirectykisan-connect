import React, { useState } from 'react';
import { Language, UserType } from '../types';
import { SUPPORTED_LANGUAGES, welcomeTranslations } from '../data/translations';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sprout,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  RefreshCw,
  UserCheck,
  Building2,
  ChevronLeft,
  Globe,
} from 'lucide-react';

interface WelcomeScreenProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onLogin: (role: UserType) => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  language,
  onLanguageChange,
  onLogin,
}) => {
  const [selectedRole, setSelectedRole] = useState<UserType | null>(null);
  const [aadharNumber, setAadharNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'select' | 'aadhar' | 'otp'>('select');
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const t = welcomeTranslations[language] || welcomeTranslations.en;

  const validateAadhar = (num: string) => {
    const clean = num.replace(/[\s-]/g, '');
    return /^\d{12}$/.test(clean);
  };

  const handleRoleSelect = (role: UserType) => {
    setSelectedRole(role);
    setAadharNumber(role === 'farmer' ? '1234-5678-9012' : '3456-7890-1234');
    setStep('aadhar');
  };

  const handleVerifyAadhar = async () => {
    if (!validateAadhar(aadharNumber)) {
      setErrorMessage(t.invalidAadhar || 'Please enter a valid 12-digit Aadhar number');
      return;
    }
    setIsVerifying(true);
    setErrorMessage('');
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setIsVerifying(false);
    setOtp('1234'); // Pre-fill mock OTP for convenience
    setStep('otp');
  };

  const handleVerifyOtp = () => {
    if (otp.length === 4 && selectedRole) {
      onLogin(selectedRole);
    }
  };

  const formatAadharDisplay = (val: string) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 12);
    const parts = cleaned.match(/.{1,4}/g);
    return parts ? parts.join('-') : cleaned;
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-green-600 via-emerald-600 to-teal-700 relative overflow-hidden select-none">
      {/* Decorative animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-10 left-10 w-48 h-48 bg-white/10 rounded-full blur-2xl"
          animate={{ y: [0, -30, 0], x: [0, 20, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-10 right-10 w-64 h-64 bg-emerald-400/15 rounded-full blur-3xl"
          animate={{ y: [0, 30, 0], x: [0, -20, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Language Switcher Bar at Top */}
      <div className="absolute top-4 sm:top-6 right-4 sm:right-6 z-20 flex items-center gap-1 bg-black/35 backdrop-blur-md p-1.5 rounded-2xl border border-white/20 shadow-lg max-w-[92vw] overflow-x-auto">
        <div className="flex items-center gap-1 px-1.5 text-white/70">
          <Globe className="w-3.5 h-3.5" />
        </div>
        {SUPPORTED_LANGUAGES.map((item) => (
          <button
            key={item.code}
            onClick={() => onLanguageChange(item.code)}
            data-telugu-announce={`${item.nativeName} భాష ఎంచుకున్నారు.`}
            className={`px-2.5 py-1 text-xs font-semibold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              language === item.code
                ? 'bg-white text-green-900 shadow-sm font-bold'
                : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
          >
            {item.nativeName}
          </button>
        ))}
      </div>

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 sm:p-8 relative z-10 border border-white/40 mt-12 sm:mt-0"
      >
        {/* Brand header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-green-600 to-emerald-500 text-white flex items-center justify-center mx-auto mb-3 shadow-lg shadow-green-600/30">
            <Sprout className="w-9 h-9" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Farm<span className="text-green-600">Connect</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {t.subtitle || 'Direct Market Access for Farmers & Buyers'}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {/* STEP 1: SELECT ROLE */}
          {step === 'select' && (
            <motion.div
              key="select"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              <div className="text-center mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-green-700 bg-green-50 px-3 py-1 rounded-full">
                  {language === 'ml' ? 'പ്രവേശിക്കുക' : language === 'te' ? 'మీ పాత్రను ఎంచుకోండి' : language === 'hi' ? 'अपनी भूमिका चुनें' : language === 'ta' ? 'உங்கள் பங்கைத் தேர்ந்தெடுக்கவும்' : language === 'kn' ? 'ನಿಮ್ಮ ಪಾತ್ರ ಆಯ್ಕೆಮಾಡಿ' : 'Select Your Role'}
                </span>
              </div>

              {/* Farmer option */}
              <button
                onClick={() => handleRoleSelect('farmer')}
                data-telugu-announce="రైతు లాగిన్ బటన్ నొక్కారు. రైతు ఖాతాలోకి ప్రవేశిస్తున్నారు."
                className="w-full text-left p-4 rounded-2xl border-2 border-green-200 hover:border-green-500 bg-gradient-to-r from-green-50/50 to-emerald-50/30 hover:bg-green-50 transition-all cursor-pointer group flex items-center justify-between shadow-xs"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-green-500 text-white flex items-center justify-center shadow-md shadow-green-500/30 group-hover:scale-105 transition-transform">
                    <Sprout className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">
                      {t.farmerLogin || 'Farmer Login'}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {language === 'te'
                        ? 'పంటలను జాబితా చేయండి, సరసమైన ధరలు, ప్రత్యక్ష కొనుగోలుదారులు'
                        : language === 'hi'
                        ? 'फसल सूचीबद्ध करें, उचित भाव पाएं, सीधे खरीदार'
                        : language === 'ta'
                        ? 'பயிர்களை பட்டியலிடுங்கள், நியாயமான விலை பெறுங்கள்'
                        : language === 'kn'
                        ? 'ಬೆಳೆಗಳನ್ನು ಪಟ್ಟಿ ಮಾಡಿ, ನ್ಯಾಯಯುತ ದರ ಪಡೆಯಿರಿ'
                        : language === 'ml'
                        ? 'വിളകൾ ലിസ്റ്റ് ചെയ്യുക, ന്യായവില നേടുക'
                        : 'List crops, get fair rates, direct buyers'}
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-green-600 group-hover:translate-x-1 transition-transform" />
              </button>

              {/* Buyer option */}
              <button
                onClick={() => handleRoleSelect('buyer')}
                data-telugu-announce="కొనుగోలుదారు లాగిన్ బటన్ నొక్కారు. వ్యవసాయ మార్కెట్‌లోకి ప్రవేశిస్తున్నారు."
                className="w-full text-left p-4 rounded-2xl border-2 border-emerald-200 hover:border-emerald-500 bg-gradient-to-r from-emerald-50/50 to-teal-50/30 hover:bg-emerald-50 transition-all cursor-pointer group flex items-center justify-between shadow-xs"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/30 group-hover:scale-105 transition-transform">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">
                      {t.buyerLogin || 'Buyer Login'}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {language === 'te'
                        ? 'తాజా పంటలను కొనండి, APMC తో పోల్చండి, ఎస్క్రో భద్రత'
                        : language === 'hi'
                        ? 'ताजी फसल खरीदें, APMC दर तुलना, एस्क्रो सुरक्षा'
                        : language === 'ta'
                        ? 'புதிய விளைச்சலை வாங்கவும், APMC ஒப்பீடு, எஸ்க்ரோ'
                        : language === 'kn'
                        ? 'ತಾಜಾ ಬೆಳೆಗಳನ್ನು ಖರೀದಿಸಿ, APMC ದರ ಹೋಲಿಕೆ, ಎಸ್ಕ್ರೋ'
                        : language === 'ml'
                        ? 'ഫ്രഷ് ഉത്പന്നങ്ങൾ വാങ്ങുക, എസ്ക്രോ സുരക്ഷ'
                        : 'Procure fresh harvest, compare APMC, escrow'}
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-emerald-600 group-hover:translate-x-1 transition-transform" />
              </button>

              <div className="pt-2 text-center">
                <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500">
                  <ShieldCheck className="w-4 h-4 text-green-600" />
                  <span>
                    {t.verifiedMandi || 'Verified with Andhra Pradesh APMC mandi rates'}
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 2: AADHAR NUMBER INPUT */}
          {step === 'aadhar' && (
            <motion.div
              key="aadhar"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setStep('select')}
                  className="flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-gray-800 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  {t.back || 'Back'}
                </button>
                <span className="text-xs font-semibold text-green-700 bg-green-50 px-2.5 py-0.5 rounded-full capitalize">
                  {selectedRole === 'farmer'
                    ? (language === 'ml' ? 'കർഷക ലോഗിൻ' : 'Farmer Portal')
                    : (language === 'ml' ? 'വാങ്ങുന്നയാൾ ലോഗിൻ' : 'Buyer Portal')}
                </span>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  {t.aadharNumber || 'Aadhar Number'}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={aadharNumber}
                    onChange={(e) => {
                      setAadharNumber(formatAadharDisplay(e.target.value));
                      setErrorMessage('');
                    }}
                    placeholder="XXXX-XXXX-XXXX"
                    maxLength={14}
                    className="w-full h-14 px-4 text-center tracking-widest text-lg font-mono font-bold rounded-xl border-2 border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none transition-all text-gray-900"
                  />
                  <ShieldCheck className="w-5 h-5 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2" />
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  {t.aadharPlaceholder || 'Enter your 12-digit Aadhar number for instant verification'}
                </p>
                {errorMessage && (
                  <p className="text-xs text-red-600 mt-1 text-center font-medium">
                    {errorMessage}
                  </p>
                )}
              </div>

              <button
                onClick={handleVerifyAadhar}
                disabled={!aadharNumber || isVerifying}
                data-telugu-announce="ఆధార్ నంబర్ ధృవీకరణ బటన్ నొక్కారు. ఓటీపీ పంపబడుతోంది."
                className="w-full h-12 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-md shadow-green-600/25 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                {isVerifying ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>{t.verifying || 'Verifying Aadhar...'}</span>
                  </>
                ) : (
                  <>
                    <UserCheck className="w-5 h-5" />
                    <span>{t.verifyAadhar || 'Verify Aadhar'}</span>
                  </>
                )}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => selectedRole && onLogin(selectedRole)}
                  data-telugu-announce="డెమో నేరుగా ప్రవేశించే బటన్ నొక్కారు."
                  className="text-xs text-green-700 hover:underline cursor-pointer"
                >
                  {language === 'ml' ? 'ഡെമോ നേരിട്ട് ആരംഭിക്കുക →' : 'Skip & demo login directly →'}
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: OTP VERIFICATION */}
          {step === 'otp' && (
            <motion.div
              key="otp"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-green-100 text-green-700 flex items-center justify-center mx-auto mb-2">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg">
                  {t.enterOTP || 'Enter Verification OTP'}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  {t.otpSentTo || 'OTP sent to mobile linked with Aadhar'} ({aadharNumber.slice(-4)})
                </p>
              </div>

              <div className="flex justify-center">
                <input
                  type="text"
                  maxLength={4}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="w-44 h-14 text-center tracking-[0.5em] text-2xl font-bold font-mono border-2 border-green-500 rounded-xl outline-none ring-2 ring-green-100 text-gray-900"
                  placeholder="••••"
                  autoFocus
                />
              </div>

              <button
                onClick={handleVerifyOtp}
                disabled={otp.length !== 4}
                data-telugu-announce="ఓటీపీ ధృవీకరణ బటన్ నొక్కారు. విజయవంతంగా లాగిన్ అవుతున్నారు."
                className="w-full h-12 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-md shadow-green-600/25 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>{t.verifyAadhar || 'Verify & Proceed'}</span>
              </button>

              <div className="text-center flex justify-between items-center text-xs text-gray-500 pt-1">
                <button
                  onClick={() => setStep('aadhar')}
                  data-telugu-announce="వెనుకకు వెళ్లే బటన్ నొక్కారు."
                  className="hover:underline cursor-pointer"
                >
                  {t.back || 'Back'}
                </button>
                <button
                  onClick={() => setOtp('1234')}
                  data-telugu-announce="ఓటీపీ మళ్లీ పంపే బటన్ నొక్కారు."
                  className="text-green-700 font-medium hover:underline cursor-pointer"
                >
                  {language === 'ml' ? 'ഒ.ടി.പി വീണ്ടും അയക്കുക' : 'Resend OTP (1234)'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
