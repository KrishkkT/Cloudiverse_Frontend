import React from 'react';
import Navbar from '../components/Navbar';
import { Shield, Clock, Globe } from 'lucide-react';

const ServicePolicy = () => {
    return (
        <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20">
            <Navbar />

            <main className="max-w-4xl mx-auto px-6 py-12 md:py-20">
                <header className="mb-12 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
                        Service Delivery Policy
                    </h1>
                    <p className="text-xl text-text-secondary">
                        How we deliver our digital services to you.
                    </p>
                </header>

                <div className="space-y-12">
                    {/* Section 1 */}
                    <section className="bg-card border border-border rounded-2xl p-8 shadow-sm">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-primary/10 rounded-lg text-primary">
                                <Clock size={24} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-semibold mb-4 text-white">Immediate Access</h2>
                                <p className="text-text-secondary leading-relaxed mb-4">
                                    Upon successful payment for any Cloudiverse subscription plan (Pro or Enterprise), access to the respective features is granted <strong>immediately</strong>.
                                </p>
                                <p className="text-text-secondary leading-relaxed">
                                    You will receive a confirmation email with your transaction details, and your account status will be updated instantly to reflect your new plan limits. No physical shipping is involved.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Section 2 */}
                    <section className="bg-card border border-border rounded-2xl p-8 shadow-sm">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-primary/10 rounded-lg text-primary">
                                <Globe size={24} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-semibold mb-4 text-white">Digital Delivery</h2>
                                <p className="text-text-secondary leading-relaxed">
                                    Cloudiverse is a SaaS (Software as a Service) platform. All "goods" are digital and accessed via our web application.
                                </p>
                                <ul className="list-disc list-inside mt-4 text-text-secondary space-y-2">
                                    <li>Architecture Diagrams are rendered in-browser.</li>
                                    <li>Terraform code is generated and available for download immediately.</li>
                                    <li>PDF Reports are generated on-demand.</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* Section 3 */}
                    <section className="bg-card border border-border rounded-2xl p-8 shadow-sm">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-primary/10 rounded-lg text-primary">
                                <Shield size={24} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-semibold mb-4 text-white">Support & Issues</h2>
                                <p className="text-text-secondary leading-relaxed">
                                    If you experience any delays in account upgrading after payment, please contact our support team immediately at <a href="mailto:support@cloudiverse.ai" className="text-primary hover:underline">support@cloudiverse.ai</a>. We typically resolve such synchronization issues within 24 hours.
                                </p>
                            </div>
                        </div>
                    </section>
                </div>

                <footer className="mt-16 pt-8 border-t border-border text-center text-text-secondary">
                    <p>Last updated: January 2026</p>
                </footer>
            </main>
        </div>
    );
};

export default ServicePolicy;
