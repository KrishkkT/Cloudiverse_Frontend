import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, MapPin, Phone, Send, CheckCircle } from 'lucide-react';
import { useForm, ValidationError } from '@formspree/react';

const Contact = () => {
    const navigate = useNavigate();
    const [state, handleSubmit] = useForm("mojabwnj");

    // Success state
    if (state.succeeded) {
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
                                    src="/assets/images/cloudiverse.png"
                                    alt="Cloudiverse Architect"
                                    className="h-12 w-auto"
                                /></a>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Success Message */}
                <section className="py-20">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="max-w-lg mx-auto text-center">
                            <div className="bg-surface border border-border rounded-xl p-8">
                                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                                <h2 className="text-2xl font-bold mb-4">Thank you!</h2>
                                <p className="text-text-secondary mb-6">
                                    Your message has been sent successfully. We'll get back to you as soon as possible.
                                </p>
                                <button
                                    onClick={() => navigate('/')}
                                    className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg"
                                >
                                    Back to Home
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        );
    }

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
                                src="/assets/images/cloudiverse.png"
                                alt="Cloudiverse Architect"
                                className="h-12 w-auto"
                            /></a>
                        </div>
                    </div>
                </div>
            </header>

            {/* Content */}
            <section className="py-20">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-5xl mx-auto">
                        <div className="text-center mb-12">
                            <h1 className="text-4xl md:text-5xl font-bold mb-4">Contact Us</h1>
                            <p className="text-xl text-text-secondary">
                                Have questions? We'd love to hear from you.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-12">
                            {/* Contact Info */}
                            <div className="space-y-8">
                                <div className="bg-surface border border-border rounded-xl p-6">
                                    <div className="flex items-center mb-4">
                                        <Mail className="h-6 w-6 text-primary mr-3" />
                                        <h3 className="text-lg font-semibold">Email</h3>
                                    </div>
                                    <p className="text-text-secondary">krishthakker508@gmail.com</p>
                                    <p className="text-text-secondary">hetantandel@gmail.com</p>
                                </div>

                                <div className="bg-surface border border-border rounded-xl p-6">
                                    <div className="flex items-center mb-4">
                                        <MapPin className="h-6 w-6 text-primary mr-3" />
                                        <h3 className="text-lg font-semibold">Location</h3>
                                    </div>
                                    <p className="text-text-secondary">Remote-first company</p>
                                    <p className="text-text-secondary">Building from around the world</p>
                                </div>

                                <div className="bg-surface border border-border rounded-xl p-6">
                                    <div className="flex items-center mb-4">
                                        <Phone className="h-6 w-6 text-primary mr-3" />
                                        <h3 className="text-lg font-semibold">Response Time</h3>
                                    </div>
                                    <p className="text-text-secondary">We typically respond within 24 hours</p>
                                </div>
                            </div>

                            {/* Contact Form - Using Formspree */}
                            <div className="bg-surface border border-border rounded-xl p-6">
                                <h2 className="text-xl font-semibold mb-6">Send us a message</h2>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium mb-2">Name</label>
                                        <input
                                            id="name"
                                            type="text"
                                            name="name"
                                            className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-text-primary"
                                            required
                                        />
                                        <ValidationError
                                            prefix="Name"
                                            field="name"
                                            errors={state.errors}
                                            className="text-red-500 text-sm mt-1"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium mb-2">Email</label>
                                        <input
                                            id="email"
                                            type="email"
                                            name="email"
                                            className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-text-primary"
                                            required
                                        />
                                        <ValidationError
                                            prefix="Email"
                                            field="email"
                                            errors={state.errors}
                                            className="text-red-500 text-sm mt-1"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="subject" className="block text-sm font-medium mb-2">Subject</label>
                                        <input
                                            id="subject"
                                            type="text"
                                            name="subject"
                                            className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-text-primary"
                                            required
                                        />
                                        <ValidationError
                                            prefix="Subject"
                                            field="subject"
                                            errors={state.errors}
                                            className="text-red-500 text-sm mt-1"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="message" className="block text-sm font-medium mb-2">Message</label>
                                        <textarea
                                            id="message"
                                            name="message"
                                            rows={4}
                                            className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-text-primary"
                                            required
                                        />
                                        <ValidationError
                                            prefix="Message"
                                            field="message"
                                            errors={state.errors}
                                            className="text-red-500 text-sm mt-1"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={state.submitting}
                                        className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-lg flex items-center justify-center disabled:opacity-50"
                                    >
                                        {state.submitting ? 'Sending...' : (
                                            <>
                                                <Send className="h-4 w-4 mr-2" />
                                                Send Message
                                            </>
                                        )}
                                    </button>
                                </form>
                            </div>
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

export default Contact;
