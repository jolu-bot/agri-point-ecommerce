import mongoose, { Schema, models, Model } from 'mongoose';

export interface IMessage {
  _id: string;
  type: 'contact' | 'support' | 'agribot';
  user?: mongoose.Types.ObjectId | string;
  name?: string;
  email?: string;
  phone?: string;
  subject?: string;
  message: string;
  
  // Pour AgriBot
  conversation?: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>;
  
  status: 'new' | 'read' | 'replied' | 'closed';
  priority: 'low' | 'medium' | 'high';
  assignedTo?: mongoose.Types.ObjectId;
  
  response?: string;
  respondedAt?: Date;
  respondedBy?: mongoose.Types.ObjectId;
  
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>({
  type: {
    type: String,
    required: true,
    enum: ['contact', 'support', 'agribot'],
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  name: String,
  email: {
    type: String,
    match: [/^\S+@\S+\.\S+$/, 'Email invalide'],
  },
  phone: String,
  subject: String,
  message: {
    type: String,
    required: true,
  },
  
  conversation: [{
    role: {
      type: String,
      enum: ['user', 'assistant'],
    },
    content: String,
    timestamp: {
      type: Date,
      default: Date.now,
    },
  }],
  
  status: {
    type: String,
    default: 'new',
    enum: ['new', 'read', 'replied', 'closed'],
  },
  priority: {
    type: String,
    default: 'medium',
    enum: ['low', 'medium', 'high'],
  },
  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  
  response: String,
  respondedAt: Date,
  respondedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

// Index
MessageSchema.index({ status: 1, createdAt: -1 });
MessageSchema.index({ type: 1 });

const Message: Model<IMessage> = models.Message || mongoose.model<IMessage>('Message', MessageSchema);

export default Message;
