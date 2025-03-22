// app/api/gist-groups/add/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@lib/database";
import GistGroup from "src/models/GistGroup";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@lib/authOptions"; // Adjust path to your NextAuth config

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name } = await req.json();
    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { error: "Group name is required and must be a non-empty string" },
        { status: 400 }
      );
    }

    const gistGroup = new GistGroup({
      userId: session.user.id,
      name: name.trim(),
      gistIds: [],
    });

    await gistGroup.save();

    return NextResponse.json({ group: gistGroup }, { status: 201 });
  } catch (error) {
    console.error("Error adding gist group:", error);
    return NextResponse.json({ error: "Failed to create gist group" }, { status: 500 });
  }
}