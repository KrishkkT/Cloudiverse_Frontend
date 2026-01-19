import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Cloud, ArrowLeft, Search } from 'lucide-react';

// Star background component for the "Cloudiverse" feel
const Stars = () => {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            {[...Array(20)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute bg-white rounded-full opacity-70"
                    initial={{
                        x: Math.random() * 100 + "vw",
                        y: Math.random() * 100 + "vh",
                        scale: Math.random() * 0.5 + 0.5,
                    }}
                    animate={{
                        y: [null, Math.random() * 100 + "vh"],
                        opacity: [0.7, 0.2, 0.7],
                    }}
                    transition={{
                        duration: Math.random() * 10 + 20,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                    style={{
                        width: Math.random() * 3 + "px",
                        height: Math.random() * 3 + "px",
                    }}
                />
            ))}
        </div>
    );
};

// Floating planet/astronaut visual
const FloatingAsset = () => {
    return (
        <motion.div
            className="relative w-64 h-64 md:w-96 md:h-96 mx-auto mb-8"
            animate={{
                y: [0, -20, 0],
                rotate: [0, 5, -5, 0],
            }}
            transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
            }}
        >
            <div className="absolute inset-0 bg-accent/20 rounded-full blur-3xl" />
            <div className="relative z-10 w-full h-full flex items-center justify-center">
                <div className="text-9xl">🪐</div>
                <motion.div
                    className="absolute text-6xl"
                    animate={{
                        x: [-60, 60, -60],
                        y: [20, -20, 20],
                        rotate: [0, 360],
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                >
                    🧑‍🚀
                </motion.div>
            </div>
        </motion.div>
    );
};

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background relative flex flex-col items-center justify-center p-4 overflow-hidden">
            <Stars />

            {/* Glow effects */}
            <div className="absolute top-1/4 -left-20 w-80 h-80 bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-accent/20 rounded-full blur-[100px] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="relative z-10 text-center max-w-2xl"
            >
                <FloatingAsset />

                <h1 className="text-8xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-secondary mb-4 drop-shadow-lg">
                    404
                </h1>

                <motion.h2
                    className="text-3xl md:text-4xl font-semibold text-white mb-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    Lost in the Cloudiverse?
                </motion.h2>

                <motion.p
                    className="text-muted-foreground text-lg mb-10 max-w-md mx-auto"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    The coordinates you entered don't correspond to any known sector in our galaxy.
                    Let's get you back to mission control.
                </motion.p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate('/')}
                        className="px-8 py-3 bg-gradient-to-r from-primary to-accent text-white font-bold rounded-lg shadow-lg shadow-primary/25 flex items-center gap-2 hover:shadow-primary/40 transition-all border border-white/10"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Return to Base
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.05)" }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate('/docs')}
                        className="px-8 py-3 bg-transparent text-white font-semibold rounded-lg border border-white/20 flex items-center gap-2 hover:bg-white/5 transition-all"
                    >
                        <Search className="w-5 h-5" />
                        Consult Star Charts
                    </motion.button>
                </div>
            </motion.div>

            <div className="absolute bottom-8 text-white/20 text-sm">
                Cloudiverse Navigation System v2.0
            </div>
        </div>
    );
};

export default NotFound;
