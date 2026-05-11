// src/app/api/profile/route.ts
import { NextResponse } from 'next/server';
import { usersDb } from '@/lib/dummy-db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');

  if (!email) {
    return NextResponse.json({ message: "Email required" }, { status: 400 });
  }

  const user = usersDb.find(u => u.email === email);
  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  return NextResponse.json(user, { status: 200 });
}

export async function PATCH(request: Request) {
  const body = await request.json();
  const { email, bio, role, firstName, lastName } = body;

  if (!email) {
    return NextResponse.json({ message: "Email required" }, { status: 400 });
  }

  const userIndex = usersDb.findIndex(u => u.email === email);
  if (userIndex === -1) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  // Update user data
  if (bio !== undefined) usersDb[userIndex].bio = bio;
  if (role !== undefined) usersDb[userIndex].role = role;
  if (firstName !== undefined) usersDb[userIndex].firstName = firstName;
  if (lastName !== undefined) usersDb[userIndex].lastName = lastName;

  return NextResponse.json({ message: "Profile updated", user: usersDb[userIndex] }, { status: 200 });
}
