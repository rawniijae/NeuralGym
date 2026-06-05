import { useState, useRef, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useScores } from '../hooks/useScores';

const TOTAL_ROUNDS = 20;

const COLORS = [
  { name: 'RED', hex: '#ef4444' },
  { name: 'BLUE', hex: '#3b82f6' },
  { name: 'GREEN', hex: '#22c55e' },
  { name: 'YELLOW', hex: '#eab308' },
];

function generateRound() {
  const wordIndex = Math.floor(Math.random() * COLORS.length);
  let inkIndex;
  do {
    inkIndex = Math.floor(Math.random() * COLORS.length);
  } while (inkIndex === wordIndex); // Ensure ink ≠ word

  return {
    word: COLORS[wordIndex].name,
    inkColor: COLORS[inkIndex],
  };
}

export default function StroopTest() {
  const [phase, setPhase] = useState('ready'); // ready, playing, result, done
  const [round, setRound] = useState(0);
  const [currentRound, setCurrentRound] = useState(null);
  const [correct, setCorrect] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [roundTimes, setRoundTimes] = useState([]);
  const [feedback, setFeedback] = useState(null); // { correct: bool, selected: string, answer: string }
  const roundStartRef = useRef(null);
  const { updateScore, getScores } = useScores();
  const scores = getScores();

  const startGame = useCallback(() => {
    setRound(0);
    setCorrect(0);
    setTotalTime(0);
    setRoundTimes([]);
    setFeedback(null);
    const newRound = generateRound();
    setCurrentRound(newRound);
    roundStartRef.current = Date.now();
    setPhase('playing');
  }, []);

  const handleColorClick = useCallback((colorName) => {
    if (phase !== 'playing' || feedback) return;

    const reactionTime = Date.now() - roundStartRef.current;
    const isCorrect = colorName === currentRound.inkColor.name;

    const newCorrect = isCorrect ? correct + 1 : correct;
    const newTimes = [...roundTimes, reactionTime];
    const newTotalTime = totalTime + reactionTime;

    setCorrect(newCorrect);
    setRoundTimes(newTimes);
    setTotalTime(newTotalTime);

    setFeedback({
      correct: isCorrect,
      selected: colorName,
      answer: currentRound.inkColor.name,
    });

    setTimeout(() => {
      setFeedback(null);

      if (round + 1 >= TOTAL_ROUNDS) {
        // Done
        const accuracy = Math.round((newCorrect / TOTAL_ROUNDS) * 100);
        const avgTime = Math.round(newTotalTime / TOTAL_ROUNDS);
        updateScore('stroop', { accuracy, avgTime });
        setPhase('done');
      } else {
        // Next round
        setRound(r => r + 1);
        const newR = generateRound();
        setCurrentRound(newR);
        roundStartRef.current = Date.now();
      }
    }, 600);
  }, [phase, feedback, currentRound, correct, roundTimes, totalTime, round, updateScore]);

  const getAccuracy = () => Math.round((correct / TOTAL_ROUNDS) * 100);
  const getAvgTime = () => roundTimes.length > 0 ? Math.round(totalTime / roundTimes.length) : 0;

  const getPerformanceLabel = () => {
    const acc = getAccuracy();
    if (acc >= 95) return { label: 'Master', emoji: '🧠', color: 'var(--success)' };
    if (acc >= 85) return { label: 'Excellent', emoji: '🔥', color: 'var(--success)' };
    if (acc >= 70) return { label: 'Good', emoji: '👍', color: 'var(--primary)' };
    if (acc >= 50) return { label: 'Average', emoji: '🙂', color: 'var(--warning)' };
    return { label: 'Needs Practice', emoji: '💪', color: 'var(--error)' };
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
            <span className="material-symbols-outlined" style={{ color: 'var(--primary)', fontVariationSettings: "'FILL' 1" }}>visibility</span>
            Focus / Attention Test
          </h1>
          <p>The Stroop Effect — click the <strong>INK COLOR</strong>, not the word. {TOTAL_ROUNDS} rounds.</p>
        </div>

        {/* Ready */}
        {phase === 'ready' && (
          <div className="glass-card-static game-area animate-in">
            <div style={{ fontSize: 64, marginBottom: 16 }}>🎨</div>
            <div className="text-headline-lg" style={{ marginBottom: 8 }}>Stroop Test</div>
            <p style={{ color: 'var(--on-surface-variant)', marginBottom: 8, maxWidth: 500, textAlign: 'center', lineHeight: 1.6 }}>
              You'll see a color word written in a <strong>different ink color</strong>. Click the button matching the <strong>INK COLOR</strong>, not the word itself.
            </p>
            <div style={{ margin: '16px 0', padding: 16, background: 'var(--surface-container)', borderRadius: 'var(--radius-xl)' }}>
              <p style={{ fontSize: 14 }}>Example: The word <span style={{ color: '#3b82f6', fontWeight: 700, fontSize: 20 }}>RED</span> → Click <strong>BLUE</strong> (the ink color)</p>
            </div>
            {scores.stroop?.accuracy > 0 && <p style={{ color: 'var(--primary)', fontSize: 14, marginBottom: 24 }}>Personal Best: {scores.stroop.accuracy}%</p>}
            <button className="btn-primary" onClick={startGame}>Start Test</button>
          </div>
        )}

        {/* Playing */}
        {phase === 'playing' && currentRound && (
          <div className="animate-in">
            {/* Progress */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <span className="text-label-caps" style={{ color: 'var(--outline)' }}>ROUND {round + 1} / {TOTAL_ROUNDS}</span>
              <span style={{ fontSize: 14, color: 'var(--on-surface-variant)' }}>
                Score: <strong style={{ color: 'var(--primary)' }}>{correct}/{round}</strong>
              </span>
            </div>

            <div className="progress-bar-track" style={{ marginBottom: 32 }}>
              <div className="progress-bar-fill" style={{ width: `${((round) / TOTAL_ROUNDS) * 100}%` }} />
            </div>

            {/* Stroop Word */}
            <div className="glass-card-static game-area" style={{ minHeight: 350, position: 'relative' }}>
              {/* Feedback overlay */}
              {feedback && (
                <div style={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-full)',
                  background: feedback.correct ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                  color: feedback.correct ? 'var(--success)' : 'var(--error)',
                  fontWeight: 700,
                  fontSize: 14,
                  animation: 'fadeInScale 0.2s ease-out',
                }}>
                  {feedback.correct ? '✓ Correct!' : `✗ Was: ${feedback.answer}`}
                </div>
              )}

              <div className="text-label-caps" style={{ color: 'var(--outline)', marginBottom: 24 }}>WHAT COLOR IS THE INK?</div>

              <div className="stroop-word" style={{ color: currentRound.inkColor.hex }}>
                {currentRound.word}
              </div>

              <div className="stroop-buttons">
                {COLORS.map(color => (
                  <button
                    key={color.name}
                    className="stroop-btn"
                    style={{
                      backgroundColor: `${color.hex}22`,
                      borderColor: `${color.hex}55`,
                    }}
                    onClick={() => handleColorClick(color.name)}
                    disabled={!!feedback}
                  >
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: color.hex, margin: '0 auto 8px' }} />
                    {color.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Done */}
        {phase === 'done' && (
          <div className="animate-in">
            <div className="results-card glass-card-static" style={{ margin: '0 auto', marginBottom: 32 }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>{getPerformanceLabel().emoji}</div>
              <div className="score-value" style={{ color: getPerformanceLabel().color }}>{getAccuracy()}%</div>
              <div className="score-label" style={{ marginBottom: 8 }}>Accuracy</div>
              <div style={{ color: getPerformanceLabel().color, fontWeight: 600, fontSize: 18, marginBottom: 32 }}>
                {getPerformanceLabel().label}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
                <div className="typing-stat-card">
                  <div className="value" style={{ fontSize: 20, color: 'var(--success)' }}>{correct}</div>
                  <div className="label">Correct</div>
                </div>
                <div className="typing-stat-card">
                  <div className="value" style={{ fontSize: 20, color: 'var(--error)' }}>{TOTAL_ROUNDS - correct}</div>
                  <div className="label">Wrong</div>
                </div>
                <div className="typing-stat-card">
                  <div className="value" style={{ fontSize: 20, color: 'var(--tertiary)' }}>{getAvgTime()}ms</div>
                  <div className="label">Avg Time</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
                <button className="btn-primary" onClick={startGame}>Play Again</button>
                <Link to="/" className="btn-secondary" style={{ display: 'inline-block' }}>Dashboard</Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
