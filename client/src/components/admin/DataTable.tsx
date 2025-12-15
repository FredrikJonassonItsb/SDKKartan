import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Search } from "lucide-react";

interface Column<T> {
  key: keyof T | string;
  label: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  filterType?: "text" | "select";
  filterOptions?: { value: string; label: string }[];
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  actions?: (item: T) => React.ReactNode;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  onEdit,
  onDelete,
  actions,
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);

  const filteredAndSortedData = useMemo(() => {
    let result = [...data];

    // Apply search
    if (searchTerm) {
      result = result.filter((item) =>
        columns.some((col) => {
          const value = item[col.key as keyof T];
          return value?.toString().toLowerCase().includes(searchTerm.toLowerCase());
        })
      );
    }

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== "all") {
        result = result.filter((item) => item[key] === value);
      }
    });

    // Apply sorting
    if (sortConfig) {
      result.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        
        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [data, searchTerm, filters, sortConfig, columns]);

  const handleSort = (key: string) => {
    setSortConfig((current) => {
      if (!current || current.key !== key) {
        return { key, direction: "asc" };
      }
      if (current.direction === "asc") {
        return { key, direction: "desc" };
      }
      return null;
    });
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Sök..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {columns
          .filter((col) => col.filterable)
          .map((col) => (
            <Select
              key={col.key.toString()}
              value={filters[col.key.toString()] || "all"}
              onValueChange={(value) =>
                setFilters((prev) => ({ ...prev, [col.key.toString()]: value }))
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={`Filtrera ${col.label}`} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alla {col.label}</SelectItem>
                {col.filterOptions?.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ))}
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead key={col.key.toString()}>
                  {col.sortable ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="-ml-3 h-8"
                      onClick={() => handleSort(col.key.toString())}
                    >
                      {col.label}
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  ) : (
                    col.label
                  )}
                </TableHead>
              ))}
              {(onEdit || onDelete || actions) && <TableHead className="text-right">Åtgärder</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + 1} className="text-center text-muted-foreground py-8">
                  Inga resultat hittades
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortedData.map((item, idx) => (
                <TableRow key={idx}>
                  {columns.map((col) => (
                    <TableCell key={col.key.toString()}>
                      {col.render ? col.render(item) : item[col.key as keyof T]?.toString()}
                    </TableCell>
                  ))}
                  {(onEdit || onDelete || actions) && (
                    <TableCell className="text-right space-x-2">
                      {actions ? actions(item) : (
                        <>
                          {onEdit && (
                            <Button variant="outline" size="sm" onClick={() => onEdit(item)}>
                              Redigera
                            </Button>
                          )}
                          {onDelete && (
                            <Button variant="destructive" size="sm" onClick={() => onDelete(item)}>
                              Ta bort
                            </Button>
                          )}
                        </>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="text-sm text-muted-foreground">
        Visar {filteredAndSortedData.length} av {data.length} rader
      </div>
    </div>
  );
}
