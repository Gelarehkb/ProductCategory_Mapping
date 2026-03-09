import { useState, useRef, useEffect } from "react";
import { ChevronRight, ChevronDown, Check, X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { masterCategories, CategoryNode, buildCategoryPath } from "@/lib/masterCategories";

interface CategoryPickerProps {
  value: string; // newline-separated paths like "A -> B -> C\nX -> Y"
  onChange: (value: string) => void;
}

export function CategoryPicker({ value, onChange }: CategoryPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const selectedPaths = value
    ? value.split("\n").filter(Boolean)
    : [];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const togglePath = (path: string) => {
    const newPaths = selectedPaths.includes(path)
      ? selectedPaths.filter((p) => p !== path)
      : [...selectedPaths, path];
    onChange(newPaths.join("\n"));
  };

  const removePath = (path: string) => {
    onChange(selectedPaths.filter((p) => p !== path).join("\n"));
  };

  // Collect all leaf & branch paths for search
  const flattenPaths = (
    nodes: CategoryNode[],
    prefix: string[] = []
  ): { path: string; label: string; parts: string[] }[] => {
    const results: { path: string; label: string; parts: string[] }[] = [];
    for (const node of nodes) {
      const parts = [...prefix, node.name];
      const path = buildCategoryPath(parts);
      results.push({ path, label: node.name, parts });
      if (node.children) {
        results.push(...flattenPaths(node.children, parts));
      }
    }
    return results;
  };

  const allPaths = flattenPaths(masterCategories);
  const searchLower = search.toLowerCase();
  const filteredPaths = search
    ? allPaths.filter((p) => p.path.toLowerCase().includes(searchLower))
    : null;

  return (
    <div ref={ref} className="relative w-full">
      {/* Trigger */}
      <div
        onClick={() => setOpen(!open)}
        className={cn(
          "min-h-[2rem] w-full px-2 py-1 text-sm border border-input rounded-md cursor-pointer",
          "bg-background hover:bg-accent/50 transition-colors flex flex-wrap gap-1 items-center",
          open && "ring-1 ring-ring"
        )}
      >
        {selectedPaths.length === 0 ? (
          <span className="text-muted-foreground text-xs">Kategorien wählen…</span>
        ) : (
          selectedPaths.map((p) => {
            const parts = p.split(" -> ");
            const short = parts.length > 2
              ? `${parts[0]} → … → ${parts[parts.length - 1]}`
              : p.replace(/ -> /g, " → ");
            return (
              <Badge
                key={p}
                variant="secondary"
                className="text-xs gap-1 max-w-[180px] truncate"
                title={p}
              >
                <span className="truncate">{short}</span>
                <X
                  className="w-3 h-3 shrink-0 cursor-pointer hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    removePath(p);
                  }}
                />
              </Badge>
            );
          })
        )}
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-[100] mt-1 w-[420px] max-h-[480px] bg-popover border border-border rounded-lg shadow-xl flex flex-col overflow-hidden">
          {/* Search */}
          <div className="p-2 border-b border-border">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Suchen…"
                className="h-8 pl-7 text-sm"
                autoFocus
              />
            </div>
          </div>

          <div className="overflow-y-auto flex-1 p-1">
            {filteredPaths ? (
              filteredPaths.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Keine Treffer</p>
              ) : (
                filteredPaths.map(({ path }) => (
                  <button
                    key={path}
                    onClick={() => togglePath(path)}
                    className={cn(
                      "w-full text-left px-2 py-1.5 text-sm rounded-md flex items-center gap-2",
                      "hover:bg-accent transition-colors",
                      selectedPaths.includes(path) && "bg-primary/10"
                    )}
                  >
                    <div className={cn(
                      "w-4 h-4 rounded border flex items-center justify-center shrink-0",
                      selectedPaths.includes(path)
                        ? "bg-primary border-primary"
                        : "border-input"
                    )}>
                      {selectedPaths.includes(path) && (
                        <Check className="w-3 h-3 text-primary-foreground" />
                      )}
                    </div>
                    <span className="truncate">{path.replace(/ -> /g, " → ")}</span>
                  </button>
                ))
              )
            ) : (
              <TreeView
                nodes={masterCategories}
                prefix={[]}
                selectedPaths={selectedPaths}
                togglePath={togglePath}
              />
            )}
          </div>

          {/* Footer */}
          {selectedPaths.length > 0 && (
            <div className="border-t border-border p-2 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {selectedPaths.length} ausgewählt
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs"
                onClick={() => onChange("")}
              >
                Alle entfernen
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function TreeView({
  nodes,
  prefix,
  selectedPaths,
  togglePath,
}: {
  nodes: CategoryNode[];
  prefix: string[];
  selectedPaths: string[];
  togglePath: (path: string) => void;
}) {
  return (
    <div className="space-y-0.5">
      {nodes.map((node) => (
        <TreeNode
          key={node.name}
          node={node}
          prefix={prefix}
          selectedPaths={selectedPaths}
          togglePath={togglePath}
        />
      ))}
    </div>
  );
}

function TreeNode({
  node,
  prefix,
  selectedPaths,
  togglePath,
}: {
  node: CategoryNode;
  prefix: string[];
  selectedPaths: string[];
  togglePath: (path: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const parts = [...prefix, node.name];
  const path = buildCategoryPath(parts);
  const isSelected = selectedPaths.includes(path);
  const hasChildren = node.children && node.children.length > 0;
  const depth = prefix.length;

  return (
    <div>
      <div
        className={cn(
          "flex items-center gap-1 px-1 py-1 rounded-md text-sm cursor-pointer",
          "hover:bg-accent transition-colors",
          isSelected && "bg-primary/10"
        )}
        style={{ paddingLeft: `${depth * 16 + 4}px` }}
      >
        {hasChildren ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
            className="w-5 h-5 flex items-center justify-center shrink-0 text-muted-foreground hover:text-foreground"
          >
            {expanded ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
            )}
          </button>
        ) : (
          <span className="w-5" />
        )}

        <button
          onClick={() => togglePath(path)}
          className="flex items-center gap-2 flex-1 min-w-0"
        >
          <div className={cn(
            "w-4 h-4 rounded border flex items-center justify-center shrink-0",
            isSelected ? "bg-primary border-primary" : "border-input"
          )}>
            {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
          </div>
          <span className="truncate">{node.name}</span>
        </button>
      </div>

      {hasChildren && expanded && (
        <TreeView
          nodes={node.children!}
          prefix={parts}
          selectedPaths={selectedPaths}
          togglePath={togglePath}
        />
      )}
    </div>
  );
}
