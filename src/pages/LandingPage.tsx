import { Link } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Zap,
  ArrowRight,
  Users,
  Shield,
  TrendingUp,
  Code2,
  Palette,
  PenTool,
  BarChart3,
  Sparkles,
  CheckCircle2,
  Star,
  Quote,
} from "lucide-react";
import { useEffect, useRef } from "react";

// Animated counter hook
function useAnimatedCounter(end: number, duration: number = 2000) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const start = Date.now();
          const animate = () => {
            const elapsed = Date.now() - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.round(end * eased));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration]);

  return { count, ref };
}

import { useState } from "react";

function StatCounter({ end, label, suffix = "" }: { end: number; label: string; suffix?: string }) {
  const { count, ref } = useAnimatedCounter(end);
  return (
    <div ref={ref} className="text-center">
      <div className="text-4xl md:text-5xl font-bold text-gradient mb-2">
        {count.toLocaleString()}{suffix}
      </div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
}

const skillCategories = [
  { icon: Code2, label: "Development", skills: "Frontend, Backend, Full Stack, Mobile, DevOps", color: "text-blue-400" },
  { icon: Palette, label: "Design", skills: "UI Design, UX Design, Graphic, Motion, Video", color: "text-purple-400" },
  { icon: PenTool, label: "Content", skills: "Copywriting, Content Writing, Technical Writing", color: "text-emerald-400" },
  { icon: BarChart3, label: "Marketing", skills: "SEO, Growth, Social Media, Email Marketing", color: "text-amber-400" },
  { icon: Sparkles, label: "No-Code & AI", skills: "No-Code, AI Automation, Prompt Engineering", color: "text-rose-400" },
];

const howItWorks = [
  { step: "01", title: "Create Your Profile", desc: "Sign up, verify your identity, and showcase the skills you offer and the skills you want to learn." },
  { step: "02", title: "Discover Collaborators", desc: "Swipe through curated matches based on skill compatibility, reputation, and project interests." },
  { step: "03", title: "Start a Sync Contract", desc: "Define deliverables, set milestones, and lock credits in escrow for secure collaboration." },
  { step: "04", title: "Build & Earn Credits", desc: "Complete projects, earn credits, build your verified contribution record and reputation." },
];

const testimonials = [
  { name: "Alex Chen", role: "CS Student", text: "I traded frontend development for UX design help. My portfolio looks professional now, and I didn't spend a dime.", avatar: "AC" },
  { name: "Maya Patel", role: "Bootcamp Grad", text: "SkillSwap Sync helped me build real projects with real collaborators. I landed my first developer job because of it.", avatar: "MP" },
  { name: "Jordan Lee", role: "Freelance Designer", text: "The credit system is fair and the reputation system keeps everyone accountable. Best collaboration platform for beginners.", avatar: "JL" },
];

const features = [
  { icon: Users, title: "Smart Matching", desc: "AI-powered compatibility scoring based on skills, experience, and project goals." },
  { icon: Shield, title: "Trust System", desc: "Multi-layer verification including identity, portfolio, peer reviews, and reputation scoring." },
  { icon: TrendingUp, title: "Credit Economy", desc: "Fair skill-exchange credits with quality multipliers and escrow protection." },
  { icon: Star, title: "Verified Records", desc: "Every completed collaboration becomes a portable proof-of-work entry on your profile." },
];

export default function LandingPage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen gradient-hero">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/20 bg-background/60 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-accent flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-gradient">SkillSwap Sync</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/leaderboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:block">
              Leaderboard
            </Link>
            {isAuthenticated ? (
              <Link to="/dashboard">
                <Button size="sm" className="gradient-accent text-white">
                  Dashboard
                </Button>
              </Link>
            ) : (
              <Link to="/login">
                <Button size="sm" className="gradient-accent text-white">
                  Get Started
                </Button>
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-44 md:pb-32 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-[120px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-slide-up">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs font-medium text-primary mb-6">
                <Sparkles className="w-3.5 h-3.5" />
                <span>The Career-Building Exchange Network</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight mb-6">
                Trade Skills.{" "}
                <span className="text-gradient">Build Careers.</span>{" "}
                <span className="text-foreground/80">No Money Required.</span>
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-lg">
                A structured career-building exchange where students, bootcamp graduates, and early-career freelancers collaborate by exchanging verified digital skills instead of money.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to={isAuthenticated ? "/discover" : "/login"}>
                  <Button size="lg" className="gradient-accent text-white gap-2 px-6">
                    Start Swapping
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <a href="#how-it-works">
                  <Button size="lg" variant="outline" className="gap-2">
                    How It Works
                  </Button>
                </a>
              </div>

              {/* Social Proof */}
              <div className="flex items-center gap-4 mt-10">
                <div className="flex -space-x-3">
                  {["bg-blue-500", "bg-purple-500", "bg-emerald-500", "bg-amber-500", "bg-rose-500"].map((color, i) => (
                    <div key={i} className={`w-10 h-10 rounded-full ${color} border-2 border-background flex items-center justify-center text-xs font-bold text-white`}>
                      {["JD", "AL", "SK", "MR", "TP"][i]}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">From 500+ early users</p>
                </div>
              </div>
            </div>

            <div className="relative hidden lg:block">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-border/30 animate-float">
                <img
                  src="/hero.jpg"
                  alt="SkillSwap Sync Platform"
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
              </div>
              {/* Floating badges */}
              <div className="absolute -top-4 -right-4 glass rounded-xl p-3 animate-float" style={{ animationDelay: "0.5s" }}>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span className="text-sm font-medium">Verified Skills</span>
                </div>
              </div>
              <div className="absolute -bottom-4 -left-4 glass rounded-xl p-3 animate-float" style={{ animationDelay: "1s" }}>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                  <span className="text-sm font-medium">+127 Credits Earned</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y border-border/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatCounter end={2500} label="Active Swappers" />
            <StatCounter end={18000} label="Skills Exchanged" />
            <StatCounter end={4200} label="Projects Completed" suffix="+" />
            <StatCounter end={98} label="Satisfaction Rate" suffix="%" />
          </div>
        </div>
      </section>

      {/* Supported Skills */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="text-gradient">15 Digital Skills</span>{" "}
              <span className="text-foreground/80">You Can Exchange</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              From development to design, content creation to AI automation — trade expertise in any of these high-demand digital categories.
            </p>
          </div>
          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4">
            {skillCategories.map((cat) => {
              const Icon = cat.icon;
              return (
                <div
                  key={cat.label}
                  className="group p-5 rounded-xl glass hover:glass-dark transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                >
                  <Icon className={`w-8 h-8 ${cat.color} mb-3 group-hover:scale-110 transition-transform`} />
                  <h3 className="font-semibold text-sm mb-1">{cat.label}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{cat.skills}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 border-y border-border/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Built for <span className="text-gradient">Trust</span> & <span className="text-gradient">Growth</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Every feature is designed to create meaningful collaborations and verifiable career growth.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="p-6 rounded-xl glass hover:glass-dark transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="w-12 h-12 rounded-lg gradient-accent flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How <span className="text-gradient">SkillSwap</span> Works
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A simple four-step process to start collaborating and building your career.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {howItWorks.map((item, index) => (
              <div key={item.step} className="relative group">
                <div className="p-6 rounded-xl glass hover:glass-dark transition-all duration-300 h-full">
                  <span className="text-5xl font-black text-gradient/20 group-hover:text-gradient/40 transition-colors">
                    {item.step}
                  </span>
                  <h3 className="font-semibold text-lg mt-4 mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
                {index < howItWorks.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                    <ArrowRight className="w-6 h-6 text-muted-foreground/30" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Verified Contribution Record Showcase */}
      <section className="py-20 border-y border-border/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Your <span className="text-gradient">Verified</span>{" "}
                Contribution Record
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Every completed collaboration automatically generates a public project page — your portable proof-of-work. Show recruiters real projects, real reviews, and real impact.
              </p>
              <ul className="space-y-3">
                {[
                  "Project screenshots and live URLs",
                  "GitHub repositories and Figma links",
                  "Peer reviews and ratings",
                  "Tech stack and hours contributed",
                  "Milestone completion tracking",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Link to={isAuthenticated ? "/profile" : "/login"} className="inline-block mt-8">
                <Button className="gradient-accent text-white gap-2">
                  Build Your Record
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
            <div className="relative">
              <div className="rounded-2xl overflow-hidden shadow-2xl border border-border/30">
                <img
                  src="/profile-showcase.jpg"
                  alt="Verified Contribution Record"
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Trusted by <span className="text-gradient">Early Builders</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Hear from students, bootcamp grads, and freelancers who are already swapping skills.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="p-6 rounded-xl glass hover:glass-dark transition-all">
                <Quote className="w-8 h-8 text-primary/30 mb-4" />
                <p className="text-sm leading-relaxed mb-6">{t.text}</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full gradient-accent flex items-center justify-center text-sm font-bold text-white">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="p-10 md:p-14 rounded-2xl glass glow-accent">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to <span className="text-gradient">Start Building</span>?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Join thousands of students, bootcamp grads, and early-career professionals who are trading skills and building real portfolios.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to={isAuthenticated ? "/discover" : "/login"}>
                <Button size="lg" className="gradient-accent text-white gap-2 px-8">
                  <Zap className="w-4 h-4" />
                  Join SkillSwap Sync
                </Button>
              </Link>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              Start with 50 free credits. No credit card required.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/10 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg gradient-accent flex items-center justify-center">
                <Zap className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-sm font-bold text-gradient">SkillSwap Sync</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Built for students, bootcamp grads, and early-career professionals.
            </p>
            <p className="text-xs text-muted-foreground">
              &copy; 2026 SkillSwap Sync. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
