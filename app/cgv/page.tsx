import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, FileText, ShoppingCart, Truck, CreditCard, RotateCcw, AlertTriangle, Shield } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Conditions Générales de Vente - AGRI POINT SERVICE',
  description: 'Conditions générales de vente des produits et services AGRI POINT SERVICE',
};

export default function CGVPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Retour */}
        <Link 
          href="/" 
          className="inline-flex items-center text-primary-600 hover:text-primary-700 dark:text-primary-400 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour à l&apos;accueil
        </Link>

        {/* En-tête */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Conditions Générales de Vente</h1>
              <p className="text-gray-600 dark:text-gray-400">En vigueur au 16 décembre 2024</p>
            </div>
          </div>
          <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-4">
            <p className="text-gray-700 dark:text-gray-300">
              <strong className="text-gray-900 dark:text-white">Important :</strong> Les présentes Conditions Générales de Vente (CGV) régissent toutes les ventes de produits et services effectuées sur le site www.agri-ps.com. Toute commande implique l&apos;acceptation sans réserve des présentes CGV.
            </p>
          </div>
        </div>

        {/* Contenu */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 space-y-8">
          {/* Article 1 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Article 1 - Objet</h2>
            <div className="space-y-3 text-gray-600 dark:text-gray-300">
              <p>
                Les présentes CGV ont pour objet de définir les droits et obligations des parties dans le cadre de la vente en ligne de produits agricoles (biofertilisants, engrais, semences, kits de culture) et de services proposés par AGRI POINT SERVICE SAS.
              </p>
              <p>
                Ces CGV s&apos;appliquent à l&apos;exclusion de toutes autres conditions, notamment celles applicables pour les ventes en magasin ou au moyen d&apos;autres circuits de distribution et de commercialisation.
              </p>
            </div>
          </section>

          {/* Article 2 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Article 2 - Identité du Vendeur</h2>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 space-y-2 text-gray-600 dark:text-gray-300">
              <p><strong className="text-gray-900 dark:text-white">Raison sociale :</strong> AGRI POINT SERVICE SAS</p>
              <p><strong className="text-gray-900 dark:text-white">Siège social :</strong> B.P. 5111 Yaoundé, Quartier Fouda, Cameroun</p>
              <p><strong className="text-gray-900 dark:text-white">Capital social :</strong> 10 000 000 FCFA</p>
              <p><strong className="text-gray-900 dark:text-white">RC :</strong> RC/YAO/2023/B/XXXX</p>
              <p><strong className="text-gray-900 dark:text-white">Email :</strong> <a href="mailto:infos@agri-ps.com" className="text-primary-600 hover:text-primary-700">infos@agri-ps.com</a></p>
              <p><strong className="text-gray-900 dark:text-white">Téléphone :</strong> <a href="tel:+237657393939" className="text-primary-600 hover:text-primary-700">+237 657 39 39 39</a></p>
            </div>
          </section>

          {/* Article 3 */}
          <section>
            <div className="flex items-center space-x-3 mb-4">
              <ShoppingCart className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Article 3 - Commandes</h2>
            </div>
            <div className="space-y-4 text-gray-600 dark:text-gray-300">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">3.1 - Processus de commande</h3>
                <p>
                  Pour passer commande, le Client doit :
                </p>
                <ol className="list-decimal list-inside space-y-1 ml-4 mt-2">
                  <li>Sélectionner les produits et les ajouter au panier</li>
                  <li>Vérifier le contenu de son panier</li>
                  <li>Créer un compte ou se connecter</li>
                  <li>Renseigner les informations de livraison et de facturation</li>
                  <li>Choisir le mode de livraison</li>
                  <li>Sélectionner le mode de paiement</li>
                  <li>Accepter les présentes CGV</li>
                  <li>Confirmer la commande et procéder au paiement</li>
                </ol>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">3.2 - Confirmation de commande</h3>
                <p>
                  Une fois la commande validée, un email de confirmation contenant le récapitulatif de la commande et un numéro de suivi est envoyé au Client. La vente n&apos;est définitive qu&apos;après confirmation du paiement.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">3.3 - Modification et annulation</h3>
                <p>
                  Toute modification ou annulation de commande doit être effectuée dans les 24 heures suivant la validation, en contactant notre service client. Passé ce délai, la commande ne pourra plus être modifiée ou annulée.
                </p>
              </div>
            </div>
          </section>

          {/* Article 4 */}
          <section>
            <div className="flex items-center space-x-3 mb-4">
              <CreditCard className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Article 4 - Prix et Paiement</h2>
            </div>
            <div className="space-y-4 text-gray-600 dark:text-gray-300">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">4.1 - Prix</h3>
                <p>
                  Les prix sont indiqués en Francs CFA (FCFA), toutes taxes comprises (TTC). AGRI POINT SERVICE se réserve le droit de modifier ses prix à tout moment, mais les produits seront facturés sur la base des tarifs en vigueur au moment de la validation de la commande.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">4.2 - Moyens de paiement acceptés</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Mobile Money (MTN Mobile Money, Orange Money)</li>
                  <li>Virement bancaire</li>
                  <li>Paiement à la livraison (cash)</li>
                  <li>Carte bancaire (Visa, Mastercard)</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">4.3 - Sécurité des paiements</h3>
                <p>
                  Toutes les transactions sont sécurisées. Les données bancaires ne sont jamais stockées sur nos serveurs. Les paiements en ligne sont traités par des prestataires certifiés PCI-DSS.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">4.4 - Frais de livraison</h3>
                <p>
                  Les frais de livraison sont calculés en fonction de la zone de livraison et du poids total de la commande. Ils sont clairement indiqués avant la validation de la commande.
                </p>
                <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-3 mt-2">
                  <p className="font-semibold text-gray-900 dark:text-white">Livraison gratuite pour toute commande supérieure à 50 000 FCFA dans la ville de Yaoundé.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Article 5 */}
          <section>
            <div className="flex items-center space-x-3 mb-4">
              <Truck className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Article 5 - Livraison</h2>
            </div>
            <div className="space-y-4 text-gray-600 dark:text-gray-300">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">5.1 - Zones de livraison</h3>
                <p>
                  Nous livrons dans tout le Cameroun. Des frais supplémentaires peuvent s&apos;appliquer pour les zones éloignées.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">5.2 - Délais de livraison</h3>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 space-y-2">
                  <p><strong className="text-gray-900 dark:text-white">Yaoundé et Douala :</strong> 24 à 48 heures</p>
                  <p><strong className="text-gray-900 dark:text-white">Autres grandes villes :</strong> 3 à 5 jours ouvrables</p>
                  <p><strong className="text-gray-900 dark:text-white">Zones rurales :</strong> 5 à 10 jours ouvrables</p>
                </div>
                <p className="text-sm italic mt-2">
                  Ces délais sont indicatifs et peuvent varier selon les conditions météorologiques et l&apos;état des routes.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">5.3 - Réception de la commande</h3>
                <p>
                  À la réception, le Client doit vérifier l&apos;état du colis en présence du livreur. En cas de dommage apparent, le Client doit :
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                  <li>Refuser le colis ou émettre des réserves écrites sur le bon de livraison</li>
                  <li>Prendre des photos des dommages</li>
                  <li>Contacter notre service client dans les 48 heures</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">5.4 - Retard de livraison</h3>
                <p>
                  En cas de retard supérieur à 15 jours par rapport à la date indicative, le Client peut annuler sa commande et obtenir le remboursement intégral des sommes versées.
                </p>
              </div>
            </div>
          </section>

          {/* Article 6 */}
          <section>
            <div className="flex items-center space-x-3 mb-4">
              <RotateCcw className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Article 6 - Droit de Rétractation et Retours</h2>
            </div>
            <div className="space-y-4 text-gray-600 dark:text-gray-300">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">6.1 - Droit de rétractation</h3>
                <p>
                  Conformément à la législation en vigueur, le Client dispose d&apos;un délai de <strong>14 jours</strong> à compter de la réception de sa commande pour exercer son droit de rétractation, sans avoir à justifier de motifs ni à payer de pénalités.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">6.2 - Conditions de retour</h3>
                <p>
                  Pour être accepté, le retour doit respecter les conditions suivantes :
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                  <li>Produits dans leur emballage d&apos;origine, non ouverts et non utilisés</li>
                  <li>Produits avec tous leurs accessoires, notices et étiquettes</li>
                  <li>Demande de retour effectuée via notre formulaire en ligne ou par email</li>
                  <li>Renvoi dans les 14 jours suivant la notification de rétractation</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">6.3 - Exceptions</h3>
                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4">
                  <p className="font-semibold text-amber-900 dark:text-amber-200 mb-2">⚠️ Le droit de rétractation ne s&apos;applique pas aux :</p>
                  <ul className="list-disc list-inside space-y-1 ml-4 text-amber-800 dark:text-amber-300">
                    <li>Produits scellés ouverts (engrais liquides, semences)</li>
                    <li>Produits périssables</li>
                    <li>Produits confectionnés sur mesure</li>
                    <li>Services déjà exécutés avec accord du client</li>
                  </ul>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">6.4 - Remboursement</h3>
                <p>
                  Le remboursement du prix d&apos;achat (hors frais de retour) est effectué dans un délai de 14 jours à compter de la récupération des produits, par le même moyen de paiement que celui utilisé pour la commande.
                </p>
              </div>
            </div>
          </section>

          {/* Article 7 */}
          <section>
            <div className="flex items-center space-x-3 mb-4">
              <Shield className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Article 7 - Garanties</h2>
            </div>
            <div className="space-y-4 text-gray-600 dark:text-gray-300">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">7.1 - Garantie de conformité</h3>
                <p>
                  Tous nos produits bénéficient de la garantie légale de conformité. Si un produit présente un défaut de conformité, il peut être retourné, échangé ou remboursé dans un délai de 24 mois à compter de la livraison.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">7.2 - Garantie des vices cachés</h3>
                <p>
                  Le Client bénéficie également de la garantie légale contre les vices cachés. En cas de vice caché, le Client peut choisir entre le remboursement intégral ou une réduction du prix.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">7.3 - Garantie satisfait ou remboursé</h3>
                <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-4">
                  <p className="font-semibold text-gray-900 dark:text-white mb-2">Notre Engagement Qualité</p>
                  <p>
                    Si après utilisation conforme de nos produits, vous n&apos;êtes pas satisfait des résultats obtenus dans un délai de 90 jours, nous vous remboursons à 100% sur présentation de justificatifs (photos, analyse de sol, etc.).
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Article 8 */}
          <section>
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Article 8 - Responsabilité</h2>
            </div>
            <div className="space-y-4 text-gray-600 dark:text-gray-300">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">8.1 - Limitation de responsabilité</h3>
                <p>
                  AGRI POINT SERVICE ne saurait être tenu responsable :
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                  <li>De l&apos;inexécution du contrat en cas de force majeure</li>
                  <li>Des dommages indirects résultant de l&apos;utilisation des produits</li>
                  <li>D&apos;une mauvaise utilisation des produits non conforme aux instructions</li>
                  <li>Des variations de rendement liées aux conditions climatiques</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">8.2 - Conseils d&apos;utilisation</h3>
                <p>
                  Les conseils et recommandations fournis sur le site ou par notre équipe sont donnés à titre indicatif. Le Client reste seul responsable de l&apos;utilisation des produits et de leur adaptation à ses cultures.
                </p>
              </div>
            </div>
          </section>

          {/* Article 9 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Article 9 - Données Personnelles</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Les données personnelles collectées lors de la commande sont traitées conformément à notre <Link href="/confidentialite" className="text-primary-600 hover:text-primary-700 font-semibold">Politique de Confidentialité</Link>. Le Client dispose d&apos;un droit d&apos;accès, de rectification et de suppression de ses données.
            </p>
          </section>

          {/* Article 10 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Article 10 - Service Client</h2>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6 space-y-3 text-gray-600 dark:text-gray-300">
              <p className="font-semibold text-gray-900 dark:text-white">Notre service client est à votre disposition :</p>
              <p><strong>Du lundi au vendredi :</strong> 8h00 - 18h00</p>
              <p><strong>Samedi :</strong> 9h00 - 13h00</p>
              <p><strong>Email :</strong> <a href="mailto:support@agri-ps.com" className="text-primary-600 hover:text-primary-700">support@agri-ps.com</a></p>
              <p><strong>Téléphone :</strong> <a href="tel:+237657393939" className="text-primary-600 hover:text-primary-700">+237 657 39 39 39</a></p>
              <p><strong>WhatsApp :</strong> <a href="https://wa.me/237676026601" className="text-primary-600 hover:text-primary-700">676 02 66 01</a></p>
            </div>
          </section>

          {/* Article 11 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Article 11 - Règlement des Litiges</h2>
            <div className="space-y-4 text-gray-600 dark:text-gray-300">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">11.1 - Médiation</h3>
                <p>
                  En cas de litige, le Client peut recourir gratuitement à un médiateur de la consommation en vue de la résolution amiable du litige. Les coordonnées du médiateur sont disponibles sur demande.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">11.2 - Droit applicable</h3>
                <p>
                  Les présentes CGV sont régies par le droit camerounais. En cas de litige et à défaut de résolution amiable, les tribunaux de Yaoundé seront seuls compétents.
                </p>
              </div>
            </div>
          </section>

          {/* Article 12 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Article 12 - Modifications des CGV</h2>
            <p className="text-gray-600 dark:text-gray-300">
              AGRI POINT SERVICE se réserve le droit de modifier les présentes CGV à tout moment. Les CGV applicables sont celles en vigueur à la date de la commande.
            </p>
          </section>

          {/* Contact */}
          <section className="border-t border-gray-200 dark:border-gray-700 pt-8">
            <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Questions sur nos CGV ?</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Notre équipe est à votre disposition pour répondre à toutes vos questions concernant ces conditions générales de vente.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a 
                  href="mailto:infos@agri-ps.com" 
                  className="inline-flex items-center justify-center px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition-colors"
                >
                  <FileText className="w-5 h-5 mr-2" />
                  Nous Contacter
                </a>
                <Link 
                  href="/contact" 
                  className="inline-flex items-center justify-center px-6 py-3 border-2 border-primary-600 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg font-semibold transition-colors"
                >
                  Formulaire de Contact
                </Link>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
