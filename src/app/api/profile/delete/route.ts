import { NextResponse } from "next/server"; // Use NextResponse instead of NextApiResponse
import { getServerSession } from "next-auth/next";
import { authOptions } from "@lib/authOptions";
import { connectDB } from "@lib/database";
import UserModel from "@models/User";
import GistGroupModel from "@models/GistGroup";
import { Octokit } from "@octokit/core";

// Named export for DELETE method
export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions); // No req, res needed here
  if (!session || !session.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();

    // Fetch the user to get their GitHub token
    const user = await UserModel.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Get all GistGroups associated with the user
    const gistGroups = await GistGroupModel.find({ userId: session.user.id });

    // If the user has a GitHub token, delete their Gists
    if (user.githubToken) {
      const octokit = new Octokit({ auth: user.githubToken });

      // Collect all unique gistIds from the GistGroups
      const gistIds = new Set<string>();
      gistGroups.forEach((group) => {
        group.gistIds?.forEach((gistId: string) => {
          if (typeof gistId === "string") gistIds.add(gistId);
        });
      });

      // Delete each gist from GitHub
      const deletePromises = Array.from(gistIds).map((gistId: string) =>
        octokit
          .request("DELETE /gists/{gist_id}", {
            gist_id: gistId,
            headers: {
              "X-GitHub-Api-Version": "2022-11-28",
            },
          })
          .catch((error) => {
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

    // Delete all GistGroups associated with the user
    await GistGroupModel.deleteMany({ userId: session.user.id });

    // Delete the user account
    const deletedUser = await UserModel.findByIdAndDelete(session.user.id);
    if (!deletedUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Account, associated gist groups, and gists deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting account and gists:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}