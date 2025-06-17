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
const PRE_FILL_PERCENTAGE = 90 // Percentage of cells to pre-fill (25-30% is good for medium difficulty)

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
  const [isPlaying, setIsPlaying] = useState(false)
  const [isWon, setIsWon] = useState(false)
  const [solution, setSolution] = useState(null)

  useEffect(() => {
    const solved = generateSolvedPuzzle()            // 產生完整解答
    const puzzle = solved.map(row => [...row])       // 深拷貝一份作為題目
  
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
  
    setSolution(solved)     // 保存原始正解
    setBoard(puzzle)        // 顯示題目
  }, [])  


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
    // Don't allow modifying pre-filled cells
    if (board[row][col] !== null && board[row][col] === selectedPet) {
      // If clicking the same pet that's already there, remove it
      const newBoard = board.map(row => [...row])
      newBoard[row][col] = null
      setBoard(newBoard)
      console.log(selectedPet)
      return
    }
   
    // Don't allow modifying pre-filled cells
    if (board[row][col] !== null && board[row][col] !== selectedPet) {
      // Allow overwriting with a different pet
      const newBoard = board.map(row => [...row])
      const valueToFill = Number(selectedPet)
      newBoard[row][col] = valueToFill
      setBoard(newBoard)
      if (!isPlaying) {
        setIsPlaying(true)
      }
      if (isCorrect()) {
        setIsWon(true)
      }
      return
    }
    const valueToFill = Number(selectedPet)
    
    const newBoard = board.map(row => [...row])
    newBoard[row][col] = valueToFill
    setBoard(newBoard)
    
    if (!isPlaying) {
      setIsPlaying(true)
    }
    if (isCorrect(newBoard, solution)) {
      setIsWon(true)
    }else{
      console.log(newBoard)
      console.log(solution)
    }
  }
  

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  
  const isCorrect = (board, solution) => {
      
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (board[row][col] !== solution[row][col]) {
          return false
        }
      }
    }
    return true
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
