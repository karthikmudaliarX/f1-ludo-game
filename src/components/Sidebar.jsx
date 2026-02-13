import React from 'react';
import { useGame } from '../context/GameContext';
import './Sidebar.css';

const Sidebar = () => {
  const { gameState, gameStates, teamColors } = useGame();
  const currentPlayer = gameState.players[gameState.currentTurnIndex];
  
  const getCurrentPlayerName = () => {
    return currentPlayer.name;
  };
  
  const getGameStateDisplay = () => {
    switch (gameState.gameState) {
      case gameStates.WAITING_FOR_ROLL:
        return 'Roll the dice to start your turn!';
      case gameStates.WAITING_FOR_SPAWN:
        return `You rolled a 6! Choose a car to spawn.`;
      case gameStates.WAITING_FOR_MOVE:
        return `Choose a car to move (${gameState.diceValue} steps).`;
      case gameStates.TURN_COMPLETE:
        return 'Turn complete!';
      default:
        return '';
    }
  };

  const getDiceDisplay = () => {
    if (gameState.diceValue) {
      return `🎲 ${gameState.diceValue}`;
    }
    return '🎲 ?';
  };

  return (
    <div className="sidebar">
      <div className="turn-info">
        <h2>Turn {gameState.turnNumber}</h2>
        <div className="current-player">
          <div 
            className="player-indicator"
            style={{ backgroundColor: currentPlayer.color }}
          />
          <h3>{getCurrentPlayerName()}</h3>
        </div>
      </div>

      <div className="game-status">
        <p className="status-text">{getGameStateDisplay()}</p>
        
        <div className="dice-container">
          <div className="dice-display">
            {getDiceDisplay()}
          </div>
        </div>
      </div>

      <div className="players-list">
        <h4>Teams</h4>
        {gameState.players.map((player) => (
          <div 
            key={player.id} 
            className={`player-item ${player.id === gameState.currentTurnIndex ? 'active' : ''}`}
          >
            <div 
              className="player-color"
              style={{ backgroundColor: player.color }}
            />
            <span className="player-name">{player.name}</span>
            <div className="car-count">
              {player.cars.filter(car => car.position === 'track').length}/
              {player.cars.length}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;