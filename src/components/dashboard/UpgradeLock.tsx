import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";

interface UpgradeLockProps {
  title: string;
  description: string;
  requiredPlan: "Profesional" | "Centros";
  children: React.ReactNode;
  isLocked: boolean;
}

export function UpgradeLock({ title, description, requiredPlan, children, isLocked }: UpgradeLockProps) {
  if (!isLocked) {
    return <>{children}</>;
  }

  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-card">
      {/* Blurred out content */}
      <div className="opacity-20 blur-[2px] select-none pointer-events-none p-6">
        {children}
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/40 backdrop-blur-sm p-6 text-center">
        <div className="rounded-full bg-primary/10 p-4 text-primary mb-4">
          <Lock className="h-8 w-8" />
        </div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground mb-6 max-w-md">
          {description}
        </p>
        <Button asChild>
          <Link to="/dashboard/billing">
            Actualizar al Plan {requiredPlan}
          </Link>
        </Button>
      </div>
    </div>
  );
}
