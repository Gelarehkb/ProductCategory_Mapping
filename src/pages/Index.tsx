import { useState } from "react";
import { FileUploader } from "@/components/FileUploader";
import { ApiEndpointInput } from "@/components/ApiEndpointInput";
import { FileSpreadsheet, Code2, ArrowRight } from "lucide-react";

const Index = () => {
  const [apiEndpoint, setApiEndpoint] = useState("");

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
              <h1 className="text-xl font-semibold text-foreground">File Processor</h1>
              <p className="text-sm text-muted-foreground">Upload, process, download</p>
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
              Process Your Data Files
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Upload a CSV or Excel file, send it to your Python backend, 
              and download the processed result.
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

          {/* API Endpoint Config */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Code2 className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">API Endpoint</span>
            </div>
            <ApiEndpointInput value={apiEndpoint} onChange={setApiEndpoint} />
          </div>

          {/* File Uploader */}
          {apiEndpoint && (
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <FileUploader apiEndpoint={apiEndpoint} />
            </div>
          )}

          {/* Setup Guide */}
          {!apiEndpoint && (
            <div className="bg-secondary/30 rounded-xl p-6 space-y-4">
              <h3 className="font-medium text-foreground">Quick Setup Guide</h3>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>Your Python API should:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Accept POST requests with multipart/form-data</li>
                  <li>Receive the file in a form field named "file"</li>
                  <li>Return the processed CSV file in the response body</li>
                </ul>
                <div className="mt-4 p-4 bg-card rounded-lg border border-border">
                  <p className="text-xs text-muted-foreground mb-2">Example Flask endpoint:</p>
                  <pre className="text-xs text-foreground overflow-x-auto">
{`@app.route('/process', methods=['POST'])
def process_file():
    file = request.files['file']
    # Your processing logic here
    processed_df = your_python_function(file)
    return processed_df.to_csv(index=False)`}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-auto">
        <div className="container max-w-4xl py-4 px-4">
          <p className="text-xs text-muted-foreground text-center">
            Files are sent directly to your Python API • Nothing is stored on our servers
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
