import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Cloud, ArrowLeft, Shield, Lock, Eye, Server, Key, AlertTriangle } from 'lucide-react';

const Security = () => {
    const navigate = useNavigate();

    const securityFeatures = [
        {
            icon: <Lock className="h-8 w-8 text-primary" />,
            title: "Encryption at Rest & Transit",
            description: "All data is encrypted using AES-256 at rest and TLS 1.3 in transit."
        },
        {
            icon: <Key className="h-8 w-8 text-primary" />,
            title: "Secure Authentication",
            description: "JWT-based authentication with secure password hashing using bcrypt."
        },
        {
            icon: <Server className="h-8 w-8 text-primary" />,
            title: "Infrastructure Security",
            description: "Hosted on enterprise-grade cloud infrastructure with regular security updates."
        },
        {
            icon: <Eye className="h-8 w-8 text-primary" />,
            title: "Access Controls",
            description: "Role-based access control with principle of least privilege."
        }
    ];

    return (
        <div className="min-h-screen bg-background text-text-primary">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <button onClick={() => navigate('/')} className="flex items-center text-text-secondary hover:text-text-primary">
                            <ArrowLeft className="h-5 w-5 mr-2" />
                            Back
                        </button>
                        <div className="flex items-center">
                            <a href={'/'}><img
                                src="/cloudiverse.png"
                                alt="Cloudiverse Architect"
                                className="h-12 w-auto"
                            /></a>
                        </div>
                    </div>
                </div>
            </header>

            {/* Hero */}
            <section className="py-16">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="flex items-center justify-center mb-6">
                            <Shield className="h-16 w-16 text-primary" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">Security at Cloudiverse</h1>
                        <p className="text-xl text-text-secondary">
                            Your security is our top priority. Here's how we protect your data.
                        </p>
                    </div>
                </div>
            </section>

            {/* Security Features */}
            <section className="py-16 bg-surface/50">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-2xl font-bold mb-8 text-center">Security Features</h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            {securityFeatures.map((feature, index) => (
                                <div key={index} className="bg-surface border border-border rounded-xl p-6">
                                    <div className="mb-4">{feature.icon}</div>
                                    <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                                    <p className="text-text-secondary">{feature.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Best Practices */}
            <section className="py-16">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-2xl font-bold mb-8 text-center">Security Best Practices</h2>
                        <div className="bg-surface border border-border rounded-xl p-8">
                            <ul className="space-y-4 text-text-secondary">
                                <li className="flex items-start">
                                    <span className="text-primary mr-3">✓</span>
                                    <span>Regular security audits and vulnerability assessments</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-primary mr-3">✓</span>
                                    <span>Automated security scanning of all code deployments</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-primary mr-3">✓</span>
                                    <span>Employee security training and awareness programs</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-primary mr-3">✓</span>
                                    <span>Incident response plan and 24/7 monitoring</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-primary mr-3">✓</span>
                                    <span>Regular backup and disaster recovery testing</span>
                                </li>
                            </ul>
                        </div>

                        {/* Report Vulnerability */}
                        <div className="mt-8 bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6">
                            <div className="flex items-center mb-4">
                                <AlertTriangle className="h-6 w-6 text-yellow-500 mr-3" />
                                <h3 className="text-lg font-semibold">Report a Vulnerability</h3>
                            </div>
                            <p className="text-text-secondary">
                                If you discover a security vulnerability, please report it responsibly to <a href="mailto:support@cloudiverse.app" className="text-primary hover:underline">
                                    support@cloudiverse.app
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 border-t border-border">
                <div className="container mx-auto px-4 text-center text-text-secondary">
                    <p>&copy; {new Date().getFullYear()} Cloudiverse Architect. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default Security;
