import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
      <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <div className="flex justify-center space-x-4 mb-8">
          <a href="https://vite.dev" target="_blank" className="hover:opacity-80 transition-opacity">
            <img src={viteLogo} className="h-16 w-16" alt="Vite logo" />
          </a>
          <a href="https://react.dev" target="_blank" className="hover:opacity-80 transition-opacity">
            <img src={reactLogo} className="h-16 w-16 animate-spin" alt="React logo" />
          </a>
        </div>
        
        <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
          Vite + React + Tailwind
        </h1>
        
        <div className="text-center">
          <button 
            onClick={() => setCount((count) => count + 1)}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
          >
            count is {count}
          </button>
          <p className="mt-4 text-gray-600 dark:text-gray-300">
            Edit <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">src/App.tsx</code> and save to test HMR
          </p>
        </div>
        
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
          Click on the Vite and React logos to learn more
        </p>
      </div>
    </div>
  )
}

export default App
