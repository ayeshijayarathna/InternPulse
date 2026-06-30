import { useState, useEffect } from 'react';
import {
  FiCalendar, FiCheck, FiAlertTriangle, FiX, FiSend,
  FiUserCheck, FiClock,
} from 'react-icons/fi';
import axiosInstance from '../../../api/axiosInstance';

const fmtDate = (d) =>
  new Date(d).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

const isPast = (d) => new Date(d) < new Date(new Date().toDateString());

export default function InternRequiredDaysPage() {
  const [entries, setEntries]   = useState([]);
  const [loading, setLoading]   = useState(true);

  const [respondingId, setRespondingId] = useState(null); // entry currently showing the reason form
  const [reasonDraft,  setReasonDraft]  = useState('');
  const [submitting,   setSubmitting]   = useState(false);
  const [submitError,  setSubmitError]  = useState('');

  const fetchEntries = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/required-days/my');
      setEntries(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEntries(); }, []);

  const openReasonForm = (entry) => {
    setRespondingId(entry._id);
    setReasonDraft(entry.unavailableReason || '');
    setSubmitError('');
  };

  const cancelReasonForm = () => {
    setRespondingId(null);
    setReasonDraft('');
    setSubmitError('');
  };

  const handleMarkUnavailable = async (entryId) => {
    if (!reasonDraft.trim()) {
      setSubmitError('Please tell your supervisor why you can\'t make it');
      return;
    }
    setSubmitting(true);
    setSubmitError('');
    try {
      const res = await axiosInstance.patch(`/required-days/${entryId}/respond`, {
        status: 'unavailable',
        reason: reasonDraft.trim(),
      });
      setEntries(prev => prev.map(e => e._id === entryId ? res.data : e));
      setRespondingId(null);
      setReasonDraft('');
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkConfirmed = async (entryId) => {
    setSubmitting(true);
    try {
      const res = await axiosInstance.patch(`/required-days/${entryId}/respond`, { status: 'confirmed' });
      setEntries(prev => prev.map(e => e._id === entryId ? res.data : e));
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // Split into upcoming vs past, soonest first within each group
  const sorted    = [...entries].sort((a, b) => new Date(a.date) - new Date(b.date));
  const upcoming  = sorted.filter(e => !isPast(e.date));
  const past      = sorted.filter(e => isPast(e.date)).reverse();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: 'var(--intern-primary)', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, var(--intern-primary), var(--intern-secondary))' }}
        >
          <FiCalendar className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
            Required Office Days
          </h2>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Days your supervisor needs you in the office
          </p>
        </div>
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-20 rounded-2xl border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <FiCalendar className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
          <p className="font-semibold text-white mb-1">No required days yet</p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Your supervisor hasn't scheduled any office days for you
          </p>
        </div>
      ) : (
        <>
          {/* Upcoming */}
          {upcoming.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                Upcoming
              </h3>
              {upcoming.map(entry => (
                <EntryCard
                  key={entry._id}
                  entry={entry}
                  responding={respondingId === entry._id}
                  reasonDraft={reasonDraft}
                  setReasonDraft={setReasonDraft}
                  submitting={submitting}
                  submitError={respondingId === entry._id ? submitError : ''}
                  onOpenReason={() => openReasonForm(entry)}
                  onCancelReason={cancelReasonForm}
                  onSubmitUnavailable={() => handleMarkUnavailable(entry._id)}
                  onMarkConfirmed={() => handleMarkConfirmed(entry._id)}
                />
              ))}
            </div>
          )}

          {/* Past */}
          {past.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                Past
              </h3>
              {past.map(entry => (
                <EntryCard key={entry._id} entry={entry} pastOnly />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── Single entry card, reused for both upcoming and past sections ─────────────
function EntryCard({
  entry, pastOnly = false, responding = false, reasonDraft = '', setReasonDraft,
  submitting = false, submitError = '', onOpenReason, onCancelReason,
  onSubmitUnavailable, onMarkConfirmed,
}) {
  const unavailable = entry.status === 'unavailable';

  return (
    <div
      className="rounded-2xl border p-5"
      style={{
        background:  'var(--bg-card)',
        borderColor: unavailable ? 'rgba(239,68,68,0.3)' : 'var(--border)',
        opacity: pastOnly ? 0.65 : 1,
      }}
    >
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: unavailable ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)' }}
          >
            {unavailable
              ? <FiAlertTriangle className="w-5 h-5" style={{ color: '#ef4444' }} />
              : <FiCheck className="w-5 h-5" style={{ color: '#22c55e' }} />}
          </div>
          <div>
            <p className="font-semibold text-white text-sm">{fmtDate(entry.date)}</p>
            <p className="text-xs mt-0.5 flex items-center gap-1" style={{ color: unavailable ? '#ef4444' : '#22c55e' }}>
              {unavailable ? "Marked unavailable" : "You're confirmed to come in"}
            </p>
          </div>
        </div>

        {!pastOnly && !responding && (
          <div className="flex items-center gap-2">
            {unavailable ? (
              <button
                onClick={onOpenReason}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-80"
                style={{ background: 'rgba(99,102,241,0.1)', color: 'var(--intern-primary)', border: '1px solid rgba(99,102,241,0.25)' }}
              >
                Edit reason
              </button>
            ) : (
              <button
                onClick={onOpenReason}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-80"
                style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.25)' }}
              >
                I can't make it
              </button>
            )}
          </div>
        )}
      </div>

      {/* Existing reason (when not actively editing) */}
      {!responding && unavailable && entry.unavailableReason && (
        <div className="mt-3 p-3 rounded-xl text-sm" style={{ background: 'rgba(239,68,68,0.06)', color: 'var(--text-secondary)' }}>
          Your reason: "{entry.unavailableReason}"
        </div>
      )}

      {/* Supervisor reply */}
      {entry.supervisorReply && (
        <div className="mt-2 p-3 rounded-xl text-sm flex items-start gap-2" style={{ background: 'rgba(99,102,241,0.08)', color: 'var(--text-secondary)' }}>
          <FiUserCheck className="w-4 h-4 mt-0.5 shrink-0" style={{ color: 'var(--intern-primary)' }} />
          <span>Supervisor replied: "{entry.supervisorReply}"</span>
        </div>
      )}

      {/* Reason form */}
      {responding && (
        <div className="mt-4 space-y-3">
          {submitError && (
            <div className="p-2.5 rounded-lg text-xs" style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444' }}>
              {submitError}
            </div>
          )}
          <textarea
            rows={3}
            value={reasonDraft}
            onChange={e => setReasonDraft(e.target.value)}
            placeholder="Let your supervisor know why you can't come in…"
            className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-slate-600 outline-none resize-none"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
          />
          <div className="flex items-center gap-2">
            <button
              onClick={onCancelReason}
              className="flex-1 py-2 rounded-xl font-semibold text-xs border"
              style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
            >
              <FiX className="w-3.5 h-3.5 inline mr-1" /> Cancel
            </button>
            <button
              onClick={onSubmitUnavailable}
              disabled={submitting}
              className="flex-1 py-2 rounded-xl font-semibold text-xs text-white disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}
            >
              <FiSend className="w-3.5 h-3.5 inline mr-1" /> {submitting ? 'Sending…' : 'Send to Supervisor'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}