// app/api/gist-groups/delete/[groupGistId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@lib/database";
import GistGroup from "src/models/GistGroup";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@lib/authOptions";
import { isValidObjectId } from "mongoose";

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

    const gistGroup = await GistGroup.findOneAndDelete({
      _id: groupGistId,
      userId: session.user.id,
    });

    if (!gistGroup) {
      return NextResponse.json(
        { error: "Gist group not found or you don't have permission" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Group deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting gist group:", error);
    return NextResponse.json(
      { error: "Failed to delete gist group: " + (error instanceof Error ? error.message : "Unknown error") },
      { status: 500 }
    );
  }
}