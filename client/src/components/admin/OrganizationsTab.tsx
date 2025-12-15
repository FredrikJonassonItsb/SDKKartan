import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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

const typeLabels = {
  authority: "Myndighet",
  other: "Övrig organisation",
};

export default function OrganizationsTab() {
  const { data: organizations, isLoading } = trpc.admin.getOrganizations.useQuery();

  if (isLoading) {
    return <div className="text-center py-8">Laddar...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Organisationer</CardTitle>
        <CardDescription>
          {organizations?.length || 0} organisationer i databasen
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Namn</TableHead>
                <TableHead>Typ</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {organizations?.map((org) => (
                <TableRow key={org.id}>
                  <TableCell className="font-mono text-sm">{org.id}</TableCell>
                  <TableCell className="font-medium">{org.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {typeLabels[org.type as keyof typeof typeLabels]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[org.status as keyof typeof statusColors]}>
                      {statusLabels[org.status as keyof typeof statusLabels]}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
