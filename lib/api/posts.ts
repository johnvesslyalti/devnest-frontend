import { apiClient } from "./client";
import { Post, Comment } from "./types";

export const postsApi = {
    getAllPosts: () => {
        return apiClient<Post[]>("/posts"); // Assuming /posts gets all posts or feed? Doc says /feed for home feed and /posts for create?
        // Doc: 
        // Posts: /posts
        // Feed: /feed (Get authenticated user's home feed)
        // Home: /home (Get public/general feed)
        // We should probably use /feed for logged in or /home for public.
        // Let's implement both methods.
    },

    getFeed: () => {
        return apiClient<Post[]>("/feed");
    },

    getPublicFeed: () => {
        return apiClient<Post[]>("/home");
    },

    createPost: (content: string) => {
        return apiClient<Post>("/posts", {
            method: "POST",
            body: JSON.stringify({ content }), // Doc didn't specify body structure but implied. Inferred content.
        });
    },

    getPost: (id: string) => {
        return apiClient<Post>(`/posts/${id}`);
    },

    getUserPosts: (username: string) => {
        return apiClient<Post[]>(`/posts/user/${username}`);
    },

    likePost: (postId: string) => {
        return apiClient<void>(`/likes/${postId}`, { method: "POST" });
    },

    unlikePost: (postId: string) => {
        return apiClient<void>(`/likes/${postId}`, { method: "DELETE" });
    },

    getComments: (postId: string) => {
        return apiClient<Comment[]>(`/posts/${postId}/comments`);
    },

    addComment: (postId: string, content: string) => {
        return apiClient<Comment>(`/posts/${postId}/comments`, {
            method: 'POST',
            body: JSON.stringify({ content })
        });
    }
};
