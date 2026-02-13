import React from 'react';
import { useGame } from '../context/GameContext';
import './CarToken.css';

const CarToken = ({ 
  car, 
  player, 
  isClickable = false, 
  onClick = null,
  isHighlighted = false,
  trackPosition = null,
  position = null // For garage positioning
}) => {
  const { gameState } = useGame();

  const handleClick = () => {
    if (isClickable && onClick && gameState.gameState !== 'TURN_COMPLETE') {
      onClick(car, player);
    }
  };

  const getCarClass = () => {
    let className = `car-token car-${player.id}`;
    
    if (isHighlighted) {
      className += ' highlightable';
    }
    
    if (isClickable) {
      className += ' clickable';
    }
    
    return className;
  };

  const getCarStyle = () => {
    const style = {
      backgroundColor: player.color
    };

    // Position car on track
    if (trackPosition !== null && position) {
      style.left = position.x;
      style.top = position.y;
      style.position = 'absolute';
      style.zIndex = '50';
    }
    // Position car in garage
    else if (position && trackPosition === null) {
      style.left = position.left;
      style.top = position.top;
      style.position = 'absolute';
    }

    return style;
  };

  return (
    <div
      className={getCarClass()}
      onClick={handleClick}
      style={getCarStyle()}
    >
      <div className="car-number">
        {car.id + 1}
      </div>
    </div>
  );
};

export default CarToken;