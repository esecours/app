import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert } from 'lucide-react';

export const SplashScreen = ({ onFinish }: { onFinish: () => void }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onFinish, 500); // Wait for exit animation
    }, 2500);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-blue-600 flex flex-col items-center justify-center p-6"
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1, rotate: [0, -10, 10, 0] }}
            transition={{ 
              duration: 0.8, 
              ease: "easeOut",
              rotate: { repeat: Infinity, duration: 4, ease: "easeInOut" }
            }}
            className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center shadow-2xl shadow-blue-900/40 relative"
          >
             {/* Pulse ring */}
             <motion.div 
               animate={{ scale: [1, 1.4], opacity: [0.3, 0] }}
               transition={{ repeat: Infinity, duration: 1.5 }}
               className="absolute inset-0 bg-white rounded-[2rem]"
             />
             <ShieldAlert size={48} className="text-blue-600 relative z-10" />
          </motion.div>
          
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mt-8 text-center"
          >
            <h1 className="text-3xl font-black text-white tracking-tight uppercase">E-Secours</h1>
            <p className="text-blue-100/70 text-[10px] font-black uppercase tracking-[0.2em] mt-2">Votre sécurité, notre priorité</p>
          </motion.div>

          <div className="mt-12 h-1 bg-white/20 rounded-full overflow-hidden w-[120px]">
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: "0%" }}
              transition={{ duration: 2, ease: "easeInOut" }}
              className="h-full bg-white w-full" 
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
