import type { Block } from 'payload'

import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

/**
 * Text block for rich text content within TuerchenContent
 */
const TextBlock: Block = {
  slug: 'tuerchenText',
  interfaceName: 'TuerchenTextBlock',
  labels: {
    singular: 'Text',
    plural: 'Text Blocks',
  },
  fields: [
    {
      name: 'richText',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [
            ...rootFeatures,
            HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
            FixedToolbarFeature(),
            InlineToolbarFeature(),
          ]
        },
      }),
      label: false,
      required: true,
    },
  ],
}

/**
 * Image block for media within TuerchenContent
 */
const ImageBlock: Block = {
  slug: 'tuerchenImage',
  interfaceName: 'TuerchenImageBlock',
  labels: {
    singular: 'Image',
    plural: 'Images',
  },
  fields: [
    {
      name: 'media',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'caption',
      type: 'text',
      admin: {
        description: 'Optional caption for the image',
      },
    },
    {
      name: 'size',
      type: 'select',
      defaultValue: 'default',
      options: [
        { label: 'Small (inline)', value: 'small' },
        { label: 'Default', value: 'default' },
        { label: 'Wide', value: 'wide' },
        { label: 'Full Width', value: 'full' },
      ],
    },
  ],
}

/**
 * Sudoku block for interactive Christmas-themed Sudoku puzzles
 */
const SudokuBlock: Block = {
  slug: 'tuerchenSudoku',
  interfaceName: 'TuerchenSudokuBlock',
  labels: {
    singular: 'Sudoku',
    plural: 'Sudokus',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      defaultValue: 'Weihnachts-Sudoku',
      admin: {
        description: 'Title displayed above the Sudoku',
      },
    },
    {
      name: 'puzzleIndex',
      type: 'select',
      defaultValue: '0',
      options: [
        { label: 'Puzzle 1 (Easy)', value: '0' },
        { label: 'Puzzle 2 (Easy)', value: '1' },
        { label: 'Puzzle 3 (Medium)', value: '2' },
      ],
      admin: {
        description: 'Select a pre-made puzzle or use custom',
      },
    },
    {
      name: 'useSymbols',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Start with Christmas symbols instead of numbers',
      },
    },
    {
      name: 'customPuzzle',
      type: 'textarea',
      admin: {
        description:
          'Optional: Enter a custom puzzle as a 9x9 grid. Use numbers 1-9 for filled cells and 0 for empty cells. Format: 9 rows of 9 digits separated by newlines. Example:\n530070000\n600195000\n098000060\n800060003\n400803001\n700020006\n060000280\n000419005\n000080079',
        condition: (_, siblingData) => siblingData?.puzzleIndex === 'custom',
      },
    },
    {
      name: 'customSolution',
      type: 'textarea',
      admin: {
        description: 'Optional: The solution for the custom puzzle (same format as puzzle)',
        condition: (_, siblingData) => siblingData?.puzzleIndex === 'custom',
      },
    },
  ],
}

/**
 * Tetris block for interactive Christmas-themed Tetris game
 */
const TetrisBlock: Block = {
  slug: 'tuerchenTetris',
  interfaceName: 'TuerchenTetrisBlock',
  labels: {
    singular: 'Tetris',
    plural: 'Tetris Games',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      defaultValue: 'Weihnachts-Tetris',
      admin: {
        description: 'Title displayed above the Tetris game',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Optional description shown below the title',
      },
    },
  ],
}

/**
 * Door Puzzle block for interactive Christmas-themed rotation puzzle
 */
const DoorPuzzleBlock: Block = {
  slug: 'tuerchenDoorPuzzle',
  interfaceName: 'TuerchenDoorPuzzleBlock',
  labels: {
    singular: 'Türpuzzle',
    plural: 'Türpuzzles',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      defaultValue: 'Weihnachts-Türpuzzle',
      admin: {
        description: 'Title displayed above the puzzle',
      },
    },
  ],
}

/**
 * Placeholder block for custom interactive content (quiz, puzzles, etc.)
 * This can be extended later with more specific fields
 */
const CustomBlock: Block = {
  slug: 'tuerchenCustom',
  interfaceName: 'TuerchenCustomBlock',
  labels: {
    singular: 'Custom Block',
    plural: 'Custom Blocks',
  },
  fields: [
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: 'Quiz', value: 'quiz' },
        { label: 'Puzzle', value: 'puzzle' },
        { label: 'Other', value: 'other' },
      ],
    },
    {
      name: 'title',
      type: 'text',
      admin: {
        description: 'Optional title for the custom content',
      },
    },
    {
      name: 'data',
      type: 'json',
      admin: {
        description: 'Custom JSON data for the interactive element',
      },
    },
  ],
}

export const TuerchenContent: Block = {
  slug: 'tuerchenContent',
  interfaceName: 'TuerchenContentBlock',
  labels: {
    singular: 'Türchen Content',
    plural: 'Türchen Contents',
  },
  fields: [
    {
      name: 'heading',
      type: 'text',
      required: true,
      admin: {
        description: 'The main heading for this content section',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'A brief description or lead paragraph',
      },
    },
    {
      name: 'author',
      type: 'text',
      admin: {
        description: 'Author or contributor name (optional)',
      },
    },
    {
      name: 'publishDate',
      type: 'date',
      admin: {
        description: 'Display date for the content',
        date: {
          pickerAppearance: 'dayOnly',
          displayFormat: 'd MMM yyyy',
        },
      },
    },
    {
      name: 'contentBlocks',
      type: 'blocks',
      blocks: [TextBlock, ImageBlock, SudokuBlock, TetrisBlock, DoorPuzzleBlock, CustomBlock],
      required: true,
      admin: {
        initCollapsed: true,
        description: 'Add text, images, Sudoku, Tetris, Türpuzzle, or custom interactive content',
      },
    },
  ],
}
