import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI, Type } from "@google/genai";

// Note: The __filename and __dirname derivation is commented out since import.meta is empty in the bundled CJS file.
// We use process.cwd() instead when needed for static path resolution.

// Initialize Gemini lazily
let aiClient: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key && key.trim() && key !== "MY_GEMINI_API_KEY") {
      try {
        aiClient = new GoogleGenAI({
          apiKey: key,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            }
          }
        });
      } catch (err) {
        console.warn("[SERVER] Error creating GoogleGenAI client:", err);
        return null;
      }
    }
  }
  return aiClient;
}

// Completely autonomous, free, rule-based NLP fallback for the E-Secours Assistant
// This guarantees conversational navigation and emergency actions work perfectly without any third-party services.
function getLocalAssistantResponse(message: string): { text: string; functionCalls?: any[] } {
  const normalized = message.toLowerCase().trim();
  
  // 1. SOS WAKE WORDS or core greetings
  if (normalized === "bonjour sos" || normalized === "hello sos" || normalized === "sos" || normalized === "bonjour") {
    return {
      text: "Bonjour, je suis votre assistante sociale E-Secours. Comment puis-je vous soutenir aujourd'hui ?",
      functionCalls: []
    };
  }

  // 2. Immediate Emergency triggering
  if (normalized.includes("urgence") || normalized.includes("danger") || normalized.includes("secours") || normalized.includes("accident") || normalized.includes("feu") || normalized.includes("incendie") || normalized.includes("agression") || normalized.includes("vol") || normalized.includes("blessé") || normalized.includes("saigne") || normalized.includes("malade") || normalized.includes("aidez-moi")) {
    let type = "autre";
    if (normalized.includes("accident") || normalized.includes("voiture") || normalized.includes("route") || normalized.includes("moto")) {
      type = "accident";
    } else if (normalized.includes("feu") || normalized.includes("incendie") || normalized.includes("brûle") || normalized.includes("fumée")) {
      type = "incendie";
    } else if (normalized.includes("agression") || normalized.includes("attaque") || normalized.includes("arme") || normalized.includes("menace") || normalized.includes("danger de mort")) {
      type = "agression";
    } else if (normalized.includes("blessé") || normalized.includes("saigne") || normalized.includes("cardiaque") || normalized.includes("malade") || normalized.includes("médecin") || normalized.includes("clinique") || normalized.includes("évanoui")) {
      type = "medical";
    } else if (normalized.includes("vol") || normalized.includes("cambriolage") || normalized.includes("voleur")) {
      type = "vol";
    } else if (normalized.includes("inondation") || normalized.includes("eau") || normalized.includes("pluie") || normalized.includes("noyade")) {
      type = "inondation";
    }
    
    return {
      text: `Je déclenche immédiatement l'alerte d'urgence ${type === 'autre' ? '' : 'pour ' + type} afin de mobiliser les secours près de votre position. Gardez votre calme.`,
      functionCalls: [{
        name: "trigger_emergency_alert",
        args: { type }
      }]
    };
  }

  // 3. Navigation to page modules
  if (normalized.includes("numéro") || normalized.includes("téléphone") || normalized.includes("appeler") || normalized.includes("samu") || normalized.includes("police") || normalized.includes("pompier") || normalized.includes("secouriste")) {
    return {
      text: "Je vous dirige directement vers les numéros d'urgence officiels utiles (SAMU 112, Police 117/166, Sapeurs-Pompiers 118).",
      functionCalls: [{ name: "navigate_to_page", args: { page: "numbers" } }]
    };
  }

  if (normalized.includes("conseil") || normalized.includes("geste") || normalized.includes("premier") || normalized.includes("sauve") || normalized.includes("étouffe") || normalized.includes("guide") || normalized.includes("apprentissage") || normalized.includes("apprendre")) {
    return {
      text: "Je vous dirige vers la section des guides d'apprentissage de premiers secours pour savoir comment réagir face aux urgences.",
      functionCalls: [{ name: "navigate_to_page", args: { page: "tips" } }]
    };
  }

  if (normalized.includes("carte") || normalized.includes("pharmacie") || normalized.includes("hôpital") || normalized.includes("clinique") || normalized.includes("trouver") || normalized.includes("proche") || normalized.includes("centre") || normalized.includes("outils") || normalized.includes("gardes")) {
    return {
      text: "Affichons ensemble notre outil de localisation des centres de santé d'urgence et des pharmacies de garde à proximité.",
      functionCalls: [{ name: "navigate_to_page", args: { page: "tools" } }]
    };
  }

  if (normalized.includes("profil") || normalized.includes("fiche") || normalized.includes("médical") || normalized.includes("groupe sanguin") || normalized.includes("allergie") || normalized.includes("traitement") || normalized.includes("mon corps")) {
    return {
      text: "Voici votre fiche médicale d'urgence sécurisée pour renseigner votre groupe sanguin, vos allergies et traitements.",
      functionCalls: [{ name: "navigate_to_page", args: { page: "profile" } }]
    };
  }

  if (normalized.includes("historique") || normalized.includes("mes alertes") || normalized.includes("alertes passées") || normalized.includes("historiques")) {
    return {
      text: "Je vous invite à consulter votre historique contenant toutes les alertes d'urgence passées.",
      functionCalls: [{ name: "navigate_to_page", args: { page: "history" } }]
    };
  }

  if (normalized.includes("contact") || normalized.includes("joindre") || normalized.includes("support") || normalized.includes("développeur") || normalized.includes("mél") || normalized.includes("email")) {
    return {
      text: "Je vous redirige vers la page de contact direct pour joindre notre équipe de support technique.",
      functionCalls: [{ name: "navigate_to_page", args: { page: "contact" } }]
    };
  }

  if (normalized.includes("propos") || normalized.includes("about") || normalized.includes("qui-êtes-vous") || normalized.includes("e-secours") || normalized.includes("c'est quoi") || normalized.includes("fonctionne")) {
    return {
      text: "E-Secours est une solution solidaire béninoise permettant la transmission instantanée d'alertes d'urgence, utilisable de manière autonome avec ou sans connexion.",
      functionCalls: [{ name: "navigate_to_page", args: { page: "about" } }]
    };
  }

  // General polite informational fallback
  return {
    text: "Je suis à votre écoute ! Dites-moi si vous souhaitez lancer un SOS d'urgence, configurer votre fiche médicale, trouver un hôpital ou voir un guide de premier secours.",
    functionCalls: []
  };
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  console.log(`[SERVER] Starting in ${process.env.NODE_ENV || 'development'} mode`);
  
  // 1. GLOBAL LOGGING & PARSING
  app.use(express.json());
  
  let isReady = false;
  app.use((req, res, next) => {
    if (isReady || req.url.startsWith('/api')) {
      next();
    } else {
      // If it's a request for assets but we are not ready, wait a bit or send a retry header
      if (req.url.startsWith('/src') || req.url.startsWith('/@') || req.url.startsWith('/node_modules')) {
        console.log(`[BOOT] Holding request for ${req.url}...`);
        let done = false;
        const check = setInterval(() => {
          if (isReady && !done) {
            done = true;
            clearInterval(check);
            next();
          }
        }, 100);
        setTimeout(() => { 
          if (!done) {
            done = true;
            clearInterval(check); 
            next(); 
          }
        }, 10000);
      } else {
        next();
      }
    }
  });

  app.use((req, res, next) => {
    if (!req.url.startsWith('/src') && !req.url.startsWith('/node_modules') && !req.url.startsWith('/@')) {
      console.log(`[REQ] ${req.method} ${req.url}`);
    }
    next();
  });

  // 2. API ROUTES
  const apiRouter = express.Router();

  apiRouter.get("/health", (req, res) => res.json({ status: "ok" }));

  apiRouter.post("/assistant", async (req, res) => {
    try {
      const { message, history } = req.body;

      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      const aiClient = getAiClient();
      if (!aiClient) {
        console.log("[ASSISTANT] Gemini API client not available. Using local natural language matcher fallback.");
        const fallbackRes = getLocalAssistantResponse(message);
        return res.json(fallbackRes);
      }

      try {
        const response = await aiClient.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: [
            ...(history || []),
            { role: 'user', parts: [{ text: message }] }
          ],
          config: {
            systemInstruction: `Tu es l'Assistante Sociale E-Secours, une conseillère virtuelle dévouée et bienveillante pour la plateforme d'urgence E-Secours au Bénin. 
            Ta mission est d'offrir un soutien social, d'orienter les utilisateurs vers les bonnes ressources et de les aider à naviguer sur la plateforme, en particulier les personnes vulnérables ou malvoyantes.

            WAKE WORD: L'utilisateur utilise "Bonjour SOS", "Hello SOS", ou "SOS" pour t'activer. 
            IMPORTANT: Si le message ne contient que le WAKE WORD, réponds par un accueil chaleureux de ton rôle d'assistante sociale (ex: "Bonjour, je suis votre assistante sociale E-Secours. Comment puis-je vous soutenir aujourd'hui ?").

            CONNAISSANCES DE LA PLATEFORME (À UTILISER POUR ORIENTER):
            - URGENCE IMMÉDIATE: Si l'utilisateur est en danger, utilise 'trigger_emergency_alert'.
            - NUMÉROS UTILES: Oriente vers 'numbers' pour appeler la Police (117/166), les Pompiers (118) ou le SAMU (112).
            - CONSEILS MÉDICAUX: Oriente vers 'tips' pour des guides sur : Arrêter un saignement, Brûlures, Étouffement (Heimlich), Malaises.
            - SANTÉ & PROFIL: Oriente vers 'health' pour le suivi médical ou 'profile' pour mettre à jour ses données vitales (âge, sexe, poids, groupe sanguin, allergies, traitements).
            - OUTILS: Oriente vers 'tools' pour trouver des hôpitaux ou pharmacies à proximité.
            - HISTORIQUE: Oriente vers 'history' pour voir les alertes passées.
            - CONTACT: Oriente vers 'contact' pour joindre l'équipe technique.

            TON: Empathique, rassurant, professionnel et protecteur. Tu es là pour aider socialement avant tout.

            ACCESSIBILITÉ (CRITIQUE):
            1. Sois très concis (maximum 2 phrases).
            2. Évites les caractères spéciaux (*, -, listes).
            3. Confirme toujours vocalement avant de naviguer.

            STRUCTURE DE RÉPONSE: Réponses courtes, fluides et purement textuelles.`,
            tools: [{
              functionDeclarations: [
                {
                  name: "navigate_to_page",
                  description: "Navigue vers une page spécifique de l'application.",
                  parameters: {
                    type: Type.OBJECT,
                    properties: {
                      page: {
                        type: Type.STRING,
                        enum: ['home', 'numbers', 'tips', 'tools', 'health', 'history', 'about', 'contact', 'profile', 'admin'],
                        description: "Identifiant de la page cible."
                      }
                    },
                    required: ["page"]
                  }
                },
                {
                  name: "trigger_emergency_alert",
                  description: "Ouvre le volet de déclenchement d'un SOS d'urgence.",
                  parameters: {
                    type: Type.OBJECT,
                    properties: {
                      type: {
                        type: Type.STRING,
                        enum: ['accident', 'incendie', 'agression', 'medical', 'vol', 'perte', 'inondation', 'seisme', 'autre'],
                        description: "Type d'incident si spécifié."
                      }
                    }
                  }
                }
              ]
            }]
          }
        });

        const text = response.text;
        const functionCalls = response.functionCalls;

        return res.json({ text, functionCalls });
      } catch (geminiErr: any) {
        console.warn("[ASSISTANT] Gemini API request failed (Quota or Error). Recovering via matching engine...", geminiErr);
        const fallbackRes = getLocalAssistantResponse(message);
        return res.json(fallbackRes);
      }
    } catch (err: any) {
      console.error("[ASSISTANT GENERAL EXCEPTION]", err);
      // Absolute fallback
      return res.json({
        text: "Désolé, je rencontre une légère perturbation, mais je reste à votre service localement pour n'importe quelle commande.",
        functionCalls: []
      });
    }
  });

  // Simple in-memory cache to prevent redundant requests
  const CACHE_TTL = 1000 * 60 * 5; // 5 minutes
  const medicalCache = new Map<string, { data: any, timestamp: number }>();

  apiRouter.post("/medical", async (req, res) => {
    const { query } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: "Aucune requête fournie" });
    }

    // 0. Check Cache
    const cached = medicalCache.get(query);
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
      console.log(`[API-MEDICAL] Serving from cache`);
      return res.json(cached.data);
    }

    console.log(`[API-MEDICAL] Processing query (${query.length} chars)`);

    const interpreters = [
      "https://lz4.overpass-api.de/api/interpreter",
      "https://overpass-api.de/api/interpreter",
      "https://overpass.kumi.systems/api/interpreter",
      "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
      "https://overpass.openstreetmap.ru/cgi/interpreter"
    ];

    const controllers: AbortController[] = [];
    const cleanup = () => controllers.forEach(c => c.abort());

    const tryFetch = async (url: string, index: number) => {
      // Stagger: starts with 0ms, then 1.5s, 3s, etc. 
      if (index > 0) {
        await new Promise(resolve => setTimeout(resolve, index * 1500)); 
      }

      const controller = new AbortController();
      controllers.push(controller);

      try {
        const hostname = new URL(url).hostname;
        console.log(`[API-MEDICAL] Attempting: ${hostname}...`);
        
        const fetchWithRetry = async (attempt = 1): Promise<any> => {
          try {
            const response = await fetch(url, {
              method: "POST",
              body: `data=${encodeURIComponent(query)}`,
              headers: { 
                "Content-Type": "application/x-www-form-urlencoded",
                "User-Agent": "ESecours-Emergency-App/2.0 (contactesecours@gmail.com) AIS-Studio-Applet",
                "Referer": "https://openstreetmap.org/"
              },
              signal: controller.signal
            });

            if (response.ok) {
              return await response.json();
            }

            // Handle Rate Limiting (429) or Server Errors (5xx)
            if ((response.status === 429 || response.status >= 500) && attempt < 3) {
              const waitTime = attempt * 2000; // 2s, 4s backoff
              console.warn(`[API-MEDICAL] ${hostname} busy (${response.status}), retry ${attempt} in ${waitTime}ms...`);
              await new Promise(r => setTimeout(r, waitTime));
              return fetchWithRetry(attempt + 1);
            }

            throw new Error(`Status ${response.status}`);
          } catch (e: any) {
            if (e.name === 'AbortError') throw e;
            if (attempt < 2 && !e.message?.includes('Status')) {
               await new Promise(r => setTimeout(r, 1000));
               return fetchWithRetry(attempt + 1);
            }
            throw e;
          }
        };

        const data = await fetchWithRetry();
        return { success: true, data, url };
      } catch (err: any) {
        return { success: false, error: err.message, url };
      }
    };

    try {
      const result = await Promise.any(
        interpreters.map((url, i) => 
          tryFetch(url, i).then(res => {
            if (res.success) return res;
            throw res; 
          })
        )
      );

      cleanup(); 
      console.log(`[API-MEDICAL] WINNER: ${new URL(result.url).hostname}`);
      
      medicalCache.set(query, { data: result.data, timestamp: Date.now() });
      if (medicalCache.size > 100) medicalCache.clear(); 

      return res.json(result.data);
    } catch (err: any) {
      cleanup();
      console.error("[API-MEDICAL] ALL SERVERS FAILED", err);
      
      if (err.errors) {
        err.errors.forEach((e: any, i: number) => {
          console.error(`  - Server ${i}: ${e.url} | Error: ${e.error}`);
        });
      }

      res.status(502).json({ 
        error: "Serveurs de cartographie surchargés.",
        details: "Impossible de récupérer les centres médicaux pour le moment. Réessayez dans 30 secondes ou utilisez les numéros d'urgence." 
      });
    }
  });

  // API 404 Handler
  apiRouter.all("*", (req, res) => {
    console.warn(`[API] 404 - Unknown route: ${req.method} ${req.url}`);
    res.status(404).json({ error: "Route API inconnue" });
  });

  app.use("/api", apiRouter);

  // 3. START LISTENING BEFORE LONG-RUNNING VITE BOOT
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[SERVER] Listening on http://0.0.0.0:${PORT}`);
  });

  // 4. VITE / STATIC (AWAITED AFTER LISTEN)
  if (process.env.NODE_ENV !== "production") {
    console.log("[SERVER] Initializing Vite middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    isReady = true;
    console.log("[SERVER] Vite middleware ready.");
  } else {
    isReady = true;
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }
}

startServer();
