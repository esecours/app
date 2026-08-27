import React from 'react';
import { Home, Phone, Heart, Hammer, AlertCircle, LogOut, User, Shield, Clock, ArrowLeft, LogIn } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  onClick: () => void;
  isSOS?: boolean;
}

const NavItem = ({ icon: Icon, label, active, onClick, isSOS }: NavItemProps) => (
  <button
    onClick={onClick}
    className={cn(
      "flex flex-col items-center justify-center transition-all duration-200 flex-1",
      active ? "text-blue-600" : "text-gray-400 hover:text-gray-600",
      isSOS && "relative -top-6 flex-[0_0_auto] px-2"
    )}
  >
    {isSOS ? (
      <div className="relative">
        <div className="absolute inset-0 bg-red-500 blur-lg opacity-40 rounded-full animate-pulse" />
        <div className={cn(
          "w-16 h-16 bg-red-600 rounded-full flex items-center justify-center text-white shadow-xl border-4 border-white z-10",
          active && "scale-110"
        )}>
          <AlertCircle size={32} />
        </div>
        <span className="text-[10px] uppercase font-black text-red-600 mt-1 block text-center">SOS</span>
      </div>
    ) : (
      <>
        <Icon size={24} className={cn(active && "scale-110")} />
        <span className={cn("text-[10px] mt-1 font-medium text-center truncate w-full", active && "font-bold")}>{label}</span>
      </>
    )}
  </button>
);

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userName?: string | null;
  userPhoto?: string | null;
  isAdmin?: boolean;
  isOffline?: boolean;
  onLogout?: () => void;
  onLogin?: () => void;
}

export const Layout = ({ children, activeTab, setActiveTab, userName, userPhoto, isAdmin, isOffline, onLogout, onLogin }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-gray-900 overflow-x-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md z-40 flex items-center justify-between px-6 border-b border-gray-100">
        <div className="flex items-center gap-4">
          {activeTab !== 'home' && (
            <button 
              onClick={() => setActiveTab('home')}
              className="p-2 -ml-2 text-gray-400 hover:text-gray-900 transition-colors rounded-full hover:bg-gray-100"
              title="Retour à l'accueil"
            >
              <ArrowLeft size={20} />
            </button>
          )}
          <span className="text-2xl font-black tracking-tighter text-gray-900">
            E-<span className="text-red-600">SECOURS</span>
          </span>
        </div>
        
        {userName ? (
          <button 
            onClick={() => setActiveTab('profile')}
            className={cn(
              "p-1 rounded-2xl transition-all duration-300 border-2",
              activeTab === 'profile' 
                ? "bg-blue-50 border-blue-600 scale-105 shadow-lg shadow-blue-100" 
                : "bg-white border-transparent hover:border-gray-200"
            )}
            title="Mon profil"
          >
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white overflow-hidden shadow-sm">
              {userPhoto ? (
                <img src={userPhoto} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <User size={20} />
              )}
            </div>
          </button>
        ) : (
          <button 
            onClick={onLogin}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-blue-200 active:scale-95"
            title="Se connecter"
          >
            <LogIn size={15} />
            <span>Connexion</span>
          </button>
        )}
      </header>

      {/* Main Content */}
      <main className={cn(
        "flex-1 pt-20 pb-28 px-4 w-full mx-auto sm:px-6 transition-all duration-300",
        activeTab === 'admin' 
          ? "max-w-7xl" 
          : activeTab === 'tips'
          ? "max-w-md md:max-w-4xl lg:max-w-5xl"
          : "max-w-xl lg:max-w-2xl"
      )}>
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="min-h-[calc(100vh-192px)]"
        >
          {children}
        </motion.div>
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 h-20 bg-white border-t border-gray-100 flex items-center justify-around px-2 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
        <NavItem 
          icon={Home} 
          label="Accueil" 
          active={activeTab === 'home'} 
          onClick={() => setActiveTab('home')} 
        />
        <NavItem 
          icon={Phone} 
          label="Numéros" 
          active={activeTab === 'numbers'} 
          onClick={() => setActiveTab('numbers')} 
        />
        <NavItem 
          icon={AlertCircle} 
          label="SOS" 
          active={activeTab === 'sos'} 
          onClick={() => setActiveTab('sos')} 
          isSOS
        />
        <NavItem 
          icon={Heart} 
          label="Conseils" 
          active={activeTab === 'tips'} 
          onClick={() => setActiveTab('tips')} 
        />
        <NavItem 
          icon={Hammer} 
          label="Outils" 
          active={activeTab === 'tools'} 
          onClick={() => setActiveTab('tools')} 
        />
      </nav>
    </div>
  );
};
