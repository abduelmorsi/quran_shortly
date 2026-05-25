import React, { useState, useEffect } from 'react';
import { Compass, Palette, Film, CheckCircle2, ChevronRight, ChevronLeft, Globe } from 'lucide-react';
import { translations } from './locales';
import AudioUploader from './components/AudioUploader';
import SurahSelector from './components/SurahSelector';
import SyncTimeline from './components/SyncTimeline';
import StyleEditor from './components/StyleEditor';
import VideoPreview from './components/VideoPreview';
import VideoExporter from './components/VideoExporter';

function App() {
  const [activeStep, setActiveStep] = useState(0); // 0: Setup, 1: Sync, 2: Design, 3: Export
  const [lang, setLang] = useState('en');
  const t = translations[lang];

  // Set document dir and lang dynamically for full RTL support
  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  // State shared between steps
  const [audio, setAudio] = useState(null);
  const [quranSelection, setQuranSelection] = useState(null);
  const [timestamps, setTimestamps] = useState([]);
  
  // Style Customizer State
  const [styleConfig, setStyleConfig] = useState({
    aspectRatio: '9:16', // '9:16' or '16:9'
    bgType: 'aurora',    // 'aurora', 'sunset', 'nebula', 'emerald'
    customBg: null,     // { file, url, type, name }
    cardStyle: 'glass',  // 'glass', 'classic', 'none'
    arabicFont: 'quranic', // 'quranic' (Scheherazade) or 'classic' (Amiri)
    arabicFontSize: 36,
    arabicColor: '#d4af37', // Golden color default
    showEnglish: true,
    englishFontSize: 16,
    overlayPosition: 'bottom', // 'top', 'center', 'bottom'
    surahName: '',
    surahNameArabic: '',
    verseTransition: 'fade', // 'fade' or 'none'
    bgOpacity: 0.8,      // 0.1 to 1.0 (slightly dimmed background)
    bgBlur: 0,           // 0 to 20px blur
    showMetadata: true,
    reciterName: '',
    metadataPosition: 'top', // 'top' or 'bottom'
    arabicFontBold: true
  });

  const handleAudioLoaded = (audioData) => {
    setAudio(audioData);
    // Reset sync timestamps if audio changes
    setTimestamps([]);
  };

  const handleSurahSelected = (selection) => {
    setQuranSelection(selection);
    // Reset sync timestamps if Surah or verse range changes
    setTimestamps([]);
    setStyleConfig(prev => ({
      ...prev,
      surahName: selection.surah.englishName,
      surahNameArabic: selection.surah.name
    }));
  };

  const handleSyncCompleted = (syncedTimestamps) => {
    setTimestamps(syncedTimestamps);
  };

  const handleCustomBgUploaded = (bgMedia) => {
    setStyleConfig(prev => ({
      ...prev,
      customBg: bgMedia,
      bgType: 'custom'
    }));
  };

  const handleNextStep = () => {
    if (activeStep < 3) {
      setActiveStep(activeStep + 1);
    }
  };

  const handleBackStep = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  // Helper validation for steps
  const canProceed = () => {
    if (activeStep === 0) return audio !== null && quranSelection !== null;
    if (activeStep === 1) return timestamps.length > 0 && timestamps.every(t => t !== null);
    return true;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Premium Header */}
      <header className="app-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="logo-container">
          <div className="logo-icon">
            <Compass size={24} />
          </div>
          <div>
            <h1 className="logo-text">{t.title}</h1>
            <p className="logo-tagline">{t.tagline}</p>
          </div>
        </div>

        {/* Language Toggler Button */}
        <button 
          className="btn" 
          onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
          style={{ 
            fontSize: '0.85rem', 
            padding: '6px 12px', 
            borderRadius: '20px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '6px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid var(--border-default)',
            color: 'var(--text-secondary)'
          }}
        >
          <Globe size={14} style={{ color: 'var(--primary)' }} />
          <span>{lang === 'en' ? 'العربية' : 'English'}</span>
        </button>
      </header>

      {/* Multi-Step Wizard HUD Progress */}
      <div className="wizard-progress">
        <div 
          className={`wizard-step ${activeStep === 0 ? 'active' : ''} ${activeStep > 0 ? 'completed' : ''}`}
          onClick={() => audio && quranSelection && setActiveStep(0)}
        >
          <span className="step-num">1</span>
          <span>{t.step1}</span>
        </div>
        <div 
          className={`wizard-step ${activeStep === 1 ? 'active' : ''} ${activeStep > 1 ? 'completed' : ''}`}
          onClick={() => audio && quranSelection && setActiveStep(1)}
        >
          <span className="step-num">2</span>
          <span>{t.step2}</span>
        </div>
        <div 
          className={`wizard-step ${activeStep === 2 ? 'active' : ''} ${activeStep > 2 ? 'completed' : ''}`}
          onClick={() => audio && quranSelection && timestamps.length > 0 && setActiveStep(2)}
        >
          <span className="step-num">3</span>
          <span>{t.step3}</span>
        </div>
        <div 
          className={`wizard-step ${activeStep === 3 ? 'active' : ''} ${activeStep > 3 ? 'completed' : ''}`}
          onClick={() => audio && quranSelection && timestamps.length > 0 && setActiveStep(3)}
        >
          <span className="step-num">4</span>
          <span>{t.step4}</span>
        </div>
      </div>

      {/* MAIN STEP CONTENT SCENE */}
      <main style={{ flex: 1 }}>
        {/* STEP 1: SETUP AUDIO AND SURAH RANGE */}
        {activeStep === 0 && (
          <div className="setup-container" style={{ animation: 'slideUp 0.4s ease-out' }}>
            <AudioUploader
              onAudioLoaded={handleAudioLoaded}
              currentAudio={audio}
              t={t}
            />
            <SurahSelector
              onSurahSelected={handleSurahSelected}
              currentSelection={quranSelection}
              t={t}
            />
          </div>
        )}

        {/* STEP 2: TAP TO SYNC TIMELINE */}
        {activeStep === 1 && (
          <div style={{ animation: 'slideUp 0.4s ease-out' }}>
            <SyncTimeline
              audio={audio}
              verses={quranSelection.slicedVerses}
              onSyncCompleted={handleSyncCompleted}
              currentTimestamps={timestamps}
              t={t}
              lang={lang}
            />
          </div>
        )}

        {/* STEP 3: CUSTOMIZE SUBTITLE STYLE */}
        {activeStep === 2 && (
          <div className="customizer-layout" style={{ animation: 'slideUp 0.4s ease-out' }}>
            <StyleEditor
              styleConfig={styleConfig}
              onChange={setStyleConfig}
              onCustomBgUploaded={handleCustomBgUploaded}
              t={t}
            />
            <VideoPreview
              audio={audio}
              verses={quranSelection.slicedVerses}
              timestamps={timestamps}
              styleConfig={styleConfig}
            />
          </div>
        )}

        {/* STEP 4: HIGHSPEED RENDERER AND COMPILING */}
        {activeStep === 3 && (
          <div style={{ animation: 'slideUp 0.4s ease-out' }}>
            <VideoExporter
              audio={audio}
              verses={quranSelection.slicedVerses}
              timestamps={timestamps}
              styleConfig={styleConfig}
              onBackToEdit={() => setActiveStep(2)}
              t={t}
            />
          </div>
        )}
      </main>

      {/* STEPS CONTROLLERS BAR */}
      <footer className="wizard-actions">
        <button
          className="btn"
          onClick={handleBackStep}
          disabled={activeStep === 0}
          style={{ opacity: activeStep === 0 ? 0.3 : 1 }}
        >
          {lang === 'ar' ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          {t.back}
        </button>

        {activeStep < 3 && (
          <button
            className="btn btn-primary"
            onClick={handleNextStep}
            disabled={!canProceed()}
          >
            {t.next}
            {lang === 'ar' ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
          </button>
        )}
      </footer>
    </div>
  );
}

export default App;
