import Link from "next/link";
import { Button } from "@/components/ui/button"; // Assuming shadcn/ui Button component
import { Input } from "@/components/ui/input"; // Assuming shadcn/ui Input component

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-syntheta-background">
      {/* Sticky Header/Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-syntheta-neutral bg-syntheta-background/95 backdrop-blur supports-[backdrop-filter]:bg-syntheta-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex">
            <Link className="mr-6 flex items-center space-x-2" href="/">
              {/* Placeholder for Logo/Icon */}
              <span className="font-bold text-syntheta-dark">Syntheta</span>
            </Link>
          </div>
          {/* Navigation Links (Optional for MVP) */}
          {/* <nav>...</nav> */}
          <div className="flex flex-1 items-center justify-end space-x-2">
            {/* Auth Buttons (Placeholder) */}
            <Button variant="ghost" size="sm">Login</Button>
            <Button variant="default" size="sm">Sign Up</Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full py-12 md:py-24 lg:py-32">
          <div className="container grid gap-10 px-4 md:px-6 lg:grid-cols-2 lg:gap-16">
            <div className="flex flex-col items-start justify-center space-y-4">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl text-syntheta-dark">
                Orchestrate Synthetic Data Like Never Before.
              </h1>
              <p className="max-w-[700px] text-muted-foreground md:text-xl">
                Syntheta helps AI teams build, evaluate, and deploy multi-modal synthetic data pipelines – visually, securely, and fast.
              </p>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button className="rounded-2xl bg-syntheta-primary text-primary-foreground hover:bg-syntheta-primary/90">
                  Get Early Access
                </Button>
                <Button variant="outline" className="rounded-2xl border-syntheta-primary text-syntheta-primary hover:bg-syntheta-primary/10">
                  See How It Works
                </Button>
              </div>
              {/* Trust Signals */}
              <p className="text-sm text-muted-foreground mt-4">
                Backed by industry experts in AI + Data Privacy
              </p>
              {/* Newsletter Signup (Moved below CTA for now, can be adjusted) */}
               <div className="w-full max-w-sm space-y-2 mt-4">
                  <p className="text-sm font-medium text-syntheta-dark">Join the waitlist for beta access</p>
                  <div className="flex gap-2">
                    <Input type="email" placeholder="Enter your email" className="rounded-xl border-syntheta-neutral bg-syntheta-background" />
                    <Button type="submit" className="rounded-xl bg-syntheta-dark text-primary-foreground hover:bg-syntheta-dark/90">Join</Button>
                  </div>
               </div>
            </div>
            {/* Illustration Placeholder */}
            <div className="relative aspect-video overflow-hidden rounded-xl">
              <div className="flex h-full items-center justify-center bg-syntheta-surface text-syntheta-dark">
                [Abstract DAG Graph / Illustration Placeholder]
              </div>
            </div>
          </div>
        </section>

        {/* Product Overview Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-syntheta-surface">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-syntheta-dark">
                Powerful Features for Your Synthetic Data Needs
              </h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Syntheta provides a comprehensive platform to streamline your synthetic data workflows.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {/* Multi-Modal Pipelines Card */}
              <div className="flex flex-col items-center space-y-2 rounded-2xl border border-syntheta-neutral bg-syntheta-background p-6 text-center shadow-sm">
                {/* Icon Placeholder */}
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-syntheta-primary/20 text-syntheta-primary">
                    🧬
                </div>
                <h3 className="text-xl font-bold text-syntheta-dark">Multi-Modal Pipelines</h3>
                <p className="text-muted-foreground">
                  Seamlessly work with Tabular, Image, Text, and Time-series data within the same platform.
                </p>
              </div>
              {/* Built-in Evaluations Card */}
              <div className="flex flex-col items-center space-y-2 rounded-2xl border border-syntheta-neutral bg-syntheta-background p-6 text-center shadow-sm">
                 {/* Icon Placeholder */}
                 <div className="flex h-12 w-12 items-center justify-center rounded-full bg-syntheta-primary/20 text-syntheta-primary">
                    📊
                </div>
                <h3 className="text-xl font-bold text-syntheta-dark">Built-in Evaluations</h3>
                <p className="text-muted-foreground">
                   Assess generated data with integrated Privacy, Bias, and Realism metrics and visualizations.
                </p>
              </div>
              {/* Workflow Automation Card */}
              <div className="flex flex-col items-center space-y-2 rounded-2xl border border-syntheta-neutral bg-syntheta-background p-6 text-center shadow-sm">
                 {/* Icon Placeholder */}
                 <div className="flex h-12 w-12 items-center justify-center rounded-full bg-syntheta-primary/20 text-syntheta-primary">
                    ⚙️
                </div>
                <h3 className="text-xl font-bold text-syntheta-dark">Workflow Automation</h3>
                <p className="text-muted-foreground">
                  Design reproducible data generation workflows using a visual DAG builder and powerful orchestration.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Live Demo Snapshot */}
        <section className="w-full py-12 md:py-24 lg:py-32">
            <div className="container px-4 md:px-6 text-center">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-syntheta-dark mb-8">See Syntheta in Action</h2>
                {/* Live Demo Image Placeholder */}
                <div className="relative aspect-video overflow-hidden rounded-2xl border border-syntheta-neutral shadow-lg">
                    <div className="flex h-full items-center justify-center bg-syntheta-neutral text-syntheta-dark">
                         [Full-width image of the DAG builder UI Placeholder]
                    </div>
                </div>
                {/* Optional Button */}
                 <Button variant="default" size="lg" className="rounded-2xl bg-syntheta-primary text-primary-foreground hover:bg-syntheta-primary/90 mt-8">
                  Try a Sample Pipeline →
                </Button>
            </div>
        </section>

        {/* How It Works Section */}
         <section className="w-full py-12 md:py-24 lg:py-32 bg-syntheta-surface">
            <div className="container px-4 md:px-6">
                <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
                    <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-syntheta-dark">How it Works</h2>
                    <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                       Get started with Syntheta in three simple steps.
                    </p>
                </div>
                <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                    {/* Step 1 */}
                    <div className="flex flex-col items-center space-y-4 text-center">
                         {/* Icon Placeholder */}
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-syntheta-primary/20 text-syntheta-primary text-2xl font-bold">
                           1
                        </div>
                        <h3 className="text-xl font-bold text-syntheta-dark">Upload Your Data</h3>
                        <p className="text-muted-foreground">
                           Connect your data source or upload files securely.
                        </p>
                    </div>
                     {/* Step 2 */}
                    <div className="flex flex-col items-center space-y-4 text-center">
                         {/* Icon Placeholder */}
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-syntheta-primary/20 text-syntheta-primary text-2xl font-bold">
                           2
                        </div>
                        <h3 className="text-xl font-bold text-syntheta-dark">Design Your Pipeline</h3>
                        <p className="text-muted-foreground">
                           Use our visual DAG builder to design your data generation pipeline.
                        </p>
                    </div>
                     {/* Step 3 */}
                    <div className="flex flex-col items-center space-y-4 text-center">
                         {/* Icon Placeholder */}
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-syntheta-primary/20 text-syntheta-primary text-2xl font-bold">
                           3
                        </div>
                        <h3 className="text-xl font-bold text-syntheta-dark">Deploy and Monitor</h3>
                        <p className="text-muted-foreground">
                           Deploy your pipeline and monitor its performance.
                        </p>
                    </div>
                </div>
            </div>
        </section>
      </main>
    </div>
  );
} 