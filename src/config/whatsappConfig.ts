// WhatsApp Notification Configuration
// Update these settings as needed

export const WHATSAPP_CONFIG = {
  // API Configuration - Using n8n webhook
  webhookUrl: 'https://n8n.srv954870.hstgr.cloud/webhook/0471cb53-a2cc-440a-8ef7-0b11e9244460',
  defaultRecipient: '917802032338',
  
  // Legacy API config (not used with webhook)
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
    },
    {
      name: 'Malak',
      number: '919313061975',
      role: 'Developer',
      enabled: true
    },
    {
      name: 'Dhrumil Patel',
      number: '917802032338',
      role: 'Team Member',
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
