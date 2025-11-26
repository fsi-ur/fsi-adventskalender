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
 * Placeholder block for custom interactive content (sudoku, puzzles, etc.)
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
        { label: 'Sudoku', value: 'sudoku' },
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
      blocks: [TextBlock, ImageBlock, CustomBlock],
      required: true,
      admin: {
        initCollapsed: true,
        description: 'Add text, images, or custom interactive content',
      },
    },
  ],
}
