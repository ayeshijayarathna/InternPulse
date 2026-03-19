import { useEffect, useState, useRef } from 'react';
import {
  FiSend, FiPaperclip, FiX, FiAlertTriangle, FiCheckCircle, FiFile, FiImage
} from 'react-icons/fi';
import axiosInstance from '../../../api/axiosInstance';

// Blocker removed — only Progress Update and Self Task
const TYPE_OPTIONS = [
  { id: 'update',    label: 'Progress Update', desc: 'Share what you have done'        },
  { id: 'self_task', label: 'Self Task',        desc: 'Task you are doing on your own' },
];

export default function SubmitUpdatePage() {
  const [tasks,   setTasks]   = useState([]);
  const [type,    setType]    = useState('update');
  const [taskId,  setTaskId]  = useState('');
  const [content, setContent] = useState('');
  const [files,   setFiles]   = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error,   setError]   = useState('');
  const fileRef = useRef();

  useEffect(() => {
    axiosInstance.get('/tasks/my')
      .then(res => setTasks(res.data))
      .catch(console.error);
  }, []);

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    if (files.length + selected.length > 5) {
      setError('Maximum 5 files allowed');
      return;
    }
    setFiles(prev => [...prev, ...selected]);
    e.target.value = '';
  };

  const removeFile = (idx) => setFiles(prev => prev.filter((_, i) => i !== idx));

  const formatSize = (bytes) => {
    if (bytes < 1024)        return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const isImageFile = (file) => file.type.startsWith('image/');

  const handleSubmit = async () => {
    if (!content.trim()) { setError('Content is required'); return; }
    setError('');
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('type', type);
      formData.append('content', content.trim());
      if (taskId && type !== 'self_task') formData.append('taskId', taskId);
      files.forEach(f => formData.append('attachments', f));

      await axiosInstance.post('/updates', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setSuccess(true);
      setContent('');
      setTaskId('');
      setFiles([]);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
          Submit Update
        </h2>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          Once submitted, entries cannot be edited or deleted
        </p>
      </div>

      {/* Success Banner */}
      {success && (
        <div className="flex items-center gap-3 p-4 rounded-xl border"
             style={{ background: 'rgba(34,197,94,0.08)', borderColor: 'rgba(34,197,94,0.3)' }}>
          <FiCheckCircle className="w-5 h-5 shrink-0" style={{ color: 'var(--success)' }} />
          <span className="text-sm font-semibold" style={{ color: 'var(--success)' }}>
            Submitted successfully!
          </span>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl border"
             style={{ background: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.3)' }}>
          <FiAlertTriangle className="w-5 h-5 shrink-0" style={{ color: 'var(--danger)' }} />
          <span className="text-sm font-semibold" style={{ color: 'var(--danger)' }}>{error}</span>
        </div>
      )}

      <div className="rounded-2xl border p-6 space-y-6"
           style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>

        {/* Type selector — 2 options, side by side */}
        <div>
          <label className="block text-xs font-semibold mb-3 uppercase tracking-wider"
                 style={{ color: 'var(--text-secondary)' }}>
            Type
          </label>
          <div className="grid grid-cols-2 gap-3">
            {TYPE_OPTIONS.map(opt => (
              <button
                key={opt.id}
                onClick={() => { setType(opt.id); if (opt.id === 'self_task') setTaskId(''); }}
                className="p-3 rounded-xl border text-left transition-all"
                style={{
                  background:  type === opt.id
                    ? 'linear-gradient(135deg, var(--intern-primary)22, var(--intern-secondary)22)'
                    : 'transparent',
                  borderColor: type === opt.id ? 'var(--intern-primary)' : 'var(--border)',
                }}
              >
                <div className="text-sm font-bold text-white">{opt.label}</div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{opt.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Task selector (hidden for self_task) */}
        {type !== 'self_task' && (
          <div>
            <label className="block text-xs font-semibold mb-2 uppercase tracking-wider"
                   style={{ color: 'var(--text-secondary)' }}>
              Related Task <span style={{ color: 'var(--text-muted)' }}>(optional)</span>
            </label>
            <select
              value={taskId}
              onChange={e => setTaskId(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all"
              style={{
                background:  'var(--bg-surface)',
                borderColor: 'var(--border)',
                color:       'var(--text-primary)',
              }}
            >
              <option value="">— No specific task —</option>
              {tasks.map(t => (
                <option key={t._id} value={t._id}>{t.title}</option>
              ))}
            </select>
          </div>
        )}

        {/* Content textarea */}
        <div>
          <label className="block text-xs font-semibold mb-2 uppercase tracking-wider"
                 style={{ color: 'var(--text-secondary)' }}>
            Content <span style={{ color: 'var(--danger)' }}>*</span>
          </label>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            rows={5}
            placeholder={
              type === 'self_task'
                ? 'Describe the task you are working on...'
                : 'Describe your progress and what you have done...'
            }
            className="w-full px-4 py-3 rounded-xl border text-sm outline-none resize-none transition-all"
            style={{
              background:  'var(--bg-surface)',
              borderColor: 'var(--border)',
              color:       'var(--text-primary)',
            }}
            onFocus={e => e.target.style.borderColor = 'var(--intern-primary)'}
            onBlur={e  => e.target.style.borderColor = 'var(--border)'}
          />
          <div className="flex justify-end mt-1">
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {content.length} chars
            </span>
          </div>
        </div>

        {/* File attachments */}
        <div>
          <label className="block text-xs font-semibold mb-2 uppercase tracking-wider"
                 style={{ color: 'var(--text-secondary)' }}>
            Attachments <span style={{ color: 'var(--text-muted)' }}>(up to 5 files, 20MB each)</span>
          </label>

          {files.length > 0 && (
            <div className="space-y-2 mb-3">
              {files.map((file, idx) => (
                <div key={idx}
                     className="flex items-center gap-3 px-3 py-2 rounded-lg border"
                     style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
                  {isImageFile(file)
                    ? <FiImage className="w-4 h-4 shrink-0" style={{ color: 'var(--intern-accent)' }} />
                    : <FiFile  className="w-4 h-4 shrink-0" style={{ color: 'var(--text-secondary)' }} />
                  }
                  <span className="flex-1 text-xs truncate text-white">{file.name}</span>
                  <span className="text-xs shrink-0" style={{ color: 'var(--text-muted)' }}>
                    {formatSize(file.size)}
                  </span>
                  <button onClick={() => removeFile(idx)}>
                    <FiX className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {files.length < 5 && (
            <button
              onClick={() => fileRef.current.click()}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all hover:bg-white/5"
              style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
            >
              <FiPaperclip className="w-4 h-4" />
              Attach file
            </button>
          )}
          <input
            ref={fileRef}
            type="file"
            multiple
            className="hidden"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar,.txt,.jpg,.jpeg,.png,.gif,.webp"
            onChange={handleFileChange}
          />
        </div>

        {/* Submit button */}
        <button
          onClick={handleSubmit}
          disabled={loading || !content.trim()}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: 'linear-gradient(135deg, var(--intern-primary), var(--intern-secondary))',
            color: '#fff',
          }}
        >
          {loading
            ? <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            : <FiSend className="w-4 h-4" />
          }
          {loading ? 'Submitting...' : 'Submit Update'}
        </button>
      </div>
    </div>
  );
}