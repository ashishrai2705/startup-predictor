"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Sparkles, LayoutDashboard, Target, BarChart3, Brain, Info, User,
  Menu, X, Scale, Lightbulb, BookOpen, Users, Globe, Briefcase,
  History, Rocket, TrendingUp, ChevronDown, LogOut, MessageSquare, Bell, Bookmark
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useState, useRef, useEffect } from "react"
import { useUserMode } from "@/context/UserModeContext"
import type { UserMode } from "@/types/analysis"
import { FloatingAssistant } from "./floating-assistant"

// ─── Sidebar items per mode ───────────────────────────────────────────────────

const founderItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Analyze Idea", href: "/analyze", icon: Lightbulb },
  { name: "Ideas Library", href: "/ideas", icon: BookOpen },
  { name: "Predict Startup", href: "/predict", icon: Target },
  { name: "History", href: "/history", icon: History },
  { name: "Compare Startups", href: "/compare", icon: Scale },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Model Insights", href: "/insights", icon: Brain },
  { name: "Community", href: "/community", icon: Users },
  { name: "Network", href: "/network", icon: Globe },
  { name: "Investor Hub", href: "/investor-dashboard", icon: Briefcase },
  { name: "About", href: "/about", icon: Info },
]

const investorItems = [
  // MAIN
  { name: "Investor Hub", href: "/investor-dashboard", icon: Briefcase },
  { name: "Deal Pipeline", href: "/pipeline", icon: Rocket },
  { name: "Startup Feed", href: "/investor-dashboard", icon: TrendingUp },
  { name: "Investments", href: "/funding", icon: Target },
  { name: "Community", href: "/community", icon: Users },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  // PERSONAL
  { name: "Messages", href: "/messages", icon: MessageSquare },
  { name: "Notifications", href: "/notifications", icon: Bell },
  { name: "Saved", href: "/saved-posts", icon: Bookmark },
]

// ─── Mode Toggle Dropdown ────────────────────────────────────────────────────

function ModeToggle() {
  const { mode, setMode } = useUserMode()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const options: { id: UserMode; label: string; icon: React.ElementType; route: string }[] = [
    { id: "founder", label: "Founder Mode", icon: Rocket, route: "/dashboard" },
    { id: "investor", label: "Investor Mode", icon: TrendingUp, route: "/investor-dashboard" },
  ]

  const current = options.find((o) => o.id === mode) ?? options[0]
  const CurrentIcon = current.icon

  const handleSwitch = (opt: (typeof options)[number]) => {
    setMode(opt.id)
    setOpen(false)
    router.push(opt.route)
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold transition-all duration-200",
          mode === "investor"
            ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/20"
            : "bg-purple-500/10 border-purple-500/40 text-purple-300 hover:bg-purple-500/20"
        )}
      >
        <CurrentIcon className="w-4 h-4" />
        {current.label}
        <ChevronDown className={cn("w-3 h-3 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-52 rounded-2xl border border-white/10 bg-slate-900/95 backdrop-blur-xl shadow-2xl z-50 overflow-hidden">
          <div className="p-1.5">
            {options.map((opt) => {
              const Icon = opt.icon
              const isActive = mode === opt.id
              return (
                <button
                  key={opt.id}
                  onClick={() => handleSwitch(opt)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all",
                    isActive
                      ? opt.id === "investor"
                        ? "bg-cyan-500/15 text-cyan-300"
                        : "bg-purple-500/15 text-purple-300"
                      : "text-white/70 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {opt.label}
                  {isActive && (
                    <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full bg-white/10">
                      Active
                    </span>
                  )}
                </button>
              )
            })}
          </div>
          <div className="border-t border-white/5 p-1.5">
            <button
              onClick={() => { setMode("founder"); router.push("/") }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/40 hover:text-white/70 hover:bg-white/5 transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              Change Mode
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main Layout ──────────────────────────────────────────────────────────────

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { mode } = useUserMode()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const sidebarItems = mode === "investor" ? investorItems : founderItems

  const accentClass =
    mode === "investor"
      ? "text-cyan-400 border-cyan-500/30"
      : "text-purple-400 border-purple-500/30"

  const logoGradient =
    mode === "investor"
      ? "from-cyan-500 to-blue-600"
      : "from-purple-500 to-blue-500"

  const pageTitle =
    sidebarItems.find((item) => item.href === pathname)?.name ||
    (pathname.startsWith("/analyze/results") ? "Analysis Results" :
     pathname.startsWith("/analyze") ? "Analyze Idea" : "Dashboard")

  const renderNav = (onClickExtra?: () => void) => (
    <nav className="flex-1 p-4 space-y-1">
      {sidebarItems.map((item) => {
        const isActive = pathname === item.href
        return (
          <Link
            key={`${item.href}-${item.name}`}
            href={item.href}
            onClick={onClickExtra}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
              isActive
                ? `bg-sidebar-accent text-sidebar-accent-foreground border ${accentClass} shadow-sm`
                : "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
            )}
          >
            <item.icon className={cn("w-5 h-5", isActive && (mode === "investor" ? "text-cyan-400" : "text-purple-400"))} />
            {item.name}
          </Link>
        )
      })}
    </nav>
  )

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col fixed inset-y-0 left-0 bg-sidebar border-r border-sidebar-border">
        <div className="p-6 border-b border-sidebar-border">
          <Link href="/" className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${logoGradient} flex items-center justify-center shadow-lg shadow-purple-500/20`}>
              <Sparkles className="w-6 h-6 text-foreground" />
            </div>
            <div>
              <span className="font-semibold text-base text-sidebar-foreground">StartupPredictor</span>
              <div className={`text-[10px] font-medium ${mode === "investor" ? "text-cyan-400" : "text-purple-400"}`}>
                {mode === "investor" ? "Investor View" : "Founder View"}
              </div>
            </div>
          </Link>
        </div>

        {renderNav()}

        <div className="p-4 border-t border-sidebar-border">
          <div className="glass-card rounded-xl p-4">
            <p className="text-xs text-muted-foreground mb-2">Need help?</p>
            <p className="text-sm text-sidebar-foreground">Check our documentation for guidance on using the predictor.</p>
          </div>
        </div>
      </aside>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-xl glass border border-border/50"
      >
        {mobileMenuOpen ? (
          <X className="w-6 h-6 text-foreground" />
        ) : (
          <Menu className="w-6 h-6 text-foreground" />
        )}
      </button>

      {/* Mobile Sidebar */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <aside className="relative w-64 h-full bg-sidebar border-r border-sidebar-border">
            <div className="p-6 border-b border-sidebar-border mt-12">
              <Link href="/" className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${logoGradient} flex items-center justify-center`}>
                  <Sparkles className="w-6 h-6 text-foreground" />
                </div>
                <span className="font-semibold text-lg text-sidebar-foreground">StartupPredictor</span>
              </Link>
            </div>
            {renderNav(() => setMobileMenuOpen(false))}
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 lg:ml-64">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 h-16 flex items-center justify-between px-6 bg-background/80 backdrop-blur-lg border-b border-border/50">
          <div className="lg:hidden w-10" />
          <h1 className="text-lg font-semibold text-foreground lg:ml-0 ml-4">
            {pageTitle}
          </h1>
          <div className="flex items-center gap-3">
            {/* Mode Toggle */}
            <ModeToggle />
            {/* Avatar */}
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center border border-border/50 hover:border-purple-500/30 transition-colors cursor-pointer">
              <User className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6">
          {children}
        </div>
      </main>
      
      <FloatingAssistant />
    </div>
  )
}
