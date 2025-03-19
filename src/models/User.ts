// @models/User.ts
import mongoose, { Schema, model, Model } from "mongoose";

interface IUser {
  email: string;
  password?: string; 
  name?: string;
  bio?: string;
  avatar?: string;
  githubToken?: string;
  location?: { lat: number; lng: number };
  favoriteGists?: string[];
  createdAt: Date;
}

const userSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  password: { type: String }, 
  name: { type: String },
  bio: { type: String },
  avatar: { type: String },
  githubToken: { type: String },
  location: { type: { lat: Number, lng: Number }, default: null }, 
  favoriteGists: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now },
});

const User: Model<IUser> = mongoose.models.User || model<IUser>("User", userSchema);

export default User;