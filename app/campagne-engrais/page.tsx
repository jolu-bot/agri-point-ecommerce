'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import Link from 'next/link';
import {
  CheckCircle2, AlertCircle, Clock, ChevronDown, ChevronRight,
  Sprout, Shield, Truck, Users, TrendingUp, Award, Star,
  ArrowRight, Phone, Mail, MapPin, Calculator, Package,
  Leaf, BadgeCheck, Zap, Gift, HeartHandshake, Timer,
  Download, QrCode, Share2,
} from 'lucide-react';
import CampostPaymentInfo from '@/components/shared/CampostPaymentInfo';
import { useLanguage } from '@/contexts/LanguageContext';

// --- Countdown Hook ----------------------------------------------------------

interface TimeLeft { days: number; hours: number; minutes: number; seconds: number; }

function useCountdown(targetDate: Date): TimeLeft {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  useEffect(() => {
    const calc = () => {
      const diff = targetDate.getTime() - Date.now();
      if (diff <= 0) return setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [targetDate]);
  return timeLeft;
}

// --- Animated Counter --------------------------------------------------------

function AnimatedCounter({ value, duration = 2000 }: { value: number; duration?: number }) {
  const [current, setCurrent] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = value / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= value) { setCurrent(value); clearInterval(timer); }
      else setCurrent(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [inView, value, duration]);
  return <span ref={ref}>{current.toLocaleString('fr-FR')}</span>;
}

// --- QR Code Section --------------------------------------------------------

function QRCodeSection() {
  const { locale } = useLanguage();
  const isEn = locale === 'en';
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    const url = 'https://agri-ps.com/campagne-engrais';
    import('qrcode').then(QRCode => {
      QRCode.toDataURL(url, {
        width: 200,
        margin: 2,
        color: { dark: '#064e3b', light: '#ffffff' },
      }).then((dataUrl: string) => setQrDataUrl(dataUrl));
    });
  }, []);

  const handleDownload = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = 'campagne-agricole-2026-qr.png';
    link.click();
  };

  return (
    <section className="py-16 bg-emerald-50 dark:bg-emerald-950/20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row items-center gap-10 bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-lg border border-emerald-100 dark:border-emerald-900/50"
        >
          {/* QR Code image */}
          <div className="flex-shrink-0 flex flex-col items-center gap-4">
            <div className="w-[180px] h-[180px] bg-white rounded-2xl border-4 border-emerald-600/20 flex items-center justify-center overflow-hidden shadow-md">
              {qrDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={qrDataUrl}
                  alt={isEn ? 'QR Code Agricultural Campaign 2026' : 'QR Code Campagne Agricole 2026'}
                  className="w-full h-full"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100 animate-pulse rounded-xl">
                  <QrCode className="w-16 h-16 text-gray-300" />
                </div>
              )}
            </div>
            <button
              onClick={handleDownload}
              disabled={!qrDataUrl}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white rounded-xl font-semibold text-sm transition-colors"
            >
              <Download className="w-4 h-4" />
              {isEn ? 'Download QR' : 'Télécharger le QR'}
            </button>
          </div>

          {/* Description */}
          <div className="flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full mb-4">
              <Share2 className="w-3.5 h-3.5" />
              {isEn ? 'Share the Campaign' : 'Partager la campagne'}
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white mb-3">
              {isEn ? 'Share with your cooperative' : 'Partagez avec votre coopérative'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
              {isEn ? (
                <>
                  Scan this QR code to access the campaign page directly.
                  Share it with the members of your GIC or cooperative to invite them to register before{' '}
                  <strong className="text-emerald-700 dark:text-emerald-400">March 31, 2026</strong>.
                </>
              ) : (
                <>
                  Scannez ce QR code pour accéder directement à la page de la campagne.
                  Partagez-le avec les membres de votre GIC ou coopérative pour les inviter à s&apos;inscrire avant le{' '}
                  <strong className="text-emerald-700 dark:text-emerald-400">31 mars 2026</strong>.
                </>
              )}
            </p>
            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-lg font-mono border border-gray-200 dark:border-gray-700">
                agri-ps.com/campagne-engrais
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// --- Page --------------------------------------------------------------------

export default function CampagnePremiumPage() {
  const { locale } = useLanguage();
  const isEn = locale === 'en';

  const MINERAL_PRICE = 15000;
  const BIO_PRICE = 10000;
  const MINERAL_ORIGINAL = 25000;
  const BIO_ORIGINAL = 16000;

  const campaignEndDate = new Date('2026-03-31T23:59:59');
  const timeLeft = useCountdown(campaignEndDate);

  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [calcQty, setCalcQty] = useState(10);
  const [formStep, setFormStep] = useState(1);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formDone, setFormDone] = useState(false);
  const [eligibilityMsg, setEligibilityMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [formData, setFormData] = useState({
    fullName: '', email: '', phone: '',
    cooperativeName: '',
    isMember: false, hasInsurance: false,
    insuranceProvider: '',
    quantity: 6, productType: 'mineral' as 'mineral' | 'bio',
  });

  const calcSavings = calcQty * (MINERAL_ORIGINAL - MINERAL_PRICE);
  const calcTotal = calcQty * MINERAL_PRICE;
  const calcOriginal = calcQty * MINERAL_ORIGINAL;

  // --- Locale-aware data ---

  const FAQ_ITEMS = [
    {
      q: isEn ? "Who can benefit from this campaign?" : "Qui peut bénéficier de cette campagne ?",
      a: isEn
        ? "Any GIC or cooperative with an active CAMPOST account and membership in an agricultural mutual fund (CICAN or CAMAO) can participate. The minimum order is 6 bags of 50 kg for mineral fertilizers or 5 liters for biofertilizers."
        : "Tout GIC ou coopérative ayant un compte CAMPOST et adhérent à une caisse mutuelle agricole (CICAN ou CAMAO) peut participer. La commande minimale est de 6 sacs de 50 kg pour les engrais minéraux ou 5 litres pour les biofertilisants.",
    },
    {
      q: isEn ? "How does the 70/30 instalment payment work?" : "Comment fonctionne le paiement échelonné 70/30 ?",
      a: isEn
        ? "You pay 70% of the amount directly at the nearest Campost office, to the AGRIPOINT SERVICES SAS account. Our team confirms your order within 24 hours of receiving the receipt. The remaining 30% is settled from April 15, 2026, with a deadline of April 30, 2026."
        : "Vous versez 70% du montant directement au bureau Campost le plus proche, sur le compte AGRIPOINT SERVICES SAS. Notre équipe vous confirme la commande sous 24h après réception du reçu. Les 30% restants sont réglés à partir du 15 avril 2026, date limite le 30 avril 2026.",
    },
    {
      q: isEn ? "What are the delivery times?" : "Quels sont les délais de livraison ?",
      a: isEn
        ? "Delivery is made within 5 to 10 business days after order validation. We deliver to all 10 regions of Cameroon."
        : "La livraison est effectuée dans un délai de 5 à 10 jours ouvrables après validation de la commande. Nous livrons dans toutes les 10 régions du Cameroun.",
    },
    {
      q: isEn ? "Can I order both types of products?" : "Puis-je commander les deux types de produits ?",
      a: isEn
        ? "Yes, you can combine mineral fertilizers and biofertilizers in a single order. Eligibility conditions apply separately for each category."
        : "Oui, vous pouvez combiner engrais minéraux et biofertilisants dans une même commande. Les conditions d'éligibilité s'appliquent séparément pour chaque catégorie.",
    },
    {
      q: isEn ? "What if my cooperative is not recognized?" : "Que se passe-t-il si ma coopérative n'est pas reconnue ?",
      a: isEn
        ? "Contact our sales team at +237 651 92 09 20. We work with most MINADER-approved cooperatives. A manual check is possible within 48 hours."
        : "Contactez notre service commercial au +237 651 92 09 20. Nous travaillons avec la plupart des coopératives agréées MINADER. Une vérification manuelle est possible sous 48h.",
    },
    {
      q: isEn ? "Is delivery really free?" : "La livraison est-elle vraiment gratuite ?",
      a: isEn
        ? "Yes, for any order of at least 6 bags or liters under this campaign, delivery is fully covered by AGRIPOINT SERVICES."
        : "Oui, pour toute commande d'au moins 6 sacs ou litres dans le cadre de cette campagne, la livraison est entièrement prise en charge par AGRIPOINT SERVICES.",
    },
  ];

  const TESTIMONIALS = [
    {
      name: "Jean-Pierre Mballa",
      role: isEn ? "Corn farming, 12 ha" : "Maïsiculture, 12 ha",
      region: "Centre",
      text: isEn
        ? "I ordered 20 bags of NPK fertilizer at 15,000 FCFA instead of 25,000 FCFA. 200,000 FCFA in savings, and the 70/30 payment freed up my cash flow for the season."
        : "J'ai commandé 20 sacs d'engrais NPK à 15 000 FCFA au lieu de 25 000 FCFA. 200 000 FCFA d'économies et le paiement 70/30 a libéré ma trésorerie pour la saison.",
      rating: 5,
      savings: "200 000 FCFA",
      color: "from-emerald-500 to-teal-600",
    },
    {
      name: "Marie Kamgaing",
      role: isEn ? "Organic market gardening, 5 ha" : "Maraîchage bio, 5 ha",
      region: "Ouest",
      text: isEn
        ? "Biofertilizers at 10,000 FCFA instead of 16,000 FCFA — that's 37.5% savings! The 70/30 instalment plan let me double my usual order."
        : "Les biofertilisants à 10 000 FCFA au lieu de 16 000 FCFA — c'est 37,5% d'économie ! Le paiement échelonné 70/30 m'a permis de doubler ma commande habituelle.",
      rating: 5,
      savings: "60 000 FCFA",
      color: "from-teal-500 to-emerald-600",
    },
    {
      name: "Thomas Nguetsop",
      role: isEn ? "Cocoa & coffee, 8 ha" : "Cacaoyer & café, 8 ha",
      region: "Littoral",
      text: isEn
        ? "Our cooperative pooled orders for 25 bags. 250,000 FCFA in total savings, delivered directly to our depot. I highly recommend it."
        : "Notre coopérative a groupé les commandes de 25 sacs. 250 000 FCFA d'économies au total, livrés directement à notre dépôt. Je recommande vivement.",
      rating: 5,
      savings: "250 000 FCFA",
      color: "from-green-500 to-emerald-600",
    },
  ];

  const statsData = isEn
    ? [
        { icon: Users, value: 2400, suffix: '+', label: 'Beneficiary producers', color: 'text-amber-400' },
        { icon: Package, value: 15000, suffix: ' FCFA', label: 'Price/bag mineral fertilizer', color: 'text-emerald-400' },
        { icon: Truck, value: 10, suffix: ' regions', label: 'National coverage', color: 'text-teal-400' },
        { icon: TrendingUp, value: 40, suffix: '%', label: 'Savings achieved', color: 'text-yellow-400' },
      ]
    : [
        { icon: Users, value: 2400, suffix: '+', label: 'Producteurs bénéficiaires', color: 'text-amber-400' },
        { icon: Package, value: 15000, suffix: ' FCFA', label: 'Prix/sac engrais minéral', color: 'text-emerald-400' },
        { icon: Truck, value: 10, suffix: ' régions', label: 'Couverture nationale', color: 'text-teal-400' },
        { icon: TrendingUp, value: 40, suffix: '%', label: 'Économies réalisées', color: 'text-yellow-400' },
      ];

  const benefitsData = isEn
    ? [
        { icon: Gift, color: 'from-amber-500 to-orange-500', bg: 'bg-amber-50 dark:bg-amber-950/20', border: 'border-amber-100 dark:border-amber-800/30', title: 'Subsidised Prices', desc: "Up to 40% discount on mineral fertilizers and 37.5% on biofertilizers. Affordable prices for all cooperative members." },
        { icon: HeartHandshake, color: 'from-emerald-500 to-teal-500', bg: 'bg-emerald-50 dark:bg-emerald-950/20', border: 'border-emerald-100 dark:border-emerald-800/30', title: 'Flexible Payment', desc: "Pay 70% at registration, 30% from April 15 (deadline: April 30, 2026). Zero interest, zero financial stress." },
        { icon: Truck, color: 'from-teal-500 to-cyan-500', bg: 'bg-teal-50 dark:bg-teal-950/20', border: 'border-teal-100 dark:border-teal-800/30', title: 'Free Delivery', desc: "Delivery included for any order of 6 bags or more. Anywhere in all 10 regions, within 5 to 10 business days." },
      ]
    : [
        { icon: Gift, color: 'from-amber-500 to-orange-500', bg: 'bg-amber-50 dark:bg-amber-950/20', border: 'border-amber-100 dark:border-amber-800/30', title: 'Prix Subventionnés', desc: "Jusqu'à 40% de réduction sur les engrais minéraux et 37,5% sur les biofertilisants. Des prix accessibles pour tous les membres de coopératives." },
        { icon: HeartHandshake, color: 'from-emerald-500 to-teal-500', bg: 'bg-emerald-50 dark:bg-emerald-950/20', border: 'border-emerald-100 dark:border-emerald-800/30', title: 'Paiement Flexible', desc: "Payez 70% à l'inscription, 30% à partir du 15 avril (date limite : 30 avril 2026). Zéro intérêt, zéro stress financier." },
        { icon: Truck, color: 'from-teal-500 to-cyan-500', bg: 'bg-teal-50 dark:bg-teal-950/20', border: 'border-teal-100 dark:border-teal-800/30', title: 'Livraison Gratuite', desc: "Livraison incluse pour toute commande de 6 sacs ou plus. Partout dans les 10 régions, en 5 à 10 jours ouvrables." },
      ];

  const mineralFeatures = isEn
    ? ['70/30 instalment payment available', 'Free delivery from 6 bags', 'MINADER-certified quality guarantee', 'Real-time order tracking']
    : ['Paiement échelonné 70/30 disponible', 'Livraison gratuite dès 6 sacs', 'Garantie qualité certifiée MINADER', 'Suivi de commande en temps réel'];

  const bioFeatures = isEn
    ? ['70/30 instalment payment available', 'Free delivery from 5 liters', 'Organic agriculture certification', 'Compatible with all crops']
    : ['Paiement échelonné 70/30 disponible', 'Livraison gratuite dès 5 litres', 'Certification agriculture biologique', 'Compatible toutes cultures'];

  const stepsData = isEn
    ? [
        { step: '01', icon: BadgeCheck, color: 'from-emerald-500 to-teal-500', title: "Check Your Eligibility", desc: "Enter your personal information, your cooperative, and your agricultural insurance." },
        { step: '02', icon: Package, color: 'from-teal-500 to-cyan-500', title: "Choose Your Products", desc: "Select the type of fertilizer and the desired quantity. The calculator shows your savings instantly." },
        { step: '03', icon: Zap, color: 'from-amber-500 to-orange-500', title: "Order & Receive", desc: "Pay 70% at the nearest Campost office, send your receipt via WhatsApp, and track your delivery in real time." },
      ]
    : [
        { step: '01', icon: BadgeCheck, color: 'from-emerald-500 to-teal-500', title: "Vérifiez votre éligibilité", desc: "Renseignez vos informations personnelles, votre coopérative et votre assurance agricole." },
        { step: '02', icon: Package, color: 'from-teal-500 to-cyan-500', title: "Choisissez vos produits", desc: "Sélectionnez le type d'engrais et la quantité souhaitée. Le calculateur affiche vos économies instantanément." },
        { step: '03', icon: Zap, color: 'from-amber-500 to-orange-500', title: "Commandez & Recevez", desc: "Versez 70% au bureau Campost le plus proche, envoyez votre reçu par WhatsApp, et suivez votre livraison en temps réel." },
      ];

  const eligibilityCriteria = isEn
    ? [
        { icon: Users, num: '1', title: "GIC or cooperative with a CAMPOST account", desc: "Be a GIC or an approved cooperative with an active account at CAMPOST. This account will be used for the 70% instalment payment.", color: 'from-emerald-500 to-teal-500', bg: 'bg-emerald-50 dark:bg-emerald-950/20' },
        { icon: Shield, num: '2', title: "CICAN or CAMAO member", desc: "Be a member of a recognized agricultural mutual fund: CICAN (Inter-mutual Fund) or CAMAO. Your membership will be verified.", color: 'from-teal-500 to-cyan-500', bg: 'bg-teal-50 dark:bg-teal-950/20' },
        { icon: Package, num: '3', title: "6 bags of 50 kg or 5 liters minimum", desc: "Minimum quantity: 6 bags of 50 kg for NPK mineral fertilizers, or 5 liters for organic biofertilizers.", color: 'from-amber-500 to-orange-500', bg: 'bg-amber-50 dark:bg-amber-950/20' },
      ]
    : [
        { icon: Users, num: '1', title: "GIC ou coopérative avec compte CAMPOST", desc: "Être un GIC ou une coopérative agréée disposant d'un compte actif à CAMPOST. Ce compte servira pour le versement de la tranche 70%.", color: 'from-emerald-500 to-teal-500', bg: 'bg-emerald-50 dark:bg-emerald-950/20' },
        { icon: Shield, num: '2', title: "Adhérent CICAN ou CAMAO", desc: "Être membre adhérant d'une caisse mutuelle agricole reconnue : CICAN (Caisse Inter-mutuelle) ou CAMAO. Votre adhésion sera vérifiée.", color: 'from-teal-500 to-cyan-500', bg: 'bg-teal-50 dark:bg-teal-950/20' },
        { icon: Package, num: '3', title: "6 sacs de 50 kg ou 5 litres minimum", desc: "Quantité minimale : 6 sacs de 50 kg pour les engrais minéraux NPK, ou 5 litres pour les biofertilisants organiques.", color: 'from-amber-500 to-orange-500', bg: 'bg-amber-50 dark:bg-amber-950/20' },
      ];

  const trustBadges = isEn
    ? [
        { icon: BadgeCheck, text: 'MINADER Certified' },
        { icon: Shield, text: 'Secure Payment' },
        { icon: Award, text: 'Quality Guaranteed' },
        { icon: Truck, text: 'Delivery Assured' },
      ]
    : [
        { icon: BadgeCheck, text: 'Certifié MINADER' },
        { icon: Shield, text: 'Paiement sécurisé' },
        { icon: Award, text: 'Qualité garantie' },
        { icon: Truck, text: 'Livraison assurée' },
      ];

  const formStepLabels = isEn
    ? ['Identity', 'Eligibility', 'Order', 'Confirmation']
    : ['Identité', 'Éligibilité', 'Commande', 'Confirmation'];

  const countdownUnits = isEn
    ? [
        { label: 'Days', value: timeLeft.days },
        { label: 'Hours', value: timeLeft.hours },
        { label: 'Min', value: timeLeft.minutes },
        { label: 'Sec', value: timeLeft.seconds },
      ]
    : [
        { label: 'Jours', value: timeLeft.days },
        { label: 'Heures', value: timeLeft.hours },
        { label: 'Min', value: timeLeft.minutes },
        { label: 'Sec', value: timeLeft.seconds },
      ];

  const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const v = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => ({ ...prev, [name]: name === 'quantity' ? parseInt(value) || 0 : v }));
  };

  const validateStep = (step: number) => {
    if (step === 1) return formData.fullName.trim() !== '' && formData.email.trim() !== '' && formData.phone.trim() !== '';
    if (step === 2) {
      if (!formData.isMember) {
        setEligibilityMsg({ ok: false, text: isEn ? "You must be a GIC or cooperative with an active CAMPOST account." : "Vous devez être un GIC ou une coopérative avec un compte CAMPOST actif." });
        return false;
      }
      if (!formData.hasInsurance) {
        setEligibilityMsg({ ok: false, text: isEn ? "You must be a member of CICAN or CAMAO." : "Vous devez être adhérant à la CICAN ou à la CAMAO." });
        return false;
      }
      setEligibilityMsg({ ok: true, text: isEn ? "Eligibility requirements validated ✓" : "Conditions d'éligibilité validées ✓" });
      return true;
    }
    if (step === 3) return formData.quantity >= 6;
    return true;
  };

  const nextStep = () => { if (validateStep(formStep)) setFormStep(s => Math.min(s + 1, 4)); };

  const handleSubmit = async () => {
    setFormSubmitting(true);
    await new Promise(r => setTimeout(r, 1500));
    setFormDone(true);
    setFormSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 overflow-x-hidden">

      {/* ══════════════════════════════════════════
          HERO PREMIUM
      ══════════════════════════════════════════ */}
      <section className="relative min-h-[92vh] flex flex-col justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 via-green-900 to-teal-950" />
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-emerald-600/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/3 animate-pulse" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-teal-600/20 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 animate-pulse [animation-delay:1s]" />
        <div className="absolute inset-0 opacity-[0.04] [background-image:linear-gradient(#fff_1px,transparent_1px),linear-gradient(90deg,#fff_1px,transparent_1px)] [background-size:60px_60px]" />

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs font-bold uppercase tracking-[0.2em] px-4 py-2 rounded-full mb-8"
          >
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            {isEn ? 'Exclusive Programme March 2026' : 'Programme Exclusif Mars 2026'}
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl sm:text-6xl md:text-7xl font-black text-white leading-[1.05] mb-6"
          >
            {isEn ? 'Agricultural Campaign' : 'Campagne Agricole'}
            <span className="block bg-gradient-to-r from-amber-300 via-yellow-300 to-amber-400 bg-clip-text text-transparent mt-2">
              {isEn ? 'Subsidised 2026' : 'Subventionnés 2026'}
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
            className="text-emerald-100/80 text-lg sm:text-xl max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            {isEn ? (
              <>
                Benefit from reduced prices of up to <strong className="text-amber-300">-22%</strong> on mineral
                fertilizers and biofertilizers. 70/30 instalment payment. Free delivery throughout Cameroon.
              </>
            ) : (
              <>
                Bénéficiez de prix réduits jusqu&apos;à <strong className="text-amber-300">-22%</strong> sur les engrais
                minéraux et les biofertilisants. Paiement échelonné 70/30. Livraison gratuite partout au Cameroun.
              </>
            )}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap gap-4 justify-center mb-16"
          >
            <a href="#formulaire" className="group flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-gray-900 font-black text-base px-8 py-4 rounded-2xl transition-all duration-200 shadow-lg shadow-amber-400/30 hover:shadow-amber-400/50 hover:-translate-y-0.5">
              {isEn ? 'Join Now' : 'Participer maintenant'}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
            <a href="#tarifs" className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-base px-8 py-4 rounded-2xl transition-all duration-200 backdrop-blur-sm">
              <Calculator className="w-5 h-5" />
              {isEn ? 'View Pricing' : 'Voir les tarifs'}
            </a>
          </motion.div>

          {/* Countdown */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.4 }} className="inline-block">
            <p className="text-emerald-300/70 text-xs font-semibold uppercase tracking-widest mb-4">
              {isEn ? '⏳ Campaign ends in' : '⏳ Campagne se termine dans'}
            </p>
            <div className="flex gap-3 justify-center">
              {countdownUnits.map(({ label, value }) => (
                <div key={label} className="flex flex-col items-center">
                  <div className="w-16 sm:w-20 h-16 sm:h-20 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl flex items-center justify-center">
                    <AnimatePresence mode="wait">
                      <motion.span key={value} initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 10, opacity: 0 }} transition={{ duration: 0.2 }}
                        className="text-2xl sm:text-3xl font-black text-white tabular-nums">
                        {String(value).padStart(2, '0')}
                      </motion.span>
                    </AnimatePresence>
                  </div>
                  <span className="text-emerald-300/60 text-[10px] font-semibold uppercase tracking-wider mt-2">{label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/40">
          <span className="text-xs uppercase tracking-widest">{isEn ? 'Discover' : 'Découvrir'}</span>
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
            <ChevronDown className="w-5 h-5" />
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          STATS BAR
      ══════════════════════════════════════════ */}
      <section className="py-12 bg-emerald-950 border-y border-emerald-800/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {statsData.map(({ icon: Icon, value, suffix, label, color }) => (
              <div key={label} className="text-center">
                <Icon className={`w-7 h-7 ${color} mx-auto mb-3`} />
                <div className={`text-3xl font-black ${color} mb-1`}><AnimatedCounter value={value} />{suffix}</div>
                <p className="text-emerald-300/60 text-sm">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          POURQUOI CETTE CAMPAGNE
      ══════════════════════════════════════════ */}
      <section className="py-24 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-600 font-bold mb-3">
              {isEn ? 'Why Now' : 'Pourquoi maintenant'}
            </p>
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white mb-4">
              {isEn ? 'The campaign that changes everything' : 'La campagne qui change tout'}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto text-lg">
              {isEn
                ? "AGRIPOINT SERVICES is committed to standing alongside Cameroonian producers to make agricultural inputs accessible to all."
                : "AGRIPOINT SERVICES s\u2019engage aux côtés des producteurs camerounais pour rendre les intrants agricoles accessibles à tous."}
            </p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8">
            {benefitsData.map(({ icon: Icon, color, bg, border, title, desc }, i) => (
              <motion.div key={title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className={`${bg} border ${border} rounded-3xl p-8 hover:shadow-xl transition-shadow duration-300`}>
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mb-6 shadow-lg`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-black text-gray-900 dark:text-white mb-3">{title}</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          TARIFS PREMIUM
      ══════════════════════════════════════════ */}
      <section id="tarifs" className="py-24 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-600 font-bold mb-3">
              {isEn ? 'Pricing' : 'Tarification'}
            </p>
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white mb-4">
              {isEn ? 'Exclusive campaign pricing' : 'Tarifs exclusifs campagne'}
            </h2>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Card Minéraux */}
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="relative bg-white dark:bg-gray-950 rounded-3xl border-2 border-emerald-500 shadow-2xl shadow-emerald-500/10 overflow-hidden">
              <div className="absolute top-0 left-0 right-0 text-center py-2 bg-gradient-to-r from-emerald-500 to-teal-500">
                <span className="inline-flex items-center gap-1 text-white text-xs font-black uppercase tracking-widest">
                  <Star className="w-3.5 h-3.5 fill-white" />
                  {isEn ? 'Most Popular' : 'Le Plus Demandé'}
                </span>
              </div>
              <div className="pt-12 pb-8 px-8">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white">
                      {isEn ? 'Mineral Fertilizers' : 'Engrais Minéraux'}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                      {isEn ? '50 kg bag — NPK, Urea, etc.' : 'Sac de 50 kg — NPK, Urée, etc.'}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950/50 rounded-2xl flex items-center justify-center">
                    <Sprout className="w-6 h-6 text-emerald-600" />
                  </div>
                </div>
                <div className="mb-6">
                  <div className="flex items-baseline gap-3 mb-1">
                    <span className="text-5xl font-black text-emerald-600">{MINERAL_PRICE.toLocaleString('fr-FR')}</span>
                    <span className="text-xl font-bold text-gray-500">FCFA</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 line-through text-lg">{MINERAL_ORIGINAL.toLocaleString('fr-FR')} FCFA</span>
                    <span className="bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-xs font-black px-2 py-0.5 rounded-full">
                      -{Math.round((1 - MINERAL_PRICE / MINERAL_ORIGINAL) * 100)}%
                    </span>
                  </div>
                </div>
                <div className="space-y-3 mb-8">
                  {mineralFeatures.map(item => (
                    <div key={item} className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300 text-sm">{item}</span>
                    </div>
                  ))}
                </div>
                <a href="#formulaire" className="flex items-center justify-center gap-2 w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold rounded-2xl transition-all duration-200 shadow-lg shadow-emerald-500/30 hover:-translate-y-0.5">
                  {isEn ? 'Order Now' : 'Commander maintenant'} <ArrowRight className="w-5 h-5" />
                </a>
              </div>
            </motion.div>

            {/* Card Bio */}
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="relative bg-white dark:bg-gray-950 rounded-3xl border border-gray-200 dark:border-white/[0.08] shadow-lg overflow-hidden">
              <div className="p-8">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white">
                      {isEn ? 'Biofertilizers' : 'Biofertilisants'}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                      {isEn ? '5L cans — 100% organic' : 'Bidons de 5L — 100% organique'}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-teal-100 dark:bg-teal-950/50 rounded-2xl flex items-center justify-center">
                    <Leaf className="w-6 h-6 text-teal-600" />
                  </div>
                </div>
                <div className="mb-6">
                  <div className="flex items-baseline gap-3 mb-1">
                    <span className="text-5xl font-black text-teal-600">{BIO_PRICE.toLocaleString('fr-FR')}</span>
                    <span className="text-xl font-bold text-gray-500">FCFA</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 line-through text-lg">{BIO_ORIGINAL.toLocaleString('fr-FR')} FCFA</span>
                    <span className="bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-xs font-black px-2 py-0.5 rounded-full">
                      -{Math.round((1 - BIO_PRICE / BIO_ORIGINAL) * 100)}%
                    </span>
                  </div>
                </div>
                <div className="space-y-3 mb-8">
                  {bioFeatures.map(item => (
                    <div key={item} className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-teal-500 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300 text-sm">{item}</span>
                    </div>
                  ))}
                </div>
                <a href="#formulaire" className="flex items-center justify-center gap-2 w-full py-4 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-2xl transition-all duration-200 hover:-translate-y-0.5">
                  {isEn ? 'Order Now' : 'Commander maintenant'} <ArrowRight className="w-5 h-5" />
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          CALCULATEUR D'ÉCONOMIES
      ══════════════════════════════════════════ */}
      <section className="py-24 bg-gradient-to-br from-emerald-950 to-green-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <p className="text-xs uppercase tracking-[0.2em] text-amber-400 font-bold mb-3">
              {isEn ? 'Simulator' : 'Simulateur'}
            </p>
            <h2 className="text-4xl font-black text-white mb-4">
              {isEn ? 'Calculate Your Savings' : 'Calculez vos économies'}
            </h2>
            <p className="text-emerald-300/70">
              {isEn
                ? 'Adjust the quantity to see how much you save instantly'
                : 'Ajustez la quantité pour voir combien vous économisez instantanément'}
            </p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 md:p-12">
            <div className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <label htmlFor="calc-qty-range" className="text-emerald-200 font-semibold">
                  {isEn ? 'Number of mineral fertilizer bags' : 'Nombre de sacs d\u2019engrais minéraux'}
                </label>
                <span className="text-3xl font-black text-amber-400">
                  {calcQty} {isEn ? 'bags' : 'sacs'}
                </span>
              </div>
              <input id="calc-qty-range" type="range" min={6} max={200} step={1} value={calcQty}
                onChange={e => setCalcQty(parseInt(e.target.value))}
                className="w-full h-3 rounded-full appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between text-emerald-400/50 text-xs mt-2">
                <span>{isEn ? '6 bags (min)' : '6 sacs (min)'}</span>
                <span>{isEn ? '200 bags' : '200 sacs'}</span>
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white/5 rounded-2xl p-6 text-center">
                <p className="text-emerald-300/60 text-sm mb-2">
                  {isEn ? 'Total campaign price' : 'Prix campagne total'}
                </p>
                <p className="text-3xl font-black text-white">{calcTotal.toLocaleString('fr-FR')}</p>
                <p className="text-emerald-400/60 text-sm">FCFA</p>
              </div>
              <div className="bg-white/5 rounded-2xl p-6 text-center">
                <p className="text-emerald-300/60 text-sm mb-2">
                  {isEn ? 'Normal market price' : 'Prix marché normal'}
                </p>
                <p className="text-3xl font-black text-gray-400 line-through">{calcOriginal.toLocaleString('fr-FR')}</p>
                <p className="text-emerald-400/60 text-sm">FCFA</p>
              </div>
              <div className="bg-amber-400/10 border border-amber-400/30 rounded-2xl p-6 text-center">
                <p className="text-amber-300/80 text-sm mb-2">
                  {isEn ? 'Your savings' : 'Vos économies'}
                </p>
                <p className="text-3xl font-black text-amber-400">+{calcSavings.toLocaleString('fr-FR')}</p>
                <p className="text-amber-400/60 text-sm">
                  {isEn ? 'FCFA saved' : 'FCFA économisés'}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          COMMENT ÇA MARCHE
      ══════════════════════════════════════════ */}
      <section className="py-24 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-600 font-bold mb-3">
              {isEn ? 'Process' : 'Processus'}
            </p>
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white">
              {isEn ? 'How it Works' : 'Comment ça marche'}
            </h2>
          </motion.div>
          <div className="relative">
            <div className="hidden md:block absolute top-16 left-[16.5%] right-[16.5%] h-0.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 opacity-30" />
            <div className="grid md:grid-cols-3 gap-10">
              {stepsData.map(({ step, icon: Icon, color, title, desc }, i) => (
                <motion.div key={step} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }} className="text-center">
                  <div className="relative inline-block mb-8">
                    <div className={`w-32 h-32 rounded-3xl bg-gradient-to-br ${color} flex items-center justify-center shadow-2xl mx-auto`}>
                      <Icon className="w-14 h-14 text-white" />
                    </div>
                    <div className="absolute -top-3 -right-3 w-10 h-10 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full flex items-center justify-center font-black text-sm border-2 border-white dark:border-gray-900 shadow-lg">
                      {step}
                    </div>
                  </div>
                  <h3 className="text-xl font-black text-gray-900 dark:text-white mb-3">{title}</h3>
                  <p className="text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          ÉLIGIBILITÉ VISUELLE
      ══════════════════════════════════════════ */}
      <section className="py-24 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-600 font-bold mb-3">
              {isEn ? 'Requirements' : 'Conditions'}
            </p>
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white mb-4">
              {isEn ? 'Are You Eligible?' : 'Êtes-vous éligible ?'}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-lg mx-auto">
              {isEn
                ? '3 simple conditions to benefit from preferential rates.'
                : '3 conditions simples pour bénéficier des tarifs préférentiels.'}
            </p>
          </motion.div>
          <div className="space-y-4">
            {eligibilityCriteria.map(({ icon: Icon, num, title, desc, color, bg }, i) => (
              <motion.div key={num} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className={`${bg} rounded-2xl p-6 flex items-start gap-6`}>
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <span className="text-xs font-black text-gray-400 uppercase tracking-wider block mb-1">
                    {isEn ? `Requirement ${num}` : `Condition ${num}`}
                  </span>
                  <h3 className="text-lg font-black text-gray-900 dark:text-white mb-2">{title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{desc}</p>
                </div>
                <CheckCircle2 className="w-7 h-7 text-emerald-500 flex-shrink-0 mt-1" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          QR CODE PARTAGE
      ══════════════════════════════════════════ */}
      <QRCodeSection />

      {/* ══════════════════════════════════════════
          FORMULAIRE MULTI-ÉTAPES
      ══════════════════════════════════════════ */}
      <section id="formulaire" className="py-24 bg-white dark:bg-gray-950">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-600 font-bold mb-3">
              {isEn ? 'Registration' : 'Inscription'}
            </p>
            <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-4">
              {isEn ? 'Join the Campaign' : 'Rejoindre la campagne'}
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              {isEn ? '4 simple steps — less than 3 minutes.' : '4 étapes simples — moins de 3 minutes.'}
            </p>
          </motion.div>

          {formDone ? (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16 px-8 bg-emerald-50 dark:bg-emerald-950/20 rounded-3xl border border-emerald-200 dark:border-emerald-800/30">
              <CheckCircle2 className="w-20 h-20 text-emerald-500 mx-auto mb-6" />
              <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-4">
                {isEn ? 'Registration Confirmed!' : 'Inscription confirmée !'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">
                {isEn
                  ? 'Our team will contact you within 24 hours via WhatsApp to finalise the order.'
                  : 'Notre équipe vous contacte sous 24h via WhatsApp pour finaliser la commande.'}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/produits" className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors">
                  <Package className="w-5 h-5" /> {isEn ? 'View Products' : 'Voir les produits'}
                </Link>
                <Link href="/" className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                  {isEn ? 'Back to Home' : 'Retour à l\u2019accueil'}
                </Link>
              </div>
            </motion.div>
          ) : (
            <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl shadow-gray-200/60 dark:shadow-black/30 border border-gray-100 dark:border-white/[0.06] overflow-hidden">
              {/* Progress */}
              <div className="px-8 pt-8 pb-6 border-b border-gray-100 dark:border-white/[0.06]">
                <div className="flex items-center justify-between mb-4">
                  {[1, 2, 3, 4].map(s => (
                    <div key={s} className="flex flex-col items-center flex-1">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-sm transition-all duration-300 ${s < formStep ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : s === formStep ? 'bg-emerald-600 text-white ring-4 ring-emerald-500/20' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
                        {s < formStep ? <CheckCircle2 className="w-5 h-5" /> : s}
                      </div>
                      <span className={`text-[10px] font-semibold mt-1.5 text-center ${s === formStep ? 'text-emerald-600' : 'text-gray-400'}`}>
                        {formStepLabels[s - 1]}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="relative h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full">
                  <motion.div className="absolute top-0 left-0 h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                    animate={{ width: `${(formStep - 1) / 3 * 100}%` }} transition={{ duration: 0.4 }} />
                </div>
              </div>

              <div className="p-8">
                <AnimatePresence mode="wait">
                  {formStep === 1 && (
                    <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                      <h3 className="text-xl font-black text-gray-900 dark:text-white mb-6">
                        {isEn ? 'Your personal information' : 'Vos informations personnelles'}
                      </h3>
                      {[
                        { name: 'fullName', label: isEn ? 'Full name *' : 'Nom complet *', type: 'text', placeholder: 'Ex : Jean-Pierre Mballa' },
                        { name: 'email', label: isEn ? 'Email address *' : 'Adresse email *', type: 'email', placeholder: 'jean@exemple.cm' },
                        { name: 'phone', label: isEn ? 'Phone (WhatsApp) *' : 'Téléphone (WhatsApp) *', type: 'tel', placeholder: '+237 6XX XXX XXX' },
                      ].map(f => (
                        <div key={f.name}>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{f.label}</label>
                          <input type={f.type} name={f.name} value={formData[f.name as keyof typeof formData] as string} onChange={handleInput} placeholder={f.placeholder}
                            className="w-full px-4 py-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all" />
                        </div>
                      ))}
                    </motion.div>
                  )}

                  {formStep === 2 && (
                    <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                      <h3 className="text-xl font-black text-gray-900 dark:text-white mb-6">
                        {isEn ? 'Eligibility Requirements' : "Conditions d'éligibilité"}
                      </h3>
                      <div className={`rounded-2xl p-5 border-2 transition-all ${formData.isMember ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-400' : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'}`}>
                        <label className="flex items-start gap-4 cursor-pointer">
                          <input type="checkbox" name="isMember" checked={formData.isMember} onChange={handleInput} className="mt-0.5 w-5 h-5 rounded text-emerald-500 cursor-pointer flex-shrink-0" />
                          <div>
                            <span className="font-black text-gray-900 dark:text-white block mb-1">
                              {isEn ? "Member of an approved cooperative" : "Membre d'une coopérative agréée"}
                            </span>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {isEn
                                ? "I certify that I am a member of a cooperative recognised by MINADER"
                                : "Je certifie être adhérent d'une coopérative reconnue par le MINADER"}
                            </span>
                          </div>
                        </label>
                      </div>
                      {formData.isMember && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            {isEn ? 'Cooperative Name' : 'Nom de la coopérative'}
                          </label>
                          <input type="text" name="cooperativeName" value={formData.cooperativeName} onChange={handleInput} placeholder="Ex : COOP Agritech Yaoundé"
                            className="w-full px-4 py-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all" />
                        </motion.div>
                      )}
                      <div className={`rounded-2xl p-5 border-2 transition-all ${formData.hasInsurance ? 'bg-teal-50 dark:bg-teal-950/20 border-teal-400' : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'}`}>
                        <label className="flex items-start gap-4 cursor-pointer">
                          <input type="checkbox" name="hasInsurance" checked={formData.hasInsurance} onChange={handleInput} className="mt-0.5 w-5 h-5 rounded text-teal-500 cursor-pointer flex-shrink-0" />
                          <div>
                            <span className="font-black text-gray-900 dark:text-white block mb-1">
                              {isEn ? "Member of an agricultural mutual fund" : "Adhérent à une mutuelle agricole"}
                            </span>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {isEn
                                ? "I am insured with an approved mutual fund (CICAN, CAMAO, etc.)"
                                : "Je suis assuré auprès d'une caisse mutuelle agréée (CICAN, CAMAO, etc.)"}
                            </span>
                          </div>
                        </label>
                      </div>
                      {formData.hasInsurance && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                          <label htmlFor="ins" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            {isEn ? 'Insurance Organisation' : "Organisme d'assurance"}
                          </label>
                          <select id="ins" name="insuranceProvider" value={formData.insuranceProvider} onChange={handleInput}
                            className="w-full px-4 py-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all">
                            <option value="">{isEn ? '-- Select --' : '-- Sélectionner --'}</option>
                            <option value="CICAN">CICAN</option>
                            <option value="CAMAO">CAMAO</option>
                            <option value="AUTRE">{isEn ? 'Other approved organisation' : 'Autre organisme agréé'}</option>
                          </select>
                        </motion.div>
                      )}
                      {eligibilityMsg && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                          className={`rounded-xl p-4 flex items-center gap-3 ${eligibilityMsg.ok ? 'bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/30' : 'bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/30'}`}>
                          {eligibilityMsg.ok ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <AlertCircle className="w-5 h-5 text-red-500" />}
                          <span className={`text-sm font-semibold ${eligibilityMsg.ok ? 'text-emerald-700 dark:text-emerald-300' : 'text-red-700 dark:text-red-300'}`}>{eligibilityMsg.text}</span>
                        </motion.div>
                      )}
                    </motion.div>
                  )}

                  {formStep === 3 && (
                    <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                      <h3 className="text-xl font-black text-gray-900 dark:text-white mb-6">
                        {isEn ? 'Your Order' : 'Votre commande'}
                      </h3>
                      <div>
                        <p className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                          {isEn ? 'Fertilizer Type *' : "Type d'engrais *"}
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                          {[
                            { value: 'mineral', label: isEn ? 'Mineral Fertilizers' : 'Engrais Minéraux', sub: `${MINERAL_PRICE.toLocaleString('fr-FR')} FCFA/${isEn ? 'bag' : 'sac'}`, icon: Sprout },
                            { value: 'bio', label: isEn ? 'Biofertilizers' : 'Biofertilisants', sub: `${BIO_PRICE.toLocaleString('fr-FR')} FCFA/L`, icon: Leaf },
                          ].map(({ value, label, sub, icon: Icon }) => (
                            <label key={value} className={`cursor-pointer rounded-2xl border-2 p-4 transition-all ${formData.productType === value ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20' : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'}`}>
                              <input type="radio" name="productType" value={value} checked={formData.productType === value} onChange={handleInput} className="sr-only" />
                              <Icon className={`w-7 h-7 mb-2 ${formData.productType === value ? 'text-emerald-500' : 'text-gray-400'}`} />
                              <p className={`font-black text-sm ${formData.productType === value ? 'text-emerald-700 dark:text-emerald-300' : 'text-gray-700 dark:text-gray-300'}`}>{label}</p>
                              <p className="text-xs text-gray-500 mt-0.5">{sub}</p>
                            </label>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label htmlFor="qty" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          {isEn ? 'Quantity' : 'Quantité'} ({formData.productType === 'mineral' ? (isEn ? '50kg bags' : 'sacs de 50kg') : (isEn ? 'liters' : 'litres')}) *
                        </label>
                        <input id="qty" type="number" name="quantity" value={formData.quantity} onChange={handleInput} min={6}
                          className="w-full px-4 py-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all" />
                        <p className="text-xs text-gray-400 mt-1.5">
                          {isEn ? 'Minimum: 6 units' : 'Minimum : 6 unités'}
                        </p>
                      </div>
                      {formData.quantity >= 6 && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/30 rounded-2xl p-5">
                          <p className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-3">
                            {isEn ? 'Estimated Summary' : 'Récapitulatif estimatif'}
                          </p>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">{formData.quantity} × {(formData.productType === 'mineral' ? MINERAL_PRICE : BIO_PRICE).toLocaleString('fr-FR')} FCFA</span>
                              <span className="font-black text-gray-900 dark:text-white">{(formData.quantity * (formData.productType === 'mineral' ? MINERAL_PRICE : BIO_PRICE)).toLocaleString('fr-FR')} FCFA</span>
                            </div>
                            <div className="flex justify-between text-emerald-600">
                              <span>{isEn ? 'Delivery' : 'Livraison'}</span>
                              <span className="font-black">{isEn ? 'FREE' : 'GRATUITE'}</span>
                            </div>
                            <div className="flex justify-between text-amber-700 dark:text-amber-300 font-bold pt-2 border-t border-amber-200 dark:border-amber-800/30">
                              <span>{isEn ? 'Savings' : 'Économies'}</span>
                              <span>+{(formData.quantity * (formData.productType === 'mineral' ? MINERAL_ORIGINAL - MINERAL_PRICE : BIO_ORIGINAL - BIO_PRICE)).toLocaleString('fr-FR')} FCFA</span>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  )}

                  {formStep === 4 && (
                    <motion.div key="s4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                      <h3 className="text-xl font-black text-gray-900 dark:text-white mb-6">
                        {isEn ? 'Final Summary' : 'Récapitulatif final'}
                      </h3>
                      <div className="space-y-3 mb-8">
                        {[
                          { label: isEn ? 'Name' : 'Nom', value: formData.fullName },
                          { label: 'Email', value: formData.email },
                          { label: isEn ? 'Phone' : 'Téléphone', value: formData.phone },
                          { label: isEn ? 'Cooperative' : 'Coopérative', value: formData.cooperativeName || '—' },
                          { label: isEn ? 'Insurance' : 'Assurance', value: formData.insuranceProvider || '—' },
                          { label: isEn ? 'Product' : 'Produit', value: formData.productType === 'mineral' ? (isEn ? 'Mineral Fertilizers' : 'Engrais Minéraux') : (isEn ? 'Biofertilizers' : 'Biofertilisants') },
                          { label: isEn ? 'Quantity' : 'Quantité', value: `${formData.quantity} ${formData.productType === 'mineral' ? (isEn ? 'bags' : 'sacs') : (isEn ? 'liters' : 'litres')}` },
                          { label: isEn ? 'Estimated amount' : 'Montant estimé', value: `${(formData.quantity * (formData.productType === 'mineral' ? MINERAL_PRICE : BIO_PRICE)).toLocaleString('fr-FR')} FCFA` },
                        ].map(({ label, value }) => (
                          <div key={label} className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-white/[0.05] last:border-0">
                            <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
                            <span className="text-sm font-bold text-gray-900 dark:text-white">{value}</span>
                          </div>
                        ))}
                      </div>
                      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/30 rounded-2xl p-4 mb-4">
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          {isEn ? (
                            <><strong>Note:</strong> Our team will contact you within 24 hours via WhatsApp (+237 676 026 601) to confirm your order and provide the Campost account number (AGRIPOINT SERVICES SAS) for the 70% payment.</>
                          ) : (
                            <><strong>Note :</strong> Notre équipe vous contactera sous 24h via WhatsApp (+237 676 026 601) pour confirmer votre commande et vous communiquer le numéro de compte Campost (AGRIPOINT SERVICES SAS) pour le versement des 70%.</>
                          )}
                        </p>
                      </div>
                      <CampostPaymentInfo
                        variant="full"
                        amount70={Math.round(formData.quantity * (formData.productType === 'mineral' ? MINERAL_PRICE : BIO_PRICE) * 0.7)}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex gap-4 mt-8">
                  {formStep > 1 && (
                    <button onClick={() => setFormStep(s => s - 1)}
                      className="flex items-center gap-2 px-6 py-3.5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <ChevronDown className="w-4 h-4 rotate-90" /> {isEn ? 'Back' : 'Retour'}
                    </button>
                  )}
                  <button onClick={formStep < 4 ? nextStep : handleSubmit} disabled={formSubmitting}
                    className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:opacity-60 text-white font-black rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/20 hover:-translate-y-0.5 disabled:translate-y-0">
                    {formSubmitting ? (
                      <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> {isEn ? 'Sending…' : 'Envoi en cours…'}</>
                    ) : formStep < 4 ? (
                      <>{isEn ? 'Continue' : 'Continuer'} <ChevronRight className="w-5 h-5" /></>
                    ) : (
                      <><CheckCircle2 className="w-5 h-5" /> {isEn ? 'Confirm Registration' : "Confirmer l\u2019inscription"}</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════
          TÉMOIGNAGES
      ══════════════════════════════════════════ */}
      <section className="py-24 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-600 font-bold mb-3">
              {isEn ? 'Testimonials' : 'Témoignages'}
            </p>
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white mb-4">
              {isEn ? 'They Participated' : 'Ils ont participé'}
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              {isEn
                ? "Feedback from farmers who have already benefited from the programme."
                : "Retours d\u2019expérience d\u2019agriculteurs ayant déjà bénéficié du programme."}
            </p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((t, i) => (
              <motion.div key={t.name} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="bg-white dark:bg-gray-950 rounded-3xl p-7 shadow-sm border border-gray-100 dark:border-white/[0.06] hover:shadow-xl transition-shadow duration-300">
                <div className="flex gap-1 mb-5">
                  {Array(t.rating).fill(0).map((_, j) => <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6 text-sm">&ldquo;{t.text}&rdquo;</p>
                <div className="pt-4 border-t border-gray-100 dark:border-white/[0.06] flex items-center justify-between">
                  <div>
                    <p className="font-black text-gray-900 dark:text-white text-sm">{t.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{t.role} — {t.region}</p>
                  </div>
                  <div className={`bg-gradient-to-br ${t.color} px-3 py-1.5 rounded-xl`}>
                    <span className="text-white text-xs font-black whitespace-nowrap">{t.savings}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FAQ
      ══════════════════════════════════════════ */}
      <section className="py-24 bg-white dark:bg-gray-950">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-600 font-bold mb-3">
              {isEn ? 'Frequently Asked Questions' : 'Questions fréquentes'}
            </p>
            <h2 className="text-4xl font-black text-gray-900 dark:text-white">
              {isEn ? 'Everything About the Campaign' : 'Tout savoir sur la campagne'}
            </h2>
          </motion.div>
          <div className="space-y-3">
            {FAQ_ITEMS.map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                className="bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-white/[0.06] rounded-2xl overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors">
                  <span className="font-bold text-gray-900 dark:text-white text-sm pr-4">{item.q}</span>
                  <motion.div animate={{ rotate: openFaq === i ? 180 : 0 }} transition={{ duration: 0.2 }} className="flex-shrink-0">
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}>
                      <div className="px-6 pb-6 text-gray-600 dark:text-gray-400 text-sm leading-relaxed border-t border-gray-100 dark:border-white/[0.05] pt-4">
                        {item.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          CTA FINAL
      ══════════════════════════════════════════ */}
      <section className="py-24 bg-gradient-to-br from-emerald-950 via-green-950 to-teal-950 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] [background-image:linear-gradient(#fff_1px,transparent_1px),linear-gradient(90deg,#fff_1px,transparent_1px)] [background-size:60px_60px]" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-teal-600/10 rounded-full blur-3xl" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
            <div className="flex flex-wrap gap-4 justify-center mb-12">
              {trustBadges.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 bg-white/10 border border-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                  <Icon className="w-4 h-4 text-emerald-400" />
                  <span className="text-white/80 text-xs font-semibold">{text}</span>
                </div>
              ))}
            </div>
            <h2 className="text-5xl sm:text-6xl font-black text-white mb-6 leading-tight">
              {isEn ? (
                <>
                  {"Don't miss"}
                  <span className="block text-amber-400">this opportunity</span>
                </>
              ) : (
                <>
                  Ne manquez pas
                  <span className="block text-amber-400">cette opportunité</span>
                </>
              )}
            </h2>
            <p className="text-emerald-100/70 text-xl mb-12 max-w-2xl mx-auto leading-relaxed">
              {isEn ? (
                <>
                  The campaign ends on <strong className="text-amber-300">March 31, 2026</strong>.
                  Register now to secure your subsidised fertilizers before the deadline.
                </>
              ) : (
                <>
                  La campagne prend fin le <strong className="text-amber-300">31 mars 2026</strong>.
                  Inscrivez-vous maintenant pour assurer vos engrais subventionnés avant clôture.
                </>
              )}
            </p>
            <div className="flex flex-wrap gap-5 justify-center mb-16">
              <a href="#formulaire" className="group flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-gray-900 font-black text-lg px-10 py-5 rounded-2xl transition-all duration-200 shadow-2xl shadow-amber-400/30 hover:shadow-amber-400/50 hover:-translate-y-1">
                {isEn ? 'Join Now' : 'Participer maintenant'} <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </a>
              <a href="tel:+237651920920" className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-base px-8 py-5 rounded-2xl transition-all backdrop-blur-sm hover:-translate-y-1">
                <Phone className="w-5 h-5" /> {isEn ? 'Call Us' : 'Nous appeler'}
              </a>
            </div>
            <div className="flex flex-wrap gap-8 justify-center">
              {[
                { icon: Phone, label: '+237 651 92 09 20', href: 'tel:+237651920920' },
                { icon: Mail, label: 'campagne@agri-point.cm', href: 'mailto:campagne@agri-point.cm' },
                { icon: MapPin, label: isEn ? 'Yaoundé, Cameroon' : 'Yaoundé, Cameroun', href: '#' },
              ].map(({ icon: Icon, label, href }) => (
                <a key={label} href={href} className="flex items-center gap-2 text-emerald-300/70 hover:text-emerald-300 transition-colors text-sm">
                  <Icon className="w-4 h-4" /> {label}
                </a>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
