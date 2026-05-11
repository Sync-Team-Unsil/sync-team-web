"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ChevronLeft, Loader2 } from "lucide-react"

export default function CreateProfilePage() {
  const router = useRouter()
  const [userEmail, setUserEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const savedEmail = localStorage.getItem("pendingVerificationEmail")
    if (savedEmail) {
      setUserEmail(savedEmail)
    } else {
      router.push("/register")
    }
  }, [router])

  const handleCreateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    const formData = new FormData(e.currentTarget)
    const bio = formData.get("bio") as string
    const role = formData.get("role") as string

    try {
      const res = await fetch('/api/create-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, bio, role })
      })
      if (res.ok) {
        localStorage.removeItem("pendingVerificationEmail")
        alert("Profil berhasil dibuat! Silakan Login.")
        router.push('/login')
      } else {
        const err = await res.json()
        alert(err.message)
      }
    } catch (error) {
      console.error("Gagal membuat profil:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full lg:grid lg:grid-cols-2 min-h-screen">
      <div className="relative hidden lg:flex flex-col justify-end overflow-hidden">
        <Image src="/hero-image.png" alt="Team collaboration" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />
        <div className="relative z-20 p-10 pb-12">
          <h2 className="text-3xl font-bold text-white mb-2">Lorem Ipsum Dolor Sit Amet</h2>
          <p className="text-zinc-300 max-w-md text-sm leading-relaxed">Lorem Ipsum is simply dummy text of the printing and typesetting industry.</p>
        </div>
      </div>

      <div className="flex items-center justify-center py-12 px-6 lg:px-12">
        <div className="w-full max-w-[440px]">
          <Link href="/verify" className="inline-flex items-center text-sm font-semibold text-zinc-900 hover:text-zinc-600 mb-8 transition-colors">
            <ChevronLeft className="w-5 h-5 mr-1" strokeWidth={2.5} />
            Back
          </Link>

          <div className="space-y-2 mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Create Profile</h1>
            <p className="text-sm text-zinc-500">Create a profile to tell people who you are</p>
          </div>

          <form className="space-y-5" onSubmit={handleCreateProfile}>
            <div className="space-y-2">
              <Label htmlFor="bio" className="text-sm font-semibold text-zinc-700">Bio</Label>
              <Input id="bio" name="bio" required placeholder="Please input your University" className="bg-[#f8f9fb] border-zinc-200 h-12 rounded-xl placeholder:text-zinc-400 focus-visible:ring-[#a87ffb]" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role" className="text-sm font-semibold text-zinc-700">Role</Label>
              <Input id="role" name="role" required placeholder="Please input your Skill" className="bg-[#f8f9fb] border-zinc-200 h-12 rounded-xl placeholder:text-zinc-400 focus-visible:ring-[#a87ffb]" />
            </div>

            <Button className="w-full bg-[#a87ffb] hover:bg-[#9261fa] text-white h-14 mt-4 rounded-xl font-semibold text-base shadow-lg shadow-purple-200/50 transition-all active:scale-[0.98]" type="submit" disabled={isLoading}>
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Profile"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}