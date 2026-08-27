import React, { useState, useEffect, useRef } from 'react';
import { User, Volume2, VolumeX, Save, ShieldAlert, HeartPulse, Phone, Smartphone, MapPin, Mic, Camera, Bell, HardDrive, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { cn } from '../lib/utils';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export const Tools = () => {
  const [isSirenPlaying, setIsSirenPlaying] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const vibrationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // My Info State
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [medicalInfo, setMedicalInfo] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success'>('idle');
  const [showConfirm, setShowConfirm] = useState(false);

  // PWA & Permissions State
  const [geoState, setGeoState] = useState<string>('unknown');
  const [micState, setMicState] = useState<string>('unknown');
  const [camState, setCamState] = useState<string>('unknown');
  const [notifState, setNotifState] = useState<string>('unknown');
  const [storagePersisted, setStoragePersisted] = useState<boolean | null>(null);
  const [isPWA, setIsPWA] = useState<boolean>(false);

  useEffect(() => {
    // Check PWA mode
    const standalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
    setIsPWA(standalone);

    // Permissions check
    checkPlatformPermissions();
  }, []);

  const checkPlatformPermissions = async () => {
    if ('Notification' in window) {
      setNotifState(Notification.permission);
    }
    if (navigator.storage && navigator.storage.persisted) {
      const persisted = await navigator.storage.persisted();
      setStoragePersisted(persisted);
    }

    if (navigator.permissions && (navigator.permissions as any).query) {
      try {
        const geo = await navigator.permissions.query({ name: 'geolocation' as any });
        setGeoState(geo.state);
        geo.onchange = () => setGeoState(geo.state);

        const mic = await navigator.permissions.query({ name: 'microphone' as any });
        setMicState(mic.state);
        mic.onchange = () => setMicState(mic.state);

        const cam = await navigator.permissions.query({ name: 'camera' as any });
        setCamState(cam.state);
        cam.onchange = () => setCamState(cam.state);
      } catch (e) {
        console.debug("Permission check:", e);
      }
    }
  };

  const requestPermission = async (type: 'geo' | 'mic' | 'cam' | 'notif' | 'storage') => {
    if (type === 'geo') {
      navigator.geolocation.getCurrentPosition(
        () => setGeoState('granted'),
        () => setGeoState('denied')
      );
    } else if (type === 'mic') {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(t => t.stop());
        setMicState('granted');
      } catch (e) { setMicState('denied'); }
    } else if (type === 'cam') {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach(t => t.stop());
        setCamState('granted');
      } catch (e) { setCamState('denied'); }
    } else if (type === 'notif') {
      if ('Notification' in window) {
        const res = await Notification.requestPermission();
        setNotifState(res);
      }
    } else if (type === 'storage') {
      if (navigator.storage && navigator.storage.persist) {
        const persisted = await navigator.storage.persist();
        setStoragePersisted(persisted);
      }
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      // First check local storage fallback
      const localData = localStorage.getItem('e_secours_local_medical_info');
      if (localData) {
        try {
          const parsed = JSON.parse(localData);
          setFullName(parsed.fullName || '');
          setPhoneNumber(parsed.phoneNumber || '');
          setAddress(parsed.address || '');
          setMedicalInfo(parsed.medicalInfo || '');
          setEmergencyContact(parsed.emergencyContact || '');
        } catch (e) {}
      }

      if (auth.currentUser) {
        setLoading(true);
        try {
          const docRef = doc(db, 'users', auth.currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setFullName(data.fullName || '');
            setPhoneNumber(data.phoneNumber || '');
            setAddress(data.address || '');
            setMedicalInfo(data.medicalInfo || '');
            setEmergencyContact(data.emergencyContact || '');
          }
        } catch (e) {
          console.debug("Tools fetch user info error:", e);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchProfile();
  }, []);

  const handleSaveInfo = async () => {
    setShowConfirm(true);
  };

  const executeSave = async () => {
    setShowConfirm(false);
    setSaveStatus('saving');

    // Save locally always
    try {
      localStorage.setItem('e_secours_local_medical_info', JSON.stringify({
        fullName,
        phoneNumber,
        address,
        medicalInfo,
        emergencyContact,
        updatedAt: new Date().toISOString()
      }));
    } catch (e) {}

    // Save to firestore if logged in
    if (auth.currentUser) {
      try {
        await setDoc(doc(db, 'users', auth.currentUser.uid), {
          fullName,
          phoneNumber,
          address,
          medicalInfo,
          emergencyContact,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      } catch (e) {
        console.error(e);
      }
    }

    setSaveStatus('success');
    setTimeout(() => setSaveStatus('idle'), 3000);
  };

  const toggleSiren = () => {
    if (isSirenPlaying) {
      stopSiren();
    } else {
      startSiren();
    }
  };

  const startSiren = async () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    const ctx = audioContextRef.current;
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    const mainGain = ctx.createGain();
    const compressor = ctx.createDynamicsCompressor();
    
    // Compressor to make it louder/thicker
    compressor.threshold.setValueAtTime(-24, ctx.currentTime);
    compressor.knee.setValueAtTime(40, ctx.currentTime);
    compressor.ratio.setValueAtTime(12, ctx.currentTime);
    compressor.attack.setValueAtTime(0, ctx.currentTime);
    compressor.release.setValueAtTime(0.25, ctx.currentTime);

    mainGain.gain.setValueAtTime(0, ctx.currentTime);
    mainGain.gain.linearRampToValueAtTime(1.0, ctx.currentTime + 0.1); 

    // Create 3 oscillators for a "thick" piercing sound
    const oscillators: OscillatorNode[] = [];
    const frequencies = [440, 444, 436]; // Slightly detuned for "chorus" effect
    
    frequencies.forEach(freq => {
      const osc = ctx.createOscillator();
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.connect(mainGain);
      oscillators.push(osc);
    });

    // Siren effect: wavering frequency sweep
    const sweep = () => {
      if (!oscillatorRef.current) return;
      
      oscillators.forEach((osc, i) => {
        const baseFreq = frequencies[i];
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 2, ctx.currentTime + 0.4);
        osc.frequency.exponentialRampToValueAtTime(baseFreq, ctx.currentTime + 0.8);
      });
    };

    // Initial sweep
    sweep();

    // Re-trigger sweep every 0.8s
    const sirenInterval = setInterval(sweep, 800);

    mainGain.connect(compressor);
    compressor.connect(ctx.destination);
    
    oscillators.forEach(osc => osc.start());

    // Vibration pattern to accompany sound
    if ('vibrate' in navigator) {
      navigator.vibrate([500, 200, 500, 200]);
      vibrationIntervalRef.current = setInterval(() => {
        if (!oscillatorRef.current) {
          if (vibrationIntervalRef.current) clearInterval(vibrationIntervalRef.current);
          return;
        }
        navigator.vibrate([500, 200]);
      }, 700);
    }

    oscillatorRef.current = oscillators[0]; // Just store the first one to track state
    gainNodeRef.current = mainGain;
    (oscillatorRef as any).current._allOscillators = oscillators; // Store all to stop them later
    (oscillatorRef as any).current._sirenInterval = sirenInterval;
    setIsSirenPlaying(true);
  };

  const stopSiren = () => {
    if (oscillatorRef.current) {
      const allOscs = (oscillatorRef as any).current._allOscillators as OscillatorNode[];
      const interval = (oscillatorRef as any).current._sirenInterval;
      
      if (allOscs) {
        allOscs.forEach(o => {
          try {
            o.stop();
            o.disconnect();
          } catch(e) {}
        });
      }
      if (interval) clearInterval(interval);
      
      oscillatorRef.current = null;
    }
    if (vibrationIntervalRef.current) {
      clearInterval(vibrationIntervalRef.current);
      vibrationIntervalRef.current = null;
    }
    if ('vibrate' in navigator) {
      navigator.vibrate(0);
    }
    setIsSirenPlaying(false);
  };

  return (
    <div className="space-y-8">
      <div className="px-2">
        <h2 className="text-2xl font-black text-gray-900 mb-1">Outils d'Aide</h2>
        <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">Pour faciliter votre repérage</p>
      </div>

      {/* Acoustic Signal Section */}
      <div className={cn(
        "rounded-[40px] p-8 text-white relative overflow-hidden shadow-2xl transition-all duration-500",
        isSirenPlaying ? "bg-red-600 scale-105" : "bg-[#151921]"
      )}>
        {isSirenPlaying && (
          <div className="absolute inset-0 bg-white/20 animate-pulse pointer-events-none" />
        )}
        
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className={cn(
            "w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500 mb-6",
            isSirenPlaying ? "bg-white text-red-600 shadow-[0_0_80px_rgba(255,255,255,0.6)]" : "bg-gray-800 text-blue-500"
          )}>
            {isSirenPlaying ? <Volume2 size={48} className="animate-bounce" /> : <VolumeX size={48} />}
          </div>
          
          <h3 className="text-xl font-black uppercase tracking-tighter mb-2">Signal Sonore</h3>
          <p className="text-xs text-gray-400 font-bold mb-8 uppercase tracking-widest">
            {isSirenPlaying ? 'SIGNAL EN COURS - SON MAXIMUM' : 'Sert à être repéré par les secours'}
          </p>
          
          <button 
            onClick={toggleSiren}
            className={cn(
              "px-10 py-4 rounded-full font-black text-sm uppercase transition-all active:scale-95 shadow-xl",
              isSirenPlaying ? "bg-white text-red-600" : "bg-blue-600 text-white"
            )}
          >
            {isSirenPlaying ? 'Arrêter le signal' : 'Activer le signal sonore'}
          </button>
        </div>
      </div>

      {/* My Info Card */}
      <section className="bg-white border border-gray-100 rounded-[40px] p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
            <User size={20} />
          </div>
          <h3 className="text-xl font-black text-gray-900">Ma Fiche Info</h3>
        </div>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">
                Nom et Prénom
              </div>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ex: Jean Dupont"
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm font-medium outline-none focus:border-blue-600 transition-all"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">
                Téléphone
              </div>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Ex: 06 12 34 56 78"
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm font-medium outline-none focus:border-blue-600 transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">
              Adresse de Résidence
            </div>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Ex: 15 Rue de la Paix, 75002 Paris"
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm font-medium outline-none focus:border-blue-600 transition-all"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">
              <HeartPulse size={12} />
              Informations Médicales
            </div>
            <textarea
              value={medicalInfo}
              onChange={(e) => setMedicalInfo(e.target.value)}
              placeholder="Allergies, traitement en cours, groupe sanguin..."
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm font-medium outline-none focus:border-blue-600 transition-all min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">
              <Phone size={12} />
              Contact d'Urgence
            </div>
            <input
              type="text"
              value={emergencyContact}
              onChange={(e) => setEmergencyContact(e.target.value)}
              placeholder="Nom et numéro du proche"
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm font-medium outline-none focus:border-blue-600 transition-all"
            />
          </div>

          <button
            onClick={handleSaveInfo}
            disabled={saveStatus === 'saving'}
            className={cn(
              "w-full py-4 rounded-2xl font-black text-sm uppercase transition-all flex items-center justify-center gap-2",
              saveStatus === 'success' ? "bg-green-500 text-white" : "bg-gray-900 text-white hover:bg-black"
            )}
          >
            {saveStatus === 'saving' ? "Enregistrement..." : 
             saveStatus === 'success' ? "Informations Enregistrées !" : 
             <><Save size={18} /> Enregistrer ma fiche</>}
          </button>
        </div>
        
        <div className="mt-8 p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-3">
          <ShieldAlert size={20} className="text-amber-600 shrink-0" />
          <p className="text-[10px] text-amber-800 font-bold leading-relaxed uppercase tracking-wide">
            Ces informations seront transmises automatiquement lors d'un SOS pour aider les secours à mieux vous prendre en charge.
          </p>
        </div>
      </section>

      {/* PWA & Platform Permissions Section */}
      <section className="bg-white border border-gray-100 rounded-[40px] p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
              <Smartphone size={20} />
            </div>
            <div>
              <h3 className="text-xl font-black text-gray-900">Application PWA & Accès</h3>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                {isPWA ? "Mode Application Indépendante (PWA)" : "Mode Navigateur Web"}
              </p>
            </div>
          </div>
          <button 
            onClick={checkPlatformPermissions}
            className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
            title="Rafraîchir les statuts"
          >
            <RefreshCw size={16} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* GPS */}
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MapPin size={18} className={geoState === 'granted' ? "text-green-600" : "text-gray-400"} />
              <div>
                <p className="text-xs font-black text-gray-800 uppercase">Localisation GPS</p>
                <p className="text-[9px] font-bold text-gray-400 uppercase">{geoState === 'granted' ? 'Autorisé' : geoState === 'denied' ? 'Refusé' : 'À configurer'}</p>
              </div>
            </div>
            {geoState === 'granted' ? (
              <CheckCircle2 size={18} className="text-green-600" />
            ) : (
              <button onClick={() => requestPermission('geo')} className="px-3 py-1 bg-blue-600 text-white rounded-lg text-[9px] font-black uppercase">Activer</button>
            )}
          </div>

          {/* Micro */}
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mic size={18} className={micState === 'granted' ? "text-green-600" : "text-gray-400"} />
              <div>
                <p className="text-xs font-black text-gray-800 uppercase">Microphone</p>
                <p className="text-[9px] font-bold text-gray-400 uppercase">{micState === 'granted' ? 'Autorisé' : micState === 'denied' ? 'Refusé' : 'À configurer'}</p>
              </div>
            </div>
            {micState === 'granted' ? (
              <CheckCircle2 size={18} className="text-green-600" />
            ) : (
              <button onClick={() => requestPermission('mic')} className="px-3 py-1 bg-blue-600 text-white rounded-lg text-[9px] font-black uppercase">Activer</button>
            )}
          </div>

          {/* Camera */}
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Camera size={18} className={camState === 'granted' ? "text-green-600" : "text-gray-400"} />
              <div>
                <p className="text-xs font-black text-gray-800 uppercase">Caméra</p>
                <p className="text-[9px] font-bold text-gray-400 uppercase">{camState === 'granted' ? 'Autorisé' : camState === 'denied' ? 'Refusé' : 'À configurer'}</p>
              </div>
            </div>
            {camState === 'granted' ? (
              <CheckCircle2 size={18} className="text-green-600" />
            ) : (
              <button onClick={() => requestPermission('cam')} className="px-3 py-1 bg-blue-600 text-white rounded-lg text-[9px] font-black uppercase">Activer</button>
            )}
          </div>

          {/* Notifications */}
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell size={18} className={notifState === 'granted' ? "text-green-600" : "text-gray-400"} />
              <div>
                <p className="text-xs font-black text-gray-800 uppercase">Notifications Push</p>
                <p className="text-[9px] font-bold text-gray-400 uppercase">{notifState === 'granted' ? 'Autorisé' : notifState === 'denied' ? 'Refusé' : 'À configurer'}</p>
              </div>
            </div>
            {notifState === 'granted' ? (
              <CheckCircle2 size={18} className="text-green-600" />
            ) : (
              <button onClick={() => requestPermission('notif')} className="px-3 py-1 bg-blue-600 text-white rounded-lg text-[9px] font-black uppercase">Activer</button>
            )}
          </div>

          {/* Stockage */}
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between md:col-span-2">
            <div className="flex items-center gap-3">
              <HardDrive size={18} className={storagePersisted ? "text-green-600" : "text-gray-400"} />
              <div>
                <p className="text-xs font-black text-gray-800 uppercase">Stockage Persistant PWA</p>
                <p className="text-[9px] font-bold text-gray-400 uppercase">{storagePersisted ? 'Stockage protégé contre la suppression' : 'Stockage temporaire'}</p>
              </div>
            </div>
            {storagePersisted ? (
              <CheckCircle2 size={18} className="text-green-600" />
            ) : (
              <button onClick={() => requestPermission('storage')} className="px-3 py-1 bg-gray-900 text-white rounded-lg text-[9px] font-black uppercase">Sécuriser</button>
            )}
          </div>
        </div>
      </section>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            onClick={() => setShowConfirm(false)}
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
          />
          <div className="relative w-full max-w-sm bg-white rounded-[32px] shadow-2xl p-8 border border-gray-100 overflow-hidden">
            <div className="flex flex-col items-center text-center gap-6">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                <Save size={32} />
              </div>
              <div>
                <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight mb-2">Enregistrer les modifications ?</h3>
                <p className="text-xs font-medium text-gray-500 leading-relaxed uppercase">
                  Vos informations médicales et de contact seront mises à jour et enregistrées de manière sécurisée.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 w-full">
                <button 
                  onClick={() => setShowConfirm(false)}
                  className="py-4 rounded-2xl bg-gray-100 text-gray-500 text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 transition-all"
                >
                  Annuler
                </button>
                <button 
                  onClick={executeSave}
                  className="py-4 rounded-2xl bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all"
                >
                  Confirmer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
