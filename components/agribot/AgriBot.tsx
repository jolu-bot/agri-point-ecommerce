'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, ThumbsUp, ThumbsDown, RotateCcw, Loader2 } from 'lucide-react';

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  feedback?: 'positive' | 'negative';
  isStreaming?: boolean;
  toolStatus?: string;
}

// ─────────────────────────────────────────────
// MARKDOWN RENDERER (léger, sans dépendance)
// ─────────────────────────────────────────────
function renderMarkdown(text: string): string {
  return text
    // Tableaux markdown simples
    .replace(/^\|(.+)\|$/gm, (row) => {
      const cells = row.split('|').filter(c => c.trim());
      const isHeader = false;
      return `<tr>${cells.map(c => `<td class="border border-gray-200 dark:border-gray-600 px-2 py-1 text-xs">${c.trim()}</td>`).join('')}</tr>`;
    })
    // Gras
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Italique
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Titres H3
    .replace(/^### (.+)$/gm, '<h3 class="font-semibold text-sm mt-2 mb-1">$1</h3>')
    // Titres H2
    .replace(/^## (.+)$/gm, '<h2 class="font-bold text-sm mt-2 mb-1">$1</h2>')
    // Listes à puces
    .replace(/^[-•] (.+)$/gm, '<li class="flex gap-1.5"><span class="text-green-500 mt-0.5 shrink-0">▸</span><span>$1</span></li>')
    // Listes numérotées
    .replace(/^\d+\. (.+)$/gm, '<li class="flex gap-1.5"><span class="text-green-500 mt-0.5 shrink-0">→</span><span>$1</span></li>')
    // Liens
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener" class="text-green-600 underline hover:text-green-700">$1</a>')
    // Code inline
    .replace(/`(.+?)`/g, '<code class="bg-gray-100 dark:bg-gray-700 px-1 rounded text-xs font-mono">$1</code>')
    // Sauts de ligne
    .replace(/\n\n/g, '</p><p class="mt-2">')
    .replace(/\n/g, '<br/>');
}

function MarkdownMessage({ content }: { content: string }) {
  const html = renderMarkdown(content);
  return (
    <div
      className="text-sm leading-relaxed [&_li]:ml-1 [&_ul]:space-y-0.5 [&_table]:my-1 [&_table]:w-full [&_table]:border-collapse"
      dangerouslySetInnerHTML={{ __html: `<p>${html}</p>` }}
    />
  );
}

// ─────────────────────────────────────────────
// SUGGESTIONS DYNAMIQUES
// ─────────────────────────────────────────────
const INITIAL_SUGGESTIONS = [
  { label: '🍅 Tomates', text: 'Quel produit pour mes tomates ?' },
  { label: '☕ Cacao/Café', text: 'Conseils pour le cacao et le café ?' },
  { label: '🏙️ Urbain', text: 'Agriculture urbaine : par où commencer ?' },
  { label: '📦 Commander', text: 'Comment commander vos produits ?' },
];

const FOLLOWUP_SUGGESTIONS = [
  { label: '💰 Prix', text: 'Quels sont vos prix ?' },
  { label: '🚚 Livraison', text: 'Quels sont les délais de livraison ?' },
  { label: '💊 Dosage', text: 'Quels sont les dosages recommandés ?' },
  { label: '📞 Contact', text: 'Comment vous contacter ?' },
];

// ─────────────────────────────────────────────
// COMPOSANT PRINCIPAL
// ─────────────────────────────────────────────
export default function AgriBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [sessionId] = useState(() =>
    typeof crypto !== 'undefined' ? crypto.randomUUID() : Math.random().toString(36).slice(2)
  );
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      content: 'Bonjour ! Je suis **AgriBot** 🌱, votre conseiller agricole expert d\'AGRI POINT SERVICE.\n\nJe connais tous nos produits, les techniques agronomiques et peux vous aider à optimiser vos cultures. Comment puis-je vous aider ?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);
  useEffect(() => { if (isOpen) inputRef.current?.focus(); }, [isOpen]);

  // ─── Reset conversation ───
  const resetChat = useCallback(() => {
    abortRef.current?.abort();
    setIsStreaming(false);
    setMessages([{
      id: Date.now().toString(),
      role: 'assistant',
      content: 'Conversation réinitialisée. Comment puis-je vous aider ?',
      timestamp: new Date(),
    }]);
  }, []);

  // ─── Feedback 👍/👎 ───
  const sendFeedback = useCallback(async (messageId: string, feedback: 'positive' | 'negative') => {
    const idx = messages.findIndex(m => m.id === messageId);
    if (idx === -1) return;

    setMessages(prev => prev.map(m =>
      m.id === messageId ? { ...m, feedback } : m
    ));

    try {
      await fetch('/api/agribot', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, messageIndex: idx, feedback }),
      });
    } catch {/* fire-and-forget */}
  }, [messages, sessionId]);

  // ─── Envoi message avec streaming SSE ───
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

    const assistantMsgId = (Date.now() + 1).toString();
    const assistantMsg: Message = {
      id: assistantMsgId,
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
          history: messages.slice(-8).map(m => ({ role: m.role, content: m.content })),
          sessionId,
          metadata: { page: window.location.pathname },
        }),
      });

      if (!res.ok || !res.body) throw new Error('Erreur réseau');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const event = JSON.parse(line.slice(6)) as {
              type: string;
              token?: string;
              message?: string;
              tags?: string[];
            };

            if (event.type === 'token' && event.token) {
              setMessages(prev => prev.map(m =>
                m.id === assistantMsgId
                  ? { ...m, content: m.content + event.token }
                  : m
              ));
            } else if (event.type === 'tool_start') {
              setMessages(prev => prev.map(m =>
                m.id === assistantMsgId
                  ? { ...m, toolStatus: event.message || 'Recherche...' }
                  : m
              ));
            } else if (event.type === 'done') {
              setMessages(prev => prev.map(m =>
                m.id === assistantMsgId
                  ? { ...m, isStreaming: false, toolStatus: undefined }
                  : m
              ));
            } else if (event.type === 'error') {
              setMessages(prev => prev.map(m =>
                m.id === assistantMsgId
                  ? { ...m, content: event.message || 'Erreur technique.', isStreaming: false }
                  : m
              ));
            }
          } catch {/* skip malformed SSE lines */}
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setMessages(prev => prev.map(m =>
          m.id === assistantMsgId
            ? {
                ...m,
                content: 'Erreur de connexion. Contactez-nous au 📞 +237 657 39 39 39',
                isStreaming: false,
              }
            : m
        ));
      }
    } finally {
      setIsStreaming(false);
    }
  }, [input, isStreaming, messages, sessionId]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const suggestions = messages.length <= 1 ? INITIAL_SUGGESTIONS : FOLLOWUP_SUGGESTIONS;

  return (
    <>
      {/* ── Bouton flottant ── */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1.5, type: 'spring', stiffness: 260, damping: 20 }}
        onClick={() => setIsOpen(o => !o)}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-700 text-white rounded-full shadow-2xl hover:shadow-emerald-500/40 hover:scale-105 transition-all flex items-center justify-center group"
        aria-label="Ouvrir AgriBot"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <X className="w-7 h-7" />
            </motion.span>
          ) : (
            <motion.span key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <MessageCircle className="w-7 h-7 group-hover:scale-110 transition-transform" />
            </motion.span>
          )}
        </AnimatePresence>
        {/* Indicateur "en ligne" */}
        <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-white animate-pulse" />
      </motion.button>

      {/* ── Fenêtre de chat ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-24 right-6 z-50 w-[22rem] sm:w-96 h-[600px] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl shadow-gray-900/20 flex flex-col overflow-hidden border border-gray-100 dark:border-gray-800"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-green-700 to-emerald-600 text-white px-4 py-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-xl shrink-0">
                🌱
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm leading-tight">AgriBot</div>
                <div className="text-[11px] text-green-100 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-300 rounded-full inline-block animate-pulse" />
                  Conseiller IA · AGRI POINT SERVICE
                </div>
              </div>
              <button
                onClick={resetChat}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                title="Nouvelle conversation"
                aria-label="Réinitialiser la conversation"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 scroll-smooth">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex flex-col gap-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 ${
                      msg.role === 'user'
                        ? 'bg-green-600 text-white rounded-br-sm'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-sm'
                    }`}
                  >
                    {/* Tool status badge */}
                    {msg.toolStatus && (
                      <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 mb-1.5 font-medium">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        {msg.toolStatus}
                      </div>
                    )}

                    {/* Contenu */}
                    {msg.role === 'user' ? (
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    ) : (
                      <MarkdownMessage content={msg.content} />
                    )}

                    {/* Curseur clignotant pendant streaming */}
                    {msg.isStreaming && (
                      <span className="inline-block w-0.5 h-3.5 bg-green-500 ml-0.5 animate-pulse align-middle" />
                    )}

                    {/* Heure */}
                    <p className={`text-[10px] mt-1 ${msg.role === 'user' ? 'text-green-200' : 'text-gray-400 dark:text-gray-500'}`}>
                      {msg.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>

                  {/* Feedback pour les messages IA non-streaming */}
                  {msg.role === 'assistant' && !msg.isStreaming && msg.content.length > 20 && (
                    <div className="flex items-center gap-1 ml-1">
                      <button
                        onClick={() => sendFeedback(msg.id, 'positive')}
                        className={`w-6 h-6 rounded-full flex items-center justify-center transition-all text-xs ${
                          msg.feedback === 'positive'
                            ? 'bg-green-100 text-green-600 scale-110'
                            : 'text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30'
                        }`}
                        title="Utile"
                        aria-label="Marquer comme utile"
                      >
                        <ThumbsUp className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => sendFeedback(msg.id, 'negative')}
                        className={`w-6 h-6 rounded-full flex items-center justify-center transition-all text-xs ${
                          msg.feedback === 'negative'
                            ? 'bg-red-100 text-red-500 scale-110'
                            : 'text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30'
                        }`}
                        title="Pas utile"
                        aria-label="Marquer comme inutile"
                      >
                        <ThumbsDown className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              ))}

              {/* Indicateur de frappe (uniquement si le dernier message assistant est vide) */}
              {isStreaming && messages[messages.length - 1]?.content === '' && (
                <div className="flex items-start">
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-3 rounded-bl-sm">
                    <div className="flex gap-1.5">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce [animation-delay:0ms]" />
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce [animation-delay:150ms]" />
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce [animation-delay:300ms]" />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Suggestions rapides */}
            <div className="px-3 pb-2">
              <div className="flex flex-wrap gap-1.5">
                {suggestions.map((s, i) => (
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

            {/* Barre d'input */}
            <div className="border-t border-gray-100 dark:border-gray-800 px-3 py-3">
              <div className="flex items-end gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Votre question…"
                  disabled={isStreaming}
                  className="flex-1 px-3.5 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 disabled:opacity-50 transition-all outline-none resize-none"
                  maxLength={500}
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isStreaming}
                  className="w-10 h-10 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white rounded-xl flex items-center justify-center transition-all disabled:cursor-not-allowed shrink-0 shadow-sm"
                  aria-label="Envoyer"
                >
                  {isStreaming ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </div>
              <p className="text-[10px] text-gray-400 mt-1.5 text-center">
                IA propulsée par AGRI POINT SERVICE
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

