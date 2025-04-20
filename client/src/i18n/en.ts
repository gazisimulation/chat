export const enTranslations = {
  app: {
    title: "SecureChat"
  },
  
  auth: {
    title: "Secure Login",
    subtitle: "Login or register with your credentials",
    secureMessaging: "Secure Messaging",
    enterCredentials: "Enter your credentials to continue. New users will be registered automatically.",
    login: "Login",
    register: "Register",
    username: "Username",
    usernamePlaceholder: "Enter your username",
    password: "Password",
    passwordPlaceholder: "Enter your password",
    confirmPassword: "Confirm Password",
    confirmPasswordPlaceholder: "Confirm your password",
    passwordHashNotice: "Password will be hashed using SHA256",
    securityNotice: "All data is encrypted and stored securely",
    loggingIn: "Logging in...",
    registering: "Registering...",
    authenticating: "Authenticating...",
    continueSecurely: "Continue Securely",
    accountCreated: "Account Created",
    welcomeMessage: "Welcome to Secure Messaging",
    error: "Authentication Error"
  },
  
  login: {
    success: "Login successful",
    welcome: "Welcome back, {{username}}",
    failed: "Login failed"
  },
  
  register: {
    success: "Registration successful",
    welcome: "Welcome to SecureChat",
    failed: "Registration failed"
  },
  
  logout: {
    success: "Logged out",
    message: "You have been logged out successfully",
    failed: "Logout failed"
  },
  
  user: {
    yourId: "Your ID",
    copyId: "Copy ID",
    idCopied: "ID copied",
    idCopiedDescription: "Your ID has been copied to clipboard",
    logout: "Logout",
    deleteAccount: "Delete Account",
    deleteConfirmTitle: "Delete Account",
    deleteConfirmDescription: "Are you sure you want to delete your account? This action cannot be undone and will permanently delete all your messages and contacts."
  },
  
  contacts: {
    title: "Contacts",
    enterIdPlaceholder: "Enter ID",
    addContact: "Add Contact",
    encrypted: "Encrypted",
    noContacts: "No contacts yet",
    addedTitle: "Contact added",
    addedDescription: "Contact has been added successfully",
    addFailedTitle: "Failed to add contact"
  },
  
  messages: {
    typePlaceholder: "Type an encrypted message...",
    send: "Send",
    encrypted: "Encrypted",
    noMessages: "No messages yet",
    sendFailedTitle: "Failed to send message",
    setKeyFirst: "Set encryption key first",
    expire: "Messages expire after 10 minutes",
    expiringIn: "Expiring in {{time}} min",
    sent: "Sent",
    received: "Received",
    cannotDecrypt: "[Cannot decrypt message. Set encryption key first]",
    emptyMessage: "Empty message",
    emptyMessageDescription: "Cannot send an empty message"
  },
  
  chat: {
    selectContact: "Select a contact to start chatting",
    noContacts: "Add a contact to start chatting",
    deleteChat: "Delete Chat",
    deletedTitle: "Chat deleted",
    deletedDescription: "All messages have been deleted",
    deleteFailedTitle: "Failed to delete chat",
    deleteConfirmTitle: "Delete Chat",
    deleteConfirmDescription: "Are you sure you want to delete this chat? All messages will be permanently deleted."
  },
  
  encryption: {
    setKey: "Set Key",
    keySet: "Key set",
    noKey: "No key set",
    endToEnd: "End-to-end encrypted with AES256",
    setKeyTitle: "Set Encryption Key",
    setKeyDescription: "Enter an encryption key to secure your messages. Share this key with your contact through a secure channel outside this app.",
    key: "Encryption Key",
    keyPlaceholder: "Enter encryption key",
    confirmKey: "Confirm Encryption Key",
    confirmKeyPlaceholder: "Confirm encryption key",
    shareKeySecurely: "Share this key securely with your contact outside this app",
    warning: "All messages will be encrypted using AES256 with this key. If you or your contact loses this key, messages cannot be decrypted.",
    saveKey: "Save Key",
    keySetTitle: "Key set successfully",
    keySetDescription: "Your messages are now encrypted with the provided key",
    noKeyError: "No encryption key set. Set a key first."
  },
  
  account: {
    deleted: "Account deleted",
    deletedMessage: "Your account has been permanently deleted",
    deleteFailed: "Failed to delete account"
  },
  
  common: {
    cancel: "Cancel",
    delete: "Delete",
    save: "Save",
    edit: "Edit",
    remove: "Remove",
    lightMode: "Light Mode",
    darkMode: "Dark Mode"
  }
};
