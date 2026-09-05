import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Shield, MapPin, Mic, Bell, HardDrive, Download, ArrowRight, CheckCircle2, AlertCircle, Info, Smartphone, Lock } from 'lucide-react';
import { cn } from '../lib/utils';

interface PermissionScreenProps {
  onComplete: () => void;
}

export const PermissionScreen = ({ onComplete }: PermissionScreenProps) => {
  const [micState, setMicState] = useState<PermissionState | 'prompt' | 'unknown'>('unknown');
  const [geoState, setGeoState] = useState<PermissionState | 'prompt' | 'unknown'>('unknown');
  const [notifState, setNotifState] = useState<PermissionState | 'prompt' | 'unknown'>('unknown');
  const [storageState, setStorageState] = useState<boolean | null>(null);
  
  // PWA Install Prompt
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isPWAInstalled, setIsPWAInstalled] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);

  useEffect(() => {
    // Check if running as standalone PWA
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
    setIsPWAInstalled(isStandalone);

    // Capture PWA beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Initial permission checks
    checkPermissions();
    checkStoragePersistence();

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const checkPermissions = async () => {
    // Notifications check
    if ('Notification' in window) {
      if (Notification.permission === 'granted') setNotifState('granted');
      else if (Notification.permission === 'denied') setNotifState('denied');
      else setNotifState('prompt');
    }

    if (!navigator.permissions || !(navigator.permissions as any).query) {
      setMicState('prompt');
      setGeoState('prompt');
      return;
    }

    try {
      const mic = await navigator.permissions.query({ name: 'microphone' as any });
      setMicState(mic.state);
      mic.onchange = () => setMicState(mic.state);

      const geo = await navigator.permissions.query({ name: 'geolocation' as any });
      setGeoState(geo.state);
      geo.onchange = () => setGeoState(geo.state);
    } catch (e) {
      console.debug("Permission query notice:", e);
      setMicState('prompt');
      setGeoState('prompt');
    }
  };

  const checkStoragePersistence = async () => {
    if (navigator.storage && navigator.storage.persisted) {
      const isPersisted = await navigator.storage.persisted();
      setStorageState(isPersisted);
    }
  };

  const requestGeolocation = async () => {
    setIsRequesting(true);
    navigator.geolocation.getCurrentPosition(
      () => {
        setGeoState('granted');
        setIsRequesting(false);
      },
      (err) => {
        console.warn("Geo access denied:", err);
        setGeoState('denied');
        setIsRequesting(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const requestMicrophone = async () => {
    setIsRequesting(true);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("L'API MediaDevices n'est pas supportée. HTTPS requis.");
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(t => t.stop());
      setMicState('granted');
    } catch (err) {
      console.warn("Mic access denied:", err);
      setMicState('denied');
    } finally {
      setIsRequesting(false);
    }
  };

  const requestNotifications = async () => {
    if (!('Notification' in window)) {
      alert("Votre navigateur ne supporte pas les notifications push.");
      return;
    }
    setIsRequesting(true);
    try {
      const res = await Notification.requestPermission();
      if (res === 'granted') {
        setNotifState('granted');
      } else {
        setNotifState('denied');
      }
    } catch (e) {
      console.warn("Notification error:", e);
      setNotifState('denied');
    } finally {
      setIsRequesting(false);
    }
  };

  const requestPersistentStorage = async () => {
    if (navigator.storage && navigator.storage.persist) {
      const isPersisted = await navigator.storage.persist();
      setStorageState(isPersisted);
      if (isPersisted) {
        alert("Stockage persistant activé ! Vos données hors-ligne sont protégées.");
      }
    }
  };

  const handleInstallPWA = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsPWAInstalled(true);
      setDeferredPrompt(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] bg-[#F8FAFC] flex flex-col items-center justify-center p-4 sm:p-8 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg space-y-6 my-auto py-6"
      >
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center text-white mx-auto shadow-xl shadow-blue-200">
            <Shield size={36} />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase text-blue-600 tracking-widest bg-blue-50 px-3 py-1 rounded-full">
              Application PWA
            </span>
            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight mt-2">
              Autorisations & PWA
            </h2>
          </div>
          <p className="text-xs font-bold text-gray-500 leading-relaxed uppercase max-w-sm mx-auto">
            Ajustez les accès de votre terminal pour garantir le fonctionnement optimal d'E-Secours.
          </p>
        </div>

        {/* PWA Banner if available */}
        {deferredPrompt && !isPWAInstalled && (
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="p-5 bg-gradient-to-r from-blue-700 to-indigo-800 rounded-3xl text-white shadow-xl flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                <Smartphone size={24} />
              </div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider">Installer l'Application PWA</h4>
                <p className="text-[10px] font-bold text-blue-100 uppercase tracking-widest mt-0.5">Accès direct sur l'écran d'accueil</p>
              </div>
            </div>
            <button
              onClick={handleInstallPWA}
              className="px-4 py-2.5 bg-white text-blue-800 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-blue-50 active:scale-95 transition-all shrink-0 flex items-center gap-1.5"
            >
              <Download size={14} />
              Installer
            </button>
          </motion.div>
        )}

        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm space-y-3">
          <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
            <Info size={14} />
            Pourquoi ces accès sont importants ?
          </h4>
          <p className="text-[10px] font-bold text-gray-500 uppercase leading-relaxed tracking-tight">
            En tant qu'application de sécurité d'urgence, E-Secours utilise la localisation GPS haute précision, la capture d'incidents audio et les notifications push d'urgence.
          </p>
        </div>

        {/* Permissions Grid */}
        <div className="space-y-3">
          {/* Geolocation Card */}
          <div className={cn(
            "p-4 rounded-2xl border transition-all duration-300",
            geoState === 'granted' ? "bg-green-50/60 border-green-200" : 
            geoState === 'denied' ? "bg-red-50/60 border-red-200" : "bg-white border-gray-100 shadow-sm"
          )}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                  geoState === 'granted' ? "bg-green-100 text-green-700" : 
                  geoState === 'denied' ? "bg-red-100 text-red-700" : "bg-blue-50 text-blue-600"
                )}>
                  <MapPin size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider">Localisation GPS</h4>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Localisation automatique des secours</p>
                </div>
              </div>
              
              {geoState === 'granted' ? (
                <CheckCircle2 className="text-green-600 shrink-0" size={22} />
              ) : geoState === 'denied' ? (
                <AlertCircle className="text-red-600 shrink-0" size={22} />
              ) : (
                <button 
                  onClick={requestGeolocation}
                  disabled={isRequesting}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-md active:scale-95 transition-all shrink-0"
                >
                  Autoriser
                </button>
              )}
            </div>
          </div>

          {/* Microphone Card */}
          <div className={cn(
            "p-4 rounded-2xl border transition-all duration-300",
            micState === 'granted' ? "bg-green-50/60 border-green-200" : 
            micState === 'denied' ? "bg-red-50/60 border-red-200" : "bg-white border-gray-100 shadow-sm"
          )}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                  micState === 'granted' ? "bg-green-100 text-green-700" : 
                  micState === 'denied' ? "bg-red-100 text-red-700" : "bg-blue-50 text-blue-600"
                )}>
                  <Mic size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider">Microphone</h4>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Assistant vocal & Témoignages</p>
                </div>
              </div>
              
              {micState === 'granted' ? (
                <CheckCircle2 className="text-green-600 shrink-0" size={22} />
              ) : micState === 'denied' ? (
                <AlertCircle className="text-red-600 shrink-0" size={22} />
              ) : (
                <button 
                  onClick={requestMicrophone}
                  disabled={isRequesting}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-md active:scale-95 transition-all shrink-0"
                >
                  Autoriser
                </button>
              )}
            </div>
          </div>

          {/* Notifications Card */}
          <div className={cn(
            "p-4 rounded-2xl border transition-all duration-300",
            notifState === 'granted' ? "bg-green-50/60 border-green-200" : 
            notifState === 'denied' ? "bg-red-50/60 border-red-200" : "bg-white border-gray-100 shadow-sm"
          )}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                  notifState === 'granted' ? "bg-green-100 text-green-700" : 
                  notifState === 'denied' ? "bg-red-100 text-red-700" : "bg-blue-50 text-blue-600"
                )}>
                  <Bell size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider">Notifications Push</h4>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Suivi d'intervention & Alertes</p>
                </div>
              </div>
              
              {notifState === 'granted' ? (
                <CheckCircle2 className="text-green-600 shrink-0" size={22} />
              ) : notifState === 'denied' ? (
                <AlertCircle className="text-red-600 shrink-0" size={22} />
              ) : (
                <button 
                  onClick={requestNotifications}
                  disabled={isRequesting}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-md active:scale-95 transition-all shrink-0"
                >
                  Autoriser
                </button>
              )}
            </div>
          </div>

          {/* Storage Persistence */}
          <div className={cn(
            "p-4 rounded-2xl border transition-all duration-300",
            storageState === true ? "bg-green-50/60 border-green-200" : "bg-white border-gray-100 shadow-sm"
          )}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                  storageState === true ? "bg-green-100 text-green-700" : "bg-blue-50 text-blue-600"
                )}>
                  <HardDrive size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider">Stockage Persistant PWA</h4>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Protection de la mémoire hors-ligne</p>
                </div>
              </div>
              
              {storageState === true ? (
                <CheckCircle2 className="text-green-600 shrink-0" size={22} />
              ) : (
                <button 
                  onClick={requestPersistentStorage}
                  className="px-3 py-1.5 bg-gray-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-md active:scale-95 transition-all shrink-0"
                >
                  Activer
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="pt-2 space-y-3">
          <button 
            onClick={onComplete}
            className="w-full py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-xs transition-all flex items-center justify-center gap-3 bg-blue-600 text-white shadow-xl shadow-blue-200 hover:bg-blue-700 active:scale-[0.98]"
          >
            Continuer vers E-Secours
            <ArrowRight size={18} />
          </button>
          
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest flex items-center justify-center gap-2 text-center">
            <Lock size={12} />
            Vos données personnelles et autorisations restent strictement confidentielles
          </p>
        </div>
      </motion.div>
    </div>
  );
};

