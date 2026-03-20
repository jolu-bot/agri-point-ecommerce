import dbConnect from '@/lib/db';
import User from '@/models/User';

export type LoyaltyTier = 'bronze' | 'argent' | 'or' | 'platine';

export const TIER_THRESHOLDS: Record<LoyaltyTier, number> = {
  bronze:  0,
  argent:  10_000,
  or:      25_000,
  platine: 75_000,
};

const TIER_ORDER: LoyaltyTier[] = ['bronze', 'argent', 'or', 'platine'];

export function computeTier(points: number): LoyaltyTier {
  let tier: LoyaltyTier = 'bronze';
  for (const t of TIER_ORDER) {
    if (points >= TIER_THRESHOLDS[t]) tier = t;
  }
  return tier;
}

export function nextTierInfo(points: number): {
  nextTier: LoyaltyTier | null;
  remaining: number;
  progress: number;
} {
  const currentTier = computeTier(points);
  const currentIdx  = TIER_ORDER.indexOf(currentTier);
  const nextTier    = TIER_ORDER[currentIdx + 1] ?? null;

  if (!nextTier) {
    return { nextTier: null, remaining: 0, progress: 100 };
  }

  const start     = TIER_THRESHOLDS[currentTier];
  const end       = TIER_THRESHOLDS[nextTier];
  const remaining = end - points;
  const progress  = Math.round(((points - start) / (end - start)) * 100);

  return { nextTier, remaining, progress };
}

/**
 * Crédite des points de fidélité à un utilisateur (1 point = 1 FCFA dépensé).
 * Met à jour le tier si nécessaire.
 */
export async function awardLoyaltyPoints(
  userId: string,
  amountFcfa: number
): Promise<void> {
  await dbConnect();

  const points = Math.round(amountFcfa);

  const user = await User.findByIdAndUpdate(
    userId,
    { $inc: { loyaltyPoints: points } },
    { new: true, select: 'loyaltyPoints loyaltyTier' }
  );

  if (!user) return;

  const newPoints = user.loyaltyPoints ?? 0;
  const newTier   = computeTier(newPoints);

  if (user.loyaltyTier !== newTier) {
    await User.findByIdAndUpdate(userId, { $set: { loyaltyTier: newTier } });
  }
}
