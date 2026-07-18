import { cva } from "class-variance-authority";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold ring-offset-background transition-[color,background-color,border-color,transform] duration-150 ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:active:scale-100 [&_svg]:pointer-events-none [&_svg]:size-[18px] [&_svg]:shrink-0 [&_svg]:stroke-[1.75]",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80",
        primary:
          "bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80",
        secondary:
          "border border-primary bg-card text-primary hover:bg-primary/10 active:bg-primary/15",
        edit:
          "border border-semantic-warning bg-card text-semantic-warning hover:bg-semantic-warning-background active:bg-semantic-warning-background/80",
        delete:
          "border border-semantic-danger bg-card text-semantic-danger hover:bg-semantic-danger-background active:bg-semantic-danger-background/80",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-card hover:border-primary/30 hover:bg-accent hover:text-accent-foreground",
        ghost:
          "hover:bg-accent hover:text-accent-foreground active:bg-accent/80",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4",
        sm: "h-9 px-3",
        lg: "h-10 px-5",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export { buttonVariants };
