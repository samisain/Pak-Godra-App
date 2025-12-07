
import React from 'react';
import { User, UserStatus, Language } from '../types';

interface ProfileProps {
  user: User;
  onLogout: () => void;
  language: Language;
}

export const Profile: React.FC<ProfileProps> = ({ user, onLogout, language }) => {
  return (
    <div className="p-4 space-y-6 h-full overflow-y-auto pb-24">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center text-center transition-colors">
        <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4 text-4xl text-gray-300 dark:text-gray-500 border-4 border-white dark:border-gray-600 shadow-sm">
          <span className="material-symbols-outlined text-5xl">person</span>
        </div>
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">{user.firstName} {user.lastName}</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">{user.area}</p>
        
        <div className={`px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
            user.status === UserStatus.APPROVED ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
            user.status === UserStatus.PENDING ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' :
            'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
        }`}>
            {user.status} Member
        </div>
      </div>

      {/* Details Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
          <h3 className="font-bold text-gray-700 dark:text-gray-200">Member Details</h3>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
           <div className="p-4 flex justify-between items-center">
             <span className="text-gray-500 dark:text-gray-400 text-sm">Email Address</span>
             <span className="text-gray-800 dark:text-gray-200 font-medium text-sm">{user.email}</span>
           </div>
           <div className="p-4 flex justify-between items-center">
             <span className="text-gray-500 dark:text-gray-400 text-sm">Mobile</span>
             <span className="text-gray-800 dark:text-gray-200 font-medium">{user.mobile}</span>
           </div>
           <div className="p-4 flex justify-between items-center">
             <span className="text-gray-500 dark:text-gray-400 text-sm">Date of Birth</span>
             <span className="text-gray-800 dark:text-gray-200 font-medium">{user.dob}</span>
           </div>
           <div className="p-4 flex justify-between items-center">
             <span className="text-gray-500 dark:text-gray-400 text-sm">Age</span>
             <span className="text-gray-800 dark:text-gray-200 font-medium">{user.age} Years</span>
           </div>
           <div className="p-4 flex justify-between items-center">
             <span className="text-gray-500 dark:text-gray-400 text-sm">Voting Eligibility</span>
             <div className="flex items-center space-x-1">
                {user.isVoter ? (
                    <>
                        <span className="material-symbols-outlined text-green-500 text-sm">check_circle</span>
                        <span className="text-green-700 dark:text-green-400 font-bold text-sm">Eligible</span>
                    </>
                ) : (
                    <>
                        <span className="material-symbols-outlined text-gray-400 text-sm">cancel</span>
                        <span className="text-gray-500 dark:text-gray-400 font-medium text-sm">Not Eligible</span>
                    </>
                )}
             </div>
           </div>
        </div>
      </div>

      <button 
        onClick={onLogout}
        className="w-full bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 font-medium py-3 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors flex items-center justify-center space-x-2"
      >
        <span className="material-symbols-outlined">logout</span>
        <span>Sign Out</span>
      </button>

      <div className="text-center text-xs text-gray-400 dark:text-gray-600 mt-4">
        Member since 2023 • Pak Godhra Ver 1.3
      </div>
    </div>
  );
};
