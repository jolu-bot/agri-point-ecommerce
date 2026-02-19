import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
  // Utilisateur qui a effectué l'action
  userId: string;
  userName: string;
  userEmail: string;
  userRole?: string;
  
  // Action effectuée
  action: string; // 'login', 'logout', 'create', 'update', 'delete', 'export', 'import', 'rollback'
  resource: string; // 'site-config', 'product', 'order', 'user', 'version', etc.
  resourceId?: string; // ID de la ressource affectée
  
  // Détails de l'action
  description: string; // Description lisible
  severity: 'info' | 'warning' | 'error' | 'critical'; // Niveau de sévérité
  
  // Données de l'action
  metadata?: {
    before?: any; // État avant modification
    after?: any; // État après modification
    changes?: Array<{
      field: string;
      oldValue: any;
      newValue: any;
    }>;
    [key: string]: any; // Autres métadonnées
  };
  
  // Informations techniques
  ipAddress?: string;
  userAgent?: string;
  requestMethod?: string; // GET, POST, PUT, DELETE
  requestPath?: string; // /api/admin/site-config
  
  // Tags pour filtrage
  tags?: string[];
  
  // Timestamp
  createdAt: Date;
}

const AuditLogSchema: Schema = new Schema<IAuditLog>({
  userId: { type: String, required: true, index: true },
  userName: { type: String, required: true },
  userEmail: { type: String, required: true },
  userRole: { type: String },
  
  action: { 
    type: String, 
    required: true,
    enum: ['login', 'logout', 'create', 'update', 'delete', 'export', 'import', 'rollback', 'view', 'restore'],
    index: true
  },
  resource: { 
    type: String, 
    required: true,
    index: true
  },
  resourceId: { type: String, index: true },
  
  description: { type: String, required: true },
  severity: { 
    type: String, 
    enum: ['info', 'warning', 'error', 'critical'],
    default: 'info',
    index: true
  },
  
  metadata: { type: Schema.Types.Mixed },
  
  ipAddress: { type: String },
  userAgent: { type: String },
  requestMethod: { type: String },
  requestPath: { type: String },
  
  tags: [{ type: String }],
  
  createdAt: { type: Date, default: Date.now, index: true }
});

// Index composés pour requêtes fréquentes
AuditLogSchema.index({ userId: 1, createdAt: -1 });
AuditLogSchema.index({ resource: 1, createdAt: -1 });
AuditLogSchema.index({ action: 1, createdAt: -1 });
AuditLogSchema.index({ severity: 1, createdAt: -1 });
AuditLogSchema.index({ createdAt: -1 }); // Pour la suppression automatique

// TTL Index : Suppression automatique après 90 jours
AuditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 }); // 90 jours

export default mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
