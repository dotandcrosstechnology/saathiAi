// src/utils/areaCoords.ts

export const areaCentroids: Record<string, { lat: number; lng: number }> = {
  // Islamabad
  'g-13': { lat: 33.6499, lng: 72.9638 },
  'f-10': { lat: 33.6993, lng: 73.0094 },
  'f-11': { lat: 33.6973, lng: 73.0514 },
  'i-8': { lat: 33.6691, lng: 73.0730 },
  // Lahore
  'gulberg': { lat: 31.5378, lng: 74.3478 },
  'dha': { lat: 31.5123, lng: 74.4298 }, // dha lahore
  'johar town': { lat: 31.4622, lng: 74.2942 },
  'model town': { lat: 31.4714, lng: 74.3187 },
  // Karachi
  'clifton': { lat: 24.8167, lng: 67.0333 },
  'dha karachi': { lat: 24.7937, lng: 67.0643 },
  'gulshan-e-iqbal': { lat: 24.9167, lng: 67.0833 },
  'gulshan': { lat: 24.9167, lng: 67.0833 },
};

// Haversine formula
export function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1); 
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg: number) {
  return deg * (Math.PI/180);
}
