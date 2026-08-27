import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX, X, MessageSquare, Bot, ArrowRight, Activity, Navigation, Ghost, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { isPermissionDeniedError, getMicErrorMessage } from '../lib/permissions';
import { PermissionGuard } from './PermissionGuard';

// Types for Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}
interface SpeechRecognitionResultList {
  readonly length: number;
  [index: number]: SpeechRecognitionResult;
}
interface SpeechRecognitionResult {
  readonly length: number;
  [index: number]: SpeechRecognitionAlternative;
  readonly isFinal: boolean;
}
interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface VirtualAssistantProps {
  onNavigate: (page: string) => void;
  onSOS: (type?: string) => void;
}

export const VirtualAssistant = ({ onNavigate, onSOS }: VirtualAssistantProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', text: string }[]>([]);
  const [currentTranscript, setCurrentTranscript] = useState('');
  
  const [isMuted, setIsMuted] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isContinuousMode, setIsContinuousMode] = useState(() => {
    return localStorage.getItem('e-secours-continuous-mode') === 'true';
  });
  const [isAwake, setIsAwake] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [permissionState, setPermissionState] = useState<PermissionState | 'unknown'>('unknown');
  
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const messageEndRef = useRef<HTMLDivElement>(null);
  const silenceTimerRef = useRef<any>(null);
  const messagesRef = useRef(messages);
  const wakeWordTimerRef = useRef<any>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('e-secours-continuous-mode', isContinuousMode.toString());
  }, [isContinuousMode]);

  useEffect(() => {
    const handleStorageChange = () => {
      const stored = localStorage.getItem('e-secours-continuous-mode') === 'true';
      if (stored !== isContinuousMode) {
        setIsContinuousMode(stored);
        if (stored) {
          speak("Assistant vocal en continu activé.");
        } else {
          speak("Assistant vocal en continu désactivé.");
          recognitionRef.current?.stop();
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [isContinuousMode]);

  // Check existing permissions on mount
  useEffect(() => {
    if (navigator.permissions && (navigator.permissions as any).query) {
      navigator.permissions.query({ name: 'microphone' as any }).then((result) => {
        setPermissionState(result.state);
        result.onchange = () => {
          setPermissionState(result.state);
        };
      }).catch(err => {
        console.debug("Error querying microphone permission:", err);
      });
    }
  }, []);

  // Restart listening if continuous mode is on and user has interacted
  useEffect(() => {
    if (isContinuousMode && !isListening && !isSpeaking && !isProcessing && micError !== 'blocked' && hasInteracted && permissionState !== 'denied') {
      const timer = setTimeout(() => {
        try {
          recognitionRef.current?.start();
          setIsListening(true);
        } catch (e) {
          // Already started or busy
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isContinuousMode, isListening, isSpeaking, isProcessing, micError, hasInteracted]);

  useEffect(() => {
    // Initialize Speech Synthesis
    synthRef.current = window.speechSynthesis;

    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
      if (synthRef.current) synthRef.current.cancel();
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      if (wakeWordTimerRef.current) clearTimeout(wakeWordTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, currentTranscript]);

  const speak = (text: any) => {
    if (!text || typeof text !== 'string' || !synthRef.current || isMuted) return;
    synthRef.current.cancel();
    
    // Ignore asterisks as requested
    const cleanText = text.replace(/\*/g, '');
    
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'fr-FR';
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    synthRef.current.speak(utterance);
  };

  const toggleListening = async () => {
    setHasInteracted(true);
    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }

    try {
      // Re-initialize if needed
      if (!recognitionRef.current) {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
          recognitionRef.current = new SpeechRecognition();
          recognitionRef.current.continuous = true;
          recognitionRef.current.interimResults = true;
          recognitionRef.current.lang = 'fr-FR';
          // Re-attach handlers if we re-init
          setupRecognitionHandlers(recognitionRef.current);
        }
      }

      // Explicitly request mic access to trigger browser prompt
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("L'API MediaDevices n'est pas supportée. HTTPS requis.");
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Immediately stop the track once we know we have permission
      stream.getTracks().forEach(track => track.stop());
      
      setMicError(null);
      setPermissionState('granted');

      if (synthRef.current) synthRef.current.cancel();
      setCurrentTranscript('');
      
      recognitionRef.current?.start();
      setIsListening(true);
    } catch (err: any) {
      console.debug("Mic access failed in Assistant:", err.name, err.message);
      
      if (isPermissionDeniedError(err)) {
        setMicError('blocked');
        setPermissionState('denied');
        const errorMsg = "L'accès au micro a été refusé. Veuillez cliquer sur l'icône de cadenas à gauche de la barre d'adresse pour l'autoriser.";
        setMessages(prev => [...prev, { role: 'assistant', text: errorMsg }]);
        speak(errorMsg);
        
        // Use shared message for detailed instructions
        alert(getMicErrorMessage(err));
      } else {
        setMicError('error');
        const errorMsg = "Impossible d'accéder au micro. Veuillez vérifier vos branchements.";
        setMessages(prev => [...prev, { role: 'assistant', text: errorMsg }]);
        speak(errorMsg);
      }
    }
  };

  const setupRecognitionHandlers = (recognition: any) => {
    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      const transcript = (finalTranscript || interimTranscript).toLowerCase();
      setCurrentTranscript(finalTranscript || interimTranscript);
      
      // Wake word detection in continuous mode
      if (isContinuousMode && !isAwake) {
        const wakeWords = [
          'bonjour sos', 'hello sos', 'sos',
          'hello e-secours', 'hello e secours', 'hello e-secour', 'hello e secour',
          'allo e-secours', 'allo e secours', 'allo e-secour', 'allo e secour',
          'allô e-secours', 'allô e secours', 'allô e-secour', 'allô e secour',
          'bonjour e-secours', 'bonjour e secours', 'hey e-secours'
        ];
        
        const matchedWord = wakeWords.find(word => transcript.includes(word));
        if (matchedWord) {
          setIsAwake(true);
          setIsOpen(true);
          speak("Je vous écoute. Comment puis-je vous aider ?");
          
          // Restart recognition to clear previous buffer (including the wake word)
          // and prevent it from being processed as a command.
          recognitionRef.current?.stop();

          if (wakeWordTimerRef.current) clearTimeout(wakeWordTimerRef.current);
          wakeWordTimerRef.current = setTimeout(() => {
            setIsAwake(false);
            speak("Je repasse en veille. Dites Bonjour SOS pour m'appeler.");
          }, 15000); // Back to sleep after 15s of inactivity
          return;
        }
        return; // Ignore anything else if not awake
      }

      // Wait 3 seconds after silence (no new results) to process
      if (finalTranscript || interimTranscript) {
        silenceTimerRef.current = setTimeout(() => {
          const transcriptToProcess = finalTranscript || interimTranscript;
          if (transcriptToProcess.trim()) {
            handleSend(transcriptToProcess);
            setIsAwake(false); // Go back to sleep after command
            if (wakeWordTimerRef.current) clearTimeout(wakeWordTimerRef.current);
            recognitionRef.current?.stop();
          }
        }, 3000);
      }
    };

    recognition.onerror = (event: any) => {
      console.warn("Speech Recognition Error:", event.error);
      setIsListening(false);
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

      if (event.error === 'not-allowed') {
        setMicError('blocked');
        setPermissionState('denied');
        const errorMsg = "L'accès au micro a été refusé. Veuillez vérifier les permissions de votre application.";
        setMessages(prev => [...prev, { role: 'assistant', text: errorMsg }]);
        speak(errorMsg);
        setIsContinuousMode(false);
      } else if (event.error === 'network') {
        setMicError('network');
        const errorMsg = "Problème réseau. La reconnaissance vocale a été interrompue.";
        setMessages(prev => [...prev, { role: 'assistant', text: errorMsg }]);
        speak(errorMsg);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };
  };

  useEffect(() => {
    // Initialize Speech Recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'fr-FR';
      setupRecognitionHandlers(recognitionRef.current);
    }
  }, []);

  const getLocalAssistantResponse = (message: string): { text: string; functionCalls?: any[] } => {
    const normalized = message.toLowerCase().trim();
    
    // 1. SOS WAKE WORDS or core greetings
    if (
      normalized === "bonjour sos" || 
      normalized === "hello sos" || 
      normalized === "sos" || 
      normalized === "bonjour" || 
      normalized === "salut" || 
      normalized === "hello" ||
      normalized === "hey"
    ) {
      return {
        text: "Bonjour ! Je suis votre Assistante Sociale E-Secours. Je suis entièrement fonctionnelle localement et prête à vous aider. Que souhaitez-vous faire ? (Lancer un SOS, chercher un hôpital, voir les numéros d'urgence ou un guide de premier secours ?)",
        functionCalls: []
      };
    }

    // 2. Specific Medical first aid instructions
    if (normalized.includes("saigne") || normalized.includes("saignement") || normalized.includes("sang") || normalized.includes("hémorragie") || normalized.includes("coupure")) {
      return {
        text: "Pour arrêter un saignement :\n1. Lavez-vous les mains si possible.\n2. Appuyez directement et fermement sur la plaie avec un tissu propre.\n3. Maintenez la pression de manière continue.\n4. Si possible, surélevez le membre blessé.\n\nJe vous redirige vers le guide complet des gestes de secours.",
        functionCalls: [{ name: "navigate_to_page", args: { page: "tips" } }]
      };
    }

    if (normalized.includes("brûle") || normalized.includes("brûlure") || normalized.includes("chaud")) {
      return {
        text: "En cas de brûlure légère :\n1. Arrosez immédiatement la zone avec de l'eau fraîche pendant 10 à 20 minutes pour refroidir la peau.\n2. Retirez délicatement les vêtements ou bijoux s'ils ne collent pas à la peau.\n3. Couvrez avec une compresse propre.\n\nJe vous oriente vers notre guide de premiers secours pour plus de détails.",
        functionCalls: [{ name: "navigate_to_page", args: { page: "tips" } }]
      };
    }

    if (normalized.includes("étouffe") || normalized.includes("étouffement") || normalized.includes("heimlich") || normalized.includes("gorge")) {
      return {
        text: "En cas d'étouffement (obstruction des voies respiratoires) :\n1. Encouragez la victime à tousser vigoureusement.\n2. Donnez jusqu'à 5 tapes fermes entre les omoplates.\n3. En cas d'échec, réalisez des compressions abdominales (méthode de Heimlich).\n\nConsultez la fiche détaillée que j'affiche à l'écran.",
        functionCalls: [{ name: "navigate_to_page", args: { page: "tips" } }]
      };
    }

    if (normalized.includes("évanoui") || normalized.includes("inconscient") || normalized.includes("pls") || normalized.includes("malaise") || normalized.includes("connaissance") || normalized.includes("tombe")) {
      return {
        text: "En cas de malaise ou de perte de connaissance :\n1. Allongez la victime sur le dos.\n2. Surélevez ses jambes de quelques centimètres.\n3. Si elle ne répond pas mais respire normalement, placez-la en Position Latérale de Sécurité (PLS).\n\nVoici le guide des gestes réflexes.",
        functionCalls: [{ name: "navigate_to_page", args: { page: "tips" } }]
      };
    }

    if (normalized.includes("ivg") || normalized.includes("avortement") || normalized.includes("2021-12") || normalized.includes("santé sexuelle") || normalized.includes("sante sexuelle") || normalized.includes("ssr")) {
      return {
        text: "Au Bénin, la loi n° 2021-12 autorise l'interruption volontaire de grossesse (IVG) sécurisée jusqu'à 12 semaines d'aménorrhée en cas de détresse matérielle, éducationnelle ou morale, ou sans limite de délai en cas de viol, inceste ou motif médical grave. L'acte doit être médicalisé dans un centre agréé. Je vous affiche les détails légaux et les centres d'accueil (ABPF, INF 114).",
        functionCalls: [{ name: "navigate_to_page", args: { page: "tips" } }]
      };
    }

    if (normalized.includes("osc") || normalized.includes("abpf") || normalized.includes("ceradis") || normalized.includes("batonga") || normalized.includes("rojalnu") || normalized.includes("afjb") || normalized.includes("organisation") || normalized.includes("association")) {
      return {
        text: "Voici l'annuaire complet des OSC de jeunes et organisations intervenant en santé reproductive au Bénin (ABPF, CeRADIS, Batonga, ROJALNU, AFJB, INF 114) avec leur méthodologie (Qui fait Quoi, Quand et Comment ?), leurs impacts et leurs coordonnées directes.",
        functionCalls: [{ name: "navigate_to_page", args: { page: "tips" } }]
      };
    }

    // 3. Immediate Emergency SOS Triggering
    if (
      normalized.includes("danger") || 
      normalized.includes("accident") || 
      normalized.includes("feu") || 
      normalized.includes("incendie") || 
      normalized.includes("agression") || 
      normalized.includes("vbg") ||
      normalized.includes("genre") ||
      normalized.includes("viol") ||
      normalized.includes("sexuel") ||
      normalized.includes("attouchement") ||
      normalized.includes("violence conjugale") ||
      normalized.includes("femme battue") ||
      normalized.includes("vol") || 
      normalized.includes("cambriolage") || 
      normalized.includes("blessé") || 
      normalized.includes("malade") || 
      normalized.includes("secours") || 
      normalized.includes("aidez-moi") || 
      normalized.includes("vif") || 
      normalized.includes("attaque") ||
      normalized.includes("agressé") ||
      normalized.includes("noyade")
    ) {
      let type = "autre";
      if (normalized.includes("vbg") || normalized.includes("genre") || normalized.includes("violence conjugale") || normalized.includes("femme battue") || normalized.includes("mariage force")) {
        type = "vbg";
      } else if (normalized.includes("viol") || normalized.includes("sexuel") || normalized.includes("attouchement") || normalized.includes("agression sexuelle")) {
        type = "agression_sexuelle";
      } else if (normalized.includes("accident") || normalized.includes("voiture") || normalized.includes("route") || normalized.includes("moto") || normalized.includes("collision")) {
        type = "accident";
      } else if (normalized.includes("feu") || normalized.includes("incendie") || normalized.includes("fumée") || normalized.includes("explosion")) {
        type = "incendie";
      } else if (normalized.includes("agression") || normalized.includes("attaque") || normalized.includes("arme") || normalized.includes("menace") || normalized.includes("frappé")) {
        type = "agression";
      } else if (normalized.includes("blessé") || normalized.includes("cardiaque") || normalized.includes("malade") || normalized.includes("médecin") || normalized.includes("crise") || normalized.includes("sang")) {
        type = "medical";
      } else if (normalized.includes("vol") || normalized.includes("cambriolage") || normalized.includes("voleur") || normalized.includes("braquage")) {
        type = "vol";
      } else if (normalized.includes("inondation") || normalized.includes("eau") || normalized.includes("pluie") || normalized.includes("noyade")) {
        type = "inondation";
      }

      return {
        text: `Je déclenche immédiatement la procédure d'alerte SOS d'urgence pour un incident de type : ${type.toUpperCase()}. Restez calme, je mobilise les secours immédiatement.`,
        functionCalls: [{
          name: "trigger_emergency_alert",
          args: { type }
        }]
      };
    }

    // 4. Navigation Actions
    if (
      normalized.includes("numéro") || 
      normalized.includes("numero") ||
      normalized.includes("urgence") ||
      normalized.includes("contact") ||
      normalized.includes("téléphone") || 
      normalized.includes("telephone") ||
      normalized.includes("appeler") || 
      normalized.includes("samu") || 
      normalized.includes("police") || 
      normalized.includes("pompier") || 
      normalized.includes("secouriste") ||
      normalized.includes("annuaire") ||
      normalized.includes("gendarme") ||
      normalized.includes("gendarmerie") ||
      normalized.includes("protection civile") ||
      normalized.includes("inf") ||
      normalized.includes("vbg") ||
      normalized.includes("femme") ||
      normalized.includes("enfant") ||
      normalized.includes("cnin") ||
      normalized.includes("cyber") ||
      normalized.includes("cnhu") ||
      normalized.includes("pharmacie") ||
      normalized.includes("ministere") ||
      normalized.includes("arcep") ||
      normalized.includes("cps") ||
      normalized.includes("112") ||
      normalized.includes("117") ||
      normalized.includes("118") ||
      normalized.includes("138") ||
      normalized.includes("114") ||
      normalized.includes("151") ||
      normalized.includes("166") ||
      normalized.includes("160") ||
      normalized.includes("136")
    ) {
      return {
        text: "Je vous ouvre l'annuaire complet des numéros d'urgence et services publics officiels du Bénin (Police 117, Pompiers 118, SAMU 112, INF 114, CNIN 151, Enfance 138/160, Ministères, Pharmacies 24h/24 et CPS).",
        functionCalls: [{ name: "navigate_to_page", args: { page: "numbers" } }]
      };
    }

    if (
      normalized.includes("conseil") || 
      normalized.includes("geste") || 
      normalized.includes("premier") || 
      normalized.includes("sauve") || 
      normalized.includes("guide") || 
      normalized.includes("apprentissage") || 
      normalized.includes("apprendre") ||
      normalized.includes("tutoriel") ||
      normalized.includes("loi") ||
      normalized.includes("legal") ||
      normalized.includes("légal") ||
      normalized.includes("ssr") ||
      normalized.includes("sexuel") ||
      normalized.includes("sexuelle") ||
      normalized.includes("reproduct") ||
      normalized.includes("reproduction") ||
      normalized.includes("ivg") ||
      normalized.includes("avortement") ||
      normalized.includes("contracept") ||
      normalized.includes("osc") ||
      normalized.includes("abpf") ||
      normalized.includes("ceradis") ||
      normalized.includes("batonga") ||
      normalized.includes("rojalnu") ||
      normalized.includes("afjb") ||
      normalized.includes("2021-12")
    ) {
      return {
        text: "Je vous ouvre la section Conseils & Droits : vous y trouverez le cadre légal complet en Santé Sexuelle et Reproductive au Bénin (Loi 2021-12, IVG sécurisée, protection contre les VBG) ainsi que l'annuaire détaillé des OSC de jeunes (ABPF, CeRADIS, ROJALNU, Batonga, AFJB, INF 114) précisant Qui fait Quoi, Quand et Comment.",
        functionCalls: [{ name: "navigate_to_page", args: { page: "tips" } }]
      };
    }

    if (
      normalized.includes("carte") || 
      normalized.includes("pharmacie") || 
      normalized.includes("hôpital") || 
      normalized.includes("clinique") || 
      normalized.includes("trouver") || 
      normalized.includes("proche") || 
      normalized.includes("centre") || 
      normalized.includes("outils") || 
      normalized.includes("gardes") ||
      normalized.includes("localisation") ||
      normalized.includes("trouve")
    ) {
      return {
        text: "J'ouvre l'outil de localisation des pharmacies de garde et des centres de santé d'urgence à proximité.",
        functionCalls: [{ name: "navigate_to_page", args: { page: "tools" } }]
      };
    }

    if (
      normalized.includes("profil") || 
      normalized.includes("fiche") || 
      normalized.includes("médical") || 
      normalized.includes("groupe sanguin") || 
      normalized.includes("allergie") || 
      normalized.includes("traitement") || 
      normalized.includes("mon corps") ||
      normalized.includes("poids") ||
      normalized.includes("allergies") ||
      normalized.includes("maladie") ||
      normalized.includes("ordonnance")
    ) {
      return {
        text: "Voici votre fiche médicale d'urgence. Vous pouvez y renseigner de façon sécurisée votre groupe sanguin, vos allergies et vos traitements.",
        functionCalls: [{ name: "navigate_to_page", args: { page: "profile" } }]
      };
    }

    if (
      normalized.includes("historique") || 
      normalized.includes("mes alertes") || 
      normalized.includes("alertes passées") || 
      normalized.includes("historiques") ||
      normalized.includes("archive")
    ) {
      return {
        text: "Consultons ensemble votre historique des alertes d'urgence enregistrées.",
        functionCalls: [{ name: "navigate_to_page", args: { page: "history" } }]
      };
    }

    if (
      normalized.includes("contact") || 
      normalized.includes("joindre") || 
      normalized.includes("support") || 
      normalized.includes("développeur") || 
      normalized.includes("mél") || 
      normalized.includes("email") ||
      normalized.includes("assistance")
    ) {
      return {
        text: "Je vous affiche la page de contact direct pour joindre l'assistance technique et l'équipe E-Secours.",
        functionCalls: [{ name: "navigate_to_page", args: { page: "contact" } }]
      };
    }

    if (
      normalized.includes("propos") || 
      normalized.includes("about") || 
      normalized.includes("qui-êtes-vous") || 
      normalized.includes("e-secours") || 
      normalized.includes("c'est quoi") || 
      normalized.includes("fonctionne") ||
      normalized.includes("qui es tu") ||
      normalized.includes("qui es-tu")
    ) {
      return {
        text: "E-Secours est une plateforme digitale d'assistance et de secours au Bénin, utilisable de manière autonome en ligne ou hors ligne.",
        functionCalls: [{ name: "navigate_to_page", args: { page: "about" } }]
      };
    }

    if (normalized.includes("admin") || normalized.includes("superviseur") || normalized.includes("tableau de bord")) {
      return {
        text: "Je vous dirige vers le tableau de bord d'administration de la plateforme.",
        functionCalls: [{ name: "navigate_to_page", args: { page: "admin" } }]
      };
    }

    // 5. General polite offline-ready fallback
    return {
      text: "Je suis à votre écoute en mode autonome ! Je peux déclencher un SOS d'urgence (accident, incendie, agression, médical...), trouver un hôpital ou une pharmacie de garde, afficher vos numéros d'urgence ou vous guider sur les gestes de premiers secours. Dites-moi ce dont vous avez besoin.",
      functionCalls: []
    };
  };

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setMessages(prev => [...prev, { role: 'user', text }]);
    setIsProcessing(true);
    setCurrentTranscript('');

    try {
      // Simulate an organic processing delay (typing response effect)
      await new Promise(resolve => setTimeout(resolve, 800));

      const data = getLocalAssistantResponse(text);

      if (data.text) {
        setMessages(prev => [...prev, { role: 'assistant', text: data.text }]);
        speak(data.text);
      }

      // Handle function calls
      if (data.functionCalls) {
        data.functionCalls.forEach((call: any) => {
          if (call.name === 'navigate_to_page') {
            onNavigate(call.args.page);
          } else if (call.name === 'trigger_emergency_alert') {
            onSOS(call.args.type);
            setIsOpen(false);
          }
        });
      }
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      console.error("Assistant error:", err);
      const errorMsg = "Désolé, je rencontre une difficulté technique. Veuillez réessayer.";
      setMessages(prev => [...prev, { role: 'assistant', text: errorMsg }]);
      speak(errorMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      {/* Trigger Button */}
      <motion.button
        animate={{ 
          scale: [1, 1.05, 1],
          boxShadow: [
            "0 0 0 rgba(37, 99, 235, 0)",
            "0 0 20px rgba(37, 99, 235, 0.4)",
            "0 0 0 rgba(37, 99, 235, 0)"
          ]
        }}
        transition={{ 
          duration: 3, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => {
          setIsOpen(true);
          setHasInteracted(true);
        }}
        className="fixed bottom-24 right-5 w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-2xl z-50 group border-4 border-white"
        aria-label="Bonjour SOS"
      >
        <div className="absolute -inset-1 bg-blue-400 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
        <Heart size={28} className="relative z-10 fill-white" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            className="fixed inset-0 z-[60] p-4 flex items-end justify-center sm:justify-end"
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsOpen(false)} />

            {/* Content Card */}
            <div className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden h-[80vh] border border-gray-100">
              {/* Header */}
              <div className="bg-blue-600 p-6 flex items-center justify-between text-white">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                    <Heart size={24} className="fill-white" />
                  </div>
                  <div className="flex flex-col">
                    <h2 className="font-black uppercase tracking-widest text-sm">Assistante Sociale E-Secours</h2>
                    <div className="flex items-center gap-2">
                       <p className="text-[10px] font-bold text-blue-100 uppercase tracking-widest">À votre écoute</p>
                       {isContinuousMode && (
                         <span className="flex items-center gap-1 text-[8px] font-black bg-white/20 px-1.5 py-0.5 rounded-full uppercase">
                           <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                           Mode Continu
                         </span>
                       )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => {
                      setIsMuted(!isMuted);
                      if (!isMuted && synthRef.current) synthRef.current.cancel();
                    }}
                    className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center hover:bg-white/20 transition-colors"
                    title={isMuted ? "Réactiver le son" : "Couper le son"}
                  >
                    {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                  </button>
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center hover:bg-white/20 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
                {(micError === 'blocked' || permissionState === 'denied' || (hasInteracted && permissionState === 'prompt')) && (
                   <PermissionGuard 
                    type="microphone" 
                    state={permissionState} 
                    onRetry={toggleListening}
                    variant="inline"
                    className="mb-4"
                  />
                )}

                {/* Continuous Mode Toggle for Accessibility */}
                <div className="bg-blue-50/50 p-4 rounded-3xl border border-blue-100/50 mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                      isContinuousMode ? "bg-blue-600 text-white" : "bg-white text-gray-400 shadow-sm"
                    )}>
                      <Activity size={20} />
                    </div>
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-900">Mode Continu</h4>
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tight">Dites "Bonjour SOS" ou "SOS" pour parler</p>
                    </div>
                  </div>
                  <button 
                    onClick={async () => {
                      setHasInteracted(true);
                      const next = !isContinuousMode;
                      
                      if (next) {
                        try {
                          // Force permission check before enabling continuous mode
                          if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                            throw new Error("L'API MediaDevices n'est pas supportée. HTTPS requis.");
                          }
                          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                          stream.getTracks().forEach(track => track.stop()); // Close stream immediately
                          
                          setMicError(null);
                          setPermissionState('granted');
                          setIsContinuousMode(true);
                          speak("Assistant vocal en continu activé. Je reste à votre écoute en arrière-plan. Dites Bonjour SOS pour m'interpeller à tout moment.");
                        } catch (err: any) {
                          console.debug("Mic access failed for continuous mode:", err.name, err.message);
                          
                          if (isPermissionDeniedError(err)) {
                            setMicError('blocked');
                            setPermissionState('denied');
                            const msg = getMicErrorMessage(err);
                            alert(msg);
                            speak("L'accès au micro est réfusé. Si vous l'avez déjà autorisé, essayez d'ouvrir l'application dans un nouvel onglet.");
                          } else {
                            speak("Une erreur est survenue lors de l'accès au micro. Vérifiez si une autre application utilise votre micro.");
                          }
                          return;
                        }
                      } else {
                        setIsContinuousMode(false);
                        speak("Mode continu désactivé. Le micro s'éteint.");
                        recognitionRef.current?.stop();
                      }
                    }}
                    aria-label={isContinuousMode ? "Désactiver le mode continu" : "Activer le mode continu"}
                    className={cn(
                      "w-12 h-6 rounded-full relative transition-colors duration-300",
                      isContinuousMode ? "bg-blue-600" : "bg-gray-200"
                    )}
                  >
                    <div className={cn(
                      "absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300",
                      isContinuousMode ? "left-7" : "left-1"
                    )} />
                  </button>
                </div>

                {isContinuousMode && !isAwake && !isProcessing && messages.length > 0 && (
                  <div className="flex justify-center py-4">
                    <div className="bg-gray-100 px-4 py-2 rounded-full flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest border border-gray-100">
                      <div className="w-1.5 h-1.5 bg-gray-300 rounded-full" />
                      En veille • Dites "Bonjour SOS" ou "SOS"
                    </div>
                  </div>
                )}
                {messages.length === 0 && !currentTranscript && (
                  <div className="text-center py-12 space-y-4">
                    <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto animate-pulse">
                      <Mic size={32} />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Comment puis-je vous soutenir ?</h3>
                      <p className="text-xs text-gray-400 mt-2 max-w-[200px] mx-auto font-medium leading-relaxed">
                        Je suis votre assistante sociale. Posez-moi une question sur les gestes de secours, les pharmacies ou demandez un SOS.
                      </p>
                    </div>
                  </div>
                )}

                {messages.map((m, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: m.role === 'user' ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={cn(
                      "flex flex-col gap-2 max-w-[85%]",
                      m.role === 'user' ? "ml-auto items-end" : "mr-auto items-start"
                    )}
                  >
                    <div className={cn(
                      "p-4 rounded-3xl text-sm font-bold shadow-sm",
                      m.role === 'user' 
                        ? "bg-blue-600 text-white rounded-tr-none" 
                        : "bg-gray-100 text-gray-900 rounded-tl-none border border-gray-100"
                    )}>
                      {m.text}
                    </div>
                  </motion.div>
                ))}

                {currentTranscript && (
                  <div className="flex flex-col gap-2 max-w-[85%] ml-auto items-end opacity-60">
                    <div className="p-4 rounded-3xl text-sm font-bold bg-blue-400 text-white rounded-tr-none border border-blue-300">
                      {currentTranscript}
                      <span className="flex gap-1 mt-2">
                        <span className="w-1 h-1 bg-white rounded-full animate-bounce" />
                        <span className="w-1 h-1 bg-white rounded-full animate-bounce [animation-delay:0.2s]" />
                        <span className="w-1 h-1 bg-white rounded-full animate-bounce [animation-delay:0.4s]" />
                      </span>
                    </div>
                  </div>
                )}

                {isProcessing && !currentTranscript && (
                  <div className="flex items-center gap-2 text-gray-400 p-4">
                    <Heart size={16} className="animate-pulse fill-gray-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest">L'assistante sociale réfléchit...</span>
                  </div>
                )}
                
                <div ref={messageEndRef} />
              </div>

              {/* Controls Footer */}
              <div className="p-6 bg-gray-50 border-t border-gray-100 space-y-4">
                <div className="flex items-center gap-4">
                  <button
                    onClick={toggleListening}
                    className={cn(
                      "w-16 h-16 rounded-2xl flex items-center justify-center transition-all shadow-xl",
                      isListening 
                        ? "bg-red-600 text-white animate-pulse" 
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    )}
                  >
                    {isListening ? <MicOff size={24} /> : <Mic size={24} />}
                  </button>

                  <div className="flex-1 bg-white rounded-2xl border border-gray-200 flex items-center px-4 relative shadow-sm">
                    <input
                      type="text"
                      placeholder="Écrivez ou parlez..."
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      className="w-full bg-transparent border-none py-4 text-sm font-bold focus:ring-0 pr-12"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleSend(inputValue);
                          setInputValue('');
                        }
                      }}
                    />
                    <div className="absolute right-2 flex items-center gap-1">
                      {isSpeaking && (
                        <div className="text-blue-600 mr-1">
                          <Volume2 size={16} className="animate-pulse" />
                        </div>
                      )}
                      <button 
                        onClick={() => {
                          handleSend(inputValue);
                          setInputValue('');
                        }}
                        disabled={!inputValue.trim() || isProcessing}
                        className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                          inputValue.trim() && !isProcessing 
                            ? "bg-blue-600 text-white shadow-md hover:scale-105 active:scale-95" 
                            : "bg-gray-100 text-gray-400"
                        )}
                      >
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2">
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    micError === 'blocked' ? "bg-amber-500" : (isListening ? "bg-red-600 animate-ping" : "bg-green-500")
                  )} />
                  <span className={cn(
                    "text-[10px] font-black uppercase tracking-widest",
                    micError === 'blocked' ? "text-amber-600" : "text-gray-400"
                  )}>
                    {micError === 'blocked' 
                      ? 'Micro bloqué - Vérifiez les réglages' 
                      : (isListening ? 'Écoute en cours...' : 'Prêt à vous aider')}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
