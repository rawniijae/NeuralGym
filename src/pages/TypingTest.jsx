import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useScores } from '../hooks/useScores';

const wordPools = {
  easy: [
    "The cat sat on the mat. The sun was warm and bright. Birds sang in the tall trees. A dog ran through the green park. Children played with a red ball.",
    "She walked to the store to buy some milk and bread. The sky was blue and clear. Flowers grew by the road. A small bird sat on the fence and sang a happy song.",
    "It was a nice day to go for a walk. The wind was soft and cool. Trees had green leaves. People smiled as they passed by. The park was full of life and joy.",
  ],
  medium: [
    "The persistent rain had transformed the city streets into shimmering ribbons of reflected light. Pedestrians hurried along the sidewalks, umbrellas blooming like dark flowers against the grey sky. Traffic moved slowly through the downtown district.",
    "Technology continues to reshape our daily routines in unexpected ways. From smart home devices that adjust the thermostat automatically to fitness trackers monitoring every heartbeat, we are surrounded by intelligent systems that learn our preferences.",
    "The ancient library contained thousands of volumes spanning centuries of human knowledge. Scholars from around the world traveled great distances to study the rare manuscripts preserved within its climate-controlled chambers.",
  ],
  hard: [
    "The quintessential characteristic of metamorphic rocks lies in their crystallographic reorganization under conditions of extraordinary thermodynamic pressure, resulting in mineralogical transformations that fundamentally alter their petrographic classification.",
    "Notwithstanding the considerable apprehension surrounding artificial intelligence's exponential advancement, the philosophical implications of consciousness replication remain inadequately addressed within contemporary epistemological frameworks and interdisciplinary discourse.",
    "The unprecedented confluence of macroeconomic volatility, geopolitical fragmentation, and technological disruption has necessitated a paradigmatic reassessment of conventional portfolio diversification strategies among institutional investors worldwide.",
  ],
};

export default function TypingTest() {
  const [difficulty, setDifficulty] = useState('easy');
  const [phase, setPhase] = useState('ready'); // ready, typing, done
  const [text, setText] = useState('');
  const [typed, setTyped] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [errors, setErrors] = useState(0);
  const inputRef = useRef(null);
  const { updateScore, getScores } = useScores();
  const scores = getScores();

  const startTest = useCallback(() => {
    const pool = wordPools[difficulty];
    const randomText = pool[Math.floor(Math.random() * pool.length)];
    setText(randomText);
    setTyped('');
    setStartTime(null);
    setEndTime(null);
    setWpm(0);
    setAccuracy(100);
    setErrors(0);
    setPhase('typing');
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [difficulty]);

  const handleInput = useCallback((e) => {
    const val = e.target.value;

    if (!startTime && val.length === 1) {
      setStartTime(Date.now());
    }

    setTyped(val);

    // Calculate stats
    let errCount = 0;
    for (let i = 0; i < val.length; i++) {
      if (val[i] !== text[i]) errCount++;
    }
    setErrors(errCount);

    const correctChars = val.length - errCount;
    const acc = val.length > 0 ? Math.round((correctChars / val.length) * 100) : 100;
    setAccuracy(acc);

    // WPM calculation
    if (startTime) {
      const elapsed = (Date.now() - startTime) / 60000; // minutes
      if (elapsed > 0) {
        const words = correctChars / 5;
        setWpm(Math.round(words / elapsed));
      }
    }

    // Check if done
    if (val.length >= text.length) {
      const finalTime = Date.now();
      setEndTime(finalTime);
      setPhase('done');

      const elapsed = (finalTime - startTime) / 60000;
      const finalWpm = Math.round(((val.length - errCount) / 5) / elapsed);
      setWpm(finalWpm);

      if (finalWpm > (scores.typing?.wpm || 0)) {
        updateScore('typing', { wpm: finalWpm, accuracy: acc });
      }
    }
  }, [text, startTime, scores.typing, updateScore]);

  const renderText = () => {
    return text.split('').map((char, i) => {
      let className = 'pending';
      if (i < typed.length) {
        className = typed[i] === char ? 'correct' : 'incorrect';
      } else if (i === typed.length) {
        className = 'current';
      }
      return <span key={i} className={className}>{char}</span>;
    });
  };

  const getElapsedTime = () => {
    if (!startTime) return '0.0';
    const end = endTime || Date.now();
    return ((end - startTime) / 1000).toFixed(1);
  };

  // Live timer update
  useEffect(() => {
    if (phase !== 'typing' || !startTime) return;
    const interval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 60000;
      if (elapsed > 0 && typed.length > 0) {
        let errCount = 0;
        for (let i = 0; i < typed.length; i++) {
          if (typed[i] !== text[i]) errCount++;
        }
        const words = (typed.length - errCount) / 5;
        setWpm(Math.round(words / elapsed));
      }
    }, 500);
    return () => clearInterval(interval);
  }, [phase, startTime, typed, text]);

  return (
    <main className="page">
      <div className="container">
        <div className="page-header">
          <Link to="/" className="back-btn">
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_back</span>
            Back to Dashboard
          </Link>
          <h1>
            <span className="material-symbols-outlined" style={{ color: 'var(--secondary)', fontVariationSettings: "'FILL' 1" }}>keyboard</span>
            Typing Speed Test
          </h1>
          <p>Test your typing speed with real-time WPM tracking and error highlighting.</p>
        </div>

        {/* Difficulty Selector */}
        <div className="difficulty-selector">
          {['easy', 'medium', 'hard'].map(d => (
            <button
              key={d}
              className={`difficulty-btn ${difficulty === d ? 'active' : ''}`}
              onClick={() => { setDifficulty(d); if (phase !== 'typing') setPhase('ready'); }}
            >
              {d.charAt(0).toUpperCase() + d.slice(1)}
            </button>
          ))}
        </div>

        {phase === 'ready' && (
          <div className="glass-card-static game-area animate-in">
            <div className="text-headline-lg" style={{ marginBottom: 8 }}>Ready to Type?</div>
            <p style={{ color: 'var(--on-surface-variant)', marginBottom: 8 }}>
              Difficulty: <strong style={{ color: 'var(--primary)' }}>{difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}</strong>
            </p>
            {scores.typing?.wpm > 0 && <p style={{ color: 'var(--primary)', fontSize: 14, marginBottom: 24 }}>Personal Best: {scores.typing.wpm} WPM</p>}
            <button className="btn-primary" onClick={startTest}>Start Typing Test</button>
          </div>
        )}

        {phase === 'typing' && (
          <div className="animate-in">
            {/* Live Stats */}
            <div className="typing-stats" style={{ marginBottom: 24 }}>
              <div className="typing-stat-card">
                <div className="value">{wpm}</div>
                <div className="label">WPM</div>
              </div>
              <div className="typing-stat-card">
                <div className="value" style={{ color: accuracy >= 95 ? 'var(--success)' : accuracy >= 80 ? 'var(--warning)' : 'var(--error)' }}>{accuracy}%</div>
                <div className="label">Accuracy</div>
              </div>
              <div className="typing-stat-card">
                <div className="value" style={{ color: 'var(--error)' }}>{errors}</div>
                <div className="label">Errors</div>
              </div>
              <div className="typing-stat-card">
                <div className="value" style={{ color: 'var(--tertiary)' }}>{getElapsedTime()}s</div>
                <div className="label">Time</div>
              </div>
            </div>

            {/* Text Display */}
            <div className="typing-text-display">{renderText()}</div>

            {/* Input */}
            <input
              ref={inputRef}
              className="typing-input"
              type="text"
              value={typed}
              onChange={handleInput}
              placeholder="Start typing here..."
              autoFocus
              spellCheck={false}
              autoComplete="off"
              autoCapitalize="off"
            />
          </div>
        )}

        {phase === 'done' && (
          <div className="results-card glass-card-static animate-in" style={{ margin: '0 auto' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
            <div className="score-value">{wpm}</div>
            <div className="score-label" style={{ marginBottom: 32 }}>Words Per Minute</div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
              <div className="typing-stat-card">
                <div className="value" style={{ fontSize: 22, color: accuracy >= 95 ? 'var(--success)' : 'var(--warning)' }}>{accuracy}%</div>
                <div className="label">Accuracy</div>
              </div>
              <div className="typing-stat-card">
                <div className="value" style={{ fontSize: 22, color: 'var(--tertiary)' }}>{getElapsedTime()}s</div>
                <div className="label">Time</div>
              </div>
              <div className="typing-stat-card">
                <div className="value" style={{ fontSize: 22, color: 'var(--error)' }}>{errors}</div>
                <div className="label">Errors</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
              <button className="btn-primary" onClick={startTest}>Try Again</button>
              <Link to="/" className="btn-secondary" style={{ display: 'inline-block' }}>Dashboard</Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
