import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/i18n/i18n";
import { CopyIcon, LogOut, UserX } from "lucide-react";
import { useState } from "react";
import DeleteDialog from "./delete-dialog";
import { useToast } from "@/hooks/use-toast";

export default function UserInfo() {
  const { user, logoutMutation, deleteAccountMutation } = useAuth();
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Handle copy user ID
  const handleCopyId = () => {
    if (user) {
      navigator.clipboard.writeText(user.userId);
      toast({
        title: t("user.idCopied"),
        description: t("user.idCopiedDescription"),
      });
    }
  };
  
  // Handle logout
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  // Handle delete account
  const handleDeleteAccount = () => {
    deleteAccountMutation.mutate();
  };
  
  return (
    <div className="bg-card border-b border-border px-4 py-3">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm font-medium">{t("user.yourId")}</p>
          <div className="flex items-center mt-1">
            <span className="text-lg font-mono font-semibold">{user?.userId}</span>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 ml-1 text-muted-foreground hover:text-foreground"
              onClick={handleCopyId}
            >
              <CopyIcon className="h-3.5 w-3.5" />
              <span className="sr-only">{t("user.copyId")}</span>
            </Button>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-sm text-muted-foreground hover:text-foreground"
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
          >
            <LogOut className="h-3.5 w-3.5 mr-1" />
            {t("user.logout")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-sm text-destructive border-destructive/20 hover:bg-destructive/10"
            onClick={() => setIsDeleteDialogOpen(true)}
            disabled={deleteAccountMutation.isPending}
          >
            <UserX className="h-3.5 w-3.5 mr-1" />
            {t("user.deleteAccount")}
          </Button>
        </div>
      </div>
      
      {/* Delete account confirmation dialog */}
      <DeleteDialog 
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteAccount}
        title={t("user.deleteConfirmTitle")}
        description={t("user.deleteConfirmDescription")}
        isLoading={deleteAccountMutation.isPending}
      />
    </div>
  );
}
