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

            if (response.user) {
                localStorage.setItem('user', JSON.stringify(response.user));
                console.log("User stored");
            } else {
                console.warn("No user in response. Attempting to decode token...");
                try {
                    // Simple JWT decode
                    const base64Url = token.split('.')[1];
                    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
                        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                    }).join(''));

                    const payload = JSON.parse(jsonPayload);
                    console.log("Decoded payload:", payload);

                    // Map payload to User object
                    // Adjust keys based on what your token actually contains (e.g., sub, username, email)
                    const userFromToken = {
                        id: payload.sub || payload.id || payload.userId,
                        username: payload.username || payload.name || payload.email?.split('@')[0] || "User",
                        email: payload.email || "",
                        // Add defaults
                        followersCount: 0,
                        followingCount: 0
                    };

                    if (userFromToken.id) {
                        localStorage.setItem('user', JSON.stringify(userFromToken));
                        console.log("User stored from token");
                    } else {
                        throw new Error("Token payload missing required user fields");
                    }
                } catch (e) {
                    console.error("Failed to decode token for user info:", e);
                    setError("Login successful, but failed to retrieve user details. Please check backend response.");
                    return;
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
