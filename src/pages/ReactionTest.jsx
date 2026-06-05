import { useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useScores } from '../hooks/useScores';

const TOTAL_ROUNDS = 5;

const benchmarks = [
  { max: 150, label: 'Lightning Fast', emoji: '⚡', color: 'var(--success)', desc: 'Top 1% — competitive gamer reflexes!' },
  { max: 200, label: 'Excellent', emoji: '🔥', color: 'var(--success)', desc: 'Faster than 85% of the population.' },
  { max: 250, label: 'Above Average', emoji: '👍', color: 'var(--primary)', desc: 'Better than most people.' },
  { max: 300, label: 'Average', emoji: '🙂', color: 'var(--warning)', desc: 'Right around the population median (~273ms).' },
  { max: 400, label: 'Below Average', emoji: '😅', color: 'var(--warning)', desc: 'Keep practicing — you\'ll improve!' },
  { max: Infinity, label: 'Keep Practicing', emoji: '💪', color: 'var(--error)', desc: 'Room for improvement. Try again!' },
];

export default function ReactionTest() {
  const [phase, setPhase] = useState('ready'); // ready, waiting, click-now, too-early, result, done
  const [round, setRound] = useState(0);
  const [times, setTimes] = useState([]);
  const [showTime, setShowTime] = useState(null);
  const [clickTime, setClickTime] = useState(null);
  const timeoutRef = useRef(null);
  const startRef = useRef(null);
  const { updateScore, getScores } = useScores();
  const scores = getScores();

  const startRound = useCallback(() => {
    setPhase('waiting');
    setShowTime(null);
    setClickTime(null);

    const delay = 1000 + Math.random() * 4000; // 1-5 seconds
    timeoutRef.current = setTimeout(() => {
      startRef.current = Date.now();
      setPhase('click-now');
    }, delay);
  }, []);

  const handleClick = useCallback(() => {
    if (phase === 'waiting') {
      // Too early!
      clearTimeout(timeoutRef.current);
      setPhase('too-early');
      return;
    }

    if (phase === 'click-now') {
      const reactionTime = Date.now() - startRef.current;
      setClickTime(reactionTime);
      setPhase('result');

      const newTimes = [...times, reactionTime];
      setTimes(newTimes);

      if (round + 1 >= TOTAL_ROUNDS) {
        // Calculate final results
        setTimeout(() => {
          const avg = Math.round(newTimes.reduce((a, b) => a + b, 0) / newTimes.length);
          updateScore('reaction', { avgTime: avg });
          setPhase('done');
        }, 1500);
      } else {
        setTimeout(() => {
          setRound(r => r + 1);
          startRound();
        }, 1500);
      }
    }
  }, [phase, times, round, updateScore, startRound]);

  const nextRound = useCallback(() => {
    setRound(r => r + 1);
    startRound();
  }, [startRound]);

  const retryEarly = useCallback(() => {
    startRound();
  }, [startRound]);

  const restart = useCallback(() => {
    setRound(0);
    setTimes([]);
    setShowTime(null);
    setClickTime(null);
    setPhase('ready');
  }, []);

  const getAvgTime = () => {
    if (times.length === 0) return 0;
    return Math.round(times.reduce((a, b) => a + b, 0) / times.length);
  };

  const getBenchmark = (time) => {
    return benchmarks.find(b => time < b.max) || benchmarks[benchmarks.length - 1];
  };

  const getBestTime = () => {
    if (times.length === 0) return 0;
    return Math.min(...times);
  };

  return (
    <main className="page">
      <div className="container">
        <div className="page-header">
          <Link to="/" className="back-btn">
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_back</span>
            Back to Dashboard
          </Link>
          <h1>
            <span className="material-symbols-outlined" style={{ color: 'var(--error)', fontVariationSettings: "'FILL' 1" }}>speed</span>
            Reaction Time Test
          </h1>
          <p>Test your reflexes over {TOTAL_ROUNDS} rounds. Click as fast as you can when the circle turns green!</p>
        </div>

        {/* Round Indicator */}
        {phase !== 'ready' && phase !== 'done' && (
          <div className="round-indicator" style={{ justifyContent: 'center', marginBottom: 32 }}>
            {Array.from({ length: TOTAL_ROUNDS }).map((_, i) => (
              <div
                key={i}
                className={`round-dot ${i === round ? 'active' : i < round ? 'completed' : ''}`}
              />
            ))}
          </div>
        )}

        {/* Ready */}
        {phase === 'ready' && (
          <div className="glass-card-static game-area animate-in">
            <div style={{ fontSize: 64, marginBottom: 16 }}>🎯</div>
            <div className="text-headline-lg" style={{ marginBottom: 8 }}>Ready?</div>
            <p style={{ color: 'var(--on-surface-variant)', marginBottom: 8 }}>Click the circle when it turns <span style={{ color: 'var(--success)', fontWeight: 700 }}>GREEN</span></p>
            {scores.reaction?.avgTime > 0 && <p style={{ color: 'var(--primary)', fontSize: 14, marginBottom: 24 }}>Personal Best: {scores.reaction.avgTime}ms avg</p>}
            <button className="btn-primary" onClick={startRound}>Start Test</button>
          </div>
        )}

        {/* Waiting (Red) */}
        {phase === 'waiting' && (
          <div
            className="glass-card-static game-area"
            onClick={handleClick}
            style={{ cursor: 'pointer', background: 'rgba(239, 68, 68, 0.1)', minHeight: 400 }}
          >
            <div className="reaction-circle" style={{ background: '#ef4444', color: 'white' }}>
              Wait...
            </div>
            <p style={{ color: 'var(--on-surface-variant)', marginTop: 16, fontSize: 14 }}>Wait for green...</p>
          </div>
        )}

        {/* Click Now (Green) */}
        {phase === 'click-now' && (
          <div
            className="glass-card-static game-area"
            onClick={handleClick}
            style={{ cursor: 'pointer', background: 'rgba(34, 197, 94, 0.1)', minHeight: 400 }}
          >
            <div className="reaction-circle animate-in" style={{ background: '#22c55e', color: 'white', fontSize: 24 }}>
              CLICK!
            </div>
            <p style={{ color: 'var(--success)', marginTop: 16, fontWeight: 700 }}>Click now!</p>
          </div>
        )}

        {/* Too Early */}
        {phase === 'too-early' && (
          <div className="glass-card-static game-area animate-in">
            <div style={{ fontSize: 48, marginBottom: 16 }}>🚫</div>
            <div className="text-headline-lg" style={{ color: 'var(--error)', marginBottom: 8 }}>Too Early!</div>
            <p style={{ color: 'var(--on-surface-variant)', marginBottom: 24 }}>Wait for the circle to turn green before clicking.</p>
            <button className="btn-primary" onClick={retryEarly}>Try Again</button>
          </div>
        )}

        {/* Round Result */}
        {phase === 'result' && (
          <div className="glass-card-static game-area animate-in">
            <div className="score-value" style={{ color: getBenchmark(clickTime).color }}>{clickTime}ms</div>
            <div className="score-label" style={{ marginBottom: 24 }}>Round {round + 1} of {TOTAL_ROUNDS}</div>
            <p style={{ color: 'var(--on-surface-variant)', fontSize: 14 }}>{getBenchmark(clickTime).label}</p>
          </div>
        )}

        {/* Final Results */}
        {phase === 'done' && (
          <div className="animate-in">
            <div className="results-card glass-card-static" style={{ margin: '0 auto', marginBottom: 32 }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>{getBenchmark(getAvgTime()).emoji}</div>
              <div className="score-value" style={{ color: getBenchmark(getAvgTime()).color }}>{getAvgTime()}ms</div>
              <div className="score-label" style={{ marginBottom: 8 }}>Average Reaction Time</div>
              <div style={{ color: getBenchmark(getAvgTime()).color, fontWeight: 600, fontSize: 18, marginBottom: 8 }}>
                {getBenchmark(getAvgTime()).label}
              </div>
              <p style={{ color: 'var(--on-surface-variant)', fontSize: 14, marginBottom: 32 }}>
                {getBenchmark(getAvgTime()).desc}
              </p>

              {/* Individual rounds */}
              <div style={{ display: 'grid', gridTemplateColumns: `repeat(${TOTAL_ROUNDS}, 1fr)`, gap: 8, marginBottom: 32 }}>
                {times.map((t, i) => (
                  <div key={i} className="typing-stat-card">
                    <div className="value" style={{ fontSize: 18, color: getBenchmark(t).color }}>{t}ms</div>
                    <div className="label">R{i + 1}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 32 }}>
                <div className="typing-stat-card">
                  <div className="value" style={{ fontSize: 20, color: 'var(--success)' }}>{getBestTime()}ms</div>
                  <div className="label">Best Time</div>
                </div>
                <div className="typing-stat-card">
                  <div className="value" style={{ fontSize: 20, color: 'var(--outline)' }}>273ms</div>
                  <div className="label">Pop. Average</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
                <button className="btn-primary" onClick={restart}>Try Again</button>
                <Link to="/" className="btn-secondary" style={{ display: 'inline-block' }}>Dashboard</Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
