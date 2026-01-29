import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Cloud,
  Zap,
  DollarSign,
  Shield,
  Cpu,
  Network,
  ChevronRight,
  Star,
  Check,
  ArrowUp,
  Menu,
  X
} from 'lucide-react';
import SampleDiagram from '../components/SampleDiagram';

const LandingPage = () => {
  const navigate = useNavigate();
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Handle scroll to show/hide scroll-to-top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const features = [
    {
      icon: <Zap className="w-8 h-8 text-primary" />,
      title: "Natural Language InfraSpec",
      description: "Transform plain English app descriptions into structured infrastructure specifications."
    },
    {
      icon: <Cloud className="w-8 h-8 text-primary" />,
      title: "Multi-Cloud Mapping",
      description: "Map your architecture across AWS, Azure, and Google Cloud Platform."
    },
    {
      icon: <Cpu className="w-8 h-8 text-primary" />,
      title: "Two Architecture Variants",
      description: "Generate both cost-effective and performance-optimized variants."
    },
    {
      icon: <DollarSign className="w-8 h-8 text-primary" />,
      title: "Integrated Cost Estimation",
      description: "Get accurate cost projections powered by Infracost integration."
    },
    {
      icon: <Network className="w-8 h-8 text-primary" />,
      title: "Auto-Generated Diagrams",
      description: "Visualize your architecture with beautiful, interactive diagrams."
    },
    {
      icon: <Shield className="w-8 h-8 text-primary" />,
      title: "Production-Ready Terraform",
      description: "Export complete, validated Terraform code for immediate deployment."
    }
  ];

  const pricingPlans = [
    {
      name: "Free Tier",
      price: "\u20B90",
      period: "/month",
      description: "Perfect for hobbyists and prototypes",
      features: [
        "Up to 3 Projects",
        "Basic AI Models",
        "Standard Speed",
        "Community Support",
        "Limited Exports"
      ],
      cta: "Get Started Free",
      popular: false
    },
    {
      name: "Pro Plan",
      price: "\u20B92900",
      period: "/month",
      description: "For professional cloud architects",
      features: [
        "Unlimited Projects",
        "Advanced AI Models (Claude 3.5 Sonnet)",
        "Priority Processing",
        "Unlimited Exports",
        "Email Support",
        "Advanced Security"
      ],
      cta: "Upgrade to Pro",
      popular: true,
      highlight: "Most Popular"
    }
  ];

  const comparisonPoints = [
    "Deterministic InfraSpec generation",
    "Built-in error correction and validation",
    "Security best practices baked in",
    "Multi-provider cost comparison",
    "No cloud credentials needed"
  ];

  return (
    <div className="min-h-screen bg-background text-text-primary">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="flex items-center">
                  <a href={'/'}><img
                    src="/cloudiverse.png"
                    alt="Cloudiverse Architect"
                    className="h-12 w-auto"
                  /></a>
                </div>
              </div>
            </div>
            <nav className="hidden md:block">
              <div className="ml-10 flex items-center space-x-8">
                <a href="#features" className="text-text-secondary hover:text-text-primary transition-colors">Features</a>
                <a href="#pricing" className="text-text-secondary hover:text-text-primary transition-colors">Pricing</a>
                <a href="/docs" className="text-text-secondary hover:text-text-primary transition-colors">Docs</a>
                <a href="/about" className="text-text-secondary hover:text-text-primary transition-colors">About</a>
              </div>
            </nav>
            <div className="flex items-center space-x-4">
              {localStorage.getItem('token') ? (
                <button
                  onClick={() => navigate('/workspaces')}
                  className="hidden md:block bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-lg transition-colors font-medium"
                >
                  Dashboard
                </button>
              ) : (
                <div className="hidden md:flex items-center space-x-4">
                  <button
                    onClick={() => navigate('/login')}
                    className="text-text-secondary hover:text-text-primary transition-colors"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => navigate('/register')}
                    className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Sign Up
                  </button>
                </div>
              )}
              {/* Mobile Menu Button */}
              <button
                className="md:hidden p-2 text-text-secondary hover:text-text-primary"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-surface border-b border-border p-4 animate-fade-in shadow-xl z-50">
            <div className="flex flex-col space-y-4">
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="text-text-secondary hover:text-text-primary py-2">Features</a>
              <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="text-text-secondary hover:text-text-primary py-2">Pricing</a>
              <a href="/docs" onClick={() => setMobileMenuOpen(false)} className="text-text-secondary hover:text-text-primary py-2">Docs</a>
              <a href="/about" onClick={() => setMobileMenuOpen(false)} className="text-text-secondary hover:text-text-primary py-2">About</a>
              <hr className="border-border my-2" />
              {localStorage.getItem('token') ? (
                <button
                  onClick={() => navigate('/workspaces')}
                  className="bg-primary hover:bg-primary/90 text-white w-full py-3 rounded-lg font-medium"
                >
                  Dashboard
                </button>
              ) : (
                <div className="flex flex-col space-y-3">
                  <button
                    onClick={() => navigate('/login')}
                    className="btn btn-secondary w-full"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => navigate('/register')}
                    className="btn btn-primary w-full"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-surface to-background z-0">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-primary/10 to-transparent"></div>
          <div className="absolute bottom-0 left-0 w-1/3 h-full bg-gradient-to-r from-secondary/10 to-transparent"></div>

          {/* Animated Background Blobs */}
          <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-blob -z-10 mix-blend-multiply"></div>
          <div className="absolute top-40 right-20 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-blob animation-delay-2000 -z-10 mix-blend-multiply"></div>
          <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-pink-500/20 rounded-full blur-3xl animate-blob animation-delay-4000 -z-10 mix-blend-multiply"></div>


        </div>

        {/* Adjusted padding to move content up */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
              Design, compare, and generate <span className="text-primary">multi-cloud architecture</span> from plain language
            </h1>
            <p className="text-xl text-text-secondary mb-10 max-w-2xl mx-auto animate-slide-up animation-delay-2000">
              Turn your app ideas into production-ready cloud infrastructure across AWS, Azure, and GCP with AI-powered automation
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 animate-slide-up animation-delay-4000">
              <button
                onClick={() => navigate('/register')}
                className="bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-lg text-lg font-medium transition-colors flex items-center justify-center animate-shimmer shadow-lg shadow-primary/25"
              >
                Start Free
                <ChevronRight className="ml-2 h-5 w-5" />
              </button>
              <button className="bg-surface hover:bg-surface/80 border border-border text-text-primary px-8 py-4 rounded-lg text-lg font-medium transition-colors hover:border-primary/50">
                Live Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-surface/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful Features for Modern Cloud Engineering</h2>
            <p className="text-text-secondary max-w-2xl mx-auto">
              Everything you need to design, optimize, and deploy cloud infrastructure at scale
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-surface border border-border rounded-xl p-6 hover:border-primary/30 transition-colors">
                <div className="mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-text-secondary">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Cloudiverse is Different</h2>
              <p className="text-text-secondary max-w-2xl mx-auto">
                Built for professionals who demand precision, security, and multi-cloud flexibility
              </p>
            </div>
            <div className="bg-surface border border-border rounded-2xl p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-2xl font-bold mb-6">Traditional Approaches</h3>
                  <ul className="space-y-4">
                    <li className="flex items-start">
                      <div className="flex-shrink-0 mt-1 mr-3 text-text-subtle">
                        <Star className="h-5 w-5" />
                      </div>
                      <span className="text-text-secondary">Manual infrastructure design</span>
                    </li>
                    <li className="flex items-start">
                      <div className="flex-shrink-0 mt-1 mr-3 text-text-subtle">
                        <Star className="h-5 w-5" />
                      </div>
                      <span className="text-text-secondary">Single-cloud focus</span>
                    </li>
                    <li className="flex items-start">
                      <div className="flex-shrink-0 mt-1 mr-3 text-text-subtle">
                        <Star className="h-5 w-5" />
                      </div>
                      <span className="text-text-secondary">Error-prone manual coding</span>
                    </li>
                    <li className="flex items-start">
                      <div className="flex-shrink-0 mt-1 mr-3 text-text-subtle">
                        <Star className="h-5 w-5" />
                      </div>
                      <span className="text-text-secondary">Limited cost visibility</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-6 text-primary">Cloudiverse Architect</h3>
                  <ul className="space-y-4">
                    {comparisonPoints.map((point, index) => (
                      <li key={index} className="flex items-start">
                        <div className="flex-shrink-0 mt-1 mr-3 text-primary">
                          <Check className="h-5 w-5" />
                        </div>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Architecture Preview */}
      <section className="py-20 bg-surface/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Architecture Preview</h2>
            <p className="text-text-secondary max-w-2xl mx-auto">
              Interactive diagrams with automatic layout. Pan, zoom, and export production-ready architecture.
            </p>
          </div>
          <div className="max-w-5xl mx-auto">
            <SampleDiagram />
            <div className="mt-6 text-center">
              <p className="text-sm text-text-secondary italic">
                Sample Serverless Web App architecture • All diagrams generated from canonical services • Export as PNG
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-text-secondary max-w-2xl mx-auto">
              Currently free during beta. Pricing plans coming soon.
            </p>
          </div>
          <div className="flex flex-col md:flex-row gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <div
                key={index}
                className="flex-1 w-full bg-surface border border-border rounded-2xl p-8 relative ring-2 ring-primary flex flex-col"
              >
                {plan.highlight && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-primary to-secondary text-white text-sm font-medium px-4 py-1 rounded-full">
                    {plan.highlight}
                  </div>
                )}
                <div className="mb-6 text-center">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <div className="flex items-baseline justify-center mb-2">
                    <span className="text-5xl font-bold">{plan.price}</span>
                    <span className="text-text-secondary ml-1">{plan.period}</span>
                  </div>
                  <p className="text-text-secondary">{plan.description}</p>
                </div>
                <ul className="mb-8 space-y-3 flex-1">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <Check className="h-5 w-5 text-primary mr-2" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => navigate('/register')}
                  className="w-full py-3 rounded-lg font-medium bg-primary hover:bg-primary/90 text-white transition-colors mt-auto"
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-secondary">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to transform your cloud infrastructure workflow?
            </h2>
            <p className="text-white/90 text-xl mb-10">
              Join thousands of developers designing better cloud architectures with AI
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button
                onClick={() => navigate('/register')}
                className="bg-white hover:bg-gray-100 text-background px-8 py-4 rounded-lg text-lg font-medium transition-colors flex items-center justify-center"
              >
                Get Started Free
                <ChevronRight className="ml-2 h-5 w-5" />
              </button>
              <button className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-8 py-4 rounded-lg text-lg font-medium transition-colors">
                Schedule a Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-surface border-t border-border pt-16 pb-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
            <div className="lg:col-span-2">
              <div className="flex items-center">
                <a href={'/'}><img
                  src="/cloudiverse.png"
                  alt="Cloudiverse Architect"
                  className="h-12 w-auto"
                /></a>
              </div>
              <p className="text-text-secondary mb-4 max-w-md">
                Design, compare, and generate multi-cloud architecture from plain language.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Product</h4>
              <ul className="space-y-2">
                <li><a href="#features" className="text-text-secondary hover:text-text-primary transition-colors">Features</a></li>
                <li><a href="#pricing" className="text-text-secondary hover:text-text-primary transition-colors">Pricing</a></li>
                <li><a href="/docs" className="text-text-secondary hover:text-text-primary transition-colors">Documentation</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="/about" className="text-text-secondary hover:text-text-primary transition-colors">About Us</a></li>
                <li><a href="/contact" className="text-text-secondary hover:text-text-primary transition-colors">Contact</a></li>
                <li><a href="/service-policy" className="text-text-secondary hover:text-text-primary transition-colors">Shipping Policy</a></li>
                <li><a href="/cancel-refunds" className="text-text-secondary hover:text-text-primary transition-colors">Cancellations & Refunds</a></li>
                <li><a href="/feedback" className="text-text-secondary hover:text-text-primary transition-colors">Feedback</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><a href="/terms" className="text-text-secondary hover:text-text-primary transition-colors">Terms of Service</a></li>
                <li><a href="/privacy" className="text-text-secondary hover:text-text-primary transition-colors">Privacy Policy</a></li>
                <li><a href="/security" className="text-text-secondary hover:text-text-primary transition-colors">Security</a></li>
                <li><a href="/compliance" className="text-text-secondary hover:text-text-primary transition-colors">Compliance</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-border text-center text-text-secondary">
            <p>&copy; {new Date().getFullYear()} Cloudiverse Architect. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 bg-primary hover:bg-primary/90 text-white p-4 rounded-full shadow-2xl transition-all transform hover:scale-110 active:scale-95 group"
          aria-label="Scroll to top"
        >
          <ArrowUp className="h-6 w-6 group-hover:animate-bounce" />
        </button>
      )}
    </div>
  );
};

export default LandingPage;