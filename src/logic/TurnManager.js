import { GAME_STATES } from '../context/GameContext';

// Turn Manager - handles player turn logic and state transitions
export class TurnManager {
  constructor() {
    this.currentPlayer = 0;
    this.turnNumber = 1;
    this.players = [];
  }

  // Initialize turn manager with players
  initialize(players) {
    this.players = players;
    this.currentPlayer = 0;
    this.turnNumber = 1;
  }

  // Get current player
  getCurrentPlayer() {
    return this.players[this.currentPlayer];
  }

  // Check if player has any legal moves
  hasLegalMoves(player, diceValue) {
    if (!player) return false;

    // If rolling 6, check if player has cars in garage to spawn
    if (diceValue === 6) {
      const garageCars = player.cars.filter(car => car.position === 'garage');
      if (garageCars.length > 0) {
        return true;
      }
    }

    // Check if player has active cars that can move
    const activeCars = player.cars.filter(car => car.isActive && car.position === 'track');
    return activeCars.length > 0;
  }

  // Determine next game state based on current state and dice roll
  determineNextState(currentState, diceValue, player) {
    switch (currentState) {
      case GAME_STATES.WAITING_FOR_ROLL:
        if (diceValue === 6) {
          // Check if player has cars to spawn
          const garageCars = player.cars.filter(car => car.position === 'garage');
          if (garageCars.length > 0) {
            return GAME_STATES.WAITING_FOR_SPAWN;
          }
        }
        
        // No spawn needed or possible, check for movement
        if (this.hasLegalMoves(player, diceValue)) {
          return GAME_STATES.WAITING_FOR_MOVE;
        }
        
        // No legal moves, turn complete
        return GAME_STATES.TURN_COMPLETE;

      case GAME_STATES.WAITING_FOR_SPAWN:
        return GAME_STATES.WAITING_FOR_MOVE;

      case GAME_STATES.WAITING_FOR_MOVE:
        return GAME_STATES.TURN_COMPLETE;

      case GAME_STATES.TURN_COMPLETE:
        return this.nextPlayer();

      default:
        return currentState;
    }
  }

  // Move to next player
  nextPlayer() {
    this.currentPlayer = (this.currentPlayer + 1) % this.players.length;
    
    // Increment turn number when we cycle back to first player
    if (this.currentPlayer === 0) {
      this.turnNumber++;
    }

    return {
      currentPlayer: this.currentPlayer,
      turnNumber: this.turnNumber,
      gameState: GAME_STATES.WAITING_FOR_ROLL
    };
  }

  // Check if game is won
  checkWinner(player) {
    return player.cars.every(car => car.position === 'track' && car.isActive);
  }

  // Get available actions for current game state
  getAvailableActions(gameState, player, diceValue) {
    switch (gameState) {
      case GAME_STATES.WAITING_FOR_ROLL:
        return ['ROLL_DICE'];

      case GAME_STATES.WAITING_FOR_SPAWN:
        if (diceValue === 6) {
          const garageCars = player.cars.filter(car => car.position === 'garage');
          return garageCars.map(car => `SPAWN_CAR_${car.id}`);
        }
        return [];

      case GAME_STATES.WAITING_FOR_MOVE:
        const activeCars = player.cars.filter(car => car.isActive && car.position === 'track');
        return activeCars.map(car => `MOVE_CAR_${car.id}`);

      case GAME_STATES.TURN_COMPLETE:
        return ['NEXT_PLAYER'];

      default:
        return [];
    }
  }
}