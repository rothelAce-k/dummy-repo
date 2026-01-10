import React, { useState } from 'react'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { Footer } from './Footer'
import { AnimatePresence, motion } from 'framer-motion'
import { useLocation } from 'react-router-dom'

export default function MainLayout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false) // Mobile state
    const [collapsed, setCollapsed] = useState(false) // Desktop state
    const location = useLocation()

    return (
        <div className="min-h-screen bg-background text-slate-900 dark:text-white selection:bg-primary/30 font-sans">
            <Sidebar
                collapsed={collapsed}
                setCollapsed={setCollapsed}
                mobileOpen={sidebarOpen}
                setMobileOpen={setSidebarOpen}
            />

            <div
                className={`flex flex-col min-h-screen transition-all duration-300 ease-in-out ${collapsed ? 'lg:pl-20' : 'lg:pl-72'}`}
            >
                <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
                <main className="flex-1 py-8">
                    <div className="px-4 sm:px-6 lg:px-8 max-w-[1920px] mx-auto">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={location.pathname}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3, ease: 'easeOut' }}
                            >
                                {children}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </main>
                <Footer />
            </div>
        </div>
    )
}
