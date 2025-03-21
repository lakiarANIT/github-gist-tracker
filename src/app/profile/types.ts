// File: /app/profile/types.ts
import { Octokit } from "@octokit/core";

export interface Gist {
  id: string;
  html_url: string;
  description: string | null;
  files: {
    [key: string]: {
      filename: string;
      language: string | null; // Allow null as per API response
      raw_url: string;
      size: number;
      content?: string; // Add content, optional since it's not always needed upfront
    };
  };
  created_at: string;
  updated_at: string;
  public: boolean;
  comments: number;
  forks_url: string; // Add missing field
  owner: {
    login: string;
    html_url: string;
    avatar_url?: string;
  };
  [key: string]: any; // Allow additional properties from API response
}

export interface GistGroup {
  id: string; // MongoDB ObjectId as string
  name: string;
  gistIds?: { id: string; githubToken: string | null }[]; // Updated to match API response
  owner: {
    login: string;
  };
}

export interface GistFile {
  filename: string;
  content: string;
  language: string;
}

export interface NewGist {
  description: string;
  files: GistFile[];
  isPublic: boolean;
}

export type ActiveTab = "profile" | "postGist";
export type SetOctokit = (octokit: Octokit | null) => void;