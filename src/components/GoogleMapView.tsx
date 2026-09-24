import React, { useState, useEffect } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
} from '@vis.gl/react-google-maps';
import {
  MapPin,
  Navigation,
  Compass,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  X,
  Key,
  Layers,
  Check,
} from 'lucide-react';
import { ProduceListing, Language } from '../types';
import { getTranslatedCropName, getTranslatedVillageName } from '../data/translations';
import { requestCurrentPosition, GeoLocation } from '../services/locationService';

export interface MapMarkerItem {
  id: string;
  lat: number;
  lng: number;
  title: string;
  subtitle?: string;
  listing?: ProduceListing;
  price?: number;
  cropName?: string;
  negotiable?: boolean;
}

interface GoogleMapViewProps {
  markers?: MapMarkerItem[];
  center?: { lat: number; lng: number };
  zoom?: number;
  height?: string;
  language?: Language;
  interactive?: boolean;
  selectable?: boolean;
  onSelectLocation?: (loc: { lat: number; lng: number; address: string; district: string }) => void;
  onMarkerClick?: (listing: ProduceListing) => void;
  showUserLocationButton?: boolean;
  className?: string;
}

export const GoogleMapView: React.FC<GoogleMapViewProps> = ({
  markers = [],
  center = { lat: 16.3067, lng: 80.4365 }, // Guntur, Andhra Pradesh center
  zoom = 9,
  height = '400px',
  language = 'te',
  interactive = true,
  selectable = false,
  onSelectLocation,
  onMarkerClick,
  showUserLocationButton = true,
  className = '',
}) => {
  const [selectedMarker, setSelectedMarker] = useState<MapMarkerItem | null>(null);
  const [userLocation, setUserLocation] = useState<GeoLocation | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [currentCenter, setCurrentCenter] = useState(center);
  const [selectedPin, setSelectedPin] = useState<{ lat: number; lng: number } | null>(null);

  // Read API Key from environment or localStorage
  const envKey = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string) || '';
  const [customKey, setCustomKey] = useState<string>(() => {
    return localStorage.getItem('farmdirect_google_maps_api_key') || '';
  });
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [tempKeyInput, setTempKeyInput] = useState('');

  const effectiveApiKey = envKey.trim() || customKey.trim();

  // Update center if props change
  useEffect(() => {
    setCurrentCenter(center);
  }, [center.lat, center.lng]);

  const handleGetLocation = async () => {
    setIsLocating(true);
    setLocationError(null);
    try {
      const loc = await requestCurrentPosition();
      setUserLocation(loc);
      setCurrentCenter({ lat: loc.lat, lng: loc.lng });
      if (selectable && onSelectLocation) {
        setSelectedPin({ lat: loc.lat, lng: loc.lng });
        onSelectLocation({
          lat: loc.lat,
          lng: loc.lng,
          address: loc.address || `${loc.district}, Andhra Pradesh`,
          district: loc.district || 'Andhra Pradesh',
        });
      }
    } catch (err: any) {
      console.warn('Geolocation error:', err);
      setLocationError(
        language === 'te'
          ? 'స్థాన అనుమతి తిరస్కరించబడింది. దయచేసి బ్రౌజర్ సెట్టింగ్‌లలో లొకేషన్ అనుమతించండి.'
          : language === 'hi'
          ? 'स्थान पहुंच अस्वीकृत। कृपया ब्राउज़र सेटिंग्स में स्थान की अनुमति दें।'
          : 'Location access denied or unavailable. Please enable GPS in browser.'
      );
    } finally {
      setIsLocating(false);
    }
  };

  const handleSelectDistrict = (lat: number, lng: number, name: string) => {
    setCurrentCenter({ lat, lng });
    setSelectedPin({ lat, lng });
    if (onSelectLocation) {
      onSelectLocation({
        lat,
        lng,
        address: `${name}, Andhra Pradesh`,
        district: name,
      });
    }
  };

  const handleSaveCustomKey = () => {
    if (tempKeyInput.trim()) {
      localStorage.setItem('farmdirect_google_maps_api_key', tempKeyInput.trim());
      setCustomKey(tempKeyInput.trim());
    } else {
      localStorage.removeItem('farmdirect_google_maps_api_key');
      setCustomKey('');
    }
    setShowKeyModal(false);
  };

  // Direct Google Maps Search & Direction URLs
  const googleMapsSearchUrl = `https://www.google.com/maps/search/?api=1&query=${currentCenter.lat},${currentCenter.lng}`;
  const googleMapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${currentCenter.lat},${currentCenter.lng}`;
  const googleMapsEmbedUrl = `https://maps.google.com/maps?q=${currentCenter.lat},${currentCenter.lng}&z=${zoom}&output=embed`;

  return (
    <div
      className={`relative w-full rounded-2xl overflow-hidden border border-gray-200 shadow-sm bg-slate-100 ${className}`}
      style={{ height }}
    >
      {/* Top Location Bar / GPS Trigger */}
      <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none gap-2">
        <div className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-gray-200 shadow-md text-xs font-semibold text-gray-800 flex items-center gap-1.5 pointer-events-auto">
          <MapPin className="w-3.5 h-3.5 text-red-600" />
          <span className="font-bold text-gray-900">
            {language === 'te'
              ? 'గూగుల్ మ్యాప్స్ (Google Maps)'
              : language === 'hi'
              ? 'गूगल मैप्स (Google Maps)'
              : 'Google Maps Farm Location'}
          </span>
          {effectiveApiKey ? (
            <span className="bg-green-100 text-green-800 text-[10px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
              <Check className="w-2.5 h-2.5" /> SDK Active
            </span>
          ) : (
            <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-1.5 py-0.5 rounded-md">
              Google Maps Live
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 pointer-events-auto">
          <button
            type="button"
            onClick={() => {
              setTempKeyInput(effectiveApiKey);
              setShowKeyModal(true);
            }}
            data-telugu-announce="గూగుల్ మ్యాప్స్ కీ సెట్టింగ్స్ బటన్ నొక్కారు."
            className="bg-white hover:bg-gray-50 text-gray-700 p-2 rounded-xl border border-gray-200 shadow-md text-xs font-bold transition-all cursor-pointer"
            title="Google Maps API Key Settings"
          >
            <Key className="w-3.5 h-3.5 text-amber-600" />
          </button>

          {showUserLocationButton && (
            <button
              type="button"
              onClick={handleGetLocation}
              disabled={isLocating}
              data-telugu-announce="గూగుల్ మ్యాప్స్‌లో మీ స్థానాన్ని గుర్తించే జీపీఎస్ బటన్ నొక్కారు."
              className="bg-white hover:bg-green-50 text-green-700 px-3 py-1.5 rounded-xl border border-green-200 shadow-md text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all hover:scale-102 active:scale-98 disabled:opacity-50"
              title="Locate via GPS"
            >
              <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin text-green-600' : 'text-green-600'}`} />
              <span>
                {isLocating
                  ? language === 'te' ? 'లొకేషన్...' : 'Locating GPS...'
                  : language === 'te' ? 'నా స్థానం (GPS)' : 'Locate Farm (GPS)'}
              </span>
            </button>
          )}
        </div>
      </div>

      {locationError && (
        <div className="absolute top-14 left-3 right-3 z-10 bg-amber-50 border border-amber-200 text-amber-800 px-3 py-1.5 rounded-xl text-xs shadow-md">
          {locationError}
        </div>
      )}

      {/* Map Rendering: Official Google Maps Platform SDK if API Key is present, or Google Maps Interactive View */}
      {effectiveApiKey ? (
        <APIProvider apiKey={effectiveApiKey} solutionChannel="GMP_AIS_applet">
          <Map
            defaultCenter={currentCenter}
            center={currentCenter}
            defaultZoom={zoom}
            gestureHandling={'greedy'}
            disableDefaultUI={!interactive}
            style={{ width: '100%', height: '100%' }}
            mapId={'farmdirect_google_map'}
          >
            {/* Farm produce markers */}
            {markers.map((m) => (
              <AdvancedMarker
                key={m.id}
                position={{ lat: m.lat, lng: m.lng }}
                onClick={() => {
                  setSelectedMarker(m);
                  setCurrentCenter({ lat: m.lat, lng: m.lng });
                }}
                title={m.title}
              >
                <Pin background={'#15803d'} glyphColor={'#ffffff'} borderColor={'#166534'}>
                  <span className="text-[10px] font-bold text-white">🌾</span>
                </Pin>
              </AdvancedMarker>
            ))}

            {/* User GPS location marker */}
            {userLocation && (
              <AdvancedMarker
                position={{ lat: userLocation.lat, lng: userLocation.lng }}
                title="Your Current Location"
              >
                <Pin background={'#2563eb'} glyphColor={'#ffffff'} borderColor={'#1e3a8a'} />
              </AdvancedMarker>
            )}

            {/* Farm info window */}
            {selectedMarker && (
              <InfoWindow
                position={{ lat: selectedMarker.lat, lng: selectedMarker.lng }}
                onCloseClick={() => setSelectedMarker(null)}
              >
                <div className="p-1 max-w-[200px]">
                  <h4 className="font-bold text-xs text-gray-900">
                    {getTranslatedCropName(selectedMarker.cropName || selectedMarker.title, language)}
                  </h4>
                  <p className="text-[10px] text-gray-600">
                    {getTranslatedVillageName(selectedMarker.subtitle || 'Andhra Pradesh', language)}
                  </p>
                  {selectedMarker.price && (
                    <p className="text-xs font-black text-green-700 mt-1">
                      ₹{selectedMarker.price} / kg
                    </p>
                  )}
                  {selectedMarker.listing && onMarkerClick && (
                    <button
                      type="button"
                      onClick={() => onMarkerClick(selectedMarker.listing!)}
                      className="mt-1.5 w-full py-1 bg-green-600 hover:bg-green-700 text-white rounded text-[10px] font-bold cursor-pointer"
                    >
                      {language === 'te' ? 'వివరాలు చూడండి' : 'View Listing'}
                    </button>
                  )}
                </div>
              </InfoWindow>
            )}
          </Map>
        </APIProvider>
      ) : (
        /* Google Maps Interactive Frame */
        <iframe
          title="Google Maps Farm Location"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          src={googleMapsEmbedUrl}
          className="w-full h-full pointer-events-auto"
        />
      )}

      {/* Interactive Crop Listings Quick Selector on Top of Google Map */}
      {markers.length > 0 && (
        <div className="absolute top-12 left-3 z-10 flex flex-wrap gap-1.5 max-w-[85%] pointer-events-auto">
          <div className="bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-lg border border-gray-200 text-[11px] font-bold text-gray-800 shadow-sm flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
            <span>{markers.length} {language === 'te' ? 'పొలాలు' : 'Farms'}</span>
          </div>

          {markers.slice(0, 4).map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => {
                setCurrentCenter({ lat: m.lat, lng: m.lng });
                setSelectedMarker(m);
              }}
              data-telugu-announce={`${m.cropName || m.title} పంట పొలం లొకేషన్ ఎంచుకున్నారు.`}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold shadow-xs border transition-all cursor-pointer flex items-center gap-1 ${
                selectedMarker?.id === m.id
                  ? 'bg-green-700 text-white border-green-800 scale-105'
                  : 'bg-white/90 hover:bg-white text-gray-800 border-gray-200'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              <span>{m.cropName || m.title}</span>
              {m.price && <span className="text-emerald-600 font-black">₹{m.price}</span>}
            </button>
          ))}
        </div>
      )}

      {/* Selectable District Quick Buttons for Farmers */}
      {selectable && (
        <div className="absolute top-12 left-3 right-3 z-10 pointer-events-auto flex items-center gap-1.5 overflow-x-auto pb-1">
          {[
            { name: 'Guntur', telugu: 'గుంటూరు', lat: 16.3067, lng: 80.4365 },
            { name: 'Vijayawada', telugu: 'విజయవాడ', lat: 16.5062, lng: 80.648 },
            { name: 'Kurnool', telugu: 'కర్నూలు', lat: 15.8281, lng: 78.0373 },
            { name: 'Nellore', telugu: 'నెల్లూరు', lat: 14.4426, lng: 79.9865 },
            { name: 'Rajahmundry', telugu: 'రాజమండ్రి', lat: 17.0005, lng: 81.804 },
            { name: 'Chittoor', telugu: 'చిత్తూరు', lat: 13.2172, lng: 79.1003 },
            { name: 'Anantapur', telugu: 'అనంతపురం', lat: 14.6819, lng: 77.6006 },
          ].map((dist) => (
            <button
              key={dist.name}
              type="button"
              onClick={() => handleSelectDistrict(dist.lat, dist.lng, dist.name)}
              data-telugu-announce={`${dist.telugu} జిల్లా పొలం లొకేషన్ ఎంచుకున్నారు.`}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer whitespace-nowrap ${
                selectedPin?.lat === dist.lat
                  ? 'bg-green-700 text-white border-green-800 shadow-md'
                  : 'bg-white/95 hover:bg-white text-gray-800 border-gray-200 shadow-xs'
              }`}
            >
              📍 {language === 'te' ? dist.telugu : dist.name}
            </button>
          ))}
        </div>
      )}

      {/* Selected Marker Detail Card Pop-up */}
      {selectedMarker && !effectiveApiKey && (
        <div className="absolute bottom-16 left-3 right-3 z-20 pointer-events-auto bg-white/95 backdrop-blur-md p-3 rounded-2xl border border-green-300 shadow-xl max-w-sm mx-auto">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              {selectedMarker.listing?.imageUrl && (
                <img
                  src={selectedMarker.listing.imageUrl}
                  alt={selectedMarker.cropName}
                  className="w-12 h-12 object-cover rounded-xl border border-gray-100 shrink-0"
                />
              )}
              <div>
                <h4 className="font-bold text-sm text-gray-900 leading-tight">
                  {getTranslatedCropName(selectedMarker.cropName || selectedMarker.title, language)}
                </h4>
                <p className="text-[11px] text-gray-500">
                  {getTranslatedVillageName(selectedMarker.subtitle || 'Andhra Pradesh', language)}
                </p>
                {selectedMarker.price && (
                  <p className="text-xs font-black text-green-700 mt-0.5">
                    ₹{selectedMarker.price} / kg
                  </p>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedMarker(null)}
              data-telugu-announce="వివరాలు మూసివేసే బటన్ నొక్కారు."
              className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {selectedMarker.listing && onMarkerClick && (
            <button
              type="button"
              onClick={() => onMarkerClick(selectedMarker.listing!)}
              data-telugu-announce="పంట వివరాలు చూసే బటన్ నొక్కారు."
              className="mt-2.5 w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-sm flex items-center justify-center gap-1"
            >
              <span>{language === 'te' ? 'పంట వివరాలు & కొనుగోలు' : 'View Listing & Buy'}</span>
            </button>
          )}
        </div>
      )}

      {/* Bottom Floating Google Maps Hub Bar with Directions & App Link */}
      <div className="absolute bottom-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-gray-200 shadow-lg text-xs pointer-events-auto">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-red-100 text-red-600 flex items-center justify-center font-bold">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <div className="font-extrabold text-gray-900 flex items-center gap-1">
              <span>
                {userLocation?.district
                  ? `${userLocation.district} Hub`
                  : 'Andhra Pradesh Farm Network'}
              </span>
              <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
            </div>
            <div className="text-[11px] text-gray-500 font-mono">
              {currentCenter.lat.toFixed(4)}° N, {currentCenter.lng.toFixed(4)}° E
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <a
            href={googleMapsDirectionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            data-telugu-announce="గూగుల్ మ్యాప్స్‌లో దిశలు చూసే బటన్ నొక్కారు."
            className="px-3 py-1.5 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs transition-all cursor-pointer"
            title="Directions on Google Maps"
          >
            <span>{language === 'te' ? 'దిశలు (Directions)' : 'Directions'}</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          <a
            href={googleMapsSearchUrl}
            target="_blank"
            rel="noopener noreferrer"
            data-telugu-announce="గూగుల్ మ్యాప్స్ యాప్‌లో చూసే బటన్ నొక్కారు."
            className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs flex items-center gap-1 border border-red-200 shadow-xs transition-all cursor-pointer"
            title="Open in Google Maps App"
          >
            <span>Google Maps</span>
            <ExternalLink className="w-3 h-3 text-red-600" />
          </a>
        </div>
      </div>

      {/* Google Maps API Key Setup Modal */}
      {showKeyModal && (
        <div className="absolute inset-0 z-30 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full shadow-2xl border border-gray-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
                  <Key className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-sm text-gray-900">
                  Google Maps API Key
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowKeyModal(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-gray-600">
              {language === 'te'
                ? 'మీ గూగుల్ మ్యాప్స్ API కీ నమోదు చేయండి లేదా నేరుగా ఉచిత లైవ్ మ్యాప్ ఉపయోగించండి.'
                : 'Enter your Google Maps Platform API Key to activate full Interactive Maps SDK.'}
            </p>

            <input
              type="password"
              value={tempKeyInput}
              onChange={(e) => setTempKeyInput(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-mono focus:border-green-600 focus:outline-none"
            />

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleSaveCustomKey}
                data-telugu-announce="గూగుల్ మ్యాప్స్ కీ సేవ్ చేసే బటన్ నొక్కారు."
                className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-all"
              >
                {language === 'te' ? 'కీ సేవ్ చేయండి' : 'Save Key'}
              </button>
              <button
                type="button"
                onClick={() => setShowKeyModal(false)}
                className="px-3 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                {language === 'te' ? 'రద్దు' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
