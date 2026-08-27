import React from 'react';
import { Shield, MapPin, Phone, Heart, Info, Globe, Mail, Clock, CheckCircle2, Loader2, Activity } from 'lucide-react';
import { motion } from 'motion/react';
import { useAppConfig } from '../lib/useAppConfig';

export const About = () => {
  const { config, loading } = useAppConfig();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="animate-spin text-blue-600" size={32} />
        <p className="text-sm font-black uppercase tracking-widest text-gray-400">Chargement...</p>
      </div>
    );
  }

  const aboutText = config?.about || "E-SECOURS est une solution technologique conçue pour réduire drastiquement les délais d'intervention en cas d'urgence. En combinant géolocalisation haute précision, communication audio et transmission de données médicales, nous permettons aux secours d'agir plus vite et plus efficacement.";

  const ICON_MAP: Record<string, any> = {
    Shield, MapPin, Clock, Heart, Activity, Phone, Globe
  };

  const missions = config?.aboutMissions && config.aboutMissions.length > 0
    ? config.aboutMissions
    : [
        "Démocratiser l'accès aux services de secours.",
        "Optimiser la logistique d'intervention.",
        "Sauver des vies grâce à la technologie.",
        "Renforcer le lien entre citoyens et services d'urgence."
      ];

  const features = config?.aboutFeatures && config.aboutFeatures.length > 0
    ? config.aboutFeatures.map((f: any) => ({
        ...f,
        icon: ICON_MAP[f.icon] || Info
      }))
    : [
        { icon: MapPin, title: "Géo-Précision", desc: "Localisation exacte de l'incident." },
        { icon: Clock, title: "Rapidité", desc: "Transmission instantanée aux secours." },
        { icon: Heart, title: "Santé", desc: "Accès aux détails médicaux cruciaux." },
        { icon: Shield, title: "Sûreté", desc: "Protection de vos données personnelles." }
      ];

  return (
    <div className="space-y-8 pb-12">
      <header className="space-y-1">
        <h1 className="text-2xl font-black tracking-tight text-gray-900 uppercase">À Propos</h1>
        <p className="text-sm text-gray-500 font-medium">L'innovation au service de votre sécurité</p>
      </header>

      <div className="bg-white rounded-[32px] overflow-hidden shadow-sm border border-gray-100">
        <div className="bg-blue-600 p-8 text-white relative">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Shield size={120} />
          </div>
          <h2 className="text-3xl font-black mb-2">E-SECOURS</h2>
          <p className="text-blue-100 font-bold uppercase tracking-widest text-xs">Plateforme d'Urgence Intelligente</p>
        </div>
        <div className="p-8 space-y-6">
          <p className="text-gray-600 leading-relaxed font-medium whitespace-pre-wrap">
            {aboutText}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((item: any, i: number) => (
              <div key={i} className="flex gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm shrink-0">
                  <item.icon size={20} />
                </div>
                <div>
                  <h4 className="font-black text-gray-900 text-sm uppercase">{item.title}</h4>
                  <p className="text-xs text-gray-500 font-medium">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <section className="space-y-4">
        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest ml-4">Notre Mission</h3>
        <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100">
          <ul className="space-y-4">
            {missions.map((text: string, i: number) => (
              <li key={i} className="flex items-start gap-3">
                <CheckCircle2 size={18} className="text-green-500 shrink-0 mt-0.5" />
                <span className="text-sm font-medium text-gray-700">{text}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-gray-900 rounded-[32px] p-8 text-white text-center">
        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl rotate-3">
          <Globe size={32} />
        </div>
        <h3 className="text-xl font-black uppercase mb-2">Disponible partout</h3>
        <p className="text-gray-400 text-sm font-medium mb-6 px-4">
          Une application web progressive qui fonctionne sur tous vos appareils, même avec une connexion instable.
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          Version 1.2.0 Stable
        </div>
      </section>
    </div>
  );
};
