import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@lib/database";
import GistGroup from "src/models/GistGroup";
import UserModel from "@models/User"; // Import UserModel to get githubToken
import { getServerSession } from "next-auth/next";
import { authOptions } from "@lib/authOptions";
import { isValidObjectId } from "mongoose";
import { Octokit } from "@octokit/core";

export async function DELETE(req: NextRequest) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Extract groupGistId from the URL
    const url = new URL(req.url);
    const groupGistId = url.pathname.split("/").pop();

    if (!groupGistId) {
      return NextResponse.json({ error: "Group ID is required" }, { status: 400 });
    }

    // Validate that groupGistId is a valid ObjectId
    if (!isValidObjectId(groupGistId)) {
      return NextResponse.json(
        { error: "Invalid group ID. Must be a valid MongoDB ObjectId." },
        { status: 400 }
      );
    }

    // Fetch the GistGroup to get its gistIds
    const gistGroup = await GistGroup.findOne({
      _id: groupGistId,
      userId: session.user.id,
    });

    if (!gistGroup) {
      return NextResponse.json(
        { error: "Gist group not found or you don't have permission" },
        { status: 404 }
      );
    }

    // Fetch the user's GitHub token
    const user = await UserModel.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // If the user has a GitHub token, delete the gists
    if (user.githubToken) {
      const octokit = new Octokit({ auth: user.githubToken });

      // Collect all gistIds from the GistGroup
      const gistIds = new Set<string>();
      gistGroup.gistIds?.forEach((gistId: string) => { // Explicitly type gistId as string
        if (typeof gistId === "string") gistIds.add(gistId);
      });

      // Delete each gist from GitHub
      const deletePromises = Array.from(gistIds).map((gistId: string) => // Explicitly type gistId as string
        octokit.request("DELETE /gists/{gist_id}", {
          gist_id: gistId,
          headers: {
            "X-GitHub-Api-Version": "2022-11-28",
          },
        }).catch((error) => {
          console.error(`Failed to delete gist ${gistId}:`, error);
          // Continue even if one deletion fails
          return { status: error.status || 500 };
        })
      );

      const results = await Promise.all(deletePromises);
      const failedDeletions = results.filter((result) => result.status !== 204);
      if (failedDeletions.length > 0) {
        console.warn(`Some gists failed to delete: ${failedDeletions.length} failures`);
      }
    }

    // Delete the GistGroup from the database
    await GistGroup.findOneAndDelete({
      _id: groupGistId,
      userId: session.user.id,
    });

    return NextResponse.json(
      { message: "Group and associated gists deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting gist group and gists:", error);
    return NextResponse.json(
      {
        error: "Failed to delete gist group: " + (error instanceof Error ? error.message : "Unknown error"),
      },
      { status: 500 }
    );
  }
}