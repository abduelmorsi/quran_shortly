import React, { useState, useRef } from 'react';
import { Upload, Music, Trash2, CheckCircle } from 'lucide-react';

export default function AudioUploader({ onAudioLoaded, currentAudio, t }) {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = (file) => {
    if (!file || !file.type.startsWith('audio/')) {
      alert('Please upload a valid audio file (MP3, WAV, M4A, etc.)');
      return;
    }

    // Create an audio element to calculate duration
    const audioUrl = URL.createObjectURL(file);
    const audioObj = new Audio(audioUrl);
    
    audioObj.addEventListener('loadedmetadata', () => {
      onAudioLoaded({
        file,
        name: file.name,
        size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
        duration: audioObj.duration,
        url: audioUrl
      });
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  const clearAudio = (e) => {
    e.stopPropagation();
    onAudioLoaded(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="glass-panel" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <h2 className="glass-title" style={{ fontSize: '1.4rem', marginBottom: '8px' }}>
        {t.audioTitle}
      </h2>
      <p className="glass-description" style={{ marginBottom: '20px' }}>
        {t.audioDesc}
      </p>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        {!currentAudio ? (
          <div
            className={`uploader-box ${dragActive ? 'drag-active' : ''}`}
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={handleButtonClick}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            <div className="uploader-icon">
              <Upload size={48} />
            </div>
            <div>
              <p className="uploader-text" style={{ fontSize: '1rem', fontWeight: 600 }}>
                {dragActive ? t.dragActive : t.dragPlaceholder}
              </p>
              <p className="uploader-subtext">{t.supportLabel}</p>
            </div>
          </div>
        ) : (
          <div className="uploader-box" style={{ borderStyle: 'solid', borderColor: 'var(--primary)', cursor: 'default' }}>
            <div className="uploader-icon" style={{ color: 'var(--accent)', animation: 'none' }}>
              <Music size={48} />
            </div>
            <div className="audio-meta-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <div style={{ textAlign: 'initial', overflow: 'hidden', flex: 1, paddingRight: '10px', paddingLeft: '10px' }}>
                <p style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: 0 }}>
                  {currentAudio.name}
                </p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                  {currentAudio.size} | {formatDuration(currentAudio.duration)}
                </p>
              </div>
              <button className="btn btn-danger" onClick={clearAudio} style={{ padding: '8px', borderRadius: '50%' }} title={t.remove}>
                <Trash2 size={16} />
              </button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent)', fontWeight: 600, fontSize: '0.9rem', marginTop: '10px' }}>
              <CheckCircle size={18} />
              {t.audioLoaded}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
