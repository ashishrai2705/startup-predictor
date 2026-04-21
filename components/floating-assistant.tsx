"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Bot, X, Send, Sparkles, Loader2, Minimize2, ChevronUp } from "lucide-react"
import { useUserMode } from "@/context/UserModeContext"
import ReactMarkdown from "react-markdown"

export function FloatingAssistant() {
  const { investorId, mode } = useUserMode()
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<{role: "user" | "assistant", content: string}[]>([
    { role: "assistant", content: "Hi! I'm your VC AI Co-pilot. Ask me to compare startups, analyze risks, or summarize a deal." }
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Will only render if mode === 'investor'

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    scrollToBottom()
  }, [messages, isOpen, isMinimized])

  const handleSend = async () => {
    if (!input.trim() || loading) return
    
    const userMsg = input.trim()
    setInput("")
    setMessages(prev => [...prev, { role: "user", content: userMsg }])
    setLoading(true)

    try {
      const res = await fetch("/api/investor/ai/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: userMsg, investor_id: investorId }),
      })
      const data = await res.json()
      if (res.ok && data.reply) {
         setMessages(prev => [...prev, { role: "assistant", content: data.reply }])
      } else {
         setMessages(prev => [...prev, { role: "assistant", content: "I'm having trouble connecting to my neural net right now. Please try again." }])
      }
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Network error occurred." }])
    } finally {
      setLoading(false)
    }
  }

  if (mode !== "investor") return null;

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => { setIsOpen(true); setIsMinimized(false); }}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 shadow-lg shadow-cyan-500/20 flex items-center justify-center border border-cyan-400/30 text-white"
          >
            <Bot className="w-6 h-6" />
            <motion.div 
               animate={{ rotate: 360 }} 
               transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
               className="absolute inset-0 rounded-full border border-white/20 border-t-transparent"
            />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              height: isMinimized ? "auto" : "500px",
            }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-6 right-6 z-50 w-[380px] bg-slate-900/95 backdrop-blur-2xl border border-cyan-500/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[80vh]"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-white/10 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 flex items-center justify-between cursor-pointer" onClick={() => setIsMinimized(!isMinimized)}>
              <div className="flex items-center gap-2 text-cyan-400">
                <Bot className="w-5 h-5" />
                <span className="font-bold text-sm">AI Co-pilot</span>
                <Sparkles className="w-3 h-3 ml-1 animate-pulse" />
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }}
                  className="p-1 hover:bg-white/10 rounded-md text-white/50 hover:text-white transition-colors"
                >
                  {isMinimized ? <ChevronUp className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
                  className="p-1 hover:bg-white/10 rounded-md text-white/50 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Chat Area */}
            {!isMinimized && (
              <>
                 <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                   {messages.map((m, i) => (
                     <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                       <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
                         m.role === "user" 
                           ? "bg-cyan-500 text-white rounded-br-sm" 
                           : "bg-white/10 text-white/90 rounded-bl-sm border border-white/5"
                       }`}>
                         {m.role === "assistant" ? (
                           <div className="prose prose-invert prose-p:leading-snug prose-sm max-w-none">
                             <ReactMarkdown>{m.content}</ReactMarkdown>
                           </div>
                         ) : (
                           m.content
                         )}
                       </div>
                     </div>
                   ))}
                   {loading && (
                     <div className="flex justify-start">
                       <div className="bg-white/5 border border-white/5 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-2 text-white/50 text-xs">
                         <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                         Analyzing data...
                       </div>
                     </div>
                   )}
                   <div ref={messagesEndRef} />
                 </div>

                 {/* Input Area */}
                 <div className="p-3 border-t border-white/10 bg-slate-900">
                   <form 
                     onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                     className="relative flex items-center"
                   >
                     <input
                       type="text"
                       value={input}
                       onChange={(e) => setInput(e.target.value)}
                       disabled={loading}
                       placeholder="Ask about a startup or market trend..."
                       className="w-full bg-white/5 border border-white/10 rounded-xl pl-4 pr-10 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-500/50 transition-all disabled:opacity-50"
                     />
                     <button
                       type="submit"
                       disabled={!input.trim() || loading}
                       className="absolute right-1.5 p-1.5 text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-colors disabled:opacity-50"
                     >
                       <Send className="w-4 h-4" />
                     </button>
                   </form>
                 </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
      `}} />
    </>
  )
}
