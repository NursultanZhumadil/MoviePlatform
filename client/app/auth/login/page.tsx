'use client';

import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { LOGIN } from '@/lib/graphql/mutations';
import { useAuthStore } from '@/lib/store/auth-store';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [login, { loading, error }] = useMutation(LOGIN);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      const result = await login({
        variables: { input: data },
      });

      if (result.data?.login) {
        setAuth(result.data.login.user, result.data.login.token);
        router.push('/');
      }
    } catch (err) {
      console.error('Login error:', err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-white mb-6 text-center">
          Login
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-gray-300 mb-2">Email</label>
            <input
              {...register('email')}
              type="email"
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="your@email.com"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-gray-300 mb-2">Password</label>
            <input
              {...register('password')}
              type="password"
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-500 p-3 rounded-lg">
              {error.message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 transition disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="text-gray-400 text-center mt-4">
          Don&apos;t have an account?{' '}
          <a href="/auth/register" className="text-primary-400 hover:underline">
            Register
          </a>
        </p>
      </div>
    </div>
  );
}

