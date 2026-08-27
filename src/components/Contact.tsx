import React, { useState } from 'react';
import { Mail, Send, User, MessageCircle, AlertCircle, CheckCircle, Phone, MapPin, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { cn } from '../lib/utils';
import { useAppConfig } from '../lib/useAppConfig';
import { handleFirestoreError, OperationType } from '../lib/firebase-errors';

export const Contact = () => {
  const { config, loading } = useAppConfig();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      setErrorMessage("Veuillez remplir tous les champs obligatoires.");
      setStatus('error');
      return;
    }
    setShowConfirm(true);
  };

  const executeSubmit = async () => {
    setShowConfirm(false);
    setStatus('submitting');
    try {
      await addDoc(collection(db, 'contacts'), {
        ...formData,
        status: 'unread',
        createdAt: serverTimestamp()
      });
      setStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'contacts');
      setErrorMessage("Une erreur est survénue. Veuillez réessayer plus tard.");
      setStatus('error');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (status === 'error') setStatus('idle');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="animate-spin text-blue-600" size={32} />
        <span className="text-xs font-black text-gray-400 uppercase tracking-widest text-center">Préparation du formulaire...</span>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center space-y-6">
        <motion.div 
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center shadow-lg"
        >
          <CheckCircle size={48} />
        </motion.div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-gray-900 uppercase">Message Envoyé !</h2>
          <p className="text-gray-500 font-medium leading-relaxed max-w-xs mx-auto">
            Merci de nous avoir contacté. Notre équipe examinera votre message et vous répondra dans les plus brefs délais.
          </p>
        </div>
        <button 
          onClick={() => setStatus('idle')}
          className="px-8 py-4 bg-gray-900 text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl transition-all active:scale-95"
        >
          Envoyer un autre message
        </button>
      </div>
    );
  }

  const contactEmail = config?.contactInfo?.email || "contact@e-secours.com";
  const contactPhone = config?.contactInfo?.phone || "112 / 18 / 17";
  const contactAddress = config?.contactInfo?.address || "National - Bénin";
  const contactCoverage = config?.contactCoverage || "National - France & DOM-TOM";

  return (
    <div className="space-y-8 pb-12">
      <header className="space-y-1">
        <h1 className="text-2xl font-black tracking-tight text-gray-900 uppercase">Contact</h1>
        <p className="text-sm text-gray-500 font-medium">Nous sommes à votre écoute</p>
      </header>

      {/* Info Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-blue-50 p-4 rounded-3xl border border-blue-100 flex flex-col items-center text-center">
          <Mail className="text-blue-600 mb-2" size={24} />
          <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Email</span>
          <span className="text-xs font-bold text-blue-900 break-all">{contactEmail}</span>
        </div>
        <div className="bg-purple-50 p-4 rounded-3xl border border-purple-100 flex flex-col items-center text-center">
          <Phone className="text-purple-600 mb-2" size={24} />
          <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-1">Urgence</span>
          <span className="text-xs font-bold text-purple-900 tracking-tighter">{contactPhone}</span>
        </div>
      </div>

      <div className="bg-white rounded-[40px] p-8 shadow-sm border border-gray-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5 text-gray-900">
          <MessageCircle size={100} />
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <div className="space-y-4">
            <div className="relative">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 mb-1.5 block">Nom complet</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Jean Dupont"
                  className="w-full bg-gray-50/50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-2xl py-4 pl-12 pr-4 text-sm font-bold transition-all outline-none"
                />
              </div>
            </div>

            <div className="relative">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 mb-1.5 block">Adresse Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="jean@exemple.com"
                  className="w-full bg-gray-50/50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-2xl py-4 pl-12 pr-4 text-sm font-bold transition-all outline-none"
                />
              </div>
            </div>

            <div className="relative">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 mb-1.5 block">Sujet (Optionnel)</label>
              <input 
                type="text" 
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="Question sur l'utilisation..."
                className="w-full bg-gray-50/50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-2xl py-4 px-6 text-sm font-bold transition-all outline-none"
              />
            </div>

            <div className="relative">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 mb-1.5 block">Votre message</label>
              <textarea 
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={4}
                placeholder="Comment pouvons-nous vous aider ?"
                className="w-full bg-gray-50/50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-2xl p-6 text-sm font-bold transition-all outline-none resize-none"
              />
            </div>
          </div>

          <AnimatePresence>
            {status === 'error' && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2 text-red-600 p-4 bg-red-50 rounded-2xl border border-red-100"
              >
                <AlertCircle size={18} />
                <span className="text-xs font-bold">{errorMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <button 
            type="submit"
            disabled={status === 'submitting'}
            className={cn(
              "w-full py-5 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2",
              status === 'submitting' 
                ? "bg-gray-200 text-gray-400" 
                : "bg-blue-600 text-white hover:bg-blue-700"
            )}
          >
            {status === 'submitting' ? (
              <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Send size={18} />
                Envoyer le message
              </>
            )}
          </button>
        </form>
      </div>
      
      <div className="text-center p-8">
        <div className="inline-flex items-center gap-2 p-2 bg-gray-100 rounded-2xl mb-4">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-gray-400 shadow-sm">
            <MapPin size={20} />
          </div>
          <div className="text-left pr-4">
            <div className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Zone de couverture</div>
            <div className="text-[10px] font-bold text-gray-900">{contactCoverage}</div>
          </div>
        </div>
      </div>
      
      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            onClick={() => setShowConfirm(false)}
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
          />
          <div className="relative w-full max-w-sm bg-white rounded-[32px] shadow-2xl p-8 border border-gray-100 overflow-hidden">
            <div className="flex flex-col items-center text-center gap-6">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                <Send size={32} />
              </div>
              <div>
                <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight mb-2">Envoyer le message ?</h3>
                <p className="text-xs font-medium text-gray-500 leading-relaxed uppercase">
                  Votre message sera transmis à notre équipe de support. Nous vous répondrons par email.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 w-full">
                <button 
                  onClick={() => setShowConfirm(false)}
                  className="py-4 rounded-2xl bg-gray-100 text-gray-500 text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 transition-all"
                >
                  Annuler
                </button>
                <button 
                  onClick={executeSubmit}
                  className="py-4 rounded-2xl bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all"
                >
                  Confirmer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
