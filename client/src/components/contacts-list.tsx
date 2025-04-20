import { useState } from "react";
import { Contact } from "@shared/schema";
import { PlusIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "@/i18n/i18n";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { enUS, tr } from "date-fns/locale";
import { useLanguage } from "@/context/language-context";

// Schema for adding a contact
const addContactSchema = z.object({
  contactId: z.string()
    .min(7, "ID must be 7-12 digits")
    .max(12, "ID must be 7-12 digits")
    .regex(/^\d+$/, "ID must contain only numbers")
});

type ContactsListProps = {
  contacts: Contact[];
  selectedContactId: string | null;
  onSelectContact: (contactId: string) => void;
  onContactAdded: () => void;
  isLoading: boolean;
};

export default function ContactsList({
  contacts,
  selectedContactId,
  onSelectContact,
  onContactAdded,
  isLoading
}: ContactsListProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { language } = useLanguage();
  
  // Form for adding contacts
  const form = useForm<z.infer<typeof addContactSchema>>({
    resolver: zodResolver(addContactSchema),
    defaultValues: {
      contactId: "",
    },
  });
  
  // Mutation for adding a contact
  const addContactMutation = useMutation({
    mutationFn: async (contactId: string) => {
      await apiRequest("POST", "/api/contacts", { contactId });
    },
    onSuccess: () => {
      // Reset form
      form.reset();
      
      // Invalidate contacts query to refetch
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
      
      // Call callback
      onContactAdded();
      
      // Show success toast
      toast({
        title: t("contacts.addedTitle"),
        description: t("contacts.addedDescription"),
      });
    },
    onError: (error: Error) => {
      toast({
        title: t("contacts.addFailedTitle"),
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Handle form submission
  function onSubmit(values: z.infer<typeof addContactSchema>) {
    addContactMutation.mutate(values.contactId);
  }
  
  return (
    <div className="w-full md:w-64 bg-card border-r border-border flex flex-col">
      <div className="p-3 border-b border-border">
        <h3 className="text-sm font-medium mb-2">{t("contacts.title")}</h3>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex space-x-1">
            <FormField
              control={form.control}
              name="contactId"
              render={({ field }) => (
                <FormItem className="flex-grow">
                  <FormControl>
                    <Input 
                      placeholder={t("contacts.enterIdPlaceholder")}
                      {...field}
                      className="h-9"
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
            
            <Button 
              type="submit" 
              size="sm"
              className="h-9 px-2"
              disabled={addContactMutation.isPending}
            >
              {addContactMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <PlusIcon className="h-4 w-4" />
              )}
            </Button>
          </form>
        </Form>
      </div>
      
      <div className="overflow-y-auto flex-grow">
        {isLoading ? (
          <div className="flex justify-center p-4">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        ) : contacts.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            {t("contacts.noContacts")}
          </div>
        ) : (
          contacts.map((contact) => (
            <div
              key={contact.id}
              className={`p-3 border-b border-border hover:bg-muted cursor-pointer ${
                selectedContactId === contact.contactId 
                  ? "bg-primary/10" 
                  : ""
              }`}
              onClick={() => onSelectContact(contact.contactId)}
            >
              <div className="flex justify-between items-center">
                <div className="font-mono font-medium">{contact.contactId}</div>
              </div>
              <div className="flex items-center mt-1">
                <svg
                  className="h-3 w-3 text-emerald-500 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                <span className="text-xs text-muted-foreground truncate">
                  {t("contacts.encrypted")}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
