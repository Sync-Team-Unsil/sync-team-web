import { NextResponse } from 'next/server';
import { usersDb } from '@/lib/dummy-db';

export async function POST(request: Request) {
  const body = await request.json();
  
  // Cari user berdasarkan email
  const userIndex = usersDb.findIndex(u => u.email === body.email);
  
  if (userIndex === -1) {
    return NextResponse.json({ message: "User tidak ditemukan" }, { status: 404 });
  }

  // Cek apakah OTP cocok
  if (usersDb[userIndex].otp === body.otp) {
    usersDb[userIndex].isVerified = true; // Ubah status jadi true
    return NextResponse.json({ message: "Verifikasi sukses!" }, { status: 200 });
  } else {
    return NextResponse.json({ message: "OTP Salah!" }, { status: 400 });
  }
}