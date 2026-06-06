
"use client";

import * as React from "react";
import { 
  File, 
  Folder, 
  MoreVertical, 
  Search, 
  Upload, 
  FilePlus, 
  FolderPlus,
  ChevronRight,
  Download,
  Trash2,
  Edit2
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

const mockFiles = [
  { name: "configs", type: "folder", size: "--", modified: "2h ago" },
  { name: "logs", type: "folder", size: "--", modified: "10m ago" },
  { name: "server.properties", type: "file", size: "1.2 KB", modified: "1d ago" },
  { name: "whitelist.json", type: "file", size: "450 B", modified: "3d ago" },
  { name: "eula.txt", type: "file", size: "128 B", modified: "5d ago" },
  { name: "world", type: "folder", size: "--", modified: "Just now" },
  { name: "spigot.jar", type: "file", size: "42 MB", modified: "1w ago" },
];

export function FileExplorer() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="hover:text-primary cursor-pointer">/root</span>
          <ChevronRight className="size-3" />
          <span className="text-foreground font-semibold">minecraft-server</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search files..."
              className="h-9 pl-8 bg-secondary/30 border-none"
            />
          </div>
          <Button size="sm" variant="outline" className="h-9 gap-2">
            <Upload className="size-4" />
            Upload
          </Button>
          <Button size="sm" className="h-9 gap-2">
            <PlusCircle className="size-4" />
            Create
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
        <Table>
          <TableHeader className="bg-secondary/20">
            <TableRow>
              <TableHead className="w-[400px]">Name</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Modified</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockFiles.map((file) => (
              <TableRow key={file.name} className="group hover:bg-secondary/10">
                <TableCell className="font-medium">
                  <div className="flex items-center gap-3">
                    {file.type === "folder" ? (
                      <Folder className="size-4 text-accent fill-accent/10" />
                    ) : (
                      <File className="size-4 text-muted-foreground" />
                    )}
                    <span className="cursor-pointer hover:text-primary transition-colors">{file.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{file.size}</TableCell>
                <TableCell className="text-muted-foreground">{file.modified}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="size-8 opacity-0 group-hover:opacity-100 transition-opacity">
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
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
