'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle, X, Send, ThumbsUp, ThumbsDown, RotateCcw,
  Loader2, Copy, Check, Maximize2, Minimize2, Mic, MicOff,
  ChevronDown, Sparkles, ShoppingCart, Leaf, AlertTriangle,
  UserCircle2, Package, Phone, Mail, TrendingUp, Map, Calendar,
  Settings, SaveAll, Download, History, MapPin, Share2, Trash2,
  ChevronRight, BookOpen, Cpu, Volume2, VolumeX, Image,
  ExternalLink, Globe,
} from 'lucide-react';
import {
  type UserMemory,
  type SavedConversation,
  loadMemory,
  saveMemory,
  extractFactsFromMessages,
  loadSavedConversations,
  saveConversation,
  deleteSavedConversation,
  exportConversationTxt,
  shareOnWhatsApp,
} from '@/lib/agribot-memory';
import {
  extractProductsFromText,
  getSeasonalGreeting,
} from '@/lib/agribot-calendar';
import DistributorsMap from '@/components/DistributorsMap';

// ═══════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  feedback?: 'positive' | 'negative';
  isStreaming?: boolean;
  toolStatus?: string;
  intent?: string;
  suggestions?: string[];
  escalated?: boolean;
}

type Intent = 'conseil' | 'produit' | 'commande' | 'compte' | 'urgence' | 'culture' | string;

// ═══════════════════════════════════════════════════════════════════
// MARKDOWN RENDERER — tables, listes, titres, liens, code
// ═══════════════════════════════════════════════════════════════════
function renderMarkdown(raw: string): string {
  // 1. Supprimer les balises de suggestions cachées
  let text = raw.replace(/<!--\s*SUGGESTIONS:[\s\S]*?-->/g, '').trim();

  // 2. Tableaux markdown
  text = text.replace(/((?:^\|.+\|\s*$\n?)+)/gm, (block) => {
    const rows = block.trim().split('\n').filter(r => r.trim());
    const parsed = rows.map(row =>
      row.split('|').filter((_, i, a) => i > 0 && i < a.length - 1).map(c => c.trim())
    );
    if (parsed.length < 2) return block;
    const isSep = (row: string[]) => row.every(c => /^[-:]+$/.test(c));
    const header = parsed[0];
    const body   = parsed.slice(isSep(parsed[1] || []) ? 2 : 1);
    const th = header.map(c =>
      `<th class="px-2 py-1.5 text-left text-xs font-semibold bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">${c}</th>`
    ).join('');
    const trs = body.map(row =>
      `<tr class="even:bg-gray-50 dark:even:bg-gray-800/50">${row.map(c =>
        `<td class="px-2 py-1.5 text-xs border border-gray-200 dark:border-gray-700">${c}</td>`
      ).join('')}</tr>`
    ).join('');
    return `<div class="overflow-x-auto my-2 rounded-lg border border-green-200 dark:border-green-800"><table class="w-full text-sm border-collapse"><thead><tr>${th}</tr></thead><tbody>${trs}</tbody></table></div>`;
  });

  // 3. Titres
  text = text
    .replace(/^### (.+)$/gm, '<h3 class="font-semibold text-[13px] mt-3 mb-1 text-green-800 dark:text-green-300">$1</h3>')
    .replace(/^## (.+)$/gm,  '<h2 class="font-bold text-sm mt-3 mb-1.5 text-green-900 dark:text-green-200 border-b border-green-100 dark:border-green-900 pb-1">$1</h2>');

  // 4. Listes à puces
  text = text.replace(/((?:^[-•*] .+\n?)+)/gm, (block) => {
    const items = block.trim().split('\n').map(l =>
      `<li class="flex gap-2 items-start"><span class="text-green-500 shrink-0 mt-0.5 text-xs">▸</span><span>${l.replace(/^[-•*] /, '')}</span></li>`
    ).join('');
    return `<ul class="space-y-1 my-1.5 list-none">${items}</ul>`;
  });

  // 5. Listes numérotées
  text = text.replace(/((?:^\d+\. .+\n?)+)/gm, (block) => {
    let n = 0;
    const items = block.trim().split('\n').map(l => {
      n++;
      return `<li class="flex gap-2 items-start"><span class="text-green-600 dark:text-green-400 font-bold shrink-0 min-w-[1.2rem] text-xs">${n}.</span><span>${l.replace(/^\d+\. /, '')}</span></li>`;
    }).join('');
    return `<ol class="space-y-1 my-1.5 list-none">${items}</ol>`;
  });

  // 6. Inline : gras, italique, code, liens, barré
  text = text
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/~~(.+?)~~/g, '<del class="opacity-60">$1</del>')
    .replace(/`(.+?)`/g, '<code class="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-xs font-mono text-green-700 dark:text-green-300">$1</code>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-green-600 dark:text-green-400 underline decoration-dotted hover:decoration-solid font-medium">$1 ↗</a>');

  // 7. Séparateurs
  text = text.replace(/^---+$/gm, '<hr class="my-2 border-gray-200 dark:border-gray-700"/>');

  // 8. Sauts de ligne
  text = text.replace(/\n\n/g, '</p><p class="mt-2">').replace(/\n/g, '<br/>');

  return `<p class="leading-relaxed">${text}</p>`;
}

function MarkdownMessage({ content }: { content: string }) {
  const html = useMemo(() => renderMarkdown(content), [content]);
  return (
    <div
      className="text-[13px] leading-relaxed prose-sm max-w-none [&_strong]:font-semibold [&_ul]:my-1 [&_ol]:my-1 [&_h2]:mt-2 [&_h3]:mt-2 [&_p+p]:mt-1.5 [&_a]:break-words"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

// ═══════════════════════════════════════════════════════════════════
// BADGE D'INTENTION
// ═══════════════════════════════════════════════════════════════════
const INTENT_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  conseil:    { label: 'Conseil',    icon: <Leaf className="w-2.5 h-2.5" />,         color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  produit:    { label: 'Produit',    icon: <Package className="w-2.5 h-2.5" />,       color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  commande:   { label: 'Commande',   icon: <ShoppingCart className="w-2.5 h-2.5" />,  color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
  compte:     { label: 'Mon compte', icon: <UserCircle2 className="w-2.5 h-2.5" />,   color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
  urgence:    { label: 'Urgent',     icon: <AlertTriangle className="w-2.5 h-2.5" />, color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  culture:    { label: 'Culture',    icon: <Sparkles className="w-2.5 h-2.5" />,      color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  campagne:   { label: 'Campagne',   icon: <Leaf className="w-2.5 h-2.5" />,          color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  roi:        { label: 'ROI',        icon: <TrendingUp className="w-2.5 h-2.5" />,    color: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400' },
  navigation: { label: 'Navigation', icon: <Map className="w-2.5 h-2.5" />,           color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' },
};

function IntentBadge({ intent }: { intent: string }) {
  const cfg = INTENT_CONFIG[intent] ?? INTENT_CONFIG.conseil;
  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium ${cfg.color}`}>
      {cfg.icon}{cfg.label}
    </span>
  );
}

// ═══════════════════════════════════════════════════════════════════
// BOUTON COPIE
// ═══════════════════════════════════════════════════════════════════
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(text.replace(/<[^>]+>/g, ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={copy}
      className="w-6 h-6 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
      title="Copier" aria-label="Copier le message"
    >
      {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════════
// CARTE ESCALADE — passer la main à un conseiller humain
// ═══════════════════════════════════════════════════════════════════
function EscalationCard({ context }: { context: string }) {
  const summary = encodeURIComponent(
    `Bonjour, j'ai besoin d'aide après ma conversation avec l'Assistant d'AGRIPOINT SERVICES.\n\nSujet : ${context.replace(/<[^>]+>/g, '').slice(0, 200)}`
  );
  const waUrl = `https://wa.me/237657393939?text=${summary}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className="mt-2 rounded-xl border border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20 p-3"
    >
      <p className="text-[12px] font-semibold text-orange-800 dark:text-orange-300 flex items-center gap-1.5 mb-1.5">
        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
        Besoin d&apos;un conseiller humain ?
      </p>
      <p className="text-[11px] text-orange-700 dark:text-orange-400 mb-2.5 leading-relaxed">
        Pour les cas complexes ou urgences terrain, un agronome AGRIPOINT SERVICES est disponible maintenant.
      </p>
      <div className="flex flex-col gap-1.5">
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-[12px] font-medium rounded-lg transition-colors"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
            <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.555 4.117 1.528 5.855L.057 23.882l6.147-1.613A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.027-1.381l-.36-.214-3.728.978.994-3.634-.234-.373A9.775 9.775 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z"/>
          </svg>
          WhatsApp un conseiller
        </a>
        <a
          href="tel:+237657393939"
          className="flex items-center justify-center gap-2 px-3 py-2 border border-orange-300 dark:border-orange-700 text-orange-700 dark:text-orange-400 text-[12px] font-medium rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/40 transition-colors"
        >
          <Phone className="w-3.5 h-3.5" />
          Appeler +237 657 39 39 39
        </a>
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// WIDGET ÉLIGIBILITÉ CAMPAGNE — Mini-flow 3 questions
// ═══════════════════════════════════════════════════════════════════
const ELIGIBILITY_QUESTIONS = [
  { text: 'Être membre d\'une coopérative agréée (reconnue MINADER) ?', icon: '🏢' },
  { text: 'Adhérer à une mutuelle agricole (CICAN, CAMAO ou agréé) ?', icon: '🤝' },
  { text: 'Commander au minimum 6 sacs ou litres ?', icon: '📦' },
];

function EligibilityWidget({ onComplete }: { onComplete: (msg: string) => void }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<boolean[]>([]);

  const answer = (yes: boolean) => {
    const newAns = [...answers, yes];
    if (step < ELIGIBILITY_QUESTIONS.length - 1) {
      setAnswers(newAns);
      setStep(step + 1);
    } else {
      const eligible = newAns.every(Boolean);
      const summary  = ELIGIBILITY_QUESTIONS.map((q, i) => `${newAns[i] ? '✅' : '❌'} ${q.text}`).join('\n');
      onComplete(
        eligible
          ? `✅ Test d'éligibilité campagne :\n${summary}\n\nJe remplis toutes les conditions ! Comment m'inscrire à la campagne Mars 2026 ?`
          : `❌ Test d'éligibilité campagne :\n${summary}\n\nJe ne remplis pas toutes les conditions. Que puis-je faire ?`
      );
    }
  };

  const q = ELIGIBILITY_QUESTIONS[step];
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-3 mb-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-[12px] font-semibold text-amber-700 dark:text-amber-400">🌾 Vérification éligibilité</span>
        <span className="text-[11px] text-amber-500">{step + 1}/{ELIGIBILITY_QUESTIONS.length}</span>
      </div>
      <div className="flex gap-1 mb-2.5">
        {ELIGIBILITY_QUESTIONS.map((_, i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${
            i < step ? 'bg-green-500' : i === step ? 'bg-amber-400 animate-pulse' : 'bg-gray-200 dark:bg-gray-700'
          }`} />
        ))}
      </div>
      <p className="text-[12px] text-amber-800 dark:text-amber-200 mb-3 font-medium">{q.icon} {q.text}</p>
      <div className="flex gap-2">
        <button
          onClick={() => answer(true)}
          className="flex-1 py-2 px-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[12px] font-medium rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
        >✅ Oui</button>
        <button
          onClick={() => answer(false)}
          className="flex-1 py-2 px-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-[12px] font-medium rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
        >❌ Non</button>
      </div>
    </motion.div>
  );
}
// ═══════════════════════════════════════════════════════════════════
// SUGGESTIONS PAR DÉFAUT
// ═══════════════════════════════════════════════════════════════════
const DEFAULT_SUGGESTIONS: { label: string; text: string; intent: Intent }[] = [
  { label: 'Tomates',       text: 'Quel programme complet pour mes tomates ?',         intent: 'culture'    },
  { label: 'Cacao/Café',    text: 'Conseils pour booster mon cacao et café ?',          intent: 'culture'    },
  { label: 'Jardinage urbain', text: 'Comment jardiner sur mon balcon en ville ?',      intent: 'conseil'    },
  { label: 'Commander',     text: 'Comment passer une commande sur le site ?',          intent: 'commande'   },
  { label: 'Livraison',     text: 'Délais et frais de livraison ?',                     intent: 'commande'   },
  { label: 'ROI',           text: 'Combien puis-je gagner avec vos produits sur 1 Ha ?', intent: 'roi'       },
  { label: 'Mon compte',    text: 'Comment créer mon compte client ?',                 intent: 'compte'     },
  { label: 'Saison',        text: 'Quels produits utiliser en ce moment ?',             intent: 'conseil'    },
  { label: 'Événements',   text: 'Quels sont les prochains événements AGRIPOINT SERVICES ?',  intent: 'navigation' },
];

// ═══════════════════════════════════════════════════════════════════
// HELPER — Message d'accueil contextuel selon la page
// ═══════════════════════════════════════════════════════════════════
function getWelcomeMessage(path: string | null): string {
  if (path?.includes('campagne')) {
    return 'Bienvenue sur la **Campagne Engrais Mars 2026** 🌾\n\nJe suis **l\'Assistant d\'AGRIPOINT SERVICES** — votre conseiller expert 24h/24. Je vois que vous consultez notre offre spéciale.\n\nJe peux :\n- ✅ **Vérifier votre éligibilité** en 3 questions\n- 📝 **Guider le formulaire** champ par champ\n- 💳 Expliquer le **paiement 70/30**\n\nUn Conseiller Expert AGRIPOINT SERVICES peut aussi intervenir si besoin.\n\nComment puis-je vous aider ?';
  }
  if (path?.includes('produits')) {
    return 'Bonjour ! Je suis **l\'Assistant d\'AGRIPOINT SERVICES** 🌿\n\nVous explorez notre catalogue de biofertilisants.\n\nDites-moi votre **type de culture** et je vous recommande les produits les plus adaptés avec les doses exactes !\n\n🌱 Tomate, cacao, café, maïs, agrumes… Quelle est votre culture ?';
  }
  if (path?.includes('checkout') || path?.includes('panier')) {
    return 'Bonjour ! Je suis **l\'Assistant d\'AGRIPOINT SERVICES** 🛒\n\nVous êtes en cours de commande. Besoin d\'aide avec les **modes de paiement**, les **délais de livraison** ou une question sur votre commande ?';
  }
  if (path?.includes('contact')) {
    return 'Bonjour ! Je suis **l\'Assistant d\'AGRIPOINT SERVICES** 📞\n\nVous êtes sur la page Contact. Je peux vous orienter vers le bon département :\n- 🤝 **Service Client** — commandes et livraisons\n- 🌾 **Conseil Agricole** — recommandations techniques\n- 🤝 **Partenariats** — devenir distributeur\n\nQuelle est votre demande ?';
  }
  return 'Bonjour ! Je suis **l\'Assistant d\'AGRIPOINT SERVICES** 🌿 — votre conseiller agricole expert 24h/24.\n\nJe peux vous aider à :\n- 🌱 **Conseils cultures** : tomate, cacao, café, maïs, agrumes…\n- 💰 Calculer votre **ROI** avec nos produits\n- 🌾 La **Campagne Mars 2026** — prix spéciaux\n- 🛒 **Commander** et suivre vos livraisons\n\n💡 *Un Conseiller Expert AGRIPOINT SERVICES peut également intervenir à tout moment.*\n\nComment puis-je vous aider aujourd\'hui ?';
}


// ═══════════════════════════════════════════════════════════════════
function useVoiceInput(onResult: (text: string) => void) {
  const [listening, setListening] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recRef = useRef<any>(null);
  const supported = typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  const toggle = useCallback(() => {
    if (!supported) return;
    if (listening) { recRef.current?.stop(); setListening(false); return; }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
    const rec = new SR();
    rec.lang = 'fr-FR';
    rec.continuous = false;
    rec.interimResults = false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onresult = (e: any) => { onResult(e.results[0][0].transcript); };
    rec.onend   = () => setListening(false);
    rec.onerror = () => setListening(false);
    recRef.current = rec;
    rec.start();
    setListening(true);
  }, [listening, onResult, supported]);

  return { listening, toggle, supported };
}

// ═══════════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL AgriBot v3
// ═══════════════════════════════════════════════════════════════════
export default function AgriBot() {
  const pathname        = usePathname();
  const isCampaignPage  = !!pathname?.includes('campagne');
  const isProductsPage  = !!pathname?.includes('produits');
  const isPulsingPage   = isCampaignPage || isProductsPage;

  const [isOpen, setIsOpen]                     = useState(false);
  const [isFullscreen, setIsFullscreen]          = useState(false);
  const [hasAutoOpened, setHasAutoOpened]        = useState(false);
  const [showEligibility, setShowEligibility]    = useState(false);
  const [sessionId]                              = useState(() =>
    typeof crypto !== 'undefined' ? crypto.randomUUID() : Math.random().toString(36).slice(2)
  );

  // ─── Mémoire & localisation ───
  const [userMemory, setUserMemory]              = useState<UserMemory>(() => loadMemory('tmp'));
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showDistributorsModal, setShowDistributorsModal] = useState(false);
  const [distributors, setDistributors]          = useState<any[]>([]);
  const [loadingDistributors, setLoadingDistributors] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu]    = useState(false);
  const [showHistoryPanel, setShowHistoryPanel]  = useState(false);
  const [savedConversations, setSavedConversations] = useState<SavedConversation[]>([]);
  const [toastMsg, setToastMsg]                  = useState<string | null>(null);

  // ─── Messages ───
  const [messages, setMessages] = useState<Message[]>(() => [{
    id: '0',
    role: 'assistant',
    intent: 'conseil',
    content: getWelcomeMessage(typeof window !== 'undefined' ? window.location.pathname : null),
    timestamp: new Date(),
    suggestions: [],
  }]);

  const [input, setInput]                 = useState('');
  const [isStreaming, setIsStreaming]      = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [unreadCount, setUnreadCount]     = useState(0);

  const messagesEndRef  = useRef<HTMLDivElement>(null);
  const messagesListRef = useRef<HTMLDivElement>(null);
  const inputRef        = useRef<HTMLInputElement>(null);
  const abortRef        = useRef<AbortController | null>(null);

  // ─── Voice ───
  const { listening, toggle: toggleVoice, supported: voiceSupported } = useVoiceInput(
    useCallback((text: string) => setInput(prev => prev + text), [])
  );

  // ─── TTS — Synthèse vocale ───
  const [ttsEnabled, setTtsEnabled]               = useState(false);

  // ─── Photo — Diagnostic maladie ───
  const [imageFile, setImageFile]                 = useState<File | null>(null);
  const [imagePreview, setImagePreview]           = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing]             = useState(false);
  const imageInputRef                             = useRef<HTMLInputElement>(null);

  // ─── Suggestion saisonnière ───
  const [seasonalBanner, setSeasonalBanner]       = useState<string | null>(null);

  // ─── Scroll ───
  const scrollToBottom = useCallback((force = false) => {
    if (force) { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); return; }
    const el = messagesListRef.current;
    if (!el) return;
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 120)
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const handleScroll = useCallback(() => {
    const el = messagesListRef.current;
    if (!el) return;
    setShowScrollBtn(el.scrollHeight - el.scrollTop - el.clientHeight > 180);
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);
  useEffect(() => { if (isOpen) { inputRef.current?.focus(); setUnreadCount(0); } }, [isOpen]);
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape' && isOpen) setIsOpen(false); };
    document.addEventListener('keydown', fn);
    return () => document.removeEventListener('keydown', fn);
  }, [isOpen]);

  // ─── Chargement mémoire depuis localStorage (sessionId stable) ───
  useEffect(() => {
    const mem = loadMemory(sessionId);
    setUserMemory({ ...mem, sessionId });
    setSavedConversations(loadSavedConversations());
  }, [sessionId]);

  // ─── Apprentissage : extraction de faits après chaque échange ───
  useEffect(() => {
    if (messages.length < 2) return;
    const lastTwo = messages.slice(-2);
    const updates = extractFactsFromMessages(lastTwo, userMemory);
    if (Object.keys(updates).length > 0) {
      const updated: UserMemory = { ...userMemory, sessionId, ...updates };
      setUserMemory(updated);
      saveMemory(updated);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  // ─── Toast helper ───
  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  }, []);

  // ─── TTS — Lire un message à voix haute ───
  const speakText = useCallback((text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(
      text.replace(/<[^>]+>/g, '').replace(/<!--.*?-->/gs, '').slice(0, 400)
    );
    utterance.lang = 'fr-FR';
    utterance.rate = 0.92;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  }, []);

  // ─── MongoDB Memory Sync (debounced 3s) ───
  useEffect(() => {
    if (!userMemory.location && !userMemory.mainCrops?.length) return;
    const timer = setTimeout(() => {
      fetch('/api/agribot/memory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          location: userMemory.location,
          region: userMemory.region,
          mainCrops: userMemory.mainCrops,
          surface: userMemory.surface,
          farmType: userMemory.farmType,
          keyFacts: userMemory.keyFacts?.slice(0, 8),
        }),
      }).catch(() => {/* fire and forget */});
    }, 3000);
    return () => clearTimeout(timer);
  }, [userMemory.location, userMemory.region, userMemory.mainCrops, sessionId, userMemory.surface, userMemory.farmType, userMemory.keyFacts]);

  // ─── Bannière saisonnière — affiché à l'ouverture si localisation connue ───
  useEffect(() => {
    if (!isOpen) return;
    if (!userMemory.location && !userMemory.mainCrops?.length) return;
    const greeting = getSeasonalGreeting(userMemory.region, userMemory.mainCrops);
    if (greeting) setSeasonalBanner(greeting);
    else setSeasonalBanner(null);
  }, [isOpen, userMemory.location, userMemory.region, userMemory.mainCrops]);

  // ─── Chargement des distributeurs depuis l'API ───
  useEffect(() => {
    if (!showDistributorsModal) return;
    
    const fetchDistributors = async () => {
      setLoadingDistributors(true);
      try {
        const res = await fetch('/api/distributors');
        if (!res.ok) throw new Error('Erreur chargement distributeurs');
        const data = await res.json();
        if (data.distributors) {
          setDistributors(data.distributors.map((d: any) => ({
            id: d._id,
            ...d,
          })));
        }
      } catch (err) {
        console.warn('Erreur distributeurs:', err);
        // Fallback à l'ancienne data (à retirer une fois DB remplie)
        setDistributors([
          {
            id: 'dist-yao',
            name: 'AGRIPOINT SERVICES Yaoundé',
            category: 'wholesaler',
            address: 'Rue Camerounaise, Centre Ville',
            city: 'Yaoundé',
            region: 'Centre',
            phone: '+237 6 XX XXX XXX',
            email: 'yaounde@agripoint.cm',
            coordinates: { lat: 3.8474, lng: 11.5021 },
            businessHours: 'Lun-Sam: 7h-18h'
          },
          {
            id: 'dist-dou',
            name: 'AGRIPOINT SERVICES Douala',
            category: 'retailer',
            address: 'Boulevard de la Liberté',
            city: 'Douala',
            region: 'Littoral',
            phone: '+237 6 XX XXX XXX',
            email: 'douala@agripoint.cm',
            coordinates: { lat: 4.0511, lng: 9.7679 },
            businessHours: 'Lun-Sam: 7h-18h'
          },
          {
            id: 'dist-bam',
            name: 'AGRIPOINT SERVICES Bamenda',
            category: 'partner',
            address: 'Avenue Prince Charles',
            city: 'Bamenda',
            region: 'Nord-Ouest',
            phone: '+237 6 XX XXX XXX',
            email: 'bamenda@agripoint.cm',
            coordinates: { lat: 5.9631, lng: 10.1591 },
            businessHours: 'Lun-Sam: 8h-17h'
          },
          {
            id: 'dist-bue',
            name: 'AGRIPOINT SERVICES Buea',
            category: 'retailer',
            address: 'Commercial Avenue',
            city: 'Buea',
            region: 'Sud-Ouest',
            phone: '+237 6 XX XXX XXX',
            email: 'buea@agripoint.cm',
            coordinates: { lat: 4.1551, lng: 9.2414 },
            businessHours: 'Lun-Sam: 8h-17h'
          },
        ]);
      } finally {
        setLoadingDistributors(false);
      }
    };

    fetchDistributors();
  }, [showDistributorsModal]);

  // ─── Sauvegarder la conversation courante ───
  const saveCurrentConversation = useCallback(() => {
    if (messages.length < 2) { showToast('Aucun message à sauvegarder.'); return; }
    saveConversation(messages as Parameters<typeof saveConversation>[0], userMemory);
    setSavedConversations(loadSavedConversations());
    showToast('✅ Conversation sauvegardée !');
  }, [messages, userMemory, showToast]);

  // ─── Charger une conversation sauvegardée ───
  const loadConversation = useCallback((conv: SavedConversation) => {
    setMessages(conv.messages.map(m => ({
      ...m,
      timestamp: new Date(m.timestamp),
      id: m.timestamp,
    })));
    if (conv.userMemory) {
      const merged = { ...userMemory, ...conv.userMemory };
      setUserMemory(merged);
      saveMemory(merged);
    }
    setShowHistoryPanel(false);
    showToast('📂 Conversation chargée');
  }, [userMemory, showToast]);

  // ─── Supprimer une conversation sauvegardée ───
  const deleteConversation = useCallback((id: string) => {
    deleteSavedConversation(id);
    setSavedConversations(loadSavedConversations());
    showToast('🗑️ Supprimée');
  }, [showToast]);

  // ─── Copier toute la conversation ───
  const copyAllMessages = useCallback(async () => {
    const text = messages
      .filter(m => m.content?.trim())
      .map(m => `[${m.role === 'user' ? 'Vous' : 'Assistant AGRIPOINT SERVICES'}]\n${m.content.replace(/<[^>]+>/g, '').trim()}`)
      .join('\n\n---\n\n');
    await navigator.clipboard.writeText(text);
    showToast('✅ Conversation copiée !');
  }, [messages, showToast]);

  // ─── Ouverture proactive sur pages clés (après 8 secondes) ───
  useEffect(() => {
    if (hasAutoOpened || isOpen) return;
    if (!isCampaignPage && !isProductsPage) return;
    const timer = setTimeout(() => {
      setIsOpen(true);
      setHasAutoOpened(true);
      setMessages(prev => prev.map((m, i) => i !== 0 ? m : {
        ...m,
        content: isCampaignPage
          ? `👋 Bonjour ! Je suis **l'Assistant d'AGRIPOINT SERVICES** 🌾\n\nJe vois que vous consultez la **Campagne Engrais Mars 2026**.\n\nVoulez-vous que je **vérifie votre éligibilité** maintenant en 3 questions ? Ou besoin d'aide pour remplir le formulaire ?`
          : `👋 Bonjour ! Je suis **l'Assistant d'AGRIPOINT SERVICES** 🌿\n\nVous parcourez notre catalogue de biofertilisants.\n\nDites-moi votre **culture** et je vous recommande les produits les plus adaptés avec les doses exactes !`,
      }));
    }, 8000);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // ─── Résumé par email ───
  const sendEmailSummary = useCallback(() => {
    const lines = messages
      .filter(m => m.content.length > 5)
      .map(m => `[${m.role === 'user' ? 'Vous' : 'Assistant AGRIPOINT SERVICES'}]\n${m.content.replace(/<[^>]+>/g, '').replace(/<!--.*?-->/gs, '').slice(0, 600)}`)
      .join('\n\n--------------------\n\n');
    const subject = encodeURIComponent('Mon résumé — Assistant AGRIPOINT SERVICES');
    const body    = encodeURIComponent(`Résumé de ma conversation avec l'Assistant AGRIPOINT SERVICES :\n\n${lines}\n\n--------------------\nAGRIPOINT SERVICES | https://agri-ps.com | +237 657 39 39 39`);
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  }, [messages]);


  // ─── Reset ───
  const resetChat = useCallback(() => {
    abortRef.current?.abort();
    setIsStreaming(false);
    setShowEligibility(false);
    setMessages([{
      id: Date.now().toString(),
      role: 'assistant',
      intent: 'conseil',
      content: getWelcomeMessage(pathname),
      timestamp: new Date(),
    }]);
  }, [pathname]);

  // ─── Feedback ───
  const sendFeedback = useCallback(async (messageId: string, feedback: 'positive' | 'negative') => {
    const idx = messages.findIndex(m => m.id === messageId);
    if (idx === -1) return;
    setMessages(prev => prev.map(m => m.id === messageId ? { ...m, feedback } : m));
    try {
      await fetch('/api/agribot', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, messageIndex: idx, feedback }),
      });
    } catch { /* fire-and-forget */ }
  }, [messages, sessionId]);

  // ─── Diagnostic photo de maladie (GPT-4o Vision) ───
  const handleAnalyzeImage = useCallback(async () => {
    if (!imageFile || isAnalyzing) return;
    setIsAnalyzing(true);
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: `📷 **Diagnostic photo** — ${imageFile.name}`,
      timestamp: new Date(),
      intent: 'culture',
    };
    const assistantId = (Date.now() + 1).toString();
    const assistantMsg: Message = {
      id: assistantId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true,
      toolStatus: '🔍 Analyse de la photo en cours…',
    };
    setMessages(prev => [...prev, userMsg, assistantMsg]);
    setImageFile(null);
    setImagePreview(null);

    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('context', `Diagnostic de ma culture${userMemory.mainCrops?.length ? ' (' + userMemory.mainCrops.join(', ') + ')' : ''}`);
      formData.append('memory', JSON.stringify({
        location: userMemory.location,
        mainCrops: userMemory.mainCrops,
      }));
      const res = await fetch('/api/agribot/analyze', { method: 'POST', body: formData });
      const data = await res.json() as { diagnosis?: string; error?: string; fallback?: boolean };
      const content = data.diagnosis
        || data.error
        || '⚠️ Analyse impossible.\n\nVérifiez que votre image est claire et bien cadrée, puis réessayez.';
      setMessages(prev => prev.map(m =>
        m.id === assistantId ? { ...m, content, isStreaming: false, toolStatus: undefined, intent: 'culture' } : m
      ));
      if (ttsEnabled && data.diagnosis) speakText(data.diagnosis);
    } catch {
      setMessages(prev => prev.map(m =>
        m.id === assistantId ? { ...m, content: '⚠️ Erreur réseau. Réessayez.', isStreaming: false, toolStatus: undefined } : m
      ));
    } finally {
      setIsAnalyzing(false);
    }
  }, [imageFile, isAnalyzing, userMemory.location, userMemory.mainCrops, ttsEnabled, speakText]);

  // ─── Envoi + streaming SSE ───
  const handleSend = useCallback(async (text?: string) => {
    const messageText = (text || input).trim();
    if (!messageText || isStreaming) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const userMsg: Message     = { id: Date.now().toString(), role: 'user', content: messageText, timestamp: new Date() };
    const assistantId          = (Date.now() + 1).toString();
    const assistantMsg: Message = { id: assistantId, role: 'assistant', content: '', timestamp: new Date(), isStreaming: true };

    setMessages(prev => [...prev, userMsg, assistantMsg]);
    setInput('');
    setIsStreaming(true);

    try {
      const res = await fetch('/api/agribot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          message: messageText,
          history: messages.slice(-10).map(m => ({ role: m.role, content: m.content })),
          sessionId,
          metadata: { page: typeof window !== 'undefined' ? window.location.pathname : '/' },
          userMemory: {
            location: userMemory.location,
            region: userMemory.region,
            mainCrops: userMemory.mainCrops,
            surface: userMemory.surface,
            farmType: userMemory.farmType,
            keyFacts: userMemory.keyFacts?.slice(0, 5),
          },
        }),
      });

      if (!res.ok || !res.body) throw new Error('Erreur réseau');

      const reader  = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split('\n');
        buf = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const ev = JSON.parse(line.slice(6)) as {
              type: string; token?: string; message?: string;
              tags?: string[]; intent?: string; suggestions?: string[]; escalate?: boolean;
            };
            if (ev.type === 'token' && ev.token) {
              setMessages(prev => prev.map(m =>
                m.id === assistantId ? { ...m, content: m.content + ev.token } : m
              ));
            } else if (ev.type === 'tool_start') {
              setMessages(prev => prev.map(m =>
                m.id === assistantId ? { ...m, toolStatus: ev.message } : m
              ));
            } else if (ev.type === 'done') {
              setMessages(prev => {
                const updated = prev.map(m =>
                  m.id === assistantId
                    ? { ...m, isStreaming: false, toolStatus: undefined, intent: ev.intent, suggestions: ev.suggestions || [], escalated: ev.escalate }
                    : m
                );
                // TTS: lire la réponse complète
                if (ttsEnabled) {
                  const finalMsg = updated.find(m => m.id === assistantId);
                  if (finalMsg?.content) speakText(finalMsg.content);
                }
                return updated;
              });
              if (!isOpen) setUnreadCount(n => n + 1);
            } else if (ev.type === 'error') {
              setMessages(prev => prev.map(m =>
                m.id === assistantId ? { ...m, content: ev.message || 'Erreur technique.', isStreaming: false } : m
              ));
            }
          } catch { /* skip malformed SSE */ }
        }
      }
    } catch (err: unknown) {
      if (!(err instanceof Error && err.name === 'AbortError')) {
        setMessages(prev => prev.map(m =>
          m.id === assistantId
            ? { ...m, content: '⚠️ Erreur de connexion. Réessayez ou contactez-nous au 📞 +237 657 39 39 39', isStreaming: false }
            : m
        ));
      }
    } finally {
      setIsStreaming(false);
    }
  }, [input, isStreaming, messages, sessionId, isOpen, ttsEnabled, speakText]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  // ─── Suggestions actives ───
  const lastAiMsg  = [...messages].reverse().find(m => m.role === 'assistant' && !m.isStreaming);
  const activeSugs: { label: string; text: string; intent: Intent }[] = useMemo(() => {
    if ((lastAiMsg?.suggestions?.length ?? 0) > 0)
      return (lastAiMsg!.suggestions!).map((s: string) => ({ label: s, text: s, intent: 'conseil' as Intent }));
    if (isCampaignPage)
      return [
        { label: 'Vérifier éligibilité', text: '3_ELIGIBILITY_FLOW',                                                              intent: 'campagne' as Intent },
        { label: 'Guide formulaire',    text: 'Comment remplir le formulaire d\'inscription à la campagne Mars 2026 ?',          intent: 'campagne' as Intent },
        { label: 'Paiement 70/30',     text: 'Expliquez-moi le paiement acompte 70% + 30% livraison de la campagne.',           intent: 'campagne' as Intent },
        { label: 'Conditions',          text: 'Quelles sont exactement les conditions pour participer à la campagne engrais ?', intent: 'campagne' as Intent },
      ];
    if (messages.length <= 1)
      return DEFAULT_SUGGESTIONS.slice(0, 5);
    return DEFAULT_SUGGESTIONS.slice(5, 9);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastAiMsg?.suggestions, isCampaignPage, messages.length]);

  const chatClass = isFullscreen
    ? 'fixed inset-4 sm:inset-8 z-50 rounded-2xl'
    : 'fixed bottom-24 right-4 sm:right-6 z-50 w-[22.5rem] sm:w-[26rem] h-[620px] rounded-2xl';

  return (
    <>
      {/* ══ BOUTON FLOTTANT ══ */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1.2, type: 'spring', stiffness: 280, damping: 22 }}
        onClick={() => setIsOpen(o => !o)}
        className={`fixed bottom-6 right-4 sm:right-6 z-50 w-[58px] h-[58px] bg-gradient-to-br from-green-600 via-green-700 to-emerald-800 text-white rounded-full shadow-2xl shadow-green-900/30 hover:scale-105 active:scale-95 transition-transform flex items-center justify-center${isPulsingPage && !isOpen ? ' ring-4 ring-green-400/60 ring-offset-2' : ''}`}
        aria-label="Ouvrir l'Assistant AGRIPOINT SERVICES"
      >
        {!isOpen && <span className="absolute inset-0 rounded-full bg-green-500 opacity-20 animate-ping" />}
        {isPulsingPage && !isOpen && (
          <span className="absolute -top-1.5 -left-1.5 w-[72px] h-[72px] rounded-full border-2 border-green-400/50 animate-ping" />
        )}
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.span key="x" initial={{ rotate: -90, opacity: 0, scale: 0.5 }} animate={{ rotate: 0, opacity: 1, scale: 1 }} exit={{ rotate: 90, opacity: 0, scale: 0.5 }} transition={{ duration: 0.18 }}>
              <X className="w-6 h-6" />
            </motion.span>
          ) : (
            <motion.span key="chat" initial={{ rotate: 90, opacity: 0, scale: 0.5 }} animate={{ rotate: 0, opacity: 1, scale: 1 }} exit={{ rotate: -90, opacity: 0, scale: 0.5 }} transition={{ duration: 0.18 }}>
              <MessageCircle className="w-6 h-6" />
            </motion.span>
          )}
        </AnimatePresence>
        {!isOpen && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
        <span className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
      </motion.button>

      {/* ══ FENÊTRE DE CHAT ══ */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="chatwindow"
            initial={{ opacity: 0, y: 14, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={`${chatClass} bg-white dark:bg-gray-900 shadow-[0_24px_80px_-12px_rgba(22,101,52,0.22),0_8px_24px_-4px_rgba(0,0,0,0.12)] flex flex-col overflow-hidden border border-green-100/60 dark:border-gray-800`}
          >
            {/* HEADER */}
            <div className="bg-gradient-to-br from-green-800 via-green-700 to-emerald-600 text-white px-4 py-3 flex flex-col shrink-0 relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.08)_0%,transparent_60%)]" />
              <div className="flex items-center gap-3">
                <div className="relative w-11 h-11 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0 ring-2 ring-white/30 shadow-lg">
                  <Leaf className="w-5 h-5 text-white" />
                  <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-green-800 animate-pulse" />
                </div>
                <div className="flex-1 min-w-0 relative">
                  <div className="font-bold text-[13px] leading-tight tracking-wide">Assistant AGRIPOINT SERVICES</div>
                  <div className="text-[10px] text-green-100/90 flex items-center gap-1.5 flex-wrap">
                    <span className="w-1.5 h-1.5 bg-emerald-300 rounded-full inline-block animate-pulse" />
                    Expert Agricole IA · Cameroun
                    {userMemory.location && (
                      <span className="flex items-center gap-0.5 bg-white/10 rounded-full px-1.5 py-0.5 text-[10px]">
                        <MapPin className="w-2 h-2" />{userMemory.location}
                      </span>
                    )}
                    {userMemory.mainCrops?.length ? (
                      <span className="flex items-center gap-0.5 bg-white/10 rounded-full px-1.5 py-0.5 text-[10px]">
                        <Leaf className="w-2 h-2" /> {userMemory.mainCrops.slice(0, 2).join(', ')}
                      </span>
                    ) : null}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {/* Préciser localisation */}
                  <button
                    onClick={() => setShowLocationModal(true)}
                    className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                    title="Ma localisation"
                    aria-label="Définir ma localisation"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                  </button>
                  {/* Carte Distributeurs */}
                  <button
                    onClick={() => setShowDistributorsModal(true)}
                    className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                    title="Nos distributeurs"
                    aria-label="Voir la carte des distributeurs"
                  >
                    <Map className="w-3.5 h-3.5" />
                  </button>
                  {/* Options menu */}
                  <button
                    onClick={() => { setShowOptionsMenu(o => !o); setShowHistoryPanel(false); }}
                    className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                    title="Options"
                    aria-label="Options"
                  >
                    <Settings className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setIsFullscreen(f => !f)}
                    className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                    title={isFullscreen ? 'Réduire' : 'Plein écran'}
                  >
                    {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={resetChat}
                    className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                    title="Nouvelle conversation"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Bannière "Conseiller expert peut intervenir" */}
              <div className="mt-2 flex items-center gap-1.5 text-[10px] text-green-100/80 bg-white/5 rounded-lg px-2.5 py-1.5">
                <UserCircle2 className="w-3 h-3 shrink-0 text-emerald-200" />
                <span>Un Conseiller Expert AGRIPOINT SERVICES peut intervenir à tout moment</span>
                <a href="https://wa.me/237657393939" target="_blank" rel="noopener noreferrer"
                  className="ml-auto shrink-0 text-emerald-200 underline">WhatsApp</a>
              </div>

              {/* Panneau OPTIONS (dropdown) */}
              <AnimatePresence>
                {showOptionsMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.96 }}
                    className="absolute top-full left-0 right-0 z-50 bg-white dark:bg-gray-900 border-b border-green-200 dark:border-gray-700 shadow-xl overflow-hidden"
                  >
                    <div className="grid grid-cols-2 gap-px bg-gray-100 dark:bg-gray-800 p-0.5">
                      {[
                        { icon: <SaveAll className="w-3.5 h-3.5" />, label: 'Sauvegarder', action: () => { saveCurrentConversation(); setShowOptionsMenu(false); } },
                        { icon: <History className="w-3.5 h-3.5" />, label: 'Historique', action: () => { setShowHistoryPanel(h => !h); setShowOptionsMenu(false); } },
                        { icon: <Download className="w-3.5 h-3.5" />, label: 'Exporter TXT', action: () => { exportConversationTxt(messages as Parameters<typeof exportConversationTxt>[0], userMemory); setShowOptionsMenu(false); } },
                        { icon: <Copy className="w-3.5 h-3.5" />, label: 'Tout copier', action: () => { copyAllMessages(); setShowOptionsMenu(false); } },
                        { icon: <Mail className="w-3.5 h-3.5" />, label: 'Par email', action: () => { sendEmailSummary(); setShowOptionsMenu(false); } },
                        { icon: <Share2 className="w-3.5 h-3.5" />, label: 'WhatsApp', action: () => { shareOnWhatsApp(messages); setShowOptionsMenu(false); } },
                      ].map(({ icon, label, action }) => (
                        <button
                          key={label}
                          onClick={action}
                          className="flex items-center gap-2 px-3 py-2.5 text-[12px] font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-900 hover:bg-green-50 dark:hover:bg-green-900/30 hover:text-green-700 dark:hover:text-green-400 transition-colors"
                        >
                          <span className="text-green-600 dark:text-green-400">{icon}</span>{label}
                        </button>
                      ))}
                      {/* Toggle TTS */}
                      <button
                        onClick={() => { setTtsEnabled(v => !v); showToast(ttsEnabled ? '🔇 Voix désactivée' : '🔊 Voix activée'); setShowOptionsMenu(false); }}
                        className="flex items-center gap-2 px-3 py-2.5 text-[12px] font-medium bg-white dark:bg-gray-900 hover:bg-green-50 dark:hover:bg-green-900/30 transition-colors col-span-2 border-t border-gray-100 dark:border-gray-800"
                      >
                        <span className={`text-green-600 dark:text-green-400`}>
                          {ttsEnabled ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                        </span>
                        <span className={ttsEnabled ? 'text-green-700 dark:text-green-400 font-semibold' : 'text-gray-700 dark:text-gray-200'}>
                          {ttsEnabled ? '🔊 Voix activée — cliquer pour désactiver' : '🔇 Activer la voix (TTS)'}
                        </span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Panneau HISTORIQUE */}
              <AnimatePresence>
                {showHistoryPanel && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="absolute top-full left-0 right-0 z-50 bg-white dark:bg-gray-900 border-b border-green-200 dark:border-gray-700 shadow-xl max-h-64 overflow-y-auto"
                  >
                    <div className="p-2">
                      <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 px-2 py-1 flex items-center gap-1.5">
                        <BookOpen className="w-3 h-3" />Conversations sauvegardées ({savedConversations.length})
                      </p>
                      {savedConversations.length === 0 ? (
                        <p className="px-3 py-4 text-[12px] text-gray-400 text-center">Aucune conversation sauvegardée</p>
                      ) : savedConversations.map(conv => (
                        <div key={conv.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 group">
                          <button
                            onClick={() => loadConversation(conv)}
                            className="flex-1 text-left min-w-0"
                          >
                            <p className="text-[12px] font-medium text-gray-800 dark:text-gray-200 truncate">{conv.title}</p>
                            <p className="text-[10px] text-gray-400">
                              {new Date(conv.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                              {conv.userMemory?.location ? ` · ${conv.userMemory.location}` : ''}
                            </p>
                          </button>
                          <button
                            onClick={() => deleteConversation(conv.id)}
                            aria-label="Supprimer cette conversation"
                            title="Supprimer"
                            className="w-6 h-6 rounded flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all opacity-0 group-hover:opacity-100"
                          ><Trash2 className="w-3 h-3" /></button>
                          <ChevronRight className="w-3 h-3 text-gray-300 shrink-0" />
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* MESSAGES */}
            <div ref={messagesListRef} onScroll={handleScroll} className="flex-1 overflow-y-auto px-3 py-3 space-y-3 scroll-smooth">

              {/* Bannière saisonnière */}
              <AnimatePresence>
                {seasonalBanner && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="rounded-xl bg-gradient-to-r from-amber-50 to-green-50 dark:from-amber-900/20 dark:to-green-900/20 border border-amber-200 dark:border-amber-800 px-3 py-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
                        <MarkdownMessage content={seasonalBanner} />
                      </div>
                      <button
                        onClick={() => setSeasonalBanner(null)}
                        className="shrink-0 text-amber-400 hover:text-amber-600 mt-0.5"
                        aria-label="Fermer"
                      ><X className="w-3 h-3" /></button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              {messages.map((msg) => (
                <div key={msg.id} className={`flex flex-col gap-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>

                  {/* Bulle */}
                  <div className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-br from-green-600 to-emerald-700 text-white rounded-br-sm shadow-sm'
                      : 'bg-white dark:bg-gray-800/90 text-gray-900 dark:text-gray-100 rounded-bl-sm border border-gray-100/80 dark:border-gray-700 shadow-sm'
                  }`}>
                    {msg.toolStatus && (
                      <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 mb-1.5 font-medium">
                        <Loader2 className="w-3 h-3 animate-spin" />{msg.toolStatus}
                      </div>
                    )}
                    {msg.role === 'user'
                      ? <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      : <MarkdownMessage content={msg.content} />
                    }
                    {msg.isStreaming && <span className="inline-block w-0.5 h-3.5 bg-green-500 ml-0.5 animate-pulse align-middle" />}
                    <p className={`text-[10px] mt-1 ${msg.role === 'user' ? 'text-green-200' : 'text-gray-400 dark:text-gray-500'}`}>
                      {msg.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>

                  {/* Actions IA */}
                  {msg.role === 'assistant' && !msg.isStreaming && msg.content.length > 20 && (
                    <div className="flex items-center gap-1.5 ml-1 flex-wrap">
                      {msg.intent && <IntentBadge intent={msg.intent} />}
                      {/* Badge langue (EN/Pidgin détecté) */}
                      {msg.role === 'assistant' && /\b(the|and|for|you|your|with|this|that|have|from|will|can|please|thank)\b/i.test(msg.content.replace(/<[^>]+>/g, '')) && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                          <Globe className="w-2.5 h-2.5" />EN
                        </span>
                      )}
                      <button
                        onClick={() => sendFeedback(msg.id, 'positive')}
                        className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${msg.feedback === 'positive' ? 'bg-green-100 text-green-600' : 'text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30'}`}
                        title="Utile" aria-label="Marquer comme utile"
                      ><ThumbsUp className="w-3 h-3" /></button>
                      <button
                        onClick={() => sendFeedback(msg.id, 'negative')}
                        className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${msg.feedback === 'negative' ? 'bg-red-100 text-red-500' : 'text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30'}`}
                        title="Pas utile" aria-label="Marquer comme inutile"
                      ><ThumbsDown className="w-3 h-3" /></button>
                      <CopyButton text={msg.content} />
                      {/* Bouton TTS par message */}
                      {typeof window !== 'undefined' && 'speechSynthesis' in window && (
                        <button
                          onClick={() => speakText(msg.content)}
                          className="w-6 h-6 rounded-full flex items-center justify-center text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 transition-all"
                          title="Écouter ce message"
                          aria-label="Écouter ce message"
                        ><Volume2 className="w-3 h-3" /></button>
                      )}
                    </div>
                  )}

                  {/* Boutons "Acheter →" pour les produits mentionnés */}
                  {msg.role === 'assistant' && !msg.isStreaming && msg.content.length > 20 && (() => {
                    const prods = extractProductsFromText(msg.content);
                    if (!prods.length) return null;
                    return (
                      <div className="flex flex-wrap gap-1.5 ml-1 mt-1">
                        {prods.map(p => (
                          <a
                            key={p.slug}
                            href={`/produits?search=${encodeURIComponent(p.name)}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-600 hover:bg-green-700 text-white text-[11px] font-semibold rounded-lg shadow-sm transition-all active:scale-95"
                          >
                            <ShoppingCart className="w-2.5 h-2.5" />
                            {p.name}
                            <ExternalLink className="w-2 h-2 opacity-70" />
                          </a>
                        ))}
                      </div>
                    );
                  })()}

                  {/* Escalade humaine — intent urgence OU signal API */}
                  {msg.role === 'assistant' && !msg.isStreaming && (msg.intent === 'urgence' || msg.escalated) && (
                    <div className="w-full max-w-[88%]">
                      <EscalationCard context={msg.content} />
                    </div>
                  )}
                </div>
              ))}

              {/* Indicateur frappe */}
              {isStreaming && messages[messages.length - 1]?.content === '' && (
                <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="flex items-start">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl rounded-bl-sm border border-gray-100 dark:border-gray-700 px-4 py-3">
                    <div className="flex gap-1.5 items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce [animation-delay:0ms]" />
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce [animation-delay:150ms]" />
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce [animation-delay:300ms]" />
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* WIDGET ÉLIGIBILITÉ CAMPAGNE */}
            {isCampaignPage && showEligibility && !isStreaming && (
              <EligibilityWidget onComplete={(msg) => {
                setShowEligibility(false);
                handleSend(msg);
              }} />
            )}

            {/* Scroll-to-bottom */}
            <AnimatePresence>
              {showScrollBtn && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => scrollToBottom(true)}
                  className="absolute bottom-[7.5rem] right-4 w-9 h-9 bg-white dark:bg-gray-800 border border-green-200 dark:border-green-800 rounded-full shadow-lg shadow-green-900/10 flex items-center justify-center text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 hover:scale-110 transition-all z-10"
                  aria-label="Défiler vers le bas"
                >
                  <ChevronDown className="w-4 h-4" />
                </motion.button>
              )}
            </AnimatePresence>

            {/* SUGGESTIONS */}
            <div className="px-3 pb-2 shrink-0">
              <div className="flex flex-wrap gap-1.5">
                {activeSugs.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => {
                    if (s.text === '3_ELIGIBILITY_FLOW') {
                      setShowEligibility(true);
                    } else {
                      handleSend(s.text);
                    }
                  }}
                    disabled={isStreaming}
                    className="text-[11px] px-3 py-1.5 bg-white dark:bg-gray-800 text-green-700 dark:text-green-400 rounded-full hover:bg-green-50 dark:hover:bg-green-900/40 hover:border-green-400 hover:shadow-sm transition-all disabled:opacity-40 border border-green-200 dark:border-green-700 whitespace-nowrap font-medium shadow-[0_1px_3px_rgba(0,0,0,0.06)] active:scale-95"
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* INPUT */}
            <div className="border-t border-gray-100 dark:border-gray-800 px-3 py-3 shrink-0">
              {/* Prévisualisation image sélectionnée */}
              <AnimatePresence>
                {imagePreview && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-2 flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imagePreview} alt="Preview" className="w-12 h-12 rounded-lg object-cover border border-green-200 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-medium text-green-800 dark:text-green-300 truncate">{imageFile?.name}</p>
                      <p className="text-[10px] text-green-600 dark:text-green-500">Photo prête pour diagnostic IA</p>
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      <button
                        onClick={handleAnalyzeImage}
                        disabled={isAnalyzing}
                        className="px-2.5 py-1.5 bg-green-600 hover:bg-green-700 text-white text-[11px] font-semibold rounded-lg flex items-center gap-1 transition-all disabled:opacity-50"
                      >
                        {isAnalyzing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                        Analyser
                      </button>
                      <button
                        onClick={() => { setImageFile(null); setImagePreview(null); }}
                        className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                        aria-label="Supprimer la photo"
                      ><X className="w-3.5 h-3.5" /></button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="flex items-end gap-2">
                {voiceSupported && (
                  <button
                    onClick={toggleVoice}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all shrink-0 ${
                      listening
                        ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/30'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                    aria-label={listening ? 'Arrêter la dictée' : 'Dicter un message'}
                  >
                    {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>
                )}
                {/* Bouton upload photo */}
                <button
                  onClick={() => imageInputRef.current?.click()}
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-all shrink-0 bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-green-100 dark:hover:bg-green-900/30 hover:text-green-600 dark:hover:text-green-400"
                  title="Envoyer une photo pour diagnostic"
                  aria-label="Diagnostic photo"
                >
                  <Image className="w-4 h-4" />
                </button>
                <div className="flex-1 relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Votre question…"
                    disabled={isStreaming}
                    maxLength={500}
                    className="w-full px-3.5 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500/70 focus:border-green-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 placeholder:text-[13px] disabled:opacity-50 transition-all outline-none shadow-[inset_0_1px_3px_rgba(0,0,0,0.04)]"
                  />
                  {input.length > 300 && (
                    <span className={`absolute right-2 bottom-1.5 text-[10px] ${input.length > 480 ? 'text-red-500' : 'text-gray-400'}`}>
                      {input.length}/500
                    </span>
                  )}
                </div>
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isStreaming}
                  className="w-10 h-10 rounded-xl flex items-center justify-center transition-all shrink-0 shadow-sm bg-gradient-to-br from-green-600 to-emerald-700 text-white hover:from-green-500 hover:to-emerald-600 disabled:from-gray-300 disabled:to-gray-300 dark:disabled:from-gray-700 dark:disabled:to-gray-700 disabled:cursor-not-allowed active:scale-95"
                  aria-label="Envoyer"
                >
                  {isStreaming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[10px] text-gray-400 dark:text-gray-600 mt-1.5 text-center select-none flex items-center justify-center gap-1">
                <Cpu className="w-2.5 h-2.5 text-green-400" />
                Assistant IA · AGRIPOINT SERVICES · +237 657 39 39 39
                <span className="w-1 h-1 rounded-full bg-green-400 inline-block" />
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══ INPUT FICHIER CACHÉ (photo diagnostic) ══ */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        aria-label="Sélectionner une photo pour diagnostic"
        title="Sélectionner une photo de plante pour diagnostic"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          if (file.size > 5 * 1024 * 1024) { showToast('⚠️ Image trop grande (max 5 Mo)'); return; }
          setImageFile(file);
          const reader = new FileReader();
          reader.onload = (ev) => setImagePreview(ev.target?.result as string);
          reader.readAsDataURL(file);
          // Reset pour permettre re-sélection du même fichier
          e.target.value = '';
        }}
      />

      {/* ══ MODAL DISTRIBUTEURS ══ */}
      <AnimatePresence>
        {showDistributorsModal && (
          <motion.div
            key="distributors-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowDistributorsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[85vh] overflow-auto"
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-900 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Map className="w-6 h-6 text-green-600" />
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">Nos Distributeurs</h2>
                </div>
                <button
                  onClick={() => setShowDistributorsModal(false)}
                  title="Fermer"
                  aria-label="Fermer la modal"
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6">
                {loadingDistributors ? (
                  <div className="flex items-center justify-center h-96">
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}>
                      <Loader2 className="w-8 h-8 text-green-500" />
                    </motion.div>
                  </div>
                ) : (
                  <DistributorsMap
                    distributors={distributors}
                    onSelectDistributor={() => {}}
                    height="500px"
                    showList={true}
                  />
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══ MODAL LOCALISATION ══ */}
      <AnimatePresence>
        {showLocationModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/50 flex items-end sm:items-center justify-center p-4"
            onClick={() => setShowLocationModal(false)}
          >
            <motion.div
              initial={{ y: 40, opacity: 0, scale: 0.96 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 40, opacity: 0, scale: 0.96 }}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm p-5"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-green-600" />
                <h3 className="font-bold text-gray-900 dark:text-white text-sm">Votre localisation</h3>
                <button onClick={() => setShowLocationModal(false)} title="Fermer" aria-label="Fermer" className="ml-auto text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[12px] text-gray-500 dark:text-gray-400 mb-4">
                Indiquez votre ville pour des conseils adaptés à votre climat.
              </p>
              {userMemory.location && (
                <div className="mb-3 px-3 py-2 bg-green-50 dark:bg-green-900/20 rounded-lg text-[12px] text-green-700 dark:text-green-400 flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  Actuel : <strong>{userMemory.location}</strong>
                  <button
                    onClick={() => {
                      const updated = { ...userMemory, location: undefined, region: undefined };
                      setUserMemory(updated);
                      saveMemory(updated);
                      setShowLocationModal(false);
                      showToast('📍 Localisation effacée');
                    }}
                    className="ml-auto text-red-400 hover:text-red-600 text-[11px]"
                  >Effacer</button>
                </div>
              )}
              <div className="grid grid-cols-2 gap-2 max-h-72 overflow-y-auto">
                {[
                  { city: 'Yaoundé', region: 'Centre' }, { city: 'Douala', region: 'Littoral' },
                  { city: 'Bafoussam', region: 'Ouest' }, { city: 'Garoua', region: 'Nord' },
                  { city: 'Maroua', region: 'Extrême-Nord' }, { city: 'Ngaoundéré', region: 'Adamaoua' },
                  { city: 'Bertoua', region: 'Est' }, { city: 'Ebolowa', region: 'Sud' },
                  { city: 'Bamenda', region: 'Nord-Ouest' }, { city: 'Buea', region: 'Sud-Ouest' },
                  { city: 'Kribi', region: 'Sud' }, { city: 'Limbé', region: 'Sud-Ouest' },
                  { city: 'Edéa', region: 'Littoral' }, { city: 'Foumban', region: 'Ouest' },
                  { city: 'Mbalmayo', region: 'Centre' }, { city: 'Obala', region: 'Centre' },
                ].map(({ city, region }) => (
                  <button
                    key={city}
                    onClick={() => {
                      const updated = { ...userMemory, location: city, region, sessionId };
                      setUserMemory(updated);
                      saveMemory(updated);
                      setShowLocationModal(false);
                      showToast(`📍 Localisation : ${city}`);
                    }}
                    className={`px-3 py-2.5 text-[12px] rounded-xl border text-left transition-all ${
                      userMemory.location === city
                        ? 'bg-green-600 text-white border-green-600'
                        : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:border-green-400 hover:bg-green-50 dark:hover:bg-green-900/20'
                    }`}
                  >
                    <div className="font-medium">{city}</div>
                    <div className={`text-[10px] ${userMemory.location === city ? 'text-green-200' : 'text-gray-400'}`}>{region}</div>
                  </button>
                ))}
              </div>
              <div className="mt-3 flex gap-2">
                <input
                  type="text"
                  placeholder="Autre ville…"
                  className="flex-1 px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-green-400 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  onKeyDown={e => {
                    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                      const city = e.currentTarget.value.trim();
                      const updated = { ...userMemory, location: city, sessionId };
                      setUserMemory(updated);
                      saveMemory(updated);
                      setShowLocationModal(false);
                      showToast(`📍 Localisation : ${city}`);
                    }
                  }}
                />
                <button
                  onClick={() => setShowLocationModal(false)}
                  className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >Annuler</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══ TOAST NOTIFICATIONS ══ */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-28 right-4 sm:right-6 z-[70] bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[12px] font-medium px-4 py-2.5 rounded-xl shadow-2xl"
          >
            {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
