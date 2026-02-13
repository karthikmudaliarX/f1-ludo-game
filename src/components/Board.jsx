import React from 'react';
import { useGame } from '../context/GameContext';
import Tile from './Tile';
import CarToken from './CarToken';
import './Board.css';

const Board = ({ children }) => {
  const { gameState } = useGame();

  // Generate 52 track positions in a circular loop
  const generateTrackPositions = () => {
    const positions = [];
    const centerX = 250;
    const centerY = 250;
    const radius = 200;
    
    for (let i = 0; i < 52; i++) {
      const angle = (i / 52) * 2 * Math.PI - Math.PI / 2;
      const x = centerX + radius * Math.cos(angle) - 15;
      const y = centerY + radius * Math.sin(angle) - 15;
      
      positions.push({
        id: i,
        x,
        y,
        angle: angle * (180 / Math.PI),
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
      {/* Grid Zones for Garages */}
      <div className="garage-zone garage-top-left">
        {React.Children.toArray(children).find(child => child.props?.playerId === 0)}
      </div>
      <div className="garage-zone garage-top-right">
        {React.Children.toArray(children).find(child => child.props?.playerId === 1)}
      </div>
      <div className="garage-zone garage-bottom-left">
        {React.Children.toArray(children).find(child => child.props?.playerId === 2)}
      </div>
      <div className="garage-zone garage-bottom-right">
        {React.Children.toArray(children).find(child => child.props?.playerId === 3)}
      </div>
      
      {/* Track Padding Zones */}
      <div className="track-padding padding-top" />
      <div className="track-padding padding-bottom" />
      <div className="track-padding padding-left" />
      <div className="track-padding padding-right" />
      
      {/* Center Track */}
      <div className="track-center">
        <div className="track-container">
          {trackPositions.map(position => {
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
                  transform: `rotate(${position.angle + 90}deg)`
                }}
              >
                <Tile
                  id={position.id}
                  isTrackPosition={true}
                />
                
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
        
        {/* Center dashboard area */}
        <div className="center-dashboard">
          <div className="track-logo">
            <h2>F1</h2>
            <p>RACING</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Board;