import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { router as aiRouter } from './routes/ai.js';

dotenv.config({ path: '../.env' });

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: ['http://localhost:5173', 'http://127.0.0.1:5173'] }));
app.use(express.json({ limit: '10mb' }));

app.use('/api', aiRouter);

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`✓ Server running on http://localhost:${PORT}`);
});
