import { Types } from "mongoose";

export interface GistGroup {
  _id: string; // Changed from 'id' to '_id' to match Mongoose convention
  name: string;
  gistIds: string[];
  userId?: string | Types.ObjectId; // Optional, since Sidebar uses owner
  owner: {
    login: string;
  };
}

export type ActiveTab = "profile" | "postGist" | "groups";