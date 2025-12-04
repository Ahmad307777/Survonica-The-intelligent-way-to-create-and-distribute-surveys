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
  ArrowRight
} from "lucide-react";

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-primary">
                <Sparkles className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent font-['Space_Grotesk']">
                Survonica
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link to="/signup">
                <Button className="bg-gradient-primary hover:opacity-90 transition-opacity">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 lg:py-32">
        <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/50 border border-accent-foreground/20 mb-4">
            <Sparkles className="w-4 h-4 text-accent-foreground" />
            <span className="text-sm font-medium text-accent-foreground">AI-Powered Survey Creation</span>
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-bold leading-tight font-['Space_Grotesk']">
            The <span className="bg-gradient-primary bg-clip-text text-transparent">Intelligent Way</span> to Create Surveys
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Transform your survey creation process with AI. Generate beautiful, engaging surveys in minutes—not hours.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link to="/signup">
              <Button size="lg" className="bg-gradient-primary hover:opacity-90 transition-opacity text-lg h-14 px-8 shadow-elegant group">
                Start Creating Free
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="text-lg h-14 px-8">
                View Demo
              </Button>
            </Link>
          </div>

          <div className="pt-8 flex items-center justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              <span>Free templates</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl lg:text-4xl font-bold font-['Space_Grotesk']">
            Why Choose Survonica?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Powerful features that make survey creation effortless
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="p-6 hover:shadow-elegant transition-all duration-300 border-2 hover:border-primary/50 bg-card">
            <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center mb-4">
              <MessageSquare className="w-6 h-6 text-primary-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">AI Chatbot Creation</h3>
            <p className="text-muted-foreground">
              Simply describe your survey needs in natural language. Our AI chatbot generates relevant questions instantly.
            </p>
          </Card>

          <Card className="p-6 hover:shadow-elegant transition-all duration-300 border-2 hover:border-primary/50 bg-card">
            <div className="w-12 h-12 rounded-xl bg-gradient-secondary flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Smart Duplicate Detection</h3>
            <p className="text-muted-foreground">
              AI automatically identifies and removes redundant questions, ensuring your surveys are concise and effective.
            </p>
          </Card>

          <Card className="p-6 hover:shadow-elegant transition-all duration-300 border-2 hover:border-primary/50 bg-card">
            <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center mb-4">
              <Layout className="w-6 h-6 text-primary-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Beautiful Templates</h3>
            <p className="text-muted-foreground">
              Pre-built visual templates and layouts make your surveys look professional without manual design work.
            </p>
          </Card>

          <Card className="p-6 hover:shadow-elegant transition-all duration-300 border-2 hover:border-primary/50 bg-card">
            <div className="w-12 h-12 rounded-xl bg-gradient-secondary flex items-center justify-center mb-4">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Real-Time Analytics</h3>
            <p className="text-muted-foreground">
              Track responses in real-time with powerful analytics and visualization tools to gain actionable insights.
            </p>
          </Card>

          <Card className="p-6 hover:shadow-elegant transition-all duration-300 border-2 hover:border-primary/50 bg-card">
            <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-primary-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Structured Flow</h3>
            <p className="text-muted-foreground">
              AI organizes questions in a logical, well-structured flow to improve clarity and respondent engagement.
            </p>
          </Card>

          <Card className="p-6 hover:shadow-elegant transition-all duration-300 border-2 hover:border-primary/50 bg-card">
            <div className="w-12 h-12 rounded-xl bg-gradient-secondary flex items-center justify-center mb-4">
              <Smile className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Flexible Editing</h3>
            <p className="text-muted-foreground">
              Full control to manually edit, customize, and fine-tune every aspect of your survey design.
            </p>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="bg-gradient-hero p-12 text-center text-primary-foreground border-0 shadow-glow">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4 font-['Space_Grotesk']">
            Ready to revolutionize your surveys?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of businesses creating smarter surveys with AI
          </p>
          <Link to="/signup">
            <Button size="lg" className="bg-background text-foreground hover:bg-background/90 text-lg h-14 px-8 shadow-xl">
              Get Started for Free
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-primary">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold bg-gradient-primary bg-clip-text text-transparent font-['Space_Grotesk']">
                Survonica
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 Survonica. The intelligent way to create surveys.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
