'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  Building2,
  Users,
  Headphones,
  Globe,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube
} from 'lucide-react';

// Contenu modifiable facilement
const pageContent = {
  hero: {
    badge: "📞 Nous Sommes Là Pour Vous",
    title: "CONTACTEZ-NOUS",
    subtitle: "Une question ? Un projet ? Parlons-en !",
    description: "Notre équipe d'experts est à votre écoute pour répondre à toutes vos questions et vous accompagner dans vos projets agricoles."
  },

  contactInfo: {
    headquarters: {
      title: "Siège Social - Yaoundé",
      address: "Bastos, Rue de l'Agriculture",
      city: "BP 12345, Yaoundé, Cameroun",
      phone: "+237 6 XX XX XX XX",
      whatsapp: "+237 6 XX XX XX XX",
      email: "contact@agri-ps.com",
      hours: "Lun-Ven: 8h00 - 17h00\nSamedi: 8h00 - 13h00"
    },
    
    branches: [
      {
        city: "Douala",
        address: "Bonapriso, Avenue de la Liberté",
        phone: "+237 6 XX XX XX XX",
        email: "douala@agri-ps.com"
      },
      {
        city: "Bafoussam",
        address: "Centre-ville, Marché A",
        phone: "+237 6 XX XX XX XX",
        email: "bafoussam@agri-ps.com"
      },
      {
        city: "Garoua",
        address: "Quartier Dougoï",
        phone: "+237 6 XX XX XX XX",
        email: "garoua@agri-ps.com"
      },
      {
        city: "Maroua",
        address: "Centre commercial",
        phone: "+237 6 XX XX XX XX",
        email: "maroua@agri-ps.com"
      }
    ]
  },

  departments: [
    {
      icon: Headphones,
      title: "Service Client",
      description: "Questions sur vos commandes et produits",
      email: "support@agri-ps.com",
      phone: "+237 6 XX XX XX XX",
      hours: "Lun-Sam: 8h-18h",
      color: "blue"
    },
    {
      icon: Users,
      title: "Conseil Agricole",
      description: "Accompagnement technique et formations",
      email: "conseil@agri-ps.com",
      phone: "+237 6 XX XX XX XX",
      hours: "Lun-Ven: 8h-17h",
      color: "green"
    },
    {
      icon: Building2,
      title: "Partenariats",
      description: "Collaboration et opportunités business",
      email: "partenariat@agri-ps.com",
      phone: "+237 6 XX XX XX XX",
      hours: "Lun-Ven: 9h-16h",
      color: "purple"
    },
    {
      icon: MessageSquare,
      title: "Service Presse",
      description: "Demandes médias et communication",
      email: "presse@agri-ps.com",
      phone: "+237 6 XX XX XX XX",
      hours: "Lun-Ven: 9h-17h",
      color: "amber"
    }
  ],

  socialMedia: [
    { name: "Facebook", icon: Facebook, url: "https://facebook.com/agripoint", color: "blue" },
    { name: "Instagram", icon: Instagram, url: "https://instagram.com/agripoint", color: "pink" },
    { name: "Twitter", icon: Twitter, url: "https://twitter.com/agripoint", color: "sky" },
    { name: "LinkedIn", icon: Linkedin, url: "https://linkedin.com/company/agripoint", color: "blue" },
    { name: "YouTube", icon: Youtube, url: "https://youtube.com/agripoint", color: "red" }
  ],

  faq: [
    {
      question: "Livrez-vous partout au Cameroun ?",
      answer: "Oui, nous livrons dans toutes les régions du Cameroun. Délai: 2-5 jours selon votre localisation."
    },
    {
      question: "Puis-je payer à la livraison ?",
      answer: "Oui, le paiement à la livraison est disponible pour toute commande."
    },
    {
      question: "Proposez-vous des formations ?",
      answer: "Oui, formations gratuites mensuelles pour nos adhérents + formations payantes ouvertes à tous."
    },
    {
      question: "Comment devenir adhérent ?",
      answer: "Remplissez le formulaire d'adhésion en ligne ou visitez l'une de nos agences. Adhésion gratuite !"
    }
  ]
};

interface FormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

export default function ContactPage() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    // Validation
    if (!formData.name || !formData.email || !formData.message) {
      setStatus('error');
      setErrorMessage('Veuillez remplir tous les champs obligatoires');
      return;
    }

    // Simuler l'envoi (à remplacer par vraie API)
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Ici, vous pourriez appeler votre API
      // const response = await fetch('/api/contact', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData)
      // });

      setStatus('success');
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      
      // Reset success message after 5 seconds
      setTimeout(() => setStatus('idle'), 5000);
    } catch {
      setStatus('error');
      setErrorMessage('Une erreur est survenue. Veuillez réessayer.');
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:via-green-900/20 dark:to-gray-900 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzEwYjk4MSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')]"></div>
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm font-semibold mb-6"
          >
            {pageContent.hero.badge}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6"
          >
            {pageContent.hero.title}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-2xl font-semibold text-green-600 dark:text-green-400 mb-4"
          >
            {pageContent.hero.subtitle}
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-xl text-gray-600 dark:text-gray-300"
          >
            {pageContent.hero.description}
          </motion.p>
        </div>
      </section>

      {/* Contact Form + Info */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-8 shadow-xl">
                <h2 className="text-3xl font-bold mb-6">Envoyez-nous un Message</h2>

                {status === 'success' && (
                  <div className="mb-6 p-4 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 flex-shrink-0" />
                    <p>Message envoyé avec succès ! Nous vous répondrons dans les 24h.</p>
                  </div>
                )}

                {status === 'error' && (
                  <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p>{errorMessage}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold mb-2">
                      Nom complet <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Ex: Jean Dupont"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold mb-2">
                      Email <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="jean.dupont@email.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-semibold mb-2">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="+237 6 XX XX XX XX"
                    />
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-semibold mb-2">
                      Sujet
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="">Sélectionnez un sujet</option>
                      <option value="commande">Question sur une commande</option>
                      <option value="produit">Information produit</option>
                      <option value="technique">Conseil technique</option>
                      <option value="adhesion">Adhésion / Services</option>
                      <option value="partenariat">Partenariat</option>
                      <option value="autre">Autre</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-semibold mb-2">
                      Message <span className="text-red-600">*</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      className="w-full px-4 py-3 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                      placeholder="Décrivez votre demande..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="w-full px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-bold text-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                  >
                    {status === 'loading' ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Envoyer le message
                      </>
                    )}
                  </button>
                </form>
              </div>
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              {/* Headquarters */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
                <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Building2 className="w-6 h-6 text-green-600" />
                  {pageContent.contactInfo.headquarters.title}
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold">{pageContent.contactInfo.headquarters.address}</p>
                      <p className="text-gray-600 dark:text-gray-300">{pageContent.contactInfo.headquarters.city}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold">Téléphone</p>
                      <p className="text-gray-600 dark:text-gray-300">{pageContent.contactInfo.headquarters.phone}</p>
                      <p className="text-sm text-green-600">WhatsApp: {pageContent.contactInfo.headquarters.whatsapp}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold">Email</p>
                      <p className="text-gray-600 dark:text-gray-300">{pageContent.contactInfo.headquarters.email}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold">Horaires</p>
                      <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line">{pageContent.contactInfo.headquarters.hours}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Branches */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
                <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Globe className="w-6 h-6 text-green-600" />
                  Nos Agences Régionales
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  {pageContent.contactInfo.branches.map((branch, index) => (
                    <div key={index} className="bg-white dark:bg-gray-700 rounded-lg p-4">
                      <h4 className="font-bold text-green-600 mb-1">{branch.city}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{branch.address}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{branch.phone}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Social Media */}
              <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl p-8 shadow-lg text-white">
                <h3 className="text-2xl font-bold mb-6">Suivez-nous</h3>
                <div className="flex flex-wrap gap-3">
                  {pageContent.socialMedia.map((social, index) => (
                    <a
                      key={index}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg flex items-center justify-center transition-all transform hover:scale-110"
                      title={social.name}
                    >
                      <social.icon className="w-6 h-6" />
                    </a>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Departments */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Contactez le Bon Service</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">Pour une réponse rapide et adaptée</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {pageContent.departments.map((dept, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-700 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all"
              >
                <div className={`w-14 h-14 rounded-lg bg-${dept.color}-100 dark:bg-${dept.color}-900/30 flex items-center justify-center mb-4`}>
                  <dept.icon className={`w-7 h-7 text-${dept.color}-600`} />
                </div>
                <h3 className="text-lg font-bold mb-2">{dept.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{dept.description}</p>
                <div className="space-y-2 text-sm">
                  <p className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <a href={`mailto:${dept.email}`} className="text-green-600 hover:underline">{dept.email}</a>
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span>{dept.phone}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-500 dark:text-gray-400">{dept.hours}</span>
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Questions Fréquentes</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">Réponses rapides à vos questions</p>
          </div>

          <div className="space-y-4">
            {pageContent.faq.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-50 dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <span className="font-semibold pr-4">{item.question}</span>
                  <span className="text-2xl text-green-600 flex-shrink-0">{activeFaq === index ? '−' : '+'}</span>
                </button>
                {activeFaq === index && (
                  <div className="px-6 py-4 bg-white dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
                    <p className="text-gray-600 dark:text-gray-300">{item.answer}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-600 dark:text-gray-400 mb-4">Vous ne trouvez pas la réponse ?</p>
            <a
              href="#contact-form"
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-all"
            >
              <MessageSquare className="w-5 h-5" />
              Posez votre question
            </a>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-emerald-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">Besoin d&apos;Aide Immédiate ?</h2>
          <p className="text-xl mb-8 opacity-90">
            Notre équipe est disponible par WhatsApp pour répondre à vos questions urgentes
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={`https://wa.me/${pageContent.contactInfo.headquarters.whatsapp.replace(/\s/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 bg-white text-green-600 hover:bg-gray-100 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-5 h-5" />
              Contacter sur WhatsApp
            </a>
            <Link
              href="/a-propos"
              className="px-8 py-4 border-2 border-white text-white hover:bg-white hover:text-green-600 rounded-lg font-semibold transition-all"
            >
              En savoir plus sur nous
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
