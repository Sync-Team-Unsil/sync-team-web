// src/lib/dummy-db.ts

// Menggunakan globalThis agar memori tidak terhapus saat Next.js me-refresh halaman
const globalForDb = globalThis as unknown as {
  usersDummy: any[] | undefined;
};

// Inisialisasi array kosong jika belum ada data
export const usersDb = globalForDb.usersDummy ?? [];

if (process.env.NODE_ENV !== 'production') {
  globalForDb.usersDummy = usersDb;
}