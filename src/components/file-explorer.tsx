"use client";

import * as React from "react";
import { 
  File, 
  Folder, 
  MoreVertical, 
  Search, 
  Upload, 
  PlusCircle,
  ChevronRight,
  Download,
  Trash2,
  Edit2,
  Loader2,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getServerFiles } from "@/app/actions/server-files";
import { useToast } from "@/hooks/use-toast";

interface FileExplorerProps {
  serverId?: string;
}

export function FileExplorer({ serverId }: FileExplorerProps) {
  const [files, setFiles] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { toast } = useToast();

  const fetchFiles = React.useCallback(async () => {
    if (!serverId) return;
    setLoading(true);
    const result = await getServerFiles(serverId);
    if (result.success) {
      setFiles(result.files || []);
    } else {
      toast({
        variant: "destructive",
        title: "Explorer Error",
        description: result.error || "Failed to load files"
      });
    }
    setLoading(false);
  }, [serverId, toast]);

  React.useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground overflow-x-auto max-w-full pb-1 whitespace-nowrap">
          <span className="hover:text-primary cursor-pointer">/root</span>
          <ChevronRight className="size-3 flex-shrink-0" />
          <span className="text-foreground font-semibold">files</span>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <Button size="sm" variant="ghost" className="h-9 px-2" onClick={fetchFiles} disabled={loading}>
            <RefreshCw className={loading ? "animate-spin" : ""} />
          </Button>
          <div className="relative flex-1 md:w-64 min-w-[160px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search files..."
              className="h-9 pl-8 bg-secondary/30 border-none"
            />
          </div>
          <Button size="sm" variant="outline" className="h-9 gap-2">
            <Upload className="size-4" />
            <span className="hidden xs:inline">Upload</span>
          </Button>
          <Button size="sm" className="h-9 gap-2">
            <PlusCircle className="size-4" />
            <span className="hidden xs:inline">Create</span>
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-secondary/20">
              <TableRow>
                <TableHead className="min-w-[160px] md:min-w-[200px]">Name</TableHead>
                <TableHead className="hidden sm:table-cell">Size</TableHead>
                <TableHead className="hidden md:table-cell">Modified</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-20">
                    <Loader2 className="size-6 animate-spin mx-auto text-primary" />
                    <p className="text-xs text-muted-foreground mt-2">Accessing storage...</p>
                  </TableCell>
                </TableRow>
              ) : files.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-20 opacity-50">
                    <p className="text-sm">No files found in this server.</p>
                  </TableCell>
                </TableRow>
              ) : (
                files.map((file) => (
                  <TableRow key={file.name} className="group hover:bg-secondary/10">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        {file.type === "folder" ? (
                          <Folder className="size-4 text-accent fill-accent/10 flex-shrink-0" />
                        ) : (
                          <File className="size-4 text-muted-foreground flex-shrink-0" />
                        )}
                        <span className="cursor-pointer hover:text-primary transition-colors truncate">{file.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground whitespace-nowrap hidden sm:table-cell">{file.size}</TableCell>
                    <TableCell className="text-muted-foreground hidden md:table-cell whitespace-nowrap">{file.modified}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-8 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                            <MoreVertical className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem className="gap-2">
                            <Edit2 className="size-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2">
                            <Download className="size-4" /> Download
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2 text-destructive focus:text-destructive">
                            <Trash2 className="size-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
