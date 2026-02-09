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
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:5173'
];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true, // Allow cookies
}));

app.set('trust proxy', 1); // Trust first proxy

// Session Middleware
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key-change-it',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production', // true if https
        httpOnly: true, // prevent JS access
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        sameSite: 'lax'
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

app.listen(PORT, () => {
    console.log(`AI Deployment Copilot Backend running on port ${PORT}`);
});
