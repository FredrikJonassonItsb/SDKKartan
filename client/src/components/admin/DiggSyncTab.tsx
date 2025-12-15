import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format } from "date-fns";
import { sv } from "date-fns/locale";
import { Loader2, RefreshCw, CheckCircle2, XCircle, AlertCircle } from "lucide-react";

export default function DiggSyncTab() {
  const [isSyncing, setIsSyncing] = useState(false);
  
  const { data: syncLogs, refetch: refetchLogs } = trpc.admin.getDiggSyncLogs.useQuery({ limit: 20 });
  const scrapeDiggMutation = trpc.admin.scrapeDigg.useMutation({
    onSuccess: (data) => {
      toast.success(`DIGG-synkronisering klar! ${data.updated} uppdaterade, ${data.created} skapade.`);
      refetchLogs();
      setIsSyncing(false);
    },
    onError: (error) => {
      toast.error(`Fel vid synkronisering: ${error.message}`);
      setIsSyncing(false);
    },
  });

  const handleSync = async () => {
    setIsSyncing(true);
    scrapeDiggMutation.mutate();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "partial":
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return <Badge variant="default" className="bg-green-600">Lyckades</Badge>;
      case "failed":
        return <Badge variant="destructive">Misslyckades</Badge>;
      case "partial":
        return <Badge variant="secondary" className="bg-yellow-600">Delvis</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>DIGG-synkronisering</CardTitle>
          <CardDescription>
            Hämta och uppdatera data från DIGG:s officiella listor över anslutna kommuner, regioner och organisationer.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleSync}
            disabled={isSyncing}
            className="w-full sm:w-auto"
          >
            {isSyncing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Synkroniserar...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Synkronisera nu
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Synkroniseringshistorik</CardTitle>
          <CardDescription>De senaste 20 synkroniseringarna</CardDescription>
        </CardHeader>
        <CardContent>
          {!syncLogs || syncLogs.length === 0 ? (
            <p className="text-muted-foreground text-sm">Ingen historik ännu.</p>
          ) : (
            <div className="space-y-3">
              {syncLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start justify-between border-b pb-3 last:border-0"
                >
                  <div className="flex items-start gap-3">
                    {getStatusIcon(log.status)}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {getStatusBadge(log.status)}
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(log.createdAt), "PPpp", { locale: sv })}
                        </span>
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Typ:</span>{" "}
                        {log.syncType === "manual" ? "Manuell" : "Schemalagd"}
                      </div>
                      {log.status === "success" && (
                        <div className="text-xs text-muted-foreground">
                          Kommuner: {log.municipalitiesUpdated || 0} | Regioner: {log.regionsUpdated || 0} | 
                          Myndigheter: {log.authoritiesUpdated || 0} | Övriga: {log.othersUpdated || 0}
                        </div>
                      )}
                      {log.errorMessage && (
                        <div className="text-xs text-red-600 mt-1">
                          Fel: {log.errorMessage}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
