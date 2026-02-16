'use client'

import { supabase } from '@/lib/supabaseClient'
import { useState } from 'react'

export default function Home() {
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async () => {
    setIsLoading(true)
    try {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
      {/* Background decorative element */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 -right-1/3 w-96 h-96 rounded-full bg-accent/5 blur-3xl"></div>
        <div className="absolute -bottom-1/4 -left-1/4 w-96 h-96 rounded-full bg-secondary/5 blur-3xl"></div>
      </div>

      <div className="w-full max-w-md">
        {/* Logo / Branding */}
        <div className="mb-12 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-2xl font-light text-primary-foreground">✦</span>
            </div>
          </div>
          <h1 className="text-4xl font-light tracking-tight text-foreground mb-2">Savora</h1>
          <p className="text-muted-foreground font-light">
            Curate, organize, and discover your finest links
          </p>
        </div>

        {/* Value Propositions */}
        <div className="grid grid-cols-3 gap-3 mb-12">
          <div className="text-center">
            <div className="text-2xl mb-2">✨</div>
            <p className="text-sm font-medium text-foreground">Elegant</p>
            <p className="text-xs text-muted-foreground mt-1">Refined design</p>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-2">⚡</div>
            <p className="text-sm font-medium text-foreground">Instant</p>
            <p className="text-xs text-muted-foreground mt-1">Fast & responsive</p>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-2">🔐</div>
            <p className="text-sm font-medium text-foreground">Secure</p>
            <p className="text-xs text-muted-foreground mt-1">Your data protected</p>
          </div>
        </div>

        {/* Login Button */}
        <button
          onClick={handleLogin}
          disabled={isLoading}
          className="w-full py-3 px-6 bg-primary text-primary-foreground rounded-lg font-medium transition-all duration-200 hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
              <span>Signing in...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.48 10.92h8.84c.4-1.1.48-2.1.48-4.12 0-.88-.07-1.72-.32-2.65-.63-2.38-2.95-4.3-5.84-4.3-3.56 0-6.4 2.56-6.4 5.6 0 .08 0 .16 0 .24.02 1.68.01 3.36.02 5.04zm0 0c-.02-1.68-.03-3.36-.02-5.04 0-.08 0-.16 0-.24 0-3.04 2.84-5.6 6.4-5.6 2.89 0 5.21 1.92 5.84 4.3.25.93.32 1.77.32 2.65 0 2.02-.08 3.02-.48 4.12zm-12-3.05c1.7 0 3.08 1.38 3.08 3.08s-1.38 3.08-3.08 3.08-3.08-1.38-3.08-3.08 1.38-3.08 3.08-3.08zm0 6.16c2.44 0 4.42-1.98 4.42-4.42S2.44 4.24 0 4.24 -4.42 6.22 -4.42 8.66 -2.44 12.08 0 12.08z" />
              </svg>
              <span>Continue with Google</span>
            </>
          )}
        </button>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-8">
          By signing in, you agree to our <br className="hidden sm:inline" />
          <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
          {' '} and {' '}
          <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
        </p>
      </div>
    </div>
  )
}
