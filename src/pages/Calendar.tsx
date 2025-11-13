import { useState, useMemo } from 'react'
import { Calendar as CalendarIcon, Flag, Edit2, Trash2 } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import './Calendar.css'

interface DiaryEntry {
  id: string
  date: string
  type: 'speaking' | 'writing' | 'reading'
  difficulty: string
  notes: string
}

export default function Calendar() {
  const { t } = useLanguage()
  const [entries, setEntries] = useState<DiaryEntry[]>([
    {
      id: '1',
      date: '2024-01-15',
      type: 'speaking',
      difficulty: '중',
      notes: '발음 교정이 필요합니다. 특히 r과 l 구분이 어렵습니다.'
    },
    {
      id: '2',
      date: '2024-01-16',
      type: 'reading',
      difficulty: '상',
      notes: '토익 지문 이해도 향상. 어휘 확장이 필요합니다.'
    }
  ])
  
  const [showModal, setShowModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedEntry, setSelectedEntry] = useState<DiaryEntry | null>(null)
  
  const [formData, setFormData] = useState({
    type: 'speaking' as 'speaking' | 'writing' | 'reading',
    difficulty: '하',
    notes: ''
  })

  const currentDate = new Date()
  const [currentMonth] = useState(currentDate.toLocaleString('en-US', { month: 'long' }))
  const currentYear = currentDate.getFullYear()

  // Generate calendar grid dynamically
  const calendarGrid = useMemo(() => {
    const firstDay = new Date(currentYear, currentDate.getMonth(), 1).getDay()
    const daysInMonth = new Date(currentYear, currentDate.getMonth() + 1, 0).getDate()
    const weeks: (number | null)[][] = []
    let currentWeek: (number | null)[] = []
    
    // Add empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      currentWeek.push(null)
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      currentWeek.push(day)
      if (currentWeek.length === 7) {
        weeks.push(currentWeek)
        currentWeek = []
      }
    }
    
    // Add remaining empty cells at the end
    if (currentWeek.length > 0) {
      weeks.push(currentWeek)
    }
    
    return weeks
  }, [currentYear, currentMonth])

  const handleDateClick = (date: number | null) => {
    if (!date) return
    const fullDate = `${currentYear}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`
    setSelectedDate(fullDate)
    setShowModal(true)
    setFormData({ type: 'speaking', difficulty: '하', notes: '' })
    setSelectedEntry(null)
  }

  const handleSaveEntry = () => {
    if (selectedEntry) {
      setEntries(entries.map(e => 
        e.id === selectedEntry.id 
          ? { ...selectedEntry, ...formData }
          : e
      ))
    } else {
      const newEntry: DiaryEntry = {
        id: Date.now().toString(),
        date: selectedDate,
        ...formData
      }
      setEntries([...entries, newEntry])
    }
    setShowModal(false)
  }

  const handleDeleteEntry = (id: string) => {
    setEntries(entries.filter(e => e.id !== id))
  }

  const handleEditEntry = (entry: DiaryEntry) => {
    setSelectedEntry(entry)
    setFormData({
      type: entry.type,
      difficulty: entry.difficulty,
      notes: entry.notes
    })
    setShowModal(true)
  }

  const getEntryForDate = (date: number) => {
    const fullDate = `${currentYear}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`
    return entries.find(e => e.date === fullDate)
  }

  const getTypeColor = (type: string) => {
    switch(type) {
      case 'speaking': return '#6366f1'
      case 'writing': return '#f59e0b'
      case 'reading': return '#10b981'
      default: return '#6b7280'
    }
  }

  const getTypeLabel = (type: string) => {
    switch(type) {
      case 'speaking': return t.speaking
      case 'writing': return t.writing
      case 'reading': return t.reading
      default: return type
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch(difficulty) {
      case '하': return '#10b981'
      case '중': return '#f59e0b'
      case '상': return '#ef4444'
      default: return '#6b7280'
    }
  }

  return (
    <div className="calendar-page">
      <div className="page-header">
        <h1>{t.calendarPageTitle}</h1>
        <p>{t.calendarPageDesc}</p>
      </div>
      
      <div className="calendar-encouragement-banner">
        {t.calendarEncouragement}
      </div>

      <div className="calendar-container">
        <div className="calendar-section">
          <div className="calendar-header">
            <h2>{currentYear}년 {currentMonth}</h2>
          </div>

          <div className="calendar-grid">
            <div className="weekdays">
              <div>{t.sunday}</div>
              <div>{t.monday}</div>
              <div>{t.tuesday}</div>
              <div>{t.wednesday}</div>
              <div>{t.thursday}</div>
              <div>{t.friday}</div>
              <div>{t.saturday}</div>
            </div>

            {calendarGrid.map((week, weekIndex) => (
              <div key={weekIndex} className="week-row">
                {week.map((date, dateIndex) => {
                  const entry = date ? getEntryForDate(date) : null
                  return (
                    <div
                      key={dateIndex}
                      className={`calendar-day ${!date ? 'empty' : ''} ${entry ? 'has-entry' : ''}`}
                      onClick={() => handleDateClick(date)}
                    >
                      {date && (
                        <>
                          <span className="day-number">{date}</span>
                          {entry && (
                            <div 
                              className="entry-indicator"
                              style={{ backgroundColor: getTypeColor(entry.type) }}
                            />
                          )}
                        </>
                      )}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>

        <div className="entries-section">
          <h2>{t.recordList}</h2>
          {entries.length === 0 ? (
            <div className="empty-state">
              <CalendarIcon size={48} />
              <p>{t.noRecords}</p>
              <p className="hint">{t.clickDateToAdd}</p>
            </div>
          ) : (
            <div className="entries-list">
              {entries.map(entry => (
                <div key={entry.id} className="entry-card">
                  <div className="entry-header">
                    <div className="entry-type" style={{ borderLeftColor: getTypeColor(entry.type) }}>
                      <span className="type-label">{getTypeLabel(entry.type)}</span>
                    </div>
                    <div className="entry-actions">
                      <button onClick={() => handleEditEntry(entry)} className="edit-btn">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDeleteEntry(entry.id)} className="delete-btn">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="entry-date">{entry.date}</div>
                  <div className="entry-difficulty">
                    <Flag size={14} />
                    <span style={{ color: getDifficultyColor(entry.difficulty) }}>
                      {t.difficultyLabel} {entry.difficulty}
                    </span>
                  </div>
                  <p className="entry-notes">{entry.notes}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{t.learningRecord} {selectedEntry ? t.editRecord : t.addRecord}</h3>
            
            <div className="form-group">
              <label>{t.date}</label>
              <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
            </div>

            <div className="form-group">
              <label>{t.area}</label>
              <div className="radio-group">
                <label>
                  <input 
                    type="radio" 
                    value="speaking" 
                    checked={formData.type === 'speaking'} 
                    onChange={(e) => setFormData({...formData, type: e.target.value as 'speaking'})}
                  />
                  <span className="radio-label speaking">{t.speaking}</span>
                </label>
                <label>
                  <input 
                    type="radio" 
                    value="writing" 
                    checked={formData.type === 'writing'} 
                    onChange={(e) => setFormData({...formData, type: e.target.value as 'writing'})}
                  />
                  <span className="radio-label writing">{t.writing}</span>
                </label>
                <label>
                  <input 
                    type="radio" 
                    value="reading" 
                    checked={formData.type === 'reading'} 
                    onChange={(e) => setFormData({...formData, type: e.target.value as 'reading'})}
                  />
                  <span className="radio-label reading">{t.reading}</span>
                </label>
              </div>
            </div>

            <div className="form-group">
              <label>{t.difficulty}</label>
              <select 
                value={formData.difficulty} 
                onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
              >
                <option value="하">하</option>
                <option value="중">중</option>
                <option value="상">상</option>
              </select>
            </div>

            <div className="form-group">
              <label>{t.memo}</label>
              <textarea 
                value={formData.notes} 
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder={t.memoPlaceholder}
                rows={5}
              />
            </div>

            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowModal(false)}>
                {t.cancel}
              </button>
              <button className="btn-save" onClick={handleSaveEntry}>
                {t.save}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
