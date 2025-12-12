import { Link } from 'react-router-dom'
import { Mic, PenTool, BookOpen, TrendingUp, Clock, Target, User } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import './Home.css'

export default function Home() {
  const { t } = useLanguage()
  
  return (
    <div className="home">
      <div className="hero">
        <h1>Learn English with AI</h1>
        <p>{t.heroSubtitle}</p>
      </div>

      <div className="features">
        <Link to="/speaking" className="feature-card">
          <div className="icon-container speaking">
            <Mic size={40} />
          </div>
          <h2>{t.speakingTitle}</h2>
          <p>{t.speakingDesc}</p>
          <div className="feature-tags">
            <span className="tag"><Clock size={14} /> {t.timeLimit3min}</span>
            <span className="tag"><Target size={14} /> {t.aiFeedback}</span>
          </div>
        </Link>

        <Link to="/writing" className="feature-card">
          <div className="icon-container writing">
            <PenTool size={40} />
          </div>
          <h2>{t.writingTitle}</h2>
          <p>{t.writingDesc}</p>
          <div className="feature-tags">
            <span className="tag"><Clock size={14} /> {t.timeLimit10min}</span>
            <span className="tag"><Target size={14} /> {t.aiCorrection}</span>
          </div>
        </Link>

        <Link to="/reading" className="feature-card">
          <div className="icon-container reading">
            <BookOpen size={40} />
          </div>
          <h2>{t.readingTitle}</h2>
          <p>{t.readingDesc}</p>
          <div className="feature-tags">
            <span className="tag"><Clock size={14} /> {t.timePerQuestion}</span>
            <span className="tag"><Target size={14} /> {t.explanationProvided}</span>
          </div>
        </Link>

        <Link to="/learning-record" className="feature-card">
          <div className="icon-container mypage">
            <User size={40} />
          </div>
          <h2>{t.learningRecordAndMypage || '학습 기록'}</h2>
          <p>{t.learningRecordAndMypageDesc || '학습 기록을 관리하고 통계를 확인하세요'}</p>
          <div className="feature-tags">
            <span className="tag"><TrendingUp size={14} /> {t.statistics}</span>
            <span className="tag"><Target size={14} /> {t.analysis}</span>
          </div>
        </Link>
      </div>

      <div className="stats">
        <div className="stat-card">
          <TrendingUp size={32} />
          <div>
            <h3>{t.academicApproach}</h3>
            <p>{t.systematicCurriculum}</p>
          </div>
        </div>
        <div className="stat-card">
          <Clock size={32} />
          <div>
            <h3>{t.timeLimit}</h3>
            <p>{t.realWorldPractice}</p>
          </div>
        </div>
        <div className="stat-card">
          <Target size={32} />
          <div>
            <h3>{t.personalizedFeedback}</h3>
            <p>{t.aiTutorGuidance}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
