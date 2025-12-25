import { createContext, useContext, useReducer, useMemo } from 'react';
import { drugNames } from '../data/drugs';
import { trickyPokemonNames } from '../data/pokemonService';

// Pre-generate all questions at import time
const generateQuestions = () => {
  const questions = [];
  
  // Add Pokemon questions
  const shuffledPokemon = [...trickyPokemonNames].sort(() => Math.random() - 0.5);
  for (const name of shuffledPokemon) {
    questions.push({
      id: `pokemon-${name}`,
      name,
      type: 'pokemon',
      imageUrl: null,
    });
  }
  
  // Add Drug questions  
  const shuffledDrugs = [...drugNames].sort(() => Math.random() - 0.5);
  for (const drug of shuffledDrugs) {
    questions.push({
      id: `drug-${drug.name}`,
      name: drug.name,
      type: 'drug',
      category: drug.category,
      color: drug.color,
      description: drug.description,
      pillShape: drug.pillShape,
      pillColor: drug.pillColor,
    });
  }
  
  // Shuffle all
  return questions.sort(() => Math.random() - 0.5);
};

// Initial state
const initialState = {
  gameMode: null,
  gameStatus: 'idle',
  players: [],
  currentPlayerIndex: 0,
  totalRounds: 10,
  currentRound: 0,
  livesPerPlayer: 3,
  currentQuestion: null,
  questionStartTime: null,
  lastAnswer: null,
  isCorrect: null,
  powerUps: {
    skip: 1,
    extraLife: 0
  },
  questions: [],
  questionIndex: 0,
};

// Action types
const ACTIONS = {
  SET_GAME_MODE: 'SET_GAME_MODE',
  SET_PLAYERS: 'SET_PLAYERS',
  START_GAME: 'START_GAME',
  SET_QUESTION: 'SET_QUESTION',
  SUBMIT_ANSWER: 'SUBMIT_ANSWER',
  NEXT_ROUND: 'NEXT_ROUND',
  USE_POWER_UP: 'USE_POWER_UP',
  RESET_GAME: 'RESET_GAME',
  SKIP_QUESTION: 'SKIP_QUESTION',
};

// Reducer
function gameReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_GAME_MODE:
      return {
        ...state,
        gameMode: action.payload,
      };
    
    case ACTIONS.SET_PLAYERS:
      return {
        ...state,
        players: action.payload.map((name, index) => ({
          id: index,
          name,
          score: 0,
          lives: state.livesPerPlayer,
          streak: 0,
          correctAnswers: 0,
          wrongAnswers: 0,
        })),
      };
    
    case ACTIONS.START_GAME: {
      const questions = generateQuestions();
      const firstQuestion = questions[0];
      return {
        ...state,
        gameStatus: 'playing',
        currentRound: 1,
        currentPlayerIndex: 0,
        questions,
        questionIndex: 1,
        currentQuestion: firstQuestion,
        questionStartTime: Date.now(),
        lastAnswer: null,
        isCorrect: null,
      };
    }
    
    case ACTIONS.SET_QUESTION: {
      const nextIndex = state.questionIndex;
      const question = state.questions[nextIndex % state.questions.length];
      return {
        ...state,
        currentQuestion: question,
        questionIndex: nextIndex + 1,
        questionStartTime: Date.now(),
        lastAnswer: null,
        isCorrect: null,
      };
    }
    
    case ACTIONS.SKIP_QUESTION: {
      const nextIndex = state.questionIndex;
      const question = state.questions[nextIndex % state.questions.length];
      return {
        ...state,
        currentQuestion: question,
        questionIndex: nextIndex + 1,
        questionStartTime: Date.now(),
        lastAnswer: null,
        isCorrect: null,
        powerUps: {
          ...state.powerUps,
          skip: Math.max(0, state.powerUps.skip - 1),
        },
      };
    }
    
    case ACTIONS.SUBMIT_ANSWER: {
      const { answer, timeTaken } = action.payload;
      const isCorrect = answer === state.currentQuestion.type;
      
      let points = 0;
      let newStreak = state.players[state.currentPlayerIndex].streak;
      
      if (isCorrect) {
        points = 100;
        const speedBonus = Math.max(0, 50 - Math.floor(timeTaken / 100));
        points += speedBonus;
        newStreak += 1;
        if (newStreak >= 10) points = Math.floor(points * 3);
        else if (newStreak >= 5) points = Math.floor(points * 2);
        else if (newStreak >= 3) points = Math.floor(points * 1.5);
      } else {
        if (state.gameMode === 'multiplayer') {
          points = -50;
        }
        newStreak = 0;
      }
      
      const updatedPlayers = state.players.map((player, index) => {
        if (index === state.currentPlayerIndex) {
          return {
            ...player,
            score: Math.max(0, player.score + points),
            lives: isCorrect ? player.lives : player.lives - 1,
            streak: newStreak,
            correctAnswers: isCorrect ? player.correctAnswers + 1 : player.correctAnswers,
            wrongAnswers: isCorrect ? player.wrongAnswers : player.wrongAnswers + 1,
          };
        }
        return player;
      });
      
      return {
        ...state,
        players: updatedPlayers,
        lastAnswer: answer,
        isCorrect,
        gameStatus: 'reveal',
      };
    }
    
    case ACTIONS.NEXT_ROUND: {
      const currentPlayer = state.players[state.currentPlayerIndex];
      
      // Check if current player just died in single player
      if (currentPlayer.lives <= 0 && state.gameMode === 'single') {
        return {
          ...state,
          gameStatus: 'gameover',
        };
      }
      
      const nextPlayerIndex = (state.currentPlayerIndex + 1) % state.players.length;
      const isNewRound = nextPlayerIndex === 0;
      const nextRound = isNewRound ? state.currentRound + 1 : state.currentRound;
      
      // Check if any player is still alive
      const alivePlayers = state.players.filter(p => p.lives > 0);
      
      // Check if game should end
      if (nextRound > state.totalRounds || alivePlayers.length === 0) {
        return {
          ...state,
          gameStatus: 'gameover',
        };
      }
      
      // Find next alive player
      let actualNextIndex = nextPlayerIndex;
      let loopCount = 0;
      while (state.players[actualNextIndex].lives <= 0 && loopCount < state.players.length) {
        actualNextIndex = (actualNextIndex + 1) % state.players.length;
        loopCount++;
      }
      
      // Get next question
      const nextQuestionIndex = state.questionIndex;
      const nextQuestion = state.questions[nextQuestionIndex % state.questions.length];
      
      return {
        ...state,
        currentRound: nextRound,
        currentPlayerIndex: actualNextIndex,
        gameStatus: 'playing',
        currentQuestion: nextQuestion,
        questionIndex: nextQuestionIndex + 1,
        questionStartTime: Date.now(),
        lastAnswer: null,
        isCorrect: null,
      };
    }
    
    case ACTIONS.USE_POWER_UP: {
      const powerUp = action.payload;
      if (state.powerUps[powerUp] <= 0) return state;
      
      const newPowerUps = {
        ...state.powerUps,
        [powerUp]: state.powerUps[powerUp] - 1,
      };
      
      if (powerUp === 'extraLife') {
        const updatedPlayers = state.players.map((player, index) => {
          if (index === state.currentPlayerIndex) {
            return { ...player, lives: player.lives + 1 };
          }
          return player;
        });
        return {
          ...state,
          powerUps: newPowerUps,
          players: updatedPlayers,
        };
      }
      
      return {
        ...state,
        powerUps: newPowerUps,
      };
    }
    
    case ACTIONS.RESET_GAME:
      return {
        ...initialState,
        gameStatus: 'idle',
      };
    
    default:
      return state;
  }
}

// Context
const GameContext = createContext(null);

// Provider component
export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  
  const actions = useMemo(() => ({
    setGameMode: (mode) => dispatch({ type: ACTIONS.SET_GAME_MODE, payload: mode }),
    setPlayers: (players) => dispatch({ type: ACTIONS.SET_PLAYERS, payload: players }),
    startGame: () => dispatch({ type: ACTIONS.START_GAME }),
    submitAnswer: (answer) => {
      // Note: we can't use state.questionStartTime directly here because it's captured in the closure
      // We'll pass it from the component instead
    },
    // We'll re-define these below to handle the closure issue or use a different pattern
  }), [dispatch]);

  // Re-defining actions that need the latest state
  const stableActions = useMemo(() => ({
    ...actions,
    submitAnswer: (answer, timeTaken) => {
      dispatch({ type: ACTIONS.SUBMIT_ANSWER, payload: { answer, timeTaken } });
    },
    nextRound: () => dispatch({ type: ACTIONS.NEXT_ROUND }),
    skipQuestion: () => dispatch({ type: ACTIONS.SKIP_QUESTION }),
    usePowerUp: (powerUp) => dispatch({ type: ACTIONS.USE_POWER_UP, payload: powerUp }),
    resetGame: () => dispatch({ type: ACTIONS.RESET_GAME }),
  }), [actions, dispatch]);
  
  const contextValue = useMemo(() => ({
    state,
    actions: stableActions,
    dispatch
  }), [state, stableActions]);
  
  return (
    <GameContext.Provider value={contextValue}>
      {children}
    </GameContext.Provider>
  );
}

// Custom hook
export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}

export default GameContext;
