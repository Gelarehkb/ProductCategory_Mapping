import { useState, useCallback, useRef } from "react";
import { Upload, FileSpreadsheet, X, Download, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type UploadStatus = "idle" | "uploading" | "success" | "error";

interface FileUploaderProps {
  apiEndpoint: string;
}

export function FileUploader({ apiEndpoint }: FileUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
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

  const handleFile = useCallback((selectedFile: File) => {
    setErrorMessage("");
    setDownloadUrl(null);
    setStatus("idle");

    if (validateFile(selectedFile)) {
      setFile(selectedFile);
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
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const processFile = async () => {
    if (!file) return;

    setStatus("uploading");
    setErrorMessage("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(apiEndpoint, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setStatus("success");
    } catch (error) {
      setStatus("error");
      setErrorMessage(
        error instanceof Error 
          ? error.message 
          : "Failed to process file. Please check your API endpoint."
      );
    }
  };

  const downloadResult = () => {
    if (!downloadUrl) return;

    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = `processed_${file?.name.replace(/\.(xlsx|xls)$/i, ".csv") || "result.csv"}`;
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
    <div className="w-full max-w-xl mx-auto space-y-6 animate-slide-up">
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
          disabled={status === "uploading"}
          className="w-full h-12 text-base"
        >
          {status === "uploading" ? (
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
