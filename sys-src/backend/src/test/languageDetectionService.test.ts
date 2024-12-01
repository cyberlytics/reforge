import { detectLanguageUsingStopWords, LanguageDetection, translateSectionTitles } from '../services/languageDetectionService';
import { generateTechReport } from '../services/summarizerService';
import { translateText } from '../services/translationService';

jest.mock('../services/summarizerService');
jest.mock('../services/translationService');

const mockedGenerateTechReport = generateTechReport as jest.MockedFunction<typeof generateTechReport>;
const mockedTranslateText = translateText as jest.MockedFunction<typeof translateText>;

describe('detectLanguageUsingStopWords', () => {
  test('should detect English', () => {
    const text = "Artificial intelligence (AI) has become increasingly important in recent years and will continue to play an important role in the future.";
    const result = detectLanguageUsingStopWords(text);
    expect(result).toBe("english");
  });

  test('should detect German', () => {
    const text = "Die Künstliche Intelligenz (KI) hat in den letzten Jahren immer mehr an Bedeutung gewonnen und wird auch in Zukunft eine wichtige Rolle spielen.";
    const result = detectLanguageUsingStopWords(text);
    expect(result).toBe("deutsch");
  });

  test('should detect Unknown', () => {
    const text = "Lorem ipsum dolor sit amet.";
    const result = detectLanguageUsingStopWords(text);
    expect(result).toBe("Unknown");
  });
});

describe('LanguageDetection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should generate summary until detected language matches expected language', async () => {
    //Arrange
    mockedGenerateTechReport.mockResolvedValueOnce('This is a summary with the and is.')
                            .mockResolvedValueOnce('Dies ist eine Zusammenfassung mit der und.');
    const content = "Some content to summarize.";

    //Act
    const result = await LanguageDetection(content, "deutsch", "Author", "docx", "summary");

    //Assert
    expect(mockedGenerateTechReport).toHaveBeenCalledTimes(2);
    expect(mockedGenerateTechReport).toHaveBeenCalledWith(content, "deutsch", "docx", "summary");
    expect(result).toBe('Dies ist eine Zusammenfassung mit der und.');
  });

  test('should return if detected language matches expected language', async () => {
    //Arrange
    mockedGenerateTechReport.mockResolvedValueOnce('This is a summary with the and is.');
    const content = "Some content to summarize.";

    //Act
    const result = await LanguageDetection(content, "english", "Author", "docx", "summary");

    //Assert
    expect(mockedGenerateTechReport).toHaveBeenCalledTimes(1);
    expect(mockedGenerateTechReport).toHaveBeenCalledWith(content, "english", "docx", "summary");
    expect(result).toBe('This is a summary with the and is.');
  });

  test('should throw error if generateTechReport fails', async () => {
    //Arrange
    mockedGenerateTechReport.mockRejectedValue(new Error('Error generating report'));
    const content = "Some content to summarize.";

    //Act
    await expect(LanguageDetection(content, "english", "Author", "docx", "summary")).rejects.toThrow(
      'Error generating report'
    );

    //Assert
    expect(mockedGenerateTechReport).toHaveBeenCalled();
  });
});

describe('translateSectionTitles', () => {
  test('should translate section titles correctly', async () => {
    //Arrange
    const content = `
      \\section{Introduction}
      \\section{Methodology}
      \\section{Results}
    `;

    mockedTranslateText
      .mockResolvedValueOnce('Einleitung')
      .mockResolvedValueOnce('Methodik')
      .mockResolvedValueOnce('Ergebnisse');

    //Act
    const result = await translateSectionTitles(content, "german");

    //Assert
    expect(mockedTranslateText).toHaveBeenCalledTimes(3);
    expect(mockedTranslateText).toHaveBeenNthCalledWith(1, 'Introduction', 'german');
    expect(mockedTranslateText).toHaveBeenNthCalledWith(2, 'Methodology', 'german');
    expect(mockedTranslateText).toHaveBeenNthCalledWith(3, 'Results', 'german');

    expect(result).toBe(`
      \\section{Einleitung}
      \\section{Methodik}
      \\section{Ergebnisse}
    `);
  });
});
