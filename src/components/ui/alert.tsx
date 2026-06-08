"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { motion } from "framer-motion";
import { Info, CheckCircle2, AlertTriangle, XCircle, X } from "lucide-react";

import { cn } from "@/lib/utils";

const alertVariants = cva(
  "relative w-full overflow-hidden rounded-2xl p-4 backdrop-blur-xl shadow-2xl flex items-start gap-3",
  {
    variants: {
      variant: {
        information:
          "bg-gradient-to-br from-sky-500/25 via-blue-500/15 to-indigo-500/25 text-sky-50 outline outline-1 outline-sky-300/30",
        success:
          "bg-gradient-to-br from-emerald-500/25 via-green-500/15 to-teal-500/25 text-emerald-50 outline outline-1 outline-emerald-300/30",
        warning:
          "bg-gradient-to-br from-amber-500/25 via-orange-500/15 to-yellow-500/25 text-amber-50 outline outline-1 outline-amber-300/30",
        destructive:
          "bg-gradient-to-br from-red-500/25 via-rose-500/15 to-pink-500/25 text-red-50 outline outline-1 outline-red-300/30",
      },
    },
    defaultVariants: {
      variant: "information",
    },
  }
);

const ICON_MAP = {
  information: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  destructive: XCircle,
} as const;

export interface GradientAlertProps
  extends VariantProps<typeof alertVariants> {
  className?: string;
  title?: string;
  description?: string;
  onClose?: () => void;
  children?: React.ReactNode;
}

export function GradientAlert({
  className,
  variant = "information",
  title,
  description,
  onClose,
  children,
}: GradientAlertProps) {
  const Icon = ICON_MAP[variant ?? "information"];

  return (
    <motion.div
      role="alert"
      initial={{ opacity: 0, y: -10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.98 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={cn(alertVariants({ variant }), className)}
    >
      <Icon className="size-5 shrink-0 mt-0.5" aria-hidden="true" />
      <div className="flex-1 min-w-0">
        {title && <div className="font-semibold leading-tight">{title}</div>}
        {description && (
          <div className="text-sm opacity-90 mt-0.5">{description}</div>
        )}
        {children}
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss alert"
          className="shrink-0 rounded-md p-1 text-current/70 hover:text-current hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="size-4" />
        </button>
      )}
    </motion.div>
  );
}
