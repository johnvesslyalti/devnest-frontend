import { AuthResponse } from "./types";

const BASE_URL = "/api/v1";

interface FetchOptions extends RequestInit {
    token?: string;
}

export async function apiClient<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    const { token, headers, ...rest } = options;

    const defaultHeaders: HeadersInit = {
        "Content-Type": "application/json",
    };

    // Client-side token retrieval
    let authHeader: Record<string, string> = {};
    if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('token');
        if (stored) {
            authHeader = { Authorization: `Bearer ${stored}` };
        }
    }

    // Explicit token overrides storage
    if (token) {
        authHeader = { Authorization: `Bearer ${token}` };
    }

    console.log(`[API Request] ${options.method || 'GET'} ${endpoint}`);
    console.log(`[API Token] Present: ${!!authHeader.Authorization}`);

    const res = await fetch(`${BASE_URL}${endpoint}`, {
        headers: {
            ...defaultHeaders,
            ...authHeader,
            ...headers,
        },
        ...rest,
    });

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const error = new Error(errorData.message || `API Error: ${res.statusText}`);
        (error as any).status = res.status;
        throw error;
    }

    // Handle 204 No Content
    if (res.status === 204) {
        return {} as T;
    }

    return res.json();
}
