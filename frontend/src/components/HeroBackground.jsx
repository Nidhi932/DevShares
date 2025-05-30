import { motion } from 'framer-motion';

function HeroBackground() {
    return (
        <div className="absolute inset-0 -z-10 overflow-hidden">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.2 }}
                transition={{ duration: 1 }}
                className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-transparent to-blue-500/20"
            />
            <motion.img
                initial={{ scale: 1.1, opacity: 0 }}
                animate={{ scale: 1, opacity: 0.05 }}
                transition={{ duration: 1 }}
                src="https://images.unsplash.com/photo-1550439062-609e1531270e?auto=format&fit=crop&q=80"
                alt="Background Pattern"
                className="absolute inset-0 w-full h-full object-cover"
            />
        </div>
    );
}

export default HeroBackground; 