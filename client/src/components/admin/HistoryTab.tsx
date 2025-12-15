import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { sv } from "date-fns/locale";

const actionColors = {
  create: "bg-blue-100 text-blue-800",
  update: "bg-yellow-100 text-yellow-800",
  delete: "bg-red-100 text-red-800",
};

const actionLabels = {
  create: "Skapad",
  update: "Uppdaterad",
  delete: "Borttagen",
};

export default function HistoryTab() {
  const { data: history, isLoading } = trpc.admin.getUpdateHistory.useQuery({ limit: 100 });

  if (isLoading) {
    return <div className="text-center py-8">Laddar...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Uppdateringshistorik</CardTitle>
        <CardDescription>
          Senaste {history?.length || 0} ändringarna i systemet
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tidpunkt</TableHead>
                <TableHead>Typ</TableHead>
                <TableHead>Namn</TableHead>
                <TableHead>Åtgärd</TableHead>
                <TableHead>Ändring</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history?.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true, locale: sv })}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{item.entityType}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">{item.entityName}</TableCell>
                  <TableCell>
                    <Badge className={actionColors[item.action as keyof typeof actionColors]}>
                      {actionLabels[item.action as keyof typeof actionLabels]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {item.oldStatus && item.newStatus && item.oldStatus !== item.newStatus
                      ? `${item.oldStatus} → ${item.newStatus}`
                      : item.newStatus || "-"}
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
