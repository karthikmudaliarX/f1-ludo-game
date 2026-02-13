import { GAME_STATES } from '../context/GameContext';

// Movement Manager - handles car movement logic and collision detection
export class MovementManager {
  constructor() {
    this.trackLength = 52; // Total positions on the track
    this.trackPositions = new Array(this.trackLength).fill(null); // Track occupancy
  }

  // Initialize track positions
  initialize(trackPositions = null) {
    if (trackPositions) {
      this.trackPositions = [...trackPositions];
    } else {
      this.trackPositions = new Array(this.trackLength).fill(null);
    }
  }

  // Get new track position after moving
  calculateNewPosition(currentPosition, steps) {
    if (currentPosition === null) return null;
    return (currentPosition + steps) % this.trackLength;
  }

  // Check if a position is occupied
  isPositionOccupied(position) {
    return this.trackPositions[position] !== null;
  }

  // Check if position is occupied by opponent
  isOccupiedByOpponent(position, playerId) {
    const occupancy = this.trackPositions[position];
    return occupancy !== null && occupancy.playerId !== playerId;
  }

  // Get collision information for a position
  getCollisionInfo(position, playerId) {
    const occupancy = this.trackPositions[position];
    if (occupancy === null) {
      return { hasCollision: false, playerId: null, carId: null };
    }

    return {
      hasCollision: true,
      playerId: occupancy.playerId,
      carId: occupancy.carId,
      isOwnPlayer: occupancy.playerId === playerId
    };
  }

  // Move car on the track
  moveCar(car, playerId, steps) {
    const newPosition = this.calculateNewPosition(car.trackPosition, steps);
    
    // Handle collision
    const collision = this.getCollisionInfo(newPosition, playerId);
    
    // Update track positions
    // Clear old position
    if (car.trackPosition !== null) {
      this.trackPositions[car.trackPosition] = null;
    }

    // Set new position
    this.trackPositions[newPosition] = {
      playerId,
      carId: car.id
    };

    return {
      newTrackPosition: newPosition,
      collision
    };
  }

  // Spawn car on the track at starting position
  spawnCar(playerId, carId, startingPosition) {
    // Clear any existing car at that position
    if (this.trackPositions[startingPosition] !== null) {
      this.trackPositions[startingPosition] = null;
    }

    // Set new position
    this.trackPositions[startingPosition] = {
      playerId,
      carId
    };

    return {
      trackPosition: startingPosition,
      collision: { hasCollision: false }
    };
  }

  // Get starting position for a player (different for each player)
  getStartingPosition(playerId) {
    // Distribute starting positions around the track
    const basePosition = playerId * 13; // 52/4 = 13
    return basePosition % this.trackLength;
  }

  // Validate if a move is legal
  isLegalMove(car, playerId, steps) {
    // Car must be active and on track
    if (!car.isActive || car.position !== 'track' || car.trackPosition === null) {
      return false;
    }

    const newPosition = this.calculateNewPosition(car.trackPosition, steps);
    
    // Basic movement is always legal (cars can stack on same position)
    return true;
  }

  // Get all legal moves for a player
  getLegalMoves(player, diceValue) {
    const legalMoves = [];
    
    // Check spawning moves (if dice is 6)
    if (diceValue === 6) {
      const garageCars = player.cars.filter(car => car.position === 'garage');
      garageCars.forEach(car => {
        legalMoves.push({
          type: 'SPAWN',
          carId: car.id,
          car,
          startingPosition: this.getStartingPosition(player.id)
        });
      });
    }

    // Check movement moves
    const activeCars = player.cars.filter(car => car.isActive && car.position === 'track');
    activeCars.forEach(car => {
      if (this.isLegalMove(car, player.id, diceValue)) {
        const newPosition = this.calculateNewPosition(car.trackPosition, diceValue);
        legalMoves.push({
          type: 'MOVE',
          carId: car.id,
          car,
          newTrackPosition: newPosition,
          steps: diceValue
        });
      }
    });

    return legalMoves;
  }

  // Track position for car token positioning
  getTrackPositionCoordinates(position) {
    const centerX = 250;
    const centerY = 250;
    const radius = 200;
    const angle = (position / this.trackLength) * 2 * Math.PI - Math.PI / 2;
    
    return {
      x: centerX + radius * Math.cos(angle) - 15,
      y: centerY + radius * Math.sin(angle) - 15,
      angle: (angle * 180 / Math.PI) + 90
    };
  }

  // Get current track occupancy
  getTrackOccupancy() {
    return [...this.trackPositions];
  }

  // Check if position is safe (occupied by own player)
  isSafePosition(position, playerId) {
    const occupancy = this.trackPositions[position];
    return occupancy !== null && occupancy.playerId === playerId;
  }
}