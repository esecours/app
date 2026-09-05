export interface LegalFrameworkItem {
  id: string;
  title: string;
  lawRef: string;
  promulgationDate: string;
  category: 'Législation Nationale' | 'Protection des Femmes' | 'Protection des Enfants' | 'Santé Publique' | 'Traités Internationaux';
  summary: string;
  keyArticles: {
    number: string;
    heading: string;
    content: string;
    implication: string;
  }[];
  rightsAndGuarantees: string[];
  medicalProcedures?: string[];
  sanctions?: string[];
  practicalAdvice: string;
  badgeColor: string;
}

export interface YouthOrganizationItem {
  id: string;
  name: string;
  sigle: string;
  category: 'OSC Jeunes' | 'Réseau Jeunesse' | 'ONG de Santé Reproductive' | 'Assistance Juridique & Droits' | 'Institution & Appui Public';
  tagline: string;
  // Qui fait Quoi, Quand et Comment ?
  qui: {
    target: string;
    actors: string;
    coverage: string;
  };
  quoi: {
    coreMissions: string[];
    servicesOffered: string[];
    thematics: string[];
  };
  quand: {
    availability: string;
    keyMoments: string[];
  };
  comment: {
    methodologies: string[];
    channels: string[];
  };
  impactActivities: {
    title: string;
    description: string;
    metrics?: string;
  }[];
  contacts: {
    phone?: string;
    alternatePhone?: string;
    tollFree?: string;
    whatsapp?: string;
    email?: string;
    address?: string;
    headquarters?: string;
    branches?: string[];
    website?: string;
  };
  badgeColor: string;
}

export const BENIN_SSR_LEGAL_FRAMEWORK: LegalFrameworkItem[] = [
  {
    id: 'loi-2021-12-ssr-ivg',
    title: 'Loi sur la Santé Sexuelle, la Reproduction et l’IVG Sécurisée',
    lawRef: 'Loi n° 2021-12 du 20 décembre 2021',
    promulgationDate: '20 Décembre 2021 (Modifiant la loi 2003-04)',
    category: 'Législation Nationale',
    summary: 'Cadre législatif modernisant la santé sexuelle et reproductive au Bénin, garantissant l’accès universel aux soins, à la contraception et autorisant l’interruption volontaire de grossesse (IVG) sécurisée sous conditions définies.',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    keyArticles: [
      {
        number: 'Article 17 Nouveau (Alinéa 1 & 2)',
        heading: 'Conditions d\'accès à l\'IVG Sécurisée (Délai de 12 semaines)',
        content: 'L\'interruption volontaire de grossesse est autorisée sur demande de la femme enceinte lorsque la grossesse est susceptible d\'aggraver ou d\'occasionner une situation de détresse matérielle, éducationnelle, professionnelle ou morale incompatible avec l\'intérêt de la femme et/ou de l\'enfant à naître, jusqu\'à douze (12) semaines d\'aménorrhée.',
        implication: 'Toute femme ou jeune fille béninoise en détresse peut solliciter légalement une IVG sécurisée dans les 12 premières semaines sans risque de poursuite pénale.'
      },
      {
        number: 'Article 17 Nouveau (Alinéa 3)',
        heading: 'Exceptions Médicales et Situations Particulières (Sans limite de 12 semaines)',
        content: 'L\'interruption de grossesse peut avoir lieu à tout moment : 1° Si la poursuite de la grossesse met en péril la vie et la santé de la femme ; 2° S\'il existe une forte probabilité que l\'enfant à naître soit atteint d\'une affection d\'une gravité exceptionnelle ; 3° Si la grossesse résulte d\'un viol ou d\'une relation incestueuse.',
        implication: 'En cas de viol, inceste ou motif médical grave, l\'intervention médicale est protégée et prise en charge sans la contrainte du délai strict des 12 semaines.'
      },
      {
        number: 'Article 17-1 Nouveau',
        heading: 'Pratique Médicale & Lieux Agréés',
        content: 'L\'interruption volontaire de grossesse ne peut être pratiquée que par un médecin ou sous sa responsabilité par un personnel de santé qualifié dans les formations sanitaires publiques ou privées agréées par le Ministère de la Santé.',
        implication: 'Interdiction absolue des avortements clandestins non médicalisés. L\'acte doit se faire dans un cadre clinique sécurisé avec plateau technique adéquat.'
      },
      {
        number: 'Article 17-2 Nouveau',
        heading: 'Clause de Conscience & Obligation Déontologique d\'Orientation',
        content: 'Aucun médecin ni auxiliaire médical n\'est tenu de pratiquer une IVG s\'il s\'y refuse pour des motifs de conscience. Toutefois, il a l\'obligation légale et déontologique stricte d\'en informer immédiatement la patiente et de l\'orienter sans délai vers un praticien ou centre habilité.',
        implication: 'Le soignant peut refuser pour conviction personnelle, mais il est pénalement et disciplinairement punissable s\'il bloque ou abandonne la patiente sans la réorienter.'
      }
    ],
    rightsAndGuarantees: [
      'Droit au consentement libre, éclairé et confidentiel pour tout acte de santé reproductive.',
      'Droit d’accès aux méthodes contraceptives modernes dans toutes les formations sanitaires.',
      'Secret médical absolu : les prestataires de santé sont soumis au secret professionnel le plus strict.',
      'Accès aux soins d\'urgence après avortement (SAA) sans discrimination ni stigmatisation.',
      'Prise en charge psychosociale et accompagnement médical post-intervention.'
    ],
    medicalProcedures: [
      '1. Consultation initiale : Évaluation de l’âge gestationnel (échographie ou examen clinique) et conseil pré-procédural.',
      '2. Consentement écrit : Signature du protocole par la femme (ou autorisation d’un représentant légal si mineure non émancipée).',
      '3. Choix de la méthode : Médicamenteuse (selon protocoles OMS/Ministère de la Santé) ou par aspiration manuelle intra-utérine (AMIU).',
      '4. Suivi post-procédural & Offre contraceptive : Visite de contrôle à 14 jours et proposition d\'une contraception adaptée.'
    ],
    sanctions: [
      'Emprisonnement et amendes lourdes pour toute personne non qualifiée réalisant un avortement clandestin.',
      'Sanctions disciplinaires et pénales contre tout praticien refusant d\'orienter une patiente en détresse.'
    ],
    practicalAdvice: 'En cas de besoin, contactez immédiatement l’Institut National de la Femme (INF au 114) ou rendez-vous dans un centre de santé public / clinique ABPF agréée pour un entretien d’orientation sécurisé et confidentiel.'
  },
  {
    id: 'loi-2011-26-vbg-femmes',
    title: 'Loi Portant Prévention et Répression des Violences Faites aux Femmes',
    lawRef: 'Loi n° 2011-26 du 09 janvier 2012',
    promulgationDate: '09 Janvier 2012',
    category: 'Protection des Femmes',
    summary: 'Régime protecteur global réprimant toutes les formes de violences physiques, sexuelles, psychologiques, morales, économiques et patrimoniales à l’encontre des femmes et des filles au Bénin.',
    badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
    keyArticles: [
      {
        number: 'Article 3',
        heading: 'Définition des Violences Basées sur le Genre (VBG)',
        content: 'Constitue une violence toute atteinte physique, acte d\'agression sexuelle, viol, harcèlement sexuel en milieu éducatif ou professionnel, mutilation génitale féminine (MGF), mariage forcé ou privation de ressources financières.',
        implication: 'Protection intégrale de la femme dans l’espace public, familial, scolaire et professionnel.'
      },
      {
        number: 'Articles 18 à 25',
        heading: 'Répression du Viol et du Harcèlement Sexuel',
        content: 'Le viol est puni de 5 à 10 ans de réclusion criminelle, et jusqu’à 20 ans lorsque commis sur mineure, par un ascendant ou par une personne ayant autorité (enseignant, employeur). Le harcèlement sexuel fait l’objet de sanctions pénales directes.',
        implication: 'Tolérance zéro pour les abus sexuels, notamment en milieu scolaire et universitaire.'
      },
      {
        number: 'Article 33',
        heading: 'Gratuité de la Prise en Charge Médicale et du Certificat',
        content: 'Toute victime de viol ou de violence sexuelle a droit à la délivrance immédiate et gratuite d’un certificat médical constatant les lésions et à une prise en charge médicale d’urgence (pilule du lendemain, prophylaxie post-exposition VIH, soins traumatologiques).',
        implication: 'Aucun frais ne peut être exigé d\'une victime pour constater un viol ou recevoir la trithérapie d\'urgence.'
      }
    ],
    rightsAndGuarantees: [
      'Délivrance gratuite et obligatoire du certificat médical par tout médecin assermenté.',
      'Accès immédiat à la Prophylaxie Post-Exposition (PEP) anti-VIH dans les 72h suivant l’agression.',
      'Possibilité de porter plainte directement auprès de la Police Républicaine (117) ou de l\'INF (114).',
      'Assistance judiciaire gratuite pour les victimes démunies via les Centres de Promotion Sociale (CPS).'
    ],
    sanctions: [
      '5 à 20 ans de prison ferme pour viol et agression sexuelle aggravée.',
      '1 à 3 ans d\'emprisonnement et exclusion professionnelle pour harcèlement sexuel en milieu scolaire/académique.'
    ],
    practicalAdvice: 'Après une agression sexuelle : ne pas se laver, ne pas changer de vêtements si possible, et se rendre dans les 72 heures au centre de santé le plus proche ou appeler le 114 pour bénéficier de la prophylaxie VIH et de la contraception d\'urgence.'
  },
  {
    id: 'loi-2015-08-code-enfant',
    title: 'Code de l’Enfant en République du Bénin',
    lawRef: 'Loi n° 2015-08 du 23 janvier 2015',
    promulgationDate: '23 Janvier 2015',
    category: 'Protection des Enfants',
    summary: 'Ensemble des dispositions garantissant les droits fondamentaux de l’enfant (moins de 18 ans), interdisant le mariage des enfants, protégeant contre l’exploitation sexuelle et garantissant la scolarisation des filles enceintes.',
    badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    keyArticles: [
      {
        number: 'Article 123 & 124',
        heading: 'Interdiction Formelle du Mariage et des Fiançailles d\'Enfants',
        content: 'L\'âge légal du mariage est fixé à 18 ans révolus pour les filles comme pour les garçons. Tout mariage coutumier, religieux ou civil impliquant un mineur de moins de 18 ans est nul et puni de peines d\'emprisonnement ferme.',
        implication: 'Fin des mariages précoces forcés. Les parents, complices et célébrants sont tous passibles de peines pénales.'
      },
      {
        number: 'Articles 156 à 160',
        heading: 'Grossesses Précoces en Milieu Scolaire et Sanctions des Auteurs',
        content: 'Toute personne majeure qui engrossera une mineure scolarisée ou en apprentissage est punie de peines d\'emprisonnement de 1 à 3 ans et d\'amendes. La peine est portée à 5 ans si l\'auteur est un enseignant, formateur ou tuteur.',
        implication: 'Protection accrue des élèves et apprenties contre les abus de pouvoir de leurs enseignants ou maîtres de stage.'
      },
      {
        number: 'Article 161',
        heading: 'Maintien de la Fille Enceinte dans le Système Éducatif',
        content: 'Il est formellement interdit d’exclure, de renvoyer ou de discriminer une élève ou apprentie en raison de son état de grossesse. Elle a le droit de poursuivre ses études et de réintégrer son établissement après l’accouchement.',
        implication: 'Garantie légale du droit à l\'éducation pour toutes les jeunes mères.'
      }
    ],
    rightsAndGuarantees: [
      'Droit absolu à l’éducation et au maintien scolaire même en cas de maternité précoce.',
      'Droit à l’intégrité corporelle (interdiction des châtiments corporels et des mutilations génitales).',
      'Assistance sociale d’office par le Centre de Promotion Sociale (CPS) de la commune.',
      'Ligne d’assistance dédiée à l’enfance en détresse : numéro vert 138 / 160.'
    ],
    practicalAdvice: 'Pour dénoncer un mariage d\'enfant, un abus en milieu scolaire ou une exclusion injustifiée, composez le numéro gratuit 138 (Enfance en danger) ou contactez le CPS de votre arrondissement.'
  },
  {
    id: 'loi-2005-31-vih-sida',
    title: 'Loi sur la Prévention, Prise en Charge et Contrôle du VIH/SIDA',
    lawRef: 'Loi n° 2005-31 du 10 avril 2006',
    promulgationDate: '10 Avril 2006',
    category: 'Santé Publique',
    summary: 'Cadre légal consacrant la gratuité des traitements ARV, la confidentialité du dépistage, la protection contre la stigmatisation et le droit aux soins de santé reproductive pour les personnes vivant avec le VIH.',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    keyArticles: [
      {
        number: 'Article 8',
        heading: 'Gratuité Universelle du Traitement Antirétroviral (ARV)',
        content: 'Le dépistage, les bilans de suivi biologique et les médicaments antirétroviraux (ARV) sont gratuits sur toute l’étendue du territoire national béninois.',
        implication: 'Aucun paiement n’est requis pour accéder au traitement salvateur contre le VIH au Bénin.'
      },
      {
        number: 'Articles 14 & 22',
        heading: 'Dépistage Volontaire et Confidentialité Absolue',
        content: 'Nul ne peut être contraint à un test VIH sans son consentement libre et éclairé (sauf cas judiciaires spécifiques). La divulgation non autorisée du statut sérologique est un délit sévèrement puni.',
        implication: 'Protection totale contre les tests imposés à l’embauche ou à l’inscription scolaire.'
      }
    ],
    rightsAndGuarantees: [
      'Accès gratuit aux programmes de Prévention de la Transmission Mère-Enfant (PTME).',
      'Non-discrimination à l’emploi, au logement, à l’école et dans les soins de santé.',
      'Accès aux préservatifs masculins et féminins subventionnés ou gratuits dans les centres publics.'
    ],
    practicalAdvice: 'Faites un dépistage régulier dans un centre de santé ou auprès des cliniques de l’ABPF. En cas de séropositivité, la prise en charge immédiate permet une charge virale indétectable et une vie saine sans transmission (I = I : Indétectable = Intransmissible).'
  },
  {
    id: 'traites-internationaux-maputo',
    title: 'Engagements Internationaux & Protocole de Maputo',
    lawRef: 'Protocole de Maputo (Article 14) & CEDEF / CEDAW',
    promulgationDate: 'Ratifié par la République du Bénin',
    category: 'Traités Internationaux',
    summary: 'Instruments juridiques régionaux et mondiaux ratifiés par le Bénin, engageant l’État à respecter, promouvoir et garantir les droits sexuels et reproductifs des femmes et des jeunes.',
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
    keyArticles: [
      {
        number: 'Article 14 du Protocole de Maputo',
        heading: 'Droit à la Santé et au Contrôle de la Fécondité',
        content: 'Les États parties s’engagent à garantir le droit des femmes à contrôler leur fécondité, à choisir leurs méthodes contraceptives, à être protégées contre les IST/VIH et à autoriser l’avortement médicalisé dans les cas prévus.',
        implication: 'Le Bénin aligne sa législation interne avec les standards africains les plus progressistes.'
      }
    ],
    rightsAndGuarantees: [
      'Garantie de l’Éducation Complète à la Sexualité (ECS) adaptée aux âges.',
      'Protection contre toutes les pratiques traditionnelles néfastes.',
      'Accès aux services de santé de qualité sans barrière financière.'
    ],
    practicalAdvice: 'Les traités ratifiés ont une valeur supérieure aux lois ordinaires selon la Constitution béninoise du 11 décembre 1990.'
  },
  {
    id: 'loi-2006-19-harcelement-sexuel',
    title: 'Loi Portant Répression du Harcèlement Sexuel et Protection des Victimes',
    lawRef: 'Loi n° 2006-19 du 05 septembre 2006',
    promulgationDate: '05 Septembre 2006',
    category: 'Protection des Femmes',
    summary: 'Cadre légal réprimant sévèrement toute forme de harcèlement sexuel, de chantage aux notes (scolaire et universitaire) ou de chantage à l’emploi au Bénin.',
    badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
    keyArticles: [
      {
        number: 'Article 2 & 3',
        heading: 'Définition du Harcèlement Sexuel',
        content: 'Le fait pour quiconque d’abuser de l’autorité que lui confèrent ses fonctions dans le but d’obtenir des faveurs sexuelles, par des ordres, des menaces, des contraintes ou des pressions graves.',
        implication: 'Interdiction absolue du chantage sexuel par les enseignants, directeurs, employeurs ou maîtres de stage.'
      },
      {
        number: 'Articles 10 à 15',
        heading: 'Sanctions Pénales et Circonstances Aggravantes',
        content: 'Le harcèlement sexuel est puni de 1 à 3 ans d’emprisonnement et d’amendes. La peine est doublée (jusqu’à 5 ans) si la victime est mineure ou si l’auteur est un enseignant ou employeur direct.',
        implication: 'Révocation de la fonction publique ou du milieu universitaire en plus de l’emprisonnement ferme.'
      }
    ],
    rightsAndGuarantees: [
      'Protection intégrale contre les représailles scolaires, universitaires ou professionnelles.',
      'Possibilité de saisine directe et anonymisée de l’Institut National de la Femme (INF au 114).',
      'Assistance juridique gratuite pour la constitution de partie civile.'
    ],
    practicalAdvice: 'Conservez toutes les preuves matérielles (messages WhatsApp, SMS, enregistrements vocaux, emails, témoignages) et alertez sans tarder le 114.'
  },
  {
    id: 'loi-2017-20-code-numerique-cyberharcelement',
    title: 'Code du Numérique (Répression du Cyberharcèlement et Chantage Intime)',
    lawRef: 'Loi n° 2017-20 du 20 avril 2018',
    promulgationDate: '20 Avril 2018 (Modifiée en 2020)',
    category: 'Protection des Femmes',
    summary: 'Répression rigoureuse des infractions numériques : diffusion non consentie d’images intimes (revenge porn), harcèlement en ligne, menaces et chantage sur les réseaux sociaux.',
    badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    keyArticles: [
      {
        number: 'Articles 550 & 560',
        heading: 'Atteinte à l’Intimité et Diffusion de Contenus Sexuels Non Consentis',
        content: 'Toute captation, enregistrement ou transmission de paroles ou d’images intimes sans le consentement de la personne est puni de 2 à 5 ans de prison ferme et de fortes amendes.',
        implication: 'L’auteur de chantage ou de diffusion de photos intimes est directement traqué par l’Office Central de Répression de la Cybercriminalité (OCRC Bénin).'
      }
    ],
    rightsAndGuarantees: [
      'Suppression et blocage d’urgence des contenus compromettants ordonnés par réquisition judiciaire.',
      'Dépôt de plainte direct auprès de l’OCRC (Cotonou) ou des commissariats de police.',
      'Soutien psychologique d’urgence pour prévenir la détresse.'
    ],
    practicalAdvice: 'Ne versez aucun argent et ne cédez à aucun chantage. Faites des captures d’écran avec les identifiants/numéros et contactez immédiatement l’OCRC (+229 21 31 77 77) et l’INF (114).'
  },
  {
    id: 'cadre-national-contraception-ssr',
    title: 'Politique et Protocoles Nationaux de Santé de la Reproduction (Contraception & IST)',
    lawRef: 'Normes et Protocoles du Ministère de la Santé du Bénin',
    promulgationDate: 'Actualisé en conformité avec la Loi 2021-12',
    category: 'Santé Publique',
    summary: 'Directives nationales garantissant l’accès confidentiel aux méthodes contraceptives modernes, à la contraception d’urgence, au dépistage et traitement des IST et à la Prophylaxie Post-Exposition (TPE) au VIH.',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    keyArticles: [
      {
        number: 'Norme Contraceptive 01',
        heading: 'Accès Universel et Libre Choix Éclairé',
        content: 'Toute personne, y compris les adolescentes et jeunes, a le droit d’accéder sans entrave à la méthode contraceptive de son choix (pilule, implant, DIU, injectable, préservatifs) avec conseil personnalisé sans obligation d’accord parental ou marital.',
        implication: 'Les centres de santé et cliniques ABPF dispensent les méthodes en toute confidentialité.'
      },
      {
        number: 'Protocole d’Urgence TPE & Pilule du Lendemain',
        heading: 'Fenêtre Thérapeutique des 72 Heures',
        content: 'En cas de rapport non protégé ou d’agression, la contraception d’urgence et le Traitement Post-Exposition (TPE) anti-VIH doivent être administrés dans les 72 heures au plus tard (idéalement dans les 24h). Le TPE est gratuit dans les hôpitaux publics.',
        implication: 'Prise en charge préventive vitale et gratuite disponible en urgence 24/7.'
      }
    ],
    rightsAndGuarantees: [
      'Secret médical et confidentialité absolue lors des consultations de planification familiale.',
      'Traitement syndromique gratuit ou à tarif modique des IST dans les centres publics.',
      'Approvisionnement continu en préservatifs et contraceptifs dans les 77 communes.'
    ],
    practicalAdvice: 'Consultez dès l’apparition de symptômes (brûlures, pertes inhabituelles, boutons) et traitez toujours simultanément les deux partenaires pour éviter la réinfection.'
  }
];

export const BENIN_YOUTH_SSR_ORGANIZATIONS: YouthOrganizationItem[] = [
  {
    id: 'abpf-benin',
    name: 'Association Béninoise pour la Promotion de la Famille',
    sigle: 'ABPF (Membre IPPF)',
    category: 'ONG de Santé Reproductive',
    tagline: 'Leader historique de la santé sexuelle, reproductive et des droits des jeunes au Bénin depuis 1972.',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    qui: {
      target: 'Adolescents et jeunes (10-24 ans), femmes en âge de procréer, populations vulnérables et vivant en zones périurbaines/rurales.',
      actors: 'Médecins spécialistes, sages-femmes d’État, psychologues, pairs éducateurs jeunes certifiés, juristes bénévoles.',
      coverage: 'Présence nationale avec cliniques et antennes dans les 12 départements (Cotonou, Porto-Novo, Parakou, Abomey, Lokossa, Natitingou, Kandi, etc.).'
    },
    quoi: {
      coreMissions: [
        'Offre de services intégrés en Santé Sexuelle et Reproductive (SSR) adaptés aux jeunes.',
        'Mise en œuvre sécurisée de l\'IVG dans le cadre strict de la loi 2021-12.',
        'Distribution de méthodes contraceptives modernes (implants, DIU, injectables, pilules, préservatifs).',
        'Éducation Complète à la Sexualité (ECS) en milieu scolaire et communautaire.',
        'Dépistage et traitement des Infections Sexuellement Transmissibles (IST) et du VIH.',
        'Prise en charge médico-psychologique des victimes de Violences Basées sur le Genre (VBG).'
      ],
      servicesOffered: [
        'Consultations gynécologiques et obstétricales à tarifs sociaux.',
        'Centres d\'écoute et d\'information conviviaux "Jeunes pour Jeunes".',
        'Échographies obstétricales et bilans de santé reproductive.',
        'Soins après avortement (SAA) et conseils post-procédure.'
      ],
      thematics: ['Planification Familiale', 'IVG Sécurisée', 'Santé Menstruelle', 'VIH/IST', 'VBG', 'Plaidoyer Droits SSR']
    },
    quand: {
      availability: 'Cliniques ouvertes du Lundi au Vendredi (8h00 - 18h00) et Samedi (8h00 - 13h00). Urgences et écoute téléphonique 6j/7.',
      keyMoments: [
        'Caravanes foraines pendant les vacances scolaires (Juillet - Août).',
        'Campagnes de dépistage et de sensibilisation pour la Journée Mondiale de lutte contre le SIDA (1er Décembre).',
        'Quinzaine de la Santé Sexuelle et Reproductive et rentrées universitaires.'
      ]
    },
    comment: {
      methodologies: [
        'Modèle des Espaces Conviviaux Jeunes (centres sans jugement où les jeunes parlent librement).',
        'Approche d\'éducation par les pairs (jeunes formateurs parlant aux jeunes dans leur langage).',
        'Cliniques mobiles se déplaçant dans les marchés, gares routières et collèges ruraux.',
        'Plateforme d\'orientation numérique et lignes d\'écoute confidentielles.'
      ],
      channels: ['Cliniques fixes', 'Caravanes mobiles', 'Clubs scolaires', 'Réseaux sociaux', 'WhatsApp', 'Radio communautaires']
    },
    impactActivities: [
      {
        title: 'Mouvement d\'Action des Jeunes (MAJ/ABPF)',
        description: 'Réseau de plus de 2 000 jeunes pairs éducateurs mobilisés à travers le pays pour animer des causeries éducatives, distribuer des préservatifs et référer les jeunes vers les cliniques.',
        metrics: '+150 000 jeunes sensibilisés chaque année'
      },
      {
        title: 'Cliniques Jeunes Conviviales',
        description: 'Mise en place de 8 cliniques spécialisées "Youth-Friendly" où le personnel soignant est formé à l’accueil bienveillant des adolescents sans jugement moral.',
        metrics: '95% de satisfaction usagers'
      },
      {
        title: 'Appui à l\'opérationnalisation de la Loi IVG 2021-12',
        description: 'Formation continue de prestataires de soins publics et privés sur les protocoles médicaux d\'IVG sécurisée et soins post-avortement.',
        metrics: '+500 soignants formés'
      }
    ],
    contacts: {
      phone: '+229 21 32 18 53',
      alternatePhone: '+229 97 97 10 50',
      tollFree: 'Ligne Écoute Jeunes',
      whatsapp: '+229 95 00 24 24',
      email: 'contact@abpf.org',
      headquarters: 'Siège National ABPF, Rue 390 Boulevard Saint-Michel, Cotonou, Bénin',
      branches: ['Clinique Cotonou Gbégamey', 'Clinique Porto-Novo', 'Clinique Parakou Zongo', 'Clinique Abomey', 'Clinique Lokossa', 'Clinique Natitingou'],
      website: 'https://www.abpf.org'
    }
  },
  {
    id: 'ceradis-benin',
    name: 'Centre de Réflexion et d’Action pour le Développement Intégré et la Solidarité',
    sigle: 'CeRADIS ONG',
    category: 'ONG de Santé Reproductive',
    tagline: 'Acteur majeur du plaidoyer en santé communautaire, SSR des adolescents et autonomisation des jeunes.',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    qui: {
      target: 'Adolescents scolarisés et non-scolarisés, jeunes filles mères, orphelins et enfants vulnérables (OEV), leaders communautaires.',
      actors: 'Sociologues, experts en santé publique, pairs éducateurs communautaires, animateurs de terrain.',
      coverage: 'Couverture stratégique dans les départements de l\'Atlantique, Littoral, Ouémé, Plateau, Zou et Collines.'
    },
    quoi: {
      coreMissions: [
        'Plaidoyer pour l’application effective des lois sur la santé de la reproduction et les VBG.',
        'Prévention des grossesses précoces en milieu d’apprentissage et dans les collèges.',
        'Promotion de la santé menstruelle et distribution de kits d’hygiène réutilisables.',
        'Renforcement de la participation citoyenne des jeunes dans les politiques de santé.'
      ],
      servicesOffered: [
        'Causeries éducatives et dialogues intergénérationnels parents-enfants.',
        'Accompagnement psycho-social des adolescentes enceintes.',
        'Ateliers de formation sur le leadership et les droits humains.'
      ],
      thematics: ['Santé des Adolescents', 'Hygiène Menstruelle', 'Grossesses Précoces', 'Plaidoyer Budgétaire SSR', 'Inclusion Sociale']
    },
    quand: {
      availability: 'Du Lundi au Vendredi (8h30 - 17h30). Interventions de terrain hebdomadaires dans les collèges et ateliers.',
      keyMoments: [
        'Campagnes de rentrée "Zéro Grossesse en Milieu Scolaire" (Septembre - Novembre).',
        'Journée Mondiale de l\'Hygiène Menstruelle (28 Mai).',
        'Journée Internationale de la Fille (11 Octobre).'
      ]
    },
    comment: {
      methodologies: [
        'Dialogues communautaires réunissant chefs traditionnels, religieux, parents et jeunes pour lever les tabous.',
        'Clubs d’écoute et de dialogue dans les collèges et centres de formation professionnelle.',
        'Théâtre forum participatif et sketchs de sensibilisation en langues locales (Fon, Yoruba, Mina, Dendi).'
      ],
      channels: ['Clubs scolaires', 'Ateliers d\'apprentissage', 'Radios locales', 'Plaidoyer institutionnel auprès des mairies']
    },
    impactActivities: [
      {
        title: 'Projet "Zéro Grossesse dans nos Ateliers"',
        description: 'Sensibilisation intensive des maîtres artisans et des jeunes apprenties couturières et coiffeuses pour stopper le harcèlement et les grossesses non planifiées.',
        metrics: '+12 000 apprenties touchées dans le Sud-Bénin'
      },
      {
        title: 'Plaidoyer pour la gratuité des serviettes hygiéniques',
        description: 'Mobilisation des communes et des parlementaires pour équiper les collèges publics en kits d\'hygiène et blocs sanitaires séparés pour filles.',
        metrics: '40 collèges équipés'
      }
    ],
    contacts: {
      phone: '+229 21 30 94 37',
      whatsapp: '+229 97 44 20 18',
      email: 'contact@ceradisong.org',
      headquarters: 'Quartier Sikècodji, Immeuble CeRADIS, Cotonou, Bénin',
      branches: ['Bureau Régional Zou/Collines (Bohicon)', 'Bureau Régional Ouémé (Porto-Novo)'],
      website: 'https://ceradisong.org'
    }
  },
  {
    id: 'rojalnu-benin',
    name: 'Réseau des Organisations de Jeunesse Africaines Leaders des Nations Unies',
    sigle: 'ROJALNU-Bénin',
    category: 'Réseau Jeunesse',
    tagline: 'Fédération nationale de mouvements de jeunes pour la réalisation des ODD 3 (Santé) et 5 (Égalité de Genre).',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    qui: {
      target: 'Étudiants des universités publiques et privées, jeunes diplômés, leaders associatifs, jeunes des 77 communes du Bénin.',
      actors: 'Jeunes activistes, délégués jeunesse ODD, pairs éducateurs universitaires, spécialistes en communication digitale.',
      coverage: 'Présence dans tous les campus universitaires (UAC Abomey-Calavi, UP Parakou, UNSTIM Lokossa) et réseau dans les 77 communes.'
    },
    quoi: {
      coreMissions: [
        'Mobilisation de masse des jeunes pour la prévention du VIH/SIDA et des IST.',
        'Sensibilisation sur la santé sexuelle digitale et lutte contre la désinformation en ligne.',
        'Plaidoyer pour l\'accès des jeunes aux postes de décision en santé publique.',
        'Organisation de caravanes universitaires de dépistage et de conseil santé.'
      ],
      servicesOffered: [
        'Dépistage volontaire et gratuit du VIH sur les campus.',
        'Formations certifiantes en plaidoyer ODD et leadership féminin.',
        'Webinaires interactifs et espaces de parole pour les jeunes.'
      ],
      thematics: ['VIH/SIDA', 'Leadership Jeune', 'ODD 3 & ODD 5', 'Santé Numérique', 'Démographie & Dividende Démographique']
    },
    quand: {
      availability: 'Activités continues tout au long de l’année universitaire. Permanence du secrétariat exécutif du Lundi au Vendredi.',
      keyMoments: [
        'Campagne "Campus Sans SIDA" lors des rentrées universitaires (Octobre - Décembre).',
        'Journée Internationale de la Jeunesse (12 Août).',
        'Semaine Nationale de la Jeunesse et de la Santé.'
      ]
    },
    comment: {
      methodologies: [
        'Événements festifs et éducatifs sur les campus (Concerts éducatifs, Village Jeunesse, Flashmobs).',
        'Campagnes massives sur TikTok, Instagram, X (Twitter) et Facebook avec des influenceurs engagés.',
        'Hackathons et concours d\'innovations technologiques au service de la santé reproductive.'
      ],
      channels: ['Campus universitaires', 'Réseaux sociaux', 'Podcasts', 'Caravanes mobiles']
    },
    impactActivities: [
      {
        title: 'Campagne "Campus Sans SIDA & Zéro IST"',
        description: 'Déploiement de stands mobiles de dépistage rapide avec remise immédiate des résultats et distribution massive de préservatifs masculins et féminins.',
        metrics: '+45 000 étudiants dépistés en 3 ans'
      },
      {
        title: 'Sommet National des Jeunes Leaders pour la SSR',
        description: 'Rassemblement annuel de 500 délégués communaux pour élaborer le Livre Blanc des recommandations des jeunes remis au Ministre de la Santé.',
        metrics: '77 communes représentées'
      }
    ],
    contacts: {
      phone: '+229 97 12 34 56',
      whatsapp: '+229 66 78 90 12',
      email: 'rojalnubenin.secretariat@gmail.com',
      headquarters: 'Siège ROJALNU, Quartier Agla, Abomey-Calavi / Cotonou, Bénin',
      website: 'https://rojalnu-benin.org'
    }
  },
  {
    id: 'batonga-foundation',
    name: 'Batonga Foundation',
    sigle: 'Batonga Bénin',
    category: 'OSC Jeunes',
    tagline: 'Fondée par Angélique Kidjo : transformer les adolescentes les plus difficiles à atteindre en leadeuses autonomes.',
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
    qui: {
      target: 'Adolescentes et jeunes femmes rurales (10-24 ans), filles non scolarisées ou déscolarisées, jeunes mamans célibataires.',
      actors: 'Mentores communautaires locales, formatrices en compétences de vie courante, facilitatrices de santé reproductive.',
      coverage: 'Zones rurales des départements des Collines (Savalou, Bantè, Glazoué), du Zou (Bohicon, Zogbodomey) et de l\'Atacora.'
    },
    quoi: {
      coreMissions: [
        'Création d’Espaces Sécurisés ("Safe Spaces") pour les jeunes filles rurales.',
        'Éducation à la santé sexuelle et reproductive sans tabou culturel.',
        'Fourniture de bourses scolaires et kits d\'hygiène menstruelle durables.',
        'Autonomisation financière des filles pour prévenir l’exploitation sexuelle transactionnelle.'
      ],
      servicesOffered: [
        'Cercles de mentorat hebdomadaires animés par de jeunes femmes modèles du village.',
        'Alphabétisation fonctionnelle et gestion de micro-entreprises génératrices de revenus.',
        'Référé d’urgence vers les centres de santé en cas de maladie, grossesse ou violence.'
      ],
      thematics: ['Espaces Sécurisés', 'Autonomisation Économique', 'Santé Menstruelle', 'Prévention des Mariages Précoces', 'Mentorat Féminin']
    },
    quand: {
      availability: 'Séances de mentorat tous les week-ends (Samedi et Dimanche après-midi). Suivi communautaire continu.',
      keyMoments: [
        'Sessions intensives d\'été "Leadership et Santé Féminine" (Juillet - Août).',
        'Journée Internationale de la Fille (11 Octobre).',
        'Foires économiques des jeunes filles artisanes.'
      ]
    },
    comment: {
      methodologies: [
        'Méthodologie participative des "Cercles de Filles" : groupe de 20 à 25 filles guidées par une mentore du même village.',
        'Cartographie géospatiale des filles les plus isolées pour ne laisser aucune fille de côté.',
        'Engagement des pères et des chefs de village pour lever les réticences culturelles.'
      ],
      channels: ['Cercles communautaires au village', 'Visites à domicile', 'Applications de collecte de données sécurisées']
    },
    impactActivities: [
      {
        title: 'Cercles d’Autonomisation et de Santé Reproductive',
        description: 'Création de plus de 450 clubs de mentorat dans des villages isolés où les filles apprennent leur anatomie, le cycle menstruel, leurs droits légaux et la gestion financière.',
        metrics: '+15 000 adolescentes rurales accompagnées'
      },
      {
        title: 'Lutte contre la précarité menstruelle',
        description: 'Formation des filles à la fabrication locale de serviettes hygiéniques lavables et distribution gratuite de culottes menstruelles.',
        metrics: '100% de maintien scolaire des membres'
      }
    ],
    contacts: {
      phone: '+229 21 30 78 90',
      whatsapp: '+229 96 11 22 33',
      email: 'benin@batongafoundation.org',
      headquarters: 'Bureau National Batonga, Quartier Haie Vive, Cotonou, Bénin',
      branches: ['Antenne Régionale Collines (Savalou)', 'Antenne Régionale Zou (Bohicon)'],
      website: 'https://batongafoundation.org'
    }
  },
  {
    id: 'youth-health-action',
    name: 'Youth Health Action Bénin',
    sigle: 'YHA Bénin',
    category: 'OSC Jeunes',
    tagline: 'L’innovation technologique et digitale au service de la santé sexuelle et mentale des jeunes béninois.',
    badgeColor: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    qui: {
      target: 'Jeunes connectés, élèves des lycées techniques et généraux, apprentis urbains, jeunes marginalisés.',
      actors: 'Jeunes développeurs, médecins généralistes bénévoles, psychologues cliniciens, créateurs de contenu digital.',
      coverage: 'Couverture nationale via les plateformes numériques avec antennes actives à Cotonou, Calavi, Parakou et Bohicon.'
    },
    quoi: {
      coreMissions: [
        'Télé-orientation confidentielle en santé sexuelle et reproductive.',
        'Sensibilisation digitale contre les mythes et fausses croyances sur la sexualité et les contraceptifs.',
        'Soutien psychologique et santé mentale des adolescents.',
        'Création de chatbots et d’outils numériques d’information sur la loi 2021-12.'
      ],
      servicesOffered: [
        'Consultations anonymes par messagerie instantanée (WhatsApp, Telegram).',
        'Web-séries éducatives et podcasts sur la sexualité positive et sans risque.',
        'Orientation vers les centres de santé de proximité géolocalisés.'
      ],
      thematics: ['Téléconsultation SSR', 'Santé Mentale', 'Chatbots Éducatifs', 'Loi IVG 2021-12', 'Prévention Cyberharcèlement']
    },
    quand: {
      availability: 'Assistance en ligne 7j/7 (9h00 - 22h00). Web-émissions interactives hebdomadaires.',
      keyMoments: [
        'Campagnes digitales lors de la Saint-Valentin "Amour & Protection" (Février).',
        'Mois de la Santé Mentale (Mai).',
        'Web-campagnes de rentrée étudiante.'
      ]
    },
    comment: {
      methodologies: [
        'Télé-assistance anonyme par les pairs supervisée par des professionnels de santé.',
        'Micro-learning par vidéos courtes explicatives et infographies interactives.',
        'Espaces de discussion audio en direct (Twitter/X Spaces, Live TikTok).'
      ],
      channels: ['WhatsApp Bot', 'TikTok', 'Instagram', 'Telegram', 'Plateforme Web']
    },
    impactActivities: [
      {
        title: 'Ligne Digitale d’Écoute Confidentielle',
        description: 'Service de messagerie anonyme permettant à tout jeune de poser des questions intimes sans peur du jugement et d’obtenir des réponses médicalement validées en moins de 15 minutes.',
        metrics: '+25 000 conversations traitées par an'
      },
      {
        title: 'Guide Numérique Interactif de la Loi 2021-12',
        description: 'Vulgarisation des articles de loi en français facile et en langues locales (Fon, Nago, Dendi) partagé sur les réseaux sociaux.',
        metrics: '+100 000 vues en ligne'
      }
    ],
    contacts: {
      phone: '+229 90 15 20 30',
      whatsapp: '+229 90 15 20 30',
      email: 'contact@youthhealthaction.org',
      headquarters: 'Hub Innovation Santé, Quartier Mènontin, Cotonou, Bénin',
      website: 'https://youthhealthaction.org'
    }
  },
  {
    id: 'afjb-benin',
    name: 'Association des Femmes Juristes du Bénin',
    sigle: 'AFJB',
    category: 'Assistance Juridique & Droits',
    tagline: 'Défense juridique inconditionnelle des droits des femmes, des filles et des victimes de violences sexuelles.',
    badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
    qui: {
      target: 'Femmes et jeunes filles victimes de VBG, mineures victimes de viol ou d’inceste, personnes démunies ayant besoin d’assistance judiciaire.',
      actors: 'Avocates inscrites au barreau du Bénin, magistrats, juristes chevronnées, assistantes sociales.',
      coverage: 'Cliniques juridiques permanentes à Cotonou, Porto-Novo, Parakou, Abomey et Natitingou.'
    },
    quoi: {
      coreMissions: [
        'Assistance juridique et judiciaire gratuite (accompagnement au commissariat et au tribunal).',
        'Vulgarisation des lois (Loi 2021-12 SSR, Loi 2011-26 VBG, Code de l’Enfant 2015-08).',
        'Plaidoyer pour l’application rigoureuse des peines contre les agresseurs.',
        'Médiation familiale et protection des héritages des veuves et orphelines.'
      ],
      servicesOffered: [
        'Consultations juridiques gratuites au sein des "Boutiques de Droit".',
        'Prise en charge des frais d’huissier et d’avocat pour les victimes indigentes.',
        'Formations des officiers de police judiciaire (OPJ) sur l’accueil bienveillant des victimes.'
      ],
      thematics: ['Cliniques Juridiques', 'Assistance Judiciaire', 'Lutte contre l’Impunité', 'Droits des Victimes', 'Protection de l’Enfance']
    },
    quand: {
      availability: 'Boutiques de Droit ouvertes du Lundi au Vendredi (8h00 - 17h00). Permanence d’urgence le week-end.',
      keyMoments: [
        'Campagne des 16 Jours d\'Activisme contre les Violences Faites aux Femmes (25 Nov - 10 Déc).',
        'Journée Internationale des Droits des Femmes (8 Mars).'
      ]
    },
    comment: {
      methodologies: [
        'Prise en charge holistique (Juridique + Médicale + Psychologique) en partenariat avec les hôpitaux publics.',
        'Cliniques du Droit mobiles dans les marchés et gares routières.',
        'Émissions de radio interactive "Le Droit et Vous" en langues nationales.'
      ],
      channels: ['Boutiques du droit', 'Tribunaux', 'Commissariats', 'Radios nationales et locales']
    },
    impactActivities: [
      {
        title: 'Boutiques du Droit pour Victimes de Violences',
        description: 'Guichets d’accès direct où toute femme ou fille peut rencontrer une juriste, rédiger une plainte et obtenir un avocat commis d’office pour son procès pénal.',
        metrics: '+3 500 dossiers juridiques traités par an'
      },
      {
        title: 'Veille d\'application de la Loi SSR 2021-12',
        description: 'Protection des professionnels de santé et des patientes contre les arrestations arbitraires ou les refus illégaux de soins dans les formations sanitaires.',
        metrics: '100% de victoires judiciaires pour les droits légaux'
      }
    ],
    contacts: {
      phone: '+229 21 31 52 98',
      alternatePhone: '+229 97 88 12 34',
      whatsapp: '+229 97 88 12 34',
      email: 'afjbenin@yahoo.fr',
      headquarters: 'Siège AFJB, Quartier Guinkomey, Derrière la Bourse du Travail, Cotonou, Bénin',
      branches: ['Boutique du Droit Porto-Novo', 'Boutique du Droit Parakou', 'Boutique du Droit Abomey', 'Boutique du Droit Natitingou'],
      website: 'https://femmesjuristes-benin.org'
    }
  },
  {
    id: 'inf-benin-public',
    name: 'Institut National de la Femme (INF Bénin)',
    sigle: 'INF (Organisme Public d\'État)',
    category: 'Institution & Appui Public',
    tagline: 'L’institution nationale de référence rattachée à la Présidence pour la promotion et la protection intégrale de la femme.',
    badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
    qui: {
      target: 'Toutes les femmes, adolescentes, filles et enfants victimes de violences, discrimination ou harcèlement sur le territoire béninois.',
      actors: 'Magistrats délégués, juristes d’État, psychologues cliniciens, assistantes sociales, officiers de liaison de la Police Républicaine.',
      coverage: 'Compétence nationale sur toute l’étendue du Bénin avec intervention directe 24h/24 et 7j/7.'
    },
    quoi: {
      coreMissions: [
        'Enregistrement et traitement immédiat des plaintes pour violences basées sur le genre (VBG).',
        'Constitution de partie civile au nom de l’État aux côtés des victimes lors des procès pénaux.',
        'Prise en charge médicale et médico-légale d’urgence des victimes de viol et d’agression.',
        'Plaidoyer pour l’égalité des sexes et l’autonomisation économique des femmes béninoises.'
      ],
      servicesOffered: [
        'Numéro vert national gratuit d’urgence : Ligne 114 (accessible 24h/24 sans crédit).',
        'Mise en sécurité et hébergement d’urgence dans des centres d’accueil sécurisés.',
        'Avocats commis et payés par l’État pour assister les victimes du dépôt de plainte au jugement.'
      ],
      thematics: ['Ligne Verte 114', 'Protection Juridique d’État', 'Prise en Charge Holistique', 'Tolérance Zéro VBG', 'Santé des Femmes']
    },
    quand: {
      availability: 'Ligne Verte 114 ouverte 24 heures sur 24, 7 jours sur 7. Siège ouvert du Lundi au Vendredi (8h00 - 18h30).',
      keyMoments: [
        'Intervention d’urgence continue 24/7.',
        'Grandes campagnes de sensibilisation nationale dans les 77 communes.'
      ]
    },
    comment: {
      methodologies: [
        'Procédure d’alerte rapide : appel au 114 déclenchant l’intervention immédiate de la Police Républicaine et du SAMU si nécessaire.',
        'Constitution automatique de partie civile assurant que les auteurs de violences ne bénéficient d’aucun arrangement amiable illégal.',
        'Guichet unique coordonnant hôpitaux, police, justice et centres sociaux.'
      ],
      channels: ['Numéro Vert 114 (Appel gratuit)', 'Application mobile', 'Plateforme web', 'Signalement physique au siège']
    },
    impactActivities: [
      {
        title: 'Ligne d’Assistance Nationale 114',
        description: 'Plateforme téléphonique d’écoute active et de secours immédiat traitant les signalements de viols, coups et blessures, mariages forcés et harcèlement.',
        metrics: '+50 000 appels traités avec secours effectif'
      },
      {
        title: 'Représentation Judiciaire Gratuite',
        description: 'L’INF se constitue partie civile devant les tribunaux et la Cour de Répression des Infractions Économiques et du Terrorisme (CRIET) pour exiger des peines exemplaires.',
        metrics: 'Des centaines de condamnations fermes prononcées'
      }
    ],
    contacts: {
      tollFree: '114 (Gratuit 24h/24, 7j/7)',
      phone: '+229 01 21 30 00 00',
      whatsapp: '+229 01 51 00 01 14',
      email: 'contact@inf.bj',
      headquarters: 'Siège de l\'Institut National de la Femme, Boulevard de la Marina, Cotonou, Bénin',
      website: 'https://inf.bj'
    }
  },
  {
    id: 'roajelf-benin',
    name: 'Réseau Ouest Africain des Jeunes Femmes Leaders',
    sigle: 'ROAJELF-Bénin',
    category: 'Réseau Jeunesse',
    tagline: 'Renforcer le pouvoir d’action des jeunes femmes pour une gouvernance inclusive et des droits reproductifs effectifs.',
    badgeColor: 'bg-pink-50 text-pink-700 border-pink-200',
    qui: {
      target: 'Jeunes femmes de 18 à 35 ans, leadeuses associatives, étudiantes, jeunes parlementaires, femmes artisanes.',
      actors: 'Jeunes femmes juristes, activistes des droits humains, communicatrices, spécialistes de plaidoyer.',
      coverage: 'Antennes dans les 12 départements du Bénin et coordination régionale CEDEAO.'
    },
    quoi: {
      coreMissions: [
        'Plaidoyer pour la budgétisation sensible au genre et le financement pérenne de la santé reproductive.',
        'Sensibilisation sur les droits sexuels et la prévention des grossesses non désirées.',
        'Formation au leadership politique et participation citoyenne des jeunes femmes.',
        'Lutte contre les stéréotypes de genre et le harcèlement en milieu professionnel.'
      ],
      servicesOffered: [
        'Académies de leadership pour jeunes filles.',
        'Sessions de mentorat avec des femmes ministres, députées et magistrates.',
        'Dialogues politiques avec les décideurs communaux et nationaux.'
      ],
      thematics: ['Leadership Féminin', 'Plaidoyer Budgétaire', 'Droits Reproductifs', 'Égalité des Sexes', 'Participation Politique']
    },
    quand: {
      availability: 'Activités tout au long de l’année. Formations le week-end et en périodes de vacances.',
      keyMoments: [
        'Mois de la Femme (Mars).',
        'Campagne régionale CEDEAO pour la santé des adolescentes.'
      ]
    },
    comment: {
      methodologies: [
        'Académies d’été de formation intensive au plaidoyer.',
        'Interpellations citoyennes des députés lors des sessions budgétaires.',
        'Campagnes digitales #MaVoixMonDroit.'
      ],
      channels: ['Académies de formation', 'Réseaux sociaux', 'Parlement des jeunes', 'Conférences citoyennes']
    },
    impactActivities: [
      {
        title: 'Académie des Jeunes Femmes Leaders en SSR',
        description: 'Formation annuelle de 100 jeunes femmes engagées pour devenir des ambassadrices des droits reproductifs et de la loi 2021-12 dans leurs communautés.',
        metrics: '+800 leadeuses formées'
      }
    ],
    contacts: {
      phone: '+229 95 40 12 34',
      whatsapp: '+229 95 40 12 34',
      email: 'roajelf.benin@gmail.com',
      headquarters: 'Siège ROAJELF Bénin, Quartier Sainte-Rita, Cotonou, Bénin',
      website: 'https://roajelf.org'
    }
  },
  {
    id: 'plan-international-benin',
    name: 'Plan International Bénin (Volet Jeunesse & Champions du Changement)',
    sigle: 'Plan International Bénin',
    category: 'Institution & Appui Public',
    tagline: 'Faire progresser les droits des enfants et l’égalité pour les filles à travers l’approche Champions of Change.',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    qui: {
      target: 'Enfants, adolescents garçons et filles (10-19 ans), parents, leaders communautaires et religieux du milieu rural.',
      actors: 'Spécialistes en protection de l’enfance, formateurs en genre transformateur, psychologues.',
      coverage: 'Forte présence dans les départements de l\'Atacora, Donga, Alibori, Borgou, Couffo et Zou.'
    },
    quoi: {
      coreMissions: [
        'Élimination du mariage des enfants et des mutilations génitales féminines.',
        'Programme "Champions du Changement" engageant les garçons et les hommes pour la santé des filles.',
        'Renforcement de l’accès à la contraception pour les adolescentes en zone rurale.',
        'Construction et réhabilitation de blocs sanitaires adaptés dans les écoles.'
      ],
      servicesOffered: [
        'Clubs de jeunes garçons et filles "Champions du Changement".',
        'Bourses scolaires et kits complets pour filles vulnérables.',
        'Lignes d’orientation communautaires contre les abus sexuels.'
      ],
      thematics: ['Mariage d’Enfants', 'Genre Transformateur', 'Éducation des Filles', 'Santé des Adolescentes', 'Infrastructures Scolaires']
    },
    quand: {
      availability: 'Bureaux ouverts du Lundi au Vendredi (8h00 - 17h30). Projets communautaires continus.',
      keyMoments: [
        'Campagne mondiale "Because I am a Girl" / "Parce que je suis une fille".',
        'Journée de l\'Enfant Africain (16 Juin).'
      ]
    },
    comment: {
      methodologies: [
        'Approche de genre transformateur qui déconstruit les masculinités toxiques chez les garçons.',
        'Pactes communautaires signés avec les rois et dignitaires religieux pour bannir les mariages précoces.',
        'Gouvernance scolaire participative avec les clubs d’élèves.'
      ],
      channels: ['Écoles primaires et collèges', 'Palais royaux', 'Radios communautaires', 'Centres de jeunes']
    },
    impactActivities: [
      {
        title: 'Mouvement "Champions du Changement"',
        description: 'Formation de milliers de jeunes garçons pour devenir des alliés actifs des filles, dénoncer le harcèlement et promouvoir l’égalité dans la gestion de la santé sexuelle.',
        metrics: '+50 000 garçons et filles formés'
      }
    ],
    contacts: {
      phone: '+229 21 30 22 22',
      alternatePhone: '+229 21 30 22 23',
      email: 'benin.co@plan-international.org',
      headquarters: 'Bureau Pays Plan International, Quartier Les Cocotiers, Cotonou, Bénin',
      branches: ['Bureau Régional Natitingou (Nord)', 'Bureau Régional Bohicon (Centre)'],
      website: 'https://plan-international.org/benin'
    }
  }
];

export const FIRST_AID_TIPS = [
  {
    title: 'Arrêter un saignement abondant (Hémorragie)',
    description: 'En cas de coupure profonde ou blessure avec saignement continu.',
    icon: 'Ban',
    category: 'Secourisme',
    steps: [
      'Protégez-vous avec des gants ou un plastique propre si disponible.',
      'Exercez une compression directe et ferme sur la plaie à l’aide d’un tissu propre ou d’un tampon relais.',
      'Maintenez la pression sans relâcher pendant plusieurs minutes consécutives.',
      'Allongez la victime pour éviter les vertiges et le choc circulatoire.',
      'Alertez immédiatement les Sapeurs-Pompiers (118) ou le SAMU (112).'
    ],
    color: 'bg-red-50 text-red-600'
  },
  {
    title: 'Brûlure thermique ou chimique',
    description: 'Procédure d’urgence pour refroidir et protéger la peau brûlée.',
    icon: 'Flame',
    category: 'Secourisme',
    steps: [
      'Refroidissez immédiatement la brûlure sous une eau courante tempérée (15-20°C) pendant 15 à 20 minutes.',
      'Retirez délicatement les vêtements autour de la brûlure, sauf s\'ils collent à la peau.',
      'Ne jamais percer les cloques (phlyctènes) pour éviter toute infection.',
      'Recouvrez la zone d\'un linge propre ou d\'une compresse stérile sans serrer.',
      'Consultez un médecin si la brûlure dépasse la taille de la paume de la main.'
    ],
    color: 'bg-orange-50 text-orange-600'
  },
  {
    title: 'Étouffement & Obstruction des Voies Aériennes',
    description: 'Si une personne s’étouffe et ne peut plus émettre de son ni respirer.',
    icon: 'Wind',
    category: 'Secourisme',
    steps: [
      'Encouragez d’abord la personne à tousser fort si elle le peut encore.',
      'Si elle ne peut plus respirer : administrez 5 claques vigoureuses dans le dos entre les deux omoplates avec le plat de la main.',
      'En cas d’échec : réalisez 5 compressions abdominales (Méthode de Heimlich) au creux de l’estomac.',
      'Alternez 5 claques dans le dos et 5 compressions jusqu’à l’expulsion du corps étranger.',
      'Si la victime perd connaissance, commencez immédiatement la réanimation cardio-pulmonaire.'
    ],
    color: 'bg-amber-50 text-amber-600'
  },
  {
    title: 'Perte de connaissance & Malaise (PLS)',
    description: 'Victime inconsciente mais qui respire encore normalement.',
    icon: 'HeartPulse',
    category: 'Secourisme',
    steps: [
      'Vérifiez la conscience : posez une question simple et serrez-lui la main.',
      'Vérifiez la respiration : basculez doucement la tête en arrière et observez le thorax pendant 10 secondes.',
      'Si elle respire : placez la victime sur le côté en Position Latérale de Sécurité (PLS) pour libérer les voies respiratoires.',
      'Couvrez la victime et surveillez sa respiration en continu jusqu’à l’arrivée des secours.',
      'Composez le 112 (SAMU) ou le 118 (Pompiers).'
    ],
    color: 'bg-blue-50 text-blue-600'
  },
  {
    title: 'Morsure de Serpent ou Piqûre Venimeuse',
    description: 'Gestes recommandés face aux envenimations au Bénin.',
    icon: 'Shield',
    category: 'Secourisme',
    steps: [
      'Calmez impérativement la victime et faites-la s’allonger pour ralentir la diffusion du venin.',
      'Immobilisez le membre mordu avec une attelle de fortune (ne pas faire de garrot serré !).',
      'Nettoyez la plaie avec de l’eau propre ou du savon doux (ne pas inciser, ne pas sucer le venin).',
      'Retirez rapidement bagues, bracelets et chaussures avant l’apparition de l’œdème.',
      'Transportez d’urgence vers l’hôpital le plus proche pour l’administration de sérum antivenimeux.'
    ],
    color: 'bg-emerald-50 text-emerald-600'
  },
  {
    title: 'Crise d’Asthme ou Détresse Respiratoire',
    description: 'Prise en charge d’une gêne respiratoire aiguë.',
    icon: 'Activity',
    category: 'Secourisme',
    steps: [
      'Aidez la personne à s’asseoir confortablement, le buste droit et penché en avant.',
      'Aidez-la à prendre son inhalateur de secours (ex: Salbutamol / Ventoline) selon sa prescription.',
      'Desserrez col, ceinture et vêtements oppressants.',
      'Rassurez la personne et encouragez une respiration lente et profonde.',
      'Appelez le 112 si la crise persiste après 5 à 10 minutes.'
    ],
    color: 'bg-indigo-50 text-indigo-600'
  }
];
