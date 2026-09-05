import React, { useState } from 'react';
import { 
  Phone, Shield, Flame, Activity, Siren, ExternalLink, Loader2, Baby, 
  HeartHandshake, Lock, ShieldAlert, Users, Search, PhoneCall, Building2, 
  Landmark, Radio, Scale, Compass, Trees, LifeBuoy, Pill, Globe, Copy, Check, Info
} from 'lucide-react';
import { useAppConfig } from '../lib/useAppConfig';

export interface EmergencyNumberItem {
  id: string;
  label: string;
  number: string;
  alternateNumbers?: string[];
  icon: any;
  color: string;
  description: string;
  category: 'Urgences & Secours' | 'Numéros Courts ARCEP' | 'Ministères & Standards' | 'Santé & Hôpitaux 24h/24' | 'Centres Promotion Sociale' | string;
  isTollFree?: boolean;
}

export const DEFAULT_NUMBERS: EmergencyNumberItem[] = [
  // ==========================================
  // 1. NUMÉROS D'URGENCE ET D'ASSISTANCE
  // ==========================================
  { 
    id: '117', 
    label: 'Police Républicaine (Police Secours)', 
    number: '117', 
    alternateNumbers: ['117', '116'],
    icon: Shield, 
    color: 'bg-indigo-600', 
    description: 'Police Secours - Sécurité publique, alertes et interventions d\'urgence (117 ou 116)',
    category: 'Urgences & Secours',
    isTollFree: true
  },
  { 
    id: '118', 
    label: 'Sapeurs-Pompiers / Protection Civile', 
    number: '118', 
    icon: Flame, 
    color: 'bg-red-600', 
    description: 'Incendies, secours d\'urgence, accidents graves, noyades et catastrophes',
    category: 'Urgences & Secours',
    isTollFree: true
  },
  { 
    id: '112', 
    label: 'Numéro d\'Urgence Européen & International', 
    number: '112', 
    icon: Activity, 
    color: 'bg-red-500', 
    description: 'Numéro standardisé d\'urgence vitale, accessible depuis tout téléphone',
    category: 'Urgences & Secours',
    isTollFree: true
  },
  { 
    id: 'samu-nat', 
    label: 'SAMU National (Urgences Médicales)', 
    number: '112', 
    alternateNumbers: ['112', '+229 01 68 30 00 00'],
    icon: Activity, 
    color: 'bg-rose-600', 
    description: 'Service d\'Aide Médicale d\'Urgence - Prise en charge des urgences vitales',
    category: 'Urgences & Secours',
    isTollFree: true
  },
  { 
    id: '166', 
    label: 'Ministère de l\'Intérieur (Numéro Vert)', 
    number: '166', 
    icon: ShieldAlert, 
    color: 'bg-blue-700', 
    description: 'Ligne verte de dénonciation, signalement sécuritaire et assistance citoyenne',
    category: 'Urgences & Secours',
    isTollFree: true
  },
  { 
    id: '160', 
    label: 'Brigade des Mineurs', 
    number: '160', 
    icon: Baby, 
    color: 'bg-emerald-600', 
    description: 'Protection de l\'enfance, enfants disparus, maltraitance et mineurs en danger',
    category: 'Urgences & Secours',
    isTollFree: true
  },
  { 
    id: '114', 
    label: 'Institut National de la Femme (INF)', 
    number: '114', 
    icon: HeartHandshake, 
    color: 'bg-purple-600', 
    description: 'Écoute, signalement et assistance aux victimes de Violences Basées sur le Genre (VBG)',
    category: 'Urgences & Secours',
    isTollFree: true
  },
  { 
    id: '136', 
    label: 'Ministère de la Santé (Ligne Verte)', 
    number: '136', 
    icon: Activity, 
    color: 'bg-teal-600', 
    description: 'Numéro vert officiel d\'information, conseils et alertes sanitaires',
    category: 'Urgences & Secours',
    isTollFree: true
  },

  // ==========================================
  // 2. CONTACTS DES MINISTÈRES (STANDARDS)
  // ==========================================
  { 
    id: 'min-sante', 
    label: 'Ministère de la Santé (Standard)', 
    number: '+229 21 33 21 78', 
    alternateNumbers: ['+229 21 33 21 78', '+229 21 33 21 63'],
    icon: Building2, 
    color: 'bg-teal-700', 
    description: 'Administration centrale et standard général du Ministère de la Santé',
    category: 'Ministères & Standards'
  },
  { 
    id: 'min-finances', 
    label: 'Ministère de l\'Économie et des Finances', 
    number: '+229 21 30 10 20', 
    icon: Landmark, 
    color: 'bg-slate-700', 
    description: 'Standard général du Ministère de l\'Économie et des Finances',
    category: 'Ministères & Standards'
  },
  { 
    id: 'min-mines', 
    label: 'Ministère de l\'Eau et des Mines', 
    number: '+229 21 30 45 10', 
    icon: Building2, 
    color: 'bg-cyan-700', 
    description: 'Standard officiel du Ministère de l\'Eau et des Mines',
    category: 'Ministères & Standards'
  },
  { 
    id: 'min-fonction-publique', 
    label: 'Ministère du Budget et de la Fonction Publique', 
    number: '+229 01 52 16 00 00', 
    icon: Building2, 
    color: 'bg-blue-800', 
    description: 'Gestion de la fonction publique, budget national et réformes administratives',
    category: 'Ministères & Standards'
  },
  { 
    id: 'min-famille', 
    label: 'Ministère de la Famille (MASMF)', 
    number: '+229 01 21 32 19 43', 
    icon: Users, 
    color: 'bg-emerald-700', 
    description: 'Affaires sociales, action familiale, promotion de la femme et microfinance',
    category: 'Ministères & Standards'
  },
  { 
    id: 'portail-public', 
    label: 'Portail National des Services Publics', 
    number: '+229 21 31 32 98', 
    icon: Globe, 
    color: 'bg-indigo-700', 
    description: 'Plateforme nationale d\'assistance aux démarches administratives et e-services',
    category: 'Ministères & Standards'
  },

  // ==========================================
  // 3. NUMÉROS COURTS (ARCEP BÉNIN)
  // ==========================================
  { 
    id: '105', 
    label: 'Ministère du Numérique et de la Digitalisation', 
    number: '105', 
    icon: Globe, 
    color: 'bg-blue-600', 
    description: 'Assistance et services numériques gouvernementaux',
    category: 'Numéros Courts ARCEP',
    isTollFree: true
  },
  { 
    id: '110', 
    label: 'ASIN (Systèmes d\'Information et Numérique)', 
    number: '110', 
    alternateNumbers: ['110', '135'],
    icon: Globe, 
    color: 'bg-blue-600', 
    description: 'Agence des Systèmes d\'Information et du Numérique (110 / 135)',
    category: 'Numéros Courts ARCEP',
    isTollFree: true
  },
  { 
    id: '113', 
    label: 'Ministère de l\'Industrie et du Commerce', 
    number: '113', 
    icon: Building2, 
    color: 'bg-amber-600', 
    description: 'Contrôle des prix, concurrence, dénonciations commerciales et industrie',
    category: 'Numéros Courts ARCEP',
    isTollFree: true
  },
  { 
    id: '115', 
    label: 'Présidence de la République du Bénin', 
    number: '115', 
    alternateNumbers: ['115', '155'],
    icon: Landmark, 
    color: 'bg-slate-800', 
    description: 'Lignes directes officielles de la Présidence de la République (115 / 155)',
    category: 'Numéros Courts ARCEP',
    isTollFree: true
  },
  { 
    id: '119', 
    label: 'WAPCO (West African Gas Pipeline)', 
    number: '119', 
    alternateNumbers: ['119', '181'],
    icon: Flame, 
    color: 'bg-orange-600', 
    description: 'Gazoduc de l\'Afrique de l\'Ouest & sécurité des infrastructures (119 / 181)',
    category: 'Numéros Courts ARCEP',
    isTollFree: true
  },
  { 
    id: '130', 
    label: 'Ministère du Numérique (Usagers)', 
    number: '130', 
    icon: Globe, 
    color: 'bg-sky-600', 
    description: 'Ligne de contact usagers et accompagnement à la transformation digitale',
    category: 'Numéros Courts ARCEP',
    isTollFree: true
  },
  { 
    id: '131', 
    label: 'ARCEP Bénin', 
    number: '131', 
    icon: Radio, 
    color: 'bg-indigo-600', 
    description: 'Autorité de Régulation des Communications Électroniques et de la Poste',
    category: 'Numéros Courts ARCEP',
    isTollFree: true
  },
  { 
    id: '132', 
    label: 'Système des Nations Unies (ONU-Bénin)', 
    number: '132', 
    icon: Globe, 
    color: 'bg-sky-500', 
    description: 'Représentation et coordination des agences des Nations Unies au Bénin',
    category: 'Numéros Courts ARCEP',
    isTollFree: true
  },
  { 
    id: '133', 
    label: 'Direction Générale des Impôts (DGI)', 
    number: '133', 
    icon: Landmark, 
    color: 'bg-emerald-600', 
    description: 'Assistance fiscale, télépéages, déclarations d\'impôts et formalités fiscales',
    category: 'Numéros Courts ARCEP',
    isTollFree: true
  },
  { 
    id: '134', 
    label: 'ANLC (Lutte contre la Corruption)', 
    number: '134', 
    icon: Scale, 
    color: 'bg-red-700', 
    description: 'Autorité Nationale de Lutte contre la Corruption - Signalement d\'infractions',
    category: 'Numéros Courts ARCEP',
    isTollFree: true
  },
  { 
    id: '137', 
    label: 'ANPPDT (Patrimoines & Tourisme)', 
    number: '137', 
    icon: Compass, 
    color: 'bg-amber-700', 
    description: 'Agence Nationale de Promotion des Patrimoines et de Développement du Tourisme',
    category: 'Numéros Courts ARCEP',
    isTollFree: true
  },
  { 
    id: '138', 
    label: 'MASMF / Protection & Assistance Enfants', 
    number: '138', 
    icon: Baby, 
    color: 'bg-emerald-600', 
    description: 'Ligne d\'urgence sociale et assistance aux enfants en situation de détresse',
    category: 'Numéros Courts ARCEP',
    isTollFree: true
  },
  { 
    id: '141', 
    label: 'UIGP / MCVT (Cadre de Vie & Transports)', 
    number: '141', 
    icon: Building2, 
    color: 'bg-teal-600', 
    description: 'Unité d\'intervention et gestion du Cadre de Vie et des Transports',
    category: 'Numéros Courts ARCEP',
    isTollFree: true
  },
  { 
    id: '144', 
    label: 'Agence Béninoise pour l\'Environnement (ABE)', 
    number: '144', 
    icon: Trees, 
    color: 'bg-green-600', 
    description: 'Veille écologique, préservation environnementale et signalement de pollutions',
    category: 'Numéros Courts ARCEP',
    isTollFree: true
  },
  { 
    id: '145', 
    label: 'Direction Générale des Eaux, Forêts & Chasse', 
    number: '145', 
    icon: Trees, 
    color: 'bg-emerald-800', 
    description: 'Protection des forêts, faune sauvage, parcs naturels et lutte anti-braconnage',
    category: 'Numéros Courts ARCEP',
    isTollFree: true
  },
  { 
    id: '150', 
    label: 'APDP (Protection des Données Personnelles)', 
    number: '150', 
    icon: Lock, 
    color: 'bg-slate-700', 
    description: 'Autorité de Protection des Données Personnelles - Droits numériques et vie privée',
    category: 'Numéros Courts ARCEP',
    isTollFree: true
  },
  { 
    id: '151', 
    label: 'CNIN / Cybercriminalité & Violences Numériques', 
    number: '151', 
    icon: Lock, 
    color: 'bg-blue-700', 
    description: 'Centre National d\'Investigations Numériques - Arnaques, chantages et cybercrimes',
    category: 'Numéros Courts ARCEP',
    isTollFree: true
  },
  { 
    id: '170', 
    label: 'Port Autonome de Cotonou (PAC)', 
    number: '170', 
    icon: LifeBuoy, 
    color: 'bg-cyan-600', 
    description: 'Sécurité portuaire, logistique, douanes et opérations maritimes',
    category: 'Numéros Courts ARCEP',
    isTollFree: true
  },
  { 
    id: '189', 
    label: 'Programme Alimentaire Mondial (PAM / WFP)', 
    number: '189', 
    icon: Globe, 
    color: 'bg-blue-500', 
    description: 'Assistance alimentaire d\'urgence et cantines scolaires (World Food Programme)',
    category: 'Numéros Courts ARCEP',
    isTollFree: true
  },
  { 
    id: '190', 
    label: 'FNEC (Fonds National Environnement & Climat)', 
    number: '190', 
    icon: Trees, 
    color: 'bg-green-700', 
    description: 'Financement et soutien aux projets climatiques et environnementaux',
    category: 'Numéros Courts ARCEP',
    isTollFree: true
  },
  { 
    id: '191', 
    label: 'African Parks Network (Parcs Nationaux)', 
    number: '191', 
    icon: Trees, 
    color: 'bg-amber-800', 
    description: 'Gestion et sécurité des Parcs Nationaux de la Pendjari et du W',
    category: 'Numéros Courts ARCEP',
    isTollFree: true
  },
  { 
    id: '198', 
    label: 'Opération Mirador (Sécurité Frontières)', 
    number: '198', 
    icon: ShieldAlert, 
    color: 'bg-red-800', 
    description: 'Dispositif national de veille sécuritaire, renseignement et défense des frontières',
    category: 'Numéros Courts ARCEP',
    isTollFree: true
  },

  // ==========================================
  // 4. AUTRES CONTACTS UTILES (SANTÉ & HÔPITAUX)
  // ==========================================
  { 
    id: 'cnhu', 
    label: 'Hôpital C.N.H.U. - Hubert K. Maga (Cotonou)', 
    number: '+229 01 21 30 06 56', 
    icon: Activity, 
    color: 'bg-red-600', 
    description: 'Centre National Hospitalier et Universitaire - Urgences médicales 24h/24',
    category: 'Santé & Hôpitaux 24h/24'
  },
  { 
    id: 'pharmacie-guezo', 
    label: 'Pharmacie Camp Guézo (24h/24)', 
    number: '+229 01 21 31 35 55', 
    icon: Pill, 
    color: 'bg-emerald-600', 
    description: 'Pharmacie de garde permanente ouverte 24h/24 et 7j/7 à Cotonou',
    category: 'Santé & Hôpitaux 24h/24'
  },
  { 
    id: 'pharmacie-jonquet', 
    label: 'Pharmacie Jonquet (24h/24)', 
    number: '+229 01 98 99 62 10', 
    icon: Pill, 
    color: 'bg-emerald-600', 
    description: 'Pharmacie de garde permanente ouverte 24h/24 et 7j/7 à Cotonou',
    category: 'Santé & Hôpitaux 24h/24'
  },
  { 
    id: 'samu-cotonou', 
    label: 'SAMU Cotonou & Littoral', 
    number: '+229 95 36 11 04', 
    alternateNumbers: ['+229 95 36 11 04', '+229 90 90 30 02'],
    icon: Activity, 
    color: 'bg-rose-600', 
    description: 'Ligne directe du SAMU à Cotonou (+229 95 36 11 04 / 90 90 30 02)',
    category: 'Santé & Hôpitaux 24h/24'
  },
  { 
    id: 'samu-parakou', 
    label: 'SAMU Parakou & Nord Bénin', 
    number: '+229 90 01 21 31', 
    alternateNumbers: ['+229 90 01 21 31', '+229 97 22 14 24'],
    icon: Activity, 
    color: 'bg-rose-600', 
    description: 'Ligne directe du SAMU à Parakou (+229 90 01 21 31 / 97 22 14 24)',
    category: 'Santé & Hôpitaux 24h/24'
  },

  // ==========================================
  // 5. CENTRES DE PROMOTION SOCIALE (CPS)
  // ==========================================
  { 
    id: 'cps-national', 
    label: 'Centres de Promotion Sociale (CPS Bénin)', 
    number: '+229 01 21 32 19 43', 
    icon: Users, 
    color: 'bg-emerald-700', 
    description: 'Orientation et prise en charge sociale dans toutes les communes via le standard ministériel',
    category: 'Centres Promotion Sociale'
  },
];

const resolveIcon = (iconName: string | any) => {
  if (typeof iconName !== 'string') return iconName || Phone;
  switch (iconName) {
    case 'Shield': return Shield;
    case 'Flame': return Flame;
    case 'Baby': return Baby;
    case 'HeartHandshake': return HeartHandshake;
    case 'Lock': return Lock;
    case 'ShieldAlert': return ShieldAlert;
    case 'Activity': return Activity;
    case 'Siren': return Siren;
    case 'Users': return Users;
    case 'Building2': return Building2;
    case 'Landmark': return Landmark;
    case 'Radio': return Radio;
    case 'Scale': return Scale;
    case 'Compass': return Compass;
    case 'Trees': return Trees;
    case 'LifeBuoy': return LifeBuoy;
    case 'Pill': return Pill;
    case 'Globe': return Globe;
    default: return Phone;
  }
};

const CATEGORIES_FILTER = [
  { id: 'all', label: 'Tous' },
  { id: 'Urgences & Secours', label: '🚨 Urgences & Secours' },
  { id: 'Numéros Courts ARCEP', label: '⚡ Numéros Courts (ARCEP)' },
  { id: 'Ministères & Standards', label: '🏛️ Ministères' },
  { id: 'Santé & Hôpitaux 24h/24', label: '🏥 Santé & Pharmacies 24/24' },
  { id: 'Centres Promotion Sociale', label: '🤝 Social (CPS)' },
];

export const Numbers = () => {
  const { config, loading } = useAppConfig();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [copiedNumber, setCopiedNumber] = useState<string | null>(null);

  const handleCopy = (e: React.MouseEvent, numStr: string) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(numStr.replace(/\s+/g, ''));
    setCopiedNumber(numStr);
    setTimeout(() => setCopiedNumber(null), 2000);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="animate-spin text-blue-600" size={32} />
        <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Chargement de l'annuaire...</span>
      </div>
    );
  }

  // Use Firestore numbers if they exist and are custom, otherwise use updated complete defaults
  const rawNumbers = config?.numbers && config.numbers.length > 0 ? config.numbers : DEFAULT_NUMBERS;
  
  const emergencyNumbers: EmergencyNumberItem[] = rawNumbers.map((n: any, i: number) => ({
    ...n,
    id: n.id || `num-${i}`,
    icon: resolveIcon(n.icon),
    category: n.category || 'Urgences & Secours'
  }));

  const filteredNumbers = emergencyNumbers.filter((num: EmergencyNumberItem) => {
    // Filter by category
    if (selectedCategory !== 'all' && num.category !== selectedCategory) {
      return false;
    }

    // Filter by search query
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase().trim();
    const matchesNumber = num.number?.toLowerCase().includes(q);
    const matchesAlternate = num.alternateNumbers?.some(alt => alt.toLowerCase().includes(q));
    const matchesLabel = num.label?.toLowerCase().includes(q);
    const matchesDesc = num.description?.toLowerCase().includes(q);
    const matchesCat = num.category?.toLowerCase().includes(q);

    return matchesNumber || matchesAlternate || matchesLabel || matchesDesc || matchesCat;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="px-1">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-gray-900 mb-1">Numéros d'Urgence & Utiles</h2>
            <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">
              Annuaire officiel du Bénin · {emergencyNumbers.length} contacts
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shadow-sm border border-red-100">
            <PhoneCall size={24} />
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input 
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Rechercher par numéro ou mot-clé (ex: 117, SAMU, CNHU, INF, Mines, 151...)"
          className="w-full bg-white border border-gray-100 rounded-2xl py-3.5 pl-11 pr-10 text-xs font-bold text-gray-900 placeholder:text-gray-400 shadow-sm focus:outline-none focus:border-blue-500 transition-all"
        />
        {searchTerm && (
          <button 
            onClick={() => setSearchTerm('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-black text-gray-400 hover:text-gray-600 p-1"
          >
            ✕
          </button>
        )}
      </div>

      {/* Category Pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 pt-1 no-scrollbar -mx-1 px-1">
        {CATEGORIES_FILTER.map((cat) => {
          const count = cat.id === 'all' 
            ? emergencyNumbers.length 
            : emergencyNumbers.filter(n => n.category === cat.id).length;

          if (count === 0 && cat.id !== 'all') return null;

          const isSelected = selectedCategory === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-2 whitespace-nowrap px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-wider transition-all shrink-0 ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                  : 'bg-white text-gray-600 border border-gray-100 hover:bg-gray-50'
              }`}
            >
              <span>{cat.label}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                isSelected ? 'bg-blue-700 text-white' : 'bg-gray-100 text-gray-500'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Numbers List */}
      <div className="space-y-3">
        {filteredNumbers.map((num: EmergencyNumberItem) => {
          const alternateList = num.alternateNumbers && num.alternateNumbers.length > 0 
            ? num.alternateNumbers 
            : [num.number];

          return (
            <div
              key={num.id}
              id={`emergency-card-${num.id}`}
              className="p-4 sm:p-5 bg-white rounded-[28px] sm:rounded-[32px] border border-gray-100 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="flex items-start gap-4 sm:gap-5">
                {/* Icon Badge */}
                <div className={`w-13 h-13 sm:w-16 sm:h-16 ${num.color || 'bg-blue-600'} rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0 group-hover:scale-105 transition-transform`}>
                  <num.icon size={26} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xl sm:text-2xl font-black text-gray-900 leading-none tracking-tight">
                        {num.number}
                      </span>

                      {num.isTollFree && (
                        <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100">
                          Numéro Gratuit
                        </span>
                      )}

                      {num.category && (
                        <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-gray-100 text-gray-600">
                          {num.category}
                        </span>
                      )}
                    </div>

                    {/* Copy button */}
                    <button
                      onClick={(e) => handleCopy(e, num.number)}
                      title="Copier le numéro"
                      className="flex items-center gap-1 text-[10px] font-bold text-gray-400 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 px-2 py-1 rounded-lg transition-colors"
                    >
                      {copiedNumber === num.number ? (
                        <>
                          <Check size={12} className="text-emerald-600" />
                          <span className="text-emerald-600">Copié !</span>
                        </>
                      ) : (
                        <>
                          <Copy size={12} />
                          <span>Copier</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Label & Description */}
                  <h3 className="text-sm font-black text-gray-800 mt-1">{num.label}</h3>
                  <p className="text-[11px] text-gray-500 font-medium mt-0.5 leading-relaxed">
                    {num.description}
                  </p>

                  {/* Call Action Buttons */}
                  <div className="flex flex-wrap gap-2 mt-3 pt-2 border-t border-gray-50">
                    {alternateList.map((telNum, idx) => (
                      <a
                        key={idx}
                        href={`tel:${telNum.replace(/\s+/g, '')}`}
                        className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider px-3.5 py-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white transition-all active:scale-95 shadow-sm"
                      >
                        <Phone size={13} />
                        <span>Appeler {telNum}</span>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {filteredNumbers.length === 0 && (
          <div className="text-center py-14 bg-white rounded-3xl border border-gray-100 p-6 space-y-3">
            <p className="text-sm font-black text-gray-700">Aucun numéro correspondant à votre recherche.</p>
            <p className="text-xs text-gray-400">Essayez un autre mot-clé (ex: Police, Pompiers, SAMU, 114, Santé...)</p>
            <button 
              onClick={() => { setSearchTerm(''); setSelectedCategory('all'); }} 
              className="mt-2 text-xs font-black text-blue-600 uppercase tracking-wider hover:underline"
            >
              Réinitialiser tous les filtres
            </button>
          </div>
        )}
      </div>

      {/* Information Banner */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-3xl p-6 space-y-3">
        <div className="flex items-center gap-2 text-blue-700">
          <Info size={18} />
          <h4 className="text-xs font-black uppercase tracking-widest">Informations et Bonnes Pratiques</h4>
        </div>
        <p className="text-xs text-gray-600 font-medium leading-relaxed">
          • Les numéros courts d'urgence (<strong>117</strong>, <strong>118</strong>, <strong>112</strong>, <strong>166</strong>, <strong>160</strong>, <strong>114</strong>, <strong>136</strong>, <strong>138</strong>, <strong>151</strong>) sont des lignes gratuites joignables 24h/24 depuis tous les opérateurs au Bénin (MTN, Moov, Celtiis).<br />
          • En cas de situation critique nécessitant une intervention géolocalisée immédiate, utilisez le bouton <strong>SOS</strong> en bas de l'application.
        </p>
      </div>
    </div>
  );
};


