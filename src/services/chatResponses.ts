import { ProduceListing, ChatMessage, Language } from '../types';
import { getTranslatedCropName, getTranslatedVillageName } from '../data/translations';

export const generateChatResponse = (
  message: string,
  language: Language,
  partnerType: 'farmer' | 'buyer',
  listing: ProduceListing,
  partnerName: string,
  _history: ChatMessage[]
): string => {
  const lowerMsg = message.toLowerCase();
  const crop = getTranslatedCropName(listing.cropName, language);
  const village = getTranslatedVillageName(listing.farmerVillage, language);
  const discounted = Math.max(10, listing.pricePerKg - 2);

  const isAskingPrice =
    lowerMsg.includes('price') ||
    lowerMsg.includes('rate') ||
    lowerMsg.includes('cost') ||
    lowerMsg.includes('₹') ||
    lowerMsg.includes('discount') ||
    lowerMsg.includes('ధర') ||
    lowerMsg.includes('తగ్గిం') ||
    lowerMsg.includes('भाव') ||
    lowerMsg.includes('दाम') ||
    lowerMsg.includes('விலை') ||
    lowerMsg.includes('ದರ') ||
    lowerMsg.includes('വില');

  const isAskingQuality =
    lowerMsg.includes('quality') ||
    lowerMsg.includes('fresh') ||
    lowerMsg.includes('organic') ||
    lowerMsg.includes('సేంద్రీయ') ||
    lowerMsg.includes('నాణ్యత') ||
    lowerMsg.includes('जैविक') ||
    lowerMsg.includes('தரம்') ||
    lowerMsg.includes('ಗುಣಮಟ್ಟ') ||
    lowerMsg.includes('ഗുണമേന്മ');

  const isAskingDelivery =
    lowerMsg.includes('deliver') ||
    lowerMsg.includes('transport') ||
    lowerMsg.includes('send') ||
    lowerMsg.includes('dispatch') ||
    lowerMsg.includes('డెలివరీ') ||
    lowerMsg.includes('डिलीवर') ||
    lowerMsg.includes('டெலிவரி') ||
    lowerMsg.includes('ಡೆಲಿವರಿ') ||
    lowerMsg.includes('ഡെലിവറി');

  const isAskingQuantity =
    lowerMsg.includes('quantity') ||
    lowerMsg.includes('bulk') ||
    lowerMsg.includes('kg') ||
    lowerMsg.includes('పరిమాణం') ||
    lowerMsg.includes('కిలో') ||
    lowerMsg.includes('मात्रा') ||
    lowerMsg.includes('அளவு') ||
    lowerMsg.includes('ಪ್ರಮಾಣ') ||
    lowerMsg.includes('കിലോ');

  // If partner is Farmer
  if (partnerType === 'farmer') {
    if (isAskingPrice) {
      switch (language) {
        case 'te':
          return listing.negotiable
            ? `ఇది తాజా సేంద్రీయ ${crop}. కిలోకు ₹${listing.pricePerKg} న్యాయమైన ధర. బల్క్ ఆర్డర్‌లకు కిలోకు ₹${discounted} వరకు సర్దుబాటు చేయవచ్చు!`
            : `కిలోకు ₹${listing.pricePerKg} నాణ్యమైన నా పంటకు సరసమైన ప్రత్యక్ష ధర. ఎటువంటి రసాయనాలు వాడలేదు!`;
        case 'hi':
          return listing.negotiable
            ? `यह ताजा जैविक ${crop} है। ₹${listing.pricePerKg}/किलो उचित मंडी भाव है। थोक खरीद पर ₹${discounted}/किलो तक बात बन सकती है!`
            : `₹${listing.pricePerKg}/किलो सीधे खेत का उचित मूल्य है। 100% प्राकृतिक रूप से उगाई गई फसल!`;
        case 'ta':
          return listing.negotiable
            ? `இது புதிய இயற்கை ${crop}. கிலோவிற்கு ₹${listing.pricePerKg} நியாயமான விலை. மொத்தமாக வாங்கினால் ₹${discounted} வரை பேசலாம்!`
            : `கிலோவிற்கு ₹${listing.pricePerKg} எங்கள் பண்ணை விலை. தரம் மற்றும் புத்துணர்ச்சி உறுதி!`;
        case 'kn':
          return listing.negotiable
            ? `ಇದು ತಾಜಾ ಸಾವಯವ ${crop}. ಕೆಜಿಗೆ ₹${listing.pricePerKg} ನ್ಯಾಯಯುತ ದರ. ಬಲ್ಕ್ ಖರೀದಿಗೆ ₹${discounted} ವರೆಗೆ ಪರಿಗಣಿಸಬಹುದು!`
            : `ಕೆಜಿಗೆ ₹${listing.pricePerKg} ನಮ್ಮ ತೋಟದ ನೇರ ಬೆಲೆ. ಉತ್ತಮ ಗುಣಮಟ್ಟ!`;
        case 'ml':
          return listing.negotiable
            ? `ഇത് ഓർഗാനിക് ${crop} ആണ്. കിലോയ്ക്ക് ₹${listing.pricePerKg} ന്യായമായ നിരക്കാണ്. ബൾക്ക് ഓർഡറാണെങ്കിൽ ₹${discounted} വരെ നൽകാം.`
            : `കിലോയ്ക്ക് ₹${listing.pricePerKg} ന്യായമായ വിലയാണ്. യാതൊരു കീടനാശിനികളും ഉപയോഗിക്കാതെ വിളവെടുത്തതാണ്.`;
        default:
          return listing.negotiable
            ? `Market rate today is ₹${listing.pricePerKg}/kg for premium organic ${crop}. For bulk orders, we can discuss ₹${discounted}/kg. 100% direct from farm!`
            : `₹${listing.pricePerKg}/kg is our fair direct farm price for 100% naturally grown ${crop}. Quality guaranteed!`;
      }
    }

    if (isAskingQuality) {
      switch (language) {
        case 'te':
          return `నాణ్యత విషయంలో రాజీ లేదు! ఈ ఉదయమే కోసిన తాజా ${crop}. పూర్తిగా సేంద్రీయ ఎరువులతో పండించాము.`;
        case 'hi':
          return `गुणवत्ता में कोई समझौता नहीं! आज सुबह की ताज़ा कटी ${crop} है। बिना किसी रसायन के शुद्ध जैविक खाद से तैयार।`;
        case 'ta':
          return `தரத்திற்கு முழு உத்தரவாதம்! இன்று காலை பறிக்கப்பட்ட புதிய ${crop}. ரசாயனமில்லாத இயற்கை விவசாயம்.`;
        case 'kn':
          return `ಗುಣಮಟ್ಟದಲ್ಲಿ ಯಾವುದೇ ರಾಜಿ ಇಲ್ಲ! ಇಂದು ಬೆಳಗ್ಗೆ ಕೊಯ್ಲು ಮಾಡಿದ ತಾಜಾ ${crop}. ಸಂಪೂರ್ಣ ಸಾವಯವ ಕೃಷಿ.`;
        case 'ml':
          return `ഗുണനിലവാരത്തിൽ ഒട്ടും വിട്ടുവീഴ്ചയില്ല! ഇന്ന് രാവിലെ വിളവെടുത്ത ഫ്രഷ് ${crop} ആണ്. പൂർണ്ണമായും ജൈവരീതിയിലാണ് കൃഷി ചെയ്തത്.`;
        default:
          return `Quality is our pride! Freshly harvested ${crop} grown with clean water and organic compost. Freshly picked today!`;
      }
    }

    if (isAskingDelivery) {
      switch (language) {
        case 'te':
          return `ప్రత్యక్ష రవాణా ఏర్పాటు చేయవచ్చు! ఎస్క్రో చెల్లింపు ద్వారా ఆర్డర్ ధృవీకరించిన వెంటనే ప్యాకింగ్ చేసి పంపుతాము.`;
        case 'hi':
          return `सीधा खेत से सुरक्षित परिवहन की व्यवस्था हो जाएगी। एस्क्रो पेमेंट की पुष्टि के बाद सुरक्षित क्रेट्स में भेजा जाएगा।`;
        case 'ta':
          return `பண்ணையிலிருந்து நேரடியாக டெலிவரி செய்ய ஏற்பாடு செய்யலாம்! எஸ்க்ரோவில் உறுதிசெய்ததும் உடனே அனுப்பிவைக்கப்படும்.`;
        case 'kn':
          return `ತೋಟದಿಂದ ನೇರ ಸಾರಿಗೆ ವ್ಯವಸ್ಥೆ ಮಾಡಬಹುದು! ಎಸ್ಕ್ರೋ ಪಾವತಿ ದೃಢೀಕರಿಸಿದ ನಂತರ ಕ್ರೇಟ್‌ಗಳಲ್ಲಿ ಸುರಕ್ಷಿತವಾಗಿ ರವಾನಿಸಲಾಗುವುದು.`;
        case 'ml':
          return `സുരക്ഷിതമായി ഡെലിവറി ചെയ്യാം. എസ്ക്രോ പെയ്‌മെന്റ് വഴി ഓർഡർ പൂർത്തിയാക്കാവുന്നതാണ്.`;
        default:
          return `Direct farm transport can be arranged! Once confirmed through escrow, produce will be safely packed and dispatched.`;
      }
    }

    if (isAskingQuantity) {
      switch (language) {
        case 'te':
          return `ప్రస్తుతం ${listing.quantity} కిలోలు తక్షణమే అందుబాటులో ఉన్నాయి. మీకు ఎంత పరిమాణం అవసరం?`;
        case 'hi':
          return `वर्तमान में हमारे पास ${listing.quantity} किलो स्टॉक तुरंत तैयार है। आपको कितनी मात्रा चाहिए?`;
        case 'ta':
          return `தற்போது எங்களிடம் ${listing.quantity} கிலோ இருப்பு உள்ளது. உங்களுக்கு எவ்வளவு தேவை?`;
        case 'kn':
          return `ಪ್ರಸ್ತುತ ${listing.quantity} ಕೆಜಿ ತಕ್ಷಣ ಲಭ್ಯವಿದೆ. ನಿಮಗೆ ಎಷ್ಟು ಪ್ರಮಾಣ ಬೇಕು?`;
        case 'ml':
          return `ഇപ്പോൾ ${listing.quantity} കിലോ ലഭ്യമാണ്. ആവശ്യാനുസരണം ഓർഡർ ചെയ്യാവുന്നതാണ്.`;
        default:
          return `We currently have ${listing.quantity} kg available ready for immediate harvest and dispatch. How much do you need?`;
      }
    }

    // Default friendly greeting
    switch (language) {
      case 'te':
        return `నమస్కారం! నేను ${village} నుండి ${partnerName}. నా తాజా ${crop} గురించి ఆరా తీసినందుకు ధన్యవాదాలు. మీరు ఎన్ని కిలోలు కొనాలనుకుంటున్నారు?`;
      case 'hi':
        return `नमस्ते! मैं ${village} से ${partnerName} हूँ। मेरी ${crop} की फसल में रुचि के लिए धन्यवाद। आप कितने किलो लेना चाहेंगे?`;
      case 'ta':
        return `வணக்கம்! நான் ${village}-லிருந்து ${partnerName}. ${crop} பற்றி விசாரித்ததற்கு நன்றி. எத்தனை கிலோ வாங்க விரும்புகிறீர்கள்?`;
      case 'kn':
        return `ನಮಸ್ಕಾರ! ನಾನು ${village}-ಯಿಂದ ${partnerName}. ${crop} ಬೆಳೆಗೆ ಆಸಕ್ತಿ ತೋರಿದ್ದಕ್ಕಾಗಿ ಧನ್ಯವಾದ. ಎಷ್ಟು ಕೆಜಿ ಬೇಕು?`;
      case 'ml':
        return `നമസ്കാരം! ${crop} നെക്കുറിച്ച് കൂടുതൽ വിവരങ്ങൾ വേണമെന്നുണ്ടോ? ന്യായമായ വിലയിൽ മികച്ച ഉത്പന്നങ്ങൾ നൽകാൻ ഞാൻ തയ്യാറാണ്.`;
      default:
        return `Namaskaram! I am ${partnerName} from ${village}. Thank you for reaching out about my fresh ${crop}. How many kilos would you like to purchase?`;
    }
  }

  // Partner is Buyer
  if (isAskingPrice) {
    switch (language) {
      case 'te':
        return `మాకు నిరంతర సరఫరా అవసరం. కిలోకు ₹${discounted} కు ఇవ్వగలరా?`;
      case 'hi':
        return `हमें नियमित आपूर्ति की आवश्यकता है। क्या आप ₹${discounted}/किलो में दे सकते हैं?`;
      case 'ta':
        return `எங்களுக்கு தொடர்ந்து சப்ளை தேவை. கிலோவிற்கு ₹${discounted} கொடுக்க முடியுமா?`;
      case 'kn':
        return `ನಮಗೆ ನಿರಂತರ ಪೂರೈಕೆ ಬೇಕು. ಕೆಜಿಗೆ ₹${discounted} ನೀಡಲು ಸಾಧ್ಯವೇ?`;
      case 'ml':
        return `ഞങ്ങൾക്ക് റെഗുലർ സപ്ലൈ ആവശ്യമാണ്. കിലോയ്ക്ക് ₹${discounted} നൽകാമോ?`;
      default:
        return `We are looking for continuous regular supply. Can you offer a fair bulk rate around ₹${discounted}/kg?`;
    }
  }

  if (isAskingDelivery) {
    switch (language) {
      case 'te':
        return `రేపటికి పంపించగలరా? మా వద్ద నాణ్యత తనిఖీ పూర్తయిన వెంటనే ఎస్క్రో చెల్లింపు విడుదల చేస్తాము.`;
      case 'hi':
        return `क्या कल तक डिलीवरी हो सकती है? गुणवत्ता जांच होते ही एस्क्रो भुगतान तुरंत जारी कर दिया जाएगा।`;
      case 'ta':
        return `நாளைக்குள் அனுப்ப முடியுமா? தரம் சரிபார்த்தவுடன் எஸ்க்ரோ பேமெண்ட் உடனே விடுவிக்கப்படும்.`;
      case 'kn':
        return `ನಾಳೆಯೊಳಗೆ ಕಳುಹಿಸಬಹುದೇ? ಗುಣಮಟ್ಟ ಪರಿಶೀಲಿಸಿದ ತಕ್ಷಣ ಎಸ್ಕ್ರೋ ಹಣ ಬಿಡುಗಡೆ ಮಾಡುತ್ತೇವೆ.`;
      case 'ml':
        return `കൃത്യസമയത്ത് എത്തിക്കാൻ സാധിക്കുമോ? ഗുണനിലവാരം പരിശോധിച്ച് ഉടൻ പേയ്‌മെന്റ് റിലീസ് ചെയ്യാം.`;
      default:
        return `Can you ship by tomorrow? Once inspected at our receiving facility, we will immediately release the escrow payment.`;
    }
  }

  switch (language) {
    case 'te':
      return `నమస్కారం, మీ ${crop} కొనడానికి సిద్ధంగా ఉన్నాము. నాణ్యత మరియు డెలివరీ నిర్ధారించుకుందాం.`;
    case 'hi':
      return `नमस्ते, हम आपकी ${crop} फसल खरीदने के लिए तैयार हैं। गुणवत्ता और डिलीवरी का समय तय करें।`;
    case 'ta':
      return `வணக்கம், உங்கள் ${crop} அறுவடையை வாங்க ஆர்வமாக உள்ளோம். தரம் மற்றும் டெலிவரியை உறுதி செய்வோம்.`;
    case 'kn':
      return `ನಮಸ್ಕಾರ, ನಿಮ್ಮ ${crop} ಬೆಳೆಯನ್ನು ಖರೀದಿಸಲು ಆಸಕ್ತಿ ಇದೆ. ದಯವಿಟ್ಟು ವಿವರಗಳನ್ನು ದೃಢೀಕರಿಸಿ.`;
    case 'ml':
      return `നമസ്കാരം, നിങ്ങളുടെ ${crop} വിൽക്കാൻ തയ്യാറാണോ? ഓർഡർ ഉറപ്പാക്കാൻ താല്പര്യപ്പെടുന്നു.`;
    default:
      return `Hello, we are interested in your ${crop} harvest. Ready to purchase once quality and delivery timing are confirmed.`;
  }
};
