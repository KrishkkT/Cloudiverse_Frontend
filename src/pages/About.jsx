import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Cloud, ArrowLeft, Users, Target, Globe, Heart } from 'lucide-react';

const About = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background text-text-primary">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center">
                            <button onClick={() => navigate('/')} className="flex items-center text-text-secondary hover:text-text-primary">
                                <ArrowLeft className="h-5 w-5 mr-2" />
                                Back
                            </button>
                        </div>
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

            {/* Hero */}
            <section className="py-20">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-4xl mx-auto text-center">
                        <h1 className="text-4xl md:text-5xl font-bold mb-6">About Cloudiverse</h1>
                        <p className="text-xl text-text-secondary mb-8">
                            We're on a mission to democratize cloud infrastructure design for everyone.
                        </p>
                    </div>
                </div>
            </section>

            {/* Mission */}
            <section className="py-16 bg-surface/50">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-4xl mx-auto">
                        <div className="grid md:grid-cols-2 gap-12">
                            <div>
                                <div className="flex items-center mb-4">
                                    <Target className="h-8 w-8 text-primary mr-3" />
                                    <h2 className="text-2xl font-bold">Our Mission</h2>
                                </div>
                                <p className="text-text-secondary leading-relaxed">
                                    To make cloud infrastructure design accessible to developers of all skill levels.
                                    We believe that designing secure, scalable, and cost-effective cloud architectures
                                    shouldn't require years of experience or expensive consultants.
                                </p>
                            </div>
                            <div>
                                <div className="flex items-center mb-4">
                                    <Heart className="h-8 w-8 text-primary mr-3" />
                                    <h2 className="text-2xl font-bold">Our Values</h2>
                                </div>
                                <ul className="text-text-secondary space-y-2">
                                    <li>• <strong>Simplicity:</strong> Complex things made simple</li>
                                    <li>• <strong>Security:</strong> Best practices by default</li>
                                    <li>• <strong>Transparency:</strong> No hidden costs or surprises</li>
                                    <li>• <strong>Innovation:</strong> Always pushing boundaries</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Team */}
            <section className="py-16">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="flex items-center justify-center mb-4">
                            <Users className="h-8 w-8 text-primary mr-3" />
                            <h2 className="text-2xl font-bold">Our Team</h2>
                        </div>
                        <p className="text-text-secondary leading-relaxed mb-8">
                            We're a team of passionate cloud engineers, developers, and designers
                            who have worked at leading tech companies and startups. We've experienced
                            the pain of cloud infrastructure firsthand and built Cloudiverse to solve it.
                        </p>
                        <div className="flex items-center justify-center">
                            <Globe className="h-6 w-6 text-primary mr-2" />
                            <span className="text-text-secondary">Building from around the world</span>
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

export default About;
