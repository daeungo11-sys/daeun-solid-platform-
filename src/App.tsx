import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom'
import { LanguageProvider, useLanguage } from './contexts/LanguageContext'
import { ThemeProvider, useTheme } from './contexts/ThemeContext'
import Home from './pages/Home'
import Speaking from './pages/Speaking'
import Writing from './pages/Writing'
import Reading from './pages/Reading'
import Calendar from './pages/Calendar'
import LevelTest from './pages/LevelTest'
import MyPage from './pages/MyPage'
import AIFeedback from './pages/AIFeedback'
import Correction from './pages/Correction'
import Simulator from './pages/Simulator'
import Vocabulary from './pages/Vocabulary'
import AICoach from './pages/AICoach'
import { Home as HomeIcon, Mic, PenTool, BookOpen, Calendar as CalendarIcon, ClipboardCheck, User, Sparkles, Languages, Moon, Sun, MessageSquare, BookOpenText } from 'lucide-react'
import './App.css'

function Navbar() {
  const { t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage } = useLanguage();

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="logo">
          <Mic size={28} />
          <h1>{t.mainTitle}</h1>
        </div>
        <div className="nav-links">
          <NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''}>
            <HomeIcon size={20} />
            <span>{t.home}</span>
          </NavLink>
          <NavLink to="/level-test" className={({ isActive }) => isActive ? 'active' : ''}>
            <ClipboardCheck size={20} />
            <span>{t.levelTest}</span>
          </NavLink>
          <NavLink to="/correction" className={({ isActive }) => isActive ? 'active' : ''}>
            <PenTool size={20} />
            <span>{t.correction}</span>
          </NavLink>
          <NavLink to="/speaking" className={({ isActive }) => isActive ? 'active' : ''}>
            <Mic size={20} />
            <span>말하기</span>
          </NavLink>
          <NavLink to="/writing" className={({ isActive }) => isActive ? 'active' : ''}>
            <PenTool size={20} />
            <span>쓰기</span>
          </NavLink>
          <NavLink to="/reading" className={({ isActive }) => isActive ? 'active' : ''}>
            <BookOpen size={20} />
            <span>읽기</span>
          </NavLink>
          <NavLink to="/simulator" className={({ isActive }) => isActive ? 'active' : ''}>
            <MessageSquare size={20} />
            <span>{t.simulator}</span>
          </NavLink>
          <NavLink to="/vocabulary" className={({ isActive }) => isActive ? 'active' : ''}>
            <BookOpenText size={20} />
            <span>{t.vocabulary}</span>
          </NavLink>
          <NavLink to="/ai-coach" className={({ isActive }) => isActive ? 'active' : ''}>
            <Sparkles size={20} />
            <span>{t.aiCoach}</span>
          </NavLink>
          <NavLink to="/calendar" className={({ isActive }) => isActive ? 'active' : ''}>
            <CalendarIcon size={20} />
            <span>학습 기록</span>
          </NavLink>
          <NavLink to="/mypage" className={({ isActive }) => isActive ? 'active' : ''}>
            <User size={20} />
            <span>{t.mypage}</span>
          </NavLink>
        </div>
        <div className="nav-controls">
          <div className="language-selector">
            <Languages size={18} />
            <select value={language} onChange={(e) => setLanguage(e.target.value as any)}>
              <option value="ko">한국어</option>
              <option value="en">English</option>
              <option value="ja">日本語</option>
              <option value="zh">中文</option>
            </select>
          </div>
          <button onClick={toggleTheme} className="theme-toggle" title={theme === 'dark' ? '라이트 모드' : '다크 모드'}>
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
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
            <Route path="/level-test" element={<LevelTest />} />
            <Route path="/correction" element={<Correction />} />
            <Route path="/speaking" element={<Speaking />} />
            <Route path="/writing" element={<Writing />} />
            <Route path="/reading" element={<Reading />} />
            <Route path="/simulator" element={<Simulator />} />
            <Route path="/vocabulary" element={<Vocabulary />} />
            <Route path="/ai-coach" element={<AICoach />} />
            <Route path="/ai-feedback" element={<AIFeedback />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/mypage" element={<MyPage />} />
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
        <AppContent />
      </LanguageProvider>
    </ThemeProvider>
  )
}

export default App
