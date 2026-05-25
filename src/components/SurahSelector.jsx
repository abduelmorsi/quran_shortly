import React, { useState, useEffect, useRef } from 'react';
import { Search, Compass, BookOpen, Loader2 } from 'lucide-react';
import { QuranService } from '../services/QuranService';

export default function SurahSelector({ onSurahSelected, currentSelection, t }) {
  const [surahs, setSurahs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedSurah, setSelectedSurah] = useState(null);
  
  // Verse Range State
  const [startVerse, setStartVerse] = useState(1);
  const [endVerse, setEndVerse] = useState(7);
  const [versesCount, setVersesCount] = useState(7);
  const [versesLoading, setVersesLoading] = useState(false);
  const [allVerses, setAllVerses] = useState([]);

  const containerRef = useRef(null);

  // Fetch Surah list on mount
  useEffect(() => {
    async function loadSurahs() {
      setLoading(true);
      try {
        const list = await QuranService.fetchSurahs();
        setSurahs(list);
      } catch (err) {
        console.error('Failed to load Surahs:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSurahs();
  }, []);

  // Handle click outside autocomplete
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync state if pre-selected
  useEffect(() => {
    if (currentSelection) {
      setSelectedSurah(currentSelection.surah);
      setSearchQuery(currentSelection.surah.englishName);
      setStartVerse(currentSelection.startVerse);
      setEndVerse(currentSelection.endVerse);
      setVersesCount(currentSelection.surah.numberOfAyahs);
      setAllVerses(currentSelection.allVerses);
    }
  }, [currentSelection]);

  const handleSelectSurah = async (surah) => {
    setSelectedSurah(surah);
    setSearchQuery(surah.englishName);
    setShowDropdown(false);
    setVersesLoading(true);

    try {
      const data = await QuranService.fetchSurahVerses(surah.number);
      setAllVerses(data.verses);
      setVersesCount(surah.numberOfAyahs);
      
      // Default to select all verses of the Surah
      setStartVerse(1);
      const initialEnd = surah.numberOfAyahs;
      setEndVerse(initialEnd);
      
      triggerSelectionUpdate(surah, data.verses, 1, initialEnd);
    } catch (err) {
      alert('Error fetching Surah verses. Please try again.');
      console.error(err);
    } finally {
      setVersesLoading(false);
    }
  };

  const triggerSelectionUpdate = (surah, verses, start, end) => {
    const slicedVerses = verses.slice(start - 1, end);
    onSurahSelected({
      surah,
      startVerse: start,
      endVerse: end,
      allVerses: verses,
      slicedVerses: slicedVerses
    });
  };

  const handleStartVerseChange = (e) => {
    const val = parseInt(e.target.value, 10);
    const newStart = Math.min(val, endVerse);
    setStartVerse(newStart);
    triggerSelectionUpdate(selectedSurah, allVerses, newStart, endVerse);
  };

  const handleEndVerseChange = (e) => {
    const val = parseInt(e.target.value, 10);
    const newEnd = Math.max(val, startVerse);
    setEndVerse(newEnd);
    triggerSelectionUpdate(selectedSurah, allVerses, startVerse, newEnd);
  };

  const filteredSurahs = surahs.filter((s) => {
    const query = searchQuery.toLowerCase();
    return (
      s.number.toString().includes(query) ||
      s.englishName.toLowerCase().includes(query) ||
      s.englishNameTranslation.toLowerCase().includes(query) ||
      s.name.includes(query)
    );
  });

  return (
    <div className="glass-panel" ref={containerRef} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <h2 className="glass-title" style={{ fontSize: '1.4rem', marginBottom: '8px' }}>
        {t.surahTitle}
      </h2>
      <p className="glass-description" style={{ marginBottom: '20px' }}>
        {t.surahDesc}
      </p>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Autocomplete Input */}
        <div className="form-group" style={{ position: 'relative' }}>
          <label className="form-label">{t.surahTitle}</label>
          <div className="input-glow-wrapper">
            <input
              type="text"
              className="form-input"
              placeholder={loading ? t.loadingVerses : t.searchPlaceholder}
              value={searchQuery}
              disabled={loading}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
            />
            <div style={{ position: 'absolute', right: '12px', top: '12px', color: 'var(--text-muted)' }}>
              {loading ? <Loader2 className="spinner" size={20} /> : <Search size={20} />}
            </div>
          </div>

          {showDropdown && filteredSurahs.length > 0 && (
            <div className="autocomplete-dropdown">
              {filteredSurahs.map((surah) => (
                <div
                  key={surah.number}
                  className="autocomplete-item"
                  onClick={() => handleSelectSurah(surah)}
                >
                  <div style={{ textAlign: 'initial' }}>
                    <span style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>
                      {surah.number}. {surah.englishName}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginLeft: '8px', marginRight: '8px' }}>
                      ({surah.englishNameTranslation})
                    </span>
                  </div>
                  <span className="surah-arabic">{surah.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selected Surah Panel & Sliders */}
        {versesLoading ? (
          <div style={{ display: 'flex', flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '140px', gap: '10px' }}>
            <Loader2 className="spinner" size={32} style={{ color: 'var(--primary)' }} />
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{t.loadingVerses}</p>
          </div>
        ) : selectedSurah ? (
          <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <div className="audio-meta-card" style={{ marginBottom: '20px', borderColor: 'var(--border-hover)' }}>
              <div className="logo-icon" style={{ padding: '8px', borderRadius: '8px' }}>
                <BookOpen size={20} />
              </div>
              <div style={{ flex: 1, textAlign: 'initial' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <h4 style={{ fontWeight: 800, color: '#fff', margin: 0 }}>{selectedSurah.englishName}</h4>
                  <span style={{ fontFamily: 'var(--font-arabic-classic)', fontSize: '1.25rem', color: 'var(--secondary)' }}>{selectedSurah.name}</span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                  {selectedSurah.englishNameTranslation} | {versesCount} {t.of}
                </p>
              </div>
            </div>

            {/* Verse Range Sliders */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <label className="form-label" style={{ margin: 0 }}>{t.startAyah}</label>
                <span className="slider-val">{t.startAyah} {startVerse}</span>
              </div>
              <input
                type="range"
                min="1"
                max={versesCount}
                value={startVerse}
                onChange={handleStartVerseChange}
              />
            </div>

            <div className="form-group" style={{ marginTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <label className="form-label" style={{ margin: 0 }}>{t.endAyah}</label>
                <span className="slider-val">{t.endAyah} {endVerse}</span>
              </div>
              <input
                type="range"
                min="1"
                max={versesCount}
                value={endVerse}
                onChange={handleEndVerseChange}
              />
            </div>

            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-default)', fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center', marginTop: '15px' }}>
              {t.show} <strong style={{ color: 'var(--primary)' }}>{endVerse - startVerse + 1}</strong> {t.versesSelected}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '140px', border: '1px dashed var(--border-default)', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)', gap: '10px' }}>
            <Compass size={36} />
            <p style={{ fontSize: '0.85rem' }}>{t.surahDesc}</p>
          </div>
        )}
      </div>
    </div>
  );
}
