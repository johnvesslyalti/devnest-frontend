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
        setIsLoading(true);
        setError(null);
        try {
            const response = await authApi.login(data);
            // Store token and user
            localStorage.setItem('token', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));

            // Redirect to feed
            router.push('/');
        } catch (err: any) {
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
