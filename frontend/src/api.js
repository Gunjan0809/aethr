const API_URL = 'http://localhost:5000/api';
export const API_BASE_URL = API_URL;

export const apiRequest = async (endpoint, options = {}) => {
    const token = localStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });

    const contentType = response.headers.get('content-type') || '';

    if (!contentType.includes('application/json')) {
        const rawText = await response.text();
        console.error('Non-JSON raw response received:', rawText);
        throw new Error(`Server Error (${response.status}): ${rawText.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() || 'Unexpected server response'}`);
    }

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `API request failed with status ${response.status}`);
    }

    return response.json();
};
