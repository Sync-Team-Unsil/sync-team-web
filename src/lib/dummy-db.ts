// src/lib/dummy-db.ts

// Menggunakan globalThis agar memori tidak terhapus saat Next.js me-refresh halaman
const globalForDb = globalThis as unknown as {
  usersDummy: any[] | undefined;
  teamsDummy: any[] | undefined;
  notificationsDummy: any[] | undefined;
};

// Inisialisasi array kosong jika belum ada data
export const usersDb = globalForDb.usersDummy ?? [];
export const notificationsDb = globalForDb.notificationsDummy ?? [];
export const teamsDb = globalForDb.teamsDummy ?? [
  {
    id: 101, 
    title: "Tim NexaCode", 
    membersCount: "4/5",
    description: "Halo! Kami tim NexaCode dari Universitas Siliwangi, saat ini sedang membangun aplikasi mobile untuk manajemen sampah berbasis AI untuk GEMASTIK XVII",
    memberAvatars: ["https://github.com/shadcn.png", "https://github.com/nutlope.png", "https://github.com/leerob.png", "https://github.com/maccman.png"],
    status: "ongoing", 
    bgColor: "bg-orange-50/70", 
    tagColor: "text-orange-500",
    tags: ["#gemastik", "#mobile-developer"],
    applicants: [
      { id: "a1", name: "Rigby", time: "2 Minutes Ago", avatar: "https://github.com/shadcn.png" },
      { id: "a2", name: "Benson", time: "1 Hour Ago", avatar: "https://github.com/nutlope.png" }
    ],
    ownerName: "Milo",
    joinedMembers: [
      { id: "j1", name: "Milo", time: "2 Days Ago", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Milo" }
    ],
    postedAt: "2 Hours Ago",
    requirements: "Mahasiswa aktif S1/D4 perguruan tinggi di Indonesia (syarat GEMASTIK)\nMenguasai Flutter & Dart untuk pengembangan aplikasi mobile cross-platform\nMemahami konsep REST API dan integrasi dengan backend\nFamiliar dengan Git & GitHub untuk kolaborasi tim\nBerpengalaman publish atau membangun aplikasi mobile (portofolio jadi nilai plus)\nMampu berkomitmen minimal 10 jam/minggu hingga hari H lomba\nBersedia hadir ke Malang untuk babak final (jika lolos)",
    competitionTime: "4 Maret 2026 - 10 Maret 2026"
  },
  {
    id: 102, 
    title: "Razor Team", 
    membersCount: "2/5",
    description: "Platform analitik real-time untuk monitoring layanan publik daerah. Membutuhkan backend engineer yang mahir Golang.",
    memberAvatars: ["https://github.com/leerob.png", "https://github.com/nutlope.png"],
    status: "ongoing", 
    bgColor: "bg-green-50/70", 
    tagColor: "text-green-500",
    tags: ["#golang", "#backend"],
    ownerName: "Nexa",
    applicants: [], 
    joinedMembers: [
      { id: "j2", name: "Nexa", time: "1 Day Ago", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Nexa" }
    ],
    postedAt: "1 Day Ago",
    requirements: "Backend engineer yang mahir Golang.\nMemahami PostgreSQL dan Redis.\nPengalaman dengan microservices adalah nilai plus.",
    competitionTime: "15 April 2026 - 20 April 2026"
  }
];

if (process.env.NODE_ENV !== 'production') {
  globalForDb.usersDummy = usersDb;
  globalForDb.teamsDummy = teamsDb;
  globalForDb.notificationsDummy = notificationsDb;
}