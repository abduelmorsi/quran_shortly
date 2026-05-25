import React, { useState, useEffect, useRef } from 'react';
import { Download, Film, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { drawGenerativeBackground, wrapText } from './VideoPreview';
import ysFixWebmDuration from 'fix-webm-duration';

export default function VideoExporter({ audio, verses, timestamps, styleConfig, onBackToEdit, t }) {
  const [exportState, setExportState] = useState('idle'); // 'idle', 'exporting', 'completed', 'failed'
  const [progress, setProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const [isMp4Supported, setIsMp4Supported] = useState(false);
  const [outputFormat, setOutputFormat] = useState('webm');

  useEffect(() => {
    // Check if MP4 recording is supported in this browser
    const supported = MediaRecorder.isTypeSupported('video/mp4') || 
                      MediaRecorder.isTypeSupported('video/mp4;codecs=h264') ||
                      MediaRecorder.isTypeSupported('video/mp4;codecs=avc1,mp4a.40.2');
    setIsMp4Supported(supported);
    
    // Default to MP4 if supported, otherwise WebM
    if (supported) {
      setOutputFormat('mp4');
    } else {
      setOutputFormat('webm');
    }
  }, []);

  const exportCanvasRef = useRef(null);
  const exportAudioRef = useRef(null);
  const videoSourceRef = useRef(null);
  const imageSourceRef = useRef(null);
  
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const animationFrameRef = useRef(null);
  const isExportingRef = useRef(false);

  // Set export resolutions based on aspect ratios
  const canvasWidth = styleConfig.aspectRatio === '9:16' ? 720 : 1280;
  const canvasHeight = styleConfig.aspectRatio === '9:16' ? 1280 : 720;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelExportFrames();
      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    };
  }, [downloadUrl]);

  const cancelExportFrames = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  };

  const getActiveVerse = (time) => {
    if (!timestamps || timestamps.length === 0) return null;
    for (let i = 0; i < verses.length; i++) {
      const start = timestamps[i];
      // Keep last verse active all the way to the end of the audio to prevent early disappearance
      const end = i === verses.length - 1 ? (audio ? audio.duration : 999999) : timestamps[i + 1];
      
      // Use the tapped end timestamp for the fade-out boundary if available
      const fadeOutEnd = i === verses.length - 1 ? (timestamps[verses.length] || end) : end;
      
      if (start !== null && end !== null && time >= start && time <= end) {
        return { verse: verses[i], start, end: fadeOutEnd };
      }
    }
    return null;
  };

  // Main canvas render compilation loop
  const drawExportFrame = () => {
    const canvas = exportCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const time = Date.now();
    
    const audioEl = exportAudioRef.current;
    if (!audioEl) return;
    
    const playTime = audioEl.currentTime;

    // 1. Draw background
    ctx.save();
    if (styleConfig.bgBlur && styleConfig.bgBlur > 0) {
      ctx.filter = `blur(${styleConfig.bgBlur}px)`;
    }

    if (styleConfig.customBg) {
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, height);

      if (styleConfig.customBg.type === 'video' && videoSourceRef.current) {
        const video = videoSourceRef.current;
        // Keep video loops aligned with timestamps safely without pile-up seeks
        if (!video.seeking && Math.abs(video.currentTime - (playTime % (video.duration || 10))) > 0.5) {
          video.currentTime = playTime % (video.duration || 10);
        }
        ctx.drawImage(video, 0, 0, width, height);
      } else if (styleConfig.customBg.type === 'image' && imageSourceRef.current) {
        ctx.drawImage(imageSourceRef.current, 0, 0, width, height);
      }
    } else {
      drawGenerativeBackground(ctx, width, height, styleConfig.bgType, time);
    }
    ctx.restore();

    // Apply Background Opacity overlay (dimming)
    if (styleConfig.bgOpacity !== undefined && styleConfig.bgOpacity < 1.0) {
      ctx.save();
      ctx.fillStyle = `rgba(0, 0, 0, ${1.0 - styleConfig.bgOpacity})`;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();
    }

    // 2. Draw overlay captions
    const activeData = getActiveVerse(playTime);

    if (activeData) {
      const { verse: activeVerse, start, end } = activeData;
      ctx.save();

      // Apply fade transition if configured
      if (styleConfig.verseTransition === 'fade') {
        const elapsed = playTime - start;
        const remaining = end - playTime;
        const fadeDuration = 0.35; // 350ms transition
        const fadeIn = Math.min(1, elapsed / fadeDuration);
        const fadeOut = Math.min(1, remaining / fadeDuration);
        ctx.globalAlpha = Math.min(fadeIn, fadeOut);
      }

      // Scaled layouts for High Resolution Exporter (720p/1280p)
      const scaleMultiplier = styleConfig.aspectRatio === '9:16' ? 2 : 2; // scale factor from preview sizes
      
      let overlayY = height * 0.8;
      if (styleConfig.overlayPosition === 'top') {
        overlayY = height * 0.2;
      } else if (styleConfig.overlayPosition === 'center') {
        overlayY = height * 0.5;
      }

      const cardMaxWidth = width * 0.85;
      const paddingX = 24 * scaleMultiplier;
      const paddingY = 24 * scaleMultiplier;

      const arabicFont = styleConfig.arabicFont === 'quranic' ? "'Scheherazade New', serif" : "'Amiri', serif";
      const arabicFontSize = styleConfig.arabicFontSize * scaleMultiplier;
      const arabicLineHeight = arabicFontSize * 2.2; // Exceptional line height for stacked Quranic vocalization (tashkeel)
      
      const englishFontSize = styleConfig.englishFontSize * scaleMultiplier;
      const englishLineHeight = englishFontSize * 1.65; // Premium vertical space for subtitles (increased for legibility)

      ctx.font = `bold ${arabicFontSize}px ${arabicFont}`;
      const arabicLines = wrapText(ctx, activeVerse.text, 0, 0, cardMaxWidth - (paddingX * 2), arabicLineHeight, true);
      
      let englishLines = [];
      if (styleConfig.showEnglish) {
        ctx.font = `${englishFontSize}px 'Outfit', 'Inter', sans-serif`;
        englishLines = wrapText(ctx, activeVerse.translation, 0, 0, cardMaxWidth - (paddingX * 2), englishLineHeight, false);
      }

      const spaceBetween = styleConfig.showEnglish ? 24 * scaleMultiplier : 0; // Increased spacing for nice separation
      const totalContentHeight = 
        (arabicLines.length * arabicLineHeight) + 
        spaceBetween + 
        (englishLines.length * englishLineHeight);

      const cardWidth = cardMaxWidth;
      const cardHeight = totalContentHeight + (paddingY * 2);
      const cardX = (width - cardWidth) / 2;
      let cardY = overlayY - (cardHeight / 2);

      // Safe bounds layout constraint: slide card up or down to guarantee it never overflows the viewport
      const safeMargin = 16 * scaleMultiplier;
      if (cardY < safeMargin) {
        cardY = safeMargin;
      }
      if (cardY + cardHeight > height - safeMargin) {
        cardY = height - cardHeight - safeMargin;
      }

      // Card style rendering
      if (styleConfig.cardStyle === 'glass') {
        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
        ctx.shadowBlur = 40;
        ctx.shadowOffsetY = 20;
        
        ctx.fillStyle = 'rgba(10, 11, 20, 0.68)';
        ctx.beginPath();
        ctx.roundRect(cardX, cardY, cardWidth, cardHeight, 32);
        ctx.fill();

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.restore();
      } else if (styleConfig.cardStyle === 'classic') {
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.beginPath();
        ctx.roundRect(cardX, cardY, cardWidth, cardHeight, 16);
        ctx.fill();
        ctx.restore();
      }

      // Render Uthmani Script text
      ctx.save();
      const isBold = styleConfig.arabicFontBold !== false ? 'bold ' : '';
      ctx.font = `${isBold}${arabicFontSize}px ${arabicFont}`;
      ctx.fillStyle = styleConfig.arabicColor;
      ctx.textAlign = 'center';
      
      ctx.shadowColor = styleConfig.arabicColor === '#d4af37' ? 'rgba(212, 175, 55, 0.6)' : 'rgba(255, 255, 255, 0.5)';
      ctx.shadowBlur = 20;

      let drawY = cardY + paddingY + (arabicFontSize * 0.85);

      arabicLines.forEach((line) => {
        ctx.fillText(line, width / 2, drawY);
        drawY += arabicLineHeight;
      });
      ctx.restore();

      // Render English Sahih translation text
      if (styleConfig.showEnglish && englishLines.length > 0) {
        ctx.save();
        ctx.font = `500 ${englishFontSize}px 'Outfit', 'Inter', sans-serif`;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetY = 4;

        let englishDrawY = cardY + paddingY + (arabicLines.length * arabicLineHeight) + spaceBetween + (englishFontSize * 0.85);

        englishLines.forEach((line) => {
          ctx.fillText(line, width / 2, englishDrawY);
          englishDrawY += englishLineHeight;
        });
        ctx.restore();
      }

      ctx.restore();
    }

    // 3. Render dynamic metadata headers (Surah and Reciter)
    if (styleConfig.showMetadata) {
      ctx.save();
      const scaleMultiplier = styleConfig.aspectRatio === '9:16' ? 2 : 2;
      const isArabicUI = document.documentElement.lang === 'ar';
      
      const metaFontSize = 14 * scaleMultiplier;
      const reciterFontSize = 12 * scaleMultiplier;
      
      ctx.font = `600 ${metaFontSize}px 'Outfit', 'Inter', sans-serif`;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.textAlign = 'center';
      
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ctx.shadowBlur = 8 * scaleMultiplier;
      ctx.shadowOffsetY = 2 * scaleMultiplier;
      
      const startAyahNum = verses[0]?.numberInSurah || 1;
      const endAyahNum = verses[verses.length - 1]?.numberInSurah || startAyahNum;
      
      let surahLabel = '';
      let surahNameDisp = styleConfig.surahName || '';
      
      if (isArabicUI) {
        if (styleConfig.surahNameArabic) {
          surahNameDisp = styleConfig.surahNameArabic;
        } else {
          surahLabel = 'سورة ';
        }
      } else {
        surahLabel = 'Surah ';
      }
      
      let metadataText = '';
      if (isArabicUI && surahNameDisp.includes('سُورَة')) {
        metadataText = `${surahNameDisp} (${startAyahNum}-${endAyahNum})`;
      } else {
        metadataText = `${surahLabel}${surahNameDisp} (${startAyahNum}-${endAyahNum})`;
      }
      
      const isVertical = styleConfig.aspectRatio === '9:16';
      let metaY = styleConfig.metadataPosition === 'top' 
        ? (isVertical ? height * 0.08 : height * 0.12) 
        : (isVertical ? height * 0.92 : height * 0.88);
      
      ctx.fillText(metadataText, width / 2, metaY);
      
      if (styleConfig.reciterName) {
        ctx.font = `500 ${reciterFontSize}px 'Outfit', 'Inter', sans-serif`;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        
        const reciterText = isArabicUI 
          ? `بصوت: ${styleConfig.reciterName}` 
          : `Reciter: ${styleConfig.reciterName}`;
        ctx.fillText(reciterText, width / 2, metaY + (16 * scaleMultiplier));
      }
      ctx.restore();
    }

    // Capture frames recursively until compilation concludes
    if (isExportingRef.current) {
      animationFrameRef.current = requestAnimationFrame(drawExportFrame);
    }
  };

  const handleStartExport = async () => {
    try {
      isExportingRef.current = true;
      setExportState('exporting');
      setProgress(0);
      recordedChunksRef.current = [];

      const canvas = exportCanvasRef.current;
      const audioEl = exportAudioRef.current;

      if (!canvas || !audioEl) {
        throw new Error('Canvas or audio element not mounted');
      }

      // Reset and play custom video backgrounds if any
      if (styleConfig.customBg?.type === 'video' && videoSourceRef.current) {
        videoSourceRef.current.currentTime = 0;
        await videoSourceRef.current.play().catch(e => console.log("Video prep play:", e));
      }

      // 1. Capture Canvas Stream at 30 fps
      const canvasStream = canvas.captureStream(30);

      // 2. Mix audio using Web Audio API to guarantee crystal clear output
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const audioSourceNode = audioCtx.createMediaElementSource(audioEl);
      const audioDestinationNode = audioCtx.createMediaStreamDestination();
      
      // Connect nodes: Source -> Destination (so recorded) and Source -> Speakers (so user hears it during export!)
      audioSourceNode.connect(audioDestinationNode);
      audioSourceNode.connect(audioCtx.destination);

      // 3. Assemble combined stream
      const recordedStream = new MediaStream();
      recordedStream.addTrack(canvasStream.getVideoTracks()[0]);
      recordedStream.addTrack(audioDestinationNode.stream.getAudioTracks()[0]);

      // 4. Select standard mimeTypes based on user choice
      let mimeType = 'video/webm;codecs=vp9,opus';
      
      if (outputFormat === 'mp4') {
        const mp4Types = [
          'video/mp4;codecs=avc1,mp4a.40.2',
          'video/mp4;codecs=h264,aac',
          'video/mp4;codecs=vp9,opus',
          'video/mp4'
        ];
        const supportedType = mp4Types.find(type => MediaRecorder.isTypeSupported(type));
        if (supportedType) {
          mimeType = supportedType;
        } else {
          mimeType = 'video/mp4';
        }
      } else {
        const webmTypes = [
          'video/webm;codecs=vp9,opus',
          'video/webm;codecs=vp8,opus',
          'video/webm'
        ];
        const supportedType = webmTypes.find(type => MediaRecorder.isTypeSupported(type));
        if (supportedType) {
          mimeType = supportedType;
        }
      }

      // 5. Instantiate MediaRecorder
      const mediaRecorder = new MediaRecorder(recordedStream, {
        mimeType,
        videoBitsPerSecond: 4000000 // High 4Mbps bitrate for pristine crisp text
      });

      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        isExportingRef.current = false;
        // Collect tracks and terminate
        recordedStream.getTracks().forEach(track => track.stop());
        audioCtx.close();

        const rawBlob = new Blob(recordedChunksRef.current, { type: mimeType });

        // Fix duration metadata for WebM videos so that seek bars and progress sliders function perfectly on all players
        if (outputFormat === 'webm') {
          try {
            const durationMs = audioEl.currentTime * 1000;
            const fixedBlob = await ysFixWebmDuration(rawBlob, durationMs);
            const url = URL.createObjectURL(fixedBlob);
            setDownloadUrl(url);
          } catch (err) {
            console.error("WebM duration patching failed:", err);
            // Fallback to raw blob in case of library failure
            const url = URL.createObjectURL(rawBlob);
            setDownloadUrl(url);
          }
        } else {
          // MP4 containers naturally write duration indexes on Chromium platforms
          const url = URL.createObjectURL(rawBlob);
          setDownloadUrl(url);
        }

        setExportState('completed');
        setProgress(100);
      };

      // Seek audio to zero and start playback
      audioEl.currentTime = 0;
      audioEl.play().catch(err => {
        throw new Error('Please click inside the page to allow audio playback.');
      });

      // Start frames rendering and MediaRecorder encoding
      mediaRecorder.start(10); // Capture data chunks every 10ms
      drawExportFrame();

      // Monitor compilation progress using audio time
      const finalEndTime = timestamps[verses.length] || audio.duration;
      
      const interval = setInterval(() => {
        if (audioEl.currentTime >= finalEndTime || audioEl.ended) {
          clearInterval(interval);
          mediaRecorder.stop();
          audioEl.pause();
          if (styleConfig.customBg?.type === 'video' && videoSourceRef.current) {
            videoSourceRef.current.pause();
          }
          cancelExportFrames();
        } else {
          const currentProgress = (audioEl.currentTime / finalEndTime) * 100;
          setProgress(Math.min(99, Math.round(currentProgress)));
        }
      }, 100);

    } catch (err) {
      isExportingRef.current = false;
      console.error('Export compilation error:', err);
      setErrorMessage(err.message || 'An unexpected error occurred during rendering.');
      setExportState('failed');
      cancelExportFrames();
    }
  };

  const getFileName = () => {
    const surahName = styleConfig.surahName || 'Quran';
    const range = `${timestamps[0] ? 'synced' : 'edit'}`;
    const ext = outputFormat === 'mp4' ? 'mp4' : 'webm';
    return `Quran_Shortly_${surahName}_${range}.${ext}`;
  };

  return (
    <div className="glass-panel" style={{ maxWidth: '650px', margin: '0 auto', textAlign: 'center' }}>
      {/* Hidden high-res canvas serving the export compiler */}
      <canvas
        ref={exportCanvasRef}
        width={canvasWidth}
        height={canvasHeight}
        className="hidden-canvas"
      />

      {/* Hidden compilation assets */}
      <audio
        ref={exportAudioRef}
        src={audio.url}
        preload="auto"
      />

      {styleConfig.customBg && styleConfig.customBg.type === 'video' && (
        <video
          ref={videoSourceRef}
          src={styleConfig.customBg.url}
          style={{ display: 'none' }}
          loop
          muted
          playsInline
          crossOrigin="anonymous"
        />
      )}
      {styleConfig.customBg && styleConfig.customBg.type === 'image' && (
        <img
          ref={imageSourceRef}
          src={styleConfig.customBg.url}
          style={{ display: 'none' }}
          alt="Export background"
          crossOrigin="anonymous"
        />
      )}

      {/* IDLE VIEW */}
      {exportState === 'idle' && (
        <div className="export-panel-layout">
          <div className="logo-icon" style={{ width: '72px', height: '72px', borderRadius: '20px', margin: '0 auto' }}>
            <Film size={40} />
          </div>
          <div>
            <h2 className="glass-title" style={{ fontSize: '1.6rem' }}>{t.compileTitle}</h2>
            <p className="glass-description" style={{ marginTop: '8px' }}>
              {t.compileDesc}
            </p>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-default)', width: '100%', fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'initial', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <h4 style={{ margin: '0 0 4px 0', color: '#fff', fontSize: '0.9rem' }}>{t.detailsLabel}</h4>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>{t.aspectRatioLabel}</span>
              <strong style={{ color: '#fff' }}>{styleConfig.aspectRatio}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>{t.resolutionLabel}</span>
              <strong style={{ color: '#fff' }}>{canvasWidth} x {canvasHeight}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>{t.outputFormatLabel}</span>
              <strong style={{ color: '#fff' }}>{outputFormat.toUpperCase()} Video</strong>
            </div>
          </div>

          {/* Format Selector Choice */}
          <div style={{ width: '100%', textAlign: 'initial', marginTop: '4px', marginBottom: '4px' }}>
            <label className="form-label" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              {t.outputFormatOption || 'Video Output Format'}
            </label>
            <div className="grid-2col" style={{ marginTop: '6px' }}>
              <button
                className={`style-option-btn ${outputFormat === 'mp4' ? 'active' : ''}`}
                onClick={() => isMp4Supported && setOutputFormat('mp4')}
                disabled={!isMp4Supported}
                style={{ opacity: isMp4Supported ? 1 : 0.4, cursor: isMp4Supported ? 'pointer' : 'not-allowed', padding: '12px 8px' }}
              >
                <span style={{ fontWeight: 700 }}>MP4</span>
                <span style={{ fontSize: '0.65rem', opacity: 0.6 }}>{t.mp4Label || 'Highly Compatible'}</span>
              </button>
              <button
                className={`style-option-btn ${outputFormat === 'webm' ? 'active' : ''}`}
                onClick={() => setOutputFormat('webm')}
                style={{ padding: '12px 8px' }}
              >
                <span style={{ fontWeight: 700 }}>WebM</span>
                <span style={{ fontSize: '0.65rem', opacity: 0.6 }}>{t.webmLabel || 'High Quality'}</span>
              </button>
            </div>
            {!isMp4Supported && (
              <p style={{ fontSize: '0.72rem', color: 'var(--danger)', marginTop: '8px', lineHeight: '1.4' }}>
                ⚠️ {t.notSupportedNote || 'MP4 recording is not natively supported in your browser. Defaulting to WebM.'}
              </p>
            )}
          </div>

          <button className="btn btn-primary" onClick={handleStartExport} style={{ width: '100%', padding: '14px', fontSize: '1rem' }}>
            <Film size={18} />
            {t.startCompile}
          </button>
        </div>
      )}

      {/* EXPORTING COMPILATION PROGRESS VIEW */}
      {exportState === 'exporting' && (
        <div className="export-panel-layout">
          <div className="export-progress-circle" style={{ '--progress': progress }}>
            <span className="export-progress-text">{progress}%</span>
          </div>

          <div>
            <h3 style={{ color: '#fff', fontSize: '1.25rem', fontWeight: 700, marginBottom: '6px' }}>{t.compilingTitle}</h3>
            <p className="glass-description" style={{ fontSize: '0.85rem' }}>
              {t.compilingDesc}
            </p>
          </div>

          <div className="export-progress-bar-linear">
            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: 600, fontSize: '0.85rem' }}>
            <Loader2 className="spinner" size={16} />
            {t.renderingFrames}
          </div>
        </div>
      )}

      {/* COMPLETED SUCCESS VIEW */}
      {exportState === 'completed' && (
        <div className="export-panel-layout">
          <div className="logo-icon" style={{ background: 'var(--accent)', width: '72px', height: '72px', borderRadius: '20px', margin: '0 auto' }}>
            <CheckCircle2 size={40} style={{ color: '#fff' }} />
          </div>

          <div>
            <h2 className="glass-title" style={{ fontSize: '1.6rem', color: 'var(--accent)' }}>{t.successTitle}</h2>
            <p className="glass-description" style={{ marginTop: '8px' }}>
              {t.successDesc}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
            <a
              href={downloadUrl}
              download={getFileName()}
              className="btn btn-success"
              style={{ flex: 1, padding: '16px', justifyContent: 'center', textDecoration: 'none', textAlign: 'center' }}
            >
              <Download size={20} />
              {t.downloadVideo}
            </a>
            
            <button
              className="btn"
              onClick={() => {
                setExportState('idle');
                if (downloadUrl) URL.revokeObjectURL(downloadUrl);
                setDownloadUrl(null);
                onBackToEdit();
              }}
              style={{ padding: '16px' }}
            >
              {t.redesignStyle}
            </button>
          </div>

          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.5 }}>
            {t.formatSupportDesc}
          </p>
        </div>
      )}

      {/* FAIL/ERROR VIEW */}
      {exportState === 'failed' && (
        <div className="export-panel-layout" style={{ gap: '20px' }}>
          <div className="logo-icon" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', width: '80px', height: '80px', borderRadius: '24px', margin: '0 auto' }}>
            <AlertTriangle size={40} style={{ color: '#f87171' }} />
          </div>

          <div>
            <h2 className="glass-title" style={{ fontSize: '1.5rem', color: '#f87171' }}>{t.failedTitle}</h2>
            <p className="glass-description" style={{ marginTop: '8px', color: '#f87171', background: 'rgba(239, 68, 68, 0.05)', padding: '12px', borderRadius: '8px', fontSize: '0.85rem' }}>
              {errorMessage}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
            <button className="btn btn-primary" onClick={handleStartExport} style={{ flex: 1 }}>
              {t.retry}
            </button>
            <button className="btn" onClick={onBackToEdit}>
              {t.editStyles}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
