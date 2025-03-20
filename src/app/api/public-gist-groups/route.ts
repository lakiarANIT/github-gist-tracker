import { NextResponse } from "next/server";
import { connectDB } from "@lib/database";
import GistGroup from "@models/GistGroup";
import { Octokit } from "@octokit/core";

// Define the raw type returned by lean(), matching the GistGroup schema
interface RawGistGroup {
  _id: string; // lean() converts ObjectId to string
  userId: string; // Matches Schema.Types.ObjectId, converted to string by lean()
  name: string;
  gistIds: string[];
  ownerLogin?: string; // Optional, only if added to schema
  __v?: number; // MongoDB version key, optional
}

export async function GET() {
  await connectDB();

  try {
    // Fetch all gist groups with explicit typing
    // Use lean() with a type assertion to match RawGistGroup
    const groups = await GistGroup.find<RawGistGroup>().lean().exec() as RawGistGroup[];
    if (!groups.length) {
      return NextResponse.json({ groups: [], gists: [] }, { status: 200 });
    }

    // Collect all gist IDs from all groups
    const allGistIds = groups.flatMap((group) => group.gistIds || []);

    // Use GitHub API to fetch gist details (assuming gists are public)
    const octokit = new Octokit(); // No auth needed for public gists
    const gistPromises = allGistIds.map((gistId) =>
      octokit
        .request("GET /gists/{gist_id}", {
          gist_id: gistId,
          headers: { "X-GitHub-Api-Version": "2022-11-28" },
        })
        .then((res) => res.data)
        .catch((err) => {
          console.error(`Failed to fetch gist ${gistId}:`, err);
          return null;
        })
    );

    const gists = (await Promise.all(gistPromises)).filter((gist) => gist !== null);

    // Transform raw groups to match GistGroup type
    const formattedGroups = groups.map((group) => ({
      id: group._id.toString(), // Already a string from lean()
      name: group.name,
      gistIds: group.gistIds || [],
      owner: { login: group.ownerLogin || "Unknown" }, // Adjust based on your data
    }));

    return NextResponse.json({
      groups: formattedGroups,
      gists,
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching public gist groups:", error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}