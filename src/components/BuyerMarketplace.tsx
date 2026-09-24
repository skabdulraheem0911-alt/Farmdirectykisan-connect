import React, { useState, useMemo } from 'react';
import { User, ProduceListing, Language, GovernmentPrice } from '../types';
import { marketplaceTranslations, getTranslatedCropName, getTranslatedVillageName, getTranslatedUserName } from '../data/translations';
import { GoogleMapView } from './GoogleMapView';
import { requestCurrentPosition, calculateDistance } from '../services/locationService';
import {
  speechManager,
  startTeluguSpeechRecognition,
} from '../services/voiceAssistantService';
import {
  Search,
  Filter,
  MessageCircle,
  Eye,
  MapPin,
  ShieldCheck,
  Scale,
  Sparkles,
  ArrowUpDown,
  LayoutGrid,
  Map as MapIcon,
  Navigation,
  Compass,
  Volume2,
  Mic,
} from 'lucide-react';

interface BuyerMarketplaceProps {
  language: Language;
  user: User;
  produce: ProduceListing[];
  governmentPrices: GovernmentPrice[];
  onNavigate: (screen: string, listing?: ProduceListing) => void;
  onLogout: () => void;
  onOpenVoiceAssistant?: (mode?: 'farmer' | 'buyer' | 'qa') => void;
}

export const BuyerMarketplace: React.FC<BuyerMarketplaceProps> = ({
  language,
  user,
  produce,
  governmentPrices,
  onNavigate,
  onOpenVoiceAssistant,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recommended' | 'price-low' | 'price-high' | 'quantity' | 'nearest'>('recommended');
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [buyerLocation, setBuyerLocation] = useState<{ lat: number; lng: number; district?: string } | null>(
    user.lat && user.lng ? { lat: user.lat, lng: user.lng, district: user.village } : null
  );
  const [isLocatingBuyer, setIsLocatingBuyer] = useState(false);
  const [isVoiceSearching, setIsVoiceSearching] = useState(false);

  const t = marketplaceTranslations[language] || marketplaceTranslations.en;

  const handleRequestLocationAccess = async () => {
    setIsLocatingBuyer(true);
    try {
      const loc = await requestCurrentPosition();
      setBuyerLocation({ lat: loc.lat, lng: loc.lng, district: loc.district });
    } catch (err) {
      console.warn('Location access error:', err);
    } finally {
      setIsLocatingBuyer(false);
    }
  };

  // Filter and search
  const filteredProduce = useMemo(() => {
    let list = produce.filter((p) => {
      const matchesSearch =
        p.cropName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.farmerVillage.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.farmerName.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      if (selectedCategory === 'grains') {
        return ['Rice', 'Wheat', 'Corn'].includes(p.cropName);
      }
      if (selectedCategory === 'vegetables') {
        return !['Rice', 'Wheat', 'Corn'].includes(p.cropName);
      }
      if (selectedCategory === 'negotiable') {
        return p.negotiable;
      }
      return true;
    });

    if (sortBy === 'price-low') {
      list = [...list].sort((a, b) => a.pricePerKg - b.pricePerKg);
    } else if (sortBy === 'price-high') {
      list = [...list].sort((a, b) => b.pricePerKg - a.pricePerKg);
    } else if (sortBy === 'quantity') {
      list = [...list].sort((a, b) => b.quantity - a.quantity);
    } else if (sortBy === 'nearest' && buyerLocation) {
      list = [...list].sort((a, b) => {
        const distA = calculateDistance(buyerLocation.lat, buyerLocation.lng, a.lat || 16.3067, a.lng || 80.4365);
        const distB = calculateDistance(buyerLocation.lat, buyerLocation.lng, b.lat || 16.3067, b.lng || 80.4365);
        return distA - distB;
      });
    }

    return list;
  }, [produce, searchTerm, selectedCategory, sortBy, buyerLocation]);

  // Determine APMC market fair rate comparison
  const getPricingTag = (cropName: string, price: number) => {
    const gov = governmentPrices.find((g) => g.cropName === cropName);
    if (!gov) return null;

    if (price <= gov.averagePrice * 0.95) {
      const label =
        language === 'te'
          ? 'APMC ధర కంటే తక్కువ'
          : language === 'hi'
          ? 'APMC दर से कम'
          : language === 'ta'
          ? 'APMC விலையை விட குறைவு'
          : language === 'kn'
          ? 'APMC ದರಕ್ಕಿಂತ ಕಡಿಮೆ'
          : language === 'ml'
          ? 'വിപണിവിലയേക്കാൾ കുറവ്'
          : 'Below APMC Rate';
      return {
        label,
        color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      };
    }
    if (price >= gov.averagePrice * 1.05) {
      const label =
        language === 'te'
          ? 'ప్రీమియం నాణ్యత'
          : language === 'hi'
          ? 'प्रीमियम गुणवत्ता'
          : language === 'ta'
          ? 'பிரீமியம் தரம்'
          : language === 'kn'
          ? 'ಪ್ರೀಮಿಯಂ ಗುಣಮಟ್ಟ'
          : language === 'ml'
          ? 'പ്രീമിയം ഗുണനിലവാരം'
          : 'Premium Grade';
      return {
        label,
        color: 'bg-amber-100 text-amber-800 border-amber-200',
      };
    }
    const label =
      language === 'te'
        ? 'సమంజసమైన మార్కెట్ ధర'
        : language === 'hi'
        ? 'उचित मंडी भाव'
        : language === 'ta'
        ? 'நியாயமான மண்டி விலை'
        : language === 'kn'
        ? 'ನ್ಯಾಯಯುತ ಮಂಡಿ ಬೆಲೆ'
        : language === 'ml'
        ? 'ന്യായമായ വിപണി വില'
        : 'Fair Mandi Price';
    return {
      label,
      color: 'bg-blue-100 text-blue-800 border-blue-200',
    };
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-700 via-green-600 to-teal-700 text-white p-6 rounded-3xl shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-green-200">
            {language === 'ml' ? 'വാങ്ങുന്നയാളുടെ വിപണി' : 'Direct Wholesale & Retail Mandi'}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-0.5">
            {t.marketplace || 'Direct Farm Marketplace'}
          </h1>
          <p className="text-green-100 text-sm mt-1">
            {t.welcome || 'Welcome'}, <span className="font-semibold">{getTranslatedUserName(user.name, language)}</span> · {language === 'ml' ? 'നേരിട്ട് വാങ്ങൂ, കർഷകരെ സഹായിക്കൂ' : 'Procure farm-fresh crops with zero middlemen markup'}
          </p>
        </div>

        {/* Escrow assurance badge */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-3 rounded-2xl flex items-center gap-3">
          <ShieldCheck className="w-8 h-8 text-green-300 shrink-0" />
          <div className="text-xs">
            <div className="font-bold text-white">{language === 'ml' ? '100% എസ്ക്രോ സുരക്ഷ' : '100% Escrow Protected'}</div>
            <div className="text-green-100">{language === 'ml' ? 'ഡെലിവറി ഉറപ്പുവരുത്തിയ ശേഷം മാത്രം പണം' : 'Payment released only after crop inspection'}</div>
          </div>
        </div>
      </div>

      {/* Telugu Voice Assistant Banner for Buyers */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-green-800 rounded-3xl p-4 sm:p-5 text-white shadow-md border border-emerald-600/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/20">
            <Volume2 className="w-6 h-6 text-amber-300 animate-bounce" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-sm sm:text-base text-white">
                కొనుగోలుదారుల వాయిస్ మార్గదర్శి (Audio Buying Guide)
              </h3>
              <span className="bg-amber-400 text-amber-950 text-[10px] font-black px-2 py-0.5 rounded-full">
                వినండి
              </span>
            </div>
            <p className="text-xs text-emerald-100/90 font-medium">
              చదవడం రాకపోయినా ఫరవాలేదు! పంటను ఎంచుకోవడం, రైతుతో మాట్లాడటం, మరియు ఎస్క్రో భద్రత గురించి వినండి.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            data-telugu-announce="కొనుగోలుదారు మార్గదర్శక సూచనలు వింటున్నారు."
            onClick={() => {
              speechManager.speakTelugu(
                'కొనుగోలుదారులారా స్వాగతం! మీకు కావాల్సిన తాజా పంటను మార్కెట్ లేదా గూగుల్ మ్యాప్స్‌లో చూడండి. రైతుతో నేరుగా చాట్ చేసి ధర మాట్లాడండి. మీరు చెల్లించిన డబ్బు ఎస్క్రో ఖాతాలో సురక్షితంగా ఉంటుంది. పంట చేతికి అంది నాణ్యత చూసుకున్న తర్వాత మాత్రమే ఓటీపీ ఇచ్చి ధృవీకరించండి.'
              );
            }}
            className="px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold flex items-center gap-1.5 border border-white/20 transition-all cursor-pointer"
          >
            <Volume2 className="w-4 h-4 text-amber-300" />
            <span>సూచనలు వినండి</span>
          </button>

          {onOpenVoiceAssistant && (
            <button
              type="button"
              data-telugu-announce="కొనుగోలుదారు వాయిస్ అసిస్టెంట్ బటన్ నొక్కారు."
              onClick={() => onOpenVoiceAssistant('buyer')}
              className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-amber-950 text-xs font-black flex items-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              <Mic className="w-4 h-4" />
              <span>వాయిస్ అసిస్టెంట్</span>
            </button>
          )}
        </div>
      </div>

      {/* Search & Category Filter Controls */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search box with Voice input */}
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t.search || 'Search crops, location, or farmer...'}
              className="w-full h-11 pl-11 pr-11 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100 text-sm outline-none transition-all text-gray-900"
            />
            {/* Mic button for voice search */}
            <button
              type="button"
              onClick={() => {
                setIsVoiceSearching(true);
                speechManager.stop();
                startTeluguSpeechRecognition(
                  (transcript) => {
                    setIsVoiceSearching(false);
                    setSearchTerm(transcript);
                    speechManager.speakTelugu(`${transcript} వెతుకుతున్నాము.`);
                  },
                  () => {
                    setIsVoiceSearching(false);
                  },
                  () => {
                    setIsVoiceSearching(false);
                  }
                );
              }}
              className={`absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-colors cursor-pointer ${
                isVoiceSearching
                  ? 'bg-red-500 text-white animate-pulse'
                  : 'text-gray-400 hover:text-emerald-700 hover:bg-gray-100'
              }`}
              title="Speak to Search (Telugu)"
            >
              <Mic className="w-4 h-4" />
            </button>
          </div>

          {/* Sort dropdown */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="h-11 px-3 pr-8 rounded-xl border border-gray-200 bg-white text-xs font-semibold text-gray-700 outline-none focus:border-green-500 cursor-pointer appearance-none"
              >
                <option value="recommended">{language === 'ml' ? 'ശുപാർശ ചെയ്യുന്നത്' : 'Recommended'}</option>
                <option value="price-low">{language === 'ml' ? 'വില: കുറഞ്ഞത് മുതൽ' : 'Price: Low to High'}</option>
                <option value="price-high">{language === 'ml' ? 'വില: കൂടിയത് മുതൽ' : 'Price: High to Low'}</option>
                <option value="quantity">{language === 'ml' ? 'അളവ്: കൂടുതൽ' : 'Quantity: High to Low'}</option>
              </select>
              <ArrowUpDown className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Filter categories & View Mode Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-gray-100">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            {[
              { id: 'all', label: language === 'ml' ? 'എല്ലാം' : 'All Crops', telugu: 'అన్ని రకాల పంటలు' },
              { id: 'vegetables', label: language === 'ml' ? 'പച്ചക്കറികൾ' : 'Vegetables', telugu: 'కూరగాయలు' },
              { id: 'grains', label: language === 'ml' ? 'ധാന്യങ്ങൾ' : 'Grains & Pulses', telugu: 'ధాన్యాలు' },
              { id: 'negotiable', label: language === 'ml' ? 'വിലപേശാവുന്നത്' : 'Negotiable Price', telugu: 'బేరం చేయదగిన పంటలు' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                data-telugu-announce={`${cat.telugu} ఎంచుకున్నారు.`}
                className={`px-3.5 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  selectedCategory === cat.id
                    ? 'bg-green-700 text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Google Maps View toggle & Location Access */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleRequestLocationAccess}
              disabled={isLocatingBuyer}
              data-telugu-announce="గూగుల్ మ్యాప్స్ జీపీఎస్ బటన్ నొక్కారు."
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
                buyerLocation
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-xs'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
              title="Access Google Maps GPS Location"
            >
              <Navigation className={`w-3.5 h-3.5 ${isLocatingBuyer ? 'animate-spin text-emerald-600' : 'text-emerald-600'}`} />
              <span>
                {isLocatingBuyer
                  ? 'Accessing GPS...'
                  : buyerLocation
                  ? `Near ${buyerLocation.district || 'You'}`
                  : 'Google Maps GPS'}
              </span>
            </button>

            <div className="flex items-center bg-gray-100 p-0.5 rounded-xl border border-gray-200">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                data-telugu-announce="గ్రిడ్ కార్డ్స్ వ్యూ ఎంచుకున్నారు."
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-white text-gray-900 shadow-xs'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Grid</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('map')}
                data-telugu-announce="గూగుల్ మ్యాప్స్ వ్యూ ఎంచుకున్నారు."
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                  viewMode === 'map'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                <MapIcon className="w-3.5 h-3.5" />
                <span>Google Maps</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* View Content: Google Maps View vs Grid Cards */}
      {viewMode === 'map' ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>
              {language === 'te'
                ? 'ఆంధ్రప్రదేశ్ APMC గూగుల్ మ్యాప్స్ రైతు స్థానాలు'
                : language === 'hi'
                ? 'आंध्र प्रदेश APMC गूगल मैप्स किसान स्थान'
                : 'Andhra Pradesh APMC Google Maps Farm Network'}{' '}
              ({filteredProduce.length} {language === 'te' ? 'పొలాలు' : 'farms'})
            </span>
            <span className="text-emerald-700 font-bold">
              {buyerLocation
                ? `📍 Centered near ${buyerLocation.district || 'Your GPS Location'}`
                : 'Click "Google Maps GPS" to center on your location'}
            </span>
          </div>

          <GoogleMapView
            height="520px"
            language={language}
            interactive={true}
            showUserLocationButton={true}
            center={
              buyerLocation
                ? { lat: buyerLocation.lat, lng: buyerLocation.lng }
                : { lat: 16.3067, lng: 80.4365 }
            }
            zoom={buyerLocation ? 10 : 8}
            onMarkerClick={(item) => onNavigate('listing-detail', item)}
            markers={filteredProduce.map((p) => ({
              id: p.id,
              lat: p.lat || 16.3067,
              lng: p.lng || 80.4365,
              title: p.farmerName,
              subtitle: p.farmerVillage,
              cropName: p.cropName,
              price: p.pricePerKg,
              listing: p,
            }))}
          />
        </div>
      ) : (
        /* Produce Grid */
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{t.freshProduce || 'Fresh Produce Available'} ({filteredProduce.length})</span>
            <span>
              {language === 'te'
                ? 'ధృవీకరించబడిన పొలాల నుండి నేరుగా'
                : language === 'hi'
                ? 'सत्यापित खेतों से सीधे'
                : language === 'ta'
                ? 'சரிபார்க்கப்பட்ட பண்ணைகளிலிருந்து நேரடியாக'
                : language === 'kn'
                ? 'ದೃಢೀಕೃತ ತೋಟಗಳಿಂದ ನೇರವಾಗಿ'
                : language === 'ml'
                ? 'കർഷകരിൽ നിന്ന് നേരിട്ട്'
                : 'Direct from verified farms'}
            </span>
          </div>

          {filteredProduce.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-gray-200">
              <p className="text-gray-500 text-sm">
                {t.noResults || 'No produce matches your search.'}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {t.tryDifferent || 'Try different search keywords or remove filters'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredProduce.map((listing) => {
                const pricingTag = getPricingTag(listing.cropName, listing.pricePerKg);
                const distanceKm = buyerLocation
                  ? calculateDistance(
                      buyerLocation.lat,
                      buyerLocation.lng,
                      listing.lat || 16.3067,
                      listing.lng || 80.4365
                    )
                  : null;

                return (
                  <div
                    key={listing.id}
                    className="bg-white rounded-3xl border border-gray-200 hover:border-green-400 shadow-xs hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col justify-between group"
                  >
                    <div>
                      {/* Image Area */}
                      <div className="relative aspect-video bg-gray-100 overflow-hidden">
                        <img
                          src={listing.imageUrl}
                          alt={listing.cropName}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            (e.currentTarget as HTMLElement).style.display = 'none';
                          }}
                        />
                        {/* Price badge */}
                        <div className="absolute top-3 right-3 bg-black/75 backdrop-blur-md text-white px-3 py-1 rounded-xl text-sm font-black tabular-nums shadow-sm">
                          ₹{listing.pricePerKg}
                          <span className="text-[10px] font-normal text-gray-300">/{t.kg || 'kg'}</span>
                        </div>

                        {/* Negotiable Tag */}
                        {listing.negotiable && (
                          <div className="absolute top-3 left-3 bg-emerald-600/90 text-white text-[11px] font-semibold px-2.5 py-0.5 rounded-lg shadow-sm">
                            {t.negotiable || 'Negotiable'}
                          </div>
                        )}

                        {/* Distance Badge if location active */}
                        {distanceKm !== null && (
                          <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md text-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded-lg shadow-sm flex items-center gap-1 border border-emerald-200">
                            <Navigation className="w-3 h-3 text-emerald-600" />
                            <span>{distanceKm} km away</span>
                          </div>
                        )}
                      </div>

                      {/* Content Area */}
                      <div className="p-5 space-y-3">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="text-lg font-bold text-gray-900 leading-tight">
                              {getTranslatedCropName(listing.cropName, language)}
                            </h3>
                          </div>

                          {/* Farmer & location */}
                          <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
                            <span className="font-semibold text-gray-800 flex items-center gap-1">
                              {getTranslatedUserName(listing.farmerName, language)}
                              <ShieldCheck className="w-3.5 h-3.5 text-green-600 inline" />
                            </span>
                            <span>·</span>
                            <span className="flex items-center gap-0.5">
                              <MapPin className="w-3 h-3 text-gray-400" />
                              {getTranslatedVillageName(listing.farmerVillage, language)}
                            </span>
                          </div>
                        </div>

                        {/* APMC pricing status tag */}
                        {pricingTag && (
                          <div className={`text-[11px] font-bold px-2.5 py-1 rounded-md border inline-flex items-center gap-1 ${pricingTag.color}`}>
                            <Scale className="w-3 h-3" />
                            <span>{pricingTag.label}</span>
                          </div>
                        )}

                        {/* Quantity & batch value */}
                        <div className="bg-gray-50 p-3 rounded-xl flex items-center justify-between text-xs">
                          <span className="text-gray-500">{language === 'ml' ? 'ലഭ്യമായ സ്റ്റോക്ക്' : 'Available Harvest'}:</span>
                          <span className="font-bold text-gray-900 tabular-nums">{listing.quantity} kg</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="p-5 pt-0 flex items-center gap-2">
                      <button
                        onClick={() => onNavigate('chat', listing)}
                        data-telugu-announce={`${getTranslatedCropName(listing.cropName, language)} కోసం రైతుతో చాట్ లేదా బేరం బటన్ నొక్కారు.`}
                        className="flex-1 h-10 rounded-xl bg-green-50 hover:bg-green-100 text-green-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>{t.chat || 'Chat / Offer'}</span>
                      </button>

                      <button
                        onClick={() => onNavigate('listing-detail', listing)}
                        data-telugu-announce={`${getTranslatedCropName(listing.cropName, language)} పంట వివరాలు మరియు కొనుగోలు బటన్ నొక్కారు.`}
                        className="flex-1 h-10 rounded-xl bg-green-700 hover:bg-green-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
                        <span>{t.viewDetails || 'View & Buy'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
