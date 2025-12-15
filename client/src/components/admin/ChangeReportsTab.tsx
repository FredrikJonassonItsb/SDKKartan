import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Search, Filter, TrendingUp, Plus, Edit, Trash2, FileDown, RefreshCw, Clock } from "lucide-react";

export default function ChangeReportsTab() {
  const [entityType, setEntityType] = useState<"all" | "municipality" | "region" | "organization">("all");
  const [changeType, setChangeType] = useState<"all" | "manual" | "automatic">("all");
  const [action, setAction] = useState<"all" | "create" | "update" | "delete" | "import" | "digg_sync">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [offset, setOffset] = useState(0);
  const limit = 50;

  const { data: historyData, isLoading, refetch } = trpc.changeReports.getChangeHistory.useQuery({
    entityType,
    changeType,
    action,
    searchQuery: searchQuery.trim() || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    limit,
    offset,
  });

  const { data: stats } = trpc.changeReports.getChangeStatistics.useQuery({
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  });

  const handleReset = () => {
    setEntityType("all");
    setChangeType("all");
    setAction("all");
    setSearchQuery("");
    setStartDate("");
    setEndDate("");
    setOffset(0);
  };

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case "create":
        return <Plus className="w-4 h-4" />;
      case "update":
        return <Edit className="w-4 h-4" />;
      case "delete":
        return <Trash2 className="w-4 h-4" />;
      case "import":
        return <FileDown className="w-4 h-4" />;
      case "digg_sync":
        return <RefreshCw className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getActionColor = (actionType: string) => {
    switch (actionType) {
      case "create":
        return "bg-green-500";
      case "update":
        return "bg-blue-500";
      case "delete":
        return "bg-red-500";
      case "import":
        return "bg-purple-500";
      case "digg_sync":
        return "bg-orange-500";
      default:
        return "bg-gray-500";
    }
  };

  const getActionLabel = (actionType: string) => {
    switch (actionType) {
      case "create":
        return "Skapad";
      case "update":
        return "Uppdaterad";
      case "delete":
        return "Raderad";
      case "import":
        return "Importerad";
      case "digg_sync":
        return "DIGG-synk";
      default:
        return actionType;
    }
  };

  const getEntityTypeLabel = (type: string) => {
    switch (type) {
      case "municipality":
        return "Kommun";
      case "region":
        return "Region";
      case "organization":
        return "Organisation";
      default:
        return type;
    }
  };

  const getStatusLabel = (status: string | null) => {
    if (!status) return "-";
    switch (status) {
      case "none":
        return "Ej ansluten";
      case "started":
        return "Påbörjat";
      case "qa":
        return "QA";
      case "connected":
        return "Ansluten";
      case "hubs":
        return "Hubs";
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Statistik */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Totalt antal ändringar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Manuella</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{stats.byChangeType.manual}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Automatiska</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats.byChangeType.automatic}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">DIGG-synk</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">{stats.byAction.digg_sync}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtrering */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtrering och sökning
          </CardTitle>
          <CardDescription>Filtrera ändringshistoriken efter typ, datum och sök efter specifika entiteter</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Entitetstyp</Label>
              <Select value={entityType} onValueChange={(value: any) => { setEntityType(value); setOffset(0); }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alla typer</SelectItem>
                  <SelectItem value="municipality">Kommuner</SelectItem>
                  <SelectItem value="region">Regioner</SelectItem>
                  <SelectItem value="organization">Organisationer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Ändringstyp</Label>
              <Select value={changeType} onValueChange={(value: any) => { setChangeType(value); setOffset(0); }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alla</SelectItem>
                  <SelectItem value="manual">Manuella</SelectItem>
                  <SelectItem value="automatic">Automatiska</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Åtgärd</Label>
              <Select value={action} onValueChange={(value: any) => { setAction(value); setOffset(0); }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alla åtgärder</SelectItem>
                  <SelectItem value="create">Skapad</SelectItem>
                  <SelectItem value="update">Uppdaterad</SelectItem>
                  <SelectItem value="delete">Raderad</SelectItem>
                  <SelectItem value="import">Importerad</SelectItem>
                  <SelectItem value="digg_sync">DIGG-synk</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Sök</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Sök efter namn..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setOffset(0); }}
                  className="pl-8"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Startdatum</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => { setStartDate(e.target.value); setOffset(0); }}
              />
            </div>

            <div className="space-y-2">
              <Label>Slutdatum</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => { setEndDate(e.target.value); setOffset(0); }}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={handleReset}>
              Återställ filter
            </Button>
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Uppdatera
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tidslinje */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Ändringshistorik
          </CardTitle>
          <CardDescription>
            {historyData ? `Visar ${historyData.changes.length} av ${historyData.total} ändringar` : "Laddar..."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Laddar ändringar...</div>
          ) : historyData && historyData.changes.length > 0 ? (
            <div className="space-y-4">
              {/* Tidslinje */}
              <div className="relative space-y-4">
                {/* Vertikal linje */}
                <div className="absolute left-[15px] top-0 bottom-0 w-0.5 bg-border" />

                {historyData.changes.map((change) => (
                  <div key={change.id} className="relative pl-10">
                    {/* Tidslinje-punkt */}
                    <div className={`absolute left-0 w-8 h-8 rounded-full ${getActionColor(change.action)} flex items-center justify-center text-white shadow-lg`}>
                      {getActionIcon(change.action)}
                    </div>

                    {/* Ändringsinfo */}
                    <Card>
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge variant="outline">{getEntityTypeLabel(change.entityType)}</Badge>
                              <Badge variant={change.changeType === "manual" ? "default" : "secondary"}>
                                {change.changeType === "manual" ? "Manuell" : "Automatisk"}
                              </Badge>
                              <Badge className={getActionColor(change.action) + " text-white"}>
                                {getActionLabel(change.action)}
                              </Badge>
                            </div>

                            <div>
                              <h3 className="font-semibold text-lg">{change.entityName}</h3>
                              {change.oldStatus && change.newStatus && (
                                <p className="text-sm text-muted-foreground">
                                  Status: <span className="font-medium">{getStatusLabel(change.oldStatus)}</span>
                                  {" → "}
                                  <span className="font-medium">{getStatusLabel(change.newStatus)}</span>
                                </p>
                              )}
                              {change.notes && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  <span className="font-medium">Notering:</span> {change.notes}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="text-right text-sm text-muted-foreground whitespace-nowrap">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(change.createdAt).toLocaleDateString("sv-SE")}
                            </div>
                            <div className="flex items-center gap-1 mt-1">
                              <Clock className="w-4 h-4" />
                              {new Date(change.createdAt).toLocaleTimeString("sv-SE", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>

              {/* Paginering */}
              {historyData.total > limit && (
                <div className="flex items-center justify-between pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setOffset(Math.max(0, offset - limit))}
                    disabled={offset === 0}
                  >
                    Föregående
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Sida {Math.floor(offset / limit) + 1} av {Math.ceil(historyData.total / limit)}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setOffset(offset + limit)}
                    disabled={!historyData.hasMore}
                  >
                    Nästa
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Inga ändringar hittades med de valda filtren
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
