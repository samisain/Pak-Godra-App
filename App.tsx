
import React, { useState, useEffect } from 'react';
import { AppView, User, UserStatus, Language, Announcement, NewsCategory, UserRole, ChatMessage, MessageType, Survey, SurveyType, MessageStatus } from './types';
import { Navigation } from './components/Navigation';
import { Dashboard } from './components/Dashboard';
import { Auth } from './components/Auth';
import { Profile } from './components/Profile';
import { Elections } from './components/Elections';
import { NewsFeed } from './components/NewsFeed';
import { Issues } from './components/Issues';
import { AdminDashboard } from './components/AdminDashboard';
import { Chat } from './components/Chat';
import { translations } from './services/translations';
import { requestNotificationPermission, sendSystemNotification } from './services/notifications';
import { Toast } from './components/Toast';

const MaterialSymbolsLink = () => (
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0" />
);

const INITIAL_POSTS: Announcement[] = [
  {
    id: '1',
    title: 'Sad Demise - Haji Abdul Rehman',
    content: 'It is with great sadness that we announce the passing of Haji Abdul Rehman (Sector 11-G). Namaz-e-Janaza will be held at Jamia Masjid Godhra at Asr prayer today. May Allah grant him highest place in Jannah.',
    category: NewsCategory.DEATH_ANNOUNCEMENT,
    date: '10 mins ago',
    author: 'Admin Committee',
    allowComments: false,
    comments: []
  },
  {
    id: '2',
    title: 'Urgent: Blood Donor Required',
    content: 'O+ blood required urgently at Civil Hospital for a community member. Please contact 0300-1234567 if you can donate immediately.',
    category: NewsCategory.EMERGENCY,
    date: '2 hours ago',
    author: 'Welfare Wing',
    allowComments: true,
    comments: [
      { id: 'c1', userId: 'ahmed@pakgodhra.com', userName: 'Ahmed Ali', content: 'I am on my way.', timestamp: '1 hr ago' }
    ]
  },
  {
    id: '3',
    title: 'Annual General Meeting 2024',
    content: 'All registered members are requested to attend the AGM on Sunday, 25th Oct at Community Hall. Agenda includes annual budget approval and election schedule.',
    category: NewsCategory.MEETING,
    date: '1 day ago',
    author: 'General Secretary',
    allowComments: true,
    comments: []
  }
];

const INITIAL_AREAS = [
  'Godhra Colony',
  'Sector 11-G',
  'New Karachi',
  'Surjani Town',
  'North Karachi',
  'Gulshan-e-Iqbal'
];

const INITIAL_MESSAGES: ChatMessage[] = [
  { id: '1', senderId: 'sys', senderName: 'Moderator', content: 'Welcome to the Community General Chat!', mediaType: MessageType.TEXT, timestamp: '10:00 AM', isMe: false, status: MessageStatus.READ },
];

const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);

const INITIAL_SURVEYS: Survey[] = [
  {
    id: 's1',
    question: 'Should we upgrade the community hall solar system?',
    type: SurveyType.POLL,
    isActive: true,
    totalVotes: 150,
    votedUserIds: [],
    createdAt: '2 days ago',
    endTime: tomorrow.toISOString(),
    options: [
      { id: 'o1', text: 'Yes, it saves money', votes: 120 },
      { id: 'o2', text: 'No, too expensive', votes: 30 }
    ]
  }
];

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [language, setLanguage] = useState<Language>(Language.ENGLISH);
  const [announcements, setAnnouncements] = useState<Announcement[]>(INITIAL_POSTS);
  const [areas, setAreas] = useState<string[]>(INITIAL_AREAS);
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [surveys, setSurveys] = useState<Survey[]>(INITIAL_SURVEYS);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const [toast, setToast] = useState<{message: string, subMessage?: string, type?: 'info' | 'success'} | null>(null);

  const t = translations[language];

  const getInitialPosts = (lang: Language): Announcement[] => {
    const isUrdu = lang === Language.URDU;
    const isGujarati = lang === Language.GUJARATI;

    if (isUrdu) {
      return [
        {
          id: '1',
          title: 'افسوس ناک خبر - حاجی عبدالرحمن',
          content: 'انتہائی افسوس کے ساتھ اطلاع دی جاتی ہے کہ حاجی عبدالرحمن (سیکٹر 11-جی) کا انتقال ہوگیا ہے۔ نماز جنازه جامع مسجد گودھرا میں بعد نماز عصر ادا کی جائے گی۔ اللہ مرحوم کو جنت الفردوس میں اعلیٰ مقام عطا فرمائے۔',
          category: NewsCategory.DEATH_ANNOUNCEMENT,
          date: '10 منٹ پہلے',
          author: 'ایڈمن کمیٹی',
          allowComments: false,
          comments: []
        },
        {
          id: '2',
          title: 'فوری ضرورت: بلڈ ڈونر درکار',
          content: 'سول ہسپتال میں کمیونٹی ممبر کے لیے O+ خون کی فوری ضرورت ہے۔ اگر آپ عطیہ کر سکتے ہیں تو براہ کرم 0300-1234567 پر رابطہ کریں۔',
          category: NewsCategory.EMERGENCY,
          date: '2 گھنٹے پہلے',
          author: 'ویلفیئر ونگ',
          allowComments: true,
          comments: []
        },
        {
          id: '3',
          title: 'سالانہ جنرل میٹنگ 2024',
          content: 'تمام رجسٹرڈ ممبران سے گزارش ہے کہ اتوار، 25 اکتوبر کو کمیونٹی ہال میں اے جی ایم میں شرکت کریں۔ ایجنڈے میں سالانہ بجٹ کی منظوری اور الیکشن کا شیڈول شامل ہے۔',
          category: NewsCategory.MEETING,
          date: '1 دن پہلے',
          author: 'جنرل سیکرٹری',
          allowComments: true,
          comments: []
        }
      ];
    }

    if (isGujarati) {
       return [
        {
          id: '1',
          title: 'દુખદ સમાચાર - હાજી અબ્દુલ રહેમાન',
          content: 'ખૂબ જ દુઃખ સાથે જણાવવામાં આવે છે કે હાજી અબ્દુલ રહેમાન (સેક્ટર 11-જી) નું અવસાન થયું છે. નમાઝ-એ-જનાઝા આજે અસરની નમાજ પછી જામિયા મસ્જિદ ગોધરા ખાતે રાખવામાં આવી છે.',
          category: NewsCategory.DEATH_ANNOUNCEMENT,
          date: '10 મિનિટ પહેલા',
          author: 'એડમિન કમિટી',
          allowComments: false,
          comments: []
        },
        {
          id: '2',
          title: 'તાત્કાલિક: બ્લડ ડોનરની જરૂર છે',
          content: 'સિવિલ હોસ્પિટલમાં કોમ્યુનિટી મેમ્બર માટે O+ બ્લડની તાત્કાલિક જરૂર છે. જો તમે દાન કરી શકો તો કૃપા કરીને 0300-1234567 પર સંપર્ક કરો.',
          category: NewsCategory.EMERGENCY,
          date: '2 કલાક પહેલા',
          author: 'વેલ્ફેર વિંગ',
          allowComments: true,
          comments: []
        },
        {
          id: '3',
          title: 'વાર્ષિક સામાન્ય સભા 2024',
          content: 'તમામ રજિસ્ટર્ડ સભ્યોને વિનંતી છે કે રવિવાર, 25મી ઓક્ટોબરે કોમ્યુનિટી હોલમાં એજીએમમાં હાજરી આપે.',
          category: NewsCategory.MEETING,
          date: '1 દિવસ પહેલા',
          author: 'જનરલ સેક્રેટરી',
          allowComments: true,
          comments: []
        }
      ];
    }

    return INITIAL_POSTS;
  };

  useEffect(() => {
    document.title = t.appName;
  }, [t.appName]);

  useEffect(() => {
    setAnnouncements(getInitialPosts(language));
  }, [language]);

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    if (user.status === UserStatus.APPROVED) {
        setCurrentView(AppView.DASHBOARD);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView(AppView.DASHBOARD);
  };

  const handleAnnounceSurveyResult = (surveyId: string) => {
    const survey = surveys.find(s => s.id === surveyId);
    if (!survey) return;

    const updatedSurveys = surveys.map(s => s.id === surveyId ? { ...s, isActive: false } : s);
    setSurveys(updatedSurveys);

    let resultText = `Voting for "${survey.question}" has ended.\n\nTotal Votes: ${survey.totalVotes}\n\nResults:\n`;
    if (survey.type === SurveyType.POLL && survey.options) {
      survey.options.forEach(opt => {
        const pct = survey.totalVotes > 0 ? Math.round((opt.votes / survey.totalVotes) * 100) : 0;
        resultText += `- ${opt.text}: ${opt.votes} votes (${pct}%)\n`;
      });
    } else {
      resultText += "Thank you for participating in this external survey.";
    }

    const resultPost: Announcement = {
      id: Date.now().toString(),
      title: `Survey Results: ${survey.question}`,
      content: resultText,
      category: NewsCategory.GENERAL,
      date: 'Just now',
      author: 'Admin Committee',
      allowComments: true,
      comments: []
    };
    handleUpdatePosts([resultPost, ...announcements]);
  };

  const handleSurveyVote = (surveyId: string, optionId: string) => {
    if (!currentUser) return;

    setSurveys(prev => prev.map(survey => {
      if (survey.id !== surveyId) return survey;

      if (survey.endTime && new Date() > new Date(survey.endTime)) {
          setToast({ message: "Survey Ended", subMessage: "This poll is no longer accepting votes.", type: 'info' });
          return survey;
      }
      
      if (survey.type === SurveyType.EXTERNAL_LINK) {
          return {
              ...survey,
              totalVotes: survey.totalVotes + 1,
              votedUserIds: [...survey.votedUserIds, currentUser.email]
          };
      }

      if (survey.options) {
          return {
            ...survey,
            totalVotes: survey.totalVotes + 1,
            votedUserIds: [...survey.votedUserIds, currentUser.email],
            options: survey.options.map(opt => 
            opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
            )
        };
      }
      return survey;
    }));
  };

  const handleUpdatePosts = (newPosts: Announcement[]) => {
    if (newPosts.length > announcements.length) {
      const latestPost = newPosts[0];
      sendSystemNotification(`New Announcement: ${latestPost.title}`, latestPost.content);
      setToast({ 
        message: 'New Announcement', 
        subMessage: latestPost.title,
        type: 'info' 
      });
    }
    setAnnouncements(newPosts);
  };

  const handleSendMessage = (msg: ChatMessage) => {
    // 1. Add message with SENT status
    const sentMsg = { ...msg, status: MessageStatus.SENT };
    const updatedMessages = [...messages, sentMsg];
    setMessages(updatedMessages);

    // 2. Simulate status updates: SENT -> DELIVERED -> READ
    setTimeout(() => {
        setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, status: MessageStatus.DELIVERED } : m));
    }, 1000);

    setTimeout(() => {
        setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, status: MessageStatus.READ } : m));
    }, 2000);

    // 3. Admin Reply Logic
    setTimeout(() => {
      const replyMsg: ChatMessage = {
        id: Date.now().toString(),
        senderId: 'sys-admin',
        senderName: 'Admin',
        content: `Thank you, ${msg.senderName}. We have received your message.`,
        mediaType: MessageType.TEXT,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isMe: false,
        status: MessageStatus.READ
      };
      
      setMessages(prev => [...prev, replyMsg]);
      
      sendSystemNotification(`New Message from ${replyMsg.senderName}`, replyMsg.content);
      setToast({
        message: 'New Chat Message',
        subMessage: `${replyMsg.senderName} sent a message`,
        type: 'success'
      });
      
    }, 2500);
  };

  const handleClearChat = () => {
    setMessages([]);
    setToast({ message: "Chat History Cleared", type: 'info' });
  };

  const handleReportUser = () => {
    setToast({ message: "Report Submitted", subMessage: "Admins will review this shortly.", type: 'success' });
  };

  const renderContent = () => {
    switch (currentView) {
      case AppView.DASHBOARD:
        return currentUser ? (
          <Dashboard 
            language={language} 
            onViewChange={setCurrentView} 
            announcements={announcements} 
            user={currentUser}
            surveys={surveys}
            onVote={handleSurveyVote}
          />
        ) : null;
      case AppView.ANNOUNCEMENTS:
        return currentUser ? (
          <NewsFeed 
            user={currentUser} 
            language={language} 
            posts={announcements}
            onUpdatePosts={handleUpdatePosts}
          />
        ) : null;
      case AppView.ELECTIONS:
        return currentUser ? <Elections user={currentUser} language={language} /> : null;
      case AppView.ISSUES:
        return currentUser ? <Issues user={currentUser} language={language} /> : null;
      case AppView.PROFILE:
        return currentUser ? <Profile user={currentUser} onLogout={handleLogout} language={language} /> : null;
      case AppView.ADMIN:
        return (
          <AdminDashboard 
            language={language} 
            areas={areas}
            onUpdateAreas={setAreas}
            surveys={surveys}
            onUpdateSurveys={setSurveys}
            onAnnounceResult={handleAnnounceSurveyResult}
          />
        );
      case AppView.CHAT:
        return currentUser ? (
           <Chat 
             user={currentUser} 
             language={language}
             messages={messages} 
             onSendMessage={handleSendMessage} 
             onClearChat={handleClearChat}
             onReportUser={handleReportUser}
           />
        ) : null;
      default:
        return currentUser ? (
          <Dashboard 
            language={language} 
            onViewChange={setCurrentView} 
            announcements={announcements}
            user={currentUser}
            surveys={surveys}
            onVote={handleSurveyVote}
          />
        ) : null;
    }
  };

  if (!currentUser) {
    return (
        <>
            <MaterialSymbolsLink />
            <div className="h-screen bg-surface dark:bg-gray-900 flex flex-col justify-center max-w-md mx-auto shadow-2xl overflow-hidden relative" dir={isDarkMode ? 'ltr' : 'ltr'}>
                <div className="absolute top-4 right-4 z-50">
                    <button 
                        onClick={() => setIsDarkMode(!isDarkMode)}
                        className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-sm text-gray-500 dark:text-gray-300"
                    >
                        <span className="material-symbols-outlined text-xl">
                            {isDarkMode ? 'light_mode' : 'dark_mode'}
                        </span>
                    </button>
                </div>
                <Auth onLogin={handleLogin} areas={areas} />
            </div>
        </>
    );
  }

  const isUrdu = language === Language.URDU;

  if (currentUser.status === UserStatus.PENDING) {
      return (
        <>
            <MaterialSymbolsLink />
            <div className={`h-screen bg-surface dark:bg-gray-900 flex flex-col items-center justify-center max-w-md mx-auto shadow-2xl p-6 text-center ${isUrdu ? 'font-urdu' : ''}`} dir={isUrdu ? 'rtl' : 'ltr'}>
                <div className="w-20 h-20 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mb-6">
                    <span className="material-symbols-outlined text-4xl text-orange-600 dark:text-orange-400">hourglass_empty</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Registration Pending</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-8">
                    Assalam-o-Alaikum <strong>{currentUser.firstName}</strong>,<br/><br/>
                    Your details have been submitted. 
                    An admin will verify your Email ({currentUser.email}) against our records.
                </p>
                <button onClick={handleLogout} className="mt-8 text-primary font-medium">Back to Login</button>
            </div>
        </>
      );
  }

  return (
    <>
      <MaterialSymbolsLink />
      <div className={`flex flex-col h-screen max-w-md mx-auto bg-gray-50 dark:bg-gray-900 shadow-2xl overflow-hidden relative transition-colors duration-200 ${isUrdu ? 'font-urdu' : ''}`} dir={isUrdu ? 'rtl' : 'ltr'}>
        <div className="bg-primary h-1 w-full absolute top-0 z-50"></div>

        <header className={`bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 px-4 py-3 flex justify-between items-center z-10 sticky top-0 shadow-sm transition-colors duration-200 ${isUrdu ? 'gap-3' : ''}`}>
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-md">
                    G
                </div>
                <div className={isUrdu ? 'text-right' : 'text-left'}>
                    <h1 className="font-bold text-gray-800 dark:text-white leading-none text-lg">{t.appName}</h1>
                    <p className={`text-[10px] text-gray-500 dark:text-gray-400 font-medium pt-1 ${language === Language.GUJARATI ? 'font-gujarati' : language === Language.URDU ? 'font-urdu' : 'font-sans'}`}>
                      {t.appTagline}
                    </p>
                </div>
            </div>
            
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <button 
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-200"
                >
                     <span className="material-symbols-outlined text-xl">
                            {isDarkMode ? 'light_mode' : 'dark_mode'}
                     </span>
                </button>

                <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                   <button 
                     onClick={() => setLanguage(Language.ENGLISH)}
                     className={`px-2 py-1 text-[10px] font-bold rounded transition-colors ${language === Language.ENGLISH ? 'bg-white dark:bg-gray-600 text-primary dark:text-white shadow-sm' : 'text-gray-400 dark:text-gray-400'}`}
                   >EN</button>
                   <button 
                     onClick={() => setLanguage(Language.URDU)}
                     className={`px-2 py-1 text-[10px] font-bold rounded transition-colors ${language === Language.URDU ? 'bg-white dark:bg-gray-600 text-primary dark:text-white shadow-sm' : 'text-gray-400 dark:text-gray-400'}`}
                   >UR</button>
                   <button 
                     onClick={() => setLanguage(Language.GUJARATI)}
                     className={`px-2 py-1 text-[10px] font-bold rounded transition-colors ${language === Language.GUJARATI ? 'bg-white dark:bg-gray-600 text-primary dark:text-white shadow-sm' : 'text-gray-400 dark:text-gray-400'}`}
                   >GU</button>
                </div>
            </div>
        </header>

        <Toast 
            message={toast?.message || ''} 
            subMessage={toast?.subMessage} 
            type={toast?.type}
            isVisible={!!toast} 
            onClose={() => setToast(null)} 
        />

        <main className="flex-1 overflow-hidden relative bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
          {renderContent()}
        </main>

        <Navigation currentView={currentView} onNavigate={setCurrentView} language={language} user={currentUser} />
      </div>
    </>
  );
}
