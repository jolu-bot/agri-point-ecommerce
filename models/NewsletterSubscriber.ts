import mongoose, { Schema, models, Model } from 'mongoose';
import crypto from 'crypto';

export interface INewsletterSubscriber {
  _id: string;
  email: string;
  locale: 'fr' | 'en';
  source: string;
  subscribed: boolean;
  subscribedAt: Date;
  unsubscribeToken: string;
  unsubscribedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const NewsletterSubscriberSchema = new Schema<INewsletterSubscriber>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Email invalide'],
    },
    locale: {
      type: String,
      enum: ['fr', 'en'],
      default: 'fr',
    },
    source: {
      type: String,
      default: 'homepage',
    },
    subscribed: {
      type: Boolean,
      default: true,
    },
    subscribedAt: {
      type: Date,
      default: Date.now,
    },
    unsubscribeToken: {
      type: String,
      default: () => crypto.randomBytes(32).toString('hex'),
      unique: true,
    },
    unsubscribedAt: Date,
  },
  { timestamps: true }
);

NewsletterSubscriberSchema.index({ email: 1 });
NewsletterSubscriberSchema.index({ subscribed: 1 });

const NewsletterSubscriber: Model<INewsletterSubscriber> =
  models.NewsletterSubscriber ||
  mongoose.model<INewsletterSubscriber>('NewsletterSubscriber', NewsletterSubscriberSchema);

export default NewsletterSubscriber;
