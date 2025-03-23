// src/app/api/profile/updatelocation/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@lib/authOptions"; // Adjust path as needed
import { connectDB } from "@lib/database";
import UserModel from "@models/User";

let isConnected = false;
async function ensureDBConnection() {
  if (!isConnected) {
    await connectDB();
    isConnected = true; // Reuse connection
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Get the session to identify the authenticated user
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Ensure DB connection
    await ensureDBConnection();

    // Parse JSON body from the request
    const body = await request.json();
    const { location } = body;

    if (!location || typeof location.lat !== "number" || typeof location.lng !== "number") {
      return NextResponse.json({ message: "Invalid location data" }, { status: 400 });
    }

    // Update the user's location in MongoDB
    const updatedUser = await UserModel.findByIdAndUpdate(
      session.user.id,
      { $set: { location: { lat: location.lat, lng: location.lng } } },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    console.log("Updated user location:", updatedUser.location); // Debug log

    return NextResponse.json({
      message: "Location updated successfully",
      location: updatedUser.location,
    });
  } catch (error) {
    console.error("Error updating location:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}