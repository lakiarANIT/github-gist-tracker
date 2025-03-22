// File: /src/app/api/group_gist/edit/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@lib/authOptions"; // Adjust path to your authOptions file
import { connectDB } from "@lib/database";
import GistGroupModel from "@models/GistGroup";
import { Octokit } from "@octokit/core";
import mongoose from "mongoose";

// POST - Create a new GistGroup
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { name, gistIds } = await req.json();

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const gistGroup = new GistGroupModel({
      userId: new mongoose.Types.ObjectId(session.user.id),
      name,
      gistIds: gistIds || [],
    });

    await gistGroup.save();
    return NextResponse.json(gistGroup, { status: 201 });
  } catch (error) {
    console.error("POST error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// PUT - Edit an existing GistGroup
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { id, name, gistIds } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Group ID is required" }, { status: 400 });
    }

    const gistGroup = await GistGroupModel.findOne({
      _id: id,
      userId: session.user.id,
    });

    if (!gistGroup) {
      return NextResponse.json({ error: "GistGroup not found" }, { status: 404 });
    }

    if (name) gistGroup.name = name;
    if (gistIds) gistGroup.gistIds = gistIds;

    await gistGroup.save();
    return NextResponse.json(gistGroup);
  } catch (error) {
    console.error("PUT error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// DELETE - Delete a GistGroup and optionally its associated Gists
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !session.user.githubToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { id, deleteGists = false } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Group ID is required" }, { status: 400 });
    }

    const gistGroup = await GistGroupModel.findOne({
      _id: id,
      userId: session.user.id,
    });

    if (!gistGroup) {
      return NextResponse.json({ error: "GistGroup not found" }, { status: 404 });
    }

    // Optionally delete associated Gists from GitHub
    if (deleteGists && gistGroup.gistIds.length > 0) {
      const octokit = new Octokit({
        auth: session.user.githubToken,
      });

      for (const gistId of gistGroup.gistIds) {
        try {
          await octokit.request("DELETE /gists/{gist_id}", {
            gist_id: gistId,
            headers: {
              "X-GitHub-Api-Version": "2022-11-28",
            },
          });
        } catch (error) {
          console.error(`Failed to delete gist ${gistId}:`, error);
          // Continue with deletion even if some gists fail
        }
      }
    }

    // Delete the GistGroup from database
    await GistGroupModel.deleteOne({ _id: id });
    return NextResponse.json({ message: "GistGroup deleted" });
  } catch (error) {
    console.error("DELETE error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}