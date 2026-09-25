import { User } from '../types';

export interface LocationInfo {
  lat: number;
  lng: number;
  district: string;
  source: 'gps' | 'profile' | 'fallback' | 'manual';
}

export const AP_DISTRICT_LOCATIONS: Record<string, { lat: number; lng: number }> = {
  'Vijayawada': { lat: 16.5062, lng: 80.6480 },
  'Guntur': { lat: 16.3067, lng: 80.4365 },
  'Tenali': { lat: 16.2437, lng: 80.6400 },
  'Kurnool': { lat: 15.8281, lng: 78.0373 },
  'Rajahmundry': { lat: 17.0005, lng: 81.8040 },
  'Visakhapatnam': { lat: 17.6868, lng: 83.2185 },
  'Tirupati': { lat: 13.6288, lng: 79.4192 },
  'Nellore': { lat: 14.4426, lng: 79.9865 },
  'Anantapur': { lat: 14.6819, lng: 77.6006 },
  'Eluru': { lat: 16.7107, lng: 81.0952 },
  'Kadapa': { lat: 14.4673, lng: 78.8242 },
  'Chittoor': { lat: 13.2172, lng: 79.1003 },
};

export const STORAGE_KEY_USER_LOCATION = 'farmdirect_user_location';

export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.round(d);
}

export function getInitialUserLocation(user?: User | null): LocationInfo {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_USER_LOCATION);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (typeof parsed.lat === 'number' && typeof parsed.lng === 'number') {
        return {
          lat: parsed.lat,
          lng: parsed.lng,
          district: parsed.district || user?.village || 'Vijayawada',
          source: parsed.source || 'profile',
        };
      }
    }
  } catch {
    // ignore json parse error
  }

  if (user?.lat && user?.lng) {
    return {
      lat: user.lat,
      lng: user.lng,
      district: user.village || 'Vijayawada',
      source: 'profile',
    };
  }

  if (user?.village && AP_DISTRICT_LOCATIONS[user.village]) {
    const coords = AP_DISTRICT_LOCATIONS[user.village];
    return {
      lat: coords.lat,
      lng: coords.lng,
      district: user.village,
      source: 'profile',
    };
  }

  // Default APMC hub center
  return {
    lat: 16.5062,
    lng: 80.6480,
    district: 'Vijayawada',
    source: 'fallback',
  };
}

export function saveUserLocation(location: LocationInfo) {
  try {
    localStorage.setItem(STORAGE_KEY_USER_LOCATION, JSON.stringify(location));
  } catch {
    // ignore
  }
}

export async function requestUserGeolocation(
  fallbackUser?: User | null
): Promise<LocationInfo> {
  const fallback = getInitialUserLocation(fallbackUser);

  if (typeof window === 'undefined' || !navigator.geolocation) {
    saveUserLocation(fallback);
    return fallback;
  }

  return new Promise<LocationInfo>((resolve) => {
    let resolved = false;

    const timer = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        saveUserLocation(fallback);
        resolve({ ...fallback, source: 'fallback' });
      }
    }, 6000);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (resolved) return;
        resolved = true;
        clearTimeout(timer);
        const location: LocationInfo = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          district: fallbackUser?.village || 'My GPS Location',
          source: 'gps',
        };
        saveUserLocation(location);
        resolve(location);
      },
      (err) => {
        if (resolved) return;
        resolved = true;
        clearTimeout(timer);
        console.warn('Geolocation unavailable, using regional location:', err.message);
        saveUserLocation(fallback);
        resolve({ ...fallback, source: fallback.source === 'gps' ? 'profile' : fallback.source });
      },
      {
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: 300000, // cache for 5 min
      }
    );
  });
}
