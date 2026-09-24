import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Compass, ExternalLink, ShieldCheck, CheckCircle2, X } from 'lucide-react';
import { ProduceListing, Language } from '../types';
import { getTranslatedCropName, getTranslatedVillageName } from '../data/translations';
import { requestCurrentPosition, GeoLocation, findNearestAPDistrict } from '../services/locationService';

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

  // Quick district selection when selectable mode is active
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

  // OpenStreetMap Bounding Box coordinates (100% Free Open Source Map, No Paid API needed)
  const delta = zoom >= 12 ? 0.08 : zoom >= 10 ? 0.2 : 0.6;
  const bbox = `${currentCenter.lng - delta},${currentCenter.lat - delta},${currentCenter.lng + delta},${currentCenter.lat + delta}`;
  const osmEmbedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${currentCenter.lat},${currentCenter.lng}`;

  return (
    <div
      className={`relative w-full rounded-2xl overflow-hidden border border-gray-200 shadow-sm bg-slate-100 ${className}`}
      style={{ height }}
    >
      {/* Top Location Bar / GPS Trigger */}
      <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none gap-2">
        <div className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-gray-200 shadow-md text-xs font-semibold text-gray-800 flex items-center gap-1.5 pointer-events-auto">
          <MapPin className="w-3.5 h-3.5 text-green-600" />
          <span>
            {language === 'te'
              ? 'ఆంధ్రప్రదేశ్ APMC మార్కెట్ మ్యాప్ (ఉచితం)'
              : language === 'hi'
              ? 'आंध्र प्रदेश APMC कृषि मानचित्र'
              : 'Andhra Pradesh APMC Farm Map (Free)'}
          </span>
        </div>

        {showUserLocationButton && (
          <button
            type="button"
            onClick={handleGetLocation}
            disabled={isLocating}
            data-telugu-announce="జీపీఎస్ స్థానాన్ని గుర్తించే బటన్ నొక్కారు."
            className="bg-white hover:bg-green-50 text-green-700 px-3 py-1.5 rounded-xl border border-green-200 shadow-md text-xs font-bold flex items-center gap-1.5 pointer-events-auto cursor-pointer transition-all hover:scale-102 active:scale-98 disabled:opacity-50"
            title="Access GPS Location (Free Browser Geolocation)"
          >
            <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin text-green-600' : 'text-green-600'}`} />
            <span>
              {isLocating
                ? language === 'te' ? 'లొకేషన్ గుర్తించబడుతోంది...' : 'Locating GPS...'
                : language === 'te' ? 'నా స్థానం (GPS)' : 'Locate My Farm / Me'}
            </span>
          </button>
        )}
      </div>

      {locationError && (
        <div className="absolute top-14 left-3 right-3 z-10 bg-amber-50 border border-amber-200 text-amber-800 px-3 py-1.5 rounded-xl text-xs shadow-md">
          {locationError}
        </div>
      )}

      {/* 100% Free OpenStreetMap Embedded Interactive Frame (Zero paid API keys, Zero billing) */}
      <iframe
        title="Andhra Pradesh Agricultural Map (OpenStreetMap - Free)"
        width="100%"
        height="100%"
        style={{ border: 0 }}
        loading="lazy"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
        src={osmEmbedUrl}
        className="w-full h-full pointer-events-auto"
      />

      {/* Interactive Markers List Overlay (Farm listings and quick selection) */}
      {markers.length > 0 && (
        <div className="absolute top-12 left-3 z-10 flex flex-wrap gap-1.5 max-w-[85%] pointer-events-auto">
          <div className="bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-lg border border-gray-200 text-[11px] font-bold text-gray-800 shadow-sm flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
            <span>{markers.length} {language === 'te' ? 'పొలాలు మ్యాప్‌లో' : 'Farms on Map'}</span>
          </div>

          {markers.slice(0, 4).map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => {
                setCurrentCenter({ lat: m.lat, lng: m.lng });
                setSelectedMarker(m);
              }}
              data-telugu-announce={`${m.cropName || m.title} పంట స్థానం ఎంచుకున్నారు.`}
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

      {/* Selectable District Quick Buttons for Farmers choosing their farm location */}
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
      {selectedMarker && (
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

      {/* Bottom Floating Hub Indicator (Free Navigation) */}
      <div className="absolute bottom-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-gray-200 shadow-lg text-xs pointer-events-auto">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-green-100 text-green-700 flex items-center justify-center font-bold">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <div className="font-extrabold text-gray-900 flex items-center gap-1">
              <span>
                {userLocation?.district
                  ? `${userLocation.district} Hub`
                  : 'Andhra Pradesh Mandi Network'}
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
            href={`https://www.openstreetmap.org/?mlat=${currentCenter.lat}&mlon=${currentCenter.lng}#map=12/${currentCenter.lat}/${currentCenter.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            data-telugu-announce="ఉచిత ఓపెన్‌స్ట్రీట్‌మ్యాప్‌లో చూసే బటన్ నొక్కారు."
            className="px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs flex items-center gap-1 shadow-xs transition-all cursor-pointer"
            title="OpenStreetMap (100% Free Open Map)"
          >
            <span>OpenStreetMap</span>
            <ExternalLink className="w-3 h-3 text-gray-500" />
          </a>
        </div>
      </div>
    </div>
  );
};
