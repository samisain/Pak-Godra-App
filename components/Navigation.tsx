
import React from 'react';
import { AppView, NavItem, Language, User, UserRole } from '../types';
import { translations } from '../services/translations';

interface NavigationProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  language: Language;
  user?: User;
}

export const Navigation: React.FC<NavigationProps> = ({ currentView, onNavigate, language, user }) => {
  const t = translations[language];

  // Helper to get translated label
  const getLabel = (id: AppView): string => {
    switch (id) {
        case AppView.DASHBOARD: return t.navHome;
        case AppView.ANNOUNCEMENTS: return t.navNews;
        case AppView.CHAT: return t.navChat;
        case AppView.ISSUES: return t.navVoice;
        case AppView.PROFILE: return t.navProfile;
        case AppView.ADMIN: return t.navAdmin;
        default: return '';
    }
  };

  const NAV_ITEMS: Omit<NavItem, 'label'>[] = [
    { id: AppView.DASHBOARD, icon: 'home' },
    { id: AppView.ANNOUNCEMENTS, icon: 'newspaper' },
    { id: AppView.CHAT, icon: 'chat' }, // Replaced Studio with Chat
    { id: AppView.ISSUES, icon: 'campaign' },
    { id: AppView.PROFILE, icon: 'person' },
  ];

  // Add Admin Tab if user is Admin
  if (user?.role === UserRole.ADMIN) {
    NAV_ITEMS.push({ id: AppView.ADMIN, icon: 'admin_panel_settings' });
  }

  const isUrdu = language === Language.URDU;
  const isGujarati = language === Language.GUJARATI;

  return (
    <nav className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] sticky bottom-0 z-50 transition-colors duration-200">
      <div className="flex justify-around items-center h-20 px-2 overflow-x-auto"> 
        {NAV_ITEMS.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center w-full h-full min-w-[60px] space-y-1.5 transition-all duration-200 active:bg-gray-50 dark:active:bg-gray-700 ${
                isActive ? 'text-primary dark:text-primary' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
              }`}
            >
              <span className={`material-symbols-outlined transition-transform ${isActive ? 'scale-110 fill-current' : ''}`} style={{ fontSize: '26px' }}>
                {item.icon}
              </span>
              <span className={`text-[10px] font-medium leading-none ${isActive ? 'font-bold' : ''} ${isUrdu ? 'font-urdu pt-1 text-xs' : ''} ${isGujarati ? 'font-gujarati' : ''}`}>
                {getLabel(item.id)}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
