export const getEnglishAreaName = async (lat, lng) => {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16&accept-language=en`);
    if (!res.ok) throw new Error('Geocoding failed');
    const data = await res.json();
    const addr = data.address || {};
    const name = addr.suburb || addr.neighbourhood || addr.village || addr.town || addr.city_district || addr.city || 'Unknown Area';
    const city = addr.city || addr.town || addr.state || '';
    
    // Avoid "Unknown Area, " if city is found but name is missing
    if (name === 'Unknown Area' && city) return city;
    return city && name !== city ? `${name}, ${city}` : name;
  } catch (error) {
    console.error('Reverse Geocoding error:', error);
    return `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`;
  }
};
