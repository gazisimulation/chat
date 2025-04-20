import { useTheme } from "@/context/theme-context";
import { useLanguage } from "@/context/language-context";
import { Lock, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/i18n/i18n";

export default function TopBar() {
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage } = useLanguage();
  const { t } = useTranslation();
  
  return (
    <header className="bg-background border-b border-border px-4 py-2 flex justify-between items-center">
      <div className="flex items-center">
        <Lock className="h-5 w-5 text-primary mr-2" />
        <h1 className="text-lg font-semibold">
          {t("app.title")}
        </h1>
      </div>
      
      <div className="flex items-center space-x-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={toggleLanguage}
          className="text-xs"
        >
          {language === "en" ? "EN" : "TR"}
        </Button>
        
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleTheme}
          className="rounded-full"
        >
          {theme === "light" ? (
            <Moon className="h-4 w-4" />
          ) : (
            <Sun className="h-4 w-4" />
          )}
        </Button>
      </div>
    </header>
  );
}
