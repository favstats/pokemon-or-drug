import { createContext, useContext, useReducer, useMemo, useEffect } from 'react';
import { drugNames } from '../data/drugs';
import { trickyPokemonNames } from '../data/pokemonService';
import { fetchGlobalScores, submitGlobalScore } from '../data/globalScoreService';

// Bonus round types
const BONUS_TYPES = ['oddOneOut', 'selectAll', 'namePokemon'];

// League definitions (Kanto Gym Badge theme)
export const LEAGUES = {
  boulder: {
    id: 'boulder',
    name: 'Boulder Badge',
    badge: 'Boulder Badge',
    gymLeader: 'Brock',
    arena: 'Pewter City Gym',
    difficulty: 'Easy',
    color: '#8B8B8B',
    settings: {
      totalRounds: 10,
      livesPerPlayer: 5,
      timerDuration: 15,
      bonusProbability: 30,
    },
  },
  cascade: {
    id: 'cascade',
    name: 'Cascade Badge',
    badge: 'Cascade Badge',
    gymLeader: 'Misty',
    arena: 'Cerulean City Gym',
    difficulty: 'Medium',
    color: '#6890F0',
    settings: {
      totalRounds: 15,
      livesPerPlayer: 3,
      timerDuration: 10,
      bonusProbability: 20,
    },
  },
  volcano: {
    id: 'volcano',
    name: 'Volcano Badge',
    badge: 'Volcano Badge',
    gymLeader: 'Blaine',
    arena: 'Cinnabar Island Gym',
    difficulty: 'Hard',
    color: '#F08030',
    settings: {
      totalRounds: 20,
      livesPerPlayer: 2,
      timerDuration: 8,
      bonusProbability: 10,
    },
  },
  earth: {
    id: 'earth',
    name: 'Earth Badge',
    badge: 'Earth Badge',
    gymLeader: 'Giovanni',
    arena: 'Viridian City Gym',
    difficulty: 'Extreme',
    color: '#E0C068',
    settings: {
      totalRounds: 30,
      livesPerPlayer: 1, // One wrong answer and you're out
      timerDuration: 5,
      bonusProbability: 0,
    },
  },
};

// Pre-generate all questions with good variety (not too many of same type in a row)
const generateQuestions = () => {
  // Create separate pools
  const pokemonPool = [...trickyPokemonNames]
    .sort(() => Math.random() - 0.5)
    .map(name => ({
      id: `pokemon-${name}`,
      name,
      type: 'pokemon',
      imageUrl: null,
    }));
  
  const drugPool = [...drugNames]
    .sort(() => Math.random() - 0.5)
    .map(drug => ({
      id: `drug-${drug.name}`,
      name: drug.name,
      type: 'drug',
      category: drug.category,
      color: drug.color,
      description: drug.description,
      pillShape: drug.pillShape,
      pillColor: drug.pillColor,
    }));
  
  // True 50/50 random selection - pick randomly from either pool
  const questions = [];
  let pokemonIdx = 0;
  let drugIdx = 0;
  
  while (pokemonIdx < pokemonPool.length || drugIdx < drugPool.length) {
    const hasPokemon = pokemonIdx < pokemonPool.length;
    const hasDrug = drugIdx < drugPool.length;
    
    let pickPokemon;
    
    if (!hasPokemon) {
      pickPokemon = false;
    } else if (!hasDrug) {
      pickPokemon = true;
    } else {
      // Both available - pure 50/50 random
      pickPokemon = Math.random() < 0.5;
    }
    
    if (pickPokemon) {
      questions.push(pokemonPool[pokemonIdx++]);
    } else {
      questions.push(drugPool[drugIdx++]);
    }
  }
  
  return questions;
};

// Generate bonus round data based on type
const generateBonusRoundData = (type, questions, questionIndex) => {
  const getRandomPokemon = (count, exclude = []) => {
    const available = trickyPokemonNames.filter(p => !exclude.includes(p));
    const shuffled = [...available].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  };
  
  const getRandomDrugs = (count, exclude = []) => {
    const available = drugNames.filter(d => !exclude.includes(d.name));
    const shuffled = [...available].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count).map(d => d.name);
  };

  switch (type) {
    case 'oddOneOut': {
      // 3 of one type, 1 of the other
      const majorityType = Math.random() > 0.5 ? 'pokemon' : 'drug';
      const majorityCount = 3;
      const minorityCount = 1;
      
      let majorityItems, minorityItems;
      if (majorityType === 'pokemon') {
        majorityItems = getRandomPokemon(majorityCount).map(name => ({ name, type: 'pokemon' }));
        minorityItems = getRandomDrugs(minorityCount).map(name => ({ name, type: 'drug' }));
      } else {
        majorityItems = getRandomDrugs(majorityCount).map(name => ({ name, type: 'drug' }));
        minorityItems = getRandomPokemon(minorityCount).map(name => ({ name, type: 'pokemon' }));
      }
      
      const items = [...majorityItems, ...minorityItems].sort(() => Math.random() - 0.5);
      const correctAnswer = minorityItems[0].name;
      const targetType = majorityType === 'pokemon' ? 'drug' : 'pokemon';
      
      return {
        type: 'oddOneOut',
        prompt: `Find the ${targetType === 'pokemon' ? 'Pokémon' : 'Drug'}!`,
        items,
        correctAnswer,
        targetType,
      };
    }
    
    case 'selectAll': {
      // 5 mixed items, select all of target type
      const targetType = Math.random() > 0.5 ? 'pokemon' : 'drug';
      const targetCount = 2 + Math.floor(Math.random() * 2); // 2-3 targets
      const otherCount = 5 - targetCount;
      
      let targetItems, otherItems;
      if (targetType === 'pokemon') {
        targetItems = getRandomPokemon(targetCount).map(name => ({ name, type: 'pokemon' }));
        otherItems = getRandomDrugs(otherCount).map(name => ({ name, type: 'drug' }));
      } else {
        targetItems = getRandomDrugs(targetCount).map(name => ({ name, type: 'drug' }));
        otherItems = getRandomPokemon(otherCount).map(name => ({ name, type: 'pokemon' }));
      }
      
      const items = [...targetItems, ...otherItems].sort(() => Math.random() - 0.5);
      const correctAnswers = targetItems.map(i => i.name);
      
      return {
        type: 'selectAll',
        prompt: `Select all the ${targetType === 'pokemon' ? 'Pokémon' : 'Drugs'}!`,
        items,
        correctAnswers,
        targetType,
      };
    }
    
    case 'namePokemon': {
      // Show a Pokemon image, pick correct name from 4 options (1 pokemon, 3 drugs)
      const pokemonName = getRandomPokemon(1)[0];
      const drugOptions = getRandomDrugs(3);
      
      const options = [
        { name: pokemonName, type: 'pokemon', isCorrect: true },
        ...drugOptions.map(name => ({ name, type: 'drug', isCorrect: false }))
      ].sort(() => Math.random() - 0.5);
      
      return {
        type: 'namePokemon',
        prompt: 'Name that Pokémon!',
        pokemonName,
        pokemonImageUrl: null, // Will be loaded by component
        options,
        correctAnswer: pokemonName,
      };
    }
    
    default:
      return null;
  }
};

// Initial state
const initialState = {
  gameMode: null,
  gameStatus: 'idle',
  selectedLeague: null, // null = unranked, or league id ('boulder', 'cascade', 'volcano', 'earth')
  players: [],
  currentPlayerIndex: 0,
  settings: {
    totalRounds: 10,
    livesPerPlayer: 3,
    timerDuration: 15,
    bonusProbability: 25, // percentage chance for bonus round
    shareGlobally: true, // share scores on global leaderboard
  },
  currentRound: 0,
  currentQuestion: null,
  questionStartTime: null,
  lastAnswer: null,
  lastTimeTaken: null,
  lastSpeedBonus: 0,
  isCorrect: null,
  powerUps: {
    skip: 1,
    extraLife: 0
  },
  questions: [],
  questionIndex: 0,
  highScores: JSON.parse(localStorage.getItem('pord_highscores') || '[]'),
  globalScores: [],
  globalScoresLoading: true, // Start as loading
  dailyScores: [],
  dailyScoresLoading: true, // Start as loading
  medals: JSON.parse(localStorage.getItem('pord_medals') || '[]'),
  // Bonus round state
  bonusRound: {
    active: false,
    type: null,
    data: null,
    lastBonusType: null,
  },
  bonusResult: null,
  // Game metadata
  gameMetadata: {
    gameId: null,
    startTime: null,
    endTime: null,
    totalLivesLost: 0,
  },
};

// Action types
const ACTIONS = {
  SET_GAME_MODE: 'SET_GAME_MODE',
  SET_LEAGUE: 'SET_LEAGUE',
  GO_TO_LEAGUE_SELECT: 'GO_TO_LEAGUE_SELECT',
  SET_PLAYERS: 'SET_PLAYERS',
  UPDATE_SETTINGS: 'UPDATE_SETTINGS',
  START_GAME: 'START_GAME',
  SET_QUESTION: 'SET_QUESTION',
  SUBMIT_ANSWER: 'SUBMIT_ANSWER',
  NEXT_ROUND: 'NEXT_ROUND',
  USE_POWER_UP: 'USE_POWER_UP',
  RESET_GAME: 'RESET_GAME',
  SKIP_QUESTION: 'SKIP_QUESTION',
  SAVE_SCORE: 'SAVE_SCORE',
  CLEAR_SCORES: 'CLEAR_SCORES',
  PLAY_AGAIN: 'PLAY_AGAIN',
  // Bonus round actions
  TRIGGER_BONUS_ROUND: 'TRIGGER_BONUS_ROUND',
  SUBMIT_BONUS_ANSWER: 'SUBMIT_BONUS_ANSWER',
  END_BONUS_ROUND: 'END_BONUS_ROUND',
  // Ready screen action
  START_PLAYING: 'START_PLAYING',
  // Global scores
  SET_GLOBAL_SCORES: 'SET_GLOBAL_SCORES',
  SET_GLOBAL_LOADING: 'SET_GLOBAL_LOADING',
  SET_DAILY_SCORES: 'SET_DAILY_SCORES',
  SET_DAILY_LOADING: 'SET_DAILY_LOADING',
  SET_MEDALS: 'SET_MEDALS',
};

// Reducer
function gameReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SAVE_SCORE: {
      const newScore = action.payload;
      // Check if this player already has a high score entry
      const existingIndex = state.highScores.findIndex(
        entry => entry.name.toLowerCase() === newScore.name.toLowerCase()
      );
      
      let updatedScores;
      if (existingIndex !== -1) {
        // Update only if the new score is higher
        if (newScore.score > state.highScores[existingIndex].score) {
          updatedScores = [...state.highScores];
          updatedScores[existingIndex] = newScore;
          updatedScores.sort((a, b) => b.score - a.score);
        } else {
          // Keep existing scores unchanged
          return state;
        }
      } else {
        // Add new player score
        updatedScores = [...state.highScores, newScore]
          .sort((a, b) => b.score - a.score)
          .slice(0, 10); // Keep top 10
      }
      
      localStorage.setItem('pord_highscores', JSON.stringify(updatedScores));
      return {
        ...state,
        highScores: updatedScores,
      };
    }

    case ACTIONS.CLEAR_SCORES: {
      localStorage.removeItem('pord_highscores');
      return {
        ...state,
        highScores: [],
      };
    }
    
    case ACTIONS.SET_GAME_MODE:
      return {
        ...state,
        gameMode: action.payload,
      };
    
    case ACTIONS.SET_LEAGUE: {
      const leagueId = action.payload;
      if (leagueId === null) {
        // Unranked mode - keep default settings
        return {
          ...state,
          selectedLeague: null,
        };
      }
      // Apply league settings
      const league = LEAGUES[leagueId];
      if (!league) return state;
      return {
        ...state,
        selectedLeague: leagueId,
        settings: {
          ...state.settings,
          ...league.settings,
        },
      };
    }
    
    case ACTIONS.GO_TO_LEAGUE_SELECT:
      return {
        ...state,
        gameStatus: 'leagueSelect',
      };
    
    case ACTIONS.UPDATE_SETTINGS:
      return {
        ...state,
        settings: {
          ...state.settings,
          ...action.payload,
        },
      };
    
    case ACTIONS.SET_PLAYERS:
      // Payload can be array of strings (names) or array of {name, icon} objects
      return {
        ...state,
        players: action.payload.map((playerData, index) => {
          const isObject = typeof playerData === 'object';
          return {
            id: index,
            name: isObject ? playerData.name : playerData,
            icon: isObject ? playerData.icon : '🎮',
            score: 0,
            lives: state.settings.livesPerPlayer,
            streak: 0,
            correctAnswers: 0,
            wrongAnswers: 0,
            responseTimes: [],
            fastestResponse: null,
            avgResponseTime: null,
          };
        }),
      };
    
    case ACTIONS.START_GAME: {
      const questions = generateQuestions();
      const firstQuestion = questions[0];
      // Generate a unique game ID
      const gameId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Update players' lives to match current settings (in case league changed)
      const updatedPlayers = state.players.map(player => ({
        ...player,
        lives: state.settings.livesPerPlayer,
        score: 0,
        streak: 0,
        correctAnswers: 0,
        wrongAnswers: 0,
        responseTimes: [],
        fastestResponse: null,
        avgResponseTime: null,
      }));
      
      return {
        ...state,
        gameStatus: 'playing',
        currentRound: 1,
        currentPlayerIndex: 0,
        players: updatedPlayers,
        questions,
        questionIndex: 1,
        currentQuestion: firstQuestion,
        questionStartTime: Date.now(),
        lastAnswer: null,
        isCorrect: null,
        gameMetadata: {
          gameId,
          startTime: Date.now(),
          endTime: null,
          totalLivesLost: 0,
        },
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
      let speedBonus = 0;
      let newStreak = state.players[state.currentPlayerIndex].streak;
      
      if (isCorrect) {
        points = 100;
        // Speed bonus: faster = more points (max 50 bonus for < 1 second, scales down)
        // Under 1s = +50, under 2s = +40, under 3s = +30, etc.
        speedBonus = Math.max(0, 50 - Math.floor(timeTaken / 100));
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
      
      // Check if using "no lives" mode (livesPerPlayer === 0 means no life loss)
      const noLivesMode = state.settings.livesPerPlayer === 0;
      
      const updatedPlayers = state.players.map((player, index) => {
        if (index === state.currentPlayerIndex) {
          // Track response times (only for correct answers to measure skill)
          const newResponseTimes = isCorrect 
            ? [...player.responseTimes, timeTaken]
            : player.responseTimes;
          
          const fastestResponse = isCorrect
            ? (player.fastestResponse === null ? timeTaken : Math.min(player.fastestResponse, timeTaken))
            : player.fastestResponse;
          
          const avgResponseTime = newResponseTimes.length > 0
            ? Math.round(newResponseTimes.reduce((a, b) => a + b, 0) / newResponseTimes.length)
            : null;
          
          // In no-lives mode, don't decrement lives
          const newLives = noLivesMode 
            ? player.lives 
            : (isCorrect ? player.lives : player.lives - 1);
          
          return {
            ...player,
            score: Math.max(0, player.score + points),
            lives: newLives,
            streak: newStreak,
            correctAnswers: isCorrect ? player.correctAnswers + 1 : player.correctAnswers,
            wrongAnswers: isCorrect ? player.wrongAnswers : player.wrongAnswers + 1,
            responseTimes: newResponseTimes,
            fastestResponse,
            avgResponseTime,
          };
        }
        return player;
      });
      
      return {
        ...state,
        players: updatedPlayers,
        lastAnswer: answer,
        lastTimeTaken: timeTaken,
        lastSpeedBonus: isCorrect ? speedBonus : 0,
        isCorrect,
        gameStatus: 'reveal',
        gameMetadata: {
          ...state.gameMetadata,
          totalLivesLost: isCorrect ? state.gameMetadata.totalLivesLost : state.gameMetadata.totalLivesLost + 1,
        },
      };
    }
    
    case ACTIONS.NEXT_ROUND: {
      const currentPlayer = state.players[state.currentPlayerIndex];
      
      // Check if using "no lives" mode (livesPerPlayer === 0 means play all rounds, no elimination)
      const noLivesMode = state.settings.livesPerPlayer === 0;
      
      // Check if current player just died in single player (only if not in no-lives mode)
      if (!noLivesMode && currentPlayer.lives <= 0 && state.gameMode === 'single') {
        return {
          ...state,
          gameStatus: 'gameover',
          gameMetadata: {
            ...state.gameMetadata,
            endTime: Date.now(),
          },
        };
      }
      
      const nextPlayerIndex = (state.currentPlayerIndex + 1) % state.players.length;
      const isNewRound = nextPlayerIndex === 0;
      const nextRound = isNewRound ? state.currentRound + 1 : state.currentRound;
      
      // Check if any player is still alive (skip this check in no-lives mode)
      const alivePlayers = noLivesMode 
        ? state.players 
        : state.players.filter(p => p.lives > 0);
      
      // Check if game should end
      if (nextRound > state.settings.totalRounds || (!noLivesMode && alivePlayers.length === 0)) {
        return {
          ...state,
          gameStatus: 'gameover',
          gameMetadata: {
            ...state.gameMetadata,
            endTime: Date.now(),
          },
        };
      }
      
      // Find next alive player (in no-lives mode, just go to next player)
      let actualNextIndex = nextPlayerIndex;
      if (!noLivesMode) {
        let loopCount = 0;
        while (state.players[actualNextIndex].lives <= 0 && loopCount < state.players.length) {
          actualNextIndex = (actualNextIndex + 1) % state.players.length;
          loopCount++;
        }
      }
      
      // Check for bonus round trigger (configurable chance, not on first 2 rounds)
      const bonusChance = state.settings.bonusProbability / 100;
      const shouldTriggerBonus = state.currentRound >= 2 && Math.random() < bonusChance;
      
      if (shouldTriggerBonus) {
        // Pick a bonus type different from the last one used
        const availableTypes = BONUS_TYPES.filter(t => t !== state.bonusRound.lastBonusType);
        const bonusType = availableTypes[Math.floor(Math.random() * availableTypes.length)];
        const bonusData = generateBonusRoundData(bonusType, state.questions, state.questionIndex);
        
        return {
          ...state,
          currentRound: nextRound,
          currentPlayerIndex: actualNextIndex,
          gameStatus: 'bonus',
          bonusRound: {
            active: true,
            type: bonusType,
            data: bonusData,
            lastBonusType: bonusType,
          },
          bonusResult: null,
          questionStartTime: Date.now(),
          lastAnswer: null,
          isCorrect: null,
        };
      }
      
      // Get next question
      const nextQuestionIndex = state.questionIndex;
      const nextQuestion = state.questions[nextQuestionIndex % state.questions.length];
      
      // Show "Ready Player" screen when player changes in multiplayer
      const showReadyScreen = state.gameMode === 'multiplayer' && actualNextIndex !== state.currentPlayerIndex;
      
      return {
        ...state,
        currentRound: nextRound,
        currentPlayerIndex: actualNextIndex,
        gameStatus: showReadyScreen ? 'ready' : 'playing',
        currentQuestion: nextQuestion,
        questionIndex: nextQuestionIndex + 1,
        questionStartTime: showReadyScreen ? null : Date.now(),
        lastAnswer: null,
        isCorrect: null,
      };
    }
    
    case ACTIONS.START_PLAYING: {
      return {
        ...state,
        gameStatus: 'playing',
        questionStartTime: Date.now(),
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
        highScores: state.highScores,
      };
    
    case ACTIONS.PLAY_AGAIN: {
      // Restart with same players and settings
      const questions = generateQuestions();
      const firstQuestion = questions[0];
      const playerData = state.players.map(p => ({ name: p.name, icon: p.icon }));
      
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
        // Reset players but keep their names and icons
        players: playerData.map((player, index) => ({
          id: index,
          name: player.name,
          icon: player.icon,
          score: 0,
          lives: state.settings.livesPerPlayer,
          streak: 0,
          correctAnswers: 0,
          wrongAnswers: 0,
          responseTimes: [],
          fastestResponse: null,
          avgResponseTime: null,
        })),
        // Reset power-ups
        powerUps: {
          skip: 1,
          extraLife: 0
        },
        // Reset bonus round state
        bonusRound: {
          active: false,
          type: null,
          data: null,
          lastBonusType: state.bonusRound.lastBonusType, // Keep variety
        },
        bonusResult: null,
        // New game metadata for the new game
        gameMetadata: {
          gameId: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          startTime: Date.now(),
          endTime: null,
          totalLivesLost: 0,
        },
      };
    }
    
    case ACTIONS.TRIGGER_BONUS_ROUND: {
      // Pick a bonus type different from the last one used
      const availableTypes = BONUS_TYPES.filter(t => t !== state.bonusRound.lastBonusType);
      const bonusType = availableTypes[Math.floor(Math.random() * availableTypes.length)];
      const bonusData = generateBonusRoundData(bonusType, state.questions, state.questionIndex);
      
      return {
        ...state,
        gameStatus: 'bonus',
        bonusRound: {
          active: true,
          type: bonusType,
          data: bonusData,
          lastBonusType: bonusType,
        },
        bonusResult: null,
        questionStartTime: Date.now(),
      };
    }
    
    case ACTIONS.SUBMIT_BONUS_ANSWER: {
      const { answer, timeTaken } = action.payload;
      const bonusData = state.bonusRound.data;
      let isCorrect = false;
      let isPartial = false;
      let points = 0;
      
      switch (state.bonusRound.type) {
        case 'oddOneOut': {
          isCorrect = answer === bonusData.correctAnswer;
          if (isCorrect) {
            points = 200; // 2x base
            const speedBonus = Math.max(0, 50 - Math.floor(timeTaken / 100));
            points += speedBonus;
          } else {
            // Wrong answer: -100 (2x penalty)
            points = -100;
          }
          break;
        }
        
        case 'selectAll': {
          // answer is an array of selected names
          const correctSet = new Set(bonusData.correctAnswers);
          const selectedSet = new Set(answer);
          
          let correctSelections = 0;
          let wrongSelections = 0;
          
          // Count correct selections
          for (const selected of selectedSet) {
            if (correctSet.has(selected)) {
              correctSelections++;
            } else {
              wrongSelections++;
            }
          }
          
          // Count missed selections
          const missedSelections = bonusData.correctAnswers.length - correctSelections;
          
          // Calculate points: 
          // +80 per correct selection (2x base of 40)
          // -100 per wrong selection (2x penalty)
          // Missed selections just reduce your bonus (no extra penalty)
          points = (correctSelections * 80) - (wrongSelections * 100);
          
          // Determine status
          isCorrect = correctSelections === bonusData.correctAnswers.length && wrongSelections === 0;
          isPartial = !isCorrect && correctSelections > 0 && wrongSelections === 0;
          
          // Speed bonus only if perfect
          if (isCorrect) {
            const speedBonus = Math.max(0, 50 - Math.floor(timeTaken / 100));
            points += speedBonus;
          }
          break;
        }
        
        case 'namePokemon': {
          isCorrect = answer === bonusData.correctAnswer;
          if (isCorrect) {
            points = 200; // 2x base
            const speedBonus = Math.max(0, 50 - Math.floor(timeTaken / 100));
            points += speedBonus;
          } else {
            // Wrong answer: -100 (2x penalty)
            points = -100;
          }
          break;
        }
      }
      
      // Update player score
      const updatedPlayers = state.players.map((player, index) => {
        if (index === state.currentPlayerIndex) {
          return {
            ...player,
            score: Math.max(0, player.score + points),
            // Bonus rounds don't affect lives or streak
          };
        }
        return player;
      });
      
      return {
        ...state,
        players: updatedPlayers,
        gameStatus: 'bonusReveal',
        bonusResult: {
          isCorrect,
          isPartial,
          points,
          answer,
        },
      };
    }
    
    case ACTIONS.END_BONUS_ROUND: {
      // Get next question and continue to normal round
      const nextQuestionIndex = state.questionIndex;
      const nextQuestion = state.questions[nextQuestionIndex % state.questions.length];
      
      return {
        ...state,
        bonusRound: {
          ...state.bonusRound,
          active: false,
          type: null,
          data: null,
        },
        bonusResult: null,
        gameStatus: 'playing',
        currentQuestion: nextQuestion,
        questionIndex: nextQuestionIndex + 1,
        questionStartTime: Date.now(),
        lastAnswer: null,
        isCorrect: null,
      };
    }
    
    case ACTIONS.SET_GLOBAL_SCORES:
      return {
        ...state,
        globalScores: action.payload,
        globalScoresLoading: false,
      };
    
    case ACTIONS.SET_GLOBAL_LOADING:
      return {
        ...state,
        globalScoresLoading: action.payload,
      };

    case ACTIONS.SET_DAILY_SCORES:
      return {
        ...state,
        dailyScores: action.payload,
        dailyScoresLoading: false,
      };

    case ACTIONS.SET_DAILY_LOADING:
      return {
        ...state,
        dailyScoresLoading: action.payload,
      };

    case ACTIONS.SET_MEDALS:
      return {
        ...state,
        medals: action.payload,
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
    setLeague: (leagueId) => dispatch({ type: ACTIONS.SET_LEAGUE, payload: leagueId }),
    goToLeagueSelect: () => dispatch({ type: ACTIONS.GO_TO_LEAGUE_SELECT }),
    setPlayers: (players) => dispatch({ type: ACTIONS.SET_PLAYERS, payload: players }),
    updateSettings: (settings) => dispatch({ type: ACTIONS.UPDATE_SETTINGS, payload: settings }),
    saveScore: (scoreData) => dispatch({ type: ACTIONS.SAVE_SCORE, payload: scoreData }),
    clearScores: () => dispatch({ type: ACTIONS.CLEAR_SCORES }),
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
    playAgain: () => dispatch({ type: ACTIONS.PLAY_AGAIN }),
    // Bonus round actions
    triggerBonusRound: () => dispatch({ type: ACTIONS.TRIGGER_BONUS_ROUND }),
    submitBonusAnswer: (answer, timeTaken) => {
      dispatch({ type: ACTIONS.SUBMIT_BONUS_ANSWER, payload: { answer, timeTaken } });
    },
    endBonusRound: () => dispatch({ type: ACTIONS.END_BONUS_ROUND }),
    startPlaying: () => dispatch({ type: ACTIONS.START_PLAYING }),
    // Global scores
    loadGlobalScores: async (league = null) => {
      dispatch({ type: ACTIONS.SET_GLOBAL_LOADING, payload: true });
      const scores = await fetchGlobalScores(false, league);
      dispatch({ type: ACTIONS.SET_GLOBAL_SCORES, payload: scores });
    },
    loadDailyScores: async (league = null) => {
      dispatch({ type: ACTIONS.SET_DAILY_LOADING, payload: true });
      const scores = await fetchGlobalScores(false, league, 'daily');
      dispatch({ type: ACTIONS.SET_DAILY_SCORES, payload: scores });
    },
    awardMedal: (medalData) => {
      const existingMedals = JSON.parse(localStorage.getItem('pord_medals') || '[]');
      const medalKey = `${medalData.type}_${medalData.league}_${medalData.isDaily ? 'daily' : 'alltime'}_${medalData.date.split('T')[0]}`;

      // Check if this medal was already awarded
      const alreadyAwarded = existingMedals.some(medal => medal.key === medalKey);

      if (!alreadyAwarded) {
        const newMedal = { ...medalData, key: medalKey };
        existingMedals.push(newMedal);
        localStorage.setItem('pord_medals', JSON.stringify(existingMedals));
        dispatch({ type: ACTIONS.SET_MEDALS, payload: existingMedals });
      }
    },
    setMedals: (medals) => {
      localStorage.setItem('pord_medals', JSON.stringify(medals));
      dispatch({ type: ACTIONS.SET_MEDALS, payload: medals });
    },
    submitToGlobalLeaderboard: async (scoreData) => {
      const updatedScores = await submitGlobalScore(scoreData);
      dispatch({ type: ACTIONS.SET_GLOBAL_SCORES, payload: updatedScores });
    },
  }), [actions, dispatch]);

  // Fetch global scores on mount
  useEffect(() => {
    fetchGlobalScores().then(scores => {
      dispatch({ type: ACTIONS.SET_GLOBAL_SCORES, payload: scores });
    });
  }, []);
  
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
