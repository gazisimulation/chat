import { useState, useEffect } from "react";
import MessageList from "./message-list";
import MessageInput from "./message-input";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Message } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useTranslation } from "@/i18n/i18n";
import { getEncryptionKey, storeEncryptionKey } from "@/lib/crypto";
import { Key, Trash2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import SetKeyDialog from "./set-key-dialog";
import DeleteDialog from "./delete-dialog";
import { useWebSocket } from "@/context/websocket-context";

type ChatViewProps = {
  contactId: string;
  userId: string;
};

export default function ChatView({ contactId, userId }: ChatViewProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { isConnected } = useWebSocket();
  const [encryptionKey, setEncryptionKey] = useState<string | null>(null);
  const [isKeyDialogOpen, setIsKeyDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Load encryption key for this contact
  useEffect(() => {
    const key = getEncryptionKey(contactId);
    setEncryptionKey(key);
  }, [contactId]);

  // Fetch messages
  const { 
    data: messages = [], 
    isLoading,
    refetch: refetchMessages
  } = useQuery<Message[]>({
    queryKey: ["/api/messages", contactId],
    queryFn: async () => {
      if (!contactId) return [];
      const res = await fetch(`/api/messages/${contactId}`);
      if (!res.ok) {
        throw new Error('Failed to fetch messages');
      }
      // Filter out any message with empty content (likely decryption failures)
      const allMessages = await res.json();
      return allMessages.filter((msg: Message) => 
        msg.encryptedContent && msg.encryptedContent.trim() !== ''
      );
    },
    enabled: !!contactId,
    refetchInterval: isConnected ? false : 3000, // Only poll when WebSocket is disconnected
  });
  
  // Set up polling for new messages while WebSocket isn't connected
  useEffect(() => {
    if (!isConnected && contactId) {
      // Poll every 2 seconds if WebSocket isn't connected
      const interval = setInterval(() => {
        refetchMessages();
      }, 2000);
      
      return () => clearInterval(interval);
    }
  }, [isConnected, contactId, refetchMessages]);
  
  // Delete chat mutation
  const deleteChatMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/messages/${userId}/${contactId}`);
    },
    onSuccess: () => {
      // Invalidate messages query to refetch
      queryClient.invalidateQueries({ queryKey: ["/api/messages", contactId] });
      
      // Show success toast
      toast({
        title: t("chat.deletedTitle"),
        description: t("chat.deletedDescription"),
      });
      
      // Close dialog
      setIsDeleteDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: t("chat.deleteFailedTitle"),
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Handle setting encryption key
  const handleSetEncryptionKey = (key: string) => {
    storeEncryptionKey(contactId, key);
    setEncryptionKey(key);
    setIsKeyDialogOpen(false);
    
    toast({
      title: t("encryption.keySetTitle"),
      description: t("encryption.keySetDescription"),
    });
  };
  
  // Handle deleting chat
  const handleDeleteChat = () => {
    deleteChatMutation.mutate();
  };
  
  // Handle sending message
  const handleMessageSent = () => {
    refetchMessages();
  };
  
  return (
    <div className="flex-grow flex flex-col bg-muted">
      {/* Chat header */}
      <div className="p-3 bg-card border-b border-border flex justify-between items-center">
        <div className="flex items-center">
          <span className="font-mono font-medium">{contactId}</span>
          <Lock className="h-4 w-4 text-emerald-500 ml-2" />
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="text-xs flex items-center"
            onClick={() => setIsKeyDialogOpen(true)}
          >
            <Key className="h-3 w-3 mr-1" />
            {t("encryption.setKey")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-xs flex items-center text-destructive border-destructive/20 hover:bg-destructive/10"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <Trash2 className="h-3 w-3 mr-1" />
            {t("chat.deleteChat")}
          </Button>
        </div>
      </div>
      
      {/* Message list */}
      <MessageList 
        messages={messages} 
        isLoading={isLoading} 
        userId={userId}
        encryptionKey={encryptionKey}
      />
      
      {/* Message input */}
      <MessageInput 
        contactId={contactId}
        userId={userId}
        encryptionKey={encryptionKey}
        onMessageSent={handleMessageSent}
        disabled={!encryptionKey}
      />
      
      {/* Set encryption key dialog */}
      <SetKeyDialog 
        open={isKeyDialogOpen}
        onOpenChange={setIsKeyDialogOpen}
        onSetKey={handleSetEncryptionKey}
      />
      
      {/* Delete chat confirmation dialog */}
      <DeleteDialog 
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteChat}
        title={t("chat.deleteConfirmTitle")}
        description={t("chat.deleteConfirmDescription")}
        isLoading={deleteChatMutation.isPending}
      />
    </div>
  );
}
