import { Octokit } from "@octokit/core";

export interface Gist {
  id: string;
  html_url: string;
  description: string | null;
  files: {
    [key: string]: {
      filename: string;
      language: string | null; 
      raw_url: string;
      size: number;
      content?: string; 
    };
  };
  created_at: string;
  updated_at: string;
  public: boolean;
  comments: number;
  forks_url: string; 
  owner: {
    login: string;
    html_url: string;
    avatar_url?: string;
  };
  [key: string]: any; 
}

export interface GistGroup {
  id: string; 
  name: string;
  gistIds?: { id: string; githubToken: string | null }[]; 
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