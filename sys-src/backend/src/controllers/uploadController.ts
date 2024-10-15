import { Request, Response } from 'express';
import multer from 'multer';
import { processZipFile, processDocxFile } from '../services/fileProcessingService';
import { removeSpecialChars } from '../services/textCleaningService';
import { AlignmentType, Document, Packer, Paragraph, HeadingLevel, TextRun } from 'docx';

const storage = multer.memoryStorage();
const upload = multer({ storage: storage }).single('file');

//bringt text in docx format
async function PutDocxStyle(title: string, author: string, content: string) {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // Titel
          new Paragraph({
            text: title,
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
          }),
          // Leerzeile
          new Paragraph({ text: "" }),
          // Autor
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun(author),
              new TextRun({ text: 'Fakultät Elektrotechnik, Medien und Informatik', break: 1 }),
              new TextRun({ text: 'Ostbayerische Technische Hochschule Amberg-Weiden', break: 1 }),
              new TextRun({ text: 'Amberg, Deutschland', break: 1 }),
            ],
          }),
          // Leerzeile
          new Paragraph({ text: "" }),
          // Content
          ...content.split('\n').map((sectionText) => {
            if (sectionText.startsWith('\\section')) {
              return new Paragraph({
                text: sectionText.replace('\\section', '').replace(/[{}]/g, ''),
                heading: HeadingLevel.HEADING_1,
              });
            } else {
              return new Paragraph({
                text: sectionText,
              });
            }
          }),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  return buffer;
}

export const handleFileUpload = (req: Request, res: Response) => {
  upload(req, res, async (err: any) => {
    if (err) {
      return res.status(500).json({ message: 'Error uploading file' });
    }

    const { author, title, format, language, mainfile} = req.body;
    if (!req.file || !author || !title || !format || !language) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    //Manuelles Literaturverzeichnis
    let bibliography = '';
    if(language == 'english'){
      bibliography = `\n\n\\section{Bibliography}\n` +
        `This report was generated from the uploaded file using OpenAI.\n` +
        `All sources must be added manually before publication.\n` +
        `Name of the file: ${req.file.originalname}`;
    } else {
      bibliography = `\n\n\\section{Literaturverzeichnis}\n` +
        `Dieser Bericht wurde aus der hochgeladenen Datei mit OpenAI generiert.\n` +
        `Alle Quellen müssen vor einer Veröffentlichung noch manuell ergänzt werden.\n` +
        `Name der Datei: ${req.file.originalname}`;
    }

    try {
      let combinedReport = '';

      if (req.file.originalname.endsWith('.zip')) {
        combinedReport = await processZipFile(req.file, mainfile, author, language, format);
      } else if (req.file.originalname.endsWith('.docx')) {
        combinedReport = await processDocxFile(req.file, author, language, format);
      }

      if (format === 'tex') {
        //report mit latex header/footer versehen
        let latexHeader = `\\documentclass[conference]{IEEEtran}\n` +
          `\\IEEEoverridecommandlockouts\n` +
          `\\usepackage{cite}\n` +
          `\\usepackage{amsmath,amssymb,amsfonts}\n` +
          `\\usepackage{algorithmic}\n` +
          `\\usepackage{graphicx}\n` +
          `\\usepackage{textcomp}\n` +
          `\\usepackage{xcolor}\n` +
          `\\def\\BibTeX{{\\rm B\\kern-.05em{\\sc i\\kern-.025em b}\\kern-.08em\n` +
          `    T\\kern-.1667em\\lower.7ex\\hbox{E}\\kern-.125emX}}\n` +
          `\\title{${title}}\n` +
          `\\author{\\IEEEauthorblockN{${author}}\n` +
          `\\IEEEauthorblockA{\\textit{Fakultät Elektrotechnik, Medien und Informatik} \\\\\n` +
          `\\textit{Ostbayerische Hochschule Amberg-Weiden}\\\\\n` +
          `Amberg, Deutschland}}\n` +
          `\\begin{document}\n` +
          `\\maketitle\n`;
        let latexFooter = `\n\\end{document}`;
        //Literaturverzeichnis hinzufügen
        combinedReport = latexHeader + combinedReport + bibliography + latexFooter;
        combinedReport = removeSpecialChars(combinedReport);

        res.setHeader('Content-Disposition', `attachment; filename="${title}.tex"`);
        res.setHeader('Content-Type', 'text/plain');
        res.status(200).send(combinedReport);

      } else if (format === 'docx') {
        //Literaturverzeichnis hinzufügen
        combinedReport = combinedReport + bibliography;
        combinedReport = removeSpecialChars(combinedReport);

        //report in docx umwandeln
        const docxReport = await PutDocxStyle(title, author, combinedReport);
        res.setHeader('Content-Disposition', `attachment; filename="${title}.docx"`);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        res.status(200).send(docxReport);
      }
    } catch (error) {
      console.error('Error processing file:', error);
      res.status(500).json({ message: 'Error generating report' });
    }
  });
};