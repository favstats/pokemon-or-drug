// useGameLogic hook - utility functions for game logic
// This hook provides helper functions for game calculations

import { useCallback } from 'react';

export function useGameLogic() {
  // Calculate points for an answer
  const calculatePoints = useCallback((isCorrect, timeTaken, streak, gameMode) => {
    if (!isCorrect) {
      return gameMode === 'multiplayer' ? -50 : 0;
    }

    let points = 100;

    // Speed bonus (up to 50 extra points for answering quickly)
    // Full bonus for under 3 seconds, decreasing after
    const speedBonus = Math.max(0, 50 - Math.floor(timeTaken / 100));
    points += speedBonus;

    // Streak multiplier
    if (streak >= 10) {
      points = Math.floor(points * 3);
    } else if (streak >= 5) {
      points = Math.floor(points * 2);
    } else if (streak >= 3) {
      points = Math.floor(points * 1.5);
    }

    return points;
  }, []);

  // Get streak multiplier description
  const getStreakMultiplier = useCallback((streak) => {
    if (streak >= 10) return '3x';
    if (streak >= 5) return '2x';
    if (streak >= 3) return '1.5x';
    return '1x';
  }, []);

  // Check if a name sounds more like Pokemon or Drug
  // This is a fun heuristic for hints
  const getNameHeuristic = useCallback((name) => {
    const pokemonPatterns = [
      /chu$/i,      // Pikachu, Raichu
      /saur$/i,     // Bulbasaur, Venusaur
      /eon$/i,      // Eevee evolutions
      /zard$/i,     // Charizard
      /dos$/i,      // Legendary birds
    ];

    const drugPatterns = [
      /in$/i,       // Many drugs end in -in
      /ol$/i,       // -ol ending
      /ex$/i,       // -ex ending (Celebrex, etc)
      /ix$/i,       // -ix ending
      /ium$/i,      // -ium ending
    ];

    const pokemonScore = pokemonPatterns.filter(p => p.test(name)).length;
    const drugScore = drugPatterns.filter(p => p.test(name)).length;

    if (pokemonScore > drugScore) return 'pokemon';
    if (drugScore > pokemonScore) return 'drug';
    return 'unknown';
  }, []);

  // Format time for display
  const formatTime = useCallback((milliseconds) => {
    const seconds = Math.floor(milliseconds / 1000);
    const ms = Math.floor((milliseconds % 1000) / 10);
    return `${seconds}.${ms.toString().padStart(2, '0')}s`;
  }, []);

  // Calculate accuracy percentage
  const calculateAccuracy = useCallback((correct, wrong) => {
    const total = correct + wrong;
    if (total === 0) return 0;
    return Math.round((correct / total) * 100);
  }, []);

  return {
    calculatePoints,
    getStreakMultiplier,
    getNameHeuristic,
    formatTime,
    calculateAccuracy,
  };
}

export default useGameLogic;

