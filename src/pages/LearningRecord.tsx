import { useState, useEffect } from 'react'
import { Calendar as CalendarIcon, X, Edit2, Trash2 } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import { 
  getDiaryEntries, 
  addDiaryEntry, 
  updateDiaryEntry, 
  deleteDiaryEntry, 
  type DiaryEntry
} from '../lib/storage'
import './LearningRecord.css'

export default function LearningRecord() {
  const { t } = useLanguage()
  
  // Calendar 관련 상태
  const [entries, setEntries] = useState<DiaryEntry[]>([])
  const [showModal, setShowModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedEntry, setSelectedEntry] = useState<DiaryEntry | null>(null)
  const [formData, setFormData] = useState({
    type: 'speaking' as 'speaking' | 'writing' | 'reading',
    difficulty: '하',
    notes: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    const loadedEntries = getDiaryEntries()
    setEntries(loadedEntries)
  }

  // Calendar 로직
  const currentDate = new Date()
  const currentMonth = currentDate.toLocaleString('en-US', { month: 'long' })
  const currentYear = currentDate.getFullYear()

  const calendarGrid = (() => {
    const firstDay = new Date(currentYear, currentDate.getMonth(), 1).getDay()
    const daysInMonth = new Date(currentYear, currentDate.getMonth() + 1, 0).getDate()
    const weeks: (number | null)[][] = []
    let currentWeek: (number | null)[] = []
    
    for (let i = 0; i < firstDay; i++) {
      currentWeek.push(null)
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      currentWeek.push(day)
      if (currentWeek.length === 7) {
        weeks.push(currentWeek)
        currentWeek = []
      }
    }
    
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(null)
      }
      weeks.push(currentWeek)
    }
    
    return weeks
  })()

  const getEntryForDate = (day: number | null) => {
    if (day === null) return null
    const dateStr = `${currentYear}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return entries.find(e => e.date === dateStr) || null
  }

  const handleDateClick = (day: number | null) => {
    if (day === null) return
    const dateStr = `${currentYear}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const existingEntry = entries.find(e => e.date === dateStr)
    
    if (existingEntry) {
      setSelectedEntry(existingEntry)
      setFormData({
        type: existingEntry.type,
        difficulty: existingEntry.difficulty,
        notes: existingEntry.notes || ''
      })
    } else {
      setSelectedEntry(null)
      setFormData({
        type: 'speaking',
        difficulty: '하',
        notes: ''
      })
    }
    
    setSelectedDate(dateStr)
    setShowModal(true)
  }

  const handleSaveEntry = () => {
    if (!selectedDate) return

    const entryData: DiaryEntry = {
      id: selectedEntry?.id || Date.now().toString(),
      date: selectedDate,
      type: formData.type,
      difficulty: formData.difficulty,
      notes: formData.notes
    }

    if (selectedEntry) {
      updateDiaryEntry(selectedEntry.id, entryData)
    } else {
      addDiaryEntry(entryData)
    }

    setShowModal(false)
    loadData()
  }

  const handleDeleteEntry = () => {
    if (!selectedEntry) return
    deleteDiaryEntry(selectedEntry.id)
    setShowModal(false)
    loadData()
  }

  return (
    <div className="learning-record-page">
      <div className="calendar-section">
          <div className="calendar-header">
            <h2>{currentMonth} {currentYear}</h2>
          </div>
          <div className="calendar-grid">
            {['일', '월', '화', '수', '목', '금', '토'].map(day => (
              <div key={day} className="calendar-day-header">{day}</div>
            ))}
            {calendarGrid.map((week, weekIndex) =>
              week.map((day, dayIndex) => {
                const entry = getEntryForDate(day)
                return (
                  <div
                    key={`${weekIndex}-${dayIndex}`}
                    className={`calendar-day ${entry ? 'has-entry' : ''} ${day === null ? 'empty' : ''}`}
                    onClick={() => handleDateClick(day)}
                  >
                    {day}
                    {entry && (
                      <div className="entry-indicator">
                        {entry.type === 'speaking' && '🎤'}
                        {entry.type === 'writing' && '✍️'}
                        {entry.type === 'reading' && '📖'}
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>

      {/* 모달 */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{selectedEntry ? t.editRecord : t.addRecord}</h3>
            <div className="form-group">
              <label>{t.date}</label>
              <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
            </div>
            <div className="form-group">
              <label>{t.area}</label>
              <div className="checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.type === 'speaking'}
                    onChange={() => setFormData({ ...formData, type: 'speaking' })}
                  />
                  {t.speaking}
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={formData.type === 'writing'}
                    onChange={() => setFormData({ ...formData, type: 'writing' })}
                  />
                  {t.writing}
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={formData.type === 'reading'}
                    onChange={() => setFormData({ ...formData, type: 'reading' })}
                  />
                  {t.reading}
                </label>
              </div>
            </div>
            <div className="form-group">
              <label>{t.difficulty}</label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
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
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder={t.memoPlaceholder}
              />
            </div>
            <div className="modal-actions">
              <div className="modal-actions-left">
                {selectedEntry && (
                  <button onClick={handleDeleteEntry} className="btn-danger">
                    <Trash2 size={16} />
                    {t.delete}
                  </button>
                )}
                <button onClick={handleSaveEntry} className="btn-primary">
                  {t.save}
                </button>
              </div>
              <button onClick={() => setShowModal(false)} className="btn-secondary">
                {t.cancel}
              </button>
            </div>
          </div>
        </div>
    </div>
  )
}

