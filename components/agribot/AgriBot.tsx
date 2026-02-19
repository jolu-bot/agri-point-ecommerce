'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle, X, Send, ThumbsUp, ThumbsDown, RotateCcw,
  Loader2, Copy, Check, Maximize2, Minimize2, Mic, MicOff,
  ChevronDown, Sparkles, ShoppingCart, Leaf, AlertTriangle,
  UserCircle2, Package, Phone,
} from 'lucide-react';

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
  conseil:  { label: 'Conseil',    icon: <Leaf className="w-2.5 h-2.5" />,         color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  produit:  { label: 'Produit',    icon: <Package className="w-2.5 h-2.5" />,       color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  commande: { label: 'Commande',   icon: <ShoppingCart className="w-2.5 h-2.5" />,  color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
  compte:   { label: 'Mon compte', icon: <UserCircle2 className="w-2.5 h-2.5" />,   color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
  urgence:  { label: 'Urgent',     icon: <AlertTriangle className="w-2.5 h-2.5" />, color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  culture:  { label: 'Culture',    icon: <Sparkles className="w-2.5 h-2.5" />,      color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
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
    `Bonjour, j'ai besoin d'aide après ma conversation avec AgriBot.\n\nSujet : ${context.replace(/<[^>]+>/g, '').slice(0, 200)}`
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
        Pour les cas complexes ou urgences terrain, un agronome AGRI POINT est disponible maintenant.
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
// SUGGESTIONS PAR DÉFAUT
// ═══════════════════════════════════════════════════════════════════
const DEFAULT_SUGGESTIONS: { label: string; text: string; intent: Intent }[] = [
  { label: '🍅 Tomates',      text: 'Quel programme complet pour mes tomates ?',      intent: 'culture'  },
  { label: '☕ Cacao/Café',   text: 'Conseils pour booster mon cacao et café ?',       intent: 'culture'  },
  { label: '🏙️ Balcon',      text: 'Comment jardiner sur mon balcon en ville ?',      intent: 'conseil'  },
  { label: '🛒 Commander',    text: 'Comment passer une commande sur le site ?',       intent: 'commande' },
  { label: '🚚 Livraison',    text: 'Délais et frais de livraison ?',                  intent: 'commande' },
  { label: '💊 Dosage',       text: 'Comment calculer la dose pour 500 m² ?',         intent: 'conseil'  },
  { label: '📋 Mon compte',   text: 'Comment créer mon compte client ?',              intent: 'compte'   },
  { label: '🌿 Saison',       text: 'Quels produits utiliser en ce moment ?',         intent: 'conseil'  },
];

// ═══════════════════════════════════════════════════════════════════
// HOOK VOICE INPUT (Web Speech API fr-FR)
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
  const [isOpen, setIsOpen]               = useState(false);
  const [isFullscreen, setIsFullscreen]   = useState(false);
  const [sessionId]                       = useState(() =>
    typeof crypto !== 'undefined' ? crypto.randomUUID() : Math.random().toString(36).slice(2)
  );
  const [messages, setMessages] = useState<Message[]>([{
    id: '0',
    role: 'assistant',
    intent: 'conseil',
    content: `Bonjour ! Je suis **AgriBot** 🌱, votre conseiller expert d'AGRI POINT SERVICE.

Je peux vous aider à :
- 🌱 **Conseils cultures** : tomate, cacao, café, maïs, agrumes…
- 💊 **Choisir vos produits** et calculer les doses exactes
- 🛒 **Commander** et suivre vos livraisons en temps réel
- 👤 **Gérer votre compte** client
- 🚨 **Diagnostiquer** un problème urgent sur vos plants

Comment puis-je vous aider aujourd'hui ?`,
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

  // ─── Reset ───
  const resetChat = useCallback(() => {
    abortRef.current?.abort();
    setIsStreaming(false);
    setMessages([{
      id: Date.now().toString(),
      role: 'assistant',
      intent: 'conseil',
      content: 'Nouvelle conversation démarrée 🌱 Comment puis-je vous aider ?',
      timestamp: new Date(),
    }]);
  }, []);

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
              setMessages(prev => prev.map(m =>
                m.id === assistantId
                  ? { ...m, isStreaming: false, toolStatus: undefined, intent: ev.intent, suggestions: ev.suggestions || [], escalated: ev.escalate }
                  : m
              ));
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
  }, [input, isStreaming, messages, sessionId, isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  // ─── Suggestions actives ───
  const lastAiMsg  = [...messages].reverse().find(m => m.role === 'assistant' && !m.isStreaming);
  const activeSugs = (lastAiMsg?.suggestions?.length ?? 0) > 0
    ? (lastAiMsg!.suggestions!).map((s: string) => ({ label: s, text: s, intent: 'conseil' as Intent }))
    : messages.length <= 1
    ? DEFAULT_SUGGESTIONS.slice(0, 4)
    : DEFAULT_SUGGESTIONS.slice(4, 7);

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
        className="fixed bottom-6 right-4 sm:right-6 z-50 w-[58px] h-[58px] bg-gradient-to-br from-green-600 via-green-700 to-emerald-800 text-white rounded-full shadow-2xl shadow-green-900/30 hover:scale-105 active:scale-95 transition-transform flex items-center justify-center"
        aria-label="Ouvrir AgriBot"
      >
        {!isOpen && <span className="absolute inset-0 rounded-full bg-green-500 opacity-20 animate-ping" />}
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
            className={`${chatClass} bg-white dark:bg-gray-900 shadow-2xl shadow-gray-900/25 flex flex-col overflow-hidden border border-gray-100 dark:border-gray-800`}
          >
            {/* HEADER */}
            <div className="bg-gradient-to-r from-green-700 via-green-600 to-emerald-600 text-white px-4 py-3 flex items-center gap-3 shrink-0">
              <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-xl shrink-0">🌱</div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm leading-tight">AgriBot</div>
                <div className="text-[11px] text-green-100 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-green-300 rounded-full inline-block animate-pulse" />
                  Conseiller IA · AGRI POINT SERVICE
                </div>
              </div>
              <div className="flex items-center gap-1">
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

            {/* MESSAGES */}
            <div ref={messagesListRef} onScroll={handleScroll} className="flex-1 overflow-y-auto px-3 py-3 space-y-3 scroll-smooth">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex flex-col gap-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>

                  {/* Bulle */}
                  <div className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-br from-green-600 to-emerald-700 text-white rounded-br-sm shadow-sm'
                      : 'bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-sm border border-gray-100 dark:border-gray-700'
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
                    </div>
                  )}

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

            {/* Scroll-to-bottom */}
            <AnimatePresence>
              {showScrollBtn && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => scrollToBottom(true)}
                  className="absolute bottom-[7.5rem] right-4 w-8 h-8 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full shadow-md flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors z-10"
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
                    onClick={() => handleSend(s.text)}
                    disabled={isStreaming}
                    className="text-[11px] px-2.5 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-full hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors disabled:opacity-40 border border-green-200 dark:border-green-800 whitespace-nowrap"
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* INPUT */}
            <div className="border-t border-gray-100 dark:border-gray-800 px-3 py-3 shrink-0">
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
                    className="w-full px-3.5 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 disabled:opacity-50 transition-all outline-none"
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
              <p className="text-[10px] text-gray-400 dark:text-gray-600 mt-1.5 text-center select-none">
                AgriBot IA · AGRI POINT SERVICE · 📞 +237 657 39 39 39
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
