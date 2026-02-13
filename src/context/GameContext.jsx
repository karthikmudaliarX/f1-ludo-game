import React, { createContext, useContext, useReducer, useMemo, useEffect, useCallback } from 'react';
import { TurnManager } from '../logic/TurnManager';
import { MovementManager } from '../logic/MovementManager';
import { DiceManager } from '../logic/DiceManager';

// Game States
export const GAME_STATES = {
  WAITING_FOR_ROLL: 'WAITING_FOR_ROLL',
  WAITING_FOR_SPAWN: 'WAITING_FOR_SPAWN',
  WAITING_FOR_MOVE: 'WAITING_FOR_MOVE',
  TURN_COMPLETE: 'TURN_COMPLETE'
};

// F1 Team Colors
export const TEAM_COLORS = {
  RED: '#DC143C',    // Ferrari
  BLUE: '#00D2BE',   // Mercedes
  YELLOW: '#FF8700', // McLaren
  GREEN: '#00FF00'   // Williams
};

// Player order for round-robin
const PLAYER_ORDER = ['Ferrari', 'Mercedes', 'McLaren', 'Williams'];

// Initial players setup
const initialPlayers = [
  {
    id: 0,
    name: 'Ferrari',
    color: TEAM_COLORS.RED,
    cars: [
      { id: 0, position: 'garage', trackPosition: null, isActive: false },
      { id: 1, position: 'garage', trackPosition: null, isActive: false },
      { id: 2, position: 'garage', trackPosition: null, isActive: false },
      { id: 3, position: 'garage', trackPosition: null, isActive: false }
    ]
  },
  {
    id: 1,
    name: 'Mercedes',
    color: TEAM_COLORS.BLUE,
    cars: [
      { id: 0, position: 'garage', trackPosition: null, isActive: false },
      { id: 1, position: 'garage', trackPosition: null, isActive: false },
      { id: 2, position: 'garage', trackPosition: null, isActive: false },
      { id: 3, position: 'garage', trackPosition: null, isActive: false }
    ]
  },
  {
    id: 2,
    name: 'McLaren',
    color: TEAM_COLORS.YELLOW,
    cars: [
      { id: 0, position: 'garage', trackPosition: null, isActive: false },
      { id: 1, position: 'garage', trackPosition: null, isActive: false },
      { id: 2, position: 'garage', trackPosition: null, isActive: false },
      { id: 3, position: 'garage', trackPosition: null, isActive: false }
    ]
  },
  {
    id: 3,
    name: 'Williams',
    color: TEAM_COLORS.GREEN,
    cars: [
      { id: 0, position: 'garage', trackPosition: null, isActive: false },
      { id: 1, position: 'garage', trackPosition: null, isActive: false },
      { id: 2, position: 'garage', trackPosition: null, isActive: false },
      { id: 3, position: 'garage', trackPosition: null, isActive: false }
    ]
  }
];

// Initial game state
const initialGameState = {
  players: initialPlayers,
  currentTurnIndex: 0,  // Round-robin index (0-3)
  gameState: GAME_STATES.WAITING_FOR_ROLL,
  diceValue: null,
  turnNumber: 1,
  trackPositions: Array(52).fill(null), // 52 positions on the track
  winner: null,
  diceRolling: false
};

// Game actions
const GAME_ACTIONS = {
  ROLL_DICE: 'ROLL_DICE',
  SPAWN_CAR: 'SPAWN_CAR',
  MOVE_CAR: 'MOVE_CAR',
  END_TURN: 'END_TURN',
  ADVANCE_TURN: 'ADVANCE_TURN',
  RESET_GAME: 'RESET_GAME',
  SET_DICE_ROLLING: 'SET_DICE_ROLLING'
};

// Initialize managers
const turnManager = new TurnManager();
const movementManager = new MovementManager();
const diceManager = new DiceManager();

// Game reducer
function gameReducer(state, action) {
  switch (action.type) {
    case GAME_ACTIONS.ROLL_DICE: {
      const diceValue = action.diceValue;
      const currentPlayer = state.players[state.currentTurnIndex];
      
      // Check if player has inactive cars (in garage)
      const garageCars = currentPlayer.cars.filter(car => car.position === 'garage');
      // Check if player has active cars on track
      const activeCars = currentPlayer.cars.filter(car => car.isActive && car.position === 'track');
      
      let nextGameState;
      
      // Determine next state based on dice roll and available cars
      if (diceValue === 6 && garageCars.length > 0) {
        // Player rolled 6 AND has cars in garage -> can spawn
        nextGameState = GAME_STATES.WAITING_FOR_SPAWN;
      } else if (activeCars.length > 0) {
        // Player has active cars -> can move
        nextGameState = GAME_STATES.WAITING_FOR_MOVE;
      } else {
        // No spawn possible and no active cars -> turn complete
        nextGameState = GAME_STATES.TURN_COMPLETE;
      }

      return {
        ...state,
        diceValue,
        gameState: nextGameState,
        diceRolling: false
      };
    }

    case GAME_ACTIONS.SPAWN_CAR: {
      const { playerId, carId } = action;
      const player = state.players[playerId];
      const startingPosition = movementManager.getStartingPosition(playerId);
      
      // Use MovementManager to handle spawning
      const spawnResult = movementManager.spawnCar(playerId, carId, startingPosition);

      const updatedPlayers = state.players.map(p => {
        if (p.id === playerId) {
          const updatedCars = p.cars.map(car => {
            if (car.id === carId) {
              return {
                ...car,
                position: 'track',
                trackPosition: spawnResult.trackPosition,
                isActive: true
              };
            }
            return car;
          });
          return { ...p, cars: updatedCars };
        }
        return p;
      });

      return {
        ...state,
        players: updatedPlayers,
        trackPositions: movementManager.getTrackOccupancy(),
        gameState: GAME_STATES.TURN_COMPLETE  // End with TURN_COMPLETE
      };
    }

    case GAME_ACTIONS.MOVE_CAR: {
      const moveResult = action;
      const movingPlayer = state.players[moveResult.playerId];
      const carToMove = movingPlayer.cars.find(car => car.id === moveResult.carId);
      
      // Use MovementManager to handle movement (includes collision/knockout resolution)
      const moveInfo = movementManager.moveCar(carToMove, moveResult.playerId, state.diceValue);

      // Process move and potential knockout
      let updatedPlayers = state.players.map(player => {
        // Update the moving car
        if (player.id === moveResult.playerId) {
          const movedCars = player.cars.map(car => {
            if (car.id === moveResult.carId) {
              return {
                ...car,
                trackPosition: moveInfo.newTrackPosition
              };
            }
            return car;
          });
          return { ...player, cars: movedCars };
        }
        
        // Handle knockout - reset opponent's car to garage
        if (moveInfo.knockedOut && player.id === moveInfo.knockedOut.playerId) {
          const knockedOutCars = player.cars.map(car => {
            if (car.id === moveInfo.knockedOut.carId) {
              return {
                ...car,
                position: 'garage',
                trackPosition: null,
                isActive: false
              };
            }
            return car;
          });
          return { ...player, cars: knockedOutCars };
        }
        
        return player;
      });

      return {
        ...state,
        players: updatedPlayers,
        trackPositions: movementManager.getTrackOccupancy(),
        gameState: GAME_STATES.TURN_COMPLETE  // End with TURN_COMPLETE
      };
    }

    case GAME_ACTIONS.ADVANCE_TURN: {
      // Calculate next player's turn index using modulo for round-robin
      const nextTurnIndex = (state.currentTurnIndex + 1) % 4;
      const nextTurnNumber = nextTurnIndex === 0 ? state.turnNumber + 1 : state.turnNumber;
      
      return {
        ...state,
        currentTurnIndex: nextTurnIndex,
        gameState: GAME_STATES.WAITING_FOR_ROLL,
        diceValue: null,
        turnNumber: nextTurnNumber
      };
    }

    case GAME_ACTIONS.SET_DICE_ROLLING:
      return {
        ...state,
        diceRolling: action.isRolling
      };

    case GAME_ACTIONS.RESET_GAME:
      // Reset managers
      turnManager.initialize(initialPlayers);
      movementManager.initialize();
      diceManager.reset();
      
      return {
        ...initialGameState,
        players: JSON.parse(JSON.stringify(initialPlayers))
      };

    default:
      return state;
  }
}

// Create context
const GameContext = createContext();

// Context provider
export function GameProvider({ children }) {
  const [gameState, dispatch] = useReducer(gameReducer, initialGameState);

  // Initialize managers when players change
  React.useEffect(() => {
    turnManager.initialize(gameState.players);
    movementManager.initialize(gameState.trackPositions);
  }, [gameState.players, gameState.trackPositions]);

  // ADVANCE TURN: Listen for TURN_COMPLETE and automatically advance to next player
  useEffect(() => {
    if (gameState.gameState === GAME_STATES.TURN_COMPLETE) {
      // Small delay for visual feedback before advancing
      const timer = setTimeout(() => {
        dispatch({ type: GAME_ACTIONS.ADVANCE_TURN });
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [gameState.gameState]);

  // Memoized context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    gameState,
    dispatch,
    gameActions: GAME_ACTIONS,
    gameStates: GAME_STATES,
    teamColors: TEAM_COLORS,
    turnManager,
    movementManager,
    diceManager
  }), [gameState]);

  return (
    <GameContext.Provider value={contextValue}>
      {children}
    </GameContext.Provider>
  );
}

// Custom hook to use game context
export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}