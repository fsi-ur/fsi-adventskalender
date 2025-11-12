import clsx from 'clsx'
import React from 'react'

interface Props {
  className?: string
  loading?: 'lazy' | 'eager'
  priority?: 'auto' | 'high' | 'low'
  logoUrl?: string
  useLogoImage?: boolean
}

export const Logo = ({ className, logoUrl, useLogoImage }: Props) => {
  return (
    <span
      role="text"
      className={clsx(
        'flex items-center gap-3 font-semibold tracking-tight text-emerald-900 dark:text-emerald-100',
        className,
      )}
    >
      {useLogoImage ? (
        <img
          src={logoUrl}
          alt="FS[i]"
          className="object-contain w-12 h-12"
          loading="lazy"
        />
        ):(<span className="rounded-full border border-emerald-200/80 bg-emerald-50 px-3 py-1 text-lg font-bold text-rose-600 shadow-sm dark:border-emerald-500/45 dark:bg-emerald-900/40 dark:text-rose-300">
          FS[i]
        </span>
      )}
    </span>
  )
}
