'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

interface Bookmark {
  id: string
  title: string
  url: string
  created_at: string
  user_id: string
}

export default function Dashboard() {
  const router = useRouter()

  const [user, setUser] = useState<any>(null)
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)

  useEffect(() => {
    const loadUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        router.replace('/')
      } else {
        setUser(session.user)
        fetchBookmarks()
        setLoading(false)
      }
    }

    loadUser()

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!session) router.replace('/')
      }
    )

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [router])

  const fetchBookmarks = async () => {
    const { data, error } = await supabase
      .from('bookmarks')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) {
      setBookmarks(data)
    }
  }

  const addBookmark = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !url || !user) return

    setIsAdding(true)
    try {
      const { error } = await supabase.from('bookmarks').insert({
        title,
        url,
        user_id: user.id,
      })

      if (!error) {
        setTitle('')
        setUrl('')
      }
    } finally {
      setIsAdding(false)
    }
  }

  const deleteBookmark = async (id: string) => {
    await supabase.from('bookmarks').delete().eq('id', id)
  }

  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel('bookmarks-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookmarks',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setBookmarks((prev) => [payload.new as Bookmark, ...prev])
          }

          if (payload.eventType === 'DELETE') {
            setBookmarks((prev) =>
              prev.filter((b) => b.id !== payload.old.id)
            )
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  const logout = async () => {
    await supabase.auth.signOut()
    router.replace('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your collection...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Background decorative elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -right-1/3 w-96 h-96 rounded-full bg-accent/5 blur-3xl"></div>
        <div className="absolute -bottom-1/4 -left-1/4 w-96 h-96 rounded-full bg-secondary/5 blur-3xl"></div>
      </div>

      {/* Header */}
      <header className="border-b border-border sticky top-0 bg-background/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-xl font-light text-primary-foreground">✦</span>
              </div>
              <h1 className="text-2xl font-light tracking-tight">Savora</h1>
            </div>
            <p className="text-sm text-muted-foreground">Welcome back, {user?.email}</p>
          </div>
          <button
            onClick={logout}
            className="px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Add Bookmark Section */}
        <div className="mb-12">
          <h2 className="text-lg font-medium mb-4 text-foreground">Add New Bookmark</h2>
          <form onSubmit={addBookmark} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Title
                </label>
                <input
                  type="text"
                  placeholder="e.g., Design Inspiration"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  URL
                </label>
                <input
                  type="url"
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={isAdding || !title || !url}
              className="w-full md:w-auto px-8 py-3 bg-accent text-accent-foreground font-medium rounded-lg hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {isAdding ? (
                <>
                  <div className="w-4 h-4 border-2 border-accent-foreground/30 border-t-accent-foreground rounded-full animate-spin"></div>
                  <span>Adding...</span>
                </>
              ) : (
                <>
                  <span>+</span>
                  <span>Save Bookmark</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Bookmarks Section */}
        <div>
          <h2 className="text-lg font-medium mb-6 text-foreground">
            Your Collection
            {bookmarks.length > 0 && (
              <span className="text-muted-foreground font-normal ml-2">
                ({bookmarks.length} {bookmarks.length === 1 ? 'item' : 'items'})
              </span>
            )}
          </h2>

          {bookmarks.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-4xl mb-4 opacity-30">📚</div>
              <p className="text-muted-foreground mb-4">No bookmarks yet</p>
              <p className="text-sm text-muted-foreground">
                Add your first bookmark to get started building your collection
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {bookmarks.map((bookmark) => (
                <div
                  key={bookmark.id}
                  className="group bg-card border border-border rounded-lg p-6 hover:border-accent/50 transition-all hover:shadow-sm"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <a
                        href={bookmark.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent hover:text-accent/80 font-medium mb-2 block truncate transition-colors"
                        title={bookmark.title}
                      >
                        {bookmark.title}
                      </a>
                      <p className="text-sm text-muted-foreground truncate">
                        {new URL(bookmark.url).hostname}
                      </p>
                      <time className="text-xs text-muted-foreground/70 mt-2 block">
                        {new Date(bookmark.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </time>
                    </div>
                    <button
                      onClick={() => deleteBookmark(bookmark.id)}
                      className="px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                      title="Delete bookmark"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
