"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"

export default function VerifyPage() {
  const router = useRouter()
  const [timeLeft, setTimeLeft] = useState(300)
  const [userEmail, setUserEmail] = useState("")

  // Mengambil email dari Local Storage saat halaman pertama kali dimuat
  useEffect(() => {
    const savedEmail = localStorage.getItem("pendingVerificationEmail")
    if (savedEmail) {
      setUserEmail(savedEmail)
    } else {
      // Jika tidak ada email (orang iseng langsung buka /verify), lempar ke register
      router.push("/register")
    }
  }, [router])

  useEffect(() => {
    if (timeLeft <= 0) return
    const timerId = setInterval(() => setTimeLeft((prev) => prev - 1), 1000)
    return () => clearInterval(timerId)
  }, [timeLeft])

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`
  }

  // Menangani tombol submit OTP
  const handleVerify = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    const formData = new FormData(e.currentTarget)
    const otpValue = formData.get("otp") as string

    try {
      const response = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, otp: otpValue })
      })

      if (response.ok) {
        // Hapus memori email karena proses verifikasi sudah selesai
        // localStorage.removeItem("pendingVerificationEmail")
        alert("Verifikasi Berhasil! Silakan Login.")
        router.push('/create-profile') // Arahkan ke halaman login (jika sudah ada)
      } else {
        const errorData = await response.json()
        alert(errorData.message) // Memunculkan "OTP Salah!"
      }
    } catch (error) {
      console.error("Gagal verifikasi:", error)
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

      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-[450px]">
          
          <Link href="/register" className="inline-flex items-center text-sm font-semibold text-zinc-900 hover:text-zinc-600 mb-8">
            <ChevronLeft className="w-4 h-4 mr-1" strokeWidth={2.5} />
            Back
          </Link>

          <div className="space-y-2 mb-8">
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">Verify Email</h1>
            <p className="text-sm text-zinc-500 leading-relaxed">
              {/* Menampilkan email dinamis */}
              We already sent an OTP to <span className="font-bold text-zinc-800">{userEmail}</span>, input the OTP below before continue.
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleVerify}>
            <div className="space-y-3">
              <Input 
                id="otp" 
                name="otp" // Wajib ada agar dikenali FormData
                required
                placeholder="Please input your OTP (Ketikan: 123456)" 
                className="bg-slate-50 py-6 placeholder:text-zinc-400" 
              />
              <p className="text-xs text-zinc-500 font-medium">
                OTP code will expire in <span className="font-bold text-zinc-900">{formatTime(timeLeft)}</span>
              </p>
            </div>

            <Button className="w-full bg-[#a87ffb] hover:bg-[#9261fa] text-white py-6 rounded-lg font-medium text-md" type="submit">
              Verify
            </Button>
          </form>

        </div>
      </div>
    </div>
  )
}