import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { DataTable } from "./DataTable";
import EntityDialog from "./EntityDialog";
import { Badge } from "@/components/ui/badge";

const statusColors = {
  none: "bg-gray-200 text-gray-800",
  started: "bg-yellow-200 text-yellow-900",
  qa: "bg-orange-200 text-orange-900",
  connected: "bg-green-200 text-green-900",
  hubs: "bg-emerald-700 text-white",
};

const statusLabels = {
  none: "Ej ansluten",
  started: "Påbörjat",
  qa: "QA-miljö",
  connected: "Ansluten (Prod)",
  hubs: "Hubs",
};

export default function MunicipalitiesTab() {
  const { data: municipalities, isLoading, refetch } = trpc.admin.getMunicipalities.useQuery();
  const deleteMutation = trpc.admin.deleteMunicipality.useMutation();
  const updateMutation = trpc.admin.updateMunicipality.useMutation();
  const createMutation = trpc.admin.createMunicipality.useMutation();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEntity, setEditingEntity] = useState<any | null>(null);

  const handleDelete = async (item: any) => {
    if (!confirm(`Är du säker på att du vill ta bort ${item.name}?`)) return;
    
    try {
      await deleteMutation.mutateAsync({ id: item.id });
      toast.success(`${item.name} har tagits bort`);
      refetch();
    } catch (error) {
      toast.error("Kunde inte ta bort kommunen");
    }
  };

  const handleEdit = (municipality: any) => {
    setEditingEntity(municipality);
    setDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingEntity(null);
    setDialogOpen(true);
  };

  const handleSave = async (data: any) => {
    try {
      if (editingEntity) {
        await updateMutation.mutateAsync({
          id: editingEntity.id,
          name: data.name,
          status: data.status,
        });
        toast.success("Kommunen har uppdaterats");
      } else {
        await createMutation.mutateAsync({
          name: data.name,
          status: data.status,
        });
        toast.success("Kommunen har skapats");
      }
      refetch();
      setDialogOpen(false);
      setEditingEntity(null);
    } catch (error) {
      toast.error(editingEntity ? "Kunde inte uppdatera kommunen" : "Kunde inte skapa kommunen");
      throw error;
    }
  };

  const statusOptions = [
    { value: "none", label: "Ej ansluten" },
    { value: "started", label: "Påbörjat" },
    { value: "qa", label: "QA-miljö" },
    { value: "connected", label: "Ansluten (Prod)" },
    { value: "hubs", label: "Hubs" },
  ];

  const columns = [
    {
      key: "id",
      label: "ID",
      sortable: true,
      render: (item: any) => <span className="font-mono text-sm">{item.id}</span>,
    },
    {
      key: "name",
      label: "Namn",
      sortable: true,
      render: (item: any) => <span className="font-medium">{item.name}</span>,
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      filterable: true,
      filterType: "select" as const,
      filterOptions: statusOptions,
      render: (item: any) => (
        <Badge className={statusColors[item.status as keyof typeof statusColors]}>
          {statusLabels[item.status as keyof typeof statusLabels]}
        </Badge>
      ),
    },
  ];

  if (isLoading) {
    return <div className="text-center py-8">Laddar...</div>;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Kommuner</CardTitle>
              <CardDescription>
                {municipalities?.length || 0} kommuner i databasen
              </CardDescription>
            </div>
            <Button onClick={handleCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Skapa ny
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            data={municipalities || []}
            columns={columns}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>

      <EntityDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        entity={editingEntity}
        entityType="municipality"
        onSave={handleSave}
      />
    </>
  );
}
