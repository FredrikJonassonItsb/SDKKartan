import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useState, useEffect } from "react";

export default function SettingsTab() {
  const { data: settings, refetch } = trpc.admin.getSettings.useQuery();
  const updateMutation = trpc.admin.updateSetting.useMutation();
  const [autoUpdate, setAutoUpdate] = useState(false);

  useEffect(() => {
    const setting = settings?.find((s) => s.key === "auto_update_enabled");
    if (setting) {
      setAutoUpdate(setting.value === "true");
    }
  }, [settings]);

  const handleToggleAutoUpdate = async (checked: boolean) => {
    try {
      await updateMutation.mutateAsync({
        key: "auto_update_enabled",
        value: checked ? "true" : "false",
      });
      setAutoUpdate(checked);
      toast.success(checked ? "Automatisk uppdatering aktiverad" : "Automatisk uppdatering inaktiverad");
      refetch();
    } catch (error) {
      toast.error("Kunde inte uppdatera inställningen");
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Automatisk uppdatering</CardTitle>
          <CardDescription>
            Konfigurera automatisk synkronisering med DIGG:s hemsida
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-update">Aktivera automatisk uppdatering</Label>
              <p className="text-sm text-muted-foreground">
                Systemet kommer automatiskt att hämta ny data från DIGG dagligen
              </p>
            </div>
            <Switch
              id="auto-update"
              checked={autoUpdate}
              onCheckedChange={handleToggleAutoUpdate}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>DIGG-synkronisering</CardTitle>
          <CardDescription>
            Manuell synkronisering med DIGG:s hemsida
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => toast.info("DIGG-synkronisering kommer snart")}>
            Synkronisera nu
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
