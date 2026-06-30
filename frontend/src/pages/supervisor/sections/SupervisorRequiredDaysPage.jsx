import { useState, useEffect, useCallback } from 'react';
import {
  FiCalendar, FiChevronLeft, FiChevronRight, FiX, FiPlus,
  FiAlertTriangle, FiCheck, FiSend, FiUserCheck, FiTrash2, FiUsers,
} from 'react-icons/fi';
import axiosInstance from '../../../api/axiosInstance';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Build a 6-row month grid (42 cells) including leading/trailing days
// from neighbouring months, so the calendar always looks rectangular.
function buildMonthGrid(year, monthIndex /* 0-based */) {
  const firstOfMonth = new Date(Date.UTC(year, monthIndex, 1));
  const startWeekday  = firstOfMonth.getUTCDay(); // 0 = Sunday
  const daysInMonth    = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();

  const cells = [];

  // Leading days from previous month (greyed out, still clickable for context)
  for (let i = 0; i < startWeekday; i++) {
    const date = new Date(Date.UTC(year, monthIndex, 1 - (startWeekday - i)));
    cells.push({ date, inMonth: false });
  }
  // Days of the current month
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ date: new Date(Date.UTC(year, monthIndex, d)), inMonth: true });
  }
  // Trailing days to fill the last row up to a multiple of 7
  while (cells.length % 7 !== 0) {
    const last = cells[cells.length - 1].date;
    const next = new Date(last);
    next.setUTCDate(next.getUTCDate() + 1);
    cells.push({ date: next, inMonth: false });
  }

  return cells;
}

const dateKey = (d) => d.toISOString().split('T')[0];
const isToday = (d) => dateKey(d) === dateKey(new Date());

export default function SupervisorRequiredDaysPage() {
  const today = new Date();
  const [viewYear,  setViewYear]  = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth()); // 0-based

  const [monthSummary, setMonthSummary] = useState({}); // { 'YYYY-MM-DD': { total, unavailable } }
  const [loadingSummary, setLoadingSummary] = useState(true);

  const [selectedDate, setSelectedDate]   = useState(null); // Date | null
  const [dayEntries,   setDayEntries]     = useState([]);
  const [loadingDay,   setLoadingDay]     = useState(false);

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [interns,         setInterns]         = useState([]);
  const [selectedInterns, setSelectedInterns] = useState([]);
  const [assigning,       setAssigning]       = useState(false);
  const [assignError,     setAssignError]     = useState('');

  const [replyDrafts, setReplyDrafts] = useState({}); // { [entryId]: text }
  const [replyingId,  setReplyingId]  = useState(null);
  const [deletingId,  setDeletingId]  = useState(null);

  // Load month summary whenever the visible month changes 
  const fetchMonthSummary = useCallback(async () => {
    setLoadingSummary(true);
    try {
      const res = await axiosInstance.get(`/required-days/month/${viewYear}/${viewMonth + 1}`);
      setMonthSummary(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSummary(false);
    }
  }, [viewYear, viewMonth]);

  useEffect(() => { fetchMonthSummary(); }, [fetchMonthSummary]);

  // Load own interns once (for the assign modal)
  useEffect(() => {
    axiosInstance.get('/users/interns')
      .then(res => setInterns(res.data))
      .catch(() => {});
  }, []);

  //  Load entries for a clicked date
  const fetchDayEntries = async (date) => {
    setLoadingDay(true);
    setSelectedDate(date);
    try {
      const res = await axiosInstance.get(`/required-days/by-date/${dateKey(date)}`);
      setDayEntries(res.data);
    } catch (err) {
      console.error(err);
      setDayEntries([]);
    } finally {
      setLoadingDay(false);
    }
  };

  const goPrevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const goNextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  // Assign modal 
  const openAssignModal = () => {
    setSelectedInterns([]);
    setAssignError('');
    setShowAssignModal(true);
  };

  const toggleInternSelect = (id) => {
    setSelectedInterns(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleAssign = async () => {
    if (selectedInterns.length === 0) {
      setAssignError('Select at least one intern');
      return;
    }
    setAssigning(true);
    setAssignError('');
    try {
      await axiosInstance.post('/required-days', {
        date:      dateKey(selectedDate),
        internIds: selectedInterns,
      });
      setShowAssignModal(false);
      fetchMonthSummary();
      fetchDayEntries(selectedDate);
    } catch (err) {
      setAssignError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setAssigning(false);
    }
  };

  // Reply to an unavailable reason 
  const handleSendReply = async (entryId) => {
    const text = replyDrafts[entryId]?.trim();
    if (!text) return;
    setReplyingId(entryId);
    try {
      const res = await axiosInstance.post(`/required-days/${entryId}/reply`, { reply: text });
      setDayEntries(prev => prev.map(e => e._id === entryId ? res.data : e));
      setReplyDrafts(prev => ({ ...prev, [entryId]: '' }));
    } catch (err) {
      console.error(err);
    } finally {
      setReplyingId(null);
    }
  };

  //  Remove an assignment 
  const handleDeleteEntry = async (entryId) => {
    setDeletingId(entryId);
    try {
      await axiosInstance.delete(`/required-days/${entryId}`);
      setDayEntries(prev => prev.filter(e => e._id !== entryId));
      fetchMonthSummary();
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  const grid = buildMonthGrid(viewYear, viewMonth);
  const monthLabel = new Date(Date.UTC(viewYear, viewMonth, 1))
    .toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const internsAlreadyOnDate = new Set(dayEntries.map(e => e.intern?._id));
  const assignableInterns = interns.filter(i => !internsAlreadyOnDate.has(i._id));

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, var(--admin-primary), var(--admin-secondary))' }}
        >
          <FiCalendar className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
            Required Office Days
          </h2>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Pick a date to see who's required and manage their attendance
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">

        {/* ── Calendar grid ── */}
        <div className="rounded-2xl border p-5" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>

          {/* Month nav */}
          <div className="flex items-center justify-between mb-5">
            <button onClick={goPrevMonth} className="p-2 rounded-xl border transition-all hover:bg-white/5" style={{ borderColor: 'var(--border)' }}>
              <FiChevronLeft className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
            </button>
            <h3 className="text-lg font-bold text-white">{monthLabel}</h3>
            <button onClick={goNextMonth} className="p-2 rounded-xl border transition-all hover:bg-white/5" style={{ borderColor: 'var(--border)' }}>
              <FiChevronRight className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
            </button>
          </div>

          {/* Weekday labels */}
          <div className="grid grid-cols-7 gap-1.5 mb-2">
            {WEEKDAYS.map(w => (
              <div key={w} className="text-center text-xs font-semibold py-1" style={{ color: 'var(--text-muted)' }}>
                {w}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7 gap-1.5">
            {grid.map(({ date, inMonth }, idx) => {
              const key      = dateKey(date);
              const summary  = monthSummary[key];
              const selected = selectedDate && dateKey(selectedDate) === key;

              return (
                <button
                  key={idx}
                  onClick={() => fetchDayEntries(date)}
                  className="aspect-square rounded-xl flex flex-col items-center justify-center gap-1 transition-all relative"
                  style={{
                    background: selected
                      ? 'linear-gradient(135deg, var(--admin-primary), var(--admin-secondary))'
                      : isToday(date)
                        ? 'rgba(245,158,11,0.1)'
                        : 'var(--bg-surface)',
                    border: `1px solid ${selected ? 'transparent' : isToday(date) ? 'rgba(245,158,11,0.3)' : 'var(--border)'}`,
                    opacity: inMonth ? 1 : 0.3,
                  }}
                >
                  <span
                    className="text-sm font-semibold"
                    style={{ color: selected ? '#000' : '#fff' }}
                  >
                    {date.getUTCDate()}
                  </span>
                  {summary && (
                    <div className="flex items-center gap-0.5">
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: selected ? '#000' : '#22c55e' }}
                      />
                      {summary.unavailable > 0 && (
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ background: selected ? '#7f1d1d' : '#ef4444' }}
                        />
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-4 text-xs" style={{ color: 'var(--text-muted)' }}>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500" /> Interns assigned</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500" /> Someone unavailable</span>
          </div>
        </div>

        {/* ── Side panel: selected date detail ── */}
        <div className="rounded-2xl border p-5 flex flex-col" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', minHeight: '420px' }}>
          {!selectedDate ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <FiCalendar className="w-10 h-10 mb-3" style={{ color: 'var(--text-muted)' }} />
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Click a date on the calendar to view or assign required interns
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-white text-sm">
                  {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </h4>
                <button
                  onClick={openAssignModal}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-90"
                  style={{ background: 'rgba(245,158,11,0.1)', color: 'var(--admin-primary)', border: '1px solid rgba(245,158,11,0.25)' }}
                >
                  <FiPlus className="w-3.5 h-3.5" /> Assign
                </button>
              </div>

              {loadingDay ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="w-6 h-6 rounded-full border-2 animate-spin" style={{ borderColor: 'var(--admin-primary)', borderTopColor: 'transparent' }} />
                </div>
              ) : dayEntries.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                  <FiUsers className="w-8 h-8 mb-2" style={{ color: 'var(--text-muted)' }} />
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No interns required this day yet</p>
                </div>
              ) : (
                <div className="space-y-3 overflow-y-auto" style={{ maxHeight: '460px' }}>
                  {dayEntries.map(entry => (
                    <div
                      key={entry._id}
                      className="rounded-xl border p-3.5"
                      style={{
                        background: 'var(--bg-surface)',
                        borderColor: entry.status === 'unavailable' ? 'rgba(239,68,68,0.3)' : 'var(--border)',
                      }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          {entry.intern?.avatar?.url ? (
                            <img src={entry.intern.avatar.url} alt={entry.intern.name} className="w-8 h-8 rounded-full object-cover shrink-0" />
                          ) : (
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                              style={{ background: 'linear-gradient(135deg, var(--admin-primary), var(--admin-secondary))' }}
                            >
                              {entry.intern?.name?.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-white truncate">{entry.intern?.name}</p>
                            <span
                              className="text-[11px] font-medium flex items-center gap-1"
                              style={{ color: entry.status === 'unavailable' ? '#ef4444' : '#22c55e' }}
                            >
                              {entry.status === 'unavailable'
                                ? <><FiAlertTriangle className="w-3 h-3" /> Unavailable</>
                                : <><FiCheck className="w-3 h-3" /> Confirmed</>}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteEntry(entry._id)}
                          disabled={deletingId === entry._id}
                          className="p-1.5 rounded-lg shrink-0 transition-all hover:bg-red-500/10"
                          style={{ color: '#ef4444' }}
                        >
                          <FiTrash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {entry.status === 'unavailable' && entry.unavailableReason && (
                        <div className="mt-2.5 p-2.5 rounded-lg text-xs" style={{ background: 'rgba(239,68,68,0.06)', color: 'var(--text-secondary)' }}>
                          "{entry.unavailableReason}"
                        </div>
                      )}

                      {entry.supervisorReply && (
                        <div className="mt-2 p-2.5 rounded-lg text-xs flex items-start gap-1.5" style={{ background: 'rgba(245,158,11,0.08)', color: 'var(--text-secondary)' }}>
                          <FiUserCheck className="w-3 h-3 mt-0.5 shrink-0" style={{ color: 'var(--admin-primary)' }} />
                          <span>You replied: "{entry.supervisorReply}"</span>
                        </div>
                      )}

                      {entry.status === 'unavailable' && (
                        <div className="mt-2.5 flex items-center gap-2">
                          <input
                            type="text"
                            value={replyDrafts[entry._id] || ''}
                            onChange={e => setReplyDrafts(prev => ({ ...prev, [entry._id]: e.target.value }))}
                            placeholder={entry.supervisorReply ? 'Send another reply…' : 'Reply…'}
                            className="flex-1 px-3 py-1.5 rounded-lg text-xs text-white placeholder-slate-600 outline-none"
                            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
                          />
                          <button
                            onClick={() => handleSendReply(entry._id)}
                            disabled={replyingId === entry._id || !replyDrafts[entry._id]?.trim()}
                            className="p-1.5 rounded-lg shrink-0 transition-all disabled:opacity-40"
                            style={{ background: 'rgba(245,158,11,0.12)', color: 'var(--admin-primary)' }}
                          >
                            <FiSend className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── Assign modal ── */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-sm rounded-2xl p-6 space-y-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">
                Assign for {selectedDate?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </h3>
              <button onClick={() => setShowAssignModal(false)} className="p-1 rounded-lg hover:bg-white/5" style={{ color: 'var(--text-secondary)' }}>
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {assignError && (
              <div className="p-3 rounded-xl text-sm" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444' }}>
                {assignError}
              </div>
            )}

            {assignableInterns.length === 0 ? (
              <p className="text-sm py-4 text-center" style={{ color: 'var(--text-muted)' }}>
                All your interns are already assigned to this date.
              </p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {assignableInterns.map(intern => {
                  const checked = selectedInterns.includes(intern._id);
                  return (
                    <label
                      key={intern._id}
                      className="flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all"
                      style={{ background: checked ? 'rgba(245,158,11,0.1)' : 'var(--bg-surface)', border: `1px solid ${checked ? 'rgba(245,158,11,0.3)' : 'var(--border)'}` }}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleInternSelect(intern._id)}
                        className="w-4 h-4 accent-orange-500"
                      />
                      {intern.avatar?.url ? (
                        <img src={intern.avatar.url} alt={intern.name} className="w-7 h-7 rounded-full object-cover" />
                      ) : (
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                             style={{ background: 'linear-gradient(135deg, var(--admin-primary), var(--admin-secondary))' }}>
                          {intern.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="text-sm text-white">{intern.name}</span>
                    </label>
                  );
                })}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowAssignModal(false)}
                className="flex-1 py-2.5 rounded-xl font-semibold text-sm border"
                style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
              >
                Cancel
              </button>
              <button
                onClick={handleAssign}
                disabled={assigning || assignableInterns.length === 0}
                className="flex-1 py-2.5 rounded-xl font-semibold text-sm disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, var(--admin-primary), var(--admin-secondary))', color: '#000' }}
              >
                {assigning ? 'Assigning…' : 'Assign'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}