import React, { useState } from 'react'
import { Sidebar } from './Sidebar'
import { Header } from './Header'

export default function MainLayout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false)

    return (
        <div className="min-h-screen bg-background text-white selection:bg-primary/30">
            <Sidebar />
            <div className="lg:pl-72">
                <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
                <main className="py-10">
                    <div className="px-4 sm:px-6 lg:px-8 max-w-[1920px] mx-auto animate-in fade-in duration-500">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}
