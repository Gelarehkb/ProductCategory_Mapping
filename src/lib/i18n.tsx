import { createContext, useContext, useState, useCallback, ReactNode } from "react";

export type Locale = "en" | "de";

const translations = {
  en: {
    // Header
    "header.title": "Category Processor",
    "header.subtitle": "Parse category hierarchies",

    // Main
    "main.title": "Process Category Data",
    "main.description": 'Upload a CSV with category paths (separated by "→"), and download a flattened version with separate columns.',
    "flow.upload": "Upload",
    "flow.process": "Process",
    "flow.download": "Download",

    // File uploader
    "prefix.label": "Output File Prefix",
    "prefix.placeholder": "Enter prefix for output filename",
    "prefix.output": "Output:",
    "upload.drop": "Drop your file here",
    "upload.browse": "or click to browse • CSV, Excel (.xlsx, .xls)",
    "upload.preview": "Preview (first {count} rows of {name})",
    "upload.or": "Or",
    "upload.manual": "Enter columns manually below",
    "upload.processBtn": "Process File",
    "upload.processing": "Processing...",
    "upload.downloadCsv": "Download CSV",
    "upload.downloadResult": "Download Result",
    "upload.newFile": "New File",
    "upload.success": "File processed successfully!",
    "upload.errorFormat": "Please upload a CSV or Excel file (.csv, .xlsx, .xls)",
    "upload.errorSize": "File size must be less than 50MB",
    "upload.errorGeneric": "Failed to process file. Please check the file format.",

    // Spreadsheet
    "table.rows": "Rows:",
    "table.undo": "Undo",
    "table.redo": "Redo",
    "table.colArtikelnummer": "Artikelnummer",
    "table.colCategories": "Categories",
    "table.colCategoryList": "Category list",
    "table.help": "Click to select • Click again or Enter to edit • Arrow keys / Tab to navigate • Fill handle ■ to copy down • {mod}+C / {mod}+V • {mod}+Z / {mod}+Y",

    // Format guide
    "guide.title": "Expected CSV Format",
    "guide.intro": "Your CSV file should have:",
    "guide.delimiter": "Semicolon (;) as delimiter",
    "guide.firstCol": "First column: ID",
    "guide.secondCol": 'Second column: Category paths separated by "->"',
    "guide.multiPaths": "Multiple paths per cell allowed (one per line)",
    "guide.example": "Example input:",

    // Footer
    "footer.text": "All processing happens in your browser • No data is sent to any server",
  },
  de: {
    // Header
    "header.title": "Kategorie-Prozessor",
    "header.subtitle": "Kategoriehierarchien verarbeiten",

    // Main
    "main.title": "Kategoriedaten verarbeiten",
    "main.description": 'Laden Sie eine CSV mit Kategoriepfaden (getrennt durch „→") hoch und laden Sie eine aufgeteilte Version mit separaten Spalten herunter.',
    "flow.upload": "Hochladen",
    "flow.process": "Verarbeiten",
    "flow.download": "Herunterladen",

    // File uploader
    "prefix.label": "Ausgabedatei-Präfix",
    "prefix.placeholder": "Präfix für Ausgabedateiname eingeben",
    "prefix.output": "Ausgabe:",
    "upload.drop": "Datei hier ablegen",
    "upload.browse": "oder klicken zum Durchsuchen • CSV, Excel (.xlsx, .xls)",
    "upload.preview": "Vorschau (erste {count} Zeilen von {name})",
    "upload.or": "Oder",
    "upload.manual": "Spalten unten manuell eingeben",
    "upload.processBtn": "Datei verarbeiten",
    "upload.processing": "Verarbeitung...",
    "upload.downloadCsv": "CSV herunterladen",
    "upload.downloadResult": "Ergebnis herunterladen",
    "upload.newFile": "Neue Datei",
    "upload.success": "Datei erfolgreich verarbeitet!",
    "upload.errorFormat": "Bitte laden Sie eine CSV- oder Excel-Datei hoch (.csv, .xlsx, .xls)",
    "upload.errorSize": "Die Dateigröße darf 50 MB nicht überschreiten",
    "upload.errorGeneric": "Datei konnte nicht verarbeitet werden. Bitte überprüfen Sie das Dateiformat.",

    // Spreadsheet
    "table.rows": "Zeilen:",
    "table.undo": "Rückgängig",
    "table.redo": "Wiederholen",
    "table.colArtikelnummer": "Artikelnummer",
    "table.colCategories": "Kategorien",
    "table.colCategoryList": "Kategorieliste",
    "table.help": "Klicken zum Auswählen • Erneut klicken oder Enter zum Bearbeiten • Pfeiltasten / Tab zum Navigieren • Ausfüllkästchen ■ zum Kopieren • {mod}+C / {mod}+V • {mod}+Z / {mod}+Y",

    // Format guide
    "guide.title": "Erwartetes CSV-Format",
    "guide.intro": "Ihre CSV-Datei sollte enthalten:",
    "guide.delimiter": "Semikolon (;) als Trennzeichen",
    "guide.firstCol": "Erste Spalte: ID",
    "guide.secondCol": 'Zweite Spalte: Kategoriepfade getrennt durch „->"',
    "guide.multiPaths": "Mehrere Pfade pro Zelle erlaubt (einer pro Zeile)",
    "guide.example": "Beispieleingabe:",

    // Footer
    "footer.text": "Die gesamte Verarbeitung erfolgt in Ihrem Browser • Es werden keine Daten an einen Server gesendet",
  },
} as const;

type TranslationKey = keyof typeof translations.en;

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey, params?: Record<string, string>) => string;
}

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>("en");

  const t = useCallback(
    (key: TranslationKey, params?: Record<string, string>): string => {
      let text: string = translations[locale][key] ?? translations.en[key] ?? key;
      if (params) {
        for (const [k, v] of Object.entries(params)) {
          text = text.replace(`{${k}}`, v);
        }
      }
      return text;
    },
    [locale]
  );

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
