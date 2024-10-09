import AdmZip from 'adm-zip';
import mammoth from 'mammoth';
import { cleanLatexText, cleanDocxText, removeSpecialChars } from './textCleaningService';
import { LanguageDetection, translateSectionTitles} from './languageDetectionService';

function getIncludeOrder(mainfile: string): string[] {
  const includePattern = /\\include\{([^}]+)\}/g;
  let match;
  const includeFiles: string[] = [];
  
  //suche nach Übereinstimmungen solange match !== null 
  while ((match = includePattern.exec(mainfile)) !== null) {
    //jedes gefundene include wird in den array gepushed
    includeFiles.push(match[1].trim());
  }

  return includeFiles;
}

function h1split(text: string): { chunk: string, title: string }[] {
  const h1chunks = text.split(/(?=<h1[^>]*>)/gi); //splite den text bei h1
  
  return h1chunks
  .filter(chunk => chunk.trim().length > 0)  // Entferne leere Chunks
  .map(chunk => {
    const chapternameMatch = chunk.match(/<h1[^>]*>(.*?)<\/h1>/i); // suche nach den Kapitelnamen
    const title = chapternameMatch ? chapternameMatch[1] : 'Unnamed Chapter'; // falls kein Kapitelname gefunden wurde -> unnamed
    return { chunk, title };
  });
}

export async function processZipFile(file: Express.Multer.File, mainfile: string, author: string, language: string, format: string) {
  const zip = new AdmZip(file.buffer);
  const zipEntries = zip.getEntries();
  const path = require('path');
  let allFileContent = '';
  let includeOrder: string[] = [];
  let mainFileFound = false;

  // Mainfile im zip finden
  for (const zipEntry of zipEntries) {
    const entryName = path.basename(zipEntry.entryName);
    
    // wenn mainfile gefunden -> hole include reihenfolge
    if (!zipEntry.isDirectory && entryName === mainfile) {
      mainFileFound = true; 
      const fileContent = zipEntry.getData().toString('utf-8');
      if (fileContent.includes('\\include{')) {
        includeOrder = getIncludeOrder(fileContent);
        break;
      }
    }
  }

  // error wenn mainfile nicht gefunden
  if (!mainFileFound) throw new Error(`Main file "${mainfile}" not found in ZIP`);

  //Kombiniert die TeX-Dateien in der include Reihenfolge
  for (const fileName of includeOrder) {
    //hinzufügen von .tex  zur filename falls nicht vorhanden
    const texFileName = fileName.endsWith('.tex') ? fileName : `${fileName}.tex`;
    //finde texFileName im Zip
    const zipEntry = zipEntries.find(entry => entry.entryName.endsWith(texFileName));
    //prüfung ob datei existiert und kein verzeichnis ist
    if (zipEntry && !zipEntry.isDirectory) {
        //hole text inhalt
        let fileContent = zipEntry.getData().toString('utf-8');
        //sammlung von allen datei inhalten in allFileContent
        allFileContent += fileContent + '\n';
    }
  }

  //Filtert Inhalt
  allFileContent = cleanLatexText(allFileContent);

  //Text wird bei chapters zerstückelt
  const chapters = allFileContent.split(/(?=\\chapter\{)/g);

  //geht alle chapters durch für die report generation
  const reportPromises = chapters.map((chunk) => {
    const chapternameMatch = chunk.match(/\\chapter\{([^}]+)\}/); // suche nach den Kapitelnamen
    const chapterTitle = chapternameMatch ? chapternameMatch[1] : 'Unnamed Chapter'; // falls kein Kapitelname gefunden wurde -> unnamed
    
    //generiert den text + language überprüfungen
    return LanguageDetection(chunk, language, author, format, 'tex').then((report) => {
      //gibt titel + generierten report zurück
      return `\\section{${chapterTitle}}\n${report}`;
    });
  });
  const reportParts = await Promise.all(reportPromises);
  //alle text teile zusammenfügen
  let combinedReport = reportParts.join('\n\n');

  //entferne nachträglich die generierten specialchars von openai aus dem text 
  combinedReport = removeSpecialChars(combinedReport);
  //übersetze mit deepl die Kapitelnamen
  return await translateSectionTitles(combinedReport, language);
}

export async function processDocxFile(file: Express.Multer.File, author: string, language: string, format: string) {
  //docx text zu html konvertieren
  const result = await mammoth.convertToHtml({ buffer: file.buffer });
  //Filtert Inhalt
  const text = cleanDocxText(result.value);
  //zerstückelt den text bei h1
  const chunks = h1split(text);

  //geht alle h1 chunks durch für die report generation
  const reportParts = await Promise.all(chunks.map(async ({ chunk, title }) => {
    const report = await LanguageDetection(chunk, language, author, format, 'docx');
    return `\\section{${title}}\n${report}`;
  }));

  //alle text teile zusammenfügen
  let combinedReport = reportParts.join('\n\n');
  //entferne nachträglich die generierten specialchars von openai aus dem text 
  combinedReport = removeSpecialChars(combinedReport);
  //übersetze mit deepl die Kapitelnamen
  return await translateSectionTitles(combinedReport, language);
}