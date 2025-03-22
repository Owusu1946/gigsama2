'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to process request');
      }
      
      setSuccess(true);
    } catch (err: any) {
      console.error('Error requesting password reset:', err);
      setError(err.message || 'An unexpected error occurred');
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
        <h1 className="text-4xl font-bold text-white mb-6 text-center">Reset Password</h1>
        <p className="text-gray-300 text-center max-w-md">
          Don't worry, we've got you covered. Enter your email address and we'll send you instructions to reset your password.
        </p>
        <div className="absolute bottom-8 left-12 right-12">
          <p className="text-gray-400 text-sm">
            Remember your password?{' '}
            <Link href="/login" className="text-white hover:text-gray-300 font-medium transition-colors">
              Back to login
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
            <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">Reset Password</h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Remember your password?{' '}
              <Link href="/login" className="font-medium text-black hover:text-gray-700">
                Sign in here
              </Link>
            </p>
          </div>
          
          {/* Desktop title - hidden on mobile */}
          <div className="hidden lg:block text-center">
            <h2 className="text-3xl font-bold text-gray-900">Forgot your password?</h2>
            <p className="mt-2 text-gray-600">
              Enter your email and we'll send you a link to reset your password
            </p>
          </div>
          
          {success ? (
            <div className="rounded-lg bg-green-50 p-6 border border-green-100 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-green-800">Check your email</h3>
              <p className="mt-2 text-green-700">
                If an account exists with the email address you entered, we've sent instructions to reset your password.
              </p>
              <div className="mt-6">
                <Link href="/login" className="text-sm font-medium text-black hover:text-gray-700">
                  Return to sign in
                </Link>
              </div>
            </div>
          ) : (
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
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

              {error && (
                <div className="rounded-lg bg-red-50 p-4 border border-red-100">
                  <div className="flex">
                    <div className="text-sm text-red-700">
                      {error}
                    </div>
                  </div>
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-colors disabled:opacity-75 disabled:hover:bg-black text-base"
                >
                  {isLoading ? 'Processing...' : 'Send reset link'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
} 