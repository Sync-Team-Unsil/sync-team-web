// src/app/api/login/route.ts
import { NextResponse } from 'next/server';
import { usersDb } from '@/lib/dummy-db';

export async function POST(request: Request) {
  const body = await request.json();
  
  // Memungkinkan login menggunakan email meskipun inputnya bernama 'username'
  const user = usersDb.find(u => u.email === body.username || u.username === body.username);
  
  if (!user) {
    return NextResponse.json({ message: "Akun tidak ditemukan" }, { status: 404 });
  }

  if (user.password !== body.password) {
    return NextResponse.json({ message: "Password salah" }, { status: 401 });
  }

  if (!user.isVerified) {
    return NextResponse.json({ message: "Silakan verifikasi email Anda terlebih dahulu" }, { status: 403 });
  }

  return NextResponse.json({ message: "Login Berhasil!", user: user }, { status: 200 });
}