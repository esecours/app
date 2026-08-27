import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Heart, Contact, LogOut, Save, Shield, Clock, Activity } from 'lucide-react';
import { UserProfile } from '../types';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/firebase-errors';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { getMicErrorMessage } from '../lib/permissions';

interface ProfileProps {
  userProfile: UserProfile;
  onLogout: () => void;
  onLogin?: () => void;
}

export const Profile = ({ userProfile, onLogout, onLogin }: ProfileProps) => {
  const isGuest = userProfile.uid === 'guest_user';
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    displayName: userProfile.displayName || '',
    phoneNumber: userProfile.phoneNumber || '',
    medicalInfo: userProfile.medicalInfo || '',
    age: userProfile.age || '',
    sex: userProfile.sex || '',
    weight: userProfile.weight || '',
    bloodType: userProfile.bloodType || '',
    allergies: userProfile.allergies || '',
    medications: userProfile.medications || '',
    emergencyContact: userProfile.emergencyContact || '',
  });

  const [micPermission, setMicPermission] = useState<PermissionState | 'unknown'>('unknown');
  const [geoPermission, setGeoPermission] = useState<PermissionState | 'unknown'>('unknown');

  useEffect(() => {
    const queryPermissions = async () => {
      if (navigator.permissions && (navigator.permissions as any).query) {
        try {
          const mic = await navigator.permissions.query({ name: 'microphone' as any });
          setMicPermission(mic.state);
          mic.onchange = () => setMicPermission(mic.state);

          const geo = await navigator.permissions.query({ name: 'geolocation' as any });
          setGeoPermission(geo.state);
          geo.onchange = () => setGeoPermission(geo.state);
        } catch (e) {
          console.debug("Permission query errorInProfile:", e);
        }
      }
    };
    queryPermissions();
  }, []);

  const [isContinuousMode, setIsContinuousMode] = useState(() => {
    return localStorage.getItem('e-secours-continuous-mode') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('e-secours-continuous-mode', isContinuousMode.toString());
    window.dispatchEvent(new Event('storage'));
  }, [isContinuousMode]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (isGuest) {
        localStorage.setItem('e_secours_guest_profile', JSON.stringify(formData));
        setIsEditing(false);
        return;
      }

      const userRef = doc(db, 'users', userProfile.uid);
      await updateDoc(userRef, {
        ...formData,
        updatedAt: serverTimestamp(),
      });
      setIsEditing(false);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${userProfile.uid}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Profile */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col items-center">
        <div className="relative">
          <div className="w-24 h-24 bg-blue-600 rounded-3xl flex items-center justify-center text-white shadow-xl overflow-hidden">
            {userProfile.photoURL ? (
              <img src={userProfile.photoURL} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <User size={48} />
            )}
          </div>
          <div className={cn(
            "absolute -bottom-2 -right-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-lg",
            userProfile.role === 'admin' ? "bg-red-600" : userProfile.role === 'operator' ? "bg-amber-500" : isGuest ? "bg-emerald-600" : "bg-blue-600"
          )}>
            {isGuest ? "Invité" : userProfile.role}
          </div>
        </div>
        
        <h2 className="text-xl font-black text-gray-900 mt-4 tracking-tight">
          {userProfile.displayName || (isGuest ? "Citoyen Invité" : userProfile.email.split('@')[0])}
        </h2>
        <div className="flex items-center gap-2 text-gray-400 mt-1">
          <Mail size={14} />
          <span className="text-xs font-medium">{userProfile.email}</span>
        </div>
      </div>

      {isGuest && onLogin && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-5 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left space-y-1">
            <h4 className="font-black text-sm uppercase tracking-wide">Mode Invité / Non Connecté</h4>
            <p className="text-xs text-blue-100">Connectez votre compte Google pour synchroniser vos coordonnées et votre historique d'alertes en ligne.</p>
          </div>
          <button
            onClick={onLogin}
            className="px-4 py-2.5 bg-white text-blue-700 hover:bg-blue-50 rounded-2xl text-xs font-black uppercase tracking-wider shrink-0 shadow-md active:scale-95 transition-all"
          >
            Se Connecter
          </button>
        </div>
      )}

      {/* Info Sections */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Informations Personnelles</h3>
          <button 
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            disabled={isSaving}
            className={cn(
              "flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
              isEditing ? "bg-green-600 text-white shadow-lg" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            {isSaving ? (
              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : isEditing ? (
              <Save size={14} />
            ) : (
              <User size={14} />
            )}
            {isEditing ? 'Enregistrer' : 'Modifier'}
          </button>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-4">
          <div className="space-y-2">
            <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest ml-2">Nom Complet</label>
            <div className="relative">
              <input 
                type="text"
                disabled={!isEditing}
                value={formData.displayName}
                onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                className="w-full bg-gray-50 border-none rounded-2xl pl-12 pr-4 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-600 disabled:opacity-60"
                placeholder="Votre nom complet"
              />
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Téléphone</label>
            <div className="relative">
              <input 
                type="tel"
                disabled={!isEditing}
                value={formData.phoneNumber}
                onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                className="w-full bg-gray-50 border-none rounded-2xl pl-12 pr-4 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-600 disabled:opacity-60"
                placeholder="+229 XX XX XX XX"
              />
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            </div>
          </div>
        </div>

        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest px-2">Accessibilité</h3>
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
              isContinuousMode ? "bg-blue-600 text-white" : "bg-gray-50 text-gray-400"
            )}>
              <Activity size={20} />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-black text-gray-900 uppercase tracking-widest">Assistance vocale en continu</span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">
                {micPermission === 'denied' ? (
                  <span className="text-red-500">Accès micro bloqué par l'application</span>
                ) : (
                  "Micro toujours actif • Mode mains libres"
                )}
              </span>
            </div>
          </div>
          <button 
            onClick={async () => {
              const next = !isContinuousMode;
              if (next) {
                try {
                  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                    throw new Error("L'API MediaDevices n'est pas supportée. HTTPS requis.");
                  }
                  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                  stream.getTracks().forEach(track => track.stop());
                  setIsContinuousMode(true);
                  setMicPermission('granted');
                } catch (err: any) {
                  console.debug("Mic access failed in Profile:", err.name, err.message);
                  const msg = getMicErrorMessage(err);
                  alert(msg);
                }
              } else {
                setIsContinuousMode(false);
              }
            }}
            className={cn(
              "w-12 h-6 rounded-full relative transition-colors duration-300",
              isContinuousMode ? "bg-blue-600" : "bg-gray-200"
            )}
            aria-label={isContinuousMode ? "Désactiver l'assistance continue" : "Activer l'assistance continue"}
          >
            <div className={cn(
              "absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300",
              isContinuousMode ? "left-7" : "left-1"
            )} />
          </button>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
              geoPermission === 'granted' ? "bg-green-100 text-green-600" : "bg-gray-50 text-gray-400"
            )}>
              <Shield size={20} />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-black text-gray-900 uppercase tracking-widest">Accès Localisation</span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">
                {geoPermission === 'denied' ? (
                  <span className="text-red-500">Accès bloqué • Vérifiez le cadenas URL</span>
                ) : geoPermission === 'granted' ? (
                  <span className="text-green-600">Autorisé • Précision optimale</span>
                ) : (
                  "En attente d'autorisation"
                )}
              </span>
            </div>
          </div>
        </div>

        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest px-2">Santé et Urgence</h3>
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Âge</label>
              <input 
                type="number"
                disabled={!isEditing}
                value={formData.age}
                onChange={(e) => setFormData({...formData, age: e.target.value})}
                className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-600 disabled:opacity-60"
                placeholder="Ex: 25"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Sexe</label>
              <select 
                disabled={!isEditing}
                value={formData.sex}
                onChange={(e) => setFormData({...formData, sex: e.target.value as any})}
                className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-600 disabled:opacity-60"
              >
                <option value="">Sélectionner</option>
                <option value="M">Masculin</option>
                <option value="F">Féminin</option>
                <option value="Autre">Autre</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Poids (kg)</label>
              <input 
                type="number"
                disabled={!isEditing}
                value={formData.weight}
                onChange={(e) => setFormData({...formData, weight: e.target.value})}
                className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-600 disabled:opacity-60"
                placeholder="Ex: 70"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Groupe Sanguin</label>
            <input 
              type="text"
              disabled={!isEditing}
              value={formData.bloodType}
              onChange={(e) => setFormData({...formData, bloodType: e.target.value})}
              className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-600 disabled:opacity-60"
              placeholder="Ex: A+, O-, B+..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Allergies</label>
            <textarea 
              disabled={!isEditing}
              value={formData.allergies}
              onChange={(e) => setFormData({...formData, allergies: e.target.value})}
              className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-600 disabled:opacity-60 min-h-[60px] resize-none"
              placeholder="Aliments, médicaments, poussière..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Médicaments en cours</label>
            <textarea 
              disabled={!isEditing}
              value={formData.medications}
              onChange={(e) => setFormData({...formData, medications: e.target.value})}
              className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-600 disabled:opacity-60 min-h-[60px] resize-none"
              placeholder="Liste de vos traitements actuels..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Autres Informations / Antécédents</label>
            <div className="relative">
              <textarea 
                disabled={!isEditing}
                value={formData.medicalInfo}
                onChange={(e) => setFormData({...formData, medicalInfo: e.target.value})}
                className="w-full bg-gray-50 border-none rounded-2xl pl-12 pr-4 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-600 disabled:opacity-60 min-h-[100px] resize-none"
                placeholder="Diabète, Asthme, etc..."
              />
              <Heart className="absolute left-4 top-4 text-gray-400" size={20} />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Contact d'Urgence</label>
            <div className="relative">
              <input 
                type="text"
                disabled={!isEditing}
                value={formData.emergencyContact}
                onChange={(e) => setFormData({...formData, emergencyContact: e.target.value})}
                className="w-full bg-gray-50 border-none rounded-2xl px-12 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-600 disabled:opacity-60"
                placeholder="Nom et numéro d'un proche"
              />
              <Contact className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
              <Clock size={20} />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Dernière Connexion</span>
              <span className="text-xs font-bold text-gray-700">
                {userProfile.lastLogin?.toDate ? format(userProfile.lastLogin.toDate(), 'PPP à HH:mm', { locale: fr }) : 'Inconnu'}
              </span>
            </div>
          </div>
        </div>

        <button 
          onClick={onLogout}
          className="w-full bg-gray-100 hover:bg-gray-200 text-gray-600 py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-xs transition-all flex items-center justify-center gap-2 mt-4"
        >
          <LogOut size={16} />
          Se Déconnecter
        </button>
      </div>

      <div className="flex items-center justify-center gap-2 text-gray-300">
        <Shield size={14} />
        <span className="text-[10px] font-bold uppercase tracking-widest">Données Sécurisées</span>
      </div>
    </div>
  );
};
