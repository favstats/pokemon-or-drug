import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, 
  faUsers, 
  faPlay, 
  faPlus, 
  faMinus, 
  faGamepad, 
  faVolumeUp, 
  faVolumeMute, 
  faCog, 
  faChevronLeft,
  faTrophy,
  faTrash,
  faGlobe,
  faHome,
  faSync,
  faToggleOn,
  faToggleOff,
  faInfoCircle,
  faEnvelope
} from '@fortawesome/free-solid-svg-icons';
import { useGame } from '../context/GameContext';
import { useSound } from '../context/SoundContext';
import './StartScreen.css';

function StartScreen() {
  const { state, actions } = useGame();
  const { play, isMuted, toggleMute } = useSound();
  const [playerNames, setPlayerNames] = useState(['', '']);
  const [showSettings, setShowSettings] = useState(false);
  const [showScoreboard, setShowScoreboard] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [scoreTab, setScoreTab] = useState('global'); // 'global' or 'local'

  const handleModeSelect = (mode) => {
    play('select');
    if (mode === 'single') {
      setPlayerNames(['']);
    }
    actions.setGameMode(mode);
  };

  const handleBack = () => {
    play('select');
    actions.setGameMode(null);
  };

  const handleAddPlayer = () => {
    play('select');
    if (playerNames.length < 4) {
      setPlayerNames([...playerNames, '']);
    }
  };

  // Check if all player names are filled
  const allNamesValid = playerNames.every(name => name.trim().length > 0);

  const handleRemovePlayer = (index) => {
    play('select');
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
    play('start');
    actions.setPlayers(playerNames);
    actions.startGame();
  };

  const handleSettingChange = (key, value) => {
    play('select');
    actions.updateSettings({ [key]: value });
  };

  const handleClearScores = () => {
    if (window.confirm('Are you sure you want to clear all high scores?')) {
      play('select');
      actions.clearScores();
    }
  };

  return (
    <div className="start-screen">
      <div className="top-controls">
        <button 
          className="scoreboard-toggle" 
          onClick={() => {
            setShowScoreboard(!showScoreboard);
            setShowSettings(false);
          }}
          title="High Scores"
        >
          <FontAwesomeIcon icon={faTrophy} />
        </button>
        <button 
          className="settings-toggle" 
          onClick={() => {
            setShowSettings(!showSettings);
            setShowScoreboard(false);
            setShowAbout(false);
          }}
          title="Settings"
        >
          <FontAwesomeIcon icon={faCog} />
        </button>
        <button 
          className="about-toggle" 
          onClick={() => {
            setShowAbout(!showAbout);
            setShowSettings(false);
            setShowScoreboard(false);
          }}
          title="About"
        >
          <FontAwesomeIcon icon={faInfoCircle} />
        </button>
        <button 
          className="mute-toggle" 
          onClick={toggleMute}
          title={isMuted ? "Unmute" : "Mute"}
        >
          <FontAwesomeIcon icon={isMuted ? faVolumeMute : faVolumeUp} />
        </button>
      </div>

      <div className="title-container">
        <h1 className="game-title">
          <span className="title-pokemon">Pokémon</span>
          <span className="title-or">or</span>
          <span className="title-drug">Drug</span>
          <span className="title-question">?</span>
        </h1>
        <p className="game-subtitle">Can you tell the difference?</p>
      </div>

      {showScoreboard ? (
        <div className="settings-panel scoreboard-panel">
          <h2><FontAwesomeIcon icon={faTrophy} /> High Scores</h2>
          
          <div className="score-tabs">
            <button 
              className={`score-tab ${scoreTab === 'global' ? 'active' : ''}`}
              onClick={() => setScoreTab('global')}
            >
              <FontAwesomeIcon icon={faGlobe} /> Global
            </button>
            <button 
              className={`score-tab ${scoreTab === 'local' ? 'active' : ''}`}
              onClick={() => setScoreTab('local')}
            >
              <FontAwesomeIcon icon={faHome} /> Local
            </button>
          </div>
          
          {scoreTab === 'global' ? (
            <div className="highscore-list">
              {state.globalScoresLoading ? (
                <p className="loading-scores"><FontAwesomeIcon icon={faSync} spin /> Loading...</p>
              ) : state.globalScores.length > 0 ? (
                state.globalScores.slice(0, 10).map((entry, index) => (
                  <div key={entry.id || index} className="highscore-item">
                    <span className="highscore-rank">#{index + 1}</span>
                    <span className="highscore-name">{entry.name}</span>
                    <span className="highscore-val">{entry.score}</span>
                    {entry.accuracy !== undefined && (
                      <span className="highscore-accuracy">{entry.accuracy}%</span>
                    )}
                    {entry.avgSpeed && (
                      <span className="highscore-speed">{(entry.avgSpeed / 1000).toFixed(1)}s</span>
                    )}
                  </div>
                ))
              ) : state.globalScoresLoading ? (
                <p className="loading-scores"><FontAwesomeIcon icon={faSync} spin /> Loading scores...</p>
              ) : (
                <p className="no-scores">No global scores yet! Be the first!</p>
              )}
            </div>
          ) : (
            <div className="highscore-list">
              {state.highScores.length > 0 ? (
                state.highScores.map((entry, index) => (
                  <div key={index} className="highscore-item">
                    <span className="highscore-rank">#{index + 1}</span>
                    <span className="highscore-name">{entry.name}</span>
                    <span className="highscore-val">{entry.score}</span>
                  </div>
                ))
              ) : (
                <p className="no-scores">No local scores saved yet!</p>
              )}
            </div>
          )}

          <div className="scoreboard-actions">
            <button className="back-btn" onClick={() => setShowScoreboard(false)}>
              <FontAwesomeIcon icon={faChevronLeft} /> Back
            </button>
            {scoreTab === 'global' && (
              <button className="refresh-btn" onClick={() => actions.loadGlobalScores()}>
                <FontAwesomeIcon icon={faSync} /> Refresh
              </button>
            )}
            {scoreTab === 'local' && state.highScores.length > 0 && (
              <button className="clear-btn" onClick={handleClearScores}>
                <FontAwesomeIcon icon={faTrash} /> Clear
              </button>
            )}
          </div>
        </div>
      ) : showSettings ? (
        <div className="settings-panel">
          <h2><FontAwesomeIcon icon={faCog} /> Game Settings</h2>
          
          <div className="settings-group">
            <div className="setting-item">
              <label>Rounds</label>
              <div className="setting-controls">
                <button 
                  onClick={() => handleSettingChange('totalRounds', Math.max(5, state.settings.totalRounds - 5))}
                  disabled={state.settings.totalRounds <= 5}
                >
                  <FontAwesomeIcon icon={faMinus} />
                </button>
                <span className="setting-value">{state.settings.totalRounds}</span>
                <button 
                  onClick={() => handleSettingChange('totalRounds', Math.min(50, state.settings.totalRounds + 5))}
                  disabled={state.settings.totalRounds >= 50}
                >
                  <FontAwesomeIcon icon={faPlus} />
                </button>
              </div>
            </div>

            <div className="setting-item">
              <label>Lives</label>
              <div className="setting-controls">
                <button 
                  onClick={() => handleSettingChange('livesPerPlayer', Math.max(1, state.settings.livesPerPlayer - 1))}
                  disabled={state.settings.livesPerPlayer <= 1}
                >
                  <FontAwesomeIcon icon={faMinus} />
                </button>
                <span className="setting-value">{state.settings.livesPerPlayer}</span>
                <button 
                  onClick={() => handleSettingChange('livesPerPlayer', Math.min(10, state.settings.livesPerPlayer + 1))}
                  disabled={state.settings.livesPerPlayer >= 10}
                >
                  <FontAwesomeIcon icon={faPlus} />
                </button>
              </div>
            </div>

            <div className="setting-item">
              <label>Timer (sec)</label>
              <div className="setting-controls">
                <button 
                  onClick={() => handleSettingChange('timerDuration', Math.max(5, state.settings.timerDuration - 5))}
                  disabled={state.settings.timerDuration <= 5}
                >
                  <FontAwesomeIcon icon={faMinus} />
                </button>
                <span className="setting-value">{state.settings.timerDuration}</span>
                <button 
                  onClick={() => handleSettingChange('timerDuration', Math.min(60, state.settings.timerDuration + 5))}
                  disabled={state.settings.timerDuration >= 60}
                >
                  <FontAwesomeIcon icon={faPlus} />
                </button>
              </div>
            </div>

            <div className="setting-item">
              <label>Bonus %</label>
              <div className="setting-controls">
                <button 
                  onClick={() => handleSettingChange('bonusProbability', Math.max(0, state.settings.bonusProbability - 5))}
                  disabled={state.settings.bonusProbability <= 0}
                >
                  <FontAwesomeIcon icon={faMinus} />
                </button>
                <span className="setting-value">{state.settings.bonusProbability}%</span>
                <button 
                  onClick={() => handleSettingChange('bonusProbability', Math.min(100, state.settings.bonusProbability + 5))}
                  disabled={state.settings.bonusProbability >= 100}
                >
                  <FontAwesomeIcon icon={faPlus} />
                </button>
              </div>
            </div>

            <div className="setting-item toggle-setting">
              <label><FontAwesomeIcon icon={faGlobe} /> Share scores globally</label>
              <button 
                className={`toggle-btn ${state.settings.shareGlobally ? 'on' : 'off'}`}
                onClick={() => handleSettingChange('shareGlobally', !state.settings.shareGlobally)}
              >
                <FontAwesomeIcon icon={state.settings.shareGlobally ? faToggleOn : faToggleOff} />
              </button>
            </div>
          </div>

          <button className="back-btn full-width" onClick={() => setShowSettings(false)}>
            <FontAwesomeIcon icon={faChevronLeft} /> Save & Back
          </button>
        </div>
      ) : showAbout ? (
        <div className="settings-panel about-panel">
          <h2><FontAwesomeIcon icon={faInfoCircle} /> About</h2>
          
          <div className="about-content">
            <div className="about-game">
              <h3>🎮 Pokemon or Drug?</h3>
              <p>A fun trivia game where you guess if a name belongs to a Pokémon or a pharmaceutical drug!</p>
            </div>
            
            <div className="about-creator">
              <h3>👨‍💻 Created by</h3>
              <p className="creator-name">Fabio Votta</p>
              <a href="mailto:fabio.votta@gmail.com" className="creator-email">
                <FontAwesomeIcon icon={faEnvelope} /> fabio.votta@gmail.com
              </a>
            </div>
            
            <div className="about-version">
              <p>Version 1.0 • 2024</p>
            </div>
          </div>
          
          <button className="back-btn full-width" onClick={() => setShowAbout(false)}>
            <FontAwesomeIcon icon={faChevronLeft} /> Back
          </button>
        </div>
      ) : !state.gameMode ? (
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
                  placeholder={`Enter your name...`}
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
              disabled={!allNamesValid}
            >
              <FontAwesomeIcon icon={faPlay} /> {allNamesValid ? 'Start Game' : 'Enter Name(s)'}
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
