'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import type { RefObject } from 'react';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
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
import { extractProductsFromText, getSeasonalGreeting } from '@/lib/agribot-calendar';
import {
  getWelcomeMessage,
  AGRIBOT_UI,
  DEFAULT_SUGGESTIONS,
  CAMPAIGN_SUGGESTIONS,
  type Suggestion,
} from '@/lib/agribot-i18n';
import type { Message } from '@/components/agribot/types';
import { useVoiceInput } from './useVoiceInput';

// ─────────────────────────────────────────────────────────────────────────────
// Types internes
// ─────────────────────────────────────────────────────────────────────────────

export interface UseAgriBotReturn {
  // État UI
  isOpen:               boolean;
  setIsOpen:            React.Dispatch<React.SetStateAction<boolean>>;
  isFullscreen:         boolean;
  setIsFullscreen:      React.Dispatch<React.SetStateAction<boolean>>;
  showEligibility:      boolean;
  setShowEligibility:   React.Dispatch<React.SetStateAction<boolean>>;
  showOptionsMenu:      boolean;
  setShowOptionsMenu:   React.Dispatch<React.SetStateAction<boolean>>;
  showHistoryPanel:     boolean;
  setShowHistoryPanel:  React.Dispatch<React.SetStateAction<boolean>>;
  showLocationModal:    boolean;
  setShowLocationModal: React.Dispatch<React.SetStateAction<boolean>>;
  showDistributorsModal:    boolean;
  setShowDistributorsModal: React.Dispatch<React.SetStateAction<boolean>>;
  toastMsg:             string | null;
  unreadCount:          number;
  showScrollBtn:        boolean;

  // Messages & streaming
  messages:     Message[];
  input:        string;
  setInput:     React.Dispatch<React.SetStateAction<string>>;
  isStreaming:  boolean;
  seasonalBanner:    string | null;
  setSeasonalBanner: React.Dispatch<React.SetStateAction<string | null>>;

  // Mémoire & localisation
  userMemory:    UserMemory;
  setUserMemory: React.Dispatch<React.SetStateAction<UserMemory>>;

  // Distributeurs
  distributors:         any[];  // eslint-disable-line @typescript-eslint/no-explicit-any
  loadingDistributors:  boolean;

  // Historique
  savedConversations:    SavedConversation[];

  // Médias
  imageFile:    File | null;
  imagePreview: string | null;
  isAnalyzing:  boolean;

  // Audio
  ttsEnabled:  boolean;
  listening:   boolean;
  voiceSupported: boolean;

  // Suggestions actives
  activeSugs:      Suggestion[];
  isCampaignPage:  boolean;
  isPulsingPage:   boolean;

  // Refs
  messagesEndRef:  RefObject<HTMLDivElement>;
  messagesListRef: RefObject<HTMLDivElement>;
  inputRef:        RefObject<HTMLInputElement>;
  imageInputRef:   RefObject<HTMLInputElement>;

  // Locale
  locale: string;

  // Handlers
  handleSend:              (text?: string) => Promise<void>;
  handleKeyDown:           (e: React.KeyboardEvent<HTMLInputElement>) => void;
  handleScroll:            () => void;
  handleAnalyzeImage:      () => Promise<void>;
  handleImageFileChange:   (file: File) => void;
  resetChat:               () => void;
  sendFeedback:            (messageId: string, feedback: 'positive' | 'negative') => Promise<void>;
  speakText:               (text: string) => void;
  toggleVoice:             () => void;
  toggleTts:               () => void;
  scrollToBottom:          (force?: boolean) => void;
  saveCurrentConversation: () => void;
  loadConversation:        (conv: SavedConversation) => void;
  deleteConversation:      (id: string) => void;
  copyAllMessages:         () => Promise<void>;
  sendEmailSummary:        () => void;
  exportTxt:               () => void;
  shareWhatsApp:           () => void;
  setLocation:             (city: string, region?: string) => void;
  clearLocation:           () => void;
  clearImage:              () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook principal
// ─────────────────────────────────────────────────────────────────────────────

export function useAgriBot(): UseAgriBotReturn {
  const pathname       = usePathname();
  const { locale }     = useLanguage();
  const isCampaignPage = !!pathname?.includes('campagne');
  const isProductsPage = !!pathname?.includes('produits');
  const isPulsingPage  = isCampaignPage || isProductsPage;
  const t              = locale === 'en' ? AGRIBOT_UI.en : AGRIBOT_UI.fr;

  // ── UI state ──
  const [isOpen,               setIsOpen]               = useState(false);
  const [isFullscreen,         setIsFullscreen]         = useState(false);
  const [hasAutoOpened,        setHasAutoOpened]        = useState(false);
  const [showEligibility,      setShowEligibility]      = useState(false);
  const [showOptionsMenu,      setShowOptionsMenu]      = useState(false);
  const [showHistoryPanel,     setShowHistoryPanel]     = useState(false);
  const [showLocationModal,    setShowLocationModal]    = useState(false);
  const [showDistributorsModal,setShowDistributorsModal]= useState(false);
  const [toastMsg,             setToastMsg]             = useState<string | null>(null);
  const [unreadCount,          setUnreadCount]          = useState(0);
  const [showScrollBtn,        setShowScrollBtn]        = useState(false);

  // ── Session ──
  const [sessionId] = useState(() =>
    typeof crypto !== 'undefined' ? crypto.randomUUID() : Math.random().toString(36).slice(2)
  );

  // ── Mémoire ──
  const [userMemory, setUserMemory] = useState<UserMemory>(() => loadMemory('tmp'));

  // ── Distributeurs ──
  const [distributors,        setDistributors]        = useState<any[]>([]);  // eslint-disable-line @typescript-eslint/no-explicit-any
  const [loadingDistributors, setLoadingDistributors] = useState(false);

  // ── Historique ──
  const [savedConversations, setSavedConversations] = useState<SavedConversation[]>([]);

  // ── Messages ──
  const [messages, setMessages] = useState<Message[]>(() => [{
    id: '0',
    role: 'assistant',
    intent: 'conseil',
    content: getWelcomeMessage(typeof window !== 'undefined' ? window.location.pathname : null, locale),
    timestamp: new Date(),
    suggestions: [],
  }]);

  const [input,       setInput]       = useState('');
  const [isStreaming, setIsStreaming] = useState(false);

  // ── Audio ──
  const [ttsEnabled,    setTtsEnabled]    = useState(false);
  const [seasonalBanner,setSeasonalBanner]= useState<string | null>(null);

  // ── Image ──
  const [imageFile,    setImageFile]    = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing,  setIsAnalyzing]  = useState(false);

  // ── Refs ──
  const messagesEndRef:  RefObject<HTMLDivElement>  = useRef(null) as RefObject<HTMLDivElement>;
  const messagesListRef: RefObject<HTMLDivElement>  = useRef(null) as RefObject<HTMLDivElement>;
  const inputRef:        RefObject<HTMLInputElement> = useRef(null) as RefObject<HTMLInputElement>;
  const abortRef        = useRef<AbortController | null>(null);
  const imageInputRef:   RefObject<HTMLInputElement> = useRef(null) as RefObject<HTMLInputElement>;

  // ── Voice ──
  const { listening, toggle: toggleVoice, supported: voiceSupported } = useVoiceInput(
    useCallback((text: string) => setInput(prev => prev + text), []),
    locale,
  );

  // ─── Helpers ────────────────────────────────────────────────────────────

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  }, []);

  const speakText = useCallback((text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(
      text.replace(/<[^>]+>/g, '').replace(/<!--.*?-->/gs, '').slice(0, 400)
    );
    utterance.lang  = locale === 'en' ? 'en-GB' : 'fr-FR';
    utterance.rate  = 0.92;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  }, [locale]);

  const toggleTts = useCallback(() => {
    setTtsEnabled(v => {
      showToast(v ? t.toast.voiceOff : t.toast.voiceOn);
      return !v;
    });
  }, [showToast, t.toast.voiceOff, t.toast.voiceOn]);

  // ─── Scroll ─────────────────────────────────────────────────────────────

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

  // ─── Effects ────────────────────────────────────────────────────────────

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  useEffect(() => {
    if (isOpen) { inputRef.current?.focus(); setUnreadCount(0); }
  }, [isOpen]);

  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape' && isOpen) setIsOpen(false); };
    document.addEventListener('keydown', fn);
    return () => document.removeEventListener('keydown', fn);
  }, [isOpen]);

  // Chargement mémoire depuis localStorage
  useEffect(() => {
    const mem = loadMemory(sessionId);
    setUserMemory({ ...mem, sessionId });
    setSavedConversations(loadSavedConversations());
  }, [sessionId]);

  // Extraction de faits après chaque échange
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

  // Sync MongoDB (debounced 3s)
  useEffect(() => {
    if (!userMemory.location && !userMemory.mainCrops?.length) return;
    const timer = setTimeout(() => {
      fetch('/api/agribot/memory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          location:  userMemory.location,
          region:    userMemory.region,
          mainCrops: userMemory.mainCrops,
          surface:   userMemory.surface,
          farmType:  userMemory.farmType,
          keyFacts:  userMemory.keyFacts?.slice(0, 8),
        }),
      }).catch(() => {/* fire and forget */});
    }, 3000);
    return () => clearTimeout(timer);
  }, [userMemory.location, userMemory.region, userMemory.mainCrops, sessionId, userMemory.surface, userMemory.farmType, userMemory.keyFacts]);

  // Bannière saisonnière
  useEffect(() => {
    if (!isOpen) return;
    if (!userMemory.location && !userMemory.mainCrops?.length) return;
    const greeting = getSeasonalGreeting(userMemory.region, userMemory.mainCrops);
    setSeasonalBanner(greeting || null);
  }, [isOpen, userMemory.location, userMemory.region, userMemory.mainCrops]);

  // Chargement des distributeurs
  useEffect(() => {
    if (!showDistributorsModal) return;
    setLoadingDistributors(true);
    fetch('/api/distributors')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => {
        if (data.distributors) {
          setDistributors(data.distributors.map((d: any) => ({ id: d._id, ...d }))); // eslint-disable-line @typescript-eslint/no-explicit-any
        }
      })
      .catch(() => {
        // Fallback statique (à retirer une fois la DB remplie)
        setDistributors([
          { id: 'dist-yao', name: 'AGRIPOINT SERVICES Yaoundé',  category: 'wholesaler', address: 'Rue Camerounaise, Centre Ville', city: 'Yaoundé',  region: 'Centre',    phone: '+237 6 XX XXX XXX', email: 'yaounde@agripoint.cm',  coordinates: { lat: 3.8474, lng: 11.5021 }, businessHours: 'Lun-Sam: 7h-18h' },
          { id: 'dist-dou', name: 'AGRIPOINT SERVICES Douala',   category: 'retailer',   address: 'Boulevard de la Liberté',        city: 'Douala',   region: 'Littoral',  phone: '+237 6 XX XXX XXX', email: 'douala@agripoint.cm',   coordinates: { lat: 4.0511, lng: 9.7679  }, businessHours: 'Lun-Sam: 7h-18h' },
          { id: 'dist-bam', name: 'AGRIPOINT SERVICES Bamenda',  category: 'partner',    address: 'Avenue Prince Charles',          city: 'Bamenda',  region: 'Nord-Ouest',phone: '+237 6 XX XXX XXX', email: 'bamenda@agripoint.cm',  coordinates: { lat: 5.9631, lng: 10.1591 }, businessHours: 'Lun-Sam: 8h-17h' },
          { id: 'dist-bue', name: 'AGRIPOINT SERVICES Buea',     category: 'retailer',   address: 'Commercial Avenue',              city: 'Buea',     region: 'Sud-Ouest', phone: '+237 6 XX XXX XXX', email: 'buea@agripoint.cm',     coordinates: { lat: 4.1551, lng: 9.2414  }, businessHours: 'Lun-Sam: 8h-17h' },
        ]);
      })
      .finally(() => setLoadingDistributors(false));
  }, [showDistributorsModal]);

  // Ouverture proactive sur pages clés (après 8 secondes)
  useEffect(() => {
    if (hasAutoOpened || isOpen) return;
    if (!isCampaignPage && !isProductsPage) return;
    const timer = setTimeout(() => {
      setIsOpen(true);
      setHasAutoOpened(true);
      setMessages(prev => prev.map((m, i) => i !== 0 ? m : {
        ...m,
        content: isCampaignPage ? t.autoOpen.campaign : t.autoOpen.products,
      }));
    }, 8000);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // ─── Suggestions actives ─────────────────────────────────────────────────

  const lastAiMsg        = useMemo(() => [...messages].reverse().find(m => m.role === 'assistant' && !m.isStreaming), [messages]);
  const langSugs         = DEFAULT_SUGGESTIONS[locale] ?? DEFAULT_SUGGESTIONS.fr;
  const campaignSugs     = CAMPAIGN_SUGGESTIONS[locale] ?? CAMPAIGN_SUGGESTIONS.fr;

  const activeSugs: Suggestion[] = useMemo(() => {
    if ((lastAiMsg?.suggestions?.length ?? 0) > 0)
      return lastAiMsg!.suggestions!.map((s: string) => ({ label: s, text: s, intent: 'conseil' }));
    if (isCampaignPage) return campaignSugs;
    if (messages.length <= 1) return langSugs.slice(0, 5);
    return langSugs.slice(5, 9);
  }, [lastAiMsg?.suggestions, isCampaignPage, messages.length, langSugs, campaignSugs]);

  // ─── Handlers ────────────────────────────────────────────────────────────

  const resetChat = useCallback(() => {
    abortRef.current?.abort();
    setIsStreaming(false);
    setShowEligibility(false);
    setMessages([{
      id: Date.now().toString(),
      role: 'assistant',
      intent: 'conseil',
      content: getWelcomeMessage(pathname, locale),
      timestamp: new Date(),
    }]);
  }, [pathname, locale]);

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

  const handleAnalyzeImage = useCallback(async () => {
    if (!imageFile || isAnalyzing) return;
    setIsAnalyzing(true);

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: `${t.image.userLabel}${imageFile.name}`,
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
      toolStatus: t.image.toolStatus,
    };
    setMessages(prev => [...prev, userMsg, assistantMsg]);
    setImageFile(null);
    setImagePreview(null);

    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('context', `Diagnostic de ma culture${userMemory.mainCrops?.length ? ' (' + userMemory.mainCrops.join(', ') + ')' : ''}`);
      formData.append('memory', JSON.stringify({ location: userMemory.location, mainCrops: userMemory.mainCrops }));
      const res  = await fetch('/api/agribot/analyze', { method: 'POST', body: formData });
      const data = await res.json() as { diagnosis?: string; error?: string };
      const content = data.diagnosis || data.error || t.image.failAnalysis;
      setMessages(prev => prev.map(m =>
        m.id === assistantId ? { ...m, content, isStreaming: false, toolStatus: undefined, intent: 'culture' } : m
      ));
      if (ttsEnabled && data.diagnosis) speakText(data.diagnosis);
    } catch {
      setMessages(prev => prev.map(m =>
        m.id === assistantId ? { ...m, content: t.image.networkError, isStreaming: false, toolStatus: undefined } : m
      ));
    } finally {
      setIsAnalyzing(false);
    }
  }, [imageFile, isAnalyzing, userMemory.location, userMemory.mainCrops, ttsEnabled, speakText, t.image]);

  const handleImageFileChange = useCallback((file: File) => {
    if (file.size > 5 * 1024 * 1024) { showToast(t.image.tooBig); return; }
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  }, [showToast, t.image.tooBig]);

  const handleSend = useCallback(async (text?: string) => {
    const messageText = (text || input).trim();
    if (!messageText || isStreaming) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const userMsg: Message      = { id: Date.now().toString(), role: 'user', content: messageText, timestamp: new Date() };
    const assistantId           = (Date.now() + 1).toString();
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
          language: locale,
          metadata: { page: typeof window !== 'undefined' ? window.location.pathname : '/' },
          userMemory: {
            location:  userMemory.location,
            region:    userMemory.region,
            mainCrops: userMemory.mainCrops,
            surface:   userMemory.surface,
            farmType:  userMemory.farmType,
            keyFacts:  userMemory.keyFacts?.slice(0, 5),
          },
        }),
      });

      if (!res.ok || !res.body) throw new Error('network');

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
              intent?: string; suggestions?: string[]; escalate?: boolean;
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
                if (ttsEnabled) {
                  const finalMsg = updated.find(m => m.id === assistantId);
                  if (finalMsg?.content) speakText(finalMsg.content);
                }
                return updated;
              });
              if (!isOpen) setUnreadCount(n => n + 1);
            } else if (ev.type === 'error') {
              setMessages(prev => prev.map(m =>
                m.id === assistantId ? { ...m, content: ev.message || t.chat.techError, isStreaming: false } : m
              ));
            }
          } catch { /* skip malformed SSE */ }
        }
      }
    } catch (err: unknown) {
      if (!(err instanceof Error && err.name === 'AbortError')) {
        setMessages(prev => prev.map(m =>
          m.id === assistantId ? { ...m, content: t.chat.connectionError, isStreaming: false } : m
        ));
      }
    } finally {
      setIsStreaming(false);
    }
  }, [input, isStreaming, messages, sessionId, isOpen, ttsEnabled, speakText, locale, userMemory, t.chat]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }, [handleSend]);

  // ─── Conversation management ──────────────────────────────────────────────

  const saveCurrentConversation = useCallback(() => {
    if (messages.length < 2) { showToast(t.toast.noMessages); return; }
    saveConversation(messages as Parameters<typeof saveConversation>[0], userMemory);
    setSavedConversations(loadSavedConversations());
    showToast(t.toast.saved);
  }, [messages, userMemory, showToast, t.toast]);

  const loadConversation = useCallback((conv: SavedConversation) => {
    setMessages(conv.messages.map(m => ({ ...m, timestamp: new Date(m.timestamp), id: m.timestamp })));
    if (conv.userMemory) {
      const merged = { ...userMemory, ...conv.userMemory };
      setUserMemory(merged);
      saveMemory(merged);
    }
    setShowHistoryPanel(false);
    showToast(t.toast.loaded);
  }, [userMemory, showToast, t.toast.loaded]);

  const deleteConversation = useCallback((id: string) => {
    deleteSavedConversation(id);
    setSavedConversations(loadSavedConversations());
    showToast(t.toast.deleted);
  }, [showToast, t.toast.deleted]);

  const copyAllMessages = useCallback(async () => {
    const text = messages
      .filter(m => m.content?.trim())
      .map(m => `[${m.role === 'user' ? t.email.me : 'Assistant AGRIPOINT SERVICES'}]\n${m.content.replace(/<[^>]+>/g, '').trim()}`)
      .join('\n\n---\n\n');
    await navigator.clipboard.writeText(text);
    showToast(t.toast.copied);
  }, [messages, showToast, t.email.me, t.toast.copied]);

  const sendEmailSummary = useCallback(() => {
    const lines = messages
      .filter(m => m.content.length > 5)
      .map(m => `[${m.role === 'user' ? t.email.me : 'Assistant AGRIPOINT SERVICES'}]\n${m.content.replace(/<[^>]+>/g, '').replace(/<!--.*?-->/gs, '').slice(0, 600)}`)
      .join('\n\n--------------------\n\n');
    const subject = encodeURIComponent(t.email.subject);
    const body    = encodeURIComponent(`${t.email.bodyPrefix}\n\n${lines}\n\n--------------------\n${t.email.footer}`);
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  }, [messages, t.email]);

  const exportTxt    = useCallback(() => exportConversationTxt(messages as Parameters<typeof exportConversationTxt>[0], userMemory), [messages, userMemory]);
  const shareWhatsApp= useCallback(() => shareOnWhatsApp(messages), [messages]);

  // ─── Localisation ──────────────────────────────────────────────────────────

  const setLocation = useCallback((city: string, region?: string) => {
    const updated = { ...userMemory, location: city, region, sessionId };
    setUserMemory(updated);
    saveMemory(updated);
    showToast(`📍 ${t.location.toastPrefix} : ${city}`);
  }, [userMemory, sessionId, showToast, t.location.toastPrefix]);

  const clearLocation = useCallback(() => {
    const updated = { ...userMemory, location: undefined, region: undefined };
    setUserMemory(updated);
    saveMemory(updated);
    setShowLocationModal(false);
    showToast(t.location.cleared);
  }, [userMemory, showToast, t.location.cleared]);

  const clearImage = useCallback(() => {
    setImageFile(null);
    setImagePreview(null);
  }, []);

  // ─────────────────────────────────────────────────────────────────────────

  return {
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
    userMemory, setUserMemory,
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
  };
}
