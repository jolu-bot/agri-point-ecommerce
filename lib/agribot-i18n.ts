/**
 * Configuration i18n complète pour AgriBot (FR/EN/Pidgin)
 * Traductions des prompts, de l'interface et de tous les contenus textuels.
 *
 * Architecture :
 *  - AGRIBOT_PROMPTS          : prompts système OpenAI
 *  - UI_TRANSLATIONS          : clés courtes historiques (rétrocompatibilité)
 *  - AGRIBOT_UI               : UI complète structurée par section
 *  - INTENT_LABELS            : libellés des badges d'intention
 *  - ELIGIBILITY_QUESTIONS    : questions du widget d'éligibilité campagne
 *  - DEFAULT_SUGGESTIONS      : chips de suggestions par défaut
 *  - CAMPAIGN_SUGGESTIONS     : chips spécifiques à la page campagne
 *  - ERROR_MESSAGES           : messages d'erreur
 *  - FALLBACK_RESPONSES       : réponses de repli aléatoires
 *  - getWelcomeMessage        : message d'accueil contextuel selon la page
 *  - getTranslation           : helper d'accès par clé courte
 *  - getRandomFallback        : fallback aléatoire
 *  - getSystemPrompt          : prompt système IA
 */

export type Language = 'fr' | 'en' | 'pidgin';

export const SUPPORTED_LANGUAGES: { [key in Language]: string } = {
  fr: '🇨🇲 Français',
  en: '🇬🇧 English',
  pidgin: '🎤 Pidgin English',
};

// ═══════════════════════════════════════════════════════════════════
// PROMPTS SYSTÈME OPENAI
// ═══════════════════════════════════════════════════════════════════
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

// ═══════════════════════════════════════════════════════════════════
// UI_TRANSLATIONS — clés courtes (rétrocompatibilité)
// ═══════════════════════════════════════════════════════════════════
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

// ═══════════════════════════════════════════════════════════════════
// AGRIBOT_UI — interface structurée complète (nouvelle API)
// ═══════════════════════════════════════════════════════════════════
export type AgribotUIStrings = typeof AGRIBOT_UI.fr;

export const AGRIBOT_UI = {
  fr: {
    fab: {
      ariaOpen:  'Ouvrir l\'Assistant AGRIPOINT SERVICES',
      ariaClose: 'Fermer l\'Assistant AGRIPOINT SERVICES',
    },
    header: {
      name:          'Assistant AGRIPOINT SERVICES',
      subtitleBase:  'Expert Agricole IA · Cameroun',
      expertBanner:  'Un Conseiller Expert AGRIPOINT SERVICES peut intervenir à tout moment',
      fullscreen:    'Plein écran',
      minimize:      'Réduire',
      resetTitle:    'Nouvelle conversation',
      locationTitle: 'Ma localisation',
      locationAria:  'Définir ma localisation',
      mapTitle:      'Nos distributeurs',
      mapAria:       'Voir la carte des distributeurs',
      optionsTitle:  'Options',
      optionsAria:   'Options',
    },
    options: {
      save:      'Sauvegarder',
      history:   'Historique',
      exportTxt: 'Exporter TXT',
      copyAll:   'Tout copier',
      byEmail:   'Par email',
      ttsOn:     '🔊 Voix activée — cliquer pour désactiver',
      ttsOff:    '🔇 Activer la voix (TTS)',
    },
    history: {
      title:      'Conversations sauvegardées',
      empty:      'Aucune conversation sauvegardée',
      deleteAria: 'Supprimer cette conversation',
      deleteTitle:'Supprimer',
    },
    messages: {
      scrollToBottom: 'Défiler vers le bas',
    },
    image: {
      preview:     'Aperçu de la photo',
      ready:       'Photo prête pour diagnostic IA',
      analyze:     'Analyser',
      removeAria:  'Supprimer la photo',
      uploadTitle: 'Envoyer une photo pour diagnostic',
      uploadAria:  'Diagnostic photo',
      failAnalysis:'⚠️ Analyse impossible.\n\nVérifiez que votre image est claire et bien cadrée, puis réessayez.',
      networkError:'⚠️ Erreur réseau. Réessayez.',
      tooBig:      '⚠️ Image trop grande (max 5 Mo)',
      toolStatus:  '🔍 Analyse de la photo en cours…',
      userLabel:   '📷 **Diagnostic photo** — ',
    },
    input: {
      placeholder: 'Votre question…',
      send:        'Envoyer',
      voiceStart:  'Dicter un message',
      voiceStop:   'Arrêter la dictée',
    },
    feedback: {
      helpfulTitle:    'Utile',
      helpfulAria:     'Marquer comme utile',
      notHelpfulTitle: 'Pas utile',
      notHelpfulAria:  'Marquer comme inutile',
      listenTitle:     'Écouter ce message',
      listenAria:      'Écouter ce message',
    },
    copy: {
      title: 'Copier',
      label: 'Copier le message',
    },
    escalation: {
      title:    'Besoin d\'un conseiller humain ?',
      desc:     'Pour les cas complexes ou urgences terrain, un agronome AGRIPOINT SERVICES est disponible maintenant.',
      whatsapp: 'WhatsApp un conseiller',
      call:     'Appeler +237 657 39 39 39',
      waPrefix: 'Bonjour, j\'ai besoin d\'aide après ma conversation avec l\'Assistant d\'AGRIPOINT SERVICES.\n\nSujet : ',
    },
    eligibility: {
      title:             '🌾 Vérification éligibilité',
      yes:               '✅ Oui',
      no:                '❌ Non',
      resultEligible:    (summary: string) =>
        `✅ Test d'éligibilité campagne :\n${summary}\n\nJe remplis toutes les conditions ! Comment m'inscrire à la campagne Mars 2026 ?`,
      resultNotEligible: (summary: string) =>
        `❌ Test d'éligibilité campagne :\n${summary}\n\nJe ne remplis pas toutes les conditions. Que puis-je faire ?`,
    },
    distributors: {
      title:     'Nos Distributeurs',
      closeAria: 'Fermer la modal',
      closeTitle:'Fermer',
    },
    location: {
      title:       'Votre localisation',
      subtitle:    'Indiquez votre ville pour des conseils adaptés à votre climat.',
      current:     'Actuel : ',
      clear:       'Effacer',
      otherCity:   'Autre ville…',
      cancel:      'Annuler',
      toastPrefix: 'Localisation',
      cleared:     '📍 Localisation effacée',
      closeAria:   'Fermer',
    },
    toast: {
      noMessages: 'Aucun message à sauvegarder.',
      saved:      '✅ Conversation sauvegardée !',
      loaded:     '📂 Conversation chargée',
      deleted:    '🗑️ Supprimée',
      copied:     '✅ Conversation copiée !',
      voiceOn:    '🔊 Voix activée',
      voiceOff:   '🔇 Voix désactivée',
    },
    email: {
      subject:    'Mon résumé — Assistant AGRIPOINT SERVICES',
      bodyPrefix: 'Résumé de ma conversation avec l\'Assistant AGRIPOINT SERVICES :',
      footer:     'AGRIPOINT SERVICES | https://agri-ps.com | +237 657 39 39 39',
      me:         'Vous',
    },
    seasonal: {
      closeAria: 'Fermer la bannière saisonnière',
    },
    autoOpen: {
      campaign: '👋 Bonjour ! Je suis **l\'Assistant d\'AGRIPOINT SERVICES** 🌾\n\nJe vois que vous consultez la **Campagne Engrais Mars 2026**.\n\nVoulez-vous que je **vérifie votre éligibilité** maintenant en 3 questions ? Ou besoin d\'aide pour remplir le formulaire ?',
      products: '👋 Bonjour ! Je suis **l\'Assistant d\'AGRIPOINT SERVICES** 🌿\n\nVous parcourez notre catalogue de biofertilisants.\n\nDites-moi votre **culture** et je vous recommande les produits les plus adaptés avec les doses exactes !',
    },
    chat: {
      connectionError: '⚠️ Erreur de connexion. Réessayez ou contactez-nous au 📞 +237 657 39 39 39',
      techError:       'Erreur technique.',
    },
    footer: 'AI Assistant · AGRIPOINT SERVICES · +237 657 39 39 39',
  },

  en: {
    fab: {
      ariaOpen:  'Open AGRIPOINT SERVICES Assistant',
      ariaClose: 'Close AGRIPOINT SERVICES Assistant',
    },
    header: {
      name:          'AGRIPOINT SERVICES Assistant',
      subtitleBase:  'AI Agricultural Expert · Cameroon',
      expertBanner:  'An AGRIPOINT SERVICES Expert Advisor can step in at any time',
      fullscreen:    'Full screen',
      minimize:      'Minimize',
      resetTitle:    'New conversation',
      locationTitle: 'My location',
      locationAria:  'Set my location',
      mapTitle:      'Our distributors',
      mapAria:       'View distributors map',
      optionsTitle:  'Options',
      optionsAria:   'Options',
    },
    options: {
      save:      'Save',
      history:   'History',
      exportTxt: 'Export TXT',
      copyAll:   'Copy all',
      byEmail:   'By email',
      ttsOn:     '🔊 Voice on — click to disable',
      ttsOff:    '🔇 Enable voice (TTS)',
    },
    history: {
      title:      'Saved conversations',
      empty:      'No saved conversations',
      deleteAria: 'Delete this conversation',
      deleteTitle:'Delete',
    },
    messages: {
      scrollToBottom: 'Scroll to bottom',
    },
    image: {
      preview:     'Photo preview',
      ready:       'Photo ready for AI diagnosis',
      analyze:     'Analyze',
      removeAria:  'Remove photo',
      uploadTitle: 'Send a photo for diagnosis',
      uploadAria:  'Photo diagnosis',
      failAnalysis:'⚠️ Analysis failed.\n\nMake sure your image is clear and well-framed, then try again.',
      networkError:'⚠️ Network error. Please try again.',
      tooBig:      '⚠️ Image too large (max 5 MB)',
      toolStatus:  '🔍 Analysing photo…',
      userLabel:   '📷 **Photo diagnosis** — ',
    },
    input: {
      placeholder: 'Your question…',
      send:        'Send',
      voiceStart:  'Dictate a message',
      voiceStop:   'Stop dictation',
    },
    feedback: {
      helpfulTitle:    'Helpful',
      helpfulAria:     'Mark as helpful',
      notHelpfulTitle: 'Not helpful',
      notHelpfulAria:  'Mark as not helpful',
      listenTitle:     'Listen to this message',
      listenAria:      'Listen to this message',
    },
    copy: {
      title: 'Copy',
      label: 'Copy message',
    },
    escalation: {
      title:    'Need a human advisor?',
      desc:     'For complex cases or field emergencies, an AGRIPOINT SERVICES agronomist is available now.',
      whatsapp: 'WhatsApp an advisor',
      call:     'Call +237 657 39 39 39',
      waPrefix: 'Hello, I need help after my conversation with the AGRIPOINT SERVICES Assistant.\n\nSubject: ',
    },
    eligibility: {
      title:             '🌾 Eligibility check',
      yes:               '✅ Yes',
      no:                '❌ No',
      resultEligible:    (summary: string) =>
        `✅ Campaign eligibility check:\n${summary}\n\nI meet all the conditions! How do I register for the March 2026 campaign?`,
      resultNotEligible: (summary: string) =>
        `❌ Campaign eligibility check:\n${summary}\n\nI do not meet all the conditions. What can I do?`,
    },
    distributors: {
      title:     'Our Distributors',
      closeAria: 'Close modal',
      closeTitle:'Close',
    },
    location: {
      title:       'Your location',
      subtitle:    'Enter your city for advice tailored to your climate.',
      current:     'Current: ',
      clear:       'Clear',
      otherCity:   'Other city…',
      cancel:      'Cancel',
      toastPrefix: 'Location',
      cleared:     '📍 Location cleared',
      closeAria:   'Close',
    },
    toast: {
      noMessages: 'No messages to save.',
      saved:      '✅ Conversation saved!',
      loaded:     '📂 Conversation loaded',
      deleted:    '🗑️ Deleted',
      copied:     '✅ Conversation copied!',
      voiceOn:    '🔊 Voice enabled',
      voiceOff:   '🔇 Voice disabled',
    },
    email: {
      subject:    'My summary — AGRIPOINT SERVICES Assistant',
      bodyPrefix: 'Summary of my conversation with the AGRIPOINT SERVICES Assistant:',
      footer:     'AGRIPOINT SERVICES | https://agri-ps.com | +237 657 39 39 39',
      me:         'You',
    },
    seasonal: {
      closeAria: 'Close seasonal banner',
    },
    autoOpen: {
      campaign: '👋 Hello! I am the **AGRIPOINT SERVICES Assistant** 🌾\n\nI see you are browsing the **Fertilizer Campaign March 2026**.\n\nShall I **check your eligibility** now in 3 quick questions? Or do you need help filling in the form?',
      products: '👋 Hello! I am the **AGRIPOINT SERVICES Assistant** 🌿\n\nYou are browsing our biofertilizer catalog.\n\nTell me your **crop** and I will recommend the most suitable products with exact dosages!',
    },
    chat: {
      connectionError: '⚠️ Connection error. Try again or contact us at 📞 +237 657 39 39 39',
      techError:       'Technical error.',
    },
    footer: 'AI Assistant · AGRIPOINT SERVICES · +237 657 39 39 39',
  },
} as const;

// ═══════════════════════════════════════════════════════════════════
// INTENT LABELS — libellés des badges de classification
// ═══════════════════════════════════════════════════════════════════
export const INTENT_LABELS: Record<string, Record<string, string>> = {
  fr: {
    conseil:    'Conseil',
    produit:    'Produit',
    commande:   'Commande',
    compte:     'Mon compte',
    urgence:    'Urgent',
    culture:    'Culture',
    campagne:   'Campagne',
    roi:        'ROI',
    navigation: 'Navigation',
  },
  en: {
    conseil:    'Advice',
    produit:    'Product',
    commande:   'Order',
    compte:     'My account',
    urgence:    'Urgent',
    culture:    'Crop',
    campagne:   'Campaign',
    roi:        'ROI',
    navigation: 'Navigation',
  },
  pidgin: {
    conseil:    'Advice',
    produit:    'Product',
    commande:   'Order',
    compte:     'My account',
    urgence:    'Urgent',
    culture:    'Farm',
    campagne:   'Campaign',
    roi:        'ROI',
    navigation: 'Navigation',
  },
};

// ═══════════════════════════════════════════════════════════════════
// ELIGIBILITY QUESTIONS — widget campagne engrais
// ═══════════════════════════════════════════════════════════════════
export interface EligibilityQuestion {
  text: string;
  icon: string;
}

export const ELIGIBILITY_QUESTIONS: Record<Language, EligibilityQuestion[]> = {
  fr: [
    { text: 'Être membre d\'une coopérative agréée (reconnue MINADER) ?', icon: '🏢' },
    { text: 'Adhérer à une mutuelle agricole (CICAN, CAMAO ou agréé) ?',  icon: '🤝' },
    { text: 'Commander au minimum 6 sacs ou litres ?',                    icon: '📦' },
  ],
  en: [
    { text: 'Be a member of an approved cooperative (recognized by MINADER)?', icon: '🏢' },
    { text: 'Belong to an agricultural mutual (CICAN, CAMAO or approved)?',     icon: '🤝' },
    { text: 'Order a minimum of 6 bags or liters?',                            icon: '📦' },
  ],
  pidgin: [
    { text: 'You be member of cooperative wey government approve (MINADER)?',    icon: '🏢' },
    { text: 'You dey for agricultural mutual group (CICAN, CAMAO or approved)?', icon: '🤝' },
    { text: 'You fit order minimum 6 bags or liters?',                          icon: '📦' },
  ],
};

// ═══════════════════════════════════════════════════════════════════
// SUGGESTIONS — chips de suggestions par défaut et par page
// ═══════════════════════════════════════════════════════════════════
export interface Suggestion {
  label:  string;
  text:   string;
  intent: string;
}

export const DEFAULT_SUGGESTIONS: Record<string, Suggestion[]> = {
  fr: [
    { label: 'Tomates',          text: 'Quel programme complet pour mes tomates ?',               intent: 'culture'    },
    { label: 'Cacao/Café',       text: 'Conseils pour booster mon cacao et café ?',                intent: 'culture'    },
    { label: 'Jardinage urbain', text: 'Comment jardiner sur mon balcon en ville ?',                intent: 'conseil'    },
    { label: 'Commander',        text: 'Comment passer une commande sur le site ?',                intent: 'commande'   },
    { label: 'Livraison',        text: 'Délais et frais de livraison ?',                           intent: 'commande'   },
    { label: 'ROI',              text: 'Combien puis-je gagner avec vos produits sur 1 Ha ?',      intent: 'roi'        },
    { label: 'Mon compte',       text: 'Comment créer mon compte client ?',                        intent: 'compte'     },
    { label: 'Saison',           text: 'Quels produits utiliser en ce moment ?',                   intent: 'conseil'    },
    { label: 'Événements',       text: 'Quels sont les prochains événements AGRIPOINT SERVICES ?', intent: 'navigation' },
  ],
  en: [
    { label: 'Tomatoes',        text: 'What is the complete program for my tomatoes?',          intent: 'culture'    },
    { label: 'Cocoa/Coffee',    text: 'Tips to boost my cocoa and coffee production?',          intent: 'culture'    },
    { label: 'Urban gardening', text: 'How to garden on my balcony in the city?',                intent: 'conseil'    },
    { label: 'Place an order',  text: 'How do I place an order on the website?',                intent: 'commande'   },
    { label: 'Delivery',        text: 'Delivery times and costs?',                              intent: 'commande'   },
    { label: 'ROI',             text: 'How much can I earn with your products on 1 Ha?',        intent: 'roi'        },
    { label: 'My account',      text: 'How do I create my customer account?',                   intent: 'compte'     },
    { label: 'Season',          text: 'Which products should I use right now?',                 intent: 'conseil'    },
    { label: 'Events',          text: 'What are the upcoming AGRIPOINT SERVICES events?',       intent: 'navigation' },
  ],
};

export const CAMPAIGN_SUGGESTIONS: Record<string, Suggestion[]> = {
  fr: [
    { label: 'Vérifier éligibilité', text: '3_ELIGIBILITY_FLOW',                                                                      intent: 'campagne' },
    { label: 'Guide formulaire',     text: 'Comment remplir le formulaire d\'inscription à la campagne Mars 2026 ?',                  intent: 'campagne' },
    { label: 'Paiement 70/30',       text: 'Expliquez-moi le paiement acompte 70% + 30% livraison de la campagne.',                  intent: 'campagne' },
    { label: 'Conditions',           text: 'Quelles sont exactement les conditions pour participer à la campagne engrais ?',          intent: 'campagne' },
  ],
  en: [
    { label: 'Check eligibility', text: '3_ELIGIBILITY_FLOW',                                                                         intent: 'campagne' },
    { label: 'Form guide',        text: 'How do I fill in the registration form for the March 2026 campaign?',                       intent: 'campagne' },
    { label: '70/30 payment',     text: 'Can you explain the 70% upfront + 30% on delivery payment scheme for the campaign?',        intent: 'campagne' },
    { label: 'Conditions',        text: 'What are the exact conditions to participate in the fertilizer campaign?',                  intent: 'campagne' },
  ],
};

// ═══════════════════════════════════════════════════════════════════
// WELCOME MESSAGES — messages d'accueil contextuels par page
// ═══════════════════════════════════════════════════════════════════
const WELCOME_MESSAGES = {
  fr: {
    campagne: 'Bienvenue sur la **Campagne Engrais Mars 2026** 🌾\n\nJe suis **l\'Assistant d\'AGRIPOINT SERVICES** — votre conseiller expert 24h/24. Je vois que vous consultez notre offre spéciale.\n\nJe peux :\n- ✅ **Vérifier votre éligibilité** en 3 questions\n- 📝 **Guider le formulaire** champ par champ\n- 💳 Expliquer le **paiement 70/30**\n\nUn Conseiller Expert AGRIPOINT SERVICES peut aussi intervenir si besoin.\n\nComment puis-je vous aider ?',
    produits: 'Bonjour ! Je suis **l\'Assistant d\'AGRIPOINT SERVICES** 🌿\n\nVous explorez notre catalogue de biofertilisants.\n\nDites-moi votre **type de culture** et je vous recommande les produits les plus adaptés avec les doses exactes !\n\n🌱 Tomate, cacao, café, maïs, agrumes… Quelle est votre culture ?',
    checkout: 'Bonjour ! Je suis **l\'Assistant d\'AGRIPOINT SERVICES** 🛒\n\nVous êtes en cours de commande. Besoin d\'aide avec les **modes de paiement**, les **délais de livraison** ou une question sur votre commande ?',
    contact:  'Bonjour ! Je suis **l\'Assistant d\'AGRIPOINT SERVICES** 📞\n\nVous êtes sur la page Contact. Je peux vous orienter vers le bon département :\n- 🤝 **Service Client** — commandes et livraisons\n- 🌾 **Conseil Agricole** — recommandations techniques\n- 🤝 **Partenariats** — devenir distributeur\n\nQuelle est votre demande ?',
    default:  'Bonjour ! Je suis **l\'Assistant d\'AGRIPOINT SERVICES** 🌿 — votre conseiller agricole expert 24h/24.\n\nJe peux vous aider à :\n- 🌱 **Conseils cultures** : tomate, cacao, café, maïs, agrumes…\n- 💰 Calculer votre **ROI** avec nos produits\n- 🌾 La **Campagne Mars 2026** — prix spéciaux\n- 🛒 **Commander** et suivre vos livraisons\n\n💡 *Un Conseiller Expert AGRIPOINT SERVICES peut également intervenir à tout moment.*\n\nComment puis-je vous aider aujourd\'hui ?',
  },
  en: {
    campagne: 'Welcome to the **Fertilizer Campaign March 2026** 🌾\n\nI am the **AGRIPOINT SERVICES Assistant** — your expert advisor 24/7. I see you are browsing our special offer.\n\nI can:\n- ✅ **Check your eligibility** in 3 questions\n- 📝 **Guide you through the form** step by step\n- 💳 Explain the **70/30 payment** scheme\n\nAn AGRIPOINT SERVICES Expert Advisor can also step in if needed.\n\nHow can I help you?',
    produits: 'Hello! I am the **AGRIPOINT SERVICES Assistant** 🌿\n\nYou are exploring our biofertilizer catalog.\n\nTell me your **crop type** and I will recommend the most suitable products with exact dosages!\n\n🌱 Tomato, cocoa, coffee, maize, citrus… What is your crop?',
    checkout: 'Hello! I am the **AGRIPOINT SERVICES Assistant** 🛒\n\nYou are in the process of ordering. Need help with **payment methods**, **delivery times** or a question about your order?',
    contact:  'Hello! I am the **AGRIPOINT SERVICES Assistant** 📞\n\nYou are on the Contact page. I can direct you to the right department:\n- 🤝 **Customer Service** — orders and deliveries\n- 🌾 **Agricultural Advice** — technical recommendations\n- 🤝 **Partnerships** — become a distributor\n\nWhat is your request?',
    default:  'Hello! I am the **AGRIPOINT SERVICES Assistant** 🌿 — your expert agricultural advisor 24/7.\n\nI can help you with:\n- 🌱 **Crop advice**: tomato, cocoa, coffee, maize, citrus…\n- 💰 Calculate your **ROI** with our products\n- 🌾 The **March 2026 Campaign** — special prices\n- 🛒 **Order** and track your deliveries\n\n💡 *An AGRIPOINT SERVICES Expert Advisor can also step in at any time.*\n\nHow can I help you today?',
  },
};

/**
 * Retourne le message d'accueil contextuel selon la page courante et la langue.
 */
export function getWelcomeMessage(path: string | null, locale: string = 'fr'): string {
  const lang = locale === 'en' ? 'en' : 'fr';
  const msgs = WELCOME_MESSAGES[lang];
  if (path?.includes('campagne')) return msgs.campagne;
  if (path?.includes('produits')) return msgs.produits;
  if (path?.includes('checkout') || path?.includes('panier')) return msgs.checkout;
  if (path?.includes('contact'))  return msgs.contact;
  return msgs.default;
}

// ═══════════════════════════════════════════════════════════════════
// ERROR MESSAGES
// ═══════════════════════════════════════════════════════════════════
export const ERROR_MESSAGES: Record<Language, Record<string, string>> = {
  fr: {
    invalidInput:       'Veuillez entrer une question valide',
    networkError:       'Erreur de connexion. Vérifiez votre internet.',
    serverError:        'Erreur serveur. Veuillez réessayer plus tard.',
    tooManyRequests:    'Trop de requêtes. Attendez un peu.',
    imageTooLarge:      'L\'image est trop grande. Maximum 5MB.',
    invalidImageFormat: 'Format d\'image non supporté. Utilisez PNG ou JPEG.',
  },
  en: {
    invalidInput:       'Please enter a valid question',
    networkError:       'Connection error. Check your internet.',
    serverError:        'Server error. Please try again later.',
    tooManyRequests:    'Too many requests. Wait a moment.',
    imageTooLarge:      'Image is too large. Maximum 5MB.',
    invalidImageFormat: 'Image format not supported. Use PNG or JPEG.',
  },
  pidgin: {
    invalidInput:       'Type your question proper proper',
    networkError:       'Internet error. Check your connection.',
    serverError:        'Server get problem. Try again later.',
    tooManyRequests:    'Too much questions. Take small time.',
    imageTooLarge:      'Picture too big. Maximum 5MB.',
    invalidImageFormat: 'Picture type no correct. Use PNG or JPEG.',
  },
};

// ═══════════════════════════════════════════════════════════════════
// FALLBACK RESPONSES
// ═══════════════════════════════════════════════════════════════════
export const FALLBACK_RESPONSES: Record<Language, string[]> = {
  fr: [
    'Je ne suis pas sûr de la réponse. Pouvez-vous être plus spécifique? 🤔',
    'C\'est une bonne question! Pour une meilleure aide, contactez nos spécialistes sur +237 657 39 39 39',
    'Je vous recommande de consulter notre calendrier agricole pour plus d\'informations 📅',
    'Interessant! Voudriez-vous que je vous recommande un produit AGRIPOINT SERVICES pour cela?',
  ],
  en: [
    'I\'m not entirely sure about that. Could you be more specific? 🤔',
    'That\'s a great question! For better assistance, contact our specialists at +237 657 39 39 39',
    'I recommend checking our agricultural calendar for more information 📅',
    'Interesting! Would you like me to recommend an AGRIPOINT SERVICES product for that?',
  ],
  pidgin: [
    'Eh... that one sweet but small small confuse me. Explain better abeg 🤔',
    'That be good question! Call our expert people on +237 657 39 39 39 dem sabi well well',
    'Check our farm calendar make you understand better 📅',
    'That be good idea! You want me recommend product for that thing?',
  ],
};

// ═══════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════

/** Retourne une traduction UI par clé courte (rétrocompatibilité). */
export function getTranslation(
  key: string,
  lang: Language = 'fr',
  section: 'ui' | 'error' | 'fallback' = 'ui',
): string {
  if (section === 'ui')    return UI_TRANSLATIONS[lang][key] || key;
  if (section === 'error') return ERROR_MESSAGES[lang][key]  || key;
  return key;
}

/** Retourne une fallback response aléatoire. */
export function getRandomFallback(lang: Language = 'fr'): string {
  const responses = FALLBACK_RESPONSES[lang];
  return responses[Math.floor(Math.random() * responses.length)];
}

/** Retourne le prompt système IA pour la langue donnée. */
export function getSystemPrompt(lang: Language = 'fr'): string {
  return AGRIBOT_PROMPTS[lang];
}
