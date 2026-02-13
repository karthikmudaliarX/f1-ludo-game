import React, { createContext, useContext, useReducer, useMemo } from 'react';

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
  currentPlayer: 0,
  gameState: GAME_STATES.WAITING_FOR_ROLL,
  diceValue: null,
  turnNumber: 1,
  trackPositions: Array(52).fill(null), // 52 positions on the track
  winner: null
};

// Game actions
const GAME_ACTIONS = {
  ROLL_DICE: 'ROLL_DICE',
  SPAWN_CAR: 'SPAWN_CAR',
  MOVE_CAR: 'MOVE_CAR',
  END_TURN: 'END_TURN',
  NEXT_PLAYER: 'NEXT_PLAYER',
  RESET_GAME: 'RESET_GAME'
};

// Game reducer
function gameReducer(state, action) {
  switch (action.type) {
    case GAME_ACTIONS.ROLL_DICE:
      return {
        ...state,
        diceValue: action.diceValue,
        gameState: action.diceValue === 6 ? GAME_STATES.WAITING_FOR_SPAWN : GAME_STATES.WAITING_FOR_MOVE
      };

    case GAME_ACTIONS.SPAWN_CAR:
      const { playerId, carId, trackPosition } = action;
      const updatedPlayers = state.players.map(player => {
        if (player.id === playerId) {
          const updatedCars = player.cars.map(car => {
            if (car.id === carId) {
              return {
                ...car,
                position: 'track',
                trackPosition,
                isActive: true
              };
            }
            return car;
          });
          return { ...player, cars: updatedCars };
        }
        return player;
      });

      // Update track position
      const newTrackPositions = [...state.trackPositions];
      newTrackPositions[trackPosition] = { playerId, carId };

      return {
        ...state,
        players: updatedPlayers,
        trackPositions: newTrackPositions,
        gameState: GAME_STATES.WAITING_FOR_MOVE
      };

    case GAME_ACTIONS.MOVE_CAR:
      const moveResult = action;
      const movedPlayers = state.players.map(player => {
        if (player.id === moveResult.playerId) {
          const movedCars = player.cars.map(car => {
            if (car.id === moveResult.carId) {
              // Clear old track position
              const newTrackPositions = [...state.trackPositions];
              if (car.trackPosition !== null) {
                newTrackPositions[car.trackPosition] = null;
              }
              
              // Set new track position
              newTrackPositions[moveResult.newTrackPosition] = { 
                playerId: moveResult.playerId, 
                carId: moveResult.carId 
              };

              return {
                ...car,
                trackPosition: moveResult.newTrackPosition
              };
            }
            return car;
          });
          return { ...player, cars: movedCars };
        }
        return player;
      });

      return {
        ...state,
        players: movedPlayers,
        gameState: GAME_STATES.TURN_COMPLETE
      };

    case GAME_ACTIONS.NEXT_PLAYER:
      const nextPlayer = (state.currentPlayer + 1) % state.players.length;
      return {
        ...state,
        currentPlayer: nextPlayer,
        gameState: GAME_STATES.WAITING_FOR_ROLL,
        diceValue: null
      };

    case GAME_ACTIONS.RESET_GAME:
      return initialGameState;

    default:
      return state;
  }
}

// Create context
const GameContext = createContext();

// Context provider
export function GameProvider({ children }) {
  const [gameState, dispatch] = useReducer(gameReducer, initialGameState);

  // Memoized context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    gameState,
    dispatch,
    gameActions: GAME_ACTIONS,
    gameStates: GAME_STATES,
    teamColors: TEAM_COLORS
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