"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Activity } from "lucide-react";
import { useRouter } from "next/navigation";

const employmentStatuses = [
  { value: "employed", label: "Employed" },
  { value: "self-employed", label: "Self-employed" },
  { value: "student", label: "Student" },
  { value: "unemployed", label: "Unemployed" },
];

const roles = [
  { value: "data-scientist", label: "Data Scientist" },
  { value: "ml-engineer", label: "ML Engineer" },
  { value: "data-engineer", label: "Data Engineer" },
  { value: "researcher", label: "Researcher" },
  { value: "other", label: "Other" },
];

const experienceLevels = [
  { value: "entry", label: "Entry Level (0-2 years)" },
  { value: "mid", label: "Mid Level (3-5 years)" },
  { value: "senior", label: "Senior Level (5+ years)" },
];

const interests = [
  { id: "gan", label: "GANs" },
  { id: "llm", label: "LLMs" },
  { id: "cv", label: "Computer Vision" },
  { id: "nlp", label: "NLP" },
  { id: "rl", label: "Reinforcement Learning" },
  { id: "time-series", label: "Time Series" },
];

// Mock Security Log Data
const securityLogs = [
  { id: 1, type: "Login", description: "Successful login from New York", time: "2 hours ago" },
  { id: 2, type: "Password Change", description: "Password updated by user", time: "1 day ago" },
  { id: 3, type: "Failed Login", description: "Failed login attempt from unknown IP", time: "3 days ago" },
];

export default function ProfilePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [profileData, setProfileData] = useState({
    fullName: "",
    email: "",
    employmentStatus: "",
    role: "",
    experienceLevel: "",
    interests: [] as string[],
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const accessToken = localStorage.getItem('access_token');
        if (!accessToken) {
          router.push('/login');
          return;
        }

        const response = await fetch('http://localhost:8000/api/v1/auth/me', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const userData = await response.json();
          setProfileData({
            fullName: userData.full_name,
            email: userData.email,
            employmentStatus: userData.employment_status || "",
            role: userData.current_role || "",
            experienceLevel: userData.experience_level || "",
            interests: userData.primary_interests || [],
          });
        } else {
          // Handle unauthorized or other errors
          if (response.status === 401) {
            router.push('/login');
          }
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [router]);

  const handleInputChange = (field: string, value: string) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
  };

  const handleInterestToggle = (interestId: string) => {
    setProfileData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interestId)
        ? prev.interests.filter((id) => id !== interestId)
        : [...prev.interests, interestId],
    }));
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData((prev) => ({ ...prev, [field]: value }));
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        router.push('/login');
        return;
      }

      const response = await fetch('http://localhost:8000/api/v1/auth/me', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          full_name: profileData.fullName,
          employment_status: profileData.employmentStatus,
          current_role: profileData.role,
          experience_level: profileData.experienceLevel,
          primary_interests: profileData.interests,
          email: profileData.email
        }),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setProfileData({
          fullName: updatedUser.full_name,
          email: updatedUser.email,
          employmentStatus: updatedUser.employment_status || "",
          role: updatedUser.current_role || "",
          experienceLevel: updatedUser.experience_level || "",
          interests: updatedUser.primary_interests || [],
        });
        alert('Profile updated successfully');
      } else {
        const errorData = await response.json();
        alert(errorData.detail || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile');
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match');
      return;
    }

    try {
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        router.push('/login');
        return;
      }

      const response = await fetch('http://localhost:8000/api/v1/auth/me/password', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          current_password: passwordData.currentPassword,
          new_password: passwordData.newPassword,
        }),
      });

      if (response.ok) {
        alert('Password updated successfully');
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        const errorData = await response.json();
        alert(errorData.detail || 'Failed to update password');
      }
    } catch (error) {
      console.error('Error updating password:', error);
      alert('Error updating password');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-xl font-medium tracking-tight text-syntheta-dark">Profile</h1>
        <p className="text-sm text-syntheta-dark/60">
          Manage your account settings and preferences.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {/* Profile Information */}
        <div className="rounded-xl bg-white/60 backdrop-blur-xl border border-white/20 p-6 lg:col-span-1">
          <h2 className="text-base font-medium text-syntheta-dark mb-6">Profile Information</h2>
          <form onSubmit={handleProfileSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="fullName" className="text-sm text-syntheta-dark/80">
                  Full Name
                </Label>
                <Input
                  id="fullName"
                  value={profileData.fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                  className="mt-1.5 bg-white/40 border-white/10 text-syntheta-dark placeholder:text-syntheta-dark/40"
                />
              </div>

              <div>
                <Label htmlFor="email" className="text-sm text-syntheta-dark/80">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="mt-1.5 bg-white/40 border-white/10 text-syntheta-dark placeholder:text-syntheta-dark/40"
                />
              </div>

              <div>
                <Label className="text-sm text-syntheta-dark/80">Employment Status</Label>
                <RadioGroup
                  value={profileData.employmentStatus}
                  onValueChange={(value) => handleInputChange("employmentStatus", value)}
                  className="mt-1.5 grid grid-cols-2 gap-4"
                >
                  {employmentStatuses.map((status) => (
                    <div key={status.value} className="flex items-center space-x-2">
                      <RadioGroupItem
                        value={status.value}
                        id={status.value}
                        className="border-syntheta-primary/20 text-syntheta-primary"
                      />
                      <Label
                        htmlFor={status.value}
                        className="text-sm text-syntheta-dark/80 cursor-pointer"
                      >
                        {status.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div>
                <Label htmlFor="role" className="text-sm text-syntheta-dark/80">
                  Primary Role
                </Label>
                <Select
                  value={profileData.role}
                  onValueChange={(value) => handleInputChange("role", value)}
                >
                  <SelectTrigger className="mt-1.5 w-full bg-white/40 border-white/10 text-syntheta-dark placeholder:text-syntheta-dark/40">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent className="bg-white/80 backdrop-blur-xl border-white/20">
                    {roles.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm text-syntheta-dark/80">Experience Level</Label>
                <RadioGroup
                  value={profileData.experienceLevel}
                  onValueChange={(value) => handleInputChange("experienceLevel", value)}
                  className="mt-1.5 space-y-2"
                >
                  {experienceLevels.map((level) => (
                    <div key={level.value} className="flex items-center space-x-2">
                      <RadioGroupItem
                        value={level.value}
                        id={level.value}
                        className="border-syntheta-primary/20 text-syntheta-primary"
                      />
                      <Label
                        htmlFor={level.value}
                        className="text-sm text-syntheta-dark/80 cursor-pointer"
                      >
                        {level.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div>
                <Label className="text-sm text-syntheta-dark/80">Primary Interests</Label>
                <div className="mt-1.5 grid grid-cols-2 gap-4">
                  {interests.map((interest) => (
                    <div key={interest.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={interest.id}
                        checked={profileData.interests.includes(interest.id)}
                        onCheckedChange={() => handleInterestToggle(interest.id)}
                        className="border-syntheta-primary/20 text-syntheta-primary"
                      />
                      <Label
                        htmlFor={interest.id}
                        className="text-sm text-syntheta-dark/80 cursor-pointer"
                      >
                        {interest.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-syntheta-primary text-white hover:bg-syntheta-primary/90"
            >
              Update Profile
            </Button>
          </form>
        </div>

        {/* Password Update */}
        <div className="rounded-xl bg-white/60 backdrop-blur-xl border border-white/20 p-6 lg:col-span-1">
          <h2 className="text-base font-medium text-syntheta-dark mb-6">Update Password</h2>
          <form onSubmit={handlePasswordSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="currentPassword" className="text-sm text-syntheta-dark/80">
                  Current Password
                </Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => handlePasswordChange("currentPassword", e.target.value)}
                  className="mt-1.5 bg-white/40 border-white/10 text-syntheta-dark placeholder:text-syntheta-dark/40"
                />
              </div>

              <div>
                <Label htmlFor="newPassword" className="text-sm text-syntheta-dark/80">
                  New Password
                </Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => handlePasswordChange("newPassword", e.target.value)}
                  className="mt-1.5 bg-white/40 border-white/10 text-syntheta-dark placeholder:text-syntheta-dark/40"
                />
              </div>

              <div>
                <Label htmlFor="confirmPassword" className="text-sm text-syntheta-dark/80">
                  Confirm New Password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => handlePasswordChange("confirmPassword", e.target.value)}
                  className="mt-1.5 bg-white/40 border-white/10 text-syntheta-dark placeholder:text-syntheta-dark/40"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-syntheta-primary text-white hover:bg-syntheta-primary/90"
            >
              Update Password
            </Button>
          </form>
        </div>

        {/* Security & Activity Log */}
        <div className="rounded-xl bg-white/60 backdrop-blur-xl border border-white/20 p-6 lg:col-span-1">
          <h2 className="text-base font-medium text-syntheta-dark mb-6">Security & Activity Log</h2>
          <div className="space-y-4">
            {securityLogs.map((log) => (
              <div key={log.id} className="flex items-start space-x-3 text-sm">
                <Activity className="h-4 w-4 text-syntheta-dark/60 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-syntheta-dark truncate">
                    <span className="font-medium">{log.type}:</span> {log.description}
                  </p>
                  <p className="text-xs text-syntheta-dark/40">{log.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 