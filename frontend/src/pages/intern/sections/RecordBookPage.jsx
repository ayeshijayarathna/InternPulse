import { useState, useEffect, useCallback } from 'react';
import {
  FiBook, FiCalendar, FiPlus, FiCheck, FiTrash2, FiDownload,
  FiClock, FiSmile, FiFileText, FiChevronLeft, FiChevronRight,
  FiEdit3, FiTarget, FiTrendingUp, FiSun, FiMoon, FiZap, FiFrown
} from 'react-icons/fi';
import axiosInstance from '../../../api/axiosInstance';
import { useAuth } from '../../../context/AuthContext';

const MOODS = [
  { value: 'great',   label: 'Great',   icon: FiSun,     color: '#22c55e' },
  { value: 'good',    label: 'Good',    icon: FiSmile,   color: '#3b82f6' },
  { value: 'okay',    label: 'Okay',    icon: FiMoon,    color: '#f59e0b' },
  { value: 'tired',   label: 'Tired',   icon: FiZap,     color: '#f97316' },
  { value: 'stressed',label: 'Stressed',icon: FiFrown,   color: '#ef4444' },
];

const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export default function RecordBookPage() {
  const { user } = useAuth();
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(today);
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [record, setRecord] = useState(null);
  const [monthData, setMonthData] = useState({});
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newTask, setNewTask] = useState('');
  const [notes, setNotes] = useState('');
  const [summary, setSummary] = useState('');
  const [mood, setMood] = useState('good');
  const [officeStart, setOfficeStart] = useState('09:00');
  const [officeEnd, setOfficeEnd] = useState('17:00');

  const formatDate = (d) => d.toISOString().split('T')[0];

  const fetchRecord = useCallback(async (date) => {
    try {
      const res = await axiosInstance.get(`/record-book/${formatDate(date)}`);
      if (res.data) {
        setRecord(res.data);
        setNotes(res.data.notes || '');
        setSummary(res.data.summary || '');
        setMood(res.data.mood || 'good');
        setOfficeStart(res.data.officeHours?.start || '09:00');
        setOfficeEnd(res.data.officeHours?.end || '17:00');
      } else {
        setRecord(null);
        setNotes('');
        setSummary('');
        setMood('good');
        setOfficeStart('09:00');
        setOfficeEnd('17:00');
      }
    } catch { setRecord(null); }
  }, []);

  const fetchMonth = useCallback(async (year, month) => {
    try {
      const res = await axiosInstance.get(`/record-book/month/${year}/${month + 1}`);
      setMonthData(res.data);
    } catch { setMonthData({}); }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const res = await axiosInstance.get('/record-book/stats');
      setStats(res.data);
    } catch {}
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchRecord(selectedDate), fetchMonth(calYear, calMonth), fetchStats()])
      .finally(() => setLoading(false));
  }, [selectedDate, calYear, calMonth, fetchRecord, fetchMonth, fetchStats]);

  const handleSelectDate = (day) => {
    const d = new Date(calYear, calMonth, day);
    setSelectedDate(d);
  };

  const handlePrevMonth = () => {
    if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); }
    else setCalMonth(m => m - 1);
  };

  const handleNextMonth = () => {
    if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); }
    else setCalMonth(m => m + 1);
  };

  const handleAddTask = async () => {
    if (!newTask.trim()) return;
    const tasks = [...(record?.tasks || []), { text: newTask.trim(), completed: false }];
    await saveRecord({ tasks });
    setNewTask('');
  };

  const handleToggleTask = async (taskId) => {
    if (!record) return;
    try {
      const res = await axiosInstance.patch(`/record-book/${record._id}/task/${taskId}`);
      setRecord(res.data);
    } catch {}
  };

  const handleDeleteTask = async (taskId) => {
    if (!record) return;
    try {
      const res = await axiosInstance.delete(`/record-book/${record._id}/task/${taskId}`);
      setRecord(res.data);
    } catch {}
  };

  const saveRecord = async (extra = {}) => {
    setSaving(true);
    try {
      const payload = {
        date: formatDate(selectedDate),
        tasks: record?.tasks || [],
        notes,
        summary,
        mood,
        officeHours: { start: officeStart, end: officeEnd },
        ...extra,
      };
      const res = await axiosInstance.post('/record-book', payload);
      setRecord(res.data);
      fetchMonth(calYear, calMonth);
      fetchStats();
    } catch {} finally { setSaving(false); }
  };

  const handleSaveNotes = () => saveRecord();
  const handleSaveSummary = () => saveRecord();

  const handleExportPDF = async () => {
    try {
      const token = localStorage.getItem('token');
      const url = `${axiosInstance.defaults.baseURL}/record-book/export/${formatDate(selectedDate)}`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Failed to download');
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `record_${formatDate(selectedDate)}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('PDF download failed:', err);
    }
  };

  const isToday = formatDate(selectedDate) === formatDate(today);
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const firstDay = new Date(calYear, calMonth, 1).getDay();
  const selectedRecordTasks = record?.tasks || [];
  const completedTasks = selectedRecordTasks.filter(t => t.completed);
  const pendingTasks = selectedRecordTasks.filter(t => !t.completed);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 rounded-full border-2 animate-spin"
             style={{ borderColor: 'var(--intern-primary)', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
            Record Book
          </h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            Track your daily activities and progress
          </p>
        </div>
        <button onClick={handleExportPDF}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white transition-all hover:scale-105"
                style={{ background: 'linear-gradient(135deg, var(--intern-primary), var(--intern-secondary))' }}>
          <FiDownload className="w-4 h-4" /> Download Record
        </button>
      </div>

      {/* Internship period + stats */}
      {user?.internshipStart && (
        <div className="rounded-2xl border p-4 flex items-center gap-4 flex-wrap"
             style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <FiCalendar className="w-5 h-5" style={{ color: 'var(--intern-primary)' }} />
          <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            <span className="font-semibold text-white">Internship Period: </span>
            {new Date(user.internshipStart).toLocaleDateString()} - {user.internshipEnd ? new Date(user.internshipEnd).toLocaleDateString() : 'Present'}
          </div>
          {stats && (
            <div className="flex items-center gap-4 ml-auto">
              <span className="text-xs px-2 py-1 rounded-lg" style={{ background: 'rgba(139,92,246,0.1)', color: '#8b5cf6' }}>
                {stats.totalDays} days logged
              </span>
              <span className="text-xs px-2 py-1 rounded-lg" style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e' }}>
                {stats.completionRate}% completion
              </span>
              <span className="text-xs px-2 py-1 rounded-lg" style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b' }}>
                {stats.streak} day streak 🔥
              </span>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Calendar */}
        <div className="space-y-6">
          {/* Calendar */}
          <div className="rounded-2xl border overflow-hidden"
               style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
            <div className="px-4 py-3 border-b flex items-center justify-between"
                 style={{ borderColor: 'var(--border)' }}>
              <button onClick={handlePrevMonth} className="p-1 rounded hover:bg-white/5">
                <FiChevronLeft className="w-4 h-4 text-white" />
              </button>
              <h3 className="font-bold text-white text-sm" style={{ fontFamily: 'var(--font-display)' }}>
                {MONTHS[calMonth]} {calYear}
              </h3>
              <button onClick={handleNextMonth} className="p-1 rounded hover:bg-white/5">
                <FiChevronRight className="w-4 h-4 text-white" />
              </button>
            </div>
            <div className="p-3">
              <div className="grid grid-cols-7 gap-1 mb-2">
                {DAYS.map(d => (
                  <div key={d} className="text-center text-[10px] font-semibold py-1"
                       style={{ color: 'var(--text-muted)' }}>{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const dateStr = formatDate(new Date(calYear, calMonth, day));
                  const isSelected = formatDate(selectedDate) === dateStr;
                  const isTodayDate = dateStr === formatDate(today);
                  const dayData = monthData[dateStr];
                  return (
                    <button key={day} onClick={() => handleSelectDate(day)}
                            className="relative aspect-square rounded-lg flex flex-col items-center justify-center text-xs font-medium transition-all"
                            style={{
                              background: isSelected ? 'linear-gradient(135deg, var(--intern-primary), var(--intern-secondary))' : 'transparent',
                              color: isSelected ? '#fff' : isTodayDate ? 'var(--intern-primary)' : 'var(--text-secondary)',
                              border: isTodayDate && !isSelected ? '1px solid var(--intern-primary)' : 'none',
                            }}>
                      {day}
                      {dayData?.hasRecord && (
                        <div className="absolute bottom-0.5 flex gap-0.5">
                          {dayData.completedCount > 0 && <div className="w-1 h-1 rounded-full bg-green-400" />}
                          {dayData.hasNotes && <div className="w-1 h-1 rounded-full bg-blue-400" />}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Stats Card */}
          {stats && (
            <div className="rounded-2xl border p-5"
                 style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
              <h3 className="font-bold text-white text-sm mb-4" style={{ fontFamily: 'var(--font-display)' }}>
                Overall Stats
              </h3>
              <div className="space-y-3">
                {[
                  { label: 'Total Days Logged', value: stats.totalDays, color: '#8b5cf6' },
                  { label: 'Total Tasks', value: stats.totalTasks, color: '#3b82f6' },
                  { label: 'Completed Tasks', value: stats.completedTasks, color: '#22c55e' },
                  { label: 'Completion Rate', value: `${stats.completionRate}%`, color: '#f59e0b' },
                ].map(s => (
                  <div key={s.label} className="flex items-center justify-between">
                    <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{s.label}</span>
                    <span className="text-sm font-bold" style={{ color: s.color }}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Daily Record */}
        <div className="lg:col-span-2 space-y-6">
          {/* Date header + mood */}
          <div className="rounded-2xl border p-5"
               style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h3 className="font-bold text-white text-lg" style={{ fontFamily: 'var(--font-display)' }}>
                  {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                </h3>
                {isToday && <span className="text-xs font-semibold px-2 py-0.5 rounded-full mt-1 inline-block"
                                   style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e' }}>Today</span>}
              </div>
              <div className="flex items-center gap-2">
                <FiClock className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                <input type="time" value={officeStart} onChange={e => setOfficeStart(e.target.value)}
                       className="text-xs px-2 py-1 rounded-lg outline-none"
                       style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }} />
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>-</span>
                <input type="time" value={officeEnd} onChange={e => setOfficeEnd(e.target.value)}
                       className="text-xs px-2 py-1 rounded-lg outline-none"
                       style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }} />
              </div>
            </div>
            {/* Mood selector */}
            <div className="flex items-center gap-2 mt-4">
              <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Mood:</span>
              {MOODS.map(m => {
                const Icon = m.icon;
                return (
                  <button key={m.value} onClick={() => { setMood(m.value); saveRecord({ mood: m.value }); }}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
                          style={{
                            background: mood === m.value ? `${m.color}22` : 'transparent',
                            color: mood === m.value ? m.color : 'var(--text-muted)',
                            border: mood === m.value ? `1px solid ${m.color}44` : '1px solid transparent',
                          }}>
                    <Icon className="w-3.5 h-3.5" /> {m.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* To-Do / Done List */}
          <div className="rounded-2xl border overflow-hidden"
               style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
            <div className="px-5 py-4 border-b flex items-center gap-2"
                 style={{ borderColor: 'var(--border)' }}>
              <FiTarget className="w-4 h-4" style={{ color: 'var(--intern-primary)' }} />
              <h3 className="font-bold text-white text-sm" style={{ fontFamily: 'var(--font-display)' }}>
                Tasks ({completedTasks.length}/{selectedRecordTasks.length})
              </h3>
            </div>
            <div className="p-5">
              {/* Add task input */}
              <div className="flex gap-2 mb-4">
                <input type="text" value={newTask} onChange={e => setNewTask(e.target.value)}
                       onKeyDown={e => e.key === 'Enter' && handleAddTask()}
                       placeholder="Add a new task..."
                       className="flex-1 px-4 py-2.5 rounded-xl text-sm text-white placeholder-slate-500 outline-none"
                       style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }} />
                <button onClick={handleAddTask}
                        className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:scale-105"
                        style={{ background: 'linear-gradient(135deg, var(--intern-primary), var(--intern-secondary))' }}>
                  <FiPlus className="w-4 h-4" />
                </button>
              </div>

              {/* Pending tasks */}
              {pendingTasks.length > 0 && (
                <div className="mb-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider mb-2"
                     style={{ color: 'var(--text-muted)' }}>To Do</p>
                  <div className="space-y-2">
                    {pendingTasks.map(task => (
                      <div key={task._id}
                           className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:bg-white/5"
                           style={{ background: 'var(--bg-surface)' }}>
                        <button onClick={() => handleToggleTask(task._id)}
                                className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all hover:border-green-400"
                                style={{ borderColor: 'var(--border)' }}>
                          {task.completed && <FiCheck className="w-3 h-3 text-green-400" />}
                        </button>
                        <span className="text-sm text-white flex-1">{task.text}</span>
                        <button onClick={() => handleDeleteTask(task._id)}
                                className="p-1 rounded hover:bg-red-500/10 text-red-400 opacity-0 group-hover:opacity-100">
                          <FiTrash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Completed tasks */}
              {completedTasks.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider mb-2"
                     style={{ color: 'var(--text-muted)' }}>Done</p>
                  <div className="space-y-2">
                    {completedTasks.map(task => (
                      <div key={task._id}
                           className="flex items-center gap-3 px-4 py-3 rounded-xl"
                           style={{ background: 'var(--bg-surface)', opacity: 0.7 }}>
                        <button onClick={() => handleToggleTask(task._id)}
                                className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                                style={{ background: 'rgba(34,197,94,0.2)' }}>
                          <FiCheck className="w-3 h-3 text-green-400" />
                        </button>
                        <span className="text-sm line-through flex-1" style={{ color: 'var(--text-muted)' }}>
                          {task.text}
                        </span>
                        <button onClick={() => handleDeleteTask(task._id)}
                                className="p-1 rounded hover:bg-red-500/10 text-red-400">
                          <FiTrash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedRecordTasks.length === 0 && (
                <div className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
                  <FiTarget className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-xs">No tasks yet. Add your first task above!</p>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="rounded-2xl border overflow-hidden"
               style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
            <div className="px-5 py-4 border-b flex items-center justify-between"
                 style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-2">
                <FiEdit3 className="w-4 h-4" style={{ color: 'var(--intern-primary)' }} />
                <h3 className="font-bold text-white text-sm" style={{ fontFamily: 'var(--font-display)' }}>
                  Notes
                </h3>
              </div>
              <button onClick={handleSaveNotes} disabled={saving}
                      className="text-xs font-semibold px-3 py-1 rounded-lg transition-all"
                      style={{ background: 'rgba(139,92,246,0.1)', color: '#8b5cf6' }}>
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
            <div className="p-5">
              <textarea value={notes} onChange={e => setNotes(e.target.value)}
                        placeholder="Write down what you did today, any important notes, observations..."
                        rows={5}
                        className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-slate-500 outline-none resize-none"
                        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }} />
            </div>
          </div>

          {/* Daily Summary */}
          <div className="rounded-2xl border overflow-hidden"
               style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
            <div className="px-5 py-4 border-b flex items-center justify-between"
                 style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-2">
                <FiFileText className="w-4 h-4" style={{ color: 'var(--intern-primary)' }} />
                <h3 className="font-bold text-white text-sm" style={{ fontFamily: 'var(--font-display)' }}>
                  Daily Summary
                </h3>
              </div>
              <button onClick={handleSaveSummary} disabled={saving}
                      className="text-xs font-semibold px-3 py-1 rounded-lg transition-all"
                      style={{ background: 'rgba(139,92,246,0.1)', color: '#8b5cf6' }}>
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
            <div className="p-5">
              <textarea value={summary} onChange={e => setSummary(e.target.value)}
                        placeholder="Summarize your day - key achievements, what you learned, goals for tomorrow..."
                        rows={3}
                        className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-slate-500 outline-none resize-none"
                        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
