"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  ArrowRight,
  Sparkles,
  TrendingUp,
  Target,
  Brain,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 },
  },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

export default function LandingPage() {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  return (
    <div className="min-h-screen text-white bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* NAVBAR - Floating Glass */}
      <motion.nav 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-5xl"
      >
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-6 py-4 flex items-center justify-between shadow-2xl">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-base text-white group-hover:text-cyan-300 transition-colors">StartupPredictor</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link href="/dashboard" className="text-white/70 hover:text-white transition-colors text-sm font-medium">
              Dashboard
            </Link>
            <Link href="/predict" className="text-white/70 hover:text-white transition-colors text-sm font-medium">
              Predict
            </Link>
            <Link href="/analytics" className="text-white/70 hover:text-white transition-colors text-sm font-medium">
              Analytics
            </Link>
          </div>

          <Button asChild className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white border-0 shadow-lg">
            <Link href="/predict">Get Started</Link>
          </Button>
        </div>
      </motion.nav>

      {/* HERO */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden min-h-screen flex items-center justify-center">
        {/* Background Image */}
        <div className="absolute inset-0 -z-20">
          <Image 
            src="https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1600&h=900&fit=crop"
            alt="AI Technology Background"
            fill
            className="object-cover"
            priority
          />
        </div>
        
        {/* Multi-layer Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/80 via-slate-900/70 to-blue-950/80 -z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent -z-10" />
        
        {/* Animated Gradient Orbs */}
        <div className="absolute top-20 right-10 w-96 h-96 bg-gradient-to-br from-cyan-500/20 to-transparent rounded-full blur-3xl -z-10 animate-pulse" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-gradient-to-tr from-blue-600/20 to-transparent rounded-full blur-3xl -z-10" />

        <motion.div 
          className="max-w-4xl mx-auto text-center relative z-10"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div 
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-400/50 bg-cyan-500/20 backdrop-blur-md mb-8 text-sm text-cyan-200 shadow-lg"
          >
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            AI-Powered Startup Intelligence
          </motion.div>

          <motion.h1 
            variants={itemVariants}
            className="text-6xl md:text-7xl font-black leading-tight mb-6 text-white drop-shadow-2xl"
          >
            Predict Startup<br />
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">Success Instantly</span>
          </motion.h1>

          <motion.p 
            variants={itemVariants}
            className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto mb-12 leading-relaxed drop-shadow-lg font-light"
          >
            Analyze funding patterns, team dynamics, market signals, and growth indicators to make data-driven investment decisions.
          </motion.p>

          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row justify-center gap-4"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 px-10 py-7 text-lg rounded-xl shadow-2xl hover:shadow-cyan-500/50 transition-all text-white font-bold border-0 backdrop-blur"
              >
                <Link href="/predict" className="flex items-center gap-3">
                  Start Predicting
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button asChild size="lg" className="px-10 py-7 text-lg rounded-xl border-2 border-white/40 hover:border-white/60 bg-white/10 hover:bg-white/20 transition-all text-white font-bold backdrop-blur-lg shadow-lg hover:shadow-xl">
                <Link href="/dashboard" className="flex items-center gap-3">View Dashboard</Link>
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* DASHBOARD PREVIEW */}
      <motion.section 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true, margin: "-100px" }}
        className="py-24 px-6 relative"
      >
        <div className="absolute inset-0 -z-10">
          <Image 
            src="https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=1600&h=900&fit=crop"
            alt="Dashboard Background"
            fill
            className="object-cover opacity-40"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/50 to-slate-950/80 -z-10" />

        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-bold mb-4 text-white">Powerful Dashboard</h2>
            <p className="text-white/70 text-lg max-w-2xl mx-auto">
              All the tools you need to evaluate startup potential in one intuitive interface.
            </p>
          </motion.div>

          <div className="relative flex justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02, y: -10 }}
              className="w-full max-w-5xl"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl hover:shadow-cyan-500/30 transition-shadow">
                <Image
                  src="/dashboard.png"
                  width={1200}
                  height={700}
                  alt="Startup Predictor Dashboard"
                  className="w-full h-auto border border-white/20 rounded-2xl backdrop-blur"
                  priority
                />
                {/* Glass overlay effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 via-transparent to-transparent rounded-2xl pointer-events-none" />
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* FEATURES */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true, margin: "-100px" }}
        className="py-24 px-6 relative"
      >
        <div className="absolute inset-0 -z-10">
          <Image 
            src="https://images.unsplash.com/photo-1518779578993-ec3579fee39f?w=1600&h=900&fit=crop"
            alt="Features Background"
            fill
            className="object-cover opacity-30"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 to-slate-950/85 -z-10" />

        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl font-bold mb-4 text-white">Powerful Features</h2>
            <p className="text-white/70 text-lg max-w-2xl mx-auto">
              Advanced analytics to assess startup viability with precision
            </p>
          </motion.div>

          <motion.div 
            className="grid md:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            {[
              {
                icon: Brain,
                title: "AI Analysis",
                description: "Machine learning algorithms evaluate startup patterns and success indicators.",
              },
              {
                icon: TrendingUp,
                title: "Growth Metrics",
                description: "Track funding trends and team dynamics that indicate startup potential.",
              },
              {
                icon: Target,
                title: "Success Probability",
                description: "Get data-driven predictions to guide investment and strategic decisions.",
              },
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                onHoverStart={() => setHoveredFeature(idx)}
                onHoverEnd={() => setHoveredFeature(null)}
                whileHover={{ y: -8, boxShadow: "0 20px 60px rgba(34, 197, 234, 0.2)" }}
                className="group rounded-2xl border border-cyan-400/30 bg-white/10 backdrop-blur-xl p-8 hover:border-cyan-400/60 hover:bg-cyan-500/10 transition-all duration-300 shadow-2xl"
              >
                <div className="relative z-10">
                  <feature.icon className="w-12 h-12 text-cyan-400 mb-6 group-hover:scale-110 transition-transform" />
                  <h3 className="text-xl font-bold mb-3 text-white">{feature.title}</h3>
                  <p className="text-white/70 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* CTA */}
      <motion.section 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true, margin: "-100px" }}
        className="py-24 px-6 relative"
      >
        <div className="absolute inset-0 -z-10">
          <Image 
            src="https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1600&h=900&fit=crop"
            alt="CTA Background"
            fill
            className="object-cover opacity-40"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/80 via-slate-900/75 to-blue-950/80 -z-10" />

        <motion.div 
          className="max-w-3xl mx-auto text-center border border-cyan-400/40 rounded-2xl p-12 bg-white/10 hover:bg-white/15 backdrop-blur-xl shadow-2xl hover:shadow-cyan-500/30 transition-all"
        >
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            viewport={{ once: true }}
            className="text-4xl font-bold mb-4 text-white"
          >
            Ready to Transform Your Analysis?
          </motion.h2>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-white/80 mb-10 text-lg leading-relaxed"
          >
            Start using our AI-powered prediction engine to make smarter, data-driven investment decisions today.
          </motion.p>

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 px-12 py-7 text-lg rounded-xl shadow-2xl hover:shadow-cyan-500/50 transition-all text-white font-bold border-0"
            >
              <Link href="/predict" className="flex items-center gap-3">
                Start Your Analysis
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* FOOTER */}
      <motion.footer 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        viewport={{ once: true }}
        className="border-t border-white/10 py-16 px-6 bg-gradient-to-b from-slate-950 to-slate-900"
      >
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 mb-8">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-base text-white group-hover:text-cyan-300 transition-colors">StartupPredictor</span>
          </Link>

          <div className="flex items-center gap-10 text-white/70 text-sm">
            <Link href="/about" className="hover:text-white transition-colors font-medium">About</Link>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors font-medium">
              GitHub
            </a>
            <a href="mailto:contact@example.com" className="hover:text-white transition-colors font-medium">
              Contact
            </a>
          </div>
        </div>
        <div className="text-center text-sm text-white/50 pt-8 border-t border-white/10">
          © 2026 StartupPredictor. All rights reserved. | Powered by AI
        </div>
      </motion.footer>
    </div>
  );
}