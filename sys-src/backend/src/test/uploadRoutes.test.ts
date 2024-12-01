import request from 'supertest';
import express from 'express';
import uploadRouter from '../routes/uploadRoutes';

// Setup des Express-Servers
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/upload', uploadRouter);

// Mocken der handleFileUpload-Funktion
jest.mock('../controllers/uploadController', () => ({
  handleFileUpload: jest.fn((req, res) => {
    if (!req.body.author || !req.file) {
      return res.status(400).send({ message: 'Missing required fields' });
    }
    res.status(200).send({ message: 'File uploaded successfully' });
  }),
}));

describe('Upload Router', () => {
  test('should return 400 if required fields are missing', async () => {
    const response = await request(app)
      .post('/upload')
      .field('author', '');

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Missing required fields');
  });
});
