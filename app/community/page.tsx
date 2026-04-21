"use client";

import { DashboardLayout } from "@/components/dashboard-layout";
import { mockEntrepreneurs } from "@/lib/mock-data";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MessageSquare, Users, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function CommunityPage() {
  const router = useRouter();

  const handleConnect = (name: string) => {
    toast.success(`Connection request sent to ${name}`);
  };

  const handleMessage = () => {
    router.push("/messages");
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-white mb-2">Startup Founders</h1>
          <p className="text-muted-foreground text-sm">Discover and connect with top founders in the network.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockEntrepreneurs.map((ent, idx) => (
            <motion.div
              key={ent.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
            >
              <Card className="glass-card hover:bg-white/[0.04] transition-all border-border/40 group h-full flex flex-col hover:border-purple-500/30">
                <CardContent className="p-6 flex flex-col h-full flex-grow">
                  <div className="flex items-start gap-4 mb-4">
                    <Avatar className="w-14 h-14 border border-white/10 shrink-0">
                      <AvatarImage src={ent.photoUrl} />
                      <AvatarFallback className="bg-purple-500/20 text-purple-300 font-bold">
                        {ent.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-bold text-white text-base truncate">{ent.name}</h3>
                        {ent.verifiedFounder && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">Founder @ <span className="text-purple-300 font-medium">{ent.startupName}</span></p>
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-xl p-3 mb-4 flex items-center justify-between border border-white/10">
                    <div className="text-xs text-white/50 uppercase tracking-widest font-semibold">AI Score</div>
                    <div className="text-lg font-black text-cyan-400">{ent.score}</div>
                  </div>

                  <p className="text-sm text-white/70 line-clamp-2 mb-6 flex-grow">{ent.pitchSummary}</p>

                  <div className="grid grid-cols-2 gap-3 mt-auto">
                    <Button 
                      onClick={() => handleConnect(ent.name)}
                      variant="outline" 
                      size="sm" 
                      className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 hover:text-cyan-300"
                    >
                      <Users className="w-3.5 h-3.5 mr-2" /> Connect
                    </Button>
                    <Button 
                      onClick={handleMessage}
                      variant="outline" 
                      size="sm" 
                      className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10 hover:text-purple-300"
                    >
                      <MessageSquare className="w-3.5 h-3.5 mr-2" /> Message
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
