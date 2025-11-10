import * as React from "react"
import { cn } from "../../lib/utils.js"

const DialogRoot = ({ open, onOpenChange, children }) => {
    React.useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === "Escape" && open) {
                onOpenChange?.(false)
            }
        }

        if (open) {
            document.addEventListener("keydown", handleEscape)
            document.body.style.overflow = "hidden"
        }

        return () => {
            document.removeEventListener("keydown", handleEscape)
            document.body.style.overflow = "unset"
        }
    }, [open, onOpenChange])

    if (!open) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {children}
        </div>
    )
}

const Dialog = ({ open, onOpenChange, children }) => {
    return <DialogRoot open={open} onOpenChange={onOpenChange}>{children}</DialogRoot>
}
Dialog.displayName = "Dialog"

const DialogTrigger = React.forwardRef(({ className, ...props }, ref) => {
    return <div ref={ref} className={cn(className)} {...props} />
})
DialogTrigger.displayName = "DialogTrigger"

const DialogPortal = ({ children }) => {
    return <>{children}</>
}

const DialogOverlay = React.forwardRef(({ className, ...props }, ref) => {
    return (
        <div
            ref={ref}
            className={cn(
                "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
                className
            )}
            {...props}
        />
    )
})
DialogOverlay.displayName = "DialogOverlay"

const DialogContent = React.forwardRef(
    ({ className, children, onInteractOutside, ...props }, ref) => {
        const handleOverlayClick = (e) => {
            if (e.target === e.currentTarget) {
                onInteractOutside?.(e)
            }
        }

        return (
            <DialogPortal>
                <DialogOverlay onClick={handleOverlayClick} />
                <div
                    ref={ref}
                    className={cn(
                        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
                        "max-w-6xl max-h-[90vh] flex flex-col",
                        className
                    )}
                    {...props}
                >
                    {children}
                </div>
            </DialogPortal>
        )
    }
)
DialogContent.displayName = "DialogContent"

const DialogHeader = ({ className, ...props }) => {
    return (
        <div
            className={cn(
                "flex flex-col space-y-1.5 text-center sm:text-left",
                className
            )}
            {...props}
        />
    )
}
DialogHeader.displayName = "DialogHeader"

const DialogFooter = ({ className, ...props }) => {
    return (
        <div
            className={cn(
                "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
                className
            )}
            {...props}
        />
    )
}
DialogFooter.displayName = "DialogFooter"

const DialogTitle = React.forwardRef(({ className, ...props }, ref) => {
    return (
        <h2
            ref={ref}
            className={cn(
                "text-lg font-semibold leading-none tracking-tight",
                className
            )}
            {...props}
        />
    )
})
DialogTitle.displayName = "DialogTitle"

const DialogDescription = React.forwardRef(({ className, ...props }, ref) => {
    return (
        <p
            ref={ref}
            className={cn("text-sm text-muted-foreground", className)}
            {...props}
        />
    )
})
DialogDescription.displayName = "DialogDescription"

const DialogClose = React.forwardRef(({ className, onClick, ...props }, ref) => {
    const handleClick = (e) => {
        if (onClick) {
            onClick(e)
        }
    }

    return (
        <button
            ref={ref}
            type="button"
            className={cn(
                "rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none p-2",
                className
            )}
            onClick={handleClick}
            {...props}
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
            >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
            <span className="sr-only">Close</span>
        </button>
    )
})
DialogClose.displayName = "DialogClose"

export {
    Dialog,
    DialogPortal,
    DialogOverlay,
    DialogTrigger,
    DialogClose,
    DialogContent,
    DialogHeader,
    DialogFooter,
    DialogTitle,
    DialogDescription,
}

