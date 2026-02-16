'use client'

import { Bookmark, Hash, Clock } from 'lucide-react'
import { motion } from 'framer-motion'

interface StatsBarProps {
  total: number
  topDomain: string
  lastAdded: string
}

export function StatsBar({ total, topDomain, lastAdded }: StatsBarProps) {
  const stats = [
    {
      label: 'Total Bookmarks',
      value: total,
      icon: Bookmark,
    },
    {
      label: 'Top Source',
      value: topDomain || 'None',
      icon: Hash,
    },
    {
      label: 'Last Added',
      value: lastAdded || 'Never',
      icon: Clock,
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="p-4 rounded-2xl bg-card border border-border shadow-sm flex items-center gap-4"
        >
          <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-primary">
            <stat.icon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {stat.label}
            </p>
            <p className="text-lg font-semibold truncate max-w-[150px]">
              {stat.value}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
