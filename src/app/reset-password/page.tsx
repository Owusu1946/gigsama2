'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

// Loading component to display while Suspense is pending
function ResetPasswordLoading() {
  return (
    <div className="flex min-h-screen">
      <div className="w-full flex items-center justify-center bg-white p-8">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-black">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
          </div>
          <h2 className="mt-6 text-center text-xl font-medium text-gray-900">Loading...</h2>
        </div>
      </div>
    </div>
  );
}

// Main content component that uses useSearchParams
function ResetPasswordContent() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null);
  
  const searchParams = useSearchParams();
  const router = useRouter();
  
  useEffect(() => {
    // Get token from URL
    const tokenFromUrl = searchParams.get('token');
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
      // Verify token validity
      verifyToken(tokenFromUrl);
    } else {
      setError('Reset token is missing. Please use the link from the email.');
      setIsTokenValid(false);
    }
  }, [searchParams]);
  
  const verifyToken = async (tokenToVerify: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/auth/verify-reset-token?token=${tokenToVerify}`);
      
      if (response.ok) {
        setIsTokenValid(true);
      } else {
        const data = await response.json();
        setError(data.error || 'Invalid or expired token');
        setIsTokenValid(false);
      }
    } catch (err) {
      console.error('Error verifying token:', err);
      setError('Failed to verify reset token');
      setIsTokenValid(false);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token, password })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }
      
      setSuccess(true);
      
      // Automatically redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login');
      }, 3000);
      
    } catch (err: any) {
      console.error('Error resetting password:', err);
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
          Create a new password for your account. Make sure it's strong and you haven't used it before.
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
            <h2 className="text-3xl font-bold text-gray-900">Create a new password</h2>
            <p className="mt-2 text-gray-600">
              Make sure your new password is secure
            </p>
          </div>
          
          {success ? (
            <div className="rounded-lg bg-green-50 p-6 border border-green-100 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-green-800">Password Reset Success</h3>
              <p className="mt-2 text-green-700">
                Your password has been successfully reset. You will be redirected to the login page shortly.
              </p>
              <div className="mt-6">
                <Link href="/login" className="text-sm font-medium text-black hover:text-gray-700">
                  Go to sign in
                </Link>
              </div>
            </div>
          ) : isTokenValid === false ? (
            <div className="rounded-lg bg-red-50 p-6 border border-red-100 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-red-800">Invalid Reset Link</h3>
              <p className="mt-2 text-red-700">
                {error || 'The password reset link is invalid or has expired. Please request a new one.'}
              </p>
              <div className="mt-6">
                <Link href="/forgot-password" className="text-sm font-medium text-black hover:text-gray-700">
                  Request a new reset link
                </Link>
              </div>
            </div>
          ) : (
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-5">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                  <input
                    id="confirm-password"
                    name="confirm-password"
                    type="password"
                    autoComplete="new-password"
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>

              {error && !['Invalid or expired token', 'Reset token is missing'].includes(error) && (
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
                  disabled={isLoading || !isTokenValid}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-colors disabled:opacity-75 disabled:hover:bg-black text-base"
                >
                  {isLoading ? 'Processing...' : 'Reset Password'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

// Main component with Suspense boundary
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordLoading />}>
      <ResetPasswordContent />
    </Suspense>
  );
} 