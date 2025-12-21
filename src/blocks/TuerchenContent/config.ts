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
 * Doodle Jump block for interactive Christmas-themed jumping game
 */
const DoodleJumpBlock: Block = {
  slug: 'tuerchenDoodleJump',
  interfaceName: 'TuerchenDoodleJumpBlock',
  labels: {
    singular: 'Doodle Jump',
    plural: 'Doodle Jump',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      defaultValue: 'Polar Doodle Jump',
      admin: {
        description: 'Title displayed above the game',
      },
    },
    {
      name: 'difficulty',
      type: 'select',
      defaultValue: 'cozy',
      options: [
        { label: 'Gemütlich', value: 'cozy' },
        { label: 'Winterabend', value: 'brisk' },
        { label: 'Schneesturm', value: 'blizzard' },
      ],
      admin: {
        description: 'Bestimmt Sprungkraft, Plattform-Abstände und Bewegung.',
      },
    },
    {
      name: 'note',
      type: 'textarea',
      admin: {
        description: 'Optionaler Hinweis oder kleine Story für das Türchen.',
      },
    },
  ],
}

const BlackJackBlock: Block = {
  slug: 'tuerchenBlackJack',
  interfaceName: 'TuerchenBlackJackBlock',
  labels: {
    singular: 'Blackjack',
    plural: 'Blackjack Games',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      defaultValue: 'Blackjack - the christmas edition',
      admin: {
        description: 'Title displayed above the game',
      },
    },
  ],
}

/**
 * Default quiz questions for Christmas movie quiz
 */
const defaultQuizQuestions = [
  {
    question: 'In welchem Weihnachtsfilm wird ein kleiner Junge versehentlich von seiner Familie zu Hause zurückgelassen?',
    options: [
      { text: 'Kevin – Allein zu Haus' },
      { text: 'Der Grinch' },
      { text: 'Tatsächlich... Liebe' },
      { text: 'Schöne Bescherung' },
    ],
    correctIndex: 0,
    funFact: 'Der Film „Kevin – Allein zu Haus" (1990) mit Macaulay Culkin war ein riesiger Kassenerfolg und spielte weltweit über 476 Millionen Dollar ein!',
  },
  {
    question: 'Welcher Charakter hasst Weihnachten und stiehlt alle Geschenke in Whoville?',
    options: [
      { text: 'Scrooge' },
      { text: 'Der Grinch' },
      { text: 'Jack Skellington' },
      { text: 'Mr. Bean' },
    ],
    correctIndex: 1,
    funFact: 'Der Grinch stammt aus dem Kinderbuch „How the Grinch Stole Christmas!" von Dr. Seuss aus dem Jahr 1957.',
  },
  {
    question: 'Wer spielt im Film „Tatsächlich... Liebe" den britischen Premierminister?',
    options: [
      { text: 'Colin Firth' },
      { text: 'Alan Rickman' },
      { text: 'Hugh Grant' },
      { text: 'Liam Neeson' },
    ],
    correctIndex: 2,
    funFact: 'Die berühmte Tanzszene des Premierministers (Hugh Grant) zu „Jump (For My Love)" wurde improvisiert und war anfangs gar nicht geplant.',
  },
  {
    question: 'In welchem Film versucht ein Elf, seinen leiblichen Vater in New York zu finden?',
    options: [
      { text: 'Der Polarexpress' },
      { text: 'Buddy – Der Weihnachtself' },
      { text: 'Santa Clause' },
      { text: 'Arthur Weihnachtsmann' },
    ],
    correctIndex: 1,
    funFact: 'Will Ferrell blieb während der Dreharbeiten oft im Elf-Kostüm, um im Charakter zu bleiben – selbst beim Mittagessen!',
  },
  {
    question: 'In welchem Film wird ein alter Geizkragen von drei Geistern besucht?',
    options: [
      { text: 'Stirb langsam' },
      { text: 'Weihnachten bei den Hoppenstedts' },
      { text: 'Eine Weihnachtsgeschichte (A Christmas Carol)' },
      { text: 'Drei Haselnüsse für Aschenbrödel' },
    ],
    correctIndex: 2,
    funFact: 'Charles Dickens schrieb „A Christmas Carol" 1843 in nur sechs Wochen. Die Geschichte hat seitdem zahlreiche Verfilmungen inspiriert.',
  },
  {
    question: 'Wie heißt der berühmte tschechisch-deutsche Märchenfilm mit dem Zauberspruch „Heute back ich, morgen brau ich..."?',
    options: [
      { text: 'Drei Haselnüsse für Aschenbrödel' },
      { text: 'Rumpelstilzchen' },
      { text: 'Das kalte Herz' },
      { text: 'Schneewittchen' },
    ],
    correctIndex: 0,
    funFact: 'Halt! Das war eine Fangfrage – „Drei Haselnüsse für Aschenbrödel" enthält gar keinen solchen Spruch. Der Zauberspruch gehört zu Rumpelstilzchen! Aber der Film ist trotzdem ein Weihnachtsklassiker.',
  },
  {
    question: 'In welchem Film sagt jemand: „Frohe Weihnachten, du elende Ratte!"?',
    options: [
      { text: 'Kevin – Allein zu Haus' },
      { text: 'Bad Santa' },
      { text: 'Der Polarexpress' },
      { text: 'Stirb Langsam' },
    ],
    correctIndex: 0,
    funFact: 'Das Zitat stammt aus dem fiktiven Film-im-Film „Angels with Filthy Souls", der extra für Kevin – Allein zu Haus produziert wurde.',
  },
  {
    question: 'Welcher Disney/Pixar-Film spielt zwar nicht an Weihnachten, wird aber oft in der Weihnachtszeit geschaut und handelt von einem Schneemann, der den Sommer liebt?',
    options: [
      { text: 'Vaiana' },
      { text: 'Die Eiskönigin' },
      { text: 'Coco' },
      { text: 'Oben' },
    ],
    correctIndex: 1,
    funFact: 'Olaf singt das Lied „Im Sommer" und stellt sich darin vor, wie schön der Sommer wäre – ohne zu wissen, dass er dabei schmelzen würde!',
  },
  {
    question: 'In welchem Film reist ein Junge mit einem magischen Zug zum Nordpol?',
    options: [
      { text: 'Nightmare Before Christmas' },
      { text: 'Santa Clause' },
      { text: 'Klaus' },
      { text: 'Der Polarexpress' },
    ],
    correctIndex: 3,
    funFact: 'Tom Hanks spricht und verkörpert im Polarexpress gleich sechs verschiedene Charaktere!',
  },
  {
    question: 'Welcher actionreiche Film mit Bruce Willis spielt an Heiligabend und wird oft als Weihnachtsfilm diskutiert?',
    options: [
      { text: 'Lethal Weapon' },
      { text: 'Stirb langsam' },
      { text: 'Last Action Hero' },
      { text: 'Rambo' },
    ],
    correctIndex: 1,
    funFact: 'Die Debatte, ob „Stirb langsam" ein Weihnachtsfilm ist, wird jedes Jahr aufs Neue geführt. Bruce Willis selbst hat erklärt: Es ist KEIN Weihnachtsfilm. Die Fans sehen das oft anders!',
  },
  {
    question: 'In welchem Weihnachtsfilm singt eine junge Frau davon, was sie sich zu Weihnachten wünscht – nämlich DICH?',
    options: [
      { text: 'The Holiday' },
      { text: 'Last Christmas' },
      { text: 'Tatsächlich... Liebe' },
      { text: 'Bridget Jones – Schokolade zum Frühstück' },
    ],
    correctIndex: 1,
    funFact: 'Das Lied „Last Christmas" von Wham! wurde 1984 veröffentlicht und ist einer der meistgespielten Weihnachtssongs aller Zeiten – obwohl es bei Erstveröffentlichung nie Platz 1 erreichte!',
  },
  {
    question: 'In welchem Netflix-Animationsfilm geht es um einen Postboten, der in einem verschneiten Dorf Spielzeug verschenkt?',
    options: [
      { text: 'Klaus' },
      { text: 'Arthur Weihnachtsmann' },
      { text: 'Der Grinch (2018)' },
      { text: 'Noelle' },
    ],
    correctIndex: 0,
    funFact: '„Klaus" war der erste animierte Netflix-Originalfilm und wurde für einen Oscar nominiert – er verlor gegen „Toy Story 4".',
  },
  {
    question: 'In welchem Film tauschen zwei Frauen ihre Häuser über Weihnachten?',
    options: [
      { text: 'The Holiday' },
      { text: 'Tatsächlich... Liebe' },
      { text: 'Bridget Jones' },
      { text: 'Liebe braucht keine Ferien' },
    ],
    correctIndex: 0,
    funFact: 'Das Cottage in „The Holiday" (mit Kate Winslet und Cameron Diaz) wurde extra für den Film gebaut – es existiert in echt leider nicht!',
  },
  {
    question: 'Welcher Schauspieler spielt den verkleideten Weihnachtsmann im Film „Santa Clause – Eine schöne Bescherung"?',
    options: [
      { text: 'Jim Carrey' },
      { text: 'Tim Allen' },
      { text: 'Robin Williams' },
      { text: 'Eddie Murphy' },
    ],
    correctIndex: 1,
    funFact: 'Die Klausel im Titel ist ein Wortspiel: „Santa Clause" klingt wie „Santa Claus", bedeutet aber auch „Vertragsklausel".',
  },
  {
    question: 'In welchem Stop-Motion-Film übernimmt der „Kürbiskönig" Jack Skellington Weihnachten?',
    options: [
      { text: 'Corpse Bride' },
      { text: 'Coraline' },
      { text: 'Nightmare Before Christmas' },
      { text: 'Frankenweenie' },
    ],
    correctIndex: 2,
    funFact: 'Obwohl Tim Burton oft als Regisseur genannt wird, führte Henry Selick Regie – Burton war nur Produzent und Ideengeber.',
  },
  {
    question: 'In welchem deutschen Weihnachtsklassiker geht im Sketch „Das Festessen" alles schief beim Weihnachtsessen?',
    options: [
      { text: 'Otto – Der Film' },
      { text: 'Weihnachten bei den Hoppenstedts (Loriot)' },
      { text: 'Drei Haselnüsse für Aschenbrödel' },
      { text: 'Der Schuh des Manitu' },
    ],
    correctIndex: 1,
    funFact: '„Früher war mehr Lametta!" – einer der bekanntesten Loriot-Sprüche stammt aus diesem Sketch. Der Satz ist längst Kult!',
  },
]

/**
 * Christmas Quiz block - Multiple choice quiz with fun facts
 */
const QuizBlock: Block = {
  slug: 'tuerchenQuiz',
  interfaceName: 'TuerchenQuizBlock',
  labels: {
    singular: 'Quiz',
    plural: 'Quizze',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      defaultValue: 'Weihnachtsfilm-Quiz 🎄🎬',
      admin: {
        description: 'Title displayed above the quiz',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      defaultValue: 'Teste dein Wissen über die beliebtesten Weihnachtsfilme! 16 Fragen rund um Klassiker und moderne Favoriten.',
      admin: {
        description: 'Optional introduction text for the quiz',
      },
    },
    {
      name: 'questions',
      type: 'array',
      required: true,
      minRows: 1,
      defaultValue: defaultQuizQuestions,
      labels: {
        singular: 'Frage',
        plural: 'Fragen',
      },
      fields: [
        {
          name: 'question',
          type: 'text',
          required: true,
          admin: {
            description: 'Die Quizfrage',
          },
        },
        {
          name: 'options',
          type: 'array',
          required: true,
          minRows: 2,
          maxRows: 6,
          labels: {
            singular: 'Antwort',
            plural: 'Antworten',
          },
          fields: [
            {
              name: 'text',
              type: 'text',
              required: true,
            },
          ],
        },
        {
          name: 'correctIndex',
          type: 'number',
          required: true,
          min: 0,
          admin: {
            description: 'Index der richtigen Antwort (0 = erste Antwort, 1 = zweite, usw.)',
          },
        },
        {
          name: 'funFact',
          type: 'textarea',
          admin: {
            description: 'Optionaler Fun Fact, der nach Beantwortung angezeigt wird',
          },
        },
      ],
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
      blocks: [TextBlock, ImageBlock, SudokuBlock, TetrisBlock, DoorPuzzleBlock, DoodleJumpBlock, BlackJackBlock, QuizBlock, CustomBlock],
      required: true,
      admin: {
        initCollapsed: true,
        description: 'Add text, images, Sudoku, Tetris, Türpuzzle, Doodle Jump, Blackjack, Quiz, or custom interactive content',
      },
    },
  ],
}
