import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IFavorite extends Document {
  userId: Types.ObjectId;
  movieId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const FavoriteSchema = new Schema<IFavorite>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    movieId: {
      type: Schema.Types.ObjectId,
      ref: 'Movie',
      required: [true, 'Movie ID is required'],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
FavoriteSchema.index({ userId: 1 });
FavoriteSchema.index({ movieId: 1 });
FavoriteSchema.index({ userId: 1, movieId: 1 }, { unique: true }); // One favorite per user per movie

export const Favorite = mongoose.model<IFavorite>('Favorite', FavoriteSchema);

