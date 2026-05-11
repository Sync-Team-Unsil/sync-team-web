"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Sheet, SheetContent, SheetHeader, SheetTrigger, SheetTitle, SheetDescription, SheetClose
} from "@/components/ui/sheet"
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover"
import {
  LayoutDashboard, LogOut, Bell, ChevronLeft, User, HelpCircle, Clock
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

// ---- TYPES ----
interface Applicant {
  id: string; name: string; time: string; avatar: string
}
interface Team {
  id: number;
  title: string;
  membersCount: string;
  description: string;
  memberAvatars: string[];
  status: string;
  bgColor: string;
  tagColor: string;
  tags: string[];
  applicants: Applicant[];
  joinedMembers: Applicant[];
  postedAt?: string;
  requirements?: string;
  competitionTime?: string;
  ownerName?: string;
}

export default function DashboardPage() {
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [userData, setUserData] = useState<any>(null)
  const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false)
  const [teamMembersCount, setTeamMembersCount] = useState(1)

  const [availableTeams, setAvailableTeams] = useState<Team[]>([])
  const [joinedTeams, setJoinedTeams] = useState<Team[]>([])
  const [requestedTeams, setRequestedTeams] = useState<Team[]>([])
  const [notifications, setNotifications] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const fetchTeams = async (username: string) => {
    try {
      // Fetch Joined/Applied teams
      const joinedRes = await fetch(`/api/teams?username=${username}`)
      if (joinedRes.ok) {
        const allUserTeams: Team[] = await joinedRes.json()
        // Split into Joined (already a member) and Requested (still an applicant)
        setJoinedTeams(allUserTeams.filter(t => t.joinedMembers.some(m => m.name === username)))
        setRequestedTeams(allUserTeams.filter(t => t.applicants.some(a => a.name === username)))
      }

      // Fetch Available teams
      const availRes = await fetch(`/api/teams?username=${username}&available=true`)
      if (availRes.ok) {
        setAvailableTeams(await availRes.json())
      }

      // Fetch Notifications
      const notifRes = await fetch(`/api/notifications?username=${username}`)
      if (notifRes.ok) {
        setNotifications(await notifRes.json())
      }
    } catch (err) {
      console.error("Failed to fetch teams or notifications:", err)
    }
  }

  useEffect(() => {
    const session = localStorage.getItem("userSession")
    if (!session) { router.replace("/login") }
    else {
      const user = JSON.parse(session)
      setUserData(user)
      setIsAuthorized(true)
      fetchTeams(user.username)
    }
  }, [router])

  const handleLogout = () => { localStorage.removeItem("userSession"); router.replace("/login") }

  const handleCreateTeam = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const name = fd.get("teamName") as string
    const desc = fd.get("description") as string
    if (!name || !desc) { alert("Mohon isi semua data!"); return }

    try {
      const res = await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: name,
          description: desc,
          maxMembers: teamMembersCount,
          ownerName: userData?.username || "You",
          tags: (fd.get("tags") as string)?.split(",").map(t => t.trim()) || []
        })
      })

      if (res.ok) {
        fetchTeams(userData.username)
        setIsCreateSheetOpen(false)
        setTeamMembersCount(1)
      } else {
        const error = await res.json()
        alert(error.message || "Gagal membuat tim")
      }
    } catch (err) {
      console.error("Error creating team:", err)
      alert("Terjadi kesalahan sistem")
    }
  }

  const handleJoinTeam = async (team: Team) => {
    try {
      const res = await fetch('/api/teams/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamId: team.id,
          user: userData
        })
      })

      const data = await res.json()
      if (res.ok) {
        alert(data.message)
        fetchTeams(userData.username)
      } else {
        alert(data.message || "Gagal melamar ke tim")
      }
    } catch (err) {
      console.error("Error joining team:", err)
      alert("Terjadi kesalahan sistem")
    }
  }

  const handleAccept = async (teamId: number, appId: string) => {
    try {
      const res = await fetch('/api/teams/applicant-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamId, applicantId: appId, action: 'accept' })
      })
      if (res.ok) {
        fetchTeams(userData.username)
      } else {
        const data = await res.json()
        alert(data.message || "Gagal memproses aksi")
      }
    } catch (err) {
      console.error("Error accepting applicant:", err)
    }
  }

  const handleReject = async (teamId: number, appId: string) => {
    try {
      const res = await fetch('/api/teams/applicant-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamId, applicantId: appId, action: 'reject' })
      })
      if (res.ok) {
        fetchTeams(userData.username)
      } else {
        const data = await res.json()
        alert(data.message || "Gagal memproses aksi")
      }
    } catch (err) {
      console.error("Error rejecting applicant:", err)
    }
  }

  const handleDeleteTeam = async (teamId: number) => {
    if (!confirm("Are you sure you want to delete this team?")) return
    try {
      const res = await fetch(`/api/teams?id=${teamId}`, { method: 'DELETE' })
      if (res.ok) {
        fetchTeams(userData.username)
      } else {
        const data = await res.json()
        alert(data.message || "Gagal menghapus tim")
      }
    } catch (err) {
      console.error("Error deleting team:", err)
    }
  }

  const handleLeaveTeam = async (teamId: number) => {
    if (!confirm("Are you sure you want to leave this team?")) return
    try {
      const res = await fetch('/api/teams/leave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamId, username: userData.username })
      })
      const data = await res.json()
      if (res.ok) {
        alert(data.message)
        fetchTeams(userData.username)
      } else {
        alert(data.message || "Gagal keluar dari tim")
      }
    } catch (err) {
      console.error("Error leaving team:", err)
    }
  }

  if (!isAuthorized) {
    return <div className="flex h-screen w-full items-center justify-center bg-[#fafafa]"><p className="text-zinc-500 font-medium animate-pulse text-sm">Memeriksa akses...</p></div>
  }

  return (
    <div className="flex h-screen bg-[#fafafa] font-sans text-zinc-900">
      {/* SIDEBAR */}
      <aside className="w-56 bg-white border-r border-zinc-100 flex flex-col flex-shrink-0">
        <div className="h-16 flex items-center px-6">
          <span className="text-[#a87ffb] font-bold text-lg">SyncTeam</span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          <Link href="/" className="flex items-center gap-3 px-4 py-3 bg-purple-50 text-[#a87ffb] rounded-xl font-semibold text-sm transition-colors">
            <LayoutDashboard className="w-5 h-5" /> Dashboard
          </Link>
          <Link href="/profile" className="flex items-center gap-3 px-4 py-3 text-zinc-500 hover:bg-zinc-50 rounded-xl font-medium text-sm transition-colors">
            <User className="w-5 h-5" /> Profile
          </Link>
        </nav>
        <div className="px-3 py-6 space-y-1 border-t border-zinc-50">

          <button
            onClick={() => { localStorage.removeItem("userSession"); window.location.href = "/login" }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-red-400 hover:bg-red-50 rounded-xl text-sm font-medium mt-2"
          >
            <LogOut className="w-4 h-4" /> Log out
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="h-14 bg-white flex items-center justify-between px-8 border-b border-zinc-100 flex-shrink-0">
          <h1 className="text-[#a87ffb] font-semibold text-sm">Dashboard</h1>
          <div className="flex items-center gap-5">
            <Popover>
              <PopoverTrigger asChild>
                <button className="text-[#a87ffb] hover:text-purple-600 transition-colors relative">
                  <Bell className="w-5 h-5 fill-current" />
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 border-2 border-white rounded-full" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0 mr-4 mt-2 shadow-2xl border-zinc-100 rounded-xl overflow-hidden">
                <div className="p-4 border-b border-zinc-50"><h3 className="font-bold text-sm">Notification</h3></div>
                <div className="flex gap-4 px-4 py-2 text-[10px] uppercase tracking-wider font-bold text-zinc-400 border-b border-zinc-50">
                  <span className="text-[#a87ffb] border-b-2 border-[#a87ffb] pb-1">Unread (1)</span>
                  <span>All</span><span>Applicants</span><span>Applied</span>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-zinc-400 text-xs">No new notifications</div>
                  ) : (
                    notifications.map(notif => (
                      <div key={notif.id} className="p-4 flex gap-3 hover:bg-zinc-50 cursor-pointer border-b border-zinc-50 transition-colors">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={notif.senderAvatar || "https://github.com/shadcn.png"} />
                          <AvatarFallback>U</AvatarFallback>
                        </Avatar>
                        <div className="text-xs">
                          <p className="text-zinc-800 leading-tight">
                            {notif.type === 'application' ? (
                              <><span className="font-bold">New Applicant:</span> {notif.message}</>
                            ) : notif.type === 'acceptance' ? (
                              <><span className="font-bold text-green-600">Accepted!</span> {notif.message}</>
                            ) : (
                              <><span className="font-bold text-red-500">Update:</span> {notif.message}</>
                            )}
                          </p>
                          <p className="text-zinc-400 mt-1 text-[10px]">{notif.time}</p>
                        </div>
                        {!notif.read && <div className="w-1.5 h-1.5 bg-[#a87ffb] rounded-full mt-1.5 shrink-0" />}
                      </div>
                    ))
                  )}
                </div>
              </PopoverContent>
            </Popover>
            <Avatar className="w-9 h-9 border border-zinc-200">
              <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Milo" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-5xl mx-auto space-y-10">

            {/* ===== TEAMS SECTION ===== */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-zinc-800">Joined Teams</h2>
                {joinedTeams.length > 0 && (
                  <Sheet open={isCreateSheetOpen} onOpenChange={setIsCreateSheetOpen}>
                    <SheetTrigger asChild>
                      <Button variant="ghost" className="text-[#a87ffb] hover:text-purple-600 font-bold text-sm">+ Create Team</Button>
                    </SheetTrigger>
                    <SheetContent className="w-full sm:max-w-[500px] overflow-y-auto p-0 border-none">
                      <div className="p-8">
                        <SheetHeader className="mb-6 flex flex-row items-center space-y-0 gap-3">
                          <ChevronLeft className="w-5 h-5 text-zinc-400 cursor-pointer" onClick={() => setIsCreateSheetOpen(false)} />
                          <SheetTitle className="text-2xl font-bold">Create Team</SheetTitle>
                          <SheetDescription className="sr-only">Form membuat tim</SheetDescription>
                        </SheetHeader>
                        <form className="space-y-5" onSubmit={handleCreateTeam}>
                          <div className="space-y-2">
                            <Label className="font-bold text-zinc-700 text-sm">Team name<span className="text-red-500 ml-1">*</span></Label>
                            <Input name="teamName" placeholder="Insert your teams name" className="bg-zinc-50 border-zinc-100 h-12 rounded-xl focus-visible:ring-[#a87ffb]" />
                          </div>
                          <div className="space-y-2">
                            <Label className="font-bold text-zinc-700 text-sm">Teams description<span className="text-red-500 ml-1">*</span></Label>
                            <Textarea name="description" placeholder="Tell them about your team" className="bg-zinc-50 border-zinc-100 min-h-[100px] rounded-xl resize-none focus-visible:ring-[#a87ffb]" />
                          </div>
                          <div className="space-y-2">
                            <Label className="font-bold text-zinc-700 text-sm">Team numbers<span className="text-red-500 ml-1">*</span></Label>
                            <div className="flex items-center justify-between bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-3">
                              <button type="button" onClick={() => setTeamMembersCount(Math.max(1, teamMembersCount - 1))} className="text-zinc-400 font-bold hover:text-zinc-700">—</button>
                              <span className="text-sm font-bold text-zinc-500">{teamMembersCount} Members</span>
                              <button type="button" onClick={() => setTeamMembersCount(teamMembersCount + 1)} className="text-zinc-400 font-bold hover:text-zinc-700 text-lg">+</button>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="font-bold text-zinc-700 text-sm">Requirements<span className="text-red-500 ml-1">*</span></Label>
                            <Textarea name="requirements" placeholder="What's the requirement to join" className="bg-zinc-50 border-zinc-100 min-h-[100px] rounded-xl resize-none focus-visible:ring-[#a87ffb]" />
                          </div>
                          <div className="space-y-2">
                            <Label className="font-bold text-zinc-700 text-sm">Tags<span className="text-red-500 ml-1">*</span></Label>
                            <Textarea name="tags" placeholder="Add related tags" className="bg-zinc-50 border-zinc-100 min-h-[60px] rounded-xl resize-none focus-visible:ring-[#a87ffb]" />
                          </div>
                          <Button type="submit" className="w-full bg-[#a87ffb] hover:bg-[#9261fa] text-white h-14 rounded-xl font-bold text-base mt-4 shadow-lg shadow-purple-100 active:scale-95 transition-all">Create Team</Button>
                        </form>
                      </div>
                    </SheetContent>
                  </Sheet>
                )}
              </div>              {joinedTeams.length === 0 ? (
                <div className="bg-[#f8f5ff] border border-purple-100/50 rounded-3xl p-16 flex flex-col items-center justify-center text-center space-y-6 shadow-sm">
                  <div className="w-48 h-48 bg-purple-50/50 rounded-full flex items-center justify-center relative">
                    <div className="absolute inset-0 bg-purple-100/30 rounded-full blur-3xl -z-0"></div>
                    <div className="relative z-10 flex flex-col items-center">
                      <div className="w-24 h-16 bg-white border-2 border-[#a87ffb] rounded-xl flex items-center justify-center gap-1.5 shadow-lg transform -rotate-6">
                        <div className="w-2 h-2 bg-[#a87ffb] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="w-2 h-2 bg-[#a87ffb] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-2 h-2 bg-[#a87ffb] rounded-full animate-bounce"></div>
                      </div>
                      <div className="w-12 h-12 bg-purple-100 rounded-full mt-4 flex items-center justify-center text-[#a87ffb]">
                        <User className="w-6 h-6 fill-current" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2 max-w-xs">
                    <p className="text-zinc-400 text-sm font-medium leading-relaxed">
                      You aren't currently a member of any team. Create a team or join one to get started.
                    </p>
                  </div>
                  <Sheet open={isCreateSheetOpen} onOpenChange={setIsCreateSheetOpen}>
                    <SheetTrigger asChild>
                      <Button className="bg-[#a87ffb] hover:bg-[#9261fa] text-white rounded-xl px-12 h-14 font-bold text-sm shadow-lg shadow-purple-100 transition-all active:scale-95">
                        Create or Join Team
                      </Button>
                    </SheetTrigger>
                    <SheetContent className="w-full sm:max-w-[500px] overflow-y-auto p-0 border-none">
                      <div className="p-8">
                        <SheetHeader className="mb-6 flex flex-row items-center space-y-0 gap-3">
                          <ChevronLeft className="w-5 h-5 text-zinc-400 cursor-pointer" onClick={() => setIsCreateSheetOpen(false)} />
                          <SheetTitle className="text-2xl font-bold">Create Team</SheetTitle>
                          <SheetDescription className="sr-only">Form membuat tim</SheetDescription>
                        </SheetHeader>
                        <form className="space-y-5" onSubmit={handleCreateTeam}>
                          <div className="space-y-2">
                            <Label className="font-bold text-zinc-700 text-sm">Team name<span className="text-red-500 ml-1">*</span></Label>
                            <Input name="teamName" placeholder="Insert your teams name" className="bg-zinc-50 border-zinc-100 h-12 rounded-xl focus-visible:ring-[#a87ffb]" />
                          </div>
                          <div className="space-y-2">
                            <Label className="font-bold text-zinc-700 text-sm">Teams description<span className="text-red-500 ml-1">*</span></Label>
                            <Textarea name="description" placeholder="Tell them about your team" className="bg-zinc-50 border-zinc-100 min-h-[100px] rounded-xl resize-none focus-visible:ring-[#a87ffb]" />
                          </div>
                          <div className="space-y-2">
                            <Label className="font-bold text-zinc-700 text-sm">Team numbers<span className="text-red-500 ml-1">*</span></Label>
                            <div className="flex items-center justify-between bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-3">
                              <button type="button" onClick={() => setTeamMembersCount(Math.max(1, teamMembersCount - 1))} className="text-zinc-400 font-bold hover:text-zinc-700">—</button>
                              <span className="text-sm font-bold text-zinc-500">{teamMembersCount} Members</span>
                              <button type="button" onClick={() => setTeamMembersCount(teamMembersCount + 1)} className="text-zinc-400 font-bold hover:text-zinc-700 text-lg">+</button>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="font-bold text-zinc-700 text-sm">Requirements<span className="text-red-500 ml-1">*</span></Label>
                            <Textarea name="requirements" placeholder="What's the requirement to join" className="bg-zinc-50 border-zinc-100 min-h-[100px] rounded-xl resize-none focus-visible:ring-[#a87ffb]" />
                          </div>
                          <div className="space-y-2">
                            <Label className="font-bold text-zinc-700 text-sm">Tags<span className="text-red-500 ml-1">*</span></Label>
                            <Textarea name="tags" placeholder="Add related tags" className="bg-zinc-50 border-zinc-100 min-h-[60px] rounded-xl resize-none focus-visible:ring-[#a87ffb]" />
                          </div>
                          <Button type="submit" className="w-full bg-[#a87ffb] hover:bg-[#9261fa] text-white h-14 rounded-xl font-bold text-base mt-4 shadow-lg shadow-purple-100 active:scale-95 transition-all">Create Team</Button>
                        </form>
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {joinedTeams.map((team) => (
                    <Sheet key={team.id}>
                      <SheetTrigger asChild>
                        <Card 
                          className={cn(
                            "transition-all cursor-pointer group rounded-3xl overflow-hidden active:scale-[0.98] border-none",
                            team.bgColor || "bg-white"
                          )}
                          style={{ backgroundColor: team.bgColor }}
                        >
                          <CardContent className="p-6 flex flex-col space-y-3">
                            <div className="flex items-start justify-between">
                              <h3 className="text-lg font-bold text-zinc-800 leading-tight">{team.title}</h3>
                              <span className="text-sm font-bold" style={{ color: team.tagColor }}>
                                {team.membersCount}
                              </span>
                            </div>
                            
                            <p className="text-zinc-500 text-sm leading-relaxed line-clamp-2 font-medium opacity-80">
                              {team.description}
                            </p>

                            <div className="flex items-end justify-between pt-2">
                              <div className="flex -space-x-3">
                                {(team.joinedMembers || []).slice(0, 4).map((m, i) => (
                                  <Avatar key={i} className="w-10 h-10 border-2 border-white shadow-sm">
                                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${m.name}&mouth=smile`} />
                                    <AvatarFallback>{m.name[0]}</AvatarFallback>
                                  </Avatar>
                                ))}
                                {team.joinedMembers && team.joinedMembers.length > 4 && (
                                  <div className="w-10 h-10 rounded-full bg-white border-2 border-white flex items-center justify-center text-[10px] font-bold text-zinc-400 shadow-sm">
                                    +{team.joinedMembers.length - 4}
                                  </div>
                                )}
                              </div>
                              <span className="text-sm font-bold lowercase tracking-tight" style={{ color: team.tagColor }}>
                                {team.status || 'ongoing'}
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      </SheetTrigger>
                      <SheetContent className="w-full sm:max-w-[540px] overflow-y-auto p-0 border-none bg-white font-sans">
                        <div className="px-[24px] py-[16px] space-y-[24px]">
                          {/* Top Navigation */}
                          <div className="flex items-center">
                            <SheetClose asChild>
                              <button className="p-2 -ml-2 text-zinc-400 hover:text-zinc-600 transition-all hover:scale-110 active:scale-95">
                                <ChevronLeft className="w-7 h-7 stroke-[2.5]" />
                              </button>
                            </SheetClose>
                          </div>

                          {/* Header Section */}
                          <div className="space-y-2">
                            <SheetTitle className="text-[30px] font-medium text-[#1D2939] leading-[38px] tracking-normal">
                              {team.title}
                            </SheetTitle>
                            <SheetDescription className="sr-only">Detail tim {team.title}</SheetDescription>
                            
                            {/* Colored Hashtags */}
                            <div className="flex flex-wrap gap-x-[6px] items-center">
                              {team.tags.map((tag, idx) => {
                                const tagColors = ['text-[#F97316]', 'text-[#9E77ED]', 'text-[#60A5FA]', 'text-[#F87171]'];
                                const colorClass = tagColors[idx % tagColors.length];
                                return (
                                  <span key={idx} className={`${colorClass} font-normal text-[14px] leading-[20px]`}>
                                    # {tag.replace("#", "").toLowerCase()}
                                  </span>
                                );
                              })}
                            </div>
                          </div>

                          {/* Detail Info Section */}
                          <div className="space-y-[8px]">
                            <h3 className="text-[18px] font-medium text-[#334155] leading-[28px]">Detail</h3>
                            <div className="space-y-[4px]">
                              <div className="flex justify-between items-center h-[20px]">
                                <span className="text-[14px] text-[#64748B] font-normal leading-[20px]">Joined team</span>
                                <span className="text-[14px] text-[#7F56D9] font-medium leading-[20px]">
                                  {team.joinedMembers.length}/{team.membersCount.split('/')[1] || team.membersCount}
                                </span>
                              </div>
                              <div className="flex justify-between items-center h-[20px]">
                                <span className="text-[14px] text-[#64748B] font-normal leading-[20px]">Competition time</span>
                                <span className="text-[14px] text-[#7F56D9] font-medium leading-[20px]">
                                  {team.competitionTime || "4 Maret 2026 - 10 Maret 2026"}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Deskripsi Section */}
                          <div className="space-y-[8px]">
                            <h3 className="text-[18px] font-medium text-[#334155] leading-[28px]">Deskripsi</h3>
                            <p className="text-[14px] text-[#64748B] leading-[20px] font-normal">
                              {team.description}
                            </p>
                          </div>

                          {/* Requirements Section */}
                          {team.requirements && (
                            <div className="space-y-[8px]">
                              <h3 className="text-[18px] font-medium text-[#334155] leading-[28px]">Requirements</h3>
                              <ul className="list-disc ml-[21px] text-[14px] text-[#64748B] font-normal space-y-0">
                                {team.requirements.split('\n').map((req, i) => (
                                  <li key={i} className="leading-[20px]">
                                    {req}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Applicants Section (Only for Creator) */}
                          {team.ownerName === userData.username && (
                            <div className="space-y-[8px]">
                              <div className="flex items-center justify-between">
                                <h3 className="text-[16px] font-medium text-[#344054] leading-[24px]">Applicants</h3>
                              </div>
                              {team.applicants.length === 0 ? (
                                <div className="p-10 bg-[#f1f5f9] rounded-xl border border-[#e2e8f0] flex flex-col items-center justify-center text-center">
                                  <p className="text-[14px] text-[#64748B] font-normal italic opacity-60">No applicants yet.</p>
                                </div>
                              ) : (
                                <div className="space-y-[8px]">
                                  {team.applicants.map(app => (
                                    <div key={app.id} className="flex items-center justify-between px-[16px] py-[8px] bg-[#f1f5f9] border border-[#e2e8f0] rounded-xl">
                                      <div className="flex items-center gap-[12px]">
                                        <Avatar className="w-[52px] h-[52px] rounded-full shrink-0">
                                          <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Milo&mouth=smile&eyebrows=default&eyes=default`} className="object-cover" />
                                          <AvatarFallback className="bg-purple-50 text-[#7F56D9]">{app.name[0]}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col gap-[4px]">
                                          <p className="text-[14px] font-normal text-[#334155] leading-none">{app.name}</p>
                                          <p className="text-[12px] text-[#64748B] font-normal leading-none">{app.time}</p>
                                        </div>
                                      </div>
                                      <div className="flex gap-[8px]">
                                        <button 
                                          onClick={() => handleAccept(team.id, app.id)}
                                          className="h-[34px] px-[8px] rounded-xl bg-white border border-[#E9D7FE] text-[#42307D] hover:bg-purple-50 font-medium text-[12px] transition-all active:scale-95"
                                        >
                                          Accept
                                        </button>
                                        <button 
                                          onClick={() => handleReject(team.id, app.id)}
                                          className="h-[34px] px-[8px] rounded-xl bg-white border border-[#E9D7FE] text-[#42307D] hover:bg-red-50 hover:text-red-600 hover:border-red-200 font-medium text-[12px] transition-all active:scale-95"
                                        >
                                          Reject
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Joined Members Section */}
                          <div className="space-y-[8px]">
                            <h3 className="text-[16px] font-medium text-[#475467] leading-[24px]">Joined</h3>
                            <div className="space-y-[8px]">
                              {team.joinedMembers.map(m => (
                                <div key={m.id} className="flex items-center gap-[12px] px-[16px] py-[8px] bg-[#f1f5f9] border border-[#e2e8f0] rounded-xl">
                                  <Avatar className="w-[52px] h-[52px] rounded-full shrink-0">
                                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Milo&mouth=smile&eyebrows=default&eyes=default`} className="object-cover" />
                                    <AvatarFallback className="bg-purple-50 text-[#7F56D9]">{m.name[0]}</AvatarFallback>
                                  </Avatar>
                                  <div className="flex flex-col gap-[4px]">
                                    <p className="text-[14px] font-normal text-[#344054] leading-none">{m.name}</p>
                                    <p className="text-[12px] text-[#667085] font-normal leading-none">{m.time || "Joined"}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Action Button Section */}
                          <div className="pt-[24px] pb-[16px]">
                            {team.ownerName === userData.username ? (
                              <button
                                onClick={() => handleDeleteTeam(team.id)}
                                className="w-full bg-[#F04438] hover:bg-[#D92D20] text-white rounded-xl font-semibold h-[44px] text-[16px] shadow-sm transition-all active:scale-[0.98] uppercase tracking-wider"
                              >
                                DISBAND TEAM
                              </button>
                            ) : (
                              <button
                                onClick={() => handleLeaveTeam(team.id)}
                                className="w-full bg-[#F04438] hover:bg-[#D92D20] text-white rounded-xl font-semibold h-[44px] text-[16px] shadow-sm transition-all active:scale-[0.98] uppercase tracking-wider"
                              >
                                LEAVE TEAM
                              </button>
                            )}
                          </div>
                        </div>
                      </SheetContent>
                    </Sheet>
                  ))}
                </div>
              )}
            </section>

            {/* ===== REQUESTED TEAMS SECTION ===== */}
            {requestedTeams.length > 0 && (
              <section className="space-y-4">
                <h2 className="text-xl font-bold text-zinc-800">Requested Teams</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {requestedTeams.map((team) => (
                    <Sheet key={team.id}>
                      <SheetTrigger asChild>
                        <Card className="bg-[#f0fdf4] border border-green-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer active:scale-[0.98]">
                          <CardContent className="p-6 flex flex-col space-y-4">
                            <div className="flex items-start justify-between">
                              <h3 className="text-lg font-bold text-zinc-800">{team.title}</h3>
                              <Badge className="bg-amber-100 text-amber-600 border-none px-3 py-1 text-[10px] uppercase font-bold">Pending</Badge>
                            </div>
                            <p className="text-zinc-500 text-sm leading-relaxed line-clamp-2">
                              {team.description}
                            </p>
                            <div className="flex flex-wrap gap-2 pt-2">
                              {team.tags.slice(0, 2).map(tag => (
                                <span key={tag} className="text-[#22c55e] text-xs font-bold">
                                  # {tag.replace("#", "").toLowerCase()}
                                </span>
                              ))}
                              {team.tags.length > 2 && <span className="text-[#22c55e] text-xs font-bold">{team.tags.length - 2}+</span>}
                            </div>
                          </CardContent>
                        </Card>
                      </SheetTrigger>
                      <SheetContent className="w-full sm:max-w-[540px] overflow-y-auto p-0 border-none bg-white font-sans">
                        <div className="px-[24px] py-[16px] space-y-[24px]">
                          <div className="flex items-center">
                            <SheetClose asChild>
                              <button className="p-2 -ml-2 text-zinc-400 hover:text-zinc-600 transition-all hover:scale-110 active:scale-95">
                                <ChevronLeft className="w-7 h-7 stroke-[2.5]" />
                              </button>
                            </SheetClose>
                          </div>
                          <div className="space-y-2">
                            <SheetTitle className="text-[30px] font-medium text-[#1D2939] leading-[38px]">
                              {team.title}
                            </SheetTitle>
                            <div className="flex flex-wrap gap-x-[6px] items-center">
                              {team.tags.map((tag, idx) => (
                                <span key={idx} className="text-[#22c55e] font-normal text-[14px]">
                                  # {tag.replace("#", "").toLowerCase()}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="space-y-[8px]">
                            <h3 className="text-[18px] font-medium text-[#334155]">Deskripsi</h3>
                            <p className="text-[14px] text-[#64748B] leading-[20px]">{team.description}</p>
                          </div>
                          <div className="pt-6 border-t border-zinc-100">
                            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex items-center gap-3">
                              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
                                <Clock className="w-5 h-5" />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-amber-900">Application Pending</p>
                                <p className="text-xs text-amber-700">The team owner hasn't reviewed your request yet.</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </SheetContent>
                    </Sheet>
                  ))}
                </div>
              </section>
            )}

            {/* ===== LIST AVAILABLE TEAMS ===== */}
            <section className="space-y-6 pb-16">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-xl font-bold text-zinc-800">List Available Teams</h2>
                <div className="flex items-center gap-4">
                  <div className="relative group">
                    <Input
                      placeholder="Search teams..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full sm:w-64 bg-white border-zinc-100 rounded-xl h-10 pl-10 focus-visible:ring-[#a87ffb] transition-all"
                    />
                    <svg className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 group-focus-within:text-[#a87ffb] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <Link href="#" className="text-[#a87ffb] text-sm font-semibold hover:underline shrink-0">see all</Link>
                </div>
              </div>


              <div className="space-y-4">
                {availableTeams.length === 0 ? (
                  <div className="py-20 flex flex-col items-center justify-center text-center space-y-6">
                    <div className="w-40 h-40 bg-zinc-50 rounded-full flex items-center justify-center relative">
                      <HelpCircle className="w-16 h-16 text-zinc-200 stroke-[1.5]" />
                      <div className="absolute inset-0 bg-zinc-100/20 rounded-full blur-2xl -z-0"></div>
                    </div>
                    <div className="space-y-2 max-w-xs mx-auto">
                      <h3 className="text-lg font-bold text-zinc-800">No teams available</h3>
                      <p className="text-zinc-400 text-sm font-medium">There are no other teams to join at the moment. Check back later!</p>
                    </div>
                  </div>
                ) : availableTeams.filter(team =>
                  team.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                  team.description.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                  team.tags.some(tag => tag.toLowerCase().includes(debouncedSearch.toLowerCase()))
                ).length === 0 ? (
                  <div className="py-20 flex flex-col items-center justify-center text-center space-y-6">
                    <div className="w-40 h-40 bg-zinc-50 rounded-full flex items-center justify-center relative">
                      <svg className="w-16 h-16 text-zinc-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <div className="absolute inset-0 bg-zinc-100/20 rounded-full blur-2xl -z-0"></div>
                    </div>
                    <div className="space-y-2 max-w-xs mx-auto">
                      <h3 className="text-lg font-bold text-zinc-800">No result found</h3>
                      <p className="text-zinc-400 text-sm font-medium">We couldn't find any teams matching "{searchQuery}". Try a different keyword.</p>
                    </div>
                    <Button variant="ghost" onClick={() => setSearchQuery("")} className="text-[#a87ffb] font-bold hover:bg-purple-50">Clear search</Button>
                  </div>
                ) : (
                  availableTeams
                    .filter(team =>
                      team.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                      team.description.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                      team.tags.some(tag => tag.toLowerCase().includes(debouncedSearch.toLowerCase()))
                    )
                    .map((team) => (
                      <Sheet key={team.id}>
                        <SheetTrigger asChild>
                          <Card className="bg-[#f8f5ff] border border-purple-100/80 shadow-sm hover:shadow-md hover:border-[#a87ffb]/40 transition-all cursor-pointer group rounded-3xl overflow-hidden active:scale-[0.98]">
                            <CardContent className="p-6 flex flex-col space-y-4">
                              <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold text-zinc-800 group-hover:text-[#a87ffb] transition-colors">{team.title}</h3>
                                <div className="text-[#a87ffb] text-sm font-bold">
                                  {team.membersCount}
                                </div>
                              </div>
                              <p className="text-zinc-500 text-sm leading-relaxed line-clamp-2 font-medium opacity-80 group-hover:opacity-100 transition-opacity">
                                {team.description}
                              </p>
                              <div className="flex items-center justify-between pt-1">
                                <div className="flex flex-wrap gap-x-4">
                                  {team.tags.slice(0, 3).map(tag => (
                                    <span key={tag} className="text-[#a87ffb] text-[13px] font-bold">
                                      # {tag.replace("#", "").toLowerCase()}
                                    </span>
                                  ))}
                                </div>
                                <span className="text-zinc-400 text-[11px] font-semibold flex items-center gap-1.5">
                                  <span className="w-1 h-1 bg-zinc-300 rounded-full"></span>
                                  {team.postedAt || "Baru saja"}
                                </span>
                              </div>
                            </CardContent>
                          </Card>
                        </SheetTrigger>
                        <SheetContent className="w-full sm:max-w-[540px] overflow-y-auto p-0 border-none bg-white font-sans">
                          <div className="px-[24px] py-[16px] space-y-[24px]">
                            {/* Top Navigation */}
                            <div className="flex items-center">
                              <SheetClose asChild>
                                <button className="p-2 -ml-2 text-zinc-400 hover:text-zinc-600 transition-all hover:scale-110 active:scale-95">
                                  <ChevronLeft className="w-7 h-7 stroke-[2.5]" />
                                </button>
                              </SheetClose>
                            </div>

                            {/* Header Section */}
                            <div className="space-y-2">
                              <SheetTitle className="text-[30px] font-medium text-[#1D2939] leading-[38px] tracking-normal">
                                {team.title}
                              </SheetTitle>
                              <SheetDescription className="sr-only">Detail tim {team.title}</SheetDescription>
                              
                              {/* Colored Hashtags */}
                              <div className="flex flex-wrap gap-x-[6px] items-center">
                                {team.tags.map((tag, idx) => {
                                  const tagColors = ['text-[#F97316]', 'text-[#9E77ED]', 'text-[#60A5FA]', 'text-[#F87171]'];
                                  const colorClass = tagColors[idx % tagColors.length];
                                  return (
                                    <span key={idx} className={`${colorClass} font-normal text-[14px] leading-[20px]`}>
                                      # {tag.replace("#", "").toLowerCase()}
                                    </span>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Detail Info Section */}
                            <div className="space-y-[8px]">
                              <h3 className="text-[18px] font-medium text-[#334155] leading-[28px]">Detail</h3>
                              <div className="space-y-[4px]">
                                <div className="flex justify-between items-center h-[20px]">
                                  <span className="text-[14px] text-[#64748B] font-normal leading-[20px]">Joined team</span>
                                  <span className="text-[14px] text-[#7F56D9] font-medium leading-[20px]">
                                    {team.membersCount}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center h-[20px]">
                                  <span className="text-[14px] text-[#64748B] font-normal leading-[20px]">Competition time</span>
                                  <span className="text-[14px] text-[#7F56D9] font-medium leading-[20px]">
                                    {team.competitionTime || "4 Maret 2026 - 10 Maret 2026"}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Deskripsi Section */}
                            <div className="space-y-[8px]">
                              <h3 className="text-[18px] font-medium text-[#334155] leading-[28px]">Deskripsi</h3>
                              <p className="text-[14px] text-[#64748B] leading-[20px] font-normal">
                                {team.description}
                              </p>
                            </div>

                            {/* Requirements Section */}
                            <div className="space-y-[8px]">
                              <h3 className="text-[18px] font-medium text-[#334155] leading-[28px]">Requirements</h3>
                              <ul className="list-disc ml-[21px] text-[14px] text-[#64748B] font-normal space-y-0">
                                {(team.requirements || "").split('\n').map((req, i) => (
                                  <li key={i} className="leading-[20px]">
                                    {req}
                                  </li>
                                ))}
                              </ul>
                            </div>

                             {/* Joined Members Section */}
                            <div className="space-y-[8px]">
                              <h3 className="text-[16px] font-medium text-[#475467] leading-[24px]">Joined</h3>
                              <div className="space-y-[8px]">
                                {(team.joinedMembers || []).map(m => (
                                  <div key={m.id} className="flex items-center gap-[12px] px-[16px] py-[8px] bg-[#f1f5f9] border border-[#e2e8f0] rounded-xl">
                                    <Avatar className="w-[52px] h-[52px] rounded-full shrink-0">
                                      <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Milo&mouth=smile&eyebrows=default&eyes=default`} className="object-cover" />
                                      <AvatarFallback className="bg-purple-50 text-[#7F56D9]">{m.name[0]}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col gap-[4px]">
                                      <p className="text-[14px] font-normal text-[#344054] leading-none">{m.name}</p>
                                      <p className="text-[12px] text-[#667085] font-normal leading-none">{m.time || "Joined"}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Join Button */}
                            <div className="pt-[24px] pb-[16px]">
                              <button 
                                onClick={() => handleJoinTeam(team)} 
                                className="w-full bg-[#9E77ED] hover:bg-[#8B5CF6] text-white h-[44px] rounded-xl font-semibold text-[16px] leading-[24px] shadow-sm transition-all active:scale-[0.98] uppercase tracking-wider"
                              >
                                JOIN TEAM
                              </button>
                            </div>
                          </div>
                        </SheetContent>

                      </Sheet>
                    ))
                )}
              </div>
            </section>

          </div>
        </div>
      </main>
    </div>
  )
}