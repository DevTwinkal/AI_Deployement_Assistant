export const API_BASE_URL = 'http://localhost:3000/api';

export const connectRepo = async (repoUrl) => {
    try {
        const response = await fetch(`${API_BASE_URL}/repos/connect`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ repoUrl }),
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error("API Call Failed:", error);
        throw error;
    }
};

export const deployToVercel = (workspaceId, analysis, onLog, onSuccess, onError) => {
    const eventSource = new EventSource(`${API_BASE_URL}/deploy?workspaceId=${workspaceId}`); // Using Query for GET if simple SSE

    // BUT we used POST for better body payload support. EventSource standard only supports GET.
    // For this MVP, let's use fetch with readable stream which is more modern and supports POST

    fetch(`${API_BASE_URL}/deploy`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ workspaceId, analysis }),
    }).then(response => {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        function read() {
            reader.read().then(({ done, value }) => {
                if (done) return;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n\n');

                lines.forEach(line => {
                    if (line.startsWith('data: ')) {
                        const data = JSON.parse(line.substring(6));
                        if (data.type === 'log') onLog(data.message);
                        if (data.type === 'success') onSuccess(data.url);
                        if (data.type === 'error') onError(data.message);
                    }
                });

                read();
            });
        }
        read();
    }).catch(onError);
};
