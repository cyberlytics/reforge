import axios from 'axios';
import Bottleneck from 'bottleneck';

const limiter = new Bottleneck({
  minTime: 1500, // 1 anfrage alle 1.5 sekunden
});

export const generateTechReport = async (
  content: string,
  language: string,
  format: string,
  docType: string,
): Promise<string> => {
  try {
    let prompt: string;

    if (docType === 'tex') {
      prompt = `
        Fasse das kurz in ${language} zusammen:
        ${content}
      `;
    } else if (docType === 'docx') {
      prompt = `
        Fasse das kurz in ${language} zusammen:
        ${content}
      `;
          
    } else {
      throw new Error('Unsupported format. Please use either "latex" or "docx".');
    }

    const response = await limiter.schedule(() => axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'Summarizer.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 500, //falls text abgeschnitten -> max token erhöhen
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    ));

    return response.data.choices[0].message.content.trim();
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Axios Error:', error.response?.data || error.message);
    } else {
      console.error('Unexpected Error:', error);
    }
    throw new Error('Error generating report');
  }
};