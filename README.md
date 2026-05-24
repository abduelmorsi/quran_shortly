# 📖 Quran Shortly - Recitation Video Generator

**Quran Shortly** is a premium, client-side web application designed to generate high-definition social media videos (YouTube Shorts, TikTok, Instagram Reels, widescreen) of Quran recitations. Users can upload recitation audio, choose Surahs and verse ranges, sync typography in real-time, custom-design overlays with glassmorphism and gold calligraphic themes, and compile crystal-clear videos with mixed audio tracks—all directly in the browser.

---

## ✨ Features

### 🎙️ 1. Setup & Intelligent Quran Services
- **Drag-and-Drop Audio Uploader**: Easy file ingestion for MP3, WAV, and M4A recitation clips.
- **Autocomplete Surah Search**: Quick search through all 114 Surahs (in English and Arabic script) with sliders for precise Ayah ranges.
- **Unified Cloud API Ingestion**: Fetches Uthmani Calligraphy script (`quran-uthmani`) and Sahih International translation (`en.sahih`) in a single network round-trip.

### ⏱️ 2. Real-Time Timeline Synchronizer
- **Spacebar / Tap-to-Sync**: A highly satisfying tapping board to mark the beginning and end of each verse in real-time.
- **Manual Micro-Adjustments**: Side timeline panel with millisecond adjustment boxes for absolute syncing precision.

### 🎨 3. Elegant Dark-Glass Customizer
- **Dynamic Layout Dimensions**: Toggle between **9:16 Portrait** (Shorts/TikTok) and **16:9 Widescreen** (YouTube) configurations.
- **Generative Background Loops**: 4 CORS-safe animated ambient loop themes (*Aurora Orbit*, *Sunset Glow*, *Cosmic Nebula*, and *Deep Oasis*) or custom user-uploaded images and videos.
- **Frosted Glass Cards**: Premium glassmorphic caption cards utilizing blur filters and sleek borders.
- **Breathing-Room Typography Layouts**: Mathematically un-tangled calligraphy vertical grids, separating Arabic Calligraphy lines and English translations to eliminate overlaps.
- **Islamic Gold Theme**: Dedicated high-contrast colors and custom glows for Uthmani scripts.

### 🌀 4. Smooth Verse Transitions
- **Bessel-Curve Opacity Transitions**: Seamlessly fades verses in (first `350ms`) and out (final `350ms`) for a premium flow.
- **Untruncated Final Rendering**: The last verse is kept active until the absolute end of the audio track, resolving the blank frame issue during recording.

### 🌍 5. Native Bilingual Localization (EN / AR)
- **Automatic RTL Mirroring**: Full native support for **Right-to-Left (RTL)** layout flows when **العربية** is selected.
- **Language Toggler**: Switch instant translation dictionaries (`locales.js`) across the header, wizard HUD, upload panels, design settings, and compile modules.

### 🎥 6. HD High-Speed Canvas Exporter
- **Frame-by-Frame Recording**: Captures standard `720p/1080p` frames synchronously at 30 FPS.
- **Web Audio API Mixing Node**: Captures and mixes the original narration audio directly into the output stream for crystal-clear sound.
- **High-Bitrate MediaRecorder**: Assembles high-bitrate WebM video files ready for social sharing.

---

## 🛠️ Tech Stack

- **Core**: React 19 + Vite
- **Styling**: Vanilla CSS (Premium responsive custom theme, glassmorphism variables, dark-mode gradients)
- **Icons**: Lucide React
- **API**: Al-Quran Cloud API

---

## 🚀 Getting Started

### 📋 Prerequisites
- Make sure you have **Node.js** (v18+) installed.

### 💻 Installation
1. Clone or copy the repository files into your workspace directory.
2. Open a terminal (PowerShell/Bash) in the project directory.
3. Install dependencies:
   ```bash
   npm install
   ```

### ⚡ Running the App
Start the local development server:
```bash
npm run dev
```
Open your browser and navigate to the local address displayed in your terminal (usually [http://localhost:5173](http://localhost:5173) or [http://localhost:5174](http://localhost:5174)).

### 📦 Building for Production
To bundle the application into a highly optimized client bundle in the `/dist` directory:
```bash
npm run build
```

---

## 📂 Project Structure

```text
quran_shortly/
├── src/
│   ├── components/
│   │   ├── AudioUploader.jsx      # Drag & Drop audio panel
│   │   ├── SurahSelector.jsx      # Autocomplete Surah & Range sliders
│   │   ├── SyncTimeline.jsx       # Tapping timeline and manual inputs
│   │   ├── StyleEditor.jsx        # Customizer panels and transition toggles
│   │   ├── VideoPreview.jsx       # High-fidelity live canvas loop renderer
│   │   └── VideoExporter.jsx      # MediaRecorder-based HD video compiler
│   ├── services/
│   │   └── QuranService.js        # Cloud API aggregator
│   ├── locales.js                 # Central EN/AR translation dictionaries
│   ├── App.jsx                    # Wizard coordinator & RTL layout toggler
│   ├── index.css                  # Unified dark-glass styles
│   └── main.jsx                   # React mount entry
├── index.html                     # Main application shell with SEO tags
├── package.json
└── vite.config.js
```

---

## 🎬 How to Generate Your First Video

1. **Upload**: Select an audio recitation file (`MP3`, `WAV`, or `M4A`).
2. **Select Verses**: Search for a Surah and slide the range bars to define your Ayah coordinates. Click **Next Step**.
3. **Sync**: Play the audio. Hit the **Spacebar** or click the big card in real-time as each verse begins. Tap once more at the end of the recitation to set the final cutoff. Click **Next Step**.
4. **Design**: Select vertical or widescreen, customize card backdrops (frosted glass vs solid black), change Arabic fonts (Scheherazade vs Amiri), adjust size sliders, select gold themes, toggle English subtitles, and select a smooth transition.
5. **Export**: Go to **Compile & Export**, click **Start Video Compilation**, wait for the progress bar to finish frame stitching, and hit **Download Video**!

---

## 📜 License

Created for educational and spiritual dissemination purposes. May it be a source of benefit and blessing.
