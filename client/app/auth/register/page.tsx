'use client';

import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { REGISTER } from '@/lib/graphql/mutations';
import { useAuthStore } from '@/lib/store/auth-store';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [register, { loading, error }] = useMutation(REGISTER);

  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    try {
      const result = await register({
        variables: { input: data },
      });

      if (result.data?.register) {
        setAuth(result.data.register.user, result.data.register.token);
        router.push('/');
      }
    } catch (err) {
      console.error('Register error:', err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-white mb-6 text-center">
          Register
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-gray-300 mb-2">Name</label>
            <input
              {...registerField('name')}
              type="text"
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Your Name"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-gray-300 mb-2">Email</label>
            <input
              {...registerField('email')}
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
              {...registerField('password')}
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
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <p className="text-gray-400 text-center mt-4">
          Already have an account?{' '}
          <a href="/auth/login" className="text-primary-400 hover:underline">
            Login
          </a>
        </p>
      </div>
    </div>
  );
}

