import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { connectDB } from "@lib/database";
import GistGroup from "@models/GistGroup";
import { Octokit } from "@octokit/core";
import { OctokitResponse } from "@octokit/types";

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

export async function GET(req: Request) {
    console.log("[API/all-gists] Starting GET request");
  
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      console.log("[API/all-gists] No session or user ID found, returning 401");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.log("[API/all-gists] Session authenticated for user:", session.user.id);
  
    await connectDB();
    console.log("[API/all-gists] Connected to database");
  
    console.log("[API/all-gists] Fetching Gist groups for user:", session.user.id);
    const groups = await GistGroup.find({ userId: session.user.id }).lean();
    if (!groups.length) {
      console.log("[API/all-gists] No Gist groups found, returning empty array");
      return NextResponse.json({ gists: [] }, { status: 200 });
    }
    console.log("[API/all-gists] Gist groups retrieved:", groups.length);
  
    const allGistIds = Array.from(new Set(groups.flatMap((group) => group.gistIds)));
    console.log("[API/all-gists] Unique Gist IDs to fetch:", allGistIds);
  
    const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
    const host = req.headers.get("host") || "localhost:3000";
    const baseUrl = `${protocol}://${host}`;
    console.log("[API/all-gists] Base URL for token fetch:", baseUrl);
  
    console.log("[API/all-gists] Fetching GitHub token from /api/github-token");
    const tokenResponse = await fetch(`${baseUrl}/api/github-token`, {
      method: "GET",
      headers: { cookie: req.headers.get("cookie") || "" },
    });
  
    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error("[API/all-gists] Failed to fetch GitHub token:", errorText);
      return NextResponse.json(
        { error: "Failed to fetch GitHub token", details: errorText },
        { status: 500 }
      );
    }
    console.log("[API/all-gists] GitHub token fetch successful");
  
    const tokenData = await tokenResponse.json().catch((error) => {
      const responseText = tokenResponse.text();
      console.error("[API/all-gists] Invalid JSON from /api/github-token:", responseText);
      throw new Error("Invalid response from token endpoint");
    });
    const { githubToken } = tokenData;
    if (!githubToken) {
      console.log("[API/all-gists] No GitHub token found in response");
      return NextResponse.json({ error: "GitHub token not found" }, { status: 500 });
    }
    console.log("[API/all-gists] GitHub token obtained");
  
    const octokit = new Octokit({ auth: githubToken });
    console.log("[API/all-gists] Octokit initialized");
  
    console.log("[API/all-gists] Creating promises to fetch Gists:", allGistIds.length);
    const gistPromises = allGistIds.map((gistId: string) => {
      console.log(`[API/all-gists] Fetching Gist: ${gistId}`);
      return octokit
        .request("GET /gists/{gist_id}", {
          gist_id: gistId,
          headers: { "X-GitHub-Api-Version": "2022-11-28" },
        })
        .then((response) => {
          console.log(`[API/all-gists] Successfully fetched Gist: ${gistId}`);
          return { id: gistId, response: response as OctokitResponse<GistData> };
        })
        .catch((error) => {
          if (error.status === 404) {
            console.log(`[API/all-gists] Gist ${gistId} not found on GitHub, will be cleaned up`);
          } else {
            console.error(`[API/all-gists] Unexpected error fetching Gist ${gistId}:`, error);
          }
          return { id: gistId, response: null };
        });
    });
  
    console.log("[API/all-gists] Awaiting all Gist fetch promises");
    const gistResults = await Promise.all(gistPromises);
    console.log("[API/all-gists] Gist responses received:", gistResults.length);
  
    const invalidGistIds = gistResults
      .filter((result) => result.response === null)
      .map((result) => result.id);
    console.log("[API/all-gists] Invalid Gist IDs found:", invalidGistIds);
  
    if (invalidGistIds.length > 0) {
      console.log("[API/all-gists] Cleaning up invalid Gist IDs from groups");
      await Promise.all(
        groups.map(async (group) => {
          const updatedGistIds = (group.gistIds || []).filter(
            (id: string) => !invalidGistIds.includes(id)
          );
          if (updatedGistIds.length !== group.gistIds.length) {
            console.log(`[API/all-gists] Updating group ${group._id} with new gistIds`);
            await GistGroup.updateOne(
              { _id: group._id, userId: session.user.id },
              { $set: { gistIds: updatedGistIds } }
            );
            console.log(`[API/all-gists] Group ${group._id} updated successfully`);
          }
        })
      );
    }
  
    const gists = gistResults
      .filter((result) => result.response !== null)
      .map((result) => {
        const data = result.response as OctokitResponse<GistData>;
        console.log(`[API/all-gists] Processing Gist: ${data.data.id}`);
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
    console.log("[API/all-gists] Gists processed:", gists.length);
  
    if (gists.length === 0) {
      console.log("[API/all-gists] No valid Gists found after cleanup");
    }
  
    console.log("[API/all-gists] Returning response with gists");
    return NextResponse.json({ gists }, { status: 200 });
  }