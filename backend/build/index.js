"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_session_1 = __importDefault(require("express-session"));
const repoRoutes_1 = __importDefault(require("./routes/repoRoutes"));
const deployRoutes_1 = __importDefault(require("./routes/deployRoutes"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const sandboxRoutes_1 = __importDefault(require("./routes/sandboxRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// Configure CORS to allow credentials (cookies)
const allowedOrigins = [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:5173'
];
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true, // Allow cookies
}));
app.set('trust proxy', 1); // Trust first proxy
// Session Middleware
app.use((0, express_session_1.default)({
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
app.use(express_1.default.json());
// Routes
app.use('/api/repos', repoRoutes_1.default);
app.use('/api/deploy', deployRoutes_1.default);
app.use('/auth', authRoutes_1.default);
app.use('/api/sandbox', sandboxRoutes_1.default);
app.get('/health', (req, res) => {
    res.json({ status: 'ok', version: '1.0.0' });
});
app.listen(PORT, () => {
    console.log(`AI Deployment Copilot Backend running on port ${PORT}`);
});
