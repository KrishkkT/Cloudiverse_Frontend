import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getServiceMetadata } from '../data/serviceMetadata';

const ServiceInfoButton = ({ serviceId, provider, serviceName }) => {
    const [showPopup, setShowPopup] = useState(false);
    const metadata = getServiceMetadata(serviceId, provider);

    // Fallback name if only ID is provided
    const displayName = serviceName || metadata.name || serviceId;

    return (
        <div className="relative inline-block ml-2">
            <button
                onClick={() => setShowPopup(true)} // Click to open
                className="w-5 h-5 rounded-full bg-gray-700 text-gray-300 hover:bg-primary hover:text-white flex items-center justify-center text-xs transition-colors focus:outline-none"
                aria-label="Service Information"
            >
                <span className="font-serif italic font-bold">i</span>
            </button>

            {/* Backdrop for explicit modal behavior */}
            <AnimatePresence>
                {showPopup && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999]"
                            onClick={() => setShowPopup(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            transition={{ duration: 0.2 }}
                            className="fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-md bg-surface border border-border rounded-xl shadow-2xl p-6 z-[1000] overflow-hidden"
                            role="dialog"
                            aria-modal="true"
                        >
                            {/* Close Button */}
                            <button
                                onClick={() => setShowPopup(false)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-white"
                            >
                                <span className="material-icons">close</span>
                            </button>

                            {/* Header */}
                            <div className="flex items-center space-x-3 mb-4 pb-4 border-b border-white/5">
                                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center text-xl">
                                    ℹ️
                                </div>
                                <div>
                                    <h4 className="font-bold text-white text-lg">{displayName}</h4>
                                    <p className="text-xs text-gray-400 uppercase tracking-wide">{provider || 'Cloud Service'}</p>
                                </div>
                            </div>

                            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                                {/* Description */}
                                <p className="text-sm text-gray-300 leading-relaxed">
                                    {metadata.desc}
                                </p>

                                {/* How it Works */}
                                <div className="bg-white/5 rounded-lg p-3">
                                    <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">How it works</p>
                                    <p className="text-sm text-gray-300">{metadata.howItWorks}</p>
                                </div>

                                {/* Pros & Cons Grid */}
                                {(metadata.pros || metadata.cons) && (
                                    <div className="grid grid-cols-2 gap-4">
                                        {metadata.pros && (
                                            <div>
                                                <h5 className="flex items-center text-green-400 text-xs font-bold uppercase mb-2">
                                                    <span className="material-icons text-sm mr-1">check_circle</span> Pros
                                                </h5>
                                                <ul className="space-y-1">
                                                    {metadata.pros.map((p, i) => (
                                                        <li key={i} className="text-xs text-gray-300 flex items-start">
                                                            <span className="mr-1.5 mt-0.5 text-green-500/50">•</span>
                                                            {p}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                        {metadata.cons && (
                                            <div>
                                                <h5 className="flex items-center text-red-400 text-xs font-bold uppercase mb-2">
                                                    <span className="material-icons text-sm mr-1">cancel</span> Cons
                                                </h5>
                                                <ul className="space-y-1">
                                                    {metadata.cons.map((c, i) => (
                                                        <li key={i} className="text-xs text-gray-300 flex items-start">
                                                            <span className="mr-1.5 mt-0.5 text-red-500/50">•</span>
                                                            {c}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Best For */}
                                {metadata.bestFor && (
                                    <div>
                                        <h5 className="flex items-center text-amber-400 text-xs font-bold uppercase mb-2">
                                            <span className="material-icons text-sm mr-1">lightbulb</span> Best For
                                        </h5>
                                        <div className="flex flex-wrap gap-2">
                                            {metadata.bestFor.map((bf, i) => (
                                                <span key={i} className="px-2 py-1 bg-amber-400/10 border border-amber-400/20 text-amber-200 text-xs rounded-md">
                                                    {bf}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Link */}
                                {metadata.link && (
                                    <div className="pt-4 mt-2 border-t border-white/5 text-right">
                                        <a
                                            href={metadata.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs text-primary hover:text-primary-light flex items-center justify-end font-medium transition-colors"
                                        >
                                            View Official Documentation
                                            <span className="material-icons text-sm ml-1">open_in_new</span>
                                        </a>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ServiceInfoButton;
