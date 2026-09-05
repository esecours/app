export interface HealthTopicItem {
  id: string;
  title: string;
  category: 'contraception' | 'ist' | 'vih' | 'grossesse';
  categoryLabel: string;
  badgeColor: string;
  summary: string;
  urgencyTimeline?: string;
  keyPoints: string[];
  detailedSections: {
    heading: string;
    content: string;
    points?: string[];
  }[];
  practicalDo: string[];
  practicalDont: string[];
  emergencyContacts: {
    name: string;
    phone: string;
    role: string;
    tollFree?: boolean;
  }[];
  legalReference?: string;
}

export interface SafetyEmergencyItem {
  id: string;
  situation: 'agression' | 'harcelement' | 'viol' | 'mariage_force';
  situationLabel: string;
  title: string;
  badgeColor: string;
  summary: string;
  urgentActionTimeline: string;
  steps: {
    stepNumber: number;
    title: string;
    description: string;
    actionHighlight?: string;
    iconType?: string;
  }[];
  legalProtectionsInBenin: {
    lawTitle: string;
    articles: string;
    penalties: string;
    guaranteedRights: string[];
  };
  evidenceAndPrecautions: string[];
  contacts: {
    name: string;
    phone: string;
    role: string;
    tollFree?: boolean;
  }[];
}

export const HEALTH_TOPICS_SSR: HealthTopicItem[] = [
  {
    id: 'contraception-guide',
    title: 'Contraception & Planification Familiale au Bénin',
    category: 'contraception',
    categoryLabel: 'Contraception',
    badgeColor: 'bg-teal-50 text-teal-800 border-teal-200',
    summary: 'Panorama complet des méthodes contraceptives modernes, gestion de l\'urgence sous 72h et accès libre sans consentement parental pour les jeunes.',
    urgencyTimeline: 'Moins de 72h pour la contraception d\'urgence',
    legalReference: 'Loi 2021-12 & Politique Nationale de Santé de la Reproduction',
    keyPoints: [
      'La pilule du lendemain est en vente libre sans ordonnance dans toutes les pharmacies et cliniques ABPF.',
      'Les méthodes régulières (implant, DIU, injectable, pilule) sont disponibles à tarifs sociaux dans les centres de santé.',
      'Seul le préservatif (masculin ou féminin) protège à la fois d\'une grossesse et des IST/VIH (Double Protection).',
      'Les mineures ont le droit de consulter et d\'accéder à la contraception sous le sceau du secret médical.'
    ],
    detailedSections: [
      {
        heading: '1. Contraception d\'urgence (Pilule du lendemain & DIU d\'urgence)',
        content: 'À prendre le plus rapidement possible après un rapport sexuel non ou mal protégé (oubli de pilule, déchirure de préservatif, agression).',
        points: [
          'Lévonorgestrel (ex: NorLevo, Postinor) : Efficace jusqu\'à 72h (idéalement dans les premières 12 à 24h).',
          'Acétate d\'Ulipristal (ex: EllaOne) : Efficace jusqu\'à 120h (5 jours) après le rapport.',
          'DIU au cuivre posé par une sage-femme dans les 5 jours : méthode d\'urgence la plus efficace et assure ensuite une contraception pour 5 à 10 ans.',
          'Si vous vomissez dans les 3 heures suivant la prise d\'un comprimé, il faut immédiatement en reprendre un autre.'
        ]
      },
      {
        heading: '2. Méthodes contraceptives régulières et longue durée',
        content: 'Chaque femme peut choisir la méthode la plus adaptée à son mode de vie avec l\'aide d\'une sage-femme ou d\'un médecin.',
        points: [
          'Implant sous-cutané (Jadelle, Implanon) : Petit bâtonnet inséré sous la peau du bras, efficace à 99,9% pendant 3 à 5 ans, très discret et réversible à tout moment.',
          'Dispositif Intra-Utérin (DIU / Stérilet au cuivre ou hormonal) : Efficacité de 5 à 10 ans sans prise quotidienne, n\'affecte pas la fertilité future.',
          'Injectables trimestriels (Depo-Provera, Sayana Press) : Une injection tous les 3 mois en centre de santé ou administrable soi-même.',
          'Pilule combinée ou microprogestative : Un comprimé à prendre tous les jours à heure fixe.',
          'Préservatifs masculins et féminins : Protection barrière indispensable contre les IST.'
        ]
      },
      {
        heading: '3. Où s\'en procurer et consultations gratuites / subventionnées au Bénin',
        content: 'Toutes les formations sanitaires publiques (centres de santé d\'arrondissement, hôpitaux de zone) et les cliniques spécialisées de l\'Association Béninoise pour la Promotion de la Famille (ABPF) dans les 12 départements dispensent des conseils personnalisés et des méthodes à prix modiques.'
      }
    ],
    practicalDo: [
      'Prendre la pilule du lendemain immédiatement après le rapport à risque.',
      'Associer systématiquement le préservatif à toute autre méthode pour éviter les IST.',
      'Consulter une sage-femme pour trouver la méthode adaptée à votre corps et à votre santé.',
      'Faire un test de grossesse 3 semaines après une prise de contraception d\'urgence pour confirmation.'
    ],
    practicalDont: [
      'Ne pas utiliser la pilule du lendemain comme méthode contraceptive régulière (elle est réservée aux urgences).',
      'Ne pas croire aux mythes populaires (boire des décoctions, sodas ou eau salée n\'empêche absolument pas une grossesse et nuit gravement à la santé).',
      'Ne jamais interrompre sa méthode contraceptive sans avis d\'un professionnel de santé.'
    ],
    emergencyContacts: [
      { name: 'Cliniques ABPF Bénin', phone: '+22921321853', role: 'Santé sexuelle & contraception' },
      { name: 'Ligne INF Bénin', phone: '114', role: 'Orientation 24/7', tollFree: true },
      { name: 'SAMU Urgences', phone: '112', role: 'Secours médicaux', tollFree: true }
    ]
  },
  {
    id: 'ist-guide',
    title: 'Infections Sexuellement Transmissibles (IST) : Symptômes & Traitements',
    category: 'ist',
    categoryLabel: 'IST',
    badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
    summary: 'Reconnaître les signes d\'alerte des IST (Chlamydia, Gonorrhée, Syphilis, Hépatite B), éviter l\'automédication et soigner simultanément les partenaires.',
    urgencyTimeline: 'Consultation médicale dès les premiers symptômes',
    legalReference: 'Protocoles Nationaux de Prise en Charge Syndromique des IST',
    keyPoints: [
      'Les IST peuvent être totalement silencieuses (asymptomatiques) chez l\'homme comme chez la femme.',
      'L\'automédication avec des antibiotiques sans ordonnance est dangereuse et favorise les souches résistantes.',
      'Le traitement doit impérativement être pris en même temps par TOUS les partenaires sexuels.',
      'Les IST non traitées sont la 1ère cause d\'infertilité, de stérilité et de grossesses extra-utérines au Bénin.'
    ],
    detailedSections: [
      {
        heading: '1. Les principales IST et leurs symptômes d\'alerte',
        content: 'Consultez sans attendre si vous constatez l\'un des signes suivants :',
        points: [
          'Chlamydia & Gonorrhée (« Chaude-pisse ») : Brûlures intenses ou douleurs en urinant, écoulement anormal jaunâtre ou verdâtre au niveau du vagin, du pénis ou de l\'anus, douleurs au bas-ventre.',
          'Syphilis : Apparition d\'une petite plaie ou ulcération indolore (chancre) sur les organes génitaux, la bouche ou l\'anus, suivie parfois de taches sur la paume des mains ou la plante des pieds.',
          'Trichomonase : Pertes vaginales abondantes, mousseuses, verdâtres et malodorantes, démangeaisons intenses et picotements.',
          'Hépatite B : Virus très contagieux par voie sexuelle et sanguine, pouvant causer jaunisse, fatigue intense et cirrhose/cancer du foie (Vaccin très efficace disponible).',
          'Papillomavirus Humain (HPV) : Verrues génitales (crêtes de coq) ou lésions précancéreuses du col de l\'utérus (Dépistage par frottis/IVA recommandé).'
        ]
      },
      {
        heading: '2. Prise en charge médicale syndromique au Bénin',
        content: 'Les soignants des centres de santé béninois utilisent l\'approche syndromique qui permet de traiter immédiatement la cause de l\'infection sans attendre des jours d\'analyses coûteuses, avec des kits de médicaments subventionnés.'
      }
    ],
    practicalDo: [
      'Consulter immédiatement un médecin ou une sage-femme en cas d\'écoulement, de brûlure ou de lésion.',
      'Informer et faire traiter son ou ses partenaires en même temps.',
      'Utiliser le préservatif jusqu\'à la fin complète du traitement et disparition des symptômes.',
      'Faire un dépistage annuel complet si vous avez des partenaires multiples.'
    ],
    practicalDont: [
      'Ne pas acheter d\'antibiotiques de rue ou à la pharmacie sans examen médical.',
      'Ne pas arrêter son traitement dès la disparition des douleurs (aller jusqu\'au bout de l\'ordonnance).',
      'Ne pas avoir de rapports sexuels non protégés pendant la période de traitement.'
    ],
    emergencyContacts: [
      { name: 'Centres de Dépistage Volontaire (CDV)', phone: '112', role: 'Dépistage & Soins IST' },
      { name: 'Cliniques ABPF', phone: '+22921320011', role: 'Consultations IST anonymes' },
      { name: 'Ligne INF', phone: '114', role: 'Écoute & Orientation', tollFree: true }
    ]
  },
  {
    id: 'vih-tpe-guide',
    title: 'VIH / Sida, Dépistage & Traitement Post-Exposition (TPE 72h)',
    category: 'vih',
    categoryLabel: 'VIH / SIDA',
    badgeColor: 'bg-red-50 text-red-800 border-red-200',
    summary: 'Protocole d\'urgence vitale sous 72h (TPE gratuit), gratuité des ARV au Bénin (Loi 2005-31) et principe Indétectable = Intransmissible (I=I).',
    urgencyTimeline: 'URGENCE 72H pour débuter le TPE / PEP',
    legalReference: 'Loi n° 2005-31 & Directives du Programme National de Lutte contre le Sida (PNLS)',
    keyPoints: [
      'En cas d\'exposition au VIH (rapport non protégé, viol, piqûre), le TPE démarré sous 72h bloque la transmission dans près de 100% des cas.',
      'Le Traitement Post-Exposition (TPE) est 100% GRATUIT dans les hôpitaux publics et centres agréés au Bénin.',
      'Les traitements antirétroviraux (ARV) et les bilans de suivi sont totalement gratuits sur tout le territoire national.',
      'Une personne séropositive qui prend ses ARV correctement a une charge virale indétectable et NE TRANSMET PLUS le virus (I = I).'
    ],
    detailedSections: [
      {
        heading: '1. Le Traitement Post-Exposition (TPE / PEP) : L\'Urgence des 72 Heures',
        content: 'Le TPE est un traitement médicamenteux préventif d\'un mois (trithérapie ARV) à commencer le plus rapidement possible après un risque de contamination.',
        points: [
          'Délai d\'action : Idéalement dans les 4 à 24 premières heures, au grand maximum dans les 72 heures.',
          'Où l\'obtenir : Rendez-vous aux urgences du CNHU, de l\'HOMEL, des Centres Hospitaliers Départementaux (CHD), des hôpitaux de zone ou auprès de l\'ABPF.',
          'Durée du protocole : Prise quotidienne de 28 jours sans interruption.',
          'Examens inclus : Test rapide initial, bilan rénal/hépatique, contraception d\'urgence associée et sérologies de contrôle à 1 et 3 mois.'
        ]
      },
      {
        heading: '2. Le Dépistage Volontaire, Gratuit et Anonyme',
        content: 'Le test rapide d\'orientation diagnostique (TROD) se fait par une simple piqûre au bout du doigt. Le résultat est délivré en 15 minutes en toute confidentialité dans les Centres de Dépistage Volontaire (CDV).'
      },
      {
        heading: '3. Vivre avec le VIH au Bénin : Traitement ARV & Principe I = I',
        content: 'Le VIH est aujourd\'hui une affection chronique parfaitement contrôlée. Sous ARV régulier, la personne vit en excellente santé, étudie, travaille, se marie et a des enfants séronégatifs sans risque de transmission (Prévention de la Transmission Mère-Enfant - PTME).'
      }
    ],
    practicalDo: [
      'Courir aux urgences hospitalières dès qu\'un rapport à risque a eu lieu pour démarrer le TPE avant 72h.',
      'Faire un dépistage régulier pour connaître son statut en toute sérénité.',
      'Prendre ses ARV chaque jour à heure fixe si l\'on est diagnostiqué séropositif.',
      'Défendre son droit à la non-discrimination garanti par la Loi 2005-31.'
    ],
    practicalDont: [
      'Ne pas attendre la fin du weekend ou plusieurs jours avant de consulter après un risque VIH.',
      'Ne jamais interrompre le traitement TPE avant les 28 jours prescrits.',
      'Ne pas stigmatiser ou rejeter une personne séropositive (la salive, la sueur, les poignées de main et le partage de repas ne transmettent pas le VIH).'
    ],
    emergencyContacts: [
      { name: 'Urgences SAMU Bénin', phone: '112', role: 'Orientation TPE 24/7', tollFree: true },
      { name: 'Programme National PNLS', phone: '+22921330999', role: 'Prise en charge ARV gratuite' },
      { name: 'Ligne d\'Écoute INF', phone: '114', role: 'Accompagnement d\'urgence', tollFree: true }
    ]
  },
  {
    id: 'grossesse-maternite-guide',
    title: 'Grossesse, Maternité & Droits de la Femme Enceinte au Bénin',
    category: 'grossesse',
    categoryLabel: 'Grossesse',
    badgeColor: 'bg-purple-50 text-purple-800 border-purple-200',
    summary: 'Suivi prénatal (les 8 CPN), prévention de l\'éclampsie et du paludisme, gratuité de la césarienne et interdiction légale de renvoyer une élève enceinte.',
    urgencyTimeline: '1ère CPN avant la 12ème semaine de grossesse',
    legalReference: 'Code de l\'Enfant (Loi 2015-08 Art. 161) & Loi 2021-12',
    keyPoints: [
      'L\'Organisation Mondiale de la Santé et le Bénin recommandent 8 Consultations Prénatales (CPN) au cours de la grossesse.',
      'Il est strictement interdit par la loi béninoise de renvoyer ou d\'exclure une élève ou apprentie en raison d\'une grossesse (Art. 161).',
      'La césarienne est totalement GRATUITE dans les hôpitaux publics homologués en République du Bénin.',
      'En cas de grossesse en situation de détresse (scolaire, matérielle, morale), la Loi 2021-12 autorise l\'IVG sécurisée dans les 12 semaines.'
    ],
    detailedSections: [
      {
        heading: '1. Calendrier et Contenu des Consultations Prénatales (CPN 1 à 8)',
        content: 'Un suivi précoce évite les complications obstétricales pour la mère et le bébé.',
        points: [
          'CPN 1 (avant 12 semaines) : Détermination de l\'âge gestationnel, dépistage VIH/Syphilis/Hépatite B, bilan anémie et acide folique.',
          'CPN 2 (20 semaines) & CPN 3 (26 semaines) : Échographie morphologique, mesure de la tension artérielle et surveillance protéinurie.',
          'CPN 4 à 8 (30, 34, 36, 38 et 40 semaines) : Position du bébé, dépistage du paludisme gestationnel (MILD + TPI gratuit) et plan d\'accouchement.'
        ]
      },
      {
        heading: '2. Droits fondamentaux de la fille enceinte et scolarisée (Loi 2015-08)',
        content: 'L\'Article 161 du Code de l\'Enfant protège formellement les adolescentes : aucun chef d\'établissement scolaire ou patron d\'atelier ne peut refuser l\'accès aux cours à une fille enceinte. Elle a le droit de composer aux examens nationaux et de réintégrer sa classe après l\'accouchement.'
      },
      {
        heading: '3. Signes de danger absolu pendant la grossesse (Urgence 112)',
        content: 'Consultez immédiatement en urgence si vous ressentez : saignements vaginaux, violents maux de tête avec bourdonnements d\'oreille et œdèmes (risque d\'éclampsie), fièvre élevée, arrêt des mouvements du bébé ou perte des eaux prématurée.'
      }
    ],
    practicalDo: [
      'Débuter les consultations prénatales dès le premier retard de règles.',
      'Dormir chaque nuit sous une moustiquaire imprégnée (MILD) distribuée gratuitement.',
      'Prendre scrupuleusement le fer et l\'acide folique prescrits pour prévenir l\'anémie.',
      'Contacter le 114 ou le CPS si un établissement tente de vous exclure pour cause de grossesse.'
    ],
    practicalDont: [
      'Ne jamais pratiquer de travaux de force ou porter de lourdes charges en fin de grossesse.',
      'Ne prendre aucun médicament ou tisane sans l\'autorisation expresse d\'une sage-femme ou d\'un médecin.',
      'Ne pas accoucher à domicile sans assistance médicale qualifiée.'
    ],
    emergencyContacts: [
      { name: 'SAMU Urgences Maternelles', phone: '112', role: 'Transfert obstétrical d\'urgence', tollFree: true },
      { name: 'HOMEL Maternité Lagune', phone: '+22921301725', role: 'Hôpital Mère-Enfant Cotonou' },
      { name: 'Ligne Enfance en Danger', phone: '138', role: 'Protection des jeunes mères', tollFree: true }
    ]
  }
];

export const SAFETY_EMERGENCY_TIPS: SafetyEmergencyItem[] = [
  {
    id: 'agression-physique-benin',
    situation: 'agression',
    situationLabel: 'Agression Physique',
    title: 'Que faire en cas d\'Agression Physique au Bénin',
    badgeColor: 'bg-red-50 text-red-800 border-red-200',
    summary: 'Mise en sécurité immédiate, soins médicaux, obtention obligatoire du Certificat Médical Initial (CMI) avec ITT et dépôt de plainte auprès de la Police Républicaine.',
    urgentActionTimeline: 'Secours immédiats (117 / 112) & Soins d\'urgence',
    steps: [
      {
        stepNumber: 1,
        title: 'Se mettre immédiatement à l\'abri et alerter la Police (117)',
        description: 'Réfugiez-vous dans un lieu public, une boutique, une station-service ou chez des riverains. Appelez immédiatement la Police Républicaine au 117 en décrivant l\'agresseur et le lieu exact.',
        actionHighlight: 'Appel 117 (Gratuit 24/7)',
        iconType: 'Siren'
      },
      {
        stepNumber: 2,
        title: 'Se rendre aux urgences hospitalières publiques pour les soins',
        description: 'Rendez-vous dans un hôpital public (CNHU, CHD ou hôpital de zone). Faites soigner vos plaies et blessures sans attendre pour éviter toute complication vitale.',
        actionHighlight: 'Urgences CNHU / CHD',
        iconType: 'HeartPulse'
      },
      {
        stepNumber: 3,
        title: 'Exiger le Certificat Médical Initial (CMI) avec mention de l\'ITT',
        description: 'Le médecin légiste ou urgentiste doit rédiger le CMI constatant précisément toutes les ecchymoses, fractures ou traumatismes et fixant l\'Incapacité Totale de Travail (ITT) en jours.',
        actionHighlight: 'Pièce maîtresse du dossier judiciaire',
        iconType: 'FileText'
      },
      {
        stepNumber: 4,
        title: 'Déposer plainte au commissariat ou au parquet du procureur',
        description: 'Muni(e) du CMI et des photos des blessures, déposez plainte contre l\'agresseur. L\'Institut National de la Femme (INF au 114) et l\'Association des Femmes Juristes (AFJB) vous assignent un avocat gratuit.',
        actionHighlight: 'Assistance juridique gratuite',
        iconType: 'Scale'
      }
    ],
    legalProtectionsInBenin: {
      lawTitle: 'Code Pénal de la République du Bénin (Loi n° 2018-16)',
      articles: 'Articles 512 à 520 : Répression des Coups et Blessures Volontaires',
      penalties: 'Emprisonnement de 1 à 5 ans et fortes amendes. Peine portée à 10 ou 20 ans de réclusion criminelle si l\'agression entraîne une infirmité permanente ou a été commise en réunion/avec arme.',
      guaranteedRights: [
        'Prise en charge intégrale des frais médicaux aux dépens de l\'agresseur',
        'Droit à la réparation civile des préjudices corporels et moraux',
        'Protection policière contre les menaces ou tentatives de représailles'
      ]
    },
    evidenceAndPrecautions: [
      'Prendre des photos nettes en gros plan de toutes les plaies, hématomes et vêtements déchirés.',
      'Conserver soigneusement tous les reçus de pharmacie, ordonnances et radios médicales.',
      'Recueillir les numéros de téléphone et coordonnées des témoins oculaires de l\'agression.'
    ],
    contacts: [
      { name: 'Police Républicaine Secours', phone: '117', role: 'Intervention d\'urgence', tollFree: true },
      { name: 'SAMU Bénin', phone: '112', role: 'Secours médicaux blessés', tollFree: true },
      { name: 'Institut National de la Femme (INF)', phone: '114', role: 'Avocats & prise en charge', tollFree: true },
      { name: 'Sapeurs-Pompiers', phone: '118', role: 'Secours & transport', tollFree: true }
    ]
  },
  {
    id: 'harcelement-benin',
    situation: 'harcelement',
    situationLabel: 'Harcèlement & Cyberharcèlement',
    title: 'Que faire en cas de Harcèlement (Scolaire, Travail, Cyber) au Bénin',
    badgeColor: 'bg-orange-50 text-orange-800 border-orange-200',
    summary: 'Répression sévère du chantage aux notes, du harcèlement au travail et du chantage aux photos intimes sur Internet sous les Lois béninoises 2006-19 et 2017-20.',
    urgentActionTimeline: 'Alerter le 114 (INF) ou l\'OCRC (+229 21 31 77 77)',
    steps: [
      {
        stepNumber: 1,
        title: 'Conserver et archiver TOUTES les preuves matérielles',
        description: 'Faites des captures d\'écran complètes des messages WhatsApp, SMS, vocaux, emails, relevés de notes manipulés ou menaces. Ne supprimez aucun historique.',
        actionHighlight: 'Captures d\'écran avec date, heure et numéro',
        iconType: 'Lock'
      },
      {
        stepNumber: 2,
        title: 'Exprimer un refus clair et ne JAMAIS céder au chantage financier ou sexuel',
        description: 'Ne versez aucun centime et ne cédez à aucune contrainte. Le paiement n\'arrête jamais le maître-chanteur ; il l\'encourage à récidiver.',
        actionHighlight: 'Zéro tolérance, zéro paiement',
        iconType: 'Ban'
      },
      {
        stepNumber: 3,
        title: 'Saisir l\'Institut National de la Femme (INF au 114) et l\'autorité compétente',
        description: 'En milieu scolaire : alerte immédiate de l\'INF qui saisit le Ministère et protège vos notes. Au travail : saisine de l\'Inspection du Travail. En ligne : plainte auprès de l\'OCRC.',
        actionHighlight: 'Saisine sécurisée et anonymisée',
        iconType: 'Phone'
      },
      {
        stepNumber: 4,
        title: 'Déclenchement des sanctions disciplinaires et pénales',
        description: 'L\'auteur est immédiatement convoqué par les autorités judiciaires. Les notes sont réévaluées par un jury neutre et les contenus en ligne sont supprimés.',
        actionHighlight: 'Révocation & condamnation de l\'auteur',
        iconType: 'Scale'
      }
    ],
    legalProtectionsInBenin: {
      lawTitle: 'Loi n° 2006-19 (Harcèlement sexuel) & Loi n° 2017-20 (Code du Numérique)',
      articles: 'Loi 2006-19 Art. 10-15 & Code du Numérique Art. 550',
      penalties: 'Milieu scolaire/pro : 1 à 3 ans de prison ferme (peine portée à 5 ans pour un enseignant ou supérieur). Cyberharcèlement/Revenge porn : 2 à 5 ans de prison ferme et jusqu\'à 20 millions FCFA d\'amende.',
      guaranteedRights: [
        'Anonymat préservé lors de l\'enquête pour protéger l\'élève/employée',
        'Interdiction absolue de toute mesure de rétorsion scolaire ou de licenciement abusif',
        'Réquisition judiciaire d\'urgence pour blocage et suppression des contenus web'
      ]
    },
    evidenceAndPrecautions: [
      'Ne pas répondre aux insultes ou provocations du harceleur par écrit.',
      'Exporter et sauvegarder les conversations sur une clé USB ou un drive externe sécurisé.',
      'Contacter un psychologue de l\'INF pour être soutenu(e) moralement.'
    ],
    contacts: [
      { name: 'Institut National de la Femme (INF)', phone: '114', role: 'Guichet unique harcèlement', tollFree: true },
      { name: 'Office Central Cybercriminalité (OCRC)', phone: '+22921317777', role: 'Brigade cyber & chantage intime' },
      { name: 'Inspection Générale du Travail', phone: '+22921312345', role: 'Harcèlement professionnel' },
      { name: 'Ligne 138 (Enfance en Danger)', phone: '138', role: 'Élèves & mineurs', tollFree: true }
    ]
  },
  {
    id: 'viol-vbg-benin',
    situation: 'viol',
    situationLabel: 'Viol & Violences Sexuelles',
    title: 'Que faire en cas de Viol ou d\'Agression Sexuelle (Protocole 72h)',
    badgeColor: 'bg-rose-50 text-rose-800 border-rose-200',
    summary: 'Protocole d\'urgence vitale sous 72h : soins médicaux, TPE anti-VIH gratuit, pilule du lendemain, certificat médical CMI sans frais et sanctions criminelles maximales.',
    urgentActionTimeline: 'URGENCE MÉDICALE VITALE : Moins de 72h (idéalement < 24h)',
    steps: [
      {
        stepNumber: 1,
        title: 'Se mettre en lieu sûr sans se laver ni changer de vêtements',
        description: 'Pour préserver les traces d\'ADN indispensables pour confondre l\'agresseur en justice : NE PAS se doucher, ne pas se laver les dents, ne pas nettoyer les vêtements et les placer dans un sac propre.',
        actionHighlight: 'Préservation des preuves médico-légales',
        iconType: 'ShieldAlert'
      },
      {
        stepNumber: 2,
        title: 'Consulter d\'URGENCE dans les 72h aux urgences hospitalières',
        description: 'Administration immédiate et GRATUITE de la Prophylaxie Post-Exposition (TPE) anti-VIH pour bloquer le virus, de la contraception d\'urgence (pilule du lendemain) et d\'antibiotiques contre les IST.',
        actionHighlight: 'Prise en charge médicale 100% Gratuite',
        iconType: 'HeartPulse'
      },
      {
        stepNumber: 3,
        title: 'Délivrance immédiate du Certificat Médical Initial (CMI) gratuit',
        description: 'Le médecin urgentiste examine la victime avec bienveillance et établit sans avance de frais le certificat médical constatant les violences subies et le traumatisme psychique.',
        actionHighlight: 'Certificat légal sans avance de frais',
        iconType: 'FileText'
      },
      {
        stepNumber: 4,
        title: 'Appeler le 114 (INF) et déposer plainte pour arrestation de l\'auteur',
        description: 'L\'INF mandate immédiatement une avocate pour accompagner la victime au commissariat et devant le juge d\'instruction. Le viol est un crime jugé en Cour d\'Assises/Chambre Criminelle.',
        actionHighlight: 'Poursuites criminelles prioritaires',
        iconType: 'Scale'
      }
    ],
    legalProtectionsInBenin: {
      lawTitle: 'Loi n° 2011-26 (Violences Faites aux Femmes) & Code Pénal Béninois',
      articles: 'Articles 545 à 555 du Code Pénal & Loi 2021-12 (Art. 17 : IVG autorisée sur grossesse issue de viol)',
      penalties: '5 à 20 ans de réclusion criminelle ferme. Réclusion à perpétuité si la victime est mineure ou si le viol a entraîné la mort ou une mutilation.',
      guaranteedRights: [
        'Droit à l\'IVG médicamenteuse ou chirurgicale sécurisée sans délai si grossesse issue de viol (Loi 2021-12)',
        'Accompagnement psychologique gratuit de long terme',
        'Prise en charge complète par le fonds de soutien aux victimes de VBG'
      ]
    },
    evidenceAndPrecautions: [
      'Garder les vêtements portés lors de l\'agression dans un sac en papier ou tissu propre.',
      'Ne pas effacer les messages, appels ou menaces de l\'agresseur.',
      'Ne jamais rester seule : se faire épauler par un proche de confiance ou les médiateurs de l\'INF.'
    ],
    contacts: [
      { name: 'Institut National de la Femme (INF)', phone: '114', role: 'Intervention VBG 24/7', tollFree: true },
      { name: 'Police Républicaine', phone: '117', role: 'Arrestation criminelle', tollFree: true },
      { name: 'SAMU Urgences Médicales', phone: '112', role: 'TPE VIH d\'urgence', tollFree: true },
      { name: 'Association des Femmes Juristes (AFJB)', phone: '+22921315298', role: 'Avocats des victimes' }
    ]
  },
  {
    id: 'mariage-force-benin',
    situation: 'mariage_force',
    situationLabel: 'Mariage Forcé & Mariage d\'Enfant',
    title: 'Que faire en cas de Mariage Forcé ou Mariage d\'Enfant au Bénin',
    badgeColor: 'bg-indigo-50 text-indigo-800 border-indigo-200',
    summary: 'Âge légal fixé à 18 ans révolus au Bénin. Nullité absolue d\'ordre public de toute union de mineure, interdiction des dots et poursuites pénales contre les familles et célébrants.',
    urgentActionTimeline: 'Alerter le 114 (INF), le 138 (Enfance) ou le 117',
    steps: [
      {
        stepNumber: 1,
        title: 'Alerter immédiatement la Ligne 114 (INF) ou le 138 (Enfance en danger)',
        description: 'Dès les premières rumeurs de fiançailles, de versement de dot ou de date de célébration fixée par la famille, signalez la situation. L\'alerte peut être donnée par la victime, une amie ou un enseignant.',
        actionHighlight: 'Alerte gratuite et anonyme',
        iconType: 'Phone'
      },
      {
        stepNumber: 2,
        title: 'Intervention d\'urgence du Procureur de la République et du Juge des Mineurs',
        description: 'Le procureur émet une ordonnance d\'interdiction formelle de célébration et convoque les parents, le prétendant et les chefs coutumiers/religieux.',
        actionHighlight: 'Ordonnance judiciaire d\'interdiction',
        iconType: 'Scale'
      },
      {
        stepNumber: 3,
        title: 'Placement temporaire en lieu sûr si des menaces existent',
        description: 'Si la jeune fille subit des pressions, des menaces d\'enlèvement ou de violences à domicile, elle est immédiatement mise à l\'abri dans un centre d\'accueil sécurisé agréé.',
        actionHighlight: 'Hébergement & protection physique',
        iconType: 'ShieldCheck'
      },
      {
        stepNumber: 4,
        title: 'Si le mariage a déjà eu lieu : Annulation d\'ordre public & Réintégration',
        description: 'Le tribunal prononce la nullité absolue du mariage. La cohabitation forcée est assimilée à un viol sur mineure et réprimée criminellement. La jeune fille est réintégrée à l\'école ou en apprentissage.',
        actionHighlight: 'Annulation de plein droit & Retour à l\'école',
        iconType: 'GraduationCap'
      }
    ],
    legalProtectionsInBenin: {
      lawTitle: 'Code de l\'Enfant en République du Bénin (Loi n° 2015-08)',
      articles: 'Articles 123 & 124 (Âge nubile = 18 ans révolus) & Code Pénal',
      penalties: '1 à 3 ans de prison ferme et fortes amendes pour les parents, le prétendant et les célébrants religieux ou traditionnels. Réclusion criminelle pour viol si rapports sexuels imposés.',
      guaranteedRights: [
        'Droit imprescriptible de refuser toute union non consentie',
        'Nullité absolue de toute dot ou contrat matrimonial coutumier',
        'Bourse d\'études et soutien du Centre de Promotion Sociale (CPS) pour poursuivre sa formation'
      ]
    },
    evidenceAndPrecautions: [
      'Indiquer aux autorités les noms, adresses et numéros des parents et du prétendant.',
      'Préciser la date et le lieu prévus pour la cérémonie coutumière ou religieuse.',
      'Ne pas céder aux pressions familiales sous prétexte de « tradition » : la loi de la République prime sur toute coutume.'
    ],
    contacts: [
      { name: 'Ligne Nationale INF', phone: '114', role: 'Protection des jeunes filles', tollFree: true },
      { name: 'Ligne Enfance en Danger', phone: '138', role: 'Secours aux mineurs 24/7', tollFree: true },
      { name: 'Police Républicaine', phone: '117', role: 'Intervention de police', tollFree: true },
      { name: 'Plan International Bénin', phone: '+22921302222', role: 'Fin du mariage des enfants' }
    ]
  }
];
