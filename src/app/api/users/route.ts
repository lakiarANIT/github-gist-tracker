import { NextResponse } from "next/server";
import { connectDB } from "@lib/database";
import UserModel from "@models/User";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const login = searchParams.get("login");

  if (!login) {
    return NextResponse.json({ message: "Login parameter is required" }, { status: 400 });
  }

  try {
    await connectDB();
    const user = await UserModel.findOne({ login });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      login: user.login,
      location: user.location || null,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}