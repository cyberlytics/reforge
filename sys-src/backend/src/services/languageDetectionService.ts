import { generateTechReport } from '../services/summarizerService';
import { translateText } from '../services/translationService';

// Stopwörter
const englishStopWords = ["the", "as", "by", "of", "is", "and"];
const germanStopWords = ["der", "die", "das", "von", "ist", "und"];

export function detectLanguageUsingStopWords(text: string): string {
  //text zu kleinbuchstaben & alle mit leerzeichen getrennten wörter in ein array
  const words = text.toLowerCase().split(/\s+/);
  
  let englishCount = 0;
  let germanCount = 0;

  //jedes wort wird auf übereinstimmung mit den stopwörtern geprüft
  words.forEach(word => {
    if (englishStopWords.includes(word)) {
      englishCount++;
    }
    if (germanStopWords.includes(word)) {
      germanCount++;
    }
  });

  //die detected sprache ist die sprache mit dem höherem counter
  if (englishCount > germanCount) {
    return "english";
  } else if (germanCount > englishCount) {
    return "deutsch";
  } else {
    return "Unknown";
  }
}

export async function LanguageDetection(
    content: string,
    expectedLanguage: string,
    author: string,
    format: string,
    docType: string
  ): Promise<string> {
  
  let summary = '';
  let detectedLanguage = '';
  
  //generiere solange bis erkannte sprache = gefundene sprache
  do {
    summary = await generateTechReport(content, expectedLanguage, format, docType);
    //überprüft den generierten text auf seine sprache
    detectedLanguage = detectLanguageUsingStopWords(summary);
  
    console.log(`Erkannte Sprache: ${detectedLanguage}. Erwartete Sprache: ${expectedLanguage}.`);
  
    //wenn die erkannte sprache der erwarteten sprache nicht übereinstimmt -> neuen text generieren
    if (detectedLanguage.toLowerCase() !== expectedLanguage.toLowerCase()) {
      console.log(`Sprache nicht korrekt erkannt. Versuche erneut...`);
    }
  
  } while (detectedLanguage.toLowerCase() !== expectedLanguage.toLowerCase());
  
  console.log(`Sprache korrekt als ${detectedLanguage} erkannt.`);
  
  return summary;
}

export async function translateSectionTitles(content: string, targetLanguage: string): Promise<string> {
  const sectionRegex = /\\section\{([^}]+)\}/g;
  let match;
  let translatedContent = content;
  
  // Suche alle \section{}-Titel
  while ((match = sectionRegex.exec(content)) !== null) {
    const sectionTitle = match[1];

    //übersetze den kapiteltitel mit deepl 
    const translatedSectionTitle = await translateText(sectionTitle, targetLanguage);

    const originalSection = `\\section{${sectionTitle}}`;
    const translatedSection = `\\section{${translatedSectionTitle}}`;
    
    //ersetze den alten titel mit dem neuen titel
    translatedContent = translatedContent.replace(originalSection, translatedSection);
  }
  
  return translatedContent;
}