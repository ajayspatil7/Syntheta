"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function Login() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  // Check if user is already logged in
  useEffect(() => {
    const accessToken = localStorage.getItem('access_token');
    if (accessToken) {
      router.push('/dashboard');
    }
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    // Clear error for this field
    if (errors[id as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [id]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const formDataToSend = new URLSearchParams();
      formDataToSend.append('username', formData.email);
      formDataToSend.append('password', formData.password);

      const response = await fetch('http://localhost:8000/api/v1/auth/login', {
        method: 'POST',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        body: formDataToSend.toString(),
      });
      
      if (response.ok) {
        const data = await response.json();
        // Store tokens in localStorage
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
        
        // Set cookies for the tokens
        document.cookie = `access_token=${data.access_token}; path=/;`;
        document.cookie = `refresh_token=${data.refresh_token}; path=/;`;
        
        // Get the redirect URL from query params or default to dashboard
        const redirectTo = searchParams.get('from') || '/dashboard';
        router.push(redirectTo);
      } else {
        const data = await response.json();
        setErrors({ submit: data.detail || 'Login failed. Please try again.' });
      }
    } catch (error) {
      setErrors({ submit: 'Network error. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back</h1>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to your account to continue
          </p>
        </div>

        {errors.submit && (
          <div className="p-3 rounded-lg bg-red-100 text-red-700 border border-red-200 text-sm">
            {errors.submit}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="email" className="text-xs uppercase font-medium text-gray-500">Email *</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="you@example.com" 
                value={formData.email} 
                onChange={handleChange} 
                required 
                className={`w-full px-4 py-2 rounded-lg bg-white/60 border ${errors.email ? 'border-red-300' : 'border-gray-200'} text-gray-800 placeholder:text-gray-400 focus:ring-1 focus:ring-blue-300 focus:border-blue-300 transition-all duration-200`}
              />
              {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
            </div>

            <div className="space-y-1">
              <Label htmlFor="password" className="text-xs uppercase font-medium text-gray-500">Password *</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••" 
                value={formData.password} 
                onChange={handleChange} 
                required 
                className={`w-full px-4 py-2 rounded-lg bg-white/60 border ${errors.password ? 'border-red-300' : 'border-gray-200'} text-gray-800 placeholder:text-gray-400 focus:ring-1 focus:ring-blue-300 focus:border-blue-300 transition-all duration-200`}
              />
              {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password}</p>}
            </div>

            <div className="text-right">
              <Link href="/forgot-password" className="text-sm text-blue-600 hover:underline">
                Forgot Password?
              </Link>
            </div>
          </div>

          <div className="space-y-4">
            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full text-lg px-6 py-3 rounded-full bg-gray-800 text-white font-semibold hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>
            
            <p className="text-center text-sm text-gray-600">
              Don't have an account?{" "}
              <Link href="/signup" className="text-blue-600 font-medium hover:underline">
                Sign Up
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
} 