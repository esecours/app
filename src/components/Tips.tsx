import React, { useState, useMemo } from 'react';
import { 
  HeartPulse, 
  Ban, 
  Wind, 
  Search, 
  ChevronRight, 
  Loader2, 
  Flame, 
  Activity, 
  Shield, 
  Siren, 
  AlertCircle, 
  X, 
  ChevronDown,
  Scale,
  Users,
  FileText,
  Phone,
  Mail,
  Globe,
  MapPin,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  MessageCircle,
  Clock,
  BookOpen,
  Building2,
  Landmark,
  HeartHandshake,
  Award,
  HelpCircle,
  Copy,
  Check,
  Pill,
  Baby,
  ShieldAlert,
  Eye,
  Heart,
  Send,
  Stethoscope,
  Lock,
  ShieldCheck,
  Compass,
  ThumbsUp,
  ThumbsDown,
  GraduationCap
} from 'lucide-react';
import { useAppConfig } from '../lib/useAppConfig';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { PocketGuide } from './PocketGuide';
import { 
  BENIN_SSR_LEGAL_FRAMEWORK, 
  BENIN_YOUTH_SSR_ORGANIZATIONS, 
  FIRST_AID_TIPS,
  LegalFrameworkItem,
  YouthOrganizationItem
} from '../data/ssrLegalAndOrganizations';
import { 
  HEALTH_TOPICS_SSR, 
  SAFETY_EMERGENCY_TIPS,
  HealthTopicItem,
  SafetyEmergencyItem
} from '../data/healthAndSafetyTips';

type TabType = 'all' | 'guide' | 'health' | 'safety' | 'legal' | 'organizations' | 'firstaid';

export const Tips = () => {
  const { config, loading } = useAppConfig();
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Expanded items state
  const [expandedHealthId, setExpandedHealthId] = useState<string | null>(null);
  const [expandedSafetyId, setExpandedSafetyId] = useState<string | null>(null);
  const [expandedLegalId, setExpandedLegalId] = useState<string | null>(null);
  const [expandedOrgId, setExpandedOrgId] = useState<string | null>(null);
  const [expandedTipId, setExpandedTipId] = useState<number | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Sub-category filters
  const [healthCategoryFilter, setHealthCategoryFilter] = useState<string>('all');
  const [safetyCategoryFilter, setSafetyCategoryFilter] = useState<string>('all');
  const [legalCategoryFilter, setLegalCategoryFilter] = useState<string>('all');

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2500);
  };

  // Combine custom admin tips with default tips if configured
  const firstAidTipsList = useMemo(() => {
    if (config?.tips && config.tips.length > 0) {
      return config.tips;
    }
    return FIRST_AID_TIPS;
  }, [config?.tips]);

  // Filtered Health Topics (Contraception, IST, VIH, Grossesse)
  const filteredHealth = useMemo(() => {
    if (activeTab === 'safety' || activeTab === 'legal' || activeTab === 'organizations' || activeTab === 'firstaid' || activeTab === 'guide') return [];
    let items = HEALTH_TOPICS_SSR;

    if (healthCategoryFilter !== 'all') {
      items = items.filter(item => item.category === healthCategoryFilter);
    }

    const q = searchQuery.toLowerCase().trim();
    if (!q) return items;
    return items.filter(item => 
      item.title.toLowerCase().includes(q) ||
      item.summary.toLowerCase().includes(q) ||
      item.categoryLabel.toLowerCase().includes(q) ||
      item.keyPoints.some(p => p.toLowerCase().includes(q)) ||
      item.detailedSections.some(s => s.heading.toLowerCase().includes(q) || s.content.toLowerCase().includes(q) || (s.points && s.points.some(pt => pt.toLowerCase().includes(q)))) ||
      item.practicalDo.some(d => d.toLowerCase().includes(q)) ||
      item.practicalDont.some(d => d.toLowerCase().includes(q))
    );
  }, [activeTab, healthCategoryFilter, searchQuery]);

  // Filtered Safety & Emergency Tips (Agression, Harcelement, Viol, Mariage Force)
  const filteredSafety = useMemo(() => {
    if (activeTab === 'health' || activeTab === 'legal' || activeTab === 'organizations' || activeTab === 'firstaid' || activeTab === 'guide') return [];
    let items = SAFETY_EMERGENCY_TIPS;

    if (safetyCategoryFilter !== 'all') {
      items = items.filter(item => item.situation === safetyCategoryFilter);
    }

    const q = searchQuery.toLowerCase().trim();
    if (!q) return items;
    return items.filter(item => 
      item.title.toLowerCase().includes(q) ||
      item.summary.toLowerCase().includes(q) ||
      item.situationLabel.toLowerCase().includes(q) ||
      item.steps.some(s => s.title.toLowerCase().includes(q) || s.description.toLowerCase().includes(q)) ||
      item.legalProtectionsInBenin.lawTitle.toLowerCase().includes(q) ||
      item.legalProtectionsInBenin.penalties.toLowerCase().includes(q) ||
      item.evidenceAndPrecautions.some(e => e.toLowerCase().includes(q))
    );
  }, [activeTab, safetyCategoryFilter, searchQuery]);

  // Filtered Legal Framework
  const filteredLegal = useMemo(() => {
    if (activeTab === 'health' || activeTab === 'safety' || activeTab === 'organizations' || activeTab === 'firstaid' || activeTab === 'guide') return [];
    let items = BENIN_SSR_LEGAL_FRAMEWORK;
    
    if (legalCategoryFilter !== 'all') {
      items = items.filter(item => item.category === legalCategoryFilter);
    }

    const q = searchQuery.toLowerCase().trim();
    if (!q) return items;
    return items.filter(item => 
      item.title.toLowerCase().includes(q) ||
      item.lawRef.toLowerCase().includes(q) ||
      item.summary.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.keyArticles.some(a => a.heading.toLowerCase().includes(q) || a.content.toLowerCase().includes(q) || a.implication.toLowerCase().includes(q)) ||
      item.rightsAndGuarantees.some(r => r.toLowerCase().includes(q))
    );
  }, [activeTab, legalCategoryFilter, searchQuery]);

  // Filtered Youth Organizations
  const filteredOrgs = useMemo(() => {
    if (activeTab === 'health' || activeTab === 'safety' || activeTab === 'legal' || activeTab === 'firstaid' || activeTab === 'guide') return [];
    const q = searchQuery.toLowerCase().trim();
    if (!q) return BENIN_YOUTH_SSR_ORGANIZATIONS;
    return BENIN_YOUTH_SSR_ORGANIZATIONS.filter(org => 
      org.name.toLowerCase().includes(q) ||
      org.sigle.toLowerCase().includes(q) ||
      org.tagline.toLowerCase().includes(q) ||
      org.category.toLowerCase().includes(q) ||
      org.qui.target.toLowerCase().includes(q) ||
      org.quoi.thematics.some(t => t.toLowerCase().includes(q)) ||
      org.quoi.coreMissions.some(m => m.toLowerCase().includes(q)) ||
      org.impactActivities.some(act => act.title.toLowerCase().includes(q) || act.description.toLowerCase().includes(q))
    );
  }, [activeTab, searchQuery]);

  // Filtered First Aid Tips
  const filteredFirstAid = useMemo(() => {
    if (activeTab === 'health' || activeTab === 'safety' || activeTab === 'legal' || activeTab === 'organizations' || activeTab === 'guide') return [];
    const q = searchQuery.toLowerCase().trim();
    if (!q) return firstAidTipsList;
    return firstAidTipsList.filter((tip: any) => 
      tip.title.toLowerCase().includes(q) ||
      tip.description.toLowerCase().includes(q) ||
      (tip.steps && tip.steps.some((s: string) => s.toLowerCase().includes(q)))
    );
  }, [activeTab, searchQuery, firstAidTipsList]);

  const totalResultsCount = filteredHealth.length + filteredSafety.length + filteredLegal.length + filteredOrgs.length + filteredFirstAid.length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="animate-spin text-blue-600" size={32} />
        <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Guide & Conseils en chargement...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-gray-900 via-slate-900 to-blue-950 text-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-[10px] font-black tracking-widest uppercase text-blue-300 backdrop-blur-sm border border-white/10">
            <Sparkles size={12} className="text-blue-400" />
            Centre National de Ressources & Conseils
          </div>
          <h2 className="text-lg sm:text-2xl md:text-3xl font-black tracking-tight text-white">
            Conseils, Santé & Droits
          </h2>
          <p className="text-xs sm:text-sm text-gray-300 font-medium max-w-2xl leading-relaxed">
            Consultez les guides pratiques complets : <strong>Contraception, IST, VIH, Grossesse</strong>, protocoles d'urgence en cas d'<strong>Agression, Harcèlement, Viol, Mariage Forcé au Bénin</strong>, cadre légal officiel et premiers secours.
          </p>
        </div>
      </div>

      {/* Copy Alert Toast */}
      <AnimatePresence>
        {copiedText && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-gray-700 text-xs font-bold"
          >
            <CheckCircle2 size={16} className="text-green-400 shrink-0" />
            <span>{copiedText} copié dans le presse-papier !</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Input Bar */}
      <div className="relative">
        <input 
          type="text" 
          placeholder="Rechercher : Contraception, IST, VIH, Grossesse, Harcèlement, Viol, Mariage forcé, 114, CMI..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white border border-gray-200 rounded-2xl py-3 sm:py-3.5 pl-10 sm:pl-12 pr-10 text-xs sm:text-sm font-medium shadow-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-800 placeholder-gray-400"
        />
        <Search className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        {searchQuery && (
          <button 
            onClick={() => setSearchQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded-lg"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {[
          { id: 'all', label: 'TOUT AFFICHER', icon: Sparkles, count: HEALTH_TOPICS_SSR.length + SAFETY_EMERGENCY_TIPS.length + BENIN_SSR_LEGAL_FRAMEWORK.length + BENIN_YOUTH_SSR_ORGANIZATIONS.length + firstAidTipsList.length },
          { id: 'guide', label: 'GUIDE DE POCHE', icon: Compass, count: 'Interactif' },
          { id: 'health', label: 'CONTRACEPTION, IST, VIH & GROSSESSE', icon: Pill, count: HEALTH_TOPICS_SSR.length },
          { id: 'safety', label: 'AGRESSION, HARCÈLEMENT, VIOL & MARIAGE FORCÉ', icon: ShieldAlert, count: SAFETY_EMERGENCY_TIPS.length },
          { id: 'legal', label: 'CADRE LÉGAL BÉNIN', icon: Scale, count: BENIN_SSR_LEGAL_FRAMEWORK.length },
          { id: 'organizations', label: 'OSC JEUNES SSR', icon: Users, count: BENIN_YOUTH_SSR_ORGANIZATIONS.length },
          { id: 'firstaid', label: 'PREMIERS SECOURS', icon: HeartPulse, count: firstAidTipsList.length }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabType)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-3 rounded-xl sm:rounded-2xl text-[10px] sm:text-xs font-black uppercase tracking-wider border transition-all shrink-0 active:scale-95",
              activeTab === tab.id
                ? "bg-gray-900 text-white border-gray-900 shadow-md shadow-gray-200"
                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
            )}
          >
            <tab.icon size={15} className={activeTab === tab.id ? "text-blue-400" : "text-gray-400"} />
            <span>{tab.label}</span>
            <span className={cn(
              "px-2 py-0.5 rounded-full text-[10px] font-black",
              activeTab === tab.id ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
            )}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Results Count Banner if searching */}
      {searchQuery && (
        <div className="flex items-center justify-between px-3.5 py-2.5 bg-blue-50/80 border border-blue-100 rounded-xl text-xs font-bold text-blue-900">
          <span>{totalResultsCount} résultat(s) trouvé(s) pour « {searchQuery} »</span>
          <button onClick={() => setSearchQuery('')} className="underline hover:text-blue-950 text-[11px]">Effacer la recherche</button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 0: GUIDE DE POCHE INTERACTIF                                     */}
      {/* ========================================================================= */}
      {(activeTab === 'all' || activeTab === 'guide') && !searchQuery && (
        <PocketGuide />
      )}

      {/* ========================================================================= */}
      {/* SECTION 1: SANTÉ SSR (CONTRACEPTION, IST, VIH, GROSSESSE)                 */}
      {/* ========================================================================= */}
      {(activeTab === 'all' || activeTab === 'health') && filteredHealth.length > 0 && (
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between gap-2 px-1">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-teal-100 text-teal-800 rounded-xl">
                <Pill size={20} />
              </div>
              <div>
                <h3 className="text-base sm:text-xl font-black text-gray-900 tracking-tight">
                  Santé Sexuelle & Prévention
                </h3>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">
                  Contraception, IST, VIH / SIDA, Grossesse & Droits
                </p>
              </div>
            </div>
          </div>

          {/* Sub-category Filter Chips for Health */}
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {[
              { id: 'all', label: 'Toutes les thématiques de santé' },
              { id: 'contraception', label: 'Contraception & Urgence 72h' },
              { id: 'ist', label: 'IST & Diagnostic' },
              { id: 'vih', label: 'VIH, TPE 72h & ARV' },
              { id: 'grossesse', label: 'Grossesse & Suivi CPN' }
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setHealthCategoryFilter(cat.id)}
                className={cn(
                  "px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-black tracking-wide whitespace-nowrap transition-all border shrink-0",
                  healthCategoryFilter === cat.id
                    ? "bg-teal-700 text-white border-teal-700 shadow-sm"
                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Health Items List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {(activeTab === 'all' ? filteredHealth.slice(0, 2) : filteredHealth).map((item) => {
              const isExpanded = expandedHealthId === item.id;

              return (
                <motion.div
                  layout
                  key={item.id}
                  className={cn(
                    "bg-white rounded-2xl sm:rounded-3xl border transition-all duration-300 overflow-hidden",
                    isExpanded 
                      ? "border-teal-400 shadow-xl shadow-teal-50 ring-4 ring-teal-50" 
                      : "border-gray-200 shadow-sm hover:border-teal-200"
                  )}
                >
                  <div className="p-4 sm:p-6 md:p-7">
                    {/* Header Badges */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <span className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border", item.badgeColor)}>
                          {item.categoryLabel}
                        </span>
                        {item.urgencyTimeline && (
                          <span className="text-[10px] sm:text-[11px] font-black text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-lg border border-rose-200 flex items-center gap-1">
                            <Clock size={11} />
                            {item.urgencyTimeline}
                          </span>
                        )}
                      </div>
                      {item.legalReference && (
                        <span className="text-[10px] font-bold text-gray-500 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-200">
                          {item.legalReference.split('&')[0]}
                        </span>
                      )}
                    </div>

                    {/* Title & Summary */}
                    <h4 className="text-base sm:text-xl font-black text-gray-900 mb-1.5 sm:mb-2 leading-tight">
                      {item.title}
                    </h4>
                    <p className="text-xs sm:text-sm text-gray-600 font-medium leading-relaxed mb-3 sm:mb-4">
                      {item.summary}
                    </p>

                    {/* Key Points Highlights */}
                    <div className="bg-teal-50/50 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-teal-100/80 mb-3 sm:mb-4 space-y-1.5">
                      <div className="text-[10px] font-black uppercase tracking-widest text-teal-800 flex items-center gap-1.5">
                        <CheckCircle2 size={13} className="text-teal-600" />
                        Points essentiels à retenir
                      </div>
                      <ul className="space-y-1.5 text-xs font-semibold text-gray-800">
                        {item.keyPoints.slice(0, isExpanded ? undefined : 3).map((pt, pIdx) => (
                          <li key={pIdx} className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1.5 shrink-0" />
                            <span>{pt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Expandable Full Guidance */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-4 pt-2 border-t border-gray-100"
                        >
                          {/* Detailed Sections */}
                          <div className="space-y-3">
                            {item.detailedSections.map((sec, sIdx) => (
                              <div key={sIdx} className="bg-gray-50/70 border border-gray-100 rounded-xl p-3 sm:p-4 space-y-1.5">
                                <div className="text-xs font-black text-teal-900">{sec.heading}</div>
                                <p className="text-xs text-gray-700 font-medium leading-relaxed">{sec.content}</p>
                                {sec.points && (
                                  <ul className="mt-2 space-y-1 pl-2 text-xs font-medium text-gray-700">
                                    {sec.points.map((p, ptIdx) => (
                                      <li key={ptIdx} className="flex items-start gap-1.5">
                                        <span className="text-teal-600 font-black">•</span>
                                        <span>{p}</span>
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            ))}
                          </div>

                          {/* Practical Dos and Don'ts */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                            <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-3 space-y-1.5">
                              <div className="text-[10px] font-black uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                                <ThumbsUp size={12} className="text-emerald-600" />
                                Ce qu'il faut faire
                              </div>
                              <ul className="space-y-1 text-xs text-emerald-950 font-medium">
                                {item.practicalDo.map((d, dIdx) => (
                                  <li key={dIdx} className="flex items-start gap-1.5">
                                    <span className="text-emerald-600 font-black">✓</span>
                                    <span>{d}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div className="bg-rose-50/60 border border-rose-100 rounded-xl p-3 space-y-1.5">
                              <div className="text-[10px] font-black uppercase tracking-wider text-rose-800 flex items-center gap-1.5">
                                <ThumbsDown size={12} className="text-rose-600" />
                                À éviter absolument
                              </div>
                              <ul className="space-y-1 text-xs text-rose-950 font-medium">
                                {item.practicalDont.map((d, dIdx) => (
                                  <li key={dIdx} className="flex items-start gap-1.5">
                                    <span className="text-rose-600 font-black">✕</span>
                                    <span>{d}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          {/* Quick Emergency Contacts */}
                          <div className="bg-gray-900 text-white rounded-xl p-3.5 sm:p-4 space-y-2">
                            <div className="text-[10px] font-black uppercase tracking-widest text-teal-300 flex items-center gap-1.5">
                              <Phone size={13} />
                              Contacts directs d'urgence & consultations
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {item.emergencyContacts.map((c, cIdx) => (
                                <a
                                  key={cIdx}
                                  href={`tel:${c.phone}`}
                                  className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold border border-gray-700 transition-colors"
                                >
                                  <Phone size={12} className="text-teal-400" />
                                  <span>{c.name} ({c.phone})</span>
                                </a>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Toggle Button */}
                    <button
                      onClick={() => setExpandedHealthId(isExpanded ? null : item.id)}
                      className="mt-3 flex items-center gap-2 text-xs font-black text-teal-700 uppercase tracking-wider hover:text-teal-900 transition-colors"
                    >
                      {isExpanded ? (
                        <>
                          <span>RÉDUIRE CE GUIDE</span>
                          <ChevronDown size={16} className="rotate-180 transition-transform" />
                        </>
                      ) : (
                        <>
                          <span>VOIR LE GUIDE DÉTAILLÉ & PROTOCOLE</span>
                          <ChevronDown size={16} className="transition-transform" />
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2: URGENCE & SÉCURITÉ (AGRESSION, HARCÈLEMENT, VIOL, MARIAGE FORCÉ)*/}
      {/* ========================================================================= */}
      {(activeTab === 'all' || activeTab === 'safety') && filteredSafety.length > 0 && (
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between gap-2 px-1">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-rose-100 text-rose-800 rounded-xl">
                <ShieldAlert size={20} />
              </div>
              <div>
                <h3 className="text-base sm:text-xl font-black text-gray-900 tracking-tight">
                  Guide d'Urgence & Protection Légale au Bénin
                </h3>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">
                  Que faire en cas d'Agression, Harcèlement, Viol ou Mariage Forcé
                </p>
              </div>
            </div>
          </div>

          {/* Sub-category Filter Chips for Safety */}
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {[
              { id: 'all', label: 'Toutes les situations d\'urgence' },
              { id: 'agression', label: 'Agression Physique' },
              { id: 'harcelement', label: 'Harcèlement (Scolaire, Travail, Cyber)' },
              { id: 'viol', label: 'Viol & Violences Sexuelles (72h)' },
              { id: 'mariage_force', label: 'Mariage Forcé / Enfant (18 ans)' }
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSafetyCategoryFilter(cat.id)}
                className={cn(
                  "px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-black tracking-wide whitespace-nowrap transition-all border shrink-0",
                  safetyCategoryFilter === cat.id
                    ? "bg-rose-700 text-white border-rose-700 shadow-sm"
                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Safety Items List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {(activeTab === 'all' ? filteredSafety.slice(0, 2) : filteredSafety).map((item) => {
              const isExpanded = expandedSafetyId === item.id;

              return (
                <motion.div
                  layout
                  key={item.id}
                  className={cn(
                    "bg-white rounded-2xl sm:rounded-3xl border transition-all duration-300 overflow-hidden",
                    isExpanded 
                      ? "border-rose-400 shadow-xl shadow-rose-50 ring-4 ring-rose-50" 
                      : "border-gray-200 shadow-sm hover:border-rose-200"
                  )}
                >
                  <div className="p-4 sm:p-6 md:p-7">
                    {/* Top Badges */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <span className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border", item.badgeColor)}>
                        {item.situationLabel}
                      </span>
                      <span className="text-[10px] sm:text-[11px] font-black text-rose-800 bg-rose-50 px-2.5 py-0.5 rounded-lg border border-rose-200 flex items-center gap-1">
                        <Clock size={11} />
                        {item.urgentActionTimeline}
                      </span>
                    </div>

                    {/* Title & Summary */}
                    <h4 className="text-base sm:text-xl font-black text-gray-900 mb-1.5 sm:mb-2 leading-tight">
                      {item.title}
                    </h4>
                    <p className="text-xs sm:text-sm text-gray-600 font-medium leading-relaxed mb-3 sm:mb-4">
                      {item.summary}
                    </p>

                    {/* Step-by-Step Procedure Preview */}
                    <div className="space-y-2 mb-3">
                      <div className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-1.5">
                        <Activity size={13} className="text-rose-600" />
                        Démarche d'urgence étape par étape
                      </div>
                      <div className="space-y-2">
                        {item.steps.slice(0, isExpanded ? undefined : 2).map((s, sIdx) => (
                          <div key={sIdx} className="bg-gray-50/80 border border-gray-100 rounded-xl p-3 space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 bg-rose-600 text-white rounded-full flex items-center justify-center text-[10px] font-black shrink-0">
                                {s.stepNumber}
                              </span>
                              <span className="text-xs font-black text-gray-900">{s.title}</span>
                            </div>
                            <p className="text-xs text-gray-600 font-medium pl-7 leading-relaxed">{s.description}</p>
                            {s.actionHighlight && (
                              <div className="pl-7 pt-1">
                                <span className="inline-block bg-rose-50 border border-rose-200 text-rose-800 text-[10px] font-black px-2 py-0.5 rounded-md">
                                  ⚡ {s.actionHighlight}
                                </span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Expandable Legal Protections & Evidence */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-4 pt-2 border-t border-gray-100"
                        >
                          {/* Remaining steps if more than 2 */}
                          {item.steps.length > 2 && (
                            <div className="space-y-2">
                              {item.steps.slice(2).map((s, sIdx) => (
                                <div key={sIdx} className="bg-gray-50/80 border border-gray-100 rounded-xl p-3 space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="w-5 h-5 bg-rose-600 text-white rounded-full flex items-center justify-center text-[10px] font-black shrink-0">
                                      {s.stepNumber}
                                    </span>
                                    <span className="text-xs font-black text-gray-900">{s.title}</span>
                                  </div>
                                  <p className="text-xs text-gray-600 font-medium pl-7 leading-relaxed">{s.description}</p>
                                  {s.actionHighlight && (
                                    <div className="pl-7 pt-1">
                                      <span className="inline-block bg-rose-50 border border-rose-200 text-rose-800 text-[10px] font-black px-2 py-0.5 rounded-md">
                                        ⚡ {s.actionHighlight}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Legal Protections Box */}
                          <div className="bg-slate-900 text-white rounded-2xl p-4 space-y-2 border border-slate-800">
                            <div className="flex items-center justify-between">
                              <div className="text-xs font-black uppercase tracking-widest text-rose-400 flex items-center gap-2">
                                <Scale size={14} />
                                Cadre Légal & Sanctions Pénales au Bénin
                              </div>
                            </div>
                            <div className="text-xs text-gray-300 font-semibold">
                              <strong>Loi applicable :</strong> {item.legalProtectionsInBenin.lawTitle} ({item.legalProtectionsInBenin.articles})
                            </div>
                            <div className="bg-rose-950/60 border border-rose-900 p-2.5 rounded-xl text-xs text-rose-200 font-bold">
                              ⚖️ Sanctions : {item.legalProtectionsInBenin.penalties}
                            </div>
                            <div className="space-y-1 pt-1">
                              <div className="text-[10px] font-black uppercase tracking-wider text-gray-400">Droits garantis à la victime :</div>
                              <ul className="space-y-1 text-xs text-gray-300">
                                {item.legalProtectionsInBenin.guaranteedRights.map((r, rIdx) => (
                                  <li key={rIdx} className="flex items-start gap-1.5">
                                    <CheckCircle2 size={12} className="text-emerald-400 shrink-0 mt-0.5" />
                                    <span>{r}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          {/* Evidence and Precautions */}
                          <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3.5 space-y-1.5">
                            <div className="text-[10px] font-black uppercase tracking-widest text-amber-900 flex items-center gap-1.5">
                              <AlertTriangle size={13} className="text-amber-700" />
                              Précautions indispensables & preuves à conserver
                            </div>
                            <ul className="space-y-1 text-xs text-amber-950 font-medium">
                              {item.evidenceAndPrecautions.map((ev, evIdx) => (
                                <li key={evIdx} className="flex items-start gap-1.5">
                                  <span className="text-amber-700 font-black">•</span>
                                  <span>{ev}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Direct Emergency Call Buttons */}
                          <div className="flex flex-wrap gap-2 pt-1">
                            {item.contacts.map((c, cIdx) => (
                              <a
                                key={cIdx}
                                href={`tel:${c.phone}`}
                                className="inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider shadow-sm transition-colors"
                              >
                                <Phone size={13} />
                                <span>{c.name} : {c.phone}</span>
                              </a>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Toggle Button */}
                    <button
                      onClick={() => setExpandedSafetyId(isExpanded ? null : item.id)}
                      className="mt-3 flex items-center gap-2 text-xs font-black text-rose-700 uppercase tracking-wider hover:text-rose-900 transition-colors"
                    >
                      {isExpanded ? (
                        <>
                          <span>RÉDUIRE CE PROTOCOLE</span>
                          <ChevronDown size={16} className="rotate-180 transition-transform" />
                        </>
                      ) : (
                        <>
                          <span>VOIR LE PROTOCOLE COMPLET, LOIS & NUMÉROS D'URGENCE</span>
                          <ChevronDown size={16} className="transition-transform" />
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 3: CADRE LÉGAL EN SANTÉ SEXUELLE ET REPRODUCTIVE (SSR) AU BÉNIN   */}
      {/* ========================================================================= */}
      {(activeTab === 'all' || activeTab === 'legal') && filteredLegal.length > 0 && (
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between gap-2 px-1">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
                <Scale size={20} />
              </div>
              <div>
                <h3 className="text-base sm:text-xl font-black text-gray-900 tracking-tight">
                  Cadre Légal & Lois Officielles au Bénin
                </h3>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">
                  Lois 2021-12, 2011-26, Code de l'Enfant & Traités Internationaux
                </p>
              </div>
            </div>
          </div>

          {/* Sub-category Filter Chips for Legal */}
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {[
              { id: 'all', label: 'Toutes les Lois & Textes' },
              { id: 'Législation Nationale', label: 'Loi 2021-12 (SSR & IVG)' },
              { id: 'Protection des Femmes', label: 'Violences Faites aux Femmes (VBG)' },
              { id: 'Protection des Enfants', label: 'Code de l\'Enfant & Mineures' },
              { id: 'Santé Publique', label: 'Contraception, IST & VIH' },
              { id: 'Traités Internationaux', label: 'Protocole de Maputo' }
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setLegalCategoryFilter(cat.id)}
                className={cn(
                  "px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-black tracking-wide whitespace-nowrap transition-all border shrink-0",
                  legalCategoryFilter === cat.id
                    ? "bg-emerald-700 text-white border-emerald-700 shadow-sm"
                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Legal Items List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {(activeTab === "all" ? filteredLegal.slice(0, 2) : filteredLegal).map((item) => {
              const isExpanded = expandedLegalId === item.id;
              
              return (
                <motion.div
                  layout
                  key={item.id}
                  className={cn(
                    "bg-white rounded-2xl sm:rounded-3xl border transition-all duration-300 overflow-hidden",
                    isExpanded 
                      ? "border-emerald-300 shadow-xl shadow-emerald-50 ring-4 ring-emerald-50" 
                      : "border-gray-200 shadow-sm hover:border-emerald-200"
                  )}
                >
                  <div className="p-4 sm:p-6 md:p-7">
                    {/* Top Badges */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <span className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border", item.badgeColor)}>
                          {item.category}
                        </span>
                        <span className="text-[11px] font-bold text-gray-500">
                          {item.promulgationDate}
                        </span>
                      </div>
                      <span className="text-[11px] font-black text-emerald-800 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200/60">
                        {item.lawRef}
                      </span>
                    </div>

                    {/* Title & Summary */}
                    <h4 className="text-base sm:text-xl font-black text-gray-900 mb-1.5 sm:mb-2 leading-tight">
                      {item.title}
                    </h4>
                    <p className="text-xs sm:text-sm text-gray-600 font-medium leading-relaxed mb-2.5 sm:mb-4">
                      {item.summary}
                    </p>

                    {/* Key Highlights Pill Grid */}
                    <div className="bg-gray-50/80 rounded-xl sm:rounded-2xl p-2.5 sm:p-4 border border-gray-100 mb-3 sm:mb-4 space-y-1.5 sm:space-y-2">
                      <div className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-1.5">
                        <CheckCircle2 size={12} className="text-emerald-600" />
                        Garanties et Droits Fondamentaux
                      </div>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-semibold text-gray-700">
                        {item.rightsAndGuarantees.slice(0, isExpanded ? undefined : 3).map((right, rIdx) => (
                          <li key={rIdx} className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                            <span>{right}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Expandable Detailed Legal Articles */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-5 pt-2"
                        >
                          {/* Articles Clés */}
                          <div className="space-y-3">
                            <div className="text-xs font-black uppercase tracking-widest text-emerald-700 flex items-center gap-2">
                              <BookOpen size={14} />
                              Articles Clés et Dispositions Légales
                            </div>
                            
                            <div className="grid gap-3">
                              {item.keyArticles.map((art, aIdx) => (
                                <div key={aIdx} className="bg-emerald-50/40 border border-emerald-100 rounded-xl sm:rounded-2xl p-2.5 sm:p-4 space-y-1.5 sm:space-y-2">
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-black text-emerald-900">{art.number}</span>
                                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-white px-2.5 py-0.5 rounded-md border border-emerald-200">
                                      {art.heading}
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-700 italic leading-relaxed bg-white/70 p-3 rounded-xl border border-emerald-50">
                                    « {art.content} »
                                  </p>
                                  <div className="text-xs text-emerald-900 font-bold flex items-center gap-2 pt-1">
                                    <Scale size={13} className="text-emerald-600 shrink-0" />
                                    <span><strong>Portée juridique :</strong> {art.implication}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Sanctions if any */}
                          {item.sanctions && (
                            <div className="bg-rose-50/70 border border-rose-200/80 rounded-xl sm:rounded-2xl p-2.5 sm:p-4 space-y-2">
                              <div className="text-[10px] font-black uppercase tracking-widest text-rose-800 flex items-center gap-1.5">
                                <AlertTriangle size={13} />
                                Sanctions Pénales Prévues
                              </div>
                              <ul className="space-y-1.5 text-xs font-bold text-rose-900">
                                {item.sanctions.map((sanc, sIdx) => (
                                  <li key={sIdx} className="flex items-start gap-2">
                                    <span className="text-rose-500 font-black">•</span>
                                    <span>{sanc}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Practical Advice */}
                          <div className="bg-blue-50/60 border border-blue-200/80 rounded-xl sm:rounded-2xl p-2.5 sm:p-4 flex items-start gap-3">
                            <HelpCircle size={18} className="text-blue-600 shrink-0 mt-0.5" />
                            <div className="space-y-1">
                              <div className="text-[10px] font-black uppercase tracking-widest text-blue-900">Conseil pratique & Recours</div>
                              <p className="text-xs font-semibold text-blue-950 leading-relaxed">
                                {item.practicalAdvice}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Toggle Button */}
                    <button
                      onClick={() => setExpandedLegalId(isExpanded ? null : item.id)}
                      className="mt-4 flex items-center gap-2 text-xs font-black text-emerald-700 uppercase tracking-wider hover:text-emerald-900 transition-colors"
                    >
                      {isExpanded ? (
                        <>
                          <span>RÉDUIRE LA FICHE JURIDIQUE</span>
                          <ChevronDown size={16} className="rotate-180 transition-transform" />
                        </>
                      ) : (
                        <>
                          <span>VOIR LES ARTICLES CLÉS & SANCTIONS</span>
                          <ChevronDown size={16} className="transition-transform" />
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 4: OSC JEUNES ET ACTEURS SSR AU BÉNIN                           */}
      {/* ========================================================================= */}
      {(activeTab === 'all' || activeTab === 'organizations') && filteredOrgs.length > 0 && (
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between gap-2 px-1">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 text-blue-800 rounded-xl">
                <Users size={20} />
              </div>
              <div>
                <h3 className="text-base sm:text-xl font-black text-gray-900 tracking-tight">
                  Annuaire des OSC de Jeunes & Acteurs SSR
                </h3>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">
                  Qui fait Quoi, Quand et Comment au Bénin
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {(activeTab === "all" ? filteredOrgs.slice(0, 2) : filteredOrgs).map((org) => {
              const isExpanded = expandedOrgId === org.id;

              return (
                <motion.div
                  layout
                  key={org.id}
                  className={cn(
                    "bg-white rounded-2xl sm:rounded-3xl border transition-all duration-300 overflow-hidden",
                    isExpanded 
                      ? "border-blue-400 shadow-xl shadow-blue-50 ring-4 ring-blue-50" 
                      : "border-gray-200 shadow-sm hover:border-blue-200"
                  )}
                >
                  <div className="p-4 sm:p-6 md:p-7">
                    {/* Header: Title & Badges */}
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                      <div>
                        <span className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border mb-2 inline-block", org.badgeColor)}>
                          {org.category}
                        </span>
                        <h4 className="text-base sm:text-xl font-black text-gray-900 leading-tight">
                          {org.name}
                        </h4>
                        <span className="text-xs font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                          {org.sigle}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {org.contacts.phone && (
                          <a
                            href={`tel:${org.contacts.phone}`}
                            className="px-3 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-blue-100 hover:bg-blue-700 transition-colors"
                          >
                            <Phone size={12} />
                            Appeler
                          </a>
                        )}
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-gray-600 font-medium leading-relaxed mb-2.5 sm:mb-4">
                      {org.tagline}
                    </p>

                    {/* The 4 Core Columns / Breakdown: QUI, QUOI, QUAND, COMMENT */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                      {/* QUI */}
                      <div className="bg-slate-50 border border-slate-100 rounded-lg sm:rounded-2xl p-2 sm:p-3.5 space-y-1">
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-700 flex items-center gap-1.5">
                          <Users size={13} className="text-blue-600" />
                          <span>1. QUI (Cible & Acteurs)</span>
                        </div>
                        <p className="text-xs text-gray-700 font-semibold leading-relaxed">
                          <span className="text-gray-900 font-black">Cible :</span> {org.qui.target}
                        </p>
                        <p className="text-[11px] text-gray-500 font-medium">
                          <span className="text-gray-700 font-bold">Intervenants :</span> {org.qui.actors}
                        </p>
                        <p className="text-[11px] text-gray-500 font-medium">
                          <span className="text-gray-700 font-bold">Couverture :</span> {org.qui.coverage}
                        </p>
                      </div>

                      {/* QUOI */}
                      <div className="bg-slate-50 border border-slate-100 rounded-lg sm:rounded-2xl p-2 sm:p-3.5 space-y-1">
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-700 flex items-center gap-1.5">
                          <Activity size={13} className="text-emerald-600" />
                          <span>2. QUOI (Missions & Thématiques)</span>
                        </div>
                        <div className="flex flex-wrap gap-1 mb-1">
                          {org.quoi.thematics.map((thm, tIdx) => (
                            <span key={tIdx} className="bg-white border border-gray-200 text-gray-700 text-[10px] font-bold px-2 py-0.5 rounded-md">
                              {thm}
                            </span>
                          ))}
                        </div>
                        <ul className="text-xs text-gray-700 font-semibold space-y-1">
                          {org.quoi.coreMissions.slice(0, 2).map((m, mIdx) => (
                            <li key={mIdx} className="flex items-start gap-1.5">
                              <span className="text-emerald-600 font-black shrink-0">•</span>
                              <span>{m}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* QUAND */}
                      <div className="bg-slate-50 border border-slate-100 rounded-lg sm:rounded-2xl p-2 sm:p-3.5 space-y-1">
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-700 flex items-center gap-1.5">
                          <Clock size={13} className="text-amber-600" />
                          <span>3. QUAND (Disponibilité & Moments Clés)</span>
                        </div>
                        <p className="text-xs text-gray-800 font-bold">
                          {org.quand.availability}
                        </p>
                        <div className="text-[11px] text-gray-500 font-medium">
                          <span className="text-gray-700 font-bold">Périodes fortes :</span> {org.quand.keyMoments.join(' • ')}
                        </div>
                      </div>

                      {/* COMMENT */}
                      <div className="bg-slate-50 border border-slate-100 rounded-lg sm:rounded-2xl p-2 sm:p-3.5 space-y-1">
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-700 flex items-center gap-1.5">
                          <HeartHandshake size={13} className="text-purple-600" />
                          <span>4. COMMENT (Méthodes & Canaux)</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {org.comment.channels.map((chan, cIdx) => (
                            <span key={cIdx} className="bg-purple-50 text-purple-800 border border-purple-100 text-[10px] font-black px-2 py-0.5 rounded-lg">
                              {chan}
                            </span>
                          ))}
                        </div>
                        <p className="text-xs text-gray-700 font-medium leading-tight">
                          {org.comment.methodologies[0]}
                        </p>
                      </div>
                    </div>

                    {/* Expandable Details */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-4 pt-2 border-t border-gray-100"
                        >
                          {/* Activités d'impact concrètes */}
                          <div className="space-y-3">
                            <div className="text-xs font-black uppercase tracking-widest text-blue-700 flex items-center gap-2">
                              <Award size={14} />
                              Activités d'Impact & Chiffres Clés
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {org.impactActivities.map((act, aIdx) => (
                                <div key={aIdx} className="bg-blue-50/50 border border-blue-100 rounded-xl sm:rounded-2xl p-2.5 sm:p-4 space-y-1.5">
                                  <div className="text-xs font-black text-blue-900">{act.title}</div>
                                  <p className="text-xs text-gray-600 font-medium leading-relaxed">{act.description}</p>
                                  {act.metrics && (
                                    <div className="inline-block bg-blue-600 text-white text-[10px] font-black px-2.5 py-1 rounded-lg">
                                      📊 {act.metrics}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Detailed Missions & Services */}
                          <div className="bg-gray-50 rounded-2xl p-4 space-y-2 border border-gray-100">
                            <div className="text-xs font-black uppercase tracking-widest text-gray-700">Toutes les missions & offres de services</div>
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-semibold text-gray-700">
                              {org.quoi.coreMissions.map((m, mIdx) => (
                                <li key={mIdx} className="flex items-start gap-2">
                                  <CheckCircle2 size={13} className="text-green-600 shrink-0 mt-0.5" />
                                  <span>{m}</span>
                                </li>
                              ))}
                              {org.quoi.servicesOffered?.map((s, sIdx) => (
                                <li key={`srv-${sIdx}`} className="flex items-start gap-2">
                                  <CheckCircle2 size={13} className="text-blue-600 shrink-0 mt-0.5" />
                                  <span>{s}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Contacts & Addresses Grid */}
                          <div className="bg-gray-900 text-white rounded-xl sm:rounded-2xl p-3.5 sm:p-5 space-y-2 sm:space-y-3">
                            <div className="text-xs font-black uppercase tracking-widest text-blue-300 flex items-center gap-2">
                              <Phone size={14} />
                              Contacts Directs & Points d'Accueil au Bénin
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                              <div className="space-y-2">
                                {org.contacts.headquarters && (
                                  <div className="flex items-start gap-2 text-gray-300">
                                    <Building2 size={14} className="text-blue-400 shrink-0 mt-0.5" />
                                    <span><strong>Siège :</strong> {org.contacts.headquarters}</span>
                                  </div>
                                )}
                                {org.contacts.phone && (
                                  <div className="flex items-center gap-2">
                                    <Phone size={14} className="text-emerald-400 shrink-0" />
                                    <span>Tél : <a href={`tel:${org.contacts.phone}`} className="underline font-bold text-white">{org.contacts.phone}</a></span>
                                    <button onClick={() => handleCopy(org.contacts.phone!, org.name)} className="p-1 text-gray-400 hover:text-white">
                                      <Copy size={12} />
                                    </button>
                                  </div>
                                )}
                                {org.contacts.alternatePhone && (
                                  <div className="flex items-center gap-2 text-gray-300">
                                    <Phone size={14} className="text-emerald-400 shrink-0" />
                                    <span>Autre Tél : <a href={`tel:${org.contacts.alternatePhone}`} className="underline font-bold text-white">{org.contacts.alternatePhone}</a></span>
                                  </div>
                                )}
                              </div>

                              <div className="space-y-2">
                                {org.contacts.whatsapp && (
                                  <div className="flex items-center gap-2">
                                    <MessageCircle size={14} className="text-green-400 shrink-0" />
                                    <a 
                                      href={`https://wa.me/${org.contacts.whatsapp.replace(/[^0-9]/g, '')}`} 
                                      target="_blank" 
                                      rel="noreferrer"
                                      className="underline font-bold text-green-300 hover:text-green-200"
                                    >
                                      WhatsApp : {org.contacts.whatsapp}
                                    </a>
                                  </div>
                                )}
                                {org.contacts.email && (
                                  <div className="flex items-center gap-2">
                                    <Mail size={14} className="text-blue-400 shrink-0" />
                                    <a href={`mailto:${org.contacts.email}`} className="underline text-gray-300 hover:text-white">
                                      {org.contacts.email}
                                    </a>
                                    <button onClick={() => handleCopy(org.contacts.email!, org.name)} className="p-1 text-gray-400 hover:text-white">
                                      <Copy size={12} />
                                    </button>
                                  </div>
                                )}
                                {org.contacts.website && (
                                  <div className="flex items-center gap-2">
                                    <Globe size={14} className="text-amber-400 shrink-0" />
                                    <a href={org.contacts.website} target="_blank" rel="noreferrer" className="underline text-amber-300 hover:text-amber-200 flex items-center gap-1">
                                      {org.contacts.website.replace('https://', '')}
                                      <ExternalLink size={10} />
                                    </a>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Branches / Antennas */}
                            {org.contacts.branches && org.contacts.branches.length > 0 && (
                              <div className="pt-2 border-t border-gray-800">
                                <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">
                                  Antennes et Cliniques dans les départements :
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                  {org.contacts.branches.map((br, bIdx) => (
                                    <span key={bIdx} className="bg-gray-800 text-gray-200 px-2.5 py-1 rounded-lg text-[10px] font-bold border border-gray-700">
                                      📍 {br}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Toggle Button */}
                    <button
                      onClick={() => setExpandedOrgId(isExpanded ? null : org.id)}
                      className="mt-4 flex items-center gap-2 text-xs font-black text-blue-700 uppercase tracking-wider hover:text-blue-900 transition-colors"
                    >
                      {isExpanded ? (
                        <>
                          <span>RÉDUIRE LA FICHE DE L'ORGANISATION</span>
                          <ChevronDown size={16} className="rotate-180 transition-transform" />
                        </>
                      ) : (
                        <>
                          <span>VOIR LA FICHE COMPLÈTE, IMPACT, CONTACTS & ANTENNES</span>
                          <ChevronDown size={16} className="transition-transform" />
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 5: PREMIERS SECOURS & GESTES D'URGENCE                           */}
      {/* ========================================================================= */}
      {(activeTab === 'all' || activeTab === 'firstaid') && filteredFirstAid.length > 0 && (
        <div className="space-y-4 pt-4">
          <div className="flex items-center gap-2 px-1">
            <div className="p-2 bg-red-100 text-red-700 rounded-xl">
              <HeartPulse size={20} />
            </div>
            <div>
              <h3 className="text-base sm:text-xl font-black text-gray-900 tracking-tight">Guide de Secours & Gestes qui Sauvent</h3>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Protocoles de premiers secours face aux détresses immédiates</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {filteredFirstAid.map((tip: any, i: number) => {
              const isExpanded = expandedTipId === i;
              
              let Icon = HeartPulse;
              if (tip.icon === 'Wind') Icon = Wind;
              else if (tip.icon === 'Ban') Icon = Ban;
              else if (tip.icon === 'Flame') Icon = Flame;
              else if (tip.icon === 'Activity') Icon = Activity;
              else if (tip.icon === 'Shield') Icon = Shield;
              else if (tip.icon === 'Siren') Icon = Siren;
              else if (tip.icon === 'AlertCircle') Icon = AlertCircle;

              return (
                <motion.div 
                  layout
                  key={i} 
                  className={cn(
                    "bg-white rounded-2xl sm:rounded-3xl border transition-all duration-300",
                    isExpanded 
                      ? "border-blue-300 shadow-xl shadow-blue-50 ring-4 ring-blue-50" 
                      : "border-gray-200 shadow-sm hover:border-blue-200"
                  )}
                >
                  <div className="p-4 sm:p-6 md:p-7">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-9 h-9 sm:w-12 sm:h-12 ${tip.color || 'bg-blue-50 text-blue-600'} rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 shadow-inner`}>
                        <Icon size={18} className="sm:hidden" /><Icon size={26} className="hidden sm:block" />
                      </div>
                      {isExpanded && (
                        <button 
                          onClick={() => setExpandedTipId(null)}
                          className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400"
                        >
                          <X size={20} />
                        </button>
                      )}
                    </div>

                    <h4 className="text-base sm:text-xl font-black text-gray-900 mb-1.5 sm:mb-2 leading-tight">{tip.title}</h4>
                    <p className={cn(
                      "text-sm text-gray-600 font-medium leading-relaxed transition-all",
                      isExpanded ? "mb-6" : "line-clamp-2"
                    )}>
                      {tip.description}
                    </p>
                    
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="space-y-3 pb-2">
                            <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                              <Activity size={12} />
                              Procédure de secours étape par étape
                            </div>
                            {tip.steps?.map((step: string, si: number) => (
                              <motion.div 
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: si * 0.05 }}
                                key={si} 
                                className="flex items-start gap-4 bg-gray-50/70 p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border border-gray-100 hover:border-blue-200 transition-colors"
                              >
                                <div className="w-7 h-7 bg-white text-blue-700 rounded-xl flex items-center justify-center text-xs font-black shrink-0 border border-blue-100 shadow-sm">
                                  {si + 1}
                                </div>
                                <span className="text-sm font-bold text-gray-800 leading-tight pt-0.5">{step}</span>
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    
                    {!isExpanded && (
                      <button 
                        onClick={() => setExpandedTipId(i)}
                        className="mt-4 flex items-center gap-2 text-xs font-black text-blue-600 uppercase tracking-wider hover:text-blue-800 transition-all group"
                      >
                        VOIR LE GUIDE DES GESTES 
                        <ChevronDown size={14} className="group-hover:translate-y-0.5 transition-transform" />
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* No results fallback */}
      {totalResultsCount === 0 && (
        <div className="text-center py-20 bg-gray-50 rounded-[32px] border-2 border-dashed border-gray-200 p-8">
          <AlertCircle size={40} className="mx-auto text-gray-400 mb-3" />
          <h4 className="text-base font-black text-gray-800 uppercase tracking-wider mb-1">Aucun résultat trouvé</h4>
          <p className="text-sm text-gray-500 font-medium max-w-sm mx-auto mb-4">
            Aucun conseil, loi ou organisation ne correspond à votre recherche « {searchQuery} ».
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setActiveTab('all');
            }}
            className="px-6 py-3 bg-gray-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest active:scale-95 transition-all shadow-md"
          >
            Réinitialiser la recherche
          </button>
        </div>
      )}
    </div>
  );
};
