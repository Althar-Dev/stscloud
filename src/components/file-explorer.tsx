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
  RefreshCw,
  Plus,
  FileText,
  FolderPlus,
  Save
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  getServerFiles, 
  createServerFile, 
  createServerFolder, 
  deleteServerPath,
  readFileContent,
  updateFileContent
} from "@/app/actions/server-files";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface FileExplorerProps {
  serverId?: string;
}

export function FileExplorer({ serverId }: FileExplorerProps) {
  const [files, setFiles] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");
  const { toast } = useToast();

  // Create Modal State
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [createType, setCreateType] = React.useState<"file" | "folder">("file");
  const [newItemName, setNewItemName] = React.useState("");
  const [isCreating, setIsCreating] = React.useState(false);

  // Editor Modal State
  const [isEditorOpen, setIsEditorOpen] = React.useState(false);
  const [editingFileName, setEditingFileName] = React.useState("");
  const [editingContent, setEditingContent] = React.useState("");
  const [isSaving, setIsSaving] = React.useState(false);

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

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serverId || !newItemName.trim()) return;

    setIsCreating(true);
    try {
      const result = createType === "file" 
        ? await createServerFile(serverId, newItemName)
        : await createServerFolder(serverId, newItemName);

      if (result.success) {
        toast({
          title: "Created",
          description: `Successfully created ${createType}: ${newItemName}`,
        });
        setIsCreateOpen(false);
        setNewItemName("");
        fetchFiles();
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Creation Failed",
        description: error.message
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (name: string) => {
    if (!serverId) return;
    const result = await deleteServerPath(serverId, name);
    if (result.success) {
      toast({ title: "Deleted", description: `${name} has been removed.` });
      fetchFiles();
    } else {
      toast({ variant: "destructive", title: "Delete Error", description: result.error });
    }
  };

  const handleEditFile = async (name: string) => {
    if (!serverId) return;
    setLoading(true);
    const result = await readFileContent(serverId, name);
    if (result.success) {
      setEditingFileName(name);
      setEditingContent(result.content || "");
      setIsEditorOpen(true);
    } else {
      toast({ variant: "destructive", title: "Read Error", description: result.error });
    }
    setLoading(false);
  };

  const handleSaveFile = async () => {
    if (!serverId || !editingFileName) return;
    setIsSaving(true);
    const result = await updateFileContent(serverId, editingFileName, editingContent);
    if (result.success) {
      toast({ title: "Saved", description: `${editingFileName} updated successfully.` });
      setIsEditorOpen(false);
    } else {
      toast({ variant: "destructive", title: "Save Error", description: result.error });
    }
    setIsSaving(false);
  };

  const filteredFiles = files.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()));

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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button size="sm" variant="outline" className="h-9 gap-2">
            <Upload className="size-4" />
            <span className="hidden xs:inline">Upload</span>
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="h-9 gap-2 bg-primary hover:bg-primary/90 text-white font-bold">
                <Plus className="size-4" />
                <span>New</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem className="gap-2" onClick={() => { setCreateType("file"); setIsCreateOpen(true); }}>
                <FileText className="size-4" /> New File
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2" onClick={() => { setCreateType("folder"); setIsCreateOpen(true); }}>
                <FolderPlus className="size-4" /> New Folder
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
              ) : filteredFiles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-20 opacity-50">
                    <p className="text-sm">No items found in this directory.</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredFiles.map((file) => (
                  <TableRow key={file.name} className="group hover:bg-secondary/10">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        {file.type === "folder" ? (
                          <Folder className="size-4 text-accent fill-accent/10 flex-shrink-0" />
                        ) : (
                          <File className="size-4 text-muted-foreground flex-shrink-0" />
                        )}
                        <span 
                          className="cursor-pointer hover:text-primary transition-colors truncate"
                          onClick={() => file.type === "file" && handleEditFile(file.name)}
                        >
                          {file.name}
                        </span>
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
                          {file.type === "file" && (
                            <DropdownMenuItem className="gap-2" onClick={() => handleEditFile(file.name)}>
                              <Edit2 className="size-4" /> Edit
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem className="gap-2">
                            <Download className="size-4" /> Download
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="gap-2 text-destructive focus:text-destructive"
                            onClick={() => handleDelete(file.name)}
                          >
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

      {/* Creation Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[425px] w-[95vw] max-w-lg rounded-lg">
          <DialogHeader>
            <DialogTitle className="capitalize font-headline">Create New {createType}</DialogTitle>
            <DialogDescription>
              Enter a name for your new {createType}.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateItem}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Name</Label>
                <Input
                  id="name"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder={createType === "file" ? "index.js" : "my-folder"}
                  className="bg-secondary/30 border-none h-11"
                  autoFocus
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="submit" 
                className="w-full bg-primary text-white font-bold h-11"
                disabled={isCreating || !newItemName.trim()}
              >
                {isCreating ? <Loader2 className="size-4 animate-spin mr-2" /> : <PlusCircle className="size-4 mr-2" />}
                Create {createType}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Editor Dialog */}
      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent className="sm:max-w-4xl w-[95vw] max-w-6xl max-h-[90vh] flex flex-col p-0 overflow-hidden bg-card border-border/50 rounded-lg">
          <DialogHeader className="p-6 border-b border-border/50 bg-secondary/30">
            <div>
              <DialogTitle className="font-headline font-bold text-xl flex items-center gap-2">
                <FileText className="size-5 text-primary" />
                {editingFileName}
              </DialogTitle>
              <DialogDescription className="text-xs">
                Editing file content in real-time.
              </DialogDescription>
            </div>
          </DialogHeader>
          <div className="flex-1 overflow-hidden p-0 bg-black/20">
            <Textarea 
              value={editingContent}
              onChange={(e) => setEditingContent(e.target.value)}
              className="w-full h-[60vh] border-none bg-transparent font-code text-sm p-6 focus-visible:ring-0 resize-none custom-scrollbar text-slate-300"
              placeholder="// Write your code here..."
            />
          </div>
          <div className="p-4 border-t border-border/50 bg-secondary/10 flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setIsEditorOpen(false)}>Close Editor</Button>
            <Button 
              onClick={handleSaveFile} 
              className="bg-primary hover:bg-primary/90 text-white font-bold h-10 gap-2"
              disabled={isSaving}
            >
              {isSaving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
