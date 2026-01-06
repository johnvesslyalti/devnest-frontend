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

const registerSchema = z.object({
    username: z.string().min(3, 'Username must be at least 3 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
    });

    const onSubmit = async (data: RegisterFormData) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await authApi.register(data);
            // Store token and user
            localStorage.setItem('token', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));

            // Redirect to feed
            router.push('/home');
        } catch (err: any) {
            setError(err.message || 'Failed to register');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-zinc-900 p-8 shadow-xl rounded-xl border border-zinc-800">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-extrabold text-white tracking-tight">
                    Join DevNest
                </h2>
                <p className="mt-2 text-sm text-zinc-400">
                    Create your account to start sharing
                </p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                <div>
                    <label htmlFor="username" className="block text-sm font-medium text-zinc-300 mb-1">
                        Username
                    </label>
                    <Input
                        id="username"
                        type="text"
                        placeholder="johndoe"
                        autoComplete="username"
                        error={errors.username?.message}
                        className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                        {...register('username')}
                    />
                </div>

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
                        autoComplete="new-password"
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
                    Create Account
                </Button>

                <div className="text-center text-sm">
                    <span className="text-zinc-400">Already have an account? </span>
                    <Link href="/login" className="font-medium text-indigo-400 hover:text-indigo-300">
                        Sign in
                    </Link>
                </div>
            </form>
        </div>
    );
}
