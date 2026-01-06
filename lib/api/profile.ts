import { apiClient } from "./client";
import { User } from "./types";

export interface Profile extends User {
    postsCount?: number;
    isFollowing?: boolean;
    isMe?: boolean;
}

export const profileApi = {
    getProfile: (username: string) => {
        return apiClient<Profile>(`/profile/${username}`);
    },

    updateProfile: (username: string, data: Partial<User>) => {
        return apiClient<User>(`/profile/${username}`, {
            method: "PATCH",
            body: JSON.stringify(data),
        });
    },

    followUser: (userId: string) => {
        return apiClient<void>(`/follow/${userId}`, { method: "POST" });
    },

    unfollowUser: (userId: string) => {
        return apiClient<void>(`/follow/${userId}`, { method: "DELETE" });
    },

    getFollowers: (userId: string) => {
        return apiClient<User[]>(`/follow/${userId}/followers`);
    },

    getFollowing: (userId: string) => {
        return apiClient<User[]>(`/follow/${userId}/following`);
    },
};
