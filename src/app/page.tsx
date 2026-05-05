"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  LayoutDashboard, 
  Settings, 
  HelpCircle, 
  LogOut, 
  Bell, 
  MessageCircleDashed 
} from "lucide-react"
import Link from "next/link"

// Data Dummy untuk List Available Teams
const availableTeams = [
  {
    id: 1,
    title: "NexaCode",
    members: "4/5",
    description: "Halo! Kami tim NexaCode dari Universitas Siliwangi, saat ini sedang membangun aplikasi mobile untuk manajemen sampah berbasis AI...",
    tags: "# gemastik # mobile-developer 3+",
    postedAt: "Diposting 16 Hari yang lalu"
  },
  {
    id: 2,
    title: "RazorTeam",
    members: "3/5",
    description: "Kami berlima dari ITB lagi nyari satu orang lagi buat lengkapin tim di GovTech Hackfest 2024. Ide kami adalah platform analitik real-time...",
    tags: "# golang # backend 1+",
    postedAt: "Diposting 16 Hari yang lalu"
  },
  {
    id: 3,
    title: "BotTeam",
    members: "3/5",
    description: "Tim Robot ITS divisi KRSBI Beroda (Kontes Robot Sepak Bola Indonesia) membuka 1 posisi untuk Software Engineer yang akan fokus...",
    tags: "# arduino # robot 1+",
    postedAt: "Diposting 16 Hari yang lalu"
  }
]

export default function DashboardPage() {
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [userData, setUserData] = useState<any>(null)

  // Efek untuk memproteksi rute
  useEffect(() => {
    const session = localStorage.getItem("userSession")
    
    if (!session) {
      router.replace("/login")
    } else {
      setUserData(JSON.parse(session))
      setIsAuthorized(true)
    }
  }, [router])

  // Fungsi Logout
  const handleLogout = () => {
    localStorage.removeItem("userSession")
    router.replace("/login")
  }

  // Tampilan Loading jika belum terotorisasi
  if (!isAuthorized) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#fafafa]">
        <p className="text-zinc-500 font-medium animate-pulse">Memeriksa akses...</p>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-[#fafafa] font-sans">
      
      {/* ================= SIDEBAR ================= */}
      <aside className="w-64 bg-white border-r border-zinc-200 flex flex-col flex-shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-transparent">
          <span className="text-[#a87ffb] font-bold text-xl">SyncTeam</span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          <Link href="/" className="flex items-center gap-3 px-4 py-3 bg-purple-50 text-[#a87ffb] rounded-lg font-medium transition-colors">
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </Link>
        </nav>

        <div className="px-4 py-6 space-y-1 border-t border-zinc-100">
          <Link href="/settings" className="flex items-center gap-3 px-4 py-3 text-zinc-600 hover:bg-zinc-50 rounded-lg transition-colors text-sm font-medium">
            <Settings className="w-5 h-5" />
            Settings
          </Link>
          <Link href="/help" className="flex items-center gap-3 px-4 py-3 text-zinc-600 hover:bg-zinc-50 rounded-lg transition-colors text-sm font-medium">
            <HelpCircle className="w-5 h-5" />
            Help Center
          </Link>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium mt-4"
          >
            <LogOut className="w-5 h-5" />
            Log out
          </button>
        </div>
      </aside>

      {/* ================= MAIN CONTENT AREA ================= */}
      <main className="flex-1 flex flex-col overflow-hidden">
        
        {/* Top Navbar */}
        <header className="h-16 bg-white flex items-center justify-between px-8 border-b border-zinc-100 flex-shrink-0">
          <h1 className="text-[#a87ffb] font-medium">Dashboard</h1>
          <div className="flex items-center gap-6">
            <button className="text-[#a87ffb] hover:text-purple-600 transition-colors">
              <Bell className="w-5 h-5 fill-current" />
            </button>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-zinc-700">{userData?.username || "User"}</span>
              <Avatar className="w-9 h-9 border border-zinc-200 cursor-pointer">
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-5xl mx-auto space-y-10">
            
            {/* Section: Teams (Empty State) */}
            <section className="space-y-4">
              <h2 className="text-lg font-semibold text-zinc-800">Teams</h2>
              <Card className="border-zinc-200 bg-purple-50/30 shadow-sm">
                <CardContent className="flex flex-col items-center justify-center py-16 space-y-6">
                  <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center text-[#a87ffb]">
                    <MessageCircleDashed className="w-10 h-10" />
                  </div>
                  <p className="text-zinc-500 text-sm">
                    You aren&apos;t currently a member of any team
                  </p>
                  <Button className="bg-[#a87ffb] hover:bg-[#9261fa] text-white px-12 py-5 rounded-lg font-medium shadow-lg shadow-purple-200">
                    Create or Join Team
                  </Button>
                </CardContent>
              </Card>
            </section>

            {/* Section: List Available Teams */}
            <section className="space-y-4 pb-10">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-zinc-800">List Available Teams</h2>
                <Link href="#" className="text-blue-500 text-sm font-medium hover:underline">
                  see all
                </Link>
              </div>

              <div className="space-y-4">
                {availableTeams.map((team) => (
                  <Card key={team.id} className="border-zinc-200 shadow-sm hover:shadow-md transition-all cursor-pointer group">
                    <CardContent className="p-6 flex flex-col space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-zinc-800 text-lg group-hover:text-[#a87ffb] transition-colors">{team.title}</h3>
                        <span className="text-[#a87ffb] font-medium text-sm">{team.members}</span>
                      </div>
                      <p className="text-zinc-500 text-sm leading-relaxed line-clamp-2">
                        {team.description}
                      </p>
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-[#a87ffb] text-xs font-medium">
                          {team.tags}
                        </span>
                        <span className="text-zinc-400 text-xs">
                          {team.postedAt}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

          </div>
        </div>
      </main>
    </div>
  )
}