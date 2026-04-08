import { createContext, useState, useContext, useEffect } from 'react';
import { getEnglishAreaName } from '../utils/geocode';

const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
  const [location, setLocation] = useState(null);
  const [areaName, setAreaName] = useState('Detecting location...');
  const [loading, setLoading] = useState(true);

  const reverseGeocode = async (lat, lng) => {
    try {
      const name = await getEnglishAreaName(lat, lng);
      setAreaName(name);
    } catch {
      setAreaName('Location detected');
    }
  };

  const detectLocation = () => {
    setLoading(true);
    setAreaName('Detecting location...');
    if (!navigator.geolocation) {
      setAreaName('Location unavailable');
      setLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setLocation(loc);
        await reverseGeocode(loc.lat, loc.lng);
        setLoading(false);
      },
      () => {
        setAreaName('Enable location access');
        setLoading(false);
      }
    );
  };

  useEffect(() => { detectLocation(); }, []);

  return (
    <LocationContext.Provider value={{ location, areaName, loading, detectLocation }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => useContext(LocationContext);
