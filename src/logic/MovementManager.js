import { GAME_STATES } from '../context/GameContext';

// Safe tiles where knockouts are not allowed
const SAFE_TILES = [0, 13, 26, 39];

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

  // Check if a tile is a safe zone
  isSafeTile(position) {
    return SAFE_TILES.includes(position);
  }

  // Resolve collision after a car moves
  // Returns knockout info if opponent was knocked out, or null if move was blocked
  resolveCollision(movingCar, playerId, newPosition) {
    const collision = this.getCollisionInfo(newPosition, playerId);
    
    // No collision - nothing to resolve
    if (!collision.hasCollision) {
      return { type: 'NO_COLLISION' };
    }
    
    // Same team - cars can stack, no knockout
    if (collision.isOwnPlayer) {
      return { type: 'STACK' };
    }
    
    // Check if target tile is a safe zone
    if (this.isSafeTile(newPosition)) {
      // Cannot knockout on safe tile - cancel the move
      return { 
        type: 'BLOCKED', 
        reason: 'SAFE_TILE',
        message: 'Cannot knockout opponent on safe tile!'
      };
    }
    
    // Knockout opponent car!
    const knockedOutPlayerId = collision.playerId;
    const knockedOutCarId = collision.carId;
    
    // Clear the opponent's position from track
    this.trackPositions[newPosition] = null;
    
    return {
      type: 'KNOCKOUT',
      knockedOutPlayerId,
      knockedOutCarId,
      message: 'Knockout!'
    };
  }

  // Move car on the track
  moveCar(car, playerId, steps) {
    const newPosition = this.calculateNewPosition(car.trackPosition, steps);
    
    // Clear old position first
    if (car.trackPosition !== null) {
      this.trackPositions[car.trackPosition] = null;
    }
    
    // Resolve collision (may result in knockout or be blocked)
    const collisionResult = this.resolveCollision(car, playerId, newPosition);
    
    let finalPosition = newPosition;
    let knockedOutInfo = null;
    
    if (collisionResult.type === 'BLOCKED') {
      // Movement blocked - return to original position
      finalPosition = car.trackPosition;
      this.trackPositions[car.trackPosition] = {
        playerId,
        carId: car.id
      };
    } else if (collisionResult.type === 'KNOCKOUT') {
      // Knockout occurred - store info for state update
      knockedOutInfo = {
        playerId: collisionResult.knockedOutPlayerId,
        carId: collisionResult.knockedOutCarId
      };
      // Moving car takes the position
      this.trackPositions[newPosition] = {
        playerId,
        carId: car.id
      };
    } else if (collisionResult.type === 'STACK' || collisionResult.type === 'NO_COLLISION') {
      // Normal move or stacking
      this.trackPositions[newPosition] = {
        playerId,
        carId: car.id
      };
    }
    
    return {
      newTrackPosition: finalPosition,
      collision: collisionResult,
      knockedOut: knockedOutInfo,
      wasBlocked: collisionResult.type === 'BLOCKED'
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
      return { valid: false, reason: 'Car not active' };
    }

    const newPosition = this.calculateNewPosition(car.trackPosition, steps);
    const collision = this.getCollisionInfo(newPosition, playerId);
    
    // Check if move would be blocked by safe tile opponent
    if (collision.hasCollision && !collision.isOwnPlayer && this.isSafeTile(newPosition)) {
      return { 
        valid: false, 
        reason: 'SAFE_TILE',
        message: 'Cannot move to safe tile with opponent'
      };
    }
    
    return { valid: true };
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
      const moveCheck = this.isLegalMove(car, player.id, diceValue);
      
      if (moveCheck.valid) {
        const newPosition = this.calculateNewPosition(car.trackPosition, diceValue);
        const collision = this.getCollisionInfo(newPosition, player.id);
        
        // Check if this move would result in knockout
        let moveType = 'MOVE';
        if (collision.hasCollision && !collision.isOwnPlayer && !this.isSafeTile(newPosition)) {
          moveType = 'KNOCKOUT_MOVE';
        }
        
        legalMoves.push({
          type: moveType,
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
  
  // Get safe tiles
  getSafeTiles() {
    return [...SAFE_TILES];
  }
}