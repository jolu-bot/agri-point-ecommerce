/**
 * GUIDE D'INTÉGRATION - Comment intégrer les 12 librairies dans l'app existante
 * 
 * Cette documentation montre comment incorporer les nouvelles fonctionnalités
 * dans votre code existant.
 */

// ============================================================
// 1. INTÉGRER 2FA DANS LOGIN
// ============================================================

// app/auth/login/page.tsx - Ajouter cette logique:
/*
import { verifyTOTPToken } from '@/lib/auth-2fa';
import { TwoFactorForm } from '@/components/auth/TwoFactorForm';

const handleLogin = async (email: string, password: string, totpToken?: string) => {
  // 1. Vérifier email + password
  const user = await User.findOne({ email });
  if (!user || !bcrypt.compareSync(password, user.password)) {
    throw new Error('Invalid credentials');
  }

  // 2. Si 2FA est activé, vérifier le token
  if (user.twoFactorEnabled) {
    if (!totpToken) {
      // Afficher le formulaire pour entrer le token
      return { requiresTwoFactor: true };
    }

    const isValid = verifyTOTPToken(user.twoFactorSecret, totpToken);
    if (!isValid) {
      throw new Error('Invalid 2FA token');
    }
  }

  // 3. Créer la session
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
  return { token, user };
};
*/

// ============================================================
// 2. INTÉGRER TURNSTILE DANS LOGIN FORM
// ============================================================

// components/auth/LoginForm.tsx - Ajouter:
/*
import TurnstileCaptcha from '@/components/auth/TurnstileCaptcha';

const LoginForm = () => {
  const [turnstileToken, setTurnstileToken] = useState<string>('');

  const onSubmit = async (data: LoginInput) => {
    if (!turnstileToken) {
      setError('Please complete the CAPTCHA');
      return;
    }

    // Envoyer avec le token
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        ...data,
        turnstileToken,
      }),
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* ... autres champs ... */}
      <TurnstileCaptcha onToken={setTurnstileToken} />
      <button type="submit">Login</button>
    </form>
  );
};
*/

// ============================================================
// 3. AJOUTER RATE LIMITING AU LOGIN API
// ============================================================

// app/api/auth/login/route.ts - Ajouter au début:
/*
import { rateLimitMiddleware, LOGIN_RATE_LIMIT } from '@/lib/rate-limit-middleware';

export async function POST(request: NextRequest) {
  // Appliquer le rate limit
  const rateLimitResponse = await rateLimitMiddleware(
    request,
    LOGIN_RATE_LIMIT.maxRequests,
    LOGIN_RATE_LIMIT.windowMs
  );

  if (rateLimitResponse.status === 429) {
    return rateLimitResponse;
  }

  // ... reste de la logique de login ...
}
*/

// ============================================================
// 4. AJOUTER DEVICE FINGERPRINTING
// ============================================================

// lib/auth.ts - Ajouter:
/*
import { generateClientFingerprint, verifyFingerprint } from '@/lib/device-fingerprint';

export async function createLoginSession(userId: string, deviceFp: string) {
  // Sauvegarder le fingerprint avec la session
  const session = await Session.create({
    userId,
    deviceFingerprint: deviceFp,
    createdAt: new Date(),
  });
  
  return session;
}

export async function validateSessionDevice(
  sessionId: string,
  currentDeviceFp: string
) {
  const session = await Session.findById(sessionId);
  if (!session) return false;

  // Vérifier que le device n'a pas changé
  return verifyFingerprint(currentDeviceFp, session.deviceFingerprint);
}
*/

// ============================================================
// 5. VALIDER LES INPUTS AVEC ZOD
// ============================================================

// app/api/auth/login/route.ts - Remplacer la validation:
/*
import { validateInput, LoginSchema } from '@/lib/validation-schemas';

export async function POST(request: NextRequest) {
  const body = await request.json();

  // Valide et throw des erreurs formatées
  const input = await validateInput(LoginSchema, body);

  // body.email, body.password, body.turnstileToken sont garantis corrects
  // ...
}
*/

// ============================================================
// 6. UTILISER LES LOGS ROTATÉS
// ============================================================

// Partout dans votre code:
/*
import { logInfo, logError, logDebug, logMetrics } from '@/lib/logger-rotation';

// Logs simples
logInfo('User logged in', { userId: user._id, email: user.email });
logError('Login failed', error, { email, attempt: 5 });
logDebug('Processing order #123');

// Logs de métrique API
logMetrics({
  endpoint: '/api/auth/login',
  method: 'POST',
  statusCode: 200,
  responseTime: 145,
  userId: user._id,
});
*/

// ============================================================
// 7. CONFIGURATION ENVIRONNEMENT
// ============================================================

// .env.local - Ajouter les variables:
/*
# 2FA
NEXT_PUBLIC_2FA_ENABLED=true

# Turnstile
NEXT_PUBLIC_TURNSTILE_SITE_KEY=abc123...
TURNSTILE_SECRET_KEY=xyz789...

# Redis
REDIS_URL=https://...
REDIS_TOKEN=...

# MongoDB Backup
MONGODB_BACKUP_ENABLED=true
AZURE_STORAGE_CONNECTION_STRING=...

# Logging
LOG_LEVEL=info
LOG_FOLDER=./logs
*/

// ============================================================
// 8. CRON JOBS
// ============================================================

// Dans votre système de cron (GitHub Actions, Vercel Cron, AWS Lambda, etc):
/*
# Tous les jours à 2 AM
0 2 * * * npm run cron:backup

# Chaque minute (pour scheduled publishing)
* * * * * npm run cron:publish
*/

// ============================================================
// 9. ADMIN IMPERSONATION
// ============================================================

// Créer une route admin pour impersonater:
/*
POST /api/admin/impersonate
{
  "userId": "user_id_to_impersonate",
  "reason": "Bug investigation",
  "duration": 60
}

Response:
{
  "session": {
    "id": "session_id",
    "adminId": "admin_id",
    "userId": "user_id",
    "expiresAt": "2026-03-03T15:00:00Z"
  }
}

// Utiliser cette session pour:
// 1. Créer un cookie special admin_session
// 2. Les requêtes contiennent x-impersonated-user-id
// 3. Logs audit automatiques
*/

// ============================================================
// 10. BULK OPERATIONS
// ============================================================

// POST /api/admin/bulk
/*
{
  "ids": ["product_1", "product_2", "product_3"],
  "action": "publish",
  "resourceType": "products"
}

Response:
{
  "success": true,
  "result": {
    "success": 3,
    "failed": 0,
    "totalTime": 245
  }
}
*/

// ============================================================
// 11. CMS PREVIEW MODE
// ============================================================

// components/PagePreview.tsx
/*
import { createPreviewSession, validatePreviewSession } from '@/lib/cms-preview-scheduling';

const PagePreview = ({ pageId, userId }) => {
  const [preview] = useState(() => {
    const session = createPreviewSession(userId, pageId, 'page');
    return session;
  });

  // Afficher le contenu non-publié
  return <Page id={pageId} isPreview={preview.isActive} />;
};
*/

// ============================================================
// 12. SCHEDULED PUBLISHING
// ============================================================

// models/Page.ts ou Page schema
/*
interface Page {
  // ... champs existants ...
  isPublished: boolean;
  publishedAt?: Date;
  scheduledPublishAt?: Date;  // NOUVEAU
}

// Utiliser:
const page = await Page.create({
  title: 'Future Article',
  content: '...',
  scheduledPublishAt: new Date('2026-03-04T10:00:00Z'),
  isPublished: false,
});

// Puis cron job publish automatiquement
*/

// ============================================================
// SUMMARY
// ============================================================

export const INTEGRATION_CHECKLIST = {
  'Phase 1 - APIs': {
    '2FA Setup': 'POST /api/auth/2fa/setup',
    '2FA Verify': 'POST /api/auth/2fa/verify',
    'Admin Impersonate': 'POST /api/admin/impersonate',
    'Bulk Operations': 'POST /api/admin/bulk',
  },
  'Phase 2 - Frontend': {
    'Add Turnstile CAPTCHA to login form': '✅',
    'Add 2FA verification form': '✅',
    'Add device fingerprinting to login': '✅',
  },
  'Phase 3 - Configuration': {
    'Update .env.local with new variables': '✅',
    'Setup MongoDB backup cron': '✅',
    'Setup scheduled publishing cron': '✅',
    'Add security headers middleware': '✅',
  },
  'Phase 4 - Testing': {
    'Test 2FA flow end-to-end': '⏳',
    'Test rate limiting (5 attempts)': '⏳',
    'Test bulk operations': '⏳',
  },
  'Phase 5 - Deployment': {
    'Production build': '⏳',
    'GitHub push': '⏳',
  },
};
