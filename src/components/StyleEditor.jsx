import React, { useRef } from 'react';
import { Palette, Layout, Type, Upload, Film, Eye, Sparkles } from 'lucide-react';

export default function StyleEditor({ styleConfig, onChange, onCustomBgUploaded, t }) {
  const fileInputRef = useRef(null);

  const updateConfig = (key, value) => {
    onChange({ ...styleConfig, [key]: value });
  };

  const handleCustomBgChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const type = file.type.startsWith('video/') ? 'video' : 'image';
      const url = URL.createObjectURL(file);
      onCustomBgUploaded({ file, url, type, name: file.name });
    }
  };

  // Predefined generative backgrounds
  const generativeBgPresets = [
    { id: 'aurora', name: 'Aurora Orbit', color: '#1a103c' },
    { id: 'sunset', name: 'Sunset Glow', color: '#3c1a10' },
    { id: 'nebula', name: 'Cosmic Nebula', color: '#0f172a' },
    { id: 'emerald', name: 'Deep Oasis', color: '#064e3b' }
  ];

  return (
    <div className="glass-panel styles-panel">
      <h2 className="glass-title" style={{ fontSize: '1.4rem', marginBottom: '8px' }}>
        {t.designTitle}
      </h2>
      <p className="glass-description" style={{ marginBottom: '20px' }}>
        {t.designDesc}
      </p>

      {/* ASPECT RATIO */}
      <div className="section-card">
        <h3 className="section-card-title">
          <Layout size={16} style={{ color: 'var(--primary)' }} />
          {t.aspectRatio}
        </h3>
        <div className="grid-2col">
          <button
            className={`style-option-btn ${styleConfig.aspectRatio === '9:16' ? 'active' : ''}`}
            onClick={() => updateConfig('aspectRatio', '9:16')}
          >
            <span>{t.vertical}</span>
            <span style={{ fontSize: '0.7rem', opacity: 0.6 }}>{t.verticalDesc}</span>
          </button>
          <button
            className={`style-option-btn ${styleConfig.aspectRatio === '16:9' ? 'active' : ''}`}
            onClick={() => updateConfig('aspectRatio', '16:9')}
          >
            <span>{t.horizontal}</span>
            <span style={{ fontSize: '0.7rem', opacity: 0.6 }}>{t.horizontalDesc}</span>
          </button>
        </div>
      </div>

      {/* BACKGROUND SELECTOR */}
      <div className="section-card">
        <h3 className="section-card-title">
          <Film size={16} style={{ color: 'var(--secondary)' }} />
          {t.bgLoop}
        </h3>
        
        <label className="form-label" style={{ fontSize: '0.8rem', marginTop: '5px' }}>
          {t.presetsLabel}
        </label>
        <div className="background-presets">
          {generativeBgPresets.map((preset) => (
            <div
              key={preset.id}
              className={`bg-thumb ${styleConfig.bgType === preset.id ? 'active' : ''}`}
              style={{ backgroundColor: preset.color }}
              onClick={() => {
                onChange({ ...styleConfig, bgType: preset.id, customBg: null });
              }}
            >
              <div className="bg-thumb-label">{preset.name}</div>
            </div>
          ))}
        </div>

        <div style={{ margin: '15px 0', borderBottom: '1px solid var(--border-default)' }}></div>

        {/* Custom Upload */}
        <label className="form-label" style={{ fontSize: '0.8rem' }}>
          {t.customMediaLabel}
        </label>
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*,image/*"
          style={{ display: 'none' }}
          onChange={handleCustomBgChange}
        />
        
        {styleConfig.customBg ? (
          <div className="audio-meta-card" style={{ padding: '10px', fontSize: '0.85rem' }}>
            <span style={{ color: 'var(--accent)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {styleConfig.customBg.name} ({styleConfig.customBg.type})
            </span>
            <button
              className="btn btn-danger"
              style={{ padding: '4px 8px', fontSize: '0.75rem' }}
              onClick={() => {
                onChange({ ...styleConfig, bgType: 'aurora', customBg: null });
              }}
            >
              {t.remove}
            </button>
          </div>
        ) : (
          <button
            className="style-option-btn"
            style={{ width: '100%', borderStyle: 'dashed' }}
            onClick={() => fileInputRef.current.click()}
          >
            <Upload size={14} />
            {t.uploadPlaceholder}
          </button>
        )}

        {/* Background custom controls */}
        <div className="form-group" style={{ marginTop: '16px', marginBottom: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <label className="form-label" style={{ fontSize: '0.8rem', margin: 0 }}>{t.bgOpacity}</label>
            <span style={{ fontSize: '0.8rem', color: 'var(--secondary)', fontWeight: 700 }}>{Math.round(styleConfig.bgOpacity * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.1"
            max="1.0"
            step="0.05"
            value={styleConfig.bgOpacity}
            onChange={(e) => updateConfig('bgOpacity', parseFloat(e.target.value))}
          />
        </div>

        <div className="form-group" style={{ marginBottom: '5px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <label className="form-label" style={{ fontSize: '0.8rem', margin: 0 }}>{t.bgBlur}</label>
            <span style={{ fontSize: '0.8rem', color: 'var(--secondary)', fontWeight: 700 }}>{styleConfig.bgBlur}px</span>
          </div>
          <input
            type="range"
            min="0"
            max="20"
            step="1"
            value={styleConfig.bgBlur}
            onChange={(e) => updateConfig('bgBlur', parseInt(e.target.value))}
          />
        </div>
      </div>

      {/* TEXT CARD STYLE */}
      <div className="section-card">
        <h3 className="section-card-title">
          <Palette size={16} style={{ color: 'var(--accent)' }} />
          {t.subtitleCard}
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button
            className={`style-option-btn ${styleConfig.cardStyle === 'glass' ? 'active' : ''}`}
            onClick={() => updateConfig('cardStyle', 'glass')}
          >
            {t.frostedGlass}
          </button>
          <button
            className={`style-option-btn ${styleConfig.cardStyle === 'classic' ? 'active' : ''}`}
            onClick={() => updateConfig('cardStyle', 'classic')}
          >
            {t.solidBlack}
          </button>
          <button
            className={`style-option-btn ${styleConfig.cardStyle === 'none' ? 'active' : ''}`}
            onClick={() => updateConfig('cardStyle', 'none')}
          >
            {t.noCard}
          </button>
        </div>
      </div>

      {/* ARABIC TYPOGRAPHY */}
      <div className="section-card">
        <h3 className="section-card-title">
          <Type size={16} style={{ color: 'var(--primary)' }} />
          {t.arabicCalligraphy}
        </h3>
        
        <div className="form-group" style={{ marginBottom: '12px' }}>
          <label className="form-label" style={{ fontSize: '0.8rem' }}>{t.fontStyle}</label>
          <div className="grid-2col">
            <button
              className={`style-option-btn ${styleConfig.arabicFont === 'quranic' ? 'active' : ''}`}
              onClick={() => updateConfig('arabicFont', 'quranic')}
              style={{ fontFamily: 'var(--font-arabic-quranic)', fontSize: '1rem' }}
            >
              Scheherazade
            </button>
            <button
              className={`style-option-btn ${styleConfig.arabicFont === 'classic' ? 'active' : ''}`}
              onClick={() => updateConfig('arabicFont', 'classic')}
              style={{ fontFamily: 'var(--font-arabic-classic)', fontSize: '1rem' }}
            >
              Amiri
            </button>
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <label className="form-label" style={{ fontSize: '0.8rem', margin: 0 }}>{t.fontSize}</label>
            <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 700 }}>{styleConfig.arabicFontSize}px</span>
          </div>
          <input
            type="range"
            min="24"
            max="80"
            value={styleConfig.arabicFontSize}
            onChange={(e) => updateConfig('arabicFontSize', parseInt(e.target.value))}
          />
        </div>

        <div className="form-group" style={{ marginBottom: '12px' }}>
          <label className="form-label" style={{ fontSize: '0.8rem' }}>{t.textColor}</label>
          <div className="grid-2col">
            <button
              className={`style-option-btn ${styleConfig.arabicColor === '#ffffff' ? 'active' : ''}`}
              onClick={() => updateConfig('arabicColor', '#ffffff')}
            >
              {t.pureWhite}
            </button>
            <button
              className={`style-option-btn ${styleConfig.arabicColor === '#d4af37' ? 'active' : ''}`}
              onClick={() => updateConfig('arabicColor', '#d4af37')}
            >
              {t.islamicGold}
            </button>
          </div>
        </div>

        <div className="form-group" style={{ marginTop: '12px', marginBottom: '5px' }}>
          <label className="form-label" style={{ fontSize: '0.8rem' }}>{t.boldCalligraphy}</label>
          <div className="grid-2col">
            <button
              className={`style-option-btn ${styleConfig.arabicFontBold ? 'active' : ''}`}
              onClick={() => updateConfig('arabicFontBold', true)}
            >
              {t.show}
            </button>
            <button
              className={`style-option-btn ${!styleConfig.arabicFontBold ? 'active' : ''}`}
              onClick={() => updateConfig('arabicFontBold', false)}
            >
              {t.hide}
            </button>
          </div>
        </div>
      </div>

      {/* ENGLISH TRANSLATION */}
      <div className="section-card">
        <h3 className="section-card-title">
          <Type size={16} style={{ color: 'var(--secondary)' }} />
          {t.englishSubtitles}
        </h3>

        <div className="form-group" style={{ marginBottom: '12px' }}>
          <label className="form-label" style={{ fontSize: '0.8rem' }}>{t.enableTranslation}</label>
          <div className="grid-2col">
            <button
              className={`style-option-btn ${styleConfig.showEnglish ? 'active' : ''}`}
              onClick={() => updateConfig('showEnglish', true)}
            >
              {t.show}
            </button>
            <button
              className={`style-option-btn ${!styleConfig.showEnglish ? 'active' : ''}`}
              onClick={() => updateConfig('showEnglish', false)}
            >
              {t.hide}
            </button>
          </div>
        </div>

        {styleConfig.showEnglish && (
          <div className="form-group" style={{ marginBottom: '5px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <label className="form-label" style={{ fontSize: '0.8rem', margin: 0 }}>{t.englishFontSize}</label>
              <span style={{ fontSize: '0.8rem', color: 'var(--secondary)', fontWeight: 700 }}>{styleConfig.englishFontSize}px</span>
            </div>
            <input
              type="range"
              min="12"
              max="28"
              value={styleConfig.englishFontSize}
              onChange={(e) => updateConfig('englishFontSize', parseInt(e.target.value))}
            />
          </div>
        )}
      </div>

      {/* VERSE TRANSITIONS */}
      <div className="section-card">
        <h3 className="section-card-title">
          <Sparkles size={16} style={{ color: 'var(--primary)' }} />
          {t.verseTransition}
        </h3>
        <div className="grid-2col">
          <button
            className={`style-option-btn ${styleConfig.verseTransition === 'fade' ? 'active' : ''}`}
            onClick={() => updateConfig('verseTransition', 'fade')}
          >
            {t.smoothFade}
          </button>
          <button
            className={`style-option-btn ${styleConfig.verseTransition === 'none' ? 'active' : ''}`}
            onClick={() => updateConfig('verseTransition', 'none')}
          >
            {t.instantSwitch}
          </button>
        </div>
      </div>

      {/* VIDEO METADATA HEADER */}
      <div className="section-card">
        <h3 className="section-card-title">
          <Type size={16} style={{ color: 'var(--primary)' }} />
          {t.showMetadataLabel}
        </h3>
        
        <div className="form-group" style={{ marginBottom: '12px' }}>
          <label className="form-label" style={{ fontSize: '0.8rem' }}>{t.showMetadataLabel}</label>
          <div className="grid-2col">
            <button
              className={`style-option-btn ${styleConfig.showMetadata ? 'active' : ''}`}
              onClick={() => updateConfig('showMetadata', true)}
            >
              {t.show}
            </button>
            <button
              className={`style-option-btn ${!styleConfig.showMetadata ? 'active' : ''}`}
              onClick={() => updateConfig('showMetadata', false)}
            >
              {t.hide}
            </button>
          </div>
        </div>

        {styleConfig.showMetadata && (
          <>
            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label className="form-label" style={{ fontSize: '0.8rem' }}>{t.reciterPlaceholder}</label>
              <input
                type="text"
                className="form-input"
                placeholder={t.reciterPlaceholder}
                value={styleConfig.reciterName}
                onChange={(e) => updateConfig('reciterName', e.target.value)}
                style={{ width: '100%', boxSizing: 'border-box' }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '5px' }}>
              <label className="form-label" style={{ fontSize: '0.8rem' }}>{t.metadataPosLabel}</label>
              <div className="grid-2col">
                <button
                  className={`style-option-btn ${styleConfig.metadataPosition === 'top' ? 'active' : ''}`}
                  onClick={() => updateConfig('metadataPosition', 'top')}
                >
                  {t.top}
                </button>
                <button
                  className={`style-option-btn ${styleConfig.metadataPosition === 'bottom' ? 'active' : ''}`}
                  onClick={() => updateConfig('metadataPosition', 'bottom')}
                >
                  {t.bottom}
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* LAYOUT ALIGNMENT */}
      <div className="section-card">
        <h3 className="section-card-title">
          <Eye size={16} style={{ color: 'var(--accent)' }} />
          {t.overlayAlignment}
        </h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className={`style-option-btn ${styleConfig.overlayPosition === 'top' ? 'active' : ''}`}
            onClick={() => updateConfig('overlayPosition', 'top')}
            style={{ flex: 1 }}
          >
            {t.top}
          </button>
          <button
            className={`style-option-btn ${styleConfig.overlayPosition === 'center' ? 'active' : ''}`}
            onClick={() => updateConfig('overlayPosition', 'center')}
            style={{ flex: 1 }}
          >
            {t.center}
          </button>
          <button
            className={`style-option-btn ${styleConfig.overlayPosition === 'bottom' ? 'active' : ''}`}
            onClick={() => updateConfig('overlayPosition', 'bottom')}
            style={{ flex: 1 }}
          >
            {t.bottom}
          </button>
        </div>
      </div>
    </div>
  );
}
