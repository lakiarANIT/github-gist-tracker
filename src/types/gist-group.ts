// File: /src/types/gist-group.ts
import mongoose from "mongoose";

export interface GistGroup {
  _id: string | mongoose.Types.ObjectId; // Keep the union type
  userId: string | mongoose.Types.ObjectId;
  name: string;
  gistIds: string[];
  __v?: number;
}