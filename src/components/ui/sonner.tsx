"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      richColors
      position="top-center"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-xl group-[.toaster]:text-sm",
          title:
            "group-[.toast]:text-foreground group-[.toast]:font-semibold group-[.toast]:text-sm",
          description:
            "group-[.toast]:text-foreground group-[.toast]:text-xs group-[.toast]:mt-0.5",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          warning:
            "group-[.toaster]:bg-warning group-[.toaster]:text-warning-foreground group-[.toaster]:border-warning/40",
          error:
            "group-[.toaster]:bg-destructive group-[.toaster]:text-destructive-foreground group-[.toaster]:border-destructive/40",
          success:
            "group-[.toaster]:bg-success group-[.toaster]:text-success-foreground group-[.toaster]:border-success/40",
          info:
            "group-[.toaster]:bg-chart-1/10 group-[.toaster]:text-foreground group-[.toaster]:border-chart-1/30",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
