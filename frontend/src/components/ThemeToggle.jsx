import { motion } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className={`
        relative flex items-center justify-center w-10 h-10 rounded-full
        transition-all duration-500 ease-out
        ${theme === 'dark' ? 'bg-white/10 text-yellow-300' : 'bg-slate-100 text-indigo-600'}
        hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary/50
        shadow-soft-lg
      `}
            aria-label="Toggle Theme"
        >
            <motion.div
                initial={false}
                animate={{
                    scale: theme === 'dark' ? 1 : 0,
                    rotate: theme === 'dark' ? 0 : 90,
                    opacity: theme === 'dark' ? 1 : 0,
                }}
                transition={{ duration: 0.2 }}
                className="absolute"
            >
                <Moon className="w-5 h-5" />
            </motion.div>

            <motion.div
                initial={false}
                animate={{
                    scale: theme === 'light' ? 1 : 0,
                    rotate: theme === 'light' ? 0 : -90,
                    opacity: theme === 'light' ? 1 : 0,
                }}
                transition={{ duration: 0.2 }}
                className="absolute"
            >
                <Sun className="w-5 h-5" />
            </motion.div>

            {/* Glow Effect */}
            {theme === 'light' && (
                <motion.div
                    layoutId="glow"
                    className="absolute inset-0 rounded-full bg-yellow-400 blur-xl opacity-20"
                />
            )}
        </button>
    );
}
