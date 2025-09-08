import React from 'react';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Users, 
  MessageSquare, 
  Bell, 
  BarChart3, 
  Settings,
  Smartphone,
  Calendar
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
  roles: string[];
}

const navigationItems: NavigationItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: <LayoutDashboard className="w-5 h-5" />,
    href: '#dashboard',
    roles: ['master', 'sub']
  },
  {
    id: 'tasks',
    label: 'Tasks',
    icon: <CheckSquare className="w-5 h-5" />,
    href: '#tasks',
    roles: ['master', 'sub']
  },
  {
    id: 'users',
    label: 'User Management',
    icon: <Users className="w-5 h-5" />,
    href: '#users',
    roles: ['master']
  },
  {
    id: 'chat',
    label: 'Messages',
    icon: <MessageSquare className="w-5 h-5" />,
    href: '#chat',
    roles: ['master', 'sub']
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: <Bell className="w-5 h-5" />,
    href: '#notifications',
    roles: ['master', 'sub']
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: <BarChart3 className="w-5 h-5" />,
    href: '#analytics',
    roles: ['master']
  },
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    icon: <Smartphone className="w-5 h-5" />,
    href: '#whatsapp',
    roles: ['master']
  },
  {
    id: 'calendar',
    label: 'Calendar',
    icon: <Calendar className="w-5 h-5" />,
    href: '#calendar',
    roles: ['master', 'sub']
  }
];

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  const { state } = useApp();

  const filteredItems = navigationItems.filter(item =>
    item.roles.includes(state.currentUser?.role || '')
  );

  return (
    <aside className={`
      ${state.sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      lg:translate-x-0 transition-transform duration-300 ease-in-out
      fixed lg:static inset-y-0 left-0 z-40
      w-64 bg-pure-white dark:bg-deep-charcoal border-r border-light-gray dark:border-soft-black
      flex flex-col
    `}>
      <div className="p-6 border-b border-light-gray dark:border-soft-black">
        <h2 className="text-lg font-semibold text-deep-charcoal dark:text-brand-gold">TaskFlow Pro</h2>
        <p className="text-sm text-medium-gray capitalize">
          {state.currentUser?.role === 'master' ? 'Master Admin' : `${state.currentUser?.department} Admin`}
        </p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {filteredItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`
              w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200
              ${currentPage === item.id
                ? 'bg-brand-gold text-pure-white'
                : 'text-deep-charcoal dark:text-pure-white hover:bg-off-white dark:hover:bg-soft-black hover:text-brand-gold dark:hover:text-accent-gold'
              }
            `}
          >
            {item.icon}
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-light-gray dark:border-soft-black">
        <button
          onClick={() => onNavigate('settings')}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-deep-charcoal dark:text-pure-white hover:bg-off-white dark:hover:bg-soft-black hover:text-brand-gold dark:hover:text-accent-gold transition-all duration-200"
        >
          <Settings className="w-5 h-5" />
          <span className="font-medium">Settings</span>
        </button>
      </div>
    </aside>
  );
}