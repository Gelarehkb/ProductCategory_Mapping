import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link2, Check, AlertCircle } from "lucide-react";

interface ApiEndpointInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function ApiEndpointInput({ value, onChange }: ApiEndpointInputProps) {
  const [isEditing, setIsEditing] = useState(!value);
  const [inputValue, setInputValue] = useState(value);
  const [error, setError] = useState("");

  const validateUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSave = () => {
    if (!inputValue.trim()) {
      setError("Please enter an API endpoint");
      return;
    }

    if (!validateUrl(inputValue)) {
      setError("Please enter a valid URL (e.g., https://your-api.com/process)");
      return;
    }

    setError("");
    onChange(inputValue);
    setIsEditing(false);
  };

  if (!isEditing && value) {
    return (
      <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary/50 animate-slide-up">
        <Link2 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        <span className="text-sm text-foreground truncate flex-1">{value}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsEditing(true)}
          className="text-xs h-7"
        >
          Change
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3 animate-slide-up">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="url"
            placeholder="https://your-python-api.com/process"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setError("");
            }}
            className="pl-10"
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
          />
        </div>
        <Button onClick={handleSave} size="icon" className="shrink-0">
          <Check className="w-4 h-4" />
        </Button>
      </div>
      {error && (
        <div className="flex items-center gap-2 text-destructive text-sm">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>{error}</span>
        </div>
      )}
      <p className="text-xs text-muted-foreground">
        Enter the URL of your Python API that accepts file uploads via POST
      </p>
    </div>
  );
}
