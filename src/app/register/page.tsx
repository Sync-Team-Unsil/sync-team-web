"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function RegisterPage() {
  const router = useRouter()

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    // 1. Ambil semua data dari Form
    const formData = new FormData(e.currentTarget)
    const username = formData.get("username") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const confirmPassword = formData.get("confirmPassword") as string

    // Validasi sederhana di Frontend
    if (password !== confirmPassword) {
      alert("Password dan Confirm Password tidak cocok!")
      return
    }

    try {
      // 2. Tembak API Dummy kita
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      })

      if (response.ok) {
        // 3. Simpan email sementara di Local Storage sebagai "jembatan" ke halaman Verify
        localStorage.setItem("pendingVerificationEmail", email)
        
        // 4. Pindah ke halaman Verify
        router.push('/verify')
      } else {
        const errorData = await response.json()
        alert(errorData.message) // Memunculkan "Email sudah digunakan!"
      }
    } catch (error) {
      console.error("Gagal mendaftar:", error)
    }
  }

  return (
    <div className="w-full lg:grid lg:grid-cols-2 min-h-screen">
      {/* ... BAGIAN KIRI (Gambar) TETAP SAMA ... */}
      <div className="relative hidden lg:flex flex-col justify-end bg-zinc-900 text-white p-10 bg-cover bg-center" style={{ backgroundImage: "url('/placeholder-image.jpg')" }}>
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative z-20">
          <h2 className="text-3xl font-bold mb-2">Lorem Ipsum Dolor Sit Amet</h2>
          <p className="text-zinc-300 max-w-md">Lorem Ipsum is simply dummy text.</p>
        </div>
      </div>

      {/* BAGIAN KANAN */}
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-[450px] space-y-8">
          
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">Welcome to SyncTeam</h1>
            <p className="text-sm text-zinc-500">Create an account for using sync team.</p>
          </div>

          {/* Form diubah dengan onSubmit dan penambahan 'name' pada Input */}
          <form className="space-y-4" onSubmit={handleRegister}>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" name="firstName" required placeholder="First name" className="bg-slate-50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" name="lastName" required placeholder="Last name" className="bg-slate-50" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" name="username" required placeholder="Please input your Username" className="bg-slate-50" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required placeholder="Please input your Email" className="bg-slate-50" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required placeholder="Please input your Password" className="bg-slate-50" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input id="confirmPassword" name="confirmPassword" type="password" required placeholder="Please input your Password again" className="bg-slate-50" />
            </div>

            <Button className="w-full bg-[#a87ffb] hover:bg-[#9261fa] text-white py-6 mt-6 rounded-lg font-medium text-md" type="submit">
              Register
            </Button>
          </form>

          <div className="text-center text-sm text-zinc-500 pt-4">
            already have account,{" "}
            <Link href="/login" className="text-blue-500 hover:text-blue-600 font-medium hover:underline transition-colors">
              login
            </Link>
          </div>

        </div>
      </div>
    </div>
  )
}