import React from 'react';
import { motion } from 'motion/react';
import { Shield, Phone, Heart, Hammer, MapPin, ChevronRight, Info, Clock, Mail, Lock } from 'lucide-react';
import { cn } from '../lib/utils';
import { Marquee } from './Marquee';

interface QuickServiceCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  colorClass: string;
  onClick: () => void;
  isLocked?: boolean;
}

const QuickServiceCard = ({ icon: Icon, title, description, colorClass, onClick, isLocked }: QuickServiceCardProps) => (
  <button 
    onClick={onClick}
    className="relative flex flex-col p-5 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all active:scale-95 text-left w-full h-full"
  >
    {isLocked && (
      <div className="absolute top-4 right-4 flex items-center gap-1 bg-gray-100/90 text-gray-500 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider">
        <Lock size={10} />
        <span>Compte</span>
      </div>
    )}
    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-4", colorClass)}>
      <Icon size={24} />
    </div>
    <h3 className="text-lg font-bold text-gray-900 mb-1">{title}</h3>
    <p className="text-xs text-gray-500 leading-tight">{description}</p>
  </button>
);

interface HomeProps {
  onSOS: () => void;
  onNavigate: (tab: string) => void;
  isAdmin?: boolean;
  isOperator?: boolean;
  isLoggedIn?: boolean;
}

export const Home = ({ onSOS, onNavigate, isAdmin, isOperator, isLoggedIn }: HomeProps) => {
  return (
    <div className="space-y-6">
      <Marquee />
      
      {/* SOS Hero Area */}
      <div className="flex flex-col items-center justify-center py-8 text-center bg-radial-gradient from-white to-gray-50 rounded-[40px] border border-white">
        <motion.button
          animate={{
            scale: [1, 1.02, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onSOS}
          className="relative group"
        >
          {/* Radar Circles */}
          <div className="absolute inset-0 scale-[1.2] bg-red-100 rounded-full animate-ping opacity-20" />
          <div className="absolute inset-0 scale-[1.8] bg-red-50 rounded-full animate-pulse opacity-10" />
          
          <div className="relative w-44 h-44 sm:w-56 sm:h-56 bg-red-600 rounded-full flex flex-col items-center justify-center text-white shadow-[0_20px_50px_rgba(220,38,38,0.3)] border-4 sm:border-8 border-white overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent pointer-events-none" />
            <Shield size={48} className="sm:w-16 sm:h-16 mb-2 drop-shadow-lg" />
            <span className="text-3xl sm:text-5xl font-black tracking-tighter mb-1 uppercase">SOS</span>
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider opacity-80 bg-black/10 px-3 py-1 rounded-full">Appuyer</span>
          </div>
        </motion.button>
        
        <p className="mt-8 sm:mt-12 text-gray-400 font-medium px-8 text-xs sm:text-sm leading-relaxed max-w-xs">
          En cas d'urgence vitale, appuyez pour géolocaliser et alerter.
        </p>
      </div>

      {/* Services Grid */}
      <section>
        <div className="flex items-center justify-between mb-4 px-2">
          <h2 className="text-2xl font-black text-gray-900">Services Rapides</h2>
          <span className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Tout ce dont vous avez besoin</span>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <QuickServiceCard 
            icon={Phone} 
            title="Numéros" 
            description="Annuaire officiel des secours"
            colorClass="bg-blue-50 text-blue-600"
            onClick={() => onNavigate('numbers')}
          />
          <QuickServiceCard 
            icon={Heart} 
            title="Conseils" 
            description="Guides de premiers secours"
            colorClass="bg-red-50 text-red-600"
            onClick={() => onNavigate('tips')}
          />
          <QuickServiceCard 
            icon={Hammer} 
            title="Outils" 
            description="Fiche médicale & Sirène d'aide"
            colorClass="bg-orange-50 text-orange-600"
            onClick={() => onNavigate('tools')}
          />
          <QuickServiceCard 
            icon={Clock} 
            title="Historique" 
            description="Suivi de vos alertes SOS"
            colorClass="bg-indigo-50 text-indigo-600"
            onClick={() => onNavigate('history')}
          />
          <QuickServiceCard 
            icon={MapPin} 
            title="Santé" 
            description="Pharmacies & Hôpitaux"
            colorClass="bg-green-50 text-green-600"
            onClick={() => onNavigate('health')}
          />
          <QuickServiceCard 
            icon={Shield} 
            title="Console Admin" 
            description="Suivi des secours & Gestion"
            colorClass="bg-purple-50 text-purple-600 border-purple-100"
            onClick={() => onNavigate('admin')}
          />
        </div>
      </section>



      {/* Security Banner */}
      <div className="bg-[#151921] rounded-3xl p-6 text-white text-center relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full" />
        <div className="flex items-center justify-center gap-2 text-yellow-400 mb-3">
          <AlertCircle size={20} />
          <span className="font-black text-sm uppercase tracking-wider">INFO SÉCURITÉ</span>
        </div>
        <p className="text-xs text-blue-100/70 leading-relaxed font-medium">
          Cette application permet d'alerter les secours officiels. L'abus de numéros d'urgence est puni par la loi.
        </p>
      </div>
    </div>
  );
};

const AlertCircle = ({ size, className }: { size?: number, className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size || 24} 
    height={size || 24} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);
