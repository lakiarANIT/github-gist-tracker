import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@lib/authOptions";
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
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const groups = await GistGroup.find({ userId: session.user.id }).lean();
  if (!groups.length) {
    return NextResponse.json({ gists: [] }, { status: 200 });
  }

  const allGistIds = Array.from(new Set(groups.flatMap((group) => group.gistIds)));

  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
  const host = req.headers.get("host") || "localhost:3000";
  const baseUrl = `${protocol}://${host}`;

  const tokenResponse = await fetch(`${baseUrl}/api/github-token`, {
    method: "GET",
    headers: { cookie: req.headers.get("cookie") || "" },
  });

  if (!tokenResponse.ok) {
    const errorText = await tokenResponse.text();
    return NextResponse.json(
      { error: "Failed to fetch GitHub token", details: errorText },
      { status: 500 }
    );
  }

  const tokenData = await tokenResponse.json().catch((error) => {
    const responseText = tokenResponse.text();
    throw new Error("Invalid response from token endpoint");
  });
  const { githubToken } = tokenData;
  if (!githubToken) {
    return NextResponse.json({ error: "GitHub token not found" }, { status: 500 });
  }

  const octokit = new Octokit({ auth: githubToken });

  const gistPromises = allGistIds.map((gistId: string) =>
    octokit
      .request("GET /gists/{gist_id}", {
        gist_id: gistId,
        headers: { "X-GitHub-Api-Version": "2022-11-28" },
      })
      .then((response) => ({ id: gistId, response: response as OctokitResponse<GistData> }))
      .catch((error) => ({ id: gistId, response: null }))
  );

  const gistResults = await Promise.all(gistPromises);

  const invalidGistIds = gistResults
    .filter((result) => result.response === null)
    .map((result) => result.id);

  if (invalidGistIds.length > 0) {
    await Promise.all(
      groups.map(async (group) => {
        const updatedGistIds = (group.gistIds || []).filter(
          (id: string) => !invalidGistIds.includes(id)
        );
        if (updatedGistIds.length !== group.gistIds.length) {
          await GistGroup.updateOne(
            { _id: group._id, userId: session.user.id },
            { $set: { gistIds: updatedGistIds } }
          );
        }
      })
    );
  }

  const gists = gistResults
    .filter((result) => result.response !== null)
    .map((result) => {
      const data = result.response as OctokitResponse<GistData>;
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