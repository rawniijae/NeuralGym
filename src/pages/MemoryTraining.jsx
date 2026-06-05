import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useScores } from '../hooks/useScores';

// ===== WORD PAIRS DATA =====
const nounsA = ['Apple', 'River', 'Moon', 'Tiger', 'Diamond', 'Ocean', 'Thunder', 'Phoenix', 'Glacier', 'Shadow', 'Eclipse', 'Falcon', 'Whisper', 'Crimson', 'Nebula', 'Mountain', 'Desert', 'Forest', 'Castle', 'Lantern', 'Galaxy', 'Volcano', 'Meteor', 'Comet'];
const nounsB = ['Cloud', 'Guitar', 'Bridge', 'Velvet', 'Tree', 'Tower', 'Candle', 'Mirror', 'Compass', 'Crystal', 'Harbor', 'Marble', 'Canyon', 'Beacon', 'Anchor', 'Piano', 'Sword', 'Crown', 'Statue', 'Book', 'Clock', 'Window', 'Train', 'Ship'];

function generateDynamicPairs(count) {
  const shuffledA = [...nounsA].sort(() => Math.random() - 0.5);
  const shuffledB = [...nounsB].sort(() => Math.random() - 0.5);
  return shuffledA.slice(0, count).map((a, i) => [a, shuffledB[i]]);
}

// ===== NUMBER MEMORY SUB-MODULE =====
function NumberMemory({ onScoreUpdate }) {
  const [phase, setPhase] = useState('ready'); // ready, showing, input, result
  const [level, setLevel] = useState(3);
  const [currentNumber, setCurrentNumber] = useState('');
  const [displayIndex, setDisplayIndex] = useState(-1);
  const [userInput, setUserInput] = useState('');
  const [isCorrect, setIsCorrect] = useState(null);
  const [highestLevel, setHighestLevel] = useState(0);
  const inputRef = useRef(null);

  const generateNumber = useCallback((digits) => {
    let num = '';
    for (let i = 0; i < digits; i++) {
      num += Math.floor(Math.random() * 10).toString();
    }
    return num;
  }, []);

  const playSequence = useCallback(async (num) => {
    setPhase('showing');
    setDisplayIndex(-1);
    
    // Wait a brief moment before starting
    await new Promise(r => setTimeout(r, 500));
    
    // Show each digit for 800ms
    for (let i = 0; i < num.length; i++) {
      setDisplayIndex(i);
      await new Promise(r => setTimeout(r, 800));
      // Brief flash between numbers
      setDisplayIndex(-1);
      await new Promise(r => setTimeout(r, 100));
    }
    
    // Clear display briefly before input
    setDisplayIndex(-1);
    await new Promise(r => setTimeout(r, 300));
    
    setPhase('input');
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const startRound = useCallback(() => {
    const num = generateNumber(level);
    setCurrentNumber(num);
    setUserInput('');
    setIsCorrect(null);
    playSequence(num);
  }, [level, generateNumber, playSequence]);

  const checkAnswer = useCallback(() => {
    const correct = userInput === currentNumber;
    setIsCorrect(correct);
    setPhase('result');

    if (correct) {
      const newHighest = Math.max(highestLevel, level);
      setHighestLevel(newHighest);
      onScoreUpdate({ numberMemory: newHighest });
    }
  }, [userInput, currentNumber, level, highestLevel, onScoreUpdate]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && userInput.length > 0) {
      checkAnswer();
    }
  };

  const nextRound = () => {
    if (isCorrect) {
      setLevel(l => l + 1);
    } else {
      setLevel(3);
    }
    setPhase('ready');
  };

  return (
    <div className="game-area">
      {phase === 'ready' && (
        <div style={{ textAlign: 'center' }} className="animate-in">
          <div className="text-headline-lg" style={{ marginBottom: 8 }}>Number Memory</div>
          <p style={{ color: 'var(--on-surface-variant)', marginBottom: 8 }}>Level {level} — Remember {level} digits</p>
          {highestLevel > 0 && <p style={{ color: 'var(--primary)', fontSize: 14, marginBottom: 24 }}>Personal Best: Level {highestLevel}</p>}
          <button className="btn-primary" onClick={startRound}>Start</button>
        </div>
      )}

      {phase === 'showing' && (
        <div style={{ textAlign: 'center' }} className="animate-in">
          <div className="text-label-caps" style={{ color: 'var(--outline)', marginBottom: 16 }}>MEMORIZE</div>
          <div className="number-display" style={{ minHeight: '96px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {displayIndex >= 0 ? currentNumber[displayIndex] : ' '}
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 32 }}>
            {currentNumber.split('').map((_, i) => (
              <div 
                key={i} 
                style={{ 
                  width: 8, height: 8, borderRadius: '50%', 
                  background: i === displayIndex ? 'var(--primary)' : 'var(--outline-variant)' 
                }} 
              />
            ))}
          </div>
        </div>
      )}

      {phase === 'input' && (
        <div style={{ textAlign: 'center' }} className="animate-in">
          <div className="text-label-caps" style={{ color: 'var(--outline)', marginBottom: 16 }}>WHAT WAS THE NUMBER?</div>
          <input
            ref={inputRef}
            type="text"
            className="number-input"
            value={userInput}
            onChange={e => setUserInput(e.target.value.replace(/\D/g, ''))}
            onKeyDown={handleKeyDown}
            maxLength={level}
            autoFocus
          />
          <div style={{ marginTop: 24 }}>
            <button className="btn-primary" onClick={checkAnswer} disabled={userInput.length === 0}>Submit</button>
          </div>
        </div>
      )}

      {phase === 'result' && (
        <div style={{ textAlign: 'center' }} className="animate-in">
          <div style={{ fontSize: 48, marginBottom: 16 }}>{isCorrect ? '✅' : '❌'}</div>
          <div className="text-headline-lg" style={{ color: isCorrect ? 'var(--success)' : 'var(--error)', marginBottom: 8 }}>
            {isCorrect ? 'Correct!' : 'Incorrect'}
          </div>
          <p style={{ color: 'var(--on-surface-variant)', marginBottom: 8 }}>The number was: <strong style={{ color: 'var(--primary)' }}>{currentNumber}</strong></p>
          {!isCorrect && <p style={{ color: 'var(--on-surface-variant)', marginBottom: 8 }}>You entered: <strong style={{ color: 'var(--error)' }}>{userInput}</strong></p>}
          <p style={{ color: 'var(--outline)', fontSize: 14, marginBottom: 24 }}>
            {isCorrect ? `Next: Level ${level + 1}` : 'Resetting to Level 3'}
          </p>
          <button className="btn-primary" onClick={nextRound}>{isCorrect ? 'Next Level' : 'Try Again'}</button>
        </div>
      )}
    </div>
  );
}

// ===== PATTERN MEMORY (SIMON SAYS) =====
function PatternMemory({ onScoreUpdate }) {
  const [phase, setPhase] = useState('ready');
  const [sequence, setSequence] = useState([]);
  const [playerIndex, setPlayerIndex] = useState(0);
  const [activeColor, setActiveColor] = useState(null);
  const [level, setLevel] = useState(1);
  const [highestLevel, setHighestLevel] = useState(0);
  const [isCorrect, setIsCorrect] = useState(null);

  const colors = [
    { id: 0, color: '#ef4444', name: 'red' },
    { id: 1, color: '#3b82f6', name: 'blue' },
    { id: 2, color: '#22c55e', name: 'green' },
    { id: 3, color: '#eab308', name: 'yellow' },
  ];

  const playSequence = useCallback(async (seq) => {
    setPhase('showing');
    for (let i = 0; i < seq.length; i++) {
      await new Promise(r => setTimeout(r, 400));
      setActiveColor(seq[i]);
      await new Promise(r => setTimeout(r, 500));
      setActiveColor(null);
    }
    await new Promise(r => setTimeout(r, 300));
    setPhase('input');
    setPlayerIndex(0);
  }, []);

  const startGame = useCallback(() => {
    const first = [Math.floor(Math.random() * 4)];
    setSequence(first);
    setLevel(1);
    setIsCorrect(null);
    playSequence(first);
  }, [playSequence]);

  const handleTileClick = useCallback((colorId) => {
    if (phase !== 'input') return;

    setActiveColor(colorId);
    setTimeout(() => setActiveColor(null), 200);

    if (colorId === sequence[playerIndex]) {
      const nextIndex = playerIndex + 1;
      if (nextIndex === sequence.length) {
        // Completed this sequence
        const newLevel = level + 1;
        const newHighest = Math.max(highestLevel, level);
        setHighestLevel(newHighest);
        setLevel(newLevel);
        onScoreUpdate({ patternMemory: newHighest });

        const newSeq = [...sequence, Math.floor(Math.random() * 4)];
        setSequence(newSeq);
        setTimeout(() => playSequence(newSeq), 800);
      } else {
        setPlayerIndex(nextIndex);
      }
    } else {
      setIsCorrect(false);
      setPhase('result');
    }
  }, [phase, sequence, playerIndex, level, highestLevel, onScoreUpdate, playSequence]);

  return (
    <div className="game-area">
      {phase === 'ready' && (
        <div style={{ textAlign: 'center' }} className="animate-in">
          <div className="text-headline-lg" style={{ marginBottom: 8 }}>Pattern Memory</div>
          <p style={{ color: 'var(--on-surface-variant)', marginBottom: 8 }}>Watch the sequence, then repeat it</p>
          {highestLevel > 0 && <p style={{ color: 'var(--primary)', fontSize: 14, marginBottom: 24 }}>Personal Best: Level {highestLevel}</p>}
          <button className="btn-primary" onClick={startGame}>Start</button>
        </div>
      )}

      {(phase === 'showing' || phase === 'input') && (
        <div style={{ textAlign: 'center' }} className="animate-in">
          <div className="text-label-caps" style={{ color: 'var(--outline)', marginBottom: 8 }}>
            {phase === 'showing' ? 'WATCH THE PATTERN' : 'YOUR TURN — REPEAT IT'}
          </div>
          <div style={{ color: 'var(--primary)', fontSize: 14, fontWeight: 600, marginBottom: 24 }}>Level {level}</div>
          <div className="simon-grid">
            {colors.map(c => (
              <button
                key={c.id}
                className={`simon-tile ${activeColor === c.id ? 'lit' : ''}`}
                style={{
                  backgroundColor: activeColor === c.id ? c.color : `${c.color}33`,
                  color: c.color,
                  borderColor: `${c.color}55`,
                }}
                onClick={() => handleTileClick(c.id)}
                disabled={phase !== 'input'}
              />
            ))}
          </div>
        </div>
      )}

      {phase === 'result' && (
        <div style={{ textAlign: 'center' }} className="animate-in">
          <div style={{ fontSize: 48, marginBottom: 16 }}>❌</div>
          <div className="text-headline-lg" style={{ color: 'var(--error)', marginBottom: 8 }}>Wrong Pattern!</div>
          <p style={{ color: 'var(--on-surface-variant)', marginBottom: 8 }}>You reached Level {level}</p>
          <p style={{ color: 'var(--primary)', fontSize: 14, marginBottom: 24 }}>Best: Level {highestLevel}</p>
          <button className="btn-primary" onClick={() => { setPhase('ready'); setLevel(1); }}>Try Again</button>
        </div>
      )}
    </div>
  );
}

// ===== WORD PAIR MEMORY =====
function WordPairMemory({ onScoreUpdate }) {
  const [phase, setPhase] = useState('ready');
  const [level, setLevel] = useState(1);
  const [pairs, setPairs] = useState([]);
  const [quizIndex, setQuizIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [score, setScore] = useState(0);
  const [results, setResults] = useState([]);
  const [highestLevel, setHighestLevel] = useState(0);
  const inputRef = useRef(null);

  const getPairCount = () => level + 2; // Level 1 = 3 pairs, Level 2 = 4 pairs...

  const startGame = () => {
    const pairCount = getPairCount();
    const newPairs = generateDynamicPairs(pairCount);
    setPairs(newPairs);
    setPhase('showing');
    setQuizIndex(0);
    setScore(0);
    setResults([]);
    setUserInput('');

    // Wait time: 2 seconds per pair
    setTimeout(() => {
      setPhase('quiz');
      setTimeout(() => inputRef.current?.focus(), 100);
    }, pairCount * 2000);
  };

  const checkAnswer = () => {
    const correct = userInput.trim().toLowerCase() === pairs[quizIndex][1].toLowerCase();
    const newScore = correct ? score + 1 : score;
    setScore(newScore);
    setResults([...results, { pair: pairs[quizIndex], userAnswer: userInput, correct }]);
    setUserInput('');

    if (quizIndex + 1 < pairs.length) {
      setQuizIndex(quizIndex + 1);
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setPhase('result');
      if (newScore === pairs.length) {
        const newHighest = Math.max(highestLevel, level);
        setHighestLevel(newHighest);
        onScoreUpdate({ wordPairs: newHighest });
      }
    }
  };

  const handleNextOrRetry = () => {
    if (score === pairs.length) {
      setLevel(l => l + 1);
    }
    setPhase('ready');
  };

  return (
    <div className="game-area">
      {phase === 'ready' && (
        <div style={{ textAlign: 'center' }} className="animate-in">
          <div className="text-headline-lg" style={{ marginBottom: 8 }}>Word Pair Memory</div>
          <p style={{ color: 'var(--on-surface-variant)', marginBottom: 8 }}>Level {level} — Memorize {getPairCount()} word pairs</p>
          {highestLevel > 0 && <p style={{ color: 'var(--primary)', fontSize: 14, marginBottom: 24 }}>Personal Best: Level {highestLevel}</p>}
          <button className="btn-primary" onClick={startGame}>Start</button>
        </div>
      )}

      {phase === 'showing' && (
        <div style={{ textAlign: 'center' }} className="animate-in">
          <div className="text-label-caps" style={{ color: 'var(--outline)', marginBottom: 24 }}>MEMORIZE THESE PAIRS ({getPairCount() * 2} SECONDS)</div>
          <div className="word-pair-grid">
            {pairs.map((pair, i) => (
              <div key={i} className="word-pair">
                <span style={{ fontWeight: 600 }}>{pair[0]}</span>
                <span className="arrow">→</span>
                <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{pair[1]}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {phase === 'quiz' && (
        <div style={{ textAlign: 'center' }} className="animate-in">
          <div className="text-label-caps" style={{ color: 'var(--outline)', marginBottom: 8 }}>QUESTION {quizIndex + 1} OF {pairs.length}</div>
          <div className="text-headline-lg" style={{ marginBottom: 24 }}>
            What was paired with "<span style={{ color: 'var(--primary)' }}>{pairs[quizIndex][0]}</span>"?
          </div>
          <input
            ref={inputRef}
            className="word-pair-input"
            type="text"
            value={userInput}
            onChange={e => setUserInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && userInput.length > 0 && checkAnswer()}
            placeholder="Type the word..."
            autoFocus
          />
          <div style={{ marginTop: 24 }}>
            <button className="btn-primary" onClick={checkAnswer} disabled={userInput.length === 0}>Submit</button>
          </div>
        </div>
      )}

      {phase === 'result' && (
        <div className="results-card glass-card-static animate-in" style={{ margin: '0 auto' }}>
          <div className="score-value">{score}/{pairs.length}</div>
          <div className="score-label" style={{ marginBottom: 24 }}>Pairs Remembered</div>
          <div style={{ textAlign: 'left' }}>
            {results.map((r, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--outline-variant)', fontSize: 14 }}>
                <span>{r.pair[0]} → <strong>{r.pair[1]}</strong></span>
                <span style={{ color: r.correct ? 'var(--success)' : 'var(--error)' }}>
                  {r.correct ? '✓' : `✗ (${r.userAnswer || '—'})`}
                </span>
              </div>
            ))}
          </div>
          
          <p style={{ color: 'var(--outline)', fontSize: 14, marginBottom: 24, marginTop: 16 }}>
            {score === pairs.length ? `Perfect! Next: Level ${level + 1}` : `Not quite. Let's try Level ${level} again.`}
          </p>

          <button className="btn-primary" onClick={handleNextOrRetry}>
            {score === pairs.length ? 'Next Level' : 'Try Again'}
          </button>
        </div>
      )}
    </div>
  );
}

// ===== MAIN MEMORY TRAINING PAGE =====
export default function MemoryTraining() {
  const [activeTab, setActiveTab] = useState('number');
  const { updateScore } = useScores();

  const handleScoreUpdate = useCallback((data) => {
    updateScore('memory', data);
  }, [updateScore]);

  const tabs = [
    { id: 'number', label: 'Number Memory' },
    { id: 'pattern', label: 'Pattern Memory' },
    { id: 'words', label: 'Word Pairs' },
  ];

  return (
    <main className="page">
      <div className="container">
        <div className="page-header">
          <Link to="/" className="back-btn">
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_back</span>
            Back to Dashboard
          </Link>
          <h1>
            <span className="material-symbols-outlined" style={{ color: 'var(--primary)', fontVariationSettings: "'FILL' 1" }}>memory</span>
            Memory Training
          </h1>
          <p>Expand your working memory through progressive recall exercises.</p>
        </div>

        <div className="tabs">
          {tabs.map(t => (
            <button key={t.id} className={`tab ${activeTab === t.id ? 'active' : ''}`} onClick={() => setActiveTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="glass-card-static" style={{ minHeight: 400 }}>
          {activeTab === 'number' && <NumberMemory onScoreUpdate={handleScoreUpdate} />}
          {activeTab === 'pattern' && <PatternMemory onScoreUpdate={handleScoreUpdate} />}
          {activeTab === 'words' && <WordPairMemory onScoreUpdate={handleScoreUpdate} />}
        </div>
      </div>
    </main>
  );
}
