'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { postsApi } from '@/lib/api/posts';
import { authApi } from '@/lib/api/auth';
import { Post } from '@/lib/api/types';
import { PostCard } from '@/components/post-card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [postContent, setPostContent] = useState("");
  const [isPosting, setIsPosting] = useState(false);

  useEffect(() => {
    const user = authApi.getCurrentUser();
    if (!user) {
      router.push('/login');
      return;
    }
    setIsAuthenticated(true);
    fetchPosts();
  }, [router]);

  const fetchPosts = async () => {
    try {
      // Assuming getFeed is the correct endpoint for logged in user
      const data = await postsApi.getFeed();
      // If feed is empty, maybe try public feed or user just has no friends
      if (Array.isArray(data) && data.length === 0) {
        try {
          // Fallback to public feed to show *something* or maybe just show empty
          const publicData = await postsApi.getPublicFeed();
          setPosts(Array.isArray(publicData) ? publicData : []);
        } catch (e) {
          setPosts([]);
        }
      } else {
        setPosts(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Failed to fetch posts", error);
      // Fallback
      try {
        const publicData = await postsApi.getPublicFeed();
        setPosts(Array.isArray(publicData) ? publicData : []);
      } catch (e) {
        setPosts([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postContent.trim()) return;

    setIsPosting(true);
    try {
      const newPost = await postsApi.createPost(postContent);
      setPosts([newPost, ...posts]);
      setPostContent("");
    } catch (error) {
      console.error("Failed to create post", error);
    } finally {
      setIsPosting(false);
    }
  };

  if (!isAuthenticated) return null; // Or loading spinner

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 py-3 flex justify-between items-center">
        <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
          DevNest
        </h1>
        <div className="flex items-center gap-4">
          <Link href="/profile/me">
            <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
              U
            </div>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { authApi.logout(); router.push('/login') }}
          >
            Logout
          </Button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto mt-6">
        {/* Create Post Input */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6 mx-4 sm:mx-0">
          <form onSubmit={handleCreatePost}>
            <div className="flex gap-4">
              <div className="h-10 w-10 rounded-full bg-gray-200 flex-shrink-0" />
              <div className="flex-1">
                <textarea
                  className="w-full resize-none border-none focus:ring-0 text-lg placeholder:text-gray-400 py-2"
                  placeholder="What's happening?"
                  rows={2}
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                />
                <div className="flex justify-end pt-2 border-t border-gray-50 mt-2">
                  <Button
                    type="submit"
                    disabled={!postContent.trim() || isPosting}
                    className="rounded-full px-6 font-bold bg-indigo-600 hover:bg-indigo-700"
                  >
                    {isPosting ? 'Posting...' : 'Post'}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Feed */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mx-4 sm:mx-0 min-h-[50vh]">
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">Loading posts...</div>
          ) : posts.length > 0 ? (
            posts.map(post => (
              <PostCard key={post.id} post={post} />
            ))
          ) : (
            <div className="p-8 text-center text-gray-500">
              <p className="text-lg font-medium">Welcome to DevNest!</p>
              <p className="mt-2">Follow users to see their posts here.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
