"use client"

import { useState, useEffect, useCallback } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { useUserMode } from "@/context/UserModeContext"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import { 
  Rocket, Search, AlertCircle, Loader2, Sparkles, Building2, Flame, ArrowUpRight
} from "lucide-react"

// ─── Types ───────────────────────────────────────────────────────────────────

interface Startup {
  id: string
  name: string
  industry: string
  score: number
  traction: string
  stage: string
  pipeline_stage: string
  is_trending: boolean
  photo_url: string
}

const STAGES = [
  { id: "Interested", label: "Interested", color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/20" },
  { id: "Contacted", label: "Contacted", color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/20" },
  { id: "In Due Diligence", label: "Due Diligence", color: "text-purple-400", bg: "bg-purple-400/10", border: "border-purple-400/20" },
  { id: "Invested", label: "Invested", color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20" },
  { id: "Rejected", label: "Passed", color: "text-rose-400", bg: "bg-rose-400/10", border: "border-rose-400/20" },
]

export default function DealPipelinePage() {
  const { investorId } = useUserMode()
  const [startups, setStartups] = useState<Startup[]>([])
  const [loading, setLoading] = useState(true)
  const [draggedId, setDraggedId] = useState<string | null>(null)

  // ─── Fetch ─────────────────────────────────────────────────────────────────
  const fetchPipeline = useCallback(async () => {
    if (!investorId) return
    setLoading(true)
    try {
      const res = await fetch(`/api/investor/pipeline?investor_id=${investorId}`)
      if (!res.ok) throw new Error()
      const data = await res.json()
      setStartups(data)
    } catch {
      toast.error("Failed to load pipeline")
    } finally {
      setLoading(false)
    }
  }, [investorId])

  useEffect(() => {
    fetchPipeline()
  }, [fetchPipeline])

  // ─── Actions ───────────────────────────────────────────────────────────────
  const moveToStage = async (startupId: string, newStage: string) => {
    if (!investorId) return
    
    // Optimistic update
    setStartups(prev => prev.map(s => s.id === startupId ? { ...s, pipeline_stage: newStage } : s))
    
    try {
      const res = await fetch("/api/investor/pipeline/update-stage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ investor_id: investorId, startup_id: startupId, stage: newStage }),
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      toast.success(data.message)
    } catch {
      toast.error("Failed to move startup")
      fetchPipeline() // Revert on failure
    }
  }

  // ─── Drag Handlers ─────────────────────────────────────────────────────────
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleDrop = (e: React.DragEvent, targetStage: string) => {
    e.preventDefault()
    if (draggedId) {
      const startup = startups.find(s => s.id === draggedId)
      if (startup && startup.pipeline_stage !== targetStage) {
        moveToStage(draggedId, targetStage)
      }
    }
    setDraggedId(null)
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto flex flex-col h-[calc(100vh-80px)]">
        
        {/* Header */}
        <div className="flex-shrink-0 mb-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
              <Rocket className="w-5 h-5 text-indigo-400" />
            </div>
            <h1 className="text-3xl font-black text-white px-2">Deal Pipeline</h1>
          </div>
          <p className="text-white/50 text-sm ml-[3.25rem]">Drag and drop to manage your investment flow.</p>
        </div>

        {/* Board */}
        {loading ? (
          <div className="flex items-center justify-center flex-1">
            <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
          </div>
        ) : (
          <div className="flex-1 flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
            {STAGES.map((stage) => {
              const columnStartups = startups.filter(s => s.pipeline_stage === stage.id)

              return (
                <div 
                  key={stage.id} 
                  className={`flex-shrink-0 w-80 rounded-2xl flex flex-col bg-slate-900/50 border border-white/5`}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, stage.id)}
                >
                  {/* Column Header */}
                  <div className={`p-4 border-b border-white/5 flex items-center justify-between`}>
                    <div className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${stage.bg} border ${stage.border}`} />
                      <h3 className={`font-bold ${stage.color} text-sm uppercase tracking-wider`}>{stage.label}</h3>
                    </div>
                    <span className="text-xs font-mono text-white/40 bg-white/5 px-2 py-0.5 rounded-full">
                      {columnStartups.length}
                    </span>
                  </div>

                  {/* Cards */}
                  <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar min-h-[200px]">
                    <AnimatePresence>
                      {columnStartups.map((s) => (
                        <motion.div
                          layout
                          key={s.id}
                          layoutId={s.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          draggable
                          onDragStart={(e) => handleDragStart(e as unknown as React.DragEvent, s.id)}
                          className={`group cursor-grab active:cursor-grabbing p-4 rounded-xl border bg-white/[0.04] hover:bg-white/[0.08] backdrop-blur-md transition-colors ${
                            s.score >= 90 ? "border-cyan-500/30" : "border-white/10"
                          }`}
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-2">
                              {s.score >= 90 && <Sparkles className="w-3.5 h-3.5 text-cyan-400" />}
                              <h4 className="font-bold text-white text-sm">{s.name}</h4>
                              {s.is_trending && <Flame className="w-3.5 h-3.5 text-orange-400" />}
                            </div>
                            <div className={`text-sm font-black ${s.score >= 80 ? "text-emerald-400" : "text-amber-400"}`}>
                              {s.score}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 text-xs text-white/50 mb-3">
                            <span className="bg-white/5 px-1.5 py-0.5 rounded text-[10px]">{s.stage}</span>
                            <span className="truncate">{s.industry}</span>
                          </div>

                          <div className="flex items-center justify-between text-xs pt-3 border-t border-white/10 text-white/40">
                             <div className="flex items-center gap-1.5"><Building2 className="w-3 h-3" /> {s.traction}</div>
                             <button className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-cyan-400">
                                View <ArrowUpRight className="w-3 h-3" />
                             </button>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
      `}} />
    </DashboardLayout>
  )
}
