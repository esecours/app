import React, { useState, useEffect, useCallback, useRef } from 'react';
import { LocationData } from '../types';

export function useGeolocation(options: { enabled?: boolean } = { enabled: true }) {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [permissionState, setPermissionState] = useState<PermissionState | 'unknown'>('unknown');

  useEffect(() => {
    if (navigator.permissions && (navigator.permissions as any).query) {
      navigator.permissions.query({ name: 'geolocation' as any }).then((result) => {
        setPermissionState(result.state);
        result.onchange = () => {
          setPermissionState(result.state);
        };
      }).catch(err => {
        console.debug("Error querying geolocation permission:", err);
      });
    }
  }, []);

  const lastFetchRef = useRef<AbortController | null>(null);
  const cachedAddressRef = useRef<{lat: number, lng: number, address: string | null}>({lat: 0, lng: 0, address: null});

  const getAddress = useCallback(async (lat: number, lng: number) => {
    // Return cached if very close (within ~20 meters)
    if (cachedAddressRef.current.address) {
      const dist = Math.sqrt(
        Math.pow((lat - cachedAddressRef.current.lat) * 111000, 2) +
        Math.pow((lng - cachedAddressRef.current.lng) * 111000 * Math.cos(lat * Math.PI / 180), 2)
      );
      if (dist < 20) return cachedAddressRef.current.address;
    }

    // Abort previous geocoding request
    if (lastFetchRef.current) {
      lastFetchRef.current.abort();
    }
    
    const controller = new AbortController();
    lastFetchRef.current = controller;

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          headers: {
            "Accept-Language": "fr",
            "User-Agent": "E-Secours-App-v1.0"
          },
          signal: controller.signal
        }
      );
      
      if (!response.ok) throw new Error("API error");
      
      const data = await response.json();
      const address = data.display_name || "Adresse inconnue";
      
      cachedAddressRef.current = { lat, lng, address };
      return address;
    } catch (err: any) {
      if (err.name === 'AbortError') return null; // Silent return for aborted requests
      console.warn("Reverse geocoding fetch failed, using coordinates only:", err);
      return `Coordonnées: ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    } finally {
      if (lastFetchRef.current === controller) {
        lastFetchRef.current = null;
      }
    }
  }, []);

  const startLocating = useCallback(() => {
    if (!navigator.geolocation) {
      setError("La géolocalisation n'est pas supportée par votre navigateur");
      return;
    }

    setIsLocating(true);
    setError(null);

    // Fast initial check to provide instant UI feedback while continuous GPS locks in
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude, accuracy, altitude } = pos.coords;
        const initialAddress = await getAddress(latitude, longitude);
        setLocation(prev => prev ? prev : {
          lat: latitude,
          lng: longitude,
          altitude,
          precision: accuracy,
          address: initialAddress || "Position acquise"
        });
      },
      (err) => {
        console.debug("Fast position check note:", err);
      },
      { enableHighAccuracy: false, timeout: 4000, maximumAge: 10000 }
    );
    
    // HIGH PRECISION WATCH: Continuous refinement with GPS
    const watchId = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude, accuracy, altitude } = position.coords;
        
        // Always update if we don't have a location, otherwise only if accuracy is better or we moved
        setLocation(prev => {
          let shouldUpdateAddress = false;
          
          if (prev) {
            const distance = Math.sqrt(
              Math.pow((latitude - prev.lat) * 111000, 2) +
              Math.pow((longitude - prev.lng) * 111000 * Math.cos(latitude * Math.PI / 180), 2)
            );
            
            // If we moved > 5m or accuracy improved
            if (distance > 5 || accuracy < prev.precision * 0.95) {
              shouldUpdateAddress = true;
            } else if (distance < 2 && accuracy >= prev.precision) {
              return prev; // No significant change, ignore
            }
          } else {
            shouldUpdateAddress = true;
          }

          if (shouldUpdateAddress) {
            getAddress(latitude, longitude).then(address => {
              if (address) {
                setLocation(curr => curr ? { ...curr, address } : null);
              }
            });
          }

          return {
            lat: latitude,
            lng: longitude,
            altitude,
            precision: accuracy,
            address: prev?.address || "Recherche adresse précise..."
          };
        });
        
        setPermissionState('granted');
        setIsLocating(false);
        setError(null);
      },
      (err) => {
        let msg = "Erreur GPS";
        if (err.code === 1) {
          msg = "Accès refusé. Veuillez autoriser la localisation.";
          setPermissionState('denied');
          setError(msg);
        } else {
          // If we already have a location, DO NOT alert the user with a signal error
          setLocation(prev => {
            if (prev) {
              setError(null);
              return prev;
            }
            
            if (err.code === 2) msg = "Signal GPS introuvable. Veuillez vérifier votre connexion.";
            if (err.code === 3) msg = "Délai de recherche dépassé. Relancez l'acquisition.";
            setError(msg);
            return null;
          });
        }
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 20000, 
        maximumAge: 0,
      }
    );

    return watchId;
  }, [getAddress]);

  useEffect(() => {
    if (options.enabled === false) return;
    const watchId = startLocating();
    return () => {
      if (typeof watchId === 'number') navigator.geolocation.clearWatch(watchId);
    };
  }, [startLocating, retryCount, options.enabled]);

  const getCurrentPosition = useCallback((): Promise<LocationData> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("La géolocalisation n'est pas supportée"));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude, accuracy, altitude } = position.coords;
          const address = await getAddress(latitude, longitude);
          const data = {
            lat: latitude,
            lng: longitude,
            altitude,
            precision: accuracy,
            address
          };
          setLocation(data);
          resolve(data);
        },
        (err) => {
          reject(err);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );
    });
  }, [getAddress]);

  const retry = () => setRetryCount(prev => prev + 1);

  return { location, setLocation, error, isLocating, retry, permissionState, getCurrentPosition };
}
