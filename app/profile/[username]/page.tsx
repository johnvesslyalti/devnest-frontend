'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { profileApi, Profile } from '@/lib/api/profile';
import { postsApi } from '@/lib/api/posts';
import { Post } from '@/lib/api/types';
import { authApi } from '@/lib/api/auth';
import { Button } from '@/components/ui/button';
import { PostCard } from '@/components/post-card';
import { ArrowLeft, Calendar, Link as LinkIcon, MapPin } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
    const resolvedParams = use(params);
    const router = useRouter();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFollowing, setIsFollowing] = useState(false);
    const [followersCount, setFollowersCount] = useState(0);

    useEffect(() => {
        // Basic auth check
        if (!authApi.getCurrentUser()) {
            // Allow viewing profiles publicly? Let's assume yes, but follow actions will fail or redirect
        }
        fetchProfile();
    }, [resolvedParams.username]);

    const fetchProfile = async () => {
        try {
            const profileData = await profileApi.getProfile(resolvedParams.username);
            setProfile(profileData);
            setIsFollowing(profileData.isFollowing || false);
            setFollowersCount(profileData.followersCount || 0);

            // Fetch posts
            try {
                const userPosts = await postsApi.getUserPosts(resolvedParams.username);
                setPosts(Array.isArray(userPosts) ? userPosts : []);
            } catch (e) {
                console.error("Failed to fetch user posts", e);
                setPosts([]);
            }
        } catch (error: any) {
            console.error("Failed to fetch profile", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFollowToggle = async () => {
        if (!profile) return;
        const currentUser = authApi.getCurrentUser();
        if (!currentUser) {
            router.push('/login');
            return;
        }

        const newIsFollowing = !isFollowing;
        setIsFollowing(newIsFollowing);
        setFollowersCount(prev => newIsFollowing ? prev + 1 : prev - 1);

        try {
            if (newIsFollowing) {
                await profileApi.followUser(profile.id);
            } else {
                await profileApi.unfollowUser(profile.id);
            }
        } catch (error) {
            // Revert
            setIsFollowing(!newIsFollowing);
            setFollowersCount(prev => newIsFollowing ? prev - 1 : prev + 1);
            console.error("Failed to toggle follow", error);
        }
    };

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 gap-4">
                <h2 className="text-2xl font-bold text-gray-900">User not found</h2>
                <p className="text-gray-500">The user @{resolvedParams.username} does not exist.</p>
                <Link href="/">
                    <Button>Go Home</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 py-3 flex items-center gap-4">
                <Link href="/" className="hover:bg-gray-100 p-2 rounded-full transition-colors">
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-xl font-bold text-gray-900 leading-none">{profile.username}</h1>
                    <span className="text-xs text-gray-500">{posts.length} posts</span>
                </div>
            </header>

            <main className="max-w-2xl mx-auto">
                {/* Banner */}
                <div className="h-32 sm:h-48 bg-gradient-to-r from-blue-400 to-indigo-500" />

                <div className="px-4 pb-4 bg-white border-b border-gray-100 mb-4">
                    <div className="relative flex justify-between items-end -mt-12 mb-4">
                        <div className="h-24 w-24 sm:h-32 sm:w-32 rounded-full border-4 border-white bg-gray-200 overflow-hidden">
                            {profile.avatarUrl ? (
                                <img src={profile.avatarUrl} alt={profile.username} className="h-full w-full object-cover" />
                            ) : (
                                <div className="h-full w-full bg-indigo-100 flex items-center justify-center text-3xl font-bold text-indigo-500">
                                    {profile.username[0].toUpperCase()}
                                </div>
                            )}
                        </div>

                        {profile.isMe ? (
                            <Button variant="outline" className="mb-2 rounded-full">Edit Profile</Button>
                        ) : (
                            <Button
                                className={isFollowing ? "bg-white text-gray-900 border border-gray-300 hover:bg-red-50 hover:text-red-600 hover:border-red-200" : "bg-black text-white hover:bg-gray-800"}
                                onClick={handleFollowToggle}
                            >
                                {isFollowing ? 'Following' : 'Follow'}
                            </Button>
                        )}
                    </div>

                    <div className="space-y-3">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">{profile.username}</h2>
                            <p className="text-gray-500">@{profile.username}</p>
                        </div>

                        {profile.bio && <p className="text-gray-900">{profile.bio}</p>}

                        <div className="flex gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1"><MapPin size={16} /> Earth</span>
                            <span className="flex items-center gap-1"><LinkIcon size={16} className="text-blue-500" /> devnest.com</span>
                            <span className="flex items-center gap-1"><Calendar size={16} /> Joined 2026</span>
                        </div>

                        <div className="flex gap-4 text-sm">
                            <div className="flex gap-1 hover:underline cursor-pointer">
                                <span className="font-bold text-gray-900">{profile.followingCount || 0}</span>
                                <span className="text-gray-500">Following</span>
                            </div>
                            <div className="flex gap-1 hover:underline cursor-pointer">
                                <span className="font-bold text-gray-900">{followersCount}</span>
                                <span className="text-gray-500">Followers</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 bg-white">
                    <div className="flex-1 py-4 text-center font-bold text-gray-900 border-b-2 border-indigo-500 cursor-pointer hover:bg-gray-50">
                        Posts
                    </div>
                    <div className="flex-1 py-4 text-center font-medium text-gray-500 cursor-pointer hover:bg-gray-50">
                        Replies
                    </div>
                    <div className="flex-1 py-4 text-center font-medium text-gray-500 cursor-pointer hover:bg-gray-50">
                        Media
                    </div>
                    <div className="flex-1 py-4 text-center font-medium text-gray-500 cursor-pointer hover:bg-gray-50">
                        Likes
                    </div>
                </div>

                {/* Posts List */}
                <div className="bg-white min-h-[200px]">
                    {posts.length > 0 ? (
                        posts.map(post => <PostCard key={post.id} post={post} />)
                    ) : (
                        <div className="p-8 text-center text-gray-500">
                            No posts yet.
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
