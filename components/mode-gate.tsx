"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUserMode } from "@/context/UserModeContext"
import LandingPage from "@/components/landing-page"
import ModeSelection from "@/components/mode-selection"

/**
 * ModeGate — renders at /
 * - Not loaded yet  → blank screen (avoids flash)
 * - mode === null   → ModeSelection screen
 * - mode === "founder" → existing LandingPage (unchanged)
 * - mode === "investor" → redirect to /investor-dashboard
 */
export default function ModeGate() {
  const { mode, isLoaded } = useUserMode()
  const router = useRouter()

  useEffect(() => {
    if (isLoaded && mode === "investor") {
      router.replace("/investor-dashboard")
    }
  }, [isLoaded, mode, router])

  if (!isLoaded) {
    // Avoid flash of wrong content during hydration
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-purple-500/30 border-t-purple-500 animate-spin" />
      </div>
    )
  }

  if (mode === null) {
    return <ModeSelection />
  }

  if (mode === "investor") {
    // Will redirect via useEffect above; show nothing
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-cyan-500/30 border-t-cyan-500 animate-spin" />
      </div>
    )
  }

  // founder mode — render existing landing page, unchanged
  return <LandingPage />
}
