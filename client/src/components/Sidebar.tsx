import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface SidebarProps {
  title?: string;
  stats?: React.ReactNode;
  filters?: React.ReactNode;
  legend?: React.ReactNode;
  onSearch?: (term: string) => void;
}

export function Sidebar({ title = "ITSL HubS Kunder", stats, filters, legend, onSearch }: SidebarProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="p-6">
        <h1 className="text-xl font-bold tracking-tight text-primary">{title}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Översikt över anslutna kommuner och organisationer.
        </p>
        
        <div className="relative mt-4">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Sök kommun eller organisation..."
            className="pl-8"
            onChange={(e) => onSearch?.(e.target.value)}
          />
        </div>
      </div>
      
      <Separator />
      
      <ScrollArea className="flex-1 px-6 py-4">
        <div className="space-y-8">
          {stats && (
            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Statistik
              </h2>
              {stats}
            </section>
          )}

          {filters && (
            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Filtrering
              </h2>
              {filters}
            </section>
          )}

          {legend && (
            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Teckenförklaring
              </h2>
              {legend}
            </section>
          )}
        </div>
      </ScrollArea>
      
      <div className="p-4 border-t bg-sidebar-accent/50 text-xs text-center text-muted-foreground">
        Senast uppdaterad: {new Date().toLocaleDateString('sv-SE')}
      </div>
    </div>
  );
}
