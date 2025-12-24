// WhatsApp Notification Configuration
// Update these settings as needed

export const WHATSAPP_CONFIG = {
  // API Configuration
  apiKey: 'BWYcB3LFk2FgXxbTeBtriXeyHYciV',
  sender: '917861945951',
  apiEndpoint: 'https://wpauto.jenilpatel.co.in/send-message',
  
  // Default footer for all messages
  defaultFooter: 'sent from task app',
  
  // Notification Recipients
  // Add or remove contacts as needed
  contacts: [
    {
      name: 'Manthan',
      number: '917284045643',
      role: 'Admin',
      enabled: true
    },
    {
      name: 'Ketankumar',
      number: '919228502050',
      role: 'Manager',
      enabled: true
    },
    {
      name: 'Jigneshbhai',
      number: '919925823424',
      role: 'Director',
      enabled: true
    }
  ],
  
  // Notification Settings
  settings: {
    // Enable/disable specific notification types
    taskAssigned: true,
    taskCompleted: true,
    taskOverdue: true,
    taskUpdated: true,
    chatMessage: true,
    approvalRequest: true,
    approvalDecision: true,
    projectUpdate: true,
    
    // Send to all contacts or only specific roles
    sendToAll: true,
    
    // Retry settings
    retryAttempts: 3,
    retryDelay: 2000, // milliseconds
  }
};

// Export individual contacts for easy access
export const WHATSAPP_CONTACTS = WHATSAPP_CONFIG.contacts;

// Export enabled contacts only
export const ENABLED_CONTACTS = WHATSAPP_CONFIG.contacts.filter(c => c.enabled);
