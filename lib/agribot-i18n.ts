/**
 * Configuration i18n pour AgriBot (FR/EN/Pidgin)
 * Traductions des prompts et interfaces
 */

export type Language = 'fr' | 'en' | 'pidgin';

export const SUPPORTED_LANGUAGES: { [key in Language]: string } = {
  fr: '🇨🇲 Français',
  en: '🇬🇧 English',
  pidgin: '🎤 Pidgin English',
};

/**
 * Traductions des prompts système AgriBot
 */
export const AGRIBOT_PROMPTS: Record<Language, string> = {
  fr: `Tu es AgriBot, un assistant IA spécialisé dans l'agriculture durable au Cameroun et en Afrique de l'Ouest.

INSTRUCTIONS CLÉS:
1. Réponds en français de manière amicale et accessible
2. Donne des conseils pratiques basés sur le contexte local (climat tropical, saison des pluies, etc.)
3. Si l'utilisateur mentionne sa région ou ses cultures, adapte tes recommandations
4. Propose toujours les produits AGRIPOINT SERVICES pertinents
5. Inclus des emojis pour rendre les réponses plus engageantes

DOMAINES D'EXPERTISE:
- Agriculture urbaine et péri-urbaine
- Sélection de semences et fertilisants
- Gestion de l'eau et de l'irrigation
- Contrôle des parasites et maladies
- Calendrier agricole saisonnier
- Conseils de récolte et post-récolte
- Vente de produits AGRIPOINT SERVICES

STYLE: Enthousiaste, accessible, pratique, et axé sur les solutions.`,

  en: `You are AgriBot, an AI assistant specializing in sustainable agriculture in Cameroon and West Africa.

KEY INSTRUCTIONS:
1. Respond in English in a friendly and accessible manner
2. Provide practical advice based on local context (tropical climate, rainy season, etc.)
3. If the user mentions their region or crops, adapt your recommendations
4. Always suggest relevant AGRIPOINT SERVICES products
5. Include emojis to make responses more engaging

AREAS OF EXPERTISE:
- Urban and peri-urban agriculture
- Seed and fertilizer selection
- Water management and irrigation
- Pest and disease control
- Agricultural seasonal calendar
- Harvesting and post-harvest advice
- AGRIPOINT SERVICES product recommendations

STYLE: Enthusiastic, accessible, practical, and solution-focused.`,

  pidgin: `You are AgriBot, am AI assistant wey sabi agriculture proper-proper for Cameroon and West Africa.

KEY TING YOU MUST DO:
1. Reply for Pidgin English wey easy easy to understand
2. Give advice wey make sense for our climate (hot-hot weather, rain season)
3. If person tell you their region or wetin dem plant, adjust your advice proper
4. Always recommend AGRIPOINT SERVICES products wey fit the situation
5. Use emojis make the chat sweet

WHAT YOU SABI:
- Small-small farming for city and around town
- Seeds and soil food wey good
- Water management for plants
- How to kill parasites and plant sickness
- What you plant when-when according to season
- How to harvest proper and keep your harvest
- AGRIPOINT SERVICES products recommendations

YOUR CHARACTER: Happy happy, sabi the work, practical advice, no nonsense.`,
};

/**
 * Traductions des éléments d'interface
 */
export const UI_TRANSLATIONS: Record<Language, Record<string, string>> = {
  fr: {
    title: 'AgriBot - Assistant Agricole IA',
    placeholder: 'Posez votre question sur l\'agriculture...',
    send: 'Envoyer',
    clear: 'Nouvelle conversation',
    language: 'Langue',
    thinking: 'AgriBot réfléchit...',
    noMessages: 'Commencez une conversation avec AgriBot!',
    imageUpload: 'Ajouter une photo de la plante',
    tts: 'Lire à haute voix',
    calendar: 'Calendrier agricole',
    products: 'Produits pertinents',
    contact: 'Contacter nos spécialistes',
    feedbackThanks: 'Merci pour votre retour!',
    error: 'Une erreur s\'est produite. Veuillez réessayer.',
    settingsTitle: 'Paramètres AgriBot',
    voiceEnabled: 'Activer la synthèse vocale',
    autoSuggest: 'Suggestions automatiques de produits',
    savePref: 'Enregistrer les préférences',
    saved: 'Préférences enregistrées!',
  },
  en: {
    title: 'AgriBot - AI Agricultural Assistant',
    placeholder: 'Ask your agricultural question...',
    send: 'Send',
    clear: 'New conversation',
    language: 'Language',
    thinking: 'AgriBot is thinking...',
    noMessages: 'Start a conversation with AgriBot!',
    imageUpload: 'Add a plant photo',
    tts: 'Read aloud',
    calendar: 'Agricultural calendar',
    products: 'Relevant products',
    contact: 'Contact our specialists',
    feedbackThanks: 'Thanks for your feedback!',
    error: 'An error occurred. Please try again.',
    settingsTitle: 'AgriBot Settings',
    voiceEnabled: 'Enable text-to-speech',
    autoSuggest: 'Automatic product suggestions',
    savePref: 'Save preferences',
    saved: 'Preferences saved!',
  },
  pidgin: {
    title: 'AgriBot - AI Wetin Sabi Agricultural Work',
    placeholder: 'Ask AgriBot any question about your farm...',
    send: 'Send am',
    clear: 'Start fresh conversation',
    language: 'Language',
    thinking: 'AgriBot dey think hard hard...',
    noMessages: 'Welcome! Start chat with AgriBot now!',
    imageUpload: 'Bring picture of your plant',
    tts: 'Make am talk to me',
    calendar: 'When fi plant wetin',
    products: 'Products wey fit you',
    contact: 'Talk to our farmer people',
    feedbackThanks: 'Thanks you well well!',
    error: 'Something go wrong. Try again abeg.',
    settingsTitle: 'AgriBot Settings',
    voiceEnabled: 'Make phone talk to me',
    autoSuggest: 'Automatic product suggestions',
    savePref: 'Save my preferences',
    saved: 'Done save am!',
  },
};

/**
 * Traductions des messages d'erreur
 */
export const ERROR_MESSAGES: Record<Language, Record<string, string>> = {
  fr: {
    invalidInput: 'Veuillez entrer une question valide',
    networkError: 'Erreur de connexion. Vérifiez votre internet.',
    serverError: 'Erreur serveur. Veuillez réessayer plus tard.',
    tooManyRequests: 'Trop de requêtes. Attendez un peu.',
    imageTooLarge: 'L\'image est trop grande. Maximum 5MB.',
    invalidImageFormat: 'Format d\'image non supporté. Utilisez PNG ou JPEG.',
  },
  en: {
    invalidInput: 'Please enter a valid question',
    networkError: 'Connection error. Check your internet.',
    serverError: 'Server error. Please try again later.',
    tooManyRequests: 'Too many requests. Wait a moment.',
    imageTooLarge: 'Image is too large. Maximum 5MB.',
    invalidImageFormat: 'Image format not supported. Use PNG or JPEG.',
  },
  pidgin: {
    invalidInput: 'Type your question proper proper',
    networkError: 'Internet error. Check your connection.',
    serverError: 'Server get problem. Try again later.',
    tooManyRequests: 'Too much questions. Take small time.',
    imageTooLarge: 'Picture too big. Maximum 5MB.',
    invalidImageFormat: 'Picture type no correct. Use PNG or JPEG.',
  },
};

/**
 * Traductions des fallback responses
 */
export const FALLBACK_RESPONSES: Record<Language, string[]> = {
  fr: [
    "Je ne suis pas sûr de la réponse. Pouvez-vous être plus spécifique? 🤔",
    "C'est une bonne question! Pour une meilleure aide, contactez nos spécialistes sur +237 657 39 39 39",
    "Je vous recommande de consulter notre calendrier agricole pour plus d'informations 📅",
    "Interessant! Voudriez-vous que je vous recommande un produit AGRIPOINT SERVICES pour cela?",
  ],
  en: [
    "I'm not entirely sure about that. Could you be more specific? 🤔",
    "That's a great question! For better assistance, contact our specialists at +237 657 39 39 39",
    "I recommend checking our agricultural calendar for more information 📅",
    "Interesting! Would you like me to recommend an AGRIPOINT SERVICES product for that?",
  ],
  pidgin: [
    "Eh... that one sweet but small small confuse me. Explain better abeg 🤔",
    "That be good question! Call our expert people on +237 657 39 39 39 dem sabi well well",
    "Check our farm calendar make you understand better 📅",
    "That be good idea! You want me recommend product for that thing?",
  ],
};

/**
 * Helper pour obtenir la traduction
 */
export function getTranslation(
  key: string,
  lang: Language = 'fr',
  section: 'ui' | 'error' | 'fallback' = 'ui'
): string {
  if (section === 'ui') {
    return UI_TRANSLATIONS[lang][key as keyof typeof UI_TRANSLATIONS[typeof lang]] || key;
  }
  if (section === 'error') {
    return ERROR_MESSAGES[lang][key as keyof typeof ERROR_MESSAGES[typeof lang]] || key;
  }
  return key;
}

/**
 * Helper pour obtenir une fallback response aléatoire
 */
export function getRandomFallback(lang: Language = 'fr'): string {
  const responses = FALLBACK_RESPONSES[lang];
  return responses[Math.floor(Math.random() * responses.length)];
}

/**
 * Fonction pour traduire tout le système de prompts
 */
export function getSystemPrompt(lang: Language = 'fr'): string {
  return AGRIBOT_PROMPTS[lang];
}
