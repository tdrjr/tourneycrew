import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "sport" | "category" | "success" | "warning";
  className?: string;
}

const variantStyles = {
  default:  "bg-gray-100 text-gray-700",
  sport:    "bg-brand-100 text-brand-700",
  category: "bg-purple-100 text-purple-700",
  success:  "bg-green-100 text-green-700",
  warning:  "bg-amber-100 text-amber-700",
};

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
