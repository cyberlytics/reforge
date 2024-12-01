import { processZipFile, processDocxFile } from '../services/fileProcessingService';
import { cleanLatexText, cleanDocxText, removeSpecialChars } from '../services/textCleaningService';
import { LanguageDetection, translateSectionTitles } from '../services/languageDetectionService';
import AdmZip from 'adm-zip';
import mammoth from 'mammoth';

// Mock dependencies
jest.mock('adm-zip', () => {
  const originalModule = jest.requireActual('adm-zip');
  return {
    __esModule: true,
    ...originalModule,
    default: jest.fn().mockImplementation(() => ({
      getEntries: jest.fn(() => [
        {
          entryName: 'main.tex',
          isDirectory: false,
          getData: jest.fn(() => Buffer.from('\\include{chapter1}')),
        },
        {
          entryName: 'chapter1.tex',
          isDirectory: false,
          getData: jest.fn(() => Buffer.from('Chapter content')),
        }
      ]),  
    }))
  };
});

jest.mock('mammoth');
jest.mock('../services/textCleaningService');
jest.mock('../services/languageDetectionService');

const mockedAdmZip = AdmZip as jest.MockedClass<typeof AdmZip>;
const mockedMammoth = mammoth as jest.Mocked<typeof mammoth>;
const mockedCleanLatexText = cleanLatexText as jest.MockedFunction<typeof cleanLatexText>;
const mockedCleanDocxText = cleanDocxText as jest.MockedFunction<typeof cleanDocxText>;
const mockedRemoveSpecialChars = removeSpecialChars as jest.MockedFunction<typeof removeSpecialChars>;
const mockedLanguageDetection = LanguageDetection as jest.MockedFunction<typeof LanguageDetection>;
const mockedTranslateSectionTitles = translateSectionTitles as jest.MockedFunction<typeof translateSectionTitles>;

describe('File Processing Service', () => {
  describe('processZipFile', () => {
    const mockZipFile = { buffer: Buffer.from('mock data') } as Express.Multer.File;

    beforeEach(() => {
      jest.clearAllMocks();
    });

    test('should process ZIP file and generate report', async () => {
      // Arrange
      const mockZipEntry = {
        entryName: 'main.tex',
        isDirectory: false,
        getData: jest.fn(() => Buffer.from('\\include{chapter1}')),
      } as Partial<AdmZip.IZipEntry> as AdmZip.IZipEntry;

      const mockChapterEntry = {
        entryName: 'chapter1.tex',
        isDirectory: false,
        getData: jest.fn(() => Buffer.from('Chapter content')),
      } as Partial<AdmZip.IZipEntry> as AdmZip.IZipEntry;

      const mockAdmZipInstance = new AdmZip();
      mockAdmZipInstance.getEntries = jest.fn().mockReturnValue([mockZipEntry, mockChapterEntry]);

      mockedCleanLatexText.mockReturnValue('Cleaned LaTeX content');
      mockedLanguageDetection.mockResolvedValue('Generated report');
      mockedRemoveSpecialChars.mockReturnValue('Final cleaned report');
      mockedTranslateSectionTitles.mockResolvedValue('Translated report');

      // Act
      const result = await processZipFile(mockZipFile, 'main.tex', 'Author', 'english', 'tex');

      // Assert
      expect(mockedCleanLatexText).toHaveBeenCalledWith(expect.stringContaining('Chapter content'));
      expect(mockedLanguageDetection).toHaveBeenCalledWith(expect.any(String), 'english', 'Author', 'tex', 'tex');
      expect(mockedRemoveSpecialChars).toHaveBeenCalledWith('\\section{Unnamed Chapter}\nGenerated report');
      expect(mockedTranslateSectionTitles).toHaveBeenCalledWith('Final cleaned report', 'english');
      expect(result).toBe('Translated report');
    });
  });

  describe('processDocxFile', () => {
    const mockDocxFile = { buffer: Buffer.from('mock data') } as Express.Multer.File;

    beforeEach(() => {
      jest.clearAllMocks();
    });

    test('should process DOCX file and generate report', async () => {
      // Arrange
      mockedMammoth.convertToHtml.mockResolvedValue({
        value: '<h1>Introduction</h1><p>Content</p>',
        messages: [],
      });
      mockedCleanDocxText.mockReturnValue('Cleaned DOCX content');
      mockedLanguageDetection.mockResolvedValue('Generated report');
      mockedRemoveSpecialChars.mockReturnValue('Final cleaned report');
      mockedTranslateSectionTitles.mockResolvedValue('Translated report');

      // Act
      const result = await processDocxFile(mockDocxFile, 'Author', 'english', 'docx');

      // Assert
      expect(mockedMammoth.convertToHtml).toHaveBeenCalledWith({ buffer: mockDocxFile.buffer });
      expect(mockedCleanDocxText).toHaveBeenCalledWith('<h1>Introduction</h1><p>Content</p>');
      expect(mockedLanguageDetection).toHaveBeenCalledWith(expect.any(String), 'english', 'Author', 'docx', 'docx');
      expect(mockedRemoveSpecialChars).toHaveBeenCalledWith('\\section{Unnamed Chapter}\nGenerated report');
      expect(mockedTranslateSectionTitles).toHaveBeenCalledWith('Final cleaned report', 'english');
      expect(result).toBe('Translated report');
    });
  });
});
