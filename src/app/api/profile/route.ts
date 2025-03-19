// /app/api/profile/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@lib/database";
import UserModel from "@models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const users = await UserModel.find({}).limit(10);
    return NextResponse.json({ users, count: users.length }, { status: 200 });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { location } = await req.json();
    if (!location || typeof location.lat !== "number" || typeof location.lng !== "number") {
      return NextResponse.json({ error: "Invalid location data" }, { status: 400 });
    }

    const user = await UserModel.findByIdAndUpdate(
      session.user.id,
      { location },
      { new: true }
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Location updated", user }, { status: 200 });
  } catch (error) {
    console.error("Error updating location:", error);
    return NextResponse.json({ error: "Failed to update location" }, { status: 500 });
  }
}

// Keep your existing POST for seeding if you still need it
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const userCount = await UserModel.countDocuments({});
    if (userCount > 0) {
      return NextResponse.json({ message: "Users already exist. Skipping seed." }, { status: 200 });
    }

    const testUsers = Array.from({ length: 10 }, (_, i) => ({
      email: `testuser${i + 1}@example.com`,
      password: `password${i + 1}`,
      name: `Test User ${i + 1}`,
      bio: `Bio for user ${i + 1}`,
      createdAt: new Date(),
    }));

    await UserModel.insertMany(testUsers);
    return NextResponse.json({ message: "10 test users created", users: testUsers }, { status: 201 });
  } catch (error) {
    console.error("Error seeding users:", error);
    return NextResponse.json({ error: "Failed to seed users" }, { status: 500 });
  }
}