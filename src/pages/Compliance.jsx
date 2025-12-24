import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Cloud, ArrowLeft, CheckCircle, FileCheck, Shield, Globe } from 'lucide-react';

const Compliance = () => {
    const navigate = useNavigate();

    const complianceAreas = [
        {
            icon: <Shield className="h-8 w-8 text-primary" />,
            title: "Data Protection",
            items: [
                "GDPR compliant data processing",
                "Data minimization principles",
                "Right to erasure (Right to be forgotten)",
                "Data portability support"
            ]
        },
        {
            icon: <FileCheck className="h-8 w-8 text-primary" />,
            title: "Security Standards",
            items: [
                "SOC 2 Type II principles",
                "ISO 27001 aligned practices",
                "Regular penetration testing",
                "Vulnerability management program"
            ]
        },
        {
            icon: <Globe className="h-8 w-8 text-primary" />,
            title: "Regional Compliance",
            items: [
                "EU data residency options",
                "CCPA compliance for California users",
                "Cross-border data transfer safeguards",
                "Local regulatory requirements"
            ]
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
                            <CheckCircle className="h-16 w-16 text-primary" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">Compliance</h1>
                        <p className="text-xl text-text-secondary">
                            We maintain the highest standards of compliance to protect your data and meet regulatory requirements.
                        </p>
                    </div>
                </div>
            </section>

            {/* Compliance Areas */}
            <section className="py-16 bg-surface/50">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-5xl mx-auto">
                        <div className="grid md:grid-cols-3 gap-8">
                            {complianceAreas.map((area, index) => (
                                <div key={index} className="bg-surface border border-border rounded-xl p-6">
                                    <div className="mb-4">{area.icon}</div>
                                    <h3 className="text-xl font-semibold mb-4">{area.title}</h3>
                                    <ul className="space-y-2">
                                        {area.items.map((item, itemIndex) => (
                                            <li key={itemIndex} className="flex items-start text-text-secondary">
                                                <CheckCircle className="h-4 w-4 text-primary mr-2 mt-1 flex-shrink-0" />
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Commitments */}
            <section className="py-16">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-2xl font-bold mb-8 text-center">Our Commitments</h2>
                        <div className="bg-surface border border-border rounded-xl p-8 space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Transparency</h3>
                                <p className="text-text-secondary">
                                    We are transparent about how we collect, use, and share your data. Our privacy policy
                                    clearly outlines our data practices.
                                </p>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-2">User Control</h3>
                                <p className="text-text-secondary">
                                    You have full control over your data. Export, modify, or delete your data at any time
                                    through your account settings.
                                </p>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Continuous Improvement</h3>
                                <p className="text-text-secondary">
                                    We continuously monitor and improve our compliance posture as regulations evolve and
                                    new standards emerge.
                                </p>
                            </div>
                        </div>

                        {/* Contact */}
                        <div className="mt-8 text-center">
                            <p className="text-text-secondary">
                                For compliance inquiries, please contact{' '}<br></br>
                                <a href="mailto:krishthakker508@gmail.com" className="text-primary hover:underline">
                                    krishthakker508@gmail.com
                                </a><br></br>
                                <a href="mailto:hetantandel@gmail.com" className="text-primary hover:underline">
                                    hetantandel@gmail.com
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

export default Compliance;
