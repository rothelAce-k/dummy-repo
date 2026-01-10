import React from 'react'
import { motion } from 'framer-motion'
import { Heart, Globe, Shield } from 'lucide-react'

export function Footer() {
    const year = new Date().getFullYear()

    return (
        <footer className="w-full py-2 mt-auto border-t border-slate-200/50 dark:border-slate-800/50 bg-white/30 dark:bg-slate-900/30 backdrop-blur-md transition-colors duration-300">
            <div className="px-4 sm:px-6 lg:px-8 max-w-[1920px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] font-medium text-slate-400 dark:text-slate-500">

                {/* Left: Copyright */}
                <div className="flex items-center gap-2 group cursor-default">
                    <span className="font-bold text-slate-700 dark:text-slate-300 transition-colors group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                        AIPIS
                    </span>
                    <span>© {year}</span>
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-700/50 hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors"
                    >
                        <Shield className="h-2.5 w-2.5 text-indigo-500/80" />
                        <span className="font-bold tracking-wide text-[9px]">JJP TECH</span>
                    </motion.div>
                    <span>All Rights Reserved</span>
                </div>

                {/* Right: Links/Status */}
                <div className="flex items-center gap-6 opacity-80 hover:opacity-100 transition-opacity">
                    <button className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1">
                        <Globe className="h-2.5 w-2.5" />
                        Global Infrastructure
                    </button>
                    <button className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                        Privacy Policy
                    </button>
                    <button className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                        Terms of Service
                    </button>
                </div>
            </div>
        </footer>
    )
}
