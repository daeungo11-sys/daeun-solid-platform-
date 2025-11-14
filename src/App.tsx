import { BrowserRouter as Router, Routes, Route, NavLink, Navigate, Link, useLocation } from 'react-router-dom'
import { LanguageProvider, useLanguage } from './contexts/LanguageContext'
import { ThemeProvider, useTheme } from './contexts/ThemeContext'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Home from './pages/Home'
import Speaking from './pages/Speaking'
import Writing from './pages/Writing'
import Reading from './pages/Reading'
import LearningRecord from './pages/LearningRecord'
import LevelTest from './pages/LevelTest'
import Correction from './pages/Correction'
import Simulator from './pages/Simulator'
import Vocabulary from './pages/Vocabulary'
import AICoach from './pages/AICoach'
import Login from './pages/Login'
import DropdownMenu from './components/DropdownMenu'
import { Home as HomeIcon, Mic, PenTool, BookOpen, Calendar as CalendarIcon, ClipboardCheck, User, Sparkles, MessageSquare, BookOpenText } from 'lucide-react'
import './App.css'

function Navbar() {
  const { t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const { isAuthenticated, nickname, logout } = useAuth();
  const location = useLocation();

  // 현재 경로가 드롭다운 옵션 중 하나인지 확인
  const isWritingOrCorrection = location.pathname === '/writing' || location.pathname === '/correction';
  const isSpeakingOrSimulator = location.pathname === '/speaking' || location.pathname === '/simulator';

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="logo">
          <Mic size={28} />
          <h1>{t.mainTitle}</h1>
        </Link>
        <div className="nav-links">
          <NavLink to="/level-test" className={({ isActive }) => isActive ? 'active' : ''}>
            <ClipboardCheck size={20} />
            <span>{t.levelTest}</span>
          </NavLink>
          <DropdownMenu
            label={t.writingAndCorrection || '쓰기/교정'}
            icon={<PenTool size={20} />}
            options={[
              { path: '/writing', label: t.writing, icon: <PenTool size={18} /> },
              { path: '/correction', label: t.correction, icon: <PenTool size={18} /> }
            ]}
            isActive={isWritingOrCorrection}
          />
          <DropdownMenu
            label={t.speakingAndSimulator || '말하기/회화'}
            icon={<Mic size={20} />}
            options={[
              { path: '/speaking', label: t.speaking, icon: <Mic size={18} /> },
              { path: '/simulator', label: t.simulator, icon: <MessageSquare size={18} /> }
            ]}
            isActive={isSpeakingOrSimulator}
          />
          <NavLink to="/reading" className={({ isActive }) => isActive ? 'active' : ''}>
            <BookOpen size={20} />
            <span>{t.reading}</span>
          </NavLink>
          <NavLink to="/vocabulary" className={({ isActive }) => isActive ? 'active' : ''}>
            <BookOpenText size={20} />
            <span>{t.vocabulary}</span>
          </NavLink>
          <NavLink to="/ai-coach" className={({ isActive }) => isActive ? 'active' : ''}>
            <Sparkles size={20} />
            <span>{t.aiCoach}</span>
          </NavLink>
          <NavLink to="/learning-record" className={({ isActive }) => isActive ? 'active' : ''}>
            <User size={20} />
            <span>{t.learningRecordAndMypage || '학습 기록/마이페이지'}</span>
          </NavLink>
        </div>
        <div className="nav-controls">
          {isAuthenticated && nickname && (
            <div className="user-info">
              <User size={16} />
              <span className="nickname">{nickname}</span>
            </div>
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
            <Route path="/learning-record" element={<ProtectedRoute><LearningRecord /></ProtectedRoute>} />
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
