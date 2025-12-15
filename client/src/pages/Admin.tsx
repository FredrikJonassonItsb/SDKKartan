import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogOut, Settings, History, Database, RefreshCw, FileDown, TrendingUp } from "lucide-react";
import { toast } from "sonner";

import MunicipalitiesTab from "@/components/admin/MunicipalitiesTab";
import RegionsTab from "@/components/admin/RegionsTab";
import AuthoritiesTab from "@/components/admin/AuthoritiesTab";
import OthersTab from "@/components/admin/OthersTab";
import SettingsTab from "@/components/admin/SettingsTab";
import HistoryTab from "@/components/admin/HistoryTab";
import DiggSyncTab from "@/components/admin/DiggSyncTab";
import IntelligentDiggSyncTab from "@/components/admin/IntelligentDiggSyncTab";
import ImportExportTab from "@/components/admin/ImportExportTab";
import ChangeReportsTab from "@/components/admin/ChangeReportsTab";

export default function Admin() {
  const [, navigate] = useLocation();
  const { data: user, isLoading } = trpc.auth.me.useQuery();
  const logoutMutation = trpc.auth.logout.useMutation();

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "admin")) {
      toast.error("Åtkomst nekad. Endast administratörer har tillgång till denna sida.");
      navigate("/");
    }
  }, [user, isLoading, navigate]);

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      toast.success("Utloggad");
      navigate("/");
    } catch (error) {
      toast.error("Kunde inte logga ut");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Laddar...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">ITSL HubS Kunder - Admin</h1>
            <p className="text-sm text-muted-foreground">Hantera kommuner, regioner och organisationer</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Inloggad som: <strong>{user.name || user.email || "Admin"}</strong>
            </span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logga ut
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <Tabs defaultValue="municipalities" className="space-y-6">
          <TabsList className="grid w-full grid-cols-9">
            <TabsTrigger value="municipalities">
              <Database className="w-4 h-4 mr-2" />
              Kommuner
            </TabsTrigger>
            <TabsTrigger value="regions">
              <Database className="w-4 h-4 mr-2" />
              Regioner
            </TabsTrigger>
            <TabsTrigger value="authorities">
              <Database className="w-4 h-4 mr-2" />
              Myndigheter
            </TabsTrigger>
            <TabsTrigger value="others">
              <Database className="w-4 h-4 mr-2" />
              Övriga
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="w-4 h-4 mr-2" />
              Inställningar
            </TabsTrigger>
            <TabsTrigger value="history">
              <History className="w-4 h-4 mr-2" />
              Historik
            </TabsTrigger>
            <TabsTrigger value="digg">
              <RefreshCw className="w-4 h-4 mr-2" />
              DIGG-synk
            </TabsTrigger>
            <TabsTrigger value="import-export">
              <FileDown className="w-4 h-4 mr-2" />
              Import/Export
            </TabsTrigger>
            <TabsTrigger value="change-reports">
              <TrendingUp className="w-4 h-4 mr-2" />
              Ändringsrapporter
            </TabsTrigger>
          </TabsList>

          <TabsContent value="municipalities">
            <MunicipalitiesTab />
          </TabsContent>

          <TabsContent value="regions">
            <RegionsTab />
          </TabsContent>

          <TabsContent value="authorities">
            <AuthoritiesTab />
          </TabsContent>

          <TabsContent value="others">
            <OthersTab />
          </TabsContent>

          <TabsContent value="settings">
            <SettingsTab />
          </TabsContent>

          <TabsContent value="history">
            <HistoryTab />
          </TabsContent>

          <TabsContent value="digg">
            <IntelligentDiggSyncTab />
          </TabsContent>

          <TabsContent value="import-export">
            <ImportExportTab />
          </TabsContent>

          <TabsContent value="change-reports">
            <ChangeReportsTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
