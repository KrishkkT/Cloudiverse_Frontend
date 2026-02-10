
import React, { useMemo } from 'react';

// Pricing Status Descriptions
const STATUS_LABELS = {
    PRICED: 'Infrastructure Cost Drivers',
    FREE_TIER: 'Free / Included Services',
    EXTERNAL: 'External / Usage-Based'
};

const STATUS_ICONS = {
    PRICED: 'payments',
    FREE_TIER: 'redeem',
    EXTERNAL: 'link'
};

const STATUS_COLORS = {
    PRICED: 'text-green-400',
    FREE_TIER: 'text-blue-400',
    EXTERNAL: 'text-purple-400'
};

const CostBreakdown = ({ services, currency = 'USD' }) => {

    // Group services by pricing status
    const groupedServices = useMemo(() => {
        const groups = {
            PRICED: [],
            FREE_TIER: [],
            EXTERNAL: []
        };

        (services || []).forEach(service => {
            // Default to PRICED if missing (unless cost is 0, then maybe FREE_TIER logic applied elsewhere)
            // But backend should now be sending 'pricing_status'.
            // Fallback: If no status, look at cost. 
            let status = service.pricing_status;
            if (!status) {
                if (service.cost?.monthly > 0) status = 'PRICED';
                else if (service.cost?.formatted?.toLowerCase().includes('included')) status = 'FREE_TIER';
                else status = 'PRICED'; // Default fallback
            }

            // Normalize to known groups
            if (!groups[status]) groups.PRICED.push(service); // Fallback bucket
            else groups[status].push(service);
        });

        return groups;
    }, [services]);

    // Calculate sub-totals
    const totals = useMemo(() => {
        return {
            PRICED: groupedServices.PRICED.reduce((sum, s) => sum + (s.cost?.monthly || 0), 0),
            FREE_TIER: 0,
            EXTERNAL: 0
        };
    }, [groupedServices]);

    return (
        <div className="space-y-6 animate-fade-in">
            {/* 1. Infrastructure Cost Drivers (Priced) */}
            {groupedServices.PRICED.length > 0 && (
                <div className="glass-panel p-5 rounded-2xl border border-white/5">
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
                        <div className="flex items-center space-x-2">
                            <span className={`material-icons ${STATUS_COLORS.PRICED}`}>{STATUS_ICONS.PRICED}</span>
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider">{STATUS_LABELS.PRICED}</h3>
                        </div>
                        <div className="text-right">
                            <span className="text-lg font-bold text-white">${totals.PRICED.toFixed(2)}</span>
                            <span className="text-xs text-gray-400 ml-1">/mo</span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {groupedServices.PRICED.map((service, idx) => (
                            <div key={idx} className="flex items-center justify-between group">
                                <div className="flex items-center space-x-3">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 group-hover:bg-white/10 transition-colors`}>
                                        <span className="material-icons text-gray-400 text-sm">
                                            {getIconForCategory(service.category)}
                                        </span>
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-gray-200">{service.cloud_service || service.display_name}</div>
                                        <div className="text-[10px] text-gray-500">{service.display_name} • {service.category}</div>
                                        {/* Show reason for $0 items in PRICED category */}
                                        {service.cost?.monthly === 0 && (
                                            <div className="text-[10px] text-amber-400 mt-0.5 flex items-center">
                                                <span className="material-icons text-[10px] mr-1">info</span>
                                                {service.reason || 'Estimated within free tier'}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-bold text-gray-300">
                                        {service.cost?.formatted || '$0.00'}
                                    </div>
                                    {service.cost?.monthly > 0 && (
                                        <div className="text-[10px] text-gray-500">
                                            {((service.cost.monthly / totals.PRICED) * 100).toFixed(0)}%
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 2. Free / Included Services */}
            {groupedServices.FREE_TIER.length > 0 && (
                <div className="glass-panel p-5 rounded-2xl border border-white/5 opacity-90">
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
                        <div className="flex items-center space-x-2">
                            <span className={`material-icons ${STATUS_COLORS.FREE_TIER}`}>{STATUS_ICONS.FREE_TIER}</span>
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider">{STATUS_LABELS.FREE_TIER}</h3>
                        </div>
                        <div className="text-right">
                            <span className="px-2 py-1 bg-blue-500/10 text-blue-400 text-[10px] font-bold rounded-lg border border-blue-500/20">INCLUDED</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {groupedServices.FREE_TIER.map((service, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors">
                                <div className="flex items-center space-x-3">
                                    <div className="w-6 h-6 rounded-full flex items-center justify-center bg-blue-500/10">
                                        <span className="material-icons text-blue-400 text-xs">check</span>
                                    </div>
                                    <div>
                                        <div className="text-xs font-medium text-gray-300">{service.display_name}</div>
                                        <div className="text-[10px] text-gray-500">{service.reason || 'Always Free'}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 3. External / Usage-Based Services */}
            {groupedServices.EXTERNAL.length > 0 && (
                <div className="glass-panel p-5 rounded-2xl border border-white/5 opacity-90">
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
                        <div className="flex items-center space-x-2">
                            <span className={`material-icons ${STATUS_COLORS.EXTERNAL}`}>{STATUS_ICONS.EXTERNAL}</span>
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider">{STATUS_LABELS.EXTERNAL}</h3>
                        </div>
                        <div className="text-right">
                            <span className="px-2 py-1 bg-purple-500/10 text-purple-400 text-[10px] font-bold rounded-lg border border-purple-500/20">VARIES</span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {groupedServices.EXTERNAL.map((service, idx) => (
                            <div key={idx} className="flex items-center justify-between group">
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors">
                                        <span className="material-icons text-purple-400 text-sm">open_in_new</span>
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-gray-200">{service.display_name}</div>
                                        <div className="text-[10px] text-gray-500">{service.reason || 'Billed separately'}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-gray-400 italic">Usage-based</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// Helper for icons (duplicated for simplicity, or could import from utils)
function getIconForCategory(category) {
    const map = {
        'Compute': 'memory',
        'Database': 'storage',
        'Storage': 'folder',
        'Networking': 'router',
        'Security': 'security',
        'AI/ML': 'psychology',
        'Messaging': 'message',
        'Monitoring': 'analytics'
    };
    return map[category] || 'dns'; // Default icon
}

export default CostBreakdown;
