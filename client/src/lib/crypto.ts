import CryptoJS from 'crypto-js';

// Function to encrypt a message using AES256
export function encryptMessage(message: string, password: string): string {
  if (!message || !password) return '';
  return CryptoJS.AES.encrypt(message, password).toString();
}

// Function to decrypt a message using AES256
export function decryptMessage(encryptedMessage: string, password: string): string {
  if (!encryptedMessage || !password) return '';
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedMessage, password);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('Decryption error:', error);
    return '[Decryption failed. Wrong key?]';
  }
}

// Function to hash password with SHA256 for login/register
export function hashPassword(password: string): string {
  return CryptoJS.SHA256(password).toString();
}

// Generate a unique message ID
export function generateMessageId(): string {
  return CryptoJS.lib.WordArray.random(16).toString();
}

// Securely store encryption keys in localStorage
export function storeEncryptionKey(contactId: string, key: string): void {
  if (!contactId || !key) return;
  
  // Get existing keys
  const keysJson = localStorage.getItem('encryptionKeys');
  const keys = keysJson ? JSON.parse(keysJson) : {};
  
  // Add or update key for this contact
  keys[contactId] = key;
  
  // Save back to localStorage
  localStorage.setItem('encryptionKeys', JSON.stringify(keys));
}

// Retrieve an encryption key for a specific contact
export function getEncryptionKey(contactId: string): string | null {
  if (!contactId) return null;
  
  // Get existing keys
  const keysJson = localStorage.getItem('encryptionKeys');
  if (!keysJson) return null;
  
  const keys = JSON.parse(keysJson);
  return keys[contactId] || null;
}

// Delete an encryption key
export function deleteEncryptionKey(contactId: string): void {
  if (!contactId) return;
  
  // Get existing keys
  const keysJson = localStorage.getItem('encryptionKeys');
  if (!keysJson) return;
  
  const keys = JSON.parse(keysJson);
  
  // Delete key for this contact
  delete keys[contactId];
  
  // Save back to localStorage
  localStorage.setItem('encryptionKeys', JSON.stringify(keys));
}
