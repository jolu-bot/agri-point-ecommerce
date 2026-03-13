import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Calendar, MapPin, Users, Clock } from 'lucide-react';
import dbConnect from '@/lib/db';
import Event from '@/models/Event';
import EventRegistrationForm from './EventRegistrationForm';

// ---------------------------------------------------------------------------
// Sanitisation HTML côté serveur — retire scripts et handlers inline
// ---------------------------------------------------------------------------
function sanitizeHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/\son\w+="[^"]*"/gi, '')
    .replace(/\son\w+='[^']*'/gi, '')
    .replace(/javascript:[^"'`\s>]*/gi, 'javascript:void(0)');
}

// ---------------------------------------------------------------------------
// Metadata dynamique par événement
// ---------------------------------------------------------------------------
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  await dbConnect();
  const event = await Event.findOne({ slug, status: 'published' }).lean() as any;
  if (!event) return { title: 'Événement | AGRIPOINT SERVICES' };

  const description =
    event.shortDescription ||
    (event.description ? event.description.replace(/<[^>]*>/g, '').slice(0, 155) : '');

  return {
    title: `${event.title} | AGRIPOINT SERVICES`,
    description,
    openGraph: {
      title: event.title,
      description,
      images: event.featuredImage ? [event.featuredImage] : [],
      type: 'website',
      url: `/evenements/${slug}`,
      siteName: 'AGRIPOINT SERVICES',
      locale: 'fr_FR',
    },
    twitter: {
      card: 'summary_large_image',
      title: event.title,
      description,
      images: event.featuredImage ? [event.featuredImage] : [],
    },
    alternates: { canonical: `/evenements/${slug}` },
  };
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  await dbConnect();
  const event = await Event.findOne({ slug, status: 'published' }).lean() as any;
  if (!event) notFound();

  // JSON-LD Event schema
  const eventLd = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.title,
    startDate: event.startDate,
    endDate: event.endDate,
    description: event.shortDescription || event.title,
    ...(event.featuredImage && { image: event.featuredImage }),
    location:
      event.location?.type === 'physical'
        ? {
            '@type': 'Place',
            name: event.location.name || event.location.city || 'Yaoundé',
            address: {
              '@type': 'PostalAddress',
              addressLocality: event.location.city || 'Yaoundé',
              addressCountry: 'CM',
            },
          }
        : {
            '@type': 'VirtualLocation',
            url: event.location?.onlineUrl || 'https://agri-ps.com/evenements',
          },
    organizer: {
      '@type': 'Organization',
      name: 'AGRIPOINT SERVICES SARL',
      url: 'https://agri-ps.com',
    },
    offers: {
      '@type': 'Offer',
      price: event.pricing?.isFree ? '0' : String(event.pricing?.price ?? '0'),
      priceCurrency: event.pricing?.currency || 'XAF',
      availability: 'https://schema.org/InStock',
      url: `https://agri-ps.com/evenements/${slug}`,
    },
  };

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Accueil', item: 'https://agri-ps.com' },
      { '@type': 'ListItem', position: 2, name: 'Événements', item: 'https://agri-ps.com/evenements' },
      { '@type': 'ListItem', position: 3, name: event.title, item: `https://agri-ps.com/evenements/${slug}` },
    ],
  };

  const safeDescription = sanitizeHtml(event.description || '');

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(eventLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
        <div className="max-w-4xl mx-auto">

          {/* Image principale */}
          {event.featuredImage && (
            <div className="relative h-96 rounded-xl overflow-hidden mb-8">
              <Image
                src={event.featuredImage}
                alt={event.title}
                fill
                sizes="(max-width:896px) 100vw, 896px"
                className="object-cover"
                priority
              />
            </div>
          )}

          {/* Détails */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">{event.title}</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-600" />
                {new Date(event.startDate).toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-600" />
                {new Date(event.startDate).toLocaleTimeString('fr-FR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
              {event.location?.type === 'physical' && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-emerald-600" />
                  {event.location.name || event.location.city}
                </div>
              )}
              {event.capacity && (
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-emerald-600" />
                  {event.currentAttendees ?? 0} / {event.capacity} inscrits
                </div>
              )}
            </div>

            {/* Description sanitisée côté serveur */}
            <div
              className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300"
              dangerouslySetInnerHTML={{ __html: safeDescription }}
            />
          </div>

          {/* Formulaire d'inscription — client component */}
          <EventRegistrationForm
            slug={slug}
            collectPhone={event.registrationOptions?.collectPhoneNumber ?? false}
            isFree={event.pricing?.isFree ?? true}
            price={event.pricing?.price}
            currency={event.pricing?.currency}
          />
        </div>
      </div>
    </>
  );
}
