'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { authApi } from '@/lib/api/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormData) => {
        console.log("Submitting login form...", data);
        setIsLoading(true);
        setError(null);
        try {
            const response = await authApi.login(data);
            console.log("Login success, response:", response);

            // Handle various token field names
            const token = response.token || (response as any).accessToken || (response as any).access_token;

            // Store token and user
            if (token) {
                localStorage.setItem('token', token);
                console.log("Token stored");
            } else {
                console.error("No token in response. Available keys:", Object.keys(response));
                setError("Login failed: Invalid server response (missing token)");
                return;
            }

            // Check if response has nested user OR if response IS the user (flattened)
            const userObj = response.user || (response.id ? response : null);

            if (userObj) {
                // Ensure field mapping if needed
                const userToStore = {
                    ...userObj,
                    // If backend returns 'name' but frontend expects 'username' (common mismatch in setups)
                    // The recent curl showed "name": "Debug User". Check if "username" is there.
                    // If simple register didn't return username, we might default or map it.
                    username: userObj.username || userObj.name || "User",
                };
                localStorage.setItem('user', JSON.stringify(userToStore));
                console.log("User stored");
            } else {
                console.warn("No user in response. Attempting to decode token...");
                // ... existing fallback logic ...
                try {
                    // Simple JWT decode
                    const base64Url = token.split('.')[1];
                    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
                        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                    }).join(''));

                    const payload = JSON.parse(jsonPayload);
                    console.log("Decoded payload:", payload);

                    const userFromToken = {
                        id: payload.sub || payload.id || payload.userId,
                        username: payload.username || payload.name || payload.email?.split('@')[0] || "User",
                        email: payload.email || "",
                        followersCount: 0,
                        followingCount: 0
                    };

                    if (userFromToken.id) {
                        localStorage.setItem('user', JSON.stringify(userFromToken));
                        console.log("User stored from token");
                    } else {
                        // Should not crash the auth flow if we have a token, just might be missing profile info
                        console.warn("Token payload missing required user fields");
                    }
                } catch (e) {
                    console.error("Failed to decode token for user info:", e);
                    // Do not return; allow redirect if we have a token
                }
            }

            // Redirect to feed
            console.log("Redirecting to /home");
            router.push('/home');
        } catch (err: any) {
            console.error("Login failed:", err);
            setError(err.message || 'Failed to login');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-zinc-900 p-8 shadow-xl rounded-xl border border-zinc-800">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-extrabold text-white tracking-tight">
                    Welcome back
                </h2>
                <p className="mt-2 text-sm text-zinc-400">
                    Sign in to your DevNest account
                </p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-zinc-300 mb-1">
                        Email address
                    </label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        autoComplete="email"
                        error={errors.email?.message}
                        className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                        {...register('email')}
                    />
                </div>

                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-zinc-300 mb-1">
                        Password
                    </label>
                    <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        autoComplete="current-password"
                        error={errors.password?.message}
                        className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                        {...register('password')}
                    />
                </div>

                {error && (
                    <div className="bg-red-900/20 text-red-500 p-3 rounded-md text-sm text-center border border-red-900/50">
                        {error}
                    </div>
                )}

                <Button
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                    isLoading={isLoading}
                >
                    Sign in
                </Button>

                <div className="text-center text-sm">
                    <span className="text-zinc-400">Don't have an account? </span>
                    <Link href="/register" className="font-medium text-indigo-400 hover:text-indigo-300">
                        Create one
                    </Link>
                </div>
            </form>
        </div>
    );
}
