import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@lib/database';
import User from '@models/User';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const users = await User.find({}).limit(10); // Fetch up to 10 users
    return NextResponse.json({ users, count: users.length }, { status: 200 });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    // Check if users already exist
    const userCount = await User.countDocuments({});
    if (userCount > 0) {
      return NextResponse.json({ message: 'Users already exist. Skipping seed.' }, { status: 200 });
    }

    // Seed 10 test users
    const testUsers = Array.from({ length: 10 }, (_, i) => ({
      email: `testuser${i + 1}@example.com`,
      password: `password${i + 1}`, // In production, hash this!
      name: `Test User ${i + 1}`,
      bio: `Bio for user ${i + 1}`,
      createdAt: new Date(),
    }));

    await User.insertMany(testUsers);
    return NextResponse.json({ message: '10 test users created', users: testUsers }, { status: 201 });
  } catch (error) {
    console.error('Error seeding users:', error);
    return NextResponse.json({ error: 'Failed to seed users' }, { status: 500 });
  }
}