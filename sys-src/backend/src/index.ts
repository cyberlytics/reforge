import express from 'express';
import uploadRoutes from './routes/uploadRoutes';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();
app.use(cors());

const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use('/api/upload', uploadRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});