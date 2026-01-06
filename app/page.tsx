'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { authApi } from '@/lib/api/auth';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const router = useRouter();

  useEffect(() => {
    // If user is already logged in, redirect to /home
    if (authApi.getCurrentUser()) {
      router.push('/home');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-center p-4">
      <div className="max-w-3xl space-y-8">
        <h1 className="text-6xl font-extrabold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
          DevNest
        </h1>
        <p className="text-2xl text-zinc-400">
          The community for developers to share, connect, and grow.
        </p>

        <div className="flex gap-4 justify-center mt-8">
          <Link href="/login">
            <Button className="bg-white text-black hover:bg-zinc-200 text-lg px-8 py-6 rounded-full font-bold">
              Login
            </Button>
          </Link>
          <Link href="/register">
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white text-lg px-8 py-6 rounded-full font-bold">
              Get Started
            </Button>
          </Link>
        </div>
      </div>
      <footer className="absolute bottom-8 text-zinc-600 text-sm">
        &copy; 2026 DevNest. All rights reserved.
      </footer>
    </div>
  );
}
