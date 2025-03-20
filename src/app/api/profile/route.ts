// /app/api/profile/route.ts
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { connectDB } from "@lib/database";
import UserModel from "@models/User";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { promises as fs } from "fs";
import path from "path";

// Ensure MongoDB connection is established once and reused
let isConnected = false;
async function ensureDBConnection() {
  if (!isConnected) {
    await connectDB();
    isConnected = true; // Set flag to reuse connection
  }
}

export const PUT = async (request: Request) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Ensure DB connection (reuses existing connection if already established)
    await ensureDBConnection();

    // Define upload directory
    const uploadDir = path.join(process.cwd(), "public/uploads");
    await fs.mkdir(uploadDir, { recursive: true }); // Ensure directory exists

    // Parse FormData from the request
    const formData = await request.formData();
    const fields: { [key: string]: string } = {};
    const files: { [key: string]: { filepath: string; newFilename: string; originalFilename: string } } = {};

    // Process form data entries
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        // Handle file upload
        const file = value as File;
        const buffer = Buffer.from(await file.arrayBuffer());
        const uniqueFilename = `${Date.now()}-${file.name}`;
        const filePath = path.join(uploadDir, uniqueFilename);
        await fs.writeFile(filePath, buffer);
        files[key] = {
          filepath: filePath,
          newFilename: uniqueFilename,
          originalFilename: file.name,
        };
      } else {
        // Handle text fields (including avatar URL)
        fields[key] = value as string;
      }
    }

    const { name, email, bio, password, avatar: avatarUrl } = fields; // Extract avatar from fields
    const avatarFile = files.avatar; // Extract avatar from files

    const updateData: any = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (bio) updateData.bio = bio;
    if (password) updateData.password = await bcrypt.hash(password, 10);
    if (avatarFile) {
      const newPath = `/uploads/${avatarFile.newFilename}`;
      updateData.avatar = newPath;
      console.log("Avatar file saved at:", newPath); // Debug log
    } else if (avatarUrl) {
      updateData.avatar = avatarUrl; // Use the URL directly if no file
      console.log("Avatar URL set to:", avatarUrl); // Debug log
    }

    console.log("Updating user with data:", updateData); // Debug log

    const user = await UserModel.findByIdAndUpdate(
      session.user.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    console.log("Updated user:", user); // Debug log

    return NextResponse.json({
      message: "Profile updated successfully",
      user: {
        name: user.name,
        email: user.email,
        bio: user.bio,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
};