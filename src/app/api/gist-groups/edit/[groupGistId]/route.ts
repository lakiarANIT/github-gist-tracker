import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@lib/database";
import GistGroup from "src/models/GistGroup";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@lib/authOptions";

export async function PATCH(req: NextRequest) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const groupGistId = url.pathname.split("/").pop();
    const { name } = await req.json();

    if (!groupGistId) {
      return NextResponse.json({ error: "Group ID is required" }, { status: 400 });
    }

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { error: "Group name is required and must be a non-empty string" },
        { status: 400 }
      );
    }

    const gistGroup = await GistGroup.findOneAndUpdate(
      { _id: groupGistId, userId: session.user.id },
      { name: name.trim() },
      { new: true }
    );

    if (!gistGroup) {
      return NextResponse.json(
        { error: "Gist group not found or you don't have permission" },
        { status: 404 }
      );
    }

    return NextResponse.json({ group: gistGroup }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update gist group" }, { status: 500 });
  }
}