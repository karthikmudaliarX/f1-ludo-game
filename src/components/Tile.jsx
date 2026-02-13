import React from 'react';
import './Tile.css';

const Tile = ({ 
  id, 
  position, 
  isTrackPosition = false, 
  isGarageSlot = false, 
  garagePlayerId = null,
  isHighlighted = false 
}) => {
  const tileClass = `
    tile
    ${isTrackPosition ? 'track-tile' : ''}
    ${isGarageSlot ? 'garage-tile' : ''}
    ${isHighlighted ? 'highlighted' : ''}
  `;

  return (
    <div className={tileClass}>
      {isTrackPosition && (
        <div className="track-number">
          {id + 1}
        </div>
      )}
      {isGarageSlot && (
        <div className="garage-slot">
          {garagePlayerId !== null && (
            <div className="slot-indicator">
              P{garagePlayerId}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Tile;