import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import MemoryTraining from './pages/MemoryTraining';
import TypingTest from './pages/TypingTest';
import AccentTest from './pages/AccentTest';
import ReactionTest from './pages/ReactionTest';
import StroopTest from './pages/StroopTest';
import Auth from './pages/Auth';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app-container">
          <Header />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/login" element={<Auth />} />
            <Route path="/memory" element={<MemoryTraining />} />
            <Route path="/typing" element={<TypingTest />} />
            <Route path="/accent" element={<AccentTest />} />
            <Route path="/reaction" element={<ReactionTest />} />
            <Route path="/focus" element={<StroopTest />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
