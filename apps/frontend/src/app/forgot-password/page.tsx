"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ForgotPassword() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState({
    email: '',
    newPassword: '',
    confirmPassword: '',
  });

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
    
    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    }
    
    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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
      const response = await fetch('http://localhost:8000/api/v1/auth/password-reset/direct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          new_password: formData.newPassword
        }),
      });
      
      if (response.ok) {
        // Redirect to login page after successful password reset
        router.push('/login');
      } else {
        const data = await response.json();
        // Handle validation errors
        if (data.detail && Array.isArray(data.detail)) {
          // Handle multiple validation errors
          const validationErrors = data.detail.reduce((acc: Record<string, string>, error: any) => {
            const field = error.loc[error.loc.length - 1];
            acc[field] = error.msg;
            return acc;
          }, {});
          setErrors(validationErrors);
        } else {
          // Handle single error message
          setErrors({ submit: data.detail || 'Password reset failed. Please try again.' });
        }
      }
    } catch (error) {
      setErrors({ submit: 'Network error. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 md:p-10 relative overflow-hidden bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Ambient Background Blobs - More Subtle */}
      <div className="absolute top-[10%] left-[10%] w-48 h-48 bg-blue-200/30 rounded-full mix-blend-multiply filter blur-2xl opacity-50 animate-blob"></div>
      <div className="absolute bottom-[10%] right-[10%] w-48 h-48 bg-indigo-200/30 rounded-full mix-blend-multiply filter blur-2xl opacity-50 animate-blob animation-delay-2000"></div>
      <div className="absolute top-[40%] right-[15%] w-48 h-48 bg-purple-200/30 rounded-full mix-blend-multiply filter blur-2xl opacity-50 animate-blob animation-delay-4000"></div>
      <div className="absolute bottom-[40%] left-[15%] w-48 h-48 bg-cyan-200/30 rounded-full mix-blend-multiply filter blur-2xl opacity-50 animate-blob animation-delay-6000"></div>
      <div className="absolute top-[25%] right-[30%] w-48 h-48 bg-pink-200/30 rounded-full mix-blend-multiply filter blur-2xl opacity-50 animate-blob animation-delay-8000"></div>

      <div className="relative z-10 w-full max-w-md p-8 md:p-10 bg-white/15 backdrop-blur-md border border-white/20 rounded-3xl shadow-glass space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-semibold page-heading-gradient">Reset Password</h1>
          <p className="text-base text-gray-600">Enter your email and new password</p>
        </div>

        {errors.submit && (
          <div className="p-3 rounded-lg bg-red-100 text-red-700 border border-red-200 text-sm">
            {errors.submit}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Form Fields */}
          <div className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="email" className="text-xs uppercase font-medium text-gray-500">Email Address *</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="john@company.com" 
                value={formData.email} 
                onChange={handleChange} 
                required 
                className={`w-full px-4 py-2 rounded-lg bg-white/60 border ${errors.email ? 'border-red-300' : 'border-gray-200'} text-gray-800 placeholder:text-gray-400 focus:ring-1 focus:ring-blue-300 focus:border-blue-300 transition-all duration-200`}
              />
              {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
            </div>

            <div className="space-y-1">
              <Label htmlFor="newPassword" className="text-xs uppercase font-medium text-gray-500">New Password *</Label>
              <Input 
                id="newPassword" 
                type="password" 
                placeholder="••••••••" 
                value={formData.newPassword} 
                onChange={handleChange} 
                required 
                className={`w-full px-4 py-2 rounded-lg bg-white/60 border ${errors.newPassword ? 'border-red-300' : 'border-gray-200'} text-gray-800 placeholder:text-gray-400 focus:ring-1 focus:ring-blue-300 focus:border-blue-300 transition-all duration-200`}
              />
              {errors.newPassword && <p className="text-xs text-red-600 mt-1">{errors.newPassword}</p>}
            </div>

            <div className="space-y-1">
              <Label htmlFor="confirmPassword" className="text-xs uppercase font-medium text-gray-500">Confirm New Password *</Label>
              <Input 
                id="confirmPassword" 
                type="password" 
                placeholder="••••••••" 
                value={formData.confirmPassword} 
                onChange={handleChange} 
                required 
                className={`w-full px-4 py-2 rounded-lg bg-white/60 border ${errors.confirmPassword ? 'border-red-300' : 'border-gray-200'} text-gray-800 placeholder:text-gray-400 focus:ring-1 focus:ring-blue-300 focus:border-blue-300 transition-all duration-200`}
              />
              {errors.confirmPassword && <p className="text-xs text-red-600 mt-1">{errors.confirmPassword}</p>}
            </div>
          </div>

          {/* Submit */}
          <div className="space-y-4">
            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full text-lg px-6 py-3 rounded-full bg-gray-800 text-white font-semibold hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {isLoading ? 'Resetting Password...' : 'Reset Password'}
            </Button>
            
            <p className="text-center text-sm text-gray-600">
              Remember your password?{' '}
              <Link href="/login" className="text-blue-600 font-medium hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
} 