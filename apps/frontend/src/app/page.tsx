"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Zap, Lightbulb, Bolt, Rocket, Building, Activity, Banknote, FlaskConical, Bot, Lock, Shield, Code, Database, LineChart, Users } from 'lucide-react';
import Image from "next/image";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleRequestAccess = () => {
    setIsLoading(true);
    // Add your request access logic here
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full flex justify-center px-4 py-4">
        <div className="w-full max-w-screen-lg relative flex items-center justify-between px-6 py-3 rounded-xl backdrop-blur-xl bg-white/10 border border-white/20 shadow-lg shadow-white/5">
          {/* Background element for glassmorphism effect at the top */}
          <div className="absolute inset-0 bg-white/5 rounded-xl -z-10"></div>
          
          <div className="text-xl font-bold gradient-text z-10">Syntheta</div>
          <nav className="hidden md:flex ml-6 z-10">
            <ul className="flex space-x-6 text-foreground">
              <li><Link href="/#product" className="hover:underline">Product</Link></li>
              <li><Link href="/#features" className="hover:underline">Features</Link></li>
              <li><Link href="/#docs" className="hover:underline">Docs</Link></li>
              <li><Link href="/#pricing" className="hover:underline">Pricing</Link></li>
            </ul>
          </nav>
          <Link href="/login">
            <Button variant="outline" className="ml-6 hidden md:block">Sign In</Button>
          </Link>
           {/* Mobile Menu Button - Placeholder */}
          <div className="md:hidden z-10">
             {/* Add mobile menu icon and functionality */}
             <Button variant="outline" size="icon">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                 </svg>
             </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative flex h-screen items-center justify-center overflow-hidden">
        {/* Subtle Background Gradient */}
        <div className="absolute inset-0 z-0 opacity-50">
           <div className="absolute inset-x-0 top-0 h-96 bg-gradient-to-b from-blue-400/20 via-purple-300/20 to-transparent blur-2xl"></div>
        </div>

        {/* Subtle Animated Background (kept in case you want it back) */}
        {/* <div className="absolute inset-0 z-0 opacity-30 animate-gradient"></div> */}

        <div className="relative z-10 text-center space-y-8 p-6 pt-24">
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-tight gradient-text">
            Privacy is not optional.<br />It's composable.
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
            Orchestrate secure, synthetic data pipelines using the tools you trust.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/early-access">
              <Button size="lg" className="text-lg px-8 py-6 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                Request Early Access
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6 rounded-full">
              Watch Demo
            </Button>
          </div>

          {/* Trust Section */}
          <div className="mt-12 text-sm text-muted-foreground">
            Built with FastAPI, Temporal, PostgreSQL — Open by nature, secure by default.
          </div>

          {/* Preview GIFs */}
          <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="glass-card p-4">
              <div className="aspect-video bg-muted/50 rounded-lg flex items-center justify-center">
                <p className="text-muted-foreground">DAG Editor Preview</p>
              </div>
            </div>
            <div className="glass-card p-4">
              <div className="aspect-video bg-muted/50 rounded-lg flex items-center justify-center">
                <p className="text-muted-foreground">Evaluation Dashboard</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Showcase Section */}
      <section id="product" className="py-20 bg-card text-card-foreground">
        <div className="container mx-auto px-6 space-y-16">
          <h2 className="text-4xl font-bold text-center gradient-text">See Syntheta in Action</h2>
          
          {/* Product Mockup Image */}
          <div className="mx-auto max-w-4xl">
            <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden shadow-lg">
              <Image
                src="/assets/landingpage-assets/Builder.png"
                alt="Syntheta DAG Editor Mockup"
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-primary">100%</div>
              <div className="text-sm text-muted-foreground">Privacy Preserved</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-primary">10x</div>
              <div className="text-sm text-muted-foreground">Faster Development</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-primary">24/7</div>
              <div className="text-sm text-muted-foreground">Pipeline Monitoring</div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Blocks Section */}
      <section id="features" className="py-20">
        <div className="container mx-auto px-6 space-y-12">
          <h2 className="text-4xl font-bold text-center gradient-text">Powerful Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature Block 1 */}
            <div className="glass-card p-8 space-y-4">
              <Shield className="w-10 h-10 text-primary" />
              <h3 className="text-xl font-semibold">Federated Generation</h3>
              <p className="text-muted-foreground">Generate where the data lives — not where it leaks. Enables synthetic data generation at the edge (e.g., hospitals), only metrics are shared.</p>
            </div>
            {/* Feature Block 2 */}
            <div className="glass-card p-8 space-y-4">
              <Code className="w-10 h-10 text-primary" />
              <h3 className="text-xl font-semibold">Visual DAG Builder</h3>
              <p className="text-muted-foreground">Composable pipelines, drag-and-drop simplicity. Users can create complex pipelines without code using a powerful visual interface.</p>
            </div>
            {/* Feature Block 3 */}
            <div className="glass-card p-8 space-y-4">
              <Database className="w-10 h-10 text-primary" />
              <h3 className="text-xl font-semibold">Hybrid Execution</h3>
              <p className="text-muted-foreground">Run parts in the cloud, parts on-prem. Mix local generation with cloud-based evaluation or export seamlessly.</p>
            </div>
            {/* Feature Block 4 */}
            <div className="glass-card p-8 space-y-4">
              <LineChart className="w-10 h-10 text-primary" />
              <h3 className="text-xl font-semibold">Built-in Evaluators</h3>
              <p className="text-muted-foreground">Trust your synthetic data. Use FVD, TSTR, Privacy Risk Scores, and Membership Inference to validate output.</p>
            </div>
            {/* Feature Block 5 */}
            <div className="glass-card p-8 space-y-4">
              <Users className="w-10 h-10 text-primary" />
              <h3 className="text-xl font-semibold">Marketplace Integration</h3>
              <p className="text-muted-foreground">Bring your own generator. Plug in community-built models, access domain-specific presets.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Logos / Trust Section */}
      <section className="py-16 bg-muted">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-2xl font-semibold text-muted-foreground">Trusted by teams at...</h2>
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 items-center justify-items-center opacity-50">
            <Building className="w-12 h-12 text-muted-foreground" />
            <Activity className="w-12 h-12 text-muted-foreground" />
            <Banknote className="w-12 h-12 text-muted-foreground" />
            <FlaskConical className="w-12 h-12 text-muted-foreground" />
            <Bot className="w-12 h-12 text-muted-foreground" />
            <Lock className="w-12 h-12 text-muted-foreground" />
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-20">
         <div className="container mx-auto px-6 max-w-3xl text-center space-y-8">
            {/* Testimonial Quote */}
             <blockquote className="text-3xl italic font-medium leading-relaxed text-foreground">
                "Syntheta transformed our data pipelines, accelerating our AI model development by leaps and bounds. Absolutely essential for modern data teams."
             </blockquote>
             <div className="flex flex-col items-center space-y-2">
                 {/* Image Placeholder */}
                 <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                 <p className="text-lg font-semibold">Jane Doe</p>
                 <p className="text-muted-foreground">CTO at Innovative Solutions</p>
             </div>
             {/* Company Logo Placeholder */}
             <div className="w-20 h-6 bg-gray-300 mx-auto mt-4"></div>
         </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-20">
        <div className="container mx-auto px-6 max-w-3xl text-center space-y-8">
          <h2 className="text-3xl font-bold gradient-text">Stay ahead of the synthetic data curve.</h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Input type="email" placeholder="Enter your email" className="max-w-md" />
            <Button>Subscribe</Button>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}

      <section className="py-20 bg-primary text-primary-foreground">
  <div className="flex flex-col items-center justify-center gap-8">
    <h2 className="text-4xl font-bold">Ready to Reimagine Your Data?</h2>
    <p className="text-xl">Join leading teams who are building the future with synthetic data.</p>
    <Link href="/dag">
      <Button size="lg" className="text-lg px-8 py-6 rounded-full bg-background text-foreground hover:bg-background/90 transition-colors">
        See Live Demo
      </Button>
    </Link>
  </div>
</section>

      {/* Minimal Footer */}
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
    </div>
  );
} 