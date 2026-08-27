import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, X, ChevronRight, Mic, Play, Pause, Trash2, Send, CheckCircle, AlertTriangle, Flame, UserX, HeartPulse, MoreHorizontal, Target, ShieldOff, HelpCircle, Waves, Mountain, RotateCw, Phone, Volume2, BellRing, VolumeX, Shield, ShieldAlert, HeartHandshake } from 'lucide-react';
import { Howl } from 'howler';
import { useGeolocation } from '../hooks/useGeolocation';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { IncidentType, LocationData, Incident, getTargetOperatorType } from '../types';
import { cn } from '../lib/utils';
import { db, auth, signInWithGoogle } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, doc, getDoc, onSnapshot, updateDoc, setDoc } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/firebase-errors';
import { MapPreview } from './MapPreview';
import { PermissionGuard } from './PermissionGuard';

interface SOSFlowProps {
  onClose: () => void;
  isOffline?: boolean;
  initialType?: IncidentType;
}

type Step = 'confirm' | 'locating' | 'category' | 'details' | 'voice_confirm' | 'submitting' | 'success' | 'success_offline' | 'login_required';

const CATEGORIES: { type: IncidentType, label: string, icon: React.ElementType, color: string }[] = [
  { type: 'medical', label: 'Médical', icon: HeartPulse, color: 'bg-red-50 text-red-600 border-red-100' },
  { type: 'vbg', label: 'Violences Basées sur le Genre (VBG)', icon: ShieldAlert, color: 'bg-purple-50 text-purple-700 border-purple-200' },
  { type: 'agression_sexuelle', label: 'Agression Sexuelle', icon: Shield, color: 'bg-rose-50 text-rose-700 border-rose-200' },
  { type: 'incendie', label: 'Incendie', icon: Flame, color: 'bg-orange-50 text-orange-600 border-orange-100' },
  { type: 'accident', label: 'Accident', icon: AlertTriangle, color: 'bg-blue-50 text-blue-600 border-blue-100' },
  { type: 'agression', label: 'Agression / Violence Physique', icon: UserX, color: 'bg-indigo-50 text-indigo-600 border-indigo-100' },
  { type: 'vol', label: 'Vol', icon: ShieldOff, color: 'bg-gray-50 text-gray-600 border-gray-100' },
  { type: 'perte', label: 'Perte', icon: HelpCircle, color: 'bg-amber-50 text-amber-600 border-amber-100' },
  { type: 'inondation', label: 'Inondation', icon: Waves, color: 'bg-cyan-50 text-cyan-600 border-cyan-100' },
  { type: 'seisme', label: 'Séisme', icon: Mountain, color: 'bg-stone-50 text-stone-600 border-stone-100' },
  { type: 'autre', label: 'Autre', icon: MoreHorizontal, color: 'bg-gray-50 text-gray-400 border-gray-200' },
];

export const SOSFlow = ({ onClose, isOffline, initialType }: SOSFlowProps) => {
  const [step, setStep] = useState<Step>('confirm');
  const [selectedCategory, setSelectedCategory] = useState<IncidentType | null>(initialType || null);
  const [description, setDescription] = useState('');
  const [manualAddress, setManualAddress] = useState<string | null>(null);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [incidentId, setIncidentId] = useState<string | null>(null);
  const [currentIncident, setCurrentIncident] = useState<Incident | null>(null);
  const { location, setLocation, error: geoError, isLocating, retry: retryGeo, permissionState: geoPermissionState } = useGeolocation({ enabled: step !== 'confirm' });
  const { isRecording, audioBlob, mimeType, duration, startRecording, stopRecording, clearRecording, error: audioError, permissionState: micPermissionState } = useAudioRecorder();
  const [isPlaying, setIsPlaying] = useState(false);
  const howlRef = React.useRef<Howl | null>(null);

  const [isSilentMode, setIsSilentMode] = useState(true);

  // Voice confirmation states
  const [isListeningConfirm, setIsListeningConfirm] = useState(false);
  const [confirmTranscript, setConfirmTranscript] = useState('');
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const voiceRecognitionRef = React.useRef<any>(null);

  // Auto-advance if location precision is good AND address is identified
  useEffect(() => {
    const hasRealAddress = location?.address && 
                           !location.address.includes('Recherche') && 
                           !location.address.includes('Précision');

    if (step === 'locating' && location && !isEditingAddress) {
      // Require extreme precision before auto-advancing
      if (location.precision <= 20 || (location.precision <= 30 && hasRealAddress)) {
        if (initialType) {
          setStep('details');
        } else {
          setStep('category');
        }
        
        // Activer automatiquement le mode silencieux pour la suite
        setIsSilentMode(true);
        
        // Feedback sonore léger seulement si autorisé
        if (!isSilentMode) {
          const utterance = new SpeechSynthesisUtterance("Localisation confirmée.");
          utterance.lang = 'fr-FR';
          utterance.volume = 0.3;
          window.speechSynthesis.speak(utterance);
        }
      }
    }
  }, [step, location, initialType, isEditingAddress, isSilentMode]);

  // Signal Sonore (Siren) Logic
  const [isSignalActive, setIsSignalActive] = useState(false);
  const audioCtxRef = React.useRef<AudioContext | null>(null);
  const oscRef = React.useRef<OscillatorNode | null>(null);
  const lfoRef = React.useRef<OscillatorNode | null>(null);

  // Warm up AudioContext on user interaction
  useEffect(() => {
    const warmup = () => {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume().catch(console.error);
      }
    };
    window.addEventListener('click', warmup, { once: false });
    window.addEventListener('touchstart', warmup, { once: false });
    return () => {
      window.removeEventListener('click', warmup);
      window.removeEventListener('touchstart', warmup);
    };
  }, []);

  const startSiren = () => {
    if (isSignalActive) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      const gain = ctx.createGain();

      osc.type = 'square';
      lfo.type = 'sine';
      lfo.frequency.value = 1.5;
      lfoGain.gain.value = 300;

      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      
      osc.frequency.value = 500;
      
      gain.gain.value = 1.0;
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      lfo.start();
      
      oscRef.current = osc;
      lfoRef.current = lfo;
      setIsSignalActive(true);
      
      if ('vibrate' in navigator) {
        navigator.vibrate([1000, 500, 1000, 500, 1000]);
      }
    } catch (err) {
      console.error("Audio Context Error:", err);
    }
  };

  const stopSiren = () => {
    if (!isSignalActive) return;
    if (oscRef.current) {
      oscRef.current.stop();
      oscRef.current.disconnect();
      oscRef.current = null;
    }
    if (lfoRef.current) {
      lfoRef.current.stop();
      lfoRef.current.disconnect();
      lfoRef.current = null;
    }
    setIsSignalActive(false);
    if ('vibrate' in navigator) navigator.vibrate(0);
  };

  const toggleSignalSonore = async () => {
    const newState = !isSignalActive;
    if (newState) startSiren();
    else stopSiren();

    // Sync with DB if incident exists
    if (incidentId) {
      try {
        await updateDoc(doc(db, 'incidents', incidentId), {
          isSignalRequested: newState,
          updatedAt: serverTimestamp()
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `incidents/${incidentId}`);
      }
    }
  };

  useEffect(() => {
    if (currentIncident && currentIncident.isSignalRequested !== undefined) {
      if (currentIncident.isSignalRequested && !isSignalActive) {
        startSiren();
      } else if (!currentIncident.isSignalRequested && isSignalActive) {
        stopSiren();
      }
    }
  }, [currentIncident?.isSignalRequested, isSignalActive]);

  useEffect(() => {
    return () => {
      oscRef.current?.stop();
      lfoRef.current?.stop();
      audioCtxRef.current?.close();
    };
  }, []);

  // Audio Playback logic
  const togglePlayback = () => {
    if (!audioBlob) return;
    
    if (isPlaying && howlRef.current) {
      howlRef.current.pause();
      return;
    }

    if (!howlRef.current) {
      const url = URL.createObjectURL(audioBlob);
      // Try to determine format from mimeType
      let format = 'webm';
      if (mimeType.includes('mp4')) format = 'mp4';
      else if (mimeType.includes('ogg')) format = 'ogg';
      else if (mimeType.includes('wav')) format = 'wav';
      else if (mimeType.includes('aac')) format = 'aac';

      const sound = new Howl({
        src: [url],
        format: [format],
        html5: true,
        onplay: () => setIsPlaying(true),
        onpause: () => setIsPlaying(false),
        onend: () => setIsPlaying(false),
        onstop: () => setIsPlaying(false),
        onloaderror: () => setIsPlaying(false),
        onplayerror: () => setIsPlaying(false)
      });
      howlRef.current = sound;
    }

    howlRef.current.play();
  };

  useEffect(() => {
    return () => {
      howlRef.current?.unload();
    };
  }, []);

  // Clear audio instance when blob is cleared
  useEffect(() => {
    if (!audioBlob && howlRef.current) {
      howlRef.current.unload();
      howlRef.current = null;
    }
  }, [audioBlob]);

  // Automatic Voice Confirmation
  useEffect(() => {
    if ((step === 'success' || step === 'success_offline') && !isSilentMode) {
      const message = step === 'success' 
        ? "Votre alerte a bien été envoyée aux secours. Restez calme, l'aide arrive."
        : "Vous êtes hors ligne. Votre alerte a été enregistrée et sera envoyée dès le retour de la connexion.";
      
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.lang = 'fr-FR';
      window.speechSynthesis.speak(utterance);
    }
  }, [step, isSilentMode]);

  // Medical info for the report
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (auth.currentUser) {
        const docRef = doc(db, 'users', auth.currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserProfile(docSnap.data());
        }
      }
    };
    fetchProfile();
  }, [step]); // Refetch when step changes or user logs in

  // Update manual address when location changes initially
  useEffect(() => {
    if (location?.address && !manualAddress && !isEditingAddress) {
      setManualAddress(location.address);
    }
  }, [location?.address]);

  const [holdProgress, setHoldProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [includeMedicalInfo, setIncludeMedicalInfo] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [draftId] = useState(() => crypto.randomUUID());
  const HOLD_DURATION = 3000; // 3 seconds
  const holdIntervalRef = React.useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isHolding && step === 'details') {
      holdIntervalRef.current = setInterval(() => {
        setHoldProgress((prev) => {
          const next = prev + (100 / (HOLD_DURATION / 50)); 
          if (next >= 100) {
            if (holdIntervalRef.current) {
              clearInterval(holdIntervalRef.current);
              holdIntervalRef.current = null;
            }
            setStep('voice_confirm');
            setIsHolding(false);
            return 100;
          }
          return next;
        });
      }, 50);
    } else {
      if (holdIntervalRef.current) {
        clearInterval(holdIntervalRef.current);
        holdIntervalRef.current = null;
      }
      setHoldProgress(0);
    }
    return () => {
      if (holdIntervalRef.current) {
        clearInterval(holdIntervalRef.current);
        holdIntervalRef.current = null;
      }
    };
  }, [isHolding, step]);

  const handleSubmit = async () => {
    if (isSubmitting || !location || !selectedCategory) return;
    if (step === 'success' || step === 'success_offline' || step === 'submitting') return;

    if (!auth.currentUser) {
      setStep('login_required');
      return;
    }

    setIsSubmitting(true);
    setStep('submitting');
    
    const getBase64 = (blob: Blob): Promise<string> => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
    };

    let audioData = null;
    if (audioBlob) {
      audioData = await getBase64(audioBlob);
    }

    const incidentData: any = {
      id: draftId,
      userId: auth.currentUser.uid,
      userName: auth.currentUser.displayName,
      userEmail: auth.currentUser.email,
      type: selectedCategory,
      targetOperatorType: getTargetOperatorType(selectedCategory),
      description,
      audioUrl: audioData,
      audioMimeType: audioBlob ? mimeType : null,
      location: {
        lat: location.lat,
        lng: location.lng,
        precision: location.precision,
        address: manualAddress || location.address
      },
      medicalInfo: includeMedicalInfo ? (userProfile?.medicalInfo || null) : null,
      age: includeMedicalInfo ? (userProfile?.age || null) : null,
      sex: includeMedicalInfo ? (userProfile?.sex || null) : null,
      weight: includeMedicalInfo ? (userProfile?.weight || null) : null,
      bloodType: includeMedicalInfo ? (userProfile?.bloodType || null) : null,
      allergies: includeMedicalInfo ? (userProfile?.allergies || null) : null,
      medications: includeMedicalInfo ? (userProfile?.medications || null) : null,
      emergencyContact: includeMedicalInfo ? (userProfile?.emergencyContact || null) : null,
      userFullName: includeMedicalInfo ? (userProfile?.fullName || userProfile?.displayName || null) : null,
      userPhone: includeMedicalInfo ? (userProfile?.phoneNumber || null) : null,
      userAddress: includeMedicalInfo ? (userProfile?.address || null) : null,
    };

    if (isOffline) {
      setTimeout(() => {
        localStorage.setItem('pending_sos', JSON.stringify({
          ...incidentData,
          offlineTimestamp: new Date().toISOString()
        }));
        setStep('success_offline');
      }, 1500);
      return;
    }

    try {
      await setDoc(doc(db, 'incidents', draftId), {
        ...incidentData,
        status: 'pending',
        isSignalRequested: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      localStorage.removeItem('pending_sos');
      setIncidentId(draftId);
      setStep('success');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'incidents');
      setStep('details'); // Allow retry
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitRef = React.useRef(handleSubmit);
  useEffect(() => {
    handleSubmitRef.current = handleSubmit;
  }, [handleSubmit]);

  useEffect(() => {
    if (step !== 'voice_confirm') {
      if (voiceRecognitionRef.current) {
        try {
          voiceRecognitionRef.current.stop();
        } catch (e) {}
        voiceRecognitionRef.current = null;
      }
      setIsListeningConfirm(false);
      setConfirmTranscript('');
      setConfirmError(null);
      return;
    }

    // 1. Ask for voice confirmation
    const speakText = "Alerte S.O.S en attente de confirmation. Dites « CONFIRMER » pour envoyer les secours, ou « ANNULER » pour arrêter.";
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(speakText);
      utterance.lang = 'fr-FR';
      window.speechSynthesis.speak(utterance);
    }

    // 2. Setup recognition
    const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionClass) {
      setConfirmError("La reconnaissance vocale n'est pas prise en charge sur ce navigateur.");
      return;
    }

    const rec = new SpeechRecognitionClass();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'fr-FR';

    rec.onstart = () => {
      setIsListeningConfirm(true);
      setConfirmError(null);
    };

    rec.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      const text = (finalTranscript || interimTranscript).toLowerCase().trim();
      setConfirmTranscript(finalTranscript || interimTranscript);

      if (text.includes('confirmer') || text.includes('confirme') || text.includes('oui') || text.includes('valider') || text.includes('envoyer')) {
        rec.stop();
        handleSubmitRef.current();
      } else if (text.includes('annuler') || text.includes('non') || text.includes('retour') || text.includes('arrêter') || text.includes('stop')) {
        rec.stop();
        setStep('details');
      }
    };

    rec.onerror = (event: any) => {
      console.warn("Recognition error during voice confirmation:", event.error);
      if (event.error === 'not-allowed') {
        setConfirmError("L'accès au micro a été refusé. Veuillez utiliser le bouton si nécessaire.");
      } else if (event.error === 'network') {
        setConfirmError("Erreur réseau de reconnaissance vocale.");
      } else {
        setConfirmError(`Erreur: ${event.error}`);
      }
      setIsListeningConfirm(false);
    };

    rec.onend = () => {
      setIsListeningConfirm(false);
    };

    voiceRecognitionRef.current = rec;

    const startTimeout = setTimeout(() => {
      try {
        rec.start();
      } catch (err) {
        console.warn("Failed to start voice recognition:", err);
      }
    }, 1200);

    return () => {
      clearTimeout(startTimeout);
      if (rec) {
        try {
          rec.stop();
        } catch (e) {}
      }
    };
  }, [step]);

  useEffect(() => {
    if (!incidentId || step !== 'success') return;
    
    const unsub = onSnapshot(doc(db, 'incidents', incidentId), (snapshot) => {
      if (snapshot.exists()) {
        setCurrentIncident({ id: snapshot.id, ...snapshot.data() } as Incident);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `incidents/${incidentId}`);
    });

    return () => unsub();
  }, [incidentId, step]);

  return (
    <div className="fixed inset-0 z-[100] bg-white flex flex-col p-6 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-black text-red-600 tracking-widest mb-1">E-Secours SOS</span>
          <h2 className="text-2xl font-black text-gray-900">
            {step === 'confirm' && 'Confirmation d\'urgence'}
            {step === 'locating' && 'Localisation...'}
            {step === 'category' && 'Type d\'Urgence'}
            {step === 'details' && 'Plus de Détails'}
            {step === 'voice_confirm' && 'Confirmation Vocale'}
            {step === 'submitting' && (isOffline ? 'Enregistrement local...' : 'Envoi en cours...')}
            {step === 'success' && 'Alerte Envoyée !'}
            {step === 'success_offline' && 'Alerte Enregistrée'}
            {step === 'login_required' && 'Connexion Requise'}
          </h2>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSilentMode(!isSilentMode)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-2xl transition-all border shadow-sm",
              isSilentMode 
                ? "bg-amber-50 border-amber-200 text-amber-700" 
                : "bg-white border-gray-100 text-gray-400"
            )}
          >
            {isSilentMode ? <VolumeX size={16} /> : <Volume2 size={16} />}
            <span className="text-[8px] font-black uppercase tracking-widest hidden sm:inline">
              {isSilentMode ? 'Mode Discrétion' : 'Sons activés'}
            </span>
          </button>

          <button 
            onClick={onClose}
            className="p-2 bg-gray-50 text-gray-400 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X size={24} />
          </button>
        </div>
      </div>

      <div className="flex-1">
        <AnimatePresence mode="wait">
          {step === 'confirm' && (
            <motion.div 
              key="confirm"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center space-y-8 py-10 text-center max-w-md mx-auto"
            >
              <div className="relative">
                {/* Visual pulsing rings */}
                <div className="absolute inset-0 scale-[1.3] bg-red-100 rounded-full animate-ping opacity-25 pointer-events-none" />
                <div className="absolute inset-0 scale-[1.6] bg-red-50 rounded-full animate-pulse opacity-15 pointer-events-none" />
                
                <div className="relative w-28 h-28 bg-red-50 border border-red-200 text-red-600 rounded-full flex items-center justify-center shadow-lg">
                  <AlertTriangle size={48} className="animate-pulse" />
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">
                  Lancer l'Alerte de Détresse ?
                </h3>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide leading-relaxed px-4">
                  Afin de limiter les erreurs de manipulation, veuillez confirmer le lancement de la procédure d'urgence SOS.
                </p>
              </div>

              <div className="w-full space-y-3 pt-6">
                <button
                  onClick={() => setStep('locating')}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-5 rounded-[24px] shadow-lg shadow-red-200 hover:shadow-red-300 transition-all active:scale-[0.98] flex items-center justify-center gap-2 uppercase text-sm tracking-wider"
                >
                  <Shield size={20} />
                  CONFIRMER ET RECHERCHER DE L'AIDE
                </button>

                <button
                  onClick={onClose}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-black py-4 rounded-[24px] transition-all active:scale-[0.98] uppercase text-xs tracking-wider"
                >
                  ANNULER / RETOUR
                </button>
              </div>
            </motion.div>
          )}

          {step === 'locating' && (
            <motion.div 
              key="locating"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="relative h-64 bg-[#151921] rounded-[32px] overflow-hidden flex items-center justify-center border border-gray-800 shadow-inner group">
                {location ? (
                  <div className="absolute inset-0 z-0">
                    <MapPreview 
                      centerLat={location.lat} 
                      centerLng={location.lng} 
                      userLat={location.lat} 
                      userLng={location.lng} 
                      precision={location.precision} 
                    />
                  </div>
                ) : (
                  <>
                    {/* Radar Grid Background */}
                    <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle, #3b82f6 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
                    <div className="absolute inset-0 border-[0.5px] border-blue-500/10 rounded-full scale-[0.5]" />
                    <div className="absolute inset-0 border-[0.5px] border-blue-500/10 rounded-full scale-[1.0]" />
                    <div className="absolute inset-0 border-[0.5px] border-blue-500/10 rounded-full scale-[1.5]" />
                  </>
                )}
                
                {/* Overlay status */}
                {(!location || (location && location.precision > 30)) && (
                  <div className="z-10 flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center text-white shadow-xl bg-blue-600 animate-pulse relative">
                      <div className="absolute inset-0 bg-inherit rounded-full animate-ping opacity-50" />
                      <MapPin size={32} />
                    </div>
                    <div className="mt-4 flex flex-col items-center">
                      <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">
                        {location ? 'Affinement de la position...' : 'Acquisition du Signal...'}
                      </span>
                      {location && (
                        <span className="text-[8px] font-black text-white/50 uppercase tracking-widest mt-1">
                          Précision actuelle: {Math.round(location.precision)}m
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {location && (
                  <div className="absolute top-4 right-4 z-10 flex flex-col items-end gap-2">
                    <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg border border-white flex items-center gap-2">
                      <Target size={12} className={cn(location.precision < 20 ? "text-green-600" : "text-blue-600")} />
                      <span className="text-[10px] font-black text-gray-900 uppercase">
                        Précision: {Math.round(location.precision)}m
                      </span>
                    </div>
                    <button 
                      onClick={retryGeo}
                      className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg border border-white flex items-center gap-2 hover:bg-white transition-all active:scale-95"
                    >
                      <RotateCw size={12} className={isLocating ? "animate-spin text-blue-600" : "text-gray-600"} />
                      <span className="text-[10px] font-black text-gray-900 uppercase">Actualiser</span>
                    </button>
                  </div>
                )}
              </div>

              {location ? (
                <div className="bg-white border-2 border-gray-100 rounded-3xl p-6 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "p-3 rounded-2xl transition-colors",
                      location.precision < 20 ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-600"
                    )}>
                      <MapPin size={24} />
                    </div>
                    <div className="flex-1">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                          <span className={cn(location.precision <= 20 ? "text-green-600" : "text-gray-400")}>
                            {location.precision <= 20 ? "Précision Haute (GPS)" : "Affinement de la position..."}
                          </span>
                          <span className="text-gray-400">{Math.round(location.precision)}m</span>
                        </div>
                        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden border border-gray-100">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, Math.max(5, 100 - (location.precision / 1.5)))}%` }}
                            className={cn(
                              "h-full rounded-full transition-all duration-500 shadow-sm",
                              location.precision <= 20 ? "bg-green-500" : 
                              location.precision <= 50 ? "bg-blue-500" : 
                              location.precision <= 150 ? "bg-yellow-500" : 
                              "bg-red-500"
                            )}
                          />
                        </div>
                        <p className="text-[9px] font-bold text-gray-400 uppercase text-center mt-1">
                          L'alerte sera prête dès que la barre sera complète
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (geoPermissionState === 'granted') ? (
                <div className="p-8 bg-white rounded-[40px] border-2 border-gray-100 shadow-xl text-center space-y-6">
                  <div className="w-16 h-16 rounded-[24px] bg-blue-50 text-blue-600 flex items-center justify-center mx-auto animate-pulse">
                    <MapPin size={28} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-black text-gray-900 uppercase tracking-tighter">
                      Recherche de votre position
                    </h3>
                    <p className="text-xs font-bold text-gray-400 leading-relaxed max-w-xs mx-auto">
                      Nous contactons les réseaux satellites et wifi pour vous localiser avec la plus grande précision possible.
                    </p>
                  </div>
                  
                  {/* Provide direct manual search/entry for maximum speed of dispatch if GPS is taking time */}
                  <div className="space-y-2 text-left bg-gray-50/50 p-4 rounded-3xl border border-gray-100">
                    <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-1">
                      Saisir l'adresse de l'urgence manuellement
                    </label>
                    <input 
                      type="text"
                      placeholder="Ex: 12 Rue de la Paix, Paris..."
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val.trim()) {
                          setManualAddress(val);
                          setLocation({
                            lat: 48.8566, // Default Paris coords or similar, will be overwritten if GPS succeeds
                            lng: 2.3522,
                            precision: 1000,
                            address: val
                          });
                        }
                      }}
                      className="w-full text-xs font-bold text-gray-800 bg-white px-4 py-3.5 rounded-2xl border border-gray-100 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
                    />
                  </div>
                </div>
              ) : (geoPermissionState === 'denied' || geoPermissionState === 'prompt') ? (
                <PermissionGuard 
                  type="geolocation" 
                  state={geoPermissionState} 
                  onRetry={retryGeo}
                />
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-400 animate-pulse font-medium">Détermination de vos coordonnées...</p>
                </div>
              )}

              <button
                disabled={!location}
                onClick={() => setStep('category')}
                className="w-full bg-blue-600 disabled:bg-gray-200 text-white font-black py-5 rounded-[24px] shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                CONFIRMER MA POSITION
                <ChevronRight size={20} />
              </button>
            </motion.div>
          )}

          {step === 'category' && (
            <motion.div 
              key="category"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-2 gap-4">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.type}
                    onClick={() => {
                      setSelectedCategory(cat.type);
                      setStep('details');
                    }}
                    className={cn(
                      "flex flex-col items-center justify-center p-6 rounded-[32px] border-2 transition-all active:scale-95",
                      selectedCategory === cat.type ? "border-blue-600 ring-4 ring-blue-50" : cat.color
                    )}
                  >
                    <cat.icon size={40} className="mb-3" />
                    <span className="font-black uppercase tracking-tighter text-sm">{cat.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 'details' && (
            <motion.div 
              key="details"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              {/* Audio Section */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-widest ml-4 text-gray-400">
                  Note Vocale (Optionnel)
                </h4>
                
                {micPermissionState === 'denied' || micPermissionState === 'prompt' ? (
                  <PermissionGuard 
                    type="microphone" 
                    state={micPermissionState} 
                    onRetry={startRecording}
                    variant="inline"
                  />
                ) : audioError ? (
                  <div className="bg-red-50 border-2 border-dashed border-red-200 rounded-[32px] p-8 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                        <ShieldOff size={28} />
                      </div>
                      <p className="text-xs font-bold text-red-600 uppercase leading-relaxed max-w-[200px]">
                        {audioError}
                      </p>
                      <button 
                        onClick={startRecording}
                        className="text-[10px] font-black text-red-700 underline uppercase"
                      >
                        Réessayer
                      </button>
                    </div>
                  </div>
                ) : audioBlob ? (
                  <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-[32px] p-8 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="flex items-center justify-center gap-4">
                        <button 
                          onClick={togglePlayback}
                          className={cn(
                            "w-16 h-16 rounded-full flex items-center justify-center text-white shadow-lg transition-all",
                            isPlaying ? "bg-amber-500 scale-110" : "bg-green-600"
                          )}
                        >
                          {isPlaying ? <Pause size={28} /> : <Play size={28} />}
                        </button>
                        <button 
                          onClick={() => {
                            clearRecording();
                            if (howlRef.current) {
                              howlRef.current.unload();
                              howlRef.current = null;
                            }
                          }}
                          className="p-4 bg-red-100 text-red-600 rounded-3xl"
                        >
                          <Trash2 size={24} />
                        </button>
                      </div>
                      <p className="text-xs font-black text-green-600 uppercase tracking-widest">
                        {isPlaying ? "Lecture en cours..." : "Note enregistrée - Prêt à l'envoi"}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-[32px] p-8 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <motion.button
                        animate={isRecording ? { scale: [1, 1.1, 1] } : {}}
                        transition={{ repeat: Infinity, duration: 1 }}
                        onClick={isRecording ? stopRecording : startRecording}
                        className={cn(
                          "w-20 h-20 rounded-full flex items-center justify-center text-white shadow-lg transition-all",
                          isRecording ? "bg-red-600 animate-pulse" : "bg-blue-600"
                        )}
                      >
                        {isRecording ? <Pause size={32} /> : <Mic size={32} />}
                      </motion.button>
                      <p className="text-sm font-bold text-gray-500 uppercase">
                        {isRecording ? `Enregistrement... ${duration}s` : 'Appuyer pour parler'}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Text Description */}
              <div className="space-y-3">
                <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest ml-4">Informations Complémentaires</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Décrivez brièvement la situation..."
                  className="w-full bg-white border-2 border-gray-100 rounded-[24px] p-6 text-sm font-medium focus:border-blue-600 outline-none transition-all placeholder:text-gray-300 min-h-[120px]"
                />
              </div>

              {/* Medical Info Inclusion Toggle */}
              <button 
                onClick={() => setIncludeMedicalInfo(!includeMedicalInfo)}
                className={cn(
                  "w-full flex items-center justify-between p-6 rounded-[24px] border-2 transition-all",
                  includeMedicalInfo ? "bg-blue-50 border-blue-200" : "bg-gray-50 border-gray-100"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
                    includeMedicalInfo ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-400"
                  )}>
                    <HeartPulse size={24} />
                  </div>
                  <div className="text-left">
                    <h4 className={cn(
                      "text-sm font-black uppercase tracking-tight",
                      includeMedicalInfo ? "text-blue-900" : "text-gray-400"
                    )}>Inclure ma fiche médicale</h4>
                    <p className="text-[10px] font-bold text-gray-400 uppercase leading-none mt-1">Données & Contacts d'urgence</p>
                  </div>
                </div>
                <div className={cn(
                  "w-6 h-6 rounded-full border-4 flex items-center justify-center transition-all",
                  includeMedicalInfo ? "border-blue-600 bg-white" : "border-gray-200 bg-white"
                )}>
                  {includeMedicalInfo && <div className="w-2.5 h-2.5 bg-blue-600 rounded-full" />}
                </div>
              </button>

              <div className="space-y-4">
                <div className="relative group">
                  <motion.button
                    onMouseDown={() => setIsHolding(true)}
                    onMouseUp={() => setIsHolding(false)}
                    onMouseLeave={() => setIsHolding(false)}
                    onTouchStart={() => setIsHolding(true)}
                    onTouchEnd={() => setIsHolding(false)}
                    className={cn(
                      "relative w-full h-[72px] bg-red-600 text-white font-black rounded-[24px] shadow-xl overflow-hidden active:scale-[0.98] transition-all flex items-center justify-center gap-2 z-10",
                      isHolding && "ring-4 ring-red-100"
                    )}
                  >
                    {/* Hold Progress Background */}
                    <motion.div 
                      className="absolute left-0 top-0 bottom-0 bg-red-800 z-0"
                      initial={{ width: 0 }}
                      animate={{ width: `${holdProgress}%` }}
                      transition={{ ease: "linear" }}
                    />
                    
                    <div className="relative z-10 flex items-center gap-2">
                      <Send size={20} className={isHolding ? "animate-bounce" : ""} />
                      <span>{isHolding ? "MAINTENEZ..." : "MAINTENIR 3S POUR ENVOYER"}</span>
                    </div>
                  </motion.button>
                </div>
                
                <p className="text-[10px] text-center text-gray-400 font-bold uppercase tracking-widest">
                  Appuyez longuement pour éviter les fausses alertes
                </p>
              </div>
            </motion.div>
          )}

          {step === 'voice_confirm' && (
            <motion.div 
              key="voice_confirm"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-8 flex flex-col items-center justify-center text-center py-6"
            >
              <div className="relative w-32 h-32 flex items-center justify-center">
                {/* Visual waves pulsing when listening */}
                {isListeningConfirm && (
                  <>
                    <motion.div 
                      animate={{ scale: [1, 1.8, 1], opacity: [0.4, 0, 0.4] }}
                      transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }}
                      className="absolute inset-0 bg-red-100 rounded-full animate-pulse"
                    />
                    <motion.div 
                      animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
                      transition={{ repeat: Infinity, duration: 1.5, ease: "easeOut", delay: 0.3 }}
                      className="absolute inset-4 bg-red-200 rounded-full animate-pulse"
                    />
                  </>
                )}
                <div className={cn(
                  "w-24 h-24 rounded-full flex items-center justify-center text-white shadow-xl transition-all relative z-10",
                  isListeningConfirm ? "bg-red-600 scale-110" : "bg-gray-450"
                )}>
                  <Mic size={40} className={cn(isListeningConfirm && "animate-pulse")} />
                </div>
              </div>

              <div className="space-y-2 max-w-sm">
                <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">
                  Confirmation Vocale
                </h3>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest leading-relaxed">
                  Dites <span className="text-red-600 font-black">« CONFIRMER »</span> pour lancer le SOS, ou <span className="text-gray-700 font-black">« ANNULER »</span> pour retourner au brouillon.
                </p>
              </div>

              {/* Real-time transcript view */}
              <div className="w-full bg-gray-50 rounded-3xl p-6 border border-gray-100 min-h-[90px] flex flex-col items-center justify-center">
                {confirmTranscript ? (
                  <p className="text-sm font-black text-gray-800 italic">
                    "{confirmTranscript}"
                  </p>
                ) : (
                  <div className="flex flex-col items-center gap-1.5">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest animate-pulse">
                      {isListeningConfirm ? "À l'écoute du mot-clé..." : "Démarrage du micro..."}
                    </span>
                    <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider">
                      (La reconnaissance vocale s'exécute entièrement localement)
                    </span>
                  </div>
                )}
                {confirmError && (
                  <p className="text-[10px] font-black text-red-500 uppercase tracking-wider mt-2">
                    {confirmError}
                  </p>
                )}
              </div>

              {/* Tactile manual buttons fallback */}
              <div className="w-full space-y-3">
                <button
                  onClick={() => handleSubmitRef.current()}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-5 rounded-3xl shadow-xl transition-all active:scale-[0.98] uppercase tracking-wider text-sm flex items-center justify-center gap-2"
                >
                  <CheckCircle size={18} />
                  CONFIRMER L'ALERTE (MANUEL)
                </button>
                <button
                  onClick={() => setStep('details')}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-black py-4 rounded-3xl transition-all active:scale-[0.98] uppercase tracking-wider text-xs"
                >
                  ANNULER / RETOUR
                </button>
              </div>
            </motion.div>
          )}

          {step === 'login_required' && (
            <motion.div 
              key="login"
              className="flex flex-col items-center justify-center py-10 text-center space-y-8"
            >
              <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                <UserX size={48} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">Identification Nécessaire</h3>
                <p className="text-sm text-gray-500 font-medium">
                  Pour garantir l'intégrité des alertes, vous devez être identifié avant l'envoi.
                </p>
              </div>
              
              <button
                onClick={async () => {
                  try {
                    await signInWithGoogle();
                    setStep('details');
                  } catch (e) {
                    console.error(e);
                  }
                }}
                className="w-full bg-blue-600 text-white font-black py-5 rounded-[24px] shadow-xl flex items-center justify-center gap-2"
              >
                SE CONNECTER AVEC GOOGLE
              </button>
              
              <button
                onClick={() => setStep('details')}
                className="text-gray-400 font-bold text-xs uppercase tracking-widest"
              >
                Retour
              </button>
            </motion.div>
          )}

          {step === 'submitting' && (
            <motion.div 
              key="submitting"
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="w-24 h-24 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-8" />
              <p className="text-xl font-black text-gray-900 uppercase">Transmission aux secours...</p>
              <p className="text-sm text-gray-400 mt-2 font-bold">Veuillez ne pas quitter la page</p>
            </motion.div>
          )}

          {(step === 'success' || step === 'success_offline') && (
            <motion.div 
              key={step}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center justify-center py-4 text-center space-y-6"
            >
              <div className={cn(
                "w-24 h-24 rounded-full flex items-center justify-center shadow-lg border-8 border-white",
                step === 'success' ? "bg-green-500 text-white shadow-green-500/30" : "bg-amber-500 text-white shadow-amber-500/30"
              )}>
                {step === 'success' ? <CheckCircle size={48} /> : <AlertTriangle size={48} />}
              </div>
              
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-gray-900 leading-tight">
                  {step === 'success' ? 'VOTRE SOS A ÉTÉ REÇU' : 'SOS EN ATTENTE DE CONNEXION'}
                </h3>
                <p className="text-sm text-gray-500 font-medium px-4 leading-relaxed">
                  {step === 'success' 
                    ? "Votre localisation et vos informations ont été transmises. Un opérateur va traiter votre demande en priorité."
                    : "Vous êtes actuellement hors-ligne. Votre alerte a été enregistrée sur votre appareil et sera envoyée AUTOMATIQUEMENT dès que vous retrouverez une connexion."}
                </p>
              </div>

              {/* Summary Card */}
              <div className="w-full bg-gray-50 rounded-[32px] border border-gray-100 p-6 text-left space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Récapitulatif de l'alerte</h4>
                  <div className={cn(
                    "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                    step === 'success' ? "bg-green-100 text-green-600" : "bg-amber-100 text-amber-600"
                  )}>
                    {step === 'success' ? 'Transmis' : 'En attente'}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-gray-400 shadow-sm shrink-0">
                      {CATEGORIES.find(c => c.type === selectedCategory)?.icon ? 
                        React.createElement(CATEGORIES.find(c => c.type === selectedCategory)!.icon, { size: 16 }) : 
                        <AlertTriangle size={16} />
                      }
                    </div>
                    <div>
                      <div className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Type d'urgence</div>
                      <div className="text-sm font-bold text-gray-900">
                        {CATEGORIES.find(c => c.type === selectedCategory)?.label || selectedCategory}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-gray-400 shadow-sm shrink-0">
                      <MapPin size={16} />
                    </div>
                    <div className="flex-1">
                      <div className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Lieu de l'incident</div>
                      <div className="text-sm font-bold text-gray-900 line-clamp-2 mb-1">
                        {manualAddress || location?.address || 'Position GPS'}
                      </div>
                      {location && (
                        <div className="flex flex-wrap gap-1.5 mb-2">
                           <span className="text-[8px] font-black text-gray-400 bg-white px-1.5 py-0.5 rounded border border-gray-100 shadow-sm">LAT: {location.lat.toFixed(6)}</span>
                           <span className="text-[8px] font-black text-gray-400 bg-white px-1.5 py-0.5 rounded border border-gray-100 shadow-sm">LNG: {location.lng.toFixed(6)}</span>
                           {location.altitude !== undefined && location.altitude !== null && (
                             <span className="text-[8px] font-black text-gray-400 bg-white px-1.5 py-0.5 rounded border border-gray-100 shadow-sm">ALT: {Math.round(location.altitude)}m</span>
                           )}
                        </div>
                      )}
                      {location && (
                        <div className="h-24 w-full rounded-xl overflow-hidden border border-gray-100 shadow-sm">
                          <MapPreview 
                            centerLat={location.lat} 
                            centerLng={location.lng} 
                            userLat={location.lat} 
                            userLng={location.lng} 
                            precision={location.precision} 
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {description && (
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-gray-400 shadow-sm shrink-0">
                        <MoreHorizontal size={16} />
                      </div>
                      <div>
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Description</div>
                        <div className="text-sm font-bold text-gray-900 line-clamp-2 italic">
                          "{description}"
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {step === 'success' && (
                <div className="w-full bg-blue-600 rounded-[32px] p-6 text-white text-left relative overflow-hidden shadow-xl">
                  {currentIncident?.status === 'active' && currentIncident.responderName ? (
                    <>
                      <div className="absolute top-0 right-0 p-4 opacity-20">
                        <CheckCircle size={80} />
                      </div>
                      <div className="relative z-10 flex flex-col gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 font-black text-xl">
                            {currentIncident.responderName[0]}
                          </div>
                          <div>
                            <h4 className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-80">Secours en route</h4>
                            <div className="text-lg font-black">{currentIncident.responderName}</div>
                          </div>
                        </div>
                        {currentIncident.responderPhone && (
                          <a 
                            href={`tel:${currentIncident.responderPhone}`}
                            className="w-full bg-white text-blue-600 font-black py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg"
                          >
                            <Phone size={16} />
                            CONTACTER L'OPÉRATEUR
                          </a>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="absolute top-0 right-0 p-4 opacity-20">
                        <HeartPulse size={80} />
                      </div>
                      <div className="relative z-10">
                        <h4 className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-80">Temps de réponse estimé</h4>
                        <div className="text-3xl font-black mb-2">
                          {selectedCategory === 'vbg' || selectedCategory === 'agression_sexuelle' ? '3 - 6 MIN' :
                           selectedCategory === 'medical' ? '5 - 10 MIN' :
                           selectedCategory === 'agression' ? '4 - 8 MIN' :
                           selectedCategory === 'incendie' ? '8 - 12 MIN' :
                           selectedCategory === 'accident' ? '7 - 11 MIN' :
                           '10 - 15 MIN'}
                        </div>
                        <p className="text-[10px] font-bold leading-relaxed opacity-90 uppercase">
                          {selectedCategory === 'vbg' || selectedCategory === 'agression_sexuelle'
                            ? "Alerte prioritaire : opérateur et cellule d'assistance VBG mobilisés."
                            : "Un opérateur de secours est déjà en route ou analyse votre situation."}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              )}

              {(selectedCategory === 'vbg' || selectedCategory === 'agression_sexuelle') && (
                <div className="bg-purple-900 text-white p-5 rounded-[28px] space-y-3 shadow-lg">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="text-purple-300 shrink-0" size={20} />
                    <span className="text-xs font-black uppercase tracking-wider text-purple-200">Ligne Verte VBG & Urgence Bénin</span>
                  </div>
                  <p className="text-xs text-purple-100 font-medium leading-relaxed">
                    Pour une écoute confidentielle, un soutien juridique ou psychologique immédiat :
                  </p>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <a
                      href="tel:114"
                      className="bg-white text-purple-900 font-black py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow active:scale-95 transition-transform"
                    >
                      <Phone size={14} />
                      INF (114 Gratuit)
                    </a>
                    <a
                      href="tel:117"
                      className="bg-purple-800 text-white border border-purple-600 font-black py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow active:scale-95 transition-transform"
                    >
                      <Phone size={14} />
                      Police (117)
                    </a>
                  </div>
                </div>
              )}
              
              <div className={cn(
                "p-6 rounded-[32px] border w-full relative overflow-hidden transition-all duration-300",
                step === 'success' ? "bg-blue-50 border-blue-100" : "bg-amber-50 border-amber-100",
                isSignalActive && "ring-8 ring-red-500/20"
              )}>
                {isSignalActive && (
                  <motion.div 
                    animate={{ opacity: [0, 0.2, 0] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="absolute inset-0 bg-red-500 pointer-events-none"
                  />
                )}
                <h4 className={cn(
                  "text-xs font-black uppercase tracking-widest mb-2",
                  step === 'success' ? "text-blue-600" : "text-amber-600"
                )}>
                  {step === 'success' ? 'Conseil immédiat' : 'Note Importante'}
                </h4>
                <p className="text-sm text-gray-700 font-bold leading-relaxed relative z-10">
                  {step === 'success'
                    ? (selectedCategory === 'vbg' || selectedCategory === 'agression_sexuelle'
                        ? "Mettez-vous en lieu sécurisé. Si besoin de soins médicaux d'urgence ou prophylaxie VIH (délai 72h max), ne vous lavez pas et rendez-vous au centre de santé ou attendez la prise en charge."
                        : "Restez calme et à proximité de votre téléphone. Si possible, dégagez les voies d'accès pour les secours.")
                    : "Ne fermez pas totalement l'application. Gardez votre GPS actif pour que l'envoi se fasse dès le retour du réseau."}
                </p>
              </div>

              {step === 'success' && (
                <div className="space-y-3 w-full">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Identification Tactique</h4>
                  <button
                    onClick={toggleSignalSonore}
                    className={cn(
                      "w-full py-6 rounded-[24px] font-black uppercase tracking-widest flex flex-col items-center justify-center gap-3 transition-all relative overflow-hidden shadow-xl",
                      isSignalActive 
                        ? "bg-red-600 text-white animate-pulse" 
                        : "bg-white border-2 border-dashed border-blue-200 text-blue-600 hover:bg-blue-50"
                    )}
                  >
                    {isSignalActive ? (
                      <>
                        <BellRing className="animate-bounce" size={32} />
                        <span className="text-sm">ARRÊTER LE SIGNAL SONORE</span>
                        <div className="absolute inset-0 bg-white/10 flex items-center justify-center pointer-events-none">
                           <div className="w-full h-full animate-siren-flash opacity-30 bg-red-400" />
                        </div>
                      </>
                    ) : (
                      <>
                        <Volume2 size={32} />
                        <span className="text-sm">ACTIVER LE SIGNAL SONORE</span>
                        <span className="text-[9px] opacity-70 font-bold max-w-[200px] text-center normal-case mt-1">
                          Émet une sirène puissante pour aider les secours à vous repérer
                        </span>
                      </>
                    )}
                  </button>
                </div>
              )}

              <button
                onClick={onClose}
                className="w-full bg-gray-900 text-white font-black py-5 rounded-[24px] shadow-lg transition-all active:scale-[0.98]"
              >
                RETOUR À L'ACCUEIL
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
