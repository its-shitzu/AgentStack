import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export interface DataTableColumn<T> {
  header: string;
  cell: (row: T) => React.ReactNode;
}

/**
 * Generic read-only table used by every CRUD resource page generated with
 * the add-crud-feature skill. Pass a row shape and a list of columns; for
 * actions (edit/delete), append a column whose cell renders buttons.
 */
export function DataTable<T extends { id: string }>({
  columns,
  rows,
  emptyMessage = "No results.",
}: {
  columns: DataTableColumn<T>[];
  rows: T[];
  emptyMessage?: string;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((column) => (
            <TableHead key={column.header}>{column.header}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.length === 0 ? (
          <TableRow>
            <TableCell colSpan={columns.length} className="text-center text-neutral-500">
              {emptyMessage}
            </TableCell>
          </TableRow>
        ) : (
          rows.map((row) => (
            <TableRow key={row.id}>
              {columns.map((column) => (
                <TableCell key={column.header}>{column.cell(row)}</TableCell>
              ))}
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
