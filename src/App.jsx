import { useState, useEffect } from 'react'
import './App.css'

const PETS = {
  1: '🐕', // Golden Retriever
  2: '🐩', // Poodle
  3: '🐕‍🦺', // German Shepherd
  4: '🦮', // Labrador
  5: '🐱', // Tabby Cat
  6: '🐈‍⬛', // Black Cat
  7: '🐈', // Persian Cat
  8: '😺', // Siamese Cat
  9: '🦁', // Maine Coon
}

function App() {
  const [board, setBoard] = useState(Array(9).fill(Array(9).fill(null)))
  const [selectedPet, setSelectedPet] = useState(null)
  const [timer, setTimer] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  // Timer effect
  useEffect(() => {
    let interval
    if (isPlaying) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isPlaying])

  const handleCellClick = (row, col) => {
    if (!selectedPet) return

    const newBoard = board.map(row => [...row])
    newBoard[row][col] = selectedPet
    setBoard(newBoard)
    
    if (!isPlaying) {
      setIsPlaying(true)
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="game-container">
      <div className="timer">Time: {formatTime(timer)}</div>
      
      <div className="pet-selector">
        {Object.entries(PETS).map(([num, emoji]) => (
          <button
            key={num}
            className={`pet-button ${selectedPet === num ? 'selected' : ''}`}
            onClick={() => setSelectedPet(num)}
          >
            {emoji}
          </button>
        ))}
      </div>

      <div className="sudoku-grid">
        {board.map((row, rowIndex) => (
          <div key={rowIndex} className="grid-row">
            {row.map((cell, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className="grid-cell"
                onClick={() => handleCellClick(rowIndex, colIndex)}
              >
                {cell && PETS[cell]}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export default App
