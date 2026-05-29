import { useState } from "react";
import { Download, Trash2, Eye, Search, ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import { useDocuments, useDeleteDocument, useDownloadDocument } from "@/hooks/useDocuments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/StatusBadge";
import { DocumentMetadataDialog } from "@/components/DocumentMetadataDialog";
import { Document } from "@/types";
import { formatFileSize, formatDate } from "@/utils/format";
import { useDebounce } from "@/hooks/useDebounce";

export function DashboardPage() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [sortBy, setSortBy] = useState("uploadedAt");
  const [sortDir, setSortDir] = useState("desc");
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);

  const debouncedSearch = useDebounce(search, 400);
  const { data, isLoading, isError } = useDocuments({ page, size: 10, search: debouncedSearch, status, sortBy, sortDir });
  const deleteMutation = useDeleteDocument();
  const downloadMutation = useDownloadDocument();

  const toggleSort = (col: string) => {
    if (sortBy === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortBy(col); setSortDir("asc"); }
    setPage(0);
  };

  const SortIcon = ({ col }: { col: string }) => {
    if (sortBy !== col) return <ChevronsUpDown className="h-3.5 w-3.5 opacity-40" />;
    return sortDir === "asc" ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Documents</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage and view all uploaded documents</p>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by filename..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                className="pl-8"
              />
            </div>
            <Select value={status || "all"} onValueChange={(v) => { setStatus(v === "all" ? "" : v); setPage(0); }}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="PROCESSING">Processing</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="FAILED">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : isError ? (
            <div className="p-8 text-center text-muted-foreground">
              Failed to load documents. Please try again.
            </div>
          ) : !data?.content.length ? (
            <div className="p-12 text-center">
              <p className="text-muted-foreground">No documents found</p>
              <p className="text-sm text-muted-foreground mt-1">Upload some PDFs to get started</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    {[
                      { key: "originalFileName", label: "File Name" },
                      { key: "fileSize", label: "Size" },
                      { key: "uploadedAt", label: "Uploaded" },
                      { key: "uploadStatus", label: "Status" },
                    ].map((col) => (
                      <th
                        key={col.key}
                        className="px-4 py-3 text-left font-medium text-muted-foreground cursor-pointer hover:text-foreground select-none"
                        onClick={() => toggleSort(col.key)}
                      >
                        <div className="flex items-center gap-1">
                          {col.label}
                          <SortIcon col={col.key} />
                        </div>
                      </th>
                    ))}
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.content.map((doc) => (
                    <tr key={doc.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-medium max-w-[200px] truncate">{doc.originalFileName}</td>
                      <td className="px-4 py-3 text-muted-foreground">{formatFileSize(doc.fileSize)}</td>
                      <td className="px-4 py-3 text-muted-foreground">{formatDate(doc.uploadedAt)}</td>
                      <td className="px-4 py-3"><StatusBadge status={doc.uploadStatus} /></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedDoc(doc)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost" size="icon" className="h-8 w-8"
                            disabled={doc.uploadStatus !== "COMPLETED"}
                            onClick={() => downloadMutation.mutate({ id: doc.id, fileName: doc.originalFileName })}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => deleteMutation.mutate(doc.id)}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {data && data.totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <p className="text-sm text-muted-foreground">
                Showing {page * 10 + 1}–{Math.min((page + 1) * 10, data.totalElements)} of {data.totalElements}
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
                  Previous
                </Button>
                <Button variant="outline" size="sm" disabled={data.last} onClick={() => setPage((p) => p + 1)}>
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <DocumentMetadataDialog document={selectedDoc} open={!!selectedDoc} onClose={() => setSelectedDoc(null)} />
    </div>
  );
}
