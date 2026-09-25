import React, { useState } from 'react';
import { User, ProduceListing, Language, GovernmentPrice } from '../types';
import { cropDetailsTranslations, getTranslatedCropName, getTranslatedVillageName, getTranslatedUserName } from '../data/translations';
import {
  ArrowLeft,
  ShieldCheck,
  Star,
  MapPin,
  Calendar,
  MessageCircle,
  CreditCard,
  Phone,
  Scale,
  CheckCircle2,
  Lock,
  IndianRupee,
  Navigation,
  ExternalLink,
} from 'lucide-react';
import {
  calculateHaversineDistance,
  getInitialUserLocation,
  requestUserGeolocation,
  saveUserLocation,
  AP_DISTRICT_LOCATIONS,
  LocationInfo,
} from '../utils/locationHelper';

interface ListingDetailScreenProps {
  language: Language;
  user: User;
  listing: ProduceListing;
  governmentPrices: GovernmentPrice[];
  farmers: User[];
  onBack: () => void;
  onNavigate: (screen: string, listing: ProduceListing) => void;
}

export const ListingDetailScreen: React.FC<ListingDetailScreenProps> = ({
  language,
  user,
  listing,
  governmentPrices,
  farmers,
  onBack,
  onNavigate,
}) => {
  const t = cropDetailsTranslations[language] || cropDetailsTranslations.en;
  const gov = governmentPrices.find((g) => g.cropName === listing.cropName);
  const farmer = farmers.find((f) => f.id === listing.farmerId);
  const totalValue = listing.quantity * listing.pricePerKg;

  const farmLat = listing.lat || farmer?.lat || 16.3067;
  const farmLng = listing.lng || farmer?.lng || 80.4365;

  const [userLocation, setUserLocation] = useState<LocationInfo>(() => getInitialUserLocation(user));
  const [distanceKm, setDistanceKm] = useState<number>(() => {
    const loc = getInitialUserLocation(user);
    return calculateHaversineDistance(loc.lat, loc.lng, farmLat, farmLng);
  });
  const [isCalculatingDistance, setIsCalculatingDistance] = useState(false);
  const [locationStatusMessage, setLocationStatusMessage] = useState<string | null>(null);
  const [showDistrictPicker, setShowDistrictPicker] = useState(false);

  const handleCalculateDistance = async () => {
    setIsCalculatingDistance(true);
    setLocationStatusMessage(null);
    try {
      const loc = await requestUserGeolocation(user);
      setUserLocation(loc);
      const dist = calculateHaversineDistance(loc.lat, loc.lng, farmLat, farmLng);
      setDistanceKm(dist);
      if (loc.source === 'gps') {
        setLocationStatusMessage(
          language === 'te' ? 'లైవ్ జీపీఎస్ ద్వారా దూరం లెక్కించబడింది' : 'Calculated via Live GPS'
        );
      } else {
        setLocationStatusMessage(
          language === 'te' ? `${loc.district} ప్రాంతం ఆధారంగా లెక్కించబడింది` : `Calculated from ${loc.district} location`
        );
      }
    } catch {
      // Safe fallback handled in requestUserGeolocation
    } finally {
      setIsCalculatingDistance(false);
    }
  };

  const handleSelectDistrict = (districtName: string) => {
    const coords = AP_DISTRICT_LOCATIONS[districtName];
    if (coords) {
      const newLoc: LocationInfo = {
        lat: coords.lat,
        lng: coords.lng,
        district: districtName,
        source: 'manual',
      };
      setUserLocation(newLoc);
      saveUserLocation(newLoc);
      const dist = calculateHaversineDistance(coords.lat, coords.lng, farmLat, farmLng);
      setDistanceKm(dist);
      setLocationStatusMessage(
        language === 'te' ? `${districtName} మార్కెట్ స్థానం ఎంచుకున్నారు` : `Selected ${districtName} location`
      );
      setShowDistrictPicker(false);
    }
  };

  // Comparison logic
  const priceComparison = (() => {
    if (!gov) return null;
    if (listing.pricePerKg <= gov.averagePrice * 0.95) {
      const label =
        language === 'te'
          ? 'మార్కెట్ సగటు కంటే తక్కువ (గొప్ప ఆఫర్)'
          : language === 'hi'
          ? 'मंडी औसत से कम (उत्कृष्ट डील)'
          : language === 'ta'
          ? 'சந்தை சராசரியை விட குறைவு (சிறந்த சலுகை)'
          : language === 'kn'
          ? 'ಮಾರುಕಟ್ಟೆ ಸರಾಸರಿಗಿಂತ ಕಡಿಮೆ (ಉತ್ತಮ ಬೆಲೆ)'
          : language === 'ml'
          ? 'വിപണിവിലയേക്കാൾ കുറവ് (മികച്ച ഓഫർ)'
          : 'Below Market Average (Great Value)';
      return {
        label,
        color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      };
    }
    if (listing.pricePerKg >= gov.averagePrice * 1.05) {
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
          : 'Premium Grade Quality';
      return {
        label,
        color: 'text-amber-700 bg-amber-50 border-amber-200',
      };
    }
    const label =
      language === 'te'
        ? 'సమంజసమైన APMC మార్కెట్ బెంచ్‌మార్క్'
        : language === 'hi'
        ? 'उचित APMC मंडी बेंचमार्क'
        : language === 'ta'
        ? 'நியாயமான APMC மண்டி விலை'
        : language === 'kn'
        ? 'ನ್ಯಾಯಯುತ APMC ಮಂಡಿ ದರ'
        : language === 'ml'
        ? 'ന്യായമായ വിപണി നിരക്ക്'
        : 'Fair Mandi Rate Benchmark';
    return {
      label,
      color: 'text-blue-700 bg-blue-50 border-blue-200',
    };
  })();

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
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
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
            {getTranslatedCropName(listing.cropName, language)}
          </h1>
          <p className="text-xs text-gray-500">
            {language === 'ml' ? 'വിളയുടെ സമഗ്ര വിവരങ്ങൾ' : 'Fresh farm harvest specification & direct escrow checkout'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Image & APMC Analysis */}
        <div className="md:col-span-2 space-y-5">
          {/* Main Photo Card */}
          <div className="bg-white rounded-3xl overflow-hidden border border-gray-200 shadow-xs">
            <div className="relative aspect-video max-h-96 bg-gray-100">
              <img
                src={listing.imageUrl}
                alt={listing.cropName}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = 'none';
                }}
              />
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-xl text-xs font-bold text-green-800 shadow-sm flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span>{language === 'ml' ? 'ലഭ്യമായ സ്റ്റോക്ക്' : 'Harvest Ready'}</span>
              </div>

              {listing.negotiable && (
                <div className="absolute top-4 right-4 bg-emerald-600 text-white px-3 py-1 rounded-xl text-xs font-bold shadow-sm">
                  {t.negotiable || 'Price Negotiable'}
                </div>
              )}
            </div>

            {/* Quick summary strip */}
            <div className="p-6 grid grid-cols-3 gap-4 border-t border-gray-100 bg-gray-50/50">
              <div>
                <div className="text-xs text-gray-500">{t.price || 'Price per kg'}</div>
                <div className="text-xl font-black text-green-700 tabular-nums">
                  ₹{listing.pricePerKg}
                  <span className="text-xs font-normal text-gray-400">/kg</span>
                </div>
              </div>

              <div>
                <div className="text-xs text-gray-500">{t.quantity || 'Available Quantity'}</div>
                <div className="text-xl font-black text-gray-900 tabular-nums">
                  {listing.quantity} <span className="text-xs font-normal text-gray-400">kg</span>
                </div>
              </div>

              <div>
                <div className="text-xs text-gray-500">{t.totalValue || 'Total Batch Value'}</div>
                <div className="text-xl font-black text-gray-900 tabular-nums">
                  ₹{totalValue.toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* APMC Mandi Price Comparison */}
          {gov && (
            <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-green-100 text-green-700 flex items-center justify-center">
                    <Scale className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-gray-900">
                      {t.priceComparison || 'Government Mandi Price Benchmark'}
                    </h3>
                    <p className="text-xs text-gray-400">
                      {gov.market} · {gov.date}
                    </p>
                  </div>
                </div>

                {priceComparison && (
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${priceComparison.color}`}>
                    {priceComparison.label}
                  </span>
                )}
              </div>

              {/* Price comparison range meter */}
              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-xs font-medium text-gray-500">
                  <span>Min: ₹{gov.minPrice}</span>
                  <span className="font-bold text-green-700">Mandi Avg: ₹{gov.averagePrice}/kg</span>
                  <span>Max: ₹{gov.maxPrice}</span>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden relative">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-400 to-green-600 rounded-full"
                    style={{
                      width: `${Math.min(100, Math.max(10, ((listing.pricePerKg - gov.minPrice) / (gov.maxPrice - gov.minPrice || 1)) * 100))}%`,
                    }}
                  />
                </div>
                <p className="text-[11px] text-gray-500 italic text-center pt-1">
                  {language === 'te'
                    ? 'ఈ ధర రైతు నుండి నేరుగా నిర్ణయించబడింది; మధ్యవర్తుల కమీషన్లు లేవు.'
                    : language === 'hi'
                    ? 'यह मूल्य सीधे किसान से है; बिचौलियों का कोई कमीशन नहीं है।'
                    : language === 'ta'
                    ? 'இந்த விலை விவசாயியிடமிருந்து நேரடியாக நிர்ணயிக்கப்பட்டது; இடைத்தரகர் கமிஷன் இல்லை.'
                    : language === 'kn'
                    ? 'ಈ ಬೆಲೆಯು ರೈತರಿಂದ ನೇರವಾದದ್ದು; ಮಧ್ಯವರ್ತಿಗಳ ಕಮಿಷನ್ ಇಲ್ಲ.'
                    : language === 'ml'
                    ? 'ഈ വില കർഷകരുടെ നേരിട്ടുള്ള നിരക്കാണ്; ഇടനിലക്കാരുടെ കമ്മീഷൻ ഇല്ലാതെ ലഭിക്കുന്നു.'
                    : 'This price is direct from the farmer, eliminating middlemen distributor margins.'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Farmer Card & Purchase Actions */}
        <div className="space-y-5">
          {/* Farmer Profile Card */}
          <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-green-800">
              {language === 'ml' ? 'കർഷക വിവരങ്ങൾ' : 'Verified Farmer Profile'}
            </h3>

            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-green-600 to-emerald-500 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-green-600/20">
                {listing.farmerName.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="font-extrabold text-base text-gray-900 flex items-center gap-1.5">
                  <span>{getTranslatedUserName(listing.farmerName, language)}</span>
                  <ShieldCheck className="w-4 h-4 text-green-600" />
                </div>
                <div className="text-xs text-gray-500 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" />
                  <span>{getTranslatedVillageName(listing.farmerVillage, language)}</span>
                </div>
              </div>
            </div>

            <div className="bg-green-50/70 border border-green-100 rounded-2xl p-3.5 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">{language === 'ml' ? 'ആധാർ പരിശോധന' : 'Aadhar Verified'}:</span>
                <span className="font-bold text-green-800 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                  {language === 'ml' ? 'സ്ഥിരീകരിച്ചു' : 'Verified ID'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">{language === 'ml' ? 'റേറ്റിംഗ്' : 'Farmer Rating'}:</span>
                <span className="font-bold text-gray-900 flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  {farmer?.rating || 4.7} ({farmer?.totalReviews || 24} reviews)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">{language === 'ml' ? 'പോസ്റ്റ് ചെയ്ത തീയതി' : 'Harvest Date'}:</span>
                <span className="font-medium text-gray-800">{listing.postedDate}</span>
              </div>
            </div>

            {/* Quick Call Button */}
            {farmer?.phone && (
              <a
                href={`tel:${farmer.phone}`}
                className="w-full py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-green-600" />
                <span>{language === 'ml' ? 'കർഷകനെ വിളിക്കുക' : 'Direct Phone Call'}</span>
              </a>
            )}
          </div>

          {/* Farm Location on Google Maps Card */}
          <div className="bg-white rounded-3xl p-5 border border-gray-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-gray-900">
                    {language === 'te'
                      ? 'గూగుల్ మ్యాప్స్‌లో పొలం స్థానం'
                      : language === 'hi'
                      ? 'गूगल मैप्स पर खेत का स्थान'
                      : 'Farm Location on Google Maps'}
                  </h3>
                  <p className="text-[11px] text-gray-400">
                    {getTranslatedVillageName(listing.farmerVillage, language)}, Andhra Pradesh
                  </p>
                </div>
              </div>

              <a
                href={`https://www.google.com/maps/search/?api=1&query=${farmLat},${farmLng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1 rounded-lg border border-gray-200 hover:bg-emerald-50 text-emerald-700 text-xs transition-colors flex items-center gap-1 font-bold cursor-pointer"
                title="Open in Google Maps App"
              >
                <span>Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Interactive Google Map Preview */}
            <div className="rounded-2xl overflow-hidden border border-emerald-100 bg-gray-100 h-52 w-full relative shadow-inner">
              <iframe
                title="Google Maps Farm Location"
                src={`https://maps.google.com/maps?q=${farmLat},${farmLng}&hl=en&z=13&output=embed`}
                className="w-full h-full border-0"
                loading="lazy"
              />
            </div>

            {/* Farm Location Details & Action Buttons */}
            <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50/50 to-green-50/30 p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-bold text-gray-800">
                    {getTranslatedVillageName(listing.farmerVillage, language)}, Andhra Pradesh
                  </div>
                  <div className="text-[11px] text-gray-500 font-mono mt-0.5">
                    {farmLat.toFixed(4)}° N, {farmLng.toFixed(4)}° E
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${farmLat},${farmLng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>{language === 'te' ? 'దిశలు చూడండి' : 'Directions'}</span>
                  </a>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${farmLat},${farmLng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-xl border border-emerald-300 bg-white hover:bg-emerald-50 text-emerald-800 text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{language === 'te' ? 'మ్యాప్‌లో చూడండి' : 'Open Map'}</span>
                    <ExternalLink className="w-3 h-3 opacity-80" />
                  </a>
                </div>
              </div>
            </div>

            {/* GPS Distance Calculator */}
            <div className="pt-2 border-t border-emerald-100/70 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-emerald-800 font-extrabold flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 shadow-2xs">
                    <Navigation className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{distanceKm} km away from {userLocation.district || 'You'}</span>
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 font-medium">
                    {userLocation.source === 'gps' ? 'Live GPS' : userLocation.district}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setShowDistrictPicker(!showDistrictPicker)}
                    className="text-[11px] font-bold text-gray-600 hover:text-emerald-700 bg-gray-50 hover:bg-gray-100 px-2 py-1 rounded-lg border border-gray-200 transition-colors cursor-pointer"
                  >
                    Change City ▾
                  </button>

                  <button
                    type="button"
                    onClick={handleCalculateDistance}
                    disabled={isCalculatingDistance}
                    data-telugu-announce="పొలం దూరం లెక్కించే బటన్ నొక్కారు."
                    className="text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 flex items-center gap-1.5 px-3 py-1 rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Navigation className={`w-3.5 h-3.5 ${isCalculatingDistance ? 'animate-spin' : ''}`} />
                    <span>{isCalculatingDistance ? 'Locating...' : 'Distance to Me'}</span>
                  </button>
                </div>
              </div>

              {/* District quick selector */}
              {showDistrictPicker && (
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-1.5">
                  <div className="text-[11px] font-bold text-gray-700">
                    Select your trading city / destination district in Andhra Pradesh:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.keys(AP_DISTRICT_LOCATIONS).map((dist) => (
                      <button
                        key={dist}
                        type="button"
                        onClick={() => handleSelectDistrict(dist)}
                        className={`px-2 py-0.5 rounded-md text-[11px] font-medium border transition-colors cursor-pointer ${
                          userLocation.district === dist
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-white text-gray-700 border-gray-200 hover:bg-emerald-50 hover:text-emerald-800'
                        }`}
                      >
                        {dist}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {locationStatusMessage && (
                <div className="text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                  <span>{locationStatusMessage}</span>
                </div>
              )}
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
              {language === 'ml' ? 'ഇടപാട് ആരംഭിക്കുക' : 'Instant Procurement'}
            </h3>

            <button
              onClick={() => onNavigate('payment-escrow', listing)}
              data-telugu-announce={`${getTranslatedCropName(listing.cropName, language)} ఎస్క్రో ద్వారా ఇప్పుడే కొనుగోలు చేసే బటన్ నొక్కారు.`}
              className="w-full h-13 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-extrabold text-sm shadow-lg shadow-green-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-101"
            >
              <Lock className="w-4 h-4" />
              <span>{language === 'ml' ? 'എസ്ക്രോ വഴി വാങ്ങുക' : 'Buy Now (Escrow Safe)'}</span>
            </button>

            <button
              onClick={() => onNavigate('chat', listing)}
              data-telugu-announce="రైతుతో మాట్లాడటం మరియు ధర బేరం చేసే బటన్ నొక్కారు."
              className="w-full h-12 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <MessageCircle className="w-4 h-4 text-green-600" />
              <span>{language === 'ml' ? 'കർഷകനുമായി ചാറ്റ് ചെയ്യുക / വിലപേശുക' : 'Chat & Negotiate Price'}</span>
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-400 text-center pt-1">
              <Lock className="w-3 h-3 text-green-600" />
              <span>{language === 'ml' ? 'പണം എസ്ക്രോ അക്കൗണ്ടിൽ സുരക്ഷിതം' : 'Protected by RBI-compliant Escrow'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
