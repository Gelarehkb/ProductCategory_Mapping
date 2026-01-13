import { FileUploader } from "@/components/FileUploader";
import { FileSpreadsheet, ArrowRight } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container max-w-4xl py-6 px-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">Category Processor</h1>
              <p className="text-sm text-muted-foreground">Parse category hierarchies</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-4xl py-12 px-4">
        <div className="space-y-8">
          {/* Instructions */}
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-semibold text-foreground">
              Process Category Data
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Upload a CSV with category paths (separated by "→"), 
              and download a flattened version with separate columns.
            </p>
          </div>

          {/* Flow Indicator */}
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">1</span>
              Upload
            </span>
            <ArrowRight className="w-4 h-4" />
            <span className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">2</span>
              Process
            </span>
            <ArrowRight className="w-4 h-4" />
            <span className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">3</span>
              Download
            </span>
          </div>

          {/* File Uploader */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <FileUploader />
          </div>

          {/* Format Guide */}
          <div className="bg-secondary/30 rounded-xl p-6 space-y-4">
            <h3 className="font-medium text-foreground">Expected CSV Format</h3>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>Your CSV file should have:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Semicolon (;) as delimiter</li>
                <li>First column: ID</li>
                <li>Second column: Category paths separated by "-&gt;"</li>
                <li>Multiple paths per cell allowed (one per line)</li>
              </ul>
              <div className="mt-4 p-4 bg-card rounded-lg border border-border">
                <p className="text-xs text-muted-foreground mb-2">Example input:</p>
                <pre className="text-xs text-foreground overflow-x-auto">
{`ID;Categories
123;Electronics -> Phones -> Smartphones
456;Home -> Kitchen -> Appliances`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-auto">
        <div className="container max-w-4xl py-4 px-4">
          <p className="text-xs text-muted-foreground text-center">
            All processing happens in your browser • No data is sent to any server
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
