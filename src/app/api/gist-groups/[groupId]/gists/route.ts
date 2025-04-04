import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@lib/authOptions";
import { connectDB } from "@lib/database";
import GistGroup from "@models/GistGroup";
import mongoose from "mongoose";

interface LocalGistGroupDocument extends mongoose.Document {
  userId: string | mongoose.Types.ObjectId;
  name: string;
  gistIds: string[];
}

export async function POST(req: Request, context: { params: Promise<{ groupId: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { groupId } = await context.params;
  const { gistId } = await req.json();

  if (!gistId) {
    return NextResponse.json({ error: "Gist ID is required" }, { status: 400 });
  }

  await connectDB();

  try {
    const group = await GistGroup.findOne({ _id: groupId, userId: session.user.id }) as LocalGistGroupDocument | null;
    if (!group) {
      return NextResponse.json({ error: "Group not found or not owned by user" }, { status: 404 });
    }

    if (!group.gistIds.includes(gistId)) {
      group.gistIds.push(gistId);
      await group.save();
    }

    return NextResponse.json({ message: "Gist added to group", group }, { status: 200 });
  } catch (error) {
    console.error("Error adding gist to group:", error);
    return NextResponse.json({ error: "Failed to add gist to group" }, { status: 500 });
  }
}

export async function GET(req: Request, context: { params: Promise<{ groupId: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { groupId } = await context.params;

  await connectDB();

  try {
    const group = await GistGroup.findOne({ _id: groupId, userId: session.user.id }).lean() as { gistIds: string[] } | null;
    if (!group) {
      return NextResponse.json({ error: "Group not found or not owned by user" }, { status: 404 });
    }

    return NextResponse.json({ gists: group.gistIds || [] }, { status: 200 });
  } catch (error) {
    console.error("Error fetching group gists:", error);
    return NextResponse.json({ error: "Failed to fetch group gists" }, { status: 500 });
  }
}