import axios from 'axios';

export async function translateText(text: string, targetLanguage: string): Promise<string> {
  try {
    if(targetLanguage=='english'){targetLanguage = 'EN';}
    else{targetLanguage = 'DE';}

    const response = await axios.post('https://api-free.deepl.com/v2/translate', null, {
      params: {
        auth_key: process.env.DEEPL_API_KEY,
        text: text,                
        target_lang: targetLanguage
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    if (response.data && response.data.translations && response.data.translations.length > 0) {
      return response.data.translations[0].text;
    } else {
      throw new Error('Übersetzungsfehler: Keine gültige Antwort von DeepL erhalten.');
    }
  } catch (error) {
    console.error('Fehler bei der Übersetzung:', error);
    throw new Error('Fehler bei der Kommunikation mit DeepL API.');
  }
}