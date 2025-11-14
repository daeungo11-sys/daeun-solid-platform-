import { BrowserRouter as Router, Routes, Route, NavLink, Navigate } from 'react-router-dom'
import { LanguageProvider, useLanguage } from './contexts/LanguageContext'
import { ThemeProvider, useTheme } from './contexts/ThemeContext'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Home from './pages/Home'
import Speaking from './pages/Speaking'
import Writing from './pages/Writing'
import Reading from './pages/Reading'
import Calendar from './pages/Calendar'
import LevelTest from './pages/LevelTest'
import MyPage from './pages/MyPage'
import Correction from './pages/Correction'
import Simulator from './pages/Simulator'
import Vocabulary from './pages/Vocabulary'
import AICoach from './pages/AICoach'
import Login from './pages/Login'
import { Home as HomeIcon, Mic, PenTool, BookOpen, Calendar as CalendarIcon, ClipboardCheck, User, Sparkles, Languages, Moon, Sun, MessageSquare, BookOpenText, LogOut } from 'lucide-react'
import './App.css'

function Navbar() {
  const { t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const { isAuthenticated, nickname, logout } = useAuth();

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
            <span>{t.learningRecord}</span>
          </NavLink>
          <NavLink to="/mypage" className={({ isActive }) => isActive ? 'active' : ''}>
            <User size={20} />
            <span>{t.mypage}</span>
          </NavLink>
        </div>
        <div className="nav-controls">
          {isAuthenticated && nickname && (
            <div className="user-info">
              <User size={16} />
              <span className="nickname">{nickname}</span>
            </div>
          )}
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
          {isAuthenticated && (
            <button onClick={logout} className="logout-button" title={t.logout || '로그아웃'}>
              <LogOut size={18} />
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

// 보호된 라우트 컴포넌트
function ProtectedRoute({ children }: { children: React.ReactElement }) {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

function AppContent() {
  const { isAuthenticated } = useAuth();

  return (
    <Router>
      <div className="app">
        {isAuthenticated && <Navbar />}
        <main className="main-content">
          <Routes>
            <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} />
            <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/level-test" element={<ProtectedRoute><LevelTest /></ProtectedRoute>} />
            <Route path="/correction" element={<ProtectedRoute><Correction /></ProtectedRoute>} />
            <Route path="/speaking" element={<ProtectedRoute><Speaking /></ProtectedRoute>} />
            <Route path="/writing" element={<ProtectedRoute><Writing /></ProtectedRoute>} />
            <Route path="/reading" element={<ProtectedRoute><Reading /></ProtectedRoute>} />
            <Route path="/simulator" element={<ProtectedRoute><Simulator /></ProtectedRoute>} />
            <Route path="/vocabulary" element={<ProtectedRoute><Vocabulary /></ProtectedRoute>} />
            <Route path="/ai-coach" element={<ProtectedRoute><AICoach /></ProtectedRoute>} />
            <Route path="/calendar" element={<ProtectedRoute><Calendar /></ProtectedRoute>} />
            <Route path="/mypage" element={<ProtectedRoute><MyPage /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />} />
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
