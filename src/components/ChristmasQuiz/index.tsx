'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { cn } from '@/utilities/ui'
import { Button } from '@/components/ui/button'

export type QuizQuestion = {
  question: string
  options: string[]
  correctIndex: number
  funFact?: string
}

export type ChristmasQuizProps = {
  title?: string
  description?: string
  questions: QuizQuestion[]
  className?: string
}

type QuestionState = 'unanswered' | 'correct' | 'incorrect'

export const ChristmasQuiz: React.FC<ChristmasQuizProps> = ({
  title = 'Weihnachts-Quiz',
  description,
  questions,
  className,
}) => {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [questionStates, setQuestionStates] = useState<QuestionState[]>(
    () => questions.map(() => 'unanswered')
  )
  const [showFunFact, setShowFunFact] = useState(false)
  const [quizComplete, setQuizComplete] = useState(false)

  const question = questions[currentQuestion]
  const state = questionStates[currentQuestion]

  const correctCount = useMemo(
    () => questionStates.filter((s) => s === 'correct').length,
    [questionStates]
  )

  const answeredCount = useMemo(
    () => questionStates.filter((s) => s !== 'unanswered').length,
    [questionStates]
  )

  const handleOptionSelect = useCallback(
    (optionIndex: number) => {
      if (state !== 'unanswered') return

      setSelectedOption(optionIndex)
      const isCorrect = optionIndex === question.correctIndex

      setQuestionStates((prev) => {
        const next = [...prev]
        next[currentQuestion] = isCorrect ? 'correct' : 'incorrect'
        return next
      })

      if (question.funFact) {
        setShowFunFact(true)
      }
    },
    [state, question, currentQuestion]
  )

  const handleNext = useCallback(() => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1)
      setSelectedOption(null)
      setShowFunFact(false)
    } else {
      setQuizComplete(true)
    }
  }, [currentQuestion, questions.length])

  const handlePrevious = useCallback(() => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1)
      setSelectedOption(null)
      setShowFunFact(false)
    }
  }, [currentQuestion])

  const handleRestart = useCallback(() => {
    setCurrentQuestion(0)
    setSelectedOption(null)
    setQuestionStates(questions.map(() => 'unanswered'))
    setShowFunFact(false)
    setQuizComplete(false)
  }, [questions])

  const getScoreEmoji = () => {
    const percentage = (correctCount / questions.length) * 100
    if (percentage === 100) return '🏆'
    if (percentage >= 80) return '🌟'
    if (percentage >= 60) return '🎄'
    if (percentage >= 40) return '⭐'
    return '🎅'
  }

  const getScoreMessage = () => {
    const percentage = (correctCount / questions.length) * 100
    if (percentage === 100) return 'Perfekt! Du bist ein echter Weihnachtsfilm-Experte!'
    if (percentage >= 80) return 'Fantastisch! Du kennst dich super aus!'
    if (percentage >= 60) return 'Gut gemacht! Du weißt einiges über Weihnachtsfilme!'
    if (percentage >= 40) return 'Nicht schlecht! Zeit für einen Filmmarathon?'
    return 'Zeit, ein paar Weihnachtsfilme zu schauen! 🎬'
  }

  if (quizComplete) {
    return (
      <div className={cn('w-full', className)}>
        <div className="mx-auto max-w-2xl rounded-2xl border border-border bg-gradient-to-b from-card to-card/80 p-6 shadow-lg md:p-8">
          {/* Celebration Header */}
          <div className="mb-6 text-center">
            <div className="mb-4 text-6xl">{getScoreEmoji()}</div>
            <h2 className="mb-2 text-2xl font-bold text-foreground md:text-3xl">
              Quiz abgeschlossen!
            </h2>
            <p className="text-lg text-muted-foreground">{getScoreMessage()}</p>
          </div>

          {/* Score Card */}
          <div className="mb-6 rounded-xl border border-green-200 bg-green-50/50 p-6 text-center dark:border-green-800 dark:bg-green-900/20">
            <div className="text-4xl font-bold text-green-600 dark:text-green-400">
              {correctCount} / {questions.length}
            </div>
            <div className="mt-1 text-sm text-green-700 dark:text-green-300">
              richtige Antworten
            </div>
            <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-green-200 dark:bg-green-800">
              <div
                className="h-full rounded-full bg-green-500 transition-all duration-500"
                style={{ width: `${(correctCount / questions.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap justify-center gap-3">
            <Button onClick={handleRestart} size="lg">
              🔄 Nochmal spielen
            </Button>
            <Button
              onClick={() => setQuizComplete(false)}
              variant="outline"
              size="lg"
            >
              📋 Antworten ansehen
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('w-full', className)}>
      <div className="mx-auto max-w-2xl rounded-2xl border border-border bg-gradient-to-b from-card to-card/80 p-6 shadow-lg md:p-8">
        {/* Header */}
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎄</span>
              <h2 className="text-xl font-bold text-foreground md:text-2xl">{title}</h2>
            </div>
            <div className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              {currentQuestion + 1} / {questions.length}
            </div>
          </div>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex gap-1">
            {questions.map((_, idx) => (
              <div
                key={idx}
                className={cn(
                  'h-2 flex-1 rounded-full transition-all duration-300',
                  questionStates[idx] === 'correct' && 'bg-green-500',
                  questionStates[idx] === 'incorrect' && 'bg-red-400',
                  questionStates[idx] === 'unanswered' && idx === currentQuestion && 'bg-primary/50',
                  questionStates[idx] === 'unanswered' && idx !== currentQuestion && 'bg-muted'
                )}
              />
            ))}
          </div>
          <div className="mt-2 flex justify-between text-xs text-muted-foreground">
            <span>✅ {correctCount} richtig</span>
            <span>📝 {answeredCount} beantwortet</span>
          </div>
        </div>

        {/* Question */}
        <div className="mb-6">
          <h3 className="mb-4 text-lg font-semibold text-foreground md:text-xl">
            {question.question}
          </h3>

          {/* Options */}
          <div className="space-y-3">
            {question.options.map((option, idx) => {
              const isSelected = selectedOption === idx
              const isCorrect = idx === question.correctIndex
              const showResult = state !== 'unanswered'

              return (
                <button
                  key={idx}
                  onClick={() => handleOptionSelect(idx)}
                  disabled={state !== 'unanswered'}
                  className={cn(
                    'w-full rounded-xl border-2 p-4 text-left transition-all duration-200',
                    'hover:border-primary/50 hover:bg-primary/5',
                    'disabled:cursor-default disabled:hover:bg-transparent',
                    state === 'unanswered' && 'border-border bg-background',
                    showResult && isCorrect && 'border-green-500 bg-green-50 dark:bg-green-900/20',
                    showResult && isSelected && !isCorrect && 'border-red-400 bg-red-50 dark:bg-red-900/20',
                    showResult && !isSelected && !isCorrect && 'border-border bg-muted/30 opacity-60'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold',
                        state === 'unanswered' && 'border-muted-foreground/30 text-muted-foreground',
                        showResult && isCorrect && 'border-green-500 bg-green-500 text-white',
                        showResult && isSelected && !isCorrect && 'border-red-400 bg-red-400 text-white',
                        showResult && !isSelected && !isCorrect && 'border-muted-foreground/20 text-muted-foreground/50'
                      )}
                    >
                      {showResult && isCorrect ? '✓' : showResult && isSelected && !isCorrect ? '✗' : String.fromCharCode(97 + idx)}
                    </div>
                    <span
                      className={cn(
                        'text-sm md:text-base',
                        showResult && isCorrect && 'font-medium text-green-700 dark:text-green-300',
                        showResult && isSelected && !isCorrect && 'text-red-600 dark:text-red-300',
                        showResult && !isSelected && !isCorrect && 'text-muted-foreground'
                      )}
                    >
                      {option}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Fun Fact */}
        {showFunFact && question.funFact && (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50/80 p-4 dark:border-amber-700 dark:bg-amber-900/20">
            <div className="mb-1 flex items-center gap-2 text-sm font-medium text-amber-700 dark:text-amber-300">
              <span>💡</span>
              <span>Fun Fact</span>
            </div>
            <p className="text-sm text-amber-800 dark:text-amber-200">{question.funFact}</p>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            onClick={handlePrevious}
            variant="outline"
            size="sm"
            disabled={currentQuestion === 0}
          >
            ← Zurück
          </Button>

          <div className="flex gap-2">
            <Button onClick={handleRestart} variant="ghost" size="sm">
              🔄 Neustart
            </Button>
            {state !== 'unanswered' && (
              <Button onClick={handleNext} size="sm">
                {currentQuestion === questions.length - 1 ? 'Ergebnis →' : 'Weiter →'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChristmasQuiz
