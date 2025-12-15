import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: ReactNode;
  sidebar: ReactNode;
  className?: string;
}

export function Layout({ children, sidebar, className }: LayoutProps) {
  return (
    <div className={cn("flex h-screen w-full overflow-hidden bg-background", className)}>
      {/* Sidebar - Desktop */}
      <aside className="hidden w-80 flex-col border-r bg-sidebar text-sidebar-foreground md:flex">
        {sidebar}
      </aside>

      {/* Main Content (Map) */}
      <main className="flex-1 relative">
        {children}
      </main>
    </div>
  );
}
