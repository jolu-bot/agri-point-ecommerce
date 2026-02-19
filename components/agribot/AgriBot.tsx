'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle, X, Send, ThumbsUp, ThumbsDown, RotateCcw,
  Loader2, Copy, Check, Maximize2, Minimize2, Mic, MicOff,
  ChevronDown, Sparkles, ShoppingCart, Leaf, AlertTriangle,
  UserCircle2, Package,
} from 'lucide-react';

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// TYPES
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
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
}

type Intent = 'conseil' | 'produit' | 'commande' | 'compte' | 'urgence' | 'culture' | string;

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// MARKDOWN RENDERER â€” tables, listes, titres, liens, code
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
function renderMarkdown(raw: string): string {
  // 1. Nettoyer les balises suggestions cachÃ©es
  let text = raw.replace(/<!--\s*SUGGESTIONS:[\s\S]*?-->/g, '').trim();

  // 2. Tableaux markdown (ligne | col | col |)
  text = text.replace(/((?:^\|.+\|\s*$\n?)+)/gm, (block) => {
    const rows = block.trim().split('\n').filter(r => r.trim());
    const parsed = rows.map(row =>
      row.split('|').filter((_, i, a) => i > 0 && i < a.length - 1).map(c => c.trim())
    );
    if (parsed.length < 2) return block;

    const isSeperator = (row: string[]) => row.every(c => /^[-:]+$/.test(c));
    const headerRow = parsed[0];
    const bodyRows = parsed.slice(isSeperator(parsed[1] || []) ? 2 : 1);

    const th = headerRow.map(c => `<th class="px-2 py-1.5 text-left text-xs font-semibold bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">${c}</th>`).join('');
    const trs = bodyRows.map(row =>
      `<tr class="even:bg-gray-50 dark:even:bg-gray-800/50">${row.map(c =>
        `<td class="px-2 py-1.5 text-xs border border-gray-200 dark:border-gray-700">${c}</td>`
      ).join('')}</tr>`
    ).join('');

    return `<div class="overflow-x-auto my-2 rounded-lg border border-green-200 dark:border-green-800"><table class="w-full text-sm border-collapse"><thead><tr>${th}</tr></thead><tbody>${trs}</tbody></table></div>`;
  });

  // 3. Titres
  text = text
    .replace(/^### (.+)$/gm, '<h3 class="font-semibold text-[13px] mt-3 mb-1 text-green-800 dark:text-green-300">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="font-bold text-sm mt-3 mb-1.5 text-green-900 dark:text-green-200 border-b border-green-100 dark:border-green-900 pb-1">$1</h2>');

  // 4. Listes (groupÃ©es en <ul>)
  text = text.replace(/((?:^[-â€¢*] .+\n?)+)/gm, (block) => {
    const items = block.trim().split('\n').map(l =>
      `<li class="flex gap-2 items-start"><span class="text-green-500 shrink-0 mt-0.5 text-xs">â–¸</span><span>${l.replace(/^[-â€¢*] /, '')}</span></li>`
    ).join('');
    return `<ul class="space-y-1 my-1.5 list-none">${items}</ul>`;
  });

  // 5. Listes numÃ©rotÃ©es
  text = text.replace(/((?:^\d+\. .+\n?)+)/gm, (block) => {
    let n = 0;
    const items = block.trim().split('\n').map(l => {
      n++;
      return `<li class="flex gap-2 items-start"><span class="text-green-600 dark:text-green-400 font-bold shrink-0 min-w-[1.2rem] text-xs">${n}.</span><span>${l.replace(/^\d+\. /, '')}</span></li>`;
    }).join('');
    return `<ol class="space-y-1 my-1.5 list-none">${items}</ol>`;
  });

  // 6. Gras, italique, code inline, liens, barrÃ©
  text = text
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/~~(.+?)~~/g, '<del class="opacity-60">$1</del>')
    .replace(/`(.+?)`/g, '<code class="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-xs font-mono text-green-700 dark:text-green-300">$1</code>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-green-600 dark:text-green-400 underline decoration-dotted hover:decoration-solid font-medium">$1 â†—</a>');

  // 7. SÃ©parateurs ---
  text = text.replace(/^---+$/gm, '<hr class="my-2 border-gray-200 dark:border-gray-700"/>');

  // 8. Sauts de ligne â†’ paragraphes
  text = text
    .replace(/\n\n/g, '</p><p class="mt-2">')
    .replace(/\n/g, '<br/>');

  return `<p class="leading-relaxed">${text}</p>`;
}

function MarkdownMessage({ content }: { content: string }) {
  const html = useMemo(() => renderMarkdown(content), [content]);
  return (
    <div
      className="text-[13px] leading-relaxed prose-sm max-w-none
        [&_strong]:font-semibold
        [&_ul]:my-1 [&_ol]:my-1
        [&_h2]:mt-2 [&_h3]:mt-2
        [&_p+p]:mt-1.5
        [&_a]:break-words"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// BADGE D'INTENTION
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
const INTENT_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  conseil:  { label: 'Conseil', icon: <Leaf className="w-2.5 h-2.5" />, color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  produit:  { label: 'Produit', icon: <Package className="w-2.5 h-2.5" />, color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  commande: { label: 'Commande', icon: <ShoppingCart className="w-2.5 h-2.5" />, color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
  compte:   { label: 'Mon compte', icon: <UserCircle2 className="w-2.5 h-2.5" />, color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
  urgence:  { label: 'ðŸš¨ Urgent', icon: <AlertTriangle className="w-2.5 h-2.5" />, color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  culture:  { label: 'Culture', icon: <Sparkles className="w-2.5 h-2.5" />, color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
};

function IntentBadge({ intent }: { intent: string }) {
  const cfg = INTENT_CONFIG[intent] || INTENT_CONFIG.conseil;
  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium ${cfg.color}`}>
      {cfg.icon}{cfg.label}
    </span>
  );
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// BOUTON COPIE
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
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
      title="Copier"
      aria-label="Copier le message"
    >
      {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
    </button>
  );
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// SUGGESTIONS PAR DÃ‰FAUT
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
const DEFAULT_SUGGESTIONS: { label: string; text: string; intent: Intent }[] = [
  { label: 'ðŸ… Conseils tomates', text: 'Quel programme complet pour mes tomates ?', intent: 'culture' },
  { label: 'â˜• Cacao / cafÃ©', text: 'Comment optimiser ma rÃ©colte de cacao ?', intent: 'culture' },
  { label: 'ðŸ“¦ Voir les produits', text: 'Quels produits proposez-vous et Ã  quel prix ?', intent: 'produit' },
  { label: 'ðŸ›’ Comment commander', text: 'Comment passer une commande sur votre site ?', intent: 'commande' },
  { label: 'ðŸ‘¤ CrÃ©er un compte', text: 'Comment crÃ©er mon compte sur agri-ps.com ?', intent: 'compte' },
  { label: 'ðŸ™ï¸ Jardin urbain', text: 'J\'ai un balcon, par oÃ¹ commencer ?', intent: 'conseil' },
  { label: 'ðŸ” Suivre commande', text: 'Comment suivre ma commande ?', intent: 'commande' },
  { label: 'âš–ï¸ Comparer produits', text: 'Quelle est la diffÃ©rence entre HUMIFORTE et FOSNUTREN ?', intent: 'produit' },
];

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// WEB SPEECH API HOOK
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
function useVoiceInput(onResult: (text: string) => void) {
  const [listening, setListening] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recRef = useRef<any>(null);
  const supported = typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  const toggle = useCallback(() => {
    if (!supported) return;
    if (listening) {
      recRef.current?.stop();
      setListening(false);
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
    const rec = new SR();
    rec.lang = 'fr-FR';
    rec.continuous = false;
    rec.interimResults = false;
    rec.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      onResult(transcript);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recRef.current = rec;
    rec.start();
    setListening(true);
  }, [listening, onResult, supported]);

  return { listening, toggle, supported };
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// COMPOSANT PRINCIPAL â€” AgriBot v3
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
export default function AgriBot() {
  const [isOpen, setIsOpen]     = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sessionId]             = useState(() =>
    typeof crypto !== 'undefined' ? crypto.randomUUID() : Math.random().toString(36).slice(2)
  );
  const [messages, setMessages] = useState<Message[]>([{
    id: '0',
    role: 'assistant',
    intent: 'conseil',
    content: `Bonjour ! Je suis **AgriBot** ðŸŒ±, votre conseiller expert d'AGRI POINT SERVICE.

Je peux vous aider Ã  :
- ðŸŒ± **Conseils cultures** : tomate, cacao, cafÃ©, maÃ¯s, agrumesâ€¦
- ðŸ’Š **Choisir vos produits** et calculer les doses
- ðŸ›’ **Commander** et suivre vos livraisons
- ðŸ‘¤ **GÃ©rer votre compte** client
- ðŸš¨ **Diagnostiquer** un problÃ¨me urgent sur vos plants

Comment puis-je vous aider aujourd'hui ?`,
    timestamp: new Date(),
    suggestions: [],
  }]);
  const [input, setInput]           = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const messagesEndRef  = useRef<HTMLDivElement>(null);
  const messagesListRef = useRef<HTMLDivElement>(null);
  const inputRef        = useRef<HTMLInputElement>(null);
  const abortRef        = useRef<AbortController | null>(null);

  // â”€â”€â”€ Voice input â”€â”€â”€
  const { listening, toggle: toggleVoice, supported: voiceSupported } = useVoiceInput(
    useCallback((text: string) => setInput(prev => prev + text), [])
  );

  // â”€â”€â”€ Scroll management â”€â”€â”€
  const scrollToBottom = useCallback((force = false) => {
    if (force) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    } else {
      const el = messagesListRef.current;
      if (el && el.scrollHeight - el.scrollTop - el.clientHeight < 120) {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, []);

  const handleScroll = useCallback(() => {
    const el = messagesListRef.current;
    if (!el) return;
    setShowScrollBtn(el.scrollHeight - el.scrollTop - el.clientHeight > 200);
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);
  useEffect(() => { if (isOpen) { inputRef.current?.focus(); setUnreadCount(0); } }, [isOpen]);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape' && isOpen) setIsOpen(false); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen]);

  // â”€â”€â”€ Reset conversation â”€â”€â”€
  const resetChat = useCallback(() => {
    abortRef.current?.abort();
    setIsStreaming(false);
    setMessages([{
      id: Date.now().toString(),
      role: 'assistant',
      intent: 'conseil',
      content: 'Nouvelle conversation dÃ©marrÃ©e ðŸŒ± Comment puis-je vous aider ?',
      timestamp: new Date(),
    }]);
  }, []);

  // â”€â”€â”€ Feedback ðŸ‘/ðŸ‘Ž â”€â”€â”€
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

  // â”€â”€â”€ Envoi message + streaming SSE â”€â”€â”€
  const handleSend = useCallback(async (text?: string) => {
    const messageText = (text || input).trim();
    if (!messageText || isStreaming) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    };
    const assistantId = (Date.now() + 1).toString();
    const assistantMsg: Message = {
      id: assistantId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true,
    };

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

      if (!res.ok || !res.body) throw new Error('Erreur rÃ©seau');

      const reader = res.body.getReader();
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
              type: string;
              token?: string;
              message?: string;
              tags?: string[];
              intent?: string;
              suggestions?: string[];
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
                  ? { ...m, isStreaming: false, toolStatus: undefined, intent: ev.intent, suggestions: ev.suggestions || [] }
                  : m
              ));
              if (!isOpen) setUnreadCount(n => n + 1);
            } else if (ev.type === 'error') {
              setMessages(prev => prev.map(m =>
                m.id === assistantId
                  ? { ...m, content: ev.message || 'Erreur technique.', isStreaming: false }
                  : m
              ));
            }
          } catch { /* skip */ }
        }
      }
    } catch (err: unknown) {
      if (!(err instanceof Error && err.name === 'AbortError')) {
        setMessages(prev => prev.map(m =>
          m.id === assistantId
            ? { ...m, content: 'âš ï¸ Erreur de connexion. RÃ©essayez ou contactez-nous au ðŸ“ž +237 657 39 39 39', isStreaming: false }
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

  // â”€â”€â”€ Suggestions actives = derniÃ¨res suggestions IA ou dÃ©faut â”€â”€â”€
  const lastAiMsg   = [...messages].reverse().find(m => m.role === 'assistant' && !m.isStreaming);
  const activeSugs  = (lastAiMsg?.suggestions?.length ?? 0) > 0
    ? (lastAiMsg!.suggestions!).map((s: string) => ({ label: s, text: s, intent: 'conseil' as Intent }))
    : messages.length <= 1
    ? DEFAULT_SUGGESTIONS.slice(0, 4)
    : DEFAULT_SUGGESTIONS.slice(4, 7);

  // â”€â”€â”€ Layout classes (compact vs fullscreen) â”€â”€â”€
  const chatClass = isFullscreen
    ? 'fixed inset-4 sm:inset-8 z-50 rounded-2xl'
    : 'fixed bottom-24 right-4 sm:right-6 z-50 w-[22.5rem] sm:w-[26rem] h-[620px] rounded-2xl';

  return (
    <>
      {/* â•â•â• BOUTON FLOTTANT â•â•â• */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1.2, type: 'spring', stiffness: 280, damping: 22 }}
        onClick={() => setIsOpen(o => !o)}
        className="fixed bottom-6 right-4 sm:right-6 z-50 w-[58px] h-[58px] bg-gradient-to-br from-green-600 via-green-700 to-emerald-800 text-white rounded-full shadow-2xl shadow-green-900/30 hover:scale-105 active:scale-95 transition-transform flex items-center justify-center"
        aria-label="Ouvrir AgriBot"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.span key="x"
              initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.18 }}>
              <X className="w-6 h-6" />
            </motion.span>
          ) : (
            <motion.span key="chat"
              initial={{ rotate: 90, opacity: 0, scale: 0.5 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: -90, opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.18 }}>
              <MessageCircle className="w-6 h-6" />
            </motion.span>
          )}
        </AnimatePresence>

        {/* Badge "en ligne" */}
        <span className="absolute top-0.5 right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />

        {/* Unread badge */}
        {unreadCount > 0 && !isOpen && (
          <motion.span
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            className="absolute -top-1 -left-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1"
          >
            {unreadCount}
          </motion.span>
        )}

        {/* Pulse ring */}
        {!isOpen && (
          <span className="absolute inset-0 rounded-full border-2 border-green-400 animate-ping opacity-30" />
        )}
      </motion.button>

      {/* â•â•â• FENÃŠTRE DE CHAT â•â•â• */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="chatwindow"
            initial={{ opacity: 0, y: 20, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.94 }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className={`${chatClass} bg-white dark:bg-gray-950 shadow-2xl shadow-gray-900/25 flex flex-col overflow-hidden border border-gray-100 dark:border-gray-800`}
          >
            {/* â”€â”€ HEADER â”€â”€ */}
            <div className="bg-gradient-to-r from-green-800 via-green-700 to-emerald-600 text-white px-4 py-3 flex items-center gap-3 shrink-0">
              {/* Avatar animÃ© */}
              <div className="relative shrink-0">
                <div className="w-10 h-10 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center text-[22px] ring-2 ring-white/20">
                  ðŸŒ±
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-300 rounded-full border-2 border-emerald-700 animate-pulse" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="font-bold text-[15px] leading-tight tracking-tight">AgriBot</div>
                <div className="text-[11px] text-green-100 flex items-center gap-1.5">
                  <span className="opacity-80">AGRI POINT SERVICE</span>
                  <span className="w-1 h-1 rounded-full bg-green-300" />
                  <span className="text-green-200 font-medium">
                    {isStreaming ? (
                      <span className="flex items-center gap-1">
                        <Loader2 className="w-2.5 h-2.5 animate-spin" /> rÃ©dactionâ€¦
                      </span>
                    ) : 'En ligne'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {/* Plein Ã©cran */}
                <button
                  onClick={() => setIsFullscreen(f => !f)}
                  className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                  title={isFullscreen ? 'FenÃªtrÃ©e' : 'Plein Ã©cran'}
                  aria-label="Basculer plein Ã©cran"
                >
                  {isFullscreen
                    ? <Minimize2 className="w-3.5 h-3.5" />
                    : <Maximize2 className="w-3.5 h-3.5" />}
                </button>

                {/* Reset */}
                <button
                  onClick={resetChat}
                  className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                  title="Nouvelle conversation"
                  aria-label="RÃ©initialiser"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* â”€â”€ MESSAGES â”€â”€ */}
            <div
              ref={messagesListRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto px-3 py-3 space-y-2 scroll-smooth"
            >
              {messages.map((msg, idx) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.2, delay: idx === messages.length - 1 ? 0 : 0 }}
                  className={`flex flex-col gap-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  {/* Badge intent (assistant uniquement) */}
                  {msg.role === 'assistant' && msg.intent && !msg.isStreaming && idx > 0 && (
                    <IntentBadge intent={msg.intent} />
                  )}

                  {/* Bulle */}
                  <div className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-br from-green-600 to-green-700 text-white rounded-br-sm shadow-sm'
                      : 'bg-gray-50 dark:bg-gray-800/80 text-gray-900 dark:text-gray-100 rounded-bl-sm border border-gray-100 dark:border-gray-700/50 shadow-sm'
                  }`}>

                    {/* Tool status */}
                    {msg.toolStatus && (
                      <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 mb-2 font-medium"
                      >
                        <Loader2 className="w-3 h-3 animate-spin shrink-0" />
                        <span>{msg.toolStatus}</span>
                      </motion.div>
                    )}

                    {/* Contenu */}
                    {msg.role === 'user'
                      ? <p className="text-[13px] whitespace-pre-wrap break-words">{msg.content}</p>
                      : <MarkdownMessage content={msg.content} />
                    }

                    {/* Curseur streaming */}
                    {msg.isStreaming && msg.content && (
                      <span className="inline-block w-0.5 h-3.5 bg-green-500 ml-0.5 align-middle animate-pulse" />
                    )}

                    {/* Timestamp */}
                    <p className={`text-[10px] mt-1.5 select-none ${msg.role === 'user' ? 'text-green-200' : 'text-gray-400 dark:text-gray-500'}`}>
                      {msg.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>

                  {/* Actions sous le message IA */}
                  {msg.role === 'assistant' && !msg.isStreaming && msg.content.length > 15 && (
                    <div className="flex items-center gap-0.5 ml-1">
                      <button
                        onClick={() => sendFeedback(msg.id, 'positive')}
                        className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                          msg.feedback === 'positive'
                            ? 'bg-green-100 dark:bg-green-900/40 text-green-600 scale-110'
                            : 'text-gray-300 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                        }`}
                        title="Utile"
                        aria-label="Utile"
                      >
                        <ThumbsUp className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => sendFeedback(msg.id, 'negative')}
                        className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                          msg.feedback === 'negative'
                            ? 'bg-red-100 dark:bg-red-900/40 text-red-500 scale-110'
                            : 'text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                        }`}
                        title="Pas utile"
                        aria-label="Pas utile"
                      >
                        <ThumbsDown className="w-3 h-3" />
                      </button>
                      <CopyButton text={msg.content} />
                    </div>
                  )}
                </motion.div>
              ))}

              {/* Typing dots (uniquement si streaming avec contenu vide) */}
              {isStreaming && messages[messages.length - 1]?.content === '' && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                  className="flex items-start"
                >
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

            {/* â”€â”€ BOUTON SCROLL DOWN â”€â”€ */}
            <AnimatePresence>
              {showScrollBtn && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => scrollToBottom(true)}
                  className="absolute bottom-28 right-4 w-8 h-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full shadow-lg flex items-center justify-center text-gray-500 hover:text-green-600 transition-colors z-10"
                  aria-label="DÃ©filer vers le bas"
                >
                  <ChevronDown className="w-4 h-4" />
                </motion.button>
              )}
            </AnimatePresence>

            {/* â”€â”€ SUGGESTIONS â”€â”€ */}
            <div className="px-3 pt-2 pb-1 shrink-0">
              <div className="flex gap-1.5 flex-wrap">
                {activeSugs.slice(0, isFullscreen ? 6 : 4).map((s, i) => (
                  <motion.button
                    key={`${s.text}-${i}`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => handleSend(s.text)}
                    disabled={isStreaming}
                    className="text-[11px] px-2.5 py-1 rounded-full border border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/60 transition-colors disabled:opacity-40 whitespace-nowrap"
                  >
                    {s.label}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* â”€â”€ INPUT BAR â”€â”€ */}
            <div className="border-t border-gray-100 dark:border-gray-800 px-3 pt-2 pb-3 shrink-0 bg-white dark:bg-gray-950">
              <div className="flex items-end gap-2">
                {/* Vocal */}
                {voiceSupported && (
                  <button
                    onClick={toggleVoice}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all shrink-0 ${
                      listening
                        ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/30'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-green-100 dark:hover:bg-green-900/30 hover:text-green-600'
                    }`}
                    title={listening ? 'ArrÃªter l\'Ã©coute' : 'Dicter votre message'}
                    aria-label="EntrÃ©e vocale"
                  >
                    {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>
                )}

                {/* Champ texte */}
                <div className="flex-1 relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={listening ? 'ðŸŽ¤ Ã‰coute en coursâ€¦' : 'Votre questionâ€¦'}
                    disabled={isStreaming}
                    maxLength={500}
                    className="w-full px-3.5 py-2.5 text-[13px] border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 disabled:opacity-50 outline-none transition-all pr-10"
                  />
                  {/* Compteur caractÃ¨res */}
                  {input.length > 300 && (
                    <span className={`absolute right-3 bottom-2 text-[10px] ${input.length > 480 ? 'text-red-500' : 'text-gray-400'}`}>
                      {500 - input.length}
                    </span>
                  )}
                </div>

                {/* Bouton envoyer */}
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isStreaming}
                  className="w-10 h-10 rounded-xl flex items-center justify-center transition-all shrink-0 shadow-sm bg-gradient-to-br from-green-600 to-emerald-700 text-white hover:from-green-500 hover:to-emerald-600 disabled:from-gray-300 disabled:to-gray-300 dark:disabled:from-gray-700 dark:disabled:to-gray-700 disabled:cursor-not-allowed active:scale-95"
                  aria-label="Envoyer"
                >
                  {isStreaming
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <Send className="w-4 h-4" />}
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
