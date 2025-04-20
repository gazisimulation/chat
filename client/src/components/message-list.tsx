import { useEffect, useRef } from "react";
import { Message } from "@shared/schema";
import { format } from "date-fns";
import { useTranslation } from "@/i18n/i18n";
import { decryptMessage } from "@/lib/crypto";
import { Loader2, Lock, Info } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

type MessageListProps = {
  messages: Message[];
  isLoading: boolean;
  userId: string;
  encryptionKey: string | null;
};

export default function MessageList({ 
  messages, 
  isLoading, 
  userId,
  encryptionKey
}: MessageListProps) {
  const { t } = useTranslation();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  // Set up auto-delete timer for messages
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      
      // Check each message
      messages.forEach(message => {
        // If message is older than 10 minutes (600000 ms) and has been seen
        const msgAge = now.getTime() - new Date(message.createdAt).getTime();
        if (msgAge > 600000 && message.seen) {
          // Delete message
          apiRequest("DELETE", `/api/messages/${message.id}`).then(() => {
            // Invalidate messages query to refetch
            queryClient.invalidateQueries({ 
              queryKey: ["/api/messages", message.receiverId === userId ? message.senderId : message.receiverId] 
            });
          });
        }
      });
    }, 10000); // Check every 10 seconds
    
    return () => clearInterval(timer);
  }, [messages, userId]);
  
  // Calculate time until expiry for a message
  const getExpiryTime = (createdAt: Date, seen: boolean): number => {
    if (!seen) return 10; // Not seen yet
    
    const now = new Date();
    const msgAge = now.getTime() - new Date(createdAt).getTime();
    const minutesLeft = Math.max(0, Math.floor((600000 - msgAge) / 60000));
    
    return minutesLeft;
  };
  
  // Mutation for marking message as seen
  const markSeenMutation = useMutation({
    mutationFn: async (messageId: number) => {
      await apiRequest("PATCH", `/api/messages/${messageId}/seen`, {});
    },
    onSuccess: () => {
      // No need to invalidate as the UI already reflects the change
    }
  });
  
  // Mark incoming messages as seen when rendered
  useEffect(() => {
    messages.forEach(message => {
      if (message.receiverId === userId && !message.seen) {
        markSeenMutation.mutate(message.id);
      }
    });
  }, [messages, userId]);
  
  return (
    <div className="flex-grow p-4 overflow-y-auto space-y-3">
      {isLoading ? (
        <div className="flex justify-center items-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full">
          <Lock className="h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground text-center">
            {t("messages.noMessages")}
          </p>
        </div>
      ) : (
        <>
          {messages.map((message) => {
            const isSentByMe = message.senderId === userId;
            
            // Try to decrypt message
            const decryptedContent = encryptionKey 
              ? decryptMessage(message.encryptedContent, encryptionKey)
              : t("messages.cannotDecrypt");
            
            // Calculate expiry time
            const expiryMin = getExpiryTime(new Date(message.createdAt), message.seen);
            
            return (
              <div
                key={message.id}
                className={`flex flex-col ${
                  isSentByMe ? "items-end self-end" : "items-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 shadow-sm ${
                    isSentByMe
                      ? "bg-primary text-primary-foreground"
                      : "bg-card"
                  }`}
                >
                  <p className="text-sm break-words">{decryptedContent}</p>
                  <div className="flex justify-between items-center mt-1">
                    <span className={`text-xs ${isSentByMe ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                      {format(new Date(message.createdAt), "HH:mm")}
                    </span>
                    <span className={`text-xs flex items-center ${isSentByMe ? "text-primary-foreground/70" : "text-emerald-500"}`}>
                      <Lock className="h-3 w-3 mr-0.5" />
                      {t("messages.encrypted")}
                    </span>
                  </div>
                </div>
                <div className={`text-xs text-muted-foreground mt-1 ${isSentByMe ? "mr-2" : "ml-2"}`}>
                  {message.seen 
                    ? t("messages.expiringIn", { time: expiryMin }) 
                    : isSentByMe 
                      ? t("messages.sent")
                      : t("messages.received")}
                </div>
              </div>
            );
          })}
          
          {/* Security notice message */}
          <div className="flex justify-center my-4">
            <div className="bg-muted-foreground/10 rounded-full px-3 py-1 text-xs text-muted-foreground flex items-center">
              <Info className="h-3 w-3 mr-1" />
              {t("messages.expire")}
            </div>
          </div>
          
          {/* Invisible element for auto-scrolling */}
          <div ref={messagesEndRef} />
        </>
      )}
    </div>
  );
}
