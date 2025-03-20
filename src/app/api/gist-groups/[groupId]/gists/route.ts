// File: /app/api/gist-groups/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@app/api/auth/[...nextauth]/route";
import { connectDB } from "@lib/database";
import GistGroup from "@models/GistGroup";

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

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const groups = await GistGroup.find({ userId: session.user.id }).lean();
  return NextResponse.json({ groups }, { status: 200 });
}