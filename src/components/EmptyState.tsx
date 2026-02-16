'use client'

import { BookmarkPlus } from 'lucide-react'
import { motion } from 'framer-motion'

export function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-20 px-4 text-center"
    >
      <div className="w-24 h-24 rounded-3xl bg-secondary/50 flex items-center justify-center mb-6 relative">
        <BookmarkPlus className="w-12 h-12 text-muted-foreground" />
        <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold animate-bounce">
          !
        </div>
      </div>
      <h2 className="text-2xl font-semibold mb-2">No bookmarks yet</h2>
      <p className="text-muted-foreground max-w-sm mb-8">
        Your digital oasis is looking a bit empty. Start curating your favorite links to see them beautifully organized here.
      </p>
      <div className="flex gap-3">
        <div className="h-1 w-12 rounded-full bg-primary/20" />
        <div className="h-1 w-12 rounded-full bg-primary" />
        <div className="h-1 w-12 rounded-full bg-primary/20" />
      </div>
    </motion.div>
  )
}
