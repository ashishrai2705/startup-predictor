"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Heart, Check, X, Eye, Handshake, Video, TrendingUp, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useUserMode } from "@/context/UserModeContext";

type NotificationType = "like" | "view" | "accept" | "pitch" | "fund";

interface Notification {
  id: number;
  type: NotificationType;
  user: string;
  avatar?: string;
  action: string;
  time: string;
  read: boolean;
}

const getIcon = (type: NotificationType) => {
  switch (type) {
    case "like": return <Heart className="w-4 h-4 fill-pink-500 text-pink-500" />;
    case "view": return <Eye className="w-4 h-4 text-purple-400" />;
    case "accept": return <Handshake className="w-4 h-4 text-emerald-500" />;
    case "pitch": return <Video className="w-4 h-4 text-cyan-400" />;
    case "fund": return <TrendingUp className="w-4 h-4 text-amber-500" />;
    default: return <Bell className="w-4 h-4 text-white/50" />;
  }
};

export default function NotificationsPage() {
  const { investorId } = useUserMode();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const res = await fetch(`/api/notifications?investor_id=${investorId || ""}`);
        if (!res.ok) throw new Error("Failed to load");
        const data = await res.json();
        setNotifications(data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load notifications");
      } finally {
        setLoading(false);
      }
    };
    fetchNotifs();
  }, [investorId]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    toast.success("All notifications marked as read");
  };

  const handleAction = (id: number, actionType: "accept" | "decline") => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    toast.success(actionType === "accept" ? "Request accepted" : "Request declined");
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
              <Bell className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                Activity
                {unreadCount > 0 && (
                  <span className="bg-pink-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                    {unreadCount} New
                  </span>
                )}
              </h1>
            </div>
          </div>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllRead} className="text-white/50 hover:text-white">
              Mark all read
            </Button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {notifications.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  className="text-center py-20 text-white/30"
                >
                  <Bell className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p>No new activity</p>
                </motion.div>
              ) : (
                notifications.map((notif, idx) => (
                  <motion.div
                    key={notif.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2, delay: idx * 0.05 }}
                    layout
                  >
                    <div className={`p-4 rounded-2xl flex items-start gap-4 transition-all duration-300 ${
                      !notif.read ? 'bg-white/[0.04] border border-white/10 hover:bg-white/[0.06]' : 'hover:bg-white/[0.02]'
                    }`}>
                      <div className="relative shrink-0">
                        <Avatar className="w-12 h-12 border border-white/10">
                          <AvatarImage src={notif.avatar} />
                          <AvatarFallback className="bg-purple-500/20 text-purple-300 font-bold">
                            {notif.user[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center shadow-lg">
                          {getIcon(notif.type)}
                        </div>
                      </div>

                      <div className="flex-1 min-w-0 pt-1">
                        <p className="text-sm text-white/80 leading-snug">
                          <span className="font-bold text-white mr-1.5">{notif.user}</span>
                          {notif.action}
                        </p>
                        <span className="text-xs text-white/40 mt-1 block">
                          {notif.time}
                        </span>
                        
                        {!notif.read && (notif.action.includes("connection request") || notif.type === "accept" && notif.action.includes("request")) && (
                          <div className="mt-3 flex gap-2">
                            <Button 
                              size="sm" 
                              onClick={() => handleAction(notif.id, "accept")}
                              className="bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 h-8 text-xs border border-cyan-500/30"
                            >
                              <Check className="w-3.5 h-3.5 mr-1" /> Accept
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleAction(notif.id, "decline")}
                              className="h-8 text-xs border-white/10 hover:bg-red-500/10 hover:text-red-400 text-white/60"
                            >
                              <X className="w-3.5 h-3.5 mr-1" /> Decline
                            </Button>
                          </div>
                        )}
                      </div>
                      
                      {!notif.read && (
                        <div className="w-2 h-2 rounded-full bg-cyan-400 shrink-0 mt-3 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
