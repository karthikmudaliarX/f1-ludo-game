import React from 'react';
import { useGame } from '../context/GameContext';
import './ActionPanel.css';

const ActionPanel = () => {
  const { gameState, gameStates, dispatch, gameActions, turnManager, diceManager } = useGame();
  const currentPlayer = gameState.players[gameState.currentTurnIndex];

  const handleRollDice = async () => {
    if (gameState.gameState === gameStates.WAITING_FOR_ROLL && !gameState.diceRolling) {
      // Set rolling state
      dispatch({ type: 'SET_DICE_ROLLING', isRolling: true });
      
      // Start dice roll animation
      const rollPromise = new Promise((resolve) => {
        const rollResult = diceManager.rollDice();
        // Wait for animation to complete
        setTimeout(() => resolve(rollResult), 1000);
      });

      const diceValue = await rollPromise;
      
      // Dispatch the actual dice roll
      dispatch({
        type: gameActions.ROLL_DICE,
        diceValue
      });
    }
  };

  const handleSpawnCar = (carId) => {
    if (gameState.gameState === gameStates.WAITING_FOR_SPAWN) {
      dispatch({
        type: gameActions.SPAWN_CAR,
        playerId: currentPlayer.id,
        carId
      });
    }
  };

  const handleMoveCar = (carId) => {
    if (gameState.gameState === gameStates.WAITING_FOR_MOVE) {
      dispatch({
        type: gameActions.MOVE_CAR,
        playerId: currentPlayer.id,
        carId
      });
    }
  };

  const getAvailableActions = () => {
    switch (gameState.gameState) {
      case gameStates.WAITING_FOR_ROLL:
        return (
          <div className="action-section">
            <h4>Your Turn - {currentPlayer.name}</h4>
            <button 
              className="action-button primary roll-button"
              onClick={handleRollDice}
              disabled={gameState.diceRolling || gameState.gameState !== gameStates.WAITING_FOR_ROLL}
            >
              {gameState.diceRolling ? '🎲 Rolling...' : '🎲 Roll Dice'}
            </button>
          </div>
        );

      case gameStates.WAITING_FOR_SPAWN:
        const garageCars = currentPlayer.cars.filter(car => car.position === 'garage');
        return (
          <div className="action-section">
            <h4>🎯 You rolled a 6! Choose a car to spawn:</h4>
            <div className="car-choices">
              {garageCars.map(car => (
                <button
                  key={car.id}
                  className="car-choice"
                  onClick={() => handleSpawnCar(car.id)}
                  style={{ backgroundColor: currentPlayer.color }}
                >
                  Car {car.id + 1}
                </button>
              ))}
            </div>
          </div>
        );

      case gameStates.WAITING_FOR_MOVE:
        const activeCars = currentPlayer.cars.filter(car => car.isActive && car.position === 'track');
        
        return (
          <div className="action-section">
            <h4>Choose a car to move {gameState.diceValue} steps:</h4>
            <div className="car-choices">
              {activeCars.map(car => (
                <button
                  key={car.id}
                  className="car-choice"
                  onClick={() => handleMoveCar(car.id)}
                  style={{ backgroundColor: currentPlayer.color }}
                >
                  Car {car.id + 1} (Pos: {car.trackPosition})
                </button>
              ))}
            </div>
          </div>
        );

      case gameStates.TURN_COMPLETE:
        return (
          <div className="action-section">
            <h4>✅ Turn Complete! Passing to next player...</h4>
          </div>
        );

      default:
        return (
          <div className="action-section">
            <p>Game is loading...</p>
          </div>
        );
    }
  };

  return (
    <div className="action-panel">
      {getAvailableActions()}
    </div>
  );
};

export default ActionPanel;