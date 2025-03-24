import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@lib/authOptions";
import { connectDB } from "@lib/database";
import GistGroup from "@models/GistGroup";
import { Octokit } from "@octokit/core";

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
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    let githubToken = session.user.githubToken;
    if (!githubToken) {
      const tokenResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/github-token`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Cookie: req.headers.get("cookie") || "",
        },
      });

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        throw new Error(`Failed to fetch GitHub token: ${tokenResponse.status} ${errorText}`);
      }
      const tokenData = await tokenResponse.json();
      githubToken = tokenData.githubToken;
      if (!githubToken) {
        return NextResponse.json({ error: "GitHub token not found" }, { status: 400 });
      }
    }

    const octokit = new Octokit({ auth: githubToken });

    const userResponse = await octokit.request("GET /user", {
      headers: { "X-GitHub-Api-Version": "2022-11-28" },
    });
    const username = userResponse.data.login;

    await connectDB();
    const groups = await GistGroup.find({ userId: session.user.id }).lean() as RawGistGroup[];

    const gistsResponse = await octokit.request("GET /gists", {
      headers: { "X-GitHub-Api-Version": "2022-11-28" },
      per_page: 100,
    });
    const gists = gistsResponse.data;

    const formattedGroups = groups.map((group) => ({
      id: group._id.toString(),
      name: group.name,
      gistIds: (group.gistIds || []).map((gistId: string) => ({
        id: gistId,
        githubToken,
      })),
      owner: { login: username },
    }));

    const filteredGists = gists.filter((gist) => gist.owner?.login === username);

    return NextResponse.json({
      groups: formattedGroups,
      gists: filteredGists,
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}