'use client';

import { useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns'; // Need to install date-fns too potentially, or use intl
import { Heart, MessageCircle, Share2, MoreHorizontal } from 'lucide-react';
import { Post } from '@/lib/api/types';
import { postsApi } from '@/lib/api/posts';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

// Simple time formatter if date-fns not available
const timeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "mo";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m";
    return Math.floor(seconds) + "s";
};

interface PostCardProps {
    post: Post;
    onLikeToggle?: (post: Post) => void;
}

export function PostCard({ post, onLikeToggle }: PostCardProps) {
    const [isLiked, setIsLiked] = useState(post.hasLiked);
    const [likesCount, setLikesCount] = useState(post.likesCount);
    const [isLiking, setIsLiking] = useState(false);

    const handleLike = async () => {
        if (isLiking) return;
        setIsLiking(true);

        // Optimistic update
        const newLikedState = !isLiked;
        setIsLiked(newLikedState);
        setLikesCount(prev => newLikedState ? prev + 1 : prev - 1);

        try {
            if (newLikedState) {
                await postsApi.likePost(post.id);
            } else {
                await postsApi.unlikePost(post.id);
            }
            if (onLikeToggle) onLikeToggle({ ...post, hasLiked: newLikedState, likesCount: newLikedState ? likesCount + 1 : likesCount - 1 });
        } catch (error) {
            // Revert if error
            setIsLiked(!newLikedState);
            setLikesCount(prev => newLikedState ? prev - 1 : prev + 1);
            console.error("Failed to toggle like", error);
        } finally {
            setIsLiking(false);
        }
    };

    return (
        <div className="bg-white p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors">
            <div className="flex gap-4">
                <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold overflow-hidden">
                        {post.author.avatarUrl ? (
                            <img src={post.author.avatarUrl} alt={post.author.username} className="h-full w-full object-cover" />
                        ) : (
                            post.author.username[0].toUpperCase()
                        )}
                    </div>
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 group cursor-pointer">
                            <Link href={`/profile/${post.author.username}`} className="font-bold text-gray-900 group-hover:underline">
                                {post.author.username}
                            </Link>
                            <span className="text-gray-500 text-sm">@{post.author.username}</span>
                            <span className="text-gray-400 text-sm">·</span>
                            <span className="text-gray-500 text-sm hover:underline">{timeAgo(post.createdAt)}</span>
                        </div>
                        <button className="text-gray-400 hover:text-blue-500 rounded-full p-2 hover:bg-blue-50">
                            <MoreHorizontal size={18} />
                        </button>
                    </div>

                    <div className="mt-1 text-gray-900 whitespace-pre-wrap break-words">
                        {post.content}
                    </div>

                    <div className="mt-3 flex items-center justify-between max-w-md text-gray-500">
                        <button className="group flex items-center gap-2 hover:text-blue-500 transition-colors">
                            <div className="p-2 rounded-full group-hover:bg-blue-50 transition-colors">
                                <MessageCircle size={18} />
                            </div>
                            <span className="text-sm">{post.commentsCount > 0 && post.commentsCount}</span>
                        </button>

                        <button
                            onClick={handleLike}
                            className={cn(
                                "group flex items-center gap-2 transition-colors",
                                isLiked ? "text-pink-600" : "hover:text-pink-600"
                            )}
                        >
                            <div className={cn(
                                "p-2 rounded-full transition-colors",
                                isLiked ? "" : "group-hover:bg-pink-50"
                            )}>
                                <Heart size={18} fill={isLiked ? "currentColor" : "none"} />
                            </div>
                            <span className="text-sm">{likesCount > 0 && likesCount}</span>
                        </button>

                        <button className="group flex items-center gap-2 hover:text-green-500 transition-colors">
                            <div className="p-2 rounded-full group-hover:bg-green-50 transition-colors">
                                <Share2 size={18} />
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
