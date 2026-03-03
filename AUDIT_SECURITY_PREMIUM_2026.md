# 🔒 AUDIT SÉCURITÉ & QUALITÉ PREMIUM 2026

**Date:** 3 Mars 2026  
**Projet:** AGRI POINT SERVICE E-Commerce  
**Objectif:** Atteindre le niveau **professionnel premium** moderne avec les dernières innovations 2026

---

## 📊 RÉSUMÉ EXÉCUTIF

### Note Globale Actuelle: **7.5/10** ⭐⭐⭐⭐⭐⭐⭐

| Domaine | Note Actuelle | Note Cible | Statut |
|---------|--------------|------------|--------|
| **Logging** | 8/10 ✅ | 9.5/10 | 🟢 Bon |
| **Authentification** | 7.5/10 ⚠️ | 9.5/10 | 🟡 Améliorer |
| **Sécurité Connexion** | 7/10 ⚠️ | 9.5/10 | 🟡 Améliorer |
| **Sécurité Globale** | 8/10 ✅ | 9.5/10 | 🟢 Bon |
| **Traçabilité** | 8.5/10 ✅ | 9.5/10 | 🟢 Excellent |
| **Gestion Cookies** | 6/10 ⚠️ | 9/10 | 🟠 Critique |
| **Base de Données** | 7.5/10 ⚠️ | 9.5/10 | 🟡 Améliorer |
| **Administration** | 8/10 ✅ | 9.5/10 | 🟢 Bon |
| **CMS** | 8.5/10 ✅ | 9.5/10 | 🟢 Excellent |

---

## 1️⃣ LOGGING (8/10 ✅)

### ✅ Points Forts Existants

```typescript
// ✅ Pino structured logging - Production-ready
import { logger, logRequest, logError, logPerformance } from '@/lib/logger';

// ✅ JSON structured logs pour production
// ✅ Pretty-printed logs pour dev
// ✅ Request/response tracking avec timing
// ✅ Performance monitoring (slow operation detection)
// ✅ Business event logging
// ✅ Intégration Sentry pour error tracking
```

#### Fonctionnalités Présentes:
- ✅ Pino (JSON structuré production, pretty dev)
- ✅ Niveaux de log: trace, debug, info, warn, error, fatal
- ✅ Request tracking avec requestId
- ✅ Performance tracking (opérations >1s flaggées SLOW)
- ✅ Sentry avec source maps
- ✅ Security event logging

### ⚠️ Lacunes Identifiées

1. **Pas de log aggregation centralisé** (ELK/Datadog/Sumo Logic)
2. **Pas de log rotation automatique** (logs peuvent croître infiniment)
3. **Pas de filtrage PII/GDPR** (mots de passe, tokens peuvent fuiter)
4. **Pas de contexte utilisateur enrichi** (device, geolocation, browser fingerprint)
5. **Pas d'alerting automatique** (erreurs critiques non notifiées en temps réel)

### 🚀 Recommandations Premium 2026

#### PRIORITÉ 1: Log Rotation & Retention Policy
```typescript
// lib/logger.ts
import pino from 'pino';
import { multistream } from 'pino-multi-stream';

// 📌 ROTATION: Max 100MB par fichier, 10 fichiers gardés (1GB total)
const rotatingFileStream = require('rotating-file-stream').createStream('app.log', {
  size: '100M',
  maxFiles: 10,
  path: '/var/log/agri-ps',
  compress: 'gzip'
});

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  redact: {
    paths: ['password', 'token', 'accessToken', 'refreshToken', 'secret', '*.password', '*.token'],
    censor: '[REDACTED]'
  },
  serializers: {
    req: (req) => ({
      id: req.id,
      method: req.method,
      url: req.url,
      // ⚠️ PAS de headers (peuvent contenir tokens)
    }),
    res: (res) => ({
      statusCode: res.statusCode
      // ⚠️ PAS de body (peut contenir données sensibles)
    })
  }
}, multistream([
  { stream: rotatingFileStream },
  { stream: process.stdout }
]));
```

#### PRIORITÉ 2: Intégration Datadog/Sumo Logic (Production SaaS)
```bash
# Installation
npm install @datadog/browser-logs @datadog/pino

# Configuration .env.production
DATADOG_CLIENT_TOKEN=pub_xxxxxxxxxx
DATADOG_SITE=datadoghq.eu
DATADOG_SERVICE=agri-ps-backend
DATADOG_ENV=production
```

```typescript
// lib/datadog-logger.ts
import { datadogLogs } from '@datadog/browser-logs';

datadogLogs.init({
  clientToken: process.env.DATADOG_CLIENT_TOKEN!,
  site: process.env.DATADOG_SITE!,
  service: 'agri-ps',
  env: process.env.NODE_ENV,
  forwardErrorsToLogs: true,
  sessionSampleRate: 100,
  beforeSend: (log) => {
    // Filtrer PII avant envoi
    log.password = undefined;
    log.token = undefined;
    return true;
  }
});

export const ddLogger = datadogLogs.logger;
```

#### PRIORITÉ 3: Alerting Automatique (Slack/Email)
```typescript
// lib/alerting.ts
import { IncomingWebhook } from '@slack/webhook';

const webhook = new IncomingWebhook(process.env.SLACK_WEBHOOK_URL!);

export async function alertCriticalError(error: Error, context: any) {
  if (process.env.NODE_ENV === 'production') {
    await webhook.send({
      text: `🚨 ERREUR CRITIQUE`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Erreur:* ${error.message}\n*Stack:* \`${error.stack?.slice(0, 200)}...\``
          }
        },
        {
          type: 'context',
          elements: [
            { type: 'mrkdwn', text: `*Endpoint:* ${context.endpoint}` },
            { type: 'mrkdwn', text: `*User:* ${context.userId || 'anonymous'}` }
          ]
        }
      ]
    });
  }
}

// Usage dans logError
export function logError(error: Error | string, context = {}) {
  const severity = context.severity || 'medium';
  
  logger.error({ error: error instanceof Error ? error.message : error, ...context });
  
  if (severity === 'critical') {
    alertCriticalError(error as Error, context);
  }
}
```

---

## 2️⃣ AUTHENTIFICATION (7.5/10 ⚠️)

### ✅ Points Forts Existants

```typescript
// ✅ JWT avec access (15min) + refresh tokens (7j)
// ✅ Cookies HttpOnly + Secure + SameSite=lax
// ✅ Email verification obligatoire
// ✅ Password strength validation
// ✅ Brute-force protection (5 tentatives max, lock 30min)
// ✅ Role-based permissions (admin, manager, redacteur, client)
// ✅ Account status workflow (pending_email → approved)
```

#### Fonctionnalités Présentes:
- ✅ JWT avec bcrypt password hashing (bcryptjs)
- ✅ Refresh token rotation
- ✅ Login attempt tracking
- ✅ IP logging (lastLoginIp)
- ✅ Email verification avec token expirant (24h)
- ✅ Password reset avec token sécurisé

### ⚠️ Lacunes Critiques

1. **❌ PAS DE 2FA/MFA** (Two-Factor Authentication) - **CRITIQUE pour admin**
2. **❌ PAS de device fingerprinting** (detecter les nouvelles sessions)
3. **❌ PAS de session management** (pas de logout all devices)
4. **❌ PAS de password history** (permettre réutilisation même mot de passe)
5. **❌ PAS de passwordless auth** (Magic Links, passkeys WebAuthn)
6. **❌ bcrypt rounds non précisés** (devrait être 12+ en 2026)
7. **❌ JWT_SECRET potentially weak** (pas de validation longueur minimum forte)

### 🚀 Recommandations Premium 2026

#### PRIORITÉ 1: Two-Factor Authentication (TOTP)
```bash
# Installation
npm install otplib qrcode uuid
npm install @types/qrcode --save-dev
```

```typescript
// models/User.ts - Ajouter champs 2FA
export interface IUser {
  // ... existing fields
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  twoFactorBackupCodes?: string[];
  lastTwoFactorAt?: Date;
}

// lib/auth-2fa.ts
import { authenticator } from 'otplib';
import QRCode from 'qrcode';
import crypto from 'crypto';

export function generate2FASecret(userEmail: string): { secret: string; qrCode: string } {
  const secret = authenticator.generateSecret();
  const otpauth = authenticator.keyuri(userEmail, 'AGRI POINT SERVICE', secret);
  
  return {
    secret,
    qrCode: await QRCode.toDataURL(otpauth)
  };
}

export function verify2FAToken(token: string, secret: string): boolean {
  return authenticator.verify({ token, secret });
}

export function generateBackupCodes(count = 10): string[] {
  return Array.from({ length: count }, () => 
    crypto.randomBytes(4).toString('hex').toUpperCase()
  );
}

// app/api/auth/2fa/enable/route.ts
export async function POST(req: NextRequest) {
  const user = await getCurrentUser(req);
  
  const { secret, qrCode } = generate2FASecret(user.email);
  const backupCodes = generateBackupCodes();
  
  // Sauvegarder secret (hashé) + backup codes (hashés)
  await User.findByIdAndUpdate(user._id, {
    twoFactorSecret: crypto.createHash('sha256').update(secret).digest('hex'),
    twoFactorBackupCodes: backupCodes.map(c => crypto.createHash('sha256').update(c).digest('hex')),
    twoFactorEnabled: false // Activer après vérification initiale
  });
  
  return NextResponse.json({ qrCode, backupCodes });
}

// app/api/auth/login/route.ts - Modifier
export async function POST(req: NextRequest) {
  // ... existing password verification
  
  if (user.twoFactorEnabled) {
    const { twoFactorToken } = await req.json();
    
    if (!twoFactorToken) {
      return NextResponse.json({ 
        requiresTwoFactor: true,
        message: 'Code 2FA requis'
      }, { status: 403 });
    }
    
    const hashedSecret = user.twoFactorSecret!;
    const isValid = verify2FAToken(twoFactorToken, hashedSecret);
    
    if (!isValid) {
      // Vérifier backup codes
      const isBackupCode = user.twoFactorBackupCodes?.some(hashedCode => 
        crypto.createHash('sha256').update(twoFactorToken).digest('hex') === hashedCode
      );
      
      if (!isBackupCode) {
        return NextResponse.json({ error: 'Code 2FA invalide' }, { status: 401 });
      }
      
      // Supprimer backup code utilisé
      await User.findByIdAndUpdate(user._id, {
        $pull: { twoFactorBackupCodes: hashedCode }
      });
    }
  }
  
  // ... continue with token generation
}
```

#### PRIORITÉ 2: Device Fingerprinting & Session Management
```bash
npm install @fingerprintjs/fingerprintjs uuid
```

```typescript
// models/Session.ts - Créer nouveau modèle
export interface ISession {
  _id: string;
  userId: mongoose.Types.ObjectId;
  deviceFingerprint: string;
  deviceName: string;          // "Chrome on Windows 10"
  ipAddress: string;
  location?: {
    city: string;
    country: string;
    timezone: string;
  };
  accessToken: string;         // Hash du token (pour invalidation)
  refreshToken: string;        // Hash du token
  lastActivityAt: Date;
  expiresAt: Date;
  isActive: boolean;
  createdAt: Date;
}

// lib/device-fingerprint.ts
import FingerprintJS from '@fingerprintjs/fingerprintjs';

export async function generateDeviceFingerprint(): Promise<string> {
  const fp = await FingerprintJS.load();
  const result = await fp.get();
  return result.visitorId;
}

export function parseUserAgent(ua: string): string {
  // Simplifier pour affichage utilisateur
  const browser = ua.includes('Chrome') ? 'Chrome' : 
                  ua.includes('Firefox') ? 'Firefox' : 
                  ua.includes('Safari') ? 'Safari' : 'Unknown';
  const os = ua.includes('Windows') ? 'Windows' : 
             ua.includes('Mac') ? 'macOS' : 
             ua.includes('Android') ? 'Android' : 
             ua.includes('iOS') ? 'iOS' : 'Unknown';
  return `${browser} on ${os}`;
}

// app/api/auth/login/route.ts - Créer session
import { Session } from '@/models/Session';
import { generateDeviceFingerprint, parseUserAgent } from '@/lib/device-fingerprint';

export async function POST(req: NextRequest) {
  // ... existing auth
  
  const deviceFingerprint = req.headers.get('x-device-fingerprint') || 'unknown';
  const deviceName = parseUserAgent(req.headers.get('user-agent') || '');
  
  // Créer session
  await Session.create({
    userId: user._id,
    deviceFingerprint,
    deviceName,
    ipAddress: getClientIp(req),
    accessToken: crypto.createHash('sha256').update(accessToken).digest('hex'),
    refreshToken: crypto.createHash('sha256').update(refreshToken).digest('hex'),
    lastActivityAt: new Date(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    isActive: true
  });
  
  // Notifier si nouveau device
  const existingSessions = await Session.countDocuments({
    userId: user._id,
    deviceFingerprint,
    isActive: true
  });
  
  if (existingSessions === 1) {
    // Envoyer email "Nouvelle connexion depuis [deviceName]"
    await sendNewDeviceAlert(user.email, deviceName, ipAddress);
  }
  
  return NextResponse.json({ ... });
}

// app/api/auth/sessions/route.ts - Liste des sessions actives
export async function GET(req: NextRequest) {
  const user = await getCurrentUser(req);
  
  const sessions = await Session.find({
    userId: user._id,
    isActive: true,
    expiresAt: { $gt: new Date() }
  }).sort({ lastActivityAt: -1 });
  
  return NextResponse.json({ sessions });
}

// app/api/auth/sessions/revoke/route.ts - Logout device spécifique
export async function DELETE(req: NextRequest) {
  const user = await getCurrentUser(req);
  const { sessionId } = await req.json();
  
  await Session.findOneAndUpdate(
    { _id: sessionId, userId: user._id },
    { isActive: false }
  );
  
  return NextResponse.json({ success: true });
}

// app/api/auth/sessions/revoke-all/route.ts - Logout tous devices
export async function DELETE(req: NextRequest) {
  const user = await getCurrentUser(req);
  
  await Session.updateMany(
    { userId: user._id, isActive: true },
    { isActive: false }
  );
  
  return NextResponse.json({ success: true, message: 'Toutes les sessions ont été fermées' });
}
```

#### PRIORITÉ 3: Passwordless Auth (Magic Links)
```typescript
// lib/magic-links.ts
import crypto from 'crypto';

export function generateMagicLink(email: string): { token: string; expires: Date } {
  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
  
  return { token, expires };
}

// app/api/auth/magic-link/request/route.ts
export async function POST(req: NextRequest) {
  const { email } = await req.json();
  
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    // ⚠️ Ne pas révéler si l'email existe (security by obscurity)
    return NextResponse.json({ message: 'Si un compte existe, un lien a été envoyé' });
  }
  
  const { token, expires } = generateMagicLink(email);
  
  await User.findByIdAndUpdate(user._id, {
    magicLinkToken: crypto.createHash('sha256').update(token).digest('hex'),
    magicLinkExpires: expires
  });
  
  const magicUrl = `${process.env.NEXT_PUBLIC_URL}/auth/magic-link?token=${token}&email=${encodeURIComponent(email)}`;
  
  await sendEmail({
    to: email,
    subject: 'Connexion AGRI POINT SERVICE',
    html: `
      <p>Cliquez sur le lien ci-dessous pour vous connecter (valable 15 minutes):</p>
      <a href="${magicUrl}" style="background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
        Se connecter
      </a>
    `
  });
  
  return NextResponse.json({ message: 'Email envoyé' });
}

// app/api/auth/magic-link/verify/route.ts
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');
  const email = searchParams.get('email');
  
  if (!token || !email) {
    return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 });
  }
  
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  
  const user = await User.findOne({
    email: email.toLowerCase(),
    magicLinkToken: hashedToken,
    magicLinkExpires: { $gt: new Date() }
  });
  
  if (!user) {
    return NextResponse.json({ error: 'Lien invalide ou expiré' }, { status: 401 });
  }
  
  // Effacer le token (usage unique)
  await User.findByIdAndUpdate(user._id, {
    $unset: { magicLinkToken: 1, magicLinkExpires: 1 }
  });
  
  // Générer JWT comme login normal
  const accessToken = generateAccessToken({ userId: user._id.toString(), email: user.email, role: user.role });
  const refreshToken = generateRefreshToken({ userId: user._id.toString(), email: user.email, role: user.role });
  
  const response = NextResponse.json({ success: true, user });
  response.cookies.set('accessToken', accessToken, { httpOnly: true, secure: true, sameSite: 'lax', maxAge: 900 });
  response.cookies.set('refreshToken', refreshToken, { httpOnly: true, secure: true, sameSite: 'lax', maxAge: 604800 });
  
  return response;
}
```

#### PRIORITÉ 4: Renforcer Bcrypt & JWT
```typescript
// models/User.ts
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  
  // 🔥 CRITIQUE: 12 rounds minimum en 2026 (vs 10 avant)
  // 12 rounds = ~250ms/hash (acceptable UX, très sécurisé)
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// lib/auth.ts - Valider JWT_SECRET
const MIN_SECRET_LENGTH = 64; // 512 bits minimum en 2026

if (!JWT_SECRET || JWT_SECRET.length < MIN_SECRET_LENGTH) {
  throw new Error(`JWT_SECRET must be at least ${MIN_SECRET_LENGTH} characters (current: ${JWT_SECRET?.length || 0})`);
}

// Générer un secret fort:
// node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## 3️⃣ SÉCURITÉ CONNEXION (7/10 ⚠️)

### ✅ Points Forts Existants

```typescript
// ✅ HTTPS enforced (Strict-Transport-Security)
// ✅ Brute-force protection (5 tentatives, lock 30min)
// ✅ IP logging
// ✅ Security headers (CSP, X-Frame-Options, etc.)
// ✅ Rate limiting (in-memory, sliding window)
// ✅ Threat detection (SQL injection, XSS, path traversal)
```

### ⚠️ Lacunes Critiques

1. **❌ PAS de CAPTCHA** (bots peuvent tenter bruteforce)
2. **❌ Rate limiter in-memory** (contournable avec multi-instances, pas de Redis)
3. **❌ PAS de geo-blocking** (bloquer connexions depuis pays suspects)
4. **❌ PAS de anomaly detection** (connexion USA alors qu'utilisateur toujours Cameroun)
5. **❌ PAS de Cloudflare Turnstile** (captcha moderne invisible)

### 🚀 Recommandations Premium 2026

#### PRIORITÉ 1: Cloudflare Turnstile (Captcha Moderne)
```bash
npm install @marsidev/react-turnstile
```

```typescript
// app/auth/login/page.tsx
import { Turnstile } from '@marsidev/react-turnstile';

function LoginForm() {
  const [turnstileToken, setTurnstileToken] = useState('');
  
  const handleSubmit = async (e) => {
    if (!turnstileToken) {
      toast.error('Veuillez compléter la vérification');
      return;
    }
    
    await fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, turnstileToken })
    });
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* ... champs email/password */}
      
      <Turnstile
        siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
        onSuccess={(token) => setTurnstileToken(token)}
      />
      
      <button type="submit">Se connecter</button>
    </form>
  );
}

// app/api/auth/login/route.ts
async function verifyTurnstile(token: string, ip: string): Promise<boolean> {
  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      secret: process.env.TURNSTILE_SECRET_KEY,
      response: token,
      remoteip: ip
    })
  });
  
  const data = await response.json();
  return data.success;
}

export async function POST(req: NextRequest) {
  const { email, password, turnstileToken } = await req.json();
  const ip = getClientIp(req);
  
  // ✅ Vérifier Turnstile AVANT tout traitement
  const isCaptchaValid = await verifyTurnstile(turnstileToken, ip);
  if (!isCaptchaValid) {
    logSecurityEvent({ type: 'captcha_failed', ip, email });
    return NextResponse.json({ error: 'Vérification échouée' }, { status: 403 });
  }
  
  // ... continue with login
}
```

#### PRIORITÉ 2: Redis Rate Limiter (Multi-Instance Safe)
```bash
npm install ioredis
```

```typescript
// lib/redis.ts
import Redis from 'ioredis';

export const redis = new Redis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: 3,
  retryStrategy: (times) => Math.min(times * 50, 2000)
});

// lib/rate-limit-redis.ts
import { redis } from './redis';

export async function checkRateLimitRedis(
  key: string,
  limit: number,
  windowMs: number
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const now = Date.now();
  const windowKey = `ratelimit:${key}:${Math.floor(now / windowMs)}`;
  
  const count = await redis.incr(windowKey);
  
  if (count === 1) {
    // Première requête de cette fenêtre, définir expiration
    await redis.pexpire(windowKey, windowMs);
  }
  
  const ttl = await redis.pttl(windowKey);
  const resetAt = now + ttl;
  
  return {
    allowed: count <= limit,
    remaining: Math.max(0, limit - count),
    resetAt
  };
}

// middleware.ts - Utiliser Redis
import { checkRateLimitRedis } from '@/lib/rate-limit-redis';

export async function middleware(req: NextRequest) {
  const ip = getClientIp(req);
  const endpoint = req.nextUrl.pathname;
  
  // Rate limit par endpoint
  const limits: Record<string, { limit: number; window: number }> = {
    '/api/auth/login': { limit: 5, window: 15 * 60 * 1000 },      // 5/15min
    '/api/auth/register': { limit: 3, window: 60 * 60 * 1000 },   // 3/h
    '/api': { limit: 100, window: 60 * 1000 }                     // 100/min global
  };
  
  const config = limits[endpoint] || limits['/api'];
  const result = await checkRateLimitRedis(`${ip}:${endpoint}`, config.limit, config.window);
  
  if (!result.allowed) {
    return NextResponse.json(
      { error: 'Trop de requêtes', retryAfter: Math.ceil((result.resetAt - Date.now()) / 1000) },
      { status: 429, headers: { 'Retry-After': String(Math.ceil((result.resetAt - Date.now()) / 1000)) } }
    );
  }
  
  return NextResponse.next();
}
```

#### PRIORITÉ 3: Geo-Blocking & Anomaly Detection
```bash
npm install geoip-lite
```

```typescript
// lib/geo-security.ts
import geoip from 'geoip-lite';

const BLOCKED_COUNTRIES = ['KP', 'IR', 'SY']; // Corée du Nord, Iran, Syrie (exemple)
const SUSPICIOUS_COUNTRIES = ['RU', 'CN', 'BR']; // Nécessite 2FA supplémentaire

export function getGeoLocation(ip: string) {
  return geoip.lookup(ip);
}

export function isBlockedCountry(countryCode: string): boolean {
  return BLOCKED_COUNTRIES.includes(countryCode);
}

export function isSuspiciousCountry(countryCode: string): boolean {
  return SUSPICIOUS_COUNTRIES.includes(countryCode);
}

// lib/anomaly-detection.ts
export async function detectAnomalies(userId: string, ip: string): Promise<{
  isAnomaly: boolean;
  reasons: string[];
  riskScore: number;
}> {
  const reasons: string[] = [];
  let riskScore = 0;
  
  // 1. Vérifier localisation habituelle
  const user = await User.findById(userId);
  const currentGeo = getGeoLocation(ip);
  const lastGeo = user.lastLoginIp ? getGeoLocation(user.lastLoginIp) : null;
  
  if (currentGeo && lastGeo && currentGeo.country !== lastGeo.country) {
    reasons.push(`Connexion depuis nouveau pays: ${currentGeo.country}`);
    riskScore += 40;
  }
  
  // 2. Vérifier l'heure (connexion 3h du matin = suspect)
  const hour = new Date().getHours();
  if (hour >= 1 && hour <= 5) {
    reasons.push('Connexion à heure inhabituelle');
    riskScore += 20;
  }
  
  // 3. Vérifier nombre de devices récents
  const recentDevices = await Session.countDocuments({
    userId,
    createdAt: { $gt: new Date(Date.now() - 24 * 60 * 60 * 1000) }
  });
  
  if (recentDevices > 3) {
    reasons.push(`${recentDevices} appareils différents en 24h`);
    riskScore += 30;
  }
  
  return {
    isAnomaly: riskScore >= 50,
    reasons,
    riskScore
  };
}

// app/api/auth/login/route.ts
export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const geo = getGeoLocation(ip);
  
  // Bloquer pays interdits
  if (geo && isBlockedCountry(geo.country)) {
    logSecurityEvent({ 
      type: 'blocked_country_attempt', 
      ip, 
      country: geo.country,
      email 
    });
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }
  
  // ... existing password verification
  
  // Détecter anomalies
  const anomaly = await detectAnomalies(user._id.toString(), ip);
  
  if (anomaly.isAnomaly) {
    // Envoyer email d'alerte
    await sendSecurityAlert(user.email, {
      title: 'Connexion suspecte détectée',
      message: `Tentative de connexion depuis ${geo?.city}, ${geo?.country}`,
      reasons: anomaly.reasons,
      riskScore: anomaly.riskScore,
      action: 'Si ce n\'est pas vous, changez immédiatement votre mot de passe'
    });
    
    // Exiger 2FA même si désactivé
    if (!user.twoFactorEnabled || !twoFactorToken) {
      return NextResponse.json({ 
        requiresAdditionalVerification: true,
        message: 'Connexion inhabituelle détectée. Vérification supplémentaire requise.',
        verificationMethod: 'email' // Envoyer code par email
      }, { status: 403 });
    }
  }
  
  // ... continue with token generation
}
```

---

## 4️⃣ SÉCURITÉ GLOBALE (8/10 ✅)

### ✅ Points Forts Existants

```typescript
// ✅ Security headers complets (CSP, HSTS, X-Frame-Options, etc.)
// ✅ Input sanitization (XSS, SQL injection)
// ✅ Threat detection (scanForThreats)
// ✅ CSRF token generation (generateCsrfToken, validateCsrfToken)
// ✅ Secure token generation (crypto.randomBytes)
// ✅ MongoDB ObjectId validation
// ✅ Bot/scraper detection
// ✅ Password strength check
```

### ⚠️ Lacunes

1. **❌ CSP trop permissif** (`unsafe-inline`, `unsafe-eval`)
2. **❌ PAS de Subresource Integrity (SRI)** pour CDN
3. **❌ PAS de Content-Security-Policy-Report-Only** (monitoring violations)
4. **❌ PAS de API input validation stricte** (Zod, Joi)
5. **❌ PAS de secrets encryption at rest** (JWT_SECRET en clair dans .env)

### 🚀 Recommandations Premium 2026

#### PRIORITÉ 1: Renforcer CSP (Supprimer unsafe-*)
```typescript
// next.config.js
const csp = [
  "default-src 'self'",
  // ❌ SUPPRIMER 'unsafe-inline' 'unsafe-eval'
  "script-src 'self' 'nonce-{NONCE}' https://www.googletagmanager.com",
  "style-src 'self' 'nonce-{NONCE}' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: blob: https://res.cloudinary.com https://*.amazonaws.com",
  "connect-src 'self' https://www.google-analytics.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "upgrade-insecure-requests",
  // 📊 Reporting CSP violations
  "report-uri https://agri-ps.report-uri.com/r/d/csp/enforce"
].join('; ');

// middleware.ts - Générer nonce dynamique
import crypto from 'crypto';

export function middleware(req: NextRequest) {
  const nonce = crypto.randomBytes(16).toString('base64');
  const cspWithNonce = csp.replace(/{NONCE}/g, nonce);
  
  const response = NextResponse.next();
  response.headers.set('Content-Security-Policy', cspWithNonce);
  response.headers.set('X-Nonce', nonce); // Passer au client
  
  return response;
}

// app/layout.tsx - Utiliser nonce
export default function RootLayout({ children }) {
  const nonce = headers().get('X-Nonce') || '';
  
  return (
    <html>
      <head>
        <script nonce={nonce} src="/js/app.js" />
        <style nonce={nonce}>{criticalCSS}</style>
      </head>
      <body>{children}</body>
    </html>
  );
}
```

#### PRIORITÉ 2: API Input Validation avec Zod
```bash
npm install zod
```

```typescript
// lib/validators.ts
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email invalide').toLowerCase(),
  password: z.string().min(8, 'Minimum 8 caractères'),
  turnstileToken: z.string().optional()
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Minimum 2 caractères').max(100),
  email: z.string().email().toLowerCase(),
  password: z.string()
    .min(12, 'Minimum 12 caractères') // 🔥 12+ en 2026
    .regex(/[a-z]/, 'Doit contenir une minuscule')
    .regex(/[A-Z]/, 'Doit contenir une majuscule')
    .regex(/[0-9]/, 'Doit contenir un chiffre')
    .regex(/[^a-zA-Z0-9]/, 'Doit contenir un caractère spécial'),
  phone: z.string().regex(/^(237)?6[0-9]{8}$/, 'Numéro Cameroun invalide'),
  address: z.object({
    city: z.string().min(1),
    region: z.enum(['Littoral', 'Centre', 'Adamaoua', 'Est', 'Extreme-Nord', 'Nord', 'Nord-Ouest', 'Ouest', 'Sud', 'Sud-Ouest']),
    country: z.literal('Cameroun')
  })
});

// app/api/auth/login/route.ts
import { loginSchema } from '@/lib/validators';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = loginSchema.parse(body); // ✅ Validation stricte
    
    // ... continue with validated.email, validated.password
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation failed', 
        details: error.errors 
      }, { status: 400 });
    }
    throw error;
  }
}
```

#### PRIORITÉ 3: Secrets Encryption (Vault)
```bash
npm install @azure/keyvault-secrets @azure/identity
# OU
npm install @vercel/kv
```

```typescript
// lib/secrets.ts (Azure Key Vault)
import { SecretClient } from '@azure/keyvault-secrets';
import { DefaultAzureCredential } from '@azure/identity';

const client = new SecretClient(
  process.env.AZURE_KEYVAULT_URL!,
  new DefaultAzureCredential()
);

export async function getSecret(name: string): Promise<string> {
  const secret = await client.getSecret(name);
  return secret.value!;
}

// Au lieu de:
const JWT_SECRET = process.env.JWT_SECRET;

// Utiliser:
const JWT_SECRET = await getSecret('jwt-secret');

// OU avec Vercel KV (plus simple)
import { kv } from '@vercel/kv';

export async function getSecret(name: string): Promise<string> {
  return await kv.get(name);
}

// Configuration initiale (une fois):
await kv.set('jwt-secret', crypto.randomBytes(64).toString('hex'));
```

---

## 5️⃣ TRAÇABILITÉ (8.5/10 ✅)

### ✅ Points Forts Existants

```typescript
// ✅ Audit logs complets (AuditLog model)
// ✅ Actions trackées: login, logout, create, update, delete, export, import, rollback
// ✅ Métadonnées riches: before/after, changes, ipAddress, userAgent
// ✅ Sévérité: info, warning, error, critical
// ✅ UI admin pour consulter logs (/admin/audit-logs)
// ✅ Filtres: action, severity, resource, date range
```

### ⚠️ Lacunes

1. **❌ PAS de tamper-proof logs** (logs peuvent être modifiés en DB)
2. **❌ PAS de log archiving** (logs anciens non migrés vers cold storage)
3. **❌ PAS de compliance reports** (GDPR, ISO27001)

### 🚀 Recommandations Premium 2026

#### PRIORITÉ 1: Immutable Audit Logs (Blockchain-Style)
```typescript
// models/AuditLog.ts - Ajouter hash chain
export interface IAuditLog extends Document {
  // ... existing fields
  previousHash: string;     // Hash du log précédent (chaîne immuable)
  hash: string;             // SHA-256 de ce log
  verified: boolean;        // Vérification intégrité
}

// lib/audit-logger.ts
import crypto from 'crypto';

function calculateHash(log: Partial<IAuditLog>, previousHash: string): string {
  const data = JSON.stringify({
    userId: log.userId,
    action: log.action,
    resource: log.resource,
    timestamp: log.createdAt,
    previousHash
  });
  
  return crypto.createHash('sha256').update(data).digest('hex');
}

export async function createAuditLog(params: CreateAuditLogParams): Promise<void> {
  const lastLog = await AuditLog.findOne().sort({ createdAt: -1 });
  const previousHash = lastLog?.hash || '0000000000000000000000000000000000000000000000000000000000000000';
  
  const log = {
    ...params,
    previousHash,
    hash: '', // Calculé après création
    verified: true
  };
  
  log.hash = calculateHash(log, previousHash);
  
  await AuditLog.create(log);
}

// app/api/admin/audit-logs/verify/route.ts
export async function GET(req: NextRequest) {
  const logs = await AuditLog.find().sort({ createdAt: 1 });
  
  let isValid = true;
  let brokenChainAt: string | null = null;
  
  for (let i = 0; i < logs.length; i++) {
    const log = logs[i];
    const previousHash = i === 0 ? '00000...' : logs[i - 1].hash;
    const expectedHash = calculateHash(log, previousHash);
    
    if (log.hash !== expectedHash) {
      isValid = false;
      brokenChainAt = log._id.toString();
      break;
    }
  }
  
  return NextResponse.json({ 
    valid: isValid, 
    totalLogs: logs.length,
    brokenChainAt,
    message: isValid ? 'Tous les logs sont intègres' : 'Intégrité compromise!'
  });
}
```

#### PRIORITÉ 2: GDPR Compliance Reports
```typescript
// app/api/admin/compliance/gdpr-export/route.ts
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  
  if (!userId) {
    return NextResponse.json({ error: 'userId requis' }, { status: 400 });
  }
  
  // Collecter TOUTES les données utilisateur
  const user = await User.findById(userId);
  const orders = await Order.find({ user: userId });
  const conversations = await ChatConversation.find({ userId });
  const auditLogs = await AuditLog.find({ userId });
  const sessions = await Session.find({ userId });
  
  const gdprExport = {
    generatedAt: new Date().toISOString(),
    userId,
    personalData: {
      identity: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        uniqueCode: user.uniqueCode
      },
      address: user.address,
      accountStatus: user.accountStatus,
      createdAt: user.createdAt
    },
    activityData: {
      orders: orders.map(o => ({
        id: o._id,
        date: o.createdAt,
        total: o.total,
        status: o.status
      })),
      conversations: conversations.length,
      loginHistory: auditLogs.filter(l => l.action === 'login').map(l => ({
        date: l.createdAt,
        ip: l.ipAddress,
        device: l.userAgent
      }))
    },
    legalBasis: 'Consent (CGU/CGV acceptance)',
    dataRetention: '5 années après dernière activité',
    rights: {
      access: 'Oui - via export GDPR',
      rectification: 'Oui - via /compte',
      erasure: 'Oui - via demande support',
      portability: 'Oui - ce document',
      objection: 'Oui - désactivation compte'
    }
  };
  
  return NextResponse.json(gdprExport);
}
```

---

## 6️⃣ GESTION COOKIES (6/10 ⚠️)

### ✅ Points Forts Existants

```typescript
// ✅ Cookies HttpOnly (protection XSS)
// ✅ Secure en production
// ✅ SameSite=lax
// ✅ Expiration appropriée (accessToken 15min, refreshToken 7j)
```

### ⚠️ Lacunes CRITIQUES

1. **❌ PAS de cookie consent banner** (RGPD/GDPR obligatoire)
2. **❌ PAS de cookie management** (accepter/refuser analytics)
3. **❌ PAS de cookie policy** (/cookies page manquante)
4. **❌ SameSite=lax pas assez strict** (devrait être `strict` pour auth)

### 🚀 Recommandations Premium 2026

#### PRIORITÉ 1: Cookie Consent Banner (RGPD Obligatoire)
```bash
npm install @cookieyes/consent-sdk react-cookie-consent
```

```typescript
// components/CookieConsent.tsx
'use client';

import { useState, useEffect } from 'react';
import { CookieConsent as RCCConsent } from 'react-cookie-consent';

export default function CookieConsentBanner() {
  const [preferences, setPreferences] = useState({
    necessary: true,      // Toujours actif
    analytics: false,
    marketing: false
  });
  
  const handleAcceptAll = () => {
    setPreferences({ necessary: true, analytics: true, marketing: true });
    saveCookiePreferences({ necessary: true, analytics: true, marketing: true });
    initializeAnalytics();
  };
  
  const handleRejectAll = () => {
    setPreferences({ necessary: true, analytics: false, marketing: false });
    saveCookiePreferences({ necessary: true, analytics: false, marketing: false });
  };
  
  const saveCookiePreferences = (prefs: typeof preferences) => {
    // Cookie de consentement (exempt RGPD)
    document.cookie = `cookie_consent=${JSON.stringify(prefs)}; max-age=31536000; path=/; secure; samesite=strict`;
  };
  
  const initializeAnalytics = () => {
    if (preferences.analytics && process.env.NEXT_PUBLIC_GA_ID) {
      // Charger Google Analytics uniquement si consentement
      const script = document.createElement('script');
      script.src = `https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`;
      script.async = true;
      document.head.appendChild(script);
    }
  };
  
  return (
    <RCCConsent
      location="bottom"
      buttonText="Tout accepter"
      declineButtonText="Tout refuser"
      cookieName="cookie_consent_shown"
      style={{ 
        background: 'rgba(0, 0, 0, 0.95)',
        backdropFilter: 'blur(10px)',
        borderTop: '2px solid #059669'
      }}
      buttonStyle={{
        background: '#059669',
        color: 'white',
        fontSize: '14px',
        borderRadius: '6px',
        padding: '10px 24px'
      }}
      declineButtonStyle={{
        background: 'transparent',
        border: '1px solid white',
        color: 'white',
        fontSize: '14px',
        borderRadius: '6px',
        padding: '10px 24px'
      }}
      onAccept={handleAcceptAll}
      onDecline={handleRejectAll}
      enableDeclineButton
    >
      <div className="max-w-4xl">
        <h3 className="text-lg font-bold text-white mb-2">
          🍪 Gestion des cookies
        </h3>
        <p className="text-sm text-gray-300 mb-4">
          Nous utilisons des cookies pour améliorer votre expérience. 
          Vous pouvez accepter tous les cookies ou gérer vos préférences.
        </p>
        
        <button
          onClick={() => setShowPreferences(true)}
          className="text-emerald-400 text-sm underline"
        >
          Gérer mes préférences
        </button>
      </div>
    </RCCConsent>
  );
}

// app/layout.tsx
import CookieConsentBanner from '@/components/CookieConsent';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <CookieConsentBanner />
      </body>
    </html>
  );
}
```

#### PRIORITÉ 2: Cookie Preferences Center
```typescript
// app/cookies/page.tsx
'use client';

export default function CookieSettingsPage() {
  const [preferences, setPreferences] = useState({
    necessary: true,
    analytics: false,
    marketing: false
  });
  
  const categories = [
    {
      id: 'necessary',
      name: 'Cookies Nécessaires',
      description: 'Essentiels au fonctionnement du site (authentification, panier)',
      required: true,
      cookies: [
        { name: 'accessToken', duration: '15 minutes', purpose: 'Authentification' },
        { name: 'refreshToken', duration: '7 jours', purpose: 'Renouvellement session' }
      ]
    },
    {
      id: 'analytics',
      name: 'Cookies Analytiques',
      description: 'Nous aident à comprendre comment vous utilisez le site',
      required: false,
      cookies: [
        { name: '_ga', duration: '2 ans', purpose: 'Google Analytics - Suivi visiteurs' },
        { name: '_gid', duration: '24 heures', purpose: 'Google Analytics - Sessions' }
      ]
    },
    {
      id: 'marketing',
      name: 'Cookies Marketing',
      description: 'Personnalisent les publicités selon vos intérêts',
      required: false,
      cookies: []
    }
  ];
  
  const handleSave = () => {
    document.cookie = `cookie_preferences=${JSON.stringify(preferences)}; max-age=31536000; path=/; secure; samesite=strict`;
    toast.success('Préférences sauvegardées');
    router.push('/');
  };
  
  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-6">Gestion des Cookies</h1>
      
      {categories.map(category => (
        <div key={category.id} className="bg-white rounded-xl p-6 shadow-sm mb-4">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">{category.name}</h3>
              <p className="text-sm text-gray-600">{category.description}</p>
            </div>
            
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences[category.id as keyof typeof preferences]}
                onChange={(e) => setPreferences({ ...preferences, [category.id]: e.target.checked })}
                disabled={category.required}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600" />
            </label>
          </div>
          
          {category.cookies.length > 0 && (
            <div className="border-t pt-4 mt-4">
              <h4 className="text-sm font-medium mb-2">Détails des cookies:</h4>
              <div className="space-y-2">
                {category.cookies.map((cookie, i) => (
                  <div key={i} className="text-xs text-gray-600 flex justify-between">
                    <span><code className="bg-gray-100 px-2 py-0.5 rounded">{cookie.name}</code></span>
                    <span>{cookie.duration}</span>
                    <span>{cookie.purpose}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
      
      <div className="flex gap-4">
        <button
          onClick={handleSave}
          className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
        >
          Sauvegarder les préférences
        </button>
        <button
          onClick={() => router.push('/')}
          className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
        >
          Annuler
        </button>
      </div>
    </div>
  );
}
```

#### PRIORITÉ 3: Renforcer SameSite=strict
```typescript
// app/api/auth/login/route.ts
response.cookies.set('accessToken', accessToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict', // 🔥 STRICT au lieu de lax (meilleure sécurité CSRF)
  maxAge: 15 * 60,
  path: '/'
});

response.cookies.set('refreshToken', refreshToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict', // 🔥 STRICT
  maxAge: 7 * 24 * 3600,
  path: '/'
});
```

---

## 7️⃣ GESTION BASE DE DONNÉES (7.5/10 ⚠️)

### ✅ Points Forts Existants

```typescript
// ✅ MongoDB avec Mongoose
// ✅ Indexes définis (email, uniqueCode, etc.)
// ✅ Connection pooling (lib/db.ts)
// ✅ Transactions support (MongoDB 4.0+)
// ✅ Models structurés (User, Order, Product, etc.)
```

### ⚠️ Lacunes

1. **❌ PAS de backup automatisé** (perte données catastrophique)
2. **❌ PAS de encryption at rest** (données sensibles en clair)
3. **❌ PAS de read replicas** (scalabilité limitée)
4. **❌ PAS de query performance monitoring** (slow queries non détectées)
5. **❌ PAS de data migrations** (changements schéma dangereux)

### 🚀 Recommandations Premium 2026

#### PRIORITÉ 1: Automated Backups (MongoDB Atlas)
```bash
# Configuration MongoDB Atlas
# 1. Activer Point-in-Time Recovery (PITR)
# 2. Backups continuous toutes les heures
# 3. Rétention: 7 jours rolling + 1 snapshot hebdomadaire (4 semaines)

# Backup manuel via script
node scripts/mongodb-backup.js
```

```typescript
// scripts/mongodb-backup.ts
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

async function backupMongoDB() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join('/var/backups/mongodb', timestamp);
  
  console.log(`📦 Starting backup to ${backupDir}...`);
  
  try {
    // mongodump avec compression
    await execAsync(`mongodump --uri="${process.env.MONGODB_URI}" --out="${backupDir}" --gzip`);
    
    console.log('✅ Backup completed successfully');
    
    // Uploader vers S3/Azure Blob
    if (process.env.AZURE_STORAGE_CONNECTION_STRING) {
      console.log('☁️ Uploading to Azure Blob Storage...');
      await execAsync(`az storage blob upload-batch --source "${backupDir}" --destination mongodb-backups --connection-string "${process.env.AZURE_STORAGE_CONNECTION_STRING}"`);
      console.log('✅ Upload completed');
    }
    
    // Nettoyer backups > 30 jours
    await cleanOldBackups();
    
  } catch (error) {
    console.error('❌ Backup failed:', error);
    // Envoyer alerte Slack
    await alertCriticalError(error, { operation: 'mongodb_backup' });
    process.exit(1);
  }
}

async function cleanOldBackups() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  await execAsync(`find /var/backups/mongodb -type d -mtime +30 -exec rm -rf {} +`);
  console.log('🧹 Old backups cleaned');
}

backupMongoDB();

// Ajouter dans cron (tous les jours à 2h du matin)
// 0 2 * * * cd /app && node scripts/mongodb-backup.js >> /var/log/mongodb-backup.log 2>&1
```

#### PRIORITÉ 2: Encryption at Rest (MongoDB Enterprise)
```typescript
// MongoDB Atlas: Activer Encryption at Rest dans Settings > Security
// Ou avec MongoDB Enterprise:

// mongod.conf
security:
  enableEncryption: true
  encryptionKeyFile: /etc/mongodb-keyfile
  encryptionCipherMode: AES256-CBC

// Générer clé
openssl rand -base64 32 > /etc/mongodb-keyfile
chmod 600 /etc/mongodb-keyfile
chown mongodb:mongodb /etc/mongodb-keyfile

// Field-Level Encryption (pour champs ultra-sensibles)
// models/User.ts
import { ClientEncryption } from 'mongodb';

const encryption = new ClientEncryption(client, {
  keyVaultNamespace: 'encryption.__keyVault',
  kmsProviders: {
    azure: {
      tenantId: process.env.AZURE_TENANT_ID,
      clientId: process.env.AZURE_CLIENT_ID,
      clientSecret: process.env.AZURE_CLIENT_SECRET
    }
  }
});

// Encrypter champs sensibles
UserSchema.pre('save', async function() {
  if (this.isModified('phone')) {
    this.phone = await encryption.encrypt(this.phone, {
      keyId: process.env.ENCRYPTION_KEY_ID,
      algorithm: 'AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic'
    });
  }
});
```

#### PRIORITÉ 3: Query Performance Monitoring
```typescript
// lib/db-monitoring.ts
import mongoose from 'mongoose';
import { logger } from './logger';

// Activer profiling MongoDB
mongoose.set('debug', process.env.NODE_ENV === 'development');

// Middleware pour logger slow queries
mongoose.plugin((schema) => {
  schema.pre(/^find/, function() {
    this._startTime = Date.now();
  });

  schema.post(/^find/, function() {
    const duration = Date.now() - (this._startTime || 0);
    
    if (duration > 1000) { // > 1s = slow query
      logger.warn(`SLOW QUERY DETECTED: ${duration}ms`, {
        collection: this.mongooseCollection.name,
        query: JSON.stringify(this.getQuery()),
        duration
      });
      
      // Envoyer à Datadog
      ddLogger.error('Slow MongoDB query', {
        collection: this.mongooseCollection.name,
        duration,
        threshold: 1000
      });
    }
  });
});

// Créer indexes manquants automatiquement
export async function createMissingIndexes() {
  const models = mongoose.modelNames();
  
  for (const modelName of models) {
    const model = mongoose.model(modelName);
    
    try {
      await model.createIndexes();
      console.log(`✅ Indexes created for ${modelName}`);
    } catch (error) {
      console.error(`❌ Failed to create indexes for ${modelName}:`, error);
    }
  }
}

// Analyse des index utilisés
export async function analyzeIndexUsage() {
  const db = mongoose.connection.db;
  const collections = await db.listCollections().toArray();
  
  for (const { name } of collections) {
    const stats = await db.collection(name).indexStats().toArray();
    
    const unusedIndexes = stats.filter(stat => stat.accesses.ops === 0);
    
    if (unusedIndexes.length > 0) {
      console.warn(`⚠️ Collection ${name} has ${unusedIndexes.length} unused indexes:`, 
        unusedIndexes.map(i => i.name)
      );
    }
  }
}
```

---

## 8️⃣ ADMINISTRATION (8/10 ✅)

### ✅ Points Forts Existants

```typescript
// ✅ Panel admin complet (/admin)
// ✅ Role-based access (admin, manager, redacteur)
// ✅ User management (approve, reject, suspend)
// ✅ Product/Order CRUD
// ✅ Permissions management (/admin/permissions)
// ✅ Analytics dashboard (/admin/analytics)
// ✅ Audit logs viewer (/admin/audit-logs)
```

### ⚠️ Lacunes

1. **❌ PAS d'impersonation** (admin ne peut pas "se connecter en tant que" user)
2. **❌ PAS de bulk operations** (approve 100 users un par un)
3. **❌ PAS d'export Excel/CSV** (analytics non exportables)
4. **❌ PAS de scheduled tasks UI** (gérer cron jobs visuellement)

### 🚀 Recommandations Premium 2026

#### PRIORITÉ 1: User Impersonation (Admin as User)
```typescript
// app/api/admin/impersonate/route.ts
export async function POST(req: NextRequest) {
  const admin = await getCurrentUser(req);
  
  if (!admin || admin.role !== 'admin') {
    return NextResponse.json({ error: 'Admin only' }, { status: 403 });
  }
  
  const { targetUserId } = await req.json();
  
  const targetUser = await User.findById(targetUserId);
  if (!targetUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }
  
  // Générer token impersonation (durée limitée)
  const impersonationToken = jwt.sign({
    adminId: admin._id.toString(),
    impersonatedUserId: targetUser._id.toString(),
    impersonatedUserEmail: targetUser.email,
    impersonatedUserRole: targetUser.role,
    type: 'impersonation'
  }, process.env.JWT_SECRET!, { expiresIn: '1h' });
  
  // Logger pour audit
  await createAuditLog({
    userId: admin._id.toString(),
    userName: admin.name,
    userEmail: admin.email,
    action: 'impersonate',
    resource: 'user',
    resourceId: targetUser._id.toString(),
    description: `Admin ${admin.name} impersonate ${targetUser.name}`,
    severity: 'warning',
    request: req
  });
  
  return NextResponse.json({
    impersonationToken,
    targetUser: {
      id: targetUser._id,
      name: targetUser.name,
      email: targetUser.email,
      role: targetUser.role
    }
  });
}

// middleware.ts - Détecter impersonation
export async function middleware(req: NextRequest) {
  const impersonationToken = req.cookies.get('impersonation_token')?.value;
  
  if (impersonationToken) {
    try {
      const decoded = jwt.verify(impersonationToken, process.env.JWT_SECRET!);
      
      if (decoded.type === 'impersonation') {
        // Ajouter header pour afficher banner avertissement
        const response = NextResponse.next();
        response.headers.set('X-Impersonating', decoded.impersonatedUserEmail);
        return response;
      }
    } catch {
      // Token expiré, supprimer
      const response = NextResponse.next();
      response.cookies.delete('impersonation_token');
      return response;
    }
  }
  
  return NextResponse.next();
}

// components/ImpersonationBanner.tsx
export function ImpersonationBanner() {
  const impersonating = useImpersonation(); // Custom hook
  
  if (!impersonating) return null;
  
  return (
    <div className="bg-orange-600 text-white px-4 py-2 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-5 h-5" />
        <span>
          Vous êtes connecté en tant que <strong>{impersonating.email}</strong>
        </span>
      </div>
      <button
        onClick={async () => {
          await fetch('/api/admin/impersonate/stop', { method: 'POST' });
          window.location.href = '/admin/users';
        }}
        className="px-4 py-1 bg-white text-orange-600 rounded hover:bg-gray-100"
      >
        Arrêter l'impersonation
      </button>
    </div>
  );
}
```

#### PRIORITÉ 2: Bulk Operations
```typescript
// app/admin/users/page.tsx
function UsersPage() {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  
  const handleBulkAction = async (action: 'approve' | 'reject' | 'suspend' | 'delete') => {
    const confirmMessage = `Êtes-vous sûr de vouloir ${action} ${selectedUsers.length} utilisateur(s) ?`;
    
    if (!confirm(confirmMessage)) return;
    
    try {
      const response = await fetch('/api/admin/users/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userIds: selectedUsers, action })
      });
      
      if (response.ok) {
        toast.success(`${selectedUsers.length} utilisateur(s) ${action}(s)`);
        setSelectedUsers([]);
        fetchUsers();
      }
    } catch (error) {
      toast.error('Erreur lors de l\'opération groupée');
    }
  };
  
  return (
    <div>
      {selectedUsers.length > 0 && (
        <div className="bg-emerald-50 p-4 rounded-lg mb-4 flex items-center justify-between">
          <span>{selectedUsers.length} utilisateur(s) sélectionné(s)</span>
          <div className="flex gap-2">
            <button onClick={() => handleBulkAction('approve')} className="px-4 py-2 bg-green-600 text-white rounded">
              Approuver
            </button>
            <button onClick={() => handleBulkAction('reject')} className="px-4 py-2 bg-red-600 text-white rounded">
              Rejeter
            </button>
            <button onClick={() => handleBulkAction('suspend')} className="px-4 py-2 bg-orange-600 text-white rounded">
              Suspendre
            </button>
            <button onClick={() => setSelectedUsers([])} className="px-4 py-2 bg-gray-300 rounded">
              Annuler
            </button>
          </div>
        </div>
      )}
      
      <table>
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedUsers(users.map(u => u._id));
                  } else {
                    setSelectedUsers([]);
                  }
                }}
              />
            </th>
            {/* ... autres colonnes */}
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user._id}>
              <td>
                <input
                  type="checkbox"
                  checked={selectedUsers.includes(user._id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedUsers([...selectedUsers, user._id]);
                    } else {
                      setSelectedUsers(selectedUsers.filter(id => id !== user._id));
                    }
                  }}
                />
              </td>
              {/* ... autres cellules */}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// app/api/admin/users/bulk/route.ts
export async function POST(req: NextRequest) {
  const admin = await getCurrentUser(req);
  
  if (!admin || !['admin', 'superadmin'].includes(admin.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  
  const { userIds, action } = await req.json();
  
  if (!Array.isArray(userIds) || userIds.length === 0) {
    return NextResponse.json({ error: 'userIds must be a non-empty array' }, { status: 400 });
  }
  
  let updateQuery: any = {};
  
  switch (action) {
    case 'approve':
      updateQuery = { accountStatus: 'approved', approvedBy: admin._id, approvedAt: new Date() };
      break;
    case 'reject':
      updateQuery = { accountStatus: 'rejected' };
      break;
    case 'suspend':
      updateQuery = { accountStatus: 'suspended' };
      break;
    case 'delete':
      // Soft delete
      updateQuery = { isActive: false, deletedAt: new Date() };
      break;
    default:
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }
  
  const result = await User.updateMany(
    { _id: { $in: userIds } },
    { $set: updateQuery }
  );
  
  // Logger audit
  await createAuditLog({
    userId: admin._id.toString(),
    userName: admin.name,
    userEmail: admin.email,
    action: 'bulk_update',
    resource: 'users',
    description: `Bulk ${action} on ${userIds.length} users`,
    severity: 'warning',
    metadata: { userIds, action, affected: result.modifiedCount },
    request: req
  });
  
  return NextResponse.json({
    success: true,
    affected: result.modifiedCount
  });
}
```

---

## 9️⃣ CMS (8.5/10 ✅)

### ✅ Points Forts Existants

```typescript
// ✅ CMS headless complet (ContentType + ContentEntry)
// ✅ Dynamic fields (text, richtext, number, select, date, etc.)
// ✅ Permissions par content type
// ✅ Soft delete
// ✅ Draft/Published workflow
// ✅ i18n support (locales)
```

### ⚠️ Lacunes

1. **❌ PAS de preview mode** (voir page avant publication)
2. **❌ PAS de scheduled publishing** (publier automatiquement à date fixe)
3. **❌ PAS de media library** (gestion images/videos centralisée)
4. **❌ PAS de workflow states** (draft → review → approved → published)

### 🚀 Recommandations Premium 2026

#### PRIORITÉ 1: Preview Mode (Next.js Draft Mode)
```typescript
// app/api/preview/route.ts
import { draftMode } from 'next/headers';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get('secret');
  const slug = searchParams.get('slug');
  
  // Vérifier secret token
  if (secret !== process.env.PREVIEW_SECRET) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
  
  if (!slug) {
    return NextResponse.json({ error: 'slug required' }, { status: 400 });
  }
  
  // Activer draft mode
  draftMode().enable();
  
  // Rediriger vers la page
  return NextResponse.redirect(new URL(slug, req.url));
}

// app/api/preview/disable/route.ts
export async function GET(req: NextRequest) {
  draftMode().disable();
  return NextResponse.redirect(new URL('/', req.url));
}

// app/[slug]/page.tsx
import { draftMode } from 'next/headers';

export default async function DynamicPage({ params }) {
  const isPreview = draftMode().isEnabled;
  
  // Charger content avec/sans draft
  const page = isPreview 
    ? await ContentEntry.findOne({ slug: params.slug }) // Inclure drafts
    : await ContentEntry.findOne({ slug: params.slug, status: 'published' });
  
  return (
    <>
      {isPreview && <PreviewModeBanner />}
      <PageContent data={page} />
    </>
  );
}

// components/PreviewModeBanner.tsx
export function PreviewModeBanner() {
  return (
    <div className="bg-yellow-500 text-black px-4 py-2 flex items-center justify-between">
      <span>🚧 Mode Prévisualisation - Cette page n'est pas publiée</span>
      <a href="/api/preview/disable" className="px-4 py-1 bg-black text-yellow-500 rounded">
        Quitter le mode preview
      </a>
    </div>
  );
}

// app/admin/pages/[id]/edit/page.tsx
function PageEditor() {
  const handlePreview = async () => {
    const previewUrl = `/api/preview?secret=${process.env.NEXT_PUBLIC_PREVIEW_SECRET}&slug=${page.slug}`;
    window.open(previewUrl, '_blank');
  };
  
  return (
    <div>
      <button onClick={handlePreview} className="px-4 py-2 bg-blue-600 text-white rounded">
        👁️ Prévisualiser
      </button>
    </div>
  );
}
```

#### PRIORITÉ 2: Scheduled Publishing
```typescript
// models/ContentEntry.ts - Ajouter champs
export interface IContentEntry {
  // ... existing fields
  scheduledPublishAt?: Date;
  scheduledUnpublishAt?: Date;
  autoPublished: boolean;
}

// scripts/scheduled-publisher.ts (cron job toutes les minutes)
import { ContentEntry } from '@/models/ContentEntry';

async function publishScheduledContent() {
  const now = new Date();
  
  // Publier contenu dont la date est passée
  const toPublish = await ContentEntry.find({
    status: 'draft',
    scheduledPublishAt: { $lte: now },
    autoPublished: false
  });
  
  for (const entry of toPublish) {
    entry.status = 'published';
    entry.publishedAt = now;
    entry.autoPublished = true;
    await entry.save();
    
    console.log(`✅ Auto-published: ${entry.slug}`);
    
    // Notifier auteur
    await sendEmail({
      to: entry.author.email,
      subject: `Votre contenu "${entry.title}" a été publié`,
      html: `<p>Votre contenu a été automatiquement publié comme prévu.</p>`
    });
  }
  
  // Dépublier contenu dont la date de fin est passée
  const toUnpublish = await ContentEntry.find({
    status: 'published',
    scheduledUnpublishAt: { $lte: now }
  });
  
  for (const entry of toUnpublish) {
    entry.status = 'archived';
    await entry.save();
    
    console.log(`✅ Auto-unpublished: ${entry.slug}`);
  }
  
  console.log(`📅 Scheduled publishing check completed: ${toPublish.length} published, ${toUnpublish.length} unpublished`);
}

publishScheduledContent();

// Ajouter dans cron: */1 * * * * node scripts/scheduled-publisher.js
```

---

## 🎯 PLAN D'ACTION PRIORITAIRE

### Phase 1: CRITIQUE (Semaine 1-2) 🔴

1. **Two-Factor Authentication (2FA)** - Sécurité admin
2. **Cookie Consent Banner** - Conformité RGPD obligatoire
3. **Cloudflare Turnstile** - Anti-bot login
4. **MongoDB Backups** - Protection perte données

### Phase 2: IMPORTANT (Semaine 3-4) 🟠

5. **Redis Rate Limiter** - Scalabilité multi-instances
6. **Device Fingerprinting & Sessions** - Sécurité avancée
7. **API Input Validation (Zod)** - Qualité données
8. **Log Rotation & Datadog** - Observabilité production

### Phase 3: AMÉLIORATION (Mois 2) 🟡

9. **Passwordless Auth (Magic Links)** - UX moderne
10. **User Impersonation** - Support client
11. **Bulk Operations** - Efficacité admin
12. **Preview Mode CMS** - Workflow editorial

### Phase 4: EXCELLENCE (Mois 3) 🟢

13. **Geo-Blocking & Anomaly Detection** - Sécurité avancée
14. **Immutable Audit Logs** - Conformité
15. **Query Performance Monitoring** - Performance DB
16. **Scheduled Publishing** - Automation CMS

---

## 📦 PACKAGES À INSTALLER

```bash
# Sécurité & Auth
npm install otplib qrcode @fingerprintjs/fingerprintjs
npm install @marsidev/react-turnstile
npm install ioredis
npm install zod

# Logging & Monitoring
npm install @datadog/browser-logs @datadog/pino
npm install rotating-file-stream
npm install @slack/webhook

# Cookies & Compliance
npm install react-cookie-consent

# Utilities
npm install geoip-lite
npm install @azure/keyvault-secrets @azure/identity
```

---

## 📈 AMÉLIORATION ATTENDUE

| Domaine | Avant | Après | Gain |
|---------|-------|-------|------|
| Sécurité Auth | 7.5/10 | 9.5/10 | **+27%** |
| Conformité RGPD | 6/10 | 9/10 | **+50%** |
| Observabilité | 8/10 | 9.5/10 | **+19%** |
| Expérience Admin | 8/10 | 9.5/10 | **+19%** |
| **GLOBAL** | **7.5/10** | **9.5/10** | **🚀 +27%** |

---

## ✅ CHECKLIST FINALE

- [ ] Tests E2E pour 2FA
- [ ] Tests de charge avec Redis rate limiter
- [ ] Audit externe sécurité (Penetration testing)
- [ ] Documentation techniques jour
- [ ] Formation équipe sur nouvelles fonctionnalités
- [ ] Monitoring alertes configuré (Slack/PagerDuty)
- [ ] Backups testés (restore d'une copie)
- [ ] Conformité GDPR validée par juriste

---

**🎉 Avec ces améliorations, AGRI POINT SERVICE atteindra un niveau PREMIUM digne des meilleures plateformes 2026 !**
