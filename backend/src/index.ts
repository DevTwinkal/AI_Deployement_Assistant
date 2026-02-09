import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import session from 'express-session';
import repoRoutes from './routes/repoRoutes';
import deployRoutes from './routes/deployRoutes';
import authRoutes from './routes/authRoutes';
import sandboxRoutes from './routes/sandboxRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configure CORS to allow credentials (cookies)
const allowedOrigins = [
    process.env.FRONTEND_URL,
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    /\.vercel\.app$/ // Allow all Vercel deployments
].filter(Boolean) as (string | RegExp)[];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.some(allowed =>
            typeof allowed === 'string' ? allowed === origin : allowed.test(origin)
        )) {
            callback(null, true);
        } else {
            console.warn(`Blocked by CORS: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));

app.set('trust proxy', 1);

// Session Middleware
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key-change-it',
    resave: false,
    saveUninitialized: false,
    name: 'ai_copilot_session',
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    }
}));

app.use(express.json());

// Routes
app.use('/api/repos', repoRoutes);
app.use('/api/deploy', deployRoutes);
app.use('/auth', authRoutes);
app.use('/api/sandbox', sandboxRoutes);

app.get('/health', (req, res) => {
    res.json({ status: 'ok', version: '1.0.0' });
});

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`AI Deployment Copilot Backend running on port ${PORT}`);
    });
}

export default app;
