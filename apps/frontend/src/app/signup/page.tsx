"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Switch } from "@/components/ui/switch";

export default function Signup() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    employmentStatus: '',
    currentRole: '',
    experienceLevel: '',
    primaryInterests: [] as string[],
    howDidYouHear: '',
  });

  const employmentOptions = ['Employed', 'Unemployed', 'Student', 'Freelancer'];
  const roleOptions = ['Data Scientist', 'ML Engineer', 'AI Researcher', 'Product Manager', 'Software Engineer', 'Healthcare Analyst', 'Compliance Officer', 'Other'];
  const experienceOptions = ['0–1 years', '2–4 years', '5+ years'];
  const interestOptions = ['Medical Imaging', 'Tabular Data Synthesis', 'Privacy Engineering', 'Evaluation & QA', 'MLOps/DataOps', 'Research/Academia'];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    // Clear error for this field
    if (errors[id as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [id]: '' }));
    }
  };

  const handleSelectChange = (id: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
    if (errors[id as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [id]: '' }));
    }
  };

  const handleInterestChange = (interest: string, checked: boolean | 'indeterminate') => {
    if (checked === 'indeterminate') return;
    
    setFormData((prev) => ({
      ...prev,
      primaryInterests: checked
        ? [...prev.primaryInterests, interest]
        : prev.primaryInterests.filter((item) => item !== interest),
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.employmentStatus) {
      newErrors.employmentStatus = 'Please select your employment status';
    }
    
    if (!formData.currentRole) {
      newErrors.currentRole = 'Please select your current role';
    }
    
    if (!formData.experienceLevel) {
      newErrors.experienceLevel = 'Please select your experience level';
    }
    
    if (formData.primaryInterests.length === 0) {
      newErrors.primaryInterests = 'Please select at least one interest';
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
      const response = await fetch('http://localhost:8000/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          full_name: formData.fullName,
          employment_status: formData.employmentStatus,
          current_role: formData.currentRole,
          experience_level: formData.experienceLevel,
          primary_interests: formData.primaryInterests,
          how_did_you_hear: formData.howDidYouHear
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        // Store tokens in localStorage
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
        // Redirect to dashboard
        router.push('/dashboard');
      } else {
        const data = await response.json();
        setErrors({ submit: data.detail || 'Signup failed. Please try again.' });
      }
    } catch (error) {
      setErrors({ submit: 'Network error. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrength = (password: string) => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    return Math.min(strength, 4);
  };

  const passwordStrength = getPasswordStrength(formData.password);
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500'];
  const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong'];

  return (
    <div className="min-h-screen flex items-center justify-center p-6 md:p-10 relative overflow-hidden bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Background Image with Blur */}
      {/* Ambient Background Blobs - More Subtle */}
      <div className="absolute top-[10%] left-[10%] w-48 h-48 bg-blue-200/30 rounded-full mix-blend-multiply filter blur-2xl opacity-50 animate-blob"></div>
      <div className="absolute bottom-[10%] right-[10%] w-48 h-48 bg-indigo-200/30 rounded-full mix-blend-multiply filter blur-2xl opacity-50 animate-blob animation-delay-2000"></div>
      <div className="absolute top-[40%] right-[15%] w-48 h-48 bg-purple-200/30 rounded-full mix-blend-multiply filter blur-2xl opacity-50 animate-blob animation-delay-4000"></div>
      <div className="absolute bottom-[40%] left-[15%] w-48 h-48 bg-cyan-200/30 rounded-full mix-blend-multiply filter blur-2xl opacity-50 animate-blob animation-delay-6000"></div>
      <div className="absolute top-[25%] right-[30%] w-48 h-48 bg-pink-200/30 rounded-full mix-blend-multiply filter blur-2xl opacity-50 animate-blob animation-delay-8000"></div>

      {/* Main Glassmorphic Card */}
      <div className="relative z-10 w-full max-w-2xl p-8 md:p-10 bg-white/15 backdrop-blur-md border border-white/20 rounded-3xl shadow-glass space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-8">
          <h1 className="text-4xl md:text-5xl font-semibold page-heading-gradient">Join Syntheta</h1>
          <p className="text-base text-gray-600">Start building enterprise-grade synthetic data pipelines today</p>
        </div>

        {errors.submit && (
          <div className="p-3 rounded-lg bg-red-100 text-red-700 border border-red-200 text-sm">
            {errors.submit}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-700">Personal Information</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="fullName" className="text-xs uppercase font-medium text-gray-500">Full Name *</Label>
                <Input 
                  id="fullName" 
                  type="text" 
                  placeholder="John Doe" 
                  value={formData.fullName} 
                  onChange={handleChange} 
                  required 
                  className={`w-full px-4 py-2 rounded-lg bg-white/60 border ${errors.fullName ? 'border-red-300' : 'border-gray-200'} text-gray-800 placeholder:text-gray-400 focus:ring-1 focus:ring-blue-300 focus:border-blue-300 transition-all duration-200`}
                />
                {errors.fullName && <p className="text-xs text-red-600 mt-1">{errors.fullName}</p>}
              </div>

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
                {formData.password && (
                  <div className="space-y-1">
                    <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${strengthColors[passwordStrength - 1] || 'bg-white/10'} rounded-full transition-all duration-300`}
                        style={{ width: `${(passwordStrength / 4) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      Strength: {strengthLabels[passwordStrength - 1] || 'Very Weak'}
                    </p>
                  </div>
                )}
                {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password}</p>}
              </div>

              <div className="space-y-1">
                <Label htmlFor="confirmPassword" className="text-xs uppercase font-medium text-gray-500">Confirm Password *</Label>
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
          </div>

          {/* Professional Information */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-700">Professional Information</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="employmentStatus" className="text-xs uppercase font-medium text-gray-500">Employment Status *</Label>
                <Select onValueChange={(value) => handleSelectChange('employmentStatus', value)} value={formData.employmentStatus} >
                  <SelectTrigger className={`w-full px-4 py-2 rounded-lg bg-white/60 border ${errors.employmentStatus ? 'border-red-300' : 'border-gray-200'} text-gray-800 placeholder:text-gray-400 focus:ring-1 focus:ring-blue-300 focus:border-blue-300 transition-all duration-200`}>
                    <SelectValue placeholder="Select your employment status" />
                  </SelectTrigger>
                  <SelectContent className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-lg p-1">
                    {employmentOptions.map(option => (
                      <SelectItem key={option} value={option} className="text-gray-800">{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.employmentStatus && <p className="text-xs text-red-600 mt-1">{errors.employmentStatus}</p>}
              </div>

              <div className="space-y-1">
                <Label htmlFor="currentRole" className="text-xs uppercase font-medium text-gray-500">Current Role *</Label>
                <Select onValueChange={(value) => handleSelectChange('currentRole', value)} value={formData.currentRole}>
                  <SelectTrigger className={`w-full px-4 py-2 rounded-lg bg-white/60 border ${errors.currentRole ? 'border-red-300' : 'border-gray-200'} text-gray-800 placeholder:text-gray-400 focus:ring-1 focus:ring-blue-300 focus:border-blue-300 transition-all duration-200`}>
                    <SelectValue placeholder="Select your current role" />
                  </SelectTrigger>
                  <SelectContent className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-lg p-1">
                    {roleOptions.map(option => (
                      <SelectItem key={option} value={option} className="text-gray-800">{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.currentRole && <p className="text-xs text-red-600 mt-1">{errors.currentRole}</p>}
              </div>

              <div className="space-y-1">
                <Label htmlFor="experienceLevel" className="text-xs uppercase font-medium text-gray-500">Experience Level *</Label>
                <Select onValueChange={(value) => handleSelectChange('experienceLevel', value)} value={formData.experienceLevel}>
                  <SelectTrigger className={`w-full px-4 py-2 rounded-lg bg-white/60 border ${errors.experienceLevel ? 'border-red-300' : 'border-gray-200'} text-gray-800 placeholder:text-gray-400 focus:ring-1 focus:ring-blue-300 focus:border-blue-300 transition-all duration-200`}>
                    <SelectValue placeholder="Select your experience level" />
                  </SelectTrigger>
                  <SelectContent className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-lg p-1">
                    {experienceOptions.map(option => (
                      <SelectItem key={option} value={option} className="text-gray-800">{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.experienceLevel && <p className="text-xs text-red-600 mt-1">{errors.experienceLevel}</p>}
              </div>

              <div className="space-y-1 col-span-2">
                <Label className="text-xs uppercase font-medium text-gray-500">Primary Interests *</Label>
                <div className="grid grid-cols-2 gap-3">
                  {interestOptions.map(interest => (
                    <div key={interest} className="flex items-center space-x-2">
                      <Checkbox 
                        id={interest} 
                        checked={formData.primaryInterests.includes(interest)}
                        onCheckedChange={(checked) => handleInterestChange(interest, checked)}
                        className="border-gray-300 text-blue-500 focus:ring-blue-500"
                      />
                      <Label htmlFor={interest} className="text-sm text-gray-700 cursor-pointer">{interest}</Label>
                    </div>
                  ))}
                </div>
                {errors.primaryInterests && <p className="text-xs text-red-600 mt-1">{errors.primaryInterests}</p>}
              </div>

              <div className="space-y-1 col-span-2">
                <Label htmlFor="howDidYouHear" className="text-xs uppercase font-medium text-gray-500">How did you hear about Syntheta?</Label>
                <Input 
                  id="howDidYouHear" 
                  type="text" 
                  placeholder="e.g., Friend, Social Media, Article" 
                  value={formData.howDidYouHear} 
                  onChange={handleChange} 
                  className="w-full px-4 py-2 rounded-lg bg-white/60 border border-gray-200 text-gray-800 placeholder:text-gray-400 focus:ring-1 focus:ring-blue-300 focus:border-blue-300 transition-all duration-200"
                />
              </div>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors duration-200"
            disabled={isLoading}
          >
            {isLoading ? 'Signing up...' : 'Create Account'}
          </Button>

          <p className="text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-600 hover:underline">
              Log in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}