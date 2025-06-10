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

// Configuration
const PRE_FILL_PERCENTAGE = 95 // Percentage of cells to pre-fill (25-30% is good for medium difficulty)

// Helper function to check if a number is valid in a position
const isValid = (board, row, col, num) => {
  // Check row
  for (let x = 0; x < 9; x++) {
    if (board[row][x] === num) return false
  }

  // Check column
  for (let x = 0; x < 9; x++) {
    if (board[x][col] === num) return false
  }

  // Check 3x3 box
  const startRow = row - (row % 3)
  const startCol = col - (col % 3)
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[i + startRow][j + startCol] === num) return false
    }
  }

  return true
}

// Generate a solved Sudoku puzzle
const generateSolvedPuzzle = () => {
  const board = Array(9).fill().map(() => Array(9).fill(null))
  
  const solve = (row = 0, col = 0) => {
    if (col === 9) {
      row++
      col = 0
    }
    if (row === 9) return true

    if (board[row][col] !== null) {
      return solve(row, col + 1)
    }

    const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9]
    for (let i = nums.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[nums[i], nums[j]] = [nums[j], nums[i]]
    }

    for (const num of nums) {
      if (isValid(board, row, col, num)) {
        board[row][col] = num
        if (solve(row, col + 1)) return true
        board[row][col] = null
      }
    }
    return false
  }

  solve()
  return board
}

// Create a puzzle with the specified percentage of cells filled
const generatePuzzle = () => {
  const solvedBoard = generateSolvedPuzzle()
  const puzzle = solvedBoard.map(row => [...row])
  const cellsToRemove = Math.floor(81 * (1 - PRE_FILL_PERCENTAGE / 100))
  
  let removed = 0
  while (removed < cellsToRemove) {
    const row = Math.floor(Math.random() * 9)
    const col = Math.floor(Math.random() * 9)
    if (puzzle[row][col] !== null) {
      puzzle[row][col] = null
      removed++
    }
  }
  
  return puzzle
}

function App() {
  const [board, setBoard] = useState(generatePuzzle())
  const [selectedPet, setSelectedPet] = useState(null)
  const [timer, setTimer] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [isWon, setIsWon] = useState(false)

  // Check if the board is complete
  const checkWin = (currentBoard) => {
    // Check if all cells are filled
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (currentBoard[row][col] === null) {
          return false
        }
      }
    }

    // Check each row, column, and 3x3 box
    for (let i = 0; i < 9; i++) {
      const rowSet = new Set()
      const colSet = new Set()
      const boxSet = new Set()
      
      for (let j = 0; j < 9; j++) {
        // Check row
        const rowValue = currentBoard[i][j]
        if (rowValue < 1 || rowValue > 9 || rowSet.has(rowValue)) return false
        rowSet.add(rowValue)
        
        // Check column
        const colValue = currentBoard[j][i]
        if (colValue < 1 || colValue > 9 || colSet.has(colValue)) return false
        colSet.add(colValue)
        
        // Check 3x3 box
        const boxRow = 3 * Math.floor(i / 3) + Math.floor(j / 3)
        const boxCol = 3 * (i % 3) + (j % 3)
        const boxValue = currentBoard[boxRow][boxCol]
        if (boxValue < 1 || boxValue > 9 || boxSet.has(boxValue)) return false
        boxSet.add(boxValue)
      }
    }

    return true
  }

  // Check for win on initial load
  useEffect(() => {
    if (checkWin(board)) {
      setIsWon(true)
    }
  }, []) // Empty dependency array means this runs once on mount

  // Timer effect
  useEffect(() => {
    let interval
    if (isPlaying && !isWon) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isPlaying, isWon])

  const handleCellClick = (row, col) => {
    if (!selectedPet || isWon) return

    // Create a temporary board to check if the move is valid
    const tempBoard = board.map(row => [...row])
    
    // If clicking the same pet that's already there, remove it
    if (board[row][col] !== null && board[row][col] === selectedPet) {
      tempBoard[row][col] = null
      setBoard(tempBoard)
      return
    }

    // Check if the move is valid before making it
    if (!isValid(tempBoard, row, col, selectedPet)) {
      return // Don't allow invalid moves
    }

    // Make the move
    tempBoard[row][col] = selectedPet
    setBoard(tempBoard)
    
    if (!isPlaying) {
      setIsPlaying(true)
    }
    if (checkWin(tempBoard)) {
      setIsWon(true)
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
      
      {isWon && (
        <div className="win-message">
          🎉 Congratulations! You won! 🎉
        </div>
      )}

      <div className="pet-selector">
        {Object.entries(PETS).map(([num, emoji]) => (
          <button
            key={num}
            className={`pet-button ${selectedPet === num ? 'selected' : ''}`}
            onClick={() => setSelectedPet(num)}
            disabled={isWon}
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
                className={`grid-cell ${cell !== null ? 'pre-filled' : ''} ${isWon ? 'won' : ''}`}
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
