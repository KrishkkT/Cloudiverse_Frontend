import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cloud, ArrowLeft, Mail, MapPin, Phone, Send } from 'lucide-react';
import { toast } from 'react-toastify';

const Contact = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Submit to Formspree
            const response = await fetch('https://formspree.io/f/mojabwnj', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                toast.success('Message sent! We\'ll get back to you soon.');
                setFormData({ name: '', email: '', subject: '', message: '' });
            } else {
                const data = await response.json();
                toast.error(data.error || 'Failed to send message. Please try again.');
            }
        } catch (error) {
            console.error('Form submission error:', error);
            toast.error('Failed to send message. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

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
                            <Cloud className="h-8 w-8 text-primary mr-2" />
                            <span className="text-xl font-bold">Cloudiverse</span>
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

                            {/* Contact Form */}
                            <div className="bg-surface border border-border rounded-xl p-6">
                                <h2 className="text-xl font-semibold mb-6">Send us a message</h2>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Email</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Subject</label>
                                        <input
                                            type="text"
                                            name="subject"
                                            value={formData.subject}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Message</label>
                                        <textarea
                                            name="message"
                                            value={formData.message}
                                            onChange={handleChange}
                                            rows={4}
                                            className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                            required
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-lg flex items-center justify-center"
                                    >
                                        {loading ? 'Sending...' : (
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
