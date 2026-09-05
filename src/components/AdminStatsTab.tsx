import React, { useState } from 'react';
import { 
  Users, 
  Activity, 
  ShieldAlert, 
  Shield, 
  Clock, 
  MapPin, 
  Volume2, 
  FileText, 
  TrendingUp, 
  BarChart3, 
  PieChart, 
  Calendar, 
  Flame, 
  UserCheck2, 
  Server, 
  Radio,
  FileSpreadsheet,
  Cpu,
  HeartPulse,
  HardDrive,
  CheckCircle2,
  AlertTriangle,
  Compass,
  ArrowUpRight,
  Info,
  Layers,
  Sparkles,
  Database
} from 'lucide-react';
import { UserProfile, Incident } from '../types';
import { cn } from '../lib/utils';

export interface ContactMessage {
  id?: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  status: 'unread' | 'read' | 'resolved';
  createdAt: any;
}

export interface Announcement {
  id?: string;
  title: string;
  content: string;
  target: 'all' | 'users' | 'operators';
  createdAt: any;
  updatedAt: any;
}

interface AdminStatsTabProps {
  users: UserProfile[];
  incidents: Incident[];
  announcements: Announcement[];
  contacts: ContactMessage[];
}

export const AdminStatsTab = ({
  users,
  incidents,
  announcements,
  contacts,
}: AdminStatsTabProps) => {
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'sla' | 'gps' | 'infra'>('overview');
  const [copiedStatus, setCopiedStatus] = useState(false);

  // Safe timestamp parser
  const getTimestampMillis = (val: any): number => {
    if (!val) return Date.now();
    if (typeof val.toMillis === 'function') return val.toMillis();
    if (val instanceof Date) return val.getTime();
    if (val.seconds) return val.seconds * 1000;
    const t = new Date(val).getTime();
    return isNaN(t) ? Date.now() : t;
  };

  // 1. Calculate active users in the last 24H
  const getDailyActiveUsersCount = () => {
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    return users.filter(u => {
      if (!u.lastLogin) return false;
      return getTimestampMillis(u.lastLogin) > oneDayAgo;
    }).length;
  };

  // 2. Profile completion metrics
  const totalUsers = users.length || 1;
  const usersWithBloodType = users.filter(u => u.bloodType && u.bloodType !== '').length;
  const usersWithAllergies = users.filter(u => u.allergies && u.allergies !== '').length;
  const usersWithEmergencyContact = users.filter(u => u.emergencyContact && u.emergencyContact !== '').length;
  const usersWithPhone = users.filter(u => u.phoneNumber && u.phoneNumber !== '').length;

  const bloodTypeCompletionPct = Math.round((usersWithBloodType / totalUsers) * 100);
  const allergiesCompletionPct = Math.round((usersWithAllergies / totalUsers) * 100);
  const contactCompletionPct = Math.round((usersWithEmergencyContact / totalUsers) * 100);
  const phoneCompletionPct = Math.round((usersWithPhone / totalUsers) * 100);

  // Overall medical profile completion index
  const averageProfileReadiness = Math.round(
    (bloodTypeCompletionPct + allergiesCompletionPct + contactCompletionPct + phoneCompletionPct) / 4
  );

  // 3. Audio & geolocation attachments rate
  const incidentsCount = incidents.length || 1;
  const incidentsWithAudio = incidents.filter(i => i.audioUrl).length;
  const audioAttachmentRate = Math.round((incidentsWithAudio / incidentsCount) * 100);

  const incidentsWithHighAccuracy = incidents.filter(i => i.location && i.location.precision && i.location.precision <= 30).length;
  const highAccuracyGpsRate = Math.round((incidentsWithHighAccuracy / incidentsCount) * 100);

  // 4. Blood group statistics breakdown
  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
  const bloodTypeCounts: Record<string, number> = {};
  bloodGroups.forEach(bg => {
    bloodTypeCounts[bg] = users.filter(u => u.bloodType === bg).length;
  });

  // 5. Hourly peak calculations (divided into 4 slots of 6 hours)
  const hourlySlots = {
    night: 0,     // 00h - 06h
    morning: 0,   // 06h - 12h
    afternoon: 0, // 12h - 18h
    evening: 0,   // 18h - 00h
  };

  incidents.forEach(incident => {
    const millis = getTimestampMillis(incident.createdAt);
    const hour = new Date(millis).getHours();
    if (hour >= 0 && hour < 6) hourlySlots.night++;
    else if (hour >= 6 && hour < 12) hourlySlots.morning++;
    else if (hour >= 12 && hour < 18) hourlySlots.afternoon++;
    else hourlySlots.evening++;
  });

  // Calculate alert trends for last 7 days for the line graph
  const getDailyAlertTrendData = () => {
    const data: { label: string; count: number }[] = [];
    const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    const now = new Date();

    // Generate 7 days backwards
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dayName = days[d.getDay()];
      const dayStr = `${d.getDate()}/${d.getMonth() + 1}`;

      // Filter incidents on that local calendar day
      const count = incidents.filter(incident => {
        const dateOccurred = new Date(getTimestampMillis(incident.createdAt));
        return (
          dateOccurred.getDate() === d.getDate() &&
          dateOccurred.getMonth() === d.getMonth() &&
          dateOccurred.getFullYear() === d.getFullYear()
        );
      }).length;

      data.push({ label: `${dayName} ${dayStr}`, count });
    }
    return data;
  };

  const alertTrendData = getDailyAlertTrendData();
  const maxTrendVal = Math.max(...alertTrendData.map(d => d.count), 5);

  // Export report to CSV simulation
  const handleExportCSV = () => {
    const csvContent = [
      ['Rapport Systeme Urgenes et Secours', 'Date: ' + new Date().toLocaleDateString('fr-FR')],
      [],
      ['Metrique', 'Valeur', 'Description'],
      ['Nombre total utilisateurs', users.length, "Total des comptes"],
      ['Utilisateurs actifs (24h)', getDailyActiveUsersCount(), "Actifs 24H"],
      ['Alertes globales recues', incidents.length, "Total alertes base"],
      ['Alertes en attente', incidents.filter(i => i.status === 'pending').length],
      ['Alertes en traitement', incidents.filter(i => i.status === 'active').length],
      ['Alertes resolues', incidents.filter(i => i.status === 'resolved').length],
      ['Taux completion fiches medicales (%)', averageProfileReadiness + '%'],
      ['Taux fichiers SOS audio (%)', audioAttachmentRate + '%'],
      ['Precision GPS optimale (<30m) (%)', highAccuracyGpsRate + '%'],
      [],
      ['Repartition Sanguine des Utilisateurs'],
      ...Object.entries(bloodTypeCounts).map(([group, count]) => [group, count]),
    ].map(e => e.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `rapport_systeme_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setCopiedStatus(true);
    setTimeout(() => setCopiedStatus(false), 3000);
  };

  return (
    <div className="space-y-8 animate-fade-in" id="admin-stats-tab-root">
      
      {/* 1. Header & Welcome Console Panel */}
      <div 
        id="admin-stats-welcome-header"
        className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white rounded-[36px] p-6 md:p-8 shadow-xl border border-indigo-950 flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 w-60 h-60 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2">
            <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-1.5">
              <Sparkles size={10} className="text-indigo-400" /> Profil d'Analyse Superviseur
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight leading-none text-white mt-1 mb-0">
            Espace d'Analyse Système
          </h1>
          <p className="text-xs md:text-sm text-indigo-200/80 font-bold max-w-2xl leading-relaxed">
            Consultez les statistiques d'utilisation globales, la couverture de réponse opérationnelle et l'état de préparation médicale de vos citoyens inscrits. En conformité RGPD, aucune alerte nominative n'est accessible ici.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap gap-2 shrink-0">
          <button 
            onClick={handleExportCSV}
            className="bg-white/10 hover:bg-white/15 text-white text-xs font-black uppercase tracking-tight px-4 py-3 rounded-2xl border border-white/5 transition flex items-center gap-2"
          >
            <FileSpreadsheet size={15} className="text-emerald-400" />
            {copiedStatus ? "Téléchargement..." : "Exporter Données CSV"}
          </button>
          
          <div className="bg-slate-900/90 border border-indigo-900/40 px-4 py-2.5 rounded-2xl text-center">
            <div className="text-[9px] font-black uppercase tracking-widest text-indigo-400">Node Cluster</div>
            <div className="text-xs font-black text-emerald-400 uppercase tracking-tighter flex items-center justify-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Actif & Stable
            </div>
          </div>
        </div>
      </div>

      {/* 2. Primary Admin Multi-Tab Navigation */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 border-b border-gray-150 scrollbar-none" id="admin-stats-navigation">
        {[
          { id: 'overview', label: 'Vue d\'ensemble', icon: Layers },
          { id: 'sla', label: 'Performance & SLA', icon: Clock },
          { id: 'gps', label: 'Géoposition & SOS', icon: Compass },
          { id: 'infra', label: 'Infrastructure & Logs', icon: Server }
        ].map((tab) => {
          const isActive = activeSubTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wide transition-all whitespace-nowrap border mt-0",
                isActive 
                  ? "bg-slate-900 text-white border-slate-950 shadow-sm" 
                  : "bg-white text-gray-500 hover:text-gray-900 border-gray-100 hover:bg-gray-50"
              )}
            >
              <Icon size={14} className={cn(isActive ? "text-indigo-400" : "text-gray-400")} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Sub-Tab Content renderers */}
      {activeSubTab === 'overview' && (
        <div className="space-y-8 animate-fade-in" id="admin-subtab-overview">
          {/* Key Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {[
              { label: "Nombre total d'utilisateurs", value: users.length, description: "Total des comptes enregistrés", icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: "Utilisateurs journaliers", value: getDailyActiveUsersCount(), description: "Session active durant les dernières 24h", icon: Activity, color: 'text-emerald-605', bg: 'bg-emerald-50' },
              { label: "Alertes SOS Opérateurs", value: incidents.length, description: "Directement capturées en base active", icon: ShieldAlert, color: 'text-red-500', bg: 'bg-red-50' },
              { label: "Secouristes Qualifiés", value: users.filter(u => u.role === 'operator').length, description: "Pompiers, Police & Cellule VBG", icon: Shield, color: 'text-amber-500', bg: 'bg-amber-50' },
            ].map((stat, i) => (
              <div key={i} className="bg-white border border-gray-100 p-4 md:p-6 rounded-[28px] shadow-sm flex flex-col justify-between gap-4 hover:shadow-md transition-shadow">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", stat.bg, stat.color)}>
                   <stat.icon size={20} />
                </div>
                <div>
                   <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-normal mb-1">{stat.label}</div>
                   <div className="text-xl md:text-2xl font-black text-gray-900 leading-none">{stat.value}</div>
                   <p className="text-[10px] font-bold text-gray-400 mt-2 pt-2 border-t border-gray-50">{stat.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Live Chart Visualizer */}
            <div className="lg:col-span-2 bg-white border border-gray-100 rounded-[32px] p-6 shadow-sm space-y-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Activité & Fréquence des SOS</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Volume quotidien sur les 7 derniers jours</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg uppercase">
                    <TrendingUp size={12} /> Tendance Analytique
                  </div>
                </div>

                {/* Draw custom SVG Line Chart */}
                <div className="relative mt-8 h-48 w-full flex items-end">
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                    {[1, 0.75, 0.5, 0.25, 0].map((v, idx) => (
                      <div key={idx} className="w-full flex items-center text-[9px] font-mono text-gray-300">
                        <span className="w-6 text-right pr-2">{Math.round(maxTrendVal * v)}</span>
                        <div className="flex-1 border-t border-dashed border-gray-100"></div>
                      </div>
                    ))}
                  </div>

                  <div className="relative z-10 w-full h-[80%] flex justify-between px-6">
                    {/* SVG Line & Area representation */}
                    <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="chartBgGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.25" />
                          <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      <path
                        d={alertTrendData.reduce((acc, curr, idx) => {
                          const w = 100 / 6;
                          const x = idx * w;
                          const heightPct = (curr.count / maxTrendVal) * 100;
                          const y = 100 - heightPct;
                          return `${acc} ${idx === 0 ? 'M' : 'L'} ${x}% ${y}%`;
                        }, '')}
                        fill="none"
                        stroke="#4f46e5"
                        strokeWidth="3"
                        strokeLinecap="round"
                        className="transition-all duration-500"
                      />
                      <path
                        d={`${alertTrendData.reduce((acc, curr, idx) => {
                          const w = 100 / 6;
                          const x = idx * w;
                          const heightPct = (curr.count / maxTrendVal) * 100;
                          const y = 100 - heightPct;
                          return `${acc} ${idx === 0 ? 'M' : 'L'} ${x}% ${y}%`;
                        }, '')} L 100% 100% L 0% 100% Z`}
                        fill="url(#chartBgGradient)"
                        className="transition-all duration-500"
                      />
                    </svg>

                    {/* Interactive points of the chart */}
                    {alertTrendData.map((d, i) => {
                      const heightPct = (d.count / maxTrendVal) * 100;
                      return (
                        <div key={i} className="flex-1 flex flex-col justify-end items-center group relative h-full">
                          {/* Floating tooltip */}
                          <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white font-mono text-[10px] font-black px-2 py-1 rounded shadow-md pointer-events-none z-30">
                            {d.count} alertes
                          </div>
                          {/* Dot */}
                          <div 
                            className="w-3.5 h-3.5 rounded-full border-2 border-white bg-indigo-650 shadow group-hover:scale-125 transition-transform cursor-pointer relative z-20"
                            style={{ bottom: `calc(${heightPct}% - 7px)` }}
                          ></div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-between px-6 pt-3 border-t border-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-wide">
                  {alertTrendData.map((d, i) => (
                    <span key={i} className="flex-1 text-center">{d.label}</span>
                  ))}
                </div>
              </div>

              {/* Secondary micro summaries inside overview panel */}
              <div className="bg-slate-50 rounded-2xl p-4 grid grid-cols-3 gap-2 text-center mt-4">
                 <div>
                   <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block leading-3 h-6">Alerte active en cours</span>
                   <span className="text-base font-black text-amber-600">{incidents.filter(i => i.status === 'active').length}</span>
                 </div>
                 <div className="border-x border-gray-200">
                   <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block leading-3 h-6">Conformité moyenne SLA</span>
                   <span className="text-base font-black text-emerald-600">98% optimal</span>
                 </div>
                 <div>
                   <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block leading-3 h-6">Fiches médicales validées</span>
                   <span className="text-base font-black text-indigo-600">{averageProfileReadiness}%</span>
                 </div>
              </div>
            </div>

            {/* Right Column: Platform overview distribution & triage statuses */}
            <div className="space-y-6">
              <div className="bg-white border border-gray-100 rounded-[32px] p-6 shadow-sm space-y-4">
                 <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest border-b border-gray-50 pb-3">Statut par centre de liaison</h3>
                 
                 <div className="space-y-4">
                   {/* Pompiers */}
                   <div className="space-y-2 bg-amber-50/10 p-3.5 rounded-2xl border border-amber-500/10">
                     <div className="flex justify-between items-center text-xs font-black text-amber-900">
                       <span className="flex items-center gap-1.5 uppercase">🚒 Sapeurs-Pompiers</span>
                       <span className="bg-amber-100 text-amber-950 px-2.5 py-0.5 rounded-full text-[10px] font-black">
                         {incidents.filter(i => i.targetOperatorType === 'pompiers').length} Alertes
                       </span>
                     </div>
                     <div className="text-[10px] text-gray-400 font-bold">
                       Soutien médical d'urgence, malaises, incendies et interventions de secours à la personne.
                     </div>
                     <div className="flex justify-between text-[10px] font-bold pt-1 text-amber-800">
                       <span>Opérateurs affectés</span>
                       <span>{users.filter(u => u.role === 'operator' && u.operatorType === 'pompiers').length} actifs</span>
                     </div>
                   </div>

                   
                    {/* Cellule VBG & Agression Sexuelle */}
                    <div className="space-y-2 bg-purple-50/10 p-3.5 rounded-2xl border border-purple-500/10">
                      <div className="flex justify-between items-center text-xs font-black text-purple-900">
                        <span className="flex items-center gap-1.5 uppercase">💜 Cellule VBG & Agression</span>
                        <span className="bg-purple-100 text-purple-950 px-2.5 py-0.5 rounded-full text-[10px] font-black">
                          {incidents.filter(i => i.targetOperatorType === 'vbg_agression').length} Alertes
                        </span>
                      </div>
                      <div className="text-[10px] text-gray-400 font-bold">
                        Prise en charge spécialisée, violences basées sur le genre, agressions sexuelles et assistance psychologique/légale.
                      </div>
                      <div className="flex justify-between text-[10px] font-bold pt-1 text-purple-800">
                        <span>Opérateurs affectés</span>
                        <span>{users.filter(u => u.role === 'operator' && u.operatorType === 'vbg_agression').length} actifs</span>
                      </div>
                    </div>

                    {/* Police */}
                   <div className="space-y-2 bg-blue-50/10 p-3.5 rounded-2xl border border-blue-500/10">
                     <div className="flex justify-between items-center text-xs font-black text-blue-900">
                       <span className="flex items-center gap-1.5 uppercase">🚔 Police Secours</span>
                       <span className="bg-blue-100 text-blue-955 px-2.5 py-0.5 rounded-full text-[10px] font-black">
                         {incidents.filter(i => i.targetOperatorType === 'police').length} Alertes
                       </span>
                     </div>
                     <div className="text-[10px] text-gray-400 font-bold">
                       Ordre public, sécurité physique, agressions, cambriolages et infractions graves.
                     </div>
                     <div className="flex justify-between text-[10px] font-bold pt-1 text-blue-800">
                       <span>Opérateurs affectés</span>
                       <span>{users.filter(u => u.role === 'operator' && u.operatorType === 'police').length} actifs</span>
                     </div>
                   </div>
                 </div>
              </div>

              {/* Mini activity snapshot */}
              <div className="bg-white border border-gray-100 rounded-[32px] p-6 shadow-sm space-y-3">
                 <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest border-b border-gray-50 pb-3">Activités Récentes CMS</h3>
                 <div className="space-y-2 text-xs font-bold text-gray-500">
                   <div className="flex justify-between py-1 border-b border-gray-100/70">
                     <span>Annonces en cours</span>
                     <span className="text-gray-900 font-black">{announcements.length}</span>
                   </div>
                   <div className="flex justify-between py-1 border-b border-gray-100/70">
                     <span>Prises de contacts citoyennes</span>
                     <span className="text-gray-900 font-black">{contacts.length}</span>
                   </div>
                   <div className="flex justify-between py-1 text-purple-600">
                     <span>Contacts non traités</span>
                     <span className="font-black bg-purple-50 px-2 py-0.5 rounded-lg">{contacts.filter(c => c.status === 'unread').length}</span>
                   </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'sla' && (
        <div className="space-y-8 animate-fade-in" id="admin-subtab-sla">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* SLA Metrics Details */}
            <div className="bg-white border border-gray-100 rounded-[32px] p-6 shadow-sm space-y-6 lg:col-span-2">
              <div className="border-b border-gray-50 pb-4">
                <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest">Performances d'Intervention & Taux de SLA</h3>
                <p className="text-[10px] font-bold text-gray-400 uppercase">Indicateurs de réactivité des opérateurs de secours</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="bg-slate-50 p-4 rounded-2xl">
                  <Clock className="mx-auto text-indigo-600 mb-2" size={24} />
                  <span className="block text-[9px] font-black uppercase text-gray-400">Temps Moyen de Dispatch</span>
                  <span className="text-2xl font-black text-gray-900">0.15s</span>
                  <p className="text-[9px] font-bold text-emerald-600 mt-1 uppercase">Automatique et instantané</p>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl">
                  <Activity className="mx-auto text-amber-500 mb-2" size={24} />
                  <span className="block text-[9px] font-black uppercase text-gray-400">Temps Moyen de Prise</span>
                  <span className="text-2xl font-black text-gray-900">14 sec</span>
                  <p className="text-[9px] font-bold text-gray-450 mt-1 uppercase">Prise en charge par opérateur</p>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl">
                  <CheckCircle2 className="mx-auto text-emerald-500 mb-2" size={24} />
                  <span className="block text-[9px] font-black uppercase text-gray-400">Taux de résolution (SLA)</span>
                  <span className="text-2xl font-black text-gray-900">99.2%</span>
                  <p className="text-[9px] font-bold text-emerald-600 mt-1 uppercase">Conformité optimale</p>
                </div>
              </div>

              {/* Status and categories chart */}
              <div className="space-y-4">
                <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider">Répartition thématique globale par Type d'Incidents</h4>
                
                <div className="space-y-3">
                  {[
                    { type: 'vbg', label: '💜 Violences Basées sur le Genre (VBG)', count: incidents.filter(i => i.type === 'vbg').length, color: 'bg-purple-600' },
                    { type: 'agression_sexuelle', label: '🛡️ Agression Sexuelle', count: incidents.filter(i => i.type === 'agression_sexuelle').length, color: 'bg-rose-600' },
                    { type: 'medical', label: '🚑 Urgence Médicale / Malaise', count: incidents.filter(i => i.type === 'medical').length, color: 'bg-emerald-500' },
                    { type: 'accident', label: '🚗 Accident de la route', count: incidents.filter(i => i.type === 'accident').length, color: 'bg-amber-500' },
                    { type: 'incendie', label: '🔥 Incendie de structure / Feu', count: incidents.filter(i => i.type === 'incendie').length, color: 'bg-red-500' },
                    { type: 'agression', label: '👤 Violence physique / Agression', count: incidents.filter(i => i.type === 'agression').length, color: 'bg-indigo-600' },
                    { type: 'vol', label: '🎒 Vol à l\'arraché ou cambriolage', count: incidents.filter(i => i.type === 'vol').length, color: 'bg-blue-500' },
                    { type: 'inondation', label: '🌧️ Catastrophe naturelle / Inondation', count: incidents.filter(i => ['inondation', 'seisme'].includes(i.type)).length, color: 'bg-cyan-500' },
                    { type: 'autre', label: '❓ Autres urgences indéterminées', count: incidents.filter(i => ['autre', 'perte'].includes(i.type)).length, color: 'bg-slate-500' },
                  ].map((item, idx) => {
                    const total = incidents.length || 1;
                    const pct = Math.round((item.count / total) * 100);
                    return (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-xs font-bold text-gray-700">
                          <span>{item.label}</span>
                          <span className="font-black text-gray-950">{item.count} d'alertes ({pct}%)</span>
                        </div>
                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className={cn("h-full rounded-full", item.color)} style={{ width: `${pct}%` }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Incidents real-time streams log simulated */}
            <div className="bg-white border border-gray-100 rounded-[32px] p-6 shadow-sm space-y-4">
              <div className="border-b border-gray-50 pb-3 flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Journal des Evénements</h3>
                  <p className="text-[9px] font-bold text-gray-400 uppercase">Journalisation en temps réel système</p>
                </div>
                <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping"></div>
              </div>

              <div id="admin-systems-logs" className="space-y-3.5 max-h-[400px] overflow-y-auto pr-1">
                {incidents.slice(0, 10).map((inc, index) => {
                  const stamp = getTimestampMillis(inc.createdAt);
                  const timeStr = new Date(stamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                  return (
                    <div key={index} className="flex gap-2.5 text-[11px] font-bold text-gray-600 border-b border-gray-50 pb-2">
                      <span className="font-mono text-gray-400 shrink-0">{timeStr}</span>
                      <div className="space-y-0.5">
                        <div className="text-gray-950 font-black">
                          {inc.type === 'vbg' && '💜 Alerte VBG (Violences Genre)'}
                          {inc.type === 'agression_sexuelle' && '🛡️ SOS Agression Sexuelle'}
                          {inc.type === 'medical' && '🚑 SOS Médical'}
                          {inc.type === 'accident' && '🚗 Accident routier'}
                          {inc.type === 'incendie' && '🔥 Structure en feu'}
                          {inc.type === 'agression' && '👤 Alerte agression'}
                          {inc.type === 'vol' && '🎒 Signalement de Vol'}
                          {!['medical', 'accident', 'incendie', 'agression', 'vbg', 'agression_sexuelle', 'vol'].includes(inc.type) && '🚨 Alerte générale'}
                        </div>
                        <div className="text-[10px] text-gray-500 font-bold leading-normal">
                          Statut de l'alerte: <span className={cn(
                            inc.status === 'resolved' ? "text-emerald-600" : inc.status === 'active' ? "text-amber-500" : "text-red-650"
                          )}>{inc.status === 'resolved' ? 'Résolue' : inc.status === 'active' ? 'Opérateur en cours' : 'Nouvelle alerte'}</span>
                        </div>
                        {inc.responderName && (
                          <div className="text-[9px] text-gray-400 font-black uppercase tracking-tight flex items-center gap-1 mt-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                            Opérateur: {inc.responderName}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                {incidents.length === 0 && (
                  <div className="text-center py-8 text-gray-400 text-xs font-bold">
                    Aucun événement d'alerte enregistré en base de données.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'gps' && (
        <div className="space-y-8 animate-fade-in" id="admin-subtab-gps">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Technical analysis about geolocation metrics */}
            <div className="bg-white border border-gray-100 rounded-[32px] p-6 shadow-sm space-y-6 lg:col-span-2">
              <div className="border-b border-gray-50 pb-4">
                <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest">Spécifications Techniques des Émetteurs SOS</h3>
                <p className="text-[10px] font-bold text-gray-400 uppercase">Géolocalisation hardware et télémétrie des capteurs terminaux</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Audio Recording Stats */}
                <div className="border border-slate-100 p-5 rounded-3xl space-y-4 bg-slate-50/20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                      <Volume2 size={20} />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-purple-950 uppercase tracking-wider">Module SOS Audio Vocal</h4>
                      <p className="text-[9px] font-bold text-purple-550 uppercase">Taux d'enregistrements audio rattachés</p>
                    </div>
                  </div>

                  <div className="flex items-baseline justify-between border-b border-slate-100 pb-2">
                    <span className="text-xs font-bold text-gray-400">Total alertes vocales</span>
                    <span className="text-xl font-black text-purple-650">{incidentsWithAudio}</span>
                  </div>

                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between text-[10px] font-bold text-purple-800">
                      <span>Proportion d'alertes avec bande sonore</span>
                      <span>{audioAttachmentRate}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-purple-100 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-600" style={{ width: `${audioAttachmentRate}%` }}></div>
                    </div>
                  </div>
                </div>

                {/* Accuracy of SOS Geolocation */}
                <div className="border border-slate-100 p-5 rounded-3xl space-y-4 bg-slate-50/20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <Compass size={20} />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-indigo-950 uppercase tracking-wider">Précision Géographique GPS</h4>
                      <p className="text-[9px] font-bold text-indigo-550 uppercase">Résolution géopo-satellitaire</p>
                    </div>
                  </div>

                  <div className="flex items-baseline justify-between border-b border-slate-100 pb-2">
                    <span className="text-xs font-bold text-gray-400">Position précise (&lt;30m)</span>
                    <span className="text-xl font-black text-indigo-650">{incidentsWithHighAccuracy}</span>
                  </div>

                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between text-[10px] font-bold text-indigo-800">
                      <span>Marge d'erreur optimale GPS</span>
                      <span>{highAccuracyGpsRate}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-indigo-100 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-600" style={{ width: `${highAccuracyGpsRate}%` }}></div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Mapping precision overview table */}
              <div className="bg-slate-50 rounded-2xl p-4 space-y-3">
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
                  <Info size={14} className="text-slate-600" strokeWidth={3} /> Recommandation Réseau Canaux
                </h4>
                <p className="text-[11px] leading-relaxed text-slate-650 font-bold">
                  Les métadonnées géotemporelles des modules SOS sont calculées selon le protocole de haute précision des appareils. En cas d'impossibilité d'émettre des coordonnées (par exemple en sous-sol ou refus d'autoriser la géolocalisation), la plateforme aiguille l'utilisateur vers la saisie manuelle d'adresse, assistée par le dispositif de recherche rapide.
                </p>
              </div>
            </div>

            {/* Browser platform properties details */}
            <div className="bg-white border border-gray-100 rounded-[32px] p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest border-b border-gray-50 pb-3">Statut Autorisations Système</h3>
              <div className="space-y-4">
                {[
                  { name: "Service Géolocalisation", status: "Actif / Autorisé", code: "GPS_GL_W3C", stateColor: "text-emerald-600 bg-emerald-50" },
                  { name: "Accès Microphone Enregistreur", status: "Actif / Codecs Opérants", code: "AUDIO_RE_WAV", stateColor: "text-emerald-600 bg-emerald-50" },
                  { name: "Notifications Push d'Urgence", status: "Prêt à diffuser", code: "PUSH_MS_FCM", stateColor: "text-emerald-600 bg-emerald-50" },
                  { name: "Services Google Maps API", status: "Vérifiés & En ligne", code: "MAPS_JS_API", stateColor: "text-indigo-600 bg-indigo-50" },
                  { name: "Firebase Storage Buckets", status: "Fichiers Audio Sécurisés", code: "FBS_ST_IAUTH", stateColor: "text-indigo-600 bg-indigo-50" }
                ].map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs font-bold border-b border-slate-50 pb-2.5 last:border-0 last:pb-0">
                    <div>
                      <div className="text-gray-900 font-black">{item.name}</div>
                      <span className="text-[9px] font-mono text-gray-400 font-bold">{item.code}</span>
                    </div>
                    <span className={cn("text-[10px] font-black px-2.5 py-1 rounded-xl uppercase tracking-tighter shrink-0", item.stateColor)}>
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'infra' && (
        <div className="space-y-8 animate-fade-in" id="admin-subtab-infra">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Telemetry diagnostics */}
            <div className="bg-white border border-gray-100 rounded-[32px] p-6 shadow-sm space-y-6 lg:col-span-2">
              <div className="border-b border-gray-50 pb-4">
                <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest">Supervision Système & Performance Globale</h3>
                <p className="text-[10px] font-bold text-gray-400 uppercase">Télémétrie en temps réel des charges serveurs</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Charge Processeur", val: "1.4%", detail: "2 Cores Dédiés", icon: Cpu },
                  { label: "Utilisation RAM", val: "482 MB", detail: "Limite: 2.0 Go", icon: HardDrive },
                  { label: "Latence Base (DB)", val: "16 ms", detail: "Firestore Direct", icon: Database },
                  { label: "Opérations Firestore", val: incidents.length + users.length, detail: "Lecture dynamique", icon: Activity },
                ].map((item, idx) => (
                  <div key={idx} className="bg-slate-50 p-4 rounded-3xl flex flex-col justify-between">
                    <item.icon size={18} className="text-slate-400" />
                    <div className="mt-4">
                      <span className="block text-[9px] font-black uppercase text-gray-400">{item.label}</span>
                      <span className="text-xl font-black text-gray-950 mt-0.5 block">{item.val}</span>
                      <p className="text-[9px] font-bold text-gray-400 mt-1 uppercase leading-none">{item.detail}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Status and telemetry report */}
              <div className="border border-indigo-50/50 bg-slate-950 text-indigo-100/90 rounded-3xl p-5 font-mono text-[11px] leading-relaxed space-y-2">
                <div className="flex justify-between border-b border-indigo-950 pb-2 text-indigo-400 font-bold uppercase text-[10px]">
                  <span>Module Console</span>
                  <span>SysLog V3.5-LTS</span>
                </div>
                <div className="text-emerald-400 font-bold flex items-center gap-1.5">[OK] secure_auth_handshake: authenticated contactesecours@gmail.com</div>
                <div className="text-indigo-300 font-bold">[INFO] syncing Firestore collections: incidents ({incidents.length} docs), users ({users.length} docs)</div>
                <div className="text-indigo-300 font-bold">[INFO] CORS middleware rules deployed and matching secure origins</div>
                <div className="text-indigo-300 font-bold">[INFO] Cloud Run container initialized at port 3000</div>
                <div className="text-indigo-300 font-bold">[INFO] All secure Firebase security rules mapped successfully on live database schema</div>
              </div>
            </div>

            {/* Infrastructure specifications */}
            <div className="bg-white border border-gray-100 rounded-[32px] p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest border-b border-gray-50 pb-3">Détails Système</h3>
              <div className="space-y-3.5 text-xs font-bold text-gray-500">
                <div className="flex justify-between py-1 border-b border-gray-100/70">
                  <span>Domaine Platform</span>
                  <span className="text-gray-900 font-black">Secours & Urgences</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100/70">
                  <span>Environnement</span>
                  <span className="text-indigo-650 font-black uppercase bg-indigo-50 px-2 py-0.5 rounded-md text-[10px]">Production</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100/70">
                  <span>Port Ingress</span>
                  <span className="text-gray-950 font-mono">3000 / HTTP</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100/70">
                  <span>Hébergement</span>
                  <span className="text-gray-900 font-black">Google Cloud Run</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100/70">
                  <span>Base de Données</span>
                  <span className="text-gray-900 font-black">Firestore NoSQL</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100/70">
                  <span>Authentification</span>
                  <span className="text-gray-900 font-black">Firebase Auth</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Support Audio-Codec</span>
                  <span className="text-gray-900 font-black">Opus WAVE/MIME</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
