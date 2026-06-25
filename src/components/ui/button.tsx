import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  // Base commune — transition fluide, focus accessible, tap feedback mobile
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold",
    "rounded-xl select-none cursor-pointer",
    "transition-[transform,box-shadow,opacity,background-color,border-color,color,filter] duration-200 ease-out",
    // Focus WCAG AA — anneau visible sur tous les fonds
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    // Tap feedback tactile (iOS, Android)
    "active:scale-[0.97] active:brightness-95",
    // Désactivé
    "disabled:pointer-events-none disabled:opacity-40 disabled:shadow-none",
    // Icônes SVG inside
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
  ].join(" "),
  {
    variants: {
      variant: {
        // ── Primary — Gradient orange vibrant, ombre colorée, lift au hover ──
        default: [
          "bg-gradient-to-r from-primary to-orange-400 text-primary-foreground",
          "shadow-[0_2px_10px_hsl(var(--primary)/0.35),0_1px_3px_hsl(var(--primary)/0.25)]",
          "hover:shadow-[0_4px_18px_hsl(var(--primary)/0.50),0_2px_6px_hsl(var(--primary)/0.30)]",
          "hover:-translate-y-[1px] hover:from-primary hover:to-orange-300",
        ].join(" "),

        // ── Destructive — Rouge clair, shadow rouge ──────────────────────────
        destructive: [
          "bg-destructive text-destructive-foreground",
          "shadow-[0_2px_8px_hsl(0_84%_60%/0.30)]",
          "hover:shadow-[0_4px_14px_hsl(0_84%_60%/0.45)] hover:-translate-y-[1px] hover:bg-destructive/90",
        ].join(" "),

        // ── Outline — Bordure visible, fond transparent, lift coloré au hover ─
        outline: [
          "border-2 border-primary/40 bg-background text-foreground",
          "shadow-[0_1px_4px_hsl(var(--border)/0.5)]",
          "hover:border-primary hover:bg-primary/10 hover:text-primary",
          "hover:shadow-[0_3px_12px_hsl(var(--primary)/0.18)] hover:-translate-y-[1px]",
        ].join(" "),

        // ── Secondary — Surface neutre, lift discret ────────────────────────
        secondary: [
          "bg-secondary text-secondary-foreground border border-border/60",
          "shadow-[0_1px_3px_hsl(var(--foreground)/0.07)]",
          "hover:bg-secondary/70 hover:shadow-[0_3px_10px_hsl(var(--foreground)/0.12)]",
          "hover:-translate-y-[1px]",
        ].join(" "),

        // ── Ghost — Très discret, fond coloré au hover ──────────────────────
        ghost: [
          "hover:bg-accent/80 hover:text-accent-foreground",
          "active:bg-accent/60",
        ].join(" "),

        // ── Link — Texte avec soulignement animé ────────────────────────────
        link: "text-primary underline-offset-4 hover:underline active:opacity-70",
      },
      size: {
        // Taille défaut — 44px min pour touch (WCAG 2.5.5)
        default: "h-10 min-h-[48px] px-5 py-2 text-sm [&_svg]:size-4",
        sm:      "h-9  min-h-[48px] px-4 py-1.5 text-xs rounded-lg [&_svg]:size-3.5",
        lg:      "h-12 min-h-[48px] px-8 py-3 text-base [&_svg]:size-5",
        xl:      "h-14 min-h-[56px] px-10 py-4 text-lg font-bold [&_svg]:size-5",
        // Icône — carré tactile 44px
        icon:    "h-10 w-10 min-h-[48px] min-w-[44px] [&_svg]:size-4",
        "icon-sm": "h-9 w-9 min-h-[40px] min-w-[40px] [&_svg]:size-3.5 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
