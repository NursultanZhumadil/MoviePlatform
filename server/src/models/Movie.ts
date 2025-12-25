import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IMovie extends Document {
  title: string;
  description: string;
  genre: Types.ObjectId;
  year: number;
  director: string;
  duration: number;
  poster: string;
  rating: number;
  trailerUrl?: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MovieSchema = new Schema<IMovie>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [1, 'Title cannot be empty'],
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    genre: {
      type: Schema.Types.ObjectId,
      ref: 'Genre',
      required: [true, 'Genre is required'],
    },
    year: {
      type: Number,
      required: [true, 'Year is required'],
      min: [1900, 'Year must be after 1900'],
      max: [new Date().getFullYear() + 5, 'Year cannot be in the future'],
    },
    director: {
      type: String,
      required: [true, 'Director is required'],
      trim: true,
      minlength: [2, 'Director name must be at least 2 characters'],
      maxlength: [100, 'Director name cannot exceed 100 characters'],
    },
    duration: {
      type: Number,
      required: [true, 'Duration is required'],
      min: [1, 'Duration must be at least 1 minute'],
      max: [600, 'Duration cannot exceed 600 minutes'],
    },
    poster: {
      type: String,
      required: [true, 'Poster URL is required'],
      trim: true,
    },
    rating: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be negative'],
      max: [10, 'Rating cannot exceed 10'],
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    trailerUrl: {
  type: String,
},
  },
  {
    timestamps: true,
  }
);

// Indexes
MovieSchema.index({ title: 1 });
MovieSchema.index({ genre: 1 });
MovieSchema.index({ year: 1 });
MovieSchema.index({ isDeleted: 1 });
MovieSchema.index({ rating: -1 });

export const Movie = mongoose.model<IMovie>('Movie', MovieSchema);

