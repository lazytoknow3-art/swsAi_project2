import { useState } from "react";
import { Download, Trash2, Eye, Search, ChevronUp, ChevronDown, ChevronsUpDown, FileText, CheckCircle, Clock, AlertCircle, Files } from "lucide-react";
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

const statCards = (data: any) => [
  {
    label: "Total Documents",
    value: data?.totalElements ?? 0,
    icon: Files,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    label: "Completed",
    value: data?.content?.filter((d: Document) => d.uploadStatus === "COMPLETED").length ?? 0,
    icon: CheckCircle,
    color: "text-green-500",
    bg: "bg-green-500/10",
  },
  {
    label: "Processing",
    value: data?.content?.filter((d: Document) => d.uploadStatus === "PROCESSING" || d.uploadStatus === "PENDING").length ?? 0,
    icon: Clock,
    color: "text-yellow-500",
    bg: "bg-yellow-500/10",
  },
  {
    label: "Failed",
    value: data?.content?.filter((d: Document) => d.uploadStatus === "FAILED").length ?? 0,
    icon: AlertCircle,
    color: "text-red-500",
    bg: "bg-red-500/10",
  },
];

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
    if (sortBy !== col) return <ChevronsUpDown className="h-3.5 w-3.5 opacity-30" />;
    return sortDir === "asc" ? <ChevronUp className="h-3.5 w-3.5 text-primary" /> : <ChevronDown className="h-3.5 w-3.5 text-primary" />;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Documents</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Manage and view all uploaded documents</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards(data).map((stat) => (
          <Card key={stat.label} className="stat-card border-0 shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`h-10 w-10 rounded-xl ${stat.bg} flex items-center justify-center shrink-0`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold">{isLoading ? "—" : stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table card */}
      <Card className="border-0 shadow-sm overflow-hidden">
        <CardHeader className="pb-4 border-b bg-muted/30">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by filename..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                className="pl-9 bg-background"
              />
            </div>
            <Select value={status || "all"} onValueChange={(v) => { setStatus(v === "all" ? "" : v); setPage(0); }}>
              <SelectTrigger className="w-44 bg-background">
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
                <Skeleton key={i} className="h-14 w-full rounded-lg" />
              ))}
            </div>
          ) : isError ? (
            <div className="p-12 text-center">
              <AlertCircle className="h-10 w-10 text-destructive mx-auto mb-3" />
              <p className="text-muted-foreground">Failed to load documents</p>
            </div>
          ) : !data?.content.length ? (
            <div className="p-16 text-center">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-primary" />
              </div>
              <p className="font-medium">No documents found</p>
              <p className="text-sm text-muted-foreground mt-1">Upload some PDFs to get started</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/20">
                    {[
                      { key: "originalFileName", label: "File Name" },
                      { key: "fileSize", label: "Size" },
                      { key: "uploadedAt", label: "Uploaded" },
                      { key: "uploadStatus", label: "Status" },
                    ].map((col) => (
                      <th
                        key={col.key}
                        className="px-4 py-3 text-left font-medium text-muted-foreground cursor-pointer hover:text-foreground select-none text-xs uppercase tracking-wide"
                        onClick={() => toggleSort(col.key)}
                      >
                        <div className="flex items-center gap-1.5">
                          {col.label}
                          <SortIcon col={col.key} />
                        </div>
                      </th>
                    ))}
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground text-xs uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {data.content.map((doc) => (
                    <tr key={doc.id} className="table-row-hover group">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0">
                            <FileText className="h-4 w-4 text-red-500" />
                          </div>
                          <span className="font-medium max-w-[180px] truncate">{doc.originalFileName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-muted-foreground">{formatFileSize(doc.fileSize)}</td>
                      <td className="px-4 py-3.5 text-muted-foreground">{formatDate(doc.uploadedAt)}</td>
                      <td className="px-4 py-3.5"><StatusBadge status={doc.uploadStatus} /></td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost" size="icon"
                            className="h-8 w-8 hover:bg-blue-500/10 hover:text-blue-500"
                            onClick={() => setSelectedDoc(doc)}
                            title="View details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost" size="icon"
                            className="h-8 w-8 hover:bg-green-500/10 hover:text-green-500"
                            disabled={doc.uploadStatus !== "COMPLETED"}
                            onClick={() => downloadMutation.mutate({ id: doc.id, fileName: doc.originalFileName })}
                            title="Download"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost" size="icon"
                            className="h-8 w-8 hover:bg-red-500/10 hover:text-red-500"
                            onClick={() => deleteMutation.mutate(doc.id)}
                            disabled={deleteMutation.isPending}
                            title="Delete"
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
            <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/20">
              <p className="text-sm text-muted-foreground">
                Showing <span className="font-medium text-foreground">{page * 10 + 1}–{Math.min((page + 1) * 10, data.totalElements)}</span> of <span className="font-medium text-foreground">{data.totalElements}</span>
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>Previous</Button>
                <Button variant="outline" size="sm" disabled={data.last} onClick={() => setPage((p) => p + 1)}>Next</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <DocumentMetadataDialog document={selectedDoc} open={!!selectedDoc} onClose={() => setSelectedDoc(null)} />
    </div>
  );
}
