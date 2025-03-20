import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { connectDB } from "@lib/database";
import GistGroup from "@models/GistGroup";
import { Octokit } from "@octokit/core";
import { OctokitResponse } from "@octokit/types";
import { authOptions } from "@app/api/auth/[...nextauth]/route";
import { GistGroup as GistGroupInterface } from "src/types/gist-group";

// Define a minimal Gist data type based on GitHub API response
interface GistData {
  id: string;
  html_url: string;
  description: string | null;
  files: {
    [key: string]: {
      filename?: string;
      language?: string | null;
      raw_url?: string;
      size?: number;
      type?: string;
      truncated?: boolean;
      content?: string;
    };
  };
  created_at: string;
  updated_at: string;
  public: boolean;
  comments: number;
  owner?: {
    login: string;
    html_url: string;
  };
}

export async function POST(req: Request, { params }: { params: Promise<{ groupId: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const resolvedParams = await params;
  const { groupId } = resolvedParams;
  const { gistId } = await req.json();
  if (!gistId) {
    return NextResponse.json({ error: "Gist ID is required" }, { status: 400 });
  }

  await connectDB();
  const group = await GistGroup.findOne({ _id: groupId, userId: session.user.id });
  if (!group) {
    return NextResponse.json({ error: "Group not found" }, { status: 404 });
  }

  if (!group.gistIds.includes(gistId)) {
    group.gistIds.push(gistId);
    await group.save();
  }

  return NextResponse.json({ message: "Gist added to group", group }, { status: 200 });
}

export async function GET(req: Request, { params }: { params: Promise<{ groupId: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const resolvedParams = await params;
  const { groupId } = resolvedParams;
  await connectDB();
  const group = await GistGroup.findOne({ _id: groupId, userId: session.user.id }).lean<GistGroupInterface>();
  if (!group) {
    return NextResponse.json({ error: "Group not found" }, { status: 404 });
  }

  // Determine the base URL based on environment
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
  const host = req.headers.get("host") || "localhost:3000"; // Fallback for local dev
  const baseUrl = `${protocol}://${host}`;

  // Fetch GitHub token with full URL
  const tokenResponse = await fetch(`${baseUrl}/api/github-token`, {
    method: "GET",
    headers: {
      cookie: req.headers.get("cookie") || "", // Forward cookies for session
    },
  });

  if (!tokenResponse.ok) {
    const errorText = await tokenResponse.text();
    console.error("Failed to fetch GitHub token:", errorText);
    return NextResponse.json(
      { error: "Failed to fetch GitHub token", details: errorText },
      { status: 500 }
    );
  }

  const { githubToken } = await tokenResponse.json();
  if (!githubToken) {
    return NextResponse.json({ error: "GitHub token not found" }, { status: 500 });
  }

  const octokit = new Octokit({ auth: githubToken });

  // Fetch Gist details for each gistId with type assertion
  const gistPromises = group.gistIds.map((gistId: string) =>
    octokit
      .request("GET /gists/{gist_id}", {
        gist_id: gistId,
        headers: { "X-GitHub-Api-Version": "2022-11-28" },
      })
      .then((response) => response as OctokitResponse<GistData>)
      .catch((error) => {
        console.error(`Error fetching gist ${gistId}:`, error);
        return null; // Handle individual failures gracefully
      })
  );

  const gistResponses = await Promise.all(gistPromises);
  const gists = gistResponses
    .filter((response) => response !== null)
    .map((response) => {
      const data = response as OctokitResponse<GistData>;
      return {
        id: data.data.id,
        html_url: data.data.html_url,
        description: data.data.description,
        files: Object.fromEntries(
          Object.entries(data.data.files).map(([filename, file]) => [
            filename,
            {
              filename: file.filename || "",
              language: file.language || "Text",
              raw_url: file.raw_url || "",
              size: file.size || 0,
            },
          ])
        ) as Record<string, { filename: string; language: string; raw_url: string; size: number }>,
        created_at: data.data.created_at,
        updated_at: data.data.updated_at,
        public: data.data.public,
        comments: data.data.comments,
        owner: {
          login: data.data.owner?.login || "unknown",
          html_url: data.data.owner?.html_url || "",
        },
      };
    });

  return NextResponse.json({ gists }, { status: 200 });
}