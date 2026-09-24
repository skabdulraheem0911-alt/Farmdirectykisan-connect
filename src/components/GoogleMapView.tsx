import React, { useState, useEffect } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow } from '@vis.gl/react-google-maps';
import { MapPin, Navigation, Compass, ExternalLink, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { ProduceListing, Language } from '../types';
import { getTranslatedCropName, getTranslatedVillageName, getTranslatedUserName } from '../data/translations';
import { requestCurrentPosition, GeoLocation, calculateDistance, findNearestAPDistrict } from '../services/locationService';

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
  language = 'en',
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
  const [currentZoom, setCurrentZoom] = useState(zoom);
  const [selectedPin, setSelectedPin] = useState<{ lat: number; lng: number } | null>(null);

  const apiKey = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string) || '';

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
      setCurrentZoom(13);
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

  const handleMapClick = (e: any) => {
    if (!selectable) return;
    const lat = e.detail?.latLng?.lat;
    const lng = e.detail?.latLng?.lng;
    if (lat && lng) {
      setSelectedPin({ lat, lng });
      const nearest = findNearestAPDistrict(lat, lng);
      if (onSelectLocation) {
        onSelectLocation({
          lat,
          lng,
          address: `${nearest.name}, Andhra Pradesh`,
          district: nearest.name,
        });
      }
    }
  };

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
              ? 'ఆంధ్రప్రదేశ్ APMC గూగుల్ మ్యాప్స్ నెట్‌వర్క్'
              : language === 'hi'
              ? 'आंध्र प्रदेश APMC गूगल मैप्स नेटवर्क'
              : 'Andhra Pradesh APMC Google Maps'}
          </span>
        </div>

        {showUserLocationButton && (
          <button
            type="button"
            onClick={handleGetLocation}
            disabled={isLocating}
            className="bg-white hover:bg-green-50 text-green-700 px-3 py-1.5 rounded-xl border border-green-200 shadow-md text-xs font-bold flex items-center gap-1.5 pointer-events-auto cursor-pointer transition-all hover:scale-102 active:scale-98 disabled:opacity-50"
            title="Access GPS Location via Google Maps"
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

      {/* Render Google Maps via official @vis.gl/react-google-maps if API key is present */}
      {apiKey ? (
        <APIProvider apiKey={apiKey} libraries={['marker']}>
          <Map
            mapId="DEMO_MAP_ID"
            defaultCenter={currentCenter}
            defaultZoom={currentZoom}
            gestureHandling={interactive ? 'greedy' : 'none'}
            disableDefaultUI={!interactive}
            onClick={handleMapClick}
            className="w-full h-full"
            internalUsageAttributionIds={['gmp_git_agentskills_v1']}
          >
            {/* User GPS Pin */}
            {userLocation && (
              <AdvancedMarker position={{ lat: userLocation.lat, lng: userLocation.lng }} title="Your Location">
                <div className="relative flex items-center justify-center">
                  <div className="absolute w-8 h-8 rounded-full bg-blue-500/30 animate-ping" />
                  <div className="w-5 h-5 rounded-full bg-blue-600 border-2 border-white shadow-lg flex items-center justify-center text-white text-[10px]">
                    ●
                  </div>
                </div>
              </AdvancedMarker>
            )}

            {/* Custom Interactive Marker when User clicks to select farm location */}
            {selectable && selectedPin && (
              <AdvancedMarker position={selectedPin} title="Selected Farm Location">
                <Pin background="#16a34a" glyphColor="#ffffff" borderColor="#15803d" />
              </AdvancedMarker>
            )}

            {/* Farm Produce Markers */}
            {markers.map((item) => (
              <AdvancedMarker
                key={item.id}
                position={{ lat: item.lat, lng: item.lng }}
                title={item.title}
                onClick={() => setSelectedMarker(item)}
              >
                <div className="cursor-pointer group transition-transform hover:scale-110">
                  <div className="bg-white px-2 py-1 rounded-xl shadow-md border border-green-500 flex items-center gap-1 text-[11px] font-bold text-gray-800">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span>{item.cropName || item.title}</span>
                    {item.price && <span className="text-green-700">₹{item.price}</span>}
                  </div>
                  <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-white mx-auto drop-shadow-sm" />
                </div>
              </AdvancedMarker>
            ))}

            {/* InfoWindow for selected Produce */}
            {selectedMarker && (
              <InfoWindow
                position={{ lat: selectedMarker.lat, lng: selectedMarker.lng }}
                onCloseClick={() => setSelectedMarker(null)}
              >
                <div className="p-1 max-w-[220px] text-xs font-sans">
                  {selectedMarker.listing && (
                    <img
                      src={selectedMarker.listing.imageUrl}
                      alt={selectedMarker.cropName}
                      className="w-full h-20 object-cover rounded-lg mb-1.5"
                    />
                  )}
                  <div className="font-extrabold text-sm text-gray-900">
                    {getTranslatedCropName(selectedMarker.cropName || selectedMarker.title, language)}
                  </div>
                  <div className="text-gray-500 text-[11px]">
                    {getTranslatedVillageName(selectedMarker.subtitle || 'Andhra Pradesh', language)}
                  </div>
                  {selectedMarker.price && (
                    <div className="mt-1 font-bold text-green-700 text-sm">
                      ₹{selectedMarker.price} / kg
                    </div>
                  )}
                  {selectedMarker.listing && onMarkerClick && (
                    <button
                      type="button"
                      onClick={() => onMarkerClick(selectedMarker.listing!)}
                      className="mt-2 w-full py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors"
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
        /* Fallback High-Fidelity Interactive Map View (Active even without custom API key) */
        <div className="w-full h-full relative bg-emerald-950/5 flex flex-col items-center justify-center overflow-hidden">
          {/* SVG Map Grid & AP Hub Visualization */}
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#16a34a_1px,transparent_1px)] [background-size:20px_20px]" />

          {/* Interactive Google Maps Embed Frame for Andhra Pradesh */}
          <iframe
            title="Google Maps Andhra Pradesh"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
            src={`https://maps.google.com/maps?q=${currentCenter.lat},${currentCenter.lng}&z=${currentZoom}&output=embed`}
            className="w-full h-full pointer-events-auto"
          />

          {/* Bottom Floating Card with Direct Google Maps Link */}
          <div className="absolute bottom-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-gray-200 shadow-lg text-xs">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-green-100 text-green-700 flex items-center justify-center font-bold">
                <Compass className="w-4 h-4" />
              </div>
              <div>
                <div className="font-extrabold text-gray-900 flex items-center gap-1">
                  <span>
                    {userLocation?.district
                      ? `${userLocation.district} Hub`
                      : 'Andhra Pradesh APMC Corridor'}
                  </span>
                  <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
                </div>
                <div className="text-[11px] text-gray-500">
                  {currentCenter.lat.toFixed(4)}° N, {currentCenter.lng.toFixed(4)}° E
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${currentCenter.lat},${currentCenter.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all hover:scale-102"
              >
                <span>Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Floating markers count tag */}
      {markers.length > 0 && (
        <div className="absolute top-12 left-3 z-10 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-gray-200 text-[11px] font-bold text-gray-700 shadow-sm flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-green-600" />
          <span>
            {markers.length}{' '}
            {language === 'te'
              ? 'రైతుల పొలాలు మ్యాప్‌లో ఉన్నాయి'
              : language === 'hi'
              ? 'किसान खेत मैप पर हैं'
              : 'Farms on Map'}
          </span>
        </div>
      )}
    </div>
  );
};
