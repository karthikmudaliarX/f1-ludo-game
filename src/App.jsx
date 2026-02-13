import React from 'react';
import { GameProvider } from './context/GameContext';
import Board from './components/Board';
import Sidebar from './components/Sidebar';
import ActionPanel from './components/ActionPanel';
import GarageArea from './components/GarageArea';
import './App.css';

function App() {
  return (
    <GameProvider>
      <div className="center-wrapper">
        <div className="game-shell">
          {/* Left Sidebar */}
          <div className="sidebar-container">
            <Sidebar />
          </div>
          
          {/* Center Board Area */}
          <div className="board-container">
            <Board />
            
            {/* Garage Areas */}
            <GarageArea playerId={0} />
            <GarageArea playerId={1} />
            <GarageArea playerId={2} />
            <GarageArea playerId={3} />
          </div>
        </div>
        
        {/* Bottom Action Panel */}
        <ActionPanel />
      </div>
    </GameProvider>
  );
}

export default App;
