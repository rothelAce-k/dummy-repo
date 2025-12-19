import React from 'react'
import { Bell, User, Menu } from 'lucide-react'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { useAuth } from '../../contexts/AuthContext'
import { cn } from '../utils'

export function Header({ sidebarOpen, setSidebarOpen }) {
    const { user, logout } = useAuth()

    return (
        <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-800 bg-background/50 px-4 shadow-sm backdrop-blur-md sm:gap-x-6 sm:px-6 lg:px-8">
            <button
                type="button"
                className="-m-2.5 p-2.5 text-gray-400 lg:hidden"
                onClick={() => setSidebarOpen(true)}
            >
                <span className="sr-only">Open sidebar</span>
                <Menu className="h-6 w-6" aria-hidden="true" />
            </button>

            <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
                <form className="relative flex flex-1" action="#" method="GET">
                    {/* Search bar placeholder - can implement later */}
                </form>
                <div className="flex items-center gap-x-4 lg:gap-x-6">
                    <button type="button" className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-300 transition-colors">
                        <span className="sr-only">View notifications</span>
                        <div className="relative">
                            <Bell className="h-6 w-6" aria-hidden="true" />
                            <div className="absolute top-0 right-0 h-2 w-2 rounded-full bg-primary animate-pulse" />
                        </div>
                    </button>

                    <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-800" aria-hidden="true" />

                    <div className="relative">
                        <div className="flex items-center gap-x-4 lg:flex items-center">
                            <span className="hidden lg:flex lg:items-center">
                                <span className="ml-4 text-sm font-semibold leading-6 text-white" aria-hidden="true">
                                    {user?.username || 'Admin User'}
                                </span>
                                <Badge variant="success" className="ml-2 uppercase text-[10px]">PRO</Badge>
                            </span>
                            <Button variant="ghost" size="sm" onClick={logout} className="text-xs ml-4">
                                Logout
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    )
}
