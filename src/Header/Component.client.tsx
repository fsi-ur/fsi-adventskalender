'use client'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import type { Header } from '@/payload-types'

import { Logo } from '@/components/Logo/Logo'
import { HeaderNav } from './Nav'

interface HeaderClientProps {
  data: Header
}

export const HeaderClient: React.FC<HeaderClientProps> = ({ data }) => {
  /* Storing the value in a useState to avoid hydration errors */
  const [theme, setTheme] = useState<string | null>(null)
  const { headerTheme, setHeaderTheme } = useHeaderTheme()
  const pathname = usePathname()

  useEffect(() => {
    setHeaderTheme(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  useEffect(() => {
    if (headerTheme && headerTheme !== theme) setTheme(headerTheme)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headerTheme])

  const [imageExists, setImageExists] = useState<boolean>(false)
  const logoUrl = `${process.env.NEXT_PUBLIC_SERVER_URL}/advent/api/media/file/Logo%20Font.svg`

  useEffect(() => {
    const checkImage = async () => {
      try {
        const res = await fetch(logoUrl, { method: 'GET' })
        if(res.ok) setImageExists(true)
      } catch {
        setImageExists(false)
      }
    }
    checkImage()
  })

  return (
    <header className="container relative z-20   " {...(theme ? { 'data-theme': theme } : {})}>
      <div className="py-8 flex justify-between">
        <Link href={process.env.NEXT_PUBLIC_SERVER_URL}>
          <Logo loading="eager" priority="high" className="invert dark:invert-0" logoUrl={logoUrl} useLogoImage={imageExists} />
        </Link>
      </div>
    </header>
  )
}
