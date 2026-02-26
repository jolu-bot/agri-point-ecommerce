import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

if (!JWT_SECRET || JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET manquant ou trop court (minimum 32 caractères)');
}
if (!JWT_REFRESH_SECRET || JWT_REFRESH_SECRET.length < 32) {
  throw new Error('JWT_REFRESH_SECRET manquant ou trop court (minimum 32 caractères)');
}

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET as string, { expiresIn: '15m' });
}

export function generateRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_REFRESH_SECRET as string, { expiresIn: '7d' });
}

export function verifyAccessToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET as string) as TokenPayload;
  } catch {
    return null;
  }
}

export function verifyRefreshToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET as string) as TokenPayload;
  } catch {
    return null;
  }
}

// Permissions par rôle
export const ROLE_PERMISSIONS = {
  admin: [
    'users:read',
    'users:write',
    'users:delete',
    'products:read',
    'products:write',
    'products:delete',
    'orders:read',
    'orders:write',
    'orders:delete',
    'settings:read',
    'settings:write',
    'messages:read',
    'messages:write',
    'analytics:read',
    'agribot:manage',
  ],
  manager: [
    'products:read',
    'products:write',
    'orders:read',
    'orders:write',
    'messages:read',
    'messages:write',
    'analytics:read',
  ],
  redacteur: [
    'products:read',
    'settings:read',
    'settings:write',
    'messages:read',
  ],
  assistant_ia: [
    'agribot:manage',
    'messages:read',
    'messages:write',
    'products:read',
  ],
  client: [
    'products:read',
    'orders:read',
  ],
};

export function hasPermission(userRole: string, permission: string): boolean {
  const permissions = ROLE_PERMISSIONS[userRole as keyof typeof ROLE_PERMISSIONS] || [];
  return permissions.includes(permission);
}

export function getRolePermissions(role: string): string[] {
  return ROLE_PERMISSIONS[role as keyof typeof ROLE_PERMISSIONS] || [];
}
