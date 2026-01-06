import { apiClient } from "./client";
import { AuthResponse, LoginCredentials, RegisterCredentials } from "./types";

export const authApi = {
    register: (data: RegisterCredentials) => {
        return apiClient<AuthResponse>("/auth/register", {
            method: "POST",
            body: JSON.stringify(data),
        });
    },

    login: (data: LoginCredentials) => {
        return apiClient<AuthResponse>("/auth/login", {
            method: "POST",
            body: JSON.stringify(data),
        });
    },

    logout: () => {
        // Ideally call API logout if exists, then clear local state
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        return apiClient<void>("/auth/logout", { method: "POST" });
    },

    getCurrentUser: () => {
        // Just a helper to get user from storage if needed, or fetch profile
        // Implementation depends on if there's a /me endpoint or we use profile
        // For now we might rely on stored user data from login
        if (typeof window !== "undefined") {
            const userStr = localStorage.getItem("user");
            return userStr ? JSON.parse(userStr) : null;
        }
        return null;
    }
};
