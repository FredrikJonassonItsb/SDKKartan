import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Download, Upload, FileJson, FileSpreadsheet } from "lucide-react";

export default function ImportExportTab() {
  const [exportType, setExportType] = useState<"municipalities" | "regions" | "organizations" | "all">("all");
  const [exportFormat, setExportFormat] = useState<"csv" | "json">("json");
  const [importType, setImportType] = useState<"municipalities" | "regions" | "organizations">("municipalities");
  const [importFormat, setImportFormat] = useState<"csv" | "json">("json");
  const [importData, setImportData] = useState("");
  const [importMode, setImportMode] = useState<"replace" | "merge">("merge");

  const exportMutation = trpc.admin.exportData.useQuery(
    { entityType: exportType, format: exportFormat },
    { enabled: false }
  );

  const importMutation = trpc.admin.importData.useMutation();

  const handleExport = async () => {
    try {
      const result = await exportMutation.refetch();
      if (result.data) {
        const blob = new Blob([result.data.data], { 
          type: result.data.format === "json" ? "application/json" : "text/csv" 
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = result.data.filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success("Data exporterad");
      }
    } catch (error: any) {
      toast.error("Export misslyckades: " + error.message);
    }
  };

  const handleImport = async () => {
    if (!importData.trim()) {
      toast.error("Ingen data att importera");
      return;
    }

    try {
      const result = await importMutation.mutateAsync({
        entityType: importType,
        data: importData,
        format: importFormat,
        mode: importMode,
      });
      toast.success(`Import lyckades: ${result.imported} rader importerade`);
      setImportData("");
    } catch (error: any) {
      toast.error("Import misslyckades: " + error.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Export Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Exportera Data
          </CardTitle>
          <CardDescription>
            Ladda ner data i CSV eller JSON-format
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Datatyp</Label>
              <Select value={exportType} onValueChange={(v: any) => setExportType(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Allt</SelectItem>
                  <SelectItem value="municipalities">Kommuner</SelectItem>
                  <SelectItem value="regions">Regioner</SelectItem>
                  <SelectItem value="organizations">Organisationer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Format</Label>
              <Select value={exportFormat} onValueChange={(v: any) => setExportFormat(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="json">
                    <div className="flex items-center gap-2">
                      <FileJson className="w-4 h-4" />
                      JSON
                    </div>
                  </SelectItem>
                  <SelectItem value="csv">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="w-4 h-4" />
                      CSV
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={handleExport} className="w-full">
            <Download className="w-4 h-4 mr-2" />
            Exportera
          </Button>
        </CardContent>
      </Card>

      {/* Import Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Importera Data
          </CardTitle>
          <CardDescription>
            Ladda upp data från CSV eller JSON-fil
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Datatyp</Label>
              <Select value={importType} onValueChange={(v: any) => setImportType(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="municipalities">Kommuner</SelectItem>
                  <SelectItem value="regions">Regioner</SelectItem>
                  <SelectItem value="organizations">Organisationer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Format</Label>
              <Select value={importFormat} onValueChange={(v: any) => setImportFormat(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Läge</Label>
              <Select value={importMode} onValueChange={(v: any) => setImportMode(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="merge">Sammanfoga</SelectItem>
                  <SelectItem value="replace">Ersätt allt</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Data (klistra in eller ladda upp)</Label>
            <Textarea
              placeholder={`Klistra in ${importFormat.toUpperCase()}-data här...`}
              value={importData}
              onChange={(e) => setImportData(e.target.value)}
              rows={10}
              className="font-mono text-sm"
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleImport} className="flex-1" disabled={importMutation.isPending}>
              <Upload className="w-4 h-4 mr-2" />
              {importMutation.isPending ? "Importerar..." : "Importera"}
            </Button>
            <Button variant="outline" onClick={() => setImportData("")}>
              Rensa
            </Button>
          </div>

          <div className="text-sm text-muted-foreground space-y-1">
            <p><strong>Sammanfoga:</strong> Uppdaterar befintliga poster och lägger till nya</p>
            <p><strong>Ersätt allt:</strong> Tar bort all befintlig data och ersätter med importerad data</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
