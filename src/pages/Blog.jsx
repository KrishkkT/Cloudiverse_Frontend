import React from 'react';
import { Calendar, User, Tag, ArrowRight, Search, Menu, Star, Download } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Blog = () => {
  const navigate = useNavigate();
  const blogPosts = [
    {
      id: 1,
      title: 'The Future of Multi-Cloud Architecture Design',
      excerpt: 'How AI is transforming the way we design and deploy cloud infrastructure across multiple providers.',
      author: 'Alex Johnson',
      date: 'Dec 12, 2025',
      readTime: '5 min read',
      tags: ['AI', 'Multi-Cloud', 'Architecture'],
      image: 'https://images.unsplash.com/photo-1677442135722-5f11e06a4e6d?w=800&auto=format&fit=crop'
    },
    {
      id: 2,
      title: 'Cost Optimization Strategies for Cloud-Native Applications',
      excerpt: 'Practical techniques to reduce cloud spending without compromising performance or reliability.',
      author: 'Sarah Chen',
      date: 'Dec 5, 2025',
      readTime: '8 min read',
      tags: ['Cost Optimization', 'FinOps', 'Cloud Native'],
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop'
    },
    {
      id: 3,
      title: 'Building Resilient Systems with Multi-Provider Strategies',
      excerpt: 'Learn how to design fault-tolerant architectures that span across AWS, Azure, and GCP.',
      author: 'Michael Rodriguez',
      date: 'Nov 28, 2025',
      readTime: '6 min read',
      tags: ['Resilience', 'Disaster Recovery', 'Best Practices'],
      image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop'
    },
    {
      id: 4,
      title: 'Terraform Best Practices for Large-Scale Deployments',
      excerpt: 'Essential patterns and anti-patterns for managing complex infrastructure with Terraform.',
      author: 'Emma Wilson',
      date: 'Nov 20, 2025',
      readTime: '10 min read',
      tags: ['Terraform', 'IaC', 'DevOps'],
      image: 'https://images.unsplash.com/photo-1639322537228-f710d846310a?w=800&auto=format&fit=crop'
    },
    {
      id: 5,
      title: 'Security Considerations in Multi-Cloud Environments',
      excerpt: 'Addressing compliance, data protection, and threat mitigation across cloud providers.',
      author: 'David Kim',
      date: 'Nov 15, 2025',
      readTime: '7 min read',
      tags: ['Security', 'Compliance', 'Best Practices'],
      image: 'https://images.unsplash.com/photo-1563017840-9d6875ec1fff?w=800&auto=format&fit=crop'
    },
    {
      id: 6,
      title: 'Case Study: Scaling a SaaS Platform Across Three Clouds',
      excerpt: 'How one company achieved 99.99% uptime by leveraging multi-cloud architecture.',
      author: 'Jennifer Park',
      date: 'Nov 8, 2025',
      readTime: '12 min read',
      tags: ['Case Study', 'SaaS', 'Scaling'],
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&auto=format&fit=crop'
    }
  ];

  const popularTags = ['AI', 'Multi-Cloud', 'Cost Optimization', 'Security', 'Terraform', 'DevOps', 'FinOps', 'Best Practices'];

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
                    src="/assets/images/cloudiverse.png"
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
                <Link to="/docs" className="text-text-secondary hover:text-text-primary transition-colors">Docs</Link>
                <Link to="/blog" className="text-text-primary font-medium transition-colors">Blog</Link>
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
          {/* Main Content */}
          <div className="flex-1 lg:pr-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-text-primary mb-4">Blog</h1>
              <p className="text-text-secondary">
                Insights, tutorials, and best practices for cloud architecture and multi-cloud strategies.
              </p>
            </div>

            <div className="bg-surface border border-border rounded-xl p-6 mb-8">
              <div className="flex items-center">
                <Search className="text-text-subtle mr-3" />
                <input
                  type="text"
                  placeholder="Search articles..."
                  className="w-full bg-background border border-border rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {blogPosts.map((post) => (
                <article key={post.id} className="bg-surface border border-border rounded-xl overflow-hidden hover:border-primary/30 transition-colors">
                  <img 
                    src={post.image} 
                    alt={post.title} 
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-6">
                    <div className="flex flex-wrap gap-2 mb-3">
                      {post.tags.map((tag, index) => (
                        <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                          <Tag className="w-3 h-3 mr-1" />
                          {tag}
                        </span>
                      ))}
                    </div>
                    <h2 className="text-xl font-bold text-text-primary mb-2">{post.title}</h2>
                    <p className="text-text-secondary mb-4">{post.excerpt}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <User className="text-text-subtle mr-2" size={16} />
                        <span className="text-sm text-text-secondary">{post.author}</span>
                      </div>
                      <div className="flex items-center text-sm text-text-secondary">
                        <Calendar className="text-text-subtle mr-1" size={14} />
                        <span>{post.date}</span>
                        <span className="mx-2">•</span>
                        <span>{post.readTime}</span>
                      </div>
                    </div>
                    <button className="mt-4 flex items-center text-primary font-medium hover:underline">
                      Read more
                      <ArrowRight className="ml-1" size={16} />
                    </button>
                  </div>
                </article>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center mt-12">
              <nav className="flex space-x-2">
                <button className="px-3 py-1 rounded-md bg-primary text-white">1</button>
                <button className="px-3 py-1 rounded-md text-text-secondary hover:bg-surface">2</button>
                <button className="px-3 py-1 rounded-md text-text-secondary hover:bg-surface">3</button>
                <button className="px-3 py-1 rounded-md text-text-secondary hover:bg-surface">Next →</button>
              </nav>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:w-80 flex-shrink-0 mt-8 lg:mt-0">
            <div className="sticky top-24 space-y-6">
              {/* About */}
              <div className="bg-surface border border-border rounded-xl p-6">
                <h3 className="text-lg font-semibold text-text-primary mb-3">About Cloudiverse Blog</h3>
                <p className="text-text-secondary text-sm">
                  Stay updated with the latest trends, best practices, and insights in cloud architecture and multi-cloud strategies.
                </p>
              </div>

              {/* Popular Tags */}
              <div className="bg-surface border border-border rounded-xl p-6">
                <h3 className="text-lg font-semibold text-text-primary mb-3">Popular Topics</h3>
                <div className="flex flex-wrap gap-2">
                  {popularTags.map((tag, index) => (
                    <a 
                      key={index}
                      href="#"
                      className="inline-block px-3 py-1 rounded-full text-sm bg-background text-text-secondary hover:bg-primary/10 hover:text-primary transition-colors"
                    >
                      {tag}
                    </a>
                  ))}
                </div>
              </div>

              {/* Newsletter */}
              <div className="bg-surface border border-border rounded-xl p-6">
                <h3 className="text-lg font-semibold text-text-primary mb-3">Subscribe to Newsletter</h3>
                <p className="text-text-secondary text-sm mb-4">
                  Get the latest articles and insights delivered to your inbox.
                </p>
                <div className="space-y-3">
                  <input
                    type="email"
                    placeholder="Your email address"
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button className="w-full bg-primary hover:bg-primary/90 text-white text-sm py-2 rounded-lg transition-colors">
                    Subscribe
                  </button>
                </div>
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

export default Blog;