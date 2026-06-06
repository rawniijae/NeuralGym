import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const SCORE_KEY = 'neuralgym_scores';

const defaultScores = {
  memory: { numberMemory: 0, patternMemory: 0, wordPairs: 0 },
  typing: { wpm: 0, accuracy: 0 },
  accent: { accuracy: 0 },
  reaction: { avgTime: 0 },
  stroop: { accuracy: 0, avgTime: 0 },
  personality: {},
};

function getStoredScores() {
  try {
    const stored = sessionStorage.getItem(SCORE_KEY);
    if (stored) {
      return { ...defaultScores, ...JSON.parse(stored) };
    }
  } catch (e) { /* ignore */ }
  return { ...defaultScores };
}

function saveScores(scores) {
  sessionStorage.setItem(SCORE_KEY, JSON.stringify(scores));
}

export function useScores() {
  const { user } = useAuth();
  const [localUpdate, setLocalUpdate] = useState(0);

  // Listen for custom event to trigger re-renders when local storage changes
  useEffect(() => {
    const handleUpdate = () => setLocalUpdate(prev => prev + 1);
    window.addEventListener('scoresUpdated', handleUpdate);
    return () => window.removeEventListener('scoresUpdated', handleUpdate);
  }, []);

  // Sync down from Firestore on login
  useEffect(() => {
    async function syncFromCloud() {
      if (!user || !db) return;
      try {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().scores) {
          const cloudScores = docSnap.data().scores;
          saveScores({ ...defaultScores, ...cloudScores });
          window.dispatchEvent(new Event('scoresUpdated'));
        } else {
          // If no cloud document, upload local scores
          const localScores = getStoredScores();
          await setDoc(docRef, { scores: localScores }, { merge: true });
        }
      } catch (err) {
        console.error("Failed to sync from cloud", err);
      }
    }
    syncFromCloud();
  }, [user]);

  const getScores = useCallback(() => getStoredScores(), [localUpdate]);

  const updateScore = useCallback(async (module, data) => {
    const scores = getStoredScores();
    scores[module] = { ...scores[module], ...data };
    saveScores(scores);
    window.dispatchEvent(new Event('scoresUpdated'));

    // Sync up to Firestore
    if (user && db) {
      try {
        await setDoc(doc(db, 'users', user.uid), { scores }, { merge: true });
      } catch (err) {
        console.error("Failed to sync to cloud", err);
      }
    }
    return scores;
  }, [user]);

  const getBrainScore = useCallback(() => {
    const s = getStoredScores();

    // Memory: max level across sub-games, normalized to 100
    const memMax = Math.max(s.memory.numberMemory || 0, s.memory.patternMemory || 0, s.memory.wordPairs || 0);
    const memScore = Math.min(100, memMax * 10); // level 10 = 100

    // Typing: WPM normalized (120 WPM = 100)
    const typingScore = Math.min(100, ((s.typing.wpm || 0) / 120) * 100);

    // Accent: direct percentage
    const accentScore = s.accent.accuracy || 0;

    // Reaction: 150ms = 100, 500ms = 0
    const rt = s.reaction.avgTime || 500;
    const reactionScore = rt > 0 ? Math.max(0, Math.min(100, ((500 - rt) / 350) * 100)) : 0;

    // Stroop: direct accuracy
    const stroopScore = s.stroop.accuracy || 0;

    // Weighted average
    const weights = { memory: 0.25, typing: 0.2, accent: 0.15, reaction: 0.2, stroop: 0.2 };
    const hasAny = memScore + typingScore + accentScore + reactionScore + stroopScore > 0;

    if (!hasAny) return 0;

    const weighted =
      memScore * weights.memory +
      typingScore * weights.typing +
      accentScore * weights.accent +
      reactionScore * weights.reaction +
      stroopScore * weights.stroop;

    return Math.round(weighted);
  }, []);

  return { getScores, updateScore, getBrainScore };
}
