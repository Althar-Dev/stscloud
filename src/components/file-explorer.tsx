
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
  Save,
  Archive,
  FolderOpen,
  ArrowRightLeft,
  X,
  Type,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
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
  deleteServerPaths,
  archiveServerPaths,
  moveServerPaths,
  readFileContent,
  updateFileContent,
  unarchiveServerFile,
  renameServerPath
} from "@/app/actions/server-files";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface FileExplorerProps {
  serverId?: string;
  isExpired?: boolean;
}

export function FileExplorer({ serverId, isExpired }: FileExplorerProps) {
  const [files, setFiles] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [currentPath, setCurrentPath] = React.useState<string[]>([]);
  const { toast } = useToast();

  // Selection state
  const [selectedItems, setSelectedItems] = React.useState<Set<string>>(new Set());

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

  // Bulk Archive Modal
  const [isArchiveOpen, setIsArchiveOpen] = React.useState(false);
  const [zipName, setZipName] = React.useState("archive.zip");
  const [isArchiving, setIsArchiving] = React.useState(false);

  // Bulk Move Modal
  const [isMoveOpen, setIsMoveOpen] = React.useState(false);
  const [targetPathInput, setTargetPathInput] = React.useState("");
  const [isMoving, setIsMoving] = React.useState(false);

  // Rename Modal State
  const [isRenameOpen, setIsRenameOpen] = React.useState(false);
  const [renamingItemName, setRenamingItemName] = React.useState("");
  const [newRenameName, setNewRenameName] = React.useState("");
  const [isRenaming, setIsRenaming] = React.useState(false);

  // Drag and Drop State
  const [isDragging, setIsDragging] = React.useState(false);

  const getSubPathString = React.useCallback(() => currentPath.join('/'), [currentPath]);

  // CRITICAL FIX: Aggressive cleanup for Radix UI body-lock bug
  React.useEffect(() => {
    const isAnyModalOpen = isCreateOpen || isEditorOpen || isArchiveOpen || isMoveOpen || isRenameOpen;
    
    if (!isAnyModalOpen) {
      const forceCleanup = () => {
        document.body.style.pointerEvents = "auto";
        document.body.style.overflow = "auto";
        document.body.style.paddingRight = "";
        document.documentElement.style.pointerEvents = "auto";
        document.documentElement.style.overflow = "auto";
        document.body.removeAttribute('data-radix-scroll-lock');
      };

      forceCleanup();
      const t1 = setTimeout(forceCleanup, 50);
      const t2 = setTimeout(forceCleanup, 300);
      const t3 = setTimeout(forceCleanup, 1000);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }
  }, [isCreateOpen, isEditorOpen, isArchiveOpen, isMoveOpen, isRenameOpen]);

  const fetchFiles = React.useCallback(async () => {
    if (!serverId) return;
    setLoading(true);
    const result = await getServerFiles(serverId, getSubPathString());
    if (result.success) {
      setFiles(result.files || []);
      setSelectedItems(new Set()); 
    } else {
      toast({
        variant: "destructive",
        title: "Explorer Error",
        description: result.error || "Failed to load files"
      });
    }
    setLoading(false);
  }, [serverId, getSubPathString, toast]);

  React.useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const toggleSelect = (name: string) => {
    if (isExpired) return;
    const next = new Set(selectedItems);
    if (next.has(name)) next.delete(name);
    else next.add(name);
    setSelectedItems(next);
  };

  const toggleSelectAll = () => {
    if (isExpired) return;
    if (selectedItems.size === files.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(files.map(f => f.name)));
    }
  };

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serverId || !newItemName.trim() || isExpired) return;

    setIsCreating(true);
    try {
      const result = createType === "file" 
        ? await createServerFile(serverId, newItemName, getSubPathString())
        : await createServerFolder(serverId, newItemName, getSubPathString());

      if (result.success) {
        setIsCreateOpen(false);
        setNewItemName("");
        toast({ title: "Created", description: `Successfully created ${createType}: ${newItemName}` });
        fetchFiles();
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Creation Failed", description: error.message });
    } finally {
      setIsCreating(false);
    }
  };

  const handleRenameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serverId || !newRenameName.trim() || newRenameName === renamingItemName || isExpired) {
      setIsRenameOpen(false);
      return;
    }

    setIsRenaming(true);
    try {
      const result = await renameServerPath(serverId, renamingItemName, newRenameName, getSubPathString());
      if (result.success) {
        setIsRenameOpen(false);
        toast({ title: "Renamed", description: `Successfully renamed to ${newRenameName}` });
        fetchFiles();
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Rename Failed", description: error.message });
    } finally {
      setIsRenaming(false);
    }
  };

  const handleUploadFiles = async (inputFiles: FileList | null) => {
    if (!serverId || !inputFiles || inputFiles.length === 0 || isExpired) {
      if (isExpired) toast({ variant: "destructive", title: "Action Blocked", description: "File modification is disabled during grace period." });
      return;
    }
    
    setLoading(true);
    try {
      const formData = new FormData();
      // Crucial: Append metadata FIRST for streaming busboy processing
      formData.append('serverId', serverId);
      formData.append('subPath', getSubPathString());
      
      for (let i = 0; i < inputFiles.length; i++) {
        formData.append('files', inputFiles[i]);
      }
      
      // Using Dedicated API Route for faster Streaming Upload
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      if (!result.success) throw new Error(result.error);
      
      toast({ title: "Upload Success", description: `${inputFiles.length} file(s) have been uploaded via streaming.` });
      fetchFiles();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Upload Failed", description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleBulkDelete = async (itemsToDelete?: string[]) => {
    if (isExpired) return;
    const targets = itemsToDelete || Array.from(selectedItems);
    if (!serverId || targets.length === 0) return;
    
    setLoading(true);
    try {
      const result = await deleteServerPaths(serverId, targets, getSubPathString());
      if (result.success) {
        toast({ title: "Delete Success", description: `Removed ${targets.length} items.` });
        fetchFiles();
      } else throw new Error(result.error);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Delete Error", description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleBulkArchive = async () => {
    if (!serverId || selectedItems.size === 0 || isExpired) return;
    setIsArchiving(true);
    try {
      const result = await archiveServerPaths(serverId, Array.from(selectedItems), zipName, getSubPathString());
      if (result.success) {
        setIsArchiveOpen(false);
        toast({ title: "Archive Success", description: `Created ${zipName}` });
        fetchFiles();
      } else throw new Error(result.error);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Archive Error", description: error.message });
    } finally {
      setIsArchiving(false);
    }
  };

  const handleBulkMove = async () => {
    if (!serverId || selectedItems.size === 0 || isExpired) return;
    setIsMoving(true);
    try {
      const result = await moveServerPaths(serverId, Array.from(selectedItems), getSubPathString(), targetPathInput);
      if (result.success) {
        setIsMoveOpen(false);
        setTargetPathInput("");
        toast({ title: "Move Success", description: `Moved items to /${targetPathInput}` });
        fetchFiles();
      } else throw new Error(result.error);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Move Error", description: error.message });
    } finally {
      setIsMoving(false);
    }
  };

  const handleUnarchive = async (fileName: string) => {
    if (!serverId || isExpired) return;
    setLoading(true);
    try {
      const result = await unarchiveServerFile(serverId, fileName, getSubPathString());
      if (result.success) {
        toast({ title: "Extraction Complete", description: `Extracted ${fileName} successfully.` });
        fetchFiles();
      } else throw new Error(result.error);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Unarchive Error", description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleEditFile = async (name: string) => {
    if (!serverId) return;
    setLoading(true);
    const result = await readFileContent(serverId, name, getSubPathString());
    if (result.success) {
      setEditingFileName(name);
      setEditingContent(result.content || "");
      setTimeout(() => setIsEditorOpen(true), 10);
    } else toast({ variant: "destructive", title: "Read Error", description: result.error });
    setLoading(false);
  };

  const handleSaveFile = async () => {
    if (!serverId || !editingFileName || isExpired) return;
    setIsSaving(true);
    const result = await updateFileContent(serverId, editingFileName, editingContent, getSubPathString());
    if (result.success) {
      setIsEditorOpen(false);
      toast({ title: "Saved", description: `${editingFileName} updated successfully.` });
    } else toast({ variant: "destructive", title: "Save Error", description: result.error });
    setIsSaving(false);
  };

  const navigateTo = (index: number) => setCurrentPath(currentPath.slice(0, index + 1));
  const navigateToRoot = () => setCurrentPath([]);
  const handleFolderClick = (folderName: string) => setCurrentPath([...currentPath, folderName]);

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); if(!isExpired) setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); if(!isExpired) handleUploadFiles(e.dataTransfer.files); };

  const filteredFiles = files
    .filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (a.type === "folder" && b.type !== "folder") return -1;
      if (a.type !== "folder" && b.type === "folder") return 1;
      return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
    });

  return (
    <div className={cn("flex flex-col gap-4 relative transition-all duration-300", isDragging && "ring-4 ring-primary/20 bg-primary/5 rounded-2xl p-4")} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
      {isDragging && !isExpired && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background/60 backdrop-blur-sm border-2 border-dashed border-primary rounded-2xl pointer-events-none">
          <Upload className="size-12 text-primary animate-bounce mb-4" />
          <p className="text-xl font-bold font-headline text-primary">Drop files to upload</p>
        </div>
      )}

      {selectedItems.size > 0 && !isExpired && (
        <div className="flex items-center justify-between bg-primary/10 border border-primary/30 p-2 rounded-lg animate-in slide-in-from-top-2">
          <div className="flex items-center gap-3 px-2">
            <X className="size-4 cursor-pointer text-primary" onClick={() => setSelectedItems(new Set())} />
            <span className="text-xs font-bold font-headline">{selectedItems.size} selected</span>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" className="h-8 gap-2 hover:bg-primary/20" onClick={() => setIsArchiveOpen(true)}>
              <Archive className="size-3.5" /> Archive
            </Button>
            <Button size="sm" variant="ghost" className="h-8 gap-2 hover:bg-primary/20" onClick={() => setIsMoveOpen(true)}>
              <ArrowRightLeft className="size-3.5" /> Move
            </Button>
            <Button size="sm" variant="ghost" className="h-8 gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => handleBulkDelete()}>
              <Trash2 className="size-3.5" /> Delete
            </Button>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground overflow-x-auto max-w-full pb-1 whitespace-nowrap scrollbar-hide">
          <button onClick={navigateToRoot} className={cn("hover:text-primary transition-colors", currentPath.length === 0 && "text-foreground font-bold")}>/root</button>
          {currentPath.map((folder, i) => (
            <React.Fragment key={i}>
              <ChevronRight className="size-3 flex-shrink-0 opacity-50" />
              <button onClick={() => navigateTo(i)} className={cn("hover:text-primary transition-colors", i === currentPath.length - 1 && "text-foreground font-bold")}>{folder}</button>
            </React.Fragment>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {isExpired && (
            <Badge variant="outline" className="h-9 border-destructive/30 text-destructive bg-destructive/5 gap-2 px-3">
              <AlertCircle className="size-3.5" /> READ-ONLY MODE
            </Badge>
          )}
          <Button size="sm" variant="ghost" className="size-9 p-0" onClick={fetchFiles} disabled={loading}>
            <RefreshCw className={cn("size-4", loading && "animate-spin")} />
          </Button>
          <div className="relative flex-1 md:w-64 min-w-[160px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Search files..." className="h-9 pl-8 bg-secondary/30 border-none" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          
          <div className={cn("relative", isExpired && "opacity-50 cursor-not-allowed")}>
            <input type="file" multiple className={cn("absolute inset-0 opacity-0 cursor-pointer", isExpired && "pointer-events-none")} onChange={(e) => handleUploadFiles(e.target.files)} disabled={isExpired} />
            <Button size="sm" variant="outline" className="h-9 gap-2 pointer-events-none" disabled={isExpired}>
              <Upload className="size-4" />
              <span className="hidden xs:inline">Upload</span>
            </Button>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="h-9 gap-2 bg-primary hover:bg-primary/90 text-white font-bold" disabled={isExpired}>
                <Plus className="size-4" />
                <span>New</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem 
                className="gap-2" 
                onSelect={(e) => {
                  e.preventDefault();
                  setCreateType("file");
                  setTimeout(() => setIsCreateOpen(true), 10);
                }}
              >
                <FileText className="size-4" /> New File
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="gap-2" 
                onSelect={(e) => {
                  e.preventDefault();
                  setCreateType("folder");
                  setTimeout(() => setIsCreateOpen(true), 10);
                }}
              >
                <FolderPlus className="size-4" /> New Folder
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="rounded-xl border border-border/50 bg-card overflow-hidden min-h-[400px]">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-secondary/20">
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox checked={files.length > 0 && selectedItems.size === files.length} onCheckedChange={toggleSelectAll} disabled={isExpired} />
                </TableHead>
                <TableHead className="min-w-[160px] md:min-w-[200px]">Name</TableHead>
                <TableHead className="hidden sm:table-cell">Size</TableHead>
                <TableHead className="hidden md:table-cell">Modified</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-20"><Loader2 className="size-6 animate-spin mx-auto text-primary" /><p className="text-xs text-muted-foreground mt-2">Reading directory...</p></TableCell></TableRow>
              ) : filteredFiles.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-20 opacity-50"><p className="text-sm">Folder is empty.</p></TableCell></TableRow>
              ) : (
                filteredFiles.map((file) => (
                  <TableRow key={file.name} className={cn("group hover:bg-secondary/10", selectedItems.has(file.name) && "bg-primary/5")}>
                    <TableCell>
                      <Checkbox checked={selectedItems.has(file.name)} onCheckedChange={() => toggleSelect(file.name)} disabled={isExpired} />
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        {file.type === "folder" ? <Folder className="size-4 text-accent fill-accent/10" /> : <File className="size-4 text-muted-foreground" />}
                        <span className="cursor-pointer hover:text-primary transition-colors truncate" onClick={() => file.type === "folder" ? handleFolderClick(file.name) : handleEditFile(file.name)}>{file.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground hidden sm:table-cell">{file.size}</TableCell>
                    <TableCell className="text-muted-foreground hidden md:table-cell">{file.modified}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="size-8 md:opacity-0 md:group-hover:opacity-100"><MoreVertical className="size-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          {file.type === "file" && <DropdownMenuItem className="gap-2" onSelect={(e) => { e.preventDefault(); handleEditFile(file.name); }}><Edit2 className="size-4" /> {isExpired ? 'View' : 'Edit'}</DropdownMenuItem>}
                          {file.type === "folder" && <DropdownMenuItem className="gap-2" onClick={() => handleFolderClick(file.name)}><FolderOpen className="size-4" /> Open Folder</DropdownMenuItem>}
                          
                          {!isExpired && (
                            <>
                              <DropdownMenuItem className="gap-2" onSelect={(e) => { 
                                e.preventDefault(); 
                                setRenamingItemName(file.name);
                                setNewRenameName(file.name);
                                setTimeout(() => setIsRenameOpen(true), 10);
                              }}>
                                <Type className="size-4" /> Rename
                              </DropdownMenuItem>
                              {file.name.toLowerCase().endsWith('.zip') && <DropdownMenuItem className="gap-2 text-primary font-bold" onClick={() => handleUnarchive(file.name)}><Archive className="size-4" /> Unarchive</DropdownMenuItem>}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="gap-2 text-destructive focus:text-destructive" 
                                onSelect={(e) => { 
                                  e.preventDefault(); 
                                  handleBulkDelete([file.name]); 
                                }}
                              >
                                <Trash2 className="size-4" /> Delete
                              </DropdownMenuItem>
                            </>
                          )}
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

      {/* Rename Dialog */}
      <Dialog open={isRenameOpen} onOpenChange={setIsRenameOpen}>
        <DialogContent className="sm:max-w-[425px] w-[95vw] rounded-lg">
          <DialogHeader>
            <DialogTitle className="font-headline">Rename Item</DialogTitle>
            <DialogDescription>Enter a new name for your file or folder.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleRenameSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="rename-name" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">New Name</Label>
                <Input id="rename-name" value={newRenameName} onChange={(e) => setNewRenameName(e.target.value)} className="bg-secondary/30 border-none h-11" autoFocus />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" className="w-full bg-primary text-white font-bold h-11" disabled={isRenaming || !newRenameName.trim()}>
                {isRenaming ? <Loader2 className="size-4 animate-spin mr-2" /> : <Save className="size-4 mr-2" />} Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Creation Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[425px] w-[95vw] rounded-lg">
          <DialogHeader>
            <DialogTitle className="capitalize font-headline">Create New {createType}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateItem}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Name</Label>
                <Input id="name" value={newItemName} onChange={(e) => setNewItemName(e.target.value)} placeholder={createType === "file" ? "index.js" : "my-folder"} className="bg-secondary/30 border-none h-11" autoFocus />
              </div>
            </div>
            <DialogFooter><Button type="submit" className="w-full bg-primary text-white font-bold h-11" disabled={isCreating || !newItemName.trim()}>{isCreating ? <Loader2 className="size-4 animate-spin mr-2" /> : <PlusCircle className="size-4 mr-2" />}Create {createType}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Archive Dialog */}
      <Dialog open={isArchiveOpen} onOpenChange={setIsArchiveOpen}>
        <DialogContent className="sm:max-w-[425px] w-[95vw] rounded-lg">
          <DialogHeader><DialogTitle className="font-headline">Archive Selected Items</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Zip File Name</Label>
              <Input value={zipName} onChange={(e) => setZipName(e.target.value)} placeholder="archive.zip" className="bg-secondary/30 border-none h-11" />
            </div>
          </div>
          <DialogFooter><Button className="w-full bg-primary text-white font-bold h-11" onClick={handleBulkArchive} disabled={isArchiving}>{isArchiving ? <Loader2 className="size-4 animate-spin mr-2" /> : <Archive className="size-4 mr-2" />} Create Zip</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Move Dialog */}
      <Dialog open={isMoveOpen} onOpenChange={setIsMoveOpen}>
        <DialogContent className="sm:max-w-[425px] w-[95vw] rounded-lg">
          <DialogHeader><DialogTitle className="font-headline">Move Selected Items</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Target Path (Relative to current folder)</Label>
              <Input value={targetPathInput} onChange={(e) => setTargetPathInput(e.target.value)} placeholder="../destination" className="bg-secondary/30 border-none h-11" />
              <p className="text-[10px] text-muted-foreground italic">Use '../' to go up. Target is pinned to root server.</p>
            </div>
          </div>
          <DialogFooter><Button className="w-full bg-primary text-white font-bold h-11" onClick={handleBulkMove} disabled={isMoving}>{isMoving ? <Loader2 className="size-4 animate-spin mr-2" /> : <ArrowRightLeft className="size-4 mr-2" />} Move Items</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Editor Dialog */}
      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent className="sm:max-w-4xl w-[95vw] max-h-[90vh] flex flex-col p-0 bg-card border-border/50 rounded-lg">
          <DialogHeader className="p-6 border-b border-border/50 bg-secondary/30">
            <DialogTitle className="font-headline font-bold text-xl flex items-center gap-2"><FileText className="size-5 text-primary" />{editingFileName} {isExpired && <Badge className="ml-4 bg-destructive/10 text-destructive border-destructive/20">Read-Only</Badge>}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-hidden p-0 bg-black/20">
            <Textarea value={editingContent} onChange={(e) => setEditingContent(e.target.value)} className="w-full h-[60vh] border-none bg-transparent font-code text-sm p-6 focus-visible:ring-0 resize-none custom-scrollbar text-slate-300" placeholder="// Write your code here..." readOnly={isExpired} />
          </div>
          <div className="p-4 border-t border-border/50 bg-secondary/10 flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setIsEditorOpen(false)}>Close</Button>
            {!isExpired && <Button onClick={handleSaveFile} className="bg-primary hover:bg-primary/90 text-white font-bold h-10 gap-2" disabled={isSaving}><Save className="size-4" />Save</Button>}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

