import { Octokit } from "@octokit/core";

// Define the Gist interface to match the GitHub API response with optional fields
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

// Define the Gist group interface
export interface GistGroup {
  id: string; // MongoDB ObjectId as string
  name: string;
}

// Define the structure for a new Gist file
export interface GistFile {
  filename: string;
  content: string;
  language: string;
}

// Dummy Gist data (for initial display)
export const dummyGists: Gist[] = [
  {
    id: "aa5a315d61ae9438b18d",
    html_url: "https://gist.github.com/aa5a315d61ae9438b18d",
    description: "Hello World Examples",
    files: {
      "hello_world.rb": {
        filename: "hello_world.rb",
        language: "Ruby",
        raw_url:
          "https://gist.githubusercontent.com/octocat/6cad326836d38bd3a7ae/raw/db9c55113504e46fa076e7df3a04ce592e2e86d8/hello_world.rb",
        size: 167,
      },
    },
    created_at: "2010-04-14T02:15:15Z",
    updated_at: "2011-06-20T11:34:15Z",
    public: true,
    comments: 0,
    owner: { login: "octocat", html_url: "https://github.com/octocat" },
  },
  {
    id: "bb5b315d61ae9438b19e",
    html_url: "https://gist.github.com/bb5b315d61ae9438b19e",
    description: "Simple Python Script",
    files: {
      "script.py": {
        filename: "script.py",
        language: "Python",
        raw_url: "https://gist.githubusercontent.com/octocat/bb5b315d61ae9438b19e/raw/script.py",
        size: 245,
      },
    },
    created_at: "2020-05-10T09:00:00Z",
    updated_at: "2020-05-11T14:20:00Z",
    public: false,
    comments: 2,
    owner: { login: "octocat", html_url: "https://github.com/octocat" },
  },
];

// Type for the new gist state
export interface NewGist {
  description: string;
  files: GistFile[];
  isPublic: boolean;
}

export type ActiveTab = "profile" | "postGist";

export type SetOctokit = (octokit: Octokit | null) => void;