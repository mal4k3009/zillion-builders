import { useState, useEffect } from 'react';
import { MessageSquare, Plus, Trash2, Check, X } from 'lucide-react';
import { whatsappService } from '../../services/whatsappService';
import { WHATSAPP_CONFIG } from '../../config/whatsappConfig';

interface Contact {
  name: string;
  number: string;
  role?: string;
  enabled?: boolean;
}

export function WhatsAppSettings() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [newContact, setNewContact] = useState({ name: '', number: '', role: '' });
  const [showAddForm, setShowAddForm] = useState(false);
  const [testMessage, setTestMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = () => {
    const loadedContacts = whatsappService.getContacts();
    setContacts(loadedContacts);
  };

  const handleAddContact = () => {
    if (!newContact.name || !newContact.number) {
      alert('Please fill in all required fields');
      return;
    }

    whatsappService.addContact(newContact.name, newContact.number);
    setNewContact({ name: '', number: '', role: '' });
    setShowAddForm(false);
    loadContacts();
  };

  const handleRemoveContact = (number: string) => {
    if (confirm('Are you sure you want to remove this contact?')) {
      whatsappService.removeContact(number);
      loadContacts();
    }
  };

  const handleSendTestMessage = async () => {
    if (!testMessage.trim()) {
      alert('Please enter a test message');
      return;
    }

    setIsSending(true);
    try {
      await whatsappService.sendNotificationToAll(testMessage);
      alert('Test message sent to all 5 contacts via webhook! Check your n8n workflow.');
      setTestMessage('');
    } catch (error) {
      alert('Failed to send test message. Check console for details.');
      console.error('Test message error:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleQuickTest = async () => {
    setIsSending(true);
    try {
      const testMsg = `🧪 Quick Test from WhatsApp Settings\n\nTimestamp: ${new Date().toLocaleString()}\n\nThis is a test message to verify the webhook integration.`;
      await whatsappService.sendNotificationToAll(testMsg);
      alert('✅ Quick test sent to all 5 contacts! Check your n8n workflow.');
    } catch (error) {
      alert('❌ Quick test failed. Check console for details.');
      console.error('Quick test error:', error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
            <MessageSquare className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              WhatsApp Notifications
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Manage notification recipients and settings
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Contact
        </button>
      </div>

      {/* API Configuration */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Webhook Configuration
        </h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between items-start">
            <span className="text-gray-600 dark:text-gray-400">Webhook URL:</span>
            <span className="text-gray-900 dark:text-white font-mono text-xs break-all max-w-md text-right">
              {WHATSAPP_CONFIG.webhookUrl}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Default Recipient:</span>
            <span className="text-gray-900 dark:text-white font-mono">
              +{WHATSAPP_CONFIG.defaultRecipient}
            </span>
          </div>
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleQuickTest}
              disabled={isSending}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <MessageSquare className="w-4 h-4" />
              {isSending ? 'Sending...' : '🚀 Quick Test Webhook'}
            </button>
          </div>
        </div>
      </div>

      {/* Test Notification */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Send Custom Test Message
        </h3>
        <div className="space-y-4">
          <textarea
            value={testMessage}
            onChange={(e) => setTestMessage(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
            rows={4}
            placeholder="Enter your test message here..."
          />
          <button
            onClick={handleSendTestMessage}
            disabled={isSending}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <MessageSquare className="w-4 h-4" />
            {isSending ? 'Sending...' : 'Send Custom Test'}
          </button>
        </div>
      </div>

      {/* Add Contact Form */}
      {showAddForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Add New Contact
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Name *
              </label>
              <input
                type="text"
                value={newContact.name}
                onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                placeholder="Contact name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Phone Number * (with country code, e.g., 919876543210)
              </label>
              <input
                type="text"
                value={newContact.number}
                onChange={(e) => setNewContact({ ...newContact, number: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                placeholder="919876543210"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Role (Optional)
              </label>
              <input
                type="text"
                value={newContact.role}
                onChange={(e) => setNewContact({ ...newContact, role: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                placeholder="e.g., Manager, Director"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleAddContact}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Check className="w-4 h-4" />
                Add Contact
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contacts List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Notification Recipients ({contacts.length})
        </h3>
        <div className="space-y-3">
          {contacts.map((contact, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <div className="font-medium text-gray-900 dark:text-white">
                    {contact.name}
                  </div>
                  {contact.role && (
                    <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded">
                      {contact.role}
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 font-mono mt-1">
                  +{contact.number}
                </div>
              </div>
              <button
                onClick={() => handleRemoveContact(contact.number)}
                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                title="Remove contact"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          {contacts.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No contacts configured. Add contacts to receive notifications.
            </div>
          )}
        </div>
      </div>

      {/* Notification Types */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Active Notification Types
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Object.entries(WHATSAPP_CONFIG.settings).map(([key, value]) => {
            if (typeof value === 'boolean') {
              return (
                <div
                  key={key}
                  className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                >
                  {value ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <X className="w-4 h-4 text-red-600" />
                  )}
                  <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                </div>
              );
            }
            return null;
          })}
        </div>
      </div>
    </div>
  );
}
