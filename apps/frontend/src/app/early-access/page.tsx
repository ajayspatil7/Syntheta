"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

export default function EarlyAccess() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    why: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Add form submission logic here (e.g., API call)
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header - Copied from landing page for consistency */}
      <header className="sticky top-0 z-50 flex w-full items-center justify-between p-6 backdrop-blur-md bg-background/30">
        <div className="text-2xl font-bold gradient-text">Syntheta</div>
        <nav>
          <ul className="flex space-x-6">
            <li><Link href="/#product" className="hover:underline">Product</Link></li>
            <li><Link href="/#features" className="hover:underline">Features</Link></li>
            <li><Link href="/#docs" className="hover:underline">Docs</Link></li>
            <li><Link href="/#pricing" className="hover:underline">Pricing</Link></li>
          </ul>
        </nav>
        <Button variant="outline">Sign In</Button>
      </header>

      {/* Early Access Form Section */}
      <section className="py-20 flex items-center justify-center">
        <div className="container mx-auto px-6 max-w-lg glass-card p-8 space-y-8">
          <h2 className="text-3xl font-bold text-center gradient-text">Request Early Access</h2>
          <p className="text-center text-muted-foreground">Join the Syntheta beta program and start building privacy-first data pipelines.</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" type="text" placeholder="Your Name" value={formData.name} onChange={handleChange} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="Your Email" value={formData.email} onChange={handleChange} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Input id="role" type="text" placeholder="e.g., Data Scientist, MLOps Engineer" value={formData.role} onChange={handleChange} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="why">Why do you want Syntheta early access?</Label>
              <Textarea id="why" placeholder="Tell us about your use case" value={formData.why} onChange={handleChange} required rows={5} />
            </div>

            <Button type="submit" className="w-full">Submit Request</Button>
          </form>
        </div>
      </section>

      {/* Optional Footer - You can add the footer here if needed */}
      {/*
      <footer className="py-10 text-center text-muted-foreground text-sm">
          <div className="container mx-auto px-6 space-y-4">
              <p>© 2025 Syntheta. All rights reserved.</p>
              <div className="space-x-6">
                  <Link href="#" className="hover:underline">Privacy Policy</Link>
                  <Link href="#" className="hover:underline">Terms of Service</Link>
                  <Link href="#" className="hover:underline">Contact</Link>
              </div>
          </div>
      </footer>
      */}
    </div>
  );
} 