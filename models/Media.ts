import mongoose, { Schema, Document, Model } from 'mongoose';

export type MediaType = 'image' | 'video' | 'document' | 'other';

export interface IMedia extends Document {
  filename: string;
  originalName: string;
  mimeType: string;
  size: number; // bytes
  type: MediaType;
  url: string;
  path: string;
  folder?: string;
  
  // Image specific
  width?: number;
  height?: number;
  thumbnailUrl?: string;
  
  // Metadata
  alt?: string;
  title?: string;
  description?: string;
  tags: string[];
  
  // Usage tracking
  usageCount: number;
  usedIn: Array<{
    type: 'page' | 'product' | 'content' | 'event' | 'other';
    id: mongoose.Types.ObjectId;
    name: string;
  }>;
  
  // Audit
  uploadedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const MediaSchema = new Schema<IMedia>({
  filename: { type: String, required: true },
  originalName: { type: String, required: true },
  mimeType: { type: String, required: true },
  size: { type: Number, required: true },
  type: {
    type: String,
    enum: ['image', 'video', 'document', 'other'],
    required: true,
  },
  url: { type: String, required: true },
  path: { type: String, required: true },
  folder: String,
  
  width: Number,
  height: Number,
  thumbnailUrl: String,
  
  alt: String,
  title: String,
  description: String,
  tags: [String],
  
  usageCount: { type: Number, default: 0 },
  usedIn: [{
    type: { type: String, enum: ['page', 'product', 'content', 'event', 'other'] },
    id: Schema.Types.ObjectId,
    name: String,
  }],
  
  uploadedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

// Indexes
MediaSchema.index({ filename: 1 });
MediaSchema.index({ type: 1, createdAt: -1 });
MediaSchema.index({ folder: 1, type: 1 });
MediaSchema.index({ uploadedBy: 1, createdAt: -1 });
MediaSchema.index({ tags: 1 });

const Media: Model<IMedia> = mongoose.models.Media || mongoose.model<IMedia>('Media', MediaSchema);

export default Media;
