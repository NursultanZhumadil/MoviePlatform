import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IGenre extends Document {
  name: string;
  description: string;
  movies: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const GenreSchema = new Schema<IGenre>(
  {
    name: {
      type: String,
      required: [true, 'Genre name is required'],
      unique: true,
      trim: true,
      minlength: [2, 'Genre name must be at least 2 characters'],
      maxlength: [50, 'Genre name cannot exceed 50 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters'],
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    movies: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Movie',
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes
GenreSchema.index({ name: 1 });

export const Genre = mongoose.model<IGenre>('Genre', GenreSchema);

