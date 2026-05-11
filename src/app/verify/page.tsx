"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, Loader2 } from "lucide-react"

export default function VerifyPage() {
  const router = useRouter()
  const [timeLeft, setTimeLeft] = useState(300)
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

  useEffect(() => {
    if (timeLeft <= 0) return
    const timerId = setInterval(() => setTimeLeft((prev) => prev - 1), 1000)
    return () => clearInterval(timerId)
  }, [timeLeft])

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  const handleResendOtp = () => {
    setTimeLeft(300)
    alert("OTP baru telah dikirim!")
  }

  const handleVerify = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    const formData = new FormData(e.currentTarget)
    const otpValue = formData.get("otp") as string

    try {
      const res = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, otp: otpValue })
      })
      if (res.ok) {
        router.push('/create-profile')
      } else {
        const err = await res.json()
        alert(err.message)
      }
    } catch (error) {
      console.error("Gagal verifikasi:", error)
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
          <Link href="/register" className="inline-flex items-center text-sm font-semibold text-zinc-900 hover:text-zinc-600 mb-8 transition-colors">
            <ChevronLeft className="w-5 h-5 mr-1" strokeWidth={2.5} />
            Back
          </Link>

          <div className="space-y-2 mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Verify Email</h1>
            <p className="text-sm text-zinc-500 leading-relaxed">
              We already sent an OTP to <span className="font-bold text-zinc-800">{userEmail}</span>, input the OTP below before continue.
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleVerify}>
            <div className="space-y-3">
              <Input id="otp" name="otp" required placeholder="Please input your OTP" className="bg-[#f8f9fb] border-zinc-200 h-12 rounded-xl placeholder:text-zinc-400 focus-visible:ring-[#a87ffb]" />
              <p className="text-xs text-zinc-500 font-medium">
                OTP code will expire in <span className="font-bold text-zinc-900">{formatTime(timeLeft)}</span>
              </p>
            </div>
            <Button className="w-full bg-[#a87ffb] hover:bg-[#9261fa] text-white h-14 rounded-xl font-semibold text-base shadow-lg shadow-purple-200/50 transition-all active:scale-[0.98]" type="submit" disabled={isLoading}>
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify"}
            </Button>
          </form>

          <p className="text-center text-sm text-zinc-500 mt-6">
            Didn&apos;t receive the OTP,{" "}
            <button type="button" onClick={handleResendOtp} className="text-blue-500 hover:text-blue-600 font-medium hover:underline transition-colors">
              resend otp code
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}