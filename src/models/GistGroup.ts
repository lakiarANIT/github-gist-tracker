// File: /src/models/GistGroup.ts
import mongoose, { Schema, Document } from "mongoose";
import { GistGroup } from "src/types/gist-group";

// Define the Mongoose document interface for GistGroup
interface GistGroupDocument extends GistGroup, Document<string | mongoose.Types.ObjectId> {}

const GistGroupSchema = new Schema<GistGroupDocument>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  gistIds: [{ type: String }],
});

export default mongoose.models.GistGroup || mongoose.model<GistGroupDocument>("GistGroup", GistGroupSchema);