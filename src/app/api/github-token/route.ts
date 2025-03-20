// File: /app/api/github-token/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const githubToken = session.user.githubToken; // Adjust based on your session structure
  if (!githubToken) {
    return NextResponse.json({ error: "GitHub token not found in session" }, { status: 500 });
  }

  return NextResponse.json({ githubToken }, { status: 200 });
}