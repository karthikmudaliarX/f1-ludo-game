import React from 'react';
import { useGame } from '../context/GameContext';
import './ActionPanel.css';

const ActionPanel = () => {
  const { gameState, gameStates, dispatch, gameActions } = useGame();
  const currentPlayer = gameState.players[gameState.currentPlayer];

  const handleRollDice = () => {
    if (gameState.gameState === gameStates.WAITING_FOR_ROLL) {
      const diceValue = Math.floor(Math.random() * 6) + 1;
      dispatch({
        type: gameActions.ROLL_DICE,
        diceValue
      });
    }
  };

  const handleSpawnCar = (carId) => {
    if (gameState.gameState === gameStates.WAITING_FOR_SPAWN) {
      const garageCars = currentPlayer.cars.filter(car => car.position === 'garage');
      if (garageCars.some(car => car.id === carId)) {
        dispatch({
          type: gameActions.SPAWN_CAR,
          playerId: currentPlayer.id,
          carId,
          trackPosition: currentPlayer.id * 13 // Starting position for each player
        });
      }
    }
  };

  const handleMoveCar = (carId) => {
    if (gameState.gameState === gameStates.WAITING_FOR_MOVE) {
      const activeCars = currentPlayer.cars.filter(car => car.isActive && car.position === 'track');
      if (activeCars.some(car => car.id === carId)) {
        const currentCar = activeCars.find(car => car.id === carId);
        const newTrackPosition = (currentCar.trackPosition + gameState.diceValue) % 52;
        
        dispatch({
          type: gameActions.MOVE_CAR,
          playerId: currentPlayer.id,
          carId,
          newTrackPosition
        });
      }
    }
  };

  const getAvailableActions = () => {
    switch (gameState.gameState) {
      case gameStates.WAITING_FOR_ROLL:
        return (
          <button 
            className="action-button primary"
            onClick={handleRollDice}
            disabled={gameState.gameState !== gameStates.WAITING_FOR_ROLL}
          >
            🎲 Roll Dice
          </button>
        );

      case gameStates.WAITING_FOR_SPAWN:
        const garageCars = currentPlayer.cars.filter(car => car.position === 'garage');
        return (
          <div className="spawn-options">
            <h4>Choose a car to spawn:</h4>
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
          <div className="move-options">
            <h4>Choose a car to move:</h4>
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
          <div className="turn-complete">
            <h4>Turn Complete!</h4>
            <button 
              className="action-button primary"
              onClick={() => dispatch({ type: gameActions.NEXT_PLAYER })}
            >
              ➡️ Next Player
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="action-panel">
      {getAvailableActions()}
    </div>
  );
};

export default ActionPanel;