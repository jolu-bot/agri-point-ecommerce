import mongoose from 'mongoose';

/**
 * Modèle pour le versioning des configurations
 * Permet le rollback et l'historique complet des modifications
 */

export interface IConfigVersion {
  _id: string;
  version: number;
  config: any; // Configuration complète sauvegardée
  changedBy: {
    userId: string;
    userName: string;
    userEmail: string;
  };
  changes: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
  description?: string;
  tags: string[];
  createdAt: Date;
  restoredFrom?: string; // Si c'est une restauration, ID de la version source
}

const ConfigVersionSchema = new mongoose.Schema<IConfigVersion>({
  version: {
    type: Number,
    required: true,
    index: true,
  },
  config: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  changedBy: {
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    userEmail: { type: String, required: true },
  },
  changes: [{
    field: { type: String, required: true },
    oldValue: { type: mongoose.Schema.Types.Mixed },
    newValue: { type: mongoose.Schema.Types.Mixed },
  }],
  description: String,
  tags: [{ type: String }],
  restoredFrom: { type: String },
}, {
  timestamps: true,
});

// Index composé pour recherche rapide
ConfigVersionSchema.index({ version: -1, createdAt: -1 });
ConfigVersionSchema.index({ 'changedBy.userId': 1, createdAt: -1 });

export default mongoose.models.ConfigVersion || mongoose.model<IConfigVersion>('ConfigVersion', ConfigVersionSchema);
