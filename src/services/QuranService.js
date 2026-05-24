/**
 * Service to interface with Al-Quran Cloud API (api.alquran.cloud)
 */

const API_BASE_URL = 'https://api.alquran.cloud/v1';

export const QuranService = {
  /**
   * Fetches list of all 114 Surahs
   * Returns array of { number, name, englishName, englishNameTranslation, numberOfAyahs }
   */
  async fetchSurahs() {
    try {
      const response = await fetch(`${API_BASE_URL}/surah`);
      if (!response.ok) {
        throw new Error('Failed to fetch Surah list');
      }
      const json = await response.json();
      return json.data || [];
    } catch (error) {
      console.error('Error fetching Surahs:', error);
      throw error;
    }
  },

  /**
   * Fetches Uthmani Arabic text and Sahih International English translation for a specific Surah,
   * then merges them into a single array of verse objects.
   * 
   * Returns an array of { numberInSurah, text, translation }
   */
  async fetchSurahVerses(surahNumber) {
    try {
      const response = await fetch(`${API_BASE_URL}/surah/${surahNumber}/editions/quran-uthmani,en.sahih`);
      if (!response.ok) {
        throw new Error(`Failed to fetch verses for Surah ${surahNumber}`);
      }
      const json = await response.json();
      
      // The API returns an array of editions in data
      const editions = json.data;
      if (!editions || editions.length < 2) {
        throw new Error('Could not retrieve both Arabic and English editions');
      }

      const arabicEdition = editions[0];
      const englishEdition = editions[1];

      const mergedVerses = arabicEdition.ayahs.map((ayah, index) => {
        const translationAyah = englishEdition.ayahs[index];
        
        // Clean up Uthmani text if needed (e.g. remove Bismillah for Surahs other than Fatiha, if it's prepended)
        // Note: The API usually prepends Bismillah to the first Ayah of every Surah except Surah 9.
        // Let's keep the raw text as it is, or we can handle it beautifully in rendering.
        
        return {
          numberInSurah: ayah.numberInSurah,
          text: ayah.text,
          translation: translationAyah ? translationAyah.text : '',
        };
      });

      return {
        surahName: arabicEdition.name,
        surahEnglishName: arabicEdition.englishName,
        verses: mergedVerses,
      };
    } catch (error) {
      console.error(`Error fetching verses for Surah ${surahNumber}:`, error);
      throw error;
    }
  }
};
