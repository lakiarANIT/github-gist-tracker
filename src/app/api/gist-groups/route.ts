// File: /app/api/gist-groups/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { connectDB } from "@lib/database";
import GistGroup from "@models/GistGroup";
import { Octokit } from "@octokit/core";

// Define the raw GistGroup type from the database
interface RawGistGroup {
  _id: string;
  userId: string;
  name: string;
  gistIds: string[];
  __v?: number;
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name } = await req.json();
  if (!name) {
    return NextResponse.json({ error: "Group name is required" }, { status: 400 });
  }

  await connectDB();
  const newGroup = new GistGroup({
    userId: session.user.id,
    name,
    gistIds: [],
  });
  await newGroup.save();

  return NextResponse.json({ message: "Group created", group: newGroup }, { status: 201 });
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    console.log("No session or user ID found in /api/gist-groups");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log("Session found in /api/gist-groups:", {
      userId: session.user.id,
      email: session.user.email,
      hasGithubToken: !!session.user.githubToken,
    });

    // Use session.githubToken if available, fallback to /api/github-token
    let githubToken = session.user.githubToken;
    if (!githubToken) {
      console.log("Fetching GitHub token from /api/github-token");
      const tokenResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/github-token`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          // Pass cookies to ensure session context
          Cookie: req.headers.get("cookie") || "",
        },
      });

      console.log("Token response status:", tokenResponse.status);
      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        console.error("Token fetch failed:", errorText);
        throw new Error(`Failed to fetch GitHub token: ${tokenResponse.status} ${errorText}`);
      }
      const tokenData = await tokenResponse.json();
      githubToken = tokenData.githubToken;
      if (!githubToken) {
        console.error("No githubToken in response:", tokenData);
        return NextResponse.json({ error: "GitHub token not found" }, { status: 400 });
      }
    }

    const octokit = new Octokit({ auth: githubToken });

    // Fetch user's GitHub profile to get username
    const userResponse = await octokit.request("GET /user", {
      headers: { "X-GitHub-Api-Version": "2022-11-28" },
    });
    const username = userResponse.data.login;
    console.log("GitHub username fetched:", username);

    // Connect to database and fetch groups
    await connectDB();
    const groups = await GistGroup.find({ userId: session.user.id }).lean() as RawGistGroup[];

    // Fetch all gists (public and private) for the user
    const gistsResponse = await octokit.request("GET /gists", {
      headers: { "X-GitHub-Api-Version": "2022-11-28" },
      per_page: 100,
    });
    const gists = gistsResponse.data;

    // Format groups with gistIds as objects including the user's GitHub token
    const formattedGroups = groups.map((group) => ({
      id: group._id.toString(),
      name: group.name,
      gistIds: (group.gistIds || []).map((gistId: string) => ({
        id: gistId,
        githubToken,
      })),
      owner: { login: username },
    }));

    // Filter gists to only include those owned by the user
    const filteredGists = gists.filter((gist) => gist.owner?.login === username);

    console.log("Returning groups and gists:", {
      groupCount: formattedGroups.length,
      gistCount: filteredGists.length,
    });

    return NextResponse.json({
      groups: formattedGroups,
      gists: filteredGists,
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching groups and gists:", error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}