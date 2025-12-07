
import React, { useState, useEffect } from 'react';
import { Announcement, NewsCategory, Language, AppView, User, Survey, SurveyType } from '../types';
import { translations } from '../services/translations';

interface DashboardProps {
    language: Language;
    onViewChange: (view: AppView) => void;
    announcements: Announcement[];
    user?: User; 
    surveys: Survey[];
    onVote: (surveyId: string, optionId: string) => void;
}

interface TimeLeft {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}

export const Dashboard: React.FC<DashboardProps> = ({ language, onViewChange, announcements, user, surveys, onVote }) => {
  const t = translations[language];
  const isUrdu = language === Language.URDU;
  const isGujarati = language === Language.GUJARATI;
  
  const [activeIndex, setActiveIndex] = useState(0);
  const [isSurveyModalOpen, setIsSurveyModalOpen] = useState(false);
  const [now, setNow] = useState(new Date());

  const recentNews = announcements.slice(0, 5);
  const activeSurveys = surveys.filter(s => s.isActive);
  const primarySurvey = activeSurveys.length > 0 ? activeSurveys[0] : null;

  useEffect(() => {
    if (recentNews.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % recentNews.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [recentNews.length]);

  useEffect(() => {
      const timer = setInterval(() => {
          setNow(new Date());
      }, 1000);
      return () => clearInterval(timer);
  }, []);

  const calculateTimeLeft = (endTime: string): TimeLeft | null => {
      const difference = +new Date(endTime) - +now;
      let timeLeft = null;
      if (difference > 0) {
        timeLeft = {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        };
      }
      return timeLeft;
  };

  const activeNews = recentNews[activeIndex];

  const getCategoryColor = (cat: NewsCategory) => {
    switch (cat) {
      case NewsCategory.EMERGENCY: return 'text-red-600 bg-red-50 border-red-100 dark:bg-red-900/30 dark:text-red-300 dark:border-red-900';
      case NewsCategory.DEATH_ANNOUNCEMENT: return 'text-gray-700 bg-gray-100 border-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600';
      case NewsCategory.MEETING: return 'text-blue-600 bg-blue-50 border-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-900';
      default: return 'text-emerald-600 bg-emerald-50 border-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-900';
    }
  };

  const getCategoryLabel = (cat: NewsCategory) => {
      switch (cat) {
        case NewsCategory.GENERAL: return t.catGeneral;
        case NewsCategory.MEETING: return t.catMeeting;
        case NewsCategory.EVENT: return t.catEvent;
        case NewsCategory.EMERGENCY: return t.catEmergency;
        case NewsCategory.DEATH_ANNOUNCEMENT: return t.catDeath;
        default: return cat;
      }
  };

  const getSurveyPercentage = (survey: Survey, votes: number) => {
     if (!survey || survey.totalVotes === 0) return 0;
     return Math.round((votes / survey.totalVotes) * 100);
  };

  return (
    <div className={`p-4 space-y-6 pb-24 overflow-y-auto h-full ${isUrdu ? 'font-urdu' : ''}`}>
      {/* Greeting Card */}
      <div className="flex flex-col items-center justify-center text-center bg-gradient-to-br from-emerald-600 to-teal-600 dark:from-emerald-800 dark:to-teal-800 rounded-3xl p-8 shadow-xl relative overflow-hidden transition-colors group">
        <div className="absolute -top-10 -right-10 bg-white/10 w-40 h-40 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-1000"></div>
        <div className="absolute -bottom-10 -left-10 bg-yellow-400/20 w-40 h-40 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-1000"></div>
        
        <div className="relative z-10 w-full flex flex-col items-center">
            <h1 className="text-xl font-bold font-urdu text-yellow-100 opacity-90 leading-relaxed mb-2" dir="auto">السلام عليكم</h1>
            
            <h2 className={`text-3xl font-extrabold tracking-tight text-white mb-0.5 ${isGujarati ? 'font-gujarati' : ''}`}>
                {user ? `${user.firstName} ${user.lastName}` : 'Member'}
            </h2>
            <p className={`text-sm font-medium text-emerald-100 uppercase tracking-wide opacity-80 ${isGujarati ? 'font-gujarati' : ''}`}>
                {t.greeting}
            </p>

            <div className="mt-6 pt-4 border-t border-white/10 w-full max-w-[200px] flex items-center justify-center">
               <span className="material-symbols-outlined text-yellow-300 text-sm mr-2 animate-wave">waving_hand</span>
               <p className="text-sm text-white/90 font-gujarati font-bold">કેમ છો (Kem Cho)</p>
            </div>
        </div>
      </div>

      {/* Prayer Times */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
        <h3 className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider mb-4 text-center">{t.prayerTimes}</h3>
        <div className={`flex justify-between items-center text-center gap-2 ${isUrdu ? '' : 'sm:gap-4'}`}>
          {[
            { name: 'Fajr', time: '05:15' },
            { name: 'Zuhr', time: '12:35' },
            { name: 'Asr', time: '15:55' },
            { name: 'Magh', time: '18:10' },
            { name: 'Isha', time: '19:45' }
          ].map((prayer) => (
            <div key={prayer.name} className="flex flex-col items-center group cursor-default flex-1">
              <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium mb-1 group-hover:text-primary transition-colors">{prayer.name}</span>
              <span className="text-base font-bold text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded-lg group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/30 transition-colors w-full">{prayer.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Updates Carousel */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col transition-colors">
        <div className="p-4 border-b border-gray-50 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50">
           <h3 className={`font-bold text-gray-800 dark:text-gray-200 ${isUrdu ? 'text-lg' : 'text-sm'}`}>{t.recentUpdates}</h3>
           <button 
             onClick={() => onViewChange(AppView.ANNOUNCEMENTS)}
             className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-1 rounded hover:bg-primary/20 transition-colors"
           >
             {t.viewAll}
           </button>
        </div>
        
        <div className="relative min-h-[160px] flex flex-col">
          {recentNews.length > 0 && activeNews ? (
             <button 
                key={activeNews.id} 
                onClick={() => onViewChange(AppView.ANNOUNCEMENTS)}
                className="w-full text-left p-5 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 hover:scale-[1.01] hover:shadow-sm active:scale-[0.99] flex-1 flex flex-col justify-center group animate-fade-in"
              >
                <div className={`flex justify-between items-start mb-3 ${isUrdu ? '' : ''}`}>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded border ${getCategoryColor(activeNews.category)}`}>
                    {getCategoryLabel(activeNews.category)}
                  </span>
                  <span className="text-[10px] text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-700 px-2 py-0.5 rounded-full">{activeNews.date}</span>
                </div>
                <h4 
                    className={`font-bold text-gray-800 dark:text-gray-100 text-base leading-snug mb-2 group-hover:text-primary transition-colors line-clamp-2 ${isUrdu ? 'font-urdu' : isGujarati ? 'font-gujarati' : ''}`}
                    dir="auto"
                >
                    {activeNews.title}
                </h4>
                <p 
                    className={`text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed opacity-90 ${isUrdu ? 'font-urdu' : isGujarati ? 'font-gujarati' : ''}`}
                    dir="auto"
                >
                    {activeNews.content}
                </p>
              </button>
          ) : (
             <div className="p-8 text-center text-gray-400 dark:text-gray-500 text-xs flex flex-col items-center justify-center h-full">
                <span className="material-symbols-outlined text-3xl mb-2 opacity-30">newspaper</span>
                No recent updates.
             </div>
          )}
        </div>

        {recentNews.length > 1 && (
            <div className="flex justify-center pb-4 gap-1.5 bg-white dark:bg-gray-800">
                {recentNews.map((_, idx) => (
                    <div 
                        key={idx} 
                        className={`h-1.5 rounded-full transition-all duration-300 ${idx === activeIndex ? 'w-5 bg-primary' : 'w-1.5 bg-gray-200 dark:bg-gray-600'}`} 
                    />
                ))}
            </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        {/* SURVEY Widget */}
        <button 
            onClick={() => setIsSurveyModalOpen(true)}
            className="group bg-white dark:bg-gray-800 hover:bg-purple-50 dark:hover:bg-purple-900/10 p-5 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col items-center justify-center space-y-4 transition-all active:scale-95 h-40 relative overflow-hidden"
        >
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-100 dark:bg-purple-900/20 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
            
            {primarySurvey && (
                <div className="absolute top-4 right-4 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </div>
            )}
            
            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-300">
               <span className="material-symbols-outlined text-3xl">poll</span>
            </div>
            <div className="text-center w-full px-1 relative z-10">
                <div className={`font-bold text-gray-800 dark:text-gray-100 ${isUrdu ? 'text-lg' : 'text-sm'}`}>{t.surveyAction}</div>
                {primarySurvey ? (
                     <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 line-clamp-1 opacity-90 group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors">
                        {primarySurvey.question}
                     </div>
                ) : (
                     <div className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">No Active Polls</div>
                )}
                {activeSurveys.length > 1 && (
                     <div className="text-[9px] font-bold text-purple-600 dark:text-purple-400 mt-0.5 bg-purple-100 dark:bg-purple-900/30 px-2 py-0.5 rounded-full inline-block">
                        +{activeSurveys.length - 1} more active
                     </div>
                )}
            </div>
        </button>

        {/* ISSUES Widget */}
        <button 
            onClick={() => onViewChange(AppView.ISSUES)}
            className="group bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/10 p-5 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col items-center justify-center space-y-4 transition-all active:scale-95 h-40 relative overflow-hidden"
        >
             <div className="absolute top-0 right-0 w-24 h-24 bg-blue-100 dark:bg-blue-900/20 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>

             <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-300">
                <span className="material-symbols-outlined text-3xl">record_voice_over</span>
             </div>
             <div className="text-center relative z-10">
                <div className={`font-bold text-gray-800 dark:text-gray-100 ${isUrdu ? 'text-lg' : 'text-sm'}`}>{t.issuesAction}</div>
                <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors">Community Voice</div>
            </div>
        </button>
      </div>

      {/* Survey Modal */}
      {isSurveyModalOpen && (
          <div className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-300">
              <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800 transform transition-all scale-100 relative flex flex-col max-h-[90vh]">
                  
                  <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-purple-500/10 to-blue-500/10 dark:from-purple-900/20 dark:to-blue-900/20 pointer-events-none"></div>

                  <div className="relative p-6 pb-2 flex justify-between items-start z-10 shrink-0">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center text-purple-600 dark:text-purple-300 shadow-sm border border-purple-200 dark:border-purple-800">
                        <span className="material-symbols-outlined">bar_chart</span>
                      </div>
                      <div>
                         <h3 className="font-bold text-gray-900 dark:text-white text-lg leading-tight">{t.surveyAction}</h3>
                         <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5">Your opinion matters</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setIsSurveyModalOpen(false)}
                      className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                      <span className="material-symbols-outlined text-lg">close</span>
                    </button>
                  </div>
                  
                  <div className="p-6 pt-4 relative z-10 overflow-y-auto space-y-8">
                      {activeSurveys.length > 0 ? (
                          activeSurveys.map((survey) => {
                             const hasVotedInSurvey = user ? survey.votedUserIds.includes(user.email) : false;
                             const isSurveyExpired = survey.endTime ? now > new Date(survey.endTime) : false;
                             const timeLeft = survey.endTime ? calculateTimeLeft(survey.endTime) : null;

                             return (
                                <div key={survey.id} className="border-b border-gray-100 dark:border-gray-800 pb-8 last:border-0 last:pb-0">
                                    <h4 className="font-extrabold text-xl text-gray-800 dark:text-gray-100 mb-2 leading-snug text-center">
                                        {survey.question}
                                    </h4>

                                    {/* Timer */}
                                    {survey.endTime && !isSurveyExpired && timeLeft && (
                                        <div className="flex justify-center mb-6">
                                            <div className="bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 px-3 py-1.5 rounded-lg flex items-center space-x-2 text-xs font-bold font-mono">
                                                <span className="material-symbols-outlined text-sm animate-pulse">timer</span>
                                                <span>
                                                    {timeLeft.days}d : {timeLeft.hours}h : {timeLeft.minutes}m : {timeLeft.seconds}s
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Expired Banner */}
                                    {isSurveyExpired && (
                                        <div className="flex justify-center mb-6">
                                            <div className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-4 py-2 rounded-lg text-sm font-bold flex items-center">
                                                <span className="material-symbols-outlined text-lg mr-2">event_busy</span>
                                                Survey Ended
                                            </div>
                                        </div>
                                    )}
                                    
                                    {survey.type === SurveyType.POLL && survey.options ? (
                                        hasVotedInSurvey || isSurveyExpired ? (
                                            <div className="space-y-5 animate-in slide-in-from-bottom-4 duration-500">
                                                {survey.options.map((opt, index) => {
                                                    const percentage = getSurveyPercentage(survey, opt.votes);
                                                    return (
                                                        <div key={opt.id} className="relative">
                                                            <div className="flex justify-between text-sm mb-2 px-1">
                                                                <span className="text-gray-700 dark:text-gray-300 font-semibold">{opt.text}</span>
                                                                <span className="font-bold text-gray-900 dark:text-white">{percentage}%</span>
                                                            </div>
                                                            <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-4 overflow-hidden shadow-inner">
                                                                <div 
                                                                    className={`h-full rounded-full transition-all duration-1000 ease-out ${index % 2 === 0 ? 'bg-purple-500' : 'bg-blue-500'}`}
                                                                    style={{ width: `${percentage}%` }}
                                                                ></div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                                <div className={`text-center mt-6 p-4 rounded-xl border ${isSurveyExpired ? 'bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700' : 'bg-green-50 border-green-100 dark:bg-green-900/10 dark:border-green-900/30'}`}>
                                                    <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full mb-2 ${isSurveyExpired ? 'bg-gray-200 text-gray-500' : 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'}`}>
                                                        <span className="material-symbols-outlined text-sm">{isSurveyExpired ? 'lock' : 'check'}</span>
                                                    </div>
                                                    <p className={`text-sm font-bold ${isSurveyExpired ? 'text-gray-600 dark:text-gray-400' : 'text-green-700 dark:text-green-400'}`}>
                                                        {hasVotedInSurvey ? 'Vote Submitted' : 'Voting Closed'}
                                                    </p>
                                                    <p className={`text-xs ${isSurveyExpired ? 'text-gray-500' : 'text-green-600/80 dark:text-green-400/70'}`}>
                                                        {hasVotedInSurvey ? 'Thank you for participating!' : 'This survey has expired.'}
                                                    </p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                {survey.options.map(opt => (
                                                    <button
                                                        key={opt.id}
                                                        onClick={() => onVote(survey.id, opt.id)}
                                                        className="w-full text-left p-5 rounded-xl border-2 border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800 hover:border-purple-500 dark:hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-all duration-200 text-sm font-bold text-gray-700 dark:text-gray-200 flex justify-between items-center group active:scale-[0.98]"
                                                    >
                                                        <span className="text-base">{opt.text}</span>
                                                        <span className="material-symbols-outlined opacity-0 group-hover:opacity-100 text-purple-600 dark:text-purple-400 transition-opacity transform group-hover:translate-x-1">arrow_forward</span>
                                                    </button>
                                                ))}
                                            </div>
                                        )
                                    ) : (
                                        <div className="text-center py-6">
                                            <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-500">
                                                <span className="material-symbols-outlined text-3xl">public</span>
                                            </div>
                                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-8 leading-relaxed px-4">
                                                This survey is hosted on an external platform. Please click below to open the form.
                                            </p>
                                            <button
                                                onClick={() => {
                                                    if (survey.externalLink) {
                                                        window.open(survey.externalLink, '_blank');
                                                        onVote(survey.id, 'link');
                                                    }
                                                }}
                                                className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-8 py-4 rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center space-x-2"
                                            >
                                                <span>Open Survey Form</span>
                                                <span className="material-symbols-outlined text-sm">open_in_new</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                             );
                          })
                      ) : (
                        <div className="text-center py-10">
                             <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="material-symbols-outlined text-3xl text-gray-400 dark:text-gray-500">poll</span>
                            </div>
                            <h3 className="font-bold text-gray-800 dark:text-white mb-2">No Active Polls</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Check back later for new community surveys.</p>
                        </div>
                      )}
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
