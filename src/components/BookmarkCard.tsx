'use client'

import { ExternalLink, Trash2, Calendar, Tag, Pencil } from 'lucide-react'
import { motion } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'

interface Bookmark {
  id: string
  title: string
  url: string
  created_at: string
  user_id: string
}

interface BookmarkCardProps {
  bookmark: Bookmark
  onDelete: (id: string) => void
  onEdit: (bookmark: Bookmark) => void
  isNew?: boolean
}

const getSmartTag = (url: string) => {
  try {
    const hostname = new URL(url).hostname.toLowerCase()
    if (hostname.includes('youtube.com') || hostname.includes('vimeo.com')) return 'Video'
    if (hostname.includes('github.com') || hostname.includes('gitlab.com')) return 'Code'
    if (hostname.includes('medium.com') || hostname.includes('substack.com')) return 'Article'
    if (hostname.includes('figma.com') || hostname.includes('dribbble.com')) return 'Design'
    if (hostname.includes('twitter.com') || hostname.includes('x.com') || hostname.includes('linkedin.com')) return 'Social'
    return 'Link'
  } catch {
    return 'Link'
  }
}

export function BookmarkCard({ bookmark, onDelete, onEdit, isNew }: BookmarkCardProps) {
  let hostname = ''
  try {
    hostname = new URL(bookmark.url).hostname.replace('www.', '')
  } catch {
    hostname = bookmark.url
  }

  const tag = getSmartTag(bookmark.url)
  const faviconUrl = `https://favicon.clearbit.com/${hostname}`

  return (
    <motion.div
      layout
      initial={isNew ? { opacity: 0, scale: 0.9, y: 20 } : false}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      whileHover={{ y: -4 }}
      className={cn(
        "group relative bg-card border border-border p-5 rounded-2xl shadow-sm transition-all duration-300 hover:shadow-md",
        isNew && "animate-glow border-green-500/30"
      )}
    >
      <div className="flex justify-between items-start gap-4">
        <div className="flex gap-4 items-start min-w-0 flex-1">
          <a
            href={bookmark.url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center overflow-hidden border border-border/50 shrink-0 hover:scale-110 transition-transform"
          >
            <img
              src={faviconUrl}
              alt={hostname}
              className="w-6 h-6 object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${hostname}&background=random`
              }}
            />
          </a>
          <div className="min-w-0 pr-4 flex-1">
            <a
              href={bookmark.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block group-hover:text-primary transition-colors"
            >
              <h3 className="font-semibold text-foreground truncate">
                {bookmark.title}
              </h3>
            </a>
            <p className="text-xs text-muted-foreground truncate mb-2">
              {hostname}
            </p>
            <div className="flex flex-wrap gap-2 items-center">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary text-[10px] font-medium text-muted-foreground border border-border/50">
                <Tag className="w-3 h-3" />
                {tag}
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground whitespace-nowrap">
                <Calendar className="w-3 h-3" />
                {formatDistanceToNow(new Date(bookmark.created_at), { addSuffix: true })}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-1 shrink-0">
          <button
            onClick={() => onEdit(bookmark)}
            className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-primary transition-colors"
            title="Edit Bookmark"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <a
            href={bookmark.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-primary transition-colors"
            title="Open Link"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
          <button
            onClick={() => onDelete(bookmark.id)}
            className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
            title="Delete Bookmark"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}
