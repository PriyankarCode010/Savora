export function Logo({ className }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
        <span className="text-xl font-light text-primary-foreground">✦</span>
      </div>
      <span className="text-2xl font-semibold tracking-tight">Savora</span>
    </div>
  )
}
