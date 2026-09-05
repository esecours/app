import React from 'react';
import { motion } from 'motion/react';
import { MapPin, Mic, ShieldAlert, RotateCw, Settings } from 'lucide-react';
import { cn } from '../lib/utils';
import { getMicErrorMessage, getGeoErrorMessage } from '../lib/permissions';

interface PermissionGuardProps {
  type: 'geolocation' | 'microphone';
  state: PermissionState | 'unknown';
  onRetry: () => void;
  className?: string;
  variant?: 'full' | 'inline';
}

export const PermissionGuard = ({ type, state, onRetry, className, variant = 'full' }: PermissionGuardProps) => {
  const isDenied = state === 'denied';
  
  const config = {
    geolocation: {
      icon: MapPin,
      label: 'Géo-localisation',
      bgColor: 'bg-blue-600',
      lightBgColor: 'bg-blue-100',
      textColor: 'text-blue-600',
      error: getGeoErrorMessage(state)
    },
    microphone: {
      icon: Mic,
      label: 'Microphone',
      bgColor: 'bg-red-600',
      lightBgColor: 'bg-red-100',
      textColor: 'text-red-600',
      error: getMicErrorMessage({ name: state === 'denied' ? 'NotAllowedError' : '' })
    }
  }[type];

  const Icon = config.icon;

  if (variant === 'inline') {
    return (
      <div className={cn(
        "bg-white border-2 border-dashed rounded-3xl p-6 text-center transition-all",
        isDenied ? "border-red-200 bg-red-50" : "border-gray-200 bg-gray-50",
        className
      )}>
        <div className="flex flex-col items-center gap-4">
          <div className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors shadow-sm",
            isDenied ? "bg-red-100 text-red-600" : `${config.lightBgColor} ${config.textColor}`
          )}>
            {isDenied ? <ShieldAlert size={24} /> : <Icon size={24} />}
          </div>
          
          <div>
            <h4 className={cn(
              "text-[10px] font-black uppercase tracking-widest mb-1",
              isDenied ? "text-red-900" : "text-gray-900"
            )}>
              {config.label} {isDenied ? 'Bloqué' : 'Requis'}
            </h4>
            <p className={cn(
              "text-[9px] font-bold uppercase leading-relaxed max-w-[200px] mx-auto",
              isDenied ? "text-red-600" : "text-gray-400"
            )}>
              {isDenied 
                ? "Autorisez l'accès dans les réglages de votre application." 
                : `Activez le ${config.label.toLowerCase()} pour une meilleure efficacité.`}
            </p>
          </div>

          <button 
            onClick={onRetry}
            className={cn(
              "w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2",
              isDenied 
                ? "bg-red-600 text-white shadow-lg shadow-red-200" 
                : "bg-gray-900 text-white shadow-lg"
            )}
          >
            {isDenied ? <Settings size={14} /> : <RotateCw size={14} />}
            {isDenied ? 'Instructions de déblocage' : 'Activer maintenant'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("p-8 bg-white rounded-[40px] border-2 border-gray-100 shadow-xl text-center space-y-6", className)}>
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={cn(
          "w-20 h-20 rounded-[32px] flex items-center justify-center mx-auto shadow-2xl relative",
          isDenied ? "bg-red-500 text-white" : `${config.bgColor} text-white`
        )}
      >
        <div className="absolute inset-0 bg-inherit rounded-inherit animate-ping opacity-20" />
        {isDenied ? <ShieldAlert size={36} /> : <Icon size={36} />}
      </motion.div>

      <div className="space-y-2">
        <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter">
          {config.label} {isDenied ? 'Désactivé' : 'Souhaité'}
        </h3>
        <p className="text-sm font-bold text-gray-400 leading-relaxed max-w-xs mx-auto">
          {isDenied 
            ? "Nous ne pouvons pas accéder à votre appareil. Veuillez autoriser l'accès pour continuer."
            : `L'activation du ${config.label.toLowerCase()} permet aux secours de vous aider plus rapidement.`}
        </p>
      </div>

      {isDenied && (
        <div className="bg-red-50 p-4 rounded-3xl border border-red-100 text-left">
          <p className="text-[10px] font-bold text-red-700 whitespace-pre-line leading-relaxed uppercase">
            {config.error}
          </p>
        </div>
      )}

      <button
        onClick={onRetry}
        className={cn(
          "w-full py-5 rounded-[24px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-xl flex items-center justify-center gap-3",
          isDenied ? "bg-gray-100 text-gray-900" : "bg-blue-600 text-white"
        )}
      >
        {isDenied ? <Settings size={20} /> : <Icon size={20} />}
        {isDenied ? 'VOIR LES INSTRUCTIONS' : 'ACTIVER MAINTENANT'}
      </button>

      {!isDenied && (
        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
          Une fenêtre de confirmation va s'ouvrir sur votre application
        </p>
      )}
    </div>
  );
};
