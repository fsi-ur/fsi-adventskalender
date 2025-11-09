'use client'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import React, { useEffect } from 'react'
import Snow from '@/components/Snow/Snow'

interface PageClientProps {
  slug: string
}

const PageClient: React.FC<PageClientProps> = ({ slug }) => {
  /* Force the header to be dark mode while we have an image behind it */
  const { setHeaderTheme } = useHeaderTheme()

  useEffect(() => {
    setHeaderTheme('light')
  }, [setHeaderTheme])

  return (
    <React.Fragment>
      {slug === 'home' && <Snow />}
    </React.Fragment>
  )
}

export default PageClient
