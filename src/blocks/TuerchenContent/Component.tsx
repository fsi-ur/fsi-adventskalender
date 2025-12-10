import React from 'react'
import { cn } from '@/utilities/ui'
import RichText from '@/components/RichText'
import { Media } from '@/components/Media'
import { Sudoku } from '@/components/Sudoku'
import { PresentTetris } from '@/components/Tetris'

import type { Media as MediaType } from '@/payload-types'
import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'

// Types will be auto-generated when running `payload generate:types`
// For now, define them inline to match the config
type TuerchenTextBlock = {
  blockType: 'tuerchenText'
  richText: DefaultTypedEditorState
}

type TuerchenImageBlock = {
  blockType: 'tuerchenImage'
  media: MediaType | string
  caption?: string | null
  size?: 'small' | 'default' | 'wide' | 'full' | null
}

type TuerchenSudokuBlock = {
  blockType: 'tuerchenSudoku'
  title?: string | null
  puzzleIndex?: '0' | '1' | '2' | 'custom' | null
  useSymbols?: boolean | null
  customPuzzle?: string | null
  customSolution?: string | null
}

type TuerchenTetrisBlock = {
  blockType: 'tuerchenTetris'
  title?: string | null
  difficulty?: 'easy' | 'medium' | 'hard' | null
  seedLayout?: number[][] | null
}

type TuerchenCustomBlock = {
  blockType: 'tuerchenCustom'
  type: 'quiz' | 'puzzle' | 'other'
  title?: string | null
  data?: Record<string, unknown> | null
}

type ContentBlock = TuerchenTextBlock | TuerchenImageBlock | TuerchenSudokuBlock | TuerchenTetrisBlock | TuerchenCustomBlock

type TuerchenContentBlockProps = {
  blockType: 'tuerchenContent'
  heading: string
  description?: string | null
  author?: string | null
  publishDate?: string | null
  contentBlocks: ContentBlock[]
}

type Props = TuerchenContentBlockProps & {
  className?: string
  disableInnerContainer?: boolean
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('de-DE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

// Parse a custom puzzle string into a SudokuPuzzle object
const parseSudokuPuzzle = (puzzleStr: string, solutionStr: string) => {
  const parseGrid = (str: string): (number | null)[][] => {
    const lines = str.trim().split('\n')
    return lines.map((line) =>
      line
        .trim()
        .split('')
        .map((char) => {
          const num = parseInt(char, 10)
          return num === 0 || isNaN(num) ? null : num
        })
    )
  }

  return {
    puzzle: parseGrid(puzzleStr),
    solution: parseGrid(solutionStr),
  }
}

export const TuerchenContentBlock: React.FC<Props> = (props) => {
  const { heading, description, author, publishDate, contentBlocks, className } = props

  return (
    <article
      className={cn(
        'w-full py-12',
        className,
      )}
    >
      {/* Article container - centered with max width for readability */}
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header section */}
        <header className="mb-10 md:mb-12">
          {/* Meta info: date and author */}
          {(publishDate || author) && (
            <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              {publishDate && (
                <time dateTime={publishDate}>
                  {formatDate(publishDate)}
                </time>
              )}
              {publishDate && author && (
                <span className="text-muted-foreground/50">•</span>
              )}
              {author && (
                <span className="font-medium">{author}</span>
              )}
            </div>
          )}

          {/* Main heading */}
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl lg:text-6xl">
            {heading}
          </h1>

          {/* Description/lead paragraph */}
          {description && (
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground sm:text-xl md:mt-6">
              {description}
            </p>
          )}
        </header>

        {/* Divider */}
        <hr className="mb-10 border-border md:mb-12" />

        {/* Content blocks */}
        <div className="space-y-8 md:space-y-10">
          {contentBlocks?.map((block, index) => {
            const { blockType } = block

            switch (blockType) {
              case 'tuerchenText':
                return (
                  <div key={index} className="prose prose-lg dark:prose-invert max-w-none prose-p:mb-0 prose-p:mt-0 prose-headings:font-semibold prose-headings:tracking-tight prose-p:leading-relaxed prose-a:text-primary prose-a:no-underline hover:prose-a:underline">
                    {'richText' in block && block.richText && (
                      <RichText
                        data={block.richText}
                        enableGutter={false}
                        enableProse={false}
                      />
                    )}
                  </div>
                )

              case 'tuerchenImage':
                return (
                  <figure
                    key={index}
                    className={cn(
                      'my-8 md:my-10',
                      {
                        'max-w-sm mx-auto': 'size' in block && block.size === 'small',
                        'max-w-none': 'size' in block && block.size === 'default',
                        '-mx-4 sm:-mx-6 lg:-mx-8 xl:-mx-16': 'size' in block && block.size === 'wide',
                        '-mx-4 sm:-mx-6 lg:-mx-8 xl:-mx-24 2xl:-mx-32': 'size' in block && block.size === 'full',
                      }
                    )}
                  >
                    {'media' in block && block.media && (
                      <Media
                        resource={block.media}
                        imgClassName="w-full h-auto rounded-lg border border-border shadow-sm"
                      />
                    )}
                    {'caption' in block && block.caption && (
                      <figcaption className="mt-3 text-center text-sm text-muted-foreground">
                        {block.caption}
                      </figcaption>
                    )}
                  </figure>
                )

              case 'tuerchenSudoku':
                return (
                  <div
                    key={index}
                    className="my-8 rounded-xl border border-border bg-card p-6 shadow-sm md:my-10 md:p-8"
                  >
                    <Sudoku
                      puzzleIndex={parseInt(block.puzzleIndex || '0', 10)}
                      useSymbols={block.useSymbols || false}
                      customPuzzle={
                        block.puzzleIndex === 'custom' && block.customPuzzle && block.customSolution
                          ? parseSudokuPuzzle(block.customPuzzle, block.customSolution)
                          : undefined
                      }
                    />
                  </div>
                )

              case 'tuerchenTetris':
                return (
                  <div key={index} className="my-8 md:my-10">
                    <PresentTetris title={block.title || "Santa's Chimney"} />
                  </div>
                )

              case 'tuerchenCustom':
                return (
                  <div
                    key={index}
                    className="my-8 rounded-xl border border-border bg-card p-6 shadow-sm md:my-10 md:p-8"
                  >
                    {'title' in block && block.title && (
                      <h3 className="mb-4 text-lg font-semibold text-card-foreground">
                        {block.title}
                      </h3>
                    )}
                    <div className="flex min-h-[200px] items-center justify-center rounded-lg bg-muted/50 text-muted-foreground">
                      {'type' in block && (
                        <div className="text-center">
                          <div className="mb-2 text-4xl">
                            {block.type === 'quiz' && '❓'}
                            {block.type === 'puzzle' && '🧩'}
                            {block.type === 'other' && '✨'}
                          </div>
                          <p className="text-sm capitalize">{block.type} - Coming Soon</p>
                        </div>
                      )}
                    </div>
                  </div>
                )

              default:
                return null
            }
          })}
        </div>
      </div>
    </article>
  )
}
