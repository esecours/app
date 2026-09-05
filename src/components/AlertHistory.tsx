import React, { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  Timestamp,
  deleteDoc,
  doc
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/firebase-errors';
import { Incident } from '../types';
import { Clock, MapPin, AlertTriangle, CheckCircle2, Timer, ChevronRight, Activity, Trash2, Phone } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface AlertHistoryProps {
  onLogin?: () => void;
}

export const AlertHistory = ({ onLogin }: AlertHistoryProps) => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'active' | 'resolved'>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (!auth.currentUser) {
      // Load local history if guest
      try {
        const localItems: Incident[] = [];
        const savedHistory = localStorage.getItem('e_secours_local_history');
        if (savedHistory) {
          const parsed = JSON.parse(savedHistory);
          if (Array.isArray(parsed)) localItems.push(...parsed);
        }
        const pendingSos = localStorage.getItem('pending_sos');
        if (pendingSos) {
          const parsedSos = JSON.parse(pendingSos);
          if (parsedSos && !localItems.some(i => i.id === parsedSos.id)) {
            localItems.unshift({
              ...parsedSos,
              status: 'pending',
              createdAt: parsedSos.offlineTimestamp || new Date().toISOString()
            });
          }
        }
        setIncidents(localItems);
      } catch (e) {
        console.error("Failed to load local alert history:", e);
      }
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'incidents'),
      where('userId', '==', auth.currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Incident[];
      setIncidents(docs);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'incidents');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const confirmDelete = async () => {
    if (!confirmDeleteId) return;

    const id = confirmDeleteId;
    setConfirmDeleteId(null);
    setDeletingId(id);
    
    try {
      if (auth.currentUser) {
        await deleteDoc(doc(db, 'incidents', id));
      } else {
        // Remove from local storage
        const updated = incidents.filter(i => i.id !== id);
        setIncidents(updated);
        localStorage.setItem('e_secours_local_history', JSON.stringify(updated));
        const pendingSos = localStorage.getItem('pending_sos');
        if (pendingSos) {
          const parsed = JSON.parse(pendingSos);
          if (parsed?.id === id) localStorage.removeItem('pending_sos');
        }
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `incidents/${id}`);
    } finally {
      setDeletingId(null);
    }
  };

  const filteredIncidents = incidents.filter(inc => 
    filter === 'all' ? true : inc.status === filter
  );

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          icon: Timer,
          label: 'En attente',
          color: 'text-amber-600',
          bg: 'bg-amber-50',
          border: 'border-amber-100'
        };
      case 'active':
        return {
          icon: Activity,
          label: 'En cours',
          color: 'text-blue-600',
          bg: 'bg-blue-50',
          border: 'border-blue-100'
        };
      case 'resolved':
        return {
          icon: CheckCircle2,
          label: 'Résolu',
          color: 'text-green-600',
          bg: 'bg-green-50',
          border: 'border-green-100'
        };
      default:
        return {
          icon: Clock,
          label: status,
          color: 'text-gray-600',
          bg: 'bg-gray-50',
          border: 'border-gray-100'
        };
    }
  };

  const getIncidentIcon = (type: string) => {
    switch (type) {
      case 'vbg': return '💜';
      case 'agression_sexuelle': return '🛡️';
      case 'accident': return '🚗';
      case 'incendie': return '🔥';
      case 'agression': return '🥊';
      case 'medical': return '🚑';
      case 'vol': return '👤🥷';
      case 'perte': return '🔍';
      case 'inondation': return '🌊';
      case 'seisme': return '🌋';
      default: return '⚠️';
    }
  };

  const getIncidentLabel = (type: string) => {
    switch (type) {
      case 'vbg': return 'Violences Basées sur le Genre (VBG)';
      case 'agression_sexuelle': return 'Agression Sexuelle';
      case 'accident': return 'Accident de la route';
      case 'incendie': return 'Incendie / Feu';
      case 'agression': return 'Agression / Violence Physique';
      case 'medical': return 'Urgence Médicale';
      case 'vol': return 'Vol / Cambriolage';
      case 'perte': return 'Personne disparue / Perte';
      case 'inondation': return 'Inondation';
      case 'seisme': return 'Séisme / Catastrophe';
      default: return type;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-500 font-medium">Chargement de votre historique...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <header className="space-y-1">
        <h1 className="text-2xl font-black tracking-tight text-gray-900 uppercase">Mon Historique</h1>
        <p className="text-sm text-gray-500 font-medium">Suivez l'état de vos alertes de secours</p>
      </header>

      {/* Stats Quick View */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-amber-50 p-3 rounded-2xl border border-amber-100">
          <div className="text-xs font-black text-amber-600 uppercase mb-1">Attente</div>
          <div className="text-lg font-black text-amber-700">{incidents.filter(i => i.status === 'pending').length}</div>
        </div>
        <div className="bg-blue-50 p-3 rounded-2xl border border-blue-100">
          <div className="text-xs font-black text-blue-600 uppercase mb-1">Actives</div>
          <div className="text-lg font-black text-blue-700">{incidents.filter(i => i.status === 'active').length}</div>
        </div>
        <div className="bg-green-50 p-3 rounded-2xl border border-green-100">
          <div className="text-xs font-black text-green-600 uppercase mb-1">Résolus</div>
          <div className="text-lg font-black text-green-700">{incidents.filter(i => i.status === 'resolved').length}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 p-1 bg-gray-100 rounded-xl overflow-x-auto no-scrollbar">
        {(['all', 'pending', 'active', 'resolved'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap",
              filter === f 
                ? "bg-white text-blue-600 shadow-sm" 
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            {f === 'all' ? 'Toutes' : f === 'pending' ? 'Attente' : f === 'active' ? 'En cours' : 'Résolu'}
          </button>
        ))}
      </div>

      {/* Incidents List */}
      <div className="space-y-4">
        {!auth.currentUser && (
          <div className="p-4 bg-blue-50 border border-blue-100 rounded-3xl flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-blue-900">Synchronisation du compte</p>
              <p className="text-[11px] text-blue-700">Connectez-vous pour retrouver l'historique complet de vos alertes.</p>
            </div>
            {onLogin && (
              <button
                onClick={onLogin}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider shrink-0 shadow-sm active:scale-95 transition-all"
              >
                Connexion
              </button>
            )}
          </div>
        )}

        {filteredIncidents.length === 0 ? (
          <div className="text-center py-12 rounded-[32px] bg-white border border-dashed border-gray-200">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="text-gray-300" size={32} />
            </div>
            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Aucune alerte trouvée</p>
            <p className="text-xs text-gray-400 mt-1 px-8">Vos alertes de secours s'afficheront ici après avoir été lancées.</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredIncidents.map((incident) => {
              const status = getStatusConfig(incident.status);
              const date = incident.createdAt instanceof Timestamp ? incident.createdAt.toDate() : new Date();
              
              return (
                <motion.div
                  key={incident.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white rounded-[32px] p-5 shadow-sm border border-gray-100 transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-2xl shadow-inner border border-gray-100">
                        {getIncidentIcon(incident.type)}
                      </div>
                      <div>
                        <h3 className="font-black text-gray-900 uppercase tracking-tight leading-none mb-1 text-sm">
                          {getIncidentLabel(incident.type)}
                        </h3>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                          {format(date, 'd MMM yyyy • HH:mm', { locale: fr })}
                        </p>
                      </div>
                    </div>
                    <div className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1 border",
                      status.color,
                      status.bg,
                      status.border
                    )}>
                      <status.icon size={12} />
                      {status.label}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 p-3 rounded-2xl mb-4">
                    <MapPin size={14} className="text-blue-500 shrink-0" />
                    <span className="truncate font-medium">
                      {incident.location.address || `${incident.location.lat.toFixed(4)}, ${incident.location.lng.toFixed(4)}`}
                    </span>
                  </div>

                  {incident.status === 'active' && incident.responderName && (
                    <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-100/50 rounded-2xl mb-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                      <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black text-xs">
                        {incident.responderName[0]}
                      </div>
                      <div className="flex-1">
                        <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest leading-none mb-1">Intervention en cours</div>
                        <div className="text-xs font-bold text-gray-900">{incident.responderName} est en route</div>
                      </div>
                      {incident.responderPhone && (
                        <a 
                          href={`tel:${incident.responderPhone}`}
                          className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-blue-600 shadow-sm border border-blue-100"
                        >
                          <Phone size={14} />
                        </a>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <button 
                      onClick={() => setConfirmDeleteId(incident.id!)}
                      disabled={deletingId === incident.id}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                        deletingId === incident.id 
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                          : "text-red-500 hover:bg-red-50 active:scale-90"
                      )}
                    >
                      <Trash2 size={14} className={deletingId === incident.id ? "animate-pulse" : ""} />
                      {deletingId === incident.id ? "Suppression..." : "Supprimer"}
                    </button>
                    <button className="text-blue-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-1 hover:gap-2 transition-all">
                      Voir détails <ChevronRight size={14} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmDeleteId && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmDeleteId(null)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
            />
            <div className="fixed inset-0 flex items-center justify-center p-6 z-[101] pointer-events-none">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white rounded-[32px] p-8 w-full max-w-sm shadow-2xl pointer-events-auto border border-gray-100"
              >
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-500 mx-auto mb-6">
                  <AlertTriangle size={32} />
                </div>
                
                <div className="text-center space-y-2 mb-8">
                  <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Supprimer l'alerte ?</h2>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    Cette action est irréversible. L'historique de cette intervention sera définitivement effacé de votre compte.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setConfirmDeleteId(null)}
                    className="py-4 rounded-2xl bg-gray-50 text-gray-900 text-xs font-black uppercase tracking-widest hover:bg-gray-100 transition-colors"
                  >
                    Annuler
                  </button>
                  <button 
                    onClick={confirmDelete}
                    className="py-4 rounded-2xl bg-red-600 text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-red-200 hover:bg-red-700 active:scale-95 transition-all"
                  >
                    Confirmer
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
