// src/app/api/public-gist-groups/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@lib/database";
import GistGroup from "@models/GistGroup";
import mongoose from "mongoose";
import UserModel from "@models/User";
import { Octokit } from "@octokit/core";
import { cache } from "react";

// Ensure User model is registered
mongoose.models.User || mongoose.model("User", UserModel.schema);

// Raw type for GistGroup from database
interface RawGistGroup {
  _id: string;
  userId: { _id: string; login?: string; githubToken?: string } | null;
  name: string;
  gistIds: string[];
  ownerLogin?: string;
  __v?: number;
}

// In-memory cache
let cachedData: { groups: any[]; gists: any[] } | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
let lastCachedTime: number | null = null;

// Cached GitHub gist fetching with individual tokens
const fetchGists = cache(async (gistIds: string[], userMap: Map<string, string>) => {
  console.log("Fetching gists for IDs:", gistIds);
  const gistPromises = gistIds.map(async (gistId) => {
    const group = (await GistGroup.findOne({ gistIds: gistId }).populate("userId", "login githubToken").lean()) as RawGistGroup;
    const ownerLogin = group?.userId?.login;
    const githubToken = ownerLogin ? userMap.get(ownerLogin) : null;

    if (!githubToken) {
      console.error(`No githubToken found for gist ${gistId} with owner ${ownerLogin}`);
      return null;
    }

    try {
      const octokit = new Octokit({ auth: githubToken });
      const response = await octokit.request("GET /gists/{gist_id}", {
        gist_id: gistId,
        headers: { "X-GitHub-Api-Version": "2022-11-28" },
      });
      console.log(`Successfully fetched gist ${gistId}:`, response.data.owner?.login || "No owner");
      return response.data;
    } catch (err) {
      console.error(`Failed to fetch gist ${gistId}:`, (err as any).message, "Status:", (err as any).status);
      return null;
    }
  });
  const results = await Promise.all(gistPromises);
  const filteredResults = results.filter(gist => gist !== null && gist.public); // Only public gists
  console.log("Total public gists fetched:", filteredResults.length, "out of", gistIds.length);
  return filteredResults;
});

export async function GET() {
  try {
    // Check if cache is valid
    const currentTime = Date.now();
    if (cachedData && lastCachedTime && (currentTime - lastCachedTime) < CACHE_DURATION) {
      console.log("Returning cached data");
      return NextResponse.json(cachedData, { status: 200 });
    }

    // Step 1: Connect to the database
    await connectDB();
    console.log("Database connected");

    // Step 2: Fetch all gist groups and populate userId with login and githubToken
    const groups = await GistGroup.find()
      .populate("userId", "login githubToken")
      .lean()
      .exec() as RawGistGroup[];
    console.log("Fetched groups:", groups.length);

    if (!groups.length) {
      cachedData = { groups: [], gists: [] };
      lastCachedTime = currentTime;
      return NextResponse.json(cachedData, { status: 200 });
    }

    // Step 3: Create a map of login to githubToken
    const userMap = new Map<string, string>();
    groups.forEach(group => {
      if (group.userId?.login && group.userId?.githubToken) {
        userMap.set(group.userId.login, group.userId.githubToken);
      }
    });
    console.log("User map (login -> githubToken):", Array.from(userMap.entries()));

    // Step 4: Extract unique gist IDs
    const allGistIds = Array.from(new Set(groups.flatMap((group) => group.gistIds || [])));
    console.log("Unique gist IDs:", allGistIds);

    if (!allGistIds.length) {
      const formattedGroups = groups.map((group) => ({
        id: group._id.toString(),
        name: group.name,
        gistIds: group.gistIds || [],
        owner: { login: group.userId?.login || "Unknown" },
      }));
      cachedData = { groups: formattedGroups, gists: [] };
      lastCachedTime = currentTime;
      return NextResponse.json(cachedData, { status: 200 });
    }

    // Step 5: Fetch public gists using individual user tokens
    const gists = await fetchGists(allGistIds, userMap);

    // Step 6: Format groups for response
    const formattedGroups = groups.map((group) => {
      const ownerLogin = group.userId?.login || "Unknown";
      const githubToken = userMap.get(ownerLogin);
      return {
        id: group._id.toString(),
        name: group.name,
        gistIds: (group.gistIds || []).map(gistId => ({
          id: gistId,
          githubToken: githubToken || null,
        })),
        owner: { login: ownerLogin },
      };
    });

    // Step 7: Cache and return response
    cachedData = { groups: formattedGroups, gists };
    lastCachedTime = currentTime;
    console.log("Response prepared - Groups:", formattedGroups.length, "Gists:", gists.length);
    return NextResponse.json(cachedData, { status: 200 });
  } catch (error) {
    console.error("Error in /api/public-gist-groups:", (error as Error).message);
    return NextResponse.json({ error: "Failed to fetch public data" }, { status: 500 });
  }
}