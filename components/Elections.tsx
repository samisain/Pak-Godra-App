import React, { useState } from 'react';
import { User, Election, ElectionStatus, Candidate, Language } from '../types';

interface ElectionsProps {
  user: User;
  language: Language;
}

const MOCK_ELECTION: Election = {
  id: 'e1',
  title: 'Executive Committee 2024',
  status: ElectionStatus.ACTIVE,
  totalVotes: 1245,
  userHasVoted: false,
  candidates: [
    { id: 'c1', name: 'Haji Aslam Group', symbol: 'sports_cricket', votes: 620 }, 
    { id: 'c2', name: 'Unity Panel', symbol: 'security', votes: 415 },
    { id: 'c3', name: 'Reformation Alliance', symbol: 'lightbulb', votes: 210 }
  ]
};

export const Elections: React.FC<ElectionsProps> = ({ user, language }) => {
  // Initialize with MOCK_ELECTION. In a real app, fetch this.
  // We also check if the specific user has already voted in this session for demo purposes.
  const [election, setElection] = useState<Election>(MOCK_ELECTION);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isVoting, setIsVoting] = useState(false);

  // If user is not 18+, block access
  if (!user.isVoter) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center text-gray-500 dark:text-gray-400 pb-20">
        <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-full mb-4">
            <span className="material-symbols-outlined text-4xl text-gray-400 dark:text-gray-500">how_to_vote</span>
        </div>
        <h2 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">Voting Restricted</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
            Voting is reserved for registered members aged 18 and above.
        </p>
      </div>
    );
  }

  const handleVote = () => {
    if (!selectedCandidate) return;
    
    setIsVoting(true);
    
    // Simulate API call
    setTimeout(() => {
      setElection(prev => ({
        ...prev,
        userHasVoted: true,
        totalVotes: prev.totalVotes + 1,
        candidates: prev.candidates.map(c => 
          c.id === selectedCandidate.id ? { ...c, votes: c.votes + 1 } : c
        )
      }));
      setIsVoting(false);
      setShowConfirm(false);
    }, 2000);
  };

  const getPercentage = (votes: number) => {
    if (election.totalVotes === 0) return 0;
    return Math.round((votes / election.totalVotes) * 100);
  };

  // --- VIEW: RESULTS (After Voting) ---
  if (election.userHasVoted) {
    return (
      <div className="p-4 h-full overflow-y-auto pb-24">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 text-center mb-6 transition-colors">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-3 text-green-600 dark:text-green-400 animate-bounce">
                <span className="material-symbols-outlined text-3xl">check_circle</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Vote Casted!</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Thank you for participating.</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors">
            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                <h3 className="font-bold text-gray-800 dark:text-gray-200">Live Results</h3>
                <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-1 rounded font-bold uppercase tracking-wider animate-pulse">Live</span>
            </div>
            <div className="p-4 space-y-6">
                {election.candidates.sort((a,b) => b.votes - a.votes).map((candidate, index) => (
                    <div key={candidate.id}>
                        <div className="flex justify-between items-end mb-1">
                            <div className="flex items-center">
                                <span className="material-symbols-outlined text-gray-500 dark:text-gray-400 mr-2 text-xl">{candidate.symbol}</span>
                                <span className="font-bold text-gray-800 dark:text-gray-200">{candidate.name}</span>
                            </div>
                            <span className="text-sm font-bold text-gray-900 dark:text-white">{getPercentage(candidate.votes)}%</span>
                        </div>
                        <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                            <div 
                                className={`h-full rounded-full transition-all duration-1000 ${index === 0 ? 'bg-primary' : 'bg-gray-400 dark:bg-gray-500'}`}
                                style={{ width: `${getPercentage(candidate.votes)}%` }}
                            ></div>
                        </div>
                        <div className="text-xs text-gray-400 mt-1 text-right">{candidate.votes.toLocaleString()} votes</div>
                    </div>
                ))}
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 p-3 text-center text-xs text-gray-400 border-t border-gray-100 dark:border-gray-700">
                Total Votes: {election.totalVotes.toLocaleString()}
            </div>
        </div>
      </div>
    );
  }

  // --- VIEW: VOTING BOOTH ---
  return (
    <div className="p-4 h-full overflow-y-auto pb-24 flex flex-col">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">{election.title}</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Select your preferred panel below.</p>
      </div>

      <div className="space-y-3 flex-1">
        {election.candidates.map((candidate) => {
            const isSelected = selectedCandidate?.id === candidate.id;
            return (
                <button
                    key={candidate.id}
                    onClick={() => setSelectedCandidate(candidate)}
                    className={`w-full p-4 rounded-xl border-2 flex items-center justify-between transition-all duration-200 ${
                        isSelected 
                        ? 'border-primary bg-green-50 dark:bg-green-900/20 shadow-md transform scale-[1.02]' 
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                >
                    <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                            isSelected ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                        }`}>
                            <span className="material-symbols-outlined">{candidate.symbol}</span>
                        </div>
                        <div className="text-left">
                            <h3 className={`font-bold text-lg ${isSelected ? 'text-primary dark:text-emerald-400' : 'text-gray-800 dark:text-gray-200'}`}>
                                {candidate.name}
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Tap to select</p>
                        </div>
                    </div>
                    {isSelected && (
                        <span className="material-symbols-outlined text-primary dark:text-emerald-400 text-2xl">check_circle</span>
                    )}
                </button>
            );
        })}
      </div>

      <div className="mt-6 sticky bottom-0 bg-gray-50 dark:bg-gray-900 pt-4 transition-colors">
        <button
            disabled={!selectedCandidate}
            onClick={() => setShowConfirm(true)}
            className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all ${
                selectedCandidate 
                ? 'bg-primary text-white hover:bg-emerald-700' 
                : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-500 cursor-not-allowed'
            }`}
        >
            Proceed to Vote
        </button>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && selectedCandidate && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in duration-200">
                <div className="p-6 text-center">
                    <span className="material-symbols-outlined text-4xl text-primary mb-3">how_to_vote</span>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Confirm Your Vote</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-6">
                        You are voting for <br/>
                        <span className="font-bold text-lg text-primary">{selectedCandidate.name}</span>
                    </p>
                    
                    <div className="flex gap-3">
                        <button 
                            onClick={() => setShowConfirm(false)}
                            className="flex-1 py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleVote}
                            className="flex-1 py-3 bg-primary text-white rounded-xl font-bold hover:bg-emerald-700 flex justify-center items-center"
                        >
                            {isVoting ? (
                                <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                            ) : 'Confirm Vote'}
                        </button>
                    </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-3 text-center text-xs text-gray-400 dark:text-gray-400">
                    This action cannot be undone.
                </div>
            </div>
        </div>
      )}
    </div>
  );
};