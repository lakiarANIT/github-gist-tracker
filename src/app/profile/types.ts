// File: /app/profile/types.ts
import { Octokit } from "@octokit/core";

export interface Gist {
  id: string;
  html_url: string;
  description: string | null;
  files: {
    [key: string]: {
      filename: string;
      language: string;
      raw_url: string;
      size: number;
    };
  };
  created_at: string;
  updated_at: string;
  public: boolean;
  comments: number;
  owner: { login: string; html_url: string };
}

export interface GistGroup {
  id: string; // MongoDB ObjectId as string
  name: string;
  gistIds?: string[]; // Add optional gistIds array
}

export interface GistFile {
  filename: string;
  content: string;
  language: string;
}

export const dummyGists: Gist[] = [
  // ... (unchanged)
];

export interface NewGist {
  description: string;
  files: GistFile[];
  isPublic: boolean;
}

export type ActiveTab = "profile" | "postGist";
export type SetOctokit = (octokit: Octokit | null) => void;