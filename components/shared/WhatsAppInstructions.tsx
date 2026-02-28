import { motion } from 'framer-motion';
import { Smartphone, Send, Clock, AlertCircle } from 'lucide-react';

interface WhatsAppInstructionsProps {
  orderNumber: string;
  amount: number;
}

export default function WhatsAppInstructions({ orderNumber, amount }: WhatsAppInstructionsProps) {
  
  const shareOnWhatsApp = () => {
    const whatsappNumber = '237657393939';
    const message = `Bonjour, j'ai effectué un paiement Mobile Money de ${amount.toLocaleString('fr-FR')} F CFA pour la commande ${orderNumber}. Je m'apprête à vous envoyer la capture d'écran de confirmation.`;
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl shadow-xl p-8 mb-6 text-white"
    >
      <div className="flex items-center gap-3 mb-6">
        <Smartphone className="w-8 h-8" />
        <h2 className="text-2xl font-bold">Instructions de Paiement Mobile Money</h2>
      </div>

      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-6">
        <div className="space-y-3 text-white/90">
          <div className="flex justify-between items-center py-2 border-b border-white/20">
            <span className="font-medium">Montant à payer:</span>
            <span className="text-2xl font-bold text-yellow-300">
              {amount.toLocaleString('fr-FR')} F CFA
            </span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="font-medium">Référence de commande:</span>
            <span className="font-mono font-bold">{orderNumber}</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-bold text-lg mb-3">📱 Étapes à Suivre:</h3>
        
        {/* Étape 1 */}
        <div className="flex gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4">
          <div className="flex-shrink-0 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center font-bold">
            1
          </div>
          <div className="flex-1">
            <p className="font-semibold mb-2">Effectuer le paiement Mobile Money</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
              <div className="bg-orange-500/30 rounded-lg p-3">
                <p className="font-semibold text-sm mb-1">🟠 Orange Money</p>
                <p className="text-sm">Composez <span className="font-mono font-bold">#150#</span></p>
              </div>
              <div className="bg-yellow-500/30 rounded-lg p-3">
                <p className="font-semibold text-sm mb-1">🟡 MTN Mobile Money</p>
                <p className="text-sm">Composez <span className="font-mono font-bold">*126#</span></p>
              </div>
            </div>
            <p className="text-sm text-white/80 mt-2">
              ℹ️ Le numéro du compte bénéficiaire vous sera communiqué par email et SMS dans les prochaines minutes.
            </p>
          </div>
        </div>

        {/* Étape 2 */}
        <div className="flex gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4">
          <div className="flex-shrink-0 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center font-bold">
            2
          </div>
          <div className="flex-1">
            <p className="font-semibold mb-2">Prendre une capture d'écran</p>
            <p className="text-white/90 text-sm">
              Dès réception du SMS de confirmation de votre opérateur, prenez une <strong>capture d'écran claire</strong> montrant :
            </p>
            <ul className="text-sm text-white/80 list-disc list-inside mt-2 ml-2 space-y-1">
              <li>Le montant payé</li>
              <li>La date et l'heure</li>
              <li>Le numéro de transaction</li>
              <li>Le numéro bénéficiaire</li>
            </ul>
          </div>
        </div>

        {/* Étape 3 */}
        <div className="flex gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4">
          <div className="flex-shrink-0 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center font-bold">
            3
          </div>
          <div className="flex-1">
            <p className="font-semibold mb-2">Envoyer sur WhatsApp</p>
            <p className="text-white/90 text-sm mb-3">
              Cliquez sur le bouton ci-dessous pour ouvrir WhatsApp, puis envoyez votre capture d'écran avec le numéro de commande <span className="font-mono font-bold">{orderNumber}</span>.
            </p>
            <button
              onClick={shareOnWhatsApp}
              className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-white text-emerald-600 rounded-lg font-semibold hover:bg-emerald-50 transition-colors shadow-lg"
            >
              <Send className="w-5 h-5" />
              <span>Envoyer sur WhatsApp +237 657 39 39 39</span>
            </button>
          </div>
        </div>

        {/* Étape 4 */}
        <div className="flex gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4">
          <div className="flex-shrink-0 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center font-bold">
            4
          </div>
          <div className="flex-1">
            <p className="font-semibold mb-2">Uploader également sur cette page</p>
            <p className="text-white/90 text-sm">
              Pour accélérer le traitement, uploadez aussi votre capture dans la section ci-dessous.
            </p>
          </div>
        </div>
      </div>

      {/* Délai de validation */}
      <div className="mt-6 bg-blue-500/30 backdrop-blur-sm rounded-lg p-4 flex items-start gap-3">
        <Clock className="w-6 h-6 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold mb-1">Validation sous 2 heures</p>
          <p className="text-sm text-white/90">
            Votre paiement sera validé dans un délai maximum de 2 heures pendant nos horaires d'ouverture (Lun-Sam, 7h30-18h30). 
            Vous recevrez une notification par email et SMS dès validation.
          </p>
        </div>
      </div>

      {/* Alerte importante */}
      <div className="mt-4 bg-amber-500/30 backdrop-blur-sm rounded-lg p-4 flex items-start gap-3">
        <AlertCircle className="w-6 h-6 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold mb-1">⚠️ Important</p>
          <p className="text-sm text-white/90">
            Sans la capture d'écran de confirmation, nous ne pourrons pas valider votre paiement. 
            Assurez-vous que l'image est <strong>claire et lisible</strong>.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
