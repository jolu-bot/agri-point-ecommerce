'use client';

import { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
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
import { useAgriBot } from '@/hooks/useAgriBot';
import { useAgribotI18n } from '@/lib/hooks/useAgribotI18n';
import { MarkdownMessage }   from './MarkdownMessage';
import { IntentBadge }       from './IntentBadge';
import { CopyButton }        from './CopyButton';
import { EscalationCard }    from './EscalationCard';
import { EligibilityWidget } from './EligibilityWidget';
import { useAgentStatus }    from '@/hooks/useAgentStatus';

// ──────────────────────────────────────────────────────────────────────────────
// Lazy-load DistributorsMap — heavy Google Maps bundle (split chunk)
// ──────────────────────────────────────────────────────────────────────────────
function MapLoadingSkeleton() {
  return (
    <div className="h-[500px] rounded-xl overflow-hidden relative bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-800 dark:to-gray-700">
      {/* Grid lines */}
      <div className="absolute inset-0" aria-hidden>
        {[12, 25, 38, 51, 64, 77, 90].map(pct => (
          <div key={pct} className="absolute h-px bg-green-200/60 dark:bg-green-900/40 left-0 right-0 animate-pulse" style={{ top: `${pct}%` }} />
        ))}
        {[14, 28, 42, 56, 70, 84].map(pct => (
          <div key={pct} className="absolute w-px bg-green-200/60 dark:bg-green-900/40 top-0 bottom-0 animate-pulse" style={{ left: `${pct}%` }} />
        ))}
      </div>
      {/* Fake pins */}
      <div className="absolute top-[28%] left-[32%]"><div className="w-4 h-4 bg-red-400  rounded-full shadow-lg animate-bounce" style={{ animationDelay: '0s'   }} /></div>
      <div className="absolute top-[45%] left-[54%]"><div className="w-4 h-4 bg-blue-400 rounded-full shadow-lg animate-bounce" style={{ animationDelay: '0.3s' }} /></div>
      <div className="absolute top-[62%] left-[68%]"><div className="w-4 h-4 bg-emerald-400 rounded-full shadow-lg animate-bounce" style={{ animationDelay: '0.6s' }} /></div>
      <div className="absolute top-[35%] left-[72%]"><div className="w-3.5 h-3.5 bg-amber-400  rounded-full shadow-md animate-bounce" style={{ animationDelay: '0.9s' }} /></div>
      {/* Center loading card */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-2xl px-8 py-6 shadow-2xl shadow-green-900/20 border border-white/60 dark:border-white/10 text-center">
          <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center mx-auto mb-3">
            <Loader2 className="w-6 h-6 text-green-600 dark:text-green-400 animate-spin" aria-hidden />
          </div>
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Chargement de la carte</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Distributeurs AGRIPOINT…</p>
        </div>
      </div>
    </div>
  );
}

const DistributorsMap = dynamic(
  () => import('@/components/DistributorsMap'),
  { ssr: false, loading: () => <MapLoadingSkeleton /> },
);

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
  const fabRef  = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);
  useEffect(() => {
    if (wasOpen.current && !isOpen) fabRef.current?.focus();
    wasOpen.current = isOpen;
  }, [isOpen]);

  // Focus traps for both modals — keeps Tab inside + handles Escape
  const distributorsModalRef = useFocusTrap<HTMLDivElement>(showDistributorsModal, () => setShowDistributorsModal(false));
  const locationModalRef     = useFocusTrap<HTMLDivElement>(showLocationModal,    () => setShowLocationModal(false));

  // Agent status hook
  const agent = useAgentStatus();

  // Auto-scroll to last message when new messages arrive or streaming changes
  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages.length, isStreaming, messagesEndRef]);

  const chatClass = isFullscreen
    ? 'fixed inset-4 sm:inset-8 z-50 rounded-3xl'
    : 'fixed bottom-24 right-4 sm:right-6 z-50 w-[23rem] sm:w-[27rem] h-[660px] rounded-3xl';

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
      {/* ══ BOUTON FLOTTANT (FAB) ══ */}
      <motion.button
        ref={fabRef}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1.4, type: 'spring', stiffness: 260, damping: 20 }}
        onClick={() => setIsOpen(o => !o)}
        className={`fixed bottom-6 right-4 sm:right-6 z-50 w-16 h-16 rounded-2xl
          bg-gradient-to-br from-green-500 via-green-600 to-emerald-700
          text-white shadow-[0_8px_32px_rgba(22,163,74,0.45),0_2px_8px_rgba(0,0,0,0.2)]
          hover:shadow-[0_12px_40px_rgba(22,163,74,0.55),0_4px_12px_rgba(0,0,0,0.25)]
          hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center relative
          ${isPulsingPage && !isOpen ? 'ring-2 ring-green-300/80 ring-offset-2' : ''}`}
        aria-label={isOpen ? t.fab.ariaClose : t.fab.ariaOpen}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
      >
        {/* Animated glow rings when pulsing */}
        {isPulsingPage && !isOpen && (
          <>
            <span className="absolute inset-0 rounded-2xl bg-green-400/30 animate-ping" aria-hidden />
            <span className="absolute -inset-1 rounded-[18px] border border-green-400/40 animate-pulse" aria-hidden />
          </>
        )}
        {/* Inner glow */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent" aria-hidden />

        {/* Icon swap */}
        <AnimatePresence mode="wait">
          {isOpen
            ? <motion.span key="x" initial={{ rotate: -90, opacity: 0, scale: 0.5 }} animate={{ rotate: 0, opacity: 1, scale: 1 }} exit={{ rotate: 90, opacity: 0, scale: 0.5 }} transition={{ duration: 0.18 }}>
                <X className="w-6 h-6 relative z-10" aria-hidden />
              </motion.span>
            : <motion.span key="bot" initial={{ rotate: 90, opacity: 0, scale: 0.5 }} animate={{ rotate: 0, opacity: 1, scale: 1 }} exit={{ rotate: -90, opacity: 0, scale: 0.5 }} transition={{ duration: 0.18 }}>
                {/* Leaf/bot custom SVG icon */}
                <svg viewBox="0 0 24 24" className="w-7 h-7 relative z-10 fill-white" aria-hidden>
                  <path d="M17 8C8 10 5.9 16.17 3.82 19.6c-.45.77.58 1.57 1.15.95C7 18.38 9.9 17 17 17v3l4-4-4-4v2z"/>
                  <circle cx="8" cy="12" r="1.5" opacity="0.7"/>
                </svg>
              </motion.span>
          }
        </AnimatePresence>

        {/* Unread badge */}
        {!isOpen && unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            className="absolute -top-1.5 -right-1.5 min-w-[22px] h-[22px] px-1 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-lg border-2 border-white"
            aria-label={`${unreadCount} ${locale === 'en' ? 'new messages' : 'nouveaux messages'}`}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}

        {/* Online status dot */}
        <span className={`absolute bottom-1 right-1 w-3 h-3 rounded-full border-2 border-white shadow-sm ${
          agent.status === 'online' ? 'bg-emerald-400' : agent.status === 'away' ? 'bg-amber-400' : 'bg-gray-400'
        }`} aria-hidden />
      </motion.button>

      {/* ══ FENÊTRE DE CHAT ══ */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="chatwindow"
            role="dialog"
            aria-label={t.header.name}
            aria-modal="true"
            aria-labelledby="agribot-title"
            initial={{ opacity: 0, y: 20, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.94 }}
            transition={{ type: 'spring', stiffness: 340, damping: 32 }}
            className={`${chatClass} flex flex-col overflow-hidden
              bg-white/95 dark:bg-gray-950/98 backdrop-blur-2xl
              shadow-[0_32px_96px_-12px_rgba(22,101,52,0.28),0_8px_32px_-4px_rgba(0,0,0,0.18)]
              border border-white/60 dark:border-white/[0.06]`}
          >
            {/* ── HEADER ── */}
            <div className="relative shrink-0 bg-gradient-to-br from-gray-900 via-green-900 to-emerald-800 overflow-hidden">
              {/* Decorative noise/mesh */}
              <div className="absolute inset-0 opacity-30" aria-hidden style={{
                backgroundImage: `radial-gradient(circle at 20% 50%, rgba(16,185,129,0.4) 0%, transparent 60%), radial-gradient(circle at 80% 20%, rgba(6,78,59,0.6) 0%, transparent 50%)`
              }} />
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-green-400/30 to-transparent" aria-hidden />

              <div className="relative px-4 pt-4 pb-3 flex items-start gap-3">
                {/* Bot avatar */}
                <div className="relative shrink-0" aria-hidden>
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-white/25 to-white/10 backdrop-blur-sm border border-white/25 flex items-center justify-center shadow-lg">
                    <svg viewBox="0 0 24 24" className="w-6 h-6 text-white fill-current">
                      <path d="M17 8C8 10 5.9 16.17 3.82 19.6c-.45.77.58 1.57 1.15.95C7 18.38 9.9 17 17 17v3l4-4-4-4v2z"/>
                    </svg>
                  </div>
                  {/* Animated status ring */}
                  <span className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-gray-900 ${
                    agent.status === 'online' ? 'bg-emerald-400 animate-pulse' : agent.status === 'away' ? 'bg-amber-400' : 'bg-gray-500'
                  }`} />
                </div>

                {/* Title + subtitle */}
                <div className="flex-1 min-w-0">
                  <h2 id="agribot-title" className="font-bold text-white text-[14px] leading-tight">{t.header.name}</h2>
                  <p className="text-green-200/80 text-[11px] mt-0.5 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" aria-hidden />
                    {t.header.subtitleBase}
                    {userMemory.location && (
                      <span className="bg-white/10 rounded-full px-2 py-0.5 flex items-center gap-1">
                        <MapPin className="w-2 h-2" aria-hidden />{userMemory.location}
                      </span>
                    )}
                  </p>
                </div>

                {/* Header action buttons */}
                <div className="flex items-center gap-1 shrink-0">
                  {[
                    { icon: <MapPin className="w-3.5 h-3.5" />,                                                                           action: () => setShowLocationModal(true),                                  label: t.header.locationAria },
                    { icon: <Map className="w-3.5 h-3.5" />,                                                                               action: () => setShowDistributorsModal(true),                              label: t.header.mapAria },
                    { icon: <Settings className="w-3.5 h-3.5" />,                                                                          action: () => { setShowOptionsMenu(o => !o); setShowHistoryPanel(false); }, label: t.header.optionsAria },
                    { icon: isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />,                action: () => setIsFullscreen(f => !f),                                   label: isFullscreen ? t.header.minimize : t.header.fullscreen },
                    { icon: <RotateCcw className="w-3.5 h-3.5" />,                                                                         action: resetChat,                                                         label: t.header.resetTitle },
                  ].map(({ icon, action, label }) => (
                    <button key={label} onClick={action} aria-label={label}
                      className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-all duration-200 active:scale-90">
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              {/* ── HUMAN AGENT STATUS ROW ── */}
              <div className={`relative mx-3 mb-3 rounded-xl px-3 py-2 flex items-center gap-2.5 border transition-all duration-500 ${
                agent.status === 'online'
                  ? 'bg-emerald-500/15 border-emerald-500/25'
                  : agent.status === 'away'
                  ? 'bg-amber-500/15 border-amber-500/25'
                  : 'bg-white/5 border-white/10'
              }`}>
                {/* Status dot */}
                <div className={`w-2 h-2 rounded-full shrink-0 ${
                  agent.status === 'online' ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)] animate-pulse'
                  : agent.status === 'away' ? 'bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.6)]'
                  : 'bg-gray-500'
                }`} aria-hidden />
                {/* Agent info */}
                <div className="flex-1 min-w-0">
                  <span className="text-[11px] font-semibold text-white/90 block leading-tight">{agent.name}</span>
                  <span className={`text-[10px] ${
                    agent.status === 'online' ? 'text-emerald-300'
                    : agent.status === 'away' ? 'text-amber-300'
                    : 'text-gray-400'
                  }`}>
                    {agent.status === 'online'
                      ? (locale === 'en' ? `Responds in ${agent.responseTime}` : `Répond en ${agent.responseTime}`)
                      : agent.status === 'away'
                      ? (locale === 'en' ? `Back at ${agent.responseTime}` : `Retour à ${agent.responseTime}`)
                      : (locale === 'en' ? 'Available Mon–Fri 7am–6pm' : 'Disponible Lun–Ven 7h–18h')
                    }
                  </span>
                </div>
                {/* Status label */}
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                  agent.status === 'online' ? 'bg-emerald-500/30 text-emerald-300'
                  : agent.status === 'away' ? 'bg-amber-500/30 text-amber-300'
                  : 'bg-white/10 text-gray-400'
                }`}>
                  {agent.status === 'online'
                    ? (locale === 'en' ? 'Online' : 'En ligne')
                    : agent.status === 'away'
                    ? (locale === 'en' ? 'Away' : 'Absent')
                    : (locale === 'en' ? 'Offline' : 'Hors ligne')
                  }
                </span>
                {/* WhatsApp escalation */}
                <a href="https://wa.me/237657393939" target="_blank" rel="noopener noreferrer"
                  className="shrink-0 w-7 h-7 rounded-lg bg-white/10 hover:bg-emerald-500/30 flex items-center justify-center transition-all duration-200"
                  aria-label="WhatsApp">
                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-white/80"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                </a>
              </div>

              {/* OPTIONS dropdown */}
              <AnimatePresence>
                {showOptionsMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.96 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    className="absolute top-full left-0 right-0 z-50 bg-white dark:bg-gray-900 border-b border-green-100 dark:border-gray-800 shadow-2xl overflow-hidden"
                    role="menu"
                  >
                    <div className="grid grid-cols-3 gap-px bg-gray-100 dark:bg-gray-800 p-px">
                      {optionsItems.map(({ icon, label, action }) => (
                        <button key={label} onClick={action} role="menuitem"
                          className="flex flex-col items-center gap-1.5 px-2 py-3 text-[10px] font-semibold text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-900 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-700 dark:hover:text-green-400 transition-colors">
                          <span className="w-7 h-7 rounded-xl bg-green-50 dark:bg-green-900/30 flex items-center justify-center text-green-600" aria-hidden>{icon}</span>
                          {label}
                        </button>
                      ))}
                      <button onClick={() => { toggleTts(); setShowOptionsMenu(false); }} role="menuitem"
                        className="flex flex-col items-center gap-1.5 px-2 py-3 text-[10px] font-semibold bg-white dark:bg-gray-900 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors">
                        <span className="w-7 h-7 rounded-xl bg-green-50 dark:bg-green-900/30 flex items-center justify-center text-green-600">
                          {ttsEnabled ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                        </span>
                        <span className={ttsEnabled ? 'text-green-700 dark:text-green-400' : 'text-gray-600 dark:text-gray-300'}>
                          {ttsEnabled ? t.options.ttsOn : t.options.ttsOff}
                        </span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* HISTORIQUE panel */}
              <AnimatePresence>
                {showHistoryPanel && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                    className="absolute top-full left-0 right-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 shadow-2xl max-h-64 overflow-y-auto"
                    role="region" aria-label={t.history.title}
                  >
                    <div className="p-3">
                      <p className="text-[11px] font-bold text-green-700 dark:text-green-400 px-2 py-1 flex items-center gap-2">
                        <BookOpen className="w-3 h-3" aria-hidden />{t.history.title} ({savedConversations.length})
                      </p>
                      {savedConversations.length === 0
                        ? <p className="py-6 text-center text-[12px] text-gray-400">{t.history.empty}</p>
                        : savedConversations.map(conv => (
                          <div key={conv.id} className="flex items-center gap-2 px-2 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 group transition-colors">
                            <button onClick={() => loadConversation(conv)} className="flex-1 text-left min-w-0">
                              <p className="text-[12px] font-semibold text-gray-800 dark:text-gray-200 truncate">{conv.title}</p>
                              <p className="text-[10px] text-gray-400 mt-0.5">
                                {new Date(conv.createdAt).toLocaleDateString(locale === 'en' ? 'en-GB' : 'fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                {conv.userMemory?.location ? ` · ${conv.userMemory.location}` : ''}
                              </p>
                            </button>
                            <button onClick={() => deleteConversation(conv.id)} aria-label={t.history.deleteAria}
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all opacity-0 group-hover:opacity-100">
                              <Trash2 className="w-3.5 h-3.5" aria-hidden />
                            </button>
                            <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-green-400 transition-colors shrink-0" aria-hidden />
                          </div>
                        ))
                      }
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ── MESSAGES ── */}
            <div
              ref={messagesListRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto px-4 py-4 scroll-smooth space-y-4"
              style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(22,163,74,0.2) transparent' } as React.CSSProperties}
              role="log"
              aria-live="polite"
              aria-relevant="additions"
            >
              {/* Seasonal banner */}
              <AnimatePresence>
                {seasonalBanner && (
                  <motion.div initial={{ opacity: 0, y: -8, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8 }}
                    className="rounded-2xl bg-gradient-to-r from-amber-50 to-emerald-50 dark:from-amber-900/20 dark:to-emerald-900/20 border border-amber-200/60 dark:border-amber-800/40 px-4 py-3" role="status">
                    <div className="flex items-start gap-2">
                      <span className="text-lg shrink-0" aria-hidden>🌱</span>
                      <div className="text-[11px] text-amber-800 dark:text-amber-300 flex-1"><MarkdownMessage content={seasonalBanner} /></div>
                      <button onClick={() => setSeasonalBanner(null)} className="shrink-0 text-amber-400 hover:text-amber-600 mt-0.5" aria-label={t.seasonal.closeAria}>
                        <X className="w-3.5 h-3.5" aria-hidden />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 12, x: msg.role === 'user' ? 12 : -12 }}
                  animate={{ opacity: 1, y: 0, x: 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 32, delay: 0 }}
                  className={`flex flex-col gap-1.5 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  {/* Row: avatar (bot only) + bubble */}
                  <div className={`flex items-end gap-2 max-w-[90%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    {/* Bot avatar */}
                    {msg.role === 'assistant' && (
                      <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-green-600 to-emerald-700 flex items-center justify-center shrink-0 mb-0.5 shadow-sm" aria-hidden>
                        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white"><path d="M17 8C8 10 5.9 16.17 3.82 19.6c-.45.77.58 1.57 1.15.95C7 18.38 9.9 17 17 17v3l4-4-4-4v2z"/></svg>
                      </div>
                    )}

                    {/* Bubble */}
                    <div className={`rounded-2xl px-4 py-3 relative ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-[0_4px_16px_rgba(22,163,74,0.35)] rounded-br-sm'
                        : 'bg-white dark:bg-gray-800/95 text-gray-900 dark:text-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.08)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.3)] rounded-bl-sm border border-gray-100/80 dark:border-gray-700/50'
                    }`}>
                      {/* Left accent line for bot messages */}
                      {msg.role === 'assistant' && (
                        <div className="absolute left-0 top-3 bottom-3 w-0.5 bg-gradient-to-b from-green-400 to-emerald-500 rounded-full" aria-hidden />
                      )}

                      {/* Tool status */}
                      {msg.toolStatus && (
                        <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 mb-2 font-medium">
                          <Loader2 className="w-3 h-3 animate-spin" aria-hidden />{msg.toolStatus}
                        </div>
                      )}

                      {/* Content */}
                      {msg.role === 'user'
                        ? <p className="text-[13px] leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                        : <MarkdownMessage content={msg.content} />
                      }

                      {/* Streaming cursor */}
                      {msg.isStreaming && <span className="inline-block w-0.5 h-4 bg-green-500 ml-0.5 animate-pulse align-middle rounded-full" aria-hidden />}

                      {/* Timestamp */}
                      <p className={`text-[10px] mt-1.5 flex items-center gap-1 ${msg.role === 'user' ? 'text-green-200/80 justify-end' : 'text-gray-400 dark:text-gray-500'}`}>
                        <time dateTime={msg.timestamp.toISOString()}>
                          {msg.timestamp.toLocaleTimeString(locale === 'en' ? 'en-GB' : 'fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </time>
                        {msg.role === 'user' && <span className="w-3 h-3 rounded-full bg-white/30 flex items-center justify-center text-[8px]">✓</span>}
                      </p>
                    </div>
                  </div>

                  {/* Actions bar (bot only, after streaming) */}
                  {msg.role === 'assistant' && !msg.isStreaming && msg.content.length > 20 && (
                    <div className="flex items-center gap-1 ml-9 flex-wrap">
                      {msg.intent && <IntentBadge intent={msg.intent} locale={locale} />}
                      {/\b(the|and|for|you|your|with|this|that|have|from|will|can|please|thank)\b/i.test(msg.content.replace(/<[^>]+>/g, '')) && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                          <Globe className="w-2.5 h-2.5" aria-hidden />EN
                        </span>
                      )}
                      {[
                        { icon: <ThumbsUp className="w-3 h-3" />, action: () => sendFeedback(msg.id, 'positive'), label: t.feedback.helpfulAria,    active: msg.feedback === 'positive', activeClass: 'bg-green-100 text-green-600 dark:bg-green-900/40' },
                        { icon: <ThumbsDown className="w-3 h-3" />, action: () => sendFeedback(msg.id, 'negative'), label: t.feedback.notHelpfulAria, active: msg.feedback === 'negative', activeClass: 'bg-red-100 text-red-500 dark:bg-red-900/30' },
                      ].map(btn => (
                        <button key={btn.label} onClick={btn.action} aria-label={btn.label} aria-pressed={btn.active}
                          className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${btn.active ? btn.activeClass : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                          {btn.icon}
                        </button>
                      ))}
                      <CopyButton text={msg.content} locale={locale} />
                      {typeof window !== 'undefined' && 'speechSynthesis' in window && (
                        <button onClick={() => speakText(msg.content)} aria-label={t.feedback.listenAria}
                          className="w-6 h-6 rounded-lg flex items-center justify-center text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 transition-all">
                          <Volume2 className="w-3 h-3" aria-hidden />
                        </button>
                      )}
                    </div>
                  )}

                  {/* Shop CTA buttons */}
                  {msg.role === 'assistant' && !msg.isStreaming && msg.content.length > 20 && (() => {
                    const prods = extractProductsFromText(msg.content);
                    if (!prods.length) return null;
                    return (
                      <div className="flex flex-wrap gap-2 ml-9 mt-0.5">
                        {prods.map(p => (
                          <a key={p.slug} href={`/produits?search=${encodeURIComponent(p.name)}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white text-[11px] font-bold rounded-xl shadow-[0_2px_8px_rgba(22,163,74,0.35)] transition-all active:scale-95">
                            <ShoppingCart className="w-3 h-3" aria-hidden />{p.name}<ExternalLink className="w-2.5 h-2.5 opacity-70" aria-hidden />
                          </a>
                        ))}
                      </div>
                    );
                  })()}

                  {/* Escalation card */}
                  {msg.role === 'assistant' && !msg.isStreaming && (msg.intent === 'urgence' || msg.escalated) && (
                    <div className="ml-9 w-full max-w-[calc(100%-2.25rem)]">
                      <EscalationCard context={msg.content} locale={locale} />
                    </div>
                  )}
                </motion.div>
              ))}

              {/* Premium typing indicator */}
              {isStreaming && messages[messages.length - 1]?.content === '' && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex items-end gap-2">
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-green-600 to-emerald-700 flex items-center justify-center shrink-0 shadow-sm" aria-hidden>
                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white"><path d="M17 8C8 10 5.9 16.17 3.82 19.6c-.45.77.58 1.57 1.15.95C7 18.38 9.9 17 17 17v3l4-4-4-4v2z"/></svg>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-2xl rounded-bl-sm border border-gray-100/80 dark:border-gray-700/50 px-4 py-3.5 shadow-sm" aria-live="polite">
                    <div className="flex items-center gap-1.5">
                      {[0, 180, 360].map(delay => (
                        <motion.span
                          key={delay}
                          className="w-2 h-2 bg-green-500 rounded-full"
                          animate={{ y: [0, -6, 0], scale: [1, 0.85, 1] }}
                          transition={{ duration: 0.9, repeat: Infinity, delay: delay / 1000, ease: 'easeInOut' }}
                          aria-hidden
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} className="h-2" />
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
                  initial={{ opacity: 0, scale: 0.7, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.7, y: 8 }}
                  onClick={() => scrollToBottom(true)}
                  className="absolute bottom-36 right-4 w-10 h-10 bg-white dark:bg-gray-800 border border-green-200 dark:border-green-700 rounded-2xl shadow-lg shadow-green-900/10 flex items-center justify-center text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 hover:scale-110 transition-all z-10"
                  aria-label={t.messages.scrollToBottom}
                >
                  <ChevronDown className="w-4 h-4" aria-hidden />
                </motion.button>
              )}
            </AnimatePresence>

            {/* ── SUGGESTIONS ── */}
            <div className="px-3 pb-2 shrink-0 relative">
              {/* Left fade */}
              <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white dark:from-gray-950 to-transparent z-10 pointer-events-none" aria-hidden />
              {/* Right fade */}
              <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white dark:from-gray-950 to-transparent z-10 pointer-events-none" aria-hidden />
              <div className="flex gap-2 overflow-x-auto no-scrollbar px-1 pb-0.5" role="group" aria-label={locale === 'en' ? 'Quick suggestions' : 'Suggestions rapides'}>
                {activeSugs.map((s, i) => (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.04, type: 'spring', stiffness: 400, damping: 25 }}
                    onClick={() => s.text === '3_ELIGIBILITY_FLOW' ? setShowEligibility(true) : handleSend(s.text)}
                    disabled={isStreaming}
                    className="text-[11px] px-3.5 py-2 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-800 text-green-700 dark:text-green-400 rounded-2xl border border-green-200/70 dark:border-green-700/50 whitespace-nowrap font-semibold shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:border-green-400 hover:shadow-[0_2px_8px_rgba(22,163,74,0.2)] hover:bg-green-50 dark:hover:bg-green-900/20 disabled:opacity-40 transition-all active:scale-95 shrink-0"
                  >
                    {s.label}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* ── INPUT ── */}
            <div className="border-t border-gray-100/80 dark:border-gray-800 px-3 py-3 shrink-0 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm">
              {/* Image preview */}
              <AnimatePresence>
                {imagePreview && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                    className="mb-2.5 flex items-center gap-2.5 p-2.5 bg-green-50 dark:bg-green-900/20 rounded-2xl border border-green-200/60 dark:border-green-800/40" role="status">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imagePreview} alt={t.image.preview} className="w-14 h-14 rounded-xl object-cover border-2 border-white shadow-sm shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-semibold text-green-800 dark:text-green-300 truncate">{imageFile?.name}</p>
                      <p className="text-[10px] text-green-600 dark:text-green-500 mt-0.5">{t.image.ready}</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button onClick={handleAnalyzeImage} disabled={isAnalyzing}
                        className="px-3 py-1.5 bg-gradient-to-br from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white text-[11px] font-bold rounded-xl flex items-center gap-1.5 transition-all disabled:opacity-50 shadow-sm">
                        {isAnalyzing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                        {t.image.analyze}
                      </button>
                      <button onClick={clearImage} aria-label={t.image.removeAria}
                        className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
                        <X className="w-4 h-4" aria-hidden />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Main input row */}
              <div className="flex items-end gap-2">
                {/* Voice + Image buttons */}
                <div className="flex gap-1.5 shrink-0">
                  {voiceSupported && (
                    <motion.button
                      onClick={toggleVoice}
                      whileTap={{ scale: 0.9 }}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                        listening
                          ? 'bg-red-500 text-white shadow-[0_0_0_4px_rgba(239,68,68,0.2)] animate-pulse'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-green-100 dark:hover:bg-green-900/30 hover:text-green-600'
                      }`}
                      aria-label={listening ? t.input.voiceStop : t.input.voiceStart}
                      aria-pressed={listening}
                    >
                      {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </motion.button>
                  )}
                  <motion.button
                    onClick={() => imageInputRef.current?.click()}
                    whileTap={{ scale: 0.9 }}
                    className="w-9 h-9 rounded-xl flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-green-100 dark:hover:bg-green-900/30 hover:text-green-600 transition-all"
                    title={t.image.uploadTitle}
                    aria-label={t.image.uploadAria}
                  >
                    <Image className="w-4 h-4" aria-hidden />
                  </motion.button>
                </div>

                {/* Text input */}
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
                    className="w-full px-4 py-2.5 text-[13px] rounded-2xl border border-gray-200 dark:border-gray-700 focus:border-green-400 dark:focus:border-green-500 focus:ring-2 focus:ring-green-400/30 dark:focus:ring-green-500/20 bg-gray-50 dark:bg-gray-800/80 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 disabled:opacity-50 outline-none transition-all duration-200"
                  />
                  {input.length > 300 && (
                    <span className={`absolute right-3 bottom-2 text-[9px] font-medium ${input.length > 480 ? 'text-red-500' : 'text-gray-400'}`} aria-live="polite">
                      {input.length}/500
                    </span>
                  )}
                </div>

                {/* Send button */}
                <motion.button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isStreaming}
                  whileTap={{ scale: 0.9 }}
                  className="w-10 h-10 rounded-2xl flex items-center justify-center transition-all shrink-0 bg-gradient-to-br from-green-600 to-emerald-700 text-white shadow-[0_4px_12px_rgba(22,163,74,0.35)] hover:shadow-[0_6px_16px_rgba(22,163,74,0.45)] hover:from-green-500 hover:to-emerald-600 disabled:from-gray-200 disabled:to-gray-200 dark:disabled:from-gray-700 dark:disabled:to-gray-700 disabled:shadow-none disabled:cursor-not-allowed"
                  aria-label={t.input.send}
                >
                  {isStreaming
                    ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
                    : <Send className="w-4 h-4" aria-hidden />
                  }
                </motion.button>
              </div>

              {/* Footer branding */}
              <p className="text-[9px] text-gray-400/70 dark:text-gray-600 mt-2 text-center flex items-center justify-center gap-1.5" aria-hidden>
                <Cpu className="w-2.5 h-2.5 text-green-400/60" />
                {t.footer}
                <span className="w-1 h-1 rounded-full bg-green-400/60 inline-block" />
                <span className="font-medium">AGRIPOINT SERVICES</span>
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
              className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[85vh] overflow-auto"
              role="dialog" aria-modal="true" aria-labelledby="dist-dialog-title"
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-900 flex items-center justify-between rounded-t-3xl">
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
              className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-sm p-5"
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
            initial={{ opacity: 0, y: 16, scale: 0.94, x: 12 }} animate={{ opacity: 1, y: 0, scale: 1, x: 0 }} exit={{ opacity: 0, y: 16, scale: 0.94 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="fixed bottom-28 right-4 sm:right-6 z-[70] bg-gray-900/95 dark:bg-white text-white dark:text-gray-900 text-[12px] font-semibold px-4 py-3 rounded-2xl shadow-2xl shadow-black/20 backdrop-blur-sm border border-white/10 dark:border-gray-200 flex items-center gap-2"
            role="status" aria-live="polite"
          >
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" aria-hidden />
            {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
