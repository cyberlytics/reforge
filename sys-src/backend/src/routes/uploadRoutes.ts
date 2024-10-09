import express from 'express';
import { handleFileUpload } from '../controllers/uploadController';

const router = express.Router();

router.post('/', handleFileUpload);

export default router;