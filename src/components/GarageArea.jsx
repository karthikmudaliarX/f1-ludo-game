import React from 'react';
import { useGame } from '../context/GameContext';
import Tile from './Tile';
import CarToken from './CarToken';
import './GarageArea.css';

const GarageArea = ({ playerId }) => {
  const { gameState, gameStates, teamColors } = useGame();
  const player = gameState.players[playerId];
  
  const getGaragePosition = () => {
    // Position garages in corners of the board
    const positions = [
      { top: '20px', left: '20px' },    // Player 0 (Ferrari) - Top Left
      { top: '20px', right: '20px' },   // Player 1 (Mercedes) - Top Right
      { bottom: '20px', left: '20px' }, // Player 2 (McLaren) - Bottom Left
      { bottom: '20px', right: '20px' } // Player 3 (Williams) - Bottom Right
    ];
    return positions[playerId];
  };

  const getCarSlots = () => {
    // 2x2 grid of car slots in each garage
    const slots = [];
    for (let i = 0; i < 4; i++) {
      const row = Math.floor(i / 2);
      const col = i % 2;
      
      slots.push({
        id: i,
        top: row === 0 ? '10px' : '60px',
        left: col === 0 ? '10px' : '60px'
      });
    }
    return slots;
  };

  const carSlots = getCarSlots();
  const garagePosition = getGaragePosition();

  return (
    <div 
      className="garage-area"
      style={{
        ...garagePosition,
        borderColor: player.color
      }}
    >
      <div className="garage-header">
        <div 
          className="garage-color"
          style={{ backgroundColor: player.color }}
        />
        <h3>{player.name}</h3>
      </div>
      
      <div className="garage-slots">
        {carSlots.map(slot => {
          const car = player.cars.find(c => c.id === slot.id);
          
          return (
            <div
              key={slot.id}
              className="garage-slot"
              style={{
                top: slot.top,
                left: slot.left
              }}
            >
              <Tile
                id={`garage-${playerId}-${slot.id}`}
                isGarageSlot={true}
                garagePlayerId={playerId}
              />
              {car && car.position === 'garage' && (
                <CarToken
                  car={car}
                  player={player}
                  isClickable={false}
                  position={{
                    left: '0px',
                    top: '0px'
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GarageArea;