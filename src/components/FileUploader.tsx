import { useState, useCallback, useRef } from "react";
import { Upload, FileSpreadsheet, X, Download, Loader2, AlertCircle, CheckCircle, Eye, Grid3X3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { processCategories, generateOutputFilename } from "@/lib/categoryProcessor";
import { SpreadsheetTable, RowData } from "@/components/SpreadsheetTable";
import Papa from "papaparse";

type UploadStatus = "idle" | "processing" | "success" | "error";

interface FileUploaderProps {
  className?: string;
}

export function FileUploader({ className }: FileUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [prefix, setPrefix] = useState<string>("OUTPUT");
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [outputFilename, setOutputFilename] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const [previewData, setPreviewData] = useState<{ headers: string[]; rows: string[][] } | null>(null);
  const [rowCount, setRowCount] = useState(10);
  const [tableData, setTableData] = useState<RowData[]>(
    () => Array.from({ length: 10 }, () => ({ artikelnummer: "", cats: "" }))
  );
  const inputRef = useRef<HTMLInputElement>(null);

  const acceptedTypes = [
    "text/csv",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ];

  const validateFile = (file: File): boolean => {
    const isValidType = acceptedTypes.includes(file.type) || 
      file.name.endsWith(".csv") || 
      file.name.endsWith(".xlsx") || 
      file.name.endsWith(".xls");
    
    if (!isValidType) {
      setErrorMessage("Please upload a CSV or Excel file (.csv, .xlsx, .xls)");
      return false;
    }

    if (file.size > 50 * 1024 * 1024) {
      setErrorMessage("File size must be less than 50MB");
      return false;
    }

    return true;
  };

  const handleFile = useCallback(async (selectedFile: File) => {
    setErrorMessage("");
    setDownloadUrl(null);
    setStatus("idle");
    setPreviewData(null);

    if (validateFile(selectedFile)) {
      setFile(selectedFile);
      // Parse preview
      try {
        const text = await selectedFile.text();
        const parsed = Papa.parse<string[]>(text, { delimiter: ";", skipEmptyLines: true });
        if (parsed.data.length > 0) {
          const headers = parsed.data[0];
          const rows = parsed.data.slice(1, 6); // Show first 5 rows
          setPreviewData({ headers, rows });
        }
      } catch {
        // Preview is best-effort, don't block upload
      }
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFile(droppedFile);
    }
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFile(selectedFile);
    }
  };

  const clearFile = () => {
    setFile(null);
    setStatus("idle");
    setDownloadUrl(null);
    setErrorMessage("");
    setPreviewData(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const processFile = async () => {
    if (!file) return;

    setStatus("processing");
    setErrorMessage("");

    try {
      // Read file content
      const text = await file.text();
      
      // Process using TypeScript logic
      const result = processCategories(text, prefix);
      const filename = generateOutputFilename(prefix);
      
      // Create download blob
      const blob = new Blob([result], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      
      setDownloadUrl(url);
      setOutputFilename(filename);
      setStatus("success");
    } catch (error) {
      setStatus("error");
      setErrorMessage(
        error instanceof Error 
          ? error.message 
          : "Failed to process file. Please check the file format."
      );
    }
  };

  const downloadResult = () => {
    if (!downloadUrl) return;

    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = outputFilename || "result.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className={cn("w-full max-w-xl mx-auto space-y-6 animate-slide-up", className)}>
      {/* Prefix Input */}
      <div className="space-y-2">
        <Label htmlFor="prefix">Output File Prefix</Label>
        <Input
          id="prefix"
          value={prefix}
          onChange={(e) => setPrefix(e.target.value)}
          placeholder="Enter prefix for output filename"
          className="h-11"
        />
        <p className="text-xs text-muted-foreground">
          Output: {generateOutputFilename(prefix)}
        </p>
      </div>

      {/* Upload Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "upload-zone p-8 text-center cursor-pointer",
          isDragging && "upload-zone-active",
          status === "success" && "border-success",
          status === "error" && "border-destructive"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={handleInputChange}
          className="hidden"
        />

        {!file ? (
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-secondary flex items-center justify-center">
              <Upload className="w-7 h-7 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium text-foreground">Drop your file here</p>
              <p className="text-sm text-muted-foreground mt-1">
                or click to browse • CSV, Excel (.xlsx, .xls)
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileSpreadsheet className="w-6 h-6 text-primary" />
              </div>
              <div className="text-left">
                <p className="font-medium text-foreground truncate max-w-[200px]">
                  {file.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatFileSize(file.size)}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  clearFile();
                }}
                className="p-1.5 rounded-full hover:bg-secondary transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Data Preview */}
      {previewData && file && (
        <div className="space-y-2 animate-slide-up">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Eye className="w-4 h-4" />
            <span>Preview (first {previewData.rows.length} rows of {file.name})</span>
          </div>
          <div className="border border-border rounded-lg overflow-auto max-h-64">
            <Table>
              <TableHeader>
                <TableRow>
                  {previewData.headers.map((h, i) => (
                    <TableHead key={i} className="whitespace-nowrap">{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {previewData.rows.map((row, i) => (
                  <TableRow key={i}>
                    {row.map((cell, j) => (
                      <TableCell key={j} className="max-w-[300px] truncate text-sm">{cell}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Manual Table Input */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Grid3X3 className="w-4 h-4" />
            <span>Manual Input</span>
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
                setRowCount(val);
                setTableData((prev) => {
                  if (val > prev.length) {
                    return [...prev, ...Array.from({ length: val - prev.length }, () => ({ artikelnummer: "", cats: "" }))];
                  }
                  return prev.slice(0, val);
                });
              }}
              className="h-8 w-20 text-sm"
            />
          </div>
        </div>
        <div className="border border-border rounded-lg overflow-auto max-h-96">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12 text-center">#</TableHead>
                <TableHead>Artikelnummer</TableHead>
                <TableHead>Cats</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tableData.map((row, i) => (
                <TableRow key={i}>
                  <TableCell className="text-center text-xs text-muted-foreground py-1">{i + 1}</TableCell>
                  <TableCell className="py-1 px-1">
                    <Input
                      value={row.artikelnummer}
                      onChange={(e) => {
                        const updated = [...tableData];
                        updated[i] = { ...updated[i], artikelnummer: e.target.value };
                        setTableData(updated);
                      }}
                      onPaste={(e) => {
                        const paste = e.clipboardData.getData("text");
                        const lines = paste.split(/\r?\n/).filter(Boolean);
                        if (lines.length > 1) {
                          e.preventDefault();
                          const updated = [...tableData];
                          for (let li = 0; li < lines.length; li++) {
                            const idx = i + li;
                            const cols = lines[li].split(/\t|;/);
                            if (idx < updated.length) {
                              updated[idx] = {
                                artikelnummer: cols[0] ?? updated[idx].artikelnummer,
                                cats: cols[1] ?? updated[idx].cats,
                              };
                            } else {
                              updated.push({
                                artikelnummer: cols[0] ?? "",
                                cats: cols[1] ?? "",
                              });
                            }
                          }
                          setTableData(updated);
                          setRowCount(updated.length);
                        }
                      }}
                      className="h-8 text-sm border-0 shadow-none focus-visible:ring-1"
                      placeholder="—"
                    />
                  </TableCell>
                  <TableCell className="py-1 px-1">
                    <CategoryPicker
                      value={row.cats}
                      onChange={(val) => {
                        const updated = [...tableData];
                        updated[i] = { ...updated[i], cats: val };
                        setTableData(updated);
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <p className="text-xs text-muted-foreground">
          Paste columns from Excel — the table expands automatically.
        </p>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive animate-slide-up">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <p className="text-sm">{errorMessage}</p>
        </div>
      )}

      {/* Action Buttons */}
      {file && status !== "success" && (
        <Button
          onClick={processFile}
          disabled={status === "processing" || !prefix.trim()}
          className="w-full h-12 text-base"
        >
          {status === "processing" ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Upload className="w-5 h-5 mr-2" />
              Process File
            </>
          )}
        </Button>
      )}

      {/* Success State */}
      {status === "success" && downloadUrl && (
        <div className="space-y-4 animate-slide-up">
          <div className="flex items-center gap-2 p-3 rounded-lg bg-success/10 text-success">
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            <p className="text-sm font-medium">File processed successfully!</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={downloadResult} className="flex-1 h-12">
              <Download className="w-5 h-5 mr-2" />
              Download Result
            </Button>
            <Button variant="outline" onClick={clearFile} className="h-12">
              New File
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
