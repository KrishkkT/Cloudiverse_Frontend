import React from 'react';
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
  Check
} from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

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
      price: "$0",
      period: "/month",
      description: "Perfect for individuals and small projects",
      features: [
        "Up to 5 projects",
        "Multi-cloud variants",
        "Static cost estimation",
        "Design only (no cloud credentials needed)",
        "Terraform generation",
        "Community support"
      ],
      cta: "Get Started",
      popular: false
    },
    {
      name: "Pro Tier",
      price: "Coming",
      period: " Soon",
      description: "For teams and enterprises",
      features: [
        "Unlimited projects",
        "Version control",
        "Team collaboration",
        "Advanced FinOps",
        "Priority support",
        "GitHub deploy",
        "Custom integrations"
      ],
      cta: "Join Waitlist",
      popular: true
    }
  ];

  const comparisonPoints = [
    "Deterministic InfraSpec generation",
    "Built-in error correction and validation",
    "Security best practices baked in",
    "Multi-provider cost comparison",
    "Two architecture variants per cloud",
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
                      src="/assets/images/cloudiverse.png"
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
                <a href="#docs" className="text-text-secondary hover:text-text-primary transition-colors">Docs</a>
                <a href="#blog" className="text-text-secondary hover:text-text-primary transition-colors">Blog</a>
              </div>
            </nav>
            <div className="flex items-center space-x-4">
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
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-surface to-background z-0">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-primary/10 to-transparent"></div>
          <div className="absolute bottom-0 left-0 w-1/3 h-full bg-gradient-to-r from-secondary/10 to-transparent"></div>
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Design, compare, and generate <span className="text-primary">multi-cloud architecture</span> from plain language
            </h1>
            <p className="text-xl text-text-secondary mb-10 max-w-2xl mx-auto">
              Turn your app ideas into production-ready cloud infrastructure across AWS, Azure, and GCP with AI-powered automation
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button 
                onClick={() => navigate('/register')}
                className="bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-lg text-lg font-medium transition-colors flex items-center justify-center"
              >
                Start Free
                <ChevronRight className="ml-2 h-5 w-5" />
              </button>
              <button className="bg-surface hover:bg-surface/80 border border-border text-text-primary px-8 py-4 rounded-lg text-lg font-medium transition-colors">
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
              Visualize your cloud infrastructure with our interactive diagram builder
            </p>
          </div>
          <div className="bg-code-block rounded-2xl p-8 border border-border">
            <div className="aspect-video bg-background rounded-lg flex items-center justify-center border border-border">
              <div className="text-center">
                <Network className="h-16 w-16 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Interactive Architecture Diagram</h3>
                <p className="text-text-secondary">High-fidelity cloud diagram UI mockup</p>
              </div>
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
              Start for free and upgrade as you grow
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <div 
                key={index} 
                className={`bg-surface border border-border rounded-2xl p-8 relative ${
                  plan.popular ? 'ring-2 ring-primary' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-primary text-white text-sm font-medium px-4 py-1 rounded-full">
                    Most Popular
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <div className="flex items-baseline mb-2">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-text-secondary ml-1">{plan.period}</span>
                  </div>
                  <p className="text-text-secondary">{plan.description}</p>
                </div>
                <ul className="mb-8 space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <Check className="h-5 w-5 text-primary mr-2" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <button 
                  className={`w-full py-3 rounded-lg font-medium transition-colors ${
                    plan.popular 
                      ? 'bg-primary hover:bg-primary/90 text-white' 
                      : 'bg-surface hover:bg-surface/80 border border-border text-text-primary'
                  }`}
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
              <div className="flex items-center mb-4">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
                  <Cloud className="h-5 w-5 text-white" />
                </div>
                <span className="ml-2 text-xl font-bold">Cloudiverse Architect</span>
              </div>
              <p className="text-text-secondary mb-4 max-w-md">
                Design, compare, and generate multi-cloud architecture from plain language.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Product</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-text-secondary hover:text-text-primary transition-colors">Features</a></li>
                <li><a href="#" className="text-text-secondary hover:text-text-primary transition-colors">Pricing</a></li>
                <li><a href="#" className="text-text-secondary hover:text-text-primary transition-colors">Documentation</a></li>
                <li><a href="#" className="text-text-secondary hover:text-text-primary transition-colors">Releases</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-text-secondary hover:text-text-primary transition-colors">About</a></li>
                <li><a href="#" className="text-text-secondary hover:text-text-primary transition-colors">Blog</a></li>
                <li><a href="#" className="text-text-secondary hover:text-text-primary transition-colors">Careers</a></li>
                <li><a href="#" className="text-text-secondary hover:text-text-primary transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-text-secondary hover:text-text-primary transition-colors">Terms</a></li>
                <li><a href="#" className="text-text-secondary hover:text-text-primary transition-colors">Privacy</a></li>
                <li><a href="#" className="text-text-secondary hover:text-text-primary transition-colors">Security</a></li>
                <li><a href="#" className="text-text-secondary hover:text-text-primary transition-colors">Compliance</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-border text-center text-text-secondary">
            <p>&copy; {new Date().getFullYear()} Cloudiverse Architect. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;