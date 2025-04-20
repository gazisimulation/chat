import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslation } from "@/i18n/i18n";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Key, AlertTriangle } from "lucide-react";

// Schema for encryption key
const keySchema = z.object({
  encryptionKey: z.string()
    .min(8, "Key must be at least 8 characters")
    .max(100, "Key must be at most 100 characters"),
  confirmEncryptionKey: z.string()
    .min(8, "Key must be at least 8 characters")
}).refine(data => data.encryptionKey === data.confirmEncryptionKey, {
  message: "Keys don't match",
  path: ["confirmEncryptionKey"],
});

type SetKeyDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSetKey: (key: string) => void;
};

export default function SetKeyDialog({ 
  open, 
  onOpenChange,
  onSetKey 
}: SetKeyDialogProps) {
  const { t } = useTranslation();
  
  // Form for setting encryption key
  const form = useForm<z.infer<typeof keySchema>>({
    resolver: zodResolver(keySchema),
    defaultValues: {
      encryptionKey: "",
      confirmEncryptionKey: "",
    },
  });
  
  // Handle form submission
  function onSubmit(values: z.infer<typeof keySchema>) {
    onSetKey(values.encryptionKey);
    form.reset();
  }
  
  // Reset form when dialog closes
  function handleOpenChange(open: boolean) {
    if (!open) {
      form.reset();
    }
    onOpenChange(open);
  }
  
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("encryption.setKeyTitle")}</DialogTitle>
          <DialogDescription>
            {t("encryption.setKeyDescription")}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="encryptionKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("encryption.key")}</FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder={t("encryption.keyPlaceholder")} 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    {t("encryption.shareKeySecurely")}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="confirmEncryptionKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("encryption.confirmKey")}</FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder={t("encryption.confirmKeyPlaceholder")}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="bg-muted rounded-md p-3 flex items-start space-x-2 text-sm">
              <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
              <p>{t("encryption.warning")}</p>
            </div>
            
            <DialogFooter className="pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                {t("common.cancel")}
              </Button>
              <Button type="submit">
                <Key className="h-4 w-4 mr-1" />
                {t("encryption.saveKey")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
