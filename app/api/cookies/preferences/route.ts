import { NextRequest, NextResponse } from 'next/server';

export interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
}

// GET - Récupérer les préférences actuelles
export async function GET(request: NextRequest) {
  try {
    // Essayer de lire depuis les cookies
    const cookieValue = request.cookies.get('cookie_preferences')?.value;
    
    if (cookieValue) {
      const preferences: CookiePreferences = JSON.parse(decodeURIComponent(cookieValue));
      return NextResponse.json({
        success: true,
        preferences,
        source: 'cookie',
      });
    }

    // Réponse par défaut
    return NextResponse.json({
      success: true,
      preferences: {
        necessary: true,
        analytics: false,
        marketing: false,
        preferences: false,
      },
      source: 'default',
    });
  } catch (error) {
    console.error('Failed to parse cookie preferences:', error);
    return NextResponse.json(
      { success: false, error: 'Invalid cookie format' },
      { status: 400 }
    );
  }
}

// POST - Sauvegarder les préférences
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const preferences: CookiePreferences = body.preferences;

    // Validation basique
    if (
      typeof preferences.necessary !== 'boolean' ||
      typeof preferences.analytics !== 'boolean' ||
      typeof preferences.marketing !== 'boolean' ||
      typeof preferences.preferences !== 'boolean'
    ) {
      return NextResponse.json(
        { success: false, error: 'Invalid preferences format' },
        { status: 400 }
      );
    }

    // S'assurer que les cookies nécessaires sont toujours activés
    preferences.necessary = true;

    // Créer la réponse avec le cookie
    const response = NextResponse.json({
      success: true,
      preferences,
      message: 'Cookie preferences saved',
    });

    // Sauvegarder en cookie HTTP-only pour la sécurité
    response.cookies.set({
      name: 'cookie_preferences',
      value: encodeURIComponent(JSON.stringify(preferences)),
      maxAge: 31536000, // 1 an en secondes
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      httpOnly: false, // Doit être accessible depuis le client
      sameSite: 'lax',
    });

    // Optionnel: Logger les préférences pour audit
    try {
      // Vous pouvez ajouter du logging ici pour l'audit RGPD
      // Ex: database log, Datadog, Sentry, etc.
      console.log('[COOKIE_PREFERENCES]', {
        timestamp: new Date().toISOString(),
        preferences,
        userAgent: request.headers.get('user-agent'),
        // Ne pas logger l'IP pour la confidentialité
      });
    } catch (logError) {
      // Silencieusement échouer le logging
      console.error('Failed to log cookie preferences:', logError);
    }

    return response;
  } catch (error) {
    console.error('Failed to save cookie preferences:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save preferences' },
      { status: 500 }
    );
  }
}

// DELETE - Réinitialiser les préférences
export async function DELETE(request: NextRequest) {
  try {
    const response = NextResponse.json({
      success: true,
      message: 'Cookie preferences reset',
    });

    // Supprimer le cookie
    response.cookies.set({
      name: 'cookie_preferences',
      value: '',
      maxAge: 0,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Failed to reset cookie preferences:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to reset preferences' },
      { status: 500 }
    );
  }
}
