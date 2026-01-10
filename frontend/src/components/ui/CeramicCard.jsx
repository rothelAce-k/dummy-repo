import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

export function CeramicCard({ children, className, spotlight = false, ...props }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }} // Subtle entry
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className={cn(
                "relative overflow-hidden arch-card", // Use new architectural utility
                spotlight && "hover:border-indigo-400/50", // Subtle border highlight on hover
                className
            )}
            {...props}
        >
            <div className="relative z-10 p-6 h-full flex flex-col">
                {children}
            </div>
        </motion.div>
    );
}
