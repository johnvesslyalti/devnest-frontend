export interface User {
    id: string;
    username: string;
    name?: string; // Backend sometimes returns 'name'
    email: string;
    bio?: string;
    avatarUrl?: string;
    followersCount?: number;
    followingCount?: number;
}

export interface AuthResponse {
    token: string;
    accessToken?: string;
    access_token?: string;
    user: User;
    // Support flattened response structure
    id?: string;
    name?: string;
    username?: string;
    email?: string;
}

export interface Post {
    id: string;
    content: string;
    author: User;
    createdAt: string;
    likesCount: number;
    commentsCount: number;
    hasLiked?: boolean;
}

export interface Comment {
    id: string;
    content: string;
    author: User;
    createdAt: string;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterCredentials {
    username: string;
    email: string;
    password: string;
}
