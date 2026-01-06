import * as React from "react"
import { Slot } from "@radix-ui/react-slot" // Need to check if I can use this or just standard
import { cva, type VariantProps } from "class-variance-authority" // I don't have these installed yet.
import { cn } from "@/lib/utils"

// I didn't install class-variance-authority or radix-ui slot. I should stick to simple props or install them.
// The plan said "Basic reusable components". I'll stick to simple standard React components to avoid extra installs unless user asked.
// But "Design Aesthetics" says "Use a Dynamic Design".
// I'll make a nice looking button with tailwind directly.

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "default" | "outline" | "ghost" | "link";
    size?: "default" | "sm" | "lg";
    isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "default", size = "default", isLoading, children, ...props }, ref) => {
        const baseStyles = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background";

        const variants = {
            default: "bg-blue-600 text-white hover:bg-blue-700",
            outline: "border border-input hover:bg-accent hover:text-accent-foreground",
            ghost: "hover:bg-gray-100 hover:text-gray-900",
            link: "underline-offset-4 hover:underline text-primary",
        };

        const sizes = {
            default: "h-10 py-2 px-4",
            sm: "h-9 px-3 rounded-md",
            lg: "h-11 px-8 rounded-md",
        };

        return (
            <button
                className={cn(baseStyles, variants[variant], sizes[size], className)}
                ref={ref}
                disabled={isLoading || props.disabled}
                {...props}
            >
                {isLoading && <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />}
                {children}
            </button>
        )
    }
)
Button.displayName = "Button"

export { Button }
