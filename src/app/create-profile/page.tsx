// src/app/create-profile/page.tsx
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ChevronLeft } from "lucide-react"

export default function CreateProfilePage() {
  const router = useRouter()
  const [userEmail, setUserEmail] = useState("")

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
    const formData = new FormData(e.currentTarget)
    const bio = formData.get("bio") as string
    const role = formData.get("role") as string

    try {
      const response = await fetch('/api/create-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, bio, role })
      })

      if (response.ok) {
        // Sekarang memori email boleh dihapus karena alur pendaftaran selesai utuh
        localStorage.removeItem("pendingVerificationEmail")
        alert("Profil berhasil dibuat! Silakan Login.")
        router.push('/login')
      } else {
        const errorData = await response.json()
        alert(errorData.message)
      }
    } catch (error) {
      console.error("Gagal membuat profil:", error)
    }
  }

  return (
    <div className="w-full lg:grid lg:grid-cols-2 min-h-screen">
      <div className="relative hidden lg:flex flex-col justify-end bg-zinc-900 text-white p-10 bg-cover bg-center" style={{ backgroundImage: "url('/placeholder-image.jpg')" }}>
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative z-20">
          <h2 className="text-3xl font-bold mb-2">Lorem Ipsum Dolor Sit Amet</h2>
          <p className="text-zinc-300 max-w-md">Lorem Ipsum is simply dummy text.</p>
        </div>
      </div>

      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-[450px]">
          <Link href="/verify" className="inline-flex items-center text-sm font-semibold text-zinc-900 hover:text-zinc-600 mb-8">
            <ChevronLeft className="w-4 h-4 mr-1" strokeWidth={2.5} />
            Back
          </Link>

          <div className="space-y-2 mb-8">
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">Create Profile</h1>
            <p className="text-sm text-zinc-500">Create a profile to tell people who you are</p>
          </div>

          <form className="space-y-4" onSubmit={handleCreateProfile}>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Input id="bio" name="bio" required placeholder="Please input your University" className="bg-slate-50" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Input id="role" name="role" required placeholder="Please input your Skill" className="bg-slate-50" />
            </div>

            <Button className="w-full bg-[#a87ffb] hover:bg-[#9261fa] text-white py-6 mt-6 rounded-lg font-medium text-md" type="submit">
              Create Profile
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}