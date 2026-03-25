import mongoose, { Schema, models, Model } from 'mongoose';

export interface IBlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: 'culture' | 'sol' | 'fertilisation' | 'actualite';
  author: string;
  coverImage?: string;
  tags: string[];
  readTime: number;
  publishedAt?: Date;
  isPublished: boolean;
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

const BlogPostSchema = new Schema<IBlogPost>(
  {
    title:      { type: String, required: true, trim: true },
    slug:       { type: String, required: true, unique: true, lowercase: true, trim: true },
    excerpt:    { type: String, required: true, trim: true },
    content:    { type: String, required: true },
    category: {
      type: String,
      enum: ['culture', 'sol', 'fertilisation', 'actualite'],
      required: true,
    },
    author:     { type: String, required: true, trim: true },
    coverImage: { type: String },
    tags:       [{ type: String }],
    readTime:   { type: Number, default: 5 },
    publishedAt: Date,
    isPublished: { type: Boolean, default: false },
    views:      { type: Number, default: 0 },
  },
  { timestamps: true }
);

BlogPostSchema.index({ title: 'text', excerpt: 'text' });
BlogPostSchema.index({ isPublished: 1, publishedAt: -1 });
BlogPostSchema.index({ category: 1, isPublished: 1 });

const BlogPost: Model<IBlogPost> = models.BlogPost || mongoose.model<IBlogPost>('BlogPost', BlogPostSchema);
export default BlogPost;
