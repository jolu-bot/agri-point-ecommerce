import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Shield, Eye, Lock, Database, Cookie, Users, AlertCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Politique de Confidentialité - AGRI POINT SERVICE',
  description: 'Politique de confidentialité et protection des données personnelles de AGRI POINT SERVICE',
};

export default function ConfidentialitePage() {
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
              <Shield className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Politique de Confidentialité</h1>
              <p className="text-gray-600 dark:text-gray-400">Dernière mise à jour : 16 décembre 2024</p>
            </div>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            AGRI POINT SERVICE SAS s&apos;engage à protéger la vie privée de ses utilisateurs et à garantir la sécurité de leurs données personnelles. Cette politique décrit comment nous collectons, utilisons et protégeons vos informations.
          </p>
        </div>

        {/* Contenu */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 space-y-8">
          {/* Responsable du traitement */}
          <section>
            <div className="flex items-center space-x-3 mb-4">
              <Users className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Responsable du Traitement</h2>
            </div>
            <div className="space-y-3 text-gray-600 dark:text-gray-300">
              <p>
                Le responsable du traitement des données personnelles est :
              </p>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <p><strong className="text-gray-900 dark:text-white">AGRI POINT SERVICE SAS</strong></p>
                <p>B.P. 5111 Yaoundé, Quartier Fouda, Cameroun</p>
                <p>Email : <a href="mailto:dpo@agri-ps.com" className="text-primary-600 hover:text-primary-700">dpo@agri-ps.com</a></p>
                <p>Téléphone : <a href="tel:+237657393939" className="text-primary-600 hover:text-primary-700">+237 657 39 39 39</a></p>
              </div>
            </div>
          </section>

          {/* Données collectées */}
          <section>
            <div className="flex items-center space-x-3 mb-4">
              <Database className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Données Collectées</h2>
            </div>
            <div className="space-y-4 text-gray-600 dark:text-gray-300">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">1. Données d&apos;identification</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Nom et prénom</li>
                  <li>Adresse email</li>
                  <li>Numéro de téléphone</li>
                  <li>Adresse postale (pour les livraisons)</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">2. Données de commande</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Historique des achats</li>
                  <li>Montants des transactions</li>
                  <li>Méthodes de paiement (informations cryptées)</li>
                  <li>Adresses de livraison</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">3. Données de navigation</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Adresse IP</li>
                  <li>Type de navigateur</li>
                  <li>Pages visitées</li>
                  <li>Durée de visite</li>
                  <li>Données de géolocalisation (avec votre consentement)</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">4. Données agricoles (optionnelles)</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Type de cultures</li>
                  <li>Superficie exploitée</li>
                  <li>Localisation des parcelles</li>
                  <li>Problématiques rencontrées</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Finalités du traitement */}
          <section>
            <div className="flex items-center space-x-3 mb-4">
              <Eye className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Finalités du Traitement</h2>
            </div>
            <div className="space-y-3 text-gray-600 dark:text-gray-300">
              <p>Nous utilisons vos données personnelles pour :</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong className="text-gray-900 dark:text-white">Gestion des commandes :</strong> traitement, facturation, livraison</li>
                <li><strong className="text-gray-900 dark:text-white">Service client :</strong> réponse aux demandes, support technique, assistance</li>
                <li><strong className="text-gray-900 dark:text-white">Communication :</strong> newsletters, offres personnalisées, actualités (avec votre consentement)</li>
                <li><strong className="text-gray-900 dark:text-white">Amélioration des services :</strong> analyse statistique, développement de nouveaux produits</li>
                <li><strong className="text-gray-900 dark:text-white">Sécurité :</strong> prévention de la fraude, respect des obligations légales</li>
                <li><strong className="text-gray-900 dark:text-white">Personnalisation :</strong> recommandations de produits adaptés à vos besoins</li>
              </ul>
            </div>
          </section>

          {/* Base légale */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Base Légale du Traitement</h2>
            <div className="space-y-3 text-gray-600 dark:text-gray-300">
              <p>Le traitement de vos données repose sur :</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong className="text-gray-900 dark:text-white">L&apos;exécution du contrat :</strong> pour traiter vos commandes et vous fournir nos services</li>
                <li><strong className="text-gray-900 dark:text-white">Votre consentement :</strong> pour l&apos;envoi de communications marketing et l&apos;utilisation de cookies non essentiels</li>
                <li><strong className="text-gray-900 dark:text-white">Notre intérêt légitime :</strong> pour améliorer nos services et prévenir la fraude</li>
                <li><strong className="text-gray-900 dark:text-white">Les obligations légales :</strong> pour respecter les lois fiscales et comptables</li>
              </ul>
            </div>
          </section>

          {/* Durée de conservation */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Durée de Conservation</h2>
            <div className="space-y-3 text-gray-600 dark:text-gray-300">
              <p>Vos données sont conservées pendant les durées suivantes :</p>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 space-y-2">
                <p><strong className="text-gray-900 dark:text-white">Données de compte :</strong> 3 ans après votre dernière activité</p>
                <p><strong className="text-gray-900 dark:text-white">Données de commande :</strong> 10 ans (obligations comptables et fiscales)</p>
                <p><strong className="text-gray-900 dark:text-white">Données marketing :</strong> 3 ans après le dernier contact</p>
                <p><strong className="text-gray-900 dark:text-white">Cookies :</strong> 13 mois maximum</p>
                <p><strong className="text-gray-900 dark:text-white">Données de navigation :</strong> 25 mois maximum</p>
              </div>
            </div>
          </section>

          {/* Partage des données */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Partage des Données</h2>
            <div className="space-y-4 text-gray-600 dark:text-gray-300">
              <p>
                Nous ne vendons jamais vos données personnelles. Nous pouvons partager vos informations avec :
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong className="text-gray-900 dark:text-white">Prestataires de services :</strong> livraison, paiement, hébergement web, marketing</li>
                <li><strong className="text-gray-900 dark:text-white">Partenaires commerciaux :</strong> uniquement avec votre consentement explicite</li>
                <li><strong className="text-gray-900 dark:text-white">Autorités légales :</strong> si requis par la loi ou pour protéger nos droits</li>
              </ul>
              <p className="italic">
                Tous nos partenaires sont contractuellement tenus de respecter la confidentialité et la sécurité de vos données.
              </p>
            </div>
          </section>

          {/* Cookies */}
          <section>
            <div className="flex items-center space-x-3 mb-4">
              <Cookie className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Cookies et Technologies Similaires</h2>
            </div>
            <div className="space-y-4 text-gray-600 dark:text-gray-300">
              <p>
                Notre site utilise des cookies pour améliorer votre expérience. Vous pouvez gérer vos préférences de cookies à tout moment.
              </p>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Types de cookies utilisés :</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong className="text-gray-900 dark:text-white">Cookies essentiels :</strong> nécessaires au fonctionnement du site (panier, authentification)</li>
                  <li><strong className="text-gray-900 dark:text-white">Cookies de performance :</strong> analyse du trafic et des comportements</li>
                  <li><strong className="text-gray-900 dark:text-white">Cookies de personnalisation :</strong> mémorisation de vos préférences</li>
                  <li><strong className="text-gray-900 dark:text-white">Cookies marketing :</strong> publicités ciblées (avec votre consentement)</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Sécurité */}
          <section>
            <div className="flex items-center space-x-3 mb-4">
              <Lock className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Sécurité des Données</h2>
            </div>
            <div className="space-y-3 text-gray-600 dark:text-gray-300">
              <p>
                Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données :
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Cryptage SSL/TLS pour toutes les transmissions</li>
                <li>Stockage sécurisé des données sur des serveurs protégés</li>
                <li>Accès limité aux données personnelles (principe du moindre privilège)</li>
                <li>Audits de sécurité réguliers</li>
                <li>Formation du personnel à la protection des données</li>
                <li>Plan de réponse aux incidents de sécurité</li>
              </ul>
            </div>
          </section>

          {/* Vos droits */}
          <section>
            <div className="flex items-center space-x-3 mb-4">
              <AlertCircle className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Vos Droits</h2>
            </div>
            <div className="space-y-4 text-gray-600 dark:text-gray-300">
              <p>Conformément à la réglementation, vous disposez des droits suivants :</p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Droit d&apos;accès</h3>
                  <p className="text-sm">Obtenir une copie de vos données personnelles</p>
                </div>
                <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Droit de rectification</h3>
                  <p className="text-sm">Corriger vos données inexactes ou incomplètes</p>
                </div>
                <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Droit à l&apos;effacement</h3>
                  <p className="text-sm">Demander la suppression de vos données</p>
                </div>
                <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Droit d&apos;opposition</h3>
                  <p className="text-sm">Refuser le traitement de vos données</p>
                </div>
                <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Droit à la limitation</h3>
                  <p className="text-sm">Limiter le traitement dans certaines conditions</p>
                </div>
                <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Droit à la portabilité</h3>
                  <p className="text-sm">Recevoir vos données dans un format structuré</p>
                </div>
              </div>
              <p className="italic">
                Pour exercer vos droits, contactez-nous à <a href="mailto:dpo@agri-ps.com" className="text-primary-600 hover:text-primary-700 font-semibold">dpo@agri-ps.com</a>. Nous répondrons dans un délai de 30 jours.
              </p>
            </div>
          </section>

          {/* Modifications */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Modifications de la Politique</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Nous nous réservons le droit de modifier cette politique de confidentialité à tout moment. Les modifications seront publiées sur cette page avec une mise à jour de la date. Nous vous encourageons à consulter régulièrement cette page.
            </p>
          </section>

          {/* Contact */}
          <section className="border-t border-gray-200 dark:border-gray-700 pt-8">
            <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Questions sur vos Données ?</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Pour toute question concernant cette politique ou le traitement de vos données personnelles, contactez notre Délégué à la Protection des Données :
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a 
                  href="mailto:dpo@agri-ps.com" 
                  className="inline-flex items-center justify-center px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition-colors"
                >
                  <Lock className="w-5 h-5 mr-2" />
                  Contacter le DPO
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
