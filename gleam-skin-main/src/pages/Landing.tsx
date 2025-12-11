import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import {
  Sparkles,
  Zap,
  Layout,
  BarChart3,
  Shield,
  Smile,
  MessageSquare,
  CheckCircle2,
  ArrowRight,
  Star,
  Users,
  Rocket,
  ChevronRight,
  Globe,
  BarChart,
  PieChart,
  Target
} from "lucide-react";

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-gray-200/50 dark:border-gray-800/50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/survonica-logo.png" alt="Survonica" className="h-24 w-auto object-contain" />
              <div className="hidden md:flex items-center gap-2 ml-4 px-3 py-1 rounded-full bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/30 dark:to-blue-900/30">
                <span className="text-xs font-semibold bg-gradient-to-r from-blue-900 to-cyan-500 bg-clip-text text-transparent">
                  AI-Powered Surveys
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/login">
                <Button variant="ghost" className="text-gray-600 dark:text-gray-300 hover:text-blue-900 dark:hover:text-purple-400">
                  Sign In
                </Button>
              </Link>
              <Link to="/signup">
                <Button className="bg-gradient-to-r from-blue-900 to-cyan-500 hover:from-blue-950 hover:to-cyan-600 text-white shadow-lg shadow-cyan-500/25 hover:shadow-purple-500/40 transition-all duration-300">
                  Get Started Free
                  <ChevronRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 lg:pt-24 lg:pb-32">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-transparent to-blue-50 dark:from-purple-900/10 dark:to-blue-900/10" />
        <div className="absolute top-0 right-0 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />

        <div className="container relative mx-auto px-4">
          <div className="max-w-5xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 border border-purple-200 dark:border-purple-800 mb-4 animate-fade-up">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                ))}
              </div>
              <span className="text-sm font-medium bg-gradient-to-r from-blue-900 to-cyan-500 bg-clip-text text-transparent">
                Trusted by 10,000+ creators worldwide
              </span>
            </div>

            <h1 className="text-5xl lg:text-7xl font-bold leading-tight font-['Inter'] tracking-tight">
              Create Surveys That <span className="relative">
                <span className="relative z-10 bg-gradient-to-r from-blue-900 via-blue-500 to-purple-600 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
                  Actually Get Responses
                </span>
                <div className="absolute -bottom-2 left-0 right-0 h-3 bg-gradient-to-r from-purple-400/20 to-blue-400/20 blur-md" />
              </span>
            </h1>

            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Stop wasting hours on survey creation. Let AI generate beautiful, engaging surveys in minutes that people love to fill out.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              <Link to="/signup">
                <Button size="lg" className="group bg-gradient-to-r from-blue-900 to-cyan-500 hover:from-blue-950 hover:to-cyan-600 text-white text-lg h-14 px-8 shadow-xl shadow-cyan-500/25 hover:shadow-purple-500/40 transition-all duration-300">
                  Start Creating Free
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="text-lg h-14 px-8 border-2 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 dark:hover:from-purple-900/20 dark:hover:to-blue-900/20">
                  <PlayCircle className="w-5 h-5 mr-2" />
                  Watch Demo (2 min)
                </Button>
              </Link>
            </div>

            <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {['bg-purple-500', 'bg-blue-500', 'bg-green-500', 'bg-pink-500'].map((color, i) => (
                    <div key={i} className={`w-8 h-8 rounded-full border-2 border-white dark:border-gray-900 ${color}`} />
                  ))}
                </div>
                <span className="text-gray-600 dark:text-gray-400">
                  <span className="font-semibold text-gray-900 dark:text-white">10,000+</span> active users
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span className="text-gray-600 dark:text-gray-400">No credit card</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span className="text-gray-600 dark:text-gray-400">50+ templates</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span className="text-gray-600 dark:text-gray-400">AI-powered</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Logo Cloud */}
      <div className="py-12 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="container mx-auto px-4">
          <p className="text-center text-gray-500 dark:text-gray-400 mb-8 text-sm font-medium">TRUSTED BY LEADING COMPANIES</p>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-8 opacity-60">
            {['TechCorp', 'StartupX', 'GlobalBiz', 'InnovateCo', 'FutureLabs', 'SmartScale'].map((company, i) => (
              <div key={i} className="flex items-center justify-center text-gray-400 dark:text-gray-600 font-semibold text-lg">
                {company}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20 space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 mb-4">
              <Zap className="w-4 h-4 text-blue-900 dark:text-purple-400" />
              <span className="text-sm font-semibold bg-gradient-to-r from-blue-900 to-cyan-500 bg-clip-text text-transparent">
                POWERFUL FEATURES
              </span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold font-['Inter'] tracking-tight">
              Everything you need for <br />
              <span className="bg-gradient-to-r from-blue-900 to-cyan-500 bg-clip-text text-transparent">
                perfect surveys
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              From AI creation to beautiful analytics - we've got you covered
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="group relative p-8 hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/5 to-cyan-500/5 rounded-full -translate-y-16 translate-x-16" />
                <div className={`w-14 h-14 rounded-2xl ${feature.gradient} flex items-center justify-center mb-6 shadow-lg`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
                <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-900 dark:text-purple-400">Learn more</span>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-900 group-hover:translate-x-1 transition-transform" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-900">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-900 to-cyan-500 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <p className="text-gray-600 dark:text-gray-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <Card className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-purple-700 to-blue-600 p-12 lg:p-16 text-center text-white border-0 shadow-2xl shadow-purple-500/30">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-32 -translate-x-32" />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm mb-6">
                <Rocket className="w-4 h-4" />
                <span className="text-sm font-medium">Limited Time Offer</span>
              </div>

              <h2 className="text-3xl lg:text-5xl font-bold mb-6 font-['Inter']">
                Start Creating Smarter Surveys Today
              </h2>

              <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
                Join 10,000+ creators who save hours every week with Survonica
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/signup">
                  <Button size="lg" className="bg-white text-gray-900 hover:bg-white/90 text-lg h-14 px-8 shadow-xl hover:shadow-2xl transition-all duration-300 group">
                    Get Started Free Forever
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link to="/pricing">
                  <Button size="lg" variant="outline" className="text-white border-white/30 hover:bg-white/10 text-lg h-14 px-8">
                    View Pricing
                  </Button>
                </Link>
              </div>

              <p className="mt-6 text-sm opacity-75">
                No credit card required • Free plan includes 100 responses/month
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex flex-col items-center md:items-start gap-4">
              <div className="flex items-center gap-3">
                <img src="/survonica-logo.png" alt="Survonica" className="h-28 w-auto object-contain" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">AI-Powered Survey Platform</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center md:text-left max-w-md">
                The intelligent way to create, analyze, and optimize surveys with AI.
              </p>
            </div>

            <div className="flex items-center gap-6">
              {footerLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-900 dark:hover:text-purple-400 transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-100 dark:border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500 dark:text-gray-500 text-center md:text-left">
              © 2025 Survonica. All rights reserved. Made with ❤️ for creators everywhere.
            </p>
            <div className="flex items-center gap-4">
              <Globe className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-500 dark:text-gray-500">English</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Data arrays for cleaner component
const features = [
  {
    icon: <MessageSquare className="w-6 h-6 text-white" />,
    gradient: "bg-gradient-to-br from-blue-500 to-blue-600",
    title: "AI Chat Creation",
    description: "Describe your survey in plain English. Our AI generates perfect questions instantly."
  },
  {
    icon: <Zap className="w-6 h-6 text-white" />,
    gradient: "bg-gradient-to-br from-blue-500 to-blue-600",
    title: "Smart Optimization",
    description: "AI removes duplicates and suggests improvements for better response rates."
  },
  {
    icon: <Layout className="w-6 h-6 text-white" />,
    gradient: "bg-gradient-to-br from-blue-500 to-cyan-500",
    title: "Beautiful Templates",
    description: "Professionally designed templates that work on all devices."
  },
  {
    icon: <BarChart3 className="w-6 h-6 text-white" />,
    gradient: "bg-gradient-to-br from-blue-500 to-cyan-500",
    title: "Real-Time Analytics",
    description: "Visual dashboards and insights as responses come in."
  },
  {
    icon: <Shield className="w-6 h-6 text-white" />,
    gradient: "bg-gradient-to-br from-blue-600 to-indigo-600",
    title: "Smart Logic",
    description: "Conditional logic and branching for personalized survey flows."
  },
  {
    icon: <Users className="w-6 h-6 text-white" />,
    gradient: "bg-gradient-to-br from-cyan-500 to-blue-500",
    title: "Team Collaboration",
    description: "Work together with your team in real-time on survey creation."
  }
];

const stats = [
  { value: "10K+", label: "Active Users" },
  { value: "500K+", label: "Surveys Created" },
  { value: "98%", label: "Satisfaction Rate" },
  { value: "2 min", label: "Average Creation Time" }
];

const footerLinks = [
  { label: "Privacy", href: "#" },
  { label: "Terms", href: "#" },
  { label: "Contact", href: "#" },
  { label: "Careers", href: "#" },
  { label: "Blog", href: "#" }
];

// Add PlayCircle icon import
import { PlayCircle } from "lucide-react";

export default Landing;