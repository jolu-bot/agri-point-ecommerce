'use client';

import { Smartphone, Send, CheckCircle2, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

interface WhatsAppPaymentInfoProps {
  variant?: 'full' | 'compact';
  orderNumber?: string;
  amount?: number;
}

export default function WhatsAppPaymentInfo({ 
  variant = 'full',
  orderNumber,
  amount 
}: WhatsAppPaymentInfoProps) {
  
  const whatsappNumber = '237657393939';
  const displayNumber = '+237 657 39 39 39';

  const handleWhatsAppClick = () => {
    const message = orderNumber && amount
      ? `Bonjour, j'ai effectué un paiement Mobile Money de ${amount.toLocaleString('fr-FR')} F CFA pour la commande ${orderNumber}. Je vous envoie la capture d'écran de confirmation.`
      : `Bonjour, je souhaite effectuer un paiement Mobile Money pour ma commande AGRIPOINT SERVICES.`;
    
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  if (variant === 'compact') {
    return (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-6 border border-emerald-200 dark:border-emerald-800"
      >
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <Smartphone className="w-8 h-8 text-emerald-600" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
              Paiement Mobile Money + WhatsApp
            </h4>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
              Après avoir passé la commande, vous recevrez les instructions détaillées pour effectuer votre paiement Mobile Money et envoyer la confirmation.
            </p>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span className="text-gray-700 dark:text-gray-300">Validation rapide sous 2h</span>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700"
    >
      <div className="flex items-center gap-3 mb-6">
        <Smartphone className="w-10 h-10 text-emerald-600" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Instructions de Paiement Mobile Money
        </h2>
      </div>

      {orderNumber && amount && (
        <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Numéro de commande</p>
              <p className="text-lg font-bold text-primary-600 dark:text-primary-400">{orderNumber}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Montant à payer</p>
              <p className="text-lg font-bold text-primary-600 dark:text-primary-400">
                {amount.toLocaleString('fr-FR')} F CFA
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Étape 1 : Choisir le service */}
        <div className="flex gap-4">
          <div className="flex-shrink-0 w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full flex items-center justify-center font-bold">
            1
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              Effectuer le paiement Mobile Money
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="border border-orange-300 dark:border-orange-700 rounded-lg p-4 bg-orange-50 dark:bg-orange-900/20">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    OM
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-white">Orange Money</span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Composez <span className="font-mono font-bold">#150#</span> depuis votre téléphone Orange
 et suivez les instructions.
                </p>
              </div>
              
              <div className="border border-yellow-400 dark:border-yellow-700 rounded-lg p-4 bg-yellow-50 dark:bg-yellow-900/20">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    MM
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-white">MTN Mobile Money</span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Composez <span className="font-mono font-bold">*126#</span> depuis votre téléphone MTN
 et suivez les instructions.
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
              💡 <strong>Numéro bénéficiaire :</strong> Vous recevrez le numéro de compte par email/SMS après validation de votre commande.
            </p>
          </div>
        </div>

        {/* Étape 2 : Capture d'écran */}
        <div className="flex gap-4">
          <div className="flex-shrink-0 w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full flex items-center justify-center font-bold">
            2
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              Prendre une capture d'écran
            </h3>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
              Une fois le paiement effectué, vous recevrez un SMS de confirmation de votre opérateur (Orange ou MTN).  
              Prenez une <strong>capture d'écran claire</strong> du SMS ou de l'historique de transaction montrant :
            </p>
            <ul className="text-sm text-gray-700 dark:text-gray-300 list-disc list-inside space-y-1 ml-4">
              <li>Le montant exact payé</li>
              <li>La date et l'heure de la transaction</li>
              <li>Le numéro de transaction</li>
              <li>Le numéro bénéficiaire</li>
            </ul>
          </div>
        </div>

        {/* Étape 3 : Envoyer sur WhatsApp */}
        <div className="flex gap-4">
          <div className="flex-shrink-0 w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full flex items-center justify-center font-bold">
            3
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              Envoyer la capture sur WhatsApp
            </h3>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
              Envoyez la capture d'écran sur notre WhatsApp avec votre <strong>numéro de commande</strong>.
            </p>
            
            <button
              onClick={handleWhatsAppClick}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-md hover:shadow-lg"
            >
              <Send className="w-5 h-5" />
              <span>Envoyer sur WhatsApp {displayNumber}</span>
            </button>
          </div>
        </div>

        {/* Étape 4 : Validation */}
        <div className="flex gap-4">
          <div className="flex-shrink-0 w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full flex items-center justify-center font-bold">
            4
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              Validation et livraison
            </h3>
            <div className="flex items-start gap-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <Clock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                  <strong>Validation sous 2 heures</strong> (pendant les horaires d'ouverture : Lun-Sam, 7h30-18h30)
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Une fois votre paiement validé, votre commande passe en préparation et vous recevrez une notification par email et SMS.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
        <p className="text-sm text-amber-900 dark:text-amber-200">
          <strong>⚠️ Important :</strong> Sans la capture d'écran de confirmation, nous ne pourrons pas valider votre paiement.  
          Assurez-vous que l'image est claire et lisible.
        </p>
      </div>
    </motion.div>
  );
}
