/**
 * Location and Geocoding service for Andhra Pradesh FarmDirect platform
 */

export interface GeoLocation {
  lat: number;
  lng: number;
  accuracy?: number;
  address?: string;
  district?: string;
}

export interface APDistrict {
  name: string;
  lat: number;
  lng: number;
  mandiHub: string;
}

export const AP_DISTRICTS: APDistrict[] = [
  { name: 'Guntur', lat: 16.3067, lng: 80.4365, mandiHub: 'Guntur APMC Yard (Mirchi Yard)' },
  { name: 'Tenali', lat: 16.2437, lng: 80.6400, mandiHub: 'Tenali Grain & Vegetable APMC' },
  { name: 'Vijayawada (NTR)', lat: 16.5062, lng: 80.6480, mandiHub: 'Gollapudi Wholesale APMC Market' },
  { name: 'Kurnool', lat: 15.8281, lng: 78.0373, mandiHub: 'Kurnool APMC Onion & Grain Yard' },
  { name: 'Rajahmundry (East Godavari)', lat: 17.0005, lng: 81.8040, mandiHub: 'Katheru APMC Vegetable Market' },
  { name: 'Madanapalle (Annamayya)', lat: 13.5560, lng: 78.5010, mandiHub: 'Madanapalle Tomato APMC Mandi' },
  { name: 'Tirupati', lat: 13.6288, lng: 79.4192, mandiHub: 'Tirupati APMC Rythu Bazaar' },
  { name: 'Anantapur', lat: 14.6819, lng: 77.6006, mandiHub: 'Anantapur APMC Groundnut & Cotton Yard' },
  { name: 'Nellore (SPSR Nellore)', lat: 14.4426, lng: 79.9865, mandiHub: 'Nellore Rice & Vegetable APMC' },
  { name: 'Eluru', lat: 16.7107, lng: 81.0952, mandiHub: 'Eluru APMC Agricultural Market' },
  { name: 'Visakhapatnam', lat: 17.6868, lng: 83.2185, mandiHub: 'MVP Colony Rythu & Commercial APMC' },
  { name: 'Kakinada', lat: 16.9891, lng: 82.2475, mandiHub: 'Kakinada Port & Regional APMC' },
  { name: 'Kadapa (YSR)', lat: 14.4673, lng: 78.8242, mandiHub: 'Kadapa Commercial APMC Yard' },
  { name: 'Ongole (Prakasam)', lat: 15.5057, lng: 80.0499, mandiHub: 'Ongole APMC Agricultural Yard' },
  { name: 'Chittoor', lat: 13.2172, lng: 79.1003, mandiHub: 'Chittoor Mango & Jaggery APMC' },
];

/**
 * Calculates distance between two coordinates in Kilometers using Haversine formula
 */
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Finds the closest Andhra Pradesh district & APMC hub to given coordinates
 */
export function findNearestAPDistrict(lat: number, lng: number): APDistrict {
  let minDistance = Infinity;
  let nearest = AP_DISTRICTS[0];

  for (const district of AP_DISTRICTS) {
    const dist = calculateDistance(lat, lng, district.lat, district.lng);
    if (dist < minDistance) {
      minDistance = dist;
      nearest = district;
    }
  }

  return nearest;
}

/**
 * Request real GPS device position via browser Geolocation API
 */
export function requestCurrentPosition(): Promise<GeoLocation> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        const nearest = findNearestAPDistrict(latitude, longitude);
        resolve({
          lat: latitude,
          lng: longitude,
          accuracy,
          address: `${nearest.name}, Andhra Pradesh (near ${nearest.mandiHub})`,
          district: nearest.name,
        });
      },
      (err) => {
        reject(err);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  });
}
