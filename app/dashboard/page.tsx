"use client"

import Image from "next/image"
import { DashboardLayout } from "@/components/dashboard-layout"
import { TrendingUp, Users, Zap, Clock, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

const successDistributionData = [
  { name: "0-20%", value: 15, fill: "var(--chart-5)" },
  { name: "20-40%", value: 25, fill: "var(--chart-3)" },
  { name: "40-60%", value: 30, fill: "var(--chart-2)" },
  { name: "60-80%", value: 20, fill: "var(--chart-1)" },
  { name: "80-100%", value: 10, fill: "var(--chart-4)" },
]

const fundingVsSuccessData = [
  { funding: "$0-1M", success: 35 },
  { funding: "$1-5M", success: 48 },
  { funding: "$5-10M", success: 62 },
  { funding: "$10-25M", success: 71 },
  { funding: "$25-50M", success: 78 },
  { funding: "$50M+", success: 85 },
]

const recentPredictions = [
  { name: "TechVenture AI", probability: 78, trend: "up", date: "2 hours ago" },
  { name: "GreenEnergy Co", probability: 65, trend: "up", date: "5 hours ago" },
  { name: "HealthPlus", probability: 42, trend: "down", date: "1 day ago" },
  { name: "FinanceFlow", probability: 89, trend: "up", date: "1 day ago" },
  { name: "EduLearn", probability: 55, trend: "down", date: "2 days ago" },
]

const stats = [
  { 
    title: "Total Analyzed", 
    value: "1,284", 
    change: "+12.5%", 
    trend: "up",
    icon: Users,
    description: "startups this month"
  },
  { 
    title: "Avg Success Rate", 
    value: "64.2%", 
    change: "+3.2%", 
    trend: "up",
    icon: TrendingUp,
    description: "across all predictions"
  },
  { 
    title: "Top Factor", 
    value: "Funding", 
    change: "32% weight",
    trend: "neutral",
    icon: Zap,
    description: "most influential"
  },
  { 
    title: "Recent Predictions", 
    value: "47", 
    change: "+8",
    trend: "up",
    icon: Clock,
    description: "in last 24 hours"
  },
]

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-white/70">Real-time insights into startup predictions and trends</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div
              key={stat.title}
              className="group rounded-2xl border border-cyan-400/30 bg-white/10 backdrop-blur-xl p-6 hover:border-cyan-400/60 hover:bg-cyan-500/10 transition-all duration-300 shadow-2xl"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/30 to-blue-500/30 flex items-center justify-center">
                  <stat.icon className="w-5 h-5 text-cyan-400" />
                </div>
                <span className={`text-sm font-medium flex items-center gap-1 ${
                  stat.trend === "up" ? "text-green-400" : 
                  stat.trend === "down" ? "text-red-400" : "text-white/60"
                }`}>
                  {stat.trend === "up" && <ArrowUpRight className="w-4 h-4" />}
                  {stat.trend === "down" && <ArrowDownRight className="w-4 h-4" />}
                  {stat.change}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">{stat.value}</h3>
              <p className="text-sm text-white/70">{stat.title}</p>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Success Distribution */}
          <div className="rounded-2xl border border-cyan-400/30 bg-white/10 backdrop-blur-xl p-6 hover:border-cyan-400/60 hover:bg-cyan-500/10 transition-all duration-300 shadow-2xl">
            <h3 className="text-lg font-semibold text-white mb-6">Success Distribution</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={successDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {successDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(22, 22, 30, 0.9)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "12px",
                      color: "#fff"
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {successDistributionData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.fill }} />
                  <span className="text-sm text-white/70">{item.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Funding vs Success */}
          <div className="rounded-2xl border border-cyan-400/30 bg-white/10 backdrop-blur-xl p-6 hover:border-cyan-400/60 hover:bg-cyan-500/10 transition-all duration-300 shadow-2xl">
            <h3 className="text-lg font-semibold text-white mb-6">Funding vs Success Probability</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={fundingVsSuccessData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis 
                    dataKey="funding" 
                    tick={{ fill: '#e5e7eb', fontSize: 12 }}
                    axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                  />
                  <YAxis 
                    tick={{ fill: '#e5e7eb', fontSize: 12 }}
                    axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(22, 22, 30, 0.9)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "12px",
                      color: "#fff"
                    }}
                    formatter={(value) => [`${value}%`, "Success Rate"]}
                  />
                  <Bar 
                    dataKey="success" 
                    fill="url(#barGradient)"
                    radius={[6, 6, 0, 0]}
                  />
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#06b6d4" />
                      <stop offset="100%" stopColor="#2563eb" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent Predictions */}
        <div className="rounded-2xl border border-cyan-400/30 bg-white/10 backdrop-blur-xl p-6 hover:border-cyan-400/60 hover:bg-cyan-500/10 transition-all duration-300 shadow-2xl">
          <h3 className="text-lg font-semibold text-white mb-6">Recent Predictions</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left text-sm font-medium text-white/60 pb-4">Startup</th>
                  <th className="text-left text-sm font-medium text-white/60 pb-4">Success Probability</th>
                  <th className="text-left text-sm font-medium text-white/60 pb-4">Trend</th>
                  <th className="text-right text-sm font-medium text-white/60 pb-4">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentPredictions.map((prediction, index) => (
                  <tr key={index} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                    <td className="py-4">
                      <span className="font-medium text-white">{prediction.name}</span>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500"
                            style={{ width: `${prediction.probability}%` }}
                          />
                        </div>
                        <span className="text-sm text-white font-medium">{prediction.probability}%</span>
                      </div>
                    </td>
                    <td className="py-4">
                      <span className={`flex items-center gap-1 text-sm ${
                        prediction.trend === "up" ? "text-green-400" : "text-red-400"
                      }`}>
                        {prediction.trend === "up" ? (
                          <ArrowUpRight className="w-4 h-4" />
                        ) : (
                          <ArrowDownRight className="w-4 h-4" />
                        )}
                        {prediction.trend === "up" ? "Improving" : "Declining"}
                      </span>
                    </td>
                    <td className="py-4 text-right text-sm text-white/60">
                      {prediction.date}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
