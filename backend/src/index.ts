import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import repoRoutes from './routes/repoRoutes';
import deployRoutes from './routes/deployRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/repos', repoRoutes);
app.use('/api/deploy', deployRoutes);

app.get('/health', (req, res) => {
    res.json({ status: 'ok', version: '1.0.0' });
});

app.listen(PORT, () => {
    console.log(`AI Deployment Copilot Backend running on port ${PORT}`);
});
