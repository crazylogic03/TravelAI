import { useState } from 'react'
import './App.css'
import Navbar from "./components/navbar";

function App() {
  const [count, setCount] = useState(0)

  return (
    <div>
      <Navbar />
      <div className="p-10">
        <h1 className="text-3xl font-bold">
          Welcome to AI Trip Planner
        </h1>
      </div>
    </div>
  );
}

export default App
