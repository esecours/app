import React from 'react';
import { Lock, LogIn, ArrowLeft, Shield } from 'lucide-react';
import { motion } from 'motion/react';

interface AuthRequiredCardProps {
  title: string;
  subtitle?: string;
  description: string;
  icon: React.ElementType;
  iconColor?: string;
  iconBg?: string;
  features: string[];
  onLogin: () => void;
  onGoHome?: () => void;
}

export const AuthRequiredCard: React.FC<AuthRequiredCardProps> = ({
  title,
  subtitle = "Connexion requise",
  description,
  icon: Icon,
  iconColor = "text-blue-600",
  iconBg = "bg-blue-50",
  features,
  onLogin,
  onGoHome,
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-lg mx-auto bg-white rounded-[32px] p-6 sm:p-8 border border-gray-100 shadow-xl space-y-6 text-center"
    >
      {/* Icon Area with Lock Badge */}
      <div className="relative w-20 h-20 mx-auto">
        <div className={`w-20 h-20 ${iconBg} ${iconColor} rounded-3xl flex items-center justify-center shadow-inner border border-gray-100`}>
          <Icon size={36} />
        </div>
        <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white">
          <Lock size={14} className="text-amber-400" />
        </div>
      </div>

      {/* Title & Description */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-100 rounded-full text-[10px] font-black uppercase tracking-widest text-amber-700">
          <Lock size={11} />
          <span>{subtitle}</span>
        </div>
        <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">{title}</h2>
        <p className="text-xs sm:text-sm text-gray-500 font-medium leading-relaxed max-w-md mx-auto">
          {description}
        </p>
      </div>

      {/* Feature Bullet Points */}
      <div className="bg-gray-50/80 rounded-2xl p-4 text-left space-y-2.5 border border-gray-100">
        <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">
          Ce que vous apporte un compte vérifié :
        </p>
        {features.map((feature, idx) => (
          <div key={idx} className="flex items-start gap-2.5 text-xs text-gray-700 font-medium">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
            <span>{feature}</span>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="space-y-2.5 pt-2">
        <button
          onClick={onLogin}
          className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg shadow-blue-200 flex items-center justify-center gap-2 active:scale-95 transition-all"
        >
          <LogIn size={16} />
          <span>Se Connecter avec Google</span>
        </button>

        {onGoHome && (
          <button
            onClick={onGoHome}
            className="w-full py-3 bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold text-xs uppercase tracking-wider rounded-2xl transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft size={15} />
            <span>Retour aux services publics</span>
          </button>
        )}
      </div>

      <div className="flex items-center justify-center gap-1.5 text-gray-400 text-[10px] font-bold">
        <Shield size={12} className="text-blue-500" />
        <span>Données personnelles protégées et chiffrées</span>
      </div>
    </motion.div>
  );
};
