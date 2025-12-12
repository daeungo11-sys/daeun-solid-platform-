import { BrowserRouter as Router, Routes, Route, NavLink, Navigate, Link, useLocation } from 'react-router-dom'
import { LanguageProvider, useLanguage } from './contexts/LanguageContext'
import { ThemeProvider, useTheme } from './contexts/ThemeContext'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Home from './pages/Home'
import Speaking from './pages/Speaking'
import Writing from './pages/Writing'
import Reading from './pages/Reading'
import LearningRecord from './pages/LearningRecord'
import { Mic, PenTool, BookOpen, User } from 'lucide-react'
import './App.css'

function Navbar() {
  const { t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage } = useLanguage();

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="logo">
          <Mic size={28} />
          <h1>{t.mainTitle}</h1>
        </Link>
        <div className="nav-links">
          <NavLink to="/speaking" className={({ isActive }) => isActive ? 'active' : ''}>
            <Mic size={20} />
            <span>{t.speaking}</span>
          </NavLink>
          <NavLink to="/writing" className={({ isActive }) => isActive ? 'active' : ''}>
            <PenTool size={20} />
            <span>{t.writing}</span>
          </NavLink>
          <NavLink to="/reading" className={({ isActive }) => isActive ? 'active' : ''}>
            <BookOpen size={20} />
            <span>{t.reading}</span>
          </NavLink>
          <NavLink to="/learning-record" className={({ isActive }) => isActive ? 'active' : ''}>
            <User size={20} />
            <span>{t.learningRecord || '학습 기록'}</span>
          </NavLink>
        </div>
      </div>
    </nav>
  );
}

function AppContent() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/speaking" element={<Speaking />} />
            <Route path="/writing" element={<Writing />} />
            <Route path="/reading" element={<Reading />} />
            <Route path="/learning-record" element={<LearningRecord />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  )
}

export default App
