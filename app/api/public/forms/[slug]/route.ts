import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Form from '@/models/Form';
import FormSubmission from '@/models/FormSubmission';
import Security from '@/models/Security';

// Rate limiting simple (en mémoire)
const submissionRateLimit = new Map<string, number[]>();

function checkRateLimit(ip: string, maxPerHour: number = 5): boolean {
  const now = Date.now();
  const hourAgo = now - 60 * 60 * 1000;
  
  // Récupérer les timestamps de cette IP
  let timestamps = submissionRateLimit.get(ip) || [];
  
  // Filtrer les anciens
  timestamps = timestamps.filter(t => t > hourAgo);
  
  // Vérifier la limite
  if (timestamps.length >= maxPerHour) {
    return false;
  }
  
  // Ajouter le nouveau timestamp
  timestamps.push(now);
  submissionRateLimit.set(ip, timestamps);
  
  return true;
}

// Détecter le type de device
function detectDevice(userAgent: string): 'desktop' | 'mobile' | 'tablet' {
  if (/mobile/i.test(userAgent)) return 'mobile';
  if (/tablet|ipad/i.test(userAgent)) return 'tablet';
  return 'desktop';
}

// Extraire le navigateur
function detectBrowser(userAgent: string): string {
  if (/chrome/i.test(userAgent)) return 'Chrome';
  if (/firefox/i.test(userAgent)) return 'Firefox';
  if (/safari/i.test(userAgent)) return 'Safari';
  if (/edge/i.test(userAgent)) return 'Edge';
  return 'Unknown';
}

// Extraire l'OS
function detectOS(userAgent: string): string {
  if (/windows/i.test(userAgent)) return 'Windows';
  if (/macintosh|mac os x/i.test(userAgent)) return 'MacOS';
  if (/linux/i.test(userAgent)) return 'Linux';
  if (/android/i.test(userAgent)) return 'Android';
  if (/ios|iphone|ipad/i.test(userAgent)) return 'iOS';
  return 'Unknown';
}

// GET - Récupérer les informations du formulaire (pour affichage public)
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await connectDB();
    
    const { slug } = params;
    
    if (!slug) {
      return NextResponse.json(
        { error: 'Slug requis' },
        { status: 400 }
      );
    }
    
    // Trouver le formulaire publié
    const form = await Form.findOne({
      slug,
      status: 'published',
    }).select('-createdBy -updatedBy');
    
    if (!form) {
      return NextResponse.json(
        { error: 'Formulaire non trouvé ou non publié' },
        { status: 404 }
      );
    }
    
    // Incrémenter les vues
    form.stats.views = (form.stats.views || 0) + 1;
    await form.save();
    
    // Ne pas exposer certaines informations sensibles
    const publicForm = {
      _id: form._id,
      name: form.name,
      slug: form.slug,
      description: form.description,
      fields: form.fields,
      settings: {
        submitButtonText: form.settings.submitButtonText,
        successMessage: form.settings.successMessage,
        allowMultipleSubmissions: form.settings.allowMultipleSubmissions,
        requireAuth: form.settings.requireAuth,
        enableCaptcha: form.settings.enableCaptcha,
        captchaType: form.settings.captchaType,
        captchaSiteKey: form.settings.captchaSiteKey,
        theme: form.settings.theme,
      },
      seo: form.seo,
    };
    
    return NextResponse.json({ form: publicForm });
    
  } catch (error: any) {
    console.error('Erreur GET /api/public/forms/[slug]:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// POST - Soumettre le formulaire
export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await connectDB();
    
    const { slug } = params;
    
    if (!slug) {
      return NextResponse.json(
        { error: 'Slug requis' },
        { status: 400 }
      );
    }
    
    // Trouver le formulaire
    const form = await Form.findOne({
      slug,
      status: 'published',
    });
    
    if (!form) {
      return NextResponse.json(
        { error: 'Formulaire non trouvé ou non publié' },
        { status: 404 }
      );
    }
    
    // Vérifier si le formulaire est fermé
    if (form.status === 'closed' || form.closedAt) {
      return NextResponse.json(
        { error: 'Ce formulaire est fermé' },
        { status: 403 }
      );
    }
    
    // Limite de soumissions atteinte ?
    if (form.settings.maxSubmissions && 
        form.stats.totalSubmissions >= form.settings.maxSubmissions) {
      return NextResponse.json(
        { error: 'Limite de soumissions atteinte' },
        { status: 403 }
      );
    }
    
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';
    
    const maxPerHour = form.settings.rateLimit?.maxPerHour || 5;
    
    if (!checkRateLimit(ip, maxPerHour)) {
      return NextResponse.json(
        { error: 'Trop de soumissions. Veuillez réessayer plus tard.' },
        { status: 429 }
      );
    }
    
    const body = await request.json();
    const { data, completionTime, captchaToken } = body;
    
    if (!data) {
      return NextResponse.json(
        { error: 'Données manquantes' },
        { status: 400 }
      );
    }
    
    // Vérifier le captcha si activé
    if (form.settings.enableCaptcha && form.settings.captchaType === 'recaptcha') {
      // TODO: Implémenter la vérification reCAPTCHA
      // Pour l'instant, juste vérifier que le token existe
      if (!captchaToken) {
        return NextResponse.json(
          { error: 'Vérification captcha requise' },
          { status: 400 }
        );
      }
    }
    
    // Valider les champs requis
    const missingFields: string[] = [];
    
    form.fields.forEach(field => {
      if (field.required && field.type !== 'section' && field.type !== 'html') {
        const value = data[field.name];
        
        if (value === undefined || value === null || value === '') {
          missingFields.push(field.label);
        }
      }
    });
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          error: 'Champs requis manquants',
          missingFields,
        },
        { status: 400 }
      );
    }
    
    // Récupérer les métadonnées
    const userAgent = request.headers.get('user-agent') || '';
    const referrer = request.headers.get('referer') || '';
    const locale = request.headers.get('accept-language')?.split(',')[0] || 'fr';
    
    const metadata = {
      ip,
      userAgent,
      referrer,
      locale,
      device: detectDevice(userAgent),
      browser: detectBrowser(userAgent),
      os: detectOS(userAgent),
      completionTime,
    };
    
    // Créer la soumission
    const submission = new FormSubmission({
      formId: form._id,
      formSlug: form.slug,
      formName: form.name,
      data,
      metadata,
      status: 'pending',
      isRead: false,
    });
    
    await submission.save();
    
    // Mettre à jour les stats du formulaire
    form.stats.totalSubmissions = (form.stats.totalSubmissions || 0) + 1;
    form.stats.lastSubmissionAt = new Date();
    
    // Calculer le temps moyen de complétion
    if (completionTime) {
      const currentAvg = form.stats.averageCompletionTime || 0;
      const totalSubs = form.stats.totalSubmissions;
      form.stats.averageCompletionTime = 
        ((currentAvg * (totalSubs - 1)) + completionTime) / totalSubs;
    }
    
    await form.save();
    
    // Envoyer les notifications email si configuré
    if (form.settings.sendEmailNotification && form.settings.notificationEmails) {
      // TODO: Implémenter l'envoi d'email
      // Pour l'instant, juste logger
      console.log('Email notification should be sent to:', form.settings.notificationEmails);
    }
    
    // Réponse automatique
    if (form.settings.sendAutoReply && form.settings.autoReplyEmail) {
      const recipientEmail = data[form.settings.autoReplyEmail];
      if (recipientEmail) {
        // TODO: Implémenter l'envoi d'email auto-reply
        console.log('Auto-reply should be sent to:', recipientEmail);
      }
    }
    
    // Déclencher les webhooks
    if (form.settings.webhooks && form.settings.webhooks.length > 0) {
      form.settings.webhooks.forEach(async webhook => {
        if (webhook.active) {
          try {
            await fetch(webhook.url, {
              method: webhook.method,
              headers: {
                'Content-Type': 'application/json',
                ...webhook.headers,
              },
              body: JSON.stringify({
                formSlug: form.slug,
                formName: form.name,
                submissionId: submission._id,
                data: submission.data,
                submittedAt: submission.createdAt,
              }),
            });
          } catch (error) {
            console.error('Webhook error:', error);
          }
        }
      });
    }
    
    // Log de sécurité
    await Security.create({
      type: 'audit',
      severity: 'info',
      action: 'submit',
      resource: 'form',
      resourceId: form._id.toString(),
      details: {
        formName: form.name,
        submissionId: submission._id.toString(),
        ip,
        spamScore: submission.score,
      },
    });
    
    return NextResponse.json({
      success: true,
      message: form.settings.successMessage || 'Formulaire soumis avec succès !',
      submissionId: submission._id,
      redirectUrl: form.settings.redirectUrl,
    }, { status: 201 });
    
  } catch (error: any) {
    console.error('Erreur POST /api/public/forms/[slug]:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}
