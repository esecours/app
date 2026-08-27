import React, { useState } from 'react';
import { 
  Compass, 
  ChevronRight, 
  ChevronLeft, 
  RotateCcw, 
  Scale, 
  Shield, 
  Phone, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  FileText, 
  ArrowRight, 
  HeartHandshake, 
  Activity, 
  GraduationCap, 
  UserCheck, 
  HelpCircle,
  Sparkles,
  ExternalLink,
  MessageCircle,
  Check,
  Building2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export interface GuideScenario {
  id: string;
  icon: any;
  title: string;
  subtitle: string;
  badge: string;
  badgeColor: string;
  lawRef: string;
  questions: {
    prompt: string;
    options: {
      label: string;
      description: string;
      subCriteriaId: string;
    }[];
  };
  procedures: Record<string, {
    summary: string;
    urgencyLevel: 'immediate' | 'high' | 'normal';
    urgencyText: string;
    steps: {
      stepNumber: number;
      title: string;
      description: string;
      keyLegalBasis?: string;
      actionType?: 'call' | 'visit' | 'legal' | 'medical';
      phone?: string;
      phoneLabel?: string;
    }[];
    rightsList: string[];
    sanctionsOrObligations: string;
    emergencyContacts: {
      name: string;
      phone: string;
      tollFree?: boolean;
      role: string;
    }[];
  }>;
}

export const SSR_POCKET_SCENARIOS: GuideScenario[] = [
  {
    id: 'ivg',
    icon: Activity,
    title: "Interruption Volontaire de Grossesse (IVG)",
    subtitle: "Procédure médicale légale et sécurisée au Bénin",
    badge: "Loi 2021-12",
    badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
    lawRef: "Loi n° 2021-12 du 20 décembre 2021 (Art. 17 & 17-1)",
    questions: {
      prompt: "Quelle est votre situation actuelle par rapport à la grossesse ?",
      options: [
        {
          label: "Grossesse de moins de 12 semaines (Détresse matérielle/morale/études)",
          description: "La grossesse risque d'interrompre vos études, votre apprentissage ou d'engendrer une précarité matérielle ou morale.",
          subCriteriaId: "under_12_weeks"
        },
        {
          label: "Grossesse issue d'un viol ou d'un inceste",
          description: "La grossesse est la conséquence directe d'une agression sexuelle, d'un viol ou d'un inceste.",
          subCriteriaId: "rape_or_incest"
        },
        {
          label: "Danger pour la vie / santé de la femme ou anomalie fœtale grave",
          description: "La poursuite de la grossesse met en péril votre santé physique/mentale ou le fœtus présente une affection incurable.",
          subCriteriaId: "medical_indication"
        },
        {
          label: "Un soignant refuse de pratiquer l'acte (Clause de conscience)",
          description: "L'agent de santé refuse de vous prendre en charge en invoquant ses convictions personnelles.",
          subCriteriaId: "conscience_refusal"
        }
      ]
    },
    procedures: {
      "under_12_weeks": {
        summary: "L'IVG est légalement autorisée sur simple demande jusqu’à 12 semaines d'aménorrhée (environ 10 semaines de grossesse réelle).",
        urgencyLevel: 'high',
        urgencyText: "Délai légal maximum : 12 semaines d'aménorrhée",
        steps: [
          {
            stepNumber: 1,
            title: "Confirmation médicale du terme",
            description: "Consultez un médecin, une sage-femme agréée ou un centre spécialisé (ex: cliniques ABPF) pour dater précisément la grossesse par échographie ou examen clinique.",
            keyLegalBasis: "Article 17 Nouveau al. 1 : Délai légal de 12 semaines d'aménorrhée",
            actionType: 'medical'
          },
          {
            stepNumber: 2,
            title: "Entretien d'information et consentement éclairé",
            description: "Le praticien vous informe des méthodes (médicamenteuse ou chirurgicale conforme aux protocoles OMS), des effets secondaires et recueille votre consentement écrit.",
            keyLegalBasis: "Article 17-1 Nouveau : Respect de la dignité et confidentialité",
            actionType: 'medical'
          },
          {
            stepNumber: 3,
            title: "Réalisation sécurisée de l'acte",
            description: "L'acte est pratiqué dans une structure sanitaire publique ou privée homologuée dans des conditions optimales d'hygiène et d'asepsie.",
            keyLegalBasis: "Article 17-1 Nouveau : Établissements sanitaires autorisés",
            actionType: 'medical'
          },
          {
            stepNumber: 4,
            title: "Visite de contrôle post-IVG & Contraception",
            description: "Une consultation de suivi est effectuée sous 10 à 14 jours, accompagnée d'un conseil contraceptif adapté pour prévenir de futures grossesses non planifiées.",
            keyLegalBasis: "Accès universel à la planification familiale",
            actionType: 'visit'
          }
        ],
        rightsList: [
          "Secret médical absolu et confidentialité des données",
          "Choix de la méthode médicale la plus appropriée (médicamenteuse ou par aspiration)",
          "Conseil contraceptif gratuit et suivi médical post-intervention",
          "Interdiction de toute stigmatisation ou jugement moral par le personnel soignant"
        ],
        sanctionsOrObligations: "Toute pratique clandestine par une personne non qualifiée ou hors centre agréé reste passible de peines pénales.",
        emergencyContacts: [
          { name: "Cliniques ABPF (Santé Reproductive)", phone: "+22921321853", role: "Centres de soins agréés SSR" },
          { name: "Ligne d'Écoute Nationale INF", phone: "114", tollFree: true, role: "Orientation médicale & droits" }
        ]
      },
      "rape_or_incest": {
        summary: "En cas de viol ou d'inceste, l'IVG est autorisée SANS condition de délai des 12 semaines sur attestation ou certificat médical.",
        urgencyLevel: 'immediate',
        urgencyText: "Urgence médicale & accompagnement psychologique immédiat",
        steps: [
          {
            stepNumber: 1,
            title: "Prise en charge d'urgence & Constat médical",
            description: "Rendez-vous immédiatement dans un hôpital public ou contactez le 114 pour la délivrance gratuite du certificat médical et un bilan de santé complet.",
            keyLegalBasis: "Loi 2011-26 Art. 33 : Gratuité des certificats et soins d'urgence",
            actionType: 'call',
            phone: "114",
            phoneLabel: "Appeler le 114"
          },
          {
            stepNumber: 2,
            title: "Demande d'interruption de grossesse",
            description: "Sur présentation des éléments médicaux ou de la déclaration attestant des faits de viol/inceste, l'intervention est planifiée sans limitation de délai.",
            keyLegalBasis: "Article 17 Nouveau al. 3 : Dispense de délai en cas de viol/inceste",
            actionType: 'medical'
          },
          {
            stepNumber: 3,
            title: "Accompagnement psychologique et juridique",
            description: "Bénéficiez d'une assistance juridique gratuite via l'INF ou l'AFJB pour poursuivre l'agresseur si vous souhaitez porter plainte.",
            keyLegalBasis: "Loi 2011-26 : Sanctions pénales de 5 à 20 ans de réclusion contre le violeur",
            actionType: 'legal'
          }
        ],
        rightsList: [
          "Droit à l'IVG sécurisée sans restriction de délai des 12 semaines",
          "Délivrance gratuite du certificat médical constatant l'agression",
          "Assistance juridique et soutien psychologique gratuit garanti par l'État",
          "Protection de l'anonymat devant les juridictions"
        ],
        sanctionsOrObligations: "Le viol est un crime puni de 5 à 20 ans de réclusion criminelle selon le Code Pénal béninois.",
        emergencyContacts: [
          { name: "Ligne Verte INF (Gratuit 24/7)", phone: "114", tollFree: true, role: "Accompagnement d'urgence" },
          { name: "Police Républicaine", phone: "117", tollFree: true, role: "Intervention & Plainte" }
        ]
      },
      "medical_indication": {
        summary: "Lorsque la grossesse menace gravement la santé de la femme ou que l'enfant à naître présente une affection grave, l'interruption thérapeutique est garantie.",
        urgencyLevel: 'high',
        urgencyText: "Avis médical conjoint requis",
        steps: [
          {
            stepNumber: 1,
            title: "Évaluation par deux médecins",
            description: "Deux médecins, dont au moins un spécialiste (gynécologue-obstétricien), établissent un certificat attestant du péril pour la santé ou de l'anomalie grave du fœtus.",
            keyLegalBasis: "Article 17 Nouveau al. 3 : Sauvegarde de la santé de la mère",
            actionType: 'medical'
          },
          {
            stepNumber: 2,
            title: "Accord de la patiente",
            description: "La décision appartient à la femme enceinte. Si elle est hors d'état d'exprimer sa volonté, l'avis de son représentant légal ou conjoint est requis.",
            keyLegalBasis: "Article 17 Nouveau : Primauté de la volonté de la patiente",
            actionType: 'medical'
          },
          {
            stepNumber: 3,
            title: "Intervention en milieu hospitalier spécialisé",
            description: "L'acte est réalisé dans un centre hospitalier équipé pour gérer d'éventuelles complications médicales.",
            actionType: 'visit'
          }
        ],
        rightsList: [
          "Sauvegarde prioritaire de la vie et de la santé physique et mentale de la femme",
          "Transparence totale sur le diagnostic médical",
          "Prise en charge dans un plateau technique sécurisé"
        ],
        sanctionsOrObligations: "La non-assistance à personne en danger s'applique si le corps médical refuse de sauver une patiente en péril.",
        emergencyContacts: [
          { name: "SAMU Bénin", phone: "112", tollFree: true, role: "Urgences Médicales" },
          { name: "Centres Hospitaliers Universitaires (CNHU / CHUD)", phone: "+22921300155", role: "Plateaux spécialisés" }
        ]
      },
      "conscience_refusal": {
        summary: "Le soignant peut refuser de pratiquer l'acte, mais la loi lui IMPOSE l'obligation stricte de vous réorienter immédiatement vers un praticien habilité.",
        urgencyLevel: 'immediate',
        urgencyText: "Obligation légale immédiate de réorientation",
        steps: [
          {
            stepNumber: 1,
            title: "Notification immédiate du refus",
            description: "Le médecin ou soignant qui invoque sa clause de conscience doit vous en informer dès la première consultation sans vous juger ni vous retarder.",
            keyLegalBasis: "Article 17-2 Nouveau : Clause de conscience encadrée",
            actionType: 'medical'
          },
          {
            stepNumber: 2,
            title: "Exigence de la réorientation écrite",
            description: "Exigez que le praticien vous oriente formellement vers un confrère ou un établissement assurant la prestation.",
            keyLegalBasis: "Article 17-2 Nouveau : Obligation de transmission du dossier",
            actionType: 'medical'
          },
          {
            stepNumber: 3,
            title: "Recours et signalement en cas de blocage",
            description: "Si le praticien refuse de vous orienter ou cherche à vous faire dépasser les délais légaux, signalez-le au 114 ou à la direction départementale de la santé.",
            keyLegalBasis: "Faute déontologique et mise en danger d'autrui",
            actionType: 'call',
            phone: "114",
            phoneLabel: "Signaler au 114"
          }
        ],
        rightsList: [
          "Droit à une réorientation immédiate sans délai superflu",
          "Droit à la transmission intégrale et confidentielle de votre dossier médical",
          "Interdiction pour le praticien de vous dissuader par des pressions morales",
          "Recours disciplinaire auprès de l'Ordre National des Médecins du Bénin"
        ],
        sanctionsOrObligations: "Le refus d'orientation constitue un manquement déontologique grave puni par les instances ordinales et la loi sanitaire.",
        emergencyContacts: [
          { name: "Institut National de la Femme (INF)", phone: "114", tollFree: true, role: "Signalement & Assistance" },
          { name: "Cliniques ABPF (Acceptation garantie)", phone: "+22921321853", role: "Centres ouverts 6j/7" }
        ]
      }
    }
  },
  {
    id: 'vbg',
    icon: Shield,
    title: "Violences Sexuelles & VBG",
    subtitle: "Protocole d'urgence médicale dans les 72h & Dépôt de plainte",
    badge: "Loi 2011-26",
    badgeColor: "bg-rose-100 text-rose-800 border-rose-200",
    lawRef: "Loi n° 2011-26 du 09 janvier 2012 (Violences Faites aux Femmes)",
    questions: {
      prompt: "Quel est le délai écoulé depuis l'agression ou la situation de violence ?",
      options: [
        {
          label: "Moins de 72 heures (Urgence médicale absolue)",
          description: "La prise en charge médicale urgente (contraception d'urgence + trithérapie préventive VIH) doit se faire sous 72h.",
          subCriteriaId: "under_72h"
        },
        {
          label: "Plus de 72 heures / Violences continues ou passées",
          description: "Accompagnement médico-légal, soutien psychologique, sécurisation et dépôt de plainte.",
          subCriteriaId: "after_72h"
        },
        {
          label: "Mutilations Génitales Féminines (MGF / Excision)",
          description: "Menace ou réalisation d'excision sur une fillette ou jeune fille.",
          subCriteriaId: "fgm_emergency"
        }
      ]
    },
    procedures: {
      "under_72h": {
        summary: "Les 72 premières heures sont cruciales pour prévenir une grossesse forcée et une infection par le VIH (PEP), et préserver les preuves médico-légales.",
        urgencyLevel: 'immediate',
        urgencyText: "URGENCE 72H : Rendez-vous médical immédiat",
        steps: [
          {
            stepNumber: 1,
            title: "Ne pas se laver ni changer d'habits (Préservation des preuves)",
            description: "Dans la mesure du possible, évitez de vous laver ou de jeter vos vêtements pour conserver les traces ADN indispensables à l'enquête.",
            actionType: 'visit'
          },
          {
            stepNumber: 2,
            title: "Se rendre aux urgences ou appeler le 114",
            description: "Rendez-vous à l'hôpital le plus proche ou contactez l'INF au 114 pour recevoir gratuitement la pilule du lendemain et le traitement préventif anti-VIH (PEP).",
            keyLegalBasis: "Loi 2011-26 Art. 33 : Prise en charge d'urgence 100% gratuite",
            actionType: 'call',
            phone: "114",
            phoneLabel: "Appel gratuit 114"
          },
          {
            stepNumber: 3,
            title: "Délivrance gratuite du certificat médical",
            description: "Le médecin urgentiste doit vous délivrer gratuitement un certificat descriptif complet des lésions physiques et psychologiques.",
            keyLegalBasis: "Loi 2011-26 Art. 33 : Obligation médicale de délivrance sans frais",
            actionType: 'medical'
          },
          {
            stepNumber: 4,
            title: "Dépôt de plainte et mise en sécurité",
            description: "La Police Républicaine (117) ou l'INF prend votre plainte et peut ordonner une mesure d'éloignement de l'agresseur.",
            keyLegalBasis: "Code Pénal : Viol passible de 5 à 20 ans de prison ferme",
            actionType: 'legal'
          }
        ],
        rightsList: [
          "Gratuité intégrale de la prophylaxie post-exposition (PEP) contre le VIH",
          "Gratuité de la contraception d'urgence (pilule du lendemain)",
          "Gratuité de l'établissement du certificat médical",
          "Accès immédiat à un hébergement d'urgence et soutien psychologique"
        ],
        sanctionsOrObligations: "Le viol est un crime puni de 5 à 20 ans de réclusion criminelle, avec circonstances aggravantes si la victime est mineure.",
        emergencyContacts: [
          { name: "Ligne d'Urgence INF", phone: "114", tollFree: true, role: "Écoute & Orientation 24/7" },
          { name: "Police Républicaine (Secours)", phone: "117", tollFree: true, role: "Intervention rapide" }
        ]
      },
      "after_72h": {
        summary: "Même après 72h, vos droits à la justice, aux soins, aux dépistages et à la réparation intégrale demeurent inaliénables.",
        urgencyLevel: 'high',
        urgencyText: "Dépôt de plainte & Soins réparateurs",
        steps: [
          {
            stepNumber: 1,
            title: "Bilan sérologique et consultations gynécologiques",
            description: "Effectuez un dépistage complet IST/VIH et un test de grossesse dans une clinique spécialisée (ex: ABPF ou hôpital public).",
            actionType: 'medical'
          },
          {
            stepNumber: 2,
            title: "Assistance juridique gratuite (Boutiques de Droit)",
            description: "Contactez l'AFJB ou l'INF pour être accompagnée par une avocate ou une juriste spécialisée pour la constitution de partie civile.",
            actionType: 'legal'
          },
          {
            stepNumber: 3,
            title: "Saisine du Procureur de la République",
            description: "Votre plainte est transmise directement au parquet pour déclencher les poursuites pénales contre l'auteur.",
            keyLegalBasis: "Prescription allongée pour les crimes sexuels sur mineurs",
            actionType: 'legal'
          }
        ],
        rightsList: [
          "Droit de porter plainte sans aucune condition de délai immédiat",
          "Assistance d'un avocat commis d'office ou bénévole",
          "Droit à des dommages et intérêts pour préjudice physique et moral"
        ],
        sanctionsOrObligations: "Tout témoin ou proche qui dissimule un viol s'expose à des poursuites pour non-dénonciation de crime.",
        emergencyContacts: [
          { name: "Association des Femmes Juristes (AFJB)", phone: "+22921315298", role: "Assistance judiciaire" },
          { name: "Ligne INF", phone: "114", tollFree: true, role: "Guichet unique d'État" }
        ]
      },
      "fgm_emergency": {
        summary: "Les Mutilations Génitales Féminines (excision) sont formellement prohibées et sévèrement réprimées au Bénin.",
        urgencyLevel: 'immediate',
        urgencyText: "Signalement immédiat pour protection de l'enfant",
        steps: [
          {
            stepNumber: 1,
            title: "Signalement immédiat de la menace",
            description: "Appelez immédiatement le 114 (INF) ou le 117 (Police) si une fillette est sur le point d'être excisée ou a subi des pressions familiales.",
            keyLegalBasis: "Loi 2011-26 Art. 15 : Interdiction absolue des MGF",
            actionType: 'call',
            phone: "114",
            phoneLabel: "Alerter le 114"
          },
          {
            stepNumber: 2,
            title: "Mesure de protection et mise à l'abri",
            description: "Le juge des mineurs ou l'officier de police ordonne le placement d'urgence de la victime dans un centre d'accueil sécurisé.",
            actionType: 'legal'
          },
          {
            stepNumber: 3,
            title: "Poursuites judiciaires contre l'exciseuse et les complices",
            description: "L'exciseuse ainsi que les parents commanditaires sont arrêtés et traduits en justice.",
            keyLegalBasis: "Peine de 3 à 5 ans de prison ferme et fortes amendes",
            actionType: 'legal'
          }
        ],
        rightsList: [
          "Droit à l'intégrité physique absolue pour chaque fillette et jeune fille",
          "Protection étatique contre toute coutume ou tradition attentatoire au corps",
          "Soins réparateurs et suivi médicalisé gratuit"
        ],
        sanctionsOrObligations: "L'excision est punie de 3 à 5 ans de prison (jusqu'à 10 ans si la victime est mineure ou en cas de décès).",
        emergencyContacts: [
          { name: "Numéro Vert INF", phone: "114", tollFree: true, role: "Signalement MGF 24/7" },
          { name: "Police Républicaine", phone: "117", tollFree: true, role: "Protection physique" }
        ]
      }
    }
  },
  {
    id: 'school_pregnancy',
    icon: GraduationCap,
    title: "Grossesse en Milieu Scolaire & Apprentissage",
    subtitle: "Droit au maintien scolaire & Interdiction stricte de renvoi",
    badge: "Code Enfant",
    badgeColor: "bg-amber-100 text-amber-800 border-amber-200",
    lawRef: "Loi n° 2015-08 (Code de l'Enfant) & Arrêtés Ministériels",
    questions: {
      prompt: "Quel problème rencontrez-vous dans votre établissement ou atelier ?",
      options: [
        {
          label: "Menace de renvoi, d'exclusion ou de refus d'inscription",
          description: "Le directeur, l'artisan patron ou l'administration refuse de vous laisser poursuivre vos cours.",
          subCriteriaId: "expulsion_threat"
        },
        {
          label: "Auteur de la grossesse : enseignant, maître d'apprentissage ou adulte",
          description: "La grossesse a été causée par un enseignant, un encadreur ou un adulte en situation d'autorité.",
          subCriteriaId: "teacher_author"
        },
        {
          label: "Demande de congé de maternité et réintégration",
          description: "Modalités pour passer les examens officiels et reprendre les cours après l'accouchement.",
          subCriteriaId: "maternity_leave"
        }
      ]
    },
    procedures: {
      "expulsion_threat": {
        summary: "La loi béninoise INTERDIT catégoriquement d'exclure ou de refuser l'inscription d'une élève ou apprentie pour cause de grossesse.",
        urgencyLevel: 'high',
        urgencyText: "Protection du droit constitutionnel à l'instruction",
        steps: [
          {
            stepNumber: 1,
            title: "Informer la direction du cadre légal",
            description: "Rappelez au chef d'établissement que l'exclusion pour grossesse est illégale et constitue une faute administrative grave.",
            keyLegalBasis: "Arrêté Ministériel portant protection des filles scolarisées enceintes",
            actionType: 'visit'
          },
          {
            stepNumber: 2,
            title: "Saisir le Centre de Promotion Sociale (CPS)",
            description: "Rapprochez-vous du CPS de votre commune ou de l'Institut National de la Femme (114) qui interviendra directement auprès de l'école.",
            actionType: 'call',
            phone: "114",
            phoneLabel: "Saisir l'INF (114)"
          },
          {
            stepNumber: 3,
            title: "Maintien et aménagement des cours",
            description: "L'école doit adapter vos conditions d'études (dispense d'EPS, pauses) jusqu'à votre départ pour l'accouchement.",
            actionType: 'visit'
          }
        ],
        rightsList: [
          "Interdiction formelle de renvoi, de suspension ou de rétrogradation",
          "Droit de composer aux examens d'État (BEPC, BAC) quel que soit le terme",
          "Droit de réintégration sans pénalité à l'issue du congé de maternité"
        ],
        sanctionsOrObligations: "Tout proviseur ou maître d'apprentissage qui exclut une élève enceinte encourt des sanctions disciplinaires et pénales.",
        emergencyContacts: [
          { name: "Ligne INF", phone: "114", tollFree: true, role: "Médiation scolaire" },
          { name: "Batonga Foundation", phone: "+22921307890", role: "Soutien aux filles scolarisées" }
        ]
      },
      "teacher_author": {
        summary: "Tout acte de relations sexuelles ou grossesse impliquant un enseignant ou maître d'apprentissage sur une mineure constitue un délit grave.",
        urgencyLevel: 'immediate',
        urgencyText: "Poursuites pénales & Révocation automatique",
        steps: [
          {
            stepNumber: 1,
            title: "Signalement à l'administration & au 114",
            description: "Déclarez les faits auprès de la Direction Départementale des Enseignements ou via la ligne 114.",
            actionType: 'call',
            phone: "114",
            phoneLabel: "Appel gratuit 114"
          },
          {
            stepNumber: 2,
            title: "Suspension conservatoire de l'auteur",
            description: "L'enseignant ou l'encadreur est immédiatement suspendu de ses fonctions par le ministère de tutelle.",
            keyLegalBasis: "Code de l'Enfant Art. 156-161 : Répression des abus d'autorité",
            actionType: 'legal'
          },
          {
            stepNumber: 3,
            title: "Poursuites judiciaires et prise en charge",
            description: "L'auteur est traduit devant le tribunal pour détournement de mineure et abus de fonction. Il a l'obligation légale de subvenir aux soins.",
            actionType: 'legal'
          }
        ],
        rightsList: [
          "Protection totale contre les représailles scolaires ou notes abusives",
          "Obligation de pension alimentaire et de prise en charge des frais de maternité",
          "Révocation définitive de l'enseignant fautif"
        ],
        sanctionsOrObligations: "L'auteur encourt une peine de 2 à 5 ans de prison ferme et l'interdiction définitive d'enseigner.",
        emergencyContacts: [
          { name: "Institut National de la Femme (INF)", phone: "114", tollFree: true, role: "Constitution de partie civile" },
          { name: "Police Républicaine", phone: "117", tollFree: true, role: "Dépôt de plainte" }
        ]
      },
      "maternity_leave": {
        summary: "Vous avez droit à un congé de maternité adapté et à la réintégration pleine et entière dans votre classe ou atelier.",
        urgencyLevel: 'normal',
        urgencyText: "Organisation administrative du cursus",
        steps: [
          {
            stepNumber: 1,
            title: "Dépôt d'un certificat médical de grossesse",
            description: "Fournissez un certificat médical attestant de la date probable d'accouchement pour fixer la période de repos.",
            actionType: 'visit'
          },
          {
            stepNumber: 2,
            title: "Maintien des droits aux examens",
            description: "Si l'accouchement coïncide avec les examens, des dispositions de rattrapage ou de composition adaptée sont prévues.",
            actionType: 'visit'
          },
          {
            stepNumber: 3,
            title: "Reprise sereine des cours",
            description: "Après l'accouchement, vous réintégrez votre place sans avoir à repayer de frais de scolarité supplémentaires non justifiés.",
            actionType: 'visit'
          }
        ],
        rightsList: [
          "Repos de maternité garanti",
          "Réintégration immédiate à l'école ou en atelier",
          "Accompagnement par les assistantes sociales scolaires"
        ],
        sanctionsOrObligations: "Les parents et tuteurs ont l'obligation légale de soutenir la poursuite des études de la jeune mère.",
        emergencyContacts: [
          { name: "CeRADIS ONG", phone: "+22921309437", role: "Plaidoyer éducation des filles" },
          { name: "Ligne 114", phone: "114", tollFree: true, role: "Assistance sociale" }
        ]
      }
    }
  },
  {
    id: 'child_marriage',
    icon: HeartHandshake,
    title: "Mariage Forcé / Mariage d'Enfant",
    subtitle: "Âge légal 18 ans révolus & Nullité du mariage précoce",
    badge: "Loi 2015-08",
    badgeColor: "bg-purple-100 text-purple-800 border-purple-200",
    lawRef: "Loi n° 2015-08 (Code de l'Enfant) Art. 123-124",
    questions: {
      prompt: "Quelle est la situation de mariage ou d'union envisagée ?",
      options: [
        {
          label: "Mineure de moins de 18 ans menacée de mariage traditionnel ou forcé",
          description: "La famille planifie ou impose un mariage coutumier ou religieux à une fille mineure.",
          subCriteriaId: "underage_forced"
        },
        {
          label: "Mariage déjà célébré sur une mineure (Annulation légale)",
          description: "La cérémonie a eu lieu et vous souhaitez faire annuler l'union et protéger la jeune fille.",
          subCriteriaId: "annulment_procedure"
        }
      ]
    },
    procedures: {
      "underage_forced": {
        summary: "Tout mariage coutumier, religieux ou civil d'une personne de moins de 18 ans est formellement NUL et puni par la loi.",
        urgencyLevel: 'immediate',
        urgencyText: "URGENCE : Intervention de protection immédiate",
        steps: [
          {
            stepNumber: 1,
            title: "Alerte immédiate au 114 ou à la Police (117)",
            description: "Signalez sans attendre la date et le lieu prévu pour la cérémonie afin que les autorités fassent stopper les préparatifs.",
            keyLegalBasis: "Code de l'Enfant Art. 123 : Âge matrimonial légal = 18 ans révolus",
            actionType: 'call',
            phone: "114",
            phoneLabel: "Alerter le 114"
          },
          {
            stepNumber: 2,
            title: "Intervention du Juge des Mineurs et du Procureur",
            description: "Le procureur de la République émet une ordonnance d'interdiction de célébration et convoque les familles.",
            actionType: 'legal'
          },
          {
            stepNumber: 3,
            title: "Placement temporaire en lieu sûr si nécessaire",
            description: "Si la fillette subit des menaces ou des violences à domicile, elle est mise à l'abri dans un centre d'accueil agréé.",
            actionType: 'visit'
          }
        ],
        rightsList: [
          "Droit imprescriptible de refuser tout mariage avant 18 ans révolus",
          "Nullité absolue de toute dot ou promesse de mariage précoce",
          "Protection physique et juridique assurée par l'État béninois"
        ],
        sanctionsOrObligations: "Les parents, célébrants coutumiers ou religieux et le prétendant encourent de 1 à 3 ans de prison ferme.",
        emergencyContacts: [
          { name: "Ligne d'Écoute Nationale INF", phone: "114", tollFree: true, role: "Intervention rapide VBG" },
          { name: "Plan International Bénin", phone: "+22921302222", role: "Programme Fin Mariage d'Enfant" }
        ]
      },
      "annulment_procedure": {
        summary: "Le tribunal de première instance prononce la nullité d'ordre public du mariage et ordonne la réintégration de la mineure dans son milieu de vie.",
        urgencyLevel: 'high',
        urgencyText: "Procédure d'annulation judiciaire",
        steps: [
          {
            stepNumber: 1,
            title: "Saisine de l'AFJB ou de l'INF",
            description: "Une juriste rédige la requête en nullité de mariage devant le tribunal civil compétent.",
            actionType: 'legal'
          },
          {
            stepNumber: 2,
            title: "Jugement de nullité et restitution",
            description: "Le juge constate la nullité du mariage et ordonne la fin immédiate de toute cohabitation forcée.",
            keyLegalBasis: "Article 124 : Nullité absolue d'ordre public",
            actionType: 'legal'
          },
          {
            stepNumber: 3,
            title: "Réinsertion scolaire ou professionnelle",
            description: "La jeune fille est réintégrée à l'école ou dans une filière de formation avec le soutien des services sociaux (CPS).",
            actionType: 'visit'
          }
        ],
        rightsList: [
          "Annulation de plein droit sans frais pour la victime",
          "Interdiction d'approche pour le prétendant",
          "Soutien psychologique et réinsertion sociale"
        ],
        sanctionsOrObligations: "La cohabitation forcée avec une mineure équivaut à un viol sur mineure, passible de réclusion criminelle.",
        emergencyContacts: [
          { name: "Association des Femmes Juristes (AFJB)", phone: "+22921315298", role: "Avocates commises d'office" },
          { name: "Ligne 114", phone: "114", tollFree: true, role: "Secours et droits" }
        ]
      }
    }
  }
];

export const PocketGuide: React.FC = () => {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string | null>(null);
  const [selectedCriteriaId, setSelectedCriteriaId] = useState<string | null>(null);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2500);
  };

  const currentScenario = SSR_POCKET_SCENARIOS.find(s => s.id === selectedScenarioId);
  const currentProcedure = currentScenario && selectedCriteriaId ? currentScenario.procedures[selectedCriteriaId] : null;

  const handleReset = () => {
    setSelectedScenarioId(null);
    setSelectedCriteriaId(null);
    setActiveStepIndex(0);
  };

  const handleBackToOptions = () => {
    setSelectedCriteriaId(null);
    setActiveStepIndex(0);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl sm:rounded-[32px] p-3.5 sm:p-6 md:p-8 shadow-sm space-y-3.5 sm:space-y-6 overflow-hidden relative">
      {/* Background Accent Glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

      {/* Copy Alert */}
      <AnimatePresence>
        {copiedText && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-gray-700 text-xs font-bold"
          >
            <Check size={16} className="text-green-400 shrink-0" />
            <span>{copiedText} copié !</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-3 sm:pb-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-200 shrink-0">
            <Compass size={18} className="sm:hidden animate-pulse" /><Compass size={24} className="hidden sm:block animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] font-black uppercase tracking-widest bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full border border-blue-100">
                Guide de Poche Interactif
              </span>
              <span className="text-[10px] font-bold text-gray-400">Étape par étape</span>
            </div>
            <h3 className="text-xs sm:text-lg md:text-xl font-black text-gray-900 tracking-tight">
              Orientation Juridique & SSR au Bénin
            </h3>
          </div>
        </div>

        {(selectedScenarioId || selectedCriteriaId) && (
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-black uppercase tracking-wider transition-colors active:scale-95"
          >
            <RotateCcw size={14} />
            <span>Recommencer</span>
          </button>
        )}
      </div>

      {/* STAGE 1: SCENARIO SELECTION (Horizontal Carousel of Primary Situations) */}
      {!selectedScenarioId && (
        <div className="space-y-4">
          <div className="space-y-1">
            <h4 className="text-base font-black text-gray-900 flex items-center gap-2">
              <HelpCircle size={18} className="text-blue-600" />
              <span>De quoi avez-vous besoin aujourd'hui ?</span>
            </h4>
            <p className="text-xs text-gray-500 font-medium">
              Faites glisser horizontalement et sélectionnez votre situation pour découvrir la procédure officielle conforme aux lois béninoises.
            </p>
          </div>

          {/* Horizontal Carousel of Situation Cards */}
          <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-3 pt-1 no-scrollbar -mx-2 px-2">
            {SSR_POCKET_SCENARIOS.map((scenario) => {
              const Icon = scenario.icon;
              return (
                <motion.div
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  key={scenario.id}
                  onClick={() => {
                    setSelectedScenarioId(scenario.id);
                    setSelectedCriteriaId(null);
                    setActiveStepIndex(0);
                  }}
                  className="min-w-[220px] sm:min-w-[320px] max-w-[340px] snap-start bg-slate-50 hover:bg-blue-50/40 border border-slate-200 hover:border-blue-300 rounded-xl sm:rounded-[28px] p-3 sm:p-6 cursor-pointer transition-all flex flex-col justify-between shadow-sm hover:shadow-md group relative overflow-hidden shrink-0"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-blue-600 shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all">
                        <Icon size={16} className="sm:hidden" /><Icon size={24} className="hidden sm:block" />
                      </div>
                      <span className={cn("text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border", scenario.badgeColor)}>
                        {scenario.badge}
                      </span>
                    </div>

                    <div>
                      <h5 className="text-xs sm:text-base font-black text-gray-900 group-hover:text-blue-900 transition-colors leading-tight mb-1">
                        {scenario.title}
                      </h5>
                      <p className="text-[11px] sm:text-xs text-gray-500 font-medium leading-relaxed">
                        {scenario.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 mt-2 border-t border-slate-200/60 flex items-center justify-between text-xs font-black text-blue-600 group-hover:text-blue-700">
                    <span>Explorer la procédure</span>
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* STAGE 2: SUB-CRITERIA SELECTION (Detailed Questions) */}
      {selectedScenarioId && currentScenario && !selectedCriteriaId && (
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-5"
        >
          {/* Breadcrumb / Top Bar */}
          <div className="flex items-center gap-2 text-xs font-bold text-gray-500 flex-wrap">
            <button 
              onClick={() => setSelectedScenarioId(null)}
              className="text-blue-600 hover:underline flex items-center gap-1"
            >
              <ChevronLeft size={14} />
              Changer de thématique
            </button>
            <span>•</span>
            <span className="text-gray-900 font-black">{currentScenario.title}</span>
          </div>

          <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-4 flex items-center justify-between gap-3">
            <div>
              <div className="text-[10px] font-black uppercase tracking-wider text-blue-700">Base Légale Applicable</div>
              <div className="text-xs font-bold text-blue-950">{currentScenario.lawRef}</div>
            </div>
            <span className={cn("text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border bg-white", currentScenario.badgeColor)}>
              {currentScenario.badge}
            </span>
          </div>

          <div className="space-y-2">
            <h4 className="text-base font-black text-gray-900 flex items-center gap-2">
              <HelpCircle size={18} className="text-blue-600" />
              <span>{currentScenario.questions.prompt}</span>
            </h4>
            <p className="text-xs text-gray-500 font-medium">
              Sélectionnez l'option correspondant précisément à votre situation :
            </p>
          </div>

          {/* Horizontal / Grid Cards of Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {currentScenario.questions.options.map((opt, idx) => (
              <motion.div
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.99 }}
                key={idx}
                onClick={() => {
                  setSelectedCriteriaId(opt.subCriteriaId);
                  setActiveStepIndex(0);
                }}
                className="bg-white hover:bg-blue-50/30 border border-gray-200 hover:border-blue-400 rounded-xl sm:rounded-2xl p-3 sm:p-5 cursor-pointer transition-all flex flex-col justify-between shadow-sm group"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                      Cas #{idx + 1}
                    </span>
                    <ChevronRight size={16} className="text-gray-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                  </div>
                  <h5 className="text-xs sm:text-sm font-black text-gray-900 leading-snug">
                    {opt.label}
                  </h5>
                  <p className="text-[11px] sm:text-xs text-gray-600 font-medium leading-relaxed">
                    {opt.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* STAGE 3: STEP-BY-STEP PROCEDURE (Interactive Horizontal Carousel of Action Steps) */}
      {selectedScenarioId && currentScenario && selectedCriteriaId && currentProcedure && (
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Breadcrumb Navigation */}
          <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
            <div className="flex items-center gap-2 text-gray-500 font-medium flex-wrap">
              <button 
                onClick={handleReset}
                className="text-blue-600 hover:underline font-bold"
              >
                Guide
              </button>
              <span>/</span>
              <button 
                onClick={handleBackToOptions}
                className="text-blue-600 hover:underline font-bold"
              >
                {currentScenario.title}
              </button>
              <span>/</span>
              <span className="text-gray-900 font-black">Plan d'action légal</span>
            </div>

            <div className="flex items-center gap-2">
              <span className={cn(
                "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border flex items-center gap-1.5",
                currentProcedure.urgencyLevel === 'immediate' ? "bg-rose-50 text-rose-700 border-rose-200" :
                currentProcedure.urgencyLevel === 'high' ? "bg-amber-50 text-amber-700 border-amber-200" :
                "bg-emerald-50 text-emerald-700 border-emerald-200"
              )}>
                <Clock size={12} />
                {currentProcedure.urgencyText}
              </span>
            </div>
          </div>

          {/* Procedure Summary Card */}
          <div className="bg-slate-900 text-white rounded-2xl p-5 space-y-2">
            <div className="text-[10px] font-black uppercase tracking-widest text-blue-400 flex items-center gap-1.5">
              <Sparkles size={12} />
              Verdict & Synthèse Légale
            </div>
            <p className="text-sm font-semibold text-gray-100 leading-relaxed">
              {currentProcedure.summary}
            </p>
          </div>

          {/* Steps Carousel Header with Nav Arrows */}
          <div className="flex items-center justify-between gap-4 pt-1">
            <div>
              <h4 className="text-base font-black text-gray-900 flex items-center gap-2">
                <FileText size={18} className="text-blue-600" />
                <span>Parcours étape par étape ({currentProcedure.steps.length} étapes)</span>
              </h4>
              <p className="text-xs text-gray-500 font-medium">
                Défilez horizontalement pour suivre les étapes ordonnées de la procédure.
              </p>
            </div>

            {/* Step Indicator Pills */}
            <div className="flex items-center gap-1.5">
              {currentProcedure.steps.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveStepIndex(i)}
                  className={cn(
                    "w-7 h-7 rounded-lg text-xs font-black transition-all flex items-center justify-center",
                    activeStepIndex === i 
                      ? "bg-blue-600 text-white shadow-md shadow-blue-200 scale-105" 
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  )}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>

          {/* HORIZONTAL CAROUSEL OF PROCEDURE STEPS */}
          <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 pt-1 no-scrollbar -mx-2 px-2">
            {currentProcedure.steps.map((step, idx) => {
              const isSelected = activeStepIndex === idx;
              return (
                <div
                  key={idx}
                  onClick={() => setActiveStepIndex(idx)}
                  className={cn(
                    "min-w-[290px] sm:min-w-[340px] max-w-[380px] snap-start rounded-3xl p-6 border transition-all duration-300 flex flex-col justify-between shrink-0 cursor-pointer",
                    isSelected
                      ? "bg-white border-blue-500 shadow-xl shadow-blue-50 ring-4 ring-blue-50"
                      : "bg-slate-50/80 border-slate-200 hover:bg-white hover:border-blue-200"
                  )}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className={cn(
                        "w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black shadow-sm",
                        isSelected ? "bg-blue-600 text-white" : "bg-white text-gray-700 border border-gray-200"
                      )}>
                        {step.stepNumber}
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                        Étape {idx + 1} sur {currentProcedure.steps.length}
                      </span>
                    </div>

                    <h5 className="text-base font-black text-gray-900 leading-snug">
                      {step.title}
                    </h5>

                    <p className="text-xs text-gray-600 font-medium leading-relaxed">
                      {step.description}
                    </p>

                    {step.keyLegalBasis && (
                      <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-[11px] font-bold text-emerald-900 flex items-start gap-2">
                        <Scale size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                        <span>{step.keyLegalBasis}</span>
                      </div>
                    )}
                  </div>

                  {step.phone && (
                    <div className="pt-4 mt-3 border-t border-gray-100">
                      <a
                        href={`tel:${step.phone}`}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-blue-100 active:scale-95 transition-all"
                      >
                        <Phone size={14} />
                        {step.phoneLabel || `Appeler ${step.phone}`}
                      </a>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* GUARANTEES & SANCTIONS DETAILS (Collapsible / Bottom Bar) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* Rights & Guarantees */}
            <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-5 space-y-2.5">
              <div className="text-xs font-black uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                <CheckCircle2 size={15} className="text-emerald-600" />
                Vos Droits Légaux Inaliénables
              </div>
              <ul className="space-y-1.5 text-xs font-semibold text-emerald-950">
                {currentProcedure.rightsList.map((right, rIdx) => (
                  <li key={rIdx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    <span>{right}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Sanctions / Obligations */}
            <div className="bg-amber-50/70 border border-amber-100 rounded-2xl p-5 space-y-2.5">
              <div className="text-xs font-black uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                <AlertTriangle size={15} className="text-amber-600" />
                Sanctions & Répression des Infractions
              </div>
              <p className="text-xs text-amber-950 font-medium leading-relaxed">
                {currentProcedure.sanctionsOrObligations}
              </p>
            </div>
          </div>

          {/* EMERGENCY CONTACTS QUICK BAR */}
          <div className="bg-gray-900 text-white rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-black uppercase tracking-wider text-blue-300 flex items-center gap-2">
                <Phone size={14} />
                Contacts Directs & Orientation Immédiate
              </div>
              <span className="text-[10px] font-bold text-gray-400">Bénin 24/7</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {currentProcedure.emergencyContacts.map((contact, cIdx) => (
                <div key={cIdx} className="bg-gray-800/80 border border-gray-700 rounded-xl p-3 flex items-center justify-between gap-2">
                  <div>
                    <div className="font-bold text-gray-200">{contact.name}</div>
                    <div className="text-[10px] text-gray-400 font-medium">{contact.role}</div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <a
                      href={`tel:${contact.phone.replace(/[^0-9+]/g, '')}`}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-black tracking-wider flex items-center gap-1 transition-all",
                        contact.tollFree 
                          ? "bg-rose-600 hover:bg-rose-700 text-white" 
                          : "bg-blue-600 hover:bg-blue-700 text-white"
                      )}
                    >
                      <Phone size={12} />
                      <span>{contact.phone}</span>
                    </a>
                    <button
                      onClick={() => handleCopy(contact.phone, contact.name)}
                      className="p-1.5 text-gray-400 hover:text-white rounded-lg"
                      title="Copier le numéro"
                    >
                      <CopyIcon size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

const CopyIcon = ({ size = 12 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
  </svg>
);
