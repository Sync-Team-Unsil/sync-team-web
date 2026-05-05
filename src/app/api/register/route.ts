import { NextResponse } from 'next/server';
import { usersDb } from '@/lib/dummy-db';

export async function POST(request: Request) {
  const body = await request.json();
  
  // Cek apakah email sudah terdaftar
  const existingUser = usersDb.find(u => u.email === body.email);
  if (existingUser) {
    return NextResponse.json({ message: "Email sudah digunakan!" }, { status: 400 });
  }

  // Buat user baru dengan status belum terverifikasi
  const newUser = {
    ...body,
    isVerified: false,
    otp: "123456" // Dummy OTP, selalu 123456 agar mudah dites
  };
  
  usersDb.push(newUser);
  console.log("Database sekarang:", usersDb); // Cek di terminal VS Code Anda
  
  return NextResponse.json({ message: "Register sukses, silakan cek email" }, { status: 200 });
}