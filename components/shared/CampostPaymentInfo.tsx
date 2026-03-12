'use client';

import Link from 'next/link';
import { MapPin, Clock, CreditCard, AlertCircle, ExternalLink, CheckCircle2, FileText } from 'lucide-react';
import { CAMPOST_ACCOUNT, getBureauxPrincipaux } from '@/lib/campost-points';
import { useLanguage } from '@/contexts/LanguageContext';

interface CampostPaymentInfoProps {
  /** Montant 70% à verser (optionnel — si fourni, affiche le calcul) */
  amount70?: number;
  /** Numéro de commande (optionnel — pour afficher la référence) */
  orderNumber?: string;
  /** Mode d'affichage : compact (panier/checkout) ou full (page dédiée) */
  variant?: 'compact' | 'full';
}

export default function CampostPaymentInfo({
  amount70,
  orderNumber,
  variant = 'compact',
}: CampostPaymentInfoProps) {
  const { locale } = useLanguage();
  const en = locale === 'en';

  const bureauxPrincipaux = getBureauxPrincipaux().slice(0, 4); // 4 capitales régionales clés

  const isAccountReady = CAMPOST_ACCOUNT.accountNumber !== 'À COMPLÉTER';

  const steps = [
    {
      num: '01',
      text: en
        ? 'Go to the nearest Campost office'
        : 'Rendez-vous au bureau Campost le plus proche de chez vous',
    },
    {
      num: '02',
      text: en
        ? `Request a transfer to the account ${CAMPOST_ACCOUNT.accountName}`
        : `Demandez un versement sur le compte ${CAMPOST_ACCOUNT.accountName}`,
    },
    {
      num: '03',
      text: isAccountReady
        ? en
          ? `Provide the account number: ${CAMPOST_ACCOUNT.accountNumber}`
          : `Indiquez le numéro de compte : ${CAMPOST_ACCOUNT.accountNumber}`
        : en
          ? 'Provide the account number (communicated by our team)'
          : "Indiquez le numéro de compte (communiqué par notre équipe)",
    },
    {
      num: '04',
      text: en
        ? 'Mention your order number as the mandatory reference'
        : 'Mentionnez votre numéro de commande comme référence obligatoire',
    },
    {
      num: '05',
      text: en
        ? 'Photograph and send the receipt to our team via WhatsApp (+237 676 026 601)'
        : 'Photographiez et envoyez le reçu à notre équipe via WhatsApp (+237 676 026 601)',
    },
  ];

  return (
    <div className="rounded-2xl border border-emerald-200 dark:border-emerald-800/40 bg-emerald-50/60 dark:bg-emerald-950/20 overflow-hidden">

      {/* Header */}
      <div className="bg-emerald-700 dark:bg-emerald-900 px-5 py-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
          <CreditCard className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-white text-sm">
            {en ? 'Payment via Campost' : 'Paiement via Campost'}
          </h3>
          <p className="text-emerald-200 text-xs mt-0.5">
            {en ? 'Bank transfer at post office – 10 regions of Cameroon' : 'Versement en bureau de poste – 10 régions du Cameroun'}
          </p>
        </div>
      </div>

      <div className="p-5 space-y-5">

        {/* Compte destinataire */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-emerald-100 dark:border-emerald-800/30 p-4">
          <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-3">
            {en ? 'Recipient account' : 'Compte destinataire'}
          </p>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {en ? 'Account holder' : 'Titulaire du compte'}
              </span>
              <span className="text-sm font-bold text-gray-900 dark:text-white">{CAMPOST_ACCOUNT.accountName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {en ? 'Account no.' : 'N° de compte'}
              </span>
              {isAccountReady ? (
                <span className="text-sm font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1 rounded-lg">
                  {CAMPOST_ACCOUNT.accountNumber}
                </span>
              ) : (
                <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {en ? 'Reference' : 'Communication prochaine'}
                </span>
              )}
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {en ? 'Institution' : 'Établissement'}
              </span>
              <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{CAMPOST_ACCOUNT.bank}</span>
            </div>
            {orderNumber && (
              <div className="flex justify-between items-center pt-2 border-t border-gray-100 dark:border-gray-800">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {en ? 'Reference to provide' : 'Référence à mentionner'}
                </span>
                <span className="text-sm font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-lg">
                  {orderNumber}
                </span>
              </div>
            )}
            {amount70 && (
              <div className="flex justify-between items-center pt-2 border-t border-gray-100 dark:border-gray-800 bg-amber-50 dark:bg-amber-900/20 rounded-lg px-3 py-2 -mx-1">
                <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                  {en ? 'Amount to pay (70%)' : 'Montant à verser (70%)'}
                </span>
                <span className="text-base font-black text-amber-700 dark:text-amber-400">
                  {amount70.toLocaleString('fr-FR')} FCFA
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Étapes de paiement */}
        <div>
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
            {en ? 'How to proceed?' : 'Comment procéder ?'}
          </p>
          <ol className="space-y-2.5">
            {steps.map(({ num, text }) => (
              <li key={num} className="flex gap-3 items-start">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 text-xs font-black flex items-center justify-center">
                  {num}
                </span>
                <span className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{text}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Note délégués agricoles */}
        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/30 rounded-xl p-3.5 flex gap-2.5">
          <FileText className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
            {en ? (
              <><strong>Weekly reporting:</strong> Agricultural delegates from each district and focal points submit a flow report to AGRIPOINT SERVICES every week.</>
            ) : (
              <><strong>Reporting hebdomadaire :</strong> Les délégués d&apos;agriculture de chaque arrondissement et points focaux transmettent un rapport des flux à AGRIPOINT SERVICES chaque semaine.</>
            )}
          </p>
        </div>

        {variant === 'full' && (
          <>
            {/* Bureaux principaux */}
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                {en ? 'Main offices (regional capitals)' : 'Bureaux principaux (chefs-lieux régionaux)'}
              </p>
              <div className="grid sm:grid-cols-2 gap-2">
                {bureauxPrincipaux.map((point) => (
                  <div key={point.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-3">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white leading-snug">{point.ville}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{point.adresse}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <Clock className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-500 dark:text-gray-400">{point.horaires.split('|')[0]}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Lien vers tous les points */}
        <Link
          href="/points-campost"
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400 text-sm font-semibold hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
        >
          <MapPin className="w-4 h-4" />
          {en ? 'Find the nearest Campost office' : 'Trouver le bureau Campost le plus proche'}
          <ExternalLink className="w-3.5 h-3.5 opacity-60" />
        </Link>

        {/* Confirmation */}
        <div className="flex items-start gap-2.5 pt-1">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
            {en ? (
              <>Your order will be confirmed within <strong>24h</strong> of receipt and validation of the payment receipt by our team.</>
            ) : (
              <>Votre commande sera confirmée dans les <strong>24h</strong> après réception et validation du reçu de paiement par notre équipe.</>
            )}
          </p>
        </div>

      </div>
    </div>
  );
}
