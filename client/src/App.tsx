import { useState } from 'react'
import './App.css'
import ChainvilleLanding from './pages/HomePage'
import Game from './components/Game/Game'

function App() {


  return (
    <>
      {/* <ChainvilleLanding /> */}
      <div style={{ height: '100vh' }}>
      <Game />
    </div>
    </>
  )
}

export default App
