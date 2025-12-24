import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Cloud, ArrowLeft, Lock, Eye, Database, Shield } from 'lucide-react';

const Privacy = () => {
    const navigate = useNavigate();

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

            {/* Content */}
            <section className="py-16">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-4xl mx-auto">
                        <div className="flex items-center mb-8">
                            <Lock className="h-10 w-10 text-primary mr-4" />
                            <div>
                                <h1 className="text-3xl font-bold">Privacy Policy</h1>
                                <p className="text-text-secondary">Last updated: December 2024</p>
                            </div>
                        </div>

                        <div className="prose prose-invert max-w-none space-y-8">
                            <section className="bg-surface border border-border rounded-xl p-6">
                                <div className="flex items-center mb-4">
                                    <Eye className="h-6 w-6 text-primary mr-3" />
                                    <h2 className="text-xl font-semibold">Information We Collect</h2>
                                </div>
                                <p className="text-text-secondary leading-relaxed mb-4">
                                    We collect information you provide directly to us:
                                </p>
                                <ul className="text-text-secondary space-y-2 list-disc pl-5">
                                    <li>Account information (name, email, password)</li>
                                    <li>Project data (infrastructure descriptions, configurations)</li>
                                    <li>Usage data (features used, time spent)</li>
                                    <li>Communication data (support requests, feedback)</li>
                                </ul>
                            </section>

                            <section className="bg-surface border border-border rounded-xl p-6">
                                <div className="flex items-center mb-4">
                                    <Database className="h-6 w-6 text-primary mr-3" />
                                    <h2 className="text-xl font-semibold">How We Use Your Information</h2>
                                </div>
                                <ul className="text-text-secondary space-y-2 list-disc pl-5">
                                    <li>To provide, maintain, and improve our services</li>
                                    <li>To process your transactions and send related information</li>
                                    <li>To send you technical notices, updates, and support messages</li>
                                    <li>To respond to your comments, questions, and requests</li>
                                    <li>To analyze usage patterns and improve user experience</li>
                                </ul>
                            </section>

                            <section className="bg-surface border border-border rounded-xl p-6">
                                <div className="flex items-center mb-4">
                                    <Shield className="h-6 w-6 text-primary mr-3" />
                                    <h2 className="text-xl font-semibold">Data Protection</h2>
                                </div>
                                <p className="text-text-secondary leading-relaxed">
                                    We implement industry-standard security measures to protect your data:
                                </p>
                                <ul className="text-text-secondary space-y-2 list-disc pl-5 mt-4">
                                    <li>Encryption in transit (TLS 1.3) and at rest (AES-256)</li>
                                    <li>Regular security audits and penetration testing</li>
                                    <li>Access controls and authentication requirements</li>
                                    <li>Data backup and disaster recovery procedures</li>
                                </ul>
                            </section>

                            <section className="bg-surface border border-border rounded-xl p-6">
                                <h2 className="text-xl font-semibold mb-4">Data Retention</h2>
                                <p className="text-text-secondary leading-relaxed">
                                    We retain your personal information for as long as your account is active or as needed
                                    to provide you services. You can request deletion of your data at any time by contacting
                                    our support team or using the account deletion feature in settings.
                                </p>
                            </section>

                            <section className="bg-surface border border-border rounded-xl p-6">
                                <h2 className="text-xl font-semibold mb-4">Your Rights</h2>
                                <ul className="text-text-secondary space-y-2 list-disc pl-5">
                                    <li>Access and receive a copy of your personal data</li>
                                    <li>Request correction of inaccurate data</li>
                                    <li>Request deletion of your data</li>
                                    <li>Object to processing of your data</li>
                                    <li>Export your data in a portable format</li>
                                </ul>
                            </section>

                            <section className="bg-surface border border-border rounded-xl p-6">
                                <h2 className="text-xl font-semibold mb-4">Contact Us</h2>
                                <p className="text-text-secondary leading-relaxed">
                                    If you have questions about this Privacy Policy, please contact us at <a href="mailto:krishthakker508@gmail.com" className="text-primary hover:underline">
                                        krishthakker508@gmail.com
                                    </a> or <a href="mailto:hetantandel@gmail.com" className="text-primary hover:underline">
                                        hetantandel@gmail.com
                                    </a>.
                                </p>
                            </section>
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

export default Privacy;
