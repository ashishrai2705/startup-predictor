"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bookmark, BookmarkX, Building2, CheckCircle2, Flame,
  Sparkles, Activity, Briefcase, ArrowUp, ArrowDown,
  TrendingUp, Users, Heart,
} from "lucide-react";
import { toast } from "sonner";
import { useUserMode } from "@/context/UserModeContext";

// ─── Types ────────────────────────────────────────────────────────────────────
interface SavedStartup {
  postId: string;
  savedAt: string;
  startupData: {
    id: string;
    name: string;
    founder: string;
    industry: string;
    stage: string;
    pitch: string;
    market_size: string;
    traction: string;
    team_size: number;
    monthly_growth: string;
    burn_rate: string;
    score: number;
    risk_level: "Low" | "Medium" | "High";
    ai_recommendation: string;
    verified: boolean;
    confidence_score: number;
    founder_experience: string;
    previous_startups: number;
    credibility_score: number;
    is_trending: boolean;
    strengths: string;
    red_flags: string;
    why_score_reasons: string;
    detailedDescription?: string;
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function scoreColor(score: number) {
  if (score >= 85) return "text-emerald-400";
  if (score >= 70) return "text-purple-400";
  if (score >= 55) return "text-amber-400";
  return "text-red-400";
}

function riskBadge(risk: string) {
  if (risk === "Low") return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
  if (risk === "Medium") return "bg-amber-500/15 text-amber-400 border-amber-500/30";
  return "bg-red-500/15 text-red-400 border-red-500/30";
}

// ─── Saved Startup Card ───────────────────────────────────────────────────────
function SavedStartupCard({
  item,
  onUnsave,
}: {
  item: SavedStartup;
  onUnsave: (postId: string) => void;
}) {
  const s = item.startupData;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.35 }}
      className="rounded-2xl border border-white/10 bg-slate-900/40 backdrop-blur-xl p-5 flex flex-col gap-4 hover:border-purple-500/30 hover:shadow-xl transition-all duration-300"
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="text-center flex-shrink-0">
            <div className={`text-3xl font-black ${scoreColor(s.score)} leading-none drop-shadow-md`}>
              {s.score}
            </div>
            <div className="text-[9px] text-white/40 uppercase font-medium mt-1">AI Score</div>
          </div>
          <div className="h-10 w-px bg-white/10 mx-1 mt-1 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
              <h3 className="font-bold text-white text-base leading-tight">{s.name}</h3>
              {s.verified && <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />}
              {s.is_trending && (
                <span className="flex items-center gap-1 bg-orange-500/20 text-orange-400 border border-orange-500/40 px-2 py-0.5 rounded-full text-[10px] font-bold animate-pulse">
                  <Flame className="w-3 h-3" /> Hot
                </span>
              )}
            </div>
            <p className="text-white/50 text-xs">{s.founder} · {s.industry}</p>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className="text-[10px] px-2 py-0.5 rounded-sm bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 font-medium">
                {s.stage}
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-sm border ${riskBadge(s.risk_level)} font-medium`}>
                {s.risk_level} Risk
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={() => onUnsave(item.postId)}
          title="Remove from saved"
          className="flex-shrink-0 p-2 rounded-xl bg-white/5 border border-white/10 text-indigo-400 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 transition-all"
        >
          <BookmarkX className="w-4 h-4" />
        </button>
      </div>

      {/* Pitch */}
      <p className="text-white/60 text-xs leading-relaxed line-clamp-2">{s.pitch}</p>

      {/* Founder Intelligence */}
      <div className="flex items-center justify-between text-[10px] text-white/50 bg-white/[0.02] py-1.5 px-3 rounded-lg border border-white/5">
        <span className="flex items-center gap-1.5">
          <Briefcase className="w-3 h-3 text-cyan-500" /> {s.founder_experience}
        </span>
        <span>{s.previous_startups} Exits</span>
        <span>Cred: <span className="text-white font-semibold">{s.credibility_score}/100</span></span>
        <span className="flex items-center gap-1">
          Conf: <span className={s.confidence_score > 80 ? "text-emerald-400 ml-1" : "text-amber-400 ml-1"}>{s.confidence_score}%</span>
          {s.confidence_score > s.score
            ? <ArrowUp className="w-3 h-3 text-emerald-400" />
            : <ArrowDown className="w-3 h-3 text-amber-400" />}
        </span>
      </div>

      {/* Investment Snapshot */}
      <div className="grid grid-cols-4 gap-2 text-center">
        {[
          { label: "Market", value: s.market_size },
          { label: "Traction", value: s.traction },
          { label: "Growth", value: `+${s.monthly_growth}`, className: "text-emerald-400" },
          { label: "Burn", value: s.burn_rate, className: "text-pink-400" },
        ].map((m) => (
          <div key={m.label} className="rounded-lg bg-white/[0.03] border border-white/5 p-2">
            <div className="text-[9px] text-white/40 uppercase mb-0.5">{m.label}</div>
            <div className={`text-xs font-bold truncate ${m.className ?? "text-white"}`}>{m.value}</div>
          </div>
        ))}
      </div>

      {/* AI Analysis */}
      <div className="rounded-xl bg-purple-500/5 border border-purple-500/10 p-3 flex flex-col gap-2">
        <div className="flex items-center gap-1.5 text-purple-300 text-[10px] uppercase font-bold tracking-widest">
          <Activity className="w-3.5 h-3.5" /> AI Target Analysis
        </div>
        <ul className="text-white/70 text-xs space-y-1 pl-4 list-disc marker:text-purple-500/50">
          {s.why_score_reasons.split("|").slice(0, 3).map((reason, i) => (
            <li key={i} className="line-clamp-1">{reason}</li>
          ))}
        </ul>
        <div className="flex gap-4 pt-1">
          <div className="flex-1">
            <span className="text-[9px] text-emerald-400/80 uppercase font-bold block mb-0.5">Strengths</span>
            <p className="text-[10px] text-white/60 line-clamp-1">{s.strengths.split("|").join(", ")}</p>
          </div>
          <div className="flex-1">
            <span className="text-[9px] text-pink-400/80 uppercase font-bold block mb-0.5">Red Flags</span>
            <p className="text-[10px] text-white/60 line-clamp-1">{s.red_flags.split("|").join(", ")}</p>
          </div>
        </div>
      </div>

      {/* Detailed Overview */}
      {s.detailedDescription && (
        <div className="rounded-xl bg-white/[0.025] border border-white/8 p-3">
          <div className="flex items-center gap-1.5 text-cyan-300/80 text-[10px] uppercase font-bold tracking-widest mb-2">
            <Building2 className="w-3.5 h-3.5" /> Detailed Overview
          </div>
          <p className="text-[11px] text-white/55 leading-relaxed line-clamp-4">
            {s.detailedDescription}
          </p>
        </div>
      )}

      {/* AI Recommendation */}
      <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-3">
        <div className="flex items-center gap-1.5 text-purple-400 text-[10px] uppercase font-bold tracking-widest mb-1.5">
          <Sparkles className="w-3.5 h-3.5" /> AI Recommendation
        </div>
        <p className="text-[11px] text-white/65 leading-relaxed line-clamp-3">{s.ai_recommendation}</p>
      </div>

      {/* Saved timestamp */}
      <div className="text-[10px] text-white/30 text-right">
        Saved {new Date(item.savedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
      </div>
    </motion.div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center py-24 text-center"
    >
      <div className="w-16 h-16 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-5">
        <Bookmark className="w-8 h-8 text-indigo-400" />
      </div>
      <h2 className="text-xl font-semibold text-white mb-2">No saved startups yet</h2>
      <p className="text-sm text-white/40 max-w-sm leading-relaxed">
        Click the bookmark icon on any startup card in the Investor Dashboard to save it here.
      </p>
    </motion.div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-5 space-y-3">
      <div className="flex gap-3 items-center">
        <div className="w-10 h-10 rounded-full bg-white/8 animate-pulse" />
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-white/8 rounded w-1/3 animate-pulse" />
          <div className="h-3 bg-white/8 rounded w-1/2 animate-pulse" />
        </div>
      </div>
      <div className="h-3 bg-white/8 rounded w-full animate-pulse" />
      <div className="h-3 bg-white/8 rounded w-4/5 animate-pulse" />
      <div className="grid grid-cols-4 gap-2">
        {[1,2,3,4].map(i => <div key={i} className="h-10 bg-white/8 rounded-lg animate-pulse" />)}
      </div>
    </div>
  );
}

// ─── Main Feed ────────────────────────────────────────────────────────────────
export function SavedPostsFeed() {
  const { investorId } = useUserMode();
  const [items, setItems] = useState<SavedStartup[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const userId = investorId ?? "guest";

  useEffect(() => {
    setIsLoading(true);
    fetch(`/api/save-post?userId=${encodeURIComponent(userId)}`)
      .then((res) => res.json())
      .then((data: SavedStartup[]) => {
        setItems(Array.isArray(data) ? data : []);
      })
      .catch(() => setItems([]))
      .finally(() => setIsLoading(false));
  }, [userId]);

  const handleUnsave = async (postId: string) => {
    // Optimistic remove
    setItems((prev) => prev.filter((i) => i.postId !== postId));
    try {
      await fetch("/api/save-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, postId, startupData: {} }),
      });
      toast.success("Removed from Saved Posts");
    } catch {
      toast.error("Failed to unsave");
    }
  };

  return (
    <div className="space-y-6">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-lg text-white">Saved Posts</h2>
        {!isLoading && items.length > 0 && (
          <span className="text-sm text-white/40">{items.length} saved</span>
        )}
      </div>

      <AnimatePresence mode="popLayout">
        {isLoading ? (
          <motion.div
            key="skeletons"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {[1, 2].map((i) => <SkeletonCard key={i} />)}
          </motion.div>
        ) : items.length === 0 ? (
          <EmptyState />
        ) : (
          items.map((item) => (
            <SavedStartupCard key={item.postId} item={item} onUnsave={handleUnsave} />
          ))
        )}
      </AnimatePresence>
    </div>
  );
}
