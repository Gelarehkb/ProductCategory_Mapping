import { useI18n, Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();

  const options: Locale[] = ["en", "de"];

  return (
    <div className="inline-flex rounded-lg border border-border overflow-hidden">
      {options.map((lang) => (
        <button
          key={lang}
          onClick={() => setLocale(lang)}
          className={cn(
            "px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition-colors",
            locale === lang
              ? "bg-primary text-primary-foreground"
              : "bg-background text-muted-foreground hover:bg-accent"
          )}
        >
          {lang}
        </button>
      ))}
    </div>
  );
}
