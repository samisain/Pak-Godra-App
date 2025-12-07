
import React, { useState } from 'react';
import { User, UserRole, Issue, IssueCategory, IssueStatus, Language } from '../types';

interface IssuesProps {
  user: User;
  language: Language;
}

const MOCK_ISSUES: Issue[] = [
  {
    id: '1',
    title: 'Street Lights in Sector 11-G',
    description: 'The street lights near Madina Masjid have been out for 3 weeks. It is dangerous for elderly going to Isha prayers.',
    category: IssueCategory.INFRASTRUCTURE,
    authorName: 'Mohammad Yusuf',
    authorId: 'yusuf@pakgodhra.com',
    timestamp: '2 days ago',
    upvotes: 45,
    upvotedBy: ['yusuf@pakgodhra.com'],
    status: IssueStatus.IN_PROGRESS,
    adminResponse: 'We have contacted K-Electric and submitted a formal complaint. Expected fix by Monday.'
  },
  {
    id: '2',
    title: 'Career Counseling Workshop',
    description: 'We need guidance for FSC students regarding university admissions. Please organize a seminar.',
    category: IssueCategory.EDUCATION,
    authorName: 'Bilal Ahmed',
    authorId: 'bilal@pakgodhra.com',
    timestamp: '5 hours ago',
    upvotes: 12,
    upvotedBy: [],
    status: IssueStatus.OPEN
  }
];

export const Issues: React.FC<IssuesProps> = ({ user, language }) => {
  const [issues, setIssues] = useState<Issue[]>(MOCK_ISSUES);
  const [filter, setFilter] = useState<IssueCategory | 'ALL'>('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState<IssueCategory>(IssueCategory.INFRASTRUCTURE);

  const [editingResponseId, setEditingResponseId] = useState<string | null>(null);
  const [responseText, setResponseText] = useState('');

  const handleUpvote = (issueId: string) => {
    setIssues(prev => prev.map(issue => {
      if (issue.id !== issueId) return issue;

      const hasUpvoted = issue.upvotedBy.includes(user.email);
      if (hasUpvoted) {
        return {
          ...issue,
          upvotes: issue.upvotes - 1,
          upvotedBy: issue.upvotedBy.filter(id => id !== user.email)
        };
      } else {
        return {
          ...issue,
          upvotes: issue.upvotes + 1,
          upvotedBy: [...issue.upvotedBy, user.email]
        };
      }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newIssue: Issue = {
      id: Date.now().toString(),
      title: newTitle,
      description: newDesc,
      category: newCategory,
      authorName: `${user.firstName} ${user.lastName}`,
      authorId: user.email,
      timestamp: 'Just now',
      upvotes: 1, 
      upvotedBy: [user.email],
      status: IssueStatus.OPEN
    };
    setIssues([newIssue, ...issues]);
    setShowCreateModal(false);
    setNewTitle('');
    setNewDesc('');
  };

  const handleAdminUpdate = (issueId: string, newStatus: IssueStatus, response?: string) => {
    setIssues(prev => prev.map(issue => {
      if (issue.id !== issueId) return issue;
      return {
        ...issue,
        status: newStatus,
        adminResponse: response !== undefined ? response : issue.adminResponse
      };
    }));
    setEditingResponseId(null);
    setResponseText('');
  };

  const handleDelete = (issueId: string) => {
    if (window.confirm('Are you sure you want to delete this issue?')) {
        setIssues(prev => prev.filter(i => i.id !== issueId));
    }
  };

  const getStatusColor = (status: IssueStatus) => {
    switch (status) {
      case IssueStatus.OPEN: return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300';
      case IssueStatus.IN_PROGRESS: return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
      case IssueStatus.RESOLVED: return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
      case IssueStatus.REJECTED: return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
    }
  };

  const filteredIssues = filter === 'ALL' 
    ? issues 
    : issues.filter(i => i.category === filter);

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="bg-white dark:bg-gray-800 p-4 shadow-sm z-10 sticky top-0 border-b border-gray-100 dark:border-gray-700">
         <div className="flex justify-between items-center mb-3">
             <h2 className="text-xl font-bold text-gray-800 dark:text-white">Community Voice</h2>
             <button 
                onClick={() => setShowCreateModal(true)}
                className="bg-primary text-white text-xs font-bold px-3 py-2 rounded-lg flex items-center shadow hover:bg-emerald-700 transition-colors"
             >
                <span className="material-symbols-outlined text-sm mr-1">add_comment</span>
                New Suggestion
             </button>
         </div>
         <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {['ALL', ...Object.values(IssueCategory)].map((cat) => (
                <button
                    key={cat}
                    onClick={() => setFilter(cat as IssueCategory | 'ALL')}
                    className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                        filter === cat 
                        ? 'bg-gray-800 dark:bg-gray-600 text-white' 
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600'
                    }`}
                >
                    {cat}
                </button>
            ))}
         </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24">
        {filteredIssues.map(issue => {
            const isPrivileged = user.role === UserRole.ADMIN || user.role === UserRole.MODERATOR;
            const isAuthor = user.email === issue.authorId;
            
            return (
            <div key={issue.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors">
                <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${getStatusColor(issue.status)}`}>
                            {issue.status}
                        </span>
                        <span className="text-xs text-gray-400">{issue.timestamp}</span>
                    </div>

                    <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-1">{issue.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-3">{issue.description}</p>

                    <div className="flex justify-between items-center text-xs text-gray-400 dark:text-gray-500 border-t border-gray-50 dark:border-gray-700 pt-3">
                        <div className="flex items-center">
                            <span className="material-symbols-outlined text-sm mr-1">person</span>
                            {issue.authorName}
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className="px-2 py-0.5 bg-gray-50 dark:bg-gray-700 rounded border border-gray-100 dark:border-gray-600 text-gray-500 dark:text-gray-300">
                                {issue.category}
                            </span>
                        </div>
                    </div>

                    {issue.adminResponse && (
                        <div className="mt-3 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-900/30 text-sm">
                            <div className="flex items-center text-blue-800 dark:text-blue-300 font-bold text-xs mb-1">
                                <span className="material-symbols-outlined text-sm mr-1">verified_user</span>
                                Official Response
                            </div>
                            <p className="text-gray-700 dark:text-gray-300 text-xs">{issue.adminResponse}</p>
                        </div>
                    )}
                </div>

                <div className="bg-gray-50 dark:bg-gray-700/50 px-4 py-2 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
                    <button 
                        onClick={() => handleUpvote(issue.id)}
                        className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg transition-colors ${
                            issue.upvotedBy.includes(user.email)
                            ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 font-bold'
                            : 'bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                    >
                        <span className="material-symbols-outlined text-lg">thumb_up</span>
                        <span className="text-sm">{issue.upvotes} Support</span>
                    </button>

                    <div className="flex items-center space-x-2 relative">
                        {/* Status Display for Regular Users */}
                        {!isPrivileged && (
                             <div className="flex items-center text-xs text-gray-400 mr-1">
                                <span className="material-symbols-outlined text-sm mr-1">history</span>
                                {issue.status}
                             </div>
                        )}

                        {/* Admin/Moderator Controls */}
                        {isPrivileged && (
                            <>
                                {editingResponseId === issue.id ? (
                                    <div className="absolute inset-x-0 bottom-full bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-600 rounded-lg p-3 z-20 mb-2 w-64 right-0">
                                        <textarea 
                                            value={responseText}
                                            onChange={(e) => setResponseText(e.target.value)}
                                            className="w-full text-sm border dark:border-gray-600 dark:bg-gray-700 dark:text-white p-2 rounded mb-2"
                                            placeholder="Write official response..."
                                        />
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => setEditingResponseId(null)} className="text-xs text-gray-500">Cancel</button>
                                            <button 
                                                onClick={() => handleAdminUpdate(issue.id, issue.status, responseText)}
                                                className="text-xs bg-blue-600 text-white px-3 py-1 rounded"
                                            >
                                                Post Response
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <button 
                                        onClick={() => {
                                            setEditingResponseId(issue.id);
                                            setResponseText(issue.adminResponse || '');
                                        }}
                                        className="text-blue-600 dark:text-blue-400 p-1 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded" 
                                        title="Reply"
                                    >
                                        <span className="material-symbols-outlined text-lg">reply</span>
                                    </button>
                                )}
                                
                                <select 
                                    value={issue.status}
                                    onChange={(e) => handleAdminUpdate(issue.id, e.target.value as IssueStatus)}
                                    className="text-xs border-gray-300 dark:border-gray-600 rounded focus:ring-primary p-1 bg-white dark:bg-gray-700 dark:text-white max-w-[100px]"
                                >
                                    {Object.values(IssueStatus).map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </>
                        )}
                        
                        {/* Delete Button - Visible to Privileged Users OR Author */}
                        {(isPrivileged || isAuthor) && (
                            <button 
                                onClick={() => handleDelete(issue.id)}
                                className="text-red-500 dark:text-red-400 p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded ml-1" 
                                title="Delete"
                            >
                                <span className="material-symbols-outlined text-lg">delete</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>
            );
        })}
      </div>

      {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in duration-200">
                <div className="bg-primary p-4 flex justify-between items-center text-white">
                    <h3 className="font-bold">Report Issue / Suggestion</h3>
                    <button onClick={() => setShowCreateModal(false)}>
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Title</label>
                        <input 
                            type="text" 
                            required
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 focus:ring-2 focus:ring-primary outline-none bg-white dark:bg-gray-700 dark:text-white"
                            placeholder="Briefly state the issue"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Category</label>
                        <select
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value as IssueCategory)}
                            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700 dark:text-white"
                        >
                            {Object.values(IssueCategory).map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Description</label>
                        <textarea 
                            required
                            rows={4}
                            value={newDesc}
                            onChange={(e) => setNewDesc(e.target.value)}
                            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 focus:ring-2 focus:ring-primary outline-none resize-none bg-white dark:bg-gray-700 dark:text-white"
                            placeholder="Provide details..."
                        />
                    </div>
                    <div className="pt-2">
                        <button 
                            type="submit"
                            className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-emerald-700 shadow-lg"
                        >
                            Submit for Review
                        </button>
                    </div>
                </form>
            </div>
          </div>
      )}
    </div>
  );
};
