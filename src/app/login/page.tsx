// src/app/login/page.tsx
"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const username = formData.get("username") as string // Ini bisa menangkap Email juga
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
        alert("Login Berhasil! Selamat Datang.")
        // Arahkan ke halaman utama atau dashboard setelah berhasil login
        router.push('/') 
      } else {
        const errorData = await response.json()
        alert(errorData.message)
      }
    } catch (error) {
      console.error("Gagal login:", error)
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
        <div className="mx-auto w-full max-w-[450px] space-y-8">
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-purple-500 mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                <path fillRule="evenodd" d="M14.615 1.595a.75.75 0 01.359.852L12.982 9.75h7.268a.75.75 0 01.548 1.262l-10.5 11.25a.75.75 0 01-1.272-.71l1.992-7.302H3.75a.75.75 0 01-.548-1.262l10.5-11.25a.75.75 0 01.913-.143z" clipRule="evenodd" />
              </svg>
              <span className="font-bold text-xl text-zinc-800">SyncTeam</span>
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">Welcome Back</h1>
            <p className="text-sm text-zinc-500">Please enter your username and password.</p>
          </div>

          <form className="space-y-4" onSubmit={handleLogin}>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" name="username" required placeholder="Please input your Username (atau Email)" className="bg-slate-50" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required placeholder="Please input your Password" className="bg-slate-50" />
            </div>

            <Button className="w-full bg-[#a87ffb] hover:bg-[#9261fa] text-white py-6 mt-6 rounded-lg font-medium text-md" type="submit">
              Login
            </Button>
          </form>

          <div className="text-center text-sm text-zinc-500">
            don&apos;t have an account,{" "}
            <Link href="/register" className="text-blue-500 hover:text-blue-600 font-medium hover:underline">
              register
            </Link>
          </div>

        </div>
      </div>
    </div>
  )
}