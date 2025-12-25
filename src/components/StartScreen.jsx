import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faUsers, faPlay, faPlus, faMinus, faGamepad } from '@fortawesome/free-solid-svg-icons';
import { useGame } from '../context/GameContext';
import './StartScreen.css';

function StartScreen() {
  const { state, actions } = useGame();
  const [playerNames, setPlayerNames] = useState(['Player 1', 'Player 2']);

  const handleModeSelect = (mode) => {
    if (mode === 'single') {
      setPlayerNames(['Player']);
    }
    actions.setGameMode(mode);
  };

  const handleBack = () => {
    actions.setGameMode(null);
  };

  const handleAddPlayer = () => {
    if (playerNames.length < 4) {
      setPlayerNames([...playerNames, `Player ${playerNames.length + 1}`]);
    }
  };

  const handleRemovePlayer = (index) => {
    if (playerNames.length > 2) {
      const newNames = playerNames.filter((_, i) => i !== index);
      setPlayerNames(newNames);
    }
  };

  const handleNameChange = (index, name) => {
    const newNames = [...playerNames];
    newNames[index] = name;
    setPlayerNames(newNames);
  };

  const handleStartGame = async () => {
    actions.setPlayers(playerNames);
    actions.startGame();
  };

  return (
    <div className="start-screen">
      <div className="title-container">
        <h1 className="game-title">
          <span className="title-pokemon">Pokémon</span>
          <span className="title-or">or</span>
          <span className="title-drug">Drug</span>
          <span className="title-question">?</span>
        </h1>
        <p className="game-subtitle">Can you tell the difference?</p>
      </div>

      {!state.gameMode ? (
        <div className="mode-selection">
          <h2>Choose Game Mode</h2>
          <div className="mode-buttons">
            <button
              className="mode-btn single"
              onClick={() => handleModeSelect('single')}
            >
              <FontAwesomeIcon icon={faUser} className="mode-icon" />
              <span>Single Player</span>
              <small>Test your knowledge solo</small>
            </button>
            <button
              className="mode-btn multi"
              onClick={() => handleModeSelect('multiplayer')}
            >
              <FontAwesomeIcon icon={faUsers} className="mode-icon" />
              <span>Multiplayer</span>
              <small>Challenge your friends!</small>
            </button>
          </div>
        </div>
      ) : (
        <div className="player-setup">
          <h2>
            <FontAwesomeIcon icon={faGamepad} /> 
            {state.gameMode === 'single' ? ' Enter Your Name' : ' Player Setup'}
          </h2>
          
          <div className="player-list">
            {playerNames.map((name, index) => (
              <div 
                key={index}
                className="player-input-row"
              >
                <span className="player-number">P{index + 1}</span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => handleNameChange(index, e.target.value)}
                  placeholder={`Player ${index + 1}`}
                  maxLength={15}
                />
                {state.gameMode === 'multiplayer' && playerNames.length > 2 && (
                  <button
                    className="remove-player-btn"
                    onClick={() => handleRemovePlayer(index)}
                  >
                    <FontAwesomeIcon icon={faMinus} />
                  </button>
                )}
              </div>
            ))}
          </div>

          {state.gameMode === 'multiplayer' && playerNames.length < 4 && (
            <button
              className="add-player-btn"
              onClick={handleAddPlayer}
            >
              <FontAwesomeIcon icon={faPlus} /> Add Player
            </button>
          )}

          <div className="action-buttons">
            <button
              className="back-btn"
              onClick={handleBack}
            >
              Back
            </button>
            <button
              className="start-btn"
              onClick={handleStartGame}
            >
              <FontAwesomeIcon icon={faPlay} /> Start Game
            </button>
          </div>
        </div>
      )}

      <div className="floating-elements">
        <div className="floating-pill pill-1">💊</div>
        <div className="floating-pill pill-2">⚡</div>
        <div className="floating-pill pill-3">🔴</div>
        <div className="floating-pill pill-4">💜</div>
      </div>
    </div>
  );
}

export default StartScreen;
