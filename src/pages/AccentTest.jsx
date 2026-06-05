import { useState, useRef, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useScores } from '../hooks/useScores';
import { startSpeechRecognition } from '../lib/speech';
import { analyzePronunciation } from '../lib/ai';

const paragraphs = [
  "The quick brown fox jumps over the lazy dog. She sells seashells by the seashore. Peter Piper picked a peck of pickled peppers.",
  "How much wood would a woodchuck chuck if a woodchuck could chuck wood? A proper copper coffee pot is a proper copper coffee pot.",
  "Red lorry, yellow lorry. Unique New York, unique New York, you know you need unique New York. The thirty-three thieves thought that they thrilled the throne throughout Thursday.",
  "Around the rugged rocks the ragged rascal ran. Betty Botter bought some butter but she said the butter's bitter. If I buy a bit of better butter it will make my batter better.",
  "Six sleek swans swam swiftly southwards. Fred fed Ted bread and Ted fed Fred bread. A big black bug bit a big black bear and made the big black bear bleed blood.",
];

export default function AccentTest() {
  const [phase, setPhase] = useState('ready'); // ready, recording, processing, result
  const [paragraph, setParagraph] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [accuracy, setAccuracy] = useState(0);
  const [aiFeedback, setAiFeedback] = useState('');
  const [detectedAccent, setDetectedAccent] = useState('');
  const [mispronouncedWords, setMispronouncedWords] = useState([]);
  const [waveformBars, setWaveformBars] = useState(Array(20).fill(8));
  const [error, setError] = useState('');

  const recognitionRef = useRef(null);
  const animFrameRef = useRef(null);
  const { updateScore } = useScores();

  const selectParagraph = useCallback(() => {
    const p = paragraphs[Math.floor(Math.random() * paragraphs.length)];
    setParagraph(p);
    return p;
  }, []);

  const animateWaveform = useCallback(() => {
    const bars = Array(20).fill(0).map(() => 8 + Math.random() * 28);
    setWaveformBars(bars);
    animFrameRef.current = requestAnimationFrame(() => {
      setTimeout(() => animateWaveform(), 100);
    });
  }, []);

  const stopWaveform = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }
    setWaveformBars(Array(20).fill(8));
  }, []);

  const startRecording = useCallback(() => {
    setError('');
    setTranscript('');
    setAiFeedback('');
    setDetectedAccent('');
    setMispronouncedWords([]);

    const recognition = startSpeechRecognition(
      // onResult
      (text) => {
        setTranscript(text);
      },
      // onError
      (errMsg) => {
        setError(errMsg);
        setIsRecording(false);
        stopWaveform();
      },
      // onEnd
      async (finalTranscript) => {
        setIsRecording(false);
        stopWaveform();

        if (finalTranscript.trim()) {
          setPhase('processing');
          try {
            const aiResult = await analyzePronunciation(paragraph, finalTranscript);
            setAccuracy(aiResult.accuracy);
            setAiFeedback(aiResult.feedback);
            setDetectedAccent(aiResult.guessedAccent || 'Unknown');
            setMispronouncedWords(aiResult.mispronouncedWords || []);
            updateScore('accent', { accuracy: Math.max(aiResult.accuracy, 0) });
            setPhase('result');
          } catch (err) {
            setError(err.message);
            setPhase('ready');
          }
        } else {
          setPhase('ready');
        }
      }
    );

    if (recognition) {
      recognitionRef.current = recognition;
      setIsRecording(true);
      setPhase('recording');
      animateWaveform();
    }
  }, [paragraph, updateScore, animateWaveform, stopWaveform]);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    stopWaveform();
  }, [stopWaveform]);

  const startTest = useCallback(() => {
    selectParagraph();
    setPhase('ready');
    setTranscript('');
    setAccuracy(0);
    setError('');
  }, [selectParagraph]);

  useEffect(() => {
    selectParagraph();
    return () => stopWaveform();
  }, [selectParagraph, stopWaveform]);

  const getAccuracyColor = () => {
    if (accuracy >= 80) return 'var(--success)';
    if (accuracy >= 50) return 'var(--warning)';
    return 'var(--error)';
  };

  const getAccuracyLabel = () => {
    if (accuracy >= 90) return 'Excellent';
    if (accuracy >= 80) return 'Great';
    if (accuracy >= 60) return 'Good';
    if (accuracy >= 40) return 'Fair';
    return 'Needs Practice';
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
            <span className="material-symbols-outlined" style={{ color: 'var(--tertiary)', fontVariationSettings: "'FILL' 1" }}>record_voice_over</span>
            Accent & Speaking Test
          </h1>
          <p>Read the paragraph aloud and get AI-powered pronunciation analysis.</p>
        </div>

        {error && (
          <div style={{
            padding: '16px 24px',
            background: 'rgba(255, 180, 171, 0.1)',
            border: '1px solid rgba(255, 180, 171, 0.3)',
            borderRadius: 'var(--radius-xl)',
            color: 'var(--error)',
            marginBottom: 24,
            fontSize: 14
          }}>
            {error}
          </div>
        )}

        {/* Paragraph to Read */}
        {(phase === 'ready' || phase === 'recording') && (
          <div className="glass-card-static animate-in" style={{ padding: 32, marginBottom: 32 }}>
            <div className="text-label-caps" style={{ color: 'var(--outline)', marginBottom: 16 }}>READ THIS ALOUD</div>
            <p style={{ fontSize: 20, lineHeight: 1.8, color: 'var(--on-surface)' }}>
              {paragraph}
            </p>
          </div>
        )}

        {/* Recording Controls */}
        {(phase === 'ready' || phase === 'recording') && (
          <div className="glass-card-static game-area animate-in" style={{ padding: 48 }}>
            {/* Waveform */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 3, height: 40, marginBottom: 32 }}>
              {waveformBars.map((h, i) => (
                <div
                  key={i}
                  className="waveform-bar"
                  style={{
                    height: `${h}px`,
                    opacity: isRecording ? 1 : 0.3,
                    animationDelay: `${i * 0.05}s`,
                    transition: 'height 0.1s ease',
                  }}
                />
              ))}
            </div>

            {/* Record Button */}
            <button
              className={`record-btn ${isRecording ? 'recording' : ''}`}
              onClick={isRecording ? stopRecording : startRecording}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 32, fontVariationSettings: "'FILL' 1" }}>
                {isRecording ? 'stop' : 'mic'}
              </span>
            </button>

            <p style={{ color: 'var(--on-surface-variant)', marginTop: 16, fontSize: 14 }}>
              {isRecording ? 'Recording... Click to stop' : 'Click to start recording'}
            </p>

            {/* Live transcript */}
            {transcript && (
              <div style={{
                marginTop: 24,
                padding: 16,
                background: 'var(--surface-container)',
                borderRadius: 'var(--radius-xl)',
                fontSize: 14,
                color: 'var(--on-surface-variant)',
                maxWidth: 500,
                textAlign: 'left',
              }}>
                <div className="text-label-caps" style={{ color: 'var(--outline)', marginBottom: 8 }}>LIVE TRANSCRIPT</div>
                {transcript}
              </div>
            )}
          </div>
        )}

        {/* Processing */}
        {phase === 'processing' && (
          <div className="glass-card-static game-area animate-in" style={{ padding: 48 }}>
            <div style={{ width: 48, height: 48, border: '3px solid var(--outline-variant)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            <p style={{ marginTop: 16, color: 'var(--on-surface-variant)' }}>Analyzing your pronunciation...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* Results */}
        {phase === 'result' && (
          <div className="animate-in">
            <div className="results-card glass-card-static" style={{ margin: '0 auto', marginBottom: 32 }}>
              <div className="score-value" style={{ color: getAccuracyColor() }}>{accuracy}%</div>
              <div className="score-label">{getAccuracyLabel()}</div>
            </div>

            {/* Transcript Comparison */}
            <div className="glass-card-static" style={{ padding: 32, marginBottom: 24 }}>
              <h3 className="text-headline-md" style={{ marginBottom: 16 }}>Transcript Comparison</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                <div>
                  <div className="text-label-caps" style={{ color: 'var(--outline)', marginBottom: 8 }}>ORIGINAL</div>
                  <p style={{ fontSize: 14, lineHeight: 1.8 }}>{paragraph}</p>
                </div>
                <div>
                  <div className="text-label-caps" style={{ color: 'var(--outline)', marginBottom: 8 }}>YOUR SPEECH</div>
                  <p style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--on-surface-variant)' }}>{transcript || 'No transcript captured'}</p>
                </div>
              </div>
            </div>

            {/* AI Feedback */}
            <div className="glass-card-static" style={{ padding: 32, marginBottom: 24 }}>
              <h3 className="text-headline-md" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="material-symbols-outlined" style={{ color: 'var(--primary)', fontVariationSettings: "'FILL' 1" }}>psychology</span>
                AI Pronunciation Coach
              </h3>
              
              <div style={{
                padding: 16,
                background: 'var(--surface-container-low)',
                borderRadius: 'var(--radius-xl)',
                borderLeft: '3px solid var(--primary)',
                fontSize: 16,
                lineHeight: 1.6,
                marginBottom: 24,
                color: 'var(--on-surface)'
              }}>
                "{aiFeedback}"
              </div>

              {detectedAccent && (
                <div style={{ marginBottom: 24, textAlign: 'left' }}>
                  <div className="text-label-caps" style={{ color: 'var(--primary)', marginBottom: 4 }}>DETECTED ACCENT</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--on-surface)' }}>
                    {detectedAccent}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--on-surface-variant)', marginTop: 4, fontStyle: 'italic' }}>
                    (This might not be 100% correct since we are guessing based on text using free AI models)
                  </div>
                </div>
              )}

              {mispronouncedWords.length > 0 && (
                <div>
                  <div className="text-label-caps" style={{ color: 'var(--error)', marginBottom: 12 }}>Words to Practice:</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {mispronouncedWords.map((word, i) => (
                      <span key={i} style={{
                        padding: '6px 12px',
                        background: 'rgba(255, 180, 171, 0.1)',
                        border: '1px solid rgba(255, 180, 171, 0.3)',
                        borderRadius: 'var(--radius-full)',
                        color: 'var(--error)',
                        fontSize: 14,
                        fontWeight: 600
                      }}>
                        {word}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div style={{ textAlign: 'center' }}>
              <button className="btn-primary" onClick={startTest}>Try Again</button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
