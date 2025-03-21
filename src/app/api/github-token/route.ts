// File: /app/api/github-token/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET(req: Request) {
  console.log("[API/github-token] Starting GET request");
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    console.log("No session found in /api/github-token");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const githubToken = session.user.githubToken;
  if (!githubToken) {
    console.log("No GitHub token in session:", session.user);
    return NextResponse.json({ error: "GitHub token not found" }, { status: 400 });
  }

  console.log("Returning GitHub token for user:", session.user.id);
  return NextResponse.json({ githubToken }, { status: 200 });
}