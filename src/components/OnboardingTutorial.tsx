import React, { useState } from 'react';
import { User, Language, UserType } from '../types';
import { onboardingTranslations } from '../data/translations';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users,
  Store,
  TrendingUp,
  MessageCircle,
  Shield,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';

interface OnboardingTutorialProps {
  language: Language;
  user: User;
  onComplete: () => void;
  onSkip: () => void;
}

interface TutorialStep {
  icon: string;
  title: string;
  description: string;
  tips: string[];
}

export const OnboardingTutorial: React.FC<OnboardingTutorialProps> = ({
  language,
  user,
  onComplete,
  onSkip,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showSummary, setShowSummary] = useState(false);

  const t = onboardingTranslations[language] || onboardingTranslations.en;

  // Build robust localized steps with full fallbacks
  const getSteps = (): TutorialStep[] => {
    const isFarmer = user.type === 'farmer';

    if (isFarmer) {
      switch (language) {
        case 'te':
          return [
            {
              icon: 'Store',
              title: 'మీ పంటను నేరుగా జాబితా చేయండి',
              description: 'మీ అంచనా ధర, అందుబాటులో ఉన్న పరిమాణం నమోదు చేసి, కెమెరాతో ప్రత్యక్ష ఫోటో తీసి ధృవీకరించబడిన కొనుగోలుదారులను చేరుకోండి.',
              tips: ['మధ్యవర్తుల కమీషన్లు లేవు', 'లైవ్ కెమెరా ఫోటో ధృవీకరణ', 'ఎప్పుడైనా అందుబాటును అప్‌డేట్ చేయండి'],
            },
            {
              icon: 'TrendingUp',
              title: 'ఆంధ్రప్రదేశ్ APMC లైవ్ మార్కెట్ ధరలు',
              description: 'మీ పంటలకు లాభదాయకమైన ధర నిర్ణయించడానికి ఆంధ్రప్రదేశ్ APMC మార్కెట్ లైవ్ బెంచ్‌మార్క్‌లతో పోల్చండి.',
              tips: ['లైవ్ APMC మార్కెట్ ధరలు', 'సరసమైన ధర సూచికలు', 'గరిష్ట లాభాల అవకాశాలు'],
            },
            {
              icon: 'MessageCircle',
              title: 'ప్రత్యక్ష చర్చ & చాట్',
              description: 'ఆసక్తి ఉన్న కొనుగోలుదారులతో నేరుగా చాట్ చేయండి, వారి ఆఫర్లను పరిశీలించండి మరియు మీ నిబంధనలపై ఆర్డర్‌లను ఖరారు చేయండి.',
              tips: ['తక్షణ ప్రత్యక్ష సందేశాలు', 'సరళమైన ధర ఆఫర్ ఆమోదం', 'సౌకర్యవంతమైన కమ్యూనికేషన్'],
            },
            {
              icon: 'Shield',
              title: '100% ఎస్క్రో చెల్లింపు రక్షణ',
              description: 'మీరు పంటను రవాణా చేయడానికి ముందే కొనుగోలుదారు చెల్లింపు సురక్షిత ఎస్క్రోలో భద్రపరచబడుతుంది. డెలివరీ తర్వాత నేరుగా మీ ఖాతాకు జమ అవుతుంది.',
              tips: ['చెల్లింపు భద్రతకు పూర్తి హామీ', 'నేరుగా బ్యాంక్ / UPI బదిలీ', 'OTP డెలివరీ ధృవీకరణ'],
            },
          ];
        case 'hi':
          return [
            {
              icon: 'Store',
              title: 'अपनी फसल सीधे सूचीबद्ध करें',
              description: 'अपनी उपज का दाम, मात्रा तय करें और कैमरे से सीधी फोटो खींचकर सीधे सत्यापित खरीदारों तक पहुंचें।',
              tips: ['बिचौलियों का शून्य कमीशन', 'कैमरे से लाइव फोटो सत्यापन', 'सीधे थोक व खुदरा खरीदार'],
            },
            {
              icon: 'TrendingUp',
              title: 'आंध्र प्रदेश APMC लाइव मंडी दरें',
              description: 'अपनी फसल का उचित और लाभकारी मूल्य निर्धारित करने के लिए आंध्र प्रदेश APMC मंडी भावों से तुलना करें।',
              tips: ['लाइव मंडी बेंचमार्क दरें', 'उचित बाजार भाव संकेतक', 'मुनाफा बढ़ाने में मददगार'],
            },
            {
              icon: 'MessageCircle',
              title: 'सीधी बातचीत और मोलभाव',
              description: 'खरीदारों से सीधे चैट करें, उनके मूल्य प्रस्तावों की समीक्षा करें और अपनी शर्तों पर सौदे तय करें।',
              tips: ['त्वरित लाइव चैट संदेश', 'आसान ऑफर स्वीकृति', 'पारदर्शी व्यापार शर्तें'],
            },
            {
              icon: 'Shield',
              title: '100% सुरक्षित एस्क्रो भुगतान',
              description: 'फसल भेजने से पहले खरीदार की राशि सुरक्षित एस्क्रो खाते में जमा होती है। डिलीवरी निरीक्षण के बाद सीधे आपके बैंक खाते में पहुंचेगी।',
              tips: ['भुगतान डूबने का कोई जोखिम नहीं', 'सीधे बैंक / UPI में भुगतान', 'सुरक्षित OTP डिलीवरी सत्यापन'],
            },
          ];
        case 'ta':
          return [
            {
              icon: 'Store',
              title: 'விளைச்சலை நேரடியாக பட்டியலிடுங்கள்',
              description: 'உங்கள் விலை, இருப்பு அளவை நிர்ணயித்து, கேமரா மூலம் நேரடிப் புகைப்படம் எடுத்து வாங்குபவர்களிடம் நேரடியாக இணையுங்கள்.',
              tips: ['இடைத்தரகர் கமிஷன் இல்லை', 'நேரடி கேமரா புகைப்பட சான்று', 'சரிபார்க்கப்பட்ட வாங்குபவர்கள்'],
            },
            {
              icon: 'TrendingUp',
              title: 'ஆந்திரப் பிரதேசம் APMC மண்டி நேரலை விலைகள்',
              description: 'உங்கள் விளைச்சலுக்கு சிறந்த விலை பெற ஆந்திரப் பிரதேசம் APMC சந்தை நேரலை விலைகளுடன் ஒப்பிடுங்கள்.',
              tips: ['நேரலை மண்டி விலைகள்', 'நியாயமான விலை அளவுகோல்', 'அதிக லாப வாய்ப்பு'],
            },
            {
              icon: 'MessageCircle',
              title: 'நேரடி பேச்சுவார்த்தை & அரட்டை',
              description: 'வாங்குபவர்களுடன் நேரடியாக உரையாடுங்கள், விலை சலுகைகளை பேசி முடிவெடுங்கள்.',
              tips: ['உடனடி அரட்டை வசதி', 'விலை சலுகை ஏற்பு', 'தெளிவான வர்த்தகம்'],
            },
            {
              icon: 'Shield',
              title: '100% எஸ்க்ரோ பேமெண்ட் உத்தரவாதம்',
              description: 'பயிரை அனுப்பும் முன் பணம் எஸ்க்ரோவில் பாதுகாப்பாக வைக்கப்படும். டெலிவரி முடிந்ததும் உங்கள் வங்கிக் கணக்கில் வந்து சேரும்.',
              tips: ['பண இழப்பு அபாயம் இல்லை', 'நேரடி வங்கி / UPI பரிமாற்றம்', 'OTP டெலிவரி சரிபார்ப்பு'],
            },
          ];
        case 'kn':
          return [
            {
              icon: 'Store',
              title: 'ಬೆಳೆಗಳನ್ನು ನೇರವಾಗಿ ಪಟ್ಟಿ ಮಾಡಿ',
              description: 'ನಿಮ್ಮ ಬೆಲೆಯ ವಿವರ, ಪ್ರಮಾಣ ನಮೂದಿಸಿ ಮತ್ತು ಕ್ಯಾಮೆರಾದಿಂದ ಫೋಟೋ ತೆಗೆದು ನೇರವಾಗಿ ಖರೀದಿದಾರರಿಗೆ ತಲುಪಿಸಿ.',
              tips: ['ಮಧ್ಯವರ್ತಿಗಳ ಕಮಿಷನ್ ಇಲ್ಲ', 'ಲೈವ್ ಕ್ಯಾಮೆರಾ ಫೋಟೋ ದೃಢೀಕರಣ', 'ದೃಢೀಕೃತ ಖರೀದಿದಾರರು'],
            },
            {
              icon: 'TrendingUp',
              title: 'ಆಂಧ್ರಪ್ರದೇಶ APMC ಮಂಡಿ ಲೈವ್ ದರಗಳು',
              description: 'ನಿಮ್ಮ ಬೆಳೆಗೆ ಉತ್ತಮ ಬೆಲೆ ನಿರ್ಧರಿಸಲು ಆಂಧ್ರಪ್ರದೇಶ APMC ಮಂಡಿ ದರಗಳೊಂದಿಗೆ ಹೋಲಿಕೆ ಮಾಡಿ.',
              tips: ['ಲೈವ್ ಮಂಡಿ ದರ ಹೋಲಿಕೆ', 'ನ್ಯಾಯಯುತ ಮಾರುಕಟ್ಟೆ ದರ', 'ಹೆಚ್ಚಿನ ಆದಾಯ'],
            },
            {
              icon: 'MessageCircle',
              title: 'ನೇರ ಚರ್ಚೆ ಮತ್ತು ಚಾಟ್',
              description: 'ಖರೀದಿದಾರರೊಂದಿಗೆ ನೇರವಾಗಿ ಚಾಟ್ ಮಾಡಿ, ಬೆಲೆ ಆಫರ್‌ಗಳನ್ನು ಪರಿಶೀಲಿಸಿ ಮತ್ತು ಸುಲಭವಾಗಿ ವ್ಯಾಪಾರ ಪೂರ್ಣಗೊಳಿಸಿ.',
              tips: ['ತಕ್ಷಣದ ಸಂದೇಶಗಳು', 'ಆಫರ್ ಸ್ವೀಕಾರ ಸೌಲಭ್ಯ', 'ಪಾರದರ್ಶಕ ಮಾತುಕತೆ'],
            },
            {
              icon: 'Shield',
              title: '100% ಎಸ್ಕ್ರೋ ಪಾವತಿ ಗ್ಯಾರಂಟಿ',
              description: 'ಬೆಳೆ ರವಾನಿಸುವ ಮುನ್ನವೇ ಹಣ ಎಸ್ಕ್ರೋ ಖಾತೆಯಲ್ಲಿ ಸುರಕ್ಷಿತವಾಗಿರುತ್ತದೆ. ಡೆಲಿವರಿ ನಂತರ ನೇರವಾಗಿ ನಿಮ್ಮ ಖಾತೆಗೆ ಜಮೆಯಾಗುತ್ತದೆ.',
              tips: ['ಪಾವತಿಯ ಸಂಪೂರ್ಣ ರಕ್ಷಣೆ', 'ನೇರ ಬ್ಯಾಂಕ್ / UPI ಪಾವತಿ', 'OTP ಡೆಲಿವರಿ ಪರಿಶೀಲನೆ'],
            },
          ];
        case 'ml':
          return [
            {
              icon: 'Store',
              title: 'വിളകൾ നേരിട്ട് ലിസ്റ്റ് ചെയ്യുക',
              description: 'വിളയുടെ വിലയും അളവും രേഖപ്പെടുത്തി, ക്യാമറ ഉപയോഗിച്ച് തത്സമയ ഫോട്ടോ എടുത്ത് വാങ്ങുന്നവരിലേക്ക് നേരിട്ടെത്തുക.',
              tips: ['ഇടനിലക്കാരുടെ കമ്മീഷൻ ഇല്ലാതെ', 'തത്സമയ ക്യാമറ ഫോട്ടോ വെരിഫിക്കേഷൻ', 'വിശ്വസ്തരായ വാങ്ങുന്നവർ'],
            },
            {
              icon: 'TrendingUp',
              title: 'ആന്ധ്രാപ്രദേശ് APMC തത്സമയ നിരക്കുകൾ',
              description: 'വിളകൾക്ക് ഉയർന്ന വില ലഭിക്കാൻ ആന്ധ്രാപ്രദേശ് APMC സർക്കാർ വിപണി നിരക്കുകളുമായി താരതമ്യം ചെയ്യുക.',
              tips: ['തത്സമയ APMC വിപണി നിരക്കുകൾ', 'ന്യായവില സൂചികകൾ', 'കൂടുതൽ വരുമാനം'],
            },
            {
              icon: 'MessageCircle',
              title: 'നേരിട്ടുള്ള ചാറ്റും ചർച്ചയും',
              description: 'വാങ്ങുന്നവരുമായി നേരിട്ട് ചാറ്റ് ചെയ്യുക, കൗണ്ടർ ഓഫറുകൾ പരിശോധിക്കുക, ന്യായമായ കരാറുകളിൽ എത്തുക.',
              tips: ['തത്സമയ സന്ദേശങ്ങൾ', 'ഓഫറുകൾ സ്വീകരിക്കാനുള്ള സൗകര്യം', 'സുതാര്യമായ വ്യാപാരം'],
            },
            {
              icon: 'Shield',
              title: '100% എസ്ക്രോ പേയ്‌മെന്റ് സുരക്ഷ',
              description: 'വിള അയക്കുന്നതിന് മുൻപ് തന്നെ പണം എസ്ക്രോയിൽ സുരക്ഷിതമായി നിക്ഷേപിക്കപ്പെടുന്നു. ഡെലിവറിക്ക് ശേഷം നിങ്ങളുടെ അക്കൗണ്ടിലേക്ക് എത്തും.',
              tips: ['പണം നഷ്ടപ്പെടുമെന്ന ഭയമില്ല', 'നേരിട്ടുള്ള ബാങ്ക് / UPI സെറ്റിൽമെന്റ്', 'OTP ഡെലിവറി സ്ഥിരീകരണം'],
            },
          ];
        default:
          return [
            {
              icon: 'Store',
              title: 'List Your Harvest Directly',
              description: 'Set your expected rate, available quantity, and take real crop photos with your camera to reach verified buyers without middleman commissions.',
              tips: ['Zero middleman broker commissions', 'Live camera photo verification', 'Direct connection to verified buyers'],
            },
            {
              icon: 'TrendingUp',
              title: 'Andhra Pradesh APMC Mandi Rates',
              description: 'Compare your crop prices against real-time Andhra Pradesh APMC mandi benchmarks to price your produce competitively and profitably.',
              tips: ['Live mandi benchmark comparisons', 'Fair market price indicators', 'Maximize your net agricultural profit'],
            },
            {
              icon: 'MessageCircle',
              title: 'Direct Negotiation & Chat',
              description: 'Chat directly with interested wholesale and retail buyers. Receive counter-offers, answer questions, and finalize orders on your terms.',
              tips: ['Instant live messaging', 'Structured price offer approvals', 'Direct transparent terms'],
            },
            {
              icon: 'Shield',
              title: '100% Escrow Payment Guarantee',
              description: 'Buyer funds are locked in secure escrow before you dispatch harvest. Funds are released directly to your bank account upon delivery.',
              tips: ['Zero payment default risk', 'Direct UPI / Bank settlement', 'OTP delivery verification'],
            },
          ];
      }
    } else {
      // Buyer steps
      switch (language) {
        case 'te':
          return [
            {
              icon: 'Users',
              title: 'రైతుల నుండి నేరుగా తాజా పంట కొనుగోలు',
              description: 'ప్రాంతీయ రైతుల నుండి ధృవీకరించబడిన తాజా పంటలను ప్రత్యక్ష కెమెరా ఫోటోలతో బ్రౌజ్ చేయండి.',
              tips: ['కెమెరాతో తీసిన నిజమైన ఫోటోలు', 'రైతులతో ప్రత్యక్ష సంబంధం', 'తాజా నాణ్యమైన పంటలు'],
            },
            {
              icon: 'TrendingUp',
              title: 'ఆంధ్రప్రదేశ్ APMC ధరలతో పోల్చండి',
              description: 'ఆఫర్ ఇచ్చే ముందు ఆంధ్రప్రదేశ్ APMC అధికారిక మార్కెట్ ధరలతో పోల్చి సరసమైన ధరకు కొనండి.',
              tips: ['లైవ్ మార్కెట్ రేటు సమాచారం', 'సమంజసమైన ధర ట్యాగ్‌లు', 'తెలివైన కొనుగోలు నిర్ణయాలు'],
            },
            {
              icon: 'MessageCircle',
              title: 'ప్రత్యక్ష ధర సంప్రదింపులు',
              description: 'రైతులతో నేరుగా చాట్ చేసి కౌంటర్ ఆఫర్ ఇవ్వండి మరియు డెలివరీ తేదీలను సులభంగా నిర్ణయించండి.',
              tips: ['సరసమైన ధర సంప్రదింపులు', 'తక్షణ సమాధానాలు', 'నేరుగా ఆర్డర్ నిర్ధారణ'],
            },
            {
              icon: 'Shield',
              title: 'సురక్షితమైన ఎస్క్రో రక్షణ',
              description: 'మీ చెల్లింపు ఎస్క్రోలో సురక్షితంగా ఉంటుంది. పంటను పరిశీలించి నాణ్యత సంతృప్తి చెందిన తర్వాతే నిధులు విడుదలవుతాయి.',
              tips: ['నాణ్యత హామీ రక్షణ', 'సురక్షిత OTP డెలివరీ విడుదల', 'పూర్తి రీఫండ్ రక్షణ'],
            },
          ];
        case 'hi':
          return [
            {
              icon: 'Users',
              title: 'खेत से सीधी ताजी खरीद',
              description: 'विश्वसनीय किसानों से सीधे कैमरे से ली गई प्रामाणिक फोटो के साथ ताजी उपज खरीदें।',
              tips: ['कैमरे से खींची गई वास्तविक फोटो', 'किसानों से सीधा संपर्क', 'बिचौलियों के बिना बचत'],
            },
            {
              icon: 'TrendingUp',
              title: 'आंध्र प्रदेश APMC दरों से तुलना',
              description: 'खरीदने से पहले आंध्र प्रदेश APMC आधिकारिक मंडी दरों से तुलना करके उचित भाव प्राप्त करें।',
              tips: ['लाइव मंडी भाव बेंचमार्क', 'उचित मूल्य टैग', 'सटीक खरीदारी निर्णय'],
            },
            {
              icon: 'MessageCircle',
              title: 'सीधी बातचीत और सौदेबाजी',
              description: 'किसानों से सीधे चैट करें, अपने दाम प्रस्तावित करें और डिलीवरी का समय तय करें।',
              tips: ['सीधे दाम तय करें', 'तुरंत प्रतिक्रिया', 'पारदर्शी शर्तें'],
            },
            {
              icon: 'Shield',
              title: 'सुरक्षित एस्क्रो भुगतान',
              description: 'आपकी राशि एस्क्रो में सुरक्षित रहती है। डिलीवरी पर माल की जांच और संतुष्टि के बाद ही भुगतान जारी होता है।',
              tips: ['गुणवत्ता संतुष्टि गारंटी', 'सुरक्षित OTP आधारित भुगतान', 'पूरी सुरक्षा'],
            },
          ];
        case 'ta':
          return [
            {
              icon: 'Users',
              title: 'பண்ணையிலிருந்து நேரடி கொள்முதல்',
              description: 'நம்பகமான விவசாயிகளிடமிருந்து கேமரா புகைப்பட சான்றுகளுடன் புதிய விளைச்சலை வாங்குங்கள்.',
              tips: ['உண்மையான கேமரா புகைப்படம்', 'விவசாயிகளுடன் நேரடி தொடர்பு', 'மலிவான விலை'],
            },
            {
              icon: 'TrendingUp',
              title: 'ஆந்திரப் பிரதேசம் APMC ஒப்பீடு',
              description: 'ஆந்திரப் பிரதேசம் APMC அரசு சந்தை விலைகளுடன் ஒப்பிட்டு நியாயமான விலையில் வாங்குங்கள்.',
              tips: ['நேரலை மண்டி விலை அளவுகோல்', 'நியாயமான விலை தகவல்', 'லாபகரமான கொள்முதல்'],
            },
            {
              icon: 'MessageCircle',
              title: 'நேரடி விலை பேரம்',
              description: 'விவசாயிகளிடம் நேரடியாகப் பேசி உங்கள் விலையை முன்மொழியுங்கள் மற்றும் ஆர்டரை உறுதி செய்யுங்கள்.',
              tips: ['விலை சலுகை அளித்தல்', 'விரைவு பதில்கள்', 'தெளிவான ஒப்பந்தம்'],
            },
            {
              icon: 'Shield',
              title: 'பாதுகாப்பான எஸ்க்ரோ பேமெண்ட்',
              description: 'டெலிவரியின் போது விளைச்சலின் தரத்தை நீங்கள் சரிபார்த்த பின்னரே பணம் விவசாயிக்கு மாற்றப்படும்.',
              tips: ['தர உத்தரவாதம்', 'OTP சரிபார்ப்பு மூலம் பணப்பரிமாற்றம்', 'முழு பாதுகாப்பு'],
            },
          ];
        case 'kn':
          return [
            {
              icon: 'Users',
              title: 'ತೋಟದಿಂದ ನೇರ ಖರೀದಿ',
              description: 'ವಿಶ್ವಾಸಾರ್ಹ ರೈತರಿಂದ ಕ್ಯಾಮೆರಾ ಫೋಟೋಗಳೊಂದಿಗೆ ತಾಜಾ ಬೆಳೆಗಳನ್ನು ನೇರವಾಗಿ ಖರೀದಿಸಿ.',
              tips: ['ನಿಜವಾದ ಕ್ಯಾಮೆರಾ ಫೋಟೋಗಳು', 'ರೈತರೊಂದಿಗೆ ನೇರ ಸಂಪರ್ಕ', 'ಉತ್ತಮ ಉಳಿತಾಯ'],
            },
            {
              icon: 'TrendingUp',
              title: 'ಆಂಧ್ರಪ್ರದೇಶ APMC ದರ ಹೋಲಿಕೆ',
              description: 'ಆಂಧ್ರಪ್ರದೇಶ APMC ಸರಕಾರಿ ಮಂಡಿ ದರಗಳೊಂದಿಗೆ ಹೋಲಿಸಿ ನ್ಯಾಯಯುತ ಬೆಲೆಗೆ ಖರೀದಿಸಿ.',
              tips: ['ಲೈವ್ ಮಂಡಿ ಬೆಲೆಗಳು', 'ನ್ಯಾಯಯುತ ದರ ಟ್ಯಾಗ್', 'ತಿಳುವಳಿಕೆಯುತ ನಿರ್ಧಾರ'],
            },
            {
              icon: 'MessageCircle',
              title: 'ನೇರ ಬೆಲೆ ಚೌಕಾಶಿ',
              description: 'ರೈತರೊಂದಿಗೆ ನೇರವಾಗಿ ಚಾಟ್ ಮಾಡಿ ನಿಮ್ಮ ಬೆಲೆಯನ್ನು ಪ್ರಸ್ತಾಪಿಸಿ ಮತ್ತು ಡೆಲಿವರಿ ಸಮಯ ನಿರ್ಧರಿಸಿ.',
              tips: ['ನ್ಯಾಯಯುತ ಆಫರ್ ಸೌಲಭ್ಯ', 'ತಕ್ಷಣದ ಪ್ರತಿಕ್ರಿಯೆ', 'ಪಾರದರ್ಶಕ ನಿಯಮಗಳು'],
            },
            {
              icon: 'Shield',
              title: 'ಸುರಕ್ಷಿತ ಎಸ್ಕ್ರೋ ಪಾವತಿ',
              description: 'ಡೆಲಿವರಿ ಸಮಯದಲ್ಲಿ ಗುಣಮಟ್ಟ ಪರಿಶೀಲಿಸಿದ ನಂತರವೇ ರೈತರಿಗೆ ಹಣ ಬಿಡುಗಡೆಯಾಗುತ್ತದೆ.',
              tips: ['ಗುಣಮಟ್ಟದ ಖಾತರಿ', 'OTP ಆಧಾರಿತ ಪಾವತಿ ಬಿಡುಗಡೆ', 'ಸಂಪೂರ್ಣ ಸುರಕ್ಷತೆ'],
            },
          ];
        case 'ml':
          return [
            {
              icon: 'Users',
              title: 'കർഷകരിൽ നിന്ന് നേരിട്ടുള്ള സംഭരണം',
              description: 'വിശ്വസ്തരായ കർഷകരിൽ നിന്ന് തത്സമയ ക്യാമറ ഫോട്ടോകളോടെ പുതിയ വിളകൾ വാങ്ങുക.',
              tips: ['ക്യാമറയിൽ എടുത്ത യഥാർത്ഥ ഫോട്ടോകൾ', 'കർഷകരുമായി നേരിട്ടുള്ള ബന്ധം', 'ഇടനിലക്കാരില്ലാത്ത ലാഭം'],
            },
            {
              icon: 'TrendingUp',
              title: 'ആന്ധ്രാപ്രദേശ് APMC താരതമ്യം',
              description: 'ആന്ധ്രാപ്രദേശ് APMC ഔദ്യോഗിക മണ്ഡി നിരക്കുകളുമായി താരതമ്യം ചെയ്ത് വാങ്ങുക.',
              tips: ['തത്സമയ മണ്ഡി വില വിവരങ്ങൾ', 'ന്യായവില ടാഗുകൾ', 'മികച്ച തീരുമാനം'],
            },
            {
              icon: 'MessageCircle',
              title: 'നേരിട്ട് വിലപേശുക',
              description: 'കർഷകരുമായി നേരിട്ട് ചാറ്റ് ചെയ്ത് ഓഫറുകൾ നൽകുക, ഡെലിവറി സമയം നിശ്ചയിക്കുക.',
              tips: ['ന്യായമായ ഓഫറുകൾ', 'തത്സമയ മറുപടികൾ', 'വ്യക്തമായ ധാരണ'],
            },
            {
              icon: 'Shield',
              title: 'സുരക്ഷിത എസ്ക്രോ പേയ്മെന്റ്',
              description: 'ഡെലിവറി സമയത്ത് ഗുണനിലവാരം പരിശോധിച്ച് ഉറപ്പുവരുത്തിയ ശേഷം മാത്രം പണം റിലീസ് ചെയ്യുക.',
              tips: ['ഗുണമേന്മ ഉറപ്പ്', 'OTP അടിസ്ഥാനമാക്കിയുള്ള പേയ്‌മെന്റ് റിലീസ്', 'പൂർണ്ണ സുരക്ഷ'],
            },
          ];
        default:
          return [
            {
              icon: 'Users',
              title: 'Farm-Fresh Direct Procurement',
              description: 'Browse verified fresh harvests from regional farmers with authentic real-time camera crop photos.',
              tips: ['Authentic photos taken with camera', 'Direct relationship with farmers', 'Transparent batch quantities'],
            },
            {
              icon: 'TrendingUp',
              title: 'Compare Andhra Pradesh APMC Rates',
              description: 'Always get verified market insights. Compare asking prices with Andhra Pradesh APMC official rates before placing offers.',
              tips: ['Real-time APMC mandi benchmark', 'Fair price indicators', 'Informed purchase decisions'],
            },
            {
              icon: 'MessageCircle',
              title: 'Direct Price Negotiation',
              description: 'Make custom price proposals, ask harvest questions, and schedule delivery dates directly with farmers.',
              tips: ['Negotiable batch pricing', 'Instant direct responses', 'Clear terms before commitment'],
            },
            {
              icon: 'Shield',
              title: 'Protected Escrow Payments',
              description: 'Your payment is held safely in escrow. Funds are only transferred after you inspect and verify harvest quality upon delivery.',
              tips: ['Quality satisfaction guarantee', 'Safe OTP-based delivery release', 'Full refund protection'],
            },
          ];
      }
    }
  };

  const steps = getSteps();
  const step = steps[currentStep] || steps[0];

  const getStepIcon = (iconName: string) => {
    switch (iconName) {
      case 'Users':
        return <Users className="w-8 h-8 text-green-600" />;
      case 'Store':
        return <Store className="w-8 h-8 text-green-600" />;
      case 'TrendingUp':
        return <TrendingUp className="w-8 h-8 text-green-600" />;
      case 'MessageCircle':
        return <MessageCircle className="w-8 h-8 text-green-600" />;
      case 'Shield':
        return <Shield className="w-8 h-8 text-green-600" />;
      default:
        return <Sparkles className="w-8 h-8 text-green-600" />;
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowSummary(true);
    }
  };

  const handlePrev = () => {
    if (showSummary) {
      setShowSummary(false);
    } else if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-600 via-emerald-600 to-teal-700 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-6 sm:p-10 border border-white/40"
      >
        {!showSummary ? (
          <div>
            {/* Step header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                {steps.map((_: any, idx: number) => (
                  <div
                    key={idx}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      idx === currentStep
                        ? 'w-8 bg-green-600'
                        : idx < currentStep
                        ? 'w-2 bg-green-400'
                        : 'w-2 bg-gray-200'
                    }`}
                  />
                ))}
              </div>
              <button
                onClick={onSkip}
                className="text-xs font-semibold text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                {t.skip || 'Skip Tutorial'}
              </button>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center shadow-inner">
                  {getStepIcon(step.icon)}
                </div>

                <div>
                  <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                    {step.title}
                  </h2>
                  <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Tips */}
                {step.tips && step.tips.length > 0 && (
                  <div className="bg-green-50/70 border border-green-200 rounded-2xl p-4 space-y-2.5">
                    <div className="text-xs font-bold uppercase tracking-wider text-green-800">
                      {language === 'te'
                        ? 'ముఖ్యాంశాలు'
                        : language === 'hi'
                        ? 'मुख्य विशेषताएं'
                        : language === 'ta'
                        ? 'முக்கிய அம்சங்கள்'
                        : language === 'kn'
                        ? 'ಪ್ರಮುಖ ಅಂಶಗಳು'
                        : language === 'ml'
                        ? 'പ്രധാന സവിശേഷതകൾ'
                        : 'Key Highlights'}
                    </div>
                    {step.tips.map((tip: string, i: number) => (
                      <div key={i} className="flex items-center gap-2 text-xs font-medium text-green-900">
                        <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                        <span>{tip}</span>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between pt-8 border-t border-gray-100 mt-8">
              <button
                onClick={handlePrev}
                disabled={currentStep === 0}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 disabled:opacity-30 cursor-pointer transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                {t.previous || 'Previous'}
              </button>

              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-green-600 hover:bg-green-700 shadow-md shadow-green-600/20 cursor-pointer transition-all hover:translate-x-0.5"
              >
                <span>
                  {currentStep === steps.length - 1
                    ? (t.complete || 'Finish')
                    : (t.next || 'Next')}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* Summary View */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-green-500 to-emerald-400 text-white flex items-center justify-center mx-auto shadow-lg shadow-green-500/25">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {language === 'te'
                  ? 'మీరు సిద్ధంగా ఉన్నారు!'
                  : language === 'hi'
                  ? 'आप पूरी तरह तैयार हैं!'
                  : language === 'ta'
                  ? 'நீங்கள் தயாராகிவிட்டீர்கள்!'
                  : language === 'kn'
                  ? 'ನೀವು ಸಿದ್ಧರಾಗಿದ್ದೀರಿ!'
                  : language === 'ml'
                  ? 'നിങ്ങൾ തയ്യാറാണ്!'
                  : "You're All Set!"}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {language === 'te'
                  ? 'ఆంధ్రప్రదేశ్ APMC సమాచారంతో ప్రత్యక్ష మరియు పారదర్శక వ్యవసాయ వాణిజ్యానికి స్వాగతం'
                  : language === 'hi'
                  ? 'आंध्र प्रदेश APMC डेटा के साथ पारदर्शी और सीधे कृषि व्यापार में आपका स्वागत है'
                  : language === 'ta'
                  ? 'ஆந்திரப் பிரதேசம் APMC தகவல்களுடன் வெளிப்படையான விவசாய வர்த்தகத்திற்கு நல்வரவு'
                  : language === 'kn'
                  ? 'ಆಂಧ್ರಪ್ರದೇಶ APMC ದರಗಳೊಂದಿಗೆ ನೇರ ಮತ್ತು ಪಾರದರ್ಶಕ ಕೃಷಿ ವ್ಯಾಪಾರಕ್ಕೆ ಸ್ವಾಗತ'
                  : language === 'ml'
                  ? 'ആന്ധ്രാപ്രദേശ് APMC വിവരങ്ങളോടെ സുതാര്യമായ കാർഷിക വ്യാപാരത്തിലേക്ക് സ്വാഗതം'
                  : 'Welcome to direct, transparent agricultural commerce with Andhra Pradesh APMC mandi benchmarks'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
              {(
                language === 'te'
                  ? [
                      { title: 'ప్రత్యక్ష వాణిజ్యం', desc: 'మధ్యవర్తుల కమీషన్లు లేవు', icon: 'Store' },
                      { title: 'APMC బెంచ్‌మార్క్', desc: 'లైవ్ మార్కెట్ సమాచారం', icon: 'TrendingUp' },
                      { title: 'తక్షణ చాట్', desc: 'నేరుగా సంప్రదించి ఆర్డర్ చేయండి', icon: 'MessageCircle' },
                      { title: 'ఎస్క్రో గ్యారంటీ', desc: 'తనిఖీ తర్వాతే సురక్షిత చెల్లింపు', icon: 'Shield' },
                    ]
                  : language === 'hi'
                  ? [
                      { title: 'सीधा व्यापार', desc: 'बिचौलियों का कोई कमीशन नहीं', icon: 'Store' },
                      { title: 'APMC बेंचमार्क', desc: 'लाइव मंडी दरें', icon: 'TrendingUp' },
                      { title: 'तुरंत बातचीत', desc: 'सीधे मोलभाव कर ऑर्डर तय करें', icon: 'MessageCircle' },
                      { title: 'एस्क्रो गारंटी', desc: 'जांच के बाद सुरक्षित भुगतान', icon: 'Shield' },
                    ]
                  : language === 'ta'
                  ? [
                      { title: 'நேரடி வர்த்தகம்', desc: 'இடைத்தரகர் கமிஷன் இல்லை', icon: 'Store' },
                      { title: 'APMC ஒப்பீடு', desc: 'நேரலை சந்தை விலைகள்', icon: 'TrendingUp' },
                      { title: 'உடனடி அரட்டை', desc: 'நேரடியாகப் பேசி முடிக்கலாம்', icon: 'MessageCircle' },
                      { title: 'எஸ்க்ரோ உத்தரவாதம்', desc: 'சரிபார்த்த பின் பாதுகாப்பான பணம்', icon: 'Shield' },
                    ]
                  : language === 'kn'
                  ? [
                      { title: 'ನೇರ ವ್ಯಾಪಾರ', desc: 'ಮಧ್ಯವರ್ತಿಗಳ ಕಮಿಷನ್ ಇಲ್ಲ', icon: 'Store' },
                      { title: 'APMC ಮಂಡಿ ದರ', desc: 'ಲೈವ್ ಮಾರುಕಟ್ಟೆ ಮಾಹಿತಿ', icon: 'TrendingUp' },
                      { title: 'ತಕ್ಷಣದ ಚಾಟ್', desc: 'ನೇರವಾಗಿ ಚರ್ಚಿಸಿ ಆರ್ಡರ್ ಮಾಡಿ', icon: 'MessageCircle' },
                      { title: 'ಎಸ್ಕ್ರೋ ಗ್ಯಾರಂಟಿ', desc: 'ಪರಿಶೀಲನೆಯ ನಂತರ ಸುರಕ್ಷಿತ ಪಾವತಿ', icon: 'Shield' },
                    ]
                  : language === 'ml'
                  ? [
                      { title: 'നേരിട്ടുള്ള വ്യാപാരം', desc: 'ഇടനിലക്കാരുടെ കമ്മീഷൻ ഇല്ലാതെ', icon: 'Store' },
                      { title: 'APMC ബെഞ്ച്മാർക്ക്', desc: 'തത്സമയ വിപണി നിരക്കുകൾ', icon: 'TrendingUp' },
                      { title: 'തത്സമയ ചാറ്റ്', desc: 'നേരിട്ട് ചർച്ച ചെയ്തു ഓർഡർ ഉറപ്പാക്കാം', icon: 'MessageCircle' },
                      { title: 'എസ്ക്രോ ഗ്യാരണ്ടി', desc: 'പരിശോധിച്ച് ഉറപ്പാക്കിയ ശേഷം പണം', icon: 'Shield' },
                    ]
                  : [
                      { title: 'Direct Trade', desc: 'No middlemen commissions', icon: 'Store' },
                      { title: 'APMC Benchmarks', desc: 'Real-time market fair rates', icon: 'TrendingUp' },
                      { title: 'Instant Chat', desc: 'Negotiate and finalize orders', icon: 'MessageCircle' },
                      { title: 'Escrow Guarantee', desc: 'Safe payment upon inspection', icon: 'Shield' },
                    ]
              ).map((feat: any, idx: number) => (
                <div key={idx} className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-green-100 text-green-700">
                    {getStepIcon(feat.icon)}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-800">{feat.title}</div>
                    <div className="text-[11px] text-gray-500">{feat.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={onComplete}
              className="w-full py-3.5 rounded-xl font-bold text-white bg-green-600 hover:bg-green-700 shadow-lg shadow-green-600/30 cursor-pointer transition-all active:scale-98"
            >
              {t.getStarted || (language === 'ml' ? 'ആരംഭിക്കുക' : 'Get Started Now')}
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};
