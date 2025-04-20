import { useAuth } from "@/hooks/use-auth";
import { useState, useEffect } from "react";
import TopBar from "@/components/top-bar";
import ContactsList from "@/components/contacts-list";
import ChatView from "@/components/chat-view";
import UserInfo from "@/components/user-info";
import { useQuery } from "@tanstack/react-query";
import { Contact, Message } from "@shared/schema";
import { useTranslation } from "@/i18n/i18n";

export default function ChatPage() {
  const { user } = useAuth();
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const { t } = useTranslation();
  
  // Fetch contacts
  const { 
    data: contacts = [], 
    isLoading: contactsLoading,
    refetch: refetchContacts
  } = useQuery<Contact[]>({
    queryKey: ["/api/contacts"],
    enabled: !!user,
  });
  
  // Set first contact as default selected if none is selected
  useEffect(() => {
    if (contacts.length > 0 && !selectedContactId) {
      setSelectedContactId(contacts[0].contactId);
    }
  }, [contacts, selectedContactId]);
  
  // Handle contact selection
  const handleSelectContact = (contactId: string) => {
    setSelectedContactId(contactId);
  };
  
  // Handle adding a new contact
  const handleContactAdded = () => {
    refetchContacts();
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <TopBar />
      
      {/* User info bar */}
      <UserInfo />
      
      {/* Main chat interface */}
      <div className="flex-grow flex flex-col md:flex-row">
        {/* Contacts sidebar */}
        <ContactsList 
          contacts={contacts}
          selectedContactId={selectedContactId}
          onSelectContact={handleSelectContact}
          onContactAdded={handleContactAdded}
          isLoading={contactsLoading}
        />
        
        {/* Chat main view */}
        {selectedContactId ? (
          <ChatView 
            contactId={selectedContactId} 
            userId={user?.userId || ''}
          />
        ) : (
          <div className="flex-grow flex items-center justify-center bg-slate-100 dark:bg-slate-800">
            <div className="text-center p-6">
              <p className="text-muted-foreground">
                {contacts.length > 0 
                  ? t("chat.selectContact") 
                  : t("chat.noContacts")}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
