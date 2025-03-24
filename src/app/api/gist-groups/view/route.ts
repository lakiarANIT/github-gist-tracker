import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@lib/database";
import GistGroup from "src/models/GistGroup";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@lib/authOptions";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const groups = await GistGroup.find({ userId: session.user.id }).lean();
    return NextResponse.json({ groups }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch gist groups" }, { status: 500 });
  }
}