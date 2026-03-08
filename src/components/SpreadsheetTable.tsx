import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { Undo2, Redo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CategoryPicker } from "@/components/CategoryPicker";
import { cn } from "@/lib/utils";

export interface RowData {
  artikelnummer: string;
  cats: string;
}

interface CellRef {
  row: number;
  col: number; // 0 = artikelnummer, 1 = cats
}

interface SpreadsheetTableProps {
  data: RowData[];
  onChange: (data: RowData[]) => void;
  rowCount: number;
  onRowCountChange: (count: number) => void;
}

const COLS = ["artikelnummer", "cats"] as const;

function cellValue(row: RowData, col: number): string {
  return col === 0 ? row.artikelnummer : row.cats;
}

function setCell(row: RowData, col: number, val: string): RowData {
  return col === 0 ? { ...row, artikelnummer: val } : { ...row, cats: val };
}

function rangeNormalize(a: CellRef, b: CellRef) {
  return {
    r1: Math.min(a.row, b.row),
    r2: Math.max(a.row, b.row),
    c1: Math.min(a.col, b.col),
    c2: Math.max(a.col, b.col),
  };
}

function inRange(r: number, c: number, sel: { r1: number; r2: number; c1: number; c2: number } | null) {
  if (!sel) return false;
  return r >= sel.r1 && r <= sel.r2 && c >= sel.c1 && c <= sel.c2;
}

export function SpreadsheetTable({ data, onChange, rowCount, onRowCountChange }: SpreadsheetTableProps) {
  const isMac = useMemo(() => /Mac|iPod|iPhone|iPad/.test(navigator.platform), []);
  const [history, setHistory] = useState<RowData[][]>([]);
  const [future, setFuture] = useState<RowData[][]>([]);
  const [selStart, setSelStart] = useState<CellRef | null>(null);
  const [selEnd, setSelEnd] = useState<CellRef | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [fillFrom, setFillFrom] = useState<CellRef | null>(null);
  const [fillTo, setFillTo] = useState<number | null>(null);
  const [isDraggingFill, setIsDraggingFill] = useState(false);
  const [editingCell, setEditingCell] = useState<CellRef | null>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  const sel = useMemo(() => {
    if (!selStart) return null;
    const end = selEnd || selStart;
    return rangeNormalize(selStart, end);
  }, [selStart, selEnd]);

  const fillRange = useMemo(() => {
    if (!sel || fillTo === null) return null;
    return { r1: sel.r2 + 1, r2: fillTo, c1: sel.c1, c2: sel.c2 };
  }, [sel, fillTo]);

  const pushHistory = useCallback((prev: RowData[]) => {
    setHistory(h => [...h.slice(-50), prev]);
    setFuture([]);
  }, []);

  const undo = useCallback(() => {
    setHistory(h => {
      if (h.length === 0) return h;
      const prev = h[h.length - 1];
      setFuture(f => [...f, data]);
      onChange(prev);
      const newLen = prev.length;
      if (newLen !== rowCount) onRowCountChange(newLen);
      return h.slice(0, -1);
    });
  }, [data, onChange, rowCount, onRowCountChange]);

  const redo = useCallback(() => {
    setFuture(f => {
      if (f.length === 0) return f;
      const next = f[f.length - 1];
      setHistory(h => [...h, data]);
      onChange(next);
      const newLen = next.length;
      if (newLen !== rowCount) onRowCountChange(newLen);
      return f.slice(0, -1);
    });
  }, [data, onChange, rowCount, onRowCountChange]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
        e.preventDefault();
        redo();
      }
      // Copy
      if ((e.ctrlKey || e.metaKey) && e.key === "c" && sel && !editingCell) {
        e.preventDefault();
        const lines: string[] = [];
        for (let r = sel.r1; r <= sel.r2; r++) {
          const parts: string[] = [];
          for (let c = sel.c1; c <= sel.c2; c++) {
            parts.push(cellValue(data[r], c));
          }
          lines.push(parts.join("\t"));
        }
        navigator.clipboard.writeText(lines.join("\n"));
      }
      // Paste
      if ((e.ctrlKey || e.metaKey) && e.key === "v" && sel && !editingCell) {
        e.preventDefault();
        navigator.clipboard.readText().then(text => {
          const lines = text.split(/\r?\n/).filter(Boolean);
          if (lines.length === 0) return;
          pushHistory([...data]);
          const updated = [...data];
          for (let li = 0; li < lines.length; li++) {
            const cols = lines[li].split(/\t|;/);
            const r = sel.r1 + li;
            if (r >= updated.length) {
              updated.push({ artikelnummer: "", cats: "" });
            }
            for (let ci = 0; ci < cols.length; ci++) {
              const c = sel.c1 + ci;
              if (c <= 1) {
                updated[r] = setCell(updated[r], c, cols[ci]);
              }
            }
          }
          onChange(updated);
          if (updated.length > rowCount) onRowCountChange(updated.length);
        });
      }
      // Delete
      if ((e.key === "Delete" || e.key === "Backspace") && sel && !editingCell) {
        e.preventDefault();
        pushHistory([...data]);
        const updated = [...data];
        for (let r = sel.r1; r <= sel.r2; r++) {
          for (let c = sel.c1; c <= sel.c2; c++) {
            updated[r] = setCell(updated[r], c, "");
          }
        }
        onChange(updated);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [sel, data, editingCell, undo, redo, onChange, pushHistory, rowCount, onRowCountChange]);

  // Mouse up for selection & fill
  useEffect(() => {
    const handleUp = () => {
      if (isDraggingFill && fillRange && sel) {
        pushHistory([...data]);
        const updated = [...data];
        for (let r = fillRange.r1; r <= fillRange.r2; r++) {
          if (r >= updated.length) updated.push({ artikelnummer: "", cats: "" });
          for (let c = fillRange.c1; c <= fillRange.c2; c++) {
            const srcRow = sel.r1 + ((r - fillRange.r1) % (sel.r2 - sel.r1 + 1));
            updated[r] = setCell(updated[r], c, cellValue(data[srcRow], c));
          }
        }
        onChange(updated);
        if (updated.length > rowCount) onRowCountChange(updated.length);
        setSelEnd({ row: fillRange.r2, col: sel.c2 });
        setFillTo(null);
        setIsDraggingFill(false);
        setFillFrom(null);
      }
      setIsSelecting(false);
    };
    document.addEventListener("mouseup", handleUp);
    return () => document.removeEventListener("mouseup", handleUp);
  }, [isDraggingFill, fillRange, sel, data, onChange, pushHistory, rowCount, onRowCountChange]);

  const handleCellMouseDown = (r: number, c: number, e: React.MouseEvent) => {
    if (e.button !== 0) return;
    e.preventDefault();
    setEditingCell(null);
    setSelStart({ row: r, col: c });
    setSelEnd(null);
    setIsSelecting(true);
    setIsDraggingFill(false);
    setFillTo(null);
  };

  const handleCellMouseEnter = (r: number, c: number) => {
    if (isSelecting) {
      setSelEnd({ row: r, col: c });
    }
    if (isDraggingFill && r > (sel?.r2 ?? 0)) {
      setFillTo(r);
    }
  };

  const handleCellDoubleClick = (r: number, c: number) => {
    setEditingCell({ row: r, col: c });
  };

  const handleFillHandleDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!sel) return;
    setIsDraggingFill(true);
    setFillFrom({ row: sel.r2, col: sel.c2 });
    setFillTo(null);
  };

  const handleCellChange = (r: number, c: number, val: string) => {
    pushHistory([...data]);
    const updated = [...data];
    updated[r] = setCell(updated[r], c, val);
    onChange(updated);
  };

  const handlePaste = (r: number, c: number, e: React.ClipboardEvent) => {
    const paste = e.clipboardData.getData("text");
    const lines = paste.split(/\r?\n/).filter(Boolean);
    if (lines.length > 1) {
      e.preventDefault();
      pushHistory([...data]);
      const updated = [...data];
      for (let li = 0; li < lines.length; li++) {
        const idx = r + li;
        const cols = lines[li].split(/\t|;/);
        if (idx >= updated.length) {
          updated.push({ artikelnummer: "", cats: "" });
        }
        for (let ci = 0; ci < cols.length; ci++) {
          const col = c + ci;
          if (col <= 1) updated[idx] = setCell(updated[idx], col, cols[ci]);
        }
      }
      onChange(updated);
      if (updated.length > rowCount) onRowCountChange(updated.length);
    }
  };

  return (
    <div className="space-y-3">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={undo}
            disabled={history.length === 0}
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={redo}
            disabled={future.length === 0}
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="rowCount" className="text-xs text-muted-foreground">Rows:</Label>
          <Input
            id="rowCount"
            type="number"
            min={1}
            max={500}
            value={rowCount}
            onChange={(e) => {
              const val = Math.max(1, Math.min(500, parseInt(e.target.value) || 1));
              onRowCountChange(val);
              const newData = [...data];
              if (val > newData.length) {
                for (let i = newData.length; i < val; i++) newData.push({ artikelnummer: "", cats: "" });
              } else {
                newData.length = val;
              }
              onChange(newData);
            }}
            className="h-7 w-20 text-sm"
          />
        </div>
      </div>

      {/* Table */}
      <div
        ref={tableRef}
        tabIndex={0}
        className="border border-border rounded-lg overflow-auto max-h-[500px] select-none outline-none"
        onMouseLeave={() => {
          if (isSelecting) setIsSelecting(false);
        }}
        onPaste={(e) => {
          if (editingCell) return; // let the input handle it
          if (!sel) return;
          e.preventDefault();
          const paste = e.clipboardData.getData("text");
          const lines = paste.split(/\r?\n/).filter(Boolean);
          if (lines.length === 0) return;
          pushHistory([...data]);
          const updated = [...data];
          for (let li = 0; li < lines.length; li++) {
            const cols = lines[li].split(/\t|;/);
            const r = sel.r1 + li;
            if (r >= updated.length) {
              updated.push({ artikelnummer: "", cats: "" });
            }
            for (let ci = 0; ci < cols.length; ci++) {
              const c = sel.c1 + ci;
              if (c <= 1) updated[r] = setCell(updated[r], c, cols[ci].trim());
            }
          }
          onChange(updated);
          if (updated.length > rowCount) onRowCountChange(updated.length);
        }}
      >
        <table className="w-full text-sm border-collapse">
          <thead className="sticky top-0 z-10 bg-muted">
            <tr>
              <th className="w-10 px-2 py-2 text-center text-xs font-medium text-muted-foreground border-b border-r border-border">#</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground border-b border-r border-border">Artikelnummer</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground border-b border-border">Cats</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, r) => (
              <tr key={r} className="group">
                <td className="px-2 py-0 text-center text-xs text-muted-foreground border-r border-b border-border bg-muted/30 tabular-nums">
                  {r + 1}
                </td>
                {COLS.map((_, c) => {
                  const isSelected = inRange(r, c, sel);
                  const isFilling = fillRange ? inRange(r, c, fillRange) : false;
                  const isEditing = editingCell?.row === r && editingCell?.col === c;
                  const isBottomRight = sel && r === sel.r2 && c === sel.c2;

                  return (
                    <td
                      key={c}
                      className={cn(
                        "relative px-0 py-0 border-b border-border",
                        c === 0 && "border-r",
                        isSelected && "bg-primary/10",
                        isFilling && "bg-primary/5",
                        !isSelected && !isFilling && "hover:bg-accent/30"
                      )}
                      onMouseDown={(e) => handleCellMouseDown(r, c, e)}
                      onMouseEnter={() => handleCellMouseEnter(r, c)}
                      onDoubleClick={() => handleCellDoubleClick(r, c)}
                    >
                      {c === 0 ? (
                        isEditing ? (
                          <input
                            autoFocus
                            className="w-full h-8 px-2 text-sm bg-background border-2 border-primary rounded-none outline-none"
                            value={cellValue(row, c)}
                            onChange={(e) => handleCellChange(r, c, e.target.value)}
                            onBlur={() => setEditingCell(null)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === "Tab") {
                                e.preventDefault();
                                setEditingCell(null);
                              }
                              if (e.key === "Escape") setEditingCell(null);
                            }}
                            onPaste={(e) => handlePaste(r, c, e)}
                          />
                        ) : (
                          <div className="w-full h-8 px-2 flex items-center text-sm truncate cursor-cell">
                            {cellValue(row, c) || <span className="text-muted-foreground/40">—</span>}
                          </div>
                        )
                      ) : (
                        <div className="min-h-[2rem]">
                          <CategoryPicker
                            value={cellValue(row, c)}
                            onChange={(val) => handleCellChange(r, c, val)}
                          />
                        </div>
                      )}

                      {/* Fill handle */}
                      {isBottomRight && !isDraggingFill && (
                        <div
                          className="absolute -bottom-[3px] -right-[3px] w-[7px] h-[7px] bg-primary border border-primary-foreground cursor-crosshair z-20"
                          onMouseDown={handleFillHandleDown}
                        />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Selection border overlay with CSS */}
      {sel && (
        <style>{`
          /* Blue border around selection handled via cell bg above */
        `}</style>
      )}

      <p className="text-xs text-muted-foreground">
        Drag the fill handle ■ to copy values down • {isMac ? "⌘" : "Ctrl"}+C / {isMac ? "⌘" : "Ctrl"}+V • {isMac ? "⌘" : "Ctrl"}+Z / {isMac ? "⌘" : "Ctrl"}+Y
      </p>
    </div>
  );
}
