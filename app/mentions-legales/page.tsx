import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Scale, Building2, Mail, Phone, MapPin } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Mentions Légales - AGRI POINT SERVICE',
  description: 'Mentions légales et informations juridiques de AGRI POINT SERVICE SAS',
};

export default function MentionsLegalesPage() {
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
              <Scale className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Mentions Légales</h1>
              <p className="text-gray-600 dark:text-gray-400">Dernière mise à jour : 16 décembre 2024</p>
            </div>
          </div>
        </div>

        {/* Contenu */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 space-y-8">
          {/* Éditeur du site */}
          <section>
            <div className="flex items-center space-x-3 mb-4">
              <Building2 className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Éditeur du Site</h2>
            </div>
            <div className="space-y-3 text-gray-600 dark:text-gray-300">
              <p>
                <strong className="text-gray-900 dark:text-white">Raison sociale :</strong> AGRI POINT SERVICE SAS
              </p>
              <p>
                <strong className="text-gray-900 dark:text-white">Forme juridique :</strong> Société par Actions Simplifiée (SAS)
              </p>
              <p>
                <strong className="text-gray-900 dark:text-white">Capital social :</strong> 10 000 000 FCFA
              </p>
              <p>
                <strong className="text-gray-900 dark:text-white">Siège social :</strong> B.P. 5111 Yaoundé, Quartier Fouda, Cameroun
              </p>
              <p>
                <strong className="text-gray-900 dark:text-white">Numéro de registre du commerce :</strong> RC/YAO/2023/B/XXXX
              </p>
              <p>
                <strong className="text-gray-900 dark:text-white">Numéro d&apos;identification fiscale :</strong> M042300XXXXXX
              </p>
              <p>
                <strong className="text-gray-900 dark:text-white">Directeur de la publication :</strong> M. AGRI POINT
              </p>
            </div>
          </section>

          {/* Contact */}
          <section>
            <div className="flex items-center space-x-3 mb-4">
              <Mail className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Contact</h2>
            </div>
            <div className="space-y-3 text-gray-600 dark:text-gray-300">
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                <span>Téléphone : <a href="tel:+237657393939" className="text-primary-600 hover:text-primary-700">+237 657 39 39 39</a></span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                <span>Email : <a href="mailto:infos@agri-ps.com" className="text-primary-600 hover:text-primary-700">infos@agri-ps.com</a></span>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-primary-600 dark:text-primary-400 mt-0.5" />
                <span>Adresse : B.P. 5111 Yaoundé, Quartier Fouda, Cameroun</span>
              </div>
            </div>
          </section>

          {/* Hébergement */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Hébergement</h2>
            <div className="space-y-3 text-gray-600 dark:text-gray-300">
              <p>
                <strong className="text-gray-900 dark:text-white">Hébergeur :</strong> Vercel Inc.
              </p>
              <p>
                <strong className="text-gray-900 dark:text-white">Siège social :</strong> 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis
              </p>
              <p>
                <strong className="text-gray-900 dark:text-white">Site web :</strong> <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700">vercel.com</a>
              </p>
            </div>
          </section>

          {/* Propriété intellectuelle */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Propriété Intellectuelle</h2>
            <div className="space-y-4 text-gray-600 dark:text-gray-300">
              <p>
                L&apos;ensemble du contenu de ce site (structure, textes, logos, images, vidéos, éléments graphiques, etc.) est la propriété exclusive de AGRI POINT SERVICE SAS, sauf mention contraire.
              </p>
              <p>
                Toute reproduction, représentation, modification, publication, adaptation de tout ou partie des éléments du site, quel que soit le moyen ou le procédé utilisé, est interdite, sauf autorisation écrite préalable de AGRI POINT SERVICE SAS.
              </p>
              <p>
                Toute exploitation non autorisée du site ou de l&apos;un quelconque des éléments qu&apos;il contient sera considérée comme constitutive d&apos;une contrefaçon et poursuivie conformément aux dispositions des articles L.335-2 et suivants du Code de Propriété Intellectuelle.
              </p>
            </div>
          </section>

          {/* Limitation de responsabilité */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Limitation de Responsabilité</h2>
            <div className="space-y-4 text-gray-600 dark:text-gray-300">
              <p>
                Les informations contenues sur ce site sont aussi précises que possible et le site est périodiquement remis à jour, mais peut toutefois contenir des inexactitudes, des omissions ou des lacunes.
              </p>
              <p>
                AGRI POINT SERVICE SAS ne pourra être tenu responsable des dommages directs et indirects causés au matériel de l&apos;utilisateur, lors de l&apos;accès au site, et résultant soit de l&apos;utilisation d&apos;un matériel ne répondant pas aux spécifications techniques requises, soit de l&apos;apparition d&apos;un bug ou d&apos;une incompatibilité.
              </p>
              <p>
                AGRI POINT SERVICE SAS ne pourra également être tenu responsable des dommages indirects (tels par exemple qu&apos;une perte de marché ou perte d&apos;une chance) consécutifs à l&apos;utilisation du site.
              </p>
            </div>
          </section>

          {/* Liens hypertextes */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Liens Hypertextes</h2>
            <div className="space-y-4 text-gray-600 dark:text-gray-300">
              <p>
                Des liens hypertextes peuvent renvoyer vers d&apos;autres sites que le site www.agri-ps.com. AGRI POINT SERVICE SAS dégage toute responsabilité dans le cas où le contenu de ces sites contreviendrait aux législations en vigueur.
              </p>
              <p>
                La mise en place d&apos;un lien hypertexte vers le site www.agri-ps.com est soumise à l&apos;accord préalable de AGRI POINT SERVICE SAS.
              </p>
            </div>
          </section>

          {/* Cookies */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Cookies</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Ce site utilise des cookies pour améliorer l&apos;expérience utilisateur et réaliser des statistiques de visites. Pour plus d&apos;informations, veuillez consulter notre <Link href="/confidentialite" className="text-primary-600 hover:text-primary-700 font-semibold">Politique de Confidentialité</Link>.
            </p>
          </section>

          {/* Droit applicable */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Droit Applicable et Juridiction Compétente</h2>
            <div className="space-y-4 text-gray-600 dark:text-gray-300">
              <p>
                Les présentes mentions légales sont régies par le droit camerounais. Tout litige relatif à l&apos;utilisation du site www.agri-ps.com est soumis à la compétence exclusive des tribunaux de Yaoundé, Cameroun.
              </p>
            </div>
          </section>

          {/* Contact pour questions */}
          <section className="border-t border-gray-200 dark:border-gray-700 pt-8">
            <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Questions ou Réclamations</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Pour toute question concernant ces mentions légales ou pour toute réclamation, vous pouvez nous contacter :
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a 
                  href="mailto:infos@agri-ps.com" 
                  className="inline-flex items-center justify-center px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition-colors"
                >
                  <Mail className="w-5 h-5 mr-2" />
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
