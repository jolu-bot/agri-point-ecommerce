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
import { useLanguage } from '@/contexts/LanguageContext';

// Social media links — no translation needed
const socialMediaLinks = [
  { name: 'Facebook',  icon: Facebook,  url: 'https://facebook.com/agripoint' },
  { name: 'Instagram', icon: Instagram, url: 'https://instagram.com/agripoint' },
  { name: 'Twitter',   icon: Twitter,   url: 'https://twitter.com/agripoint' },
  { name: 'LinkedIn',  icon: Linkedin,  url: 'https://linkedin.com/company/agripoint' },
  { name: 'YouTube',   icon: Youtube,   url: 'https://youtube.com/agripoint' },
];

interface FormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

export default function ContactPage() {
  const { locale, T } = useLanguage();
  const en = locale === 'en';

  const [formData, setFormData] = useState<FormData>({
    name: '', email: '', phone: '', subject: '', message: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Bilingual page content — rebuilt on each render based on locale
  const pageContent = {
    hero: {
      badge:       en ? '📞 We Are Here For You'  : '📞 Nous Sommes Là Pour Vous',
      title:       en ? 'CONTACT US'               : 'CONTACTEZ-NOUS',
      subtitle:    en ? "A question? A project? Let's talk!" : 'Une question ? Un projet ? Parlons-en !',
      description: en
        ? 'Our team of experts is here to listen to all your questions and support you in your agricultural projects.'
        : "Notre équipe d'experts est à votre écoute pour répondre à toutes vos questions et vous accompagner dans vos projets agricoles.",
    },

    contactInfo: {
      headquarters: {
        title:    'AGRIPOINT SERVICES SAS',
        address:  'Quartier Fouda',
        city:     'B.P. 5111 Yaoundé, Cameroun',
        phone:    '(+237) 657 39 39 39',
        whatsapp: '+237657393939',
        email:    'infos@agri-ps.com',
        hours: en
          ? 'Mon-Fri: 8:00 AM - 5:00 PM\nSaturday: 8:00 AM - 1:00 PM'
          : 'Lun-Ven: 8h00 - 17h00\nSamedi: 8h00 - 13h00',
      },
      branches: [
        {
          city:    'Yaoundé',
          address: 'Quartier Fouda, B.P. 5111',
          phone:   '(+237) 657 39 39 39',
          email:   'infos@agri-ps.com',
        },
        {
          city:    en ? 'WhatsApp Support'      : 'Support WhatsApp',
          address: en ? 'Available 7 days/7'    : 'Disponible 7j/7',
          phone:   '(+237) 657 39 39 39',
          email:   'infos@agri-ps.com',
        },
        {
          city:    en ? 'National Delivery'         : 'Livraison Nationale',
          address: en ? 'All regions of Cameroon'   : 'Toutes les régions du Cameroun',
          phone:   '(+237) 657 39 39 39',
          email:   'infos@agri-ps.com',
        },
        {
          city:    en ? 'Website'  : 'Site Web',
          address: 'www.agri-ps.com',
          phone:   '(+237) 657 39 39 39',
          email:   'infos@agri-ps.com',
        },
      ],
    },

    departments: [
      {
        icon:        Headphones,
        title:       en ? 'Customer Service'                        : 'Service Client',
        description: en ? 'Questions about your orders and products' : 'Questions sur vos commandes et produits',
        email:       'support@agri-ps.com',
        phone:       '(+237) 657 39 39 39',
        hours:       en ? 'Mon-Sat: 8am-6pm' : 'Lun-Sam: 8h-18h',
        color:       'blue',
      },
      {
        icon:        Users,
        title:       en ? 'Agricultural Advisory'          : 'Conseil Agricole',
        description: en ? 'Technical support and training' : 'Accompagnement technique et formations',
        email:       'infos@agri-ps.com',
        phone:       '(+237) 657 39 39 39',
        hours:       en ? 'Mon-Fri: 8am-5pm' : 'Lun-Ven: 8h-17h',
        color:       'green',
      },
      {
        icon:        Building2,
        title:       en ? 'Partnerships'                           : 'Partenariats',
        description: en ? 'Collaboration and business opportunities' : 'Collaboration et opportunités business',
        email:       'contact@agri-ps.com',
        phone:       '(+237) 657 39 39 39',
        hours:       en ? 'Mon-Fri: 9am-4pm' : 'Lun-Ven: 9h-16h',
        color:       'purple',
      },
      {
        icon:        MessageSquare,
        title:       'WhatsApp Direct',
        description: en ? 'Quick response via WhatsApp' : 'Réponse rapide via WhatsApp',
        email:       'infos@agri-ps.com',
        phone:       '(+237) 657 39 39 39',
        hours:       en ? 'Mon-Sat: 8am-8pm' : 'Lun-Sam: 8h-20h',
        color:       'amber',
      },
    ],

    faq: [
      {
        question: en ? 'What services does AGRIPOINT SERVICES offer?' : 'Quels services propose AGRIPOINT SERVICES ?',
        answer: en
          ? 'We are an agropastoral facilitator. Our 3 flagship programs — Produce More, Earn More, Better Living — support producers from pre-production to commercialization.'
          : 'Nous sommes un facilitateur agropastoral. Nos 3 programmes phares — Produire Plus, Gagner Plus, Mieux Vivre — accompagnent les producteurs de la pré-production à la commercialisation.',
      },
      {
        question: en ? 'How do I become a member of a CMA?' : "Comment devenir membre d'une CMA ?",
        answer: en
          ? 'Fill in the online membership form or visit one of our agencies. Membership in the Agricultural Mutual Funds (CMA) is open to all producers.'
          : "Remplissez le formulaire d'adhésion en ligne ou visitez l'une de nos agences. L'adhésion aux Caisses Mutuelles Agricoles est ouverte à tous les producteurs.",
      },
      {
        question: en ? 'Do you offer training?' : 'Proposez-vous des formations ?',
        answer: en
          ? 'Yes, free monthly training for our members + paid training open to all on cultivation techniques, financial management and project development.'
          : 'Oui, formations gratuites mensuelles pour nos adhérents + formations payantes ouvertes à tous sur les techniques culturales, la gestion financière et le montage de projets.',
      },
      {
        question: en ? 'How to participate in the Agricultural Campaign 2026?' : 'Comment participer à la Campagne Agricole 2026 ?',
        answer: en
          ? 'Contact us via this form or by phone. We will guide you through the registration and payment procedures.'
          : "Contactez-nous via ce formulaire ou par téléphone. Nous vous guiderons dans les démarches d'inscription et de versement.",
      },
    ],
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    // Validation
    if (!formData.name || !formData.email || !formData.message) {
      setStatus('error');
      setErrorMessage(en ? 'Please fill in all required fields' : 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    // ✅ Vrai appel API
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || (en ? 'Error sending message' : "Erreur lors de l'envoi"));
      }

      setStatus('success');
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });

      // Reset success message after 5 seconds
      setTimeout(() => setStatus('idle'), 5000);
    } catch (error: any) {
      setStatus('error');
      setErrorMessage(error.message || (en ? 'An error occurred. Please try again.' : 'Une erreur est survenue. Veuillez réessayer.'));
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
                <h2 className="text-3xl font-bold mb-6">{T.contact.formTitle}</h2>

                {status === 'success' && (
                  <div className="mb-6 p-4 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 flex-shrink-0" />
                    <p>{en ? "Message sent successfully! We'll reply within 24h." : 'Message envoyé avec succès ! Nous vous répondrons dans les 24h.'}</p>
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
                      {T.contact.formName.replace(' *', '')} <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder={T.contact.namePlaceholder}
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold mb-2">
                      {T.contact.formEmail.replace(' *', '')} <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder={T.contact.emailPlaceholder}
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-semibold mb-2">
                      {T.contact.formPhone}
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder={T.contact.phonePlaceholder}
                    />
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-semibold mb-2">
                      {T.contact.formSubject.replace(' *', '')}
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="">{en ? 'Select a subject' : 'Sélectionnez un sujet'}</option>
                      <option value="services">{en ? 'Our facilitation services'     : 'Nos services de facilitation'}</option>
                      <option value="technique">{en ? 'Technical advice'             : 'Conseil technique'}</option>
                      <option value="adhesion">{en ? 'CMA Membership / Partnership'  : 'Adhésion CMA / Partenariat'}</option>
                      <option value="campagne">{en ? 'Agricultural Campaign 2026'    : 'Campagne Agricole 2026'}</option>
                      <option value="information">{en ? 'Information request'         : "Demande d'information"}</option>
                      <option value="autre">{en ? 'Other' : 'Autre'}</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-semibold mb-2">
                      {T.contact.formMessage.replace(' *', '')} <span className="text-red-600">*</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      className="w-full px-4 py-3 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                      placeholder={T.contact.messagePlaceholder}
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
                        {en ? 'Sending...' : 'Envoi en cours...'}
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        {T.contact.formSend}
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
                  <span className="leading-tight">
                    {pageContent.contactInfo.headquarters.title}
                    <br />
                    <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                      {en ? 'Trusted partner in the agropastoral sector' : 'Partenaire sûr du secteur agropastoral'}
                    </span>
                  </span>
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
                      <p className="font-semibold">{en ? 'Phone' : 'Téléphone'}</p>
                      <p className="text-gray-600 dark:text-gray-300">{pageContent.contactInfo.headquarters.phone}</p>
                      <p className="text-gray-600 dark:text-gray-300">(+237) 651 92 09 20</p>
                      <a href="https://wa.me/237657393939" target="_blank" rel="noopener noreferrer" className="text-sm text-green-600 hover:underline flex items-center gap-1 mt-1">💬 WhatsApp: 657 39 39 39</a>
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
                      <p className="font-semibold">{en ? 'Opening hours' : 'Horaires'}</p>
                      <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line">{pageContent.contactInfo.headquarters.hours}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Branches / Contact Channels */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
                <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Globe className="w-6 h-6 text-green-600" />
                  {en ? 'Our Contact Channels' : 'Nos Canaux de Contact'}
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
                <h3 className="text-2xl font-bold mb-6">{en ? 'Follow us' : 'Suivez-nous'}</h3>
                <div className="flex flex-wrap gap-3">
                  {socialMediaLinks.map((social, index) => (
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
            <h2 className="text-4xl font-bold mb-4">{en ? 'Contact the Right Department' : 'Contactez le Bon Service'}</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">{en ? 'For a quick and tailored response' : 'Pour une réponse rapide et adaptée'}</p>
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
            <h2 className="text-4xl font-bold mb-4">{en ? 'Frequently Asked Questions' : 'Questions Fréquentes'}</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">{en ? 'Quick answers to your questions' : 'Réponses rapides à vos questions'}</p>
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
                  <span className="font-semibold pr-4 text-gray-900 dark:text-white">{item.question}</span>
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
            <p className="text-gray-600 dark:text-gray-400 mb-4">{en ? "Can't find the answer?" : 'Vous ne trouvez pas la réponse ?'}</p>
            <a
              href="#contact-form"
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-all"
            >
              <MessageSquare className="w-5 h-5" />
              {en ? 'Ask your question' : 'Posez votre question'}
            </a>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-emerald-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">{en ? 'Need Immediate Help?' : "Besoin d'Aide Immédiate ?"}</h2>
          <p className="text-xl mb-8 opacity-90">
            {en
              ? 'Our team is available on WhatsApp to answer your urgent questions'
              : 'Notre équipe est disponible par WhatsApp pour répondre à vos questions urgentes'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={`https://wa.me/${pageContent.contactInfo.headquarters.whatsapp.replace(/\s/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 bg-white text-green-600 hover:bg-gray-100 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-5 h-5" />
              {en ? 'Contact on WhatsApp' : 'Contacter sur WhatsApp'}
            </a>
            <Link
              href="/a-propos"
              className="px-8 py-4 border-2 border-white text-white hover:bg-white hover:text-green-600 rounded-lg font-semibold transition-all"
            >
              {en ? 'Learn more about us' : 'En savoir plus sur nous'}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
