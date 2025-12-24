import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Cloud, ArrowLeft, FileText } from 'lucide-react';

const Terms = () => {
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
                                src="./assets/images/cloudiverse.png"
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
                            <FileText className="h-10 w-10 text-primary mr-4" />
                            <div>
                                <h1 className="text-3xl font-bold">Terms of Service</h1>
                                <p className="text-text-secondary">Last updated: December 2024</p>
                            </div>
                        </div>

                        <div className="prose prose-invert max-w-none space-y-8">
                            <section className="bg-surface border border-border rounded-xl p-6">
                                <h2 className="text-xl font-semibold mb-4">1. Acceptance of Terms</h2>
                                <p className="text-text-secondary leading-relaxed">
                                    By accessing and using Cloudiverse Architect ("the Service"), you accept and agree to be bound
                                    by the terms and provision of this agreement. If you do not agree to abide by these terms,
                                    please do not use this service.
                                </p>
                            </section>

                            <section className="bg-surface border border-border rounded-xl p-6">
                                <h2 className="text-xl font-semibold mb-4">2. Description of Service</h2>
                                <p className="text-text-secondary leading-relaxed">
                                    Cloudiverse Architect provides cloud infrastructure design, cost estimation, and Terraform
                                    code generation services. The Service allows users to design multi-cloud architectures
                                    using natural language descriptions and export deployment-ready infrastructure code.
                                </p>
                            </section>

                            <section className="bg-surface border border-border rounded-xl p-6">
                                <h2 className="text-xl font-semibold mb-4">3. User Responsibilities</h2>
                                <ul className="text-text-secondary space-y-2 list-disc pl-5">
                                    <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
                                    <li>You agree not to use the Service for any unlawful purpose.</li>
                                    <li>You are responsible for reviewing and validating generated infrastructure code before deployment.</li>
                                    <li>You agree not to attempt to gain unauthorized access to the Service or its systems.</li>
                                </ul>
                            </section>

                            <section className="bg-surface border border-border rounded-xl p-6">
                                <h2 className="text-xl font-semibold mb-4">4. Intellectual Property</h2>
                                <p className="text-text-secondary leading-relaxed">
                                    The Service and its original content, features, and functionality are owned by Cloudiverse
                                    and are protected by international copyright, trademark, patent, trade secret, and other
                                    intellectual property laws. Infrastructure designs and code you create using the Service
                                    remain your property.
                                </p>
                            </section>

                            <section className="bg-surface border border-border rounded-xl p-6">
                                <h2 className="text-xl font-semibold mb-4">5. Limitation of Liability</h2>
                                <p className="text-text-secondary leading-relaxed">
                                    Cloudiverse shall not be liable for any indirect, incidental, special, consequential,
                                    or punitive damages resulting from your use of or inability to use the Service.
                                    Cost estimates are provided for informational purposes and may not reflect actual
                                    cloud provider charges.
                                </p>
                            </section>

                            <section className="bg-surface border border-border rounded-xl p-6">
                                <h2 className="text-xl font-semibold mb-4">6. Changes to Terms</h2>
                                <p className="text-text-secondary leading-relaxed">
                                    We reserve the right to modify or replace these Terms at any time. If a revision is
                                    material, we will provide at least 30 days' notice prior to any new terms taking effect.
                                </p>
                            </section>

                            <section className="bg-surface border border-border rounded-xl p-6">
                                <h2 className="text-xl font-semibold mb-4">7. Contact Information</h2>
                                <p className="text-text-secondary leading-relaxed">
                                    If you have any questions about these Terms, please contact us at <a href="mailto:krishthakker508@gmail.com" className="text-primary hover:underline">
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

export default Terms;
