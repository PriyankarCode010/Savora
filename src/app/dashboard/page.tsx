'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, LogOut, Search, Loader2 } from 'lucide-react'

import { Logo } from '@/components/Logo'
import { ThemeToggle } from '@/components/ThemeToggle'
import { LiveIndicator } from '@/components/LiveIndicator'
import { StatsBar } from '@/components/StatsBar'
import { BookmarkCard } from '@/components/BookmarkCard'
import { EmptyState } from '@/components/EmptyState'
import { EditBookmarkModal } from '@/components/EditBookmarkModal'
import { cn } from '@/lib/utils'

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
  const [newBookmarkIds, setNewBookmarkIds] = useState<Set<string>>(new Set())
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null)

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        router.replace('/')
        return
      }

      setUser(session.user)
      setLoading(false)
    }

    init()

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!session) router.replace('/')
      }
    )

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [router])

  const fetchBookmarks = useCallback(async () => {
    if (!user) return

    const { data, error } = await supabase
      .from('bookmarks')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) {
      setBookmarks(data)
    }
  }, [user])

  useEffect(() => {
    if (user) fetchBookmarks()
  }, [user, fetchBookmarks])

  // Real-time Subscription
  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel('bookmarks-realtime')
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
            const newBookmark = payload.new as Bookmark
            setBookmarks((prev) => {
              const exists = prev.find((b) => b.id === newBookmark.id)
              if (exists) return prev
              return [newBookmark, ...prev]
            })
            // Track new bookmarks for glow effect
            setNewBookmarkIds((prev) => new Set(prev).add(newBookmark.id))
            setTimeout(() => {
              setNewBookmarkIds((prev) => {
                const next = new Set(prev)
                next.delete(newBookmark.id)
                return next
              })
            }, 3000)
          }

          if (payload.eventType === 'UPDATE') {
            const updated = payload.new as Bookmark
            setBookmarks((prev) => prev.map((b) => (b.id === updated.id ? updated : b)))
          }

          if (payload.eventType === 'DELETE') {
            setBookmarks((prev) => prev.filter((b) => b.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  const addBookmark = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !url || !user) return

    setError(null)
    setIsAdding(true)

    const tempId = crypto.randomUUID()
    const optimisticBookmark: Bookmark = {
      id: tempId,
      title,
      url,
      user_id: user.id,
      created_at: new Date().toISOString(),
    }

    setBookmarks((prev) => [optimisticBookmark, ...prev])
    setTitle('')
    setUrl('')

    const { data, error } = await supabase
      .from('bookmarks')
      .insert({ title, url, user_id: user.id })
      .select()
      .single()

    if (error) {
      setError('Failed to add bookmark. Please try again.')
      setBookmarks((prev) => prev.filter((b) => b.id !== tempId))
    } else {
      setBookmarks((prev) => prev.map((b) => (b.id === tempId ? data : b)))
      setNewBookmarkIds((prev) => new Set(prev).add(data.id))
      setTimeout(() => {
        setNewBookmarkIds((prev) => {
          const next = new Set(prev)
          next.delete(data.id)
          return next
        })
      }, 3000)
    }

    setIsAdding(false)
  }

  const updateBookmark = async (id: string, updatedTitle: string, updatedUrl: string) => {
    const previous = bookmarks
    setBookmarks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, title: updatedTitle, url: updatedUrl } : b))
    )

    const { error } = await supabase
      .from('bookmarks')
      .update({ title: updatedTitle, url: updatedUrl })
      .eq('id', id)

    if (error) {
      setBookmarks(previous)
      setError('Failed to update bookmark.')
      throw error
    }
  }

  const deleteBookmark = async (id: string) => {
    const previous = bookmarks
    setBookmarks((prev) => prev.filter((b) => b.id !== id))

    const { error } = await supabase.from('bookmarks').delete().eq('id', id)

    if (error) {
      setBookmarks(previous)
      setError('Failed to delete bookmark.')
    }
  }

  const handleEditClick = (bookmark: Bookmark) => {
    setEditingBookmark(bookmark)
    setIsEditModalOpen(true)
  }

  const logout = async () => {
    await supabase.auth.signOut()
    router.replace('/')
  }

  const stats = useMemo(() => {
    const total = bookmarks.length
    const domains = bookmarks.map(b => {
      try { return new URL(b.url).hostname.replace('www.', '') } 
      catch { return '' }
    }).filter(d => d !== '')
    
    const modeMap: Record<string, number> = {}
    let topDomain = ''
    let maxCount = 0
    domains.forEach(d => {
      modeMap[d] = (modeMap[d] || 0) + 1
      if (modeMap[d] > maxCount) {
        maxCount = modeMap[d]
        topDomain = d
      }
    })

    const lastAdded = bookmarks.length > 0 ? bookmarks[0].created_at : ''
    
    return { total, topDomain, lastAdded }
  }, [bookmarks])

  const filteredBookmarks = bookmarks.filter(b => 
    b.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    b.url.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-2xl bg-primary/10 animate-pulse" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          </div>
          <p className="text-sm font-medium text-muted-foreground">Preparing your oasis...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 h-20 flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-4">
            <LiveIndicator />
            <div className="h-6 w-[1px] bg-border mx-2 hidden sm:block" />
            <ThemeToggle />
            <button
              onClick={logout}
              className="p-2.5 rounded-xl hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-10">
        <StatsBar {...stats} />

        {/* Action Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-10 items-stretch md:items-center">
          <form onSubmit={addBookmark} className="flex-1 flex gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Bookmark title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full h-12 pl-4 pr-4 rounded-xl bg-card border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                required
              />
            </div>
            <div className="relative flex-[1.5]">
              <input
                type="url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full h-12 pl-4 pr-4 rounded-xl bg-card border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isAdding}
              className="h-12 px-6 bg-primary text-primary-foreground rounded-xl font-medium shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center gap-2 shrink-0"
            >
              {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              <span className="hidden sm:inline">Add</span>
            </button>
          </form>

          <div className="h-10 w-[1px] bg-border mx-2 hidden md:block" />

          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search bookmarks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-11 pr-4 rounded-xl bg-card border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
            />
          </div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-destructive/10 text-destructive rounded-xl text-sm font-medium border border-destructive/20"
          >
            {error}
          </motion.div>
        )}

        {/* Bookmarks Grid */}
        <div className="relative">
          <AnimatePresence mode="popLayout" initial={false}>
            {filteredBookmarks.length === 0 ? (
              <EmptyState key="empty" />
            ) : (
              <motion.div
                key="grid"
                className="grid grid-cols-1 lg:grid-cols-2 gap-6"
              >
                {filteredBookmarks.map((bookmark) => (
                  <BookmarkCard
                    key={bookmark.id}
                    bookmark={bookmark}
                    onDelete={deleteBookmark}
                    onEdit={handleEditClick}
                    isNew={newBookmarkIds.has(bookmark.id)}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer / User Info */}
      <footer className="max-w-6xl mx-auto px-4 py-12 border-t border-border/30 mt-10">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
               {user?.user_metadata?.avatar_url ? (
                 <img src={user.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" />
               ) : (
                 <span className="text-xs font-bold text-primary">{user?.email?.[0].toUpperCase()}</span>
               )}
            </div>
            <span>Logged in as <span className="text-foreground font-medium">{user?.email}</span></span>
          </div>
          <p>© 2026 Savora. Your digital sanctuary.</p>
        </div>
      </footer>

      <EditBookmarkModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={updateBookmark}
        bookmark={editingBookmark}
      />
    </div>
  )
}
