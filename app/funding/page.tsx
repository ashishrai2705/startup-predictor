"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { useUserMode } from "@/context/UserModeContext";
import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, Briefcase, TrendingUp, AlertTriangle, CheckCircle2, ArrowUpRight, Loader2, Building2, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface Investment {
  id: string;
  name: string;
  invested_amount: string;
  current_valuation: string;
  roi_percent: string;
  status: "Growing" | "Risk" | "Exit";
}

export default function FundingPage() {
  const { investorId } = useUserMode();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvestments = async () => {
      try {
        const res = await fetch(`/api/investor/investments?investor_id=${investorId || ""}`);
        if (!res.ok) throw new Error("Failed to load");
        const data = await res.json();
        setInvestments(data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load investments portfolio");
      } finally {
        setLoading(false);
      }
    };
    fetchInvestments();
  }, [investorId]);

  const StatusIcon = ({ status }: { status: "Growing" | "Risk" | "Exit" }) => {
    switch (status) {
      case "Growing": return <TrendingUp className="w-4 h-4 text-emerald-400" />;
      case "Risk": return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case "Exit": return <CheckCircle2 className="w-4 h-4 text-purple-400" />;
    }
  };

  const statusColor = (status: "Growing" | "Risk" | "Exit") => {
    switch (status) {
      case "Growing": return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
      case "Risk": return "border-amber-500/30 bg-amber-500/10 text-amber-300";
      case "Exit": return "border-purple-500/30 bg-purple-500/10 text-purple-300";
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-white mb-2">Fund Performance</h1>
          <p className="text-muted-foreground text-sm">Track your investments, valuations, and portfolio ROI.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <Card className="glass-card border-purple-500/30">
            <CardContent className="p-6 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-purple-500/15 flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-purple-400" />
                </div>
              </div>
              <div>
                <div className="text-3xl font-black text-white">4</div>
                <div className="text-muted-foreground text-sm mt-1">Total Investments</div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-card border-cyan-500/30">
            <CardContent className="p-6 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/15 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-cyan-400" />
                </div>
              </div>
              <div>
                <div className="text-3xl font-black text-white">$2.1M</div>
                <div className="text-muted-foreground text-sm mt-1">Capital Deployed</div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-emerald-500/30">
            <CardContent className="p-6 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <div className="text-3xl font-black text-white">+132%</div>
                <div className="text-muted-foreground text-sm mt-1">Average ROI</div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-amber-500/30">
            <CardContent className="p-6 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-amber-400" />
                </div>
              </div>
              <div>
                <div className="text-3xl font-black text-white">3</div>
                <div className="text-muted-foreground text-sm mt-1">Active Deals</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold text-white mb-4">Your Investments</h2>
            {loading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                <AnimatePresence>
                  {investments.map((inv, idx) => (
                    <motion.div
                      key={inv.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: idx * 0.1 }}
                    >
                      <Card className="glass-card border-white/10 hover:border-white/20 transition-all hover:bg-white/[0.04]">
                        <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          <div className="flex flex-col gap-1">
                            <h3 className="text-xl font-bold text-white">{inv.name}</h3>
                            <div className="flex items-center gap-2 mt-2">
                              <span className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1 border ${statusColor(inv.status)}`}>
                                <StatusIcon status={inv.status} /> {inv.status}
                              </span>
                            </div>
                          </div>

                          <div className="flex gap-6 sm:gap-8 text-right w-full sm:w-auto justify-between sm:justify-end">
                            <div>
                              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Invested</p>
                              <p className="font-semibold text-white">{inv.invested_amount}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Valuation</p>
                              <p className="font-semibold text-white">{inv.current_valuation}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">ROI</p>
                              <p className={`font-bold ${inv.roi_percent.startsWith("-") ? "text-red-400" : "text-emerald-400"}`}>
                                {inv.roi_percent}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white mb-4">Portfolio Insights</h2>
            
            <Card className="glass-card border-cyan-500/20 bg-gradient-to-br from-cyan-500/5 to-blue-500/5">
               <CardContent className="p-6">
                 <div className="flex items-center gap-2 mb-3 text-cyan-400">
                   <Sparkles className="w-4 h-4" />
                   <h3 className="font-bold text-sm uppercase tracking-wider">AI Analysis</h3>
                 </div>
                 <p className="text-sm text-white/70 leading-relaxed">
                   Your portfolio is heavily concentrated in <strong>FinTech</strong> (50%). While ROI is strong at <span className="text-emerald-400 font-semibold">+132%</span>, consider diversifying into Enterprise SaaS to hedge against regulatory risks. The "Project Alpha" deal offers the highest upside potential.
                 </p>
               </CardContent>
            </Card>

            <Card className="glass-card border-white/10">
               <CardContent className="p-6">
                 <h3 className="font-semibold text-white mb-2 text-sm">Sector Allocation</h3>
                 <div className="h-48">
                   <ResponsiveContainer width="100%" height="100%">
                     <PieChart>
                       <Pie
                         data={[
                           { name: "FinTech", value: 50 },
                           { name: "HealthTech", value: 25 },
                           { name: "SaaS", value: 25 }
                         ]}
                         cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={2} dataKey="value"
                       >
                         <Cell fill="#3b82f6" />
                         <Cell fill="#8b5cf6" />
                         <Cell fill="#10b981" />
                       </Pie>
                       <Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff" }} />
                     </PieChart>
                   </ResponsiveContainer>
                 </div>
                 <div className="flex justify-center gap-4 text-xs">
                    <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"/>FinTech</div>
                    <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500"/>HealthTech</div>
                    <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"/>SaaS</div>
                 </div>
               </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
