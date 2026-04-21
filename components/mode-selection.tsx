"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Rocket, TrendingUp, Sparkles, ArrowRight, CheckCircle2 } from "lucide-react"
import { useUserMode } from "@/context/UserModeContext"
import { useRouter } from "next/navigation"
import type { UserMode } from "@/types/analysis"

// ─── Card config ──────────────────────────────────────────────────────────────

const modes = [
  {
    id: "founder" as UserMode,
    icon: Rocket,
    label: "I'm a Founder",
    headline: "Validate & pitch your startup idea",
    description:
      "Use Gemini AI to get a full SWOT analysis, market sizing, competitor mapping, and viability score. Plus an ML-powered success predictor.",
    features: [
      "Gemini AI Idea Analysis",
      "ML Success Predictor",
      "Side-by-Side Comparison",
      "PDF Report Export",
    ],
    gradient: "from-purple-600 via-indigo-600 to-purple-700",
    cardBorder: "border-purple-500/40 hover:border-purple-400/70",
    cardBg: "hover:bg-purple-500/5",
    glowColor: "rgba(168,85,247,0.25)",
    badgeColor: "bg-purple-500/20 border-purple-500/40 text-purple-300",
    ctaGradient: "from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500",
    iconBg: "from-purple-500 to-indigo-600",
    checkColor: "text-purple-400",
    route: "/dashboard",
  },
  {
    id: "investor" as UserMode,
    icon: TrendingUp,
    label: "I'm an Investor",
    headline: "Discover high-potential startups",
    description:
      "Browse an AI-scored startup pipeline, filter by industry & stage, save deals, connect with founders — all with Gemini + ML data backing every decision.",
    features: [
      "AI-Scored Startup Feed",
      "Deal Flow Analytics",
      "Save & Like Startups",
      "Direct Founder Connect",
    ],
    gradient: "from-cyan-600 via-blue-600 to-cyan-700",
    cardBorder: "border-cyan-500/40 hover:border-cyan-400/70",
    cardBg: "hover:bg-cyan-500/5",
    glowColor: "rgba(6,182,212,0.25)",
    badgeColor: "bg-cyan-500/20 border-cyan-500/40 text-cyan-300",
    ctaGradient: "from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500",
    iconBg: "from-cyan-500 to-blue-600",
    checkColor: "text-cyan-400",
    route: "/investor-dashboard",
  },
]

// ─── Component ────────────────────────────────────────────────────────────────

export default function ModeSelection() {
  const { setMode } = useUserMode()
  const router = useRouter()
  const [selecting, setSelecting] = useState<UserMode | null>(null)

  const handleSelect = (modeId: UserMode, route: string) => {
    setSelecting(modeId)
    setMode(modeId)
    router.push(route)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col items-center justify-center px-4 py-16 relative overflow-hidden">
      {/* Animated bg orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse"
        style={{ animationDelay: "1.2s" }}
      />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-14 relative z-10"
      >
        {/* Logo mark */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-white tracking-tight">StartupPredictor</span>
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/60 text-xs mb-5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Powered by Google Gemini AI · ML Model
        </div>

        <h1 className="text-5xl md:text-6xl font-black text-white mb-4 leading-tight tracking-tight">
          Welcome. Who are{" "}
          <span className="bg-gradient-to-r from-purple-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent">
            you?
          </span>
        </h1>
        <p className="text-white/60 text-lg max-w-xl mx-auto leading-relaxed">
          Choose your role to get a personalized experience. You can switch anytime from the
          navigation.
        </p>
      </motion.div>

      {/* Cards */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="grid md:grid-cols-2 gap-6 w-full max-w-4xl relative z-10"
      >
        {modes.map((m, i) => {
          const Icon = m.icon
          const isLoading = selecting === m.id
          return (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 + i * 0.1 }}
              whileHover={{ y: -6, scale: 1.015 }}
              whileTap={{ scale: 0.985 }}
              className="group"
            >
              <button
                onClick={() => handleSelect(m.id, m.route)}
                disabled={selecting !== null}
                className={`w-full text-left rounded-3xl border ${m.cardBorder} bg-white/[0.03] ${m.cardBg} backdrop-blur-xl p-8 transition-all duration-300 relative overflow-hidden disabled:opacity-60 disabled:cursor-not-allowed`}
                style={{
                  boxShadow: `0 0 0 0 ${m.glowColor}`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = `0 0 60px -8px ${m.glowColor}`
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = `0 0 0 0 ${m.glowColor}`
                }}
              >
                {/* Top border glow line */}
                <div
                  className={`absolute top-0 left-8 right-8 h-px bg-gradient-to-r ${m.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                />

                {/* Badge */}
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-medium mb-5 ${m.badgeColor}`}>
                  <Icon className="w-3.5 h-3.5" />
                  {m.label}
                </div>

                {/* Icon + headline */}
                <div className="flex items-start gap-4 mb-5">
                  <div
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${m.iconBg} flex items-center justify-center shadow-lg flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white leading-tight">{m.headline}</h2>
                  </div>
                </div>

                {/* Description */}
                <p className="text-white/55 text-sm leading-relaxed mb-6">{m.description}</p>

                {/* Features list */}
                <ul className="space-y-2 mb-8">
                  {m.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5">
                      <CheckCircle2 className={`w-4 h-4 flex-shrink-0 ${m.checkColor}`} />
                      <span className="text-white/70 text-sm">{f}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <div
                  className={`w-full py-3.5 rounded-xl bg-gradient-to-r ${m.ctaGradient} text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 shadow-lg`}
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Get Started
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </div>
              </button>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Footer note */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mt-10 text-white/30 text-xs text-center relative z-10"
      >
        No sign-up required · Switch modes anytime · All data stays in your browser
      </motion.p>
    </div>
  )
}
