import axios from 'axios';
import { generateTechReport } from '../services/summarizerService';
jest.mock('axios');

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('generateTechReport', () => {

  test('should log a non-Axios error', async () => {
    //Arrange
    const unexpectedError = new TypeError('Cannot read properties of undefined (reading \'data\')');
  
    mockedAxios.post.mockRejectedValueOnce(unexpectedError);
  
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
  
    //Act
    await expect(
      generateTechReport('Das ist der Inhalt.', 'Deutsch', 'docx', 'summary')
    ).rejects.toThrow('Error generating report');
  
    //Assert
    expect(consoleSpy).toHaveBeenCalledWith('Unexpected Error:', unexpectedError);
  
    consoleSpy.mockRestore();
  });
  
});
