import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";
import { Loader2 } from "lucide-react";

export const buttonVariants = cva(
    "eq inline-block whitespace-nowrap rounded-md border px-2 md:px-3 py-1.5 md:py-2 text-center lg:text-[17px] disabled:cursor-default disabled:border-accent disabled:bg-gray disabled:text-black",
    {
        variants: {
            variant: {
                primary:
                    "bg-primary text-light border-primary hover:bg-primary/90 hover:border-primary/90",

                secondary:
                    "bg-yellow text-dark border-yellow hover:bg-yellow/90 hover:border-yellow/90",

                danger: "bg-red text-light border-red hover:bg-red/90 hover:border-red/90",

                accent: "bg-orange text-light border-orange hover:bg-orange/90 hover:border-orange/90",

                info: "bg-blue text-light border-blue hover:bg-blue/90 hover:border-blue/90",

                ocean: "bg-dark text-light border-dark hover:bg-dark/90 hover:border-dark/90 ",

                outline:
                    "bg-transparent text-dark border-dark hover:bg-dark hover:text-light",
            },
            size: {
                auto: "w-auto",
                full: "w-full",
            },
        },
        defaultVariants: {
            variant: "danger",
            size: "auto",
        },
    }
);

const Button = ({
    onClick,
    type,
    disabled,
    children,
    variant,
    size,
    isLoading,
    ...props
}) => {
    return (
        <button
            onClick={onClick}
            type={type}
            disabled={disabled || isLoading}
            {...props}
            className={cn(
                buttonVariants({ variant, size }),
                isLoading && "flex items-center justify-center gap-2.5"
            )}
        >
            {isLoading && <Loader2 size={20} className="animate-spin" />}
            {children}
        </button>
    );
};

export default Button;
