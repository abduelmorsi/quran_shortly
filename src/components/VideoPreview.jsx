import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, Volume2 } from 'lucide-react';

// Shared function to draw generative backgrounds on canvas
export function drawGenerativeBackground(ctx, width, height, type, time) {
  ctx.save();
  
  if (type === 'aurora') {
    // Deep purple base
    ctx.fillStyle = '#090514';
    ctx.fillRect(0, 0, width, height);

    // Glowing purple orbit
    const grad1 = ctx.createRadialGradient(
      width * 0.5 + Math.sin(time * 0.001) * width * 0.3,
      height * 0.3 + Math.cos(time * 0.0015) * height * 0.2,
      0,
      width * 0.5 + Math.sin(time * 0.001) * width * 0.3,
      height * 0.3 + Math.cos(time * 0.0015) * height * 0.2,
      width * 0.8
    );
    grad1.addColorStop(0, 'rgba(139, 92, 246, 0.25)'); // Violet
    grad1.addColorStop(0.5, 'rgba(88, 28, 135, 0.08)');
    grad1.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad1;
    ctx.fillRect(0, 0, width, height);

    // Glowing cyan accent orbit
    const grad2 = ctx.createRadialGradient(
      width * 0.3 + Math.cos(time * 0.0008) * width * 0.2,
      height * 0.7 + Math.sin(time * 0.0012) * height * 0.2,
      0,
      width * 0.3 + Math.cos(time * 0.0008) * width * 0.2,
      height * 0.7 + Math.sin(time * 0.0012) * height * 0.2,
      width * 0.6
    );
    grad2.addColorStop(0, 'rgba(6, 182, 212, 0.15)'); // Cyan
    grad2.addColorStop(0.6, 'rgba(15, 23, 42, 0)');
    ctx.fillStyle = grad2;
    ctx.fillRect(0, 0, width, height);

  } else if (type === 'sunset') {
    // Rich crimson/black base
    ctx.fillStyle = '#140805';
    ctx.fillRect(0, 0, width, height);

    // Golden solar core
    const grad1 = ctx.createRadialGradient(
      width * 0.5 + Math.cos(time * 0.0006) * width * 0.15,
      height * 0.55 + Math.sin(time * 0.0009) * height * 0.1,
      0,
      width * 0.5 + Math.cos(time * 0.0006) * width * 0.15,
      height * 0.55 + Math.sin(time * 0.0009) * height * 0.1,
      width * 0.7
    );
    grad1.addColorStop(0, 'rgba(217, 119, 6, 0.28)'); // Gold
    grad1.addColorStop(0.5, 'rgba(120, 53, 4, 0.08)');
    grad1.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad1;
    ctx.fillRect(0, 0, width, height);

    // Rose pink clouds
    const grad2 = ctx.createRadialGradient(
      width * 0.7 + Math.sin(time * 0.001) * width * 0.2,
      height * 0.25 + Math.cos(time * 0.0007) * height * 0.15,
      0,
      width * 0.7 + Math.sin(time * 0.001) * width * 0.2,
      height * 0.25 + Math.cos(time * 0.0007) * height * 0.15,
      width * 0.5
    );
    grad2.addColorStop(0, 'rgba(244, 63, 94, 0.12)'); // Rose
    grad2.addColorStop(0.6, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad2;
    ctx.fillRect(0, 0, width, height);

  } else if (type === 'nebula') {
    // Deep slate base
    ctx.fillStyle = '#030712';
    ctx.fillRect(0, 0, width, height);

    // Royal Blue glowing nebula
    const grad1 = ctx.createRadialGradient(
      width * 0.3 + Math.sin(time * 0.0005) * width * 0.2,
      height * 0.4 + Math.cos(time * 0.0008) * height * 0.2,
      0,
      width * 0.3 + Math.sin(time * 0.0005) * width * 0.2,
      height * 0.4 + Math.cos(time * 0.0008) * height * 0.2,
      width * 0.9
    );
    grad1.addColorStop(0, 'rgba(29, 78, 216, 0.22)'); // Blue
    grad1.addColorStop(0.6, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad1;
    ctx.fillRect(0, 0, width, height);

    // Fuchsia nebulous clouds
    const grad2 = ctx.createRadialGradient(
      width * 0.7 + Math.cos(time * 0.0007) * width * 0.2,
      height * 0.6 + Math.sin(time * 0.0005) * height * 0.2,
      0,
      width * 0.7 + Math.cos(time * 0.0007) * width * 0.2,
      height * 0.6 + Math.sin(time * 0.0005) * height * 0.2,
      width * 0.7
    );
    grad2.addColorStop(0, 'rgba(217, 70, 239, 0.15)'); // Fuchsia
    grad2.addColorStop(0.6, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad2;
    ctx.fillRect(0, 0, width, height);

  } else if (type === 'emerald') {
    // Deep ocean teal base
    ctx.fillStyle = '#022c22';
    ctx.fillRect(0, 0, width, height);

    // Glowing green core
    const grad1 = ctx.createRadialGradient(
      width * 0.5 + Math.sin(time * 0.0008) * width * 0.2,
      height * 0.5 + Math.cos(time * 0.0007) * height * 0.2,
      0,
      width * 0.5 + Math.sin(time * 0.0008) * width * 0.2,
      height * 0.5 + Math.cos(time * 0.0007) * height * 0.2,
      width * 0.8
    );
    grad1.addColorStop(0, 'rgba(16, 185, 129, 0.22)'); // Emerald
    grad1.addColorStop(0.6, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad1;
    ctx.fillRect(0, 0, width, height);

    // Pale Mint ambient light
    const grad2 = ctx.createRadialGradient(
      width * 0.4 + Math.cos(time * 0.001) * width * 0.15,
      height * 0.2 + Math.sin(time * 0.0012) * height * 0.15,
      0,
      width * 0.4 + Math.cos(time * 0.001) * width * 0.15,
      height * 0.2 + Math.sin(time * 0.0012) * height * 0.15,
      width * 0.5
    );
    grad2.addColorStop(0, 'rgba(52, 211, 153, 0.1)'); // Mint
    grad2.addColorStop(0.6, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad2;
    ctx.fillRect(0, 0, width, height);
  }

  // Draw delicate floating star particles
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  for (let i = 0; i < 30; i++) {
    const seedX = (Math.sin(i * 1234.5 + time * 0.00005) + 1) * 0.5;
    const seedY = (Math.cos(i * 5432.1 + time * 0.00003) + 1) * 0.5;
    const seedSize = (Math.sin(i * 999 + time * 0.002) + 1) * 0.5 * 1.5 + 0.5;
    ctx.fillRect(seedX * width, seedY * height, seedSize, seedSize);
  }

  ctx.restore();
}

// Helper to wrap Arabic & English text on canvas beautifully
export function wrapText(ctx, text, x, y, maxWidth, lineHeight, isArabic) {
  const words = text.split(' ');
  let line = '';
  let lines = [];

  // Since Arabic is RTL, standard browser text alignment takes care of it,
  // but we still need to split and wrap lines correctly.
  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      lines.push(line.trim());
      line = words[n] + ' ';
    } else {
      line = testLine;
    }
  }
  lines.push(line.trim());
  
  return lines;
}

export default function VideoPreview({ audio, verses, timestamps, styleConfig }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  
  const canvasRef = useRef(null);
  const audioRef = useRef(null);
  const videoElementRef = useRef(null);
  const imageElementRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Sync refs to prevent render lag and closure bugs
  const styleConfigRef = useRef(styleConfig);
  const versesRef = useRef(verses);
  const timestampsRef = useRef(timestamps);
  const isPlayingRef = useRef(isPlaying);

  useEffect(() => {
    styleConfigRef.current = styleConfig;
    versesRef.current = verses;
    timestampsRef.current = timestamps;
    isPlayingRef.current = isPlaying;
  }, [styleConfig, verses, timestamps, isPlaying]);

  // Sync isPlaying state
  const handleTogglePlay = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      if (videoElementRef.current) videoElementRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(err => console.error("Play failed:", err));
      if (videoElementRef.current) {
        videoElementRef.current.play().catch(err => console.error("Video play failed:", err));
      }
      setIsPlaying(true);
    }
  };

  // Determine current active verse based on time (reading from refs)
  const getActiveVerse = (time) => {
    const currentTimestamps = timestampsRef.current;
    const currentVerses = versesRef.current;
    if (!currentTimestamps || currentTimestamps.length === 0) return null;
    
    for (let i = 0; i < currentVerses.length; i++) {
      const start = currentTimestamps[i];
      // Keep last verse active all the way to the end of the audio to prevent early disappearance
      const end = i === currentVerses.length - 1 ? (audio ? audio.duration : 999999) : currentTimestamps[i + 1];
      
      // Use the tapped end timestamp for the fade-out boundary if available
      const fadeOutEnd = i === currentVerses.length - 1 ? (currentTimestamps[currentVerses.length] || end) : end;
      
      if (start !== null && end !== null && time >= start && time <= end) {
        return { verse: currentVerses[i], start, end: fadeOutEnd };
      }
    }
    return null;
  };

  // Main canvas rendering loop
  const renderCanvasFrame = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const time = Date.now();
    const playTime = audioRef.current ? audioRef.current.currentTime : 0;
    setCurrentTime(playTime);

    // Extract the latest values from refs to keep the frame draw perfect
    const styleConfig = styleConfigRef.current;
    const verses = versesRef.current;
    const timestamps = timestampsRef.current;

    // 1. Draw Background
    ctx.save();
    if (styleConfig.bgBlur && styleConfig.bgBlur > 0) {
      ctx.filter = `blur(${styleConfig.bgBlur}px)`;
    }

    if (styleConfig.customBg) {
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, height);
      
      if (styleConfig.customBg.type === 'video' && videoElementRef.current) {
        // Sync custom video time with audio time if playing (loop video) safely without pile-up seeks
        const video = videoElementRef.current;
        if (isPlaying && !video.seeking && Math.abs(video.currentTime - (playTime % (video.duration || 10))) > 0.5) {
          video.currentTime = playTime % (video.duration || 10);
        }
        ctx.drawImage(video, 0, 0, width, height);
      } else if (styleConfig.customBg.type === 'image' && imageElementRef.current) {
        ctx.drawImage(imageElementRef.current, 0, 0, width, height);
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

    // 2. Overlay Verses
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
      
      // Determine Y coordinate based on Position
      let overlayY = height * 0.8; // default bottom
      if (styleConfig.overlayPosition === 'top') {
        overlayY = height * 0.2;
      } else if (styleConfig.overlayPosition === 'center') {
        overlayY = height * 0.5;
      }

      const cardMaxWidth = width * 0.85;
      const paddingX = 24;
      const paddingY = 24;

      // Font parameters
      const arabicFont = styleConfig.arabicFont === 'quranic' ? "'Scheherazade New', serif" : "'Amiri', serif";
      const arabicFontSize = styleConfig.arabicFontSize;
      const arabicLineHeight = arabicFontSize * 2.2; // Exceptional line height for stacked Quranic vocalization (tashkeel)
      
      const englishFontSize = styleConfig.englishFontSize;
      const englishLineHeight = englishFontSize * 1.45; // Premium vertical space for subtitles

      // Calculate heights and wrap texts to size the card beforehand
      ctx.font = `bold ${arabicFontSize}px ${arabicFont}`;
      const arabicLines = wrapText(ctx, activeVerse.text, 0, 0, cardMaxWidth - (paddingX * 2), arabicLineHeight, true);
      
      let englishLines = [];
      if (styleConfig.showEnglish) {
        ctx.font = `${englishFontSize}px var(--font-sans)`;
        englishLines = wrapText(ctx, activeVerse.translation, 0, 0, cardMaxWidth - (paddingX * 2), englishLineHeight, false);
      }

      // Compute total content block height
      const spaceBetween = styleConfig.showEnglish ? 24 : 0; // Increased spacing for nice separation
      const totalContentHeight = 
        (arabicLines.length * arabicLineHeight) + 
        spaceBetween + 
        (englishLines.length * englishLineHeight);

      const cardWidth = cardMaxWidth;
      const cardHeight = totalContentHeight + (paddingY * 2);
      const cardX = (width - cardWidth) / 2;
      let cardY = overlayY - (cardHeight / 2); // Center card vertically on alignment point

      // Safe bounds layout constraint: slide card up or down to guarantee it never overflows the viewport
      const safeMargin = 16;
      if (cardY < safeMargin) {
        cardY = safeMargin;
      }
      if (cardY + cardHeight > height - safeMargin) {
        cardY = height - cardHeight - safeMargin;
      }

      // Draw Card Backdrop
      if (styleConfig.cardStyle === 'glass') {
        // Frosted Glass Card
        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
        ctx.shadowBlur = 20;
        ctx.shadowOffsetY = 10;
        
        ctx.fillStyle = 'rgba(10, 11, 20, 0.65)';
        
        // Rounded Rect Path
        ctx.beginPath();
        ctx.roundRect(cardX, cardY, cardWidth, cardHeight, 16);
        ctx.fill();

        // Border Glow
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();
      } else if (styleConfig.cardStyle === 'classic') {
        // High Contrast Solid Black
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.82)';
        ctx.beginPath();
        ctx.roundRect(cardX, cardY, cardWidth, cardHeight, 8);
        ctx.fill();
        ctx.restore();
      }

      // Draw Calligraphy Arabic Script
      ctx.save();
      const isBold = styleConfig.arabicFontBold !== false ? 'bold ' : '';
      ctx.font = `${isBold}${arabicFontSize}px ${arabicFont}`;
      ctx.fillStyle = styleConfig.arabicColor;
      ctx.textAlign = 'center';
      
      // Arabic Text Glow
      ctx.shadowColor = styleConfig.arabicColor === '#d4af37' ? 'rgba(212, 175, 55, 0.6)' : 'rgba(255, 255, 255, 0.5)';
      ctx.shadowBlur = 10;

      let drawY = cardY + paddingY + (arabicFontSize * 0.85); // Adjust baseline alignment

      arabicLines.forEach((line) => {
        ctx.fillText(line, width / 2, drawY);
        drawY += arabicLineHeight;
      });
      ctx.restore();

      // Draw English Subtitles
      if (styleConfig.showEnglish && englishLines.length > 0) {
        ctx.save();
        ctx.font = `500 ${englishFontSize}px var(--font-sans)`;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetY = 2;

        let englishDrawY = cardY + paddingY + (arabicLines.length * arabicLineHeight) + spaceBetween + (englishFontSize * 0.85);

        englishLines.forEach((line) => {
          ctx.fillText(line, width / 2, englishDrawY);
          englishDrawY += englishLineHeight;
        });
        ctx.restore();
      }

      ctx.restore();
    }

    // 3. Draw Metadata Header (Surah and Reciter)
    if (styleConfig.showMetadata) {
      ctx.save();
      const isArabicUI = document.documentElement.lang === 'ar';
      
      const metaFontSize = 14;
      const reciterFontSize = 12;
      
      ctx.font = `600 ${metaFontSize}px var(--font-sans)`;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.textAlign = 'center';
      
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetY = 1;
      
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
      
      // Fine-tuned placement based on aspect ratio
      const isVertical = styleConfig.aspectRatio === '9:16';
      let metaY = styleConfig.metadataPosition === 'top' 
        ? (isVertical ? height * 0.08 : height * 0.12) 
        : (isVertical ? height * 0.92 : height * 0.88);
      
      ctx.fillText(metadataText, width / 2, metaY);
      
      if (styleConfig.reciterName) {
        ctx.font = `500 ${reciterFontSize}px var(--font-sans)`;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        
        const reciterText = isArabicUI 
          ? `بصوت: ${styleConfig.reciterName}` 
          : `Reciter: ${styleConfig.reciterName}`;
        ctx.fillText(reciterText, width / 2, metaY + 16);
      }
      ctx.restore();
    }

    // Cancel any active animation frames before scheduling the next recursive tick to avoid loop accumulation leaks
    if (isPlaying) {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = requestAnimationFrame(renderCanvasFrame);
    }
  };

  // Re-run canvas paint if any style changes while paused (prevents duplicate draw loops when playing)
  useEffect(() => {
    if (!isPlaying) {
      renderCanvasFrame();
    }
  }, [styleConfig, verses, timestamps, isPlaying]);

  // Handle canvas animation thread play/pause state transitions
  useEffect(() => {
    if (isPlaying) {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = requestAnimationFrame(renderCanvasFrame);
    } else {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    }
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isPlaying]);

  // Handle custom background media changes
  useEffect(() => {
    if (videoElementRef.current && styleConfig.customBg?.type === 'video') {
      videoElementRef.current.load();
      if (isPlaying) {
        videoElementRef.current.play().catch(err => console.error("Custom video play fail:", err));
      }
    }
    renderCanvasFrame();
  }, [styleConfig.customBg]);

  // Format helper
  const formatTime = (time) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const canvasWidth = styleConfig.aspectRatio === '9:16' ? 360 : 640;
  const canvasHeight = styleConfig.aspectRatio === '9:16' ? 640 : 360;

  return (
    <div className="preview-container">
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src={audio.url}
        onEnded={() => setIsPlaying(false)}
        preload="auto"
      />

      {/* Hidden background assets for canvas drawing */}
      {styleConfig.customBg && styleConfig.customBg.type === 'video' && (
        <video
          ref={videoElementRef}
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
          ref={imageElementRef}
          src={styleConfig.customBg.url}
          style={{ display: 'none' }}
          alt="Custom background"
          crossOrigin="anonymous"
        />
      )}

      {/* High Fidelity Live Render Canvas */}
      <div
        className="video-viewport"
        style={{
          width: styleConfig.aspectRatio === '9:16' ? '300px' : '100%',
          maxWidth: styleConfig.aspectRatio === '9:16' ? '300px' : '560px',
          aspectRatio: styleConfig.aspectRatio === '9:16' ? '9 / 16' : '16 / 9',
          height: 'auto',
          transition: 'all 0.3s ease'
        }}
      >
        <canvas
          ref={canvasRef}
          width={canvasWidth}
          height={canvasHeight}
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />
      </div>

      {/* Control overlay toolbar */}
      <div className="sync-player-controls" style={{ width: '100%', maxWidth: styleConfig.aspectRatio === '9:16' ? '300px' : '560px' }}>
        <button className="btn btn-primary" onClick={handleTogglePlay} style={{ borderRadius: '24px', padding: '8px 16px' }}>
          {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          {isPlaying ? 'Pause' : 'Play Recitation'}
        </button>

        <span className="audio-time-label" style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Volume2 size={16} />
          {formatTime(currentTime)} / {formatTime(audio.duration)}
        </span>
      </div>
    </div>
  );
}
