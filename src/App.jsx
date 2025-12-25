import { GameProvider, useGame } from './context/GameContext';
import StartScreen from './components/StartScreen';
import GameScreen from './components/GameScreen';
import RevealCard from './components/RevealCard';
import GameOver from './components/GameOver';
import BonusRound from './components/BonusRound';
import ReadyScreen from './components/ReadyScreen';
import './styles/global.css';

function GameContent() {
  const { state } = useGame();

  return (
    <div className="app">
      {state.gameStatus === 'idle' && <StartScreen />}
      {state.gameStatus === 'ready' && <ReadyScreen />}
      {state.gameStatus === 'playing' && <GameScreen />}
      {state.gameStatus === 'reveal' && (
        <>
          <GameScreen />
          <RevealCard />
        </>
      )}
      {/* Bonus round states */}
      {(state.gameStatus === 'bonus' || state.gameStatus === 'bonusReveal') && <BonusRound />}
      {state.gameStatus === 'gameover' && <GameOver />}
    </div>
  );
}

function App() {
  return (
    <GameProvider>
      <GameContent />
    </GameProvider>
  );
}

export default App;
