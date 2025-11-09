import clsx from 'clsx'
import React from 'react'

interface Props {
  className?: string
  loading?: 'lazy' | 'eager'
  priority?: 'auto' | 'high' | 'low'
}

export const Logo = (props: Props) => {
  const { className } = props

  return (
    <span
      role="text"
      className={clsx(
        'flex items-baseline gap-3 font-semibold tracking-tight text-emerald-900 dark:text-emerald-100',
        className,
      )}
    >
      <span className="text-xs uppercase tracking-[0.45em] text-emerald-700/85 dark:text-emerald-200/70">
        Advent of
      </span>
      <span className="rounded-full border border-emerald-200/80 bg-emerald-50 px-3 py-1 text-lg font-bold text-rose-600 shadow-sm dark:border-emerald-500/45 dark:bg-emerald-900/40 dark:text-rose-300">
        FS[i]
      </span>
    </span>
  )
}
