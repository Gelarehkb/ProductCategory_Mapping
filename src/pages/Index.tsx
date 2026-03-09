import { FileUploader } from "@/components/FileUploader";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { FileSpreadsheet, ArrowRight } from "lucide-react";
import { useI18n } from "@/lib/i18n";

const Index = () => {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container max-w-4xl py-6 px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <FileSpreadsheet className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">{t("header.title")}</h1>
                <p className="text-sm text-muted-foreground">{t("header.subtitle")}</p>
              </div>
            </div>
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-2 px-2">
        <div className="space-y-8">
          {/* Instructions */}
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-semibold text-foreground">
              {t("main.title")}
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              {t("main.description")}
            </p>
          </div>

          {/* Flow Indicator */}
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">1</span>
              {t("flow.upload")}
            </span>
            <ArrowRight className="w-4 h-4" />
            <span className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">2</span>
              {t("flow.process")}
            </span>
            <ArrowRight className="w-4 h-4" />
            <span className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">3</span>
              {t("flow.download")}
            </span>
          </div>

          {/* File Uploader */}
          <div className="bg-card border border-border/50 rounded-xl p-4 shadow-sm">
            <FileUploader />
          </div>

          {/* Format Guide */}
          <div className="bg-secondary/30 rounded-xl p-6 space-y-4">
            <h3 className="font-medium text-foreground">{t("guide.title")}</h3>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>{t("guide.intro")}</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>{t("guide.delimiter")}</li>
                <li>{t("guide.firstCol")}</li>
                <li>{t("guide.secondCol")}</li>
                <li>{t("guide.multiPaths")}</li>
              </ul>
              <div className="mt-4 p-4 bg-card rounded-lg border border-border">
                <p className="text-xs text-muted-foreground mb-2">{t("guide.example")}</p>
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
            {t("footer.text")}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
