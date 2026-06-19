import { useState } from 'react';
import { FiCamera, FiTrash2 } from 'react-icons/fi';
import axiosInstance from '../api/axiosInstance';

export default function AvatarUpload({
  user,
  accentColor  = '#f97316',
  accentColor2 = '#fb923c',
  size         = 'lg',    // 'lg' | 'sm'
  onUpdate,
}) {
  const [uploading, setUploading] = useState(false);
  const [deleting,  setDeleting]  = useState(false);
  const [showMenu,  setShowMenu]  = useState(false);

  const dim    = size === 'lg' ? 'w-12 h-12' : 'w-8 h-8';
  const txtSz  = size === 'lg' ? 'text-xl'   : 'text-sm';
  const iconSz = size === 'lg' ? 'w-4 h-4'   : 'w-3 h-3';

  const hasAvatar = !!user?.avatar?.url;

  //Upload 
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setShowMenu(false);
    try {
      const fd = new FormData();
      fd.append('avatar', file);
      const res = await axiosInstance.patch('/users/avatar', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onUpdate?.(res.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Avatar update failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  // Delete
  const handleDelete = async () => {
    if (!window.confirm('Remove profile picture?')) return;
    setDeleting(true);
    setShowMenu(false);
    try {
      const res = await axiosInstance.delete('/users/avatar');
      onUpdate?.(res.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  const busy = uploading || deleting;

  return (
    <div className="relative shrink-0">
      {/* Avatar image or initials */}
      <button
        onClick={() => !busy && setShowMenu(m => !m)}
        className={`${dim} rounded-full overflow-hidden border-2 flex items-center justify-center group transition-opacity hover:opacity-80 focus:outline-none`}
        style={{ borderColor: accentColor }}
        title="Change profile picture"
      >
        {busy ? (
          <div className={`${dim} rounded-full flex items-center justify-center`}
               style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor2})` }}>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        ) : hasAvatar ? (
          <img src={user.avatar.url} alt={user?.name}
               className={`${dim} rounded-full object-cover`} />
        ) : (
          <div className={`${dim} rounded-full flex items-center justify-center ${txtSz} font-bold text-white`}
               style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor2})` }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
        )}

        {/* Camera overlay */}
        {!busy && (
          <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <FiCamera className={`${iconSz} text-white`} />
          </div>
        )}
      </button>

      {/* Dropdown menu */}
      {showMenu && !busy && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />

          <div className="absolute left-0 mt-2 w-44 rounded-xl border shadow-xl z-50 overflow-hidden"
               style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
            {/* Upload option */}
            <label className="flex items-center gap-2.5 px-4 py-3 cursor-pointer hover:bg-white/5 transition-all text-sm text-white">
              <FiCamera className="w-4 h-4" style={{ color: accentColor }} />
              {hasAvatar ? 'Change photo' : 'Upload photo'}
              <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </label>

            {/* Delete option — only if avatar exists */}
            {hasAvatar && (
              <button
                onClick={handleDelete}
                className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-all"
              >
                <FiTrash2 className="w-4 h-4" />
                Remove photo
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}