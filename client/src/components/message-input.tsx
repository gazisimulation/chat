import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/i18n/i18n";
import { encryptMessage } from "@/lib/crypto";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Key, Lock, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useWebSocket } from "@/context/websocket-context";

// Schema for message input
const messageSchema = z.object({
  content: z.string().min(1, "Message cannot be empty")
});

type MessageInputProps = {
  userId: string;
  contactId: string;
  encryptionKey: string | null;
  onMessageSent: () => void;
  disabled?: boolean;
};

export default function MessageInput({
  userId,
  contactId,
  encryptionKey,
  onMessageSent,
  disabled = false
}: MessageInputProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  
  // Form for message input
  const form = useForm<z.infer<typeof messageSchema>>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      content: "",
    },
  });
  
  const { sendMessage, isConnected } = useWebSocket();
  
  // Mutation for sending a message
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!encryptionKey) {
        throw new Error(t("encryption.noKeyError"));
      }
      
      // Encrypt the message
      const encryptedContent = encryptMessage(content, encryptionKey);
      
      // 1. Save message in database
      const response = await apiRequest("POST", "/api/messages", {
        senderId: userId,
        receiverId: contactId,
        encryptedContent
      });
      
      const savedMessage = await response.json();
      
      console.log("Message saved:", savedMessage);
      
      // 2. Send via WebSocket for real-time delivery if connected
      if (isConnected) {
        console.log("Sending message via WebSocket");
        sendMessage({
          type: "message",
          senderId: userId,
          receiverId: contactId,
          data: savedMessage
        });
      }
    },
    onSuccess: () => {
      // Reset form
      form.reset();
      
      // Invalidate messages query to refetch
      queryClient.invalidateQueries({ queryKey: ["/api/messages", contactId] });
      
      // Call callback
      onMessageSent();
    },
    onError: (error: Error) => {
      toast({
        title: t("messages.sendFailedTitle"),
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Handle form submission
  function onSubmit(values: z.infer<typeof messageSchema>) {
    // Ensure message content is not empty
    const trimmedContent = values.content.trim();
    if (trimmedContent === '') {
      toast({
        title: t("messages.emptyMessage"),
        description: t("messages.emptyMessageDescription"),
        variant: "destructive",
      });
      return;
    }
    
    sendMessageMutation.mutate(trimmedContent);
  }
  
  return (
    <div className="p-3 bg-card border-t border-border">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex space-x-2">
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem className="flex-grow">
                <FormControl>
                  <Input 
                    placeholder={
                      disabled 
                        ? t("messages.setKeyFirst") 
                        : t("messages.typePlaceholder")
                    }
                    disabled={disabled || sendMessageMutation.isPending}
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          
          <Button 
            type="submit" 
            disabled={disabled || sendMessageMutation.isPending}
            className="flex items-center"
          >
            <Send className="h-4 w-4 mr-1" />
            {t("messages.send")}
          </Button>
        </form>
      </Form>
      
      <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
        <div className="flex items-center">
          <Lock className="h-3 w-3 mr-1" />
          {t("encryption.endToEnd")}
        </div>
        <div className={`flex items-center font-medium ${encryptionKey ? "text-emerald-500" : "text-amber-500"}`}>
          <Key className="h-3 w-3 mr-1" />
          {encryptionKey ? t("encryption.keySet") : t("encryption.noKey")}
        </div>
      </div>
    </div>
  );
}
