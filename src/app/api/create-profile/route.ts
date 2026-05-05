// src/app/api/create-profile/route.ts
import { NextResponse } from 'next/server';
import { usersDb } from '@/lib/dummy-db';

export async function POST(request: Request) {
  const body = await request.json();
  
  const userIndex = usersDb.findIndex(u => u.email === body.email);
  
  if (userIndex === -1) {
    return NextResponse.json({ message: "User tidak ditemukan" }, { status: 404 });
  }

  // Simpan data profil tambahan
  usersDb[userIndex].bio = body.bio;
  usersDb[userIndex].role = body.role;
  
  console.log("Database setelah buat profil:", usersDb);
  return NextResponse.json({ message: "Profil berhasil dibuat!" }, { status: 200 });
}