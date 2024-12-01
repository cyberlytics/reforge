import axios from 'axios';
import { translateText } from '../services/translationService';

jest.mock('axios');

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('translateText', () => {
  const DEEPL_API_KEY = 'test-api-key';
  const validResponse = {
    data: {
      translations: [
        { text: 'Testübersetzung' }
      ]
    }
  };

  beforeEach(() => {
    process.env.DEEPL_API_KEY = DEEPL_API_KEY;
  });

  afterEach(() => {
    jest.clearAllMocks(); 
  });

  test('should translate text to English when targetLanguage is "english"', async () => {
    //Arrange
    mockedAxios.post.mockResolvedValueOnce(validResponse);
    
    //Act
    const result = await translateText('Testtext', 'english');

    //Assert
    expect(mockedAxios.post).toHaveBeenCalledWith(
      'https://api-free.deepl.com/v2/translate',
      null,
      {
        params: {
          auth_key: DEEPL_API_KEY,
          text: 'Testtext',
          target_lang: 'EN'
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    expect(result).toBe('Testübersetzung');
  });

  test('should translate text to German when targetLanguage is "german"', async () => {
    //Arrange
    mockedAxios.post.mockResolvedValueOnce(validResponse);

    //Act
    const result = await translateText('Testtext', 'german');

    //Assert
    expect(mockedAxios.post).toHaveBeenCalledWith(
      'https://api-free.deepl.com/v2/translate',
      null,
      {
        params: {
          auth_key: DEEPL_API_KEY,
          text: 'Testtext',
          target_lang: 'DE'
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    expect(result).toBe('Testübersetzung');
  });

  test('should throw error if API request fails', async () => {
    //Arrange
    mockedAxios.post.mockRejectedValueOnce(new Error('API Fehler'));

    //Act
    await expect(translateText('Testtext', 'english')).rejects.toThrow(
      'Fehler bei der Kommunikation mit DeepL API.'
    );

    //Assert
    expect(mockedAxios.post).toHaveBeenCalledTimes(1);
  });
});
