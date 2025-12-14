import React from 'react';
import { BookOpen, Search, Menu, ChevronRight, Star, Download, Code, Users, Zap } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Docs = () => {
  const navigate = useNavigate();
  const docsSections = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: <Zap className="w-5 h-5" />,
      articles: [
        { title: 'Quick Start Guide', url: '#' },
        { title: 'Creating Your First Workspace', url: '#' },
        { title: 'Understanding InfraSpec', url: '#' }
      ]
    },
    {
      id: 'core-concepts',
      title: 'Core Concepts',
      icon: <BookOpen className="w-5 h-5" />,
      articles: [
        { title: 'Architecture Design Process', url: '#' },
        { title: 'Multi-Cloud Strategy', url: '#' },
        { title: 'Cost Optimization', url: '#' }
      ]
    },
    {
      id: 'tutorials',
      title: 'Tutorials',
      icon: <Code className="w-5 h-5" />,
      articles: [
        { title: 'E-commerce Platform', url: '#' },
        { title: 'Data Analytics Pipeline', url: '#' },
        { title: 'Machine Learning Infrastructure', url: '#' }
      ]
    },
    {
      id: 'integrations',
      title: 'Integrations',
      icon: <Users className="w-5 h-5" />,
      articles: [
        { title: 'Terraform Integration', url: '#' },
        { title: 'CI/CD Pipelines', url: '#' },
        { title: 'Monitoring & Alerting', url: '#' }
      ]
    },
    {
      id: 'api-reference',
      title: 'API Reference',
      icon: <Code className="w-5 h-5" />,
      articles: [
        { title: 'Authentication', url: '#' },
        { title: 'Workspace Management', url: '#' },
        { title: 'Architecture Generation', url: '#' }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="flex items-center">
                  <img
                    src="./assets/images/cloudiverse.png"
                    alt="Cloudiverse"
                    className="h-8 w-auto"
                  />
                </div>
              </div>
            </div>
            <nav className="hidden md:block">
              <div className="ml-10 flex items-center space-x-8">
                <Link to="/" className="text-text-secondary hover:text-text-primary transition-colors">Home</Link>
                <a href="#features" className="text-text-secondary hover:text-text-primary transition-colors">Features</a>
                <a href="#pricing" className="text-text-secondary hover:text-text-primary transition-colors">Pricing</a>
                <Link to="/docs" className="text-text-primary font-medium transition-colors">Docs</Link>
                <Link to="/blog" className="text-text-secondary hover:text-text-primary transition-colors">Blog</Link>
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

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row">
          {/* Sidebar */}
          <div className="lg:w-64 flex-shrink-0 border-r border-border pr-6">
            <div className="sticky top-24">
              <h2 className="text-lg font-semibold text-text-primary mb-4">Documentation</h2>
              <nav className="space-y-1">
                {docsSections.map((section) => (
                  <div key={section.id} className="mb-4">
                    <div className="flex items-center text-sm font-medium text-text-primary mb-2">
                      {section.icon}
                      <span className="ml-2">{section.title}</span>
                    </div>
                    <ul className="space-y-1 ml-2">
                      {section.articles.map((article, index) => (
                        <li key={index}>
                          <a 
                            href={article.url} 
                            className="flex items-center text-sm text-text-secondary hover:text-text-primary py-1 transition-colors"
                          >
                            <ChevronRight className="w-4 h-4 mr-1" />
                            {article.title}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 lg:pl-8">
            <div className="max-w-3xl">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-text-primary mb-4">Documentation</h1>
                <p className="text-text-secondary">
                  Learn how to use Cloudiverse Architect to design, compare, and deploy multi-cloud architectures.
                </p>
              </div>

              <div className="bg-surface border border-border rounded-xl p-6 mb-8">
                <div className="flex items-center mb-4">
                  <Search className="text-text-subtle mr-3" />
                  <input
                    type="text"
                    placeholder="Search documentation..."
                    className="w-full bg-background border border-border rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="space-y-8">
                {docsSections.map((section) => (
                  <div key={section.id} className="border-b border-border pb-8">
                    <h2 className="text-xl font-semibold text-text-primary mb-4 flex items-center">
                      {section.icon}
                      <span className="ml-2">{section.title}</span>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {section.articles.map((article, index) => (
                        <a 
                          key={index}
                          href={article.url}
                          className="block bg-surface border border-border rounded-lg p-4 hover:border-primary/30 transition-colors"
                        >
                          <h3 className="font-medium text-text-primary mb-1">{article.title}</h3>
                          <p className="text-sm text-text-secondary">
                            Learn how to {article.title.toLowerCase()}
                          </p>
                        </a>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-surface border-t border-border pt-16 pb-8 mt-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
            <div className="lg:col-span-2">
              <div className="flex items-center mb-4">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
                  <Star className="h-5 w-5 text-white" />
                </div>
                <span className="ml-2 text-xl font-bold">Cloudiverse Architect</span>
              </div>
              <p className="text-text-secondary mb-4 max-w-md">
                Design, compare, and generate multi-cloud architecture from plain language.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-text-secondary hover:text-text-primary">
                  <Download className="h-5 w-5" />
                </a>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Product</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-text-secondary hover:text-text-primary transition-colors">Features</a></li>
                <li><a href="#" className="text-text-secondary hover:text-text-primary transition-colors">Pricing</a></li>
                <li><a href="/docs" className="text-text-secondary hover:text-text-primary transition-colors">Documentation</a></li>
                <li><a href="#" className="text-text-secondary hover:text-text-primary transition-colors">Releases</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-text-secondary hover:text-text-primary transition-colors">About</a></li>
                <li><a href="/blog" className="text-text-secondary hover:text-text-primary transition-colors">Blog</a></li>
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

export default Docs;