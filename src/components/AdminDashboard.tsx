import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  AlertCircle, 
  Shield, 
  ShieldAlert, 
  MapPin, 
  Phone, 
  Clock, 
  CheckCircle2, 
  UserPlus, 
  Trash2, 
  ChevronRight,
  Search,
  Filter,
  Activity,
  ArrowLeft,
  Volume2,
  Play,
  Pause,
  UserMinus,
  RotateCcw,
  Bell,
  BellRing,
  Layout,
  Type,
  List,
  Edit,
  Save,
  Megaphone,
  History,
  Mail,
  HeartPulse,
  BarChart3,
  Pill,
  Sparkles
} from 'lucide-react';
import { Howl } from 'howler';
import { db, auth } from '../lib/firebase';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  doc, 
  getDoc,
  setDoc,
  updateDoc, 
  deleteDoc,
  Timestamp,
  addDoc,
  serverTimestamp,
  where
} from 'firebase/firestore';
import { UserProfile, Incident, OperatorType } from '../types';
import { cn } from '../lib/utils';
import { MapPreview } from './MapPreview';
import { format, addMinutes } from 'date-fns';
import { fr } from 'date-fns/locale';
import { handleFirestoreError, OperationType } from '../lib/firebase-errors';
import { AdminStatsTab } from './AdminStatsTab';
import { DEFAULT_NUMBERS } from './Numbers';

interface ContactMessage {
  id?: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  status: 'unread' | 'read' | 'resolved';
  createdAt: any;
}

interface AppContent {
  loginTitle?: string;
  loginImageUrl?: string;
  about: string;
  aboutMissions?: string[];
  aboutFeatures?: { icon: string; title: string; desc: string }[];
  contactInfo?: {
    address?: string;
    phone?: string;
    email?: string;
  };
  contactCoverage?: string;
  numbers: any[];
  tips: any[];
}

interface Announcement {
  id?: string;
  message: string;
  active: boolean;
  speed: number;
  type: 'info' | 'warning' | 'critical';
  durationMinutes: number;
  expiresAt: any;
  createdAt: any;
}

interface CMSViewProps {
  appContent: AppContent | null;
  announcements: Announcement[];
  handleFirestoreError: (error: unknown, operationType: OperationType, path: string | null) => void;
}

const CMSView = ({ appContent, announcements, handleFirestoreError }: CMSViewProps) => {
  const [activeTab, setActiveTab] = useState<'marquee' | 'pages'>('marquee');
  const [editLoginTitle, setEditLoginTitle] = useState('');
  const [editLoginImageUrl, setEditLoginImageUrl] = useState('');
  const [editAbout, setEditAbout] = useState('');
  const [editMissions, setEditMissions] = useState<string[]>([]);
  const [editFeatures, setEditFeatures] = useState<{ icon: string; title: string; desc: string }[]>([]);
  const [editContact, setEditContact] = useState({ address: '', phone: '', email: '' });
  const [editCoverage, setEditCoverage] = useState('');
  const [editNumbers, setEditNumbers] = useState<any[]>([]);
  const [editTips, setEditTips] = useState<any[]>([]);
  
  const [editingAnnouncementId, setEditingAnnouncementId] = useState<string | null>(null);
  const [announcementMsg, setAnnouncementMsg] = useState('');
  const [announcementSpeed, setAnnouncementSpeed] = useState(15);
  const [announcementType, setAnnouncementType] = useState<'info' | 'warning' | 'critical'>('critical');
  const [announcementDuration, setAnnouncementDuration] = useState(60);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (appContent) {
      setEditLoginTitle(appContent.loginTitle || '');
      setEditLoginImageUrl(appContent.loginImageUrl || '');
      setEditAbout(appContent.about || '');
      setEditMissions(appContent.aboutMissions || []);
      setEditFeatures(appContent.aboutFeatures || []);
      setEditContact({
        address: appContent.contactInfo?.address || '',
        phone: appContent.contactInfo?.phone || '',
        email: appContent.contactInfo?.email || ''
      });
      setEditCoverage(appContent.contactCoverage || '');
      setEditNumbers(
        appContent.numbers && appContent.numbers.length > 0
          ? appContent.numbers
          : DEFAULT_NUMBERS.map(n => ({
              label: n.label,
              number: n.number,
              alternateNumbers: n.alternateNumbers || [n.number],
              description: n.description,
              color: n.color,
              category: n.category,
              isTollFree: n.isTollFree || false,
              icon: typeof n.icon === 'string' ? n.icon : (
                n.id === '117' ? 'Shield' : 
                n.id === '118' ? 'Flame' : 
                n.id === '138' || n.id === '160' ? 'Baby' : 
                n.id === '114' ? 'HeartHandshake' : 
                n.id === '151' || n.id === '150' ? 'Lock' : 
                n.id === '166' || n.id === '198' ? 'ShieldAlert' :
                n.id === '131' ? 'Radio' :
                n.id === '134' ? 'Scale' :
                n.id === '137' ? 'Compass' :
                n.id === '144' || n.id === '145' || n.id === '190' || n.id === '191' ? 'Trees' :
                n.id === '170' ? 'LifeBuoy' :
                n.id?.includes('pharmacie') ? 'Pill' :
                n.id?.includes('min-finances') || n.id === '115' || n.id === '133' ? 'Landmark' :
                n.id?.includes('min') || n.id === '113' || n.id === '141' ? 'Building2' :
                n.id === 'cps-national' || n.id?.includes('famille') ? 'Users' :
                n.id === '105' || n.id === '110' || n.id === '130' || n.id === '132' || n.id === '189' || n.id === 'portail-public' ? 'Globe' :
                n.category?.includes('Santé') || n.id === '112' || n.id === '136' || n.id?.includes('samu') || n.id === 'cnhu' ? 'Activity' : 
                'Phone'
              )
            }))
      );
      setEditTips(appContent.tips || []);
    }
  }, [appContent]);

  const savePageContent = async () => {
    setIsSaving(true);
    try {
      await setDoc(doc(db, 'app_config', 'content'), {
        ...appContent,
        loginTitle: editLoginTitle,
        loginImageUrl: editLoginImageUrl,
        about: editAbout,
        aboutMissions: editMissions,
        aboutFeatures: editFeatures,
        contactInfo: editContact,
        contactCoverage: editCoverage,
        numbers: editNumbers,
        tips: editTips,
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'app_config/content');
    } finally {
      setIsSaving(false);
    }
  };

  const addNumber = () => {
    setEditNumbers([...editNumbers, { label: '', number: '', description: '', color: 'bg-blue-600', icon: 'Phone' }]);
  };

  const removeNumber = (index: number) => {
    setEditNumbers(editNumbers.filter((_, i) => i !== index));
  };

  const updateNumber = (index: number, field: string, value: string) => {
    const updated = [...editNumbers];
    updated[index] = { ...updated[index], [field]: value };
    setEditNumbers(updated);
  };

  const addTip = () => {
    setEditTips([...editTips, { title: '', description: '', steps: [''], icon: 'HeartPulse', color: 'bg-blue-50 text-blue-600' }]);
  };

  const removeTip = (index: number) => {
    setEditTips(editTips.filter((_, i) => i !== index));
  };

  const updateTip = (index: number, field: string, value: any) => {
    const updated = [...editTips];
    updated[index] = { ...updated[index], [field]: value };
    setEditTips(updated);
  };

  const updateTipStep = (tipIndex: number, stepIndex: number, value: string) => {
    const updated = [...editTips];
    const steps = [...updated[tipIndex].steps];
    steps[stepIndex] = value;
    updated[tipIndex].steps = steps;
    setEditTips(updated);
  };

  const addTipStep = (tipIndex: number) => {
    const updated = [...editTips];
    updated[tipIndex].steps = [...updated[tipIndex].steps, ''];
    setEditTips(updated);
  };

  const removeTipStep = (tipIndex: number, stepIndex: number) => {
    const updated = [...editTips];
    updated[tipIndex].steps = updated[tipIndex].steps.filter((_: any, i: number) => i !== stepIndex);
    setEditTips(updated);
  };

  const addMission = () => setEditMissions([...editMissions, '']);
  const updateMission = (idx: number, val: string) => {
    const updated = [...editMissions];
    updated[idx] = val;
    setEditMissions(updated);
  };
  const removeMission = (idx: number) => setEditMissions(editMissions.filter((_, i) => i !== idx));

  const addFeature = () => setEditFeatures([...editFeatures, { icon: 'Heart', title: '', desc: '' }]);
  const updateFeature = (idx: number, field: string, val: string) => {
    const updated = [...editFeatures];
    updated[idx] = { ...updated[idx], [field]: val } as any;
    setEditFeatures(updated);
  };
  const removeFeature = (idx: number) => setEditFeatures(editFeatures.filter((_, i) => i !== idx));

  const createOrUpdateAnnouncement = async () => {
    if (!announcementMsg.trim()) return;
    setIsSaving(true);
    try {
      const expiresAt = addMinutes(new Date(), announcementDuration);
      const data = {
        message: announcementMsg,
        active: true,
        speed: announcementSpeed,
        type: announcementType,
        durationMinutes: announcementDuration,
        expiresAt: Timestamp.fromDate(expiresAt),
        updatedAt: serverTimestamp(),
        createdBy: auth.currentUser?.uid
      };

      if (editingAnnouncementId) {
        await updateDoc(doc(db, 'announcements', editingAnnouncementId), data);
        setEditingAnnouncementId(null);
      } else {
        await addDoc(collection(db, 'announcements'), {
          ...data,
          createdAt: serverTimestamp()
        });
      }
      setAnnouncementMsg('');
      setAnnouncementType('critical');
      setAnnouncementSpeed(15);
      setAnnouncementDuration(60);
    } catch (err) {
      handleFirestoreError(err, editingAnnouncementId ? OperationType.UPDATE : OperationType.CREATE, 'announcements');
    } finally {
      setIsSaving(false);
    }
  };

  const startEditingAnnouncement = (a: Announcement) => {
    setEditingAnnouncementId(a.id!);
    setAnnouncementMsg(a.message);
    setAnnouncementSpeed(a.speed);
    setAnnouncementType(a.type || 'critical');
    setAnnouncementDuration(a.durationMinutes);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEditing = () => {
    setEditingAnnouncementId(null);
    setAnnouncementMsg('');
    setAnnouncementSpeed(15);
    setAnnouncementType('critical');
    setAnnouncementDuration(60);
  };

  const toggleAnnouncement = async (id: string, active: boolean) => {
    try {
      await updateDoc(doc(db, 'announcements', id), { active });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `announcements/${id}`);
    }
  };

  const deleteAnnouncement = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'announcements', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `announcements/${id}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Gestion du Contenu</h2>
          <p className="text-gray-500 font-medium capitalize">Modifiez les informations et les alertes de l'application.</p>
        </div>
      </div>

      {/* Local Tabs */}
      <div className="flex gap-2 border-b border-gray-100 pb-4 overflow-x-auto no-scrollbar">
        <button 
          onClick={() => setActiveTab('marquee')}
          className={cn(
            "px-4 md:px-6 py-3 rounded-2xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap",
            activeTab === 'marquee' ? "bg-red-600 text-white shadow-lg shadow-red-100" : "bg-white text-gray-400"
          )}
        >
          Flash Info
        </button>
        <button 
          onClick={() => setActiveTab('pages')}
          className={cn(
            "px-4 md:px-6 py-3 rounded-2xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap",
            activeTab === 'pages' ? "bg-blue-600 text-white shadow-lg shadow-blue-100" : "bg-white text-gray-400"
          )}
        >
          Pages Statiques
        </button>
      </div>

      {activeTab === 'marquee' && (
        <div className="space-y-6 md:space-y-8 transform-gpu">
          {/* New Announcement Form */}
          <div className="bg-white border border-gray-100 rounded-[28px] md:rounded-[32px] p-6 md:p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-3 text-red-600">
              <Megaphone size={24} />
              <h3 className="text-lg font-black uppercase tracking-tight">
                {editingAnnouncementId ? 'Modifier l\'Alerte' : 'Nouvelle Alerte'}
              </h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 mb-2 block">Message de l'alerte</label>
                <textarea 
                  value={announcementMsg}
                  onChange={(e) => setAnnouncementMsg(e.target.value)}
                  placeholder="Ex: Alerte inondation zone Sud - Restez chez vous..."
                  className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 text-sm font-bold min-h-[100px] outline-none focus:border-red-600 transition-all font-sans"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 mb-2 block">Vitesse du défilement</label>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                    {[
                      { label: 'Très Lente', value: 60 },
                      { label: 'Lente', value: 30 },
                      { label: 'Normal', value: 15 },
                      { label: 'Rapide', value: 8 }
                    ].map((s) => (
                      <button
                        key={s.label}
                        onClick={() => setAnnouncementSpeed(s.value)}
                        className={cn(
                          "py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border-2",
                          announcementSpeed === s.value 
                            ? "bg-red-600 border-red-600 text-white shadow-lg shadow-red-100" 
                            : "bg-white border-gray-100 text-gray-400 hover:border-gray-200"
                        )}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 mb-2 block">Type d'alerte</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: 'Info', value: 'info', color: 'bg-blue-600' },
                      { label: 'Attention', value: 'warning', color: 'bg-amber-500' },
                      { label: 'Critique', value: 'critical', color: 'bg-red-600' }
                    ].map((t) => (
                      <button
                        key={t.value}
                        onClick={() => setAnnouncementType(t.value as any)}
                        className={cn(
                          "py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border-2",
                          announcementType === t.value 
                            ? `${t.color} border-${t.color.split('-')[1]}-600 text-white shadow-lg shadow-gray-100` 
                            : "bg-white border-gray-100 text-gray-400 hover:border-gray-200"
                        )}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 mb-2 block">Durée (minutes)</label>
                  <input 
                    type="number" 
                    value={announcementDuration}
                    onChange={(e) => setAnnouncementDuration(Number(e.target.value))}
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 text-sm font-bold outline-none focus:border-red-600 transition-all"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                {editingAnnouncementId && (
                  <button 
                    onClick={cancelEditing}
                    className="flex-1 bg-gray-100 text-gray-500 font-black py-4 rounded-2xl text-xs uppercase tracking-widest active:scale-95 transition-all"
                  >
                    Annuler
                  </button>
                )}
                <button 
                  onClick={createOrUpdateAnnouncement}
                  disabled={isSaving || !announcementMsg.trim()}
                  className={cn(
                    "font-black py-4 rounded-2xl text-xs uppercase tracking-widest shadow-xl transition-all active:scale-95 disabled:opacity-50",
                    editingAnnouncementId ? "flex-[2] bg-blue-600 text-white shadow-blue-200" : "w-full bg-red-600 text-white shadow-red-200"
                  )}
                >
                  {editingAnnouncementId ? 'Enregistrer les modifications' : 'Lancer l\'Alerte'}
                </button>
              </div>
            </div>
          </div>

          {/* History / Active Management */}
          <div className="space-y-4">
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest ml-4">Historique & Contrôle</h3>
            <div className="grid grid-cols-1 gap-4">
              {announcements.map((a) => (
                <div key={a.id} className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center",
                      a.active 
                        ? a.type === 'info' ? "bg-blue-50 text-blue-600"
                          : a.type === 'warning' ? "bg-amber-50 text-amber-600"
                          : "bg-red-50 text-red-600"
                        : "bg-gray-50 text-gray-400"
                    )}>
                      {a.active ? <Megaphone size={20} className="animate-pulse" /> : <Shield size={20} />}
                    </div>
                    <div>
                      <p className="text-sm font-black text-gray-900 line-clamp-1 uppercase tracking-tight">{a.message}</p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase">
                        Vitesse: {a.speed === 60 ? 'Très Lente' : a.speed === 30 ? 'Lente' : a.speed === 8 ? 'Rapide' : 'Normal'} | Expire le: {a.expiresAt?.toDate ? format(a.expiresAt.toDate(), 'HH:mm', { locale: fr }) : '--:--'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => startEditingAnnouncement(a)}
                      className="p-2 bg-blue-50 text-blue-600 rounded-xl"
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      onClick={() => toggleAnnouncement(a.id!, !a.active)}
                      className={cn(
                        "px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                        a.active ? "bg-amber-100 text-amber-600" : "bg-green-100 text-green-600"
                      )}
                    >
                      {a.active ? 'Stopper' : 'Relancer'}
                    </button>
                    <button 
                      onClick={() => deleteAnnouncement(a.id!)}
                      className="p-2 bg-red-50 text-red-600 rounded-xl"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'pages' && (
        <div className="space-y-8 pb-20">
          {/* Action Footer (Sticky) */}
          <div className="fixed bottom-24 left-0 right-0 z-50 px-4 md:px-0">
             <div className="max-w-4xl mx-auto bg-white/90 backdrop-blur-xl border border-blue-100 p-4 rounded-[28px] md:rounded-[32px] shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-center md:text-left">
                   <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Éditeur de pages</p>
                   <p className="text-[10px] md:text-xs font-bold text-gray-500">Toutes vos modifications sont en attente.</p>
                </div>
                <button 
                  onClick={savePageContent}
                  disabled={isSaving}
                  className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-blue-200 active:scale-95 transition-all disabled:opacity-50"
                >
                  {isSaving ? <Activity size={16} className="animate-spin" /> : <Save size={16} />}
                  Enregistrer tout
                </button>
             </div>
          </div>

          {/* Login Section */}
          <div className="bg-white border border-gray-100 rounded-[28px] md:rounded-[32px] p-6 md:p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-3 text-blue-600">
              <Shield size={24} />
              <h3 className="text-lg font-black uppercase tracking-tight">LOGIN / BIENVENUE</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-4">Titre d'accroche</label>
                <input 
                  type="text"
                  value={editLoginTitle}
                  onChange={(e) => setEditLoginTitle(e.target.value)}
                  placeholder="Ex: Protection civile & Urgences digitalisées"
                  className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl p-3 text-sm font-bold"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-4">URL Image d'accueil</label>
                <input 
                  type="text"
                  value={editLoginImageUrl}
                  onChange={(e) => setEditLoginImageUrl(e.target.value)}
                  placeholder="URL de l'image Unsplash ou autre..."
                  className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl p-3 text-sm font-bold"
                />
              </div>
              {editLoginImageUrl && (
                <div className="md:col-span-2 rounded-2xl overflow-hidden border border-gray-100 aspect-video md:aspect-[21/9]">
                  <img src={editLoginImageUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>

          {/* About Section */}
          <div className="bg-white border border-gray-100 rounded-[28px] md:rounded-[32px] p-6 md:p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-3 text-blue-600">
              <Type size={24} />
              <h3 className="text-lg font-black uppercase tracking-tight">À PROPOS</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-4 mb-2 block">Texte d'introduction</label>
                <textarea 
                  value={editAbout}
                  onChange={(e) => setEditAbout(e.target.value)}
                  placeholder="Contenu de la page à propros..."
                  className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-6 text-sm font-medium leading-relaxed min-h-[150px] outline-none focus:border-blue-600 transition-all font-sans"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-4">Nos Missions</label>
                  <button onClick={addMission} className="text-[9px] font-black text-blue-600 uppercase hover:underline">Ajouter</button>
                </div>
                <div className="grid gap-2">
                  {editMissions.map((m, i) => (
                    <div key={i} className="flex gap-2">
                      <input 
                        value={m}
                        onChange={(e) => updateMission(i, e.target.value)}
                        className="flex-1 bg-gray-50 border-2 border-gray-100 rounded-xl p-3 text-xs font-bold"
                        placeholder="Ex: Sauver des vies..."
                      />
                      <button onClick={() => removeMission(i)} className="p-3 bg-white text-gray-400 rounded-xl hover:text-red-500 border border-gray-100"><Trash2 size={14}/></button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-4">Fonctionnalités clés</label>
                  <button onClick={addFeature} className="text-[9px] font-black text-blue-600 uppercase hover:underline">Ajouter</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {editFeatures.map((f, i) => (
                    <div key={i} className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-3 relative group">
                      <button 
                        onClick={() => removeFeature(i)}
                        className="absolute top-2 right-2 p-1.5 bg-white text-red-500 rounded-lg shadow-sm border border-gray-100"
                      >
                        <Trash2 size={12} />
                      </button>
                      <div className="grid grid-cols-2 gap-2">
                         <div className="space-y-1">
                            <label className="text-[8px] font-black text-gray-400 uppercase">Icône</label>
                            <select 
                              value={f.icon}
                              onChange={(e) => updateFeature(i, 'icon', e.target.value)}
                              className="w-full bg-white border border-gray-200 rounded-lg p-2 text-[10px] font-black"
                            >
                              <option value="Shield">Bouclier</option>
                              <option value="MapPin">Carte</option>
                              <option value="Clock">Horloge</option>
                              <option value="Heart">Cœur</option>
                              <option value="Activity">Activité</option>
                              <option value="Phone">Tél</option>
                              <option value="Globe">Globe</option>
                            </select>
                         </div>
                         <div className="space-y-1">
                            <label className="text-[8px] font-black text-gray-400 uppercase">Titre</label>
                            <input 
                              value={f.title}
                              onChange={(e) => updateFeature(i, 'title', e.target.value)}
                              className="w-full bg-white border border-gray-200 rounded-lg p-2 text-[10px] font-black uppercase"
                              placeholder="Titre"
                            />
                         </div>
                      </div>
                      <input 
                        value={f.desc}
                        onChange={(e) => updateFeature(i, 'desc', e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-lg p-2 text-[10px] font-medium"
                        placeholder="Description courte"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Contact Info Section */}
          <div className="bg-white border border-gray-100 rounded-[28px] md:rounded-[32px] p-6 md:p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-3 text-purple-600">
              <Mail size={24} />
              <h3 className="text-lg font-black uppercase tracking-tight">CONTACT</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-4">Email</label>
                <input 
                  type="email"
                  value={editContact.email}
                  onChange={(e) => setEditContact({...editContact, email: e.target.value})}
                  className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl p-3 text-sm font-bold outline-none focus:border-purple-600"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-4">Téléphones</label>
                <input 
                  type="text"
                  value={editContact.phone}
                  onChange={(e) => setEditContact({...editContact, phone: e.target.value})}
                  className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl p-3 text-sm font-bold outline-none focus:border-purple-600"
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-4">Adresse</label>
                <input 
                  type="text"
                  value={editContact.address}
                  onChange={(e) => setEditContact({...editContact, address: e.target.value})}
                  className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl p-3 text-sm font-bold outline-none focus:border-purple-600"
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-4">Zone de couverture</label>
                <input 
                  type="text"
                  value={editCoverage}
                  onChange={(e) => setEditCoverage(e.target.value)}
                  placeholder="Ex: National - Bénin"
                  className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl p-3 text-sm font-bold outline-none focus:border-purple-600"
                />
              </div>
            </div>
          </div>

          {/* Numbers Section */}
          <div className="bg-white border border-gray-100 rounded-[28px] md:rounded-[32px] p-6 md:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-red-600">
                <Phone size={24} />
                <h3 className="text-lg font-black uppercase tracking-tight">NUMÉROS</h3>
              </div>
              <button 
                onClick={addNumber}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest active:scale-95 transition-all"
              >
                <UserPlus size={14} />
                Ajouter
              </button>
            </div>
            
            <div className="space-y-4">
              {editNumbers.map((num, idx) => (
                <div key={idx} className="p-4 md:p-6 bg-gray-50 rounded-2xl border border-gray-100 space-y-4 relative group">
                  <button 
                    onClick={() => removeNumber(idx)}
                    className="absolute top-4 right-4 p-2 bg-white text-red-500 rounded-xl shadow-sm md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={16} />
                  </button>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-10 md:pr-0">
                    <input 
                      placeholder="Label (ex: Police)"
                      value={num.label}
                      onChange={(e) => updateNumber(idx, 'label', e.target.value)}
                      className="bg-white border-2 border-gray-200 rounded-xl p-3 text-xs font-black uppercase"
                    />
                    <input 
                      placeholder="Numéro (ex: 17)"
                      value={num.number}
                      onChange={(e) => updateNumber(idx, 'number', e.target.value)}
                      className="bg-white border-2 border-gray-200 rounded-xl p-3 text-xs font-black"
                    />
                    <input 
                      placeholder="Description"
                      value={num.description}
                      onChange={(e) => updateNumber(idx, 'description', e.target.value)}
                      className="md:col-span-2 bg-white border-2 border-gray-200 rounded-xl p-3 text-xs font-medium"
                    />
                    <div className="flex flex-wrap gap-2">
                         <select 
                          value={num.color}
                          onChange={(e) => updateNumber(idx, 'color', e.target.value)}
                          className="bg-white border-2 border-gray-200 rounded-xl p-2 text-[10px] font-black uppercase h-10"
                         >
                           <option value="bg-red-600">Rouge</option>
                           <option value="bg-red-500">Rouge Clair</option>
                           <option value="bg-blue-600">Bleu</option>
                           <option value="bg-blue-500">Bleu Clair</option>
                           <option value="bg-blue-400">Azur</option>
                           <option value="bg-blue-300">Ciel</option>
                           <option value="bg-indigo-600">Indigo</option>
                           <option value="bg-amber-600">Ambre</option>
                           <option value="bg-amber-500">Ambre Clair</option>
                           <option value="bg-purple-600">Violet</option>
                           <option value="bg-emerald-600">Vert Émeraude</option>
                           <option value="bg-green-600">Vert</option>
                         </select>
                       <select 
                        value={num.icon}
                        onChange={(e) => updateNumber(idx, 'icon', e.target.value)}
                        className="bg-white border-2 border-gray-200 rounded-xl p-2 text-[10px] font-black uppercase h-10"
                       >
                         <option value="Phone">Standard (Tél)</option>
                         <option value="Shield">Police / Sécurité</option>
                         <option value="Flame">Pompiers / Protection civile</option>
                         <option value="Baby">Enfance / Protection 138</option>
                         <option value="HeartHandshake">Femme / INF 114</option>
                         <option value="Lock">Cybercriminalité / CNIN 151</option>
                         <option value="ShieldAlert">Sécurité / Alerte</option>
                         <option value="Activity">SAMU / Médical</option>
                         <option value="Pill">Pharmacie 24/24</option>
                         <option value="Building2">Ministère / Administration</option>
                         <option value="Landmark">Finances / Présidence</option>
                         <option value="Globe">Numérique / International</option>
                         <option value="Radio">ARCEP / Télécoms</option>
                         <option value="Scale">Justice / Anti-Corruption</option>
                         <option value="Compass">Tourisme / Patrimoine</option>
                         <option value="Trees">Environnement / Eaux & Forêts</option>
                         <option value="LifeBuoy">Port / Maritime</option>
                         <option value="Users">Social / CPS / Famille</option>
                         <option value="Siren">Sirène</option>
                       </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tips Section */}
          <div className="bg-white border border-gray-100 rounded-[28px] md:rounded-[32px] p-6 md:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-amber-600">
                <List size={24} />
                <h3 className="text-lg font-black uppercase tracking-tight">CONSEILS</h3>
              </div>
              <button 
                onClick={addTip}
                className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest active:scale-95 transition-all"
              >
                <UserPlus size={14} />
                Ajouter
              </button>
            </div>

            <div className="space-y-6">
              {editTips.map((tip, idx) => (
                <div key={idx} className="p-6 md:p-8 bg-gray-50 rounded-[28px] md:rounded-[32px] border border-gray-100 space-y-6 relative group">
                  <button 
                    onClick={() => removeTip(idx)}
                    className="absolute top-4 right-4 md:top-6 md:right-6 p-2 bg-white text-red-500 rounded-xl shadow-sm md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={16} />
                  </button>
                  
                  <div className="grid grid-cols-1 gap-4 pr-10 md:pr-0">
                    <div className="space-y-2">
                       <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-2">Titre du conseil</label>
                       <input 
                        value={tip.title}
                        onChange={(e) => updateTip(idx, 'title', e.target.value)}
                        className="w-full bg-white border-2 border-gray-200 rounded-xl p-3 text-sm font-black uppercase"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-2">Description brève</label>
                       <input 
                        value={tip.description}
                        onChange={(e) => updateTip(idx, 'description', e.target.value)}
                        className="w-full bg-white border-2 border-gray-200 rounded-xl p-3 text-xs font-medium"
                       />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                         <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-2">Icône</label>
                         <select 
                          value={tip.icon}
                          onChange={(e) => updateTip(idx, 'icon', e.target.value)}
                          className="w-full bg-white border-2 border-gray-200 rounded-xl p-3 text-[10px] font-black uppercase h-12"
                         >
                           <option value="HeartPulse">Cœur</option>
                           <option value="Ban">Interdit</option>
                           <option value="Wind">Poumon</option>
                           <option value="Flame">Feu</option>
                           <option value="Activity">Activité</option>
                           <option value="Shield">Bouclier</option>
                           <option value="Siren">Sirène</option>
                           <option value="AlertCircle">Alerte</option>
                         </select>
                      </div>
                      <div className="space-y-2">
                         <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-2">Couleur</label>
                         <select 
                          value={tip.color}
                          onChange={(e) => updateTip(idx, 'color', e.target.value)}
                          className="w-full bg-white border-2 border-gray-200 rounded-xl p-3 text-[10px] font-black uppercase h-12"
                         >
                           <option value="bg-red-50 text-red-600">Rouge</option>
                           <option value="bg-blue-50 text-blue-600">Bleu</option>
                           <option value="bg-orange-50 text-orange-600">Orange</option>
                           <option value="bg-green-50 text-green-600">Vert</option>
                           <option value="bg-purple-50 text-purple-600">Violet</option>
                           <option value="bg-amber-50 text-amber-600">Ambre</option>
                         </select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                       <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-4">Étapes à suivre</label>
                       <button onClick={() => addTipStep(idx)} className="text-[9px] font-black text-blue-600 uppercase hover:underline">Ajouter</button>
                    </div>
                    <div className="grid gap-2">
                      {tip.steps.map((step: string, sIdx: number) => (
                        <div key={sIdx} className="flex gap-2">
                           <input 
                            value={step}
                            onChange={(e) => updateTipStep(idx, sIdx, e.target.value)}
                            className="flex-1 bg-white border-2 border-gray-100 rounded-xl p-3 text-xs font-bold"
                           />
                           <button onClick={() => removeTipStep(idx, sIdx)} className="p-3 bg-white text-gray-400 rounded-xl hover:text-red-500"><Trash2 size={14}/></button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const AdminDashboard = ({ isOffline }: { isOffline?: boolean }) => {
  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile | null>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [contacts, setContacts] = useState<ContactMessage[]>([]);
  const [appContent, setAppContent] = useState<AppContent | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [view, setView] = useState<'users' | 'alerts' | 'contacts' | 'cms'>('alerts');
  const [loading, setLoading] = useState(true);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [selectedContact, setSelectedContact] = useState<ContactMessage | null>(null);
  const [mobileDetailView, setMobileDetailView] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    type: string;
    message: string;
    onResolve: () => Promise<void>;
  } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string | null>(null);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [contactSearchTerm, setContactSearchTerm] = useState('');
  const [alertFilter, setAlertFilter] = useState<'all' | 'pending' | 'active' | 'resolved'>('all');
  const [contactFilter, setContactFilter] = useState<'all' | 'unread' | 'read' | 'resolved'>('all');
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'user' | 'operator' | 'admin'>('all');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const howlRef = React.useRef<Howl | null>(null);
  const notificationHowlRef = React.useRef<Howl | null>(null);
  const lastAlertCountRef = React.useRef<number>(-1);
  const initialLoadRef = React.useRef<boolean>(true);

  const getDailyActiveUsersCount = () => {
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    return users.filter(u => {
      if (!u.lastLogin) return false;
      let t = 0;
      if (u.lastLogin && typeof (u.lastLogin as any).toMillis === 'function') {
        t = (u.lastLogin as any).toMillis();
      } else if (u.lastLogin instanceof Date) {
        t = u.lastLogin.getTime();
      } else if (typeof u.lastLogin === 'string') {
        t = new Date(u.lastLogin).getTime();
      } else if (u.lastLogin && (u.lastLogin as any).seconds) {
        t = (u.lastLogin as any).seconds * 1000;
      }
      return t > oneDayAgo;
    }).length;
  };

  const toggleAudio = (url: string) => {
    if (isPlaying && currentAudioUrl === url) {
      howlRef.current?.pause();
      setIsPlaying(false);
      return;
    }

    try {
      setAudioError(null);
      
      if (currentAudioUrl !== url) {
        if (howlRef.current) {
          howlRef.current.unload();
        }

        const sound = new Howl({
          src: [url],
          html5: true, // Use HTML5 Audio for large files/data URIs
          format: ['webm', 'mp4', 'ogg', 'wav', 'aac'],
          onload: () => {
            console.log("Audio loaded successfully");
          },
          onplay: () => {
            setIsPlaying(true);
            setCurrentAudioUrl(url);
          },
          onpause: () => {
            setIsPlaying(false);
          },
          onstop: () => {
            setIsPlaying(false);
          },
          onend: () => {
            setIsPlaying(false);
          },
          onloaderror: (id, error) => {
            console.error("Howler load error:", error);
            setIsPlaying(false);
            setAudioError("Fichier illisible.");
          },
          onplayerror: (id, error) => {
            console.error("Howler play error:", error);
            setIsPlaying(false);
            setAudioError("Erreur de lecture.");
          }
        });

        howlRef.current = sound;
        setCurrentAudioUrl(url);
      }

      if (howlRef.current) {
        if (howlRef.current.state() === 'unloaded') {
          howlRef.current.load();
        }
        howlRef.current.play();
      }
    } catch (err: any) {
      console.error("Playback failed:", err);
      setIsPlaying(false);
      setAudioError("Erreur.");
    }
  };

  const downloadAudio = (incident: Incident) => {
    if (!incident.audioUrl) return;
    
    const link = document.createElement('a');
    link.href = incident.audioUrl;
    
    let extension = 'webm';
    const mime = incident.audioMimeType || incident.audioUrl;
    
    if (mime.includes('audio/mp4')) extension = 'mp4';
    else if (mime.includes('audio/ogg')) extension = 'ogg';
    else if (mime.includes('audio/wav')) extension = 'wav';
    else if (mime.includes('audio/aac')) extension = 'aac';
    
    link.download = `sos-audio-${incident.id?.slice(-6)}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    // Pre-load notification sound
    notificationHowlRef.current = new Howl({
      src: ['https://assets.mixkit.co/active_storage/sfx/951/951-preview.mp3'],
      volume: 0.5,
      preload: true
    });

    return () => {
      howlRef.current?.unload();
      notificationHowlRef.current?.unload();
    };
  }, []);

  // Synchronize current user profile reactively
  useEffect(() => {
    if (!auth.currentUser) return;
    const unsubProfile = onSnapshot(doc(db, 'users', auth.currentUser.uid), (snap) => {
      if (snap.exists()) {
        setCurrentUserProfile(snap.data() as UserProfile);
      }
    }, (error) => {
      console.error("Error subscribing to profile:", error);
    });
    return () => {
      unsubProfile();
    };
  }, []);

  // Synchronize incidents strictly depending on operator permissions/type
  useEffect(() => {
    if (!currentUserProfile) return;

    if (currentUserProfile.role === 'admin') {
      const qIncidents = query(
        collection(db, 'incidents'),
        orderBy('createdAt', 'desc')
      );
      const unsubIncidents = onSnapshot(qIncidents, (snapshot) => {
        const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as any));
        setIncidents(docs);
        setLoading(false);
      }, (error) => {
        console.error("Error subscribing to incidents for admin stats:", error);
        setLoading(false);
      });
      return () => {
        unsubIncidents();
      };
    }

    if (currentUserProfile.role === 'operator') {
      const opType = currentUserProfile.operatorType || 'pompiers';
      const qIncidents = query(
        collection(db, 'incidents'),
        where('targetOperatorType', '==', opType),
        orderBy('createdAt', 'desc')
      );

      const unsubIncidents = onSnapshot(qIncidents, (snapshot) => {
        const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as any));
        
        // Notify on new pending alerts
        const pendingCount = docs.filter(i => i.status === 'pending').length;
        
        if (initialLoadRef.current) {
          lastAlertCountRef.current = pendingCount;
          initialLoadRef.current = false;
        } else if (pendingCount > lastAlertCountRef.current && notificationsEnabled) {
          notificationHowlRef.current?.play();
          
          if (!notificationHowlRef.current?.playing()) {
             const fallback = new Audio('https://assets.mixkit.co/active_storage/sfx/951/951-preview.mp3');
             fallback.volume = 0.5;
             fallback.play().catch(e => console.log("Audio notification blocked", e));
          }
        }
        
        lastAlertCountRef.current = pendingCount;
        setIncidents(docs);
        setLoading(false);
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'incidents');
      });

      return () => {
        unsubIncidents();
      };
    }
  }, [currentUserProfile, notificationsEnabled]);

  useEffect(() => {
    const qUsers = query(collection(db, 'users'), orderBy('lastLogin', 'desc'));
    const unsubUsers = onSnapshot(qUsers, (snapshot) => {
      setUsers(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as any)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'users');
    });

    const qContacts = query(collection(db, 'contacts'), orderBy('createdAt', 'desc'));
    const unsubContacts = onSnapshot(qContacts, (snapshot) => {
      setContacts(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as any)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'contacts');
    });

    const unsubAppConfig = onSnapshot(doc(db, 'app_config', 'content'), (snap) => {
      if (snap.exists()) {
        setAppContent(snap.data() as AppContent);
      }
    });

    const qAnnouncements = query(collection(db, 'announcements'), orderBy('createdAt', 'desc'));
    const unsubAnnouncements = onSnapshot(qAnnouncements, (snapshot) => {
      setAnnouncements(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as any)));
    });

    return () => {
      unsubUsers();
      unsubContacts();
      unsubAppConfig();
      unsubAnnouncements();
    };
  }, []);

  const updateUserRole = async (
    userId: string, 
    newRole: 'user' | 'operator' | 'admin', 
    operatorType: OperatorType | null = null
  ) => {
    let message = `Changer le rôle de l'utilisateur ?`;
    if (newRole === 'admin') {
      message = "Promouvoir cet utilisateur au rang d'Administrateur ? Il aura les pleins pouvoirs de gestion.";
    } else if (newRole === 'operator') {
      const opLabel = operatorType === 'vbg_agression' ? 'Cellule VBG & Agression Sexuelle' : operatorType === 'pompiers' ? 'Sapeurs-Pompiers' : 'Police Secours';
      message = `Promouvoir cet utilisateur comme Opérateur d'alerte (${opLabel}) ?`;
    } else if (userId === auth.currentUser?.uid) {
      message = "Vous allez révoquer vos propres droits d'administrateur. Êtes-vous sûr ?";
    }

    setPendingAction({
      type: 'update_role',
      message,
      onResolve: async () => {
        const updateData: any = { role: newRole };
        if (newRole === 'operator') {
          updateData.operatorType = operatorType;
        } else {
          updateData.operatorType = null;
        }
        await updateDoc(doc(db, 'users', userId), updateData);
      }
    });
  };

  const toggleUserStatus = async (userId: string, currentStatus?: string) => {
    const newStatus = currentStatus === 'suspended' ? 'active' : 'suspended';
    const message = newStatus === 'suspended' ? "Suspendre ce compte utilisateur ?" : "Réactiver ce compte utilisateur ?";
    
    setPendingAction({
      type: 'toggle_status',
      message,
      onResolve: async () => {
        await updateDoc(doc(db, 'users', userId), { status: newStatus });
      }
    });
  };

  const deleteUser = async (userId: string) => {
    setPendingAction({
      type: 'delete_user',
      message: "Supprimer cet utilisateur définitivement ? Cette action est irréversible.",
      onResolve: async () => {
        await deleteDoc(doc(db, 'users', userId));
      }
    });
  };

  const deleteIncident = async (id: string) => {
    setPendingAction({
      type: 'delete_alert',
      message: "Supprimer cette alerte définitivement ?",
      onResolve: async () => {
        await deleteDoc(doc(db, 'incidents', id));
        if (selectedIncident?.id === id) {
          setSelectedIncident(null);
          setMobileDetailView(false);
        }
      }
    });
  };

  const deleteResolvedIncidents = async () => {
    const resolvedIds = incidents.filter(i => i.status === 'resolved').map(i => i.id);
    if (resolvedIds.length === 0) {
      alert("Aucune alerte résolue à supprimer.");
      return;
    }
    
    setPendingAction({
      type: 'delete_bulk_alerts',
      message: `Supprimer définitivement ${resolvedIds.length} alertes résolues pour libérer de l'espace ?`,
      onResolve: async () => {
        const toDelete = resolvedIds.slice(0, 50);
        for (const id of toDelete) {
          if (id) await deleteDoc(doc(db, 'incidents', id));
        }
      }
    });
  };

  const updateIncidentStatus = async (id: string, status: string) => {
    const message = status === 'resolved' 
      ? "Clôturer cette alerte comme résolue ?" 
      : status === 'active' 
      ? "Prendre en charge cette alerte ?" 
      : "Rétablir l'état de cette alerte ?";

    setPendingAction({
      type: 'update_status',
      message,
      onResolve: async () => {
        try {
          const updateData: any = { 
            status,
            updatedAt: serverTimestamp()
          };

          if (status === 'active' && currentUserProfile) {
            updateData.responderId = currentUserProfile.uid;
            updateData.responderName = currentUserProfile.displayName || currentUserProfile.email.split('@')[0];
            updateData.responderPhone = currentUserProfile.phoneNumber || '';
          }

          await updateDoc(doc(db, 'incidents', id), updateData);
        } catch (err) {
          handleFirestoreError(err, OperationType.UPDATE, `incidents/${id}`);
        }
      }
    });
  };

  const toggleRemoteSignal = async (incident: Incident) => {
    if (!incident.id) return;
    try {
      await updateDoc(doc(db, 'incidents', incident.id), { 
        isSignalRequested: !incident.isSignalRequested,
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `incidents/${incident.id}`);
    }
  };

  const updateContactStatus = async (id: string, status: 'unread' | 'read' | 'resolved') => {
    if (status === 'read') {
      // Quietly update without confirmation when just reading
      try {
        await updateDoc(doc(db, 'contacts', id), { status });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `contacts/${id}`);
      }
      return;
    }

    setPendingAction({
      type: 'update_contact',
      message: status === 'resolved' ? "Marquer ce message comme résolu ?" : "Changer le statut du message ?",
      onResolve: async () => {
        await updateDoc(doc(db, 'contacts', id), { status });
      }
    });
  };

  const deleteContact = async (id: string) => {
    setPendingAction({
      type: 'delete_contact',
      message: "Supprimer ce message définitivement ?",
      onResolve: async () => {
        await deleteDoc(doc(db, 'contacts', id));
        if (selectedContact?.id === id) setSelectedContact(null);
      }
    });
  };

  const executePendingAction = async () => {
    if (!pendingAction) return;
    setActionLoading(true);
    try {
      await pendingAction.onResolve();
      setPendingAction(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `admin/action/${pendingAction.type}`);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-700';
      case 'active': return 'bg-blue-100 text-blue-700';
      case 'resolved': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24">
      {/* CMS View */}
      {view === 'cms' && <CMSView appContent={appContent} announcements={announcements} handleFirestoreError={handleFirestoreError} />}
      
      {/* Admin Header */}
      <div className={cn(
        "bg-white border-b border-gray-100 px-4 md:px-6 py-4 md:py-6 sticky top-16 z-30",
        view === 'cms' && "hidden" // Header is handled inside CMSView or just standard
      )}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="p-1.5 md:p-2 bg-red-600 text-white rounded-xl shadow-lg shadow-red-200">
              <Shield size={20} className="md:w-6 md:h-6" />
            </div>
            <div>
              <h1 className="text-base md:text-xl font-black text-gray-900 uppercase tracking-tighter">Panel Administrateur</h1>
              <p className="text-[8px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest">Gestion E-Secours</p>
              
              <div className="flex items-center mt-1">
                <div className={cn(
                  "w-1.5 h-1.5 rounded-full",
                  isOffline ? "bg-amber-500 animate-pulse" : "bg-green-500"
                )} />
                <span className={cn(
                   "text-[7px] md:text-[8px] font-black uppercase tracking-[0.15em] ml-1.5",
                   isOffline ? "text-amber-500" : "text-green-500"
                )}>
                  {isOffline ? 'Sync Suspendue' : 'Serveur Connecté'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4 overflow-x-auto no-scrollbar scroll-smooth">
            <button 
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              className={cn(
                "p-2.5 md:p-2 rounded-xl transition-all border shadow-sm flex items-center gap-2 shrink-0",
                notificationsEnabled 
                  ? "bg-amber-50 text-amber-600 border-amber-100" 
                  : "bg-gray-50 text-gray-400 border-gray-100"
              )}
              title={notificationsEnabled ? "Désactiver les notifications" : "Activer les notifications"}
            >
              {notificationsEnabled ? <Bell size={18} className="animate-swing" /> : <Bell size={18} />}
              <span className="hidden lg:inline text-[10px] font-black uppercase tracking-widest leading-none">
                {notificationsEnabled ? "Alertes ON" : "Alertes OFF"}
              </span>
            </button>

            <div className="flex bg-gray-100 p-1 rounded-2xl relative shrink-0">
            <button 
              onClick={() => {
                setView('alerts');
                setMobileDetailView(false);
                setSearchTerm('');
              }}
              className={cn(
                "flex items-center gap-2 px-3 md:px-4 py-2.5 md:py-2 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-tighter transition-all relative whitespace-nowrap",
                view === 'alerts' ? "bg-white text-red-600 shadow-sm" : "text-gray-500 hover:text-gray-900"
              )}
            >
              <AlertCircle size={14} className={cn(
                incidents.some(i => i.status === 'pending') && "text-red-600 animate-pulse"
              )} />
              <span className="hidden sm:inline">Alertes</span> ({incidents.filter(i => i.status !== 'resolved').length})
              {incidents.some(i => i.status === 'pending') && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-600 rounded-full border-2 border-white animate-bounce" />
              )}
            </button>
            <button 
              onClick={() => {
                setView('users');
                setMobileDetailView(false);
                setSearchTerm('');
              }}
              className={cn(
                "flex items-center gap-2 px-3 md:px-4 py-2.5 md:py-2 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-tighter transition-all whitespace-nowrap",
                view === 'users' ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-900"
              )}
            >
              <Users size={14} />
              <span className="hidden sm:inline">Utilisateurs</span> ({users.length})
            </button>
            <button 
              onClick={() => {
                setView('contacts');
                setMobileDetailView(false);
                setSearchTerm('');
                setContactSearchTerm('');
              }}
              className={cn(
                "flex items-center gap-2 px-3 md:px-4 py-2.5 md:py-2 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-tighter transition-all relative whitespace-nowrap",
                view === 'contacts' ? "bg-white text-purple-600 shadow-sm" : "text-gray-500 hover:text-gray-900"
              )}
            >
              <Mail size={14} />
              <span className="hidden sm:inline">Messages</span> ({contacts.filter(c => c.status === 'unread').length})
              {contacts.some(c => c.status === 'unread') && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-purple-600 rounded-full border-2 border-white animate-pulse" />
              )}
            </button>
            <button 
              onClick={() => {
                setView('cms');
                setMobileDetailView(false);
              }}
              className={cn(
                "flex items-center gap-2 px-3 md:px-4 py-2.5 md:py-2 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-tighter transition-all whitespace-nowrap",
                view === 'cms' ? "bg-white text-green-600 shadow-sm" : "text-gray-500 hover:text-gray-900"
              )}
            >
              <Layout size={14} />
              <span className="hidden sm:inline">CMS</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    {view !== 'cms' && (
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
        {view === 'alerts' ? (
          currentUserProfile?.role === 'admin' ? (
            <AdminStatsTab 
              users={users} 
              incidents={incidents} 
              announcements={announcements} 
              contacts={contacts} 
            />
          ) : (
            <div className="space-y-8">
              {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
               {[
                 { label: 'Total Alertes', value: incidents.length, icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50' },
                 { label: 'En Attente', value: incidents.filter(i => i.status === 'pending').length, icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
                 { label: 'En Cours', value: incidents.filter(i => i.status === 'active').length, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
                 { label: 'Résolues', value: incidents.filter(i => i.status === 'resolved').length, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
               ].map((stat, i) => (
                 <div key={i} className="bg-white border border-gray-100 p-4 md:p-6 rounded-[24px] shadow-sm flex flex-col justify-between gap-4">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", stat.bg, stat.color)}>
                       <stat.icon size={20} />
                    </div>
                    <div>
                       <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</div>
                       <div className="text-xl md:text-2xl font-black text-gray-900 leading-none">{stat.value}</div>
                    </div>
                 </div>
               ))}
            </div>

            {/* Operator's Shared Analytical Dashboard */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-[32px] border border-gray-200/50 shadow-sm mb-6 w-full">
              
              {/* Couverture des Fiches de Sûreté Médicale */}
              <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-4 font-sans">
                <div className="flex items-center justify-between border-b border-gray-50 pb-3">
                  <div>
                    <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest flex items-center gap-1.5">
                      <HeartPulse size={14} className="text-rose-500" />
                      Couverture des Fiches de Sûreté Médicale
                    </h3>
                    <p className="text-[9px] font-bold text-gray-400 uppercase">Données vitales rattachées aux alertes de type {currentUserProfile?.operatorType === 'pompiers' ? 'Sapeurs-Pompiers' : 'Forces de Police'}</p>
                  </div>
                  <span className="bg-rose-50 text-rose-600 text-[9px] font-black px-2 py-0.5 rounded-lg uppercase">
                    Sûreté SOS
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Groupes Sanguins", count: incidents.filter(i => i.bloodType && i.bloodType !== '').length, icon: Sparkles, color: 'text-rose-600', bg: 'bg-rose-50' },
                    { label: "Allergies Signalées", count: incidents.filter(i => i.allergies && i.allergies !== '').length, icon: ShieldAlert, color: 'text-amber-600', bg: 'bg-amber-50' },
                    { label: "Contacts d'Urgence", count: incidents.filter(i => i.emergencyContact && i.emergencyContact !== '').length, icon: Phone, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: "Traitements Suivis", count: incidents.filter(i => i.medications && i.medications !== '').length, icon: Pill, color: 'text-purple-600', bg: 'bg-purple-50' },
                  ].map((item, idx) => {
                    const total = incidents.length || 1;
                    const pct = Math.round((item.count / total) * 100);
                    return (
                      <div key={idx} className="bg-slate-50 p-3.5 rounded-2xl flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                          <span className="text-[9px] font-black text-gray-400 uppercase tracking-wide leading-tight">{item.label}</span>
                          <span className={cn("text-[10px] font-extrabold px-1.5 py-0.5 rounded-md", item.bg, item.color)}>{pct}%</span>
                        </div>
                        <div className="mt-2.5">
                          <div className="text-lg font-black text-gray-900 leading-none">{item.count} <span className="text-[10px] text-gray-400 font-bold">sos</span></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Carte Médicale */}
              <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-4 font-sans">
                <div className="flex items-center justify-between border-b border-gray-50 pb-3">
                  <div>
                    <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest flex items-center gap-1.5">
                      <BarChart3 size={14} className="text-indigo-500" />
                      Carte Médicale (Répartition Générale)
                    </h3>
                    <p className="text-[9px] font-bold text-gray-400 uppercase">Profils biologiques cumulés des alertes reçues</p>
                  </div>
                  <span className="bg-indigo-50 text-indigo-600 text-[9px] font-black px-2 py-0.5 rounded-lg uppercase">
                    Statistiques
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <span className="text-[9px] font-black text-gray-400 uppercase block">Analyse des Groupes Sanguins</span>
                      <div className="space-y-1.5 max-h-[110px] overflow-y-auto pr-1">
                        {['A+', 'O+', 'B+', 'AB+', 'O-', 'A-', 'B-', 'AB-'].map((group) => {
                          const count = incidents.filter(i => i.bloodType === group).length;
                          const total = incidents.filter(i => i.bloodType && i.bloodType !== '').length || 1;
                          const pct = Math.round((count / total) * 100);
                          return (
                            <div key={group} className="flex items-center justify-between text-[10px] font-bold">
                              <span className="text-gray-900 font-extrabold">{group}</span>
                              <div className="flex-1 h-1.5 bg-gray-50 mx-2 rounded-full overflow-hidden">
                                <div className="h-full bg-rose-500 rounded-full" style={{ width: `${pct}%` }}></div>
                              </div>
                              <span className="text-gray-400 shrink-0 font-mono text-[9px]">{count}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-2 border-l border-gray-100 pl-4">
                      <span className="text-[9px] font-black text-gray-400 uppercase block">Types des urgences affectées</span>
                      <div className="space-y-1.5 max-h-[110px] overflow-y-auto pr-1">
                        {[
                          { key: 'vbg', label: '💜 VBG' },
                          { key: 'agression_sexuelle', label: '🛡️ Agression Sex.' },
                          { key: 'medical', label: '🚑 Médical' },
                          { key: 'accident', label: '🚗 Accident' },
                          { key: 'incendie', label: '🔥 Incendie' },
                          { key: 'agression', label: '👤 Violences' },
                          { key: 'vol', label: '🎒 Vols' },
                        ].map((item) => {
                          const count = incidents.filter(i => i.type === item.key).length;
                          const total = incidents.length || 1;
                          const pct = Math.round((count / total) * 100);
                          return (
                            <div key={item.key} className="flex items-center justify-between text-[10px] font-bold">
                              <span className="text-gray-900 text-[9px] font-bold truncate max-w-[70px]">{item.label}</span>
                              <div className="flex-1 h-1.5 bg-gray-55 mx-2 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${pct}%` }}></div>
                              </div>
                              <span className="text-gray-400 shrink-0 font-mono text-[9px]">{count}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Alerts List */}
            <div className={cn(
              "lg:col-span-1 space-y-4",
              mobileDetailView ? "hidden lg:block" : "block"
            )}>
              <div className="flex flex-col gap-4 mb-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest">Alertes Récentes</h2>
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                    <Activity size={12} className="text-red-500 animate-pulse" />
                    Live
                  </div>
                </div>
                
                <div className="flex flex-col gap-3">
                  <div className="relative">
                     <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                     <input 
                       type="text" 
                       placeholder="Chercher nom, type ou description..."
                       value={searchTerm}
                       onChange={(e) => setSearchTerm(e.target.value)}
                       className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-medium outline-none focus:ring-2 ring-red-50 border-red-100 transition-all"
                     />
                  </div>

                  <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar">
                     {(['all', 'pending', 'active', 'resolved'] as const).map((f) => (
                       <button
                         key={f}
                         onClick={() => setAlertFilter(f)}
                         className={cn(
                           "px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-tighter transition-all whitespace-nowrap border",
                           alertFilter === f 
                             ? "bg-gray-900 text-white border-gray-900 shadow-sm" 
                             : "bg-white text-gray-500 border-gray-200 hover:border-gray-400"
                         )}
                       >
                         {f === 'all' ? 'Toutes' : f === 'pending' ? 'En attente' : f === 'active' ? 'En cours' : 'Résolues'}
                       </button>
                     ))}
                   </div>

                   {alertFilter === 'resolved' && incidents.some(i => i.status === 'resolved') && (
                    <button 
                      onClick={deleteResolvedIncidents}
                      className="w-full flex items-center justify-center gap-2 px-3 py-3 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-tighter transition-all border border-red-100/50 shadow-sm"
                    >
                      <RotateCcw size={14} />
                      Vider les archives ({incidents.filter(i => i.status === 'resolved').length})
                    </button>
                   )}
                </div>
              </div>

              {incidents.filter(i => {
                  const matchesStatus = alertFilter === 'all' || i.status === alertFilter;
                  const matchesSearch = searchTerm.trim() === '' || 
                    i.userFullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    i.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    i.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    i.type?.toLowerCase().includes(searchTerm.toLowerCase());
                  return matchesStatus && matchesSearch;
              }).length === 0 ? (
                <div className="bg-white border border-gray-100 rounded-3xl p-12 text-center shadow-sm">
                  <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-gray-300">
                    <Activity size={24} />
                  </div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Aucune alerte {alertFilter !== 'all' ? alertFilter : ''}</p>
                </div>
              ) : (
                incidents
                  .filter(i => {
                    const matchesStatus = alertFilter === 'all' || i.status === alertFilter;
                    const matchesSearch = searchTerm.trim() === '' || 
                      i.userFullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      i.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      i.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      i.type?.toLowerCase().includes(searchTerm.toLowerCase());
                    return matchesStatus && matchesSearch;
                  })
                  .map((incident) => (
                  <motion.div
                    key={incident.id}
                    layoutId={incident.id}
                    onClick={() => {
                      setSelectedIncident(incident);
                      setMobileDetailView(true);
                    }}
                    className={cn(
                      "p-5 rounded-[32px] border transition-all cursor-pointer group hover:shadow-xl hover:-translate-y-1",
                      selectedIncident?.id === incident.id 
                        ? "bg-white border-red-200 shadow-xl ring-2 ring-red-50" 
                        : "bg-white border-gray-100 shadow-sm"
                    )}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "p-2 rounded-xl",
                          incident.status === 'pending' ? "bg-red-50 text-red-600 animate-pulse" : "bg-gray-50 text-gray-400"
                        )}>
                          <ShieldAlert size={20} />
                        </div>
                        {incident.status !== 'resolved' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleRemoteSignal(incident);
                            }}
                            className={cn(
                              "p-2 rounded-xl transition-all",
                              incident.isSignalRequested 
                                ? "bg-red-600 text-white animate-pulse" 
                                : "bg-gray-100 text-gray-400 hover:text-red-600 hover:bg-red-50"
                            )}
                            title="Signal Sonore"
                          >
                            <Volume2 size={16} />
                          </button>
                        )}
                      </div>
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                        getStatusColor(incident.status)
                      )}>
                        {incident.status === 'pending' ? 'Attente' : incident.status === 'active' ? 'En cours' : 'Résolu'}
                      </span>
                    </div>

                    <h3 className="text-sm font-black text-gray-900 uppercase mb-1">{incident.type}</h3>
                    <p className="text-[10px] font-bold text-gray-400 mb-3 line-clamp-1">
                      {incident.location.address || 'Adresse inconnue'}
                    </p>

                    {incident.responderName && (
                      <div className="mb-3 text-[9px] font-black uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-100/55 px-2 rounded-lg py-1 flex items-center gap-1.5 w-fit">
                        <ShieldAlert size={10} className="text-indigo-500" />
                        <span>Pris en charge par: <span className="font-extrabold text-indigo-900">{incident.responderName}</span></span>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                      <div className="flex items-center gap-1.5 text-gray-400">
                        <Clock size={10} />
                        <span className="text-[9px] font-black">
                          {incident.createdAt?.toDate ? format(incident.createdAt.toDate(), 'HH:mm', { locale: fr }) : '...'}
                        </span>
                      </div>
                      <ChevronRight size={14} className="text-gray-300 transform group-hover:translate-x-1 transition-transform" />
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Alert Details */}
            <div className={cn(
              "lg:col-span-2",
              selectedIncident && mobileDetailView ? "block" : "hidden lg:block"
            )}>
              {selectedIncident ? (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white border border-gray-100 rounded-[32px] md:rounded-[40px] shadow-2xl overflow-hidden sticky top-48"
                >
                  {/* Mobile Back Button */}
                  <button 
                    onClick={() => setMobileDetailView(false)}
                    className="lg:hidden absolute top-4 left-4 z-20 bg-white/90 backdrop-blur-md p-2 rounded-xl shadow-lg border border-white"
                  >
                    <ArrowLeft size={18} />
                  </button>

                  {/* Map Header */}
                  <div className="h-48 md:h-64 relative bg-gray-900">
                    <MapPreview 
                      centerLat={selectedIncident.location.lat}
                      centerLng={selectedIncident.location.lng}
                      userLat={selectedIncident.location.lat}
                      userLng={selectedIncident.location.lng}
                      precision={selectedIncident.location.precision}
                    />
                    <div className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur-md px-3 md:px-4 py-1.5 md:py-2 rounded-2xl shadow-lg border border-white">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
                        <span className="text-[8px] md:text-[10px] font-black text-gray-900 uppercase">Alerte Critique</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 md:p-8 max-h-[calc(100vh-320px)] overflow-y-auto custom-scrollbar">
                    <div className="flex flex-col md:flex-row items-start justify-between gap-4 mb-6 md:mb-8">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-[10px] font-black text-red-600 uppercase tracking-widest bg-red-50 px-2 py-0.5 rounded-md">Urgence {selectedIncident.type}</span>
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">ID: {selectedIncident.id?.slice(-6)}</span>
                        </div>
                        <h2 className="text-xl md:text-3xl font-black text-gray-900 tracking-tightest leading-tight md:leading-none">Détails de l'incident</h2>
                      </div>
                      
                        <div className="flex gap-2 w-full md:w-auto">
                          {selectedIncident.status === 'resolved' && (
                            <button 
                              onClick={() => deleteIncident(selectedIncident.id!)}
                              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-red-50 text-red-600 border border-red-100 px-4 md:px-6 py-2.5 md:py-3 rounded-xl md:rounded-2xl text-[10px] md:text-xs font-black uppercase tracking-tighter active:scale-95 transition-all text-center"
                            >
                              <Trash2 size={16} />
                              Supprimer
                            </button>
                          )}
                          {selectedIncident.status !== 'resolved' && (
                            <button 
                              onClick={() => updateIncidentStatus(selectedIncident.id!, 'resolved')}
                              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-green-600 text-white px-4 md:px-6 py-2.5 md:py-3 rounded-xl md:rounded-2xl text-[10px] md:text-xs font-black uppercase tracking-tighter shadow-lg shadow-green-200 active:scale-95 transition-all text-center"
                            >
                              <CheckCircle2 size={16} />
                              <span className="whitespace-nowrap">Marquer Résolu</span>
                            </button>
                          )}
                        {selectedIncident.status === 'pending' && (
                          <button 
                            onClick={() => updateIncidentStatus(selectedIncident.id!, 'active')}
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-blue-600 text-white px-4 md:px-6 py-2.5 md:py-3 rounded-xl md:rounded-2xl text-[10px] md:text-xs font-black uppercase tracking-tighter shadow-lg shadow-blue-200 active:scale-95 transition-all text-center"
                          >
                            Assister
                          </button>
                        )}
                        {selectedIncident.status !== 'resolved' && (
                          <button 
                            onClick={() => toggleRemoteSignal(selectedIncident)}
                            className={cn(
                              "flex-1 md:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-2.5 md:py-3 rounded-xl md:rounded-2xl text-[10px] md:text-xs font-black uppercase tracking-tighter active:scale-95 transition-all text-center",
                              selectedIncident.isSignalRequested 
                                ? "bg-red-600 text-white shadow-lg shadow-red-200" 
                                : "bg-red-50 text-red-600 border border-red-100"
                            )}
                            title={selectedIncident.isSignalRequested ? "Arrêter le signal sonore" : "Lancer le signal sonore"}
                          >
                            {selectedIncident.isSignalRequested ? (
                              <BellRing size={16} className="animate-bounce" />
                            ) : (
                              <Megaphone size={16} />
                            )}
                            <span className="hidden sm:inline">
                              {selectedIncident.isSignalRequested ? "SIGNAL ACTIF" : "SIGNAL SONORE"}
                            </span>
                          </button>
                        )}
                      </div>
                    </div>

                    {selectedIncident.responderName && (
                      <div className="mb-6 bg-indigo-50 border border-indigo-100 rounded-3xl p-5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-white shadow-sm rounded-2xl text-indigo-600">
                            <ShieldAlert size={18} />
                          </div>
                          <div>
                            <div className="text-[9px] font-black text-indigo-400 uppercase tracking-widest leading-none mb-1">Responsable Secours</div>
                            <div className="text-xs font-black text-indigo-950 uppercase">{selectedIncident.responderName}</div>
                          </div>
                        </div>
                        
                        <button
                          onClick={async () => {
                             try {
                               await updateDoc(doc(db, 'users', selectedIncident.userId), { alertTriggered: true });
                               alert("Signal sonore envoyé avec succès.");
                             } catch (err) {
                               console.error("Erreur envoi signal", err);
                             }
                          }}
                          className="flex items-center gap-2 bg-rose-600 text-white text-[9px] font-black uppercase px-3 py-2 rounded-xl shadow-lg hover:bg-rose-700 transition-all"
                        >
                          <Volume2 size={12} />
                          Faire sonner téléphone
                        </button>

                        <span className={cn(
                          "text-[9px] font-black px-2.5 py-1 rounded-xl uppercase tracking-wider",
                          selectedIncident.status === 'resolved' ? "bg-green-100 text-green-700" : "bg-indigo-100 text-indigo-705"
                        )}>
                          {selectedIncident.status === 'resolved' ? "Traité & Clos" : "En cours d'intervention"}
                        </span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 mb-6 md:mb-8">
                      <div className="space-y-6">
                        <div>
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Demandeur</label>
                          <div className="bg-gray-50 rounded-2xl p-4 flex items-center gap-4 border border-gray-100">
                             <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-blue-600 font-black">
                               {selectedIncident.userName?.[0] || 'U'}
                             </div>
                             <div>
                               <div className="text-sm font-black text-gray-900 uppercase">{selectedIncident.userFullName || selectedIncident.userName || 'Inconnu'}</div>
                               <div className="text-[10px] font-bold text-gray-400 leading-tight">
                                 {selectedIncident.userPhone || 'Pas de numéro'}<br/>
                                 {selectedIncident.userEmail}
                               </div>
                             </div>
                          </div>
                          {selectedIncident.userAddress && (
                            <div className="mt-2 text-[10px] font-medium text-gray-500 bg-white p-2 rounded-lg border border-gray-100 flex items-center gap-2">
                              <MapPin size={12} />
                              <span className="line-clamp-1">{selectedIncident.userAddress}</span>
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Message Vocal</label>
                          {selectedIncident.audioUrl ? (
                            <div className={cn(
                              "rounded-2xl p-4 flex items-center justify-between border transition-all",
                              audioError ? "bg-red-50 border-red-100" : "bg-blue-50 border-blue-100"
                            )}>
                               <div className="flex items-center gap-3">
                                  <div className={cn(
                                    "p-2 rounded-xl text-white",
                                    audioError ? "bg-red-500" : "bg-blue-600"
                                  )}>
                                     {audioError ? <ShieldAlert size={18} /> : <Volume2 size={18} />}
                                  </div>
                                  <div>
                                     <div className={cn(
                                       "text-[10px] font-black uppercase tracking-tight",
                                       audioError ? "text-red-600" : "text-blue-600"
                                     )}>
                                       {audioError || "Audio Enregistré"}
                                     </div>
                                     <button 
                                      onClick={() => downloadAudio(selectedIncident)}
                                      className="text-[8px] font-bold text-gray-400 uppercase hover:underline block text-left"
                                     >
                                       Télécharger le fichier
                                     </button>
                                  </div>
                               </div>
                               <button 
                                onClick={() => toggleAudio(selectedIncident.audioUrl!)}
                                className={cn(
                                  "w-10 h-10 rounded-full shadow-md flex items-center justify-center active:scale-90 transition-all",
                                  isPlaying && currentAudioUrl === selectedIncident.audioUrl 
                                    ? "bg-blue-600 text-white" 
                                    : "bg-white text-blue-600"
                                )}
                               >
                                 {isPlaying && currentAudioUrl === selectedIncident.audioUrl ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
                               </button>
                            </div>
                          ) : (
                            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 text-[10px] font-bold text-gray-400 uppercase text-center italic">
                                Aucun enregistrement audio
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Description</label>
                          <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 italic text-gray-700 text-sm font-medium">
                            "{selectedIncident.description || 'Aucune description fournie'}"
                          </div>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div>
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Informations Médicales</label>
                          <div className="bg-red-50/50 rounded-2xl p-6 border border-red-100 text-red-900/70 text-sm font-medium space-y-3">
                            {selectedIncident.medicalInfo && (
                              <p><span className="font-black uppercase text-[10px] opacity-70">Fiche:</span> {selectedIncident.medicalInfo}</p>
                            )}
                            {selectedIncident.age && (
                              <p><span className="font-black uppercase text-[10px] opacity-70">Âge:</span> {selectedIncident.age} ans</p>
                            )}
                            {selectedIncident.sex && (
                              <p><span className="font-black uppercase text-[10px] opacity-70">Sexe:</span> {selectedIncident.sex === 'M' ? 'Masculin' : selectedIncident.sex === 'F' ? 'Féminin' : selectedIncident.sex}</p>
                            )}
                            {selectedIncident.weight && (
                              <p><span className="font-black uppercase text-[10px] opacity-70">Poids:</span> {selectedIncident.weight} kg</p>
                            )}
                            {selectedIncident.bloodType && (
                              <p><span className="font-black uppercase text-[10px] opacity-70">Groupe Sanguin:</span> {selectedIncident.bloodType}</p>
                            )}
                            {selectedIncident.allergies && (
                              <p><span className="font-black uppercase text-[10px] opacity-70">Allergies:</span> {selectedIncident.allergies}</p>
                            )}
                            {selectedIncident.medications && (
                              <p><span className="font-black uppercase text-[10px] opacity-70">Traitements:</span> {selectedIncident.medications}</p>
                            )}
                            {!selectedIncident.medicalInfo && !selectedIncident.age && !selectedIncident.sex && !selectedIncident.weight && !selectedIncident.bloodType && !selectedIncident.allergies && !selectedIncident.medications && (
                              'Aucune information médicale partagée'
                            )}
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Contact d'Urgence</label>
                          <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100 text-blue-900/70 text-sm font-medium">
                            {selectedIncident.emergencyContact || 'Aucun contact partagé'}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 md:pt-8 border-t border-gray-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                       <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6 w-full md:w-auto">
                          <div className="flex items-center gap-2">
                             <div className="p-2 bg-gray-50 text-gray-400 rounded-lg">
                                <Clock size={16} />
                             </div>
                             <div>
                                <div className="text-[9px] font-black text-gray-400 uppercase">Déclaré à</div>
                                <div className="text-xs font-black text-gray-900">
                                  {selectedIncident.createdAt?.toDate ? format(selectedIncident.createdAt.toDate(), 'HH:mm:ss', { locale: fr }) : '...'}
                                </div>
                             </div>
                          </div>
                          <div className="flex items-center gap-2">
                             <div className="p-2 bg-gray-50 text-gray-400 rounded-lg">
                                <MapPin size={16} />
                             </div>
                             <div>
                                <div className="text-[9px] font-black text-gray-400 uppercase">Localisation</div>
                                <div className="text-xs font-black text-gray-900 line-clamp-1 w-full md:w-48">
                                  {selectedIncident.location.address}
                                </div>
                                <div className="flex gap-2 mt-1">
                                   <span className="text-[8px] font-black text-blue-600 bg-blue-50 px-1 rounded">LAT: {selectedIncident.location.lat.toFixed(6)}</span>
                                   <span className="text-[8px] font-black text-blue-600 bg-blue-50 px-1 rounded">LNG: {selectedIncident.location.lng.toFixed(6)}</span>
                                   {selectedIncident.location.altitude !== undefined && selectedIncident.location.altitude !== null && (
                                      <span className="text-[8px] font-black text-blue-600 bg-blue-50 px-1 rounded">ALT: {Math.round(selectedIncident.location.altitude)}m</span>
                                   )}
                                </div>
                             </div>
                          </div>
                       </div>

                       <button 
                        onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${selectedIncident.location.lat},${selectedIncident.location.lng}`, '_blank')}
                        className="w-full md:w-auto flex items-center justify-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-widest group bg-blue-50 md:bg-transparent p-3 md:p-0 rounded-xl"
                       >
                         Ouvrir dans Maps
                         <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                       </button>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center p-20 bg-gray-50/50 border-2 border-dashed border-gray-100 rounded-[40px] text-center">
                   <div className="w-16 h-16 bg-white rounded-3xl shadow-sm flex items-center justify-center text-gray-300 mb-4">
                      <ShieldAlert size={32} />
                   </div>
                   <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-1">Sélectionnez une alerte</h3>
                   <p className="text-xs font-bold text-gray-300 uppercase">pour voir les détails et agir</p>
                </div>
              )}
            </div>
          </div>
        </div>
          )
        ) : view === 'contacts' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className={cn(
              "lg:col-span-1 space-y-4",
              mobileDetailView && selectedContact ? "hidden lg:block" : "block"
            )}>
              <div className="flex flex-col gap-4 mb-4">
                <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest">Messages reçus</h2>
                
                <div className="flex flex-col gap-3">
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder="Chercher nom, email ou sujet..."
                      value={contactSearchTerm}
                      onChange={(e) => setContactSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-medium outline-none focus:ring-2 ring-purple-50 border-purple-100 transition-all"
                    />
                  </div>
                  
                  <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar">
                    {(['all', 'unread', 'read', 'resolved'] as const).map((f) => (
                      <button
                        key={f}
                        onClick={() => setContactFilter(f)}
                        className={cn(
                          "px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-tighter transition-all whitespace-nowrap border",
                          contactFilter === f 
                            ? "bg-purple-600 text-white border-purple-600 shadow-sm" 
                            : "bg-white text-gray-500 border-gray-200 hover:border-gray-400"
                        )}
                      >
                        {f === 'all' ? 'Tous' : f === 'unread' ? 'Non lus' : f === 'read' ? 'Lus' : 'Résolus'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {contacts.filter(c => {
                const matchesStatus = contactFilter === 'all' || c.status === contactFilter;
                const matchesSearch = contactSearchTerm.trim() === '' || 
                  c.name.toLowerCase().includes(contactSearchTerm.toLowerCase()) ||
                  c.email.toLowerCase().includes(contactSearchTerm.toLowerCase()) ||
                  c.subject?.toLowerCase().includes(contactSearchTerm.toLowerCase()) ||
                  c.message.toLowerCase().includes(contactSearchTerm.toLowerCase());
                return matchesStatus && matchesSearch;
              }).length === 0 ? (
                <div className="bg-white border border-gray-100 rounded-[32px] p-12 text-center shadow-sm">
                  <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-gray-300">
                    <Mail size={24} />
                  </div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Aucun message {contactFilter !== 'all' ? contactFilter : ''}</p>
                </div>
              ) : (
                contacts
                  .filter(c => {
                    const matchesStatus = contactFilter === 'all' || c.status === contactFilter;
                    const matchesSearch = contactSearchTerm.trim() === '' || 
                      c.name.toLowerCase().includes(contactSearchTerm.toLowerCase()) ||
                      c.email.toLowerCase().includes(contactSearchTerm.toLowerCase()) ||
                      c.subject?.toLowerCase().includes(contactSearchTerm.toLowerCase()) ||
                      c.message.toLowerCase().includes(contactSearchTerm.toLowerCase());
                    return matchesStatus && matchesSearch;
                  })
                  .map((contact) => (
                  <motion.div
                    key={contact.id}
                    onClick={() => {
                      setSelectedContact(contact);
                      setMobileDetailView(true);
                      if (contact.status === 'unread') updateContactStatus(contact.id!, 'read');
                    }}
                    className={cn(
                      "p-5 rounded-[32px] border cursor-pointer transition-all hover:shadow-lg",
                      selectedContact?.id === contact.id 
                        ? "bg-white border-purple-200 shadow-xl ring-2 ring-purple-50" 
                        : "bg-white border-gray-100 shadow-sm"
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                       <span className={cn(
                         "px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest",
                         contact.status === 'unread' ? "bg-purple-600 text-white" : 
                         contact.status === 'read' ? "bg-gray-100 text-gray-500" : 
                         "bg-green-100 text-green-700"
                       )}>
                         {contact.status}
                       </span>
                       <span className="text-[9px] font-bold text-gray-400">
                         {contact.createdAt?.toDate ? format(contact.createdAt.toDate(), 'dd/MM HH:mm', { locale: fr }) : '...'}
                       </span>
                    </div>
                    <h3 className="text-sm font-black text-gray-900 uppercase truncate">{contact.name}</h3>
                    <p className="text-[10px] font-bold text-gray-400 truncate mb-2">{contact.subject || 'Sans sujet'}</p>
                    <p className="text-xs text-gray-500 line-clamp-1 italic">"{contact.message}"</p>
                  </motion.div>
                ))
              )}
            </div>

            <div className={cn(
               "lg:col-span-2",
               selectedContact && mobileDetailView ? "block" : "hidden lg:block"
            )}>
              {selectedContact ? (
                <div className="bg-white border border-gray-100 rounded-[32px] shadow-2xl p-8 sticky top-48">
                  <button 
                    onClick={() => setMobileDetailView(false)}
                    className="lg:hidden mb-6 p-2 bg-gray-50 rounded-xl"
                  >
                    <ArrowLeft size={18} />
                  </button>

                  <div className="flex items-start justify-between mb-8">
                     <div>
                        <div className="text-[10px] font-black text-purple-600 uppercase tracking-widest mb-1">Message de contact</div>
                        <h2 className="text-2xl font-black text-gray-900">{selectedContact.name}</h2>
                     </div>
                     <div className="flex gap-2">
                        <button 
                          onClick={() => deleteContact(selectedContact.id!)}
                          className="p-3 bg-red-50 text-red-600 rounded-xl"
                        >
                          <Trash2 size={20} />
                        </button>
                        <button 
                          onClick={() => updateContactStatus(selectedContact.id!, 'resolved')}
                          className="px-4 py-2 bg-green-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-green-100"
                        >
                          RÉSOLU
                        </button>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                     <div className="space-y-4">
                        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                           <div className="text-[9px] font-black text-gray-400 uppercase mb-1">Email de l'expéditeur</div>
                           <div className="text-sm font-bold text-blue-600 underline">{selectedContact.email}</div>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                           <div className="text-[9px] font-black text-gray-400 uppercase mb-1">Sujet</div>
                           <div className="text-sm font-bold text-gray-900">{selectedContact.subject || 'Aucun sujet'}</div>
                        </div>
                     </div>
                     <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <div className="text-[9px] font-black text-gray-400 uppercase mb-1">Date d'envoi</div>
                        <div className="text-sm font-bold text-gray-900">
                           {selectedContact.createdAt?.toDate ? format(selectedContact.createdAt.toDate(), 'PPPP HH:mm:ss', { locale: fr }) : '...'}
                        </div>
                     </div>
                  </div>

                  <div>
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Message</label>
                     <div className="bg-white border-2 border-gray-100 rounded-2xl p-6 text-gray-700 leading-relaxed font-medium">
                        {selectedContact.message}
                     </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center p-20 bg-gray-50/50 border-2 border-dashed border-gray-100 rounded-[40px] text-center">
                   <div className="w-16 h-16 bg-white rounded-3xl shadow-sm flex items-center justify-center text-gray-300 mb-4">
                      <Mail size={32} />
                   </div>
                   <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">Sélectionnez un message</h3>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Users Management */
          /* Users Management */
          <div className="bg-white border border-gray-100 rounded-[32px] md:rounded-[40px] shadow-sm overflow-hidden">
             <div className="px-4 md:px-8 py-4 md:py-6 border-b border-gray-50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gray-50/50">
                <div>
                   <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest">Base de Données Utilisateurs</h2>
                   <p className="text-[10px] font-bold text-gray-400 uppercase">{users.length} comptes enregistrés</p>
                </div>
                <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                   <div className="flex items-center gap-1 bg-white p-1 border border-gray-200 rounded-xl overflow-x-auto no-scrollbar">
                     {(['all', 'user', 'operator', 'admin'] as const).map((r) => (
                       <button
                         key={r}
                         onClick={() => setUserRoleFilter(r)}
                         className={cn(
                           "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-tighter transition-all whitespace-nowrap",
                           userRoleFilter === r 
                             ? "bg-blue-600 text-white shadow-sm" 
                             : "text-gray-500 hover:bg-gray-50"
                         )}
                       >
                         {r === 'all' ? 'Tous' : r}
                       </button>
                     ))}
                   </div>
                   <div className="relative flex-1 md:flex-none">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input 
                        type="text" 
                        placeholder="Nom ou Email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium outline-none focus:ring-2 ring-blue-50 border-blue-100 transition-all md:w-64"
                      />
                   </div>
                </div>
             </div>

             <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left">
                   <thead>
                      <tr className="border-b border-gray-50">
                         <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Utilisateur</th>
                         <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Rôle</th>
                         <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Contact</th>
                         <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Dernière Connexion</th>
                         <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                      </tr>
                   </thead>
                   <tbody>
                      {users
                       .filter(u => {
                         const matchesSearch = u.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                              u.email.toLowerCase().includes(searchTerm.toLowerCase());
                         const matchesRole = userRoleFilter === 'all' || u.role === userRoleFilter;
                         return matchesSearch && matchesRole;
                       })
                       .map((user) => (
                        <tr key={user.uid} className="group border-b border-gray-50/50 hover:bg-blue-50/30 transition-colors">
                           <td className="px-8 py-6">
                              <div className="flex items-center gap-3">
                                 <div className={cn(
                                   "relative w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center font-black text-gray-600 text-xs overflow-hidden shadow-sm",
                                   user.status === 'suspended' && "grayscale opacity-50"
                                 )}>
                                   {user.photoURL ? (
                                     <img referrerPolicy="no-referrer" src={user.photoURL} alt="" className="w-full h-full object-cover" />
                                   ) : (
                                     user.displayName?.[0] || 'U'
                                   )}
                                   {user.status === 'suspended' && (
                                     <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                                       <UserMinus size={12} className="text-white" />
                                     </div>
                                   )}
                                 </div>
                                 <div>
                                    <div className={cn(
                                      "text-sm font-black uppercase tracking-tighter",
                                      user.status === 'suspended' ? "text-gray-400" : "text-gray-900"
                                    )}>
                                      {user.displayName || 'Utilisateur'}
                                    </div>
                                    <div className="text-[10px] font-bold text-gray-400 lowercase">{user.email}</div>
                                 </div>
                              </div>
                           </td>
                           <td className="px-8 py-6">
                              <div className="flex flex-col gap-1">
                                 <div className={cn(
                                   "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                                   user.role === 'admin' ? "bg-red-50 text-red-600 border-red-100/50" : 
                                   user.role === 'operator' ? "bg-amber-50 text-amber-600 border-amber-100/50" :
                                   "bg-blue-50 text-blue-600 border-blue-100/50"
                                 )}>
                                    {user.role === 'admin' ? <Shield size={10} /> : 
                                     user.role === 'operator' ? <ShieldAlert size={10} /> :
                                     <Users size={10} />}
                                    {user.role === 'operator' ? `Opérateur (${user.operatorType === 'vbg_agression' ? 'Cellule VBG' : user.operatorType === 'pompiers' ? 'Pompiers' : 'Police'})` : user.role}
                                 </div>
                                 <div className="flex flex-col gap-1 mt-1">
                                   {user.role === 'user' && (
                                     <div className="flex gap-1 items-center">
                                       <button onClick={() => updateUserRole(user.uid, 'operator', 'pompiers')} className="text-[8px] font-black text-amber-600 uppercase hover:underline">+ Pompiers</button>
                                       <span className="text-[8px] text-gray-300">|</span>
                                       <button onClick={() => updateUserRole(user.uid, 'operator', 'police')} className="text-[8px] font-black text-amber-600 uppercase hover:underline">+ Police</button>
                                     </div>
                                   )}
                                   {user.role === 'operator' && (
                                     <div className="flex gap-1.5 items-center">
                                       <button onClick={() => updateUserRole(user.uid, 'user')} className="text-[8px] font-black text-blue-600 uppercase hover:underline">Révoquer</button>
                                       <span className="text-[8px] text-gray-300">|</span>
                                       <button onClick={() => updateUserRole(user.uid, 'operator', user.operatorType === 'pompiers' ? 'police' : 'pompiers')} className="text-[8px] font-black text-amber-700 uppercase hover:underline">Changer en {user.operatorType === 'pompiers' ? 'Police' : 'Pompiers'}</button>
                                     </div>
                                   )}
                                   {user.role === 'admin' && user.uid !== auth.currentUser?.uid && (
                                     <div className="flex gap-1 items-center">
                                       <button onClick={() => updateUserRole(user.uid, 'operator', 'pompiers')} className="text-[8px] font-black text-amber-600 uppercase hover:underline">A Pompiers</button>
                                       <span className="text-[8px] text-gray-300">|</span>
                                       <button onClick={() => updateUserRole(user.uid, 'operator', 'police')} className="text-[8px] font-black text-amber-600 uppercase hover:underline">A Police</button>
                                     </div>
                                   )}
                                   {user.role !== 'admin' && (
                                     <button 
                                       onClick={() => updateUserRole(user.uid, 'admin')}
                                       className="text-[8px] font-black text-red-600 uppercase hover:underline text-left self-start"
                                     >
                                       Rendre Admin
                                     </button>
                                   )}
                                 </div>
                                 <div className="hidden">
                                   {user.role === 'user' && (
                                     <button 
                                       onClick={() => updateUserRole(user.uid, 'operator')}
                                       className="text-[8px] font-black text-amber-600 uppercase hover:underline"
                                     >
                                       Promouvoir Opérateur
                                     </button>
                                   )}
                                   {user.role === 'operator' && (
                                     <button 
                                       onClick={() => updateUserRole(user.uid, 'user')}
                                       className="text-[8px] font-black text-blue-600 uppercase hover:underline"
                                     >
                                       Révoquer Opérateur
                                     </button>
                                   )}
                                   {user.role === 'admin' && user.uid !== auth.currentUser?.uid && (
                                     <button 
                                       onClick={() => updateUserRole(user.uid, 'operator')}
                                       className="text-[8px] font-black text-amber-600 uppercase hover:underline"
                                     >
                                       Rétrograder à Opérateur
                                     </button>
                                   )}
                                   {user.role !== 'admin' && (
                                     <button 
                                       onClick={() => updateUserRole(user.uid, 'admin')}
                                       className="text-[8px] font-black text-red-600 uppercase hover:underline ml-auto"
                                     >
                                       Rendre Admin
                                     </button>
                                   )}
                                 </div>
                              </div>
                           </td>
                           <td className="px-8 py-6">
                              <div className="flex items-center gap-2 text-xs font-bold text-gray-600">
                                 <Phone size={12} className="text-gray-300" />
                                 {user.phoneNumber || '--'}
                              </div>
                           </td>
                           <td className="px-8 py-6 text-[11px] font-bold text-gray-400 italic">
                              {user.lastLogin?.toDate ? format(user.lastLogin.toDate(), 'd MMM yyyy, HH:mm', { locale: fr }) : 'Jamais'}
                           </td>
                           <td className="px-8 py-6 text-right">
                              <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                 <button 
                                   onClick={() => toggleUserStatus(user.uid, user.status)}
                                   title={user.status === 'suspended' ? "Réactiver" : "Suspendre"}
                                   className={cn(
                                     "p-2 bg-white border border-gray-100 rounded-xl shadow-sm transition-all hover:shadow-lg hover:scale-110",
                                     user.status === 'suspended' ? "text-green-600 hover:border-green-100" : "text-amber-500 hover:border-amber-100"
                                   )}
                                 >
                                    {user.status === 'suspended' ? <CheckCircle2 size={16} /> : <UserMinus size={16} />}
                                 </button>
                                 <button 
                                   onClick={() => deleteUser(user.uid)}
                                   className="p-2 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-red-500 hover:border-red-100 hover:shadow-lg hover:scale-110 transition-all"
                                 >
                                    <Trash2 size={16} />
                                 </button>
                              </div>
                           </td>
                        </tr>
                       ))}
                   </tbody>
                </table>
             </div>

             {/* Mobile User Cards */}
             <div className="md:hidden divide-y divide-gray-100 px-2">
                {users
                 .filter(u => {
                   const matchesSearch = u.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                        u.email.toLowerCase().includes(searchTerm.toLowerCase());
                   const matchesRole = userRoleFilter === 'all' || u.role === userRoleFilter;
                   return matchesSearch && matchesRole;
                 })
                 .map((user) => (
                  <div key={user.uid} className="py-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "relative w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center font-black text-gray-600 text-sm overflow-hidden shadow-sm",
                          user.status === 'suspended' && "grayscale opacity-50"
                        )}>
                          {user.photoURL ? (
                            <img referrerPolicy="no-referrer" src={user.photoURL} alt="" className="w-full h-full object-cover" />
                          ) : (
                            user.displayName?.[0] || 'U'
                          )}
                          {user.status === 'suspended' && (
                            <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                              <UserMinus size={14} className="text-white" />
                            </div>
                          )}
                        </div>
                        <div>
                           <div className={cn(
                             "text-sm font-black uppercase tracking-tighter leading-none mb-1",
                             user.status === 'suspended' ? "text-gray-400" : "text-gray-900"
                           )}>
                             {user.displayName || 'Utilisateur'}
                           </div>
                           <div className="text-[10px] font-bold text-gray-400 lowercase">{user.email}</div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <div className={cn(
                          "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm border",
                          user.role === 'admin' ? "bg-red-50 text-red-600 border border-red-100" : 
                          user.role === 'operator' ? (
                            user.operatorType === 'vbg_agression'
                              ? "bg-purple-50 text-purple-700 border border-purple-200"
                              : user.operatorType === 'pompiers'
                              ? "bg-amber-50 text-amber-600 border border-amber-100"
                              : "bg-blue-50 text-blue-600 border border-blue-100"
                          ) :
                          "bg-blue-50 text-blue-600 border border-blue-100"
                        )}>
                          {user.role === 'admin' ? <Shield size={10} /> : 
                           user.role === 'operator' ? <ShieldAlert size={10} /> :
                           <Users size={10} />}
                          {user.role === 'operator' ? `Opérateur (${user.operatorType === 'vbg_agression' ? 'Cellule VBG' : user.operatorType === 'pompiers' ? 'Pompiers' : 'Police'})` : user.role}
                        </div>
                        <div className="flex flex-col gap-1 items-end">
                          {currentUserProfile?.role === 'admin' && (
                            <div className="flex gap-2 flex-wrap justify-end">
                              {user.role === 'user' && (
                                <>
                                  <button onClick={() => updateUserRole(user.uid, 'operator', 'pompiers')} className="text-[8px] font-black text-amber-600 uppercase hover:underline">+ Pompiers</button>
                                  <span className="text-[8px] text-gray-300">|</span>
                                  <button onClick={() => updateUserRole(user.uid, 'operator', 'vbg_agression')} className="text-[8px] font-black text-purple-600 uppercase hover:underline">+ VBG</button>
                                  <span className="text-[8px] text-gray-300">|</span>
                                  <button onClick={() => updateUserRole(user.uid, 'operator', 'police')} className="text-[8px] font-black text-blue-600 uppercase hover:underline">+ Police</button>
                                </>
                              )}
                              {user.role === 'operator' && (
                                <>
                                  <button onClick={() => updateUserRole(user.uid, 'user')} className="text-[8px] font-black text-gray-500 uppercase hover:underline">Révoquer</button>
                                  {user.operatorType !== 'pompiers' && (
                                    <>
                                      <span className="text-[8px] text-gray-300">|</span>
                                      <button onClick={() => updateUserRole(user.uid, 'operator', 'pompiers')} className="text-[8px] font-black text-amber-600 uppercase hover:underline">Pompiers</button>
                                    </>
                                  )}
                                  {user.operatorType !== 'vbg_agression' && (
                                    <>
                                      <span className="text-[8px] text-gray-300">|</span>
                                      <button onClick={() => updateUserRole(user.uid, 'operator', 'vbg_agression')} className="text-[8px] font-black text-purple-600 uppercase hover:underline">VBG</button>
                                    </>
                                  )}
                                  {user.operatorType !== 'police' && (
                                    <>
                                      <span className="text-[8px] text-gray-300">|</span>
                                      <button onClick={() => updateUserRole(user.uid, 'operator', 'police')} className="text-[8px] font-black text-blue-600 uppercase hover:underline">Police</button>
                                    </>
                                  )}
                                </>
                              )}
                              {user.role === 'admin' && user.uid !== auth.currentUser?.uid && (
                                <>
                                  <button onClick={() => updateUserRole(user.uid, 'operator', 'pompiers')} className="text-[8px] font-black text-amber-600 uppercase hover:underline">A Pompiers</button>
                                  <span className="text-[8px] text-gray-300">|</span>
                                  <button onClick={() => updateUserRole(user.uid, 'operator', 'vbg_agression')} className="text-[8px] font-black text-purple-600 uppercase hover:underline">A VBG</button>
                                  <span className="text-[8px] text-gray-300">|</span>
                                  <button onClick={() => updateUserRole(user.uid, 'operator', 'police')} className="text-[8px] font-black text-blue-600 uppercase hover:underline">A Police</button>
                                </>
                              )}
                              {user.role !== 'admin' && (
                                <>
                                  <span className="text-[8px] text-gray-300">|</span>
                                  <button onClick={() => updateUserRole(user.uid, 'admin')} className="text-[8px] font-black text-red-600 uppercase hover:underline">Passer Admin</button>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="hidden flex gap-2">
                           {currentUserProfile?.role === 'admin' && (
                             <>
                               {user.role === 'user' ? (
                                 <button 
                                   onClick={() => updateUserRole(user.uid, 'operator')}
                                   className="text-[8px] font-black text-amber-600 uppercase"
                                 >
                                   Assigner Opérateur
                                 </button>
                               ) : user.role === 'operator' ? (
                                 <button 
                                   onClick={() => updateUserRole(user.uid, 'user')}
                                   className="text-[8px] font-black text-blue-600 uppercase"
                                 >
                                   Révoquer Opérateur
                                 </button>
                               ) : null}
                               {user.role === 'admin' && user.uid !== auth.currentUser?.uid && (
                                 <button 
                                   onClick={() => updateUserRole(user.uid, 'operator')}
                                   className="text-[8px] font-black text-amber-600 uppercase"
                                 >
                                   Rétrograder
                                 </button>
                               )}
                               {user.role !== 'admin' && (
                                 <button 
                                   onClick={() => updateUserRole(user.uid, 'admin')}
                                   className="text-[8px] font-black text-red-600 uppercase"
                                 >
                                   Passer Admin
                                 </button>
                               )}
                             </>
                           )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between bg-gray-50/50 p-3 rounded-2xl border border-gray-100">
                      <div className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase">
                        <Phone size={12} className="text-gray-300" />
                        {user.phoneNumber || 'N/A'}
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => toggleUserStatus(user.uid, user.status)}
                          className={cn(
                            "w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center active:scale-90 transition-all shadow-sm",
                            user.status === 'suspended' ? "text-green-600 border-green-100" : "text-amber-500 border-amber-100"
                          )}
                        >
                          {user.status === 'suspended' ? <CheckCircle2 size={16} /> : <UserMinus size={16} />}
                        </button>
                        <button 
                          onClick={() => deleteUser(user.uid)}
                          className="w-10 h-10 bg-white border border-gray-200 text-gray-400 rounded-xl flex items-center justify-center active:bg-red-50 active:text-red-500 active:border-red-100 transition-all shadow-sm"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
             </div>
          </div>

        )}
      </div>
    )}

      {/* Confirmation Modal */}
      {pendingAction && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !actionLoading && setPendingAction(null)}
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative w-full max-w-sm bg-white rounded-[32px] shadow-2xl p-8 border border-gray-100 overflow-hidden"
          >
            <div className="flex flex-col items-center text-center gap-6">
              <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center">
                <AlertCircle size={32} />
              </div>
              <div>
                <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight mb-2">Confirmation Requise</h3>
                <p className="text-xs font-medium text-gray-500 leading-relaxed uppercase">
                  {pendingAction.message}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 w-full">
                <button 
                  disabled={actionLoading}
                  onClick={() => setPendingAction(null)}
                  className="py-4 rounded-2xl bg-gray-100 text-gray-500 text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 transition-all disabled:opacity-50"
                >
                  Annuler
                </button>
                <button 
                  disabled={actionLoading}
                  onClick={executePendingAction}
                  className="py-4 rounded-2xl bg-red-600 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-red-200 hover:bg-red-700 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {actionLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : "Confirmer"}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
