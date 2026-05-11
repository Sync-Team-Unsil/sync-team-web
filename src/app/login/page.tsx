// src/app/login/page.tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    const formData = new FormData(e.currentTarget)
    const username = formData.get("username") as string
    const password = formData.get("password") as string

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })

      if (response.ok) {
        const responseData = await response.json()
        localStorage.setItem("userSession", JSON.stringify(responseData.user))
        router.push('/')
      } else {
        const errorData = await response.json()
        alert(errorData.message)
      }
    } catch (error) {
      console.error("Gagal login:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full lg:grid lg:grid-cols-2 min-h-screen">
      {/* LEFT: Hero Image */}
      <div className="relative hidden lg:flex flex-col justify-end overflow-hidden">
        <Image
          src="/hero-image.png"
          alt="Team collaboration"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />
        <div className="relative z-20 p-10 pb-12">
          <h2 className="text-3xl font-bold text-white mb-2 leading-tight">
            Lorem Ipsum Dolor Sit Amet
          </h2>
          <p className="text-zinc-300 max-w-md text-sm leading-relaxed">
            Lorem Ipsum is simply dummy text of the printing and typesetting industry.
          </p>
        </div>
      </div>

      {/* RIGHT: Login Form */}
      <div className="flex items-center justify-center py-12 px-6 lg:px-12">
        <div className="w-full max-w-[440px] space-y-8">

          {/* Logo */}
          <div className="flex items-center gap-2 mb-2">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13 2L4.09 12.36a1 1 0 00.76 1.64H11l-1 8 8.91-10.36a1 1 0 00-.76-1.64H13l1-8z" fill="#a87ffb" stroke="#a87ffb" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="font-bold text-lg text-[#a87ffb]">SyncTeam</span>
          </div>

          {/* Heading */}
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Welcome Back</h1>
            <p className="text-sm text-zinc-500">Please enter your username and password.</p>
          </div>

          {/* Form */}
          <form className="space-y-5" onSubmit={handleLogin}>
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-semibold text-zinc-700">Username</Label>
              <Input
                id="username"
                name="username"
                required
                placeholder="Please input your Username"
                className="bg-[#f8f9fb] border-zinc-200 h-12 rounded-xl placeholder:text-zinc-400 focus-visible:ring-[#a87ffb]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold text-zinc-700">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                placeholder="Please input your Password"
                className="bg-[#f8f9fb] border-zinc-200 h-12 rounded-xl placeholder:text-zinc-400 focus-visible:ring-[#a87ffb]"
              />
            </div>

            <Button
              className="w-full bg-[#a87ffb] hover:bg-[#9261fa] text-white h-14 mt-4 rounded-xl font-semibold text-base shadow-lg shadow-purple-200/50 transition-all active:scale-[0.98]"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Login"}
            </Button>
          </form>

          {/* Footer Link */}
          <p className="text-center text-sm text-zinc-500">
            don&apos;t have an account,{" "}
            <Link href="/register" className="text-blue-500 hover:text-blue-600 font-medium hover:underline transition-colors">
              register
            </Link>
          </p>

        </div>
      </div>
    </div>
  )
}