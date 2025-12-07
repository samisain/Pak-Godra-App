
import React, { useState } from 'react';
import { User, UserStatus, UserRole, Language, ActivityLog, ActivityType, Survey, SurveyType } from '../types';

interface AdminDashboardProps {
  language: Language;
  areas: string[];
  onUpdateAreas: (areas: string[]) => void;
  surveys: Survey[];
  onUpdateSurveys: (surveys: Survey[]) => void;
  onAnnounceResult: (surveyId: string) => void;
}

const MOCK_USERS: User[] = [
  { email: 'ahmed@pakgodhra.com', firstName: 'Ahmed', lastName: 'Raza', mobile: '03001234567', dob: '1979-01-01', age: 45, area: 'Godhra Colony', isVoter: true, status: UserStatus.APPROVED, role: UserRole.MEMBER },
  { email: 'fatima@pakgodhra.com', firstName: 'Fatima', lastName: 'Bibi', mobile: '03007654321', dob: '1992-05-12', age: 32, area: 'Sector 11-G', isVoter: true, status: UserStatus.APPROVED, role: UserRole.MEMBER },
  { email: 'bilal@pakgodhra.com', firstName: 'Bilal', lastName: 'Khan', mobile: '03009999999', dob: '2002-08-20', age: 22, area: 'New Karachi', isVoter: true, status: UserStatus.PENDING, role: UserRole.MEMBER },
  { email: 'zainab@pakgodhra.com', firstName: 'Zainab', lastName: 'Ali', mobile: '03008888888', dob: '1995-11-05', age: 29, area: 'Godhra Colony', isVoter: true, status: UserStatus.APPROVED, role: UserRole.MODERATOR },
];

const MOCK_ACTIVITY_LOGS: ActivityLog[] = [
  { id: 'l1', userId: 'ahmed@pakgodhra.com', userName: 'Ahmed Raza', action: 'Casted vote in Executive Election', timestamp: '10 mins ago', type: ActivityType.VOTE },
  { id: 'l2', userId: 'zainab@pakgodhra.com', userName: 'Zainab Ali', action: 'Posted new announcement: "Blood Camp"', timestamp: '1 hour ago', type: ActivityType.POST },
  { id: 'l3', userId: 'fatima@pakgodhra.com', userName: 'Fatima Bibi', action: 'Reported issue: "Street Lights"', timestamp: '2 hours ago', type: ActivityType.ISSUE },
  { id: 'l4', userId: 'bilal@pakgodhra.com', userName: 'Bilal Khan', action: 'Registered new account', timestamp: '5 hours ago', type: ActivityType.REGISTER },
  { id: 'l5', userId: 'ahmed@pakgodhra.com', userName: 'Ahmed Raza', action: 'Logged in', timestamp: '6 hours ago', type: ActivityType.LOGIN },
  { id: 'l6', userId: 'SYSTEM', userName: 'Admin', action: 'Approved registration for Fatima Bibi', timestamp: '1 day ago', type: ActivityType.MODERATION },
];

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ language, areas, onUpdateAreas, surveys, onUpdateSurveys, onAnnounceResult }) => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'MEMBERS' | 'TEAM' | 'SURVEYS' | 'ACTIVITY' | 'SETTINGS'>('OVERVIEW');
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [newArea, setNewArea] = useState('');
  
  const [surveyType, setSurveyType] = useState<SurveyType>(SurveyType.POLL);
  const [surveyQuestion, setSurveyQuestion] = useState('');
  const [surveyOptions, setSurveyOptions] = useState<string[]>(['', '']);
  const [surveyLink, setSurveyLink] = useState('');
  const [surveyEndTime, setSurveyEndTime] = useState('');

  const toggleModerator = (email: string) => {
    setUsers(users.map(u => {
      if (u.email === email) {
        return {
          ...u,
          role: u.role === UserRole.MODERATOR ? UserRole.MEMBER : UserRole.MODERATOR
        };
      }
      return u;
    }));
  };

  const handleApproval = (email: string, status: UserStatus) => {
    setUsers(users.map(u => u.email === email ? { ...u, status } : u));
  };

  const handleAddArea = () => {
    if (newArea.trim() && !areas.includes(newArea.trim())) {
      onUpdateAreas([...areas, newArea.trim()]);
      setNewArea('');
    }
  };

  const handleDeleteArea = (areaToDelete: string) => {
    onUpdateAreas(areas.filter(a => a !== areaToDelete));
  };

  const handleCreateSurvey = () => {
    if (!surveyQuestion.trim()) return;

    if (surveyType === SurveyType.POLL) {
        const validOptions = surveyOptions.filter(o => o.trim() !== '');
        if (validOptions.length < 2) return;

        const newSurvey: Survey = {
            id: Date.now().toString(),
            question: surveyQuestion,
            type: SurveyType.POLL,
            options: validOptions.map((text, idx) => ({ id: `opt-${idx}`, text, votes: 0 })),
            isActive: true,
            totalVotes: 0,
            votedUserIds: [],
            createdAt: 'Just now',
            endTime: surveyEndTime || undefined
        };
        onUpdateSurveys([newSurvey, ...surveys]);
    } else {
        if (!surveyLink.trim()) return;
        const newSurvey: Survey = {
            id: Date.now().toString(),
            question: surveyQuestion,
            type: SurveyType.EXTERNAL_LINK,
            externalLink: surveyLink,
            isActive: true,
            totalVotes: 0,
            votedUserIds: [],
            createdAt: 'Just now',
            endTime: surveyEndTime || undefined
        };
        onUpdateSurveys([newSurvey, ...surveys]);
    }

    setSurveyQuestion('');
    setSurveyOptions(['', '']);
    setSurveyLink('');
    setSurveyEndTime('');
  };

  const handleDeleteSurvey = (id: string) => {
    onUpdateSurveys(surveys.filter(s => s.id !== id));
  };

  const handleRemoveOption = (indexToRemove: number) => {
    if (surveyOptions.length <= 2) return;
    const newOptions = surveyOptions.filter((_, idx) => idx !== indexToRemove);
    setSurveyOptions(newOptions);
  };

  const filteredUsers = users.filter(u => {
    const fullName = `${u.firstName} ${u.lastName}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase()) || 
           u.email.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const pendingCount = users.filter(u => u.status === UserStatus.PENDING).length;
  const modCount = users.filter(u => u.role === UserRole.MODERATOR).length;

  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case ActivityType.VOTE: return 'how_to_vote';
      case ActivityType.POST: return 'article';
      case ActivityType.ISSUE: return 'report_problem';
      case ActivityType.REGISTER: return 'person_add';
      case ActivityType.LOGIN: return 'login';
      case ActivityType.MODERATION: return 'admin_panel_settings';
      default: return 'history';
    }
  };

  const getActivityColor = (type: ActivityType) => {
    switch (type) {
      case ActivityType.VOTE: return 'text-green-600 bg-green-50 dark:bg-green-900/30 dark:text-green-300';
      case ActivityType.POST: return 'text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-300';
      case ActivityType.ISSUE: return 'text-orange-600 bg-orange-50 dark:bg-orange-900/30 dark:text-orange-300';
      case ActivityType.REGISTER: return 'text-purple-600 bg-purple-50 dark:bg-purple-900/30 dark:text-purple-300';
      case ActivityType.MODERATION: return 'text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-300';
      default: return 'text-gray-600 bg-gray-50 dark:bg-gray-700/50 dark:text-gray-400';
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900 pb-24 transition-colors">
      <div className="bg-gray-900 dark:bg-black text-white p-6 pb-12">
        <h1 className="text-2xl font-bold">Admin Panel</h1>
        <p className="text-gray-400 text-sm">Manage community, elections, and team.</p>
      </div>

      <div className="-mt-6 px-4 flex-1 overflow-hidden flex flex-col">
        {/* Tabs */}
        <div className="flex bg-white dark:bg-gray-800 rounded-xl shadow-sm p-1 mb-4 overflow-x-auto border border-gray-100 dark:border-gray-700">
          <button 
            onClick={() => setActiveTab('OVERVIEW')}
            className={`flex-1 min-w-[80px] py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${activeTab === 'OVERVIEW' ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}
          >
            Overview
          </button>
          <button 
            onClick={() => setActiveTab('MEMBERS')}
            className={`flex-1 min-w-[80px] py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${activeTab === 'MEMBERS' ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}
          >
            Approvals
            {pendingCount > 0 && <span className="ml-1 bg-red-500 text-white px-1.5 rounded-full text-[10px]">{pendingCount}</span>}
          </button>
          <button 
            onClick={() => setActiveTab('TEAM')}
            className={`flex-1 min-w-[80px] py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${activeTab === 'TEAM' ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}
          >
            Team
          </button>
          <button 
            onClick={() => setActiveTab('SURVEYS')}
            className={`flex-1 min-w-[80px] py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${activeTab === 'SURVEYS' ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}
          >
            Surveys
          </button>
          <button 
            onClick={() => setActiveTab('ACTIVITY')}
            className={`flex-1 min-w-[80px] py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${activeTab === 'ACTIVITY' ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}
          >
            Activity
          </button>
          <button 
            onClick={() => setActiveTab('SETTINGS')}
            className={`flex-1 min-w-[80px] py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${activeTab === 'SETTINGS' ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}
          >
            Settings
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4">
          
          {/* OVERVIEW VIEW */}
          {activeTab === 'OVERVIEW' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                <div className="text-gray-500 dark:text-gray-400 text-xs uppercase font-bold">Total Members</div>
                <div className="text-2xl font-bold text-primary dark:text-emerald-400">{users.length}</div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                 <div className="text-gray-500 dark:text-gray-400 text-xs uppercase font-bold">Pending</div>
                 <div className="text-2xl font-bold text-orange-500 dark:text-orange-400">{pendingCount}</div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                 <div className="text-gray-500 dark:text-gray-400 text-xs uppercase font-bold">Moderators</div>
                 <div className="text-2xl font-bold text-blue-500 dark:text-blue-400">{modCount}</div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                 <div className="text-gray-500 dark:text-gray-400 text-xs uppercase font-bold">Active Surveys</div>
                 <div className="text-2xl font-bold text-purple-500 dark:text-purple-400">{surveys.length}</div>
              </div>
            </div>
          )}

          {/* TEAM MANAGEMENT VIEW */}
          {activeTab === 'TEAM' && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
               <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                  <h3 className="font-bold text-gray-800 dark:text-white mb-2">Manage Moderators</h3>
                  <input 
                    type="text" 
                    placeholder="Search by Name or Email..." 
                    className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary dark:text-white"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
               </div>
               <div className="divide-y divide-gray-100 dark:divide-gray-700">
                  {filteredUsers.filter(u => u.status === UserStatus.APPROVED).map(user => (
                    <div key={user.email} className="p-4 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-gray-800 dark:text-gray-200 text-sm">{user.firstName} {user.lastName}</div>
                        <div className="text-xs text-gray-400 font-mono">{user.email}</div>
                        {user.role === UserRole.MODERATOR && (
                          <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-[10px] font-bold rounded">MODERATOR</span>
                        )}
                      </div>
                      <button 
                        onClick={() => toggleModerator(user.email)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                          user.role === UserRole.MODERATOR 
                          ? 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-600' 
                          : 'bg-blue-600 text-white shadow-md'
                        }`}
                      >
                        {user.role === UserRole.MODERATOR ? 'Remove Role' : 'Make Moderator'}
                      </button>
                    </div>
                  ))}
               </div>
            </div>
          )}

          {/* SURVEYS MANAGEMENT VIEW */}
          {activeTab === 'SURVEYS' && (
             <div className="space-y-4">
               {/* Create New Survey */}
               <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
                  <h3 className="font-bold text-gray-800 dark:text-white mb-3">Conduct Community Survey</h3>
                  
                  <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-lg mb-4">
                      <button 
                        onClick={() => setSurveyType(SurveyType.POLL)}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${surveyType === SurveyType.POLL ? 'bg-white dark:bg-gray-600 shadow text-primary dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}
                      >
                        Internal Poll
                      </button>
                      <button 
                        onClick={() => setSurveyType(SurveyType.EXTERNAL_LINK)}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${surveyType === SurveyType.EXTERNAL_LINK ? 'bg-white dark:bg-gray-600 shadow text-primary dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}
                      >
                        External Form
                      </button>
                  </div>

                  <div className="space-y-3">
                    <div>
                        <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase">Question / Title</label>
                        <input 
                            type="text" 
                            placeholder={surveyType === SurveyType.POLL ? "Ask a question..." : "Form Title (e.g. Census 2024)"}
                            value={surveyQuestion}
                            onChange={(e) => setSurveyQuestion(e.target.value)}
                            className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary dark:text-white mt-1"
                        />
                    </div>

                    {surveyType === SurveyType.POLL ? (
                        <>
                            <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase">Options</label>
                            {surveyOptions.map((opt, idx) => (
                            <div key={idx} className="flex gap-2">
                                <input 
                                    type="text" 
                                    placeholder={`Option ${idx + 1}`}
                                    value={opt}
                                    onChange={(e) => {
                                        const newOpts = [...surveyOptions];
                                        newOpts[idx] = e.target.value;
                                        setSurveyOptions(newOpts);
                                    }}
                                    className="flex-1 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary dark:text-white"
                                />
                                {surveyOptions.length > 2 && (
                                     <button
                                        onClick={() => handleRemoveOption(idx)}
                                        className="text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-lg transition-colors"
                                        title="Remove option"
                                     >
                                         <span className="material-symbols-outlined text-lg">close</span>
                                     </button>
                                )}
                            </div>
                            ))}
                            <button 
                            onClick={() => setSurveyOptions([...surveyOptions, ''])}
                            className="text-xs bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded font-medium dark:text-gray-300 w-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            >
                            + Add Option
                            </button>
                        </>
                    ) : (
                        <div>
                            <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase">Form Link</label>
                            <input 
                                type="url" 
                                placeholder="https://docs.google.com/forms/..."
                                value={surveyLink}
                                onChange={(e) => setSurveyLink(e.target.value)}
                                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary dark:text-white font-mono text-xs mt-1"
                            />
                        </div>
                    )}

                    <div>
                        <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase">End Time (Optional)</label>
                        <input 
                            type="datetime-local"
                            value={surveyEndTime}
                            onChange={(e) => setSurveyEndTime(e.target.value)}
                            className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary dark:text-white mt-1"
                        />
                    </div>
                    
                    <button 
                      onClick={handleCreateSurvey}
                      className="w-full bg-primary text-white text-xs px-3 py-3 rounded-lg font-bold shadow-md hover:bg-emerald-700 transition-colors mt-2"
                    >
                      {surveyType === SurveyType.POLL ? 'Launch Poll' : 'Publish Form Link'}
                    </button>
                  </div>
               </div>

               {/* Active Surveys List */}
               {surveys.map(survey => (
                 <div key={survey.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 relative">
                    <div className="absolute top-2 right-2 flex gap-1">
                        {survey.isActive && (
                            <button
                                onClick={() => onAnnounceResult(survey.id)}
                                className="text-gray-400 hover:text-green-600 p-1"
                                title="End & Announce Results"
                            >
                                <span className="material-symbols-outlined text-sm">campaign</span>
                            </button>
                        )}
                        <button 
                           onClick={() => handleDeleteSurvey(survey.id)}
                           className="text-gray-400 hover:text-red-500 p-1"
                           title="Delete"
                        >
                           <span className="material-symbols-outlined text-sm">close</span>
                        </button>
                    </div>

                    <div className="flex justify-between items-start pr-14 mb-2">
                       <h4 className="font-bold text-gray-800 dark:text-white text-sm">
                           {survey.question}
                           {survey.type === SurveyType.EXTERNAL_LINK && (
                               <span className="ml-2 text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded border border-blue-200">External</span>
                           )}
                           {survey.endTime && (
                               <span className="ml-2 text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded border border-purple-200">
                                   Ends: {new Date(survey.endTime).toLocaleDateString()}
                               </span>
                           )}
                           {!survey.isActive && (
                               <span className="ml-2 text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded border border-gray-200">Ended</span>
                           )}
                       </h4>
                    </div>
                    
                    {survey.type === SurveyType.POLL ? (
                        <div className="space-y-1 mb-2">
                        {survey.options?.map(opt => (
                            <div key={opt.id} className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                                <span>{opt.text}</span>
                                <span className="font-bold">{opt.votes} votes</span>
                            </div>
                        ))}
                        </div>
                    ) : (
                        <div className="text-xs text-blue-600 dark:text-blue-400 underline truncate mb-2">
                            {survey.externalLink}
                        </div>
                    )}

                    <div className="text-[10px] text-gray-400 flex items-center">
                        <span className="material-symbols-outlined text-[12px] mr-1">bar_chart</span>
                        Total Interactions: {survey.totalVotes} • Created {survey.createdAt}
                    </div>
                 </div>
               ))}
             </div>
          )}

          {/* APPROVALS VIEW */}
          {activeTab === 'MEMBERS' && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="p-4 bg-orange-50 dark:bg-orange-900/20 border-b border-orange-100 dark:border-orange-900/30">
                   <h3 className="font-bold text-orange-800 dark:text-orange-300 text-sm">Pending Verification</h3>
                </div>
                {users.filter(u => u.status === UserStatus.PENDING).length === 0 ? (
                  <div className="p-8 text-center text-gray-400 dark:text-gray-500 text-sm">No pending applications</div>
                ) : (
                  users.filter(u => u.status === UserStatus.PENDING).map(user => (
                    <div key={user.email} className="p-4 border-b border-gray-100 dark:border-gray-700 last:border-0">
                       <div className="flex justify-between mb-2">
                          <span className="font-bold text-gray-800 dark:text-gray-200">{user.firstName} {user.lastName}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{user.email}</span>
                       </div>
                       <div className="text-xs text-gray-600 dark:text-gray-400 mb-3 grid grid-cols-2 gap-2">
                          <div>DOB: {user.dob}</div>
                          <div>Age: {user.age}</div>
                          <div>Area: {user.area}</div>
                          <div>Mobile: {user.mobile}</div>
                       </div>
                       <div className="flex gap-2">
                          <button 
                            onClick={() => handleApproval(user.email, UserStatus.APPROVED)}
                            className="flex-1 bg-green-600 text-white py-2 rounded-lg text-xs font-bold shadow-sm"
                          >
                            Approve
                          </button>
                          <button 
                            onClick={() => handleApproval(user.email, UserStatus.REJECTED)}
                            className="flex-1 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 py-2 rounded-lg text-xs font-bold"
                          >
                            Reject
                          </button>
                       </div>
                    </div>
                  ))
                )}
            </div>
          )}

          {/* ACTIVITY LOGS VIEW */}
          {activeTab === 'ACTIVITY' && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                    <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-1">User Activity History</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Recent actions across the platform</p>
                </div>
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                    {MOCK_ACTIVITY_LOGS.map((log) => (
                        <div key={log.id} className="p-4 flex items-start space-x-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${getActivityColor(log.type)}`}>
                                <span className="material-symbols-outlined text-sm">{getActivityIcon(log.type)}</span>
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <span className="text-xs font-bold text-gray-900 dark:text-gray-200">{log.userName}</span>
                                    <span className="text-[10px] text-gray-400">{log.timestamp}</span>
                                </div>
                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{log.action}</p>
                                <div className="text-[10px] text-gray-400 mt-1">{log.userId}</div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="p-3 text-center border-t border-gray-100 dark:border-gray-700">
                    <button className="text-xs text-primary dark:text-emerald-400 font-bold">View Full Logs</button>
                </div>
            </div>
          )}

           {/* SETTINGS VIEW (AREAS) */}
           {activeTab === 'SETTINGS' && (
            <div className="space-y-4">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                        <h3 className="font-bold text-gray-800 dark:text-gray-200">Registration Areas</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Manage list of areas available during signup</p>
                    </div>
                    
                    {/* Add Area */}
                    <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex gap-2">
                        <input 
                            type="text" 
                            value={newArea}
                            onChange={(e) => setNewArea(e.target.value)}
                            placeholder="Enter new area name..."
                            className="flex-1 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                        <button 
                            onClick={handleAddArea}
                            disabled={!newArea.trim()}
                            className="bg-gray-900 dark:bg-black text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md hover:bg-black disabled:opacity-50"
                        >
                            Add
                        </button>
                    </div>

                    {/* Area List */}
                    <div className="p-4 flex flex-wrap gap-2">
                        {areas.map((area) => (
                            <div key={area} className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-full pl-3 pr-1 py-1 border border-gray-200 dark:border-gray-600">
                                <span className="text-xs font-medium text-gray-700 dark:text-gray-300 mr-1">{area}</span>
                                <button 
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteArea(area);
                                    }}
                                    className="w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors ml-1"
                                    title="Remove area"
                                >
                                    <span className="material-symbols-outlined text-sm pointer-events-none">close</span>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
           )}

        </div>
      </div>
    </div>
  );
};
