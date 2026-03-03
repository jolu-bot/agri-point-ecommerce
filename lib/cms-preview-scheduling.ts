import { v4 as uuidv4 } from 'uuid';

export interface PreviewSession {
  id: string;
  userId: string;
  contentId: string;
  contentType: 'page' | 'product' | 'post' | 'campaign';
  startedAt: Date;
  expiresAt: Date;
  isActive: boolean;
}

export interface ScheduledPublish {
  id: string;
  contentId: string;
  contentType: 'page' | 'product' | 'post' | 'campaign';
  scheduledFor: Date;
  publishBy: string; // User ID
  isPublished: boolean;
  publishedAt?: Date;
  status: 'pending' | 'scheduled' | 'published' | 'failed';
  errorMessage?: string;
}

/**
 * Démarre une session de preview
 */
export function createPreviewSession(
  userId: string,
  contentId: string,
  contentType: 'page' | 'product' | 'post' | 'campaign'
): PreviewSession {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 30 * 60000); // 30 minutes

  return {
    id: uuidv4(),
    userId,
    contentId,
    contentType,
    startedAt: now,
    expiresAt,
    isActive: true,
  };
}

/**
 * Valide une session de preview
 */
export function validatePreviewSession(session: PreviewSession): boolean {
  return session.isActive && new Date() < session.expiresAt;
}

/**
 * Ferme une session de preview
 */
export function closePreviewSession(session: PreviewSession): void {
  session.isActive = false;
}

/**
 * Planifie une publication pour plus tard
 */
export function schedulePublication(
  contentId: string,
  contentType: 'page' | 'product' | 'post' | 'campaign',
  scheduledTime: Date,
  userId: string
): ScheduledPublish {
  return {
    id: uuidv4(),
    contentId,
    contentType,
    scheduledFor: scheduledTime,
    publishBy: userId,
    isPublished: false,
    status: 'scheduled',
  };
}

/**
 * Marque une publication comme "publiée"
 */
export function markAsPublished(scheduled: ScheduledPublish): void {
  scheduled.isPublished = true;
  scheduled.publishedAt = new Date();
  scheduled.status = 'published';
}

/**
 * Marque une publication comme échouée
 */
export function markPublicationFailed(scheduled: ScheduledPublish, error: string): void {
  scheduled.status = 'failed';
  scheduled.errorMessage = error;
}

/**
 * Récupère les publications "overdue" (should be published now)
 */
export function getOverduePublications(schedules: ScheduledPublish[]): ScheduledPublish[] {
  return schedules.filter(
    s => s.status === 'scheduled' && new Date() >= s.scheduledFor
  );
}

/**
 * Formatte la date pour affichage au format français
 */
export function formatScheduleDate(date: Date): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

/**
 * Vérifie si une publication est imminente (< 1 heure)
 */
export function isPublicationImminent(scheduled: ScheduledPublish): boolean {
  const now = new Date();
  const oneHourMs = 60 * 60 * 1000;
  const diff = scheduled.scheduledFor.getTime() - now.getTime();

  return diff > 0 && diff < oneHourMs;
}
