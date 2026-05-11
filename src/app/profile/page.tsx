// src/app/profile/page.tsx
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet"
import { ArrowLeft, Bell, Search, LayoutDashboard, LogOut, User } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { useUser } from "@/hooks/use-user"
import { toast } from "sonner"

const imgNameShieldTypeOutline = "http://localhost:3845/assets/49da301e61513bd83e5f5ece1e8f44c58d2c83d5.svg";
const imgNameLanguageTypeOutline = "http://localhost:3845/assets/ffd9439be016e2d5d68e650ee82d306bef6cef61.svg";
const imgNameThemeTypeOutline = "http://localhost:3845/assets/86f7857a3a79016144cf677512d69d6418c8b533.svg";
const imgNameQuestionTypeOutline = "http://localhost:3845/assets/aa8a75bedf1aa9e1d0f4ba1dfcc2dda7c4733c6d.svg";
const imgNameLogoutTypeOutline = "http://localhost:3845/assets/a2353b839e2d86a41e78465e65ba62f9693b3562.svg";
const imgVector = "http://localhost:3845/assets/b77b980dd968832b85b06562092047fad6a3a240.svg";
const imgVector1 = "http://localhost:3845/assets/c4c28e0e4f82ddda56acb887b0508a7bf8600641.svg";
const imgVector2 = "http://localhost:3845/assets/f8cdee43d65c181b3a9663ce37d015a7a53a01cb.svg";
const imgIcon = "http://localhost:3845/assets/002c6596baefaffe70ffd4079d1ac6249a367001.svg";
const imgIcon1 = "http://localhost:3845/assets/c0758aea51c2344dad065d17ef28cdb37a778a7f.svg";
const imgIcon2 = "http://localhost:3845/assets/9bf51de7bc793edae367da7b44bb146022306cd0.svg";
const imgIcon3 = "http://localhost:3845/assets/a84faf8a87ca4c43b4bb5478c91097da6146b506.svg";
const imgIcon4 = "http://localhost:3845/assets/457372228d8fea3480e0c689a64edbbbd7f6c81a.svg";
const imgVuesaxLinearArrowRight = "http://localhost:3845/assets/bd5568ea862859d2cbfb79cf590936d4ac510c8a.svg";
const imgVuesaxOutlineArrowLeft = "http://localhost:3845/assets/be718d2ec10de6b3412d2137649281529d0843fb.svg";

export default function ProfilePage() {
  const router = useRouter()
  const { userData, loading, isAuthorized, logout, updateSession } = useUser()
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editForm, setEditForm] = useState({ fullName: "", bio: "", role: "" })

  useEffect(() => {
    if (userData && !isSheetOpen) {
      setEditForm({ 
        fullName: `${userData.firstName || ""} ${userData.lastName || ""}`.trim(),
        bio: userData.bio || "", 
        role: userData.role || "" 
      })
    }
  }, [userData, isSheetOpen])

  const handleSave = async () => {
    if (!userData) return
    
    if (!editForm.fullName.trim()) {
      toast.error("Full name is required")
      return
    }

    if (editForm.bio.length > 500) {
      toast.error("Bio must be less than 500 characters")
      return
    }

    setIsSaving(true)
    try {
      const nameParts = editForm.fullName.trim().split(/\s+/)
      const firstName = nameParts[0] || ""
      const lastName = nameParts.slice(1).join(" ")

      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userData.email,
          firstName,
          lastName,
          bio: editForm.bio,
          role: editForm.role
        })
      })

      if (res.ok) {
        const data = await res.json()
        updateSession(data.user)
        setIsSheetOpen(false)
        toast.success("Profile updated successfully")
      } else {
        const errorData = await res.json()
        toast.error(errorData.message || "Failed to update profile")
      }
    } catch (err) {
      console.error("Error updating profile:", err)
      toast.error("System error occurred")
    } finally {
      setIsSaving(false)
    }
  }

  if (loading || !isAuthorized || !userData) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#F8FAFC]">
        <p className="text-slate-400 font-medium animate-pulse text-sm">Memuat profil...</p>
      </div>
    )
  }

  const initials = `${(userData.firstName?.[0] || "").toUpperCase()}${(userData.lastName?.[0] || "").toUpperCase()}` || "U"
  const fullName = `${userData.firstName || ""} ${userData.lastName || ""}`.trim() || userData.username || "User"

  return (
    <div className="bg-white relative flex h-screen w-full overflow-hidden font-['Poppins',sans-serif]">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-zinc-100 flex flex-col flex-shrink-0 z-20">
        <div className="h-16 flex items-center px-6">
          <span className="text-[#a87ffb] font-bold text-lg">SyncTeam</span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          <Link href="/" className="flex items-center gap-3 px-4 py-3 text-zinc-500 hover:bg-zinc-50 rounded-xl font-medium text-sm transition-colors">
            <LayoutDashboard className="w-5 h-5" /> Dashboard
          </Link>
          <Link href="/profile" className="flex items-center gap-3 px-4 py-3 bg-purple-50 text-[#a87ffb] rounded-xl font-semibold text-sm transition-colors">
            <User className="w-5 h-5" /> Profile
          </Link>
        </nav>
        <div className="px-3 py-6 space-y-1 border-t border-zinc-50">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-red-400 hover:bg-red-50 rounded-xl text-sm font-medium mt-2"
          >
            <LogOut className="w-4 h-4" /> Log out
          </button>
        </div>
      </aside>

      {/* Header & Content - Precise implementation from node 1:4041 */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#F8FAFC]">
        {/* Top Navigation - Precise from node 1:4015 */}
        <header className="h-[61px] min-h-[61px] bg-white border-b border-[#F2F4F7] flex items-center justify-between px-[32px] z-10">
          <p className="font-regular text-[16px] leading-[24px] text-[#9e77ed] overflow-hidden text-ellipsis whitespace-nowrap">
            Profile
          </p>
          <div className="flex items-center gap-[12px]">
            <div className="p-[16px] rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
              <div className="w-[24px] h-[24px]">
                <img src={imgVector2} alt="" className="w-full h-full object-contain" />
              </div>
            </div>
            <div className="w-[48px] h-[48px] rounded-full overflow-hidden border border-slate-100">
              <Avatar className="w-full h-full">
                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.username}`} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* Scrollable Area */}
        <div className="flex-1 overflow-y-auto relative">
          {/* Hero Gradient Background - node 1:4043 */}
          <div className="h-[231px] w-full absolute top-0 left-0" style={{ backgroundImage: "linear-gradient(-68.56deg, #2059B5 12.53%, #8BA9F5 99.35%)" }} />
          
          {/* Content Container - node 1:4044 */}
          <div className="relative pt-[116px] pb-[64px] px-[68px] flex flex-col gap-[24px] items-center">
            
            {/* Profile Info Card - node 1:4045 */}
            <div className="bg-white rounded-3xl w-full max-w-[960px] p-[32px] shadow-sm flex flex-col gap-[32px] z-10">
              <div className="flex flex-col md:flex-row items-end gap-[24px] relative">
                {/* Avatar Section - node 1:4048 */}
                <div className="relative -mb-12">
                   <div className="w-[128px] h-[128px] rounded-full border-4 border-white bg-white p-[4px] shadow-sm overflow-hidden">
                      <Avatar className="w-full h-full rounded-full">
                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.username}`} className="object-cover" />
                        <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
                      </Avatar>
                   </div>
                </div>

                <div className="flex-1 flex flex-col gap-[4px]">
                  <h1 className="font-medium text-[24px] leading-[32px] text-[#334155]">{fullName}</h1>
                  <p className="font-regular text-[14px] leading-[20px] text-[#64748b]">{userData.email}</p>
                </div>

                {/* Edit Button - Precise from node 1:4055 */}
                <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                  <SheetTrigger asChild>
                    <button className="bg-[#f4ebff] h-[36px] px-[16px] rounded-xl flex items-center gap-[8px] hover:bg-[#ebe0ff] transition-colors">
                      <img src={imgIcon4} alt="" className="w-[16px] h-[16px]" />
                      <span className="font-medium text-[14px] leading-[20px] text-[#9e77ed]">Edit Profile</span>
                    </button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-full sm:max-w-[588px] p-0 border-none bg-white rounded-t-xl flex flex-col h-full shadow-2xl">
                    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white">
                      {/* Top Arrow Button Section - node 1:4293 */}
                      <div className="px-[24px] py-[16px] flex items-center w-full">
                        <SheetClose asChild>
                          <button className="p-1 rounded-full hover:bg-slate-50 transition-colors">
                            <img src={imgVuesaxOutlineArrowLeft} alt="back" className="w-[24px] h-[24px]" />
                          </button>
                        </SheetClose>
                      </div>

                      {/* Header Section - node 1:4297 */}
                      <div className="px-[48px] py-[24px] border-b border-[#334155]/10">
                        <h2 className="font-medium text-[20px] leading-[30px] text-[#334155]">Edit Profile</h2>
                      </div>
                      
                      {/* Form Area - node 1:4300 */}
                      <div className="flex-1 overflow-y-auto px-[48px] py-[24px] flex flex-col gap-[20px]">
                        {/* Full Name Field - node 1:4301 */}
                        <div className="flex flex-col gap-[6px] w-full">
                          <Label className="font-medium text-[14px] leading-[20px] text-[#334155]">Full Name</Label>
                          <div className="bg-[#f2f4f7] border border-[#e4e7ec] rounded-xl flex items-center">
                            <Input 
                              value={editForm.fullName}
                              onChange={(e) => setEditForm(prev => ({ ...prev, fullName: e.target.value }))}
                              className="bg-transparent border-none h-[52px] rounded-xl focus-visible:ring-0 px-4 font-normal text-[#1e293b] placeholder:text-[#98a2b3] w-full"
                              placeholder="Cool Cat"
                            />
                          </div>
                        </div>

                        {/* Role Field - node 1:4308 */}
                        <div className="flex flex-col gap-[6px] w-full">
                          <Label className="font-medium text-[14px] leading-[20px] text-[#334155]">Role</Label>
                          <div className="bg-[#f2f4f7] border border-[#e4e7ec] rounded-xl flex items-center">
                            <Input 
                              value={editForm.role}
                              onChange={(e) => setEditForm(prev => ({ ...prev, role: e.target.value }))}
                              className="bg-transparent border-none h-[52px] rounded-xl focus-visible:ring-0 px-4 font-normal text-[#1e293b] placeholder:text-[#98a2b3] w-full"
                              placeholder="Back-end Developer"
                            />
                          </div>
                        </div>

                        {/* About Field - node 1:4315 */}
                        <div className="flex flex-col gap-[6px] w-full">
                          <div className="flex justify-between items-center">
                            <Label className="font-medium text-[14px] leading-[20px] text-[#334155]">About</Label>
                            <span className={cn(
                              "text-[12px]",
                              editForm.bio.length > 500 ? "text-red-500" : "text-[#64748b]"
                            )}>
                              {editForm.bio.length}/500
                            </span>
                          </div>
                          <div className="bg-[#f2f4f7] border border-[#e4e7ec] rounded-xl min-h-[172px] flex p-[16px]">
                            <Textarea 
                              value={editForm.bio}
                              onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                              className="bg-transparent border-none flex-1 focus-visible:ring-0 p-0 font-normal text-[#1e293b] placeholder:text-[#98a2b3] resize-none leading-[20px] text-[14px]"
                              placeholder="Describe yourself..."
                            />
                          </div>
                        </div>
                      </div>

                      {/* Footer / Save Button - node 1:4322 */}
                      <div className="p-[24px] pb-[32px] bg-white">
                        <Button 
                          onClick={handleSave}
                          disabled={isSaving}
                          className="w-full bg-[#9e77ed] hover:bg-[#8e66dd] text-white h-[56px] rounded-xl font-medium text-[16px] shadow-sm transition-all"
                        >
                          {isSaving ? "Saving..." : "Save Change"}
                        </Button>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>

              {/* Stats Row - node 1:4218 */}
              <div className="pt-[24px] border-t border-[#334155]/10 flex gap-[60px] items-start">
                <div className="flex flex-col gap-[4px] min-w-[60px]">
                  <p className="font-medium text-[12px] text-[#64748b] leading-[18px]">teams:</p>
                  <p className="font-medium text-[16px] text-[#334155] leading-[24px]">2/2</p>
                </div>
                <div className="flex flex-col gap-[4px] min-w-[60px]">
                  <p className="font-medium text-[12px] text-[#64748b] leading-[18px]">ratings:</p>
                  <p className="font-medium text-[16px] text-[#334155] leading-[24px]">5.0</p>
                </div>
                <div className="flex flex-col gap-[4px]">
                  <p className="font-medium text-[12px] text-[#64748b] leading-[18px]">role:</p>
                  <p className="font-medium text-[16px] text-[#334155] leading-[24px]">{userData.role || "Back-end Developer"}</p>
                </div>
              </div>
            </div>

            {/* Main Content Area - node 1:4076 */}
            <div className="w-full max-w-[960px] flex flex-col gap-[24px] z-10 pb-20">
              {/* About Section - node 1:4078 */}
              <div className="bg-white rounded-3xl p-[33px] shadow-sm flex flex-col gap-[16px]">
                <h3 className="font-semibold text-[18px] text-[#334155] leading-[28px]">About</h3>
                <p className="font-regular text-[14px] text-[#64748b] leading-[20px] whitespace-pre-wrap">
                  {userData.bio || "No bio provided yet. Tell us about your expertise and interests!"}
                </p>
              </div>

              {/* Settings Section - Added for "Wow" factor and completeness */}
              <div className="bg-white rounded-3xl p-[33px] shadow-sm flex flex-col gap-[20px]">
                <h3 className="font-semibold text-[18px] text-[#334155] leading-[28px]">Account Settings</h3>
                <div className="flex flex-col gap-[12px]">
                  <SettingsItem icon={imgNameShieldTypeOutline} label="Security & Privacy" isVector />
                  <SettingsItem icon={imgNameLanguageTypeOutline} label="Language Preferences" isVector />
                  <SettingsItem icon={imgNameThemeTypeOutline} label="App Theme" isVector />
                  <SettingsItem icon={imgNameQuestionTypeOutline} label="Help & Support" isVector />
                  <button onClick={logout} className="flex items-center justify-between py-[4px] cursor-pointer group w-full text-left">
                    <div className="flex items-center gap-[8px]">
                      <div className="w-[24px] h-[24px] p-[3px]">
                        <img src={imgNameLogoutTypeOutline} alt="" className="w-full h-full object-contain" />
                      </div>
                      <p className="font-regular text-[12px] text-red-400 leading-[18px] group-hover:text-red-500 transition-colors font-medium">
                        Log out
                      </p>
                    </div>
                  </button>
                </div>
              </div>


            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

function SettingsItem({ icon, label, isVector }: { icon: string, label: string, isVector?: boolean }) {
  return (
    <div className="flex items-center justify-between py-[4px] cursor-pointer group">
      <div className="flex items-center gap-[8px]">
        <div className={cn("w-[24px] h-[24px]", isVector && "p-[3px]")}>
          <img src={icon} alt="" className="w-full h-full object-contain" />
        </div>
        <p className="font-regular text-[12px] text-[#6c6f85] leading-[18px] group-hover:text-[#9e77ed] transition-colors">
          {label}
        </p>
      </div>
      <div className="w-[20px] h-[20px]">
        <img src={imgVuesaxLinearArrowRight} alt="" className="w-full h-full opacity-50 group-hover:opacity-100 transition-opacity" />
      </div>
    </div>
  )
}
