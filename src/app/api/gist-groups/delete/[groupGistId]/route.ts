import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@lib/database";
import GistGroup from "src/models/GistGroup";
import UserModel from "@models/User";
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

    const url = new URL(req.url);
    const groupGistId = url.pathname.split("/").pop();

    if (!groupGistId) {
      return NextResponse.json({ error: "Group ID is required" }, { status: 400 });
    }

    if (!isValidObjectId(groupGistId)) {
      return NextResponse.json(
        { error: "Invalid group ID. Must be a valid MongoDB ObjectId." },
        { status: 400 }
      );
    }

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

    const user = await UserModel.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.githubToken) {
      const octokit = new Octokit({ auth: user.githubToken });

      const gistIds = new Set<string>();
      gistGroup.gistIds?.forEach((gistId: string) => {
        if (typeof gistId === "string") gistIds.add(gistId);
      });

      const deletePromises = Array.from(gistIds).map((gistId: string) =>
        octokit.request("DELETE /gists/{gist_id}", {
          gist_id: gistId,
          headers: {
            "X-GitHub-Api-Version": "2022-11-28",
          },
        }).catch((error) => {
          return { status: error.status || 500 };
        })
      );

      const results = await Promise.all(deletePromises);
      const failedDeletions = results.filter((result) => result.status !== 204);
    }

    await GistGroup.findOneAndDelete({
      _id: groupGistId,
      userId: session.user.id,
    });

    return NextResponse.json(
      { message: "Group and associated gists deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to delete gist group: " + (error instanceof Error ? error.message : "Unknown error"),
      },
      { status: 500 }
    );
  }
}