import React from 'react';
import Navbar from '../components/Navbar';
import { DollarSign, AlertTriangle, RefreshCw } from 'lucide-react';

const CancellationRefunds = () => {
    return (
        <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20">
            <Navbar />

            <main className="max-w-4xl mx-auto px-6 py-12 md:py-20">
                <header className="mb-12 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-orange-500">
                        Cancellations & Refunds
                    </h1>
                    <p className="text-xl text-text-secondary">
                        Our policies regarding subscription modifications and refunds.
                    </p>
                </header>

                <div className="space-y-12">
                    {/* Section 1 */}
                    <section className="bg-card border border-border rounded-2xl p-8 shadow-sm">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-primary/10 rounded-lg text-primary">
                                <AlertTriangle size={24} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-semibold mb-4 text-white">Cancellation Policy</h2>
                                <p className="text-text-secondary leading-relaxed mb-4">
                                    You may cancel your Pro subscription at any time via the <strong>Settings &gt; Billing</strong> page.
                                </p>
                                <p className="text-text-secondary leading-relaxed">
                                    Upon cancellation, your subscription will remain active until the end of the current billing period. After this period, your account will automatically downgrade to the Free Tier, and you will lose access to Pro features (e.g., unlimited projects, Terraform exports).
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Section 2 */}
                    <section className="bg-card border border-border rounded-2xl p-8 shadow-sm">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-primary/10 rounded-lg text-primary">
                                <DollarSign size={24} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-semibold mb-4 text-white">Refund Policy</h2>
                                <p className="text-text-secondary leading-relaxed mb-4">
                                    <strong>Cloudiverse generally acts on a strict no-refund policy</strong> given the digital nature of our services and immediate access to server resources.
                                </p>
                                <p className="text-text-secondary leading-relaxed mb-4">
                                    However, we review refund requests on a case-by-case basis under the following circumstances:
                                </p>
                                <ul className="list-disc list-inside text-text-secondary space-y-2">
                                    <li>Double charges due to system error.</li>
                                    <li>Service unavailability exceeding our SLA (24+ hours downtime).</li>
                                    <li>Requests made within 24 hours of initial purchase if no resources (Generations/Exports) were used.</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* Section 3 */}
                    <section className="bg-card border border-border rounded-2xl p-8 shadow-sm">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-primary/10 rounded-lg text-primary">
                                <RefreshCw size={24} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-semibold mb-4 text-white">How to Request</h2>
                                <p className="text-text-secondary leading-relaxed">
                                    To request a refund or raise a billing dispute, please email <a href="mailto:billing@cloudiverse.ai" className="text-primary hover:underline">billing@cloudiverse.ai</a> with your transaction ID and a brief explanation. Our billing team reviews all requests within 3-5 business days.
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

export default CancellationRefunds;
