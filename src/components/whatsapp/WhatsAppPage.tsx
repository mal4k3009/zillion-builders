import React, { useState } from 'react';
import { Smartphone, Send, MessageSquare, Users, Clock, CheckCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { WhatsAppMessage } from '../../types';

export function WhatsAppPage() {
  const { state, dispatch } = useApp();
  const [selectedTemplate, setSelectedTemplate] = useState<'task_assigned' | 'task_completed' | 'daily_summary' | 'overdue_alert'>('task_assigned');
  const [recipient, setRecipient] = useState('');
  const [customMessage, setCustomMessage] = useState('');

  const messageTemplates = {
    task_assigned: {
      title: 'Task Assignment',
      template: '📋 New Task Assigned\n\nHi {name},\n\nYou have been assigned a new {priority} priority task:\n\n"{title}"\n\nDue: {dueDate}\n\nPlease check your dashboard for details.',
      icon: '📋',
      color: 'bg-blue-500'
    },
    task_completed: {
      title: 'Task Completion',
      template: '✅ Task Update\n\nHi Admin,\n\n{name} has completed the task:\n\n"{title}"\n\nCompleted on: {completedDate}\n\nCheck the dashboard for details.',
      icon: '✅',
      color: 'bg-green-500'
    },
    daily_summary: {
      title: 'Daily Summary',
      template: '⏰ Daily Summary\n\nGood morning {name}!\n\nYour pending tasks for today:\n\n{taskList}\n\nTotal: {count} pending tasks\n\nHave a productive day!',
      icon: '⏰',
      color: 'bg-yellow-500'
    },
    overdue_alert: {
      title: 'Overdue Alert',
      template: '🚨 Overdue Tasks Alert\n\nHi {name},\n\nThe following tasks are overdue:\n\n{overdueList}\n\nPlease update these tasks as soon as possible.',
      icon: '🚨',
      color: 'bg-red-500'
    }
  };

  const sendWhatsAppMessage = () => {
    if (!recipient || !selectedTemplate) return;

    const newMessage: WhatsAppMessage = {
      id: Date.now(),
      to: recipient,
      message: customMessage || generateTemplateMessage(selectedTemplate),
      type: selectedTemplate,
      sentAt: new Date().toISOString(),
      status: 'sent'
    };

    dispatch({ type: 'ADD_WHATSAPP_MESSAGE', payload: newMessage });
    
    // Add activity
    dispatch({
      type: 'ADD_ACTIVITY',
      payload: {
        id: Date.now(),
        type: 'message_sent',
        description: `Sent WhatsApp ${messageTemplates[selectedTemplate].title} to ${recipient}`,
        userId: state.currentUser!.id,
        timestamp: new Date().toISOString()
      }
    });

    setRecipient('');
    setCustomMessage('');
  };

  const generateTemplateMessage = (templateType: keyof typeof messageTemplates) => {
    const template = messageTemplates[templateType].template;
    const sampleData = {
      name: 'Sarah Johnson',
      priority: 'HIGH',
      title: 'Prepare Q4 Sales Presentation',
      dueDate: 'Dec 20, 2024',
      completedDate: 'Dec 15, 2024',
      taskList: '1. Social Media Campaign Launch (URGENT)\n2. Market Research Analysis (HIGH)',
      count: '2',
      overdueList: '1. Q1 Budget Review (Due: Dec 10)\n2. Client Meeting Prep (Due: Dec 12)'
    };

    let message = template;
    Object.entries(sampleData).forEach(([key, value]) => {
      message = message.replace(new RegExp(`{${key}}`, 'g'), value);
    });

    return message;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <Clock className="w-4 h-4 text-gray-500" />;
      case 'delivered':
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case 'read':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">WhatsApp Business</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Automated task notifications via WhatsApp</p>
        </div>
        <div className="bg-green-500 p-3 rounded-xl">
          <Smartphone className="w-6 h-6 text-white" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Message Composer */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Send Message</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Message Template
              </label>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(messageTemplates).map(([key, template]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedTemplate(key as typeof selectedTemplate)}
                    className={`p-4 rounded-lg border transition-all ${
                      selectedTemplate === key
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className={`${template.color} w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-2`}>
                      <span className="text-white text-sm">{template.icon}</span>
                    </div>
                    <p className="text-xs font-medium text-gray-900 dark:text-white">{template.title}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Recipient Phone Number
              </label>
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="+1234567890"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Message Preview
              </label>
              <textarea
                value={customMessage || generateTemplateMessage(selectedTemplate)}
                onChange={(e) => setCustomMessage(e.target.value)}
                rows={8}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none"
              />
            </div>

            <button
              onClick={sendWhatsAppMessage}
              disabled={!recipient}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              Send WhatsApp Message
            </button>
          </div>
        </div>

        {/* Message History */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Message History</h3>
          
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {state.whatsappMessages
              .sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime())
              .map((message) => (
                <div key={message.id} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{messageTemplates[message.type].icon}</span>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {messageTemplates[message.type].title}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{message.to}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(message.status)}
                      <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                        {message.status}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-3">
                    {message.message}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Sent: {formatTime(message.sentAt)}
                  </p>
                </div>
              ))}
          </div>

          {state.whatsappMessages.length === 0 && (
            <div className="text-center py-8">
              <MessageSquare className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400">No messages sent yet</p>
            </div>
          )}
        </div>
      </div>

      {/* WhatsApp Statistics */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">WhatsApp Statistics</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-xl mb-3">
              <Send className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{state.whatsappMessages.length}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Sent</p>
          </div>

          <div className="text-center">
            <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-xl mb-3">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {state.whatsappMessages.filter(m => m.status === 'delivered' || m.status === 'read').length}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Delivered</p>
          </div>

          <div className="text-center">
            <div className="bg-purple-100 dark:bg-purple-900/30 p-4 rounded-xl mb-3">
              <Users className="w-8 h-8 text-purple-600 dark:text-purple-400 mx-auto" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {new Set(state.whatsappMessages.map(m => m.to)).size}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Recipients</p>
          </div>

          <div className="text-center">
            <div className="bg-yellow-100 dark:bg-yellow-900/30 p-4 rounded-xl mb-3">
              <Clock className="w-8 h-8 text-yellow-600 dark:text-yellow-400 mx-auto" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {state.whatsappMessages.filter(m => {
                const sentToday = new Date(m.sentAt).toDateString() === new Date().toDateString();
                return sentToday;
              }).length}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Today</p>
          </div>
        </div>
      </div>
    </div>
  );
}