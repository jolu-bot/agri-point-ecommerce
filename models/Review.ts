import mongoose, { Schema, models, Model } from 'mongoose';

export interface IReview {
  _id: string;
  productId: string;
  userId?: string;
  userName: string;
  rating: 1 | 2 | 3 | 4 | 5;
  text: string;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    productId: {
      type: String,
      required: true,
      index: true,
    },
    userId: {
      type: String,
    },
    userName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    verified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

ReviewSchema.index({ productId: 1, createdAt: -1 });

const Review: Model<IReview> =
  models.Review || mongoose.model<IReview>('Review', ReviewSchema);

export default Review;
