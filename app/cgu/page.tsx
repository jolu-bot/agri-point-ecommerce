import { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowLeft,
  BookOpen,
  User,
  Lock,
  Eye,
  Globe,
  AlertTriangle,
  Shield,
  FileText,
  Cookie,
  Scale,
  Bell,
  MessageSquare,
} from 'lucide-react';

export const metadata: Metadata = {
  title: "Conditions Générales d'Utilisation - AGRIPOINT SERVICES",
  description:
    "Conditions générales d'utilisation du site www.agri-ps.com — droits et obligations des utilisateurs, données personnelles, propriété intellectuelle, droit applicable camerounais.",
};

export default function CGUPage() {
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
              <BookOpen className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Conditions Générales d&apos;Utilisation
              </h1>
              <p className="text-gray-600 dark:text-gray-400">En vigueur au 27 février 2026</p>
            </div>
          </div>
          <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-4">
            <p className="text-gray-700 dark:text-gray-300">
              <strong className="text-gray-900 dark:text-white">Important :</strong> Les présentes
              Conditions Générales d&apos;Utilisation (CGU) régissent l&apos;accès et l&apos;utilisation du site
              internet <strong>www.agri-ps.com</strong> exploité par AGRIPOINT SERVICES SAS. Toute
              navigation sur ce site vaut acceptation sans réserve des présentes CGU.
            </p>
          </div>
        </div>

        {/* Contenu */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 space-y-8">

          {/* Article 1 – Objet */}
          <section>
            <div className="flex items-center space-x-3 mb-4">
              <FileText className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Article 1 – Objet et champ d&apos;application
              </h2>
            </div>
            <div className="space-y-3 text-gray-600 dark:text-gray-300">
              <p>
                Les présentes CGU ont pour objet de définir les modalités d&apos;accès et les règles
                d&apos;utilisation du site internet <strong>www.agri-ps.com</strong> (ci-après
                &ldquo;le Site&rdquo;), de la boutique en ligne et de l&apos;ensemble des services numériques
                mis à disposition des utilisateurs par AGRIPOINT SERVICES SAS.
              </p>
              <p>
                Ces CGU s&apos;appliquent à tout utilisateur, qu&apos;il soit visiteur anonyme, client
                enregistré ou administrateur, accédant au Site depuis n&apos;importe quel terminal
                (ordinateur, tablette, smartphone).
              </p>
              <p>
                Les présentes CGU sont distinctes des{' '}
                <Link href="/cgv" className="text-primary-600 hover:text-primary-700 font-semibold">
                  Conditions Générales de Vente (CGV)
                </Link>{' '}
                qui encadrent spécifiquement les transactions commerciales.
              </p>
            </div>
          </section>

          {/* Article 2 – Définitions */}
          <section>
            <div className="flex items-center space-x-3 mb-4">
              <BookOpen className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Article 2 – Définitions
              </h2>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 space-y-3 text-gray-600 dark:text-gray-300">
              <p>
                <strong className="text-gray-900 dark:text-white">« Éditeur » / « Société »</strong> :
                AGRIPOINT SERVICES SAS, société par actions simplifiée de droit camerounais, dont le
                siège social est situé au B.P. 5111 Yaoundé, Quartier Fouda, Cameroun.
              </p>
              <p>
                <strong className="text-gray-900 dark:text-white">« Site »</strong> : l&apos;ensemble des
                pages web et ressources accessibles à l&apos;adresse www.agri-ps.com ainsi que ses
                sous-domaines.
              </p>
              <p>
                <strong className="text-gray-900 dark:text-white">« Utilisateur »</strong> : toute
                personne physique ou morale accédant au Site, que ce soit à titre de simple visiteur
                ou de client enregistré.
              </p>
              <p>
                <strong className="text-gray-900 dark:text-white">« Compte »</strong> : espace
                personnel créé par l&apos;Utilisateur après inscription, lui permettant d&apos;accéder à des
                fonctionnalités réservées (historique de commandes, gestion du profil, etc.).
              </p>
              <p>
                <strong className="text-gray-900 dark:text-white">« Contenu »</strong> : toute
                information publiée sur le Site (textes, images, vidéos, fiches produits, articles de
                blog, descriptions, conseils agronomiques…).
              </p>
              <p>
                <strong className="text-gray-900 dark:text-white">« Services »</strong> : l&apos;ensemble
                des fonctionnalités proposées via le Site, notamment la boutique en ligne, le
                chatbot AgriBot, la consultation de fiches produits et les formulaires de contact.
              </p>
            </div>
          </section>

          {/* Article 3 – Éditeur */}
          <section>
            <div className="flex items-center space-x-3 mb-4">
              <Globe className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Article 3 – Mentions légales de l&apos;éditeur
              </h2>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 space-y-2 text-gray-600 dark:text-gray-300">
              <p>
                <strong className="text-gray-900 dark:text-white">Raison sociale :</strong> AGRI
                POINT SERVICE SAS
              </p>
              <p>
                <strong className="text-gray-900 dark:text-white">Siège social :</strong> B.P. 5111
                Yaoundé, Quartier Fouda, Cameroun
              </p>
              <p>
                <strong className="text-gray-900 dark:text-white">Capital social :</strong> 10 000
                000 FCFA
              </p>
              <p>
                <strong className="text-gray-900 dark:text-white">RC :</strong>{' '}
                RC/YAO/2023/B/XXXX
              </p>
              <p>
                <strong className="text-gray-900 dark:text-white">Directeur de publication :</strong>{' '}
                Le Président Directeur Général d&apos;AGRIPOINT SERVICES SAS
              </p>
              <p>
                <strong className="text-gray-900 dark:text-white">Email :</strong>{' '}
                <a
                  href="mailto:infos@agri-ps.com"
                  className="text-primary-600 hover:text-primary-700"
                >
                  infos@agri-ps.com
                </a>
              </p>
              <p>
                <strong className="text-gray-900 dark:text-white">Téléphone :</strong>{' '}
                <a
                  href="tel:+237657393939"
                  className="text-primary-600 hover:text-primary-700"
                >
                  +237 657 39 39 39
                </a>
              </p>
              <p>
                <strong className="text-gray-900 dark:text-white">Hébergement :</strong> Le Site est
                hébergé sur des serveurs sécurisés dont les coordonnées sont disponibles sur simple
                demande à l&apos;adresse infos@agri-ps.com.
              </p>
            </div>
          </section>

          {/* Article 4 – Accès au Site */}
          <section>
            <div className="flex items-center space-x-3 mb-4">
              <Globe className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Article 4 – Accès au Site et disponibilité
              </h2>
            </div>
            <div className="space-y-4 text-gray-600 dark:text-gray-300">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  4.1 – Accès libre
                </h3>
                <p>
                  L&apos;accès au Site est gratuit et ouvert à tout Utilisateur disposant d&apos;une connexion
                  internet. L&apos;Utilisateur supporte seul les coûts de télécommunication liés à
                  l&apos;accès au Site.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  4.2 – Disponibilité
                </h3>
                <p>
                  AGRIPOINT SERVICES s&apos;efforce d&apos;assurer la disponibilité du Site 24h/24 et 7j/7.
                  Toutefois, la Société se réserve le droit de suspendre, interrompre ou limiter
                  l&apos;accès sans préavis pour des raisons de maintenance, de mise à jour, de sécurité
                  ou de force majeure. Ces opérations ne peuvent donner lieu à aucune indemnisation.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  4.3 – Configuration requise
                </h3>
                <p>
                  L&apos;Utilisateur est responsable du matériel et du logiciel nécessaires à l&apos;accès au
                  Site (terminal, navigateur à jour, connexion internet). AGRIPOINT SERVICES ne
                  saurait être tenu responsable de tout dysfonctionnement lié à une configuration
                  incompatible ou obsolète.
                </p>
              </div>
            </div>
          </section>

          {/* Article 5 – Création de compte */}
          <section>
            <div className="flex items-center space-x-3 mb-4">
              <User className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Article 5 – Création et gestion du compte utilisateur
              </h2>
            </div>
            <div className="space-y-4 text-gray-600 dark:text-gray-300">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  5.1 – Inscription
                </h3>
                <p>
                  Certaines fonctionnalités du Site (suivi de commandes, enregistrement d&apos;adresses,
                  accès à l&apos;historique) nécessitent la création d&apos;un Compte. L&apos;inscription est
                  ouverte à toute personne physique majeure ou personne morale régulièrement
                  constituée.
                </p>
                <p className="mt-2">Pour créer un Compte, l&apos;Utilisateur doit :</p>
                <ol className="list-decimal list-inside space-y-1 ml-4 mt-2">
                  <li>Fournir une adresse e-mail valide et un mot de passe sécurisé</li>
                  <li>Renseigner ses nom, prénom et numéro de téléphone</li>
                  <li>Accepter les présentes CGU et la Politique de Confidentialité</li>
                  <li>Valider l&apos;inscription via le lien de confirmation envoyé par e-mail</li>
                </ol>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  5.2 – Exactitude des informations
                </h3>
                <p>
                  L&apos;Utilisateur s&apos;engage à fournir des informations exactes, complètes et à les
                  maintenir à jour. Toute indication fausse ou frauduleuse entraînera la résiliation
                  immédiate du Compte sans préavis ni indemnité.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  5.3 – Sécurité des identifiants
                </h3>
                <p>
                  L&apos;Utilisateur est seul responsable de la confidentialité de ses identifiants
                  (e-mail / mot de passe). Toute utilisation du Compte avec ses identifiants est
                  présumée effectuée par lui. En cas de compromission ou d&apos;utilisation frauduleuse
                  suspectée, l&apos;Utilisateur doit en informer immédiatement la Société à l&apos;adresse{' '}
                  <a
                    href="mailto:infos@agri-ps.com"
                    className="text-primary-600 hover:text-primary-700"
                  >
                    infos@agri-ps.com
                  </a>
                  .
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  5.4 – Clôture du compte
                </h3>
                <p>
                  L&apos;Utilisateur peut fermer son Compte à tout moment en adressant une demande par
                  e-mail. La Société se réserve le droit de suspendre ou supprimer tout Compte en
                  cas de violation des présentes CGU, sans préavis.
                </p>
              </div>
            </div>
          </section>

          {/* Article 6 – Règles d'utilisation */}
          <section>
            <div className="flex items-center space-x-3 mb-4">
              <Scale className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Article 6 – Règles d&apos;utilisation et comportement
              </h2>
            </div>
            <div className="space-y-4 text-gray-600 dark:text-gray-300">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  6.1 – Utilisations autorisées
                </h3>
                <p>
                  Le Site est mis à disposition des Utilisateurs à des fins strictement personnelles,
                  non commerciales (sauf accord préalable écrit), pour la consultation des produits,
                  la passation de commandes et l&apos;utilisation des services proposés.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  6.2 – Utilisations interdites
                </h3>
                <p>Il est formellement interdit à tout Utilisateur :</p>
                <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                  <li>
                    D&apos;utiliser le Site à des fins illicites, frauduleuses ou contraires aux bonnes
                    mœurs
                  </li>
                  <li>
                    De tenter de contourner les mesures de sécurité ou d&apos;accéder sans autorisation
                    aux parties restreintes du Site
                  </li>
                  <li>
                    De publier, transmettre ou diffuser des contenus illégaux, diffamatoires,
                    trompeurs ou portant atteinte aux droits de tiers
                  </li>
                  <li>
                    D&apos;utiliser des robots, scripts ou tout procédé automatisé pour scraper,
                    collecter ou reproduire des données du Site
                  </li>
                  <li>
                    De saturer délibérément l&apos;infrastructure technique (attaque DDoS, flood…)
                  </li>
                  <li>
                    D&apos;introduire des virus, chevaux de Troie ou tout code malveillant
                  </li>
                  <li>
                    D&apos;usurper l&apos;identité d&apos;un autre Utilisateur ou de la Société
                  </li>
                </ul>
              </div>
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4">
                <p className="font-semibold text-amber-900 dark:text-amber-200 mb-2">
                  ⚠️ Sanctions
                </p>
                <p className="text-amber-800 dark:text-amber-300">
                  Tout manquement à ces règles peut entraîner la suspension ou suppression immédiate
                  du Compte, et le cas échéant, des poursuites judiciaires conformément au droit
                  camerounais en vigueur.
                </p>
              </div>
            </div>
          </section>

          {/* Article 7 – Propriété intellectuelle */}
          <section>
            <div className="flex items-center space-x-3 mb-4">
              <Shield className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Article 7 – Propriété intellectuelle
              </h2>
            </div>
            <div className="space-y-4 text-gray-600 dark:text-gray-300">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  7.1 – Droits de la Société
                </h3>
                <p>
                  L&apos;ensemble du Contenu du Site (textes, graphismes, logos, icônes, photographies,
                  vidéos, fiches produits, code source, architecture) est la propriété exclusive
                  d&apos;AGRIPOINT SERVICES SAS ou de ses partenaires et fournisseurs de licences. Ce
                  Contenu est protégé par les lois camerounaises et les conventions internationales
                  relatives à la propriété intellectuelle, aux droits d&apos;auteur et aux marques.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  7.2 – Licence d&apos;utilisation limitée
                </h3>
                <p>
                  L&apos;Utilisateur bénéficie d&apos;un droit d&apos;accès personnel, non exclusif, non
                  transférable et révocable pour consulter le Contenu du Site à des fins privées et
                  non commerciales. Toute reproduction, distribution, modification, représentation
                  totale ou partielle du Contenu, sans autorisation écrite préalable d&apos;AGRIPOINT SERVICES
                  SERVICE, est strictement interdite.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  7.3 – Marques et dénominations
                </h3>
                <p>
                  Les marques, logos et dénominations commerciales figurant sur le Site sont la
                  propriété d&apos;AGRIPOINT SERVICES SAS. Toute reproduction ou usage non autorisé
                  engage la responsabilité civile et pénale de son auteur.
                </p>
              </div>
            </div>
          </section>

          {/* Article 8 – Données personnelles */}
          <section>
            <div className="flex items-center space-x-3 mb-4">
              <Lock className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Article 8 – Protection des données personnelles
              </h2>
            </div>
            <div className="space-y-4 text-gray-600 dark:text-gray-300">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  8.1 – Responsable de traitement
                </h3>
                <p>
                  AGRIPOINT SERVICES SAS est responsable du traitement des données à caractère
                  personnel collectées via le Site, conformément à la loi camerounaise n° 2010/012
                  du 21 décembre 2010 relative à la cybersécurité et à la cybercriminalité et aux
                  dispositions applicables en matière de protection des données personnelles.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  8.2 – Données collectées
                </h3>
                <p>Les données collectées peuvent inclure :</p>
                <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                  <li>Données d&apos;identification : nom, prénom, adresse e-mail, numéro de téléphone</li>
                  <li>Données de connexion : adresse IP, logs de navigation, cookie identifiant</li>
                  <li>
                    Données de commande : adresse de livraison/facturation, historique d&apos;achats
                  </li>
                  <li>
                    Données de communication : messages envoyés via le formulaire de contact ou
                    AgriBot
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  8.3 – Finalités du traitement
                </h3>
                <p>Les données sont traitées pour :</p>
                <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                  <li>Gestion des commandes et du Compte Utilisateur</li>
                  <li>Envoi de confirmations, factures et notifications</li>
                  <li>Amélioration de l&apos;expérience utilisateur et des Services</li>
                  <li>Prévention de la fraude et sécurité du Site</li>
                  <li>
                    Envoi d&apos;informations commerciales et offres promotionnelles (avec consentement)
                  </li>
                  <li>Respect des obligations légales et réglementaires</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  8.4 – Droits des Utilisateurs
                </h3>
                <p>
                  Conformément à la réglementation applicable, l&apos;Utilisateur dispose des droits
                  suivants sur ses données personnelles :
                </p>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mt-2 space-y-1">
                  <p>
                    <strong className="text-gray-900 dark:text-white">Droit d&apos;accès :</strong>{' '}
                    obtenir la liste et la copie de ses données
                  </p>
                  <p>
                    <strong className="text-gray-900 dark:text-white">
                      Droit de rectification :
                    </strong>{' '}
                    corriger des données inexactes ou incomplètes
                  </p>
                  <p>
                    <strong className="text-gray-900 dark:text-white">Droit à l&apos;effacement :</strong>{' '}
                    demander la suppression de ses données
                  </p>
                  <p>
                    <strong className="text-gray-900 dark:text-white">
                      Droit d&apos;opposition :
                    </strong>{' '}
                    s&apos;opposer au traitement à des fins de prospection commerciale
                  </p>
                  <p>
                    <strong className="text-gray-900 dark:text-white">
                      Droit à la portabilité :
                    </strong>{' '}
                    recevoir ses données dans un format structuré
                  </p>
                </div>
                <p className="mt-3">
                  Pour exercer ces droits, l&apos;Utilisateur adresse une demande écrite à :{' '}
                  <a
                    href="mailto:privacy@agri-ps.com"
                    className="text-primary-600 hover:text-primary-700"
                  >
                    privacy@agri-ps.com
                  </a>{' '}
                  ou par courrier au siège social, avec une copie d&apos;un justificatif d&apos;identité.
                  La Société s&apos;engage à répondre dans un délai de 30 jours.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  8.5 – Conservation des données
                </h3>
                <p>
                  Les données sont conservées pour la durée strictement nécessaire aux finalités
                  poursuivies : 3 ans pour les données clients après le dernier contact commercial,
                  10 ans pour les données de facturation (obligation légale comptable).
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  8.6 – Transfert de données
                </h3>
                <p>
                  Les données personnelles ne sont vendues ni louées à des tiers. Elles peuvent être
                  partagées avec des prestataires techniques (hébergement, logistique, paiement)
                  soumis à des obligations de confidentialité équivalentes, dans la stricte limite
                  de leurs missions.
                </p>
              </div>
              <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-4">
                <p className="text-gray-700 dark:text-gray-300">
                  Pour plus de détails, consultez notre{' '}
                  <Link
                    href="/confidentialite"
                    className="text-primary-600 hover:text-primary-700 font-semibold"
                  >
                    Politique de Confidentialité complète
                  </Link>
                  .
                </p>
              </div>
            </div>
          </section>

          {/* Article 9 – Cookies */}
          <section>
            <div className="flex items-center space-x-3 mb-4">
              <Cookie className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Article 9 – Cookies et traceurs
              </h2>
            </div>
            <div className="space-y-4 text-gray-600 dark:text-gray-300">
              <p>
                Le Site utilise des cookies et traceurs pour améliorer l&apos;expérience de navigation,
                analyser le trafic et personnaliser les contenus. Un cookie est un petit fichier
                texte déposé sur le terminal de l&apos;Utilisateur lors de sa navigation.
              </p>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  9.1 – Types de cookies utilisés
                </h3>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 space-y-3">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">Cookies essentiels</p>
                    <p className="text-sm">
                      Indispensables au fonctionnement du Site (session, panier, authentification).
                      Durée : session ou jusqu&apos;à déconnexion.
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">Cookies analytiques</p>
                    <p className="text-sm">
                      Permettent de mesurer l&apos;audience et d&apos;améliorer les performances (ex. : temps
                      de chargement, pages visitées). Durée : 13 mois maximum.
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      Cookies de préférence
                    </p>
                    <p className="text-sm">
                      Mémorisent les choix de l&apos;Utilisateur (langue, thème, région). Durée :
                      12 mois.
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  9.2 – Gestion des cookies
                </h3>
                <p>
                  L&apos;Utilisateur peut à tout moment configurer son navigateur pour refuser ou
                  supprimer les cookies. Le refus de cookies essentiels peut toutefois dégrader
                  l&apos;expérience et empêcher certaines fonctionnalités (maintien du panier, connexion
                  au Compte…).
                </p>
              </div>
            </div>
          </section>

          {/* Article 10 – Responsabilité */}
          <section>
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Article 10 – Responsabilité et garanties
              </h2>
            </div>
            <div className="space-y-4 text-gray-600 dark:text-gray-300">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  10.1 – Limitation de responsabilité de la Société
                </h3>
                <p>
                  AGRIPOINT SERVICES s&apos;efforce d&apos;assurer l&apos;exactitude et la mise à jour des
                  informations publiées sur le Site. Toutefois, la Société ne garantit pas
                  l&apos;exhaustivité, l&apos;exactitude ou l&apos;adéquation des informations à un besoin
                  particulier. Les informations (conseils agronomiques, descriptions produits…) sont
                  fournies à titre indicatif et ne sauraient se substituer à un avis professionnel.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  10.2 – Cas d&apos;exonération
                </h3>
                <p>La Société ne saurait être tenue responsable :</p>
                <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                  <li>
                    Des dommages résultant d&apos;une utilisation du Site non conforme aux présentes CGU
                  </li>
                  <li>
                    Des interruptions ou défaillances du réseau internet hors de son contrôle
                  </li>
                  <li>
                    D&apos;une intrusion ou d&apos;un acte malveillant malgré les mesures de sécurité mises
                    en place
                  </li>
                  <li>Des dommages indirects, immatériels ou consécutifs subis par l&apos;Utilisateur</li>
                  <li>
                    Des contenus ou pratiques de sites tiers accessibles via des liens présents sur
                    le Site
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  10.3 – Responsabilité de l&apos;Utilisateur
                </h3>
                <p>
                  L&apos;Utilisateur est seul responsable de l&apos;utilisation qu&apos;il fait du Site, de son
                  Compte et des données qu&apos;il communique. Il garantit AGRIPOINT SERVICES contre toute
                  réclamation, perte ou préjudice résultant de son comportement fautif ou de la
                  violation des présentes CGU.
                </p>
              </div>
            </div>
          </section>

          {/* Article 11 – Liens hypertextes */}
          <section>
            <div className="flex items-center space-x-3 mb-4">
              <Globe className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Article 11 – Liens hypertextes et sites tiers
              </h2>
            </div>
            <div className="space-y-3 text-gray-600 dark:text-gray-300">
              <p>
                Le Site peut contenir des liens vers des sites web tiers (partenaires, fournisseurs,
                ressources agronomiques). Ces liens sont fournis à titre informatif uniquement.
                AGRIPOINT SERVICES n&apos;exerce aucun contrôle sur ces sites et n&apos;en est pas
                responsable du contenu, de la politique de confidentialité ou des pratiques.
              </p>
              <p>
                Tout lien hypertexte pointant vers le Site doit faire l&apos;objet d&apos;une autorisation
                préalable écrite de la Société. Pour toute demande :{' '}
                <a
                  href="mailto:infos@agri-ps.com"
                  className="text-primary-600 hover:text-primary-700"
                >
                  infos@agri-ps.com
                </a>
                .
              </p>
            </div>
          </section>

          {/* Article 12 – Sécurité */}
          <section>
            <div className="flex items-center space-x-3 mb-4">
              <Eye className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Article 12 – Sécurité
              </h2>
            </div>
            <div className="space-y-3 text-gray-600 dark:text-gray-300">
              <p>
                AGRIPOINT SERVICES met en œuvre les mesures techniques et organisationnelles
                appropriées pour protéger le Site et les données contre tout accès non autorisé,
                altération, divulgation ou destruction. Ces mesures comprennent notamment :
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Chiffrement des communications par protocole HTTPS (TLS)</li>
                <li>Authentification sécurisée (hachage des mots de passe, tokens JWT)</li>
                <li>Filtrage des accès et détection d&apos;intrusions</li>
                <li>Sauvegardes régulières des données</li>
                <li>Contrôle d&apos;accès strict aux environnements de production</li>
              </ul>
              <p>
                Malgré ces mesures, aucun système n&apos;est infaillible. L&apos;Utilisateur est invité à
                signaler toute vulnérabilité ou incident de sécurité à{' '}
                <a
                  href="mailto:security@agri-ps.com"
                  className="text-primary-600 hover:text-primary-700"
                >
                  security@agri-ps.com
                </a>
                .
              </p>
            </div>
          </section>

          {/* Article 13 – Modifications */}
          <section>
            <div className="flex items-center space-x-3 mb-4">
              <Bell className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Article 13 – Modifications des CGU
              </h2>
            </div>
            <div className="space-y-3 text-gray-600 dark:text-gray-300">
              <p>
                AGRIPOINT SERVICES se réserve le droit de modifier les présentes CGU à tout moment,
                notamment pour se conformer à l&apos;évolution législative, réglementaire ou technique.
              </p>
              <p>
                Les modifications entreront en vigueur dès leur publication sur le Site. Les
                Utilisateurs enregistrés seront informés par e-mail ou notification lors de leur
                prochaine connexion. La poursuite de l&apos;utilisation du Site après modification vaut
                acceptation des nouvelles CGU.
              </p>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <p className="text-sm">
                  Il est conseillé à l&apos;Utilisateur de consulter régulièrement les présentes CGU, dont
                  la date de dernière mise à jour est mentionnée en en-tête de page.
                </p>
              </div>
            </div>
          </section>

          {/* Article 14 – Droit applicable */}
          <section>
            <div className="flex items-center space-x-3 mb-4">
              <Scale className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Article 14 – Droit applicable et règlement des litiges
              </h2>
            </div>
            <div className="space-y-4 text-gray-600 dark:text-gray-300">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  14.1 – Droit applicable
                </h3>
                <p>
                  Les présentes CGU sont régies et interprétées conformément au droit de la
                  République du Cameroun, notamment la loi n° 2010/012 du 21 décembre 2010 sur la
                  cybersécurité et la cybercriminalité, ainsi que tout texte législatif ou
                  réglementaire à venir en matière de commerce électronique et de protection des
                  données personnelles.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  14.2 – Résolution amiable
                </h3>
                <p>
                  En cas de litige relatif à l&apos;interprétation ou à l&apos;exécution des présentes CGU,
                  les parties s&apos;engagent à rechercher en priorité une solution amiable. L&apos;Utilisateur
                  peut adresser sa réclamation à :{' '}
                  <a
                    href="mailto:infos@agri-ps.com"
                    className="text-primary-600 hover:text-primary-700"
                  >
                    infos@agri-ps.com
                  </a>
                  . La Société s&apos;engage à y répondre dans les 15 jours ouvrables.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  14.3 – Juridiction compétente
                </h3>
                <p>
                  À défaut de résolution amiable dans un délai de 30 jours, tout litige sera soumis
                  à la compétence exclusive des tribunaux de Yaoundé (Cameroun).
                </p>
              </div>
            </div>
          </section>

          {/* Article 15 – Divisibilité */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Article 15 – Divisibilité et intégralité
            </h2>
            <div className="space-y-3 text-gray-600 dark:text-gray-300">
              <p>
                Si une disposition des présentes CGU est déclarée nulle ou inapplicable par un
                tribunal compétent, les autres dispositions demeurent pleinement en vigueur. L&apos;absence
                d&apos;action de la Société face à un manquement ne vaut pas renonciation à ses droits.
              </p>
              <p>
                Les présentes CGU constituent l&apos;intégralité de l&apos;accord entre l&apos;Utilisateur et la
                Société concernant l&apos;utilisation du Site, et remplacent tout accord antérieur oral
                ou écrit portant sur le même objet.
              </p>
            </div>
          </section>

          {/* Contact */}
          <section className="border-t border-gray-200 dark:border-gray-700 pt-8">
            <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <MessageSquare className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Une question sur nos CGU ?
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Notre équipe juridique et commerciale est à votre disposition pour toute question
                relative aux présentes Conditions Générales d&apos;Utilisation.
              </p>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 space-y-2 text-sm text-gray-600 dark:text-gray-300 mb-6">
                <p>
                  <strong className="text-gray-900 dark:text-white">Email :</strong>{' '}
                  <a href="mailto:infos@agri-ps.com" className="text-primary-600 hover:text-primary-700">
                    infos@agri-ps.com
                  </a>
                </p>
                <p>
                  <strong className="text-gray-900 dark:text-white">Téléphone :</strong>{' '}
                  <a href="tel:+237657393939" className="text-primary-600 hover:text-primary-700">
                    +237 657 39 39 39
                  </a>
                </p>
                <p>
                  <strong className="text-gray-900 dark:text-white">Horaires :</strong> Lundi –
                  Vendredi, 8h00 – 18h00 | Samedi, 9h00 – 13h00
                </p>
                <p>
                  <strong className="text-gray-900 dark:text-white">Adresse :</strong> B.P. 5111
                  Yaoundé, Quartier Fouda, Cameroun
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="mailto:infos@agri-ps.com"
                  className="inline-flex items-center justify-center px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition-colors"
                >
                  <FileText className="w-5 h-5 mr-2" />
                  Nous Écrire
                </a>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center px-6 py-3 border-2 border-primary-600 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg font-semibold transition-colors"
                >
                  Formulaire de Contact
                </Link>
                <Link
                  href="/cgv"
                  className="inline-flex items-center justify-center px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg font-semibold transition-colors"
                >
                  Voir nos CGV
                </Link>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
