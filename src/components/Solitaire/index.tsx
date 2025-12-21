'use client'

import React, { useState, useEffect } from 'react'
import { cn } from '@/utilities/ui'

// --- Types ---

type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades'
type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K'
type CardColor = 'red' | 'black'

interface Card {
  id: string
  suit: Suit
  rank: Rank
  value: number
  color: CardColor
  faceUp: boolean
}

// --- Constants ---

const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades']
const RANKS: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']

// --- Helper Functions ---

const getCardValue = (rank: Rank): number => {
  return RANKS.indexOf(rank) + 1
}

const getCardColor = (suit: Suit): CardColor => {
  return suit === 'hearts' || suit === 'diamonds' ? 'red' : 'black'
}

const createDeck = (): Card[] => {
  const deck: Card[] = []
  SUITS.forEach((suit) => {
    RANKS.forEach((rank) => {
      deck.push({
        id: `${rank}-${suit}`,
        suit,
        rank,
        value: getCardValue(rank),
        color: getCardColor(suit),
        faceUp: false,
      })
    })
  })
  return deck
}

const shuffleDeck = (deck: Card[]): Card[] => {
  const newDeck = [...deck]
  for (let i = newDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]]
  }
  return newDeck
}

// --- Components ---

const CardComponent: React.FC<{
  card: Card
  onClick?: () => void
  className?: string
  style?: React.CSSProperties
}> = ({ card, onClick, className, style }) => {
  if (!card.faceUp) {
    return (
      <div
        onClick={onClick}
        className={cn(
          'w-20 h-28 md:w-24 md:h-36 bg-red-700 rounded-lg border-2 border-white shadow-md flex items-center justify-center relative overflow-hidden cursor-pointer select-none',
          className
        )}
        style={style}
      >
        <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgdmlld0JveD0iMCAwIDIwIDIwIiBmaWxsPSJub25lIiBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iMiI+PHBhdGggZD0iTTAgMjBMMjAgME0wIDBMMjAgMjAiLz48L3N2Zz4=')]"></div>
        <span className="text-4xl">🎄</span>
      </div>
    )
  }

  let suitIcon = ''
  switch (card.suit) {
    case 'hearts': suitIcon = '♥'; break
    case 'diamonds': suitIcon = '♦'; break
    case 'clubs': suitIcon = '♣'; break
    case 'spades': suitIcon = '♠'; break
  }

  let faceIcon = ''
  if (['J', 'Q', 'K'].includes(card.rank)) {
     if (card.rank === 'K') faceIcon = '🎅'
     else if (card.rank === 'Q') faceIcon = '🤶'
     else if (card.rank === 'J') faceIcon = '🧝'
  }

  return (
    <div
      onClick={onClick}
      className={cn(
        'w-20 h-28 md:w-24 md:h-36 bg-white rounded-lg border border-gray-300 shadow-md flex flex-col justify-between p-1 md:p-2 relative select-none cursor-pointer hover:brightness-95 transition-all',
        card.color === 'red' ? 'text-red-600' : 'text-black',
        className
      )}
      style={style}
    >
      <div className="text-left leading-none">
        <div className="font-bold text-base md:text-lg">{card.rank}</div>
        <div className="text-lg md:text-xl">{suitIcon}</div>
      </div>
      
      <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
         <span className="text-5xl md:text-6xl">{suitIcon}</span>
      </div>

      {faceIcon && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-3xl md:text-4xl drop-shadow-md">{faceIcon}</span>
        </div>
      )}

      <div className="text-right leading-none rotate-180">
        <div className="font-bold text-base md:text-lg">{card.rank}</div>
        <div className="text-lg md:text-xl">{suitIcon}</div>
      </div>
    </div>
  )
}

const Placeholder: React.FC<{ onClick?: () => void; content?: string }> = ({ onClick, content }) => (
  <div
    onClick={onClick}
    className="w-20 h-28 md:w-24 md:h-36 rounded-lg border-2 border-dashed border-white/30 flex items-center justify-center text-white/30 select-none"
  >
    {content && <span className="text-2xl">{content}</span>}
  </div>
)

// --- Main Game Component ---

export const Solitaire: React.FC = () => {
  const [stock, setStock] = useState<Card[]>([])
  const [waste, setWaste] = useState<Card[]>([])
  const [foundations, setFoundations] = useState<Card[][]>([[], [], [], []]) // 4 piles
  const [tableau, setTableau] = useState<Card[][]>([[], [], [], [], [], [], []]) // 7 piles
  const [selectedCard, setSelectedCard] = useState<{ pileType: 'waste' | 'tableau' | 'foundation', pileIndex: number, cardIndex: number } | null>(null)
  const [gameWon, setGameWon] = useState(false)

  // Initialize Game
  const initGame = () => {
    const deck = shuffleDeck(createDeck())
    const newTableau: Card[][] = [[], [], [], [], [], [], []]
    
    // Deal to tableau
    let cardIdx = 0
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j <= i; j++) {
        const card = deck[cardIdx++]
        if (j === i) card.faceUp = true // Top card face up
        newTableau[i].push(card)
      }
    }

    setStock(deck.slice(cardIdx))
    setWaste([])
    setFoundations([[], [], [], []])
    setTableau(newTableau)
    setSelectedCard(null)
    setGameWon(false)
  }

  useEffect(() => {
    initGame()
  }, [])

  useEffect(() => {
    // Check win condition
    if (foundations.every(pile => pile.length === 13)) {
      setGameWon(true)
    }
  }, [foundations])

  // --- Actions ---

  const drawCard = () => {
    if (stock.length === 0) {
      // Recycle waste to stock
      const newStock = [...waste].reverse().map(c => ({ ...c, faceUp: false }))
      setStock(newStock)
      setWaste([])
    } else {
      const newStock = [...stock]
      const card = newStock.pop()!
      card.faceUp = true
      setStock(newStock)
      setWaste(prev => [...prev, card])
    }
    setSelectedCard(null)
  }

  const handleCardClick = (pileType: 'waste' | 'tableau' | 'foundation', pileIndex: number, cardIndex: number) => {
    // If clicking empty tableau spot (King move)
    if (pileType === 'tableau' && cardIndex === -1) {
        if (selectedCard) {
            attemptMove(selectedCard, { pileType, pileIndex, cardIndex })
        }
        return
    }

    // Get the clicked card
    let clickedCard: Card | undefined
    if (pileType === 'waste') clickedCard = waste[waste.length - 1]
    else if (pileType === 'tableau') clickedCard = tableau[pileIndex][cardIndex]
    else if (pileType === 'foundation') clickedCard = foundations[pileIndex][foundations[pileIndex].length - 1]

    if (!clickedCard) return

    // If card is face down in tableau, do nothing (should be handled by game logic to flip top card)
    if (!clickedCard.faceUp) {
        // If it's the top card of a tableau pile, flip it
        if (pileType === 'tableau' && cardIndex === tableau[pileIndex].length - 1) {
            const newTableau = [...tableau]
            newTableau[pileIndex][cardIndex].faceUp = true
            setTableau(newTableau)
        }
        return
    }

    // If a card is already selected, try to move it to this location
    if (selectedCard) {
        // If clicking the same card, deselect
        if (selectedCard.pileType === pileType && selectedCard.pileIndex === pileIndex && selectedCard.cardIndex === cardIndex) {
            setSelectedCard(null)
        } else {
            attemptMove(selectedCard, { pileType, pileIndex, cardIndex })
        }
    } else {
        // Select this card (only if it's a valid source)
        // Can select from Waste (top), Foundation (top), Tableau (any face up)
        if (pileType === 'waste' && cardIndex !== waste.length - 1) return // Only top waste
        if (pileType === 'foundation' && cardIndex !== foundations[pileIndex].length - 1) return // Only top foundation
        
        setSelectedCard({ pileType, pileIndex, cardIndex })
    }
  }

  const attemptMove = (from: { pileType: string, pileIndex: number, cardIndex: number }, to: { pileType: string, pileIndex: number, cardIndex: number }) => {
    // Get source cards
    let cardsToMove: Card[] = []
    if (from.pileType === 'waste') cardsToMove = [waste[waste.length - 1]]
    else if (from.pileType === 'foundation') cardsToMove = [foundations[from.pileIndex][foundations[from.pileIndex].length - 1]]
    else if (from.pileType === 'tableau') cardsToMove = tableau[from.pileIndex].slice(from.cardIndex)

    const sourceCard = cardsToMove[0]
    
    // Get target card
    let targetCard: Card | null = null
    if (to.pileType === 'tableau') {
        if (to.cardIndex !== -1) targetCard = tableau[to.pileIndex][to.cardIndex]
    } else if (to.pileType === 'foundation') {
        if (foundations[to.pileIndex].length > 0) targetCard = foundations[to.pileIndex][foundations[to.pileIndex].length - 1]
    }

    let validMove = false

    // Logic for moving to Tableau
    if (to.pileType === 'tableau') {
        if (!targetCard) {
            // Moving to empty column: must be King
            if (sourceCard.rank === 'K') validMove = true
        } else {
            // Moving to existing card: must be opposite color and rank - 1
            if (sourceCard.color !== targetCard.color && sourceCard.value === targetCard.value - 1) {
                validMove = true
            }
        }
    }
    // Logic for moving to Foundation
    else if (to.pileType === 'foundation') {
        // Can only move one card at a time to foundation
        if (cardsToMove.length === 1) {
            if (!targetCard) {
                // Moving to empty foundation: must be Ace
                if (sourceCard.rank === 'A') validMove = true
            } else {
                // Moving to existing foundation: same suit, rank + 1
                if (sourceCard.suit === targetCard.suit && sourceCard.value === targetCard.value + 1) {
                    validMove = true
                }
            }
        }
    }

    if (validMove) {
        executeMove(from, to, cardsToMove)
        setSelectedCard(null)
    } else {
        // Invalid move, just change selection to the target if it's a valid selection source?
        // Or just deselect. Let's deselect for clarity or switch selection.
        // For now, just deselect to avoid confusion.
        setSelectedCard(null)
    }
  }

  const executeMove = (from: { pileType: string, pileIndex: number, cardIndex: number }, to: { pileType: string, pileIndex: number, cardIndex: number }, cards: Card[]) => {
    // Remove from source
    if (from.pileType === 'waste') {
        setWaste(prev => prev.slice(0, -1))
    } else if (from.pileType === 'foundation') {
        const newFoundations = [...foundations]
        newFoundations[from.pileIndex].pop()
        setFoundations(newFoundations)
    } else if (from.pileType === 'tableau') {
        const newTableau = [...tableau]
        newTableau[from.pileIndex] = newTableau[from.pileIndex].slice(0, from.cardIndex)
        // Auto-flip new top card if exists and face down
        const len = newTableau[from.pileIndex].length
        if (len > 0 && !newTableau[from.pileIndex][len - 1].faceUp) {
            newTableau[from.pileIndex][len - 1].faceUp = true
        }
        setTableau(newTableau)
    }

    // Add to target
    if (to.pileType === 'tableau') {
        const newTableau = [...tableau]
        newTableau[to.pileIndex] = [...newTableau[to.pileIndex], ...cards]
        setTableau(newTableau)
    } else if (to.pileType === 'foundation') {
        const newFoundations = [...foundations]
        newFoundations[to.pileIndex] = [...newFoundations[to.pileIndex], ...cards]
        setFoundations(newFoundations)
    }
  }

  // Auto-move to foundation helper (optional, maybe for double click)
  const autoMoveToFoundation = (pileType: 'waste' | 'tableau', pileIndex: number) => {
      // ... implementation for double click shortcut
  }

  return (
    <div className="flex flex-col items-center min-h-[800px] bg-green-900 p-4 rounded-xl text-white font-sans relative overflow-hidden border-4 border-red-700 shadow-2xl select-none">
      {/* Christmas Decorations */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-10 bg-[url('https://www.transparenttextures.com/patterns/snow.png')]"></div>
      
      <div className="flex justify-between w-full max-w-5xl mb-4 items-center z-10">
        <h2 className="text-3xl font-bold text-red-100 drop-shadow-lg font-serif">Christmas Solitaire</h2>
        <button onClick={initGame} className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg font-bold shadow-md transition">
            New Game 🎅
        </button>
      </div>

      {gameWon && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
              <div className="text-center animate-bounce">
                  <h1 className="text-6xl font-bold text-yellow-400 mb-4">You Won! 🎄</h1>
                  <p className="text-2xl text-white mb-8">Merry Christmas!</p>
                  <button onClick={initGame} className="px-8 py-4 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl text-xl shadow-xl">
                      Play Again
                  </button>
              </div>
          </div>
      )}

      <div className="w-full max-w-5xl flex flex-col gap-8 z-10">
        
        {/* Top Row: Stock, Waste, Foundations */}
        <div className="flex justify-between">
            <div className="flex gap-4">
                {/* Stock */}
                <div onClick={drawCard} className="relative">
                    {stock.length > 0 ? (
                        <CardComponent card={stock[stock.length - 1]} /> // Actually face down, handled by component logic if faceUp is false
                    ) : (
                        <div className="w-20 h-28 md:w-24 md:h-36 rounded-lg border-2 border-white/20 flex items-center justify-center cursor-pointer hover:bg-white/5">
                            <span className="text-3xl opacity-50">↻</span>
                        </div>
                    )}
                </div>

                {/* Waste */}
                <div className="relative">
                    {waste.length > 0 ? (
                        <CardComponent 
                            card={waste[waste.length - 1]} 
                            onClick={() => handleCardClick('waste', 0, waste.length - 1)}
                            className={selectedCard?.pileType === 'waste' ? 'ring-4 ring-yellow-400' : ''}
                        />
                    ) : (
                        <Placeholder />
                    )}
                </div>
            </div>

            {/* Foundations */}
            <div className="flex gap-2 md:gap-4">
                {foundations.map((pile, i) => (
                    <div key={i} className="relative">
                        {pile.length > 0 ? (
                            <CardComponent 
                                card={pile[pile.length - 1]} 
                                onClick={() => handleCardClick('foundation', i, pile.length - 1)}
                                className={selectedCard?.pileType === 'foundation' && selectedCard.pileIndex === i ? 'ring-4 ring-yellow-400' : ''}
                            />
                        ) : (
                            <Placeholder 
                                onClick={() => handleCardClick('foundation', i, -1)}
                                content={['♥', '♦', '♣', '♠'][i]} 
                            />
                        )}
                    </div>
                ))}
            </div>
        </div>

        {/* Tableau */}
        <div className="flex justify-between items-start min-h-[400px]">
            {tableau.map((pile, i) => (
                <div key={i} className="flex flex-col relative w-20 md:w-24">
                    {pile.length === 0 ? (
                        <Placeholder onClick={() => handleCardClick('tableau', i, -1)} />
                    ) : (
                        pile.map((card, j) => (
                            <div 
                                key={card.id} 
                                className="absolute w-full transition-all"
                                style={{ top: `${j * 25}px`, zIndex: j }}
                            >
                                <CardComponent 
                                    card={card}
                                    onClick={() => handleCardClick('tableau', i, j)}
                                    className={selectedCard?.pileType === 'tableau' && selectedCard.pileIndex === i && selectedCard.cardIndex === j ? 'ring-4 ring-yellow-400' : ''}
                                />
                            </div>
                        ))
                    )}
                </div>
            ))}
        </div>

      </div>
    </div>
  )
}
