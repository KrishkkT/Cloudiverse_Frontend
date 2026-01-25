import React, { memo, useState } from 'react';
import { Handle, Position } from 'reactflow';
import { motion, AnimatePresence } from 'framer-motion';
import { getServiceMetadata } from '../data/serviceMetadata';

const ServiceNode = ({ data, id }) => {
    const [showPopup, setShowPopup] = useState(false);

    // Extract service ID from data or default to label content
    // Assuming data.serviceId is passed, or we infer from label/icon
    const serviceId = data.serviceId || data.label?.props?.children?.[1]?.props?.children?.toLowerCase().replace(/\s+/g, '');
    const provider = data.provider || 'aws';

    const metadata = getServiceMetadata(serviceId, provider);

    return (
        <div
            className="relative"
            onMouseEnter={() => setShowPopup(true)}
            onMouseLeave={() => setShowPopup(false)}
        >
            <Handle type="target" position={Position.Left} className="!bg-gray-400 !w-2 !h-2" />

            {/* Node Content */}
            <div className="relative z-10">
                {data.label}
            </div>

            <Handle type="source" position={Position.Right} className="!bg-gray-400 !w-2 !h-2" />

            {/* Animated Popup */}
            <AnimatePresence>
                {showPopup && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute left-1/2 transform -translate-x-1/2 bottom-full mb-3 w-64 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl p-4 z-50 pointer-events-none"
                    >
                        <div className="flex items-center space-x-2 mb-2 pb-2 border-b border-gray-700">
                            {/* Re-use icon from label if possible, or generic */}
                            <span className="text-xl">ℹ️</span>
                            <h4 className="font-bold text-white text-sm">{metadata.name || serviceId}</h4>
                        </div>

                        <p className="text-xs text-gray-300 mb-2 leading-relaxed">
                            {metadata.desc}
                        </p>

                        <div className="bg-black/30 rounded p-2 mb-2">
                            <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">How it works</p>
                            <p className="text-xs text-gray-300">{metadata.howItWorks}</p>
                        </div>

                        {metadata.link && (
                            <div className="text-right">
                                <span className="text-[10px] text-primary">View Docs &rarr;</span>
                            </div>
                        )}

                        {/* Arrow */}
                        <div className="absolute left-1/2 transform -translate-x-1/2 top-full w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-gray-700"></div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default memo(ServiceNode);
