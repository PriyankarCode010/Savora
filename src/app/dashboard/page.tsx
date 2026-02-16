'use client'

import { useEffect, useState, useCallback } from 'react'
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
  const [error, setError] = useState<string | null>(null)

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
    fetchBookmarks()
  }, [fetchBookmarks])

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
      .insert({
        title,
        url,
        user_id: user.id,
      })
      .select()
      .single()

    if (error) {
      setError('Failed to add bookmark.')
      setBookmarks((prev) => prev.filter((b) => b.id !== tempId))
    } else {
      setBookmarks((prev) =>
        prev.map((b) => (b.id === tempId ? data : b))
      )
    }

    setIsAdding(false)
  }

  const deleteBookmark = async (id: string) => {
    const previous = bookmarks

    setBookmarks((prev) => prev.filter((b) => b.id !== id))

    const { error } = await supabase
      .from('bookmarks')
      .delete()
      .eq('id', id)

    if (error) {
      setBookmarks(previous)
      setError('Failed to delete bookmark.')
    }
  }

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
            setBookmarks((prev) => {
              const exists = prev.find((b) => b.id === payload.new.id)
              if (exists) return prev
              return [payload.new as Bookmark, ...prev]
            })
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-8">

      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-2xl font-semibold">Savora</h1>
          <p className="text-sm text-muted-foreground">
            {user?.email}
          </p>
        </div>
        <button
          onClick={logout}
          className="text-destructive hover:underline"
        >
          Sign Out
        </button>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={addBookmark} className="grid md:grid-cols-2 gap-4 mb-10">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="p-3 border rounded-lg"
          required
        />
        <input
          type="url"
          placeholder="https://example.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="p-3 border rounded-lg"
          required
        />
        <button
          type="submit"
          disabled={isAdding}
          className="md:col-span-2 bg-accent text-white p-3 rounded-lg"
        >
          {isAdding ? 'Adding...' : 'Add Bookmark'}
        </button>
      </form>

      {bookmarks.length === 0 ? (
        <p className="text-muted-foreground text-center">
          No bookmarks yet.
        </p>
      ) : (
        <div className="grid gap-4">
          {bookmarks.map((bookmark) => {
            let hostname = ''
            try {
              hostname = new URL(bookmark.url).hostname
            } catch {
              hostname = bookmark.url
            }

            return (
              <div
                key={bookmark.id}
                className="border rounded-lg p-5 flex justify-between items-start"
              >
                <div>
                  <a
                    href={bookmark.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-accent"
                  >
                    {bookmark.title}
                  </a>
                  <p className="text-sm text-muted-foreground">
                    {hostname}
                  </p>
                </div>

                <button
                  onClick={() => deleteBookmark(bookmark.id)}
                  className="text-destructive"
                >
                  ✕
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
//priyankar