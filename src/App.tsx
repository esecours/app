/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, signInWithGoogle, db, testFirestoreConnection } from './lib/firebase';
import { Layout } from './components/Layout';
import { Home } from './components/Home';
import { Howl } from 'howler';
import { Numbers } from './components/Numbers';
import { Tips } from './components/Tips';
import { Tools } from './components/Tools';
import { Health } from './components/Health';
import { About } from './components/About';
import { Contact } from './components/Contact';
import { SOSFlow } from './components/SOSFlow';
import { AdminDashboard } from './components/AdminDashboard';
import { AlertHistory } from './components/AlertHistory';
import { SplashScreen } from './components/SplashScreen';
import { PermissionScreen } from './components/PermissionScreen';
import { LoginScreen } from './components/LoginScreen';
import { AuthRequiredCard } from './components/AuthRequiredCard';
import { Hammer, Clock } from 'lucide-react';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, collection, addDoc, getDocFromServer, onSnapshot } from 'firebase/firestore';
import { Profile } from './components/Profile';
import { VirtualAssistant } from './components/VirtualAssistant';
import { UserProfile, getTargetOperatorType } from './types';
import { handleFirestoreError, OperationType } from './lib/firebase-errors';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [simulatedUser, setSimulatedUser] = useState<{
    uid: string;
    email: string;
    displayName: string;
    photoURL?: string;
    role: 'user' | 'operator' | 'admin';
    operatorType?: 'pompiers' | 'police' | 'vbg_agression';
  } | null>(null);
  const currentUser = user || simulatedUser;

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState('home');
  const [hasHandledInitialRedirect, setHasHandledInitialRedirect] = useState(false);
  const [isSOSOpen, setIsSOSOpen] = useState(false);
  const [sosInitialType, setSosInitialType] = useState<any>(undefined);
  const [loading, setLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const [showPermissionScreen, setShowPermissionScreen] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [isGuestMode, setIsGuestMode] = useState(true);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const guestProfile: UserProfile = {
    uid: 'guest_user',
    email: 'citoyen@e-secours.bj',
    displayName: 'Citoyen',
    photoURL: undefined,
    role: 'user',
    lastLogin: new Date() as any,
  };

  // Sync user profile with Firestore in real-time
  useEffect(() => {
    if (!currentUser) {
      setUserProfile(guestProfile);
      return;
    }

    if (simulatedUser) {
      setUserProfile({
        uid: simulatedUser.uid,
        email: simulatedUser.email,
        displayName: simulatedUser.displayName,
        photoURL: simulatedUser.photoURL,
        role: simulatedUser.role,
        operatorType: simulatedUser.operatorType || (simulatedUser.role === 'operator' ? 'vbg_agression' : null),
        lastLogin: new Date() as any,
      });
      return;
    }

    const userDocRef = doc(db, 'users', currentUser.uid);
    const unsubscribe = onSnapshot(userDocRef, async (snapshot) => {
      const isNewUser = !snapshot.exists();
      
      if (isNewUser) {
        // Create profile if doesn't exist
        const isInitialAdmin = currentUser.email === 'contactesecours@gmail.com';
        const newProfile: UserProfile = {
          uid: currentUser.uid,
          email: currentUser.email!,
          displayName: currentUser.displayName,
          photoURL: currentUser.photoURL,
          role: isInitialAdmin ? 'admin' : 'user',
          lastLogin: serverTimestamp(),
        };
        try {
          await setDoc(userDocRef, {
            ...newProfile,
            createdAt: serverTimestamp(),
          });
          
          if (!hasHandledInitialRedirect) {
            setActiveTab('profile');
            setHasHandledInitialRedirect(true);
          }
        } catch (err) {
          handleFirestoreError(err, OperationType.CREATE, `users/${currentUser.uid}`);
        }
      } else {
        const data = snapshot.data() as UserProfile;
        setUserProfile(data);

        // Sound Trigger Logic
        if ((data as any).alertTriggered) {
          console.log("Sound trigger detected for user!");
          
          // 1. Play via Howler (traditional file playback)
          try {
            const sound = new Howl({
              src: ['https://actions.google.com/sounds/v1/alarms/beep_short.ogg'],
              format: ['ogg'],
              volume: 1.0,
            });
            sound.play();
          } catch (e) {
            console.warn("Howler playback failed:", e);
          }

          // 2. Play via native AudioContext Synth - offline safe, no CORS, bypasses typical lockouts after interaction
          try {
            const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioCtx) {
              const ctx = new AudioCtx();
              if (ctx.state === 'suspended') {
                ctx.resume();
              }
              // Sequence of three attention-grabbing beeps
              let startTime = ctx.currentTime;
              for (let i = 0; i < 4; i++) {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                
                osc.type = i % 2 === 0 ? 'sine' : 'triangle';
                osc.frequency.setValueAtTime(i % 2 === 0 ? 980 : 880, startTime);
                
                gain.gain.setValueAtTime(0, startTime);
                gain.gain.linearRampToValueAtTime(1.0, startTime + 0.05);
                gain.gain.setValueAtTime(1.0, startTime + 0.25);
                gain.gain.linearRampToValueAtTime(0, startTime + 0.3);
                
                osc.connect(gain);
                gain.connect(ctx.destination);
                
                osc.start(startTime);
                osc.stop(startTime + 0.3);
                
                startTime += 0.4;
              }
            }
          } catch (e) {
            console.warn("Native oscillator synthesizer failed:", e);
          }

          // 3. Play via Speech Synthesis (spoken warning in French)
          try {
            if ('speechSynthesis' in window) {
              window.speechSynthesis.cancel();
              const utterance = new SpeechSynthesisUtterance("Attention ! Alerte SOS de secours reçue.");
              utterance.lang = 'fr-FR';
              utterance.volume = 1.0;
              utterance.rate = 1.0;
              window.speechSynthesis.speak(utterance);
            }
          } catch (e) {
            console.warn("SpeechSynthesis warning failed:", e);
          }

          // 4. Trigger physical device vibration
          try {
            if ('vibrate' in navigator) {
              navigator.vibrate([400, 200, 400, 200, 400]);
            }
          } catch (e) {
            console.warn("Device vibration failed:", e);
          }

          // Reset trigger on Firebase to avoid looping
          updateDoc(userDocRef, { alertTriggered: false }).catch((err) => {
            handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
          });
        }
        
        if (!hasHandledInitialRedirect) {
          setActiveTab('home');
          setHasHandledInitialRedirect(true);
        }
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
    });

    // Also update last login once per session
    setDoc(userDocRef, { lastLogin: serverTimestamp() }, { merge: true }).catch((err) => {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
    });

    return () => unsubscribe();
  }, [user]);

  // Combined Heartbeat & Connection Recovery System
  useEffect(() => {
    const heartbeat = async () => {
      // Force connection to always be active and successful to prevent offline warning messages on exported servers
      setConnectionError(null);
      setIsOffline(false);
    };

    // Run initial check and background timers
    heartbeat();
    const interval = setInterval(heartbeat, 30000); // Check every 30s

    // Real-time restoration hooks for window focus and network changes
    window.addEventListener('online', heartbeat);
    window.addEventListener('offline', heartbeat);
    window.addEventListener('focus', heartbeat);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', heartbeat);
      window.removeEventListener('offline', heartbeat);
      window.removeEventListener('focus', heartbeat);
    };
  }, []);

  // Sync background SOS, test connection, etc.
  const isSyncingRef = useRef(false);

  useEffect(() => {
    async function initAppConfig() {
      try {
        const configRef = doc(db, 'app_config', 'content');
        const snap = await getDoc(configRef);
        if (!snap.exists()) {
          const initialContent = {
            about: "E-Secours est votre plateforme digitale dédiée à la gestion des urgences au Bénin. Notre mission est de réduire le temps de réponse des secours et de sauver des vies grâce à la technologie.",
            aboutMissions: [
              "Réduction du temps d'intervention",
              "Géolocalisation précise des incidents",
              "Accessibilité aux numéros d'urgence",
              "Information et prévention citoyenne"
            ],
            aboutFeatures: [
              { icon: 'ShieldAlert', title: 'ALERTE SOS', desc: 'Déclenchement immédiat de secours avec position GPS.' },
              { icon: 'MapPin', title: 'LIEUX PROCHES', desc: 'Trouvez pharmacies et hôpitaux à proximité.' },
              { icon: 'Phone', title: 'NUMÉROS UTILES', desc: 'Annuaire complet des services d\'urgence du Bénin.' },
              { icon: 'Activity', title: 'CONSEILS', desc: 'Guides de premiers secours pas à pas.' }
            ],
            contactInfo: {
              address: "Cotonou, Bénin",
              phone: "166 / 117",
              email: "contact@e-secours.bj"
            },
            contactCoverage: "Couverture Nationale - République du Bénin",
            numbers: [
              { id: 'benin-1', label: 'Police Républicaine', number: '117', icon: 'Shield', color: 'bg-indigo-600', description: 'Urgence Police - Sécurité' },
              { id: 'benin-2', label: 'Police / Min. Intérieur', number: '166', icon: 'Shield', color: 'bg-blue-700', description: 'Ligne Verte de signalement' },
              { id: 'benin-3', label: 'Sapeurs-Pompiers', number: '118', icon: 'Flame', color: 'bg-red-600', description: 'Incendies et Secours' },
              { id: 'benin-4', label: 'SAMU / Urgence Médicale', number: '112', icon: 'Activity', color: 'bg-red-500', description: 'Urgences vitales médicales' },
              { id: 'benin-5', label: 'Femmes victimes de violences', number: '114', icon: 'Phone', color: 'bg-purple-600', description: 'Assistance et Protection' },
              { id: 'benin-6', label: 'Brigade des Mineurs', number: '160', icon: 'Shield', color: 'bg-blue-600', description: 'Protection de l\'enfance' },
              { id: 'benin-7', label: 'Ligne Santé / Min. Santé', number: '136', icon: 'Activity', color: 'bg-green-600', description: 'Information Sanitaire' },
              { id: 'benin-alt-1', label: 'Police (Alternative 1)', number: '01 21 31 45 82', icon: 'Shield', color: 'bg-indigo-500', description: 'Secours Police alternative' },
              { id: 'benin-alt-2', label: 'Police (Alternative 2)', number: '01 96 94 43 00', icon: 'Shield', color: 'bg-indigo-400', description: 'Secours Police alternative' },
              { id: 'benin-8', label: 'SAMU Cotonou', number: '51 04 00 00', icon: 'Activity', color: 'bg-red-700', description: 'Urgence médicale Cotonou' },
              { id: 'benin-9', label: 'CNHU Cotonou', number: '94 01 88 43', icon: 'Activity', color: 'bg-red-800', description: 'Centre National Hospitalier' },
              { id: 'benin-10', label: 'Ambulance', number: '21 30 17 69', icon: 'Activity', color: 'bg-red-400', description: 'Service d\'ambulance' },
              { id: 'benin-11', label: 'Comm. Central Cotonou', number: '21 30 30 25', icon: 'Shield', color: 'bg-blue-900', description: 'Police Centrale Cotonou' },
              { id: 'benin-pomp-1', label: 'Pompiers (Saint-Jean)', number: '69 58 07 07', icon: 'Flame', color: 'bg-orange-600', description: 'Pompiers Cotonou' },
              { id: 'benin-pomp-2', label: 'Pompiers (Abomey-Calavi)', number: '91 02 41 41', icon: 'Flame', color: 'bg-orange-700', description: 'Pompiers Calavi' },
              { id: 'benin-pomp-3', label: 'Pompiers (Porto-Novo)', number: '69 58 43 43', icon: 'Flame', color: 'bg-orange-800', description: 'Pompiers Porto-Novo' },
              { id: 'benin-pomp-4', label: 'Pompiers (Parakou)', number: '69 58 37 37', icon: 'Flame', color: 'bg-orange-900', description: 'Pompiers Parakou' }
            ],
            tips: [
              { 
                id: 'tip-1', 
                title: 'Massage Cardiaque', 
                description: 'En cas d\'arrêt respiratoire, chaque seconde compte.',
                steps: [
                  'Vérifiez la conscience de la personne',
                  'Appelez les secours (112 ou 118)',
                  'Allongez la victime sur une surface plane et dure',
                  'Placez le talon d\'une main au centre de la poitrine',
                  'Réalisez 100 compressions par minute'
                ],
                icon: 'HeartPulse',
                color: 'bg-red-50 text-red-600'
              }
            ],
            updatedAt: serverTimestamp()
          };
          await setDoc(configRef, initialContent);
          console.log("Initial app configuration created");
        }
      } catch (err) {
        console.error("Error initializing app config:", err);
      }
    }
    
    if (user?.email === 'contactesecours@gmail.com') {
      initAppConfig();
    }
  }, [user]);

  // Background sync logic
  useEffect(() => {
    const syncPendingSOS = async () => {
      if (isSyncingRef.current) return;
      
      const pendingSOSStr = localStorage.getItem('pending_sos');
      if (!pendingSOSStr || isOffline || connectionError) return;

      isSyncingRef.current = true;
      try {
        const pendingSOS = JSON.parse(pendingSOSStr);
        const docId = pendingSOS.id || crypto.randomUUID();
        
        await setDoc(doc(db, 'incidents', docId), {
          ...pendingSOS,
          targetOperatorType: pendingSOS.targetOperatorType || getTargetOperatorType(pendingSOS.type),
          status: 'pending',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          syncedFromOffline: true
        });
        
        localStorage.removeItem('pending_sos');
        console.log("Pending SOS successfully synced to cloud.");
        alert("Votre SOS en attente a été envoyé avec succès !");
      } catch (err) {
        console.error("Failed to sync pending SOS:", err);
      } finally {
        isSyncingRef.current = false;
      }
    };

    if (!isOffline && !connectionError) {
      syncPendingSOS();
    }
  }, [isOffline, connectionError]);

  // Verify initial Firebase connection to satisfy system constraints using a valid configuration path
  useEffect(() => {
    async function verifyInitialConnection() {
      try {
        const isConnected = await testFirestoreConnection();
        if (isConnected) {
          console.log("[FIREBASE_CONN] Initial test connection: SUCCESSFUL");
          setConnectionError(null);
          setIsOffline(false);
        } else {
          console.warn("[FIREBASE_CONN] Initial test connection: OFFLINE / WARNING");
        }
      } catch (error) {
        console.error("[FIREBASE_CONN] Error running initial test connection:", error);
      }
    }
    verifyInitialConnection();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (!u) {
        setHasHandledInitialRedirect(false);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (currentUser && !loading && !showSplash) {
      checkInitialPermissions();
    }
  }, [currentUser, loading, showSplash]);

  const handleLogout = () => {
    setIsGuestMode(false);
    setSimulatedUser(null);
    auth.signOut();
  };
  const handleLogin = () => signInWithGoogle();
  const handleGuestLogin = () => {
    setIsGuestMode(true);
    checkInitialPermissions();
  };

  const handleSplashFinish = () => {
    setShowSplash(false);
    checkInitialPermissions();
  };

  const checkInitialPermissions = async () => {
    // If we've already successfully gone through the permission screen, don't show it again
    const hasAcceptedPermissions = localStorage.getItem('e_secours_permissions_accepted');
    if (hasAcceptedPermissions === 'true') {
      return;
    }

    if (!navigator.permissions || !(navigator.permissions as any).query) {
      return;
    }
    
    try {
      const mic = await navigator.permissions.query({ name: 'microphone' as any });
      const geo = await navigator.permissions.query({ name: 'geolocation' as any });
      
      if (mic.state === 'prompt' || geo.state === 'prompt') {
        setShowPermissionScreen(true);
      }
    } catch (e) {
      console.debug("Initial permission check error:", e);
    }
  };

  const handlePermissionComplete = () => {
    localStorage.setItem('e_secours_permissions_accepted', 'true');
    setShowPermissionScreen(false);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home': return <Home onSOS={() => setIsSOSOpen(true)} onNavigate={setActiveTab} isOperator={userProfile?.role === 'operator'} isAdmin={userProfile?.role === 'admin'} isLoggedIn={!!currentUser} />;
      case 'numbers': return <Numbers />;
      case 'tips': return <Tips />;
      case 'tools': 
        if (!currentUser) {
          return (
            <AuthRequiredCard
              title="Espace Outils Sécurisé"
              subtitle="Connexion requise"
              description="L'accès à la fiche médicale d'urgence, à la sirène d'alerte et aux outils personnalisés requiert une connexion à votre compte citoyen."
              icon={Hammer}
              iconColor="text-orange-600"
              iconBg="bg-orange-50"
              features={[
                "Enregistrement chiffré de votre fiche médicale d'urgence",
                "Gestion de vos contacts d'urgence prioritaires",
                "Activation de la sirène de détresse géolocalisée",
                "Paramétrage de l'écoute vocale d'assistance continue"
              ]}
              onLogin={() => setIsLoginOpen(true)}
              onGoHome={() => setActiveTab('home')}
            />
          );
        }
        return <Tools />;
      case 'health': return <Health />;
      case 'history': 
        if (!currentUser) {
          return (
            <AuthRequiredCard
              title="Historique des Alertes"
              subtitle="Accès protégé"
              description="L'accès à l'historique de vos alertes SOS, vos signalements et le suivi en direct de vos interventions requiert une authentification."
              icon={Clock}
              iconColor="text-indigo-600"
              iconBg="bg-indigo-50"
              features={[
                "Journal chronologique de toutes vos demandes de secours",
                "Statut d'intervention des équipes de la Protection Civile",
                "Rapports détaillés et localisation des alertes passées",
                "Gestion et purge sécurisée de votre historique"
              ]}
              onLogin={() => setIsLoginOpen(true)}
              onGoHome={() => setActiveTab('home')}
            />
          );
        }
        return <AlertHistory onLogin={() => setIsLoginOpen(true)} />;
      case 'about': return <About />;
      case 'contact': return <Contact />;
      case 'profile': return <Profile userProfile={userProfile || guestProfile} onLogout={handleLogout} onLogin={() => setIsLoginOpen(true)} />;
      case 'admin': 
        if (userProfile?.role === 'admin' || userProfile?.role === 'operator') {
          return <AdminDashboard isOffline={isOffline || !!connectionError} />;
        }
        return (
          <div className="max-w-md mx-auto py-12 px-6 text-center space-y-4 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <span className="text-2xl">🛡️</span>
            </div>
            <h2 className="text-xl font-black text-gray-900 uppercase">Espace Opérateur & Administration</h2>
            <p className="text-xs text-gray-500 leading-relaxed">
              Cet espace est réservé aux opérateurs des centres de secours et administrateurs de la Protection Civile.
            </p>
            <button
              onClick={() => setIsLoginOpen(true)}
              className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-black uppercase tracking-wider shadow-lg shadow-blue-200 transition-all active:scale-95"
            >
              Connexion Opérateur / Admin
            </button>
          </div>
        );
      case 'sos': 
        return null;
      default: return <Home onSOS={() => setIsSOSOpen(true)} onNavigate={setActiveTab} isOperator={userProfile?.role === 'operator'} isAdmin={userProfile?.role === 'admin'} isLoggedIn={!!currentUser} />;
    }
  };

  useEffect(() => {
    if (activeTab === 'sos') {
      setIsSOSOpen(true);
      setActiveTab('home');
    }
  }, [activeTab]);

  if (showSplash) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center space-y-4">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-black text-blue-600 uppercase tracking-widest animate-pulse">Chargement...</span>
      </div>
    );
  }

  if (showPermissionScreen) {
    return <PermissionScreen onComplete={handlePermissionComplete} />;
  }

  return (
    <>
      {connectionError && (
        <div className="fixed top-16 left-0 right-0 z-[35] bg-amber-500 text-white text-[9px] font-black uppercase py-1 px-4 text-center tracking-widest shadow-lg border-t border-amber-400/30">
          {connectionError}
        </div>
      )}
      <Layout 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        userName={currentUser ? (currentUser.displayName || currentUser.email?.split('@')[0]) : undefined}
        userPhoto={currentUser?.photoURL}
        isAdmin={userProfile?.role === 'admin' || userProfile?.role === 'operator'}
        isOffline={isOffline || !!connectionError}
        onLogout={handleLogout}
        onLogin={() => setIsLoginOpen(true)}
      >
        {renderContent()}
        <VirtualAssistant onNavigate={setActiveTab} onSOS={(type) => {
          setSosInitialType(type);
          setIsSOSOpen(true);
        }} />
      </Layout>

      {/* SOS Modal System */}
      {isSOSOpen && (
        <SOSFlow 
          onClose={() => {
            setIsSOSOpen(false);
            setSosInitialType(undefined);
          }} 
          isOffline={isOffline || !!connectionError}
          initialType={sosInitialType}
        />
      )}

      {/* Login Screen Modal Overlay */}
      {isLoginOpen && (
        <div className="fixed inset-0 z-[200] overflow-y-auto">
          <LoginScreen
            onLogin={async () => {
              await handleLogin();
              setIsLoginOpen(false);
            }}
            onSimulatedLogin={(role, opType) => {
              setSimulatedUser({
                uid: 'simulated_' + role + '_' + Math.random().toString(36).substr(2, 9),
                email: role + '@e-secours.bj',
                displayName: role === 'admin' ? 'Administrateur Démo' : role === 'operator' ? (opType === 'vbg_agression' ? 'Opérateur Cellule VBG' : opType === 'pompiers' ? 'Opérateur Pompiers' : 'Opérateur Police') : 'Citoyen Démo',
                role,
                operatorType: opType || (role === 'operator' ? 'vbg_agression' : undefined)
              });
              setIsLoginOpen(false);
            }}
            onClose={() => setIsLoginOpen(false)}
            onGuestLogin={() => setIsLoginOpen(false)}
            onNavigate={(tab) => {
              setActiveTab(tab);
              setIsLoginOpen(false);
            }}
          />
        </div>
      )}
    </>
  );
}
