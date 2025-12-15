import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import EntityDialog from "./EntityDialog";

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

export default function OthersTab() {
  const { data: allOrgs, isLoading, refetch } = trpc.admin.getOrganizations.useQuery();
  const deleteMutation = trpc.admin.deleteOrganization.useMutation();
  const updateMutation = trpc.admin.updateOrganization.useMutation();
  const createMutation = trpc.admin.createOrganization.useMutation();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEntity, setEditingEntity] = useState<any | null>(null);

  const others = allOrgs?.filter((org) => org.type === "other") || [];

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Är du säker på att du vill ta bort ${name}?`)) return;
    
    try {
      await deleteMutation.mutateAsync({ id });
      toast.success(`${name} har tagits bort`);
      refetch();
    } catch (error) {
      toast.error("Kunde inte ta bort organisationen");
    }
  };

  const handleEdit = (org: any) => {
    setEditingEntity(org);
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
          type: data.type,
          latitude: data.latitude,
          longitude: data.longitude,
        });
        toast.success("Organisationen har uppdaterats");
      } else {
        await createMutation.mutateAsync({
          name: data.name,
          status: data.status,
          type: data.type,
          latitude: data.latitude,
          longitude: data.longitude,
        });
        toast.success("Organisationen har skapats");
      }
      refetch();
    } catch (error) {
      toast.error(editingEntity ? "Kunde inte uppdatera organisationen" : "Kunde inte skapa organisationen");
      throw error;
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Laddar...</div>;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Övriga organisationer</CardTitle>
              <CardDescription>
                {others.length} övriga organisationer i databasen
              </CardDescription>
            </div>
            <Button onClick={handleCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Skapa ny
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Namn</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Koordinater</TableHead>
                  <TableHead className="text-right">Åtgärder</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {others.map((org) => (
                  <TableRow key={org.id}>
                    <TableCell className="font-mono text-sm">{org.id}</TableCell>
                    <TableCell className="font-medium">{org.name}</TableCell>
                    <TableCell>
                      <Badge className={statusColors[org.status as keyof typeof statusColors]}>
                        {statusLabels[org.status as keyof typeof statusLabels]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {Number(org.latitude)?.toFixed(4)}, {Number(org.longitude)?.toFixed(4)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="mr-2" onClick={() => handleEdit(org)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDelete(org.id, org.name)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <EntityDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        entity={editingEntity}
        entityType="organization"
        onSave={handleSave}
      />
    </>
  );
}
