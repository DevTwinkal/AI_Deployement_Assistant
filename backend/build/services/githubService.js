"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserRepos = exports.getUser = exports.getAccessToken = exports.getAuthUrl = void 0;
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const REDIRECT_URI = process.env.GITHUB_REDIRECT_URI || 'http://localhost:3000/auth/github/callback';
const getAuthUrl = () => {
    const scope = 'repo user';
    return `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=${scope}`;
};
exports.getAuthUrl = getAuthUrl;
const getAccessToken = async (code) => {
    const response = await axios_1.default.post('https://github.com/login/oauth/access_token', {
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code,
        redirect_uri: REDIRECT_URI,
    }, {
        headers: {
            Accept: 'application/json',
        },
    });
    return response.data;
};
exports.getAccessToken = getAccessToken;
const getUser = async (accessToken) => {
    const response = await axios_1.default.get('https://api.github.com/user', {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });
    return response.data;
};
exports.getUser = getUser;
const getUserRepos = async (accessToken) => {
    const response = await axios_1.default.get('https://api.github.com/user/repos?sort=updated&per_page=100', {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });
    return response.data;
};
exports.getUserRepos = getUserRepos;
