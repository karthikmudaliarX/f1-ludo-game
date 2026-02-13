import React from 'react';
import { useGame } from '../context/GameContext';
import Tile from './Tile';
import CarToken from './CarToken';
import './Board.css';

const Board = () => {
  const { gameState } = useGame();

  // Generate 52 track positions in a circular loop
  const generateTrackPositions = () => {
    const positions = [];
    const centerX = 250; // Center of 500px track container
    const centerY = 250;
    const radius = 200; // Radius of the track
    
    for (let i = 0; i < 52; i++) {
      const angle = (i / 52) * 2 * Math.PI - Math.PI / 2; // Start from top, go clockwise
      const x = centerX + radius * Math.cos(angle) - 15; // -15 to center the 30px tile
      const y = centerY + radius * Math.sin(angle) - 15;
      
      positions.push({
        id: i,
        x,
        y,
        angle: angle * (180 / Math.PI), // Convert to degrees for display
        isTrackPosition: true
      });
    }
    return positions;
  };

  const trackPositions = generateTrackPositions();

  // Get cars that are currently on the track
  const getTrackCars = () => {
    const cars = [];
    gameState.players.forEach(player => {
      player.cars.forEach(car => {
        if (car.position === 'track' && car.trackPosition !== null) {
          cars.push({
            ...car,
            player,
            trackPosition: car.trackPosition
          });
        }
      });
    });
    return cars;
  };

  const trackCars = getTrackCars();

  return (
    <div className="board">
      <div className="track-container">
        {trackPositions.map(position => {
          // Check if there's a car on this position
          const carOnPosition = trackCars.find(car => car.trackPosition === position.id);
          
          return (
            <div
              key={position.id}
              className="track-tile-wrapper"
              style={{
                position: 'absolute',
                left: position.x,
                top: position.y,
                width: '30px',
                height: '30px',
                transform: `rotate(${position.angle + 90}deg)` // Rotate tiles to face outward
              }}
            >
              <Tile
                id={position.id}
                isTrackPosition={true}
              />
              
              {/* Render car if present on this track position */}
              {carOnPosition && (
                <CarToken
                  car={carOnPosition}
                  player={carOnPosition.player}
                  isClickable={false}
                />
              )}
            </div>
          );
        })}
      </div>
      
      {/* Center area of the board */}
      <div className="center-area">
        <div className="track-logo">
          <h2>F1</h2>
          <p>RACING</p>
        </div>
      </div>
    </div>
  );
};

export default Board;