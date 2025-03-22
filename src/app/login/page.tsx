'use client';

import { useState } from 'react';
import { useAuth } from '@/components/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, error } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await login(email, password);
      // The auth context will handle the redirect
    } catch (err) {
      // Error is handled in the auth context
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left side - Dark panel with graphics */}
      <div className="hidden lg:flex lg:w-1/2 bg-black flex-col justify-center items-center p-12 relative">
        <div className="w-64 h-64 mb-8 relative">
          <div className="absolute inset-0 bg-white opacity-10 rounded-full animate-pulse"></div>
          <div className="absolute inset-0 border-4 border-white opacity-20 rounded-full"></div>
          <div className="absolute inset-0 border border-white opacity-10 rounded-full scale-110"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Image 
              src="/image.png" 
              alt="KeyMap logo" 
              width={80} 
              height={80}
              className="object-contain z-10"
            />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-white mb-6 text-center">Welcome Back</h1>
        <p className="text-gray-300 text-center max-w-md">
          Log in to continue your journey with KeyMap and manage your database schemas efficiently.
        </p>
        <div className="absolute bottom-8 left-12 right-12">
          <p className="text-gray-400 text-sm">
            Don't have an account?{' '}
            <Link href="/signup" className="text-white hover:text-indigo-300 font-medium transition-colors">
              Sign up here
            </Link>
          </p>
        </div>
      </div>
      
      {/* Right side - Light panel with form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-white p-8">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile logo & title - visible only on small screens */}
          <div className="text-center lg:hidden">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-black">
              <Image 
                src="/image.png" 
                alt="KeyMap logo" 
                width={40} 
                height={40}
                className="object-contain"
              />
            </div>
            <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">Sign in</h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Don't have an account?{' '}
              <Link href="/signup" className="font-medium text-black hover:text-gray-700">
                Create one here
              </Link>
            </p>
          </div>
          
          {/* Desktop title - hidden on mobile */}
          <div className="hidden lg:block text-center">
            <h2 className="text-3xl font-bold text-gray-900">Sign in to your account</h2>
            <p className="mt-2 text-gray-600">
              Enter your credentials to continue
            </p>
          </div>
          
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 p-4 border border-red-100">
                <div className="flex">
                  <div className="text-sm text-red-700">
                    {error}
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link href="/forgot-password" className="font-medium text-black hover:text-gray-700">
                  Forgot password?
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-colors disabled:opacity-75 disabled:hover:bg-black text-base"
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 