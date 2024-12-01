import request from 'supertest';
import express from 'express';
import { handleFileUpload } from '../controllers/uploadController';
import { processZipFile, processDocxFile } from '../services/fileProcessingService';
import { removeSpecialChars } from '../services/textCleaningService';

jest.mock('../services/fileProcessingService');
jest.mock('../services/textCleaningService');

const mockedProcessZipFile = processZipFile as jest.MockedFunction<typeof processZipFile>;
const mockedProcessDocxFile = processDocxFile as jest.MockedFunction<typeof processDocxFile>;
const mockedRemoveSpecialChars = removeSpecialChars as jest.MockedFunction<typeof removeSpecialChars>;

// Setup des Express-Servers
const app = express();
app.use(express.json());
app.post('/upload', handleFileUpload);

describe('handleFileUpload', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should return 400 if required fields are missing', async () => {
    const response = await request(app)
      .post('/upload')
      .field('author', 'Test Author')
      .attach('file', Buffer.from('mock data'), 'test.docx');

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ message: 'Missing required fields' });
  });

  test('should process DOCX file and return docx response', async () => {
    mockedProcessDocxFile.mockResolvedValue('Generated DOCX content');
    mockedRemoveSpecialChars.mockReturnValue('Final cleaned content');

    const response = await request(app)
      .post('/upload')
      .field('author', 'Test Author')
      .field('title', 'Test Title')
      .field('format', 'docx')
      .field('language', 'english')
      .attach('file', Buffer.from('mock data'), 'test.docx');

    expect(response.status).toBe(200);
    expect(response.header['content-type']).toBe(
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    );
    expect(mockedProcessDocxFile).toHaveBeenCalled();
    expect(mockedRemoveSpecialChars).toHaveBeenCalledWith(expect.any(String));
  });

  test('should process ZIP file and return tex response', async () => {
    mockedProcessZipFile.mockResolvedValue('Generated TeX content');
    mockedRemoveSpecialChars.mockReturnValue('Final cleaned content');

    const response = await request(app)
      .post('/upload')
      .field('author', 'Test Author')
      .field('title', 'Test Title')
      .field('format', 'tex')
      .field('language', 'english')
      .field('mainfile', 'main.tex')
      .attach('file', Buffer.from('mock data'), 'test.zip');

    expect(response.status).toBe(200);
    expect(response.header['content-type']).toBe('text/plain; charset=utf-8');
    expect(mockedProcessZipFile).toHaveBeenCalledWith(expect.any(Object), 'main.tex', 'Test Author', 'english', 'tex');
    expect(mockedRemoveSpecialChars).toHaveBeenCalledWith(expect.any(String));
  });

  test('should return 500 if error occurs during processing', async () => {
    mockedProcessDocxFile.mockRejectedValue(new Error('Processing error'));

    const response = await request(app)
      .post('/upload')
      .field('author', 'Test Author')
      .field('title', 'Test Title')
      .field('format', 'docx')
      .field('language', 'english')
      .attach('file', Buffer.from('mock data'), 'test.docx');

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ message: 'Error generating report' });
    expect(mockedProcessDocxFile).toHaveBeenCalled();
  });
});
