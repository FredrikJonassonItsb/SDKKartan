import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type EntityType = "municipality" | "region" | "organization";

interface EntityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entity: any | null;
  entityType: EntityType;
  onSave: (data: any) => Promise<void>;
}

const statusOptions = [
  { value: "none", label: "Ej ansluten" },
  { value: "started", label: "Påbörjat" },
  { value: "qa", label: "QA-miljö" },
  { value: "connected", label: "Ansluten (Prod)" },
  { value: "hubs", label: "Hubs" },
];

const orgTypeOptions = [
  { value: "authority", label: "Myndighet" },
  { value: "other", label: "Övrig organisation" },
];

export default function EntityDialog({
  open,
  onOpenChange,
  entity,
  entityType,
  onSave,
}: EntityDialogProps) {
  const [formData, setFormData] = useState<any>({
    name: "",
    status: "none",
    type: "authority",
    latitude: 0,
    longitude: 0,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (entity) {
      setFormData({
        name: entity.name || "",
        status: entity.status || "none",
        type: entity.type || "authority",
        latitude: entity.latitude || 0,
        longitude: entity.longitude || 0,
      });
    } else {
      setFormData({
        name: "",
        status: "none",
        type: "authority",
        latitude: 0,
        longitude: 0,
      });
    }
  }, [entity, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(formData);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to save:", error);
    } finally {
      setLoading(false);
    }
  };

  const isOrganization = entityType === "organization";
  const title = entity
    ? `Redigera ${entityType === "municipality" ? "kommun" : entityType === "region" ? "region" : "organisation"}`
    : `Skapa ny ${entityType === "municipality" ? "kommun" : entityType === "region" ? "region" : "organisation"}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>
              {entity ? "Uppdatera informationen nedan" : "Fyll i informationen för den nya posten"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Namn</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {isOrganization && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="type">Typ</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger id="type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {orgTypeOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="latitude">Latitud</Label>
                    <Input
                      id="latitude"
                      type="number"
                      step="0.000001"
                      value={formData.latitude}
                      onChange={(e) =>
                        setFormData({ ...formData, latitude: parseFloat(e.target.value) })
                      }
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="longitude">Longitud</Label>
                    <Input
                      id="longitude"
                      type="number"
                      step="0.000001"
                      value={formData.longitude}
                      onChange={(e) =>
                        setFormData({ ...formData, longitude: parseFloat(e.target.value) })
                      }
                      required
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Avbryt
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Sparar..." : entity ? "Uppdatera" : "Skapa"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
