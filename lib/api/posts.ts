import { apiClient } from "./client";
import { authApi } from "./auth";
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
        return apiClient<Post[]>("/home");
    },

    // getPublicFeed: () => {
    //     return apiClient<Post[]>("/home");
    // },

    createPost: async (content: string) => {
        const response = await apiClient<{ message: string, post: Post }>("/posts", {
            method: "POST",
            body: JSON.stringify({ content }),
        });
        const post = response.post;
        // Backend might not return the full author object, so we attach the current user
        if (!post.author) {
            const currentUser = authApi.getCurrentUser();
            if (currentUser) {
                post.author = currentUser;
            }
        }
        return post;
    },

    getPost: (id: string) => {
        return apiClient<Post>(`/posts/${id}`);
    },

    getUserPosts: (username: string) => {
        return apiClient<Post[]>(`/posts/user/${username}`);
    },

    likePost: (postId: string) => {
        return apiClient<void>(`/posts/${postId}/like`, { method: "POST" });
    },

    unlikePost: (postId: string) => {
        return apiClient<void>(`/posts/${postId}/unlike`, { method: "DELETE" });
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
