"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { useUserMode } from "@/context/UserModeContext"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"
import {
  Bookmark, Heart, Users, Eye, Search, SlidersHorizontal,
  TrendingUp, AlertTriangle, Star, CheckCircle2, X, ChevronDown,
  Loader2, Sparkles, BarChart3, Building2, Zap, ArrowUpRight, Play, Video,
  ArrowUp, ArrowDown, Flame, Briefcase, PlusCircle, Activity
} from "lucide-react"
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// ─── Types ────────────────────────────────────────────────────────────────────

interface Startup {
  id: string
  name: string
  founder: string
  photo_url: string
  industry: string
  stage: string
  pitch: string
  market_size: string
  traction: string
  team_size: number
  revenue_status: string
  monthly_growth: string
  score: number
  risk_level: "Low" | "Medium" | "High"
  ai_recommendation: string
  verified: boolean
  likes: number
  is_saved: boolean
  is_liked: boolean
  is_connected: boolean
  confidence_score: number
  burn_rate: string
  founder_experience: string
  previous_startups: number
  credibility_score: number
  is_trending: boolean
  strengths: string
  red_flags: string
  why_score_reasons: string
  pipeline_stage?: string
}

interface DashboardStats {
  total_startups: number
  avg_score: number
  high_risk_count: number
  low_risk_count: number
  saved_count: number
  liked_count: number
  connected_count: number
  industry_distribution: { name: string; value: number }[]
  avg_score_by_industry: { industry: string; avgScore: number }[]
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STAGES = ["All", "Pre-seed", "Seed", "Series A", "Series B"]
const RISKS = ["All", "Low", "Medium", "High"]
const CHART_COLORS = ["#a855f7", "#6366f1", "#22d3ee", "#34d399", "#f59e0b", "#f43f5e", "#8b5cf6", "#3b82f6"]

function scoreColor(score: number) {
  if (score >= 85) return "text-emerald-400"
  if (score >= 70) return "text-purple-400"
  if (score >= 55) return "text-amber-400"
  return "text-red-400"
}

function scoreGradient(score: number) {
  if (score >= 85) return "from-emerald-500 to-teal-500"
  if (score >= 70) return "from-purple-500 to-indigo-500"
  if (score >= 55) return "from-amber-500 to-orange-500"
  return "from-red-500 to-rose-500"
}

function riskBadge(risk: string) {
  if (risk === "Low") return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
  if (risk === "Medium") return "bg-amber-500/15 text-amber-400 border-amber-500/30"
  return "bg-red-500/15 text-red-400 border-red-500/30"
}

// ─── Action button ─────────────────────────────────────────────────────────

interface ActionState {
  loading: boolean
}

// ─── Startup Detail Modal ─────────────────────────────────────────────────────

function StartupModal({
  startup,
  onClose,
  onSave,
  onLike,
  onConnect,
}: {
  startup: Startup
  onClose: () => void
  onSave: () => void
  onLike: () => void
  onConnect: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-xl rounded-3xl border border-white/10 bg-slate-900/95 backdrop-blur-2xl p-6 shadow-2xl overflow-y-auto max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl hover:bg-white/10 text-white/50 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-start gap-4 mb-5">
          <Avatar className="h-14 w-14 flex-shrink-0">
            <AvatarImage src={startup.photo_url} />
            <AvatarFallback className="bg-purple-500/20 text-purple-300 text-lg font-bold">
              {startup.name[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold text-white">{startup.name}</h2>
              {startup.verified && (
                <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
              )}
            </div>
            <p className="text-white/50 text-sm">{startup.founder} · {startup.industry}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300">{startup.stage}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full border ${riskBadge(startup.risk_level)}`}>{startup.risk_level} Risk</span>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <div className={`text-3xl font-black ${scoreColor(startup.score)}`}>{startup.score}</div>
            <div className="text-[10px] text-white/40 uppercase tracking-wider">AI Score</div>
          </div>
        </div>

        {/* Pitch */}
        <div className="rounded-xl bg-white/5 border border-white/8 p-4 mb-4">
          <p className="text-white/70 text-sm leading-relaxed">{startup.pitch}</p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: "Market Size", value: startup.market_size },
            { label: "Traction", value: startup.traction },
            { label: "Team Size", value: `${startup.team_size} people` },
            { label: "Revenue", value: startup.revenue_status },
            { label: "Monthly Growth", value: startup.monthly_growth },
            { label: "Likes", value: String(startup.likes) },
          ].map((m) => (
            <div key={m.label} className="rounded-xl bg-white/[0.04] border border-white/8 p-3 text-center">
              <div className="text-[10px] text-white/40 uppercase tracking-wider mb-1">{m.label}</div>
              <div className="text-sm font-semibold text-white truncate">{m.value}</div>
            </div>
          ))}
        </div>

        {/* AI Rec */}
        <div className="rounded-xl border border-purple-500/25 bg-purple-500/8 p-4 mb-5">
          <div className="flex items-center gap-2 mb-2 text-purple-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            AI Recommendation
          </div>
          <p className="text-white/75 text-sm leading-relaxed">{startup.ai_recommendation}</p>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={onSave}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
              startup.is_saved
                ? "bg-indigo-500/20 border-indigo-500/40 text-indigo-300"
                : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            {startup.is_saved ? "Saved" : "Save"}
          </button>
          <button
            onClick={onLike}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
              startup.is_liked
                ? "bg-pink-500/20 border-pink-500/40 text-pink-300"
                : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"
            }`}
          >
            <Heart className="w-3.5 h-3.5" />
            {startup.likes}
          </button>
          <button
            onClick={onConnect}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
              startup.is_connected
                ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                : "bg-cyan-500/15 border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/25"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            {startup.is_connected ? "Requested" : "Connect"}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

// ─── Startup Card ─────────────────────────────────────────────────────────────

function StartupCard({
  startup,
  onView,
  onSave,
  onLike,
  onConnect,
  onWatchVideo,
  onAddToPipeline,
  loadingActions,
}: {
  startup: Startup
  onView: () => void
  onSave: () => void
  onLike: () => void
  onConnect: () => void
  onWatchVideo: () => void
  onAddToPipeline: () => void
  loadingActions: Record<string, boolean>
}) {
  const isTopPick = startup.score >= 90;
  const isHot = startup.is_trending;
  const inPipeline = !!startup.pipeline_stage;
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25 }}
      className={`group rounded-2xl border bg-slate-900/40 backdrop-blur-xl p-5 flex flex-col gap-4 transition-all duration-300 hover:shadow-xl ${
        isTopPick 
        ? "border-cyan-500/40 shadow-[0_0_15px_rgba(34,211,238,0.1)] hover:border-cyan-400/60" 
        : "border-white/10 hover:border-purple-500/30"
      }`}
    >
      {/* Top Badges */}
      <div className="absolute -top-3 -right-3 flex gap-2">
        {isTopPick && (
          <span className="flex items-center gap-1 bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md shadow-lg relative z-10">
            <Sparkles className="w-3 h-3" /> Top Pick
          </span>
        )}
        {isHot && (
          <span className="flex items-center gap-1 bg-orange-500/20 text-orange-400 border border-orange-500/50 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md shadow-lg relative z-10 animate-pulse">
            <Flame className="w-3 h-3" /> Hot
          </span>
        )}
      </div>

      {/* 1. SIGNAL LAYER */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
           <div className="text-center relative">
             <div className={`text-3xl font-black ${scoreColor(startup.score)} leading-none drop-shadow-md`}>{startup.score}</div>
             <div className="text-[9px] text-white/40 uppercase font-medium mt-1">AI Score</div>
           </div>
           <div className="h-10 w-px bg-white/10 mx-1" />
           <div className="flex flex-col gap-1">
             <div className="flex items-center gap-2">
               <span className={`text-[10px] px-2 py-0.5 rounded-sm border ${riskBadge(startup.risk_level)} font-medium`}>{startup.risk_level} Risk</span>
               <span className="text-[10px] px-2 py-0.5 rounded-sm bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 font-medium">{startup.stage}</span>
             </div>
             <div className="flex items-center gap-1.5 text-xs font-semibold text-white/80">
                Confidence: <span className={startup.confidence_score > 80 ? "text-emerald-400" : "text-amber-400"}>{startup.confidence_score}%</span>
                {startup.confidence_score > startup.score ? <ArrowUp className="w-3 h-3 text-emerald-400" /> : <ArrowDown className="w-3 h-3 text-amber-400" />}
             </div>
           </div>
        </div>
      </div>

      {/* 2. PITCH EXPERIENCE & FOUNDER */}
      <div className="flex gap-4">
        <div 
          onClick={onWatchVideo}
          className="relative w-24 h-24 rounded-xl flex-shrink-0 border border-white/10 bg-slate-800 overflow-hidden cursor-pointer group/vid"
        >
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542435503-956c26600c5d?auto=format&fit=crop&q=80&w=400')] bg-cover opacity-50 group-hover/vid:opacity-60 transition-opacity mix-blend-overlay" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Play className="w-8 h-8 text-cyan-400 fill-current opacity-80 group-hover/vid:scale-110 transition-transform" />
          </div>
          <div className="absolute bottom-1 left-0 right-0 text-center text-[9px] font-bold text-white bg-black/60 py-0.5">Watch Pitch</div>
        </div>
        
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-white truncate text-lg leading-none">{startup.name}</h3>
            {startup.verified && <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />}
          </div>
          <p className="text-white/60 text-xs line-clamp-2 leading-snug mb-2">{startup.pitch}</p>
          <div className="flex items-center gap-2 text-xs">
            <Avatar className="h-5 w-5 border border-white/10">
              <AvatarImage src={startup.photo_url} />
              <AvatarFallback className="text-[8px]">{startup.founder[0]}</AvatarFallback>
            </Avatar>
            <span className="text-white/80 truncate font-medium">{startup.founder}</span>
          </div>
        </div>
      </div>

      {/* FOUNDER INTELLIGENCE */}
      <div className="flex items-center justify-between text-[10px] text-white/50 bg-white/[0.02] py-1.5 px-3 rounded-lg border border-white/5">
        <span className="flex items-center gap-1.5"><Briefcase className="w-3 h-3 text-cyan-500" /> {startup.founder_experience}</span>
        <span>{startup.previous_startups} Exits</span>
        <span>Cred: <span className="text-white font-semibold">{startup.credibility_score}/100</span></span>
      </div>

      {/* 3. INVESTMENT SNAPSHOT */}
      <div className="grid grid-cols-4 gap-2 text-center">
        <div className="rounded-lg bg-white/[0.03] border border-white/5 p-2">
          <div className="text-[9px] text-white/40 uppercase mb-0.5">Market</div>
          <div className="text-xs font-bold text-white truncate">{startup.market_size}</div>
        </div>
        <div className="rounded-lg bg-white/[0.03] border border-white/5 p-2">
          <div className="text-[9px] text-white/40 uppercase mb-0.5">Traction</div>
          <div className="text-xs font-bold text-white truncate">{startup.traction}</div>
        </div>
        <div className="rounded-lg bg-white/[0.03] border border-white/5 p-2">
          <div className="text-[9px] text-white/40 uppercase mb-0.5">Growth</div>
          <div className="text-xs font-bold text-emerald-400 truncate">+{startup.monthly_growth}</div>
        </div>
        <div className="rounded-lg bg-white/[0.03] border border-white/5 p-2">
          <div className="text-[9px] text-white/40 uppercase mb-0.5">Burn</div>
          <div className="text-xs font-bold text-pink-400 truncate">{startup.burn_rate}</div>
        </div>
      </div>

      {/* 4. AI BREAKDOWN */}
      <div className="flex-1 rounded-xl bg-purple-500/5 border border-purple-500/10 p-3 flex flex-col gap-2">
        <div className="flex items-center gap-1.5 text-purple-300 text-[10px] uppercase font-bold tracking-widest">
          <Activity className="w-3.5 h-3.5" /> AI Target Analysis
        </div>
        <ul className="text-white/70 text-xs space-y-1 pl-4 list-disc marker:text-purple-500/50">
          {startup.why_score_reasons.split('|').map((reason, i) => (
             <li key={i} className="line-clamp-1">{reason}</li>
          ))}
        </ul>
        <div className="flex gap-4 mt-auto pt-1">
           <div className="flex-1">
             <span className="text-[9px] text-emerald-400/80 uppercase font-bold block mb-0.5">Strengths</span>
             <p className="text-[10px] text-white/60 line-clamp-1">{startup.strengths.split('|').join(', ')}</p>
           </div>
           <div className="flex-1">
             <span className="text-[9px] text-pink-400/80 uppercase font-bold block mb-0.5">Red Flags</span>
             <p className="text-[10px] text-white/60 line-clamp-1">{startup.red_flags.split('|').join(', ')}</p>
           </div>
        </div>
      </div>

      {/* 5. DECISION ACTIONS */}
      <div className="grid grid-cols-4 gap-2 mt-auto">
        <button
          onClick={onAddToPipeline}
          disabled={loadingActions[`pipeline-${startup.id}`] || inPipeline}
          className={`col-span-2 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold border transition-all ${
            inPipeline
              ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
              : "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-cyan-500/40 text-cyan-300 hover:from-cyan-500/30 hover:to-blue-500/30"
          }`}
        >
          {loadingActions[`pipeline-${startup.id}`] ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />}
          {inPipeline ? startup.pipeline_stage : "Deal Pipeline"}
        </button>
        
        <button
          onClick={onSave}
          disabled={loadingActions[`save-${startup.id}`]}
          className={`flex items-center justify-center py-2 rounded-xl border transition-all ${
            startup.is_saved ? "bg-indigo-500/20 border-indigo-500/40 text-indigo-300" : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
          }`}
        >
          {loadingActions[`save-${startup.id}`] ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bookmark className={`w-4 h-4 ${startup.is_saved ? "fill-current" : ""}`} />}
        </button>

        <button
          onClick={onView}
          className="flex items-center justify-center py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white transition-all"
        >
          <Eye className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  )
}

// ─── KPI Card ────────────────────────────────────────────────────────────────

function KpiCard({ icon: Icon, label, value, sub, color }: {
  icon: React.ElementType; label: string; value: string | number; sub: string; color: string
}) {
  return (
    <div className={`rounded-2xl border ${color} bg-white/[0.04] backdrop-blur-xl p-5 flex flex-col gap-3`}>
      <div className="flex items-center justify-between">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color.replace("border-", "bg-").replace("/30", "/15")}`}>
          <Icon className="w-4.5 h-4.5" />
        </div>
        <ArrowUpRight className="w-4 h-4 text-white/20" />
      </div>
      <div>
        <div className="text-2xl font-black text-white">{value}</div>
        <div className="text-white/50 text-xs mt-0.5">{label}</div>
      </div>
      <div className="text-xs text-white/35">{sub}</div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function InvestorDashboardPage() {
  const { investorId } = useUserMode()

  // Data state
  const [startups, setStartups] = useState<Startup[]>([])
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingActions, setLoadingActions] = useState<Record<string, boolean>>({})

  // Filters
  const [search, setSearch] = useState("")
  const [selectedStage, setSelectedStage] = useState("All")
  const [selectedRisk, setSelectedRisk] = useState("All")
  const [minScore, setMinScore] = useState(0)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [sortBy, setSortBy] = useState("Highest Score")
  const SORT_OPTIONS = ["Highest Score", "Most Liked", "Recently Added"]

  // UI state
  const [selectedStartup, setSelectedStartup] = useState<Startup | null>(null)
  const [activeTab, setActiveTab] = useState<"feed" | "analytics">("feed")
  const [videoModalOpen, setVideoModalOpen] = useState(false)

  // ─── Fetch startups ──────────────────────────────────────────────────────────

  const fetchStartups = useCallback(async () => {
    if (!investorId) return
    setLoading(true)
    try {
      const params = new URLSearchParams({ investor_id: investorId })
      if (search) params.set("search", search)
      if (selectedStage !== "All") params.set("stage", selectedStage)
      if (selectedRisk !== "All") params.set("risk", selectedRisk)
      if (minScore > 0) params.set("minScore", String(minScore))

      const res = await fetch(`/api/investor/startups?${params}`)
      if (!res.ok) throw new Error("Failed to fetch startups")
      const data = await res.json()
      setStartups(data)
    } catch {
      toast.error("Failed to load startup feed")
    } finally {
      setLoading(false)
    }
  }, [investorId, search, selectedStage, selectedRisk, minScore])

  // ─── Fetch stats ─────────────────────────────────────────────────────────────

  const fetchStats = useCallback(async () => {
    if (!investorId) return
    try {
      const res = await fetch(`/api/investor/stats?investor_id=${investorId}`)
      if (!res.ok) return
      const data = await res.json()
      setStats(data)
    } catch {
      // silently fail stats
    }
  }, [investorId])

  useEffect(() => {
    if (investorId) {
      fetchStartups()
      fetchStats()
    }
  }, [fetchStartups, fetchStats, investorId])

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => { if (investorId) fetchStartups() }, 400)
    return () => clearTimeout(t)
  }, [search, selectedStage, selectedRisk, minScore, fetchStartups, investorId])

  // ─── Derived state ───────────────────────────────────────────────────────────
  const sortedStartups = useMemo(() => {
    let sorted = [...startups]
    if (sortBy === "Highest Score") sorted.sort((a, b) => b.score - a.score)
    else if (sortBy === "Most Liked") sorted.sort((a, b) => b.likes - a.likes)
    else if (sortBy === "Recently Added") sorted.sort((a, b) => b.id.localeCompare(a.id))
    return sorted
  }, [startups, sortBy])

  // ─── Actions ─────────────────────────────────────────────────────────────────

  const setActionLoading = (key: string, val: boolean) =>
    setLoadingActions((prev) => ({ ...prev, [key]: val }))

  const handleSave = async (startup: Startup) => {
    if (!investorId) return
    const key = `save-${startup.id}`
    setActionLoading(key, true)
    try {
      const res = await fetch("/api/investor/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ investor_id: investorId, startup_id: startup.id }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setStartups((prev) => prev.map((s) => s.id === startup.id ? { ...s, is_saved: data.saved } : s))
      if (selectedStartup?.id === startup.id) setSelectedStartup((p) => p ? { ...p, is_saved: data.saved } : p)
      toast.success(data.message, { icon: data.saved ? "🔖" : "✕" })
      fetchStats()
    } catch {
      toast.error("Failed to save. Is the ML service running?")
    } finally {
      setActionLoading(key, false)
    }
  }

  const handleLike = async (startup: Startup) => {
    if (!investorId) return
    const key = `like-${startup.id}`
    setActionLoading(key, true)
    try {
      const res = await fetch("/api/investor/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ investor_id: investorId, startup_id: startup.id }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setStartups((prev) => prev.map((s) =>
        s.id === startup.id ? { ...s, is_liked: data.liked, likes: data.likes } : s
      ))
      if (selectedStartup?.id === startup.id) setSelectedStartup((p) => p ? { ...p, is_liked: data.liked, likes: data.likes } : p)
      toast.success(data.message, { icon: data.liked ? "❤️" : "🤍" })
    } catch {
      toast.error("Failed to like. Is the ML service running?")
    } finally {
      setActionLoading(key, false)
    }
  }

  const handleConnect = async (startup: Startup) => {
    if (!investorId || startup.is_connected) return
    const key = `connect-${startup.id}`
    setActionLoading(key, true)
    try {
      const res = await fetch("/api/investor/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ investor_id: investorId, startup_id: startup.id }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setStartups((prev) => prev.map((s) => s.id === startup.id ? { ...s, is_connected: true } : s))
      if (selectedStartup?.id === startup.id) setSelectedStartup((p) => p ? { ...p, is_connected: true } : p)
      toast.success(data.message, { icon: "🤝", duration: 4000 })
      fetchStats()
    } catch {
      toast.error("Connection failed. Is the ML service running?")
    } finally {
      setActionLoading(key, false)
    }
  }

  const handlePipelineStage = async (startup: Startup, stage: string) => {
    if (!investorId) return
    const key = `pipeline-${startup.id}`
    setActionLoading(key, true)
    try {
      const res = await fetch("/api/investor/pipeline/update-stage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ investor_id: investorId, startup_id: startup.id, stage }),
      })
      if (!res.ok) throw new Error("Failed to update pipeline")
      const data = await res.json()
      setStartups((prev) => prev.map((s) => s.id === startup.id ? { ...s, pipeline_stage: stage === "Remove" ? undefined : stage } : s))
      if (selectedStartup?.id === startup.id) setSelectedStartup((p) => p ? { ...p, pipeline_stage: stage === "Remove" ? undefined : stage } : p)
      toast.success(data.message)
    } catch {
      toast.error("Failed to update pipeline")
    } finally {
      setActionLoading(key, false)
    }
  }

  // ─── Render ───────────────────────────────────────────────────────────────────

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ── Page Header ───────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-white mb-1">
              Investor{" "}
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Hub
              </span>
            </h1>
            <p className="text-white/50 text-sm">
              {loading ? "Loading startup pipeline…" : `${startups.length} startups · AI scored & ML ranked`}
            </p>
          </div>

          {/* Tab switcher */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-white/5 border border-white/10">
            {(["feed", "analytics"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                  activeTab === tab
                    ? "bg-cyan-500/20 border border-cyan-500/40 text-cyan-300"
                    : "text-white/50 hover:text-white"
                }`}
              >
                {tab === "feed" ? <><Zap className="w-3.5 h-3.5 inline mr-1.5" />Feed</> : <><BarChart3 className="w-3.5 h-3.5 inline mr-1.5" />Analytics</>}
              </button>
            ))}
          </div>
        </div>

        {/* ── KPI Row (always visible) ───────────────────────────────────────── */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard icon={Building2} label="Startups in Pipeline" value={stats.total_startups} sub="AI scored & filtered" color="border-purple-500/30" />
            <KpiCard icon={Star} label="Avg AI Score" value={`${stats.avg_score}/100`} sub="Across all startups" color="border-cyan-500/30" />
            <KpiCard icon={Bookmark} label="Saved by You" value={stats.saved_count} sub="In your watchlist" color="border-indigo-500/30" />
            <KpiCard icon={AlertTriangle} label="High Risk" value={stats.high_risk_count} sub="Require more scrutiny" color="border-amber-500/30" />
          </div>
        )}

        {/* ── Feed Tab ──────────────────────────────────────────────────────── */}
        {activeTab === "feed" && (
          <>
            {/* Search + Filter bar */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="text"
                  placeholder="Search by name, founder, or keyword…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 h-11 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-cyan-500/50 focus:bg-cyan-500/5 transition-all"
                />
              </div>

              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none h-11 px-4 pr-10 rounded-xl border bg-white/5 border-white/10 text-white/80 text-sm font-medium focus:outline-none focus:border-cyan-500/50 cursor-pointer"
                >
                  {SORT_OPTIONS.map(opt => <option key={opt} value={opt} className="bg-slate-900 text-white">{opt}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50 pointer-events-none" />
              </div>

              <button
                onClick={() => setFiltersOpen(!filtersOpen)}
                className={`flex items-center gap-2 px-4 h-11 rounded-xl border text-sm font-medium transition-all ${
                  filtersOpen ? "bg-cyan-500/15 border-cyan-500/40 text-cyan-300" : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
                {(selectedStage !== "All" || selectedRisk !== "All" || minScore > 0) && (
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                )}
              </button>
            </div>

            {/* Filter panel */}
            <AnimatePresence>
              {filtersOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Stage */}
                    <div>
                      <label className="text-xs text-white/40 mb-2 block uppercase tracking-wider">Stage</label>
                      <div className="flex flex-wrap gap-1.5">
                        {STAGES.map((s) => (
                          <button
                            key={s}
                            onClick={() => setSelectedStage(s)}
                            className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                              selectedStage === s
                                ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-300"
                                : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10"
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Risk */}
                    <div>
                      <label className="text-xs text-white/40 mb-2 block uppercase tracking-wider">Risk Level</label>
                      <div className="flex flex-wrap gap-1.5">
                        {RISKS.map((r) => (
                          <button
                            key={r}
                            onClick={() => setSelectedRisk(r)}
                            className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                              selectedRisk === r
                                ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                                : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10"
                            }`}
                          >
                            {r}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Min Score */}
                    <div>
                      <label className="text-xs text-white/40 mb-2 block uppercase tracking-wider">
                        Min AI Score: <span className="text-white/70">{minScore}</span>
                      </label>
                      <input
                        type="range"
                        min={0}
                        max={95}
                        step={5}
                        value={minScore}
                        onChange={(e) => setMinScore(Number(e.target.value))}
                        className="w-full accent-cyan-500"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Cards grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="rounded-2xl border border-white/8 bg-white/[0.03] p-5 space-y-3">
                    {[20, 12, 16, 10].map((w, j) => (
                      <div key={j} className={`h-${w === 20 ? 5 : 4} bg-white/8 rounded animate-pulse w-${w === 20 ? "3/4" : w === 12 ? "full" : "2/3"}`} />
                    ))}
                  </div>
                ))}
              </div>
            ) : startups.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-cyan-400" />
                </div>
                <p className="text-white font-semibold">No startups found</p>
                <p className="text-white/40 text-sm mt-1">Try adjusting your filters</p>
              </div>
            ) : (
              <motion.div
                layout
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
              >
                <AnimatePresence mode="popLayout">
                  {sortedStartups.map((startup) => (
                    <StartupCard
                      key={startup.id}
                      startup={startup}
                      onView={() => setSelectedStartup(startup)}
                      onSave={() => handleSave(startup)}
                      onLike={() => handleLike(startup)}
                      onConnect={() => handleConnect(startup)}
                      onWatchVideo={() => { setSelectedStartup(startup); setVideoModalOpen(true); }}
                      onAddToPipeline={() => handlePipelineStage(startup, "Interested")}
                      loadingActions={loadingActions}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </>
        )}

        {/* ── Analytics Tab ────────────────────────────────────────────────── */}
        {activeTab === "analytics" && stats && (
          <div className="space-y-6">
            {/* Second KPI row — personal stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-2xl border border-pink-500/30 bg-white/[0.04] p-5 text-center">
                <Heart className="w-5 h-5 text-pink-400 mx-auto mb-2" />
                <div className="text-2xl font-black text-white">{stats.liked_count}</div>
                <div className="text-xs text-white/40 mt-1">Liked by You</div>
              </div>
              <div className="rounded-2xl border border-emerald-500/30 bg-white/[0.04] p-5 text-center">
                <Users className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
                <div className="text-2xl font-black text-white">{stats.connected_count}</div>
                <div className="text-xs text-white/40 mt-1">Founders Connected</div>
              </div>
              <div className="rounded-2xl border border-cyan-500/30 bg-white/[0.04] p-5 text-center">
                <TrendingUp className="w-5 h-5 text-cyan-400 mx-auto mb-2" />
                <div className="text-2xl font-black text-white">{stats.low_risk_count}</div>
                <div className="text-xs text-white/40 mt-1">Low Risk Deals</div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Industry Pie */}
              <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-5">
                <h3 className="font-semibold text-white mb-1">Industry Distribution</h3>
                <p className="text-xs text-white/40 mb-4">Startups per industry in the pipeline</p>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.industry_distribution}
                        cx="50%" cy="50%"
                        innerRadius={55} outerRadius={95}
                        paddingAngle={2}
                        dataKey="value"
                        animationDuration={1200}
                      >
                        {stats.industry_distribution.map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: "rgba(15,15,25,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#fff" }}
                      />
                      <Legend
                        verticalAlign="bottom" height={36} iconType="circle"
                        wrapperStyle={{ fontSize: "11px", color: "rgba(255,255,255,0.7)" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Avg Score by Industry */}
              <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-5">
                <h3 className="font-semibold text-white mb-1">Avg AI Score by Industry</h3>
                <p className="text-xs text-white/40 mb-4">Which sectors score highest on average</p>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.avg_score_by_industry} layout="vertical" margin={{ left: 16 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" horizontal={false} />
                      <XAxis type="number" domain={[0, 100]} tick={{ fill: "#9ca3af", fontSize: 11 }} />
                      <YAxis type="category" dataKey="industry" tick={{ fill: "#9ca3af", fontSize: 10 }} width={72} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "rgba(15,15,25,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#fff" }}
                        formatter={(v) => [`${v}`, "Avg Score"]}
                      />
                      <Bar dataKey="avgScore" radius={[0, 6, 6, 0]} animationDuration={1200}>
                        {stats.avg_score_by_industry.map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Top startups table */}
            <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-5">
              <h3 className="font-semibold text-white mb-4">Top AI-Scored Startups</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/8">
                      {["Startup", "Industry", "Stage", "AI Score", "Risk", "Actions"].map((h) => (
                        <th key={h} className="text-left text-xs font-medium text-white/40 pb-3 pr-4 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[...startups].sort((a, b) => b.score - a.score).slice(0, 10).map((s) => (
                      <tr key={s.id} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-7 w-7">
                              <AvatarImage src={s.photo_url} />
                              <AvatarFallback className="text-xs bg-purple-500/20 text-purple-300">{s.name[0]}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium text-white">{s.name}</span>
                            {s.verified && <CheckCircle2 className="w-3 h-3 text-cyan-400" />}
                          </div>
                        </td>
                        <td className="py-3 pr-4 text-white/50 text-xs">{s.industry}</td>
                        <td className="py-3 pr-4"><span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/25 text-purple-300">{s.stage}</span></td>
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-white/8 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full bg-gradient-to-r ${scoreGradient(s.score)}`} style={{ width: `${s.score}%` }} />
                            </div>
                            <span className={`text-xs font-bold ${scoreColor(s.score)}`}>{s.score}</span>
                          </div>
                        </td>
                        <td className="py-3 pr-4"><span className={`text-xs px-2 py-0.5 rounded-full border ${riskBadge(s.risk_level)}`}>{s.risk_level}</span></td>
                        <td className="py-3">
                          <div className="flex gap-1.5">
                            <button onClick={() => handleSave(s)} className={`p-1.5 rounded-lg transition-colors ${s.is_saved ? "text-indigo-400" : "text-white/30 hover:text-white"}`}><Bookmark className="w-3.5 h-3.5" /></button>
                            <button onClick={() => handleLike(s)} className={`p-1.5 rounded-lg transition-colors ${s.is_liked ? "text-pink-400" : "text-white/30 hover:text-white"}`}><Heart className="w-3.5 h-3.5" /></button>
                            <button onClick={() => setSelectedStartup(s)} className="p-1.5 rounded-lg text-white/30 hover:text-white transition-colors"><Eye className="w-3.5 h-3.5" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selectedStartup && (
          <StartupModal
            startup={selectedStartup}
            onClose={() => setSelectedStartup(null)}
            onSave={() => handleSave(selectedStartup)}
            onLike={() => handleLike(selectedStartup)}
            onConnect={() => handleConnect(selectedStartup)}
          />
        )}
      </AnimatePresence>

      {videoModalOpen && selectedStartup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl" onClick={() => setVideoModalOpen(false)}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-4xl bg-slate-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl relative"
          >
            <button
              onClick={() => { setVideoModalOpen(false); }}
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/50 hover:bg-black/80 rounded-full flex items-center justify-center text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="aspect-video w-full bg-black relative flex items-center justify-center">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542435503-956c26600c5d?auto=format&fit=crop&q=80&w=800')] bg-cover bg-center opacity-30 mix-blend-overlay animate-pulse" />
              <div className="text-center z-10 space-y-4">
                <Play className="w-16 h-16 text-cyan-400 mx-auto opacity-50" />
                <p className="text-white/60 font-mono text-sm uppercase tracking-widest">{selectedStartup.name} Pitch Preview</p>
                <div className="w-48 h-1 bg-white/10 mx-auto rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-500 w-1/3 animate-[pulse_2s_ease-in-out_infinite]" />
                </div>
              </div>
            </div>
            <div className="p-6 flex items-center justify-between border-t border-white/10">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10 border border-white/10">
                   <AvatarImage src={selectedStartup.photo_url} />
                   <AvatarFallback>{selectedStartup.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-bold text-white leading-tight">{selectedStartup.name}</h4>
                  <p className="text-xs text-white/50">{selectedStartup.founder}</p>
                </div>
              </div>
              <div className="flex gap-2">
                 <button onClick={() => { setVideoModalOpen(false); handleConnect(selectedStartup); }} className="px-4 py-2 bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 font-semibold rounded-xl text-sm border border-cyan-500/30 transition-colors">
                    Connect
                 </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </DashboardLayout>
  )
}
