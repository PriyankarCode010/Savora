'use client'

import { supabase } from '@/lib/supabaseClient'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4 relative overflow-hidden">

      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 -right-1/3 w-96 h-96 rounded-full bg-accent/5 blur-3xl"></div>
        <div className="absolute -bottom-1/4 -left-1/4 w-96 h-96 rounded-full bg-secondary/5 blur-3xl"></div>
      </div>

      <div className="w-full max-w-md">

        <div className="mb-12 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-2xl font-light text-primary-foreground">✦</span>
            </div>
          </div>
          <h1 className="text-4xl font-light tracking-tight mb-2">
            Savora
          </h1>
          <p className="text-muted-foreground font-light">
            Curate, organize, and discover your finest links
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-destructive/10 text-destructive rounded-lg text-sm text-center">
            {error}
          </div>
        )}

        <button
          onClick={handleLogin}
          disabled={isLoading}
          aria-busy={isLoading}
          className="w-full py-3 px-6 bg-primary text-primary-foreground rounded-lg font-medium transition-all duration-200 hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
              <span>Signing in...</span>
            </>
          ) : (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 48 48"
                className="w-5 h-5"
              >
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.7 1.22 9.2 3.6l6.9-6.9C35.6 2.3 30.2 0 24 0 14.8 0 6.7 5.2 2.6 12.8l8 6.2C12.6 13.3 17.8 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.4c-.5 2.7-2 5-4.3 6.6l6.8 5.3c4-3.7 6.2-9.1 6.2-16.4z"/>
                <path fill="#FBBC05" d="M10.6 28.9c-.6-1.8-1-3.7-1-5.9s.4-4.1 1-5.9l-8-6.2C1 14.5 0 19.1 0 23s1 8.5 2.6 12.1l8-6.2z"/>
                <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.8-5.7l-6.8-5.3c-2 1.3-4.6 2-9 2-6.2 0-11.4-3.8-13.4-9.5l-8 6.2C6.7 42.8 14.8 48 24 48z"/>
              </svg>
              <span>Continue with Google</span>
            </>
          )}
        </button>

        <p className="text-center text-xs text-muted-foreground mt-8">
          By signing in, you agree to our{' '}
          <a href="#" className="hover:text-foreground transition-colors">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="#" className="hover:text-foreground transition-colors">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  )
}
