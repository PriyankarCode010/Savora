'use client'

import { supabase } from '@/lib/supabaseClient'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles, Shield, Zap, Globe, Loader2 } from 'lucide-react'
import { Logo } from '@/components/Logo'
import { ThemeToggle } from '@/components/ThemeToggle'

export default function Home() {
  const router = useRouter()

  const [isLoading, setIsLoading] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      if (session) {
        router.replace('/dashboard')
      } else {
        setCheckingSession(false)
      }
    }

    checkSession()
  }, [router])

  const handleLogin = async () => {
    setError(null)
    setIsLoading(true)

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      })

      if (error) {
        setError('Failed to start authentication. Please try again.')
        setIsLoading(false)
      }
    } catch {
      setError('Something went wrong. Please try again.')
      setIsLoading(false)
    }
  }

  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary/50" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/10 overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-6">
            <ThemeToggle />
            <button
              onClick={handleLogin}
              className="hidden sm:block text-sm font-medium hover:text-primary transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={handleLogin}
              className="px-5 py-2.5 bg-primary text-primary-foreground rounded-full text-sm font-medium shadow-lg shadow-primary/20 hover:scale-105 transition-all active:scale-95"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-20">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary text-xs font-semibold tracking-wider uppercase text-muted-foreground border border-border/50 mb-8">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              The Future of Curating
            </span>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70">
              Your digital oasis,<br />beautifully organized.
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12 font-light leading-relaxed">
              Savora transforms your scattered links into a premium, smart collection. 
              Designed for curators who value aesthetics and efficiency.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={handleLogin}
                disabled={isLoading}
                className="w-full sm:w-auto px-8 py-4 bg-primary text-primary-foreground rounded-full text-lg font-semibold shadow-2xl shadow-primary/30 flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Sign up with Google <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </motion.div>

          {/* Dashboard Preview / Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-24 relative max-w-5xl mx-auto"
          >
            <div className="absolute inset-0 bg-primary/5 blur-[120px] -z-10 rounded-full" />
            <div className="rounded-3xl border border-border/50 bg-card/50 backdrop-blur-sm p-4 shadow-2xl overflow-hidden aspect-[16/10] md:aspect-[16/9]">
               <div className="w-full h-full rounded-2xl bg-secondary/30 flex items-center justify-center border border-border/20">
                  <div className="flex flex-col items-center gap-4 text-muted-foreground opacity-40">
                    <Globe className="w-16 h-16" />
                    <p className="font-medium tracking-widest uppercase text-xs">Premium Dashboard Preview</p>
                  </div>
               </div>
            </div>
          </motion.div>
        </section>

        {/* Features */}
        <section className="max-w-7xl mx-auto px-6 py-32 grid md:grid-cols-3 gap-12">
          {[
            {
              icon: Zap,
              title: "Real-time Sync",
              desc: "Changes reflect instantly across all your devices and tabs without refreshing."
            },
            {
              icon: Shield,
              title: "Private & Secure",
              desc: "Built on Supabase with robust RLS policies. Your data is yours alone."
            },
            {
              icon: Sparkles,
              title: "Smart Tagging",
              desc: "Automated organization based on source. YouTube is video, GitHub is code."
            }
          ].map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group p-8 rounded-3xl border border-border/50 hover:bg-secondary/30 transition-all text-left"
            >
              <div className="w-14 h-14 rounded-2xl bg-primary/5 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                <feature.icon className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </section>

        {error && (
          <div className="max-w-md mx-auto mt-8 p-4 bg-destructive/10 text-destructive rounded-2xl text-sm text-center font-medium border border-destructive/20">
            {error}
          </div>
        )}
      </main>

      <footer className="border-t border-border/30 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <Logo />
          <div className="flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
            <span className="">© 2026 Savora</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
