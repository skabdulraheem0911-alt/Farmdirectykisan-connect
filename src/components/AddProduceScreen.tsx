import React, { useState, useRef, useEffect } from 'react';
import { User, Language, GovernmentPrice, ProduceListing } from '../types';
import { addProduceTranslations, getTranslatedCropName } from '../data/translations';
import { getCropImageUrl } from '../data/mockData';
import { GoogleMapView } from './GoogleMapView';
import { requestCurrentPosition, findNearestAPDistrict } from '../services/locationService';
import {
  speechManager,
  startTeluguSpeechRecognition,
  parseTeluguVoiceToProduce,
} from '../services/voiceAssistantService';
import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  AlertCircle,
  Scale,
  Sparkles,
  RefreshCw,
  X,
  Upload,
  SwitchCamera,
  Check,
  MapPin,
  Navigation,
  ChevronDown,
  ChevronUp,
  Volume2,
  Mic,
} from 'lucide-react';

interface AddProduceScreenProps {
  language: Language;
  user: User;
  governmentPrices: GovernmentPrice[];
  onBack: () => void;
  onAddProduce: (listing: Omit<ProduceListing, 'id' | 'postedDate' | 'status'>) => void;
  prefillData?: {
    cropName?: string;
    quantity?: number;
    pricePerKg?: number;
    location?: string;
  } | null;
  onOpenVoiceAssistant?: () => void;
}

export const AddProduceScreen: React.FC<AddProduceScreenProps> = ({
  language,
  user,
  governmentPrices,
  onBack,
  onAddProduce,
  prefillData,
  onOpenVoiceAssistant,
}) => {
  const [formData, setFormData] = useState({
    cropName: prefillData?.cropName || 'Tomato',
    quantity: prefillData?.quantity ? prefillData.quantity.toString() : '',
    pricePerKg: prefillData?.pricePerKg ? prefillData.pricePerKg.toString() : '',
    location: prefillData?.location || user.village || 'Guntur, Andhra Pradesh',
    negotiable: true,
  });

  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const [voiceToast, setVoiceToast] = useState<string | null>(null);

  useEffect(() => {
    if (prefillData) {
      setFormData((prev) => ({
        ...prev,
        cropName: prefillData.cropName || prev.cropName,
        quantity: prefillData.quantity ? prefillData.quantity.toString() : prev.quantity,
        pricePerKg: prefillData.pricePerKg ? prefillData.pricePerKg.toString() : prev.pricePerKg,
        location: prefillData.location || prev.location,
      }));
      setVoiceToast(
        language === 'te'
          ? `వాయిస్ అసిస్టెంట్ ద్వారా వివరాలు నమోదు చేయబడ్డాయి: ${prefillData.cropName || ''} ${prefillData.quantity ? prefillData.quantity + ' kg' : ''}`
          : `Produce details autofilled from Voice: ${prefillData.cropName || ''}`
      );
    }
  }, [prefillData, language]);

  const [farmCoords, setFarmCoords] = useState<{ lat: number; lng: number }>({
    lat: user.lat || 16.3067,
    lng: user.lng || 80.4365,
  });
  const [coordinatesVerified, setCoordinatesVerified] = useState(Boolean(user.lat));
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [gpsMessage, setGpsMessage] = useState<string | null>(null);

  const [capturedPhotoUrl, setCapturedPhotoUrl] = useState<string | null>(null);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraFacingMode, setCameraFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isFlashing, setIsFlashing] = useState(false);
  const [tempSnapshot, setTempSnapshot] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const t = addProduceTranslations[language] || addProduceTranslations.en;

  const cropOptions = [
    'Tomato',
    'Onion',
    'Potato',
    'Corn',
    'Cabbage',
    'Carrot',
    'Green Beans',
    'Rice',
    'Wheat',
    'Spinach',
    'Cauliflower',
    'Brinjal',
    'Okra',
    'Cucumber',
    'Chili',
  ];

  const govBenchmark = governmentPrices.find((g) => g.cropName === formData.cropName);

  // Stop camera stream safely
  const stopCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  // Start live camera stream
  const startCamera = async (mode: 'environment' | 'user' = cameraFacingMode) => {
    stopCameraStream();
    setCameraError(null);
    setTempSnapshot(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API is not supported in this browser.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch(() => {});
          setCameraActive(true);
        };
      }
    } catch (err: any) {
      console.warn('Camera access error:', err);
      let message = 'Unable to access device camera. Please check camera permissions.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        message = 'Camera permission was denied. Please allow camera access in browser settings.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        message = 'No camera hardware found on this device.';
      }
      setCameraError(message);
      setCameraActive(false);
    }
  };

  // Open camera modal
  const handleOpenCameraModal = () => {
    setIsCameraModalOpen(true);
    setTempSnapshot(null);
    setTimeout(() => {
      startCamera(cameraFacingMode);
    }, 150);
  };

  // Close camera modal
  const handleCloseCameraModal = () => {
    stopCameraStream();
    setIsCameraModalOpen(false);
    setTempSnapshot(null);
    setCameraError(null);
  };

  // Flip camera between front and back
  const handleSwitchCamera = () => {
    const nextMode = cameraFacingMode === 'environment' ? 'user' : 'environment';
    setCameraFacingMode(nextMode);
    startCamera(nextMode);
  };

  // Take photo snapshot
  const handleCapturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Flash animation trigger
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 200);

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
    setTempSnapshot(dataUrl);
    stopCameraStream();
  };

  // Confirm snapshot
  const handleUseSnapshot = () => {
    if (tempSnapshot) {
      setCapturedPhotoUrl(tempSnapshot);
    }
    handleCloseCameraModal();
  };

  // Retake photo inside modal
  const handleRetakeSnapshot = () => {
    setTempSnapshot(null);
    startCamera(cameraFacingMode);
  };

  // Handle native file or camera upload fallback
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCapturedPhotoUrl(event.target.result as string);
          handleCloseCameraModal();
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Clean up stream on unmount
  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, []);

  // Price analysis relative to APMC
  const priceAnalysis = (() => {
    if (!govBenchmark || !formData.pricePerKg) return null;
    const price = parseFloat(formData.pricePerKg);
    if (isNaN(price)) return null;

    if (price <= govBenchmark.averagePrice * 0.95) {
      const text =
        language === 'te'
          ? 'APMC సగటు కంటే తక్కువ - కొనుగోలుదారులను త్వరగా ఆకర్షిస్తుంది!'
          : language === 'hi'
          ? 'APMC औसत से कम - खरीदारों के लिए आकर्षक और त्वरित बिक्री!'
          : language === 'ta'
          ? 'APMC சராசரியை விட குறைவு - விரைவு விற்பனைக்கு சிறந்தது!'
          : language === 'kn'
          ? 'APMC ಸರಾಸರಿಗಿಂತ ಕಡಿಮೆ - ತ್ವರಿತ ಮಾರಾಟಕ್ಕೆ ಆಕರ್ಷಕ!'
          : language === 'ml'
          ? 'വിപണിവിലയേക്കാൾ കുറവാണ് - പെട്ടെന്ന് വിറ്റുപോകും!'
          : 'Below APMC average - Highly attractive for quick bulk buyers!';
      return {
        status: 'below',
        text,
        color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      };
    }
    if (price >= govBenchmark.averagePrice * 1.05) {
      const text =
        language === 'te'
          ? 'APMC సగటు కంటే ఎక్కువ - ప్రీమియం / ఆర్గానిక్ గ్రేడ్ నాణ్యత'
          : language === 'hi'
          ? 'APMC औसत से अधिक - प्रीमियम व जैविक गुणवत्ता के लिए उपयुक्त'
          : language === 'ta'
          ? 'APMC சராசரியை விட அதிகம் - பிரீமியம் / இயற்கை தரத்திற்கு சிறந்தது'
          : language === 'kn'
          ? 'APMC ಸರಾಸರಿಗಿಂತ ಹೆಚ್ಚು - ಪ್ರೀಮಿಯಂ ಗುಣಮಟ್ಟಕ್ಕೆ ಶಿಫಾರಸು ಮಾಡಲಾಗಿದೆ'
          : language === 'ml'
          ? 'വിപണിവിലയേക്കാൾ കൂടുതലാണ് - പ്രീമിയം ഗുണനിലവാരം'
          : 'Above APMC average - Recommended for certified export/organic grade';
      return {
        status: 'above',
        text,
        color: 'text-amber-700 bg-amber-50 border-amber-200',
      };
    }
    const text =
      language === 'te'
        ? 'సమంజసమైన APMC మార్కెట్ ధర - సమతుల్యమైన లాభదాయకత'
        : language === 'hi'
        ? 'उचित APMC मंडी दर - त्वरित बिक्री और अच्छे मुनाफे का संतुलन'
        : language === 'ta'
        ? 'நியாயமான APMC மண்டி விலை - சரியான சந்தை மதிப்பு'
        : language === 'kn'
        ? 'ನ್ಯಾಯಯುತ APMC ಮಂಡಿ ದರ - ಸಮತೋಲಿತ ಆದಾಯ'
        : language === 'ml'
        ? 'ന്യായമായ വിപണി നിരക്ക് - ശുപാർശ ചെയ്യുന്നത്'
        : 'Fair Mandi Rate - Optimal balance for quick sales and high returns';
    return {
      status: 'fair',
      text,
      color: 'text-blue-700 bg-blue-50 border-blue-200',
    };
  })();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.cropName || !formData.quantity || !formData.pricePerKg) {
      return;
    }

    const newListing = {
      farmerId: user.id,
      farmerName: user.name,
      farmerVillage: formData.location,
      cropName: formData.cropName,
      quantity: parseInt(formData.quantity, 10),
      pricePerKg: parseFloat(formData.pricePerKg),
      negotiable: formData.negotiable,
      imageUrl: capturedPhotoUrl || getCropImageUrl(formData.cropName),
      lat: farmCoords.lat,
      lng: farmCoords.lng,
      coordinatesVerified,
    };

    onAddProduce(newListing);
    setIsSuccess(true);
    setTimeout(() => {
      onBack();
    }, 1500);
  };

  if (isSuccess) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl p-8 text-center shadow-xl border border-green-100 space-y-4">
          <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            {t.success || 'Produce Listed Successfully!'}
          </h2>
          <p className="text-sm text-gray-500">
            {language === 'te'
              ? 'మీ పంట ఇప్పుడు కొనుగోలుదారులకు మార్కెట్‌లో ప్రత్యక్షంగా అందుబాటులో ఉంది.'
              : language === 'hi'
              ? 'आपकी फसल अब सभी खरीदारों के लिए बाज़ार में लाइव है।'
              : language === 'ta'
              ? 'உங்கள் பயிர் இப்போது சந்தையில் வாங்குபவர்களுக்குக் காணப்படுகிறது.'
              : language === 'kn'
              ? 'ನಿಮ್ಮ ಬೆಳೆ ಈಗ ಮಾರುಕಟ್ಟೆಯಲ್ಲಿ ಖರೀದಿದಾರರಿಗೆ ಲಭ್ಯವಿದೆ.'
              : language === 'ml'
              ? 'നിങ്ങളുടെ വിള ഇപ്പോൾ വാങ്ങുന്നവർക്ക് കാണാനാകും.'
              : 'Your produce is now live in the marketplace for all buyers to see.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      {/* Hidden canvas for taking snapshot */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Hidden file input with mobile camera capture support */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileUpload}
      />

      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          data-telugu-announce="వెనుకకు వెళ్లే బటన్ నొక్కారు."
          className="p-2 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            {t.addProduce || 'Add New Produce Listing'}
          </h1>
          <p className="text-xs text-gray-500">
            {language === 'te'
              ? 'మీ తాజా పంటను కొనుగోలుదారులకు నేరుగా జాబితా చేయండి'
              : language === 'hi'
              ? 'अपनी ताजी फसल सीधे खरीदारों के लिए सूचीबद्ध करें'
              : language === 'ta'
              ? 'புதிய விளைச்சலை நேரடியாக வாங்குபவர்களிடம் பட்டியலிடுங்கள்'
              : language === 'kn'
              ? 'ನಿಮ್ಮ ತಾಜಾ ಬೆಳೆಗಳನ್ನು ನೇರವಾಗಿ ಖರೀದಿದಾರರಿಗೆ ಪಟ್ಟಿ ಮಾಡಿ'
              : language === 'ml'
              ? 'നിങ്ങളുടെ കാർഷിക വിളകൾ നേരിട്ട് ലിസ്റ്റ് ചെയ്യുക'
              : 'List your fresh agricultural harvest directly to buyers'}
          </p>
        </div>
      </div>

      {/* Telugu Voice Assistant Prompt Banner for Non-Literate Farmers */}
      <div className="bg-gradient-to-r from-emerald-800 via-green-800 to-teal-900 rounded-3xl p-4 sm:p-5 text-white shadow-md border border-emerald-600/40 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/20">
              <Sparkles className="w-6 h-6 text-amber-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm sm:text-base text-white">
                  రైతు మిత్ర: తెలుగు వాయిస్ సహాయం
                </h3>
                <span className="bg-amber-400 text-amber-950 text-[10px] font-black px-2 py-0.5 rounded-full">
                  వాయిస్ గైడ్
                </span>
              </div>
              <p className="text-xs text-emerald-100/90 font-medium">
                చదవడం, రాయడం రాకపోయినా బాధపడకండి! మైక్ నొక్కి పంట పేరు, కిలోలు చెప్పండి లేదా సూచనలు వినండి.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              data-telugu-announce="పంట నమోదు సూచనలు వింటున్నారు."
              onClick={() => {
                speechManager.speakTelugu(
                  'రైతు సోదరులారా! మీరు ఏ పంట అమ్మాలనుకుంటున్నారో, ఎన్ని కిలోలు ఉన్నాయో, మరియు కిలో ధర ఎంత పెట్టాలనుకుంటున్నారో మైక్ నొక్కి చెప్పండి. లేదా సూచనలు వింటూ స్క్రీన్ పై బొమ్మలను తాకండి.'
                );
              }}
              className="px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold flex items-center gap-1.5 border border-white/20 transition-all cursor-pointer"
            >
              <Volume2 className="w-4 h-4 text-amber-300" />
              <span>సూచనలు వినండి</span>
            </button>

            <button
              type="button"
              data-telugu-announce="గొంతుతో పంట నమోదు చేసే బటన్ నొక్కారు."
              onClick={() => {
                if (onOpenVoiceAssistant) {
                  onOpenVoiceAssistant();
                } else {
                  setIsVoiceListening(true);
                  setVoiceToast('వినడానికి సిద్ధంగా ఉంది... మీ పంట పేరు, ఎన్ని కిలోలు, ధర చెప్పండి.');
                  speechManager.stop();
                  startTeluguSpeechRecognition(
                    (transcript) => {
                      setIsVoiceListening(false);
                      const parsed = parseTeluguVoiceToProduce(transcript);
                      if (parsed.cropName || parsed.quantity || parsed.pricePerKg) {
                        setFormData((prev) => ({
                          ...prev,
                          cropName: parsed.cropName || prev.cropName,
                          quantity: parsed.quantity ? parsed.quantity.toString() : prev.quantity,
                          pricePerKg: parsed.pricePerKg ? parsed.pricePerKg.toString() : prev.pricePerKg,
                          location: parsed.location || prev.location,
                        }));
                        const feedback = `మీ గొంతు గుర్తించబడింది: ${parsed.cropName || ''} ${parsed.quantity ? parsed.quantity + ' కిలోలు' : ''} ${parsed.pricePerKg ? 'ధర ' + parsed.pricePerKg + ' రూపాయలు' : ''}`;
                        setVoiceToast(feedback);
                        speechManager.speakTelugu(feedback);
                      } else {
                        setVoiceToast(`మీరు మాట్లాడినది: "${transcript}". దయచేసి వివరాలు సరిచూడండి.`);
                      }
                    },
                    (err) => {
                      setIsVoiceListening(false);
                      setVoiceToast(err);
                    },
                    () => {
                      setIsVoiceListening(false);
                    }
                  );
                }
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer ${
                isVoiceListening
                  ? 'bg-red-500 text-white animate-pulse'
                  : 'bg-amber-400 hover:bg-amber-500 text-amber-950'
              }`}
            >
              <Mic className="w-4 h-4" />
              <span>{isVoiceListening ? 'వింటోంది...' : 'గొంతుతో నమోదు చేయండి'}</span>
            </button>
          </div>
        </div>

        {voiceToast && (
          <div className="bg-emerald-950/60 rounded-xl px-3.5 py-2 text-xs text-emerald-100 border border-emerald-400/40 flex items-center justify-between">
            <span>{voiceToast}</span>
            <button
              type="button"
              onClick={() => setVoiceToast(null)}
              className="text-emerald-300 hover:text-white ml-2 text-xs font-bold cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Card 1: Crop Selection & Camera Photo Capture */}
        <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-green-800">
              {language === 'te'
                ? '1. పంట వివరాలు & ఫోటో'
                : language === 'hi'
                ? '1. फसल विवरण और फोटो'
                : language === 'ta'
                ? '1. பயிர் விவரங்கள் & புகைப்படம்'
                : language === 'kn'
                ? '1. ಬೆಳೆ ವಿವರಗಳು ಮತ್ತು ಫೋಟೋ'
                : language === 'ml'
                ? '1. വിള വിവരങ്ങളും ഫോട്ടോയും'
                : '1. Crop Details & Camera Photo'}
            </h2>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
              {language === 'te' ? 'ఆంధ్రప్రదేశ్ APMC ధృవీకరణ' : 'AP APMC Verified'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Crop selector */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-gray-700">
                  {t.cropName || 'Select Crop'} *
                </label>
                <button
                  type="button"
                  onClick={() =>
                    speechManager.speakTelugu(
                      'మీరు ఏ పంట అమ్మాలనుకుంటున్నారో ఎంచుకోండి: టమోటా, ఉల్లిపాయ, మిర్చి, వరి, మొక్కజొన్న లేదా ఇతర పంటలు.'
                    )
                  }
                  className="text-emerald-700 hover:text-emerald-800 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                  title="వినండి (Listen)"
                >
                  <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>వినండి</span>
                </button>
              </div>
              <select
                value={formData.cropName}
                onChange={(e) => setFormData({ ...formData, cropName: e.target.value })}
                className="w-full h-12 px-3 rounded-xl border border-gray-200 bg-white font-medium text-sm text-gray-900 outline-none focus:border-green-500 cursor-pointer"
              >
                {cropOptions.map((crop) => (
                  <option key={crop} value={crop}>
                    {getTranslatedCropName(crop, language)}
                  </option>
                ))}
              </select>
            </div>

            {/* Location with Google Maps GPS Access */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <label className="block text-xs font-bold text-gray-700">
                    {t.location || 'Farm Location / Mandal'} *
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      speechManager.speakTelugu(
                        'మీ పొలం ఎక్కడుందో గుర్తించడానికి గూగుల్ మ్యాప్స్ GPS బటన్ నొక్కండి లేదా మ్యాప్‌లో పిన్ చేయండి.'
                      )
                    }
                    className="text-emerald-700 hover:text-emerald-800 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                    title="వినండి (Listen)"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    setIsDetectingGps(true);
                    setGpsMessage(null);
                    try {
                      const loc = await requestCurrentPosition();
                      setFarmCoords({ lat: loc.lat, lng: loc.lng });
                      setFormData((prev) => ({
                        ...prev,
                        location: loc.address || `${loc.district}, Andhra Pradesh`,
                      }));
                      setCoordinatesVerified(true);
                      setShowMapPicker(true);
                      setGpsMessage(
                        language === 'te'
                          ? `లొకేషన్ గుర్తించబడింది: ${loc.district} APMC సమీపంలో`
                          : `GPS Location verified: ${loc.district} APMC Hub`
                      );
                    } catch (err) {
                      setGpsMessage(
                        language === 'te'
                          ? 'GPS యాక్సెస్ విఫలమైంది. దయచేసి బ్రౌజర్ అనుమతులను తనిఖీ చేయండి.'
                          : 'Unable to access GPS. Please check browser permissions.'
                      );
                    } finally {
                      setIsDetectingGps(false);
                    }
                  }}
                  disabled={isDetectingGps}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded-lg border border-emerald-200 transition-colors cursor-pointer"
                >
                  <Navigation className={`w-3 h-3 ${isDetectingGps ? 'animate-spin' : ''}`} />
                  <span>{isDetectingGps ? 'Detecting GPS...' : 'Google Maps GPS'}</span>
                </button>
              </div>

              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full h-12 px-3 rounded-xl border border-gray-200 font-medium text-sm text-gray-900 outline-none focus:border-green-500"
                placeholder={t.locationPlaceholder || 'e.g. Guntur, Andhra Pradesh'}
              />

              {/* Coordinates info pill & Map toggle */}
              <div className="mt-1.5 flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1 text-gray-500">
                  <MapPin className="w-3 h-3 text-green-600" />
                  <span>
                    {farmCoords.lat.toFixed(4)}° N, {farmCoords.lng.toFixed(4)}° E
                  </span>
                  {coordinatesVerified && (
                    <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                      <Check className="w-3 h-3" />
                      Verified
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setShowMapPicker(!showMapPicker)}
                  className="text-green-700 hover:text-green-800 font-bold flex items-center gap-0.5 cursor-pointer"
                >
                  <span>{showMapPicker ? 'Hide Map' : 'Adjust on Google Map'}</span>
                  {showMapPicker ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>

              {gpsMessage && (
                <div className="mt-1 text-xs text-emerald-700 bg-emerald-50/80 px-2.5 py-1 rounded-lg border border-emerald-200">
                  {gpsMessage}
                </div>
              )}

              {/* Interactive Google Map Picker */}
              {showMapPicker && (
                <div className="mt-2.5 space-y-1.5">
                  <div className="text-[11px] text-gray-500 flex items-center justify-between">
                    <span>
                      {language === 'te'
                        ? 'మీ పొలం సరిగ్గా ఎక్కడుందో మ్యాప్‌లో పిన్ చేయండి:'
                        : 'Pin your exact farm coordinates on Google Maps:'}
                    </span>
                    <span className="text-green-700 font-semibold">Tap to reposition</span>
                  </div>
                  <GoogleMapView
                    center={farmCoords}
                    zoom={12}
                    height="220px"
                    language={language}
                    selectable={true}
                    onSelectLocation={(loc) => {
                      setFarmCoords({ lat: loc.lat, lng: loc.lng });
                      setFormData((prev) => ({
                        ...prev,
                        location: loc.address || `${loc.district}, Andhra Pradesh`,
                      }));
                      setCoordinatesVerified(true);
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Photo Section with Camera Access */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-gray-700">
                {t.cropPhoto || 'Produce Photo (Take Photo with Camera)'}
              </label>
              <span className="text-[11px] text-gray-400">
                {capturedPhotoUrl ? '✓ Custom Photo Captured' : 'Sample / Live Photo'}
              </span>
            </div>

            {/* Photo preview container */}
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-gray-900 border-2 border-gray-200 group">
              <img
                src={capturedPhotoUrl || getCropImageUrl(formData.cropName)}
                alt={formData.cropName}
                className="w-full h-full object-cover transition-transform group-hover:scale-102"
              />

              {/* Status pill badge on top */}
              <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-xl text-xs flex items-center gap-1.5 font-medium border border-white/20">
                {capturedPhotoUrl ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>
                      {language === 'te'
                        ? 'కెమెరాతో తీసిన ఫోటో ధృవీకరించబడింది'
                        : language === 'hi'
                        ? 'लाइव कैमरे से ली गई फोटो'
                        : language === 'ta'
                        ? 'கேமரா புகைப்படம் சரிபார்க்கப்பட்டது'
                        : language === 'kn'
                        ? 'ಲೈವ್ ಕ್ಯಾಮೆರಾ ಫೋಟೋ ದೃಢೀಕರಿಸಲಾಗಿದೆ'
                        : language === 'ml'
                        ? 'ക്യാമറ ഫോട്ടോ പരിശോധിച്ചുറപ്പിച്ചു'
                        : 'Live Camera Photo Verified'}
                    </span>
                  </>
                ) : (
                  <>
                    <Camera className="w-3.5 h-3.5 text-green-400" />
                    <span>{getTranslatedCropName(formData.cropName, language)}</span>
                  </>
                )}
              </div>

              {/* Action Overlay Buttons */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4">
                <div className="flex flex-wrap items-center gap-2">
                  {/* Primary: Open Live Camera */}
                  <button
                    type="button"
                    onClick={handleOpenCameraModal}
                    className="flex-1 min-w-[160px] h-11 px-4 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-green-600/40 cursor-pointer transition-all active:scale-95"
                  >
                    <Camera className="w-4 h-4" />
                    <span>{t.takePhoto || 'Take Photo of Crop'}</span>
                  </button>

                  {/* Fallback / Upload button */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="h-11 px-3 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-semibold text-xs flex items-center justify-center gap-1.5 border border-white/30 cursor-pointer transition-all"
                    title="Upload from gallery or take photo with device camera"
                  >
                    <Upload className="w-4 h-4" />
                    <span className="hidden sm:inline">Gallery / File</span>
                  </button>

                  {/* Reset to stock crop photo */}
                  {capturedPhotoUrl && (
                    <button
                      type="button"
                      onClick={() => setCapturedPhotoUrl(null)}
                      className="h-11 px-3 rounded-xl bg-red-500/80 hover:bg-red-600 backdrop-blur-md text-white font-semibold text-xs flex items-center justify-center gap-1 cursor-pointer transition-all"
                      title="Reset to default crop image"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Reset</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            <p className="text-[11px] text-gray-500 mt-2 flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-green-600 shrink-0" />
              <span>
                {language === 'te'
                  ? 'మీ పంట నాణ్యత, రంగు మరియు తాజాదనాన్ని చూపించడానికి కెమెరాతో ప్రత్యక్ష ఫోటో తీయండి.'
                  : language === 'hi'
                  ? 'अपनी फसल की ताजगी और गुणवत्ता दिखाने के लिए कैमरे से सीधी फोटो खींचें।'
                  : language === 'ta'
                  ? 'விளைச்சலின் புத்துணர்ச்சியைக் காட்ட கேமரா மூலம் நேரடிப் புகைப்படம் எடுக்கவும்.'
                  : language === 'kn'
                  ? 'ಬೆಳೆಯ ಗುಣಮಟ್ಟ ಮತ್ತು ತಾಜಾತನ ತೋರಿಸಲು ಕ್ಯಾಮೆರಾದಿಂದ ಫೋಟೋ ತೆಗೆಯಿರಿ.'
                  : language === 'ml'
                  ? 'വിളയുടെ ഗുണമേന്മ തെളിയിക്കാൻ ക്യാമറ ഉപയോഗിച്ച് തത്സമയ ഫോട്ടോ എടുക്കുക.'
                  : 'Capture clear real-time harvest photos to build trust and receive higher price bids.'}
              </span>
            </p>
          </div>
        </div>

        {/* Card 2: Quantity & APMC Smart Pricing */}
        <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs space-y-5">
          <h2 className="text-sm font-bold uppercase tracking-wider text-green-800">
            {language === 'te'
              ? '2. పరిమాణం & ఆంధ్రప్రదేశ్ APMC ధర'
              : language === 'hi'
              ? '2. मात्रा और आंध्र प्रदेश APMC मूल्य निर्धारण'
              : language === 'ta'
              ? '2. அளவு & ஆந்திரப் பிரதேசம் APMC விலை'
              : language === 'kn'
              ? '2. ಪ್ರಮಾಣ ಮತ್ತು ಆಂಧ್ರಪ್ರದೇಶ APMC ದರ'
              : language === 'ml'
              ? '2. അളവും ആന്ധ്രാപ്രദേശ് APMC വിലയും'
              : '2. Quantity & Andhra Pradesh APMC Pricing'}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Quantity */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-gray-700">
                  {t.quantity || 'Available Quantity (kg)'} *
                </label>
                <button
                  type="button"
                  onClick={() =>
                    speechManager.speakTelugu(
                      'మీ వద్ద ఎంత పంట అందుబాటులో ఉందో కిలోల సంఖ్య రాయండి లేదా చెప్పండి. ఉదాహరణకు 500 కిలోలు.'
                    )
                  }
                  className="text-emerald-700 hover:text-emerald-800 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                  title="వినండి (Listen)"
                >
                  <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>వినండి</span>
                </button>
              </div>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  required
                  placeholder="e.g. 500"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className="w-full h-12 pl-3 pr-10 rounded-xl border border-gray-200 font-bold text-sm outline-none focus:border-green-500 text-gray-900"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
                  kg
                </span>
              </div>
            </div>

            {/* Price per kg */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-gray-700">
                  {t.pricePerKg || 'Your Price per kg (₹)'} *
                </label>
                <button
                  type="button"
                  onClick={() =>
                    speechManager.speakTelugu(
                      'కిలోకు ఎంత ధర కావాలనుకుంటున్నారో చెప్పండి. ప్రభుత్వ మార్కెట్ యార్డు సగటు ధరను కింద చూసి సరసమైన ధర నిర్ణయించండి.'
                    )
                  }
                  className="text-emerald-700 hover:text-emerald-800 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                  title="వినండి (Listen)"
                >
                  <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>వినండి</span>
                </button>
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">
                  ₹
                </span>
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  required
                  placeholder={govBenchmark ? `${govBenchmark.averagePrice}` : '25'}
                  value={formData.pricePerKg}
                  onChange={(e) => setFormData({ ...formData, pricePerKg: e.target.value })}
                  className="w-full h-12 pl-8 pr-12 rounded-xl border border-gray-200 font-bold text-sm outline-none focus:border-green-500 text-gray-900"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
                  /kg
                </span>
              </div>
            </div>
          </div>

          {/* APMC Benchmark Guidance Card */}
          {govBenchmark && (
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800">
                  <Scale className="w-4 h-4 text-green-600" />
                  <span>{govBenchmark.market} APMC Rates:</span>
                </div>
                <span className="text-[11px] text-gray-400 font-medium">Date: {govBenchmark.date}</span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-white p-2.5 rounded-xl border border-gray-100 shadow-2xs">
                  <div className="text-[10px] text-gray-400 font-semibold">
                    {language === 'te' ? 'కనిష్ట ధర' : language === 'hi' ? 'न्यूनतम दर' : language === 'ta' ? 'குறைந்த விலை' : language === 'kn' ? 'ಕನಿಷ್ಠ ದರ' : language === 'ml' ? 'കുറഞ്ഞ നിരക്ക്' : 'Min Price'}
                  </div>
                  <div className="font-bold text-gray-700 tabular-nums">₹{govBenchmark.minPrice}/kg</div>
                </div>
                <div className="bg-green-50 p-2.5 rounded-xl border border-green-200 shadow-2xs">
                  <div className="text-[10px] text-green-700 font-bold">
                    {language === 'te' ? 'APMC సగటు' : language === 'hi' ? 'APMC औसत' : language === 'ta' ? 'APMC சராசரி' : language === 'kn' ? 'APMC ಸರಾಸರಿ' : language === 'ml' ? 'ശരാശരി നിരക്ക്' : 'APMC Average'}
                  </div>
                  <div className="font-black text-green-800 tabular-nums text-sm">₹{govBenchmark.averagePrice}/kg</div>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-gray-100 shadow-2xs">
                  <div className="text-[10px] text-gray-400 font-semibold">
                    {language === 'te' ? 'గరిష్ట ధర' : language === 'hi' ? 'अधिकतम दर' : language === 'ta' ? 'அதிகபட்ச விலை' : language === 'kn' ? 'ಗರಿಷ್ಠ ದರ' : language === 'ml' ? 'പരമാവധി നിരക്ക്' : 'Max Price'}
                  </div>
                  <div className="font-bold text-gray-700 tabular-nums">₹{govBenchmark.maxPrice}/kg</div>
                </div>
              </div>

              {priceAnalysis && (
                <div className={`p-2.5 rounded-xl border text-xs font-medium flex items-center gap-2 ${priceAnalysis.color}`}>
                  <Sparkles className="w-4 h-4 shrink-0" />
                  <span>{priceAnalysis.text}</span>
                </div>
              )}
            </div>
          )}

          {/* Negotiable toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50 border border-gray-100">
            <div>
              <div className="text-xs font-bold text-gray-800">
                {t.negotiablePrice || 'Allow Buyers to Negotiate Price'}
              </div>
              <div className="text-[11px] text-gray-500">
                {language === 'te'
                  ? 'కొనుగోలుదారులు నేరుగా చాట్‌లో కౌంటర్ ఆఫర్లను సమర్పించడానికి అనుమతించండి'
                  : language === 'hi'
                  ? 'खरीदारों को सीधी बातचीत में अपने प्रस्ताव भेजने की अनुमति दें'
                  : language === 'ta'
                  ? 'வாங்குபவர்கள் அரட்டையில் சலுகை முன்மொழிய அனுமதிக்கவும்'
                  : language === 'kn'
                  ? 'ಖರೀದಿದಾರರಿಗೆ ಚಾಟ್‌ನಲ್ಲಿ ಆಫರ್ ನೀಡಲು ಅನುಮತಿಸಿ'
                  : language === 'ml'
                  ? 'ചാറ്റിലൂടെ വാങ്ങുന്നവർക്ക് ന്യായമായ ഓഫറുകൾ സമർപ്പിക്കാൻ അനുമതി നൽകുക'
                  : 'Allows buyers to submit counter-offers in direct chat'}
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.negotiable}
                onChange={(e) => setFormData({ ...formData, negotiable: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
            </label>
          </div>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          data-telugu-announce="పంటను మార్కెట్ యార్డులో నమోదు చేసే బటన్ నొక్కారు."
          className="w-full h-14 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-extrabold text-base shadow-lg shadow-green-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
        >
          <CheckCircle2 className="w-5 h-5" />
          <span>{t.postListing || 'Publish Produce Listing'}</span>
        </button>
      </form>

      {/* FULL CAMERA MODAL */}
      {isCameraModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-gray-900 rounded-3xl overflow-hidden shadow-2xl border border-gray-700 flex flex-col max-h-[92vh]">
            {/* Modal header */}
            <div className="p-4 bg-gray-900 border-b border-gray-800 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-green-400" />
                <span className="font-bold text-sm">
                  {language === 'te'
                    ? 'పంట ఫోటో తీయండి'
                    : language === 'hi'
                    ? 'फसल की फोटो खींचे'
                    : language === 'ta'
                    ? 'பயிர் புகைப்படம் எடுக்கவும்'
                    : language === 'kn'
                    ? 'ಬೆಳೆಯ ಫೋಟೋ ತೆಗೆಯಿರಿ'
                    : language === 'ml'
                    ? 'ക്യാമറയിൽ വിളയുടെ ഫോട്ടോ എടുക്കുക'
                    : 'Crop Camera Viewfinder'}
                </span>
              </div>
              <button
                onClick={handleCloseCameraModal}
                data-telugu-announce="కెమెరా మూసివేసే బటన్ నొక్కారు."
                className="w-8 h-8 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Viewfinder area */}
            <div className="relative aspect-4/3 bg-black flex items-center justify-center overflow-hidden">
              {/* Flash effect overlay */}
              {isFlashing && (
                <div className="absolute inset-0 bg-white z-40 animate-out fade-out duration-150" />
              )}

              {/* Live Video stream */}
              {!tempSnapshot && (
                <video
                  ref={videoRef}
                  playsInline
                  autoPlay
                  muted
                  className={`w-full h-full object-cover ${cameraFacingMode === 'user' ? 'scale-x-[-1]' : ''}`}
                />
              )}

              {/* Captured Snapshot preview */}
              {tempSnapshot && (
                <img
                  src={tempSnapshot}
                  alt="Captured Crop"
                  className="w-full h-full object-cover"
                />
              )}

              {/* Viewfinder Guideline Overlay */}
              {!tempSnapshot && cameraActive && (
                <div className="absolute inset-6 pointer-events-none border-2 border-white/40 rounded-2xl flex flex-col justify-between p-3">
                  <div className="flex justify-between">
                    <div className="w-4 h-4 border-t-2 border-l-2 border-green-400" />
                    <div className="w-4 h-4 border-t-2 border-r-2 border-green-400" />
                  </div>
                  <div className="text-center">
                    <span className="bg-black/60 backdrop-blur-sm text-[11px] font-semibold text-white/90 px-3 py-1 rounded-full">
                      {language === 'te'
                        ? 'పంటను ఫ్రేమ్ మధ్యలో ఉంచండి'
                        : language === 'hi'
                        ? 'फसल को फ्रेम के अंदर रखें'
                        : language === 'ta'
                        ? 'பயிரை மையத்தில் வைக்கவும்'
                        : language === 'kn'
                        ? 'ಬೆಳೆಯನ್ನು ಫ್ರೇಮ್‌ನಲ್ಲಿ ಇರಿಸಿ'
                        : language === 'ml'
                        ? 'വിള ഫ്രെയിമിനുള്ളിൽ വെയ്ക്കുക'
                        : 'Align crop inside frame for clarity'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <div className="w-4 h-4 border-b-2 border-l-2 border-green-400" />
                    <div className="w-4 h-4 border-b-2 border-r-2 border-green-400" />
                  </div>
                </div>
              )}

              {/* Camera Error Message */}
              {cameraError && (
                <div className="absolute inset-0 bg-gray-900/95 flex flex-col items-center justify-center p-6 text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-white font-bold text-sm">Camera Permission Needed</h3>
                    <p className="text-gray-400 text-xs max-w-xs">{cameraError}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => startCamera(cameraFacingMode)}
                      className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-xl text-xs font-semibold cursor-pointer"
                    >
                      Retry Camera
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                    >
                      Upload Crop Photo
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Viewfinder Controls Footer */}
            <div className="p-4 bg-gray-950 border-t border-gray-800 flex items-center justify-between">
              {/* Left control: Switch camera */}
              {!tempSnapshot ? (
                <button
                  type="button"
                  onClick={handleSwitchCamera}
                  disabled={!cameraActive}
                  className="w-12 h-12 rounded-full bg-gray-800 hover:bg-gray-700 text-white flex items-center justify-center cursor-pointer transition-colors disabled:opacity-40"
                  title="Switch Front/Back Camera"
                >
                  <SwitchCamera className="w-5 h-5 text-gray-300" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleRetakeSnapshot}
                  className="px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>{t.retakePhoto || 'Retake'}</span>
                </button>
              )}

              {/* Center control: Shutter button */}
              {!tempSnapshot ? (
                <button
                  type="button"
                  onClick={handleCapturePhoto}
                  disabled={!cameraActive}
                  className="w-16 h-16 rounded-full border-4 border-white/80 p-1 flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-transform disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <div className="w-full h-full rounded-full bg-white active:bg-green-500 transition-colors shadow-lg" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleUseSnapshot}
                  className="px-6 py-3 rounded-2xl bg-green-600 hover:bg-green-700 text-white text-sm font-extrabold flex items-center gap-2 shadow-lg shadow-green-600/40 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{t.usePhoto || 'Use This Photo'}</span>
                </button>
              )}

              {/* Right control: Fallback upload */}
              {!tempSnapshot ? (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-12 h-12 rounded-full bg-gray-800 hover:bg-gray-700 text-white flex items-center justify-center cursor-pointer transition-colors"
                  title="Upload from device storage"
                >
                  <Upload className="w-5 h-5 text-gray-300" />
                </button>
              ) : (
                <div className="w-12" />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
