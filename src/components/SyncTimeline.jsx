import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, AlertCircle, Space, CheckCircle2, ChevronRight, Edit3 } from 'lucide-react';

export default function SyncTimeline({ audio, verses, onSyncCompleted, currentTimestamps, t, lang }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [activeSyncIndex, setActiveSyncIndex] = useState(0);
  const [timestamps, setTimestamps] = useState([]); // Array of start times in seconds
  const [lastEndTimestamp, setLastEndTimestamp] = useState(null);

  const audioRef = useRef(null);
  const timerRef = useRef(null);

  // Initialize timestamps when verses change or if we have existing timestamps
  useEffect(() => {
    if (currentTimestamps && currentTimestamps.length > 0) {
      setTimestamps(currentTimestamps);
      // If we already completed sync, put active index at the end
      setActiveSyncIndex(verses.length);
      if (currentTimestamps[verses.length]) {
        setLastEndTimestamp(currentTimestamps[verses.length]);
      }
    } else {
      setTimestamps(new Array(verses.length).fill(null));
      setActiveSyncIndex(0);
      setLastEndTimestamp(null);
    }
  }, [verses, currentTimestamps]);

  // Spacebar Event Listener for Tap
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space') {
        e.preventDefault(); // Prevent page scrolling
        handleTapVerse();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeSyncIndex, isPlaying, timestamps, lastEndTimestamp]);

  // Timer to sync current audio time
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        if (audioRef.current) {
          setCurrentTime(audioRef.current.currentTime);
        }
      }, 100);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(err => console.error("Error playing audio:", err));
      setIsPlaying(true);
    }
  };

  const resetSync = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setCurrentTime(0);
    setActiveSyncIndex(0);
    setTimestamps(new Array(verses.length).fill(null));
    setLastEndTimestamp(null);
  };

  const handleTapVerse = () => {
    if (!audioRef.current) return;
    
    // Start audio if it isn't playing
    if (!isPlaying) {
      audioRef.current.play().catch(err => console.error("Error playing audio:", err));
      setIsPlaying(true);
    }

    const tapTime = audioRef.current.currentTime;

    if (activeSyncIndex < verses.length) {
      // Set start time for active verse
      const nextTimestamps = [...timestamps];
      nextTimestamps[activeSyncIndex] = tapTime;
      setTimestamps(nextTimestamps);
      
      const nextIndex = activeSyncIndex + 1;
      setActiveSyncIndex(nextIndex);
    } else if (activeSyncIndex === verses.length) {
      // All verses started, this tap sets the final end time
      setLastEndTimestamp(tapTime);
      setActiveSyncIndex(activeSyncIndex + 1);
      
      // Auto pause audio
      audioRef.current.pause();
      setIsPlaying(false);
      
      // Trigger sync callback
      const finalTimestamps = [...timestamps, tapTime];
      onSyncCompleted(finalTimestamps);
    }
  };

  const handleManualTimeChange = (index, val) => {
    const timeVal = parseFloat(val);
    if (isNaN(timeVal) || timeVal < 0 || timeVal > audio.duration) return;

    if (index === verses.length) {
      setLastEndTimestamp(timeVal);
      if (activeSyncIndex > verses.length) {
        onSyncCompleted([...timestamps, timeVal]);
      }
    } else {
      const nextTimestamps = [...timestamps];
      nextTimestamps[index] = timeVal;
      setTimestamps(nextTimestamps);
      
      // If we are finished with syncing, trigger complete callback
      if (timestamps.every(t => t !== null) && lastEndTimestamp !== null) {
        onSyncCompleted([...nextTimestamps, lastEndTimestamp]);
      }
    }
  };

  const formatTime = (time) => {
    if (time === null || time === undefined || isNaN(time)) return '--:--';
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    const ms = Math.floor((time % 1) * 100);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}.${ms < 10 ? '0' : ''}${ms}`;
  };

  const handleProgressBarClick = (e) => {
    if (!audioRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const seekTime = (clickX / width) * audio.duration;
    
    audioRef.current.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  // Determine current active verse during normal playback (once synced)
  const getCurrentPlayingVerseIndex = () => {
    if (timestamps.every(t => t === null)) return -1;
    for (let i = 0; i < verses.length; i++) {
      const start = timestamps[i];
      const end = i === verses.length - 1 ? lastEndTimestamp : timestamps[i + 1];
      if (start !== null && (end === null || (currentTime >= start && currentTime < end))) {
        return i;
      }
    }
    return -1;
  };

  const currentPlayingVerseIndex = getCurrentPlayingVerseIndex();

  return (
    <div className="glass-panel timeline-sync-layout">
      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        src={audio.url}
        onEnded={() => setIsPlaying(false)}
        preload="auto"
      />

      {/* Main Alignment Sync Board */}
      <div className="sync-board">
        <div>
          <h2 className="glass-title">{t.syncHeader}</h2>
          <p className="glass-description" style={{ marginBottom: 0 }}>
            {t.syncDesc}
          </p>
        </div>

        {/* Sync Status HUD */}
        {activeSyncIndex <= verses.length ? (
          <div className="active-verse-card pulse-glow">
            {activeSyncIndex < verses.length ? (
              <>
                <span className="verse-tag">
                  {t.syncingVerse} {activeSyncIndex + 1} {t.of} {verses.length}
                </span>
                <p className="verse-arabic">
                  {verses[activeSyncIndex].text}
                </p>
                <p className="verse-translation">
                  {verses[activeSyncIndex].translation}
                </p>
              </>
            ) : (
              <>
                <span className="verse-tag" style={{ background: 'rgba(16, 185, 129, 0.2)', color: 'var(--accent)' }}>
                  {t.almostDone}
                </span>
                <p className="verse-arabic" style={{ fontSize: '1.6rem', color: 'var(--accent)' }}>
                  {t.sadagallah}
                </p>
                <p className="verse-translation" style={{ fontStyle: 'normal', fontWeight: 600 }}>
                  {t.tapLastTime}
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="active-verse-card" style={{ background: 'var(--accent-muted)', borderColor: 'rgba(61, 184, 138, 0.3)' }}>
            <span className="verse-tag" style={{ background: 'var(--accent)', color: '#fff' }}>
              {t.syncComplete}
            </span>
            <p className="verse-arabic" style={{ fontSize: '1.8rem', color: '#fff' }}>
              {t.readyToDesign}
            </p>
            <p className="verse-translation" style={{ color: 'var(--accent)', fontStyle: 'normal', fontWeight: 700 }}>
              {t.syncCompleteDesc}
            </p>
          </div>
        )}

        {/* Large Satisfying Tap Button */}
        {activeSyncIndex <= verses.length && (
          <button className="tap-button" onClick={handleTapVerse}>
            {activeSyncIndex < verses.length ? (
              <>
                <span>{t.tapButtonStart} {activeSyncIndex + 1}</span>
                <span className="tap-shortcut">{t.pressSpacebar}</span>
              </>
            ) : (
              <>
                <span>{t.tapButtonEnd}</span>
                <span className="tap-shortcut">{t.pressSpacebar}</span>
              </>
            )}
          </button>
        )}

        {/* Timeline Wave / Audio Progress Bar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div className="sync-player-controls" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button className="btn btn-primary" onClick={togglePlay} style={{ padding: '10px 18px', borderRadius: '30px' }}>
              {isPlaying ? t.pause : t.play}
            </button>
            
            <button className="btn btn-danger" onClick={resetSync} style={{ padding: '10px 18px', borderRadius: '30px' }}>
              <RotateCcw size={16} />
              {t.resetSync}
            </button>

            <span className="audio-time-label" style={{ marginLeft: lang === 'ar' ? '0' : 'auto', marginRight: lang === 'ar' ? 'auto' : '0' }}>
              {formatTime(currentTime)} / {formatTime(audio.duration)}
            </span>
          </div>

          {/* Interactive Progress bar timeline */}
          <div
            onClick={handleProgressBarClick}
            style={{
              height: '14px',
              width: '100%',
              backgroundColor: 'rgba(255,255,255,0.05)',
              borderRadius: '7px',
              position: 'relative',
              cursor: 'pointer',
              overflow: 'hidden',
              border: '1px solid var(--border-default)'
            }}
          >
            {/* Synced verses background tracks on timeline */}
            {timestamps.map((start, idx) => {
              if (start === null) return null;
              const end = idx === verses.length - 1 ? lastEndTimestamp : timestamps[idx + 1];
              if (end === null) return null;
              const leftPercent = (start / audio.duration) * 100;
              const widthPercent = ((end - start) / audio.duration) * 100;
              return (
                <div
                  key={idx}
                  style={{
                    position: 'absolute',
                    left: `${leftPercent}%`,
                    width: `${widthPercent}%`,
                    height: '100%',
                    backgroundColor: idx === currentPlayingVerseIndex ? 'rgba(139, 92, 246, 0.3)' : 'rgba(255,255,255,0.06)',
                    borderRight: '1px solid rgba(255,255,255,0.25)',
                    pointerEvents: 'none'
                  }}
                />
              );
            })}

            {/* Current playback head */}
            <div
              style={{
                height: '100%',
                width: `${(currentTime / audio.duration) * 100}%`,
                backgroundColor: 'var(--primary)',
                opacity: 0.75,
                transition: 'width 0.1s linear',
                pointerEvents: 'none'
              }}
            />
          </div>
        </div>
      </div>

      {/* Sidebar Queue: Verses list with timestamps */}
      <div className="glass-panel" style={{ padding: '16px', background: 'rgba(0, 0, 0, 0.2)', display: 'flex', flexDirection: 'column', height: '100%' }}>
        <h3 style={{ color: '#fff', fontSize: '1.05rem', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ChevronRight size={18} style={{ color: 'var(--primary)', transform: lang === 'ar' ? 'rotate(180deg)' : 'none' }} />
          {t.syncTimestamps}
        </h3>
        
        <div className="verse-queue-list" style={{ flex: 1 }}>
          {verses.map((verse, idx) => {
            const hasTimestamp = typeof timestamps[idx] === 'number';
            const isCurrentPlaying = idx === currentPlayingVerseIndex;
            const isCurrentlySyncing = idx === activeSyncIndex;

            return (
              <div
                key={idx}
                className={`queue-item ${isCurrentPlaying ? 'active' : ''} ${hasTimestamp ? 'synced' : ''}`}
                style={{ direction: 'ltr', textAlign: 'initial' }}
                onClick={() => {
                  if (audioRef.current && hasTimestamp) {
                    audioRef.current.currentTime = timestamps[idx];
                    setCurrentTime(timestamps[idx]);
                  }
                }}
              >
                <div className="queue-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="queue-index">{t.startAyah} {verse.numberInSurah}</span>
                  {hasTimestamp ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <input
                        type="number"
                        step="0.1"
                        className="form-input"
                        style={{ padding: '2px 4px', fontSize: '0.75rem', width: '60px', textAlign: 'center', background: 'rgba(255,255,255,0.05)', color: 'var(--accent)' }}
                        value={timestamps[idx].toFixed(1)}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => handleManualTimeChange(idx, e.target.value)}
                      />
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{t.seconds}</span>
                    </div>
                  ) : (
                    <span className="queue-time" style={{ color: isCurrentlySyncing ? 'var(--primary)' : 'var(--text-muted)' }}>
                      {isCurrentlySyncing ? t.waiting : t.notSynced}
                    </span>
                  )}
                </div>
                <p className="queue-arabic" style={{ textAlign: 'right' }}>{verse.text}</p>
              </div>
            );
          })}

          {/* End Time entry in list */}
          {timestamps.length > 0 && timestamps.every(t => t !== null) && (
            <div className="queue-item synced" style={{ borderStyle: 'dashed', direction: 'ltr', textAlign: 'initial' }}>
              <div className="queue-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="queue-index" style={{ color: 'var(--accent)' }}>{t.recitationEnd}</span>
                {lastEndTimestamp !== null && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <input
                      type="number"
                      step="0.1"
                      className="form-input"
                      style={{ padding: '2px 4px', fontSize: '0.75rem', width: '60px', textAlign: 'center', background: 'rgba(255,255,255,0.05)', color: 'var(--accent)' }}
                      value={lastEndTimestamp.toFixed(1)}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => handleManualTimeChange(verses.length, e.target.value)}
                    />
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{t.seconds}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
