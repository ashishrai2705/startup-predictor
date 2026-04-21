"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { CheckCircle2, AlertTriangle, XCircle, TrendingUp, Shield, ArrowRight, RotateCcw, DollarSign, Users, TrendingDown, Award } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar } from "recharts"
import { Suspense } from "react"

interface PredictionResult {
  successProbability: number
  riskLevel: "low" | "medium" | "high"
  breakdown: {
    fundingScore: number
    teamScore: number
    marketScore: number
    experienceScore: number
  }
  featureImportance: {
    funding?: number
    teamSize?: number
    marketSize?: number
    founderExperience?: number
  }
  report: {
    strengths: string[]
    risks: string[]
    recommendation: string
  }
}

interface PredictionInput {
  funding: number
  teamSize: number
  marketSize: number
  founderExperience: number
}

function ResultsContent() {
  const router = useRouter()
  const [result, setResult] = useState<PredictionResult | null>(null)
  const [input, setInput] = useState<PredictionInput | null>(null)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    // Read the real ML result saved by /predict page
    const raw = localStorage.getItem("predictionHistory")
    if (raw) {
      try {
        const history = JSON.parse(raw)
        if (Array.isArray(history) && history.length > 0) {
          const last = history[history.length - 1]
          setResult(last)
          // Try to recover inputs from sessionStorage if available
          const inputRaw = sessionStorage.getItem("lastPredictionInput")
          if (inputRaw) setInput(JSON.parse(inputRaw))
        }
      } catch {
        // ignore parse errors
      }
    }
  }, [])

  if (!isMounted) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
      </div>
    )
  }

  if (!result) {
    return (
      <div className="max-w-xl mx-auto text-center py-20 space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto">
          <TrendingUp className="w-8 h-8 text-purple-400" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">No Prediction Found</h1>
        <p className="text-muted-foreground">
          Run a prediction first and your results will appear here.
        </p>
        <Button asChild className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-8 py-3 rounded-xl">
          <Link href="/predict">Go to Predictor</Link>
        </Button>
      </div>
    )
  }

  const getRiskInfo = (level: string) => {
    if (level === "low") return { label: "Low Risk", color: "text-green-400", bg: "bg-green-400/10", icon: CheckCircle2 }
    if (level === "medium") return { label: "Medium Risk", color: "text-yellow-400", bg: "bg-yellow-400/10", icon: AlertTriangle }
    return { label: "High Risk", color: "text-red-400", bg: "bg-red-400/10", icon: XCircle }
  }

  const getGrowthPotential = (prob: number) => {
    if (prob >= 75) return { level: "High", color: "text-green-400" }
    if (prob >= 55) return { level: "Moderate", color: "text-yellow-400" }
    return { level: "Low", color: "text-red-400" }
  }

  const riskInfo = getRiskInfo(result.riskLevel)
  const growth = getGrowthPotential(result.successProbability)

  // Build chart data from real model feature importances
  const featureChartData = [
    { name: "Funding", value: Math.round((result.featureImportance?.funding ?? 0.35) * 100) },
    { name: "Team Size", value: Math.round((result.featureImportance?.teamSize ?? 0.20) * 100) },
    { name: "Market Size", value: Math.round((result.featureImportance?.marketSize ?? 0.25) * 100) },
    { name: "Experience", value: Math.round((result.featureImportance?.founderExperience ?? 0.20) * 100) },
  ]

  const gaugeData = [
    { name: "Probability", value: result.successProbability, fill: "url(#gaugeGradient)" }
  ]

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground mb-3">Prediction Results</h1>
        <p className="text-muted-foreground">AI-powered analysis from your ML model</p>
      </div>

      {/* Main Results Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Success Probability Card */}
        <div className="lg:col-span-2 glass-card rounded-3xl p-8">
          <h2 className="text-lg font-semibold text-foreground mb-6">Success Probability</h2>
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-48 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  cx="50%"
                  cy="50%"
                  innerRadius="60%"
                  outerRadius="100%"
                  barSize={20}
                  data={gaugeData}
                  startAngle={180}
                  endAngle={0}
                >
                  <defs>
                    <linearGradient id="gaugeGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#a855f7" />
                      <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                  </defs>
                  <RadialBar
                    dataKey="value"
                    cornerRadius={10}
                    background={{ fill: "rgba(255,255,255,0.05)" }}
                  />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="text-center -mt-20">
                <span className="text-5xl font-bold gradient-text">{result.successProbability}%</span>
              </div>
            </div>
            
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl ${riskInfo.bg} flex items-center justify-center`}>
                  <riskInfo.icon className={`w-6 h-6 ${riskInfo.color}`} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Risk Level</p>
                  <p className={`text-xl font-semibold ${riskInfo.color}`}>{riskInfo.label}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-400/10 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Growth Potential</p>
                  <p className={`text-xl font-semibold ${growth.color}`}>{growth.level}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-400/10 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Recommendation</p>
                  <p className="text-sm font-medium text-foreground leading-snug">{result.report.recommendation}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Breakdown Scores */}
        <div className="glass-card rounded-3xl p-6 space-y-4">
          <h3 className="text-lg font-semibold text-foreground mb-4">Score Breakdown</h3>
          <div className="space-y-3">
            {[
              { label: "Funding", value: result.breakdown.fundingScore, icon: DollarSign, color: "from-cyan-500 to-blue-500" },
              { label: "Team", value: result.breakdown.teamScore, icon: Users, color: "from-purple-500 to-pink-500" },
              { label: "Market", value: result.breakdown.marketScore, icon: TrendingDown, color: "from-teal-500 to-cyan-500" },
              { label: "Experience", value: result.breakdown.experienceScore, icon: Award, color: "from-orange-500 to-pink-500" },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Icon className="w-3.5 h-3.5" />
                    <span className="text-xs">{label}</span>
                  </div>
                  <span className="text-sm font-semibold text-foreground">{value}/100</span>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className={`h-full bg-gradient-to-r ${color} rounded-full`} style={{ width: `${value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Feature Importance Chart — from real model */}
      <div className="glass-card rounded-3xl p-8">
        <h2 className="text-lg font-semibold text-foreground mb-2">Feature Importance</h2>
        <p className="text-sm text-muted-foreground mb-6">How each factor contributed to this prediction</p>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={featureChartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" horizontal={false} />
              <XAxis type="number" tick={{ fill: '#888', fontSize: 12 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} tickFormatter={(v) => `${v}%`} />
              <YAxis type="category" dataKey="name" tick={{ fill: '#888', fontSize: 12 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} width={90} />
              <Tooltip
                contentStyle={{ backgroundColor: "rgba(22,22,30,0.9)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#fff" }}
                formatter={(value) => [`${value}%`, "Importance"]}
              />
              <Bar dataKey="value" fill="#a855f7" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Strengths & Risks */}
      {(result.report.strengths.length > 0 || result.report.risks.length > 0) && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="glass-card rounded-3xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
              <h3 className="font-semibold text-foreground">Strengths</h3>
            </div>
            <div className="space-y-2">
              {result.report.strengths.map((s, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 mt-1.5 flex-shrink-0" />
                  {s}
                </div>
              ))}
            </div>
          </div>
          <div className="glass-card rounded-3xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <h3 className="font-semibold text-foreground">Risks</h3>
            </div>
            <div className="space-y-2">
              {result.report.risks.map((r, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 flex-shrink-0" />
                  {r}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button asChild variant="outline" className="border-border/50 hover:bg-secondary/50 px-8 py-6 rounded-xl">
          <Link href="/predict">
            <RotateCcw className="w-5 h-5 mr-2" />
            New Prediction
          </Link>
        </Button>
        <Button asChild className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-8 py-6 rounded-xl shadow-lg shadow-purple-500/25">
          <Link href="/analytics">
            View Analytics
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </Button>
      </div>
    </div>
  )
}

export default function ResultsPage() {
  return (
    <DashboardLayout>
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
        </div>
      }>
        <ResultsContent />
      </Suspense>
    </DashboardLayout>
  )
}
