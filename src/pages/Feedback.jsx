import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageSquare, ThumbsUp, Activity, AlertTriangle, Lightbulb, Send, CheckCircle } from 'lucide-react';
import { useForm, ValidationError } from '@formspree/react';

const Feedback = () => {
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
                                <img
                                    src="/cloudiverse.png"
                                    alt="Cloudiverse Architect"
                                    className="h-12 w-auto"
                                />
                            </div>
                        </div>
                    </div>
                </header>

                {/* Success Message */}
                <section className="py-20">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="max-w-lg mx-auto text-center">
                            <div className="bg-surface border border-border rounded-xl p-8 animate-fade-in-up">
                                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                                <h2 className="text-2xl font-bold mb-4">Feedback Received!</h2>
                                <p className="text-text-secondary mb-6">
                                    Thank you for helping us improve Cloudiverse. We truly appreciate your insights.
                                </p>
                                <button
                                    onClick={() => navigate('/')}
                                    className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg transition-colors"
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
                        <button onClick={() => navigate(-1)} className="flex items-center text-text-secondary hover:text-text-primary transition-colors">
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
            <section className="py-12 md:py-20">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-3xl mx-auto">
                        <div className="text-center mb-12">
                            <h1 className="text-3xl md:text-5xl font-bold mb-4 flex items-center justify-center gap-3">
                                <MessageSquare className="h-10 w-10 text-primary" />
                                Service Feedback
                            </h1>
                            <p className="text-xl text-text-secondary">
                                Help us shape the future of cloud architecture design.
                            </p>
                        </div>

                        <div className="bg-surface border border-border rounded-2xl p-8 shadow-xl">
                            <form onSubmit={handleSubmit} className="space-y-8">

                                {/* 1. Overall Experience */}
                                <div className="space-y-4">
                                    <label className="flex items-center text-lg font-semibold">
                                        <ThumbsUp className="h-5 w-5 text-primary mr-2" />
                                        Overall Experience
                                    </label>
                                    <div className="grid grid-cols-5 gap-2 md:gap-4">
                                        {[1, 2, 3, 4, 5].map((rating) => (
                                            <label key={rating} className="cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="overall_rating"
                                                    value={rating}
                                                    className="peer sr-only"
                                                    required
                                                />
                                                <div className="h-12 rounded-lg border border-border bg-background flex items-center justify-center text-lg font-medium transition-all peer-checked:bg-primary peer-checked:text-white peer-checked:border-primary hover:border-primary/50">
                                                    {rating}
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                    <div className="flex justify-between text-xs text-text-secondary px-1">
                                        <span>Poor</span>
                                        <span>Excellent</span>
                                    </div>
                                    <ValidationError prefix="Rating" field="overall_rating" errors={state.errors} className="text-red-500 text-sm" />
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    {/* 2. Usability */}
                                    <div className="space-y-2">
                                        <label className="flex items-center font-medium">
                                            <Activity className="h-4 w-4 text-blue-400 mr-2" />
                                            Usability & Ease of Use
                                        </label>
                                        <select
                                            name="usability"
                                            className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-text-primary cursor-pointer"
                                            required
                                        >
                                            <option value="" disabled selected>Select an option</option>
                                            <option value="Very Intuitive">Very Intuitive</option>
                                            <option value="Easy to learn">Easy to learn</option>
                                            <option value="Average">Average</option>
                                            <option value="Confusing">Confusing</option>
                                            <option value="Difficult to use">Difficult to use</option>
                                        </select>
                                    </div>

                                    {/* 3. Performance */}
                                    <div className="space-y-2">
                                        <label className="flex items-center font-medium">
                                            <Activity className="h-4 w-4 text-green-400 mr-2" />
                                            Performance & Speed
                                        </label>
                                        <select
                                            name="performance"
                                            className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-text-primary cursor-pointer"
                                            required
                                        >
                                            <option value="" disabled selected>Select an option</option>
                                            <option value="Blazing Fast">Blazing Fast</option>
                                            <option value="Good">Good</option>
                                            <option value="Acceptable">Acceptable</option>
                                            <option value="Slow">Slow</option>
                                            <option value="Laggy/Unresponsive">Laggy/Unresponsive</option>
                                        </select>
                                    </div>
                                </div>

                                {/* 4. Issues */}
                                <div className="space-y-2">
                                    <label className="flex items-center font-medium">
                                        <AlertTriangle className="h-4 w-4 text-yellow-400 mr-2" />
                                        Did you encounter any issues?
                                    </label>
                                    <textarea
                                        name="issues"
                                        rows={3}
                                        placeholder="Describe any bugs or glitches you faced..."
                                        className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-text-primary placeholder:text-text-subtle"
                                    />
                                </div>

                                {/* 5. Suggestions */}
                                <div className="space-y-2">
                                    <label className="flex items-center font-medium">
                                        <Lightbulb className="h-4 w-4 text-purple-400 mr-2" />
                                        Suggestions for Improvement
                                    </label>
                                    <textarea
                                        name="suggestions"
                                        rows={4}
                                        placeholder="What features or changes would make your experience better?"
                                        className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-text-primary placeholder:text-text-subtle"
                                        required
                                    />
                                </div>

                                {/* 6. Contact Details (Optional) */}
                                <div className="pt-4 border-t border-border">
                                    <label className="block text-sm font-medium mb-2 text-text-secondary">
                                        Contact Email (Optional - if you'd like a response)
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="your@email.com"
                                        className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-text-primary"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={state.submitting}
                                    className="w-full bg-primary hover:bg-primary/90 text-white py-4 rounded-xl text-lg font-bold flex items-center justify-center transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {state.submitting ? 'Sending Feedback...' : (
                                        <>
                                            <Send className="h-5 w-5 mr-2" />
                                            Submit Feedback
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 border-t border-border mt-auto">
                <div className="container mx-auto px-4 text-center text-text-secondary">
                    <p>&copy; {new Date().getFullYear()} Cloudiverse Architect. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default Feedback;
