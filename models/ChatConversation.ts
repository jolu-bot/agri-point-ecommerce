import mongoose, { Schema, Document, models } from 'mongoose';

export interface IChatMessage {
  role: 'user' | 'assistant' | 'tool';
  content: string;
  timestamp: Date;
  feedback?: 'positive' | 'negative';
  toolName?: string;
  toolResult?: string;
  tokens?: number;
}

export interface IChatConversation extends Document {
  sessionId: string;
  userId?: string;
  userEmail?: string;
  messages: IChatMessage[];
  metadata: {
    userAgent?: string;
    page?: string;
    totalTokens: number;
    model: string;
    feedbackScore: number; // 0-100 based on thumbs up/down
  };
  tags: string[]; // Auto-detected topics
  isResolved: boolean;
  escalatedToHuman: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ChatMessageSchema = new Schema<IChatMessage>({
  role: { type: String, enum: ['user', 'assistant', 'tool'], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  feedback: { type: String, enum: ['positive', 'negative'] },
  toolName: String,
  toolResult: String,
  tokens: Number,
});

const ChatConversationSchema = new Schema<IChatConversation>({
  sessionId: { type: String, required: true, index: true },
  userId: { type: String },
  userEmail: { type: String },
  messages: [ChatMessageSchema],
  metadata: {
    userAgent: String,
    page: String,
    totalTokens: { type: Number, default: 0 },
    model: { type: String, default: 'gpt-4o-mini' },
    feedbackScore: { type: Number, default: 50 },
  },
  tags: [{ type: String }],
  isResolved: { type: Boolean, default: false },
  escalatedToHuman: { type: Boolean, default: false },
}, {
  timestamps: true,
});

ChatConversationSchema.index({ sessionId: 1 });
ChatConversationSchema.index({ userId: 1, createdAt: -1 });
ChatConversationSchema.index({ 'metadata.feedbackScore': 1 });
ChatConversationSchema.index({ tags: 1, createdAt: -1 });

export default models.ChatConversation ||
  mongoose.model<IChatConversation>('ChatConversation', ChatConversationSchema);
