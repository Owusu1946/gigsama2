'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({ name: '', email: '', password: '' });
  const [formTouched, setFormTouched] = useState({ name: false, email: false, password: false });
  const { signup, error } = useAuth();

  // Clear form errors when input changes
  useEffect(() => {
    if (formTouched.name && name) {
      setFormErrors(prev => ({ ...prev, name: '' }));
    }
    if (formTouched.email && email) {
      setFormErrors(prev => ({ ...prev, email: '' }));
    }
    if (formTouched.password && password) {
      setFormErrors(prev => ({ ...prev, password: '' }));
    }
  }, [name, email, password, formTouched]);

  const validateForm = () => {
    const errors = { name: '', email: '', password: '' };
    let isValid = true;

    // Name validation
    if (!name) {
      errors.name = 'Name is required';
      isValid = false;
    }

    // Email validation
    if (!email) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Email address is invalid';
      isValid = false;
    }

    // Password validation
    if (!password) {
      errors.password = 'Password is required';
      isValid = false;
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched for validation
    setFormTouched({ name: true, email: true, password: true });
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      await signup(name, email, password);
      // The auth context will handle the redirect
    } catch (err) {
      // Error is handled in the auth context
    } finally {
      setIsLoading(false);
    }
  };

  const handleFieldChange = (field: 'name' | 'email' | 'password', value: string) => {
    if (field === 'name') {
      setName(value);
    } else if (field === 'email') {
      setEmail(value);
    } else {
      setPassword(value);
    }
    
    // Mark field as touched
    setFormTouched(prev => ({ ...prev, [field]: true }));
  };

  return (
    <div className="flex min-h-screen">
      {/* Left side - Light panel with form */}
      <motion.div 
        className="w-full lg:w-1/2 flex items-center justify-center bg-white p-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="w-full max-w-md space-y-8">
          {/* Mobile logo & title - visible only on small screens */}
          <motion.div 
            className="text-center lg:hidden"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-black">
              <Image 
                src="/image.png" 
                alt="KeyMap logo" 
                width={40} 
                height={40}
                className="object-contain"
              />
            </div>
            <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">Create account</h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="font-medium text-black hover:text-gray-700">
                Sign in here
              </Link>
            </p>
          </motion.div>
          
          {/* Desktop title - hidden on mobile */}
          <motion.div 
            className="hidden lg:block text-center"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold text-gray-900">Join KeyMap</h2>
            <p className="mt-2 text-gray-600">
              Create your account to get started
            </p>
          </motion.div>
          
          <motion.form 
            className="mt-8 space-y-6" 
            onSubmit={handleSubmit}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="space-y-5">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-black focus:border-transparent transition-all ${
                    formErrors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => handleFieldChange('name', e.target.value)}
                />
                {formErrors.name && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-black focus:border-transparent transition-all ${
                    formErrors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => handleFieldChange('email', e.target.value)}
                />
                {formErrors.email && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-black focus:border-transparent transition-all ${
                      formErrors.password ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => handleFieldChange('password', e.target.value)}
                  />
                  <button 
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <svg className="h-5 w-5" fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512">
                        <path fill="currentColor" d="M320 400c-75.85 0-137.25-58.71-142.9-133.11L72.2 185.82c-13.79 17.3-26.48 35.59-36.72 55.59a32.35 32.35 0 0 0 0 29.19C89.71 376.41 197.07 448 320 448c26.91 0 52.87-4 77.89-10.46L346 397.39a144.13 144.13 0 0 1-26 2.61zm313.82 58.1l-110.55-85.44a331.25 331.25 0 0 0 81.25-102.07 32.35 32.35 0 0 0 0-29.19C550.29 135.59 442.93 64 320 64a308.15 308.15 0 0 0-147.32 37.7L45.46 3.37A16 16 0 0 0 23 6.18L3.37 31.45A16 16 0 0 0 6.18 53.9l588.36 454.73a16 16 0 0 0 22.46-2.81l19.64-25.27a16 16 0 0 0-2.82-22.45zm-183.72-142l-39.3-30.38A94.75 94.75 0 0 0 416 256a94.76 94.76 0 0 0-121.31-92.21A47.65 47.65 0 0 1 304 192a46.64 46.64 0 0 1-1.54 10l-73.61-56.89A142.31 142.31 0 0 1 320 112a143.92 143.92 0 0 1 144 144c0 21.63-5.29 41.79-13.9 60.11z"></path>
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512">
                        <path fill="currentColor" d="M572.52 241.4C518.29 135.59 410.93 64 288 64S57.68 135.64 3.48 241.41a32.35 32.35 0 0 0 0 29.19C57.71 376.41 165.07 448 288 448s230.32-71.64 284.52-177.41a32.35 32.35 0 0 0 0-29.19zM288 400a144 144 0 1 1 144-144 143.93 143.93 0 0 1-144 144zm0-240a95.31 95.31 0 0 0-25.31 3.79 47.85 47.85 0 0 1-66.9 66.9A95.78 95.78 0 1 0 288 160z"></path>
                      </svg>
                    )}
                  </button>
                </div>
                {formErrors.password && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.password}</p>
                )}
                {!formErrors.password && password && (
                  <div className="mt-1">
                    <div className="flex items-center mt-1">
                      <div className="h-1 flex-1 bg-gray-200 rounded">
                        <div 
                          className={`h-1 rounded ${
                            password.length < 8 ? 'bg-red-400 w-1/3' : 
                            /[A-Z]/.test(password) && /[0-9]/.test(password) ? 'bg-green-400 w-full' : 
                            'bg-yellow-400 w-2/3'
                          }`}
                        ></div>
                      </div>
                      <span className="ml-2 text-xs text-gray-500">
                        {password.length < 8 ? 'Weak' : 
                         /[A-Z]/.test(password) && /[0-9]/.test(password) ? 'Strong' : 
                         'Medium'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {error && (
              <motion.div 
                className="rounded-lg bg-red-50 p-4 border border-red-100"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex">
                  <svg className="h-5 w-5 text-red-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <div className="text-sm text-red-700">
                    {error}
                  </div>
                </div>
              </motion.div>
            )}

            <div>
              <p className="text-sm text-gray-600 mb-4">
                By creating an account, you agree to our{' '}
                <a href="#" className="font-medium text-black hover:text-gray-700 transition-colors duration-200">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="font-medium text-black hover:text-gray-700 transition-colors duration-200">
                  Privacy Policy
                </a>
              </p>
              <button
                type="submit"
                disabled={isLoading}
                className="relative w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-all duration-200 disabled:opacity-75 disabled:hover:bg-black text-base overflow-hidden"
              >
                <span className="relative z-10">
                  {isLoading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating account...
                    </span>
                  ) : (
                    'Sign up'
                  )}
                </span>
                {!isLoading && (
                  <span className="absolute top-0 left-0 w-0 h-full bg-gray-700 transition-all duration-300 group-hover:w-full"></span>
                )}
              </button>
            </div>
          </motion.form>
        </div>
      </motion.div>
      
      {/* Right side - Dark panel with graphics */}
      <motion.div 
        className="hidden lg:flex lg:w-1/2 bg-black flex-col justify-center items-center p-12 relative overflow-hidden"
        initial={{ x: 50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* Background decoration - animated gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black opacity-80"></div>
        
        {/* Animated circles */}
        <div className="absolute top-1/3 left-1/3 w-64 h-64 rounded-full bg-purple-900 opacity-10 mix-blend-screen animate-blob"></div>
        <div className="absolute top-2/3 right-1/4 w-80 h-80 rounded-full bg-indigo-900 opacity-10 mix-blend-screen animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 right-1/3 w-72 h-72 rounded-full bg-blue-900 opacity-10 mix-blend-screen animate-blob animation-delay-4000"></div>
        
        <style jsx>{`
          @keyframes blob {
            0% { transform: translate(0px, 0px) scale(1); }
            33% { transform: translate(30px, -50px) scale(1.1); }
            66% { transform: translate(-20px, 20px) scale(0.9); }
            100% { transform: translate(0px, 0px) scale(1); }
          }
          .animate-blob {
            animation: blob 15s infinite;
          }
          .animation-delay-2000 {
            animation-delay: 2s;
          }
          .animation-delay-4000 {
            animation-delay: 4s;
          }
        `}</style>
        
        <motion.div
          className="w-64 h-64 mb-8 relative z-10"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
        >
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
        </motion.div>
        
        <motion.h1 
          className="text-4xl font-bold text-white mb-6 text-center z-10"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          Start Your Journey
        </motion.h1>
        
        <motion.p 
          className="text-gray-300 text-center max-w-md z-10"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          Join KeyMap today and streamline your database schema design process.
        </motion.p>
        
        <motion.div 
          className="absolute bottom-8 left-12 right-12 z-10"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.9 }}
        >
          <p className="text-gray-400 text-sm">
            Already have an account?{' '}
            <Link 
              href="/login" 
              className="text-white hover:text-indigo-300 font-medium transition-colors"
            >
              Log in here
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
} 