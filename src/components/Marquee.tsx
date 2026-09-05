import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, Info, AlertTriangle, AlertCircle } from 'lucide-react';
import { db } from '../lib/firebase';
import { cn } from '../lib/utils';
import { collection, query, where, onSnapshot, Timestamp } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/firebase-errors';

interface Announcement {
  id: string;
  message: string;
  active: boolean;
  speed: number;
  expiresAt: any;
  type?: 'info' | 'warning' | 'critical';
}

export const Marquee = () => {
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);

  useEffect(() => {
    const q = query(
      collection(db, 'announcements'),
      where('active', '==', true)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => {
        const data = doc.data();
        return { 
          id: doc.id, 
          ...data,
          type: data.type || 'critical' // Fallback for existing announcements
        } as Announcement;
      });
      
      // Filter for non-expired ones on client side for real-time removal
      const activeAnnouncements = docs.filter(a => {
        if (!a.expiresAt) return true;
        const expires = a.expiresAt instanceof Timestamp ? a.expiresAt.toDate() : new Timestamp(a.expiresAt.seconds, a.expiresAt.nanoseconds).toDate();
        return expires > new Date();
      });

      if (activeAnnouncements.length > 0) {
        // Just take the latest one for simplicity
        setAnnouncement(activeAnnouncements[0]);
      } else {
        setAnnouncement(null);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'announcements');
    });

    return () => unsub();
  }, []);

  if (!announcement) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className={cn(
          "w-full text-white overflow-hidden relative z-50 shadow-lg border-b",
          announcement.type === 'info' ? "bg-blue-600 border-blue-700" 
            : announcement.type === 'warning' ? "bg-amber-500 border-amber-600"
            : "bg-red-600 border-red-700"
        )}
      >
        <div className="flex items-center min-h-[40px] px-4 py-2">
          {/* Icon Section (Fixed) */}
          <div className={cn(
            "flex items-center justify-center p-1.5 rounded-full mr-4 shrink-0 shadow-inner bg-white/10",
            announcement.type === 'info' ? "bg-blue-700/50" 
              : announcement.type === 'warning' ? "bg-amber-600/50"
              : "bg-red-700/50"
          )}>
            <Bell size={14} className="animate-bounce" />
          </div>

          {/* Scrolling Text Layer */}
          <div className="relative flex-1 overflow-hidden h-6 flex items-center">
            <div className="flex whitespace-nowrap">
              <motion.div
                animate={{ x: ['0%', '-50%'] }}
                transition={{
                  repeat: Infinity,
                  duration: announcement.speed || 15,
                  ease: "linear"
                }}
                className="flex items-center gap-8 pr-8"
              >
                {/* Duplicating content for seamless loop */}
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <span className="text-xs sm:text-sm font-black uppercase tracking-tight">
                      {announcement.message}
                    </span>
                    <AlertCircle size={14} className="opacity-50" />
                  </div>
                ))}
              </motion.div>
            </div>
          </div>

          <div className="ml-4 shrink-0 opacity-50">
            <Info size={14} />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
