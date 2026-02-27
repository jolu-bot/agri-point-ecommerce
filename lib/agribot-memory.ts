// ═══════════════════════════════════════════════════════════════════
// AGRIBOT MEMORY — Système de mémoire client persistant
// Stockage : localStorage côté client, envoyé à chaque requête API
// ═══════════════════════════════════════════════════════════════════

export interface UserMemory {
  sessionId: string;
  location?: string;          // "Yaoundé", "Douala", "Bafoussam"…
  region?: string;            // "Centre", "Littoral", "Ouest", "Nord"…
  mainCrops?: string[];       // ["tomate", "cacao", "café"]
  surface?: string;           // "500m²", "2Ha", "balcon"
  farmType?: string;          // "urbain" | "rural" | "coopérative"
  keyFacts: string[];         // Faits extraits des conversations
  conversationCount: number;
  lastSeen: string;           // ISO date
  preferredTopic?: string;    // Dernier sujet principal
}

export interface SavedConversation {
  id: string;
  title: string;
  messages: Array<{ role: 'user' | 'assistant'; content: string; timestamp: string }>;
  createdAt: string;
  userMemory?: Partial<UserMemory>;
}

// ─── Motifs de détection de localisation ──────────────────────────
const LOCATION_PATTERNS: Array<{ pattern: RegExp; location: string; region: string }> = [
  { pattern: /yaound[eé]/i,          location: 'Yaoundé',         region: 'Centre' },
  { pattern: /douala/i,              location: 'Douala',          region: 'Littoral' },
  { pattern: /bafoussam/i,           location: 'Bafoussam',       region: 'Ouest' },
  { pattern: /garoua/i,              location: 'Garoua',          region: 'Nord' },
  { pattern: /maroua/i,              location: 'Maroua',          region: 'Extrême-Nord' },
  { pattern: /ngaounder[eé]/i,       location: 'Ngaoundéré',      region: 'Adamaoua' },
  { pattern: /bertoua/i,             location: 'Bertoua',         region: 'Est' },
  { pattern: /ebolowa/i,             location: 'Ebolowa',         region: 'Sud' },
  { pattern: /bamenda/i,             location: 'Bamenda',         region: 'Nord-Ouest' },
  { pattern: /buea/i,                location: 'Buea',            region: 'Sud-Ouest' },
  { pattern: /kribi/i,               location: 'Kribi',           region: 'Sud' },
  { pattern: /limb[eé]/i,            location: 'Limbé',           region: 'Sud-Ouest' },
  { pattern: /edea/i,                location: 'Edéa',            region: 'Littoral' },
  { pattern: /foumban/i,             location: 'Foumban',         region: 'Ouest' },
  { pattern: /mbalmayo/i,            location: 'Mbalmayo',        region: 'Centre' },
  { pattern: /eseka|eséka/i,         location: 'Eséka',           region: 'Centre' },
  { pattern: /obala/i,               location: 'Obala',           region: 'Centre' },
  { pattern: /mezam/i,               location: 'Mezam',           region: 'Nord-Ouest' },
  { pattern: /wouri/i,               location: 'Wouri',           region: 'Littoral' },
  { pattern: /\bcentre\b/i,          location: 'Centre Cameroun', region: 'Centre' },
  { pattern: /\blittoral\b/i,        location: 'Littoral',        region: 'Littoral' },
  { pattern: /\bouest\b/i,           location: 'Ouest Cameroun',  region: 'Ouest' },
  { pattern: /\bnord(?:-|\s)?ouest\b/i, location: 'Nord-Ouest',   region: 'Nord-Ouest' },
  { pattern: /\bsud(?:-|\s)?ouest\b/i,  location: 'Sud-Ouest',    region: 'Sud-Ouest' },
  { pattern: /\badamaoua\b/i,        location: 'Adamaoua',        region: 'Adamaoua' },
  { pattern: /\best\b.*cameroun|cameroun.*est\b/i, location: 'Est Cameroun', region: 'Est' },
  { pattern: /\bsud\b.*cameroun|cameroun.*\bsud\b/i, location: 'Sud Cameroun', region: 'Sud' },
];

// ─── Motifs de détection de cultures ──────────────────────────────
const CROP_PATTERNS = [
  'tomate', 'cacao', 'café', 'maïs', 'mais', 'banane', 'plantain',
  'igname', 'manioc', 'patate', 'arachide', 'haricot', 'poivron',
  'piment', 'oignon', 'ail', 'concombre', 'courgette', 'aubergine',
  'laitue', 'salade', 'chou', 'carotte', 'gombo', 'épinard', 'ndole',
  'palmier', 'hévéa', 'ananas', 'mangue', 'avocat', 'goyave',
  'poivre blanc', 'gingembre', 'curcuma', 'soja', 'sorgho',
];

// ─── Motifs de surface ──────────────────────────────────────────────
const SURFACE_PATTERNS = [
  { pattern: /(\d+[\s.,]?\d*)\s*ha\b/i,       unit: 'Ha' },
  { pattern: /(\d+)\s*(hectare|hectares)/i,     unit: 'Ha' },
  { pattern: /(\d+[\s.,]?\d*)\s*m[²2]/i,       unit: 'm²' },
  { pattern: /(\d+)\s*are(?:s)?\b/i,            unit: 'ares' },
  { pattern: /balcon/i,                          unit: 'balcon' },
  { pattern: /jardini[eè]re/i,                   unit: 'jardinière' },
  { pattern: /pot(?:s)?\b/i,                     unit: 'pots' },
  { pattern: /(\d+)\s*po[ct]s/i,                unit: 'pots' },
];

// ─── CRUD localStorage ────────────────────────────────────────────
const MEMORY_KEY_PREFIX = 'agribot_memory_';
const CONVERSATIONS_KEY = 'agribot_conversations';

export function loadMemory(sessionId: string): UserMemory {
  if (typeof window === 'undefined')
    return { sessionId, keyFacts: [], conversationCount: 0, lastSeen: new Date().toISOString() };
  try {
    const raw = localStorage.getItem(`${MEMORY_KEY_PREFIX}${sessionId}`);
    if (raw) return JSON.parse(raw) as UserMemory;
  } catch { /* ignore */ }
  return { sessionId, keyFacts: [], conversationCount: 0, lastSeen: new Date().toISOString() };
}

export function saveMemory(memory: UserMemory): void {
  if (typeof window === 'undefined') return;
  try {
    memory.lastSeen = new Date().toISOString();
    localStorage.setItem(`${MEMORY_KEY_PREFIX}${memory.sessionId}`, JSON.stringify(memory));
  } catch { /* ignore */ }
}

// ─── Extraction de faits depuis la conversation ───────────────────
export function extractFactsFromMessages(
  messages: Array<{ role: string; content: string }>,
  current: UserMemory
): Partial<UserMemory> {
  const updates: Partial<UserMemory> = {};
  const allText = messages.map(m => m.content).join(' ');

  // Location
  if (!current.location) {
    for (const { pattern, location, region } of LOCATION_PATTERNS) {
      if (pattern.test(allText)) {
        updates.location = location;
        updates.region   = region;
        break;
      }
    }
  }

  // Cultures
  const foundCrops = CROP_PATTERNS.filter(crop =>
    new RegExp(`\\b${crop}\\b`, 'i').test(allText)
  );
  if (foundCrops.length > 0) {
    const merged = Array.from(new Set([...(current.mainCrops || []), ...foundCrops])).slice(0, 6);
    if (merged.length > (current.mainCrops?.length ?? 0)) updates.mainCrops = merged;
  }

  // Surface
  if (!current.surface) {
    for (const { pattern, unit } of SURFACE_PATTERNS) {
      const match = allText.match(pattern);
      if (match) {
        updates.surface = unit === 'balcon' || unit === 'jardinière' || unit === 'pots'
          ? unit
          : `${match[1]} ${unit}`;
        break;
      }
    }
  }

  // Farm type
  if (!current.farmType) {
    if (/coopérative|mutuelle|groupement|CICAN|CAMAO/i.test(allText)) updates.farmType = 'coopérative';
    else if (/balcon|terrasse|appartement|urban|ville/i.test(allText))  updates.farmType = 'urbain';
    else if (/champ|plantation|ferme|rural|village/i.test(allText))     updates.farmType = 'rural';
  }

  return updates;
}

// ─── Construit le contexte mémoire à injecter dans le system prompt ──
export function buildMemoryContext(memory: UserMemory): string {
  const parts: string[] = [];
  if (memory.location)             parts.push(`📍 Localisation : ${memory.location} (${memory.region || 'Cameroun'})`);
  if (memory.mainCrops?.length)    parts.push(`🌱 Cultures : ${memory.mainCrops.join(', ')}`);
  if (memory.surface)              parts.push(`📐 Surface : ${memory.surface}`);
  if (memory.farmType)             parts.push(`🏡 Type : ${memory.farmType}`);
  if (memory.keyFacts?.length)     parts.push(`💡 Faits connus : ${memory.keyFacts.slice(0, 3).join(' | ')}`);
  if (parts.length === 0) return '';
  return `\n\n[CONTEXTE DE L'UTILISATEUR]\n${parts.join('\n')}\nTiens compte de ce contexte pour personnaliser ta réponse.`;
}

// ─── Gestion des conversations sauvegardées ───────────────────────
export function loadSavedConversations(): SavedConversation[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CONVERSATIONS_KEY);
    if (raw) return JSON.parse(raw) as SavedConversation[];
  } catch { /* ignore */ }
  return [];
}

export function saveConversation(
  messages: Array<{ role: 'user' | 'assistant'; content: string; timestamp: Date }>,
  memory: UserMemory
): SavedConversation {
  const firstUserMsg = messages.find(m => m.role === 'user');
  const title = firstUserMsg
    ? firstUserMsg.content.slice(0, 55).trim() + (firstUserMsg.content.length > 55 ? '…' : '')
    : `Conversation du ${new Date().toLocaleDateString('fr-FR')}`;

  const conv: SavedConversation = {
    id: Date.now().toString(),
    title,
    messages: messages.map(m => ({
      role: m.role,
      content: m.content,
      timestamp: m.timestamp instanceof Date ? m.timestamp.toISOString() : m.timestamp,
    })),
    createdAt: new Date().toISOString(),
    userMemory: memory.location || memory.mainCrops?.length
      ? { location: memory.location, region: memory.region, mainCrops: memory.mainCrops, surface: memory.surface }
      : undefined,
  };

  try {
    const all = loadSavedConversations();
    all.unshift(conv);
    localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(all.slice(0, 25)));
  } catch { /* ignore */ }

  return conv;
}

export function deleteSavedConversation(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    const all = loadSavedConversations().filter(c => c.id !== id);
    localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(all));
  } catch { /* ignore */ }
}

// ─── Export TXT d'une conversation ────────────────────────────────
export function exportConversationTxt(
  messages: Array<{ role: 'user' | 'assistant'; content: string; timestamp: Date }>,
  memory?: UserMemory
): void {
  const header = [
    '═══════════════════════════════════════════════',
    '  AGRI POINT SERVICES — Conversation Assistante IA',
    `  Exportée le ${new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`,
    memory?.location ? `  Localisation : ${memory.location}` : '',
    memory?.mainCrops?.length ? `  Cultures : ${memory.mainCrops.join(', ')}` : '',
    '═══════════════════════════════════════════════',
    '',
  ].filter(Boolean).join('\n');

  const body = messages
    .filter(m => m.content?.trim())
    .map(m => {
      const who = m.role === 'user' ? '👤 VOUS' : '🌿 ASSISTANT AGRI POINT';
      const time = m.timestamp instanceof Date
        ? m.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
        : '';
      const text = m.content.replace(/<[^>]+>/g, '').replace(/<!--.*?-->/gs, '').trim();
      return `${who}  ${time ? `[${time}]` : ''}\n${text}\n`;
    })
    .join('\n──────────────────────────────────────────────\n\n');

  const footer = '\n\n═══════════════════════════════════════════════\nAGRI POINT SERVICES · https://agri-ps.com\nTél : +237 657 39 39 39 · WhatsApp : 676026601\n═══════════════════════════════════════════════';

  const content = header + body + footer;
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `agribot-conversation-${new Date().toISOString().slice(0, 10)}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Partage WhatsApp d'un résumé ─────────────────────────────────
export function shareOnWhatsApp(
  messages: Array<{ role: 'user' | 'assistant'; content: string }>
): void {
  const userMessages = messages
    .filter(m => m.role === 'user')
    .map(m => `• ${m.content.slice(0, 100)}`)
    .slice(-5)
    .join('\n');

  const text = `*Résumé de ma conversation avec l'Assistant d'Agri Point Services :*\n\n${userMessages}\n\n_Obtenez vos conseils sur :_ https://agri-ps.com`;
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
}
