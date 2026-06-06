import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useScores } from '../hooks/useScores';
import { generatePersonalityAnalysis } from '../lib/ai';

const questions = [
  { text: "I find it easy to introduce myself to others.", dimension: "E/I", polarity: 1 },
  { text: "I usually prefer to spend my free time alone.", dimension: "E/I", polarity: -1 },
  { text: "I feel energized after spending time with a large group of people.", dimension: "E/I", polarity: 1 },
  { text: "I often let other people start the conversation.", dimension: "E/I", polarity: -1 },
  { text: "I enjoy being the center of attention in social situations.", dimension: "E/I", polarity: 1 },
  
  { text: "I focus more on the details of what is happening rather than the big picture.", dimension: "S/N", polarity: -1 },
  { text: "I often spend time thinking about abstract or philosophical concepts.", dimension: "S/N", polarity: 1 },
  { text: "I prefer concrete facts over theories.", dimension: "S/N", polarity: -1 },
  { text: "I enjoy exploring new ideas and imagining what could be.", dimension: "S/N", polarity: 1 },
  { text: "I trust my past experiences more than my intuition.", dimension: "S/N", polarity: -1 },
  
  { text: "I make decisions based more on logic than on my feelings.", dimension: "T/F", polarity: -1 },
  { text: "I prioritize harmony and people's emotions in a group setting.", dimension: "T/F", polarity: 1 },
  { text: "I am more persuaded by a strong argument than an emotional appeal.", dimension: "T/F", polarity: -1 },
  { text: "I consider how my actions affect others before making a choice.", dimension: "T/F", polarity: 1 },
  { text: "I believe truth is more important than being tactful.", dimension: "T/F", polarity: -1 },
  
  { text: "I prefer to have a detailed plan before starting a project.", dimension: "J/P", polarity: -1 },
  { text: "I like to leave my options open and be spontaneous.", dimension: "J/P", polarity: 1 },
  { text: "I feel satisfied when I complete a task and check it off my list.", dimension: "J/P", polarity: -1 },
  { text: "I adapt easily to sudden changes in my schedule.", dimension: "J/P", polarity: 1 },
  { text: "I prefer my physical workspace to be highly organized.", dimension: "J/P", polarity: -1 },
];

const personalities = {
  INTJ: { title: "The Architect", desc: "Imaginative and strategic thinkers, with a plan for everything. They are highly independent and often prefer to work alone, driven by their own original ideas.", good: ["Strategic", "Logical", "Independent", "Innovative"], bad: ["Overly Analytical", "Arrogant", "Dismissive of Emotions"] },
  INTP: { title: "The Logician", desc: "Innovative inventors with an unquenchable thirst for knowledge. They love patterns, spotting discrepancies, and excel at understanding complex systems.", good: ["Inventive", "Objective", "Open-minded", "Intellectual"], bad: ["Disconnected", "Insensitive", "Prone to Second-Guessing"] },
  ENTJ: { title: "The Commander", desc: "Bold, imaginative and strong-willed leaders, always finding a way—or making one. They project authority and confidence.", good: ["Efficient", "Confident", "Strong-willed", "Strategic Leaders"], bad: ["Stubborn", "Intolerant", "Impatient"] },
  ENTP: { title: "The Debater", desc: "Smart and curious thinkers who cannot resist an intellectual challenge. They are excellent brainstormers and enjoy debating ideas.", good: ["Quick-thinker", "Charismatic", "Energetic", "Brainstormer"], bad: ["Argumentative", "Insensitive", "Difficulty Focusing"] },
  INFJ: { title: "The Advocate", desc: "Quiet and mystical, yet very inspiring and tireless idealists. They possess a deep sense of idealism and integrity.", good: ["Insightful", "Principled", "Altruistic", "Deeply Caring"], bad: ["Perfectionistic", "Prone to Burnout", "Reluctant to Open Up"] },
  INFP: { title: "The Mediator", desc: "Poetic, kind and altruistic people, always eager to help a good cause. They are guided by their core principles rather than logic.", good: ["Empathetic", "Generous", "Creative", "Passionate"], bad: ["Unrealistic", "Self-Isolating", "Unfocused"] },
  ENFJ: { title: "The Protagonist", desc: "Charismatic and inspiring leaders, able to mesmerize their listeners. They genuinely care about people and are excellent communicators.", good: ["Charismatic", "Reliable", "Natural Leader", "Tolerant"], bad: ["Overly Idealistic", "Intense", "Overly Sensitive"] },
  ENFP: { title: "The Campaigner", desc: "Enthusiastic, creative and sociable free spirits, who can always find a reason to smile. They are fiercely independent and crave freedom.", good: ["Enthusiastic", "Friendly", "Excellent Communicator", "Curious"], bad: ["Overthinking", "Highly Emotional", "Poor Practical Skills"] },
  ISTJ: { title: "The Logistician", desc: "Practical and fact-minded individuals, whose reliability cannot be doubted. They uphold traditions and take their responsibilities seriously.", good: ["Honest", "Direct", "Responsible", "Calm and Practical"], bad: ["Stubborn", "Insensitive", "By-the-Book"] },
  ISFJ: { title: "The Defender", desc: "Very dedicated and warm protectors, always ready to defend their loved ones. They are observant and have an excellent memory for details.", good: ["Supportive", "Reliable", "Patient", "Observant"], bad: ["Humble to a Fault", "Takes Things Too Personally", "Overly Reluctant to Change"] },
  ESTJ: { title: "The Executive", desc: "Excellent administrators, unsurpassed at managing things - or people. They value tradition, order, and honesty.", good: ["Dedicated", "Strong-willed", "Direct", "Excellent Organizers"], bad: ["Inflexible", "Uncomfortable with Emotions", "Judgmental"] },
  ESFJ: { title: "The Consul", desc: "Extraordinarily caring, social and popular people, always eager to help. They thrive on supporting their community and organizing social events.", good: ["Strong Practical Skills", "Warm", "Loyal", "Sensitive to Others"], bad: ["Worries about Status", "Inflexible", "Vulnerable to Criticism"] },
  ISTP: { title: "The Virtuoso", desc: "Bold and practical experimenters, masters of all kinds of tools. They enjoy exploring with their hands and their eyes.", good: ["Optimistic", "Creative", "Spontaneous", "Great in a Crisis"], bad: ["Stubborn", "Insensitive", "Easily Bored"] },
  ISFP: { title: "The Adventurer", desc: "Flexible and charming artists, always ready to explore and experience something new. They are inspired by connections with people and ideas.", good: ["Charming", "Sensitive", "Imaginative", "Passionate"], bad: ["Unpredictable", "Easily Stressed", "Overly Competitive"] },
  ESTP: { title: "The Entrepreneur", desc: "Smart, energetic and very perceptive people, who truly enjoy living on the edge. They are action-oriented and fix problems as they go.", good: ["Bold", "Rational", "Practical", "Perceptive"], bad: ["Defiant", "Insensitive", "Prone to Risk"] },
  ESFP: { title: "The Entertainer", desc: "Spontaneous, energetic and enthusiastic people—life is never boring around them. They love the spotlight and are fiercely observant.", good: ["Bold", "Original", "Excellent People Skills", "Observant"], bad: ["Easily Bored", "Poor Planner", "Unfocused"] },
};

const getLetterBreakdown = (type) => {
  const letters = {
    E: "Extraverted", I: "Introverted",
    S: "Observant", N: "Intuitive",
    T: "Thinking", F: "Feeling",
    J: "Judging", P: "Prospecting"
  };
  return type.split('').map(l => letters[l]).join(' • ');
};

export default function PersonalityTest() {
  const [answers, setAnswers] = useState(Array(questions.length).fill(null));
  const [result, setResult] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiError, setAiError] = useState(null);
  const { updateScore } = useScores();

  const handleAnswer = (index, value) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  const calculateResult = () => {
    let scores = { "E/I": 0, "S/N": 0, "T/F": 0, "J/P": 0 };
    
    answers.forEach((val, index) => {
      if (val !== null) {
        const q = questions[index];
        scores[q.dimension] += val * q.polarity;
      }
    });

    const type = [
      scores["E/I"] > 0 ? "E" : "I",
      scores["S/N"] > 0 ? "N" : "S",
      scores["T/F"] > 0 ? "F" : "T",
      scores["J/P"] > 0 ? "P" : "J"
    ].join("");

    setResult(type);
    updateScore('personality', { type });
  };

  const handleAiDeepDive = async () => {
    setIsAnalyzing(true);
    setAiError(null);
    try {
      const scaleMap = { 2: "Strongly Agree", 1: "Agree", 0: "Neutral", "-1": "Disagree", "-2": "Strongly Disagree" };
      const qaList = answers.map((ans, idx) => ({
        question: questions[idx].text,
        answer: scaleMap[ans]
      }));
      const analysis = await generatePersonalityAnalysis(result, qaList);
      setAiAnalysis(analysis);
    } catch (err) {
      setAiError(err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const isComplete = answers.every(a => a !== null);
  const progress = Math.round((answers.filter(a => a !== null).length / questions.length) * 100);

  if (result) {
    const profile = personalities[result];
    return (
      <main className="page">
        <div className="container" style={{ maxWidth: 800 }}>
          <div className="page-header" style={{ textAlign: 'center' }}>
            <Link to="/" className="back-btn" style={{ justifyContent: 'center' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_back</span>
              Back to Dashboard
            </Link>
            <h1 style={{ fontSize: 48, marginBottom: 8 }}>{result}</h1>
            <p className="text-headline-lg" style={{ color: 'var(--primary)', marginBottom: 8 }}>{profile.title}</p>
            <p style={{ fontSize: 13, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--outline)', marginBottom: 24, fontWeight: 600 }}>
              {getLetterBreakdown(result)}
            </p>
            <p style={{ maxWidth: 600, margin: '0 auto 40px', color: 'var(--on-surface-variant)', lineHeight: 1.6, fontSize: 16 }}>
              {profile.desc}
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            <div className="glass-card-static" style={{ background: 'rgba(56, 142, 60, 0.1)', border: '1px solid rgba(56, 142, 60, 0.2)' }}>
              <h3 style={{ color: 'var(--success)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="material-symbols-outlined">thumb_up</span>
                Strengths (Good Sides)
              </h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {profile.good.map((trait, i) => (
                  <li key={i} style={{ marginBottom: 12, paddingLeft: 24, position: 'relative' }}>
                    <span className="material-symbols-outlined" style={{ position: 'absolute', left: 0, top: 0, fontSize: 18, color: 'var(--success)' }}>check_circle</span>
                    {trait}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="glass-card-static" style={{ background: 'rgba(211, 47, 47, 0.1)', border: '1px solid rgba(211, 47, 47, 0.2)' }}>
              <h3 style={{ color: 'var(--error)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="material-symbols-outlined">thumb_down</span>
                Weaknesses (Bad Sides)
              </h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {profile.bad.map((trait, i) => (
                  <li key={i} style={{ marginBottom: 12, paddingLeft: 24, position: 'relative' }}>
                    <span className="material-symbols-outlined" style={{ position: 'absolute', left: 0, top: 0, fontSize: 18, color: 'var(--error)' }}>cancel</span>
                    {trait}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {!aiAnalysis && !isAnalyzing && (
            <div style={{ marginTop: 48, textAlign: 'center' }}>
              <button className="btn-primary" onClick={handleAiDeepDive} style={{ padding: '16px 32px', fontSize: 16 }}>
                <span className="material-symbols-outlined" style={{ marginRight: 8, fontSize: 20, verticalAlign: 'middle' }}>psychology</span>
                Ask AI for a Deep Dive
              </button>
              {aiError && <p style={{ color: 'var(--error)', marginTop: 16 }}>{aiError}</p>}
            </div>
          )}

          {isAnalyzing && (
            <div className="glass-card-static animate-in" style={{ marginTop: 48, textAlign: 'center', padding: 32 }}>
              <div style={{ display: 'inline-block', animation: 'spin 2s linear infinite', marginBottom: 16 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 32, color: 'var(--primary)' }}>sync</span>
              </div>
              <h3 style={{ color: 'var(--primary)', marginBottom: 8 }}>Analyzing your psychological profile...</h3>
              <p style={{ color: 'var(--on-surface-variant)' }}>The AI is generating a personalized report based on your specific answers.</p>
            </div>
          )}

          {aiAnalysis && (
            <div className="glass-card-static animate-in" style={{ marginTop: 48, padding: '40px 48px' }}>
              <h3 style={{ color: 'var(--primary)', fontSize: 24, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 28 }}>psychology</span>
                AI Personality Deep Dive
              </h3>
              <div style={{ color: 'var(--on-surface-variant)', fontSize: 16, lineHeight: 1.8, display: 'flex', flexDirection: 'column', gap: 24 }}>
                {aiAnalysis.split('\n').filter(p => p.trim()).map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))}
              </div>
            </div>
          )}

          <div style={{ marginTop: 48, textAlign: 'center' }}>
            <button className="btn-secondary" onClick={() => { setAnswers(Array(questions.length).fill(null)); setResult(null); setAiAnalysis(null); setAiError(null); }}>
              Retake Test
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="page">
      <div className="container" style={{ maxWidth: 800 }}>
        <div className="page-header" style={{ position: 'sticky', top: 0, zIndex: 10, background: 'var(--background)', paddingTop: 24, paddingBottom: 16 }}>
          <Link to="/" className="back-btn">
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_back</span>
            Back to Dashboard
          </Link>
          <h1>Personality Analysis</h1>
          <p>Answer the following questions to discover your personality type.</p>
          <div style={{ marginTop: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14 }}>
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="progress-bar-track">
              <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>

        <div className="questions-container" style={{ marginTop: 32 }}>
          {questions.map((q, index) => (
            <div key={index} className="glass-card-static" style={{ marginBottom: 24 }}>
              <p style={{ fontSize: 18, marginBottom: 24, textAlign: 'center' }}>{q.text}</p>
              <div className="likert-scale">
                <span className="likert-label">Agree</span>
                <div className="likert-options">
                  {[2, 1, 0, -1, -2].map(val => (
                    <button
                      key={val}
                      className={`likert-btn val-${val} ${answers[index] === val ? 'selected' : ''}`}
                      onClick={() => handleAnswer(index, val)}
                      aria-label={`Select option ${val}`}
                    />
                  ))}
                </div>
                <span className="likert-label">Disagree</span>
              </div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: 48, marginBottom: 64 }}>
          <button 
            className="btn-primary" 
            onClick={calculateResult} 
            disabled={!isComplete}
            style={{ padding: '16px 48px', fontSize: 18 }}
          >
            {isComplete ? "Show My Results" : "Answer all questions to continue"}
          </button>
        </div>
      </div>
    </main>
  );
}
