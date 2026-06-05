import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useScores } from '../hooks/useScores';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { getBrainScore } = useScores();
  const { user, logout } = useAuth();
  const brainScore = getBrainScore();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navLinks = [
    { path: '/', label: 'Dashboard' },
    { path: '/memory', label: 'Memory' },
    { path: '/typing', label: 'Typing' },
    { path: '/accent', label: 'Speaking' },
    { path: '/reaction', label: 'Reaction' },
    { path: '/focus', label: 'Focus' },
  ];

  return (
    <header className="header">
      <div className="header-inner">
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          <Link to="/" className="logo">NeuralGym</Link>
          <nav style={{ display: 'flex', alignItems: 'center', gap: '24px' }} className="desktop-nav">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div className="brain-score-badge">
            <span className="material-symbols-outlined" style={{ color: 'var(--primary)', fontSize: '20px', fontVariationSettings: "'FILL' 1" }}>
              psychology
            </span>
            <span className="text-brain-score" style={{ color: 'var(--primary)' }}>
              Brain Score: {brainScore}
            </span>
          </div>
          
          {user ? (
            <button onClick={handleLogout} className="btn-primary" style={{ padding: '8px 16px', background: 'transparent', border: '1px solid var(--outline)', color: 'var(--on-surface)' }}>
              Sign Out
            </button>
          ) : (
            <Link to="/login" className="btn-primary" style={{ padding: '8px 16px', textDecoration: 'none' }}>
              Sign In
            </Link>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .desktop-nav { display: none !important; }
        }
      `}</style>
    </header>
  );
}
