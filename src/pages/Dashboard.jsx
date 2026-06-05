import { Link } from 'react-router-dom';
import { useScores } from '../hooks/useScores';

const modules = [
  {
    id: 'memory',
    title: 'Memory Training',
    description: 'Advanced spatial and temporal recall exercises. Focus on number & pattern recall to expand working memory capacity.',
    icon: 'memory',
    category: 'Executive',
    categoryColor: 'var(--primary)',
    path: '/memory',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA2H4nCXJJluBqXOGxftJpXZe67BCgkaxr_1pxk8oOBfcEAc-rBvLJOczuYoI5bsQ0_Dr77YFz2kvOBuiK-AMDl2HF20zPMbk0foPGp7Ujiss2WDQf8Zkx0Xv1ybwO8rthZabHYVwWG_KmP46cFS8HkmJFYFsMoPzM8gLb-BRJi7br9ihI6ekdI0I1OnkTQMyXJ_tq0qFgp0VB2fTYBVcCF5jfMYVk8afYBymF1jGwmShEtewmsz75hIoPyMEQHAce0JhcGnQBl2iM',
    getStat: (s) => `BEST: Level ${Math.max(s.memory?.numberMemory || 0, s.memory?.patternMemory || 0, s.memory?.wordPairs || 0)}`,
  },
  {
    id: 'typing',
    title: 'Typing Speed Test',
    description: 'Real-time WPM tracking with error highlighting. Dynamic text generation based on difficulty levels.',
    icon: 'keyboard',
    category: 'Psychomotor',
    categoryColor: 'var(--secondary)',
    path: '/typing',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDsg3FeMhse8HeWJISkLMOWx6TxM8WUS6ukoLIg7qR1R8lLs3oJX8P1PdIoTtaiMoX6x2PoPHMA5JYBZ9eaUk-W_5jNEzPVDweucWFchZwmU74rDMfPte3kzgp9PwlliI57cmSoLd6uRjRQNJYTfPyND6c1XJWvW5-LU80Mm5eUjY3P4IsEjc9x3vtv85BJ-3FV1IkaPFgrrlahlGJannTiXRrZPkipV8OqZlsOkfJOwxhMfEhBD1dwTaDMBf9Fqf_F8XfM3DuLatI',
    getStat: (s) => `BEST: ${s.typing?.wpm || 0} WPM`,
  },
  {
    id: 'accent',
    title: 'Accent & Speaking Test',
    description: 'AI-powered phoneme analysis. Improve clarity, intonation, and pronunciation through interactive phrase repetition.',
    icon: 'record_voice_over',
    category: 'Linguistic',
    categoryColor: 'var(--tertiary)',
    path: '/accent',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDcVRJKko_Ak3XCWhW34BCM6x-LKniBsIkk7DX-kSctqXBnZqaDeXga-QRd2i-S71sbHYEmuZe5ewURqce9wGe5LU2QjHdjnEm5atoK8o8svovZD1zhlpel0iesGH7Fe3PpOHRe172X6C8xWQRKD_uXyEaGw21R-jSyMnV3LoBVI1kBTuxi_7uK_1mrjOi4lUwP4zk3AKzLMcd2u7-WO3TOBK-ZD2UzjV96cxX-SVv8etoXn9X2Y08rVc8dVnXgdtr5jOX53CENgaI',
    getStat: (s) => `ACC: ${s.accent?.accuracy || 0}%`,
  },
  {
    id: 'reaction',
    title: 'Reaction Time Test',
    description: 'Millisecond-precise reflex training. Respond to visual stimuli and benchmark against population averages.',
    icon: 'speed',
    category: 'Reflex',
    categoryColor: 'var(--error)',
    path: '/reaction',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC7is7vxfJFgjqiq-1ZRwChlcTgXJeR_ING9WfZVKzE0jI4wFaweqJ1uU4A7W3mzz7FPGVRYAsGI_67Mj_sh_aLeJ5utnRNgZw6aFpkKjwB-itoWLyk0jtwQJdbQXl8KJ284S3BzWcpw_AYtnMAtRYu4iDPhdEFGSQ5Y-Nm7STXRc8hFoWGgikNlWVupvh2bLaRJ2EN2nqjS2PRJdu2L5QSzgHTgpNtZSC0R1yYTnuvNMjxAjdXIIWgwBD7Z8TBq0oQDuS8YC8HGHI',
    getStat: (s) => `AVG: ${s.reaction?.avgTime || '—'}ms`,
  },
  {
    id: 'stroop',
    title: 'Focus / Attention Test',
    description: 'Sustained attention and selective filtering tasks using the Stroop effect. Identify ink colors, not words.',
    icon: 'visibility',
    category: 'Cognitive',
    categoryColor: 'var(--primary)',
    path: '/focus',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDSpra5HVjlrl_gmrYi5cMnKQfowazJ_l8uilew-2A2wC7L4Vhdbqf5crdHkhX69I8rLM8cyL6i9OIRts4_G6_v0zJqmLhP1j8XqYqwwYRHMaOV1AIltiaWgqswvMGNVAGqTHEdrlLDV8pjf6UQ69NvOvv1m4vBKetEh9oNGto0rxGMDFZIsLBNqwJc7-uo8peXcJZtQC9mrxyn7KQtDjtCZ-3VcqNlbMhuJWg6vvdY_KCUn_tiTWHaFdDXqlnyKIL0JQ-HWMnowCo',
    getStat: (s) => `FOCUS: ${s.stroop?.accuracy || 0}/100`,
  },
];

export default function Dashboard() {
  const { getScores, getBrainScore } = useScores();
  const scores = getScores();
  const brainScore = getBrainScore();

  return (
    <main className="page">
      {/* Hero */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-gradient" />
        <div className="hero-content">
          <h1 className="hero-title">NeuralGym</h1>
          <p className="hero-subtitle">
            Precision-engineered cognitive training. Elevate your mental bandwidth through high-fidelity visual and auditory modules.
          </p>
          <div style={{ marginTop: 32, display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }} className="animate-in animate-in-delay-3">
            <Link to="/memory" className="btn-primary">Start Daily Ritual</Link>
            <button className="btn-secondary" onClick={() => document.getElementById('modules-section')?.scrollIntoView({ behavior: 'smooth' })}>
              View Modules
            </button>
          </div>
        </div>
      </section>

      {/* Stats Grid */}
      <div className="container" style={{ paddingTop: 'var(--space-module)', paddingBottom: 'var(--space-module)' }}>
        <div className="stats-grid">
          <div className="glass-card-static" style={{ padding: 32, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 24 }}>
            <div>
              <h2 className="text-headline-lg" style={{ marginBottom: 8 }}>Global Performance</h2>
              <p style={{ color: 'var(--on-surface-variant)', marginBottom: 24 }}>
                {brainScore >= 70 ? 'Outstanding cognitive performance!' : brainScore >= 40 ? 'Good progress. Keep training!' : 'Complete some tests to build your score.'}
              </p>
              <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
                <div>
                  <div className="stat-label">Best WPM</div>
                  <div className="stat-value" style={{ color: 'var(--success)' }}>{scores.typing?.wpm || 0}</div>
                </div>
                <div>
                  <div className="stat-label">Reaction Avg</div>
                  <div className="stat-value">{scores.reaction?.avgTime || '—'}ms</div>
                </div>
                <div>
                  <div className="stat-label">Focus Score</div>
                  <div className="stat-value" style={{ color: 'var(--secondary)' }}>{scores.stroop?.accuracy || 0}%</div>
                </div>
              </div>
            </div>
            <div className="brain-score-circle">
              <span className="text-display-lg" style={{ color: 'var(--primary)' }}>{brainScore}</span>
              <span className="text-label-caps" style={{ color: 'var(--outline)' }}>Out of 100</span>
            </div>
          </div>

          <div className="glass-card-static" style={{ padding: 32, background: 'rgba(89, 45, 162, 0.1)' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--secondary)', fontVariationSettings: "'FILL' 1" }}>bolt</span>
              Quick Stats
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ background: 'var(--surface-container-low)', padding: 16, borderRadius: 'var(--radius-xl)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 14 }}>Memory Level</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--primary)' }}>
                    {Math.max(scores.memory?.numberMemory || 0, scores.memory?.patternMemory || 0, scores.memory?.wordPairs || 0)}
                  </span>
                </div>
                <div className="progress-bar-track">
                  <div className="progress-bar-fill" style={{ width: `${Math.min(100, Math.max(scores.memory?.numberMemory || 0, scores.memory?.patternMemory || 0) * 10)}%` }} />
                </div>
              </div>
              <div style={{ background: 'var(--surface-container-low)', padding: 16, borderRadius: 'var(--radius-xl)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 14 }}>Speaking Accuracy</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--secondary)' }}>{scores.accent?.accuracy || 0}%</span>
                </div>
                <div className="progress-bar-track">
                  <div className="progress-bar-fill" style={{ width: `${scores.accent?.accuracy || 0}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modules Grid */}
        <h2 id="modules-section" className="text-headline-lg" style={{ marginBottom: 'var(--space-gutter)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <span className="material-symbols-outlined" style={{ color: 'var(--primary)', fontSize: 28 }}>grid_view</span>
          Training Modules
        </h2>

        <div className="modules-grid">
          {modules.map((mod, i) => (
            <article key={mod.id} className={`glass-card module-card animate-in animate-in-delay-${i % 4 + 1}`}>
              <div className="module-card-image">
                <img src={mod.image} alt={mod.title} loading="lazy" />
                <div className="module-card-image-overlay" />
                <div className="module-card-badge" style={{ background: `color-mix(in srgb, ${mod.categoryColor} 20%, transparent)`, border: `1px solid color-mix(in srgb, ${mod.categoryColor} 30%, transparent)` }}>
                  <span className="material-symbols-outlined" style={{ color: mod.categoryColor, fontSize: 18 }}>{mod.icon}</span>
                  <span style={{ color: mod.categoryColor }}>{mod.category}</span>
                </div>
              </div>
              <h3>{mod.title}</h3>
              <p>{mod.description}</p>
              <div className="module-card-footer">
                <div className="module-card-stat">{mod.getStat(scores)}</div>
                <Link to={mod.path} className="btn-primary btn-sm">Start Training</Link>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer style={{
        padding: '48px var(--space-container)',
        background: 'rgba(11, 15, 16, 0.9)',
        backdropFilter: 'blur(8px)',
        borderTop: '1px solid rgba(73, 68, 84, 0.1)',
        marginTop: 64
      }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div className="logo" style={{ fontSize: 22, marginBottom: 8 }}>NeuralGym</div>
            <div className="text-label-caps" style={{ color: 'var(--on-surface-variant)' }}>© 2024 NeuralGym Cognitive Systems</div>
          </div>
          <div style={{ display: 'flex', gap: 32 }}>
            <span className="text-label-caps" style={{ color: 'rgba(203, 195, 215, 0.7)', cursor: 'pointer' }}>Privacy Policy</span>
            <span className="text-label-caps" style={{ color: 'rgba(203, 195, 215, 0.7)', cursor: 'pointer' }}>Terms of Service</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
