'use client'
import React from 'react'

const Snow: React.FC = () => {
  return (
    <div className="snow-container">
      {Array.from({ length: 50 }, (_, i) => {
        const size = Math.random() * 6 + 4 // 4 to 10px
        const duration = 10 + Math.random() * 10 // 10 to 20s
        return (
          <div
            key={i}
            className="snowflake"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${duration}s`,
              width: `${size}px`,
              height: `${size}px`,
            }}
          />
        )
      })}
    </div>
  )
}

export default Snow
