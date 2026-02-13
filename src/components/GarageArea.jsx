import React from 'react';
import { useGame } from '../context/GameContext';
import Tile from './Tile';
import CarToken from './CarToken';
import './GarageArea.css';

const GarageArea = ({ playerId }) => {
  const { gameState } = useGame();
  const player = gameState.players[playerId];
  
  const getCarSlots = () => {
    const slots = [];
    for (let i = 0; i < 4; i++) {
      const row = Math.floor(i / 2);
      const col = i % 2;
      
      slots.push({
        id: i,
        row,
        col
      });
    }
    return slots;
  };

  const carSlots = getCarSlots();

  return (
    <div 
      className="garage-area"
      style={{
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
                gridRow: slot.row + 1,
                gridColumn: slot.col + 1
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