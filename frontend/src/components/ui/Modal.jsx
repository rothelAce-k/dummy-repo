import React from 'react'
import { cn } from '../utils'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './Card'
import { Button } from './Button'
import { X } from 'lucide-react'

export function Modal({ isOpen, onClose, title, children, footer }) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/50 animate-in fade-in duration-200">
            <div className="absolute inset-0" onClick={onClose} />
            <Card className="z-50 w-full max-w-lg border-gray-700 bg-background-secondary shadow-2xl animate-in zoom-in-95 duration-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    {title && <CardTitle>{title}</CardTitle>}
                    <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-full">
                        <X className="h-4 w-4" />
                    </Button>
                </CardHeader>
                <CardContent className="py-4">
                    {children}
                </CardContent>
                {footer && (
                    <CardFooter className="flex justify-end space-x-2 pt-2">
                        {footer}
                    </CardFooter>
                )}
            </Card>
        </div>
    )
}
