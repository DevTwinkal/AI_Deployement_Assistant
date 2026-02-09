export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const fetchWithAuth = async (url, options = {}) => {
    // If url starts with / , append to base. If it doesn't contain /api or /auth, checked by caller
    const response = await fetch(`${API_BASE_URL}${url}`, {
        ...options,
        credentials: 'include', // Send cookies
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP Error: ${response.status}`);
    }
    return response.json();
};

export const getMe = async () => {
    return fetchWithAuth('/auth/me');
};

export const getMyRepos = async () => {
    return fetchWithAuth('/api/repos');
};

export const logout = async () => {
    return fetchWithAuth('/auth/logout');
};

export const connectRepo = async (repoUrl) => {
    return fetchWithAuth('/api/repos/connect', {
        method: 'POST',
        body: JSON.stringify({ repoUrl }),
    });
};


export const deployToVercel = async (workspaceId, analysis, onLog, onSuccess, onError) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/deploy`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ workspaceId, analysis }),
        });

        if (!response.ok) throw new Error('Deployment request failed');

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n\n');

            lines.forEach(line => {
                if (line.startsWith('data: ')) {
                    try {
                        const data = JSON.parse(line.substring(6));
                        if (data.type === 'log') onLog(data.message);
                        if (data.type === 'success') onSuccess(data.url);
                        if (data.type === 'error') onError(data.message);
                    } catch (e) {
                        console.error('Error parsing SSE data:', e);
                    }
                }
            });
        }
    } catch (error) {
        onError(error.message);
    }
};
