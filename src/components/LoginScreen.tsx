import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Shield, LogIn, Lock, ArrowRight, Smartphone, Globe, AlertCircle, Info, ExternalLink, Phone, Heart, MapPin, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAppConfig } from '../lib/useAppConfig';

interface LoginScreenProps {
  onLogin: () => void;
  onSimulatedLogin?: (role: 'user' | 'operator' | 'admin', operatorType?: 'pompiers' | 'police' | 'vbg_agression') => void;
  onGuestLogin?: () => void;
  onClose?: () => void;
  onNavigate?: (tab: string) => void;
}

export const LoginScreen = ({ onLogin, onSimulatedLogin, onGuestLogin, onClose, onNavigate }: LoginScreenProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { config, loading: configLoading } = useAppConfig();

  const handleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await onLogin();
      if (onClose) onClose();
    } catch (err: any) {
      console.error("Login failed:", err);
      
      let msg = "Une erreur est survenue lors de la connexion.";
      if (err?.code === 'auth/network-request-failed') {
        msg = "La connexion Google en fenêtre popup est bloquée dans cet affichage iframe. Vous pouvez ouvrir l'application dans un nouvel onglet ou continuer directement sans vous connecter.";
      } else if (err?.code === 'auth/popup-closed-by-user') {
        msg = "La fenêtre de connexion a été fermée avant la fin.";
      }
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const openInNewTab = () => {
    window.open(window.location.href, '_blank');
  };

  const heroImage = config?.loginImageUrl || "https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?q=80&w=1000&auto=format&fit=crop";
  const heroTitle = config?.loginTitle || "Protection civile &\nUrgences digitalisées";

  return (
    <div className="fixed inset-0 z-[120] bg-white flex flex-col items-center justify-center p-4 sm:p-8 overflow-y-auto">
      <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-blue-50 to-white -z-10" />

      {/* Close / Return button if dismissible */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors z-10"
          title="Fermer et continuer sans connexion"
        >
          <X size={20} />
        </button>
      )}
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-6 md:space-y-8 py-6 my-auto"
      >
        <div className="text-center space-y-3 md:space-y-4">
          <div className="relative inline-block">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-3xl flex items-center justify-center text-blue-600 shadow-xl mx-auto border border-blue-50">
              <Shield size={36} className="md:w-10 md:h-10 drop-shadow-sm" />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-green-500 text-white p-1 rounded-xl shadow-lg border-2 border-white">
              <Lock size={12} className="md:w-3.5 md:h-3.5" />
            </div>
          </div>
          
          <div className="space-y-1">
            <h2 className="text-xl md:text-2xl font-black text-gray-900 uppercase tracking-tighter">Connexion E-Secours</h2>
            <p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest">Compte Citoyen & Administration</p>
          </div>
        </div>

        <div className="space-y-4 md:space-y-5">
          <div className="relative w-full aspect-[16/9] overflow-hidden rounded-3xl shadow-lg border-2 border-white group">
            <img 
              src={heroImage} 
              alt="E-Secours Assistance" 
              className={cn(
                "w-full h-full object-cover transition-transform duration-700 group-hover:scale-105",
                configLoading && "animate-pulse bg-gray-200"
              )}
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-blue-950/85 via-transparent to-transparent flex flex-col justify-end p-4 sm:p-5">
              <h3 className="text-white text-sm sm:text-base font-black uppercase tracking-tight leading-tight drop-shadow-md whitespace-pre-line">
                {heroTitle}
              </h3>
              <p className="text-blue-200 text-[9px] font-bold uppercase tracking-wider mt-1">Plateforme d'Assistance 24/7</p>
            </div>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-2xl text-xs font-medium flex flex-col gap-2.5"
            >
              <div className="flex items-start gap-2">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <p>{error}</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <button 
                  onClick={openInNewTab}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-blue-700 text-white py-2 px-3 rounded-xl text-[10px] font-bold uppercase tracking-wider active:scale-95 transition-all"
                >
                  <ExternalLink size={13} />
                  Ouvrir nouvel onglet
                </button>
                {onGuestLogin && (
                  <button 
                    onClick={onGuestLogin}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-600 text-white py-2 px-3 rounded-xl text-[10px] font-bold uppercase tracking-wider active:scale-95 transition-all"
                  >
                    <Shield size={13} />
                    Accès sans compte
                  </button>
                )}
              </div>
            </motion.div>
          )}

          <div className="space-y-2.5">
            <button 
              onClick={handleLogin}
              disabled={isLoading}
              className={cn(
                "w-full py-4 rounded-2xl font-black uppercase tracking-[0.15em] text-[11px] transition-all flex items-center justify-center gap-3 shadow-xl relative overflow-hidden",
                isLoading ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700 active:scale-95 shadow-blue-100"
              )}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Se connecter avec Google
                  <LogIn size={16} />
                </>
              )}
            </button>

            {onClose ? (
              <button
                onClick={onClose}
                className="w-full py-3.5 rounded-2xl border border-gray-200 hover:border-gray-300 text-gray-700 font-bold uppercase tracking-wider text-[10px] transition-all flex items-center justify-center gap-2 active:scale-95 bg-gray-50"
              >
                Continuer sans connexion
              </button>
            ) : onGuestLogin ? (
              <button
                onClick={onGuestLogin}
                className="w-full py-3.5 rounded-2xl border border-gray-200 hover:border-gray-300 text-gray-700 font-bold uppercase tracking-wider text-[10px] transition-all flex items-center justify-center gap-2 active:scale-95 bg-gray-50"
              >
                Continuer sans connexion
              </button>
            ) : null}

            {/* Simulated Demo Connection Option */}
            {onSimulatedLogin && (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center space-y-2.5 mt-2">
                <div className="flex items-center gap-2 justify-center text-slate-800">
                  <Info size={14} className="text-blue-500" />
                  <span className="text-[10px] font-black uppercase tracking-wider">Mode Démo / Évaluation</span>
                </div>
                <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wide leading-normal">
                  Si la fenêtre Google est bloquée par l'iframe ou fermée, utilisez ces simulateurs d'accès immédiat :
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  <button
                    onClick={() => onSimulatedLogin('user')}
                    className="bg-white hover:bg-gray-50 text-gray-700 py-2 px-1 rounded-xl border border-gray-200 shadow-sm text-[9px] font-black uppercase tracking-wider active:scale-95 transition-all"
                  >
                    👤 Citoyen
                  </button>
                  <button
                    onClick={() => onSimulatedLogin('operator', 'pompiers')}
                    className="bg-amber-600 hover:bg-amber-700 text-white py-2 px-1 rounded-xl shadow-sm text-[9px] font-black uppercase tracking-wider active:scale-95 transition-all"
                  >
                    🚒 Pompiers
                  </button>
                  <button
                    onClick={() => onSimulatedLogin('operator', 'vbg_agression')}
                    className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-1 rounded-xl shadow-sm text-[9px] font-black uppercase tracking-wider active:scale-95 transition-all"
                  >
                    💜 Cellule VBG
                  </button>
                  <button
                    onClick={() => onSimulatedLogin('admin')}
                    className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-1 rounded-xl shadow-sm text-[9px] font-black uppercase tracking-wider active:scale-95 transition-all"
                  >
                    🛡️ Admin
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Direct Access to Tips, Numbers, Health without login */}
          {onNavigate && (
            <div className="pt-2 border-t border-gray-100">
              <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2.5 text-center">
                Accès direct sans connexion
              </p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => {
                    onNavigate('numbers');
                    if (onClose) onClose();
                  }}
                  className="flex flex-col items-center justify-center p-3 bg-blue-50/70 hover:bg-blue-100/70 rounded-2xl border border-blue-100 text-blue-700 transition-all active:scale-95"
                >
                  <Phone size={18} className="mb-1 text-blue-600" />
                  <span className="text-[10px] font-black uppercase">Numéros</span>
                </button>
                <button
                  onClick={() => {
                    onNavigate('tips');
                    if (onClose) onClose();
                  }}
                  className="flex flex-col items-center justify-center p-3 bg-red-50/70 hover:bg-red-100/70 rounded-2xl border border-red-100 text-red-700 transition-all active:scale-95"
                >
                  <Heart size={18} className="mb-1 text-red-600" />
                  <span className="text-[10px] font-black uppercase">Conseils</span>
                </button>
                <button
                  onClick={() => {
                    onNavigate('health');
                    if (onClose) onClose();
                  }}
                  className="flex flex-col items-center justify-center p-3 bg-emerald-50/70 hover:bg-emerald-100/70 rounded-2xl border border-emerald-100 text-emerald-700 transition-all active:scale-95"
                >
                  <MapPin size={18} className="mb-1 text-emerald-600" />
                  <span className="text-[10px] font-black uppercase">Santé</span>
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="text-center space-y-2">
          <p className="text-[9px] font-medium text-gray-400 leading-relaxed px-4">
            Tous les numéros d'urgence, conseils de premiers secours et cartes des centres de santé restent accessibles gratuitement sans compte.
          </p>
          <div className="flex items-center justify-center gap-1.5 text-blue-600/60">
            <Shield size={12} />
            <span className="text-[8px] font-black uppercase tracking-widest">Protection Civile E-Secours</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
