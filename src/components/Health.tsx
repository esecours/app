import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Phone, Navigation, Search, Map as MapIcon, List, Activity, Heart, Info, Loader2, Hospital, Building2, AlertTriangle } from 'lucide-react';
import { useGeolocation } from '../hooks/useGeolocation';
import { MapPreview } from './MapPreview';
import { PermissionGuard } from './PermissionGuard';
import { cn } from '../lib/utils';

interface HealthPoint {
  id: number;
  lat: number;
  lon: number;
  name: string;
  type: 'pharmacy' | 'hospital' | 'clinic' | 'doctors';
  address?: string;
  phone?: string;
  hours?: string;
  specialty?: string;
  distance?: number;
}

export const Health = () => {
  const { location, isLocating, error: geoError, retry: retryGeo, getCurrentPosition, permissionState } = useGeolocation();
  const [points, setPoints] = useState<HealthPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [navigatingId, setNavigatingId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [selectedPoint, setSelectedPoint] = useState<HealthPoint | null>(null);
  const [searchRadius, setSearchRadius] = useState(5000); // 5km
  const [filter, setFilter] = useState<'all' | 'pharmacy' | 'hospital' | 'medical'>('all');
  const [manualRefresh, setManualRefresh] = useState(0);

  const [fetchError, setFetchError] = useState<string | null>(null);
  const abortControllerRef = React.useRef<AbortController | null>(null);

  // Fallback and effective location states to allow direct result showing even if GPS is denied or restricted in preview
  const [effectiveLocation, setEffectiveLocation] = useState<{lat: number, lng: number, address?: string, precision?: number} | null>(null);
  const [isUsingFallback, setIsUsingFallback] = useState(false);

  useEffect(() => {
    if (location) {
      setEffectiveLocation(location);
      setIsUsingFallback(false);
    } else if (!isLocating && geoError) {
      // Don't auto-fallback to Paris. We need true location for reliability.
      setEffectiveLocation(null);
      setIsUsingFallback(false);
    }
  }, [location, isLocating, geoError]);

  const fetchNearbyMedical = useCallback(async (lat: number, lon: number) => {
    // Abort previous request if any
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    const controller = new AbortController();
    abortControllerRef.current = controller;
    
    setLoading(true);
    setFetchError(null);
    
    const query = `
      [out:json][timeout:25];
      (
        node["amenity"~"pharmacy|hospital|clinic|doctors"](around:${searchRadius},${lat},${lon});
        way["amenity"~"pharmacy|hospital|clinic|doctors"](around:${searchRadius},${lat},${lon});
      );
      out center;
    `;

    let lastError = '';
    let data;
    
    try {
      const timeoutId = setTimeout(() => controller.abort(), 45000); // Increased timeout to 45s

      let response;
      let useDirectFallback = false;

      try {
        response = await fetch('/api/medical', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ query }),
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        // Handle "Starting Server" placeholder during restarts
        let contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('text/html')) {
          const text = await response.text();
          if (text.includes('Starting Server')) {
            console.warn('Backend is booting, retrying in 2s...');
            await new Promise(r => setTimeout(r, 2000));
            
            if (controller.signal.aborted) return;

            response = await fetch('/api/medical', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ query }),
              signal: controller.signal
            });
            contentType = response.headers.get('content-type');
          }
        }

        if (controller.signal.aborted) return;

        if (!contentType || !contentType.includes('application/json')) {
          const text = await response.text();
          console.error('SERVER RETURNED NON-JSON:', text.substring(0, 200));
          useDirectFallback = true;
        } else {
          data = await response.json();
          if (!response.ok) {
            useDirectFallback = true;
          }
        }
      } catch (apiErr: any) {
        if (apiErr.name === 'AbortError') throw apiErr;
        console.warn("Backend API `/api/medical` unreachable or failed, switching to client direct fetch fallback:", apiErr);
        useDirectFallback = true;
      }

      // If backend failed (either unreachable, non-json, or 404/502), fetch directly from OSM Overpass with CORS!
      if (useDirectFallback) {
        console.log("[HEALTH-LOCATOR] Fetching OSM Overpass servers directly from client browser...");
        const clientInterpreters = [
          "https://lz4.overpass-api.de/api/interpreter",
          "https://overpass-api.de/api/interpreter",
          "https://overpass.kumi.systems/api/interpreter"
        ];
        
        let clientSuccess = false;
        for (const url of clientInterpreters) {
          try {
            if (controller.signal.aborted) return;
            const directRes = await fetch(url, {
              method: "POST",
              headers: {
                "Content-Type": "application/x-www-form-urlencoded"
              },
              body: `data=${encodeURIComponent(query)}`,
              signal: controller.signal
            });
            
            if (directRes.ok) {
              data = await directRes.json();
              clientSuccess = true;
              console.log(`[HEALTH-LOCATOR] Successfully acquired points directly from client Overpass source: ${url}`);
              break;
            } else {
              console.warn(`[HEALTH-LOCATOR] Direct fetch failed for ${url} (Status: ${directRes.status})`);
            }
          } catch (e: any) {
            if (e.name === 'AbortError') throw e;
            console.error(`[HEALTH-LOCATOR] Failed direct fetch attempt to ${url}:`, e);
          }
        }

        if (!clientSuccess) {
          lastError = "Impossible de récupérer les centres médicaux. Les serveurs de cartographie publics OSM sont inaccessibles.";
          setFetchError(lastError);
          setLoading(false);
          return;
        }
      }

      if (controller.signal.aborted) return;
      
      if (!data.elements || !Array.isArray(data.elements)) {
        lastError = "Données médicales corrompues. Veuillez réessayer.";
        setFetchError(lastError);
        setLoading(false);
        return;
      }

      const mappedPoints: HealthPoint[] = data.elements.map((el: any) => {
        const pointLat = el.lat || el.center?.lat;
        const pointLon = el.lon || el.center?.lon;
        
        const R = 6371e3;
        const φ1 = lat * Math.PI/180;
        const φ2 = pointLat * Math.PI/180;
        const Δφ = (pointLat-lat) * Math.PI/180;
        const Δλ = (pointLon-lon) * Math.PI/180;
        const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ/2) * Math.sin(Δλ/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const d = R * c;

        const amenity = el.tags?.amenity;
        let type: 'pharmacy' | 'hospital' | 'clinic' | 'doctors' = 'hospital';
        if (amenity === 'pharmacy') type = 'pharmacy';
        else if (amenity === 'clinic') type = 'clinic';
        else if (amenity === 'doctors') type = 'doctors';

        const name = el.tags?.name || (
          type === 'pharmacy' ? 'Pharmacie' : 
          type === 'hospital' ? 'Hôpital' : 
          type === 'clinic' ? 'Clinique' : 'Médecin'
        );

        return {
          id: el.id,
          lat: pointLat,
          lon: pointLon,
          name,
          type,
          address: el.tags?.['addr:full'] || el.tags?.['addr:street'] || el.tags?.['addr:city'] || 'Adresse non spécifiée',
          phone: el.tags?.phone || el.tags?.['contact:phone'],
          hours: el.tags?.['opening_hours'],
          specialty: el.tags?.['speciality'] || el.tags?.['healthcare:speciality'],
          distance: Math.round(d)
        };
      }).sort((a: HealthPoint, b: HealthPoint) => (a.distance || 0) - (b.distance || 0));

      setPoints(mappedPoints);
      
      // Automatic expansion: if no results are found in the initial radius, auto-expand up to 25km.
      if (mappedPoints.length === 0 && searchRadius < 25000) {
        console.log(`[HEALTH] Aucun établissement trouvé dans un rayon de ${searchRadius}m. Élargissement automatique...`);
        setSearchRadius(prev => prev + 5000);
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Fetch medical aborted (intentional or overlapping request)');
        return; // Don't show error to user for intentional aborts
      }

      if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
        lastError = "Connexion impossible avec le serveur (Vérifiez votre connexion)";
      } else {
        lastError = error.message || "Problème de connexion aux serveurs de secours";
      }
      setFetchError(lastError);
      console.error(`Fetch error:`, error);
    } finally {
      if (abortControllerRef.current === controller) {
        setLoading(false);
      }
    }
  }, [searchRadius]);

  // Store last search coordinates and radius to avoid redundant queries but trigger on changes
  const [lastSearch, setLastSearch] = useState<{lat: number, lng: number, radius: number} | null>(null);

  useEffect(() => {
    if (effectiveLocation) {
      const moved = !lastSearch || 
        Math.abs(effectiveLocation.lat - lastSearch.lat) > 0.0002 || 
        Math.abs(effectiveLocation.lng - lastSearch.lng) > 0.0002;
      
      const radiusChanged = !lastSearch || searchRadius !== lastSearch.radius;
      const shouldFetch = moved || radiusChanged || manualRefresh > 0;

      if (shouldFetch) {
        setLastSearch({ lat: effectiveLocation.lat, lng: effectiveLocation.lng, radius: searchRadius });
        fetchNearbyMedical(effectiveLocation.lat, effectiveLocation.lng);
        if (manualRefresh > 0) setManualRefresh(0);
      }
    }
  }, [effectiveLocation, searchRadius, fetchNearbyMedical, lastSearch, manualRefresh]);

  const handleManualRefresh = () => {
    retryGeo();
    setManualRefresh(prev => prev + 1);
  };

  const openGoogleMaps = async (lat: number, lon: number, id: number) => {
    setNavigatingId(id);
    try {
      // Try to get fresh location for maximum precision as requested
      const freshLocation = await getCurrentPosition();
      const originStr = `${freshLocation.lat},${freshLocation.lng}`;
      const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}&origin=${originStr}&travelmode=driving`;
      window.open(url, '_blank');
    } catch (error) {
      console.warn("Failed to get fresh location for itinerary, using last known:", error);
      const originStr = effectiveLocation ? `${effectiveLocation.lat},${effectiveLocation.lng}` : '';
      const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}${originStr ? `&origin=${originStr}` : ''}`;
      window.open(url, '_blank');
    } finally {
      setNavigatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col space-y-2 pb-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Services Santé</h2>
            {effectiveLocation && (
              <div className="flex items-center gap-1 mt-1">
                <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", isUsingFallback ? "bg-amber-500" : "bg-green-500")} />
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  {isUsingFallback ? "Position Estimée (Secours)" : `Signal GPS: ±${Math.round(effectiveLocation.precision || 10)}m`}
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleManualRefresh}
              disabled={isLocating || loading}
              className="p-3 bg-white border border-gray-100 text-gray-500 rounded-2xl hover:text-green-600 hover:border-green-100 transition-all active:scale-95 disabled:opacity-50 shadow-sm"
              title="Actualiser la position et les données"
            >
              <Activity size={20} className={cn((isLocating || loading) && "animate-spin")} />
            </button>
            <div className="p-3 bg-green-50 text-green-600 rounded-2xl">
              <Hospital size={24} />
            </div>
          </div>
        </div>
        <p className="text-gray-500 font-medium text-sm">Pharmacies, hôpitaux et centres médicaux à proximité.</p>
      </div>

      {/* Mode Switcher */}
      {permissionState !== 'granted' && (
        <PermissionGuard 
          type="geolocation" 
          state={permissionState} 
          onRetry={retryGeo}
          variant="inline"
        />
      )}

      <div className="flex flex-col gap-4">
        <div className="flex p-1 bg-gray-100 rounded-2xl">
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-black transition-all",
              viewMode === 'list' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            )}
          >
            <List size={18} />
            LISTE
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-black transition-all",
              viewMode === 'map' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            )}
          >
            <MapIcon size={18} />
            CARTE
          </button>
        </div>

        {/* Filter Bar */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 pt-1">
          {[
            { id: 'all', label: 'TOUS', icon: Activity },
            { id: 'pharmacy', label: 'PHARMACIES', icon: Heart },
            { id: 'hospital', label: 'HÔPITAUX', icon: Hospital },
            { id: 'medical', label: 'CENTRES/MÉDECINS', icon: Building2 }
          ].map((type) => (
            <button
              key={type.id}
              onClick={() => setFilter(type.id as any)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all shrink-0",
                filter === type.id 
                  ? "bg-green-600 text-white border-green-600 shadow-lg shadow-green-100" 
                  : "bg-white text-gray-500 border-gray-100 hover:border-gray-200"
              )}
            >
              <type.icon size={14} />
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="relative min-h-[300px]">
        {isLocating || (loading && points.length === 0) ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Loader2 size={40} className="text-green-600 animate-spin" />
            <span className="text-xs font-black text-gray-400 uppercase tracking-widest animate-pulse">Recherche en cours...</span>
          </div>
        ) : fetchError && points.length === 0 ? (
          <div className="bg-white border border-red-100 rounded-[32px] p-10 text-center space-y-4 shadow-sm">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle size={32} />
            </div>
            <h3 className="text-lg font-black text-gray-900">Problème de Réseau</h3>
            <p className="text-sm text-gray-500 font-medium max-w-xs mx-auto">
              {fetchError}. Veuillez vérifier votre connexion internet ou rafraîchir la recherche.
            </p>
            <button 
              onClick={handleManualRefresh}
              className="px-6 py-4 bg-red-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-red-200 flex items-center justify-center gap-2 mx-auto"
            >
              <Activity size={16} className={cn((isLocating || loading) && "animate-spin")} />
              Rafraîchir les services
            </button>
          </div>
        ) : !effectiveLocation ? (
          <div className="bg-white border border-amber-100 rounded-[32px] p-10 text-center space-y-4 shadow-sm">
            <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto">
              <MapPin size={32} />
            </div>
            <h3 className="text-lg font-black text-gray-900">Localisation Requise</h3>
            <p className="text-sm text-gray-500 font-medium max-w-xs mx-auto">
              Veuillez autoriser l'accès à votre position pour trouver les services médicaux à proximité.
            </p>
            <button 
              onClick={handleManualRefresh}
              className="px-6 py-4 bg-gray-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2 mx-auto"
            >
              <Navigation size={16} />
              Obtenir ma position
            </button>
          </div>
        ) : points.filter(p => {
            if (filter === 'all') return true;
            if (filter === 'pharmacy') return p.type === 'pharmacy';
            if (filter === 'hospital') return p.type === 'hospital';
            if (filter === 'medical') return p.type === 'clinic' || p.type === 'doctors';
            return true;
          }).length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-[32px] p-10 text-center space-y-4 shadow-sm">
            <div className="w-16 h-16 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mx-auto">
              <Search size={32} />
            </div>
            <h3 className="text-lg font-black text-gray-900">Aucun résultat</h3>
            <p className="text-sm text-gray-500 font-medium max-w-xs mx-auto">
              Nous n'avons pas trouvé d'établissement correspondant à vos critères dans un rayon de {searchRadius / 1000}km.
            </p>
            <div className="flex flex-col gap-2">
              <button 
                onClick={() => setSearchRadius(prev => prev + 5000)}
                className="px-6 py-3 bg-gray-900 text-white rounded-full text-xs font-black uppercase tracking-widest"
              >
                Élargir la recherche
              </button>
              {filter !== 'all' && (
                <button 
                  onClick={() => setFilter('all')}
                  className="text-xs font-black text-green-600 uppercase tracking-widest"
                >
                  Voir tous les services
                </button>
              )}
            </div>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {viewMode === 'list' ? (
              <motion.div 
                key="list"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                {points.filter(p => {
                    if (filter === 'all') return true;
                    if (filter === 'pharmacy') return p.type === 'pharmacy';
                    if (filter === 'hospital') return p.type === 'hospital';
                    if (filter === 'medical') return p.type === 'clinic' || p.type === 'doctors';
                    return true;
                  }).map((point) => (
                  <motion.div
                    key={point.id}
                    layoutId={`point-${point.id}`}
                    className="bg-white border border-gray-100 rounded-[32px] p-5 shadow-sm hover:shadow-md transition-shadow group"
                  >
                    <div className="flex items-start gap-4">
                      <div className={cn(
                        "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-inner",
                        point.type === 'pharmacy' ? "bg-green-50 text-green-600" : 
                        point.type === 'hospital' ? "bg-red-50 text-red-600" :
                        point.type === 'clinic' ? "bg-blue-50 text-blue-600" : "bg-amber-50 text-amber-600"
                      )}>
                        {point.type === 'pharmacy' ? <Heart size={28} /> : 
                         point.type === 'hospital' ? <Hospital size={28} /> : 
                         point.type === 'clinic' ? <Building2 size={28} /> : <Activity size={28} />}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-black uppercase tracking-widest opacity-40">
                            {point.type === 'pharmacy' ? 'Pharmacie' : 
                             point.type === 'hospital' ? 'Hôpital' : 
                             point.type === 'clinic' ? 'Clinique' : 'Centre Médical'} • {point.distance && point.distance < 1000 ? `${point.distance}m` : `${(point.distance!/1000).toFixed(1)}km`}
                          </span>
                        </div>
                        <h4 className="text-lg font-black text-gray-900 leading-tight mb-1 truncate group-hover:text-green-600 transition-colors">
                          {point.name}
                        </h4>
                        <div className="flex items-start gap-1.5 text-gray-400 mb-1">
                          <MapPin size={12} className="shrink-0 mt-0.5" />
                          <p className="text-xs font-medium line-clamp-1">{point.address}</p>
                        </div>
                        {point.specialty && (
                          <div className="flex items-start gap-1.5 text-blue-600 mb-1">
                            <Activity size={12} className="shrink-0 mt-0.5" />
                            <p className="text-[10px] font-black uppercase tracking-tight">{point.specialty}</p>
                          </div>
                        )}
                        {point.hours && (
                          <div className="flex items-start gap-1.5 text-gray-400 mb-1">
                            <Info size={12} className="shrink-0 mt-0.5" />
                            <p className="text-[10px] font-medium leading-tight line-clamp-2">{point.hours}</p>
                          </div>
                        )}
                        {point.phone && (
                          <div className="flex items-start gap-1.5 text-green-600">
                            <Phone size={12} className="shrink-0 mt-0.5" />
                            <p className="text-xs font-black">{point.phone}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-6">
                      <button 
                        onClick={() => openGoogleMaps(point.lat, point.lon, point.id)}
                        disabled={navigatingId !== null}
                        className="flex items-center justify-center gap-2 py-3 bg-gray-50 text-gray-900 rounded-2xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all border border-gray-100 disabled:opacity-70"
                      >
                        {navigatingId === point.id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Navigation size={14} />
                        )}
                        ITINÉRAIRE
                      </button>
                      <button 
                        onClick={() => {
                          setSelectedPoint(point);
                          setViewMode('map');
                        }}
                        className="flex items-center justify-center gap-2 py-3 bg-gray-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-gray-200"
                      >
                        <MapIcon size={14} />
                        VOIR CARTE
                      </button>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div 
                key="map"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-[600px] w-full rounded-[40px] overflow-hidden border-4 border-white shadow-xl bg-gray-50"
              >
                {/* Map Controls Overlay */}
                <div className="absolute top-6 left-6 z-10 flex flex-col gap-2">
                  <button 
                    onClick={() => {
                      setSelectedPoint(null);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-md rounded-2xl border border-white shadow-lg text-[10px] font-black uppercase tracking-widest text-gray-900 group active:scale-95 transition-all"
                  >
                    <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <MapPin size={14} />
                    </div>
                    MA POSITION
                  </button>
                </div>

                {/* For simplicity we'll show the map with the first result or current location */}
                {effectiveLocation && (
                  <MapPreview 
                    centerLat={selectedPoint?.lat || effectiveLocation.lat} 
                    centerLng={selectedPoint?.lon || effectiveLocation.lng} 
                    userLat={effectiveLocation.lat}
                    userLng={effectiveLocation.lng}
                    precision={effectiveLocation.precision || 100}
                    selectedPointId={selectedPoint?.id}
                    points={points.map(p => ({
                      id: p.id,
                      lat: p.lat,
                      lng: p.lon,
                      label: p.name,
                      type: p.type
                    }))}
                  />
                )}
                
                {/* Overlay Selection Area */}
                <div className="absolute bottom-6 left-6 right-6 z-10 flex gap-2 overflow-x-auto pb-4 no-scrollbar">
                  {points.slice(0, 5).map(point => (
                    <div
                      key={point.id}
                      onClick={() => setSelectedPoint(point)}
                      className={cn(
                        "shrink-0 bg-white/90 backdrop-blur-md p-4 rounded-3xl border shadow-lg transition-all text-left w-64 cursor-pointer",
                        selectedPoint?.id === point.id ? "border-green-500 ring-2 ring-green-100" : "border-white"
                      )}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          setSelectedPoint(point);
                        }
                      }}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center",
                          point.type === 'pharmacy' ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                        )}>
                          {point.type === 'pharmacy' ? <Heart size={20} /> : <Hospital size={20} />}
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest opacity-40 leading-none mb-1">
                            {point.type === 'pharmacy' ? 'Pharmacie' : 'Hôpital'}
                          </p>
                          <h5 className="text-sm font-black text-gray-900 truncate w-32">{point.name}</h5>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                          {point.distance && point.distance < 1000 ? `${point.distance}m` : `${(point.distance!/1000).toFixed(1)}km`}
                        </span>
                        <button 
                          disabled={navigatingId !== null}
                          onClick={(e) => {
                            e.stopPropagation();
                            openGoogleMaps(point.lat, point.lon, point.id);
                          }}
                          className="p-2 bg-gray-900 text-white rounded-full translate-x-2 active:scale-90 transition-transform disabled:opacity-50"
                        >
                          {navigatingId === point.id ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Navigation size={14} />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-100 rounded-[32px] p-6 flex gap-4">
        <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-blue-600 shrink-0 shadow-sm">
          <Info size={20} />
        </div>
        <div>
          <h4 className="text-xs font-black text-blue-600 uppercase tracking-widest mb-1">Pharmacies de Garde</h4>
          <p className="text-sm text-gray-600 font-medium leading-relaxed">
            Le dimanche et les jours fériés, certaines pharmacies peuvent varier. Nous vous conseillons de téléphoner avant de vous déplacer.
          </p>
        </div>
      </div>
    </div>
  );
};
