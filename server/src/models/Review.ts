import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IReview extends Document {
  movieId: Types.ObjectId;
  userId: Types.ObjectId;
  rating: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    movieId: {
      type: Schema.Types.ObjectId,
      ref: 'Movie',
      required: [true, 'Movie ID is required'],
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [10, 'Rating cannot exceed 10'],
    },
    comment: {
      type: String,
      required: [true, 'Comment is required'],
      trim: true,
      minlength: [5, 'Comment must be at least 5 characters'],
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
ReviewSchema.index({ movieId: 1 });
ReviewSchema.index({ userId: 1 });
ReviewSchema.index({ movieId: 1, userId: 1 }, { unique: true }); // One review per user per movie

export const Review = mongoose.model<IReview>('Review', ReviewSchema);

