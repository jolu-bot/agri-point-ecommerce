'use client';

import { useEffect, useRef } from 'react';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle, X, Send, ThumbsUp, ThumbsDown, RotateCcw,
  Loader2, Maximize2, Minimize2, Mic, MicOff,
  ChevronDown, ShoppingCart, Sparkles,
  UserCircle2, Volume2, Image,
  ExternalLink, Globe,
  SaveAll, Download, History, MapPin, Share2, Trash2,
  ChevronRight, BookOpen, Cpu, VolumeX, Mail, Copy, Map,
  Settings,
} from 'lucide-react';
import { extractProductsFromText } from '@/lib/agribot-calendar';
import DistributorsMap from '@/components/DistributorsMap';
import { useAgriBot } from '@/hooks/useAgriBot';
import { useAgribotI18n } from '@/lib/hooks/useAgribotI18n';
import { MarkdownMessage }   from './MarkdownMessage';
import { IntentBadge }       from './IntentBadge';
import { CopyButton }        from './CopyButton';
import { EscalationCard }    from './EscalationCard';
import { EligibilityWidget } from './EligibilityWidget';

// ─────────────────────────────────────────────────────────────────────────────
// VILLES CAMEROUN — grille localisation
// ─────────────────────────────────────────────────────────────────────────────
const CITIES = [
  { city: 'Yaoundé',    region: 'Centre'       }, { city: 'Douala',     region: 'Littoral'    },
  { city: 'Bafoussam',  region: 'Ouest'        }, { city: 'Garoua',     region: 'Nord'        },
  { city: 'Maroua',     region: 'Extrême-Nord' }, { city: 'Ngaoundéré', region: 'Adamaoua'   },
  { city: 'Bertoua',    region: 'Est'          }, { city: 'Ebolowa',    region: 'Sud'         },
  { city: 'Bamenda',    region: 'Nord-Ouest'   }, { city: 'Buea',       region: 'Sud-Ouest'  },
  { city: 'Kribi',      region: 'Sud'          }, { city: 'Limbé',      region: 'Sud-Ouest'  },
  { city: 'Edéa',       region: 'Littoral'     }, { city: 'Foumban',    region: 'Ouest'      },
  { city: 'Mbalmayo',   region: 'Centre'       }, { city: 'Obala',      region: 'Centre'     },
];

// ─────────────────────────────────────────────────────────────────────────────
// COMPOSANT PRINCIPAL — orchestrateur pur
// ─────────────────────────────────────────────────────────────────────────────
export default function AgriBot() {
  const t = useAgribotI18n();
  const {
    isOpen, setIsOpen,
    isFullscreen, setIsFullscreen,
    showEligibility, setShowEligibility,
    showOptionsMenu, setShowOptionsMenu,
    showHistoryPanel, setShowHistoryPanel,
    showLocationModal, setShowLocationModal,
    showDistributorsModal, setShowDistributorsModal,
    toastMsg,
    unreadCount,
    showScrollBtn,
    messages,
    input, setInput,
    isStreaming,
    seasonalBanner, setSeasonalBanner,
    userMemory,
    distributors,
    loadingDistributors,
    savedConversations,
    imageFile,
    imagePreview,
    isAnalyzing,
    ttsEnabled,
    listening,
    voiceSupported,
    activeSugs,
    isCampaignPage,
    isPulsingPage,
    messagesEndRef,
    messagesListRef,
    inputRef,
    imageInputRef,
    locale,
    handleSend,
    handleKeyDown,
    handleScroll,
    handleAnalyzeImage,
    handleImageFileChange,
    resetChat,
    sendFeedback,
    speakText,
    toggleVoice,
    toggleTts,
    scrollToBottom,
    saveCurrentConversation,
    loadConversation,
    deleteConversation,
    copyAllMessages,
    sendEmailSummary,
    exportTxt,
    shareWhatsApp,
    setLocation,
    clearLocation,
    clearImage,
  } = useAgriBot();

  // Return focus to the FAB when the dialog is closed (WCAG 2.1 § 3.2.2)
  const fabRef    = useRef<HTMLButtonElement>(null);
  const wasOpen   = useRef(false);
  useEffect(() => {
    if (wasOpen.current && !isOpen) fabRef.current?.focus();
    wasOpen.current = isOpen;
  }, [isOpen]);

  // Focus traps for both modals — keeps Tab inside + handles Escape
  const distributorsModalRef = useFocusTrap<HTMLDivElement>(showDistributorsModal, () => setShowDistributorsModal(false));
  const locationModalRef     = useFocusTrap<HTMLDivElement>(showLocationModal,    () => setShowLocationModal(false));

  const chatClass = isFullscreen
    ? 'fixed inset-4 sm:inset-8 z-50 rounded-2xl'
    : 'fixed bottom-24 right-4 sm:right-6 z-50 w-[22.5rem] sm:w-[26rem] h-[620px] rounded-2xl';

  const optionsItems = [
    { icon: <SaveAll className="w-3.5 h-3.5" />,  label: t.options.save,      action: () => { saveCurrentConversation(); setShowOptionsMenu(false); } },
    { icon: <History className="w-3.5 h-3.5" />,  label: t.options.history,   action: () => { setShowHistoryPanel(h => !h); setShowOptionsMenu(false); } },
    { icon: <Download className="w-3.5 h-3.5" />, label: t.options.exportTxt, action: () => { exportTxt(); setShowOptionsMenu(false); } },
    { icon: <Copy className="w-3.5 h-3.5" />,     label: t.options.copyAll,   action: () => { copyAllMessages(); setShowOptionsMenu(false); } },
    { icon: <Mail className="w-3.5 h-3.5" />,     label: t.options.byEmail,   action: () => { sendEmailSummary(); setShowOptionsMenu(false); } },
    { icon: <Share2 className="w-3.5 h-3.5" />,   label: 'WhatsApp',          action: () => { shareWhatsApp(); setShowOptionsMenu(false); } },
  ];

  return (
    <>
      {/* ══ BOUTON FLOTTANT ══ */}
      <motion.button
        ref={fabRef}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1.2, type: 'spring', stiffness: 280, damping: 22 }}
        onClick={() => setIsOpen(o => !o)}
        className={`fixed bottom-6 right-4 sm:right-6 z-50 w-[58px] h-[58px] bg-gradient-to-br from-green-600 via-green-700 to-emerald-800 text-white rounded-full shadow-2xl shadow-green-900/30 hover:scale-105 active:scale-95 transition-transform flex items-center justify-center${isPulsingPage && !isOpen ? ' ring-4 ring-green-400/60 ring-offset-2' : ''}`}
        aria-label={isOpen ? t.fab.ariaClose : t.fab.ariaOpen}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
      >
        {!isOpen && <span className="absolute inset-0 rounded-full bg-green-500 opacity-20 animate-ping" aria-hidden />}
        {isPulsingPage && !isOpen && (
          <span className="absolute -top-1.5 -left-1.5 w-[72px] h-[72px] rounded-full border-2 border-green-400/50 animate-ping" aria-hidden />
        )}
        <AnimatePresence mode="wait">
          {isOpen
            ? <motion.span key="x"    initial={{ rotate: -90, opacity: 0, scale: 0.5 }} animate={{ rotate: 0, opacity: 1, scale: 1 }} exit={{ rotate: 90, opacity: 0, scale: 0.5 }} transition={{ duration: 0.18 }}><X className="w-6 h-6" aria-hidden /></motion.span>
            : <motion.span key="chat" initial={{ rotate:  90, opacity: 0, scale: 0.5 }} animate={{ rotate: 0, opacity: 1, scale: 1 }} exit={{ rotate: -90, opacity: 0, scale: 0.5 }} transition={{ duration: 0.18 }}><MessageCircle className="w-6 h-6" aria-hidden /></motion.span>
          }
        </AnimatePresence>
        {!isOpen && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm" aria-label={`${unreadCount} nouveaux messages`}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
        <span className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white" aria-hidden />
      </motion.button>

      {/* ══ FENÊTRE DE CHAT ══ */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="chatwindow"
            role="dialog"
            aria-label={t.header.name}
            aria-modal="true"
            initial={{ opacity: 0, y: 14, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={`${chatClass} bg-white dark:bg-gray-900 shadow-[0_24px_80px_-12px_rgba(22,101,52,0.22),0_8px_24px_-4px_rgba(0,0,0,0.12)] flex flex-col overflow-hidden border border-green-100/60 dark:border-gray-800`}
          >
            {/* ── HEADER ── */}
            <div className="bg-gradient-to-br from-green-800 via-green-700 to-emerald-600 text-white px-4 py-3 flex flex-col shrink-0 relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.08)_0%,transparent_60%)]" aria-hidden />
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div className="relative w-11 h-11 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0 ring-2 ring-white/30 shadow-lg" aria-hidden>
                  <svg viewBox="0 0 24 24" className="w-5 h-5 text-white fill-current"><path d="M17 8C8 10 5.9 16.17 3.82 19.6c-.45.77.58 1.57 1.15.95C7 18.38 9.9 17 17 17v3l4-4-4-4v2z"/></svg>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-green-800 animate-pulse" />
                </div>
                {/* Titre + sous-titre */}
                <div className="flex-1 min-w-0 relative">
                  <div className="font-bold text-[13px] leading-tight tracking-wide">{t.header.name}</div>
                  <div className="text-[10px] text-green-100/90 flex items-center gap-1.5 flex-wrap">
                    <span className="w-1.5 h-1.5 bg-emerald-300 rounded-full inline-block animate-pulse" aria-hidden />
                    {t.header.subtitleBase}
                    {userMemory.location && (
                      <span className="flex items-center gap-0.5 bg-white/10 rounded-full px-1.5 py-0.5 text-[10px]">
                        <MapPin className="w-2 h-2" aria-hidden />{userMemory.location}
                      </span>
                    )}
                    {userMemory.mainCrops?.length ? (
                      <span className="flex items-center gap-0.5 bg-white/10 rounded-full px-1.5 py-0.5 text-[10px]">
                        {userMemory.mainCrops.slice(0, 2).join(', ')}
                      </span>
                    ) : null}
                  </div>
                </div>
                {/* Boutons header */}
                <div className="flex items-center gap-1">
                  <button onClick={() => setShowLocationModal(true)}        className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors" title={t.header.locationTitle} aria-label={t.header.locationAria}><MapPin className="w-3.5 h-3.5" aria-hidden /></button>
                  <button onClick={() => setShowDistributorsModal(true)}    className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors" title={t.header.mapTitle}      aria-label={t.header.mapAria}><Map className="w-3.5 h-3.5" aria-hidden /></button>
                  <button onClick={() => { setShowOptionsMenu(o => !o); setShowHistoryPanel(false); }} className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors" title={t.header.optionsTitle} aria-label={t.header.optionsAria} aria-expanded={showOptionsMenu}><Settings className="w-3.5 h-3.5" aria-hidden /></button>
                  <button onClick={() => setIsFullscreen(f => !f)}          className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors" title={isFullscreen ? t.header.minimize : t.header.fullscreen} aria-label={isFullscreen ? t.header.minimize : t.header.fullscreen}>{isFullscreen ? <Minimize2 className="w-3.5 h-3.5" aria-hidden /> : <Maximize2 className="w-3.5 h-3.5" aria-hidden />}</button>
                  <button onClick={resetChat}                                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors" title={t.header.resetTitle} aria-label={t.header.resetTitle}><RotateCcw className="w-3.5 h-3.5" aria-hidden /></button>
                </div>
              </div>

              {/* Bannière conseiller expert */}
              <div className="mt-2 flex items-center gap-1.5 text-[10px] text-green-100/80 bg-white/5 rounded-lg px-2.5 py-1.5">
                <UserCircle2 className="w-3 h-3 shrink-0 text-emerald-200" aria-hidden />
                <span>{t.header.expertBanner}</span>
                <a href="https://wa.me/237657393939" target="_blank" rel="noopener noreferrer" className="ml-auto shrink-0 text-emerald-200 underline">WhatsApp</a>
              </div>

              {/* OPTIONS dropdown */}
              <AnimatePresence>
                {showOptionsMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6, scale: 0.96 }}
                    className="absolute top-full left-0 right-0 z-50 border-b border-green-200 dark:border-gray-700 shadow-xl overflow-hidden grid grid-cols-2 gap-px bg-gray-100 dark:bg-gray-800 p-0.5"
                    role="menu"
                  >
                    {optionsItems.map(({ icon, label, action }) => (
                      <button key={label} onClick={action} role="menuitem" className="flex items-center gap-2 px-3 py-2.5 text-[12px] font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-900 hover:bg-green-50 dark:hover:bg-green-900/30 hover:text-green-700 dark:hover:text-green-400 transition-colors">
                        <span className="text-green-600 dark:text-green-400" aria-hidden>{icon}</span>{label}
                      </button>
                    ))}
                    <button
                      onClick={() => { toggleTts(); setShowOptionsMenu(false); }}
                      role="menuitem"
                      className="flex items-center gap-2 px-3 py-2.5 text-[12px] font-medium bg-white dark:bg-gray-900 hover:bg-green-50 dark:hover:bg-green-900/30 transition-colors col-span-2 border-t border-gray-100 dark:border-gray-800"
                    >
                      <span className="text-green-600 dark:text-green-400" aria-hidden>{ttsEnabled ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}</span>
                      <span className={ttsEnabled ? 'text-green-700 dark:text-green-400 font-semibold' : 'text-gray-700 dark:text-gray-200'}>
                        {ttsEnabled ? t.options.ttsOn : t.options.ttsOff}
                      </span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* HISTORIQUE panel */}
              <AnimatePresence>
                {showHistoryPanel && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                    className="absolute top-full left-0 right-0 z-50 bg-white dark:bg-gray-900 border-b border-green-200 dark:border-gray-700 shadow-xl max-h-64 overflow-y-auto"
                    role="region" aria-label={t.history.title}
                  >
                    <div className="p-2">
                      <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 px-2 py-1 flex items-center gap-1.5">
                        <BookOpen className="w-3 h-3" aria-hidden />{t.history.title} ({savedConversations.length})
                      </p>
                      {savedConversations.length === 0
                        ? <p className="px-3 py-4 text-[12px] text-gray-400 text-center">{t.history.empty}</p>
                        : savedConversations.map(conv => (
                          <div key={conv.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 group">
                            <button onClick={() => loadConversation(conv)} className="flex-1 text-left min-w-0">
                              <p className="text-[12px] font-medium text-gray-800 dark:text-gray-200 truncate">{conv.title}</p>
                              <p className="text-[10px] text-gray-400">
                                {new Date(conv.createdAt).toLocaleDateString(locale === 'en' ? 'en-GB' : 'fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                {conv.userMemory?.location ? ` · ${conv.userMemory.location}` : ''}
                              </p>
                            </button>
                            <button onClick={() => deleteConversation(conv.id)} aria-label={t.history.deleteAria} title={t.history.deleteTitle} className="w-6 h-6 rounded flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all opacity-0 group-hover:opacity-100">
                              <Trash2 className="w-3 h-3" aria-hidden />
                            </button>
                            <ChevronRight className="w-3 h-3 text-gray-300 shrink-0" aria-hidden />
                          </div>
                        ))
                      }
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ── MESSAGES ── */}
            <div ref={messagesListRef} onScroll={handleScroll} className="flex-1 overflow-y-auto px-3 py-3 space-y-3 scroll-smooth" role="log" aria-live="polite" aria-relevant="additions">
              {/* Bannière saisonnière */}
              <AnimatePresence>
                {seasonalBanner && (
                  <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="rounded-xl bg-gradient-to-r from-amber-50 to-green-50 dark:from-amber-900/20 dark:to-green-900/20 border border-amber-200 dark:border-amber-800 px-3 py-2.5" role="status">
                    <div className="flex items-start justify-between gap-2">
                      <div className="text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed"><MarkdownMessage content={seasonalBanner} /></div>
                      <button onClick={() => setSeasonalBanner(null)} className="shrink-0 text-amber-400 hover:text-amber-600 mt-0.5" aria-label={t.seasonal.closeAria}><X className="w-3 h-3" aria-hidden /></button>
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
                        <Loader2 className="w-3 h-3 animate-spin" aria-hidden />{msg.toolStatus}
                      </div>
                    )}
                    {msg.role === 'user'
                      ? <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      : <MarkdownMessage content={msg.content} />
                    }
                    {msg.isStreaming && <span className="inline-block w-0.5 h-3.5 bg-green-500 ml-0.5 animate-pulse align-middle" aria-hidden />}
                    <p className={`text-[10px] mt-1 ${msg.role === 'user' ? 'text-green-200' : 'text-gray-400 dark:text-gray-500'}`}>
                      <time dateTime={msg.timestamp.toISOString()}>
                        {msg.timestamp.toLocaleTimeString(locale === 'en' ? 'en-GB' : 'fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </time>
                    </p>
                  </div>

                  {/* Actions IA */}
                  {msg.role === 'assistant' && !msg.isStreaming && msg.content.length > 20 && (
                    <div className="flex items-center gap-1.5 ml-1 flex-wrap">
                      {msg.intent && <IntentBadge intent={msg.intent} locale={locale} />}
                      {/\b(the|and|for|you|your|with|this|that|have|from|will|can|please|thank)\b/i.test(msg.content.replace(/<[^>]+>/g, '')) && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                          <Globe className="w-2.5 h-2.5" aria-hidden />EN
                        </span>
                      )}
                      <button onClick={() => sendFeedback(msg.id, 'positive')} className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${msg.feedback === 'positive' ? 'bg-green-100 text-green-600' : 'text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30'}`} title={t.feedback.helpfulTitle} aria-label={t.feedback.helpfulAria} aria-pressed={msg.feedback === 'positive'}><ThumbsUp className="w-3 h-3" aria-hidden /></button>
                      <button onClick={() => sendFeedback(msg.id, 'negative')} className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${msg.feedback === 'negative' ? 'bg-red-100 text-red-500' : 'text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30'}`} title={t.feedback.notHelpfulTitle} aria-label={t.feedback.notHelpfulAria} aria-pressed={msg.feedback === 'negative'}><ThumbsDown className="w-3 h-3" aria-hidden /></button>
                      <CopyButton text={msg.content} locale={locale} />
                      {typeof window !== 'undefined' && 'speechSynthesis' in window && (
                        <button onClick={() => speakText(msg.content)} className="w-6 h-6 rounded-full flex items-center justify-center text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 transition-all" title={t.feedback.listenTitle} aria-label={t.feedback.listenAria}><Volume2 className="w-3 h-3" aria-hidden /></button>
                      )}
                    </div>
                  )}

                  {/* Boutons "Acheter →" */}
                  {msg.role === 'assistant' && !msg.isStreaming && msg.content.length > 20 && (() => {
                    const prods = extractProductsFromText(msg.content);
                    if (!prods.length) return null;
                    return (
                      <div className="flex flex-wrap gap-1.5 ml-1 mt-1">
                        {prods.map(p => (
                          <a key={p.slug} href={`/produits?search=${encodeURIComponent(p.name)}`} className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-600 hover:bg-green-700 text-white text-[11px] font-semibold rounded-lg shadow-sm transition-all active:scale-95">
                            <ShoppingCart className="w-2.5 h-2.5" aria-hidden />{p.name}<ExternalLink className="w-2 h-2 opacity-70" aria-hidden />
                          </a>
                        ))}
                      </div>
                    );
                  })()}

                  {/* Escalade humaine */}
                  {msg.role === 'assistant' && !msg.isStreaming && (msg.intent === 'urgence' || msg.escalated) && (
                    <div className="w-full max-w-[88%]">
                      <EscalationCard context={msg.content} locale={locale} />
                    </div>
                  )}
                </div>
              ))}

              {/* Indicateur frappe */}
              {isStreaming && messages[messages.length - 1]?.content === '' && (
                <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="flex items-start" aria-live="polite">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl rounded-bl-sm border border-gray-100 dark:border-gray-700 px-4 py-3">
                    <div className="flex gap-1.5 items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce [animation-delay:0ms]"   aria-hidden />
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce [animation-delay:150ms]" aria-hidden />
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce [animation-delay:300ms]" aria-hidden />
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* ── WIDGET ÉLIGIBILITÉ ── */}
            {isCampaignPage && showEligibility && !isStreaming && (
              <EligibilityWidget
                onComplete={(msg) => { setShowEligibility(false); handleSend(msg); }}
                locale={locale}
              />
            )}

            {/* Scroll-to-bottom */}
            <AnimatePresence>
              {showScrollBtn && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => scrollToBottom(true)}
                  className="absolute bottom-[7.5rem] right-4 w-9 h-9 bg-white dark:bg-gray-800 border border-green-200 dark:border-green-800 rounded-full shadow-lg shadow-green-900/10 flex items-center justify-center text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 hover:scale-110 transition-all z-10"
                  aria-label={t.messages.scrollToBottom}
                >
                  <ChevronDown className="w-4 h-4" aria-hidden />
                </motion.button>
              )}
            </AnimatePresence>

            {/* ── SUGGESTIONS ── */}
            <div className="px-3 pb-2 shrink-0" role="group" aria-label="Suggestions rapides">
              <div className="flex flex-wrap gap-1.5">
                {activeSugs.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => s.text === '3_ELIGIBILITY_FLOW' ? setShowEligibility(true) : handleSend(s.text)}
                    disabled={isStreaming}
                    className="text-[11px] px-3 py-1.5 bg-white dark:bg-gray-800 text-green-700 dark:text-green-400 rounded-full hover:bg-green-50 dark:hover:bg-green-900/40 hover:border-green-400 hover:shadow-sm transition-all disabled:opacity-40 border border-green-200 dark:border-green-700 whitespace-nowrap font-medium shadow-[0_1px_3px_rgba(0,0,0,0.06)] active:scale-95"
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* ── INPUT ── */}
            <div className="border-t border-gray-100 dark:border-gray-800 px-3 py-3 shrink-0">
              {/* Prévisualisation image */}
              <AnimatePresence>
                {imagePreview && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-2 flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800" role="status">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imagePreview} alt={t.image.preview} className="w-12 h-12 rounded-lg object-cover border border-green-200 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-medium text-green-800 dark:text-green-300 truncate">{imageFile?.name}</p>
                      <p className="text-[10px] text-green-600 dark:text-green-500">{t.image.ready}</p>
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      <button onClick={handleAnalyzeImage} disabled={isAnalyzing} className="px-2.5 py-1.5 bg-green-600 hover:bg-green-700 text-white text-[11px] font-semibold rounded-lg flex items-center gap-1 transition-all disabled:opacity-50">
                        {isAnalyzing ? <Loader2 className="w-3 h-3 animate-spin" aria-hidden /> : <Sparkles className="w-3 h-3" aria-hidden />}
                        {t.image.analyze}
                      </button>
                      <button
                        onClick={clearImage}
                        className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                        aria-label={t.image.removeAria}
                      ><X className="w-3.5 h-3.5" aria-hidden /></button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex items-end gap-2">
                {voiceSupported && (
                  <button onClick={toggleVoice} className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all shrink-0 ${listening ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/30' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700'}`} aria-label={listening ? t.input.voiceStop : t.input.voiceStart} aria-pressed={listening}>
                    {listening ? <MicOff className="w-4 h-4" aria-hidden /> : <Mic className="w-4 h-4" aria-hidden />}
                  </button>
                )}
                <button onClick={() => imageInputRef.current?.click()} className="w-9 h-9 rounded-xl flex items-center justify-center transition-all shrink-0 bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-green-100 dark:hover:bg-green-900/30 hover:text-green-600 dark:hover:text-green-400" title={t.image.uploadTitle} aria-label={t.image.uploadAria}>
                  <Image className="w-4 h-4" aria-hidden />
                </button>
                <div className="flex-1 relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={t.input.placeholder}
                    disabled={isStreaming}
                    maxLength={500}
                    aria-label={t.input.placeholder}
                    className="w-full px-3.5 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500/70 focus:border-green-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 placeholder:text-[13px] disabled:opacity-50 transition-all outline-none shadow-[inset_0_1px_3px_rgba(0,0,0,0.04)]"
                  />
                  {input.length > 300 && (
                    <span className={`absolute right-2 bottom-1.5 text-[10px] ${input.length > 480 ? 'text-red-500' : 'text-gray-400'}`} aria-live="polite">
                      {input.length}/500
                    </span>
                  )}
                </div>
                <button onClick={() => handleSend()} disabled={!input.trim() || isStreaming} className="w-10 h-10 rounded-xl flex items-center justify-center transition-all shrink-0 shadow-sm bg-gradient-to-br from-green-600 to-emerald-700 text-white hover:from-green-500 hover:to-emerald-600 disabled:from-gray-300 disabled:to-gray-300 dark:disabled:from-gray-700 dark:disabled:to-gray-700 disabled:cursor-not-allowed active:scale-95" aria-label={t.input.send}>
                  {isStreaming ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden /> : <Send className="w-4 h-4" aria-hidden />}
                </button>
              </div>
              <p className="text-[10px] text-gray-400 dark:text-gray-600 mt-1.5 text-center select-none flex items-center justify-center gap-1" aria-hidden>
                <Cpu className="w-2.5 h-2.5 text-green-400" />{t.footer}
                <span className="w-1 h-1 rounded-full bg-green-400 inline-block" />
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══ INPUT FICHIER CACHÉ ══ */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        aria-label={t.image.uploadAria}
        title={t.image.uploadTitle}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) { handleImageFileChange(file); e.target.value = ''; }
        }}
      />

      {/* ══ MODAL DISTRIBUTEURS ══ */}
      <AnimatePresence>
        {showDistributorsModal && (
          <motion.div
            key="distributors-modal"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowDistributorsModal(false)}
          >
            <motion.div
              ref={distributorsModalRef}
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[85vh] overflow-auto"
              role="dialog" aria-modal="true" aria-labelledby="dist-dialog-title"
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-900 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Map className="w-6 h-6 text-green-600" aria-hidden />
                  <h2 id="dist-dialog-title" className="text-lg font-bold text-gray-900 dark:text-white">{t.distributors.title}</h2>
                </div>
                <button onClick={() => setShowDistributorsModal(false)} title={t.distributors.closeTitle} aria-label={t.distributors.closeAria} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                  <X className="w-5 h-5" aria-hidden />
                </button>
              </div>
              <div className="p-6">
                {loadingDistributors
                  ? <div className="flex items-center justify-center h-96"><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}><Loader2 className="w-8 h-8 text-green-500" aria-hidden /></motion.div></div>
                  : <DistributorsMap distributors={distributors} onSelectDistributor={() => {}} height="500px" showList={true} />
                }
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══ MODAL LOCALISATION ══ */}
      <AnimatePresence>
        {showLocationModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/50 flex items-end sm:items-center justify-center p-4"
            onClick={() => setShowLocationModal(false)}
          >
            <motion.div
              ref={locationModalRef}
              initial={{ y: 40, opacity: 0, scale: 0.96 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 40, opacity: 0, scale: 0.96 }}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm p-5"
              onClick={e => e.stopPropagation()}
              role="dialog" aria-modal="true" aria-labelledby="loc-dialog-title"
            >
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-green-600" aria-hidden />
                <h3 id="loc-dialog-title" className="font-bold text-gray-900 dark:text-white text-sm">{t.location.title}</h3>
                <button onClick={() => setShowLocationModal(false)} aria-label={t.location.closeAria} className="ml-auto text-gray-400 hover:text-gray-600"><X className="w-4 h-4" aria-hidden /></button>
              </div>
              <p className="text-[12px] text-gray-500 dark:text-gray-400 mb-4">{t.location.subtitle}</p>
              {userMemory.location && (
                <div className="mb-3 px-3 py-2 bg-green-50 dark:bg-green-900/20 rounded-lg text-[12px] text-green-700 dark:text-green-400 flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 shrink-0" aria-hidden />
                  {t.location.current}<strong>{userMemory.location}</strong>
                  <button onClick={clearLocation} className="ml-auto text-red-400 hover:text-red-600 text-[11px]">{t.location.clear}</button>
                </div>
              )}
              <div className="grid grid-cols-2 gap-2 max-h-72 overflow-y-auto">
                {CITIES.map(({ city, region }) => (
                  <button
                    key={city}
                    onClick={() => { setLocation(city, region); setShowLocationModal(false); }}
                    aria-pressed={userMemory.location === city}
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
                  placeholder={t.location.otherCity}
                  aria-label={t.location.otherCity}
                  className="flex-1 px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-green-400 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  onKeyDown={e => {
                    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                      setLocation(e.currentTarget.value.trim());
                      setShowLocationModal(false);
                    }
                  }}
                />
                <button onClick={() => setShowLocationModal(false)} className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">{t.location.cancel}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══ TOAST ══ */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-28 right-4 sm:right-6 z-[70] bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[12px] font-medium px-4 py-2.5 rounded-xl shadow-2xl"
            role="status"
            aria-live="polite"
          >
            {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
